/* ═══════════════════════════════════════
   CHALLENGEDIRECTOR.JS
   Challenge Mode orchestrator.
   Infinite survival — maps rotate every
   N waves, difficulty scales with caps.

   Two alternating choice types:
   - 'stat'    = normal upgrade cards
   - 'ability' = 4 random abilities, must pick one

   First choice is ALWAYS ability (pre-wave 1).

   Used by: systems/loop.js (via ActiveDirector)
   Depends on: MapRegistry, config.js,
               adventureSpawner.js (gate system)
   ═══════════════════════════════════════ */

const ChallengeDirector = (() => {

  /* ── STATE ─────────────────────────── */
  let wave            = 0;
  let active          = false;
  let currentMap      = null;
  let currentMapIndex = 0;
  let mapHistory      = [];
  let mapsCompleted   = 0;
  let choiceCount     = 0;   // total choices made (for alternation)
  let bestWave        = 0;

  /* ── WAVE TIMER ────────────────────── */
  let waveDuration  = 0;
  let waveTimeLeft  = 0;
  let waveElapsed   = 0;
  let draining      = false;
  let drainPauseMs  = 0;
  let spawnTimer    = 0;

  /* ── BURST QUEUE ───────────────────── */
  let _burstQueue = [];

  /* ── INPUT TRACKER ─────────────────── */
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

  /* ── WAVE DURATION CURVE ───────────── */

  function _calcWaveDuration(w) {
    const c = CONFIG.challenge.waveDuration;
    if (w <= 0) return c.base;

    let duration = c.base;
    for (let i = 1; i < w; i++) {
      let inc = c.incrementPerWave;
      if (i >= c.slowdownAfterWave) {
        inc *= c.slowdownFactor;
      }
      duration += inc;
    }
    return Math.min(c.cap, Math.round(duration));
  }

  /* ── SPAWN PARAM CURVES ────────────── */

  function _calcSpawnInterval(w) {
    const s   = CONFIG.challenge.spawn;
    const cap = CONFIG.challenge.difficultyCap;
    const ew  = Math.min(w, cap);
    const val = s.baseInterval - (ew * s.intervalDecayPerWave);
    return Math.max(s.intervalCap, Math.round(val));
  }

  function _calcMaxAlive(w) {
    const s   = CONFIG.challenge.spawn;
    const cap = CONFIG.challenge.difficultyCap;
    const ew  = Math.min(w, cap);
    const val = s.baseMaxAlive + (ew * s.maxAliveGrowPerWave);
    return Math.min(s.maxAliveCap, Math.floor(val));
  }

  function _calcMinAlive(w) {
    const s   = CONFIG.challenge.spawn;
    const cap = CONFIG.challenge.difficultyCap;
    const ew  = Math.min(w, cap);
    const val = s.baseMinAlive + (ew * s.minAliveGrowPerWave);
    return Math.min(s.minAliveCap, Math.floor(val));
  }

  function _calcBurstChance(w) {
    const s   = CONFIG.challenge.spawn;
    const cap = CONFIG.challenge.difficultyCap;
    const ew  = Math.min(w, cap);
    const val = s.baseBurstChance + (ew * s.burstChanceGrow);
    return Math.min(s.burstChanceCap, val);
  }

  /* ── CHOICE SCHEDULE ───────────────── */

  function _getChoiceInterval(w) {
    const schedule = CONFIG.challenge.choiceSchedule;
    for (const bracket of schedule) {
      if (bracket.untilWave === undefined || w <= bracket.untilWave) {
        return bracket.every;
      }
    }
    // fallback: last bracket
    return schedule[schedule.length - 1].every;
  }

  function _isChoiceWave(w) {
    if (w <= 0) return false;
    const every = _getChoiceInterval(w);
    return (w % every) === 0;
  }

  function _getNextChoiceType() {
    const types = CONFIG.challenge.choiceTypes;
    return types[choiceCount % types.length];
  }

  /* ── MAP ROTATION ──────────────────── */

  function _pickNextMap() {
    const c    = CONFIG.challenge;
    const pool = c.mapPool;

    // check dimension event
    const dim = c.dimensionEvent;
    if (mapsCompleted >= dim.afterMaps && Math.random() < dim.chance) {
      return _buildDimensionMap();
    }

    // pick random map, avoid repeating last one
    let candidates = pool.filter(id => id !== (currentMap ? currentMap.id : null));
    if (candidates.length === 0) candidates = pool.slice();

    const mapId = candidates[Math.floor(Math.random() * candidates.length)];
    return MapRegistry.get(mapId);
  }

  function _buildDimensionMap() {
    // special map: mixed enemies from all maps
    const allEnemies = {};
    const pool = CONFIG.challenge.mapPool;

    for (const mapId of pool) {
      const map = MapRegistry.get(mapId);
      if (!map || !map.enemyPool) continue;
      for (const [name, cfg] of Object.entries(map.enemyPool)) {
        if (!allEnemies[name]) {
          allEnemies[name] = { fromWave: 1, weight: cfg.weight || 1 };
        }
      }
    }

    return {
      id:         'dimension',
      name:       'Dimension',
      background: null,  // can set a special bg later
      enemyPool:  allEnemies,
      isDimension: true,
    };
  }

  function _isMapChangeWave(w) {
    return w > 0 && (w % CONFIG.challenge.wavesPerMap) === 0;
  }

  /* ── BUILD ENEMY POOL ──────────────── */

  function _buildPool() {
    if (!currentMap || !currentMap.enemyPool) return ['ravager'];

    const pool = [];
    for (const [name, cfg] of Object.entries(currentMap.enemyPool)) {
      const w = cfg.weight || 1;
      for (let i = 0; i < w; i++) pool.push(name);
    }
    return pool;
  }

  /* ── SPAWN ONE ENEMY ───────────────── */

  function _spawnOne() {
    const pool = _buildPool();
    if (pool.length === 0) return;

    const maxAlive = _calcMaxAlive(wave);
    if (enemies.length >= maxAlive) return;

    const dir = pickDirAdventure();
    if (!dir) return;

    const enemyName = pool[Math.floor(Math.random() * pool.length)];
    const def       = EnemyRegistry.get(enemyName);
    if (!def) return;

    spawnEnemyDirected(def, dir);
    dirGateEnemies[dir].push(enemies[enemies.length - 1]);
  }

  /* ── SPAWN BURST ───────────────────── */

  function _spawnBurst(count) {
    const pool = _buildPool();
    if (pool.length === 0) return;

    const maxAlive = _calcMaxAlive(wave);
    if (enemies.length >= maxAlive) return;

    const dir = pickDirAdventure();
    if (!dir) return;

    const name1 = pool[Math.floor(Math.random() * pool.length)];
    const def1  = EnemyRegistry.get(name1);
    if (!def1) return;

    spawnEnemyDirected(def1, dir);
    dirGateEnemies[dir].push(enemies[enemies.length - 1]);

    for (let i = 1; i < count; i++) {
      _burstQueue.push({
        dir,
        pool,
        delay:    i * 500,
        maxAlive,
      });
    }
  }

  function _tickBurstQueue(dt) {
    for (let i = _burstQueue.length - 1; i >= 0; i--) {
      _burstQueue[i].delay -= dt;
      if (_burstQueue[i].delay <= 0) {
        const b = _burstQueue[i];
        _burstQueue.splice(i, 1);
        if (enemies.length >= b.maxAlive) continue;
        const name = b.pool[Math.floor(Math.random() * b.pool.length)];
        const def  = EnemyRegistry.get(name);
        if (!def) continue;
        spawnEnemyDirected(def, b.dir);
        dirGateEnemies[b.dir].push(enemies[enemies.length - 1]);
      }
    }
  }

  /* ── GET SPAWN INTERVAL (with accel + bullet time) ── */

  function _getSpawnInterval() {
    const base = _calcSpawnInterval(wave);

    // sawtooth: interval shrinks as wave progresses
    if (waveDuration <= 0) return base;
    const progress = Math.min(1, waveElapsed / waveDuration);
    const accel    = CONFIG.adventure.spawnAccelPct || 0.30;
    const factor   = 1 - (progress * accel);
    let interval   = Math.max(300, Math.round(base * factor));

    // slow spawn rate when bullet time is active
    if (player && player.speedMultiplier < 1) {
      interval = Math.round(interval / player.speedMultiplier);
    }

    return interval;
  }

  /* ── BEST WAVE (localStorage) ──────── */

  function _loadBestWave() {
    try {
      const v = localStorage.getItem('ds_challenge_best');
      return v ? parseInt(v, 10) : 0;
    } catch (e) { return 0; }
  }

  function _saveBestWave(w) {
    try {
      localStorage.setItem('ds_challenge_best', String(w));
    } catch (e) { /* silent */ }
  }

  /* ═══════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════ */

  return {

    /* ── INIT ─────────────────────────
       Called once when challenge starts.
       Does NOT start wave 1 yet —
       first shows ability choice.       */
    init() {
      wave            = 0;
      active          = false;
      currentMap      = null;
      currentMapIndex = 0;
      mapHistory      = [];
      mapsCompleted   = 0;
      choiceCount     = 0;
      spawnTimer      = 0;
      waveElapsed     = 0;
      waveDuration    = 0;
      waveTimeLeft    = 0;
      draining        = false;
      drainPauseMs    = 0;
      _burstQueue     = [];
      _inputTimes     = [];
      bestWave        = _loadBestWave();

      // pick first map
      currentMap = _pickNextMap();
      mapHistory.push(currentMap.id);
      setArenaBackground(currentMap.background || null);
      resetAdventureSpawner();

      return true;
    },

    /* ── START FIRST WAVE ─────────────
       Called after initial ability choice. */
    startFirstWave() {
      this._startWave(1);
      active = true;
    },

    /* ── STOP ─────────────────────────── */
    stop() {
      active = false;
    },

    /* ── INPUT TRACKING ──────────────── */
    trackInput() {
      _trackInput();
    },

    /* ── EVENTS ───────────────────────── */
    onDamage() { /* no stress in challenge */ },
    onKill()   { /* kills don't advance waves */ },

    /* ── NEXT WAVE ────────────────────── */
    nextWave() {
      // check map change
      if (_isMapChangeWave(wave)) {
        this._changeMap();
      }

      // check if choice triggers
      if (_isChoiceWave(wave)) {
        active = false;
        const type = _getNextChoiceType();
        choiceCount++;

        if (typeof startChallengeChoice === 'function') {
          startChallengeChoice(type);
        }
        return;
      }

      // advance to next wave
      this._startWave(wave + 1);
    },

    /* ── START WAVE (internal) ────────── */
    _startWave(newWave) {
      wave         = newWave;
      waveElapsed  = 0;
      spawnTimer   = 0;
      draining     = false;
      drainPauseMs = 0;
      _burstQueue  = [];
      resetAdventureSpawner();

      waveDuration = _calcWaveDuration(wave);
      waveTimeLeft = waveDuration;

      if (typeof updateWaveDisplay === 'function') {
        updateWaveDisplay(wave, false);
      }
    },

    /* ── CHANGE MAP ───────────────────── */
    _changeMap() {
      mapsCompleted++;
      const newMap = _pickNextMap();
      currentMap   = newMap;
      mapHistory.push(newMap.id);

      setArenaBackground(newMap.background || null);
      resetAdventureSpawner();

      // TODO: trigger map change transition effect
    },

    /* ── GAME OVER ────────────────────── */
    onGameOver() {
      active = false;
      if (wave > bestWave) {
        bestWave = wave;
        _saveBestWave(wave);
      }
    },

    /* ── TICK ─────────────────────────── */
    tick(dt) {
      if (!active) return;

      _tickBurstQueue(dt);

      if (typeof OrbSystem !== 'undefined') OrbSystem.tick(dt);

      // draining: wait for enemies to die
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

      const minAlive = _calcMinAlive(wave);

      // anti-idle: field below minimum
      if (enemies.length < minAlive) {
        const inputRate     = _getInputRate();
        const idleThreshold = CONFIG.adventure.inputIdleThreshold || 1;
        if (inputRate <= idleThreshold) {
          _spawnOne();
          spawnTimer = CONFIG.adventure.inputIdleSpawnMs || 600;
          return;
        }
        _spawnOne();
        spawnTimer = 400;
        return;
      }

      // standard spawn cycle
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        const interval   = _getSpawnInterval();
        const burstChance = _calcBurstChance(wave);
        const burstSize   = CONFIG.challenge.spawn.burstSize || 2;

        if (burstChance > 0 && Math.random() < burstChance && _burstQueue.length === 0) {
          _spawnBurst(burstSize);
        } else {
          _spawnOne();
        }
        spawnTimer = interval;
      }
    },

    /* ── GETTERS ──────────────────────── */
    getWave()           { return wave; },
    getMaxWave()        { return Infinity; },
    getStress()         { return 0; },
    getTarget()         { return 0; },
    isBoss()            { return false; },
    getKills()          { return 0; },
    getKillsNeeded()    { return 0; },
    getCurrentMap()     { return currentMap; },
    isCompleted()       { return false; },
    isBossPaused()      { return false; },
    getWaveTimeLeft()   { return waveTimeLeft; },
    getWaveDuration()   { return waveDuration; },
    getBestWave()       { return bestWave; },
    getChoiceCount()    { return choiceCount; },
    getMapsCompleted()  { return mapsCompleted; },
    isDimensionMap()    { return currentMap && currentMap.isDimension; },

    /* ── RESUME AFTER CHOICE ──────────── */
    resumeAfterChoice() {
      active = true;
      this._startWave(wave + 1);
    },

    /* ── RESTART ──────────────────────── */
    restart() {
      return this.init();
    },

    /* ── DEBUG INTERFACE ─────────────── */
    _debug() {
      return {
        wave,
        active,
        draining,
        waveDuration,
        waveTimeLeft,
        waveElapsed,
        spawnTimer,
        currentMap:      currentMap ? currentMap.id : null,
        isDimension:     currentMap ? !!currentMap.isDimension : false,
        mapsCompleted,
        choiceCount,
        nextChoiceType:  _getNextChoiceType(),
        choiceInterval:  _getChoiceInterval(wave),
        isChoiceWave:    _isChoiceWave(wave),
        spawnInterval:   _calcSpawnInterval(wave),
        maxAlive:        _calcMaxAlive(wave),
        minAlive:        _calcMinAlive(wave),
        burstChance:     _calcBurstChance(wave),
        bestWave,
        pool:            _buildPool(),
      };
    },

    /* ── DEBUG SKIP TIMER ────────────── */
    debugSkipTimer() {
      if (!active || draining) return;
      if (waveTimeLeft > 10000) {
        waveElapsed  = waveDuration - 10000;
        waveTimeLeft = 10000;
      }
    },
  };

})();