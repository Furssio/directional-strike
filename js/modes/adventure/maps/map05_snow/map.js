MapRegistry.register({

  id:    'map05_snow',
  order: 5,
  name:  'Snow',
  theme: 'snow',
  icon:  '❄️',
  background: 'assets/maps/map05_snow/background_01.png',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  waveConfig: {

    // Wave 1 — spectral_deer + wolf, deer dominates
    1: {
      duration: 15,
      spawnInterval: 2800,
      maxAlive: 3,
      minAlive: 1,
      pool: { spectral_deer: 7, wolf: 3 },
      burstChance: 0,
      burstSize: 1,
    },

    // Wave 2 — bear + ravager, no deer
    2: {
      duration: 15,
      spawnInterval: 2400,
      maxAlive: 3,
      minAlive: 2,
      pool: { bear: 5, ravager: 5 },
      burstChance: 0,
      burstSize: 1,
    },

    // ── UPGRADE 1 ──

    // Wave 3 — ravager + wolf + deer
    3: {
      duration: 18,
      spawnInterval: 2200,
      maxAlive: 3,
      minAlive: 1,
      pool: { spectral_deer: 5, wolf: 3, ravager: 2 },
      burstChance: 0.10,
      burstSize: 2,
    },

    // Wave 4 — bear + wolf, no deer
    4: {
      duration: 20,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { bear: 5, wolf: 5 },
      burstChance: 0.15,
      burstSize: 2,
    },

    // ── UPGRADE 2 ──

    // Wave 5 — deer + bear + ravager
    5: {
      duration: 22,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { spectral_deer: 5, bear: 3, ravager: 2 },
      burstChance: 0.15,
      burstSize: 2,
    },

    // Wave 6 — all 4, low maxAlive to avoid chaos
    6: {
      duration: 25,
      spawnInterval: 1800,
      maxAlive: 3,
      minAlive: 1,
      pool: { spectral_deer: 2, wolf: 3, bear: 2, ravager: 3 },
      burstChance: 0.10,
      burstSize: 2,
    },

    // ── UPGRADE 3 ──

    // Wave 7 — ravager + bear + deer
    7: {
      duration: 25,
      spawnInterval: 1700,
      maxAlive: 4,
      minAlive: 2,
      pool: { spectral_deer: 4, bear: 3, ravager: 3 },
      burstChance: 0.20,
      burstSize: 2,
    },

    // Wave 8 — deer + ravager only, deer floods
    8: {
      duration: 28,
      spawnInterval: 1600,
      maxAlive: 4,
      minAlive: 2,
      pool: { spectral_deer: 7, ravager: 3 },
      burstChance: 0.20,
      burstSize: 2,
    },

    // ── UPGRADE 4 ──

    // Wave 9 — all 4, moderate
    9: {
      duration: 28,
      spawnInterval: 1500,
      maxAlive: 4,
      minAlive: 2,
      pool: { spectral_deer: 2, wolf: 3, bear: 2, ravager: 3 },
      burstChance: 0.25,
      burstSize: 2,
    },

    // Wave 10 — all 4, last stand
    10: {
      duration: 30,
      spawnInterval: 1400,
      maxAlive: 4,
      minAlive: 2,
      pool: { spectral_deer: 2, wolf: 3, bear: 2, ravager: 3 },
      burstChance: 0.25,
      burstSize: 2,
    },

    // ── UPGRADE 5 ──

    // Wave 11 — FINAL: wolf + spectral_deer flood
    11: {
      duration: 35,
      spawnInterval: 800,
      maxAlive: 5,
      minAlive: 3,
      pool: { spectral_deer: 5, wolf: 5 },
      burstChance: 0.35,
      burstSize: 3,
    },

  },

  /* fallback pool */
  enemyPool: {
    spectral_deer: { fromWave: 1, weight: 4 },
    wolf:          { fromWave: 1, weight: 3 },
    bear:          { fromWave: 2, weight: 2 },
    ravager:       { fromWave: 2, weight: 3 },
  },

  unlocksAbility: null,

});