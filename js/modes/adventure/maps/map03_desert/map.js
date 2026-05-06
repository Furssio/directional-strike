MapRegistry.register({

  id:    'map03_desert',
  order: 3,
  name:  'Desert',
  theme: 'desert',
  icon:  '🏜️',
  background: 'assets/maps/map03_desert/background_01.png',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  waveConfig: {

    // Wave 1 — scorpion + crusher intro
    1: {
      duration: 15,
      spawnInterval: 2800,
      maxAlive: 3,
      minAlive: 1,
      pool: { scorpion: 6, crusher: 4 },
      burstChance: 0,
      burstSize: 1,
    },

    // Wave 2 — same mix, tighter
    2: {
      duration: 15,
      spawnInterval: 2400,
      maxAlive: 3,
      minAlive: 2,
      pool: { scorpion: 6, crusher: 4 },
      burstChance: 0,
      burstSize: 1,
    },

    // ── UPGRADE 1 ──

    // Wave 3 — tornado enters
    3: {
      duration: 18,
      spawnInterval: 2200,
      maxAlive: 3,
      minAlive: 1,
      pool: { scorpion: 5, crusher: 4, tornado: 1 },
      burstChance: 0.10,
      burstSize: 2,
    },

    // Wave 4 — more tornado pressure
    4: {
      duration: 20,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 5, crusher: 4, tornado: 1 },
      burstChance: 0.15,
      burstSize: 2,
    },

    // ── UPGRADE 2 ──

    // Wave 5 — golem enters
    5: {
      duration: 22,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 4, crusher: 3, tornado: 2, golem: 1 },
      burstChance: 0.15,
      burstSize: 2,
    },

    // Wave 6 — golem more present
    6: {
      duration: 25,
      spawnInterval: 1700,
      maxAlive: 5,
      minAlive: 3,
      pool: { scorpion: 7, tornado: 3, },
      burstChance: 0.20,
      burstSize: 2,
    },

    // ── UPGRADE 3 ──

    // Wave 7 — full mix
    7: {
      duration: 25,
      spawnInterval: 2000,
      maxAlive: 3,
      minAlive: 2,
      pool: {  crusher: 4, tornado: 6,},
      burstChance: 0.20,
      burstSize: 2,
    },

    // Wave 8 — full mix, more pressure
    8: {
      duration: 28,
      spawnInterval: 1900,
      maxAlive: 4,
      minAlive: 3,
      pool: { scorpion: 3, crusher: 4, tornado: 3 },
      burstChance: 0.20,
      burstSize: 2,
    },

    // ── UPGRADE 4 ──

    // Wave 9
    9: {
      duration: 28,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 3,
      pool: { scorpion: 4, crusher: 2, tornado: 3, golem: 1 },
      burstChance: 0.25,
      burstSize: 2,
    },

    // Wave 10 — last stand
    10: {
      duration: 30,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 3,
      pool: { scorpion: 1, crusher: 6, tornado: 2, golem: 1 },
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
      pool: { tornado: 5, scorpion: 5, },
      burstChance: 0.35,
      burstSize: 3,
    },

  },

  /* fallback pool */
  enemyPool: {
    scorpion: { fromWave: 1, weight: 5 },
    crusher:  { fromWave: 1, weight: 4 },
    tornado:  { fromWave: 3, weight: 2 },
    golem:    { fromWave: 5, weight: 2 },
  },

  unlocksAbility: null,

});