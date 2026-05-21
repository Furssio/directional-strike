/* ═══════════════════════════════════════
   CHALLENGEDIRECTOR.JS — v2 COMBO SYSTEM
   Challenge Mode orchestrator.
   Infinite survival — maps rotate every
   N waves, difficulty scales with caps.

   Uses combo system from adventureDirector.
   Sawtooth difficulty: rises within each
   10-wave cycle, drops on map change,
   floor rises each cycle until plateau.

   Adventure waveConfigs are used directly
   for pool + combos + dirCooldown values.

   Dimension map: mixed enemies from all
   maps using class system.

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
  let choiceCount     = 0;
  let bestWave        = 0;

  /* ── WAVE TIMER ────────────────────── */
  let waveDuration  = 0;
  let waveTimeLeft  = 0;
  let waveElapsed   = 0;
  let draining      = false;
  let drainPauseMs  = 0;
  let spawnTimer    = 0;

  /* ── STAGGER QUEUE ─────────────────── */
  let _staggerQueue = [];

  /* ── DIMENSION STATE ───────────────── */
  let _dimPool      = [];
  let _dimClasses   = [];

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

  /* ── CYCLE HELPERS ─────────────────── */

  function _getCycle() {
    return Math.floor((wave - 1) / CONFIG.challenge.wavesPerMap) + 1;
  }

  function _getWaveInCycle() {
    const pos = ((wave - 1) % CONFIG.challenge.wavesPerMap) + 1;
    return pos; // 1-10
  }

  /* ── WAVE DURATION ─────────────────── */

  function _calcWaveDuration(w) {
    const c = CONFIG.challenge.waveDuration;
    let duration = c.base;
    for (let i = 1; i < w; i++) {
      let inc = c.incrementPerWave;
      if (i >= c.slowdownAfterWave) inc *= c.slowdownFactor;
      duration += inc;
    }
    return Math.min(c.cap, Math.round(duration * 10) / 10) * 1000;
  }

  /* ── FLOOR SCALING ─────────────────── */

  function _getFloorMult() {
    const c       = CONFIG.challenge;
    const cycle   = _getCycle();
    const capped  = Math.min(cycle - 1, c.plateauAtCycle - 1);
    return capped; // 0 at cycle 1, max at plateauAtCycle-1
  }

  function _applyFloor(spawnInterval) {
    const floor = _getFloorMult();
    const scale = CONFIG.challenge.floorScaling;
    const mult  = 1 - (floor * scale.spawnIntervalMult);
    return Math.max(600, Math.round(spawnInterval * mult));
  }

  function _applyFloorCooldown(cd) {
    const floor = _getFloorMult();
    const scale = CONFIG.challenge.floorScaling;
    const mult  = 1 - (floor * scale.dirCooldownMult);
    return Math.max(400, Math.round(cd * mult));
  }

  function _applyFloorMaxAlive(ma) {
    const floor = _getFloorMult();
    const scale = CONFIG.challenge.floorScaling;
    return Math.min(10, ma + Math.floor(floor * scale.maxAlivePlus));
  }

  /* ── ADVENTURE WAVECONFIG LOOKUP ───── */

  function _getAdventureWaveConfig() {
    if (!currentMap || !currentMap.waveConfig) return null;

    const c         = CONFIG.challenge;
    const waveInCyc = _getWaveInCycle();
    const tierName  = c.waveTiers[waveInCyc] || 'medium';

    // Moon uses moonPeak instead of peak
    let tier = tierName;
    if (tier === 'peak' && currentMap.id === 'map12_moon') {
      tier = 'moonPeak';
    }

    const range = c.tierMapping[tier] || c.tierMapping.medium;
    // pick random adventure wave from range
    const minW = range[0];
    const maxW = range[1];
    const advWave = minW + Math.floor(Math.random() * (maxW - minW + 1));

    return currentMap.waveConfig[advWave] || null;
  }

  /* ── CURRENT WAVE PARAMS ───────────── */

  let _currentWC = null; // cached per wave

  function _cacheWaveConfig() {
    if (currentMap && currentMap.isDimension) {
      _currentWC = _buildDimensionWaveConfig();
    } else {
      _currentWC = _getAdventureWaveConfig();
    }
  }

  function _getSpawnInterval() {
    const wc   = _currentWC;
    const base = wc ? wc.spawnInterval : 1800;
    const floored = _applyFloor(base);

    // sawtooth within wave
    if (waveDuration <= 0) return floored;
    const progress = Math.min(1, waveElapsed / waveDuration);
    const accel    = CONFIG.adventure.spawnAccelPct || 0.30;
    const factor   = 1 - (progress * accel);
    let interval   = Math.max(500, Math.round(floored * factor));

    // bullet time slowdown
    if (player && player.speedMultiplier < 1) {
      interval = Math.round(interval / player.speedMultiplier);
    }
    return interval;
  }

  function _getMaxAlive() {
    const wc = _currentWC;
    const base = wc ? wc.maxAlive : 4;
    return _applyFloorMaxAlive(base);
  }

  function _getMinAlive() {
    const wc = _currentWC;
    return wc ? (wc.minAlive || 2) : 2;
  }

  function _getDirCooldown() {
    const wc = _currentWC;
    const base = (wc && wc.dirCooldown !== undefined)
      ? wc.dirCooldown
      : (CONFIG.adventure.defaultDirCooldown || 800);
    return _applyFloorCooldown(base);
  }

  /* ── BUILD POOL ────────────────────── */

  function _buildPool() {
    const wc = _currentWC;
    if (wc && wc.pool) {
      const pool = [];
      for (const [name, weight] of Object.entries(wc.pool)) {
        for (let i = 0; i < weight; i++) pool.push(name);
      }
      return pool;
    }
    if (currentMap && currentMap.enemyPool) {
      const pool = [];
      for (const [name, cfg] of Object.entries(currentMap.enemyPool)) {
        const w = cfg.weight || 1;
        for (let i = 0; i < w; i++) pool.push(name);
      }
      return pool;
    }
    return ['ravager'];
  }

  /* ── PICK FROM POOL ────────────────── */

  function _pickFromPool(pool) {
    if (pool.length === 0) return null;
    const fieldCounts = {};
    for (const e of enemies) {
      fieldCounts[e.name] = (fieldCounts[e.name] || 0) + 1;
    }

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

  /* ═══════════════════════════════════
     COMBO SYSTEM
     (same as adventureDirector)
     ═══════════════════════════════════ */

  function _getCombos() {
    const wc = _currentWC;
    if (wc && wc.combos) return wc.combos;
    return null;
  }

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

  function _getStagger(pattern) {
    const wc = _currentWC;
    if (wc && wc.combos && wc.combos[pattern]) {
      const val = wc.combos[pattern];
      if (typeof val === 'object' && val.stagger !== undefined) {
        return val.stagger;
      }
    }
    const defaults = CONFIG.adventure.comboStagger || {};
    if (defaults[pattern] !== undefined) return defaults[pattern];
    return 400;
  }

  function _doSpawn(dir, pool) {
    const def = _pickFromPool(pool);
    if (!def) return false;
    spawnEnemyDirected(def, dir);
    registerSpawnedEnemy(dir);
    setDirCooldown(dir, _getDirCooldown());
    return true;
  }

  function _queueSpawn(dir, pool, delayMs) {
    _staggerQueue.push({
      dir, pool, delay: delayMs, maxAlive: _getMaxAlive(),
    });
  }

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

  function _executeCombo(pattern) {
    const pool = _buildPool();
    if (pool.length === 0) return false;

    const maxAlive = _getMaxAlive();
    const queueCount = _staggerQueue.length;
    if (enemies.length >= maxAlive + 1) return false;
    if (enemies.length >= maxAlive && queueCount > 0) return false;

    const stagger = _getStagger(pattern);

    if (pattern === 'single') {
      const dir = pickDirAdventure();
      if (!dir) return false;
      return _doSpawn(dir, pool);
    }

    if (pattern === 'pair_opposite') {
      const dirs = pickDirOpposite();
      if (!dirs) return _executeCombo('single');
      _doSpawn(dirs[0], pool);
      _queueSpawn(dirs[1], pool, stagger);
      return true;
    }

    if (pattern === 'pair_adjacent') {
      const dirs = pickDirAdjacent();
      if (!dirs) return _executeCombo('single');
      _doSpawn(dirs[0], pool);
      _queueSpawn(dirs[1], pool, stagger);
      return true;
    }

    if (pattern === 'burst_single') {
      const dir = pickDirAdventure();
      if (!dir) return false;
      _doSpawn(dir, pool);
      _queueSpawn(dir, pool, stagger);
      return true;
    }

    if (pattern === 'triple') {
      const dirs = pickDir3();
      if (!dirs) return _executeCombo('pair_opposite');
      _doSpawn(dirs[0], pool);
      _queueSpawn(dirs[1], pool, stagger);
      _queueSpawn(dirs[2], pool, stagger * 2);
      return true;
    }

    if (pattern === 'rush') {
      const dir = pickDirAdventure();
      if (!dir) return false;
      _doSpawn(dir, pool);
      _queueSpawn(dir, pool, stagger);
      _queueSpawn(dir, pool, stagger * 2);
      return true;
    }

    if (pattern === 'surround') {
      const dirs = pickDirAll();
      if (!dirs) return _executeCombo('triple');
      _doSpawn(dirs[0], pool);
      _queueSpawn(dirs[1], pool, stagger);
      _queueSpawn(dirs[2], pool, stagger * 2);
      _queueSpawn(dirs[3], pool, stagger * 3);
      return true;
    }

    return _executeCombo('single');
  }

  /* ═══════════════════════════════════
     DIMENSION MAP SYSTEM
     ═══════════════════════════════════ */

  function _buildDimensionMap() {
    return {
      id:          'dimension',
      name:        'Dimension',
      background:  null,
      enemyPool:   {},
      isDimension: true,
    };
  }

  function _initDimensionPool() {
    const classes = CONFIG.challenge.enemyClasses;
    const classNames = Object.keys(classes);
    // shuffle classes
    for (let i = classNames.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [classNames[i], classNames[j]] = [classNames[j], classNames[i]];
    }
    // pick 4 classes, 1 enemy each
    _dimClasses = classNames.slice(0, 4);
    _dimPool = [];
    for (const cls of _dimClasses) {
      const members = classes[cls];
      const pick = members[Math.floor(Math.random() * members.length)];
      _dimPool.push({ name: pick, cls: cls });
    }
  }

  function _rotateDimensionPool() {
    const classes = CONFIG.challenge.enemyClasses;
    const allClasses = Object.keys(classes);
    // pick which slot to replace (random)
    const replaceIdx = Math.floor(Math.random() * _dimPool.length);
    const oldCls = _dimPool[replaceIdx].cls;
    // pick a new class not currently in pool
    let available = allClasses.filter(c =>
      !_dimClasses.includes(c) || c === oldCls
    );
    // if all classes used, allow any except current slot
    if (available.length === 0) {
      available = allClasses.filter(c => c !== oldCls);
    }
    const newCls = available[Math.floor(Math.random() * available.length)];
    const members = classes[newCls];
    const newEnemy = members[Math.floor(Math.random() * members.length)];

    // update
    _dimClasses[replaceIdx] = newCls;
    _dimPool[replaceIdx] = { name: newEnemy, cls: newCls };
  }

  function _buildDimensionWaveConfig() {
    // build pool from current dimension enemies
    const pool = {};
    for (const entry of _dimPool) {
      pool[entry.name] = 3; // equal weight
    }

    // use tier to determine combo aggressiveness
    const waveInCyc = _getWaveInCycle();
    const tierName  = CONFIG.challenge.waveTiers[waveInCyc] || 'medium';

    let combos, dirCooldown, spawnInterval, maxAlive, minAlive;

    if (tierName === 'easy') {
      combos = { single: 5, pair_opposite: 3, burst_single: 2 };
      dirCooldown = 1100;
      spawnInterval = 2000;
      maxAlive = 3;
      minAlive = 2;
    } else if (tierName === 'medium') {
      combos = {
        single: 4,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 550 },
        burst_single: 1,
      };
      dirCooldown = 1000;
      spawnInterval = 1800;
      maxAlive = 4;
      minAlive = 2;
    } else if (tierName === 'hard') {
      combos = {
        single: 3,
        pair_opposite: { weight: 3, stagger: 700 },
        pair_adjacent: { weight: 2, stagger: 650 },
        burst_single: 2,
        triple: { weight: 1, stagger: 750 },
      };
      dirCooldown = 900;
      spawnInterval = 1600;
      maxAlive = 4;
      minAlive = 2;
    } else { // peak
      combos = {
        single: 2,
        pair_opposite: { weight: 3, stagger: 750 },
        burst_single: 2,
        triple: { weight: 2, stagger: 800 },
        rush: { weight: 1, stagger: 600 },
      };
      dirCooldown = 800;
      spawnInterval = 1400;
      maxAlive = 5;
      minAlive = 2;
    }

    return { pool, combos, dirCooldown, spawnInterval, maxAlive, minAlive };
  }

  /* ── CHOICE SCHEDULE ───────────────── */

  function _getChoiceInterval(w) {
    const schedule = CONFIG.challenge.choiceSchedule;
    for (const bracket of schedule) {
      if (bracket.untilWave === undefined || w <= bracket.untilWave) {
        return bracket.every;
      }
    }
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
    const cycle = _getCycle();

    // check dimension event
    const dim = c.dimensionEvent;
    if (cycle > dim.afterCycles && Math.random() < dim.chance) {
      _initDimensionPool();
      return _buildDimensionMap();
    }

    // determine pool based on cycle
    let pool;
    if (cycle <= c.mapRotation.earlyCycleEnd) {
      // early: mostly easy maps + chance of late maps
      pool = c.mapRotation.earlyMaps.slice();
      // add 1-2 late maps as cycle progresses
      if (cycle >= 2) {
        const late = c.mapRotation.lateMaps;
        const addCount = Math.min(cycle - 1, 2);
        const shuffled = late.slice().sort(() => Math.random() - 0.5);
        for (let i = 0; i < addCount; i++) {
          if (shuffled[i]) pool.push(shuffled[i]);
        }
      }
    } else {
      // late: full pool
      pool = c.mapRotation.allMaps.slice();

      // breather chance — Forest appears as relief
      if (Math.random() < c.mapRotation.breatherChance) {
        return MapRegistry.get(c.mapRotation.breatherMap);
      }
    }

    // filter out recent maps
    const history = mapHistory.slice(-c.mapRotation.historySize);
    let candidates = pool.filter(id => !history.includes(id));
    if (candidates.length === 0) candidates = pool.slice();

    const mapId = candidates[Math.floor(Math.random() * candidates.length)];
    return MapRegistry.get(mapId);
  }

  function _isMapChangeWave(w) {
    return w > 0 && (w % CONFIG.challenge.wavesPerMap) === 0;
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
      _staggerQueue   = [];
      _inputTimes     = [];
      _dimPool        = [];
      _dimClasses     = [];
      _currentWC      = null;
      bestWave        = _loadBestWave();

      // pick first map
      currentMap = _pickNextMap();
      mapHistory.push(currentMap.id);
      setArenaBackground(currentMap.background || null);
      resetAdventureSpawner();

      return true;
    },

    startFirstWave() {
      this._startWave(1);
      active = true;
    },

    stop() {
      active = false;
    },

    trackInput() {
      _trackInput();
    },

    countChoice() {
      choiceCount++;
    },

    onDamage() {},
    onKill()   {},

    nextWave() {
      if (_isMapChangeWave(wave)) {
        active = false;
        this._changeMap();
        return;
      }

      if (_isChoiceWave(wave)) {
        active = false;
        const type = _getNextChoiceType();
        choiceCount++;
        if (typeof startChallengeChoice === 'function') {
          startChallengeChoice(type);
        }
        return;
      }

      this._startWave(wave + 1);
    },

    _startWave(newWave) {
      wave         = newWave;
      waveElapsed  = 0;
      spawnTimer   = 0;
      draining     = false;
      drainPauseMs = 0;
      _staggerQueue = [];
      resetAdventureSpawner();

      // rotate dimension pool each wave
      if (currentMap && currentMap.isDimension && _dimPool.length > 0) {
        if (_getWaveInCycle() > 1) {
          _rotateDimensionPool();
        }
      }

      // cache wave config for this wave
      _cacheWaveConfig();

      waveDuration = _calcWaveDuration(wave);
      waveTimeLeft = waveDuration;

      if (typeof updateWaveDisplay === 'function') {
        updateWaveDisplay(wave, false);
      }
    },

    _changeMap() {
      mapsCompleted++;
      const newMap = _pickNextMap();
      const self   = this;

      const colors = CONFIG.challenge.mapColors;
      const isDim  = !!newMap.isDimension;
      const mapId  = newMap.id;

      const themeColor = colors[mapId]
        ? colors[mapId][0] : '#ffffff';
      const themeDark  = colors[mapId]
        ? colors[mapId][1] : '#888888';

      const displayName = (newMap.name || mapId).toUpperCase();

      function onSwapBg() {
        currentMap = newMap;
        mapHistory.push(newMap.id);
        setArenaBackground(newMap.background || null);
        resetAdventureSpawner();
      }

      if (isDim) {
        MapTransition.playDimension(onSwapBg).then(() => {
          self._afterMapChange();
        });
      } else {
        MapTransition.playNormal(
          displayName, themeColor, themeDark, onSwapBg
        ).then(() => {
          self._afterMapChange();
        });
      }
    },

    _afterMapChange() {
      if (_isChoiceWave(wave)) {
        const type = _getNextChoiceType();
        choiceCount++;
        if (typeof startChallengeChoice === 'function') {
          startChallengeChoice(type);
        }
        return;
      }

      active = true;
      this._startWave(wave + 1);
    },

    onGameOver() {
      active = false;
      if (wave > bestWave) {
        bestWave = wave;
        _saveBestWave(wave);
      }
    },

    tick(dt) {
      if (!active) return;

      _tickStaggerQueue(dt);

      if (typeof OrbSystem !== 'undefined') OrbSystem.tick(dt);

      // draining
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

      // anti-idle
      if (enemies.length < minAlive) {
        const inputRate     = _getInputRate();
        const idleThreshold = CONFIG.adventure.inputIdleThreshold || 1;

        if (combos) {
          const spawned = _executeCombo('single');
          if (!spawned) {
            spawnTimer = 150;
            return;
          }
        } else {
          // legacy fallback (shouldn't happen)
          const dir = pickDirAdventure();
          if (dir) {
            const pool = _buildPool();
            _doSpawn(dir, pool);
          }
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
          spawnTimer = spawned ? interval : Math.min(interval, 300);
        } else {
          // legacy fallback
          const dir = pickDirAdventure();
          if (dir) {
            const pool = _buildPool();
            _doSpawn(dir, pool);
          }
          spawnTimer = interval;
        }
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

    resumeAfterChoice() {
      active = true;
      this._startWave(wave + 1);
    },

    restart() {
      return this.init();
    },

    restartCurrentWave() {
      this._startWave(wave);
      active = true;
    },

    /* ── DEBUG ────────────────────────── */
    _debug() {
      return {
        wave,
        active,
        draining,
        cycle:           _getCycle(),
        waveInCycle:     _getWaveInCycle(),
        tier:            CONFIG.challenge.waveTiers[_getWaveInCycle()],
        floorMult:       _getFloorMult(),
        waveDuration:    waveDuration,
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
        spawnInterval:   _getSpawnInterval(),
        maxAlive:        _getMaxAlive(),
        minAlive:        _getMinAlive(),
        dirCooldown:     _getDirCooldown(),
        bestWave,
        pool:            _buildPool(),
        combos:          _getCombos(),
        dimPool:         _dimPool.map(d => d.name + ' (' + d.cls + ')'),
        staggerQueue:    _staggerQueue.length,
        cachedWC:        _currentWC,
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