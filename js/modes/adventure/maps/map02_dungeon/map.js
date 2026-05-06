MapRegistry.register({

  id:    'map02_dungeon',
  order: 2,
  name:  'Dungeon',
  theme: 'dungeon',
  icon:  '🪨',
  background: 'assets/maps/map02_dungeon/background_01.png',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  waveConfig: {

    // Wave 1 — intro, ravager + slime
    1: {
      duration: 15,
      spawnInterval: 2800,
      maxAlive: 3,
      minAlive: 1,
      pool: { ravager: 6, slime_large: 4 },
      burstChance: 0,
      burstSize: 1,
    },

    // Wave 2 — same mix, tighter
    2: {
      duration: 15,
      spawnInterval: 2400,
      maxAlive: 3,
      minAlive: 2,
      pool: { ravager: 6, slime_large: 4 },
      burstChance: 0,
      burstSize: 1,
    },

    // ── UPGRADE 1 ──

    // Wave 3 — golem enters
    3: {
      duration: 20,
      spawnInterval: 2200,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 4, slime_large: 4, golem: 2 },
      burstChance: 0.10,
      burstSize: 2,
    },

    // Wave 4 — same as 3, longer
    4: {
      duration: 20,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 4, slime_large: 4, golem: 2 },
      burstChance: 0.15,
      burstSize: 2,
    },

    // ── UPGRADE 2 ──

    // Wave 5 — more pressure
    5: {
      duration: 20,
      spawnInterval: 1900,
      maxAlive: 4,
      minAlive: 3,
      pool: { ravager: 4, slime_large: 4, golem: 2 },
      burstChance: 0.15,
      burstSize: 2,
    },

    // Wave 6
    6: {
      duration: 25,
      spawnInterval: 1900,
      maxAlive: 4,
      minAlive: 3,
      pool: { ravager: 7,  golem: 3 },
      burstChance: 0.20,
      burstSize: 2,
    },

    // ── UPGRADE 3 ──

    // Wave 7
    7: {
      duration: 25,
      spawnInterval: 1900,
      maxAlive: 4,
      minAlive: 3,
      pool: { ravager: 1, slime_large: 5, golem: 3 },
      burstChance: 0.20,
      burstSize: 2,
    },

    // Wave 8
    8: {
      duration: 25,
      spawnInterval: 1800,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 2, slime_large: 5, golem: 3 },
      burstChance: 0.20,
      burstSize: 2,
    },

    // ── UPGRADE 4 ──

    // Wave 9
    9: {
      duration: 25,
      spawnInterval: 1600,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 3, slime_large: 4, golem: 3 },
      burstChance: 0.25,
      burstSize: 2,
    },

    // Wave 10
    10: {
      duration: 30,
      spawnInterval: 1500,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 3, slime_large: 4, golem: 3 },
      burstChance: 0.25,
      burstSize: 2,
    },

    // ── UPGRADE 5 ──

    // Wave 11 — FINAL: slime flood
    11: {
      duration: 35,
      spawnInterval: 900,
      maxAlive: 5,
      minAlive: 3,
      pool: { slime_large: 10 },
      burstChance: 0.35,
      burstSize: 3,
    },

  },

  /* fallback pool */
  enemyPool: {
    ravager:     { fromWave: 1, weight: 5 },
    slime_large: { fromWave: 1, weight: 4 },
    golem:       { fromWave: 3, weight: 3 },
  },

  unlocksAbility: null,

});