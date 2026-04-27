/* ═══════════════════════════════════════
   ADVENTUREDIRECTOR.JS
   Adventure Mode orchestrator.
   Runs waves 1 to wavesPerMap of the
   currently selected map. Last wave is
   the boss wave with custom rules.

   Used by: systems/loop.js (when in adventure mode)
   Depends on: MapRegistry, Progress,
               stress/calculator.js, stress/events.js
   ═══════════════════════════════════════ */

const AdventureDirector = (() => {

  let currentMap    = null;
  let wave          = 1;
  let stress        = 0;
  let spawnTimer    = 0;
  let killsThisWave = 0;
  let active        = false;
  let completed     = false;
  let waveTimeLeft  = 0;
  let waveDuration  = 0;
  let bossPaused    = false;
  let bossPauseT    = 0;
  let _lastSpawnDir   = null;
  let _spawnHistory   = [];
  let _pendingBurst   = null;

  return {

    init(mapId) {
      currentMap = MapRegistry.get(mapId);
      if (!currentMap) {
        console.error(`AdventureDirector: map "${mapId}" not found.`);
        return false;
      }

      wave          = 1;
      stress        = 0;
      spawnTimer    = 0;
      killsThisWave = 0;
      completed     = false;
      bossPaused    = false;
      bossPauseT    = 0;
      active        = true;
      const timers = CONFIG.adventure.waveTimers;
      const rawTimer = timers[1] !== undefined ? timers[1] : 30;
      waveDuration = rawTimer * 1000;
      waveTimeLeft = waveDuration;

      _lastSpawnDir = null;
      _spawnHistory = [];
      _pendingBurst   = null;
      this._minSpawnCooldown = 0;

      resetAdventureSpawner();
      if (typeof resetUpgradeChoices === 'function') resetUpgradeChoices();
      setArenaBackground(currentMap.background || null);
      return true;
    },

    stop() {
      active = false;
      setArenaBackground(null);
    },

    onDamage() {
      stress = stressOnDamage(stress);
    },

    onKill() {
      stress = stressOnKill(stress);
      killsThisWave++;

      // boss wave still uses kills to advance
      if (this.isBoss() && killsThisWave >= this.getKillsNeeded()) {
        this.completeMap();
      }
    },

    nextWave() {
      const maxWave = this.getMaxWave();
      if (wave >= maxWave) {
        this.completeMap();
        return;
      }

     wave++;
      killsThisWave = 0;
      stress = 0;
      resetAdventureSpawner();

      // set timer for new wave
      const timers = CONFIG.adventure.waveTimers;
      const rawTimer = timers[wave] !== undefined ? timers[wave] : 45;
      waveDuration = rawTimer * 1000;
      waveTimeLeft = waveDuration;
      // choice wave (timer = 0 means upgrade choice)
      if (waveDuration === 0) {
        active = false; // pause game
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

    tick(dt) {
      if (!active) return;

      // boss pause: usa dt normale (la pausa non deve rallentare)
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
// wave timer countdown (not for boss wave)
      if (!this.isBoss()) {
        waveTimeLeft -= dt;
        if (waveTimeLeft <= 0) {
          waveTimeLeft = 0;
          // clear remaining enemies
          enemies.forEach(e => { if (e.el) e.el.remove(); });
          enemies.length = 0;
          bullets.forEach(b => { if (b.el) b.el.remove(); });
          bullets.length = 0;
          this.nextWave();
          return;
        }
      }
      const { w, h } = getArenaSize();
      const cx = w / 2;
      const cy = h / 2;

      stress = calcStress(cx, cy);
      stress = stressDecay(stress, dt);

      const isBoss  = this.isBoss();
      const boss    = this._bossConfig();
      

      

      
      // minimum enemies guarantee — never empty screen
      if (isBoss) {
        // boss wave — raw spawn, no gate system
        spawnTimer -= dt * player.speedMultiplier;
        if (spawnTimer <= 0) {
          this._spawnBossWave();
          spawnTimer = boss.spawnIntervalMs || 400;
        }
    } else {
        const isIntro = currentMap.introWaves && currentMap.introWaves[wave];

        if (isIntro) {
          // intro waves: fixed slow spawn, no stress, calm pacing
          spawnTimer -= dt;
          if (spawnTimer <= 0) {
            spawnGroupForMap('normal', wave, currentMap, false);
            spawnTimer = 1800;
          }
        } else {
          // standard spawn cycle — always ticking
          spawnTimer -= dt;
          if (spawnTimer <= 0) {
            spawnGroupForMap(this._getStateForCurrentWave(), wave, currentMap, isBoss);
            spawnTimer = this._getSpawnIntervalForCurrentWave(this._getStateForCurrentWave());
          }

          // minimum enemies guarantee — extra spawn if field too empty
          const minAlive = currentMap.minEnemiesAlive || 2;
          if (enemies.length < minAlive) {
            if (!this._minSpawnCooldown || this._minSpawnCooldown <= 0) {
              spawnGroupForMap('fast', wave, currentMap, isBoss);
              this._minSpawnCooldown = 600;
            } else {
              this._minSpawnCooldown -= dt;
            }
          }
        }
      }

      
    },

    _getStateForCurrentWave() {
      if (this.isBoss()) {
        const target = this.getTarget();
        const tol    = CONFIG.director.tolerance;
        if (stress > target + tol) return 'normal';
        return 'fast';
      }
      return getDirectorState(stress, wave, false);
    },

    _getSpawnIntervalForCurrentWave(state) {
      const boss = this._bossConfig();
      if (this.isBoss() && boss && boss.spawnIntervalMs) {
        return boss.spawnIntervalMs;
      }
      return getSpawnInterval(state);
    },

    _bossConfig() {
      return currentMap && currentMap.boss ? currentMap.boss : null;
    },
    _spawnBossWave() {
      const boss = this._bossConfig();
      if (!boss) return;

      const killsNeeded = boss.killsToAdvance || 50;
    const killsLeft = killsNeeded - killsThisWave;
      if (killsLeft <= 0) return;

      let potentialKills = 0;
      for (const e of enemies) {
        if (e.def.onDeath) potentialKills += 3;
        else potentialKills += 1;
      }

     if (potentialKills >= killsLeft) return;

      const cap = boss.maxEnemies || 8;
      if (enemies.length >= cap) return;

      // build pool
      const pool = [];
      for (const [name, cfg] of Object.entries(boss.enemyPool)) {
        for (let i = 0; i < cfg.weight; i++) pool.push(name);
      }
      if (pool.length === 0) return;

      // pick random direction — no gate, just avoid last used
      const dirs = ['up', 'down', 'left', 'right'];
      let candidates = dirs;
      if (this._lastBossDir) {
        candidates = dirs.filter(d => d !== this._lastBossDir);
      }
      const dir = candidates[Math.floor(Math.random() * candidates.length)];
      this._lastBossDir = dir;

      const enemyName = pool[Math.floor(Math.random() * pool.length)];
      const def = EnemyRegistry.get(enemyName);
      if (!def) return;

      spawnEnemyDirected(def, dir);
    },

    _spawnBossPattern(boss) {
      const dir = this._pickBossDir();
      this._spawnBossSingle(dir);

      if (boss.burstChance && Math.random() < boss.burstChance) {
        _pendingBurst = {
          dir:    dir,
          msLeft: boss.burstDelay || 400,
        };
      }
    },

    _spawnBossSingle(dir) {
      const boss = this._bossConfig();
      if (!boss) return;

      const cap = boss.maxEnemies !== undefined ? boss.maxEnemies : 6;
      if (enemies.length >= cap) return;

      const pool = [];
      for (const [name, cfg] of Object.entries(boss.enemyPool)) {
        for (let i = 0; i < cfg.weight; i++) pool.push(name);
      }
      if (pool.length === 0) return;

      const enemyName = pool[Math.floor(Math.random() * pool.length)];
      const def       = EnemyRegistry.get(enemyName);
      if (!def) return;

      spawnEnemyDirected(def, dir);

      _lastSpawnDir = dir;
      _spawnHistory.push(dir);
      if (_spawnHistory.length > 4) _spawnHistory.shift();
    },

    _pickBossDir() {
      const dirs = ['up', 'down', 'left', 'right'];

      const countByDir = { up: 0, down: 0, left: 0, right: 0 };
      for (const e of enemies) countByDir[e.dir] = (countByDir[e.dir] || 0) + 1;

      let candidates = dirs.filter(d => countByDir[d] < 4);
      if (candidates.length === 0) candidates = dirs;

      if (_lastSpawnDir && candidates.length > 1) {
        candidates = candidates.filter(d => d !== _lastSpawnDir);
      }

      if (_spawnHistory.length >= 3 && candidates.length > 1) {
        const cw  = ['up', 'right', 'down', 'left', 'up'];
        const ccw = ['up', 'left', 'down', 'right', 'up'];
        const last3 = _spawnHistory.slice(-3);

        const isRotation = (seq, ref) => {
          for (let i = 0; i < ref.length - 2; i++) {
            if (seq[0] === ref[i] && seq[1] === ref[i+1] && seq[2] === ref[i+2]) {
              return ref[(i + 3) % 4];
            }
          }
          return null;
        };

        const nextCw  = isRotation(last3, cw);
        const nextCcw = isRotation(last3, ccw);
        const forbid  = nextCw || nextCcw;
        if (forbid) {
          const filtered = candidates.filter(d => d !== forbid);
          if (filtered.length > 0) candidates = filtered;
        }
      }

      return candidates[Math.floor(Math.random() * candidates.length)];
    },

    getWave()        { return wave; },
    getMaxWave()     { return (currentMap && currentMap.wavesPerMap) || CONFIG.adventure.wavesPerMap; },
    getStress()      { return Math.round(stress); },

    getTarget() {
      if (!currentMap) return 25;
      const boss = this._bossConfig();
      if (this.isBoss() && boss && boss.stressTarget !== undefined) {
        return boss.stressTarget;
      }
      // intro waves: low fixed stress target
      if (currentMap.introWaves && currentMap.introWaves[wave]) {
        return 12;
      }
      // gradual stress increase — count only waves after intro
      const base = currentMap.stressTarget;
      const ramp = currentMap.stressRampPerWave || 1.5;
      const introCount = currentMap.introWaves ? Object.keys(currentMap.introWaves).length : 0;
      const normalWave = wave - introCount;
      return Math.round(base + Math.max(0, normalWave - 1) * ramp);
    },

    isBoss()   { return wave === this.getMaxWave(); },
    getKills() { return killsThisWave; },

    getKillsNeeded() {
      const boss = this._bossConfig();
      if (this.isBoss() && boss && boss.killsToAdvance !== undefined) {
        return boss.killsToAdvance;
      }
      // intro waves have fixed kill count
      if (currentMap && currentMap.introWaves && currentMap.introWaves[wave]) {
        return currentMap.introWaves[wave].kills;
      }
     if (currentMap && currentMap.killsBase) {
        const introCount = currentMap.introWaves ? Object.keys(currentMap.introWaves).length : 0;
        const normalWave = Math.max(1, wave - introCount);
        return Math.round(currentMap.killsBase * Math.pow(currentMap.killsScaling || 1.18, normalWave - 1));
      }
      return killsToAdvance(wave);
    },
    getCurrentMap() { return currentMap; },
    isCompleted()   { return completed; },
    isBossPaused()  { return bossPaused; },
    getWaveTimeLeft() { return waveTimeLeft; },
    getWaveDuration() { return waveDuration; },
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