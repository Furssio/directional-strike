/* ═══════════════════════════════════════
   ADVENTUREDIRECTOR.JS
   Adventure Mode orchestrator.
   Runs waves 1 to wavesPerMap of the
   currently selected map, then triggers
   map completion.

   Differences from Infinite Director:
   - finite: stops at wave N (map complete)
   - uses stressTarget from map, not formula
   - uses enemyPool from map, not global CONFIG
   - no boss wave yet (future step)

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

  return {

    /* ── INIT ─────────────────────────
       Called when starting a map.
       @param mapId  id from MapRegistry
    ─────────────────────────────────── */
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
      active        = true;

      resetSpawnerCooldowns();
      return true;
    },

    stop() {
      active = false;
    },

    /* ── EVENTS ──────────────────────── */

    onDamage() {
      stress = stressOnDamage(stress);
    },

    onKill() {
      stress = stressOnKill(stress);
      killsThisWave++;

      if (killsThisWave >= killsToAdvance(wave)) {
        this.nextWave();
      }
    },

    /* ── WAVE PROGRESSION ──────────── */

    nextWave() {
      const maxWave = CONFIG.adventure.wavesPerMap;

      // last wave cleared → map complete
      if (wave >= maxWave) {
        this.completeMap();
        return;
      }

      wave++;
      killsThisWave = 0;

      if (typeof updateWaveDisplay === 'function') {
        updateWaveDisplay(wave, false);
      }
    },

    completeMap() {
      if (completed) return;
      completed = true;
      active    = false;

      // clear arena
      enemies.forEach(e => e.el.remove());
      enemies.length = 0;
      bullets.forEach(b => b.el.remove());
      bullets.length = 0;

      // mark progress and unlock reward
      Progress.markMapCompleted(currentMap.id);
      const newlyUnlocked = currentMap.unlocksAbility
        ? Progress.unlockAbility(currentMap.unlocksAbility)
        : false;

      // trigger UI — implemented in step 10
      if (typeof showMapComplete === 'function') {
        showMapComplete(currentMap, newlyUnlocked);
      }
    },

    /* ── TICK ────────────────────────── */

    tick(dt) {
      if (!active || choosingAbility) return;

      const { w, h } = getArenaSize();
      const cx = w / 2;
      const cy = h / 2;

      stress = calcStress(cx, cy);
      stress = stressDecay(stress, dt);

      const state = getDirectorState(stress, wave, false);

      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnGroupForMap(state, wave, currentMap);
        spawnTimer = getSpawnInterval(state);
      }

      updateSpawnerCooldowns(dt);
    },

    /* ── GETTERS ─────────────────────── */

    getWave()        { return wave; },
    getMaxWave()     { return CONFIG.adventure.wavesPerMap; },
    getStress()      { return Math.round(stress); },
    getTarget()      { return currentMap ? currentMap.stressTarget : 25; },
    isBoss()         { return false; },   // for now always false
    getKills()       { return killsThisWave; },
    getKillsNeeded() { return killsToAdvance(wave); },
    getCurrentMap()  { return currentMap; },
    isCompleted()    { return completed; },

  };

})();