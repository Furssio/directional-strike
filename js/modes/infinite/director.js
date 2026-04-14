/* ═══════════════════════════════════════
   DIRECTOR.JS
   Infinite Mode orchestrator.
   Coordinates stress, spawner and waves.

   Used by: systems/loop.js
   Depends on: stress/calculator.js,
               stress/events.js,
               spawner.js, waves.js
   ═══════════════════════════════════════ */

const Director = (() => {

  let wave          = 1;
  let stress        = 0;
  let spawnTimer    = 0;
  let killsThisWave = 0;
  let active        = false;
  let _isBossWave   = false;

  return {

    init() {
      wave          = 1;
      stress        = 0;
      spawnTimer    = 0;
      killsThisWave = 0;
      _isBossWave   = false;
      active        = true;
      resetSpawnerCooldowns();
    },

    stop() {
      active = false;
    },

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

    nextWave() {
      wave++;
      killsThisWave = 0;
      _isBossWave   = isBossWave(wave);

      if (typeof updateWaveDisplay === 'function') updateWaveDisplay(wave, _isBossWave);

      // after a boss wave → clear all enemies and bullets
      if (isBossWave(wave - 1)) {
        enemies.forEach(e => e.el.remove());
        enemies.length = 0;
        bullets.forEach(b => b.el.remove());
        bullets.length = 0;
      }
    },

    tick(dt) {
      if (!active) return;

      const { w, h } = getArenaSize();
      const cx = w / 2;
      const cy = h / 2;

      stress = calcStress(cx, cy);
      stress = stressDecay(stress, dt);

      const state = getDirectorState(stress, wave, _isBossWave);

      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnGroup(state, wave);
        spawnTimer = getSpawnInterval(state);
      }

      updateSpawnerCooldowns(dt);
    },

    getWave()        { return wave; },
    getStress()      { return Math.round(stress); },
    getTarget()      { return Math.round(getWaveTarget(wave, _isBossWave)); },
    isBoss()         { return _isBossWave; },
    getKills()       { return killsThisWave; },
    getKillsNeeded() { return killsToAdvance(wave); },

  };

})();