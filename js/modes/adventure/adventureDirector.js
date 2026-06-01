/* ═══════════════════════════════════════
   ADVENTUREDIRECTOR.JS — v4 COMBO SYSTEM
   Adventure Mode orchestrator.

   === HOW THE COMBO SYSTEM WORKS ===

   Every spawn tick, instead of spawning
   1 random enemy, the system picks a
   COMBO PATTERN and spawns enemies
   according to that pattern.

   COMBO PATTERNS (defined in CONFIG):
   - single:         1 enemy from 1 direction
   - pair_opposite:  1+1 from opposite sides (up+down or left+right)
   - pair_adjacent:  1+1 from adjacent sides (up+right, down+left...)
   - burst_single:   2 enemies from SAME direction (one line)
   - triple:         1 from 3 different directions
   - rush:           3 enemies from SAME direction
   - surround:       1 from ALL 4 directions

   STAGGER:
   When a combo spawns multiple enemies,
   they don't all appear at once. There's
   a delay (stagger) between each one.
   Each pattern has its own default stagger:
   - single:        0ms (only 1 enemy)
   - pair_opposite: 400ms (player needs time to turn)
   - pair_adjacent: 350ms
   - burst_single:  250ms (same dir, one hit kills both)
   - triple:        400ms
   - rush:          300ms
   - surround:      500ms (most pressure, most time)

   HOW TO USE IN WAVECONFIG:
   Each wave can define which combos are
   available and their weights (probability).
   Higher weight = more likely to be picked.

   Example wave config:
   {
     duration: 20,
     spawnInterval: 2000,
     maxAlive: 5,
     minAlive: 2,
     pool: { ravager: 7, crusher: 3 },
     combos: {
       single: 5,        // very common
       pair_opposite: 3,  // moderate
       burst_single: 2,   // occasional
     },
     stagger: 400,        // override default stagger (optional)
     dirCooldown: 1000,   // ms before same dir can spawn again (optional)
   }

   FALLBACK:
   If a wave does NOT have 'combos' defined,
   the system uses the OLD behavior:
   single spawn + burstChance/burstSize.
   This keeps all existing maps working.

   DIRECTION COOLDOWN:
   After spawning from a direction, that
   direction is blocked for dirCooldown ms.
   This prevents the same side from being
   hammered repeatedly. Default: 800ms.
   Configurable per wave in waveConfig.

   COMBO FALLBACK:
   If the chosen combo can't spawn
   (directions blocked), the system tries
   a simpler combo automatically:
   surround → triple → pair → single → skip

   Used by: systems/loop.js
   Depends on: MapRegistry, config.js,
               adventureSpawner.js
   ═══════════════════════════════════════ */

const AdventureDirector = (() => {

  let currentMap    = null;
  let wave          = 1;
  let spawnTimer    = 0;
  let active        = false;
  let completed     = false;
  let waveTimeLeft  = 0;
  let waveDuration  = 0;
  let waveElapsed   = 0;
  let draining      = false;
  let drainPauseMs  = 0;

  /* ── STAGGER QUEUE ──────────────────
     When a combo spawns multiple enemies,
     the extras go in this queue with a
     delay. Each tick processes the queue.

     Format: { dir, pool, delay, maxAlive }
  ──────────────────────────────────────── */
  let _staggerQueue = [];

  /* ── INPUT TRACKER ──────────────────
     Counts player actions to detect idle.
  ──────────────────────────────────────── */
  let _inputTimes = [];

  function _trackInput() {
    _inputTimes.push(performance.now());
  }

  function _getInputRate() {
    const now    = performance.now();
    const window = CONFIG.adventure.inputWindowMs || 3000;
    while (_inputTimes.length > 0 && now - _inputTimes[0] > window) {
      _inputTimes.shift();
    }
    return _inputTimes.length;
  }

  /* ── WAVE CONFIG HELPERS ────────────── */

  function _getWaveConfig() {
    if (currentMap && currentMap.waveConfig && currentMap.waveConfig[wave]) {
      return currentMap.waveConfig[wave];
    }
    return null;
  }

  function _getWaveDuration() {
    const wc = _getWaveConfig();
    if (wc && wc.duration !== undefined) return wc.duration * 1000;
    return 30000;
  }

  function _getSpawnInterval() {
    const wc = _getWaveConfig();
    const base = wc ? wc.spawnInterval : CONFIG.adventure.defaultSpawnInterval;

    // sawtooth: interval shrinks as wave progresses
    if (waveDuration <= 0) return base;
    const progress = Math.min(1, waveElapsed / waveDuration);
    const accel    = CONFIG.adventure.spawnAccelPct || 0.30;
    const factor   = 1 - (progress * accel);
    let interval = Math.max(300, Math.round(base * factor));

    // slow spawn rate when bullet time is active
    if (player && player.speedMultiplier < 1) {
      interval = Math.round(interval / player.speedMultiplier);
    }

    return interval;
  }

  function _getMaxAlive() {
    const wc = _getWaveConfig();
    return wc ? wc.maxAlive : (currentMap.maxEnemies || CONFIG.adventure.defaultMaxAlive);
  }

  function _getMinAlive() {
    const wc = _getWaveConfig();
    return wc ? (wc.minAlive !== undefined ? wc.minAlive : CONFIG.adventure.defaultMinAlive)
              : (currentMap.minEnemiesAlive || CONFIG.adventure.defaultMinAlive);
  }

  function _getDirCooldown() {
    const wc = _getWaveConfig();
    if (wc && wc.dirCooldown !== undefined) return wc.dirCooldown;
    return CONFIG.adventure.defaultDirCooldown || 800;
  }

  /* ── BUILD POOL ───────────────────────
     Creates weighted array of enemy names.
     ['ravager','ravager','ravager','crusher','crusher']
  ──────────────────────────────────────── */
  function _buildPool() {
    const wc = _getWaveConfig();
    if (wc && wc.pool) {
      const pool = [];
      for (const [name, weight] of Object.entries(wc.pool)) {
        for (let i = 0; i < weight; i++) pool.push(name);
      }
      return pool;
    }
    return buildEnemyPoolForMap(wave, currentMap, false);
  }

  /* ── PICK FROM POOL ───────────────────
     Picks a random enemy from the weighted
     pool, respecting maxInField limits.
  ──────────────────────────────────────── */
  function _pickFromPool(pool) {
    if (pool.length === 0) return null;

    // count current enemies by type
    const fieldCounts = {};
    for (const e of enemies) {
      fieldCounts[e.name] = (fieldCounts[e.name] || 0) + 1;
    }

    // filter by maxInField
    let available = pool;
    if (currentMap && currentMap.maxInField) {
      available = pool.filter(name => {
        const cap = currentMap.maxInField[name];
        if (cap === undefined) return true;
        return (fieldCounts[name] || 0) < cap;
      });
    }
    if (available.length === 0) return null;

    const name = available[Math.floor(Math.random() * available.length)];
    return EnemyRegistry.get(name);
  }

  /* ── UPGRADE CHECK ──────────────────── */
  function _isUpgradeWave(w) {
    const list = CONFIG.adventure.upgradeAfterWaves || [2, 4, 6, 8, 10];
    return list.includes(w);
  }

  function _getTotalWaves() {
    if (currentMap && currentMap.totalWaves) return currentMap.totalWaves;
    return 11;
  }

  function _isFinalWave() {
    return wave === _getTotalWaves();
  }

  /* ═══════════════════════════════════
     COMBO SYSTEM
     ═══════════════════════════════════ */

  /* ── GET COMBO CONFIG ─────────────────
     Returns the combos object for current
     wave, or null if wave uses old system.
  ──────────────────────────────────────── */
  function _getCombos() {
    const wc = _getWaveConfig();
    if (wc && wc.combos) return wc.combos;
    return null;
  }

  /* ── PICK A COMBO PATTERN ─────────────
     Weighted random pick from the combos
     object. Returns pattern name string.

     Example input: { single: 5, pair_opposite: 3 }
     Total weight = 8
     'single' has 5/8 = 62.5% chance
  ──────────────────────────────────────── */
  /* ── PICK A COMBO PATTERN ─────────────
     Supports two formats in waveConfig:
     
     Simple (weight only):
       combos: { single: 5, pair_opposite: 3 }
     
     Detailed (weight + custom stagger):
       combos: {
         single: 5,
         pair_opposite: { weight: 3, stagger: 300 },
         surround: { weight: 1, stagger: 450 },
       }
     
     You can mix both formats in the same wave.
     Returns the pattern name string.
  ──────────────────────────────────────── */
  function _pickCombo(combos) {
    const entries = Object.entries(combos);
    let total = 0;
    for (const [, val] of entries) {
      total += (typeof val === 'object') ? val.weight : val;
    }
    if (total <= 0) return 'single';

    let roll = Math.random() * total;
    for (const [pattern, val] of entries) {
      const w = (typeof val === 'object') ? val.weight : val;
      roll -= w;
      if (roll <= 0) return pattern;
    }
    return entries[0][0];
  }

  /* ── GET STAGGER FOR PATTERN ──────────
     Returns delay in ms between enemies
     in a multi-enemy combo.
     Wave config can override with 'stagger'.
  ──────────────────────────────────────── */
 /* ── GET STAGGER FOR PATTERN ──────────
     Priority order:
     1. Per-combo stagger in waveConfig
        combos: { pair_opposite: { weight:3, stagger:300 } }
     2. CONFIG.adventure.comboStagger defaults
     3. Fallback 400ms
  ──────────────────────────────────────── */
  function _getStagger(pattern) {
    // check per-combo stagger in waveConfig
    const wc = _getWaveConfig();
    if (wc && wc.combos && wc.combos[pattern]) {
      const val = wc.combos[pattern];
      if (typeof val === 'object' && val.stagger !== undefined) {
        return val.stagger;
      }
    }

    // per-pattern defaults from CONFIG
    const defaults = CONFIG.adventure.comboStagger || {};
    if (defaults[pattern] !== undefined) return defaults[pattern];

    // fallback
    return 400;
  }

  /* ── SPAWN ONE ENEMY ──────────────────
     Spawns a single enemy from pool at
     the given direction. Applies cooldown.
     Returns true if spawned successfully.
  ──────────────────────────────────────── */
  function _doSpawn(dir, pool) {
    const def = _pickFromPool(pool);
    if (!def) return false;

    spawnEnemyDirected(def, dir);
    registerSpawnedEnemy(dir);
    setDirCooldown(dir, _getDirCooldown());
    return true;
  }

  /* ── QUEUE STAGGERED SPAWN ────────────
     Adds a delayed spawn to the queue.
     Will be processed in _tickStaggerQueue.
  ──────────────────────────────────────── */
  function _queueSpawn(dir, pool, delayMs) {
    _staggerQueue.push({
      dir:      dir,
      pool:     pool,
      delay:    delayMs,
      maxAlive: _getMaxAlive(),
    });
  }

  /* ── TICK STAGGER QUEUE ───────────────
     Process delayed spawns from combos.
     Called every tick.
  ──────────────────────────────────────── */
  function _tickStaggerQueue(dt) {
    for (let i = _staggerQueue.length - 1; i >= 0; i--) {
      _staggerQueue[i].delay -= dt;
      if (_staggerQueue[i].delay <= 0) {
        const item = _staggerQueue[i];
        _staggerQueue.splice(i, 1);
        if (enemies.length >= item.maxAlive) continue;
        _doSpawn(item.dir, item.pool);
      }
    }
  }

  /* ── EXECUTE COMBO ────────────────────
     Main combo executor. Picks directions
     based on pattern, spawns first enemy
     immediately, queues rest with stagger.

     If the chosen pattern can't find free
     directions, falls back to simpler
     patterns automatically:
     surround → triple → pair_opposite → single

     Returns true if at least 1 enemy spawned.
  ──────────────────────────────────────── */
  function _executeCombo(pattern) {
    const pool    = _buildPool();
    if (pool.length === 0) return false;

    const maxAlive = _getMaxAlive();
    // allow spawn if close to max but stagger queue
    // will resolve soon — prevents dead air
    const queueCount = _staggerQueue.length;
    if (enemies.length >= maxAlive + 1) return false;
    if (enemies.length >= maxAlive && queueCount > 0) return false;

    const stagger = _getStagger(pattern);

    // ── SINGLE: 1 enemy, 1 direction
    if (pattern === 'single') {
      const dir = pickDirAdventure();
      if (!dir) return false;
      return _doSpawn(dir, pool);
    }

    // ── PAIR_OPPOSITE: 1+1 from opposite sides
    if (pattern === 'pair_opposite') {
      const dirs = pickDirOpposite();
      if (!dirs) return _executeCombo('single'); // fallback
      _doSpawn(dirs[0], pool);
      _queueSpawn(dirs[1], pool, stagger);
      return true;
    }

    // ── PAIR_ADJACENT: 1+1 from adjacent sides
    if (pattern === 'pair_adjacent') {
      const dirs = pickDirAdjacent();
      if (!dirs) return _executeCombo('single'); // fallback
      _doSpawn(dirs[0], pool);
      _queueSpawn(dirs[1], pool, stagger);
      return true;
    }

    // ── BURST_SINGLE: 2 enemies same direction
    if (pattern === 'burst_single') {
      const dir = pickDirAdventure();
      if (!dir) return false;
      _doSpawn(dir, pool);
      _queueSpawn(dir, pool, stagger);
      return true;
    }

    // ── TRIPLE: 1 from 3 directions
    if (pattern === 'triple') {
      const dirs = pickDir3();
      if (!dirs) return _executeCombo('pair_opposite'); // fallback
      _doSpawn(dirs[0], pool);
      _queueSpawn(dirs[1], pool, stagger);
      _queueSpawn(dirs[2], pool, stagger * 2);
      return true;
    }

    // ── RUSH: 3 enemies same direction
    if (pattern === 'rush') {
      const dir = pickDirAdventure();
      if (!dir) return false;
      _doSpawn(dir, pool);
      _queueSpawn(dir, pool, stagger);
      _queueSpawn(dir, pool, stagger * 2);
      return true;
    }

    // ── SURROUND: 1 from all 4 directions
    if (pattern === 'surround') {
      const dirs = pickDirAll();
      if (!dirs) return _executeCombo('triple'); // fallback
      _doSpawn(dirs[0], pool);
      _queueSpawn(dirs[1], pool, stagger);
      _queueSpawn(dirs[2], pool, stagger * 2);
      _queueSpawn(dirs[3], pool, stagger * 3);
      return true;
    }

    // unknown pattern — default to single
    return _executeCombo('single');
  }

  /* ── LEGACY SPAWN (no combos) ─────────
     Used when wave has NO combos defined.
     Same behavior as old system:
     1 enemy + burstChance.
  ──────────────────────────────────────── */
  function _legacySpawn() {
    const pool = _buildPool();
    if (pool.length === 0) return;

    const maxAlive = _getMaxAlive();
    if (enemies.length >= maxAlive) return;

    const dir = pickDirAdventure();
    if (!dir) {
      // fallback for nearly empty field
      if (enemies.length < (currentMap.minEnemiesAlive || 2)) {
        const dirs = ['up', 'down', 'left', 'right'];
        const fb = dirs.filter(d => {
          const list = dirGateEnemies[d];
          let alive = 0;
          for (const e of list) { if (e.isAlive()) alive++; }
          return alive < 2;
        });
        if (fb.length > 0) {
          const pick = fb[Math.floor(Math.random() * fb.length)];
          _doSpawn(pick, pool);
        }
      }
      return;
    }

    // burst chance (old system)
    const wc = _getWaveConfig();
    const burstChance = (wc && wc.burstChance !== undefined) ? wc.burstChance : 0;
    const burstSize   = (wc && wc.burstSize !== undefined) ? wc.burstSize : 2;

    if (burstChance > 0 && Math.random() < burstChance && _staggerQueue.length === 0) {
      _doSpawn(dir, pool);
      for (let i = 1; i < burstSize; i++) {
        _queueSpawn(dir, pool, i * 500);
      }
    } else {
      _doSpawn(dir, pool);
    }
  }

  /* ═══════════════════════════════════
     MAIN DIRECTOR LOGIC
     ═══════════════════════════════════ */

  return {

    /* ── INIT ─────────────────────────── */
    init(mapId) {
      currentMap = MapRegistry.get(mapId);
      if (!currentMap) {
        console.error(`AdventureDirector: map "${mapId}" not found.`);
        return false;
      }

      wave          = 1;
      spawnTimer    = 0;
      completed     = false;
      waveElapsed   = 0;
      draining      = false;
      drainPauseMs  = 0;
      active        = true;
      _inputTimes   = [];
      _staggerQueue = [];

      waveDuration = _getWaveDuration();
      waveTimeLeft = waveDuration;

      resetAdventureSpawner();
      if (typeof resetUpgradeChoices === 'function') resetUpgradeChoices();
      setArenaBackground(currentMap.background || null);

      // save wave 1 as minimum progress
Progress.saveBestWave(currentMap.id, 1);

      // always reset tutorial state to prevent stale isActive blocking spawns
      if (typeof Tutorial !== 'undefined') Tutorial.reset();

      // tutorial on wave 1 of first map (first time only)
      if (wave === 1 && currentMap.id === 'map01_forest' &&
          typeof Tutorial !== 'undefined' && Tutorial.isNeeded()) {
        Tutorial.start();
      }

      return true;
    },

    /* ── STOP ─────────────────────────── */
    stop() {
      active = false;
    },

    /* ── INPUT TRACKING ───────────────── */
    trackInput() {
      _trackInput();
    },

    /* ── EVENTS ───────────────────────── */
    onDamage() {},
    onKill()   {},

    /* ── NEXT WAVE ────────────────────── */
    nextWave() {
      const total = _getTotalWaves();
      if (wave >= total) {
        this.completeMap();
        return;
      }
      if (_isUpgradeWave(wave)) {
        active = false;
        if (typeof startUpgradeChoice === 'function') startUpgradeChoice();
        return;
      }
      this._startWave(wave + 1);
    },

    /* ── START WAVE ───────────────────── */
    _startWave(newWave) {
      // save best wave reached
  if (currentMap) Progress.saveBestWave(currentMap.id, newWave);

  wave         = newWave;
      waveElapsed  = 0;
      spawnTimer   = 0;
      draining     = false;
      drainPauseMs = 0;
      _staggerQueue = [];
      resetAdventureSpawner();

      waveDuration = _getWaveDuration();
      waveTimeLeft = waveDuration;

      if (typeof updateWaveDisplay === 'function') {
        updateWaveDisplay(wave, _isFinalWave());
      }
    },

    /* ── COMPLETE MAP ─────────────────── */
    completeMap() {
      if (completed) return;
      completed = true;
      active    = false;

      Progress.markMapCompleted(currentMap.id);

      const hasSlot = Progress.shouldTriggerSlot(currentMap.id);
      if (hasSlot) Progress.markSlotGiven(currentMap.id);

      if (typeof showMapComplete === 'function') {
        showMapComplete(currentMap, hasSlot);
      }
    },

    /* ── TICK ─────────────────────────── */
    tick(dt) {
      if (!active) return;

      // ── GATE CLEANUP ──────────────────
      // Purge dead enemies from gate tracking
      // every tick to prevent ghost buildup
      for (const dir of ['up', 'down', 'left', 'right']) {
        const list = dirGateEnemies[dir];
        for (let i = list.length - 1; i >= 0; i--) {
          const e = list[i];
          if (!e.isAlive() || !enemies.includes(e)) {
            list.splice(i, 1);
          }
        }
      }

      // tutorial controls wave 1 spawning
      if (typeof Tutorial !== 'undefined' && Tutorial.isActive()) {
        Tutorial.tick(dt);
        if (typeof OrbSystem !== 'undefined') OrbSystem.tick(dt);
        _tickStaggerQueue(dt);
        return;
      }

      // process stagger queue
      _tickStaggerQueue(dt);

      // orb system
      if (typeof OrbSystem !== 'undefined') OrbSystem.tick(dt);

      // draining: waiting for enemies to die after wave timer ends
      if (draining) {
        if (enemies.length === 0 && bullets.length === 0) {
          drainPauseMs -= dt;
          if (drainPauseMs <= 0) {
            draining = false;
            this.nextWave();
          }
        }
        return;
      }

      // wave timer
      waveElapsed  += dt;
      waveTimeLeft -= dt;
      if (waveTimeLeft <= 0) {
        waveTimeLeft = 0;
        draining     = true;
        drainPauseMs = 500;
        return;
      }

      // ── SPAWN LOGIC ──

      const minAlive = _getMinAlive();
      const combos   = _getCombos();

      // anti-idle: field below minimum, force spawn
      if (enemies.length < minAlive) {
        const inputRate     = _getInputRate();
        const idleThreshold = CONFIG.adventure.inputIdleThreshold || 1;

        if (combos) {
          const spawned = _executeCombo('single');
          if (!spawned) {
            // all dirs blocked — retry very fast
            spawnTimer = 150;
            return;
          }
        } else {
          _legacySpawn();
        }

        spawnTimer = (inputRate <= idleThreshold)
          ? (CONFIG.adventure.inputIdleSpawnMs || 600)
          : 400;
        return;
      }

      // standard spawn cycle
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        const interval = _getSpawnInterval();

        if (combos) {
          const pattern = _pickCombo(combos);
          const spawned = _executeCombo(pattern);
          // if spawn was blocked (maxAlive, no free dirs),
          // retry quickly instead of waiting full interval
          spawnTimer = spawned ? interval : Math.min(interval, 300);
        } else {
          _legacySpawn();
          spawnTimer = interval;
        }
      }
    },

    /* ── GETTERS ──────────────────────── */
    getWave()           { return wave; },
    getMaxWave()        { return _getTotalWaves(); },
    getStress()         { return 0; },
    getTarget()         { return 0; },
    isBoss()            { return _isFinalWave(); },
    getKills()          { return 0; },
    getKillsNeeded()    { return 0; },
    getCurrentMap()     { return currentMap; },
    isCompleted()       { return completed; },
    isBossPaused()      { return false; },
    getWaveTimeLeft()   { return waveTimeLeft; },
    getWaveDuration()   { return waveDuration; },

    resumeAfterChoice() {
      active = true;
      this._startWave(wave + 1);
    },

    restart() {
      if (!currentMap) return false;
      return this.init(currentMap.id);
    },

    restartCurrentWave() {
      this._startWave(wave);
      active = true;
    },

    /* ── DEBUG ────────────────────────── */
    _debug() {
      return {
        wave,
        totalWaves:    _getTotalWaves(),
        waveTimeLeft,
        waveDuration,
        waveElapsed,
        draining,
        drainPauseMs,
        spawnTimer,
        active,
        completed,
        waveConfig:    _getWaveConfig(),
        spawnInterval: _getSpawnInterval(),
        maxAlive:      _getMaxAlive(),
        minAlive:      _getMinAlive(),
        pool:          _buildPool(),
        inputRate:     _getInputRate(),
        staggerQueue:  _staggerQueue.length,
        combos:        _getCombos(),
        dirCooldown:   _getDirCooldown(),
        isFinalWave:   _isFinalWave(),
        isUpgradeWave: _isUpgradeWave(wave),
      };
    },

    debugSkipTimer() {
      if (!active || draining) return;
      if (waveTimeLeft > 10000) {
        waveElapsed  = waveDuration - 10000;
        waveTimeLeft = 10000;
      }
    },

  };

})();