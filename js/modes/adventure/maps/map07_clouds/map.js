MapRegistry.register({

  id:    'map07_clouds',
  order: 7,
  name:  'Clouds',
  theme: 'clouds',
  icon:  '⛈️',
  background: 'assets/maps/map07_clouds/background_01.png',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  waveConfig: {

    // Wave 1 — tornado + eagle intro
    1: {
      duration: 15,
      spawnInterval: 2800,
      maxAlive: 3,
      minAlive: 1,
      pool: { tornado: 6, eagle: 4 },
      burstChance: 0,
      burstSize: 1,
    },

    // Wave 2 — same, tighter
    2: {
      duration: 15,
      spawnInterval: 2400,
      maxAlive: 3,
      minAlive: 2,
      pool: { tornado: 6, eagle: 4 },
      burstChance: 0,
      burstSize: 1,
    },

    // ── UPGRADE 1 ──

    // Wave 3 — thunder_hound enters
    3: {
      duration: 18,
      spawnInterval: 2200,
      maxAlive: 3,
      minAlive: 1,
      pool: { tornado: 6, thunder_hound: 4 },
      burstChance: 0.10,
      burstSize: 2,
    },

    // Wave 4 — tornado + thunder_hound
    4: {
      duration: 20,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { tornado: 5, thunder_hound: 5 },
      burstChance: 0.15,
      burstSize: 2,
    },

    // ── UPGRADE 2 ──

    // Wave 5 — eagle + thunder_hound, tornado drops
    5: {
      duration: 22,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { tornado: 2, eagle: 5, thunder_hound: 3 },
      burstChance: 0.15,
      burstSize: 2,
    },

    // Wave 6 — eagle + thunder_hound dominate
    6: {
      duration: 25,
      spawnInterval: 1700,
      maxAlive: 4,
      minAlive: 2,
      pool: { tornado: 2, eagle: 4, thunder_hound: 4 },
      burstChance: 0.20,
      burstSize: 2,
    },

    // ── UPGRADE 3 ──

    // Wave 7 — all 3, eagle rare
    7: {
      duration: 25,
      spawnInterval: 1700,
      maxAlive: 4,
      minAlive: 2,
      pool: { tornado: 4, eagle: 2, thunder_hound: 4 },
      burstChance: 0.20,
      burstSize: 2,
    },

    // Wave 8 — all 3, balanced
    8: {
      duration: 28,
      spawnInterval: 1600,
      maxAlive: 4,
      minAlive: 2,
      pool: { tornado: 3, eagle: 3, thunder_hound: 4 },
      burstChance: 0.20,
      burstSize: 2,
    },

    // ── UPGRADE 4 ──

    // Wave 9 — all 3, max pressure
    9: {
      duration: 28,
      spawnInterval: 1500,
      maxAlive: 4,
      minAlive: 2,
      pool: { tornado: 3, eagle: 3, thunder_hound: 4 },
      burstChance: 0.25,
      burstSize: 2,
    },

    // Wave 10 — last stand
    10: {
      duration: 30,
      spawnInterval: 1400,
      maxAlive: 4,
      minAlive: 2,
      pool: { tornado: 3, eagle: 3, thunder_hound: 4 },
      burstChance: 0.25,
      burstSize: 2,
    },

    // ── UPGRADE 5 ──

    // Wave 11 — FINAL: tornado flood
    11: {
      duration: 35,
      spawnInterval: 800,
      maxAlive: 5,
      minAlive: 3,
      pool: { tornado: 10 },
      burstChance: 0.35,
      burstSize: 3,
    },

  },

  /* fallback pool */
  enemyPool: {
    tornado:       { fromWave: 1, weight: 4 },
    eagle:         { fromWave: 1, weight: 3 },
    thunder_hound: { fromWave: 3, weight: 3 },
  },

  unlocksAbility: null,

});