/* ═══════════════════════════════════════
   CHALLENGESCALING.JS
   Wave duration calc, floor scaling,
   tier mapping for challenge mode.

   Used by: challengeDirector.js
   Depends on: config.js
   ═══════════════════════════════════════ */

const ChallengeScaling = (() => {

  /* ── CYCLE HELPERS ─────────────────── */

  function getCycle(wave) {
    return Math.floor((wave - 1) / CONFIG.challenge.wavesPerMap) + 1;
  }

  function getWaveInCycle(wave) {
    return ((wave - 1) % CONFIG.challenge.wavesPerMap) + 1;
  }

  /* ── WAVE DURATION ─────────────────── */

  function calcWaveDuration(w) {
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

  function getFloorMult(wave) {
    const c      = CONFIG.challenge;
    const cycle  = getCycle(wave);
    const capped = Math.min(cycle - 1, c.plateauAtCycle - 1);
    return capped; // 0 at cycle 1, max at plateauAtCycle-1
  }

  function applyFloorSpawnInterval(spawnInterval, wave) {
    const floor = getFloorMult(wave);
    const scale = CONFIG.challenge.floorScaling;
    const mult  = 1 - (floor * scale.spawnIntervalMult);
    return Math.max(600, Math.round(spawnInterval * mult));
  }

  function applyFloorCooldown(cd, wave) {
    const floor = getFloorMult(wave);
    const scale = CONFIG.challenge.floorScaling;
    const mult  = 1 - (floor * scale.dirCooldownMult);
    return Math.max(400, Math.round(cd * mult));
  }

  function applyFloorMaxAlive(ma, wave) {
    const floor = getFloorMult(wave);
    const scale = CONFIG.challenge.floorScaling;
    return Math.min(10, ma + Math.floor(floor * scale.maxAlivePlus));
  }

  /* ── TIER LOOKUP ───────────────────── */

  function getTierName(wave) {
    const waveInCyc = getWaveInCycle(wave);
    return CONFIG.challenge.waveTiers[waveInCyc] || 'medium';
  }

  function getAdventureWaveConfig(wave, currentMap) {
    if (!currentMap || !currentMap.waveConfig) return null;

    const c    = CONFIG.challenge;
    let tier   = getTierName(wave);

    // Moon uses moonPeak instead of peak
    if (tier === 'peak' && currentMap.id === 'map12_moon') {
      tier = 'moonPeak';
    }
    // Forest is easier — peak uses wave 10 instead of 9
    if (tier === 'peak' && currentMap.id === 'map01_forest') {
      tier = 'peakEasy';
    }

    const range = c.tierMapping[tier] || c.tierMapping.medium;
    const minW  = range[0];
    const maxW  = range[1];
    const advWave = minW + Math.floor(Math.random() * (maxW - minW + 1));

    return currentMap.waveConfig[advWave] || null;
  }

  /* ── PUBLIC API ────────────────────── */

  return {
    getCycle,
    getWaveInCycle,
    calcWaveDuration,
    getFloorMult,
    applyFloorSpawnInterval,
    applyFloorCooldown,
    applyFloorMaxAlive,
    getTierName,
    getAdventureWaveConfig,
  };

})();