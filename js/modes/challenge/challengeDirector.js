/* ═══════════════════════════════════════
   CHALLENGEDIRECTOR.JS — v3 MODULAR
   Challenge Mode orchestrator.
   Delegates to: ChallengeScaling,
   ChallengePool, ChallengeDimension,
   ChallengeTransition.

   Used by: systems/loop.js (via ActiveDirector)
   ═══════════════════════════════════════ */

const ChallengeDirector = (() => {

  /* ── STATE ─────────────────────────── */
  let wave           = 0;
  let active         = false;
  let currentMap     = null;
  let mapsCompleted  = 0;
  let choiceCount    = 0;
  let bestWave       = 0;

  /* ── WAVE TIMER ────────────────────── */
  let waveDuration = 0;
  let waveTimeLeft = 0;
  let waveElapsed  = 0;
  let draining     = false;
  let drainPauseMs = 0;
  let spawnTimer   = 0;

  /* ── CACHED WAVE CONFIG ────────────── */
  let _currentWC    = null;
  let _dimBackupMap = null;

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

  /* ── WAVE CONFIG CACHE ─────────────── */

  function _cacheWaveConfig() {
    if (currentMap && currentMap.isDimension) {
      _currentWC = ChallengeDimension.buildWaveConfig(wave);
    } else {
      _currentWC = ChallengeScaling.getAdventureWaveConfig(wave, currentMap);
    }
  }

  /* ── PARAM GETTERS (use cached WC) ─── */

  function _getSpawnInterval() {
    const base    = _currentWC ? _currentWC.spawnInterval : 1800;
    const floored = ChallengeScaling.applyFloorSpawnInterval(base, wave);

    if (waveDuration <= 0) return floored;
    const progress = Math.min(1, waveElapsed / waveDuration);
    const accel    = CONFIG.adventure.spawnAccelPct || 0.30;
    const factor   = 1 - (progress * accel);
    let interval   = Math.max(500, Math.round(floored * factor));

    if (player && player.speedMultiplier < 1) {
      interval = Math.round(interval / player.speedMultiplier);
    }
    return interval;
  }

  function _getMaxAlive() {
    const base = _currentWC ? _currentWC.maxAlive : 4;
    return ChallengeScaling.applyFloorMaxAlive(base, wave);
  }

  function _getMinAlive() {
    return _currentWC ? (_currentWC.minAlive || 2) : 2;
  }

  function _getDirCooldown() {
    const base = (_currentWC && _currentWC.dirCooldown !== undefined)
      ? _currentWC.dirCooldown
      : (CONFIG.adventure.defaultDirCooldown || 800);
    return ChallengeScaling.applyFloorCooldown(base, wave);
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
    return (w % _getChoiceInterval(w)) === 0;
  }

  function _getNextChoiceType() {
    const types = CONFIG.challenge.choiceTypes;
    return types[choiceCount % types.length];
  }

  /* ── MAP CHANGE CHECK ──────────────── */

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
      wave          = 0;
      active        = false;
      currentMap    = null;
      mapsCompleted = 0;
      choiceCount   = 0;
      spawnTimer    = 0;
      waveElapsed   = 0;
      waveDuration  = 0;
      waveTimeLeft  = 0;
      draining      = false;
      drainPauseMs  = 0;
      _currentWC    = null;
      _dimBackupMap = null;
      _inputTimes   = [];
      bestWave      = _loadBestWave();

      ChallengePool.resetQueue();
      ChallengeDimension.reset();
      ChallengeTransition.reset();

      // pick first map
      currentMap = ChallengeTransition.pickNextMap(1);
      ChallengeTransition.pushHistory(currentMap.id);
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

    trackInput() { _trackInput(); },
    countChoice() { choiceCount++; },
    onDamage() {},
    onKill()   {},

    nextWave() {
      const nextW     = wave + 1;
      const nextInCyc = ChallengeScaling.getWaveInCycle(nextW);
      const isLastOfCycle = nextInCyc === CONFIG.challenge.wavesPerMap;

      // entering dimension (last wave of cycle)
      if (isLastOfCycle && !_dimBackupMap) {
        active = false;
        _dimBackupMap = currentMap;
        ChallengeDimension.initPool();
        const dimMap = ChallengeDimension.buildMap();
        const self   = this;

        ChallengeTransition.playChange(dimMap, () => {
          currentMap = dimMap;
          setArenaBackground(dimMap.background || null);
          resetAdventureSpawner();
        }).then(() => {
          self._startWave(nextW);
          active = true;
        });
        return;
      }

      // leaving dimension → map change
      if (_isMapChangeWave(wave)) {
        active = false;
        _dimBackupMap = null;
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
      ChallengePool.resetQueue();
      resetAdventureSpawner();

      _cacheWaveConfig();

      waveDuration = ChallengeScaling.calcWaveDuration(wave);
      waveTimeLeft = waveDuration;

      if (typeof updateWaveDisplay === 'function') {
        updateWaveDisplay(wave, false);
      }
    },

    _changeMap() {
      mapsCompleted++;
      const cycle  = ChallengeScaling.getCycle(wave + 1);
      const newMap = ChallengeTransition.pickNextMap(cycle);
      const self   = this;

      function onSwapBg() {
        currentMap = newMap;
        ChallengeTransition.pushHistory(newMap.id);
        setArenaBackground(newMap.background || null);
        resetAdventureSpawner();
      }

      ChallengeTransition.playChange(newMap, onSwapBg).then(() => {
        self._afterMapChange();
      });
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

  ChallengePool.tickQueue(dt);

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
      const combos   = ChallengePool.getCombos(_currentWC);
      const ctx      = {
        waveConfig:  _currentWC,
        currentMap:  currentMap,
        maxAlive:    _getMaxAlive(),
        dirCooldown: _getDirCooldown(),
      };

      // anti-idle
      if (enemies.length < minAlive) {
        const inputRate = _getInputRate();

        if (combos) {
          const spawned = ChallengePool.executeCombo('single', ctx);
          if (!spawned) { spawnTimer = 150; return; }
        } else {
          const dir = pickDirAdventure();
          if (dir) {
            const pool = ChallengePool.buildPool(_currentWC, currentMap);
            spawnEnemyDirected(EnemyRegistry.get(pool[0]), dir);
          }
        }

        const idleThreshold = CONFIG.adventure.inputIdleThreshold || 1;
        spawnTimer = (_getInputRate() <= idleThreshold)
          ? (CONFIG.adventure.inputIdleSpawnMs || 600)
          : 400;
        return;
      }

      // standard spawn cycle
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        const interval = _getSpawnInterval();

        if (combos) {
          const pattern = ChallengePool.pickCombo(combos);
          const spawned = ChallengePool.executeCombo(pattern, ctx);
          spawnTimer = spawned ? interval : Math.min(interval, 300);
        } else {
          const dir = pickDirAdventure();
          if (dir) {
            const pool = ChallengePool.buildPool(_currentWC, currentMap);
            spawnEnemyDirected(EnemyRegistry.get(pool[0]), dir);
          }
          spawnTimer = interval;
        }
      }
    },

    /* ── GETTERS ──────────────────────── */
    getWave()          { return wave; },
    getMaxWave()       { return Infinity; },
    getStress()        { return 0; },
    getTarget()        { return 0; },
    isBoss()           { return false; },
    getKills()         { return 0; },
    getKillsNeeded()   { return 0; },
    getCurrentMap()    { return currentMap; },
    isCompleted()      { return false; },
    isBossPaused()     { return false; },
    getWaveTimeLeft()  { return waveTimeLeft; },
    getWaveDuration()  { return waveDuration; },
    getBestWave()      { return bestWave; },
    getChoiceCount()   { return choiceCount; },
    getMapsCompleted() { return mapsCompleted; },
    isDimensionMap()   { return currentMap && currentMap.isDimension; },

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
        cycle:          ChallengeScaling.getCycle(wave),
        waveInCycle:    ChallengeScaling.getWaveInCycle(wave),
        tier:           ChallengeScaling.getTierName(wave),
        floorMult:      ChallengeScaling.getFloorMult(wave),
        waveDuration,
        waveTimeLeft,
        waveElapsed,
        spawnTimer,
        currentMap:     currentMap ? currentMap.id : null,
        isDimension:    currentMap ? !!currentMap.isDimension : false,
        mapsCompleted,
        choiceCount,
        nextChoiceType: _getNextChoiceType(),
        choiceInterval: _getChoiceInterval(wave),
        isChoiceWave:   _isChoiceWave(wave),
        spawnInterval:  _getSpawnInterval(),
        maxAlive:       _getMaxAlive(),
        minAlive:       _getMinAlive(),
        dirCooldown:    _getDirCooldown(),
        bestWave,
        pool:           ChallengePool.buildPool(_currentWC, currentMap),
        combos:         ChallengePool.getCombos(_currentWC),
        dimPool:        ChallengeDimension.getPool().map(
                          d => d.name + ' (' + d.cls + ')'
                        ),
        staggerQueue:   ChallengePool.queueLength(),
        cachedWC:       _currentWC,
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