MapRegistry.register({

  id:    'map06_beach',
  order: 6,
  name:  'Beach',
  theme: 'beach',
  icon:  '🏖️',
  background: 'assets/maps/map06_beach/background_01.png',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  waveConfig: {

    // Wave 1 — scorpion + parrot intro
    1: {
      duration: 15,
      spawnInterval: 2800,
      maxAlive: 3,
      minAlive: 1,
      pool: { scorpion: 7, parrot: 3 },
      burstChance: 0,
      burstSize: 1,
    },

    // Wave 2 — same, tighter
    2: {
      duration: 15,
      spawnInterval: 2400,
      maxAlive: 3,
      minAlive: 2,
      pool: { scorpion: 7, parrot: 3 },
      burstChance: 0,
      burstSize: 1,
    },

    // ── UPGRADE 1 ──

    // Wave 3 — crab enters
    3: {
      duration: 18,
      spawnInterval: 2200,
      maxAlive: 3,
      minAlive: 1,
      pool: { scorpion: 5, parrot: 2, crab: 3 },
      burstChance: 0.10,
      burstSize: 2,
    },

    // Wave 4 — crab more present
    4: {
      duration: 20,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 4, parrot: 2, crab: 4 },
      burstChance: 0.15,
      burstSize: 2,
    },

    // ── UPGRADE 2 ──

    // Wave 5 — turtle enters
    5: {
      duration: 22,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 4, parrot: 2, crab: 3, turtle: 1 },
      burstChance: 0.15,
      burstSize: 2,
    },

    // Wave 6 — turtle more present, scorpion drops
    6: {
      duration: 25,
      spawnInterval: 1700,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 2, parrot: 3, crab: 3, turtle: 2 },
      burstChance: 0.20,
      burstSize: 2,
    },

    // ── UPGRADE 3 ──

    // Wave 7 — scorpion + crab + parrot
    7: {
      duration: 25,
      spawnInterval: 1700,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 5, parrot: 3, crab: 4, turtle: 1 },
      burstChance: 0.20,
      burstSize: 2,
    },

    // Wave 8 — all 4, balanced
    8: {
      duration: 28,
      spawnInterval: 1600,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 3, parrot: 3, crab: 3, turtle: 1 },
      burstChance: 0.20,
      burstSize: 2,
    },

    // ── UPGRADE 4 ──

    // Wave 9 — all 4, moderate pressure
    9: {
      duration: 28,
      spawnInterval: 1500,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 3, parrot: 3, crab: 3, turtle: 1 },
      burstChance: 0.25,
      burstSize: 2,
    },

    // Wave 10 — last stand
    10: {
      duration: 30,
      spawnInterval: 1400,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 3, parrot: 3, crab: 3, turtle: 1 },
      burstChance: 0.25,
      burstSize: 2,
    },

    // ── UPGRADE 5 ──

    // Wave 11 — FINAL: crab flood
    11: {
      duration: 35,
      spawnInterval: 800,
      maxAlive: 5,
      minAlive: 3,
      pool: { crab: 10 },
      burstChance: 0.35,
      burstSize: 3,
    },

  },

  /* fallback pool */
  enemyPool: {
    scorpion: { fromWave: 1, weight: 4 },
    parrot:   { fromWave: 1, weight: 3 },
    crab:     { fromWave: 3, weight: 3 },
    turtle:   { fromWave: 5, weight: 1 },
  },

  unlocksAbility: null,

});