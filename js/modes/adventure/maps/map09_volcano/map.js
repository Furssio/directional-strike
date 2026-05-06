MapRegistry.register({

  id:    'map09_volcano',
  order: 9,
  name:  'Volcano',
  theme: 'volcano',
  icon:  '🌋',
  background: 'assets/maps/map09_volcano/background_01.png',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  waveConfig: {

    // Wave 1 — ravager + slime_lava intro
    1: {
      duration: 15,
      spawnInterval: 2800,
      maxAlive: 3,
      minAlive: 1,
      pool: { ravager: 6, slime_lava: 4 },
      burstChance: 0,
      burstSize: 1,
    },

    // Wave 2 — same, tighter
    2: {
      duration: 15,
      spawnInterval: 2400,
      maxAlive: 3,
      minAlive: 2,
      pool: { ravager: 6, slime_lava: 4 },
      burstChance: 0,
      burstSize: 1,
    },

    // ── UPGRADE 1 ──

    // Wave 3 — crusher enters
    3: {
      duration: 18,
      spawnInterval: 2200,
      maxAlive: 3,
      minAlive: 1,
      pool: { ravager: 5, slime_lava: 3, crusher: 2 },
      burstChance: 0.10,
      burstSize: 2,
    },

    // Wave 4 — crusher more present
    4: {
      duration: 20,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 4, slime_lava: 3, crusher: 3 },
      burstChance: 0.15,
      burstSize: 2,
    },

    // ── UPGRADE 2 ──

    // Wave 5 — golem_lava enters, rare
    5: {
      duration: 22,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 4, slime_lava: 3, crusher: 2, golem_lava: 1 },
      burstChance: 0.15,
      burstSize: 2,
    },

    // Wave 6 — golem_lava more present
    6: {
      duration: 25,
      spawnInterval: 1700,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 3, slime_lava: 3, crusher: 2, golem_lava: 2 },
      burstChance: 0.20,
      burstSize: 2,
    },

    // ── UPGRADE 3 ──

    // Wave 7 — all 4, balanced
    7: {
      duration: 25,
      spawnInterval: 1700,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 3, slime_lava: 3, crusher: 2, golem_lava: 2 },
      burstChance: 0.20,
      burstSize: 2,
    },

    // Wave 8 — all 4, more pressure
    8: {
      duration: 28,
      spawnInterval: 1600,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 3, slime_lava: 3, crusher: 2, golem_lava: 2 },
      burstChance: 0.20,
      burstSize: 2,
    },

    // ── UPGRADE 4 ──

    // Wave 9 — max pressure
    9: {
      duration: 28,
      spawnInterval: 1500,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 3, slime_lava: 3, crusher: 2, golem_lava: 2 },
      burstChance: 0.25,
      burstSize: 2,
    },

    // Wave 10 — last stand
    10: {
      duration: 30,
      spawnInterval: 1400,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 3, slime_lava: 3, crusher: 2, golem_lava: 2 },
      burstChance: 0.25,
      burstSize: 2,
    },

    // ── UPGRADE 5 ──

    // Wave 11 — FINAL: golem_lava + slime_lava flood
    11: {
      duration: 35,
      spawnInterval: 900,
      maxAlive: 5,
      minAlive: 3,
      pool: { golem_lava: 5, slime_lava: 5 },
      burstChance: 0.30,
      burstSize: 2,
    },

  },

  /* fallback pool */
  enemyPool: {
    ravager:   { fromWave: 1, weight: 5 },
    slime_lava: { fromWave: 1, weight: 4 },
    crusher:   { fromWave: 3, weight: 3 },
    golem_lava: { fromWave: 5, weight: 2 },
  },

  unlocksAbility: null,

});