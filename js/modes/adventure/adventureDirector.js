/* ═══════════════════════════════════════
   ADVENTUREDIRECTOR.JS
   Adventure Mode orchestrator — v2.
   Scripted spawn pacing with sawtooth
   intensity curve per wave.

   No stress meter — spawn rate is driven
   by fixed per-wave config + time-based
   acceleration + input idle detection.

   Used by: systems/loop.js
   Depends on: MapRegistry, config.js,
               adventureSpawner.js
   ═══════════════════════════════════════ */

const AdventureDirector = (() => {

  let currentMap    = null;
  let wave          = 1;
  let spawnTimer    = 0;
  let killsThisWave = 0;
  let active        = false;
  let completed     = false;
  let waveTimeLeft  = 0;
  let waveDuration  = 0;
  let waveElapsed   = 0;
  let bossPaused    = false;
  let bossPauseT    = 0;
  let draining      = false;
  let drainPauseMs  = 0;

  /* ── INPUT TRACKER ──────────────────
     Counts player actions to detect idle.
     If player isn't pressing anything
     and field is low, spawn faster.     */
  let _inputTimes   = [];

  function _trackInput() {
    _inputTimes.push(performance.now());
  }

  function _getInputRate() {
    const now    = performance.now();
    const window = CONFIG.adventure.inputWindowMs || 3000;
    // clean old entries
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

  function _getSpawnInterval() {
    const wc = _getWaveConfig();
    const base = wc ? wc.spawnInterval : CONFIG.adventure.defaultSpawnInterval;

    // sawtooth: interval shrinks as wave progresses
    if (waveDuration <= 0) return base;
    const progress = Math.min(1, waveElapsed / waveDuration);
    const accel    = CONFIG.adventure.spawnAccelPct || 0.30;
    const factor   = 1 - (progress * accel);
    return Math.max(300, Math.round(base * factor));
  }

  function _getMaxAlive() {
    const wc = _getWaveConfig();
    return wc ? wc.maxAlive : (currentMap.maxEnemies || CONFIG.adventure.defaultMaxAlive);
  }

  function _getMinAlive() {
    const wc = _getWaveConfig();
    return wc ? wc.minAlive : (currentMap.minEnemiesAlive || CONFIG.adventure.defaultMinAlive);
  }

  function _buildPool() {
    const wc = _getWaveConfig();
    if (wc && wc.pool) {
      const pool = [];
      for (const [name, weight] of Object.entries(wc.pool)) {
        for (let i = 0; i < weight; i++) pool.push(name);
      }
      return pool;
    }
    // fallback: use old enemyPool with fromWave
    return buildEnemyPoolForMap(wave, currentMap, false);
  }

  function _buildBossPool() {
    const boss = currentMap.boss;
    if (!boss || !boss.pool) return [];
    const pool = [];
    for (const [name, weight] of Object.entries(boss.pool)) {
      for (let i = 0; i < weight; i++) pool.push(name);
    }
    return pool;
  }

  /* ── SPAWN ONE ENEMY ──────────────── */

  function _spawnOne(isBoss) {
    const pool = isBoss ? _buildBossPool() : _buildPool();
    if (pool.length === 0) return;

    const maxAlive = isBoss
      ? (currentMap.boss.maxAlive || 10)
      : _getMaxAlive();
    if (enemies.length >= maxAlive) return;

    const dir = pickDirAdventure();
    if (!dir) return;

    const enemyName = pool[Math.floor(Math.random() * pool.length)];
    const def       = EnemyRegistry.get(enemyName);
    if (!def) return;

    spawnEnemyDirected(def, dir);

    // register in gate system
    dirGateEnemies[dir].push(enemies[enemies.length - 1]);
  }

  /* ── SPAWN BURST ──────────────────
     Spawns multiple enemies on the same
     direction with small delays.
     Creates the "line of enemies" feel. */
  let _burstQueue = [];

  function _spawnBurst(isBoss, count) {
    const pool = isBoss ? _buildBossPool() : _buildPool();
    if (pool.length === 0) return;

    const maxAlive = isBoss
      ? (currentMap.boss.maxAlive || 10)
      : _getMaxAlive();
    if (enemies.length >= maxAlive) return;

    // pick one direction for the whole burst
    const dir = pickDirAdventure();
    if (!dir) return;

    // spawn first one immediately
    const name1 = pool[Math.floor(Math.random() * pool.length)];
    const def1  = EnemyRegistry.get(name1);
    if (!def1) return;
    spawnEnemyDirected(def1, dir);
    dirGateEnemies[dir].push(enemies[enemies.length - 1]);

    // queue the rest with delays
    for (let i = 1; i < count; i++) {
      _burstQueue.push({
        dir:    dir,
        pool:   pool,
        delay:  i * 500,
        isBoss: isBoss,
        maxAlive: maxAlive,
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
      killsThisWave = 0;
      completed     = false;
      bossPaused    = false;
      bossPauseT    = 0;
      waveElapsed   = 0;
      draining      = false;
      drainPauseMs  = 0;
      active        = true;
      _inputTimes   = [];
      _burstQueue   = [];

      const timers   = CONFIG.adventure.waveTimers;
      const rawTimer = timers[1] !== undefined ? timers[1] : 30;
      waveDuration   = rawTimer * 1000;
      waveTimeLeft   = waveDuration;

      resetAdventureSpawner();
      if (typeof resetUpgradeChoices === 'function') resetUpgradeChoices();
      setArenaBackground(currentMap.background || null);
      return true;
    },

    /* ── STOP ─────────────────────────── */
    stop() {
      active = false;
      setArenaBackground(null);
    },

    /* ── INPUT TRACKING (called from input.js) ── */
    trackInput() {
      _trackInput();
    },

    /* ── EVENTS ───────────────────────── */
    onDamage() { /* no stress — kept for interface compat */ },

    onKill() {
      killsThisWave++;
      // boss wave uses kills to advance
      if (this.isBoss() && killsThisWave >= this.getKillsNeeded()) {
        this.completeMap();
      }
    },

    /* ── NEXT WAVE ────────────────────── */
    nextWave() {
      const maxWave = this.getMaxWave();
      if (wave >= maxWave) {
        this.completeMap();
        return;
      }

      wave++;
      killsThisWave = 0;
      waveElapsed   = 0;
      spawnTimer    = 0;
      draining      = false;
      drainPauseMs  = 0;
      resetAdventureSpawner();

      // set timer for new wave
      const timers   = CONFIG.adventure.waveTimers;
      const rawTimer = timers[wave] !== undefined ? timers[wave] : 45;
      waveDuration   = rawTimer * 1000;
      waveTimeLeft   = waveDuration;

      // choice wave (timer = 0)
      if (waveDuration === 0) {
        active = false;
        if (typeof startUpgradeChoice === 'function') startUpgradeChoice();
        if (typeof updateWaveDisplay === 'function') updateWaveDisplay(wave, false);
        return;
      }

      const isBoss = (wave === maxWave);
      if (isBoss) {
        this._startBossPause();
        return;
      }

      if (typeof updateWaveDisplay === 'function') {
        updateWaveDisplay(wave, false);
      }
    },

    /* ── BOSS PAUSE ───────────────────── */
    _startBossPause() {
      bossPaused = true;
      bossPauseT = CONFIG.adventure.bossPauseMs;

      enemies.forEach(e => e.el.remove());
      enemies.length = 0;
      bullets.forEach(b => b.el.remove());
      bullets.length = 0;

      if (typeof showBossAnnounce === 'function') {
        showBossAnnounce(currentMap);
      }
    },

    /* ── COMPLETE MAP ─────────────────── */
    completeMap() {
      if (completed) return;
      completed = true;
      active    = false;

      enemies.forEach(e => e.el.remove());
      enemies.length = 0;
      bullets.forEach(b => b.el.remove());
      bullets.length = 0;

      Progress.markMapCompleted(currentMap.id);
      const newlyUnlocked = currentMap.unlocksAbility
        ? Progress.unlockAbility(currentMap.unlocksAbility)
        : false;

      if (typeof showMapComplete === 'function') {
        showMapComplete(currentMap, newlyUnlocked);
      }
    },

    /* ── TICK ─────────────────────────── */
    tick(dt) {
      if (!active) return;

      // boss pause countdown
      if (bossPaused) {
        bossPauseT -= dt;
        if (bossPauseT <= 0) {
          bossPaused = false;
          if (typeof updateWaveDisplay === 'function') {
            updateWaveDisplay(wave, true);
          }
          spawnTimer = 0;
        }
        return;
      }

      const isBoss = this.isBoss();

      // process queued burst spawns
      _tickBurstQueue(dt);

// tick orb system
      if (typeof OrbSystem !== 'undefined') OrbSystem.tick(dt);

      // wave timer countdown (not for boss)
      if (!isBoss) {
        if (draining) {
          // waiting for remaining enemies to die
          if (enemies.length === 0 && bullets.length === 0) {
            drainPauseMs -= dt;
            if (drainPauseMs <= 0) {
              draining = false;
              this.nextWave();
            }
          }
          return; // no spawning during drain
        }

        waveElapsed  += dt;
        waveTimeLeft -= dt;
        if (waveTimeLeft <= 0) {
          waveTimeLeft = 0;
          draining     = true;
          drainPauseMs = 500; // half second pause after clearing
          return;
        }
      }

      // ── SPAWN LOGIC ──

      // 1. anti-idle: if player isn't pressing and field is low, spawn fast
      const minAlive = isBoss
        ? (currentMap.boss.minAlive || 4)
        : _getMinAlive();

      if (enemies.length < minAlive) {
        const inputRate = _getInputRate();
        const idleThreshold = CONFIG.adventure.inputIdleThreshold || 1;
        if (inputRate <= idleThreshold) {
          // player is idle + field empty → spawn immediately
          _spawnOne(isBoss);
          spawnTimer = CONFIG.adventure.inputIdleSpawnMs || 600;
          return;
        }
        // field below minimum but player is active → spawn soon
        _spawnOne(isBoss);
        spawnTimer = 400;
        return;
      }

      // 2. standard spawn cycle
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        const interval = isBoss
          ? (currentMap.boss.spawnInterval || 400)
          : _getSpawnInterval();

        // 40% chance to spawn a burst of 2-3 instead of 1
        const wc = _getWaveConfig();
        const burstChance = (wc && wc.burstChance !== undefined) ? wc.burstChance : 0.4;
        const burstSize   = (wc && wc.burstSize !== undefined) ? wc.burstSize : 2;

        if (Math.random() < burstChance && _burstQueue.length === 0) {
          _spawnBurst(isBoss, burstSize);
        } else {
          _spawnOne(isBoss);
        }
        spawnTimer = interval;
      }
    },

    /* ── GETTERS ──────────────────────── */
    getWave()        { return wave; },
    getMaxWave()     { return (currentMap && currentMap.wavesPerMap) || CONFIG.adventure.wavesPerMap; },
    getStress()      { return 0; },
    getTarget()      { return 0; },

    isBoss()   { return wave === this.getMaxWave(); },
    getKills() { return killsThisWave; },

    getKillsNeeded() {
      const boss = currentMap.boss;
      if (this.isBoss() && boss && boss.killsToAdvance !== undefined) {
        return boss.killsToAdvance;
      }
      return 999;
    },

    getCurrentMap()     { return currentMap; },
    isCompleted()       { return completed; },
    isBossPaused()      { return bossPaused; },
    getWaveTimeLeft()   { return waveTimeLeft; },
    getWaveDuration()   { return waveDuration; },

    resumeAfterChoice() {
      active = true;
      this.nextWave();
    },

    restart() {
      if (!currentMap) return false;
      return this.init(currentMap.id);
    },

  };

})();