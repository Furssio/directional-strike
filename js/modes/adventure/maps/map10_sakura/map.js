MapRegistry.register({

  id:    'map10_sakura',
  order: 10,
  name:  'Sakura',
  theme: 'sakura',
  icon:  '🌸',
  background: 'assets/maps/map10_sakura/background_01.png',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  waveConfig: {

    // Wave 1 — kitsune + nara_deer intro
    1: {
      duration: 15,
      spawnInterval: 2800,
      maxAlive: 3,
      minAlive: 1,
      pool: { kitsune: 5, nara_deer: 5 },
      burstChance: 0,
      burstSize: 1,
    },

    // Wave 2 — same, tighter
    2: {
      duration: 15,
      spawnInterval: 2400,
      maxAlive: 3,
      minAlive: 2,
      pool: { kitsune: 5, nara_deer: 5 },
      burstChance: 0,
      burstSize: 1,
    },

    // ── UPGRADE 1 ──

    // Wave 3 — frog enters
    3: {
      duration: 18,
      spawnInterval: 2200,
      maxAlive: 3,
      minAlive: 1,
      pool: { kitsune: 4, nara_deer: 3, frog: 3 },
      burstChance: 0.10,
      burstSize: 2,
    },

    // Wave 4 — frog more present
    4: {
      duration: 20,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { kitsune: 3, nara_deer: 3, frog: 4 },
      burstChance: 0.15,
      burstSize: 2,
    },

    // ── UPGRADE 2 ──

    // Wave 5 — oni enters, rare
    5: {
      duration: 22,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { kitsune: 3, nara_deer: 3, frog: 3, oni: 1 },
      burstChance: 0.15,
      burstSize: 2,
    },

    // Wave 6 — oni slightly more present
    6: {
      duration: 25,
      spawnInterval: 1700,
      maxAlive: 4,
      minAlive: 2,
      pool: { kitsune: 3, nara_deer: 3, frog: 2, oni: 2 },
      burstChance: 0.20,
      burstSize: 2,
    },

    // ── UPGRADE 3 ──

    // Wave 7 — all 4, oni rare
    7: {
      duration: 25,
      spawnInterval: 1700,
      maxAlive: 4,
      minAlive: 2,
      pool: { kitsune: 3, nara_deer: 3, frog: 3, oni: 1 },
      burstChance: 0.20,
      burstSize: 2,
    },

    // Wave 8 — all 4, balanced
    8: {
      duration: 28,
      spawnInterval: 1600,
      maxAlive: 4,
      minAlive: 2,
      pool: { kitsune: 3, nara_deer: 3, frog: 2, oni: 2 },
      burstChance: 0.20,
      burstSize: 2,
    },

    // ── UPGRADE 4 ──

    // Wave 9 — max pressure
    9: {
      duration: 28,
      spawnInterval: 1500,
      maxAlive: 3,
      minAlive: 2,
      pool: { kitsune: 3, nara_deer: 3, frog: 2, oni: 2 },
      burstChance: 0.25,
      burstSize: 2,
    },

    // Wave 10 — last stand
    10: {
      duration: 30,
      spawnInterval: 1400,
      maxAlive: 3,
      minAlive: 2,
      pool: { kitsune: 3, nara_deer: 3, frog: 2, oni: 2 },
      burstChance: 0.25,
      burstSize: 2,
    },

    // ── UPGRADE 5 ──

    // Wave 11 — FINAL: oni flood
    11: {
      duration: 35,
      spawnInterval: 1200,
      maxAlive: 3,
      minAlive: 2,
      pool: { oni: 10 },
      burstChance: 0.20,
      burstSize: 2,
    },

  },

  /* fallback pool */
  enemyPool: {
    kitsune:   { fromWave: 1, weight: 3 },
    nara_deer: { fromWave: 1, weight: 3 },
    frog:      { fromWave: 3, weight: 3 },
    oni:       { fromWave: 5, weight: 1 },
  },

  unlocksAbility: null,

});