/* ═══════════════════════════════════════
   ADVENTUREDIRECTOR.JS
   Adventure Mode orchestrator — v3.
   Time-based waves with automatic upgrade
   choice after configurable waves.

   Each wave's duration and spawn config
   comes from the map's waveConfig.
   No stress meter, no kill-based advance.

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

  /* ── INPUT TRACKER ──────────────────
     Counts player actions to detect idle.
     If player isn't pressing anything
     and field is low, spawn faster.     */
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
    // fallback: 30 seconds
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

    // slow spawn rate when bullet time (or any slow) is active
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

  /* ── UPGRADE CHECK ──────────────────
     Returns true if an upgrade choice
     should trigger after this wave.     */
  function _isUpgradeWave(w) {
    const list = CONFIG.adventure.upgradeAfterWaves || [2, 4, 6, 8, 10];
    return list.includes(w);
  }

  /* ── FINAL WAVE CHECK ───────────────
     Wave 11 is the final wave.
     Maps can override with totalWaves.  */
  function _getTotalWaves() {
    if (currentMap && currentMap.totalWaves) return currentMap.totalWaves;
    return 11;
  }

  function _isFinalWave() {
    return wave === _getTotalWaves();
  }

  /* ── SPAWN ONE ENEMY ──────────────── */

  function _spawnOne() {
    const pool = _buildPool();
    if (pool.length === 0) return;

    const maxAlive = _getMaxAlive();
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
     direction with small delays.         */
  let _burstQueue = [];

  function _spawnBurst(count) {
    const pool = _buildPool();
    if (pool.length === 0) return;

    const maxAlive = _getMaxAlive();
    if (enemies.length >= maxAlive) return;

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
        dir:      dir,
        pool:     pool,
        delay:    i * 500,
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
      completed     = false;
      waveElapsed   = 0;
      draining      = false;
      drainPauseMs  = 0;
      active        = true;
      _inputTimes   = [];
      _burstQueue   = [];

      waveDuration = _getWaveDuration();
waveTimeLeft = waveDuration;
console.log('waveDuration:', waveDuration, 'waveTimeLeft:', waveTimeLeft);

      resetAdventureSpawner();
      if (typeof resetUpgradeChoices === 'function') resetUpgradeChoices();
      setArenaBackground(currentMap.background || null);

      // start tutorial on wave 1 of first map (first time only)
      if (wave === 1 && currentMap.id === 'map01_forest' &&
          typeof Tutorial !== 'undefined' && Tutorial.isNeeded()) {
        Tutorial.start();
      }

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
    onKill()   { /* kills don't advance waves anymore */  },

    /* ── NEXT WAVE ────────────────────── */
    nextWave() {
      const total = _getTotalWaves();

      // current wave just ended — check if it was the last
      if (wave >= total) {
        this.completeMap();
        return;
      }

      // check if upgrade choice triggers after this wave
      if (_isUpgradeWave(wave)) {
        active = false;
        if (typeof startUpgradeChoice === 'function') startUpgradeChoice();
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

      // tutorial controls wave 1 spawning
      if (typeof Tutorial !== 'undefined' && Tutorial.isActive()) {
        Tutorial.tick(dt);
        // still tick orbs and burst queue
        if (typeof OrbSystem !== 'undefined') OrbSystem.tick(dt);
        _tickBurstQueue(dt);
        return; // skip normal spawn logic
      }

      // process queued burst spawns
      _tickBurstQueue(dt);

      // tick orb system
      if (typeof OrbSystem !== 'undefined') OrbSystem.tick(dt);

      // wave timer countdown
      if (draining) {
        // waiting for remaining enemies to die
        if (enemies.length === 0 && bullets.length === 0) {
          drainPauseMs -= dt;
          if (drainPauseMs <= 0) {
            draining = false;
            this.nextWave();
          }
        }
        return;
      }

      waveElapsed  += dt;
waveTimeLeft -= dt;
if (dt > 100) console.log('BIG DT:', dt, 'waveTimeLeft:', waveTimeLeft);
if (waveTimeLeft <= 0) {
  waveTimeLeft = 0;
  draining     = true;
  drainPauseMs = 500;
  console.log('DRAINING at waveElapsed:', waveElapsed, 'waveDuration:', waveDuration);
  return;
}

      // ── SPAWN LOGIC ──

      const minAlive = _getMinAlive();

      // anti-idle: if player isn't pressing and field is low, spawn fast
      if (enemies.length < minAlive) {
        const inputRate     = _getInputRate();
        const idleThreshold = CONFIG.adventure.inputIdleThreshold || 1;
        if (inputRate <= idleThreshold) {
          _spawnOne();
          spawnTimer = CONFIG.adventure.inputIdleSpawnMs || 600;
          return;
        }
        // field below minimum but player is active — spawn soon
        _spawnOne();
        spawnTimer = 400;
        return;
      }

      // standard spawn cycle
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        const interval = _getSpawnInterval();

        // burst chance from wave config
        const wc          = _getWaveConfig();
        const burstChance = (wc && wc.burstChance !== undefined) ? wc.burstChance : 0;
        const burstSize   = (wc && wc.burstSize !== undefined) ? wc.burstSize : 2;

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
      // after upgrade choice, advance to next wave
      this._startWave(wave + 1);
    },

    restart() {
      if (!currentMap) return false;
      return this.init(currentMap.id);
    },

  };

})();