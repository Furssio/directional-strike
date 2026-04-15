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
  let bossPaused    = false;   // true during the 3s pause before boss
  let bossPauseT    = 0;        // ms remaining of the pause
// boss pattern state
  let _lastSpawnDir   = null;   // last direction spawned (for anti-pattern)
  let _spawnHistory   = [];     // last N directions (for anti-rotation)
  let _pendingBurst   = null;   // { dir, msLeft } if a burst follow-up is queued

  return {

    /* ── INIT ─────────────────────────── */
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

      _lastSpawnDir = null;
      _spawnHistory = [];
      _pendingBurst = null;

     resetSpawnerCooldowns();
setArenaBackground(currentMap.background || null);
return true;
    },

    stop() {
      active = false;
setArenaBackground(null);
    },

    /* ── EVENTS ───────────────────────── */

    onDamage() {
      stress = stressOnDamage(stress);
    },

    onKill() {
      stress = stressOnKill(stress);
      killsThisWave++;

      if (killsThisWave >= this.getKillsNeeded()) {
        this.nextWave();
      }
    },

    /* ── WAVE PROGRESSION ─────────────── */

    nextWave() {
      const maxWave = CONFIG.adventure.wavesPerMap;

      // last wave cleared → map complete
      if (wave >= maxWave) {
        this.completeMap();
        return;
      }

      wave++;
      killsThisWave = 0;

      const isBoss = (wave === maxWave);

      // boss wave → enter pause
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

      // clear arena so the player faces the boss with a clean slate
      enemies.forEach(e => e.el.remove());
      enemies.length = 0;
      bullets.forEach(b => b.el.remove());
      bullets.length = 0;

      // announce boss
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

    /* ── TICK ─────────────────────────── */

    tick(dt) {
      if (!active) return;

      // boss pause: countdown, no spawning
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

      const { w, h } = getArenaSize();
      const cx = w / 2;
      const cy = h / 2;

      stress = calcStress(cx, cy);
      stress = stressDecay(stress, dt);

      const isBoss = this.isBoss();
      const boss   = this._bossConfig();

      // pending burst follow-up (boss only)
      if (isBoss && _pendingBurst) {
        _pendingBurst.msLeft -= dt;
        if (_pendingBurst.msLeft <= 0) {
          this._spawnBossSingle(_pendingBurst.dir);
          _pendingBurst = null;
        }
      }

      // standard spawn cycle
      const state = this._getStateForCurrentWave();
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        if (isBoss && boss) {
          this._spawnBossPattern(boss);
          spawnTimer = boss.spawnIntervalMs || 800;
        } else {
          spawnGroupForMap(state, wave, currentMap, false);
          spawnTimer = this._getSpawnIntervalForCurrentWave(state);
        }
      }

      updateSpawnerCooldowns(dt);
    },

    /* ── INTERNAL: state/spawn for current wave ── */

    _getStateForCurrentWave() {
      // boss wave: force fast spawning regardless of stress
      if (this.isBoss()) {
        const target = this.getTarget();
        const tol    = CONFIG.director.tolerance;
        if (stress > target + tol) return 'normal'; // ease up if overwhelmed
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
    /* ── BOSS SPAWN PATTERN ────────────
       Pick a direction with anti-pattern
       rules, then spawn. Optionally queue
       a burst follow-up.                */

    _spawnBossPattern(boss) {
      const dir = this._pickBossDir();
      this._spawnBossSingle(dir);

      // chance of a burst: queue a follow-up spawn from the same direction
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

      // respect maxEnemies cap
      const cap = boss.maxEnemies !== undefined ? boss.maxEnemies : 6;
      if (enemies.length >= cap) return;

      // pick enemy from boss pool (only ravager for now in map 1)
      const pool = [];
      for (const [name, cfg] of Object.entries(boss.enemyPool)) {
        for (let i = 0; i < cfg.weight; i++) pool.push(name);
      }
      if (pool.length === 0) return;

      const enemyName = pool[Math.floor(Math.random() * pool.length)];
      const def       = EnemyRegistry.get(enemyName);
      if (!def) return;

      spawnEnemyDirected(def, dir);

      // record spawn direction for anti-pattern
      _lastSpawnDir = dir;
      _spawnHistory.push(dir);
      if (_spawnHistory.length > 4) _spawnHistory.shift();
    },

    _pickBossDir() {
      const dirs = ['up', 'down', 'left', 'right'];

      // count enemies per direction currently in arena
      const countByDir = { up: 0, down: 0, left: 0, right: 0 };
      for (const e of enemies) countByDir[e.dir] = (countByDir[e.dir] || 0) + 1;

      // RULE 1: forbid directions with 4+ enemies (anti-accumulation)
      let candidates = dirs.filter(d => countByDir[d] < 4);
      if (candidates.length === 0) candidates = dirs;

      // RULE 2: forbid same direction as last spawn (anti-spam, unless burst forced it)
      if (_lastSpawnDir && candidates.length > 1) {
        candidates = candidates.filter(d => d !== _lastSpawnDir);
      }

      // RULE 3: anti-rotation — if last 3 spawns form a clockwise/counter-clockwise sequence,
      //         forbid the next direction in that rotation
      if (_spawnHistory.length >= 3 && candidates.length > 1) {
        const cw  = ['up', 'right', 'down', 'left', 'up'];
        const ccw = ['up', 'left', 'down', 'right', 'up'];
        const last3 = _spawnHistory.slice(-3);

        const isRotation = (seq, ref) => {
          for (let i = 0; i < ref.length - 2; i++) {
            if (seq[0] === ref[i] && seq[1] === ref[i+1] && seq[2] === ref[i+2]) {
              return ref[(i + 3) % 4]; // the next direction in the rotation
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

    /* ── GETTERS ──────────────────────── */

    getWave()        { return wave; },
    getMaxWave()     { return CONFIG.adventure.wavesPerMap; },
    getStress()      { return Math.round(stress); },

    getTarget() {
      if (!currentMap) return 25;
      const boss = this._bossConfig();
      if (this.isBoss() && boss && boss.stressTarget !== undefined) {
        return boss.stressTarget;
      }
      return currentMap.stressTarget;
    },

    isBoss() {
      return wave === CONFIG.adventure.wavesPerMap;
    },

    getKills() { return killsThisWave; },

    getKillsNeeded() {
      const boss = this._bossConfig();
      if (this.isBoss() && boss && boss.killsToAdvance !== undefined) {
        return boss.killsToAdvance;
      }
      return killsToAdvance(wave);
    },

    getCurrentMap() { return currentMap; },
      isCompleted()   { return completed; },
      isBossPaused()  { return bossPaused; },

      /* ── RESTART ──────────────────────
         Re-initializes the same map.
         Used by "play again" button after
         death in Adventure Mode.            */
      restart() {
        if (!currentMap) return false;
        return this.init(currentMap.id);
      },

  };

})();