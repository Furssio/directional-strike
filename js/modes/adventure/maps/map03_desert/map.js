MapRegistry.register({

  id:    'map03_desert',
  order: 3,
  name:  'Desert',
  theme: 'desert',
  icon:  '🏜️',
  background: 'assets/maps/map03_desert/background_01.webp',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  waveConfig: {

    // ── Wave 1 — Intro ──
    1: {
      duration: 15,
      spawnInterval: 1700,
      maxAlive: 3,
      minAlive: 2,
      pool: { scorpion: 6, crusher: 4 },
      combos: {
        single: 5,
        pair_opposite: 3,
        pair_adjacent: 2,
      },
      dirCooldown: 900,
    },

    // ── Wave 2 — First pairs ──
    2: {
      duration: 15,
      spawnInterval: 1700,
      maxAlive: 3,
      minAlive: 2,
      pool: { scorpion: 4, crusher: 4, tornado: 2 },
      combos: {
        single: 4,
        pair_opposite: 3,
        pair_adjacent: 2,
        triple: 1,
      },
      dirCooldown: 900,
    },

    // ── UPGRADE 1 ──

    // ── Wave 3 — Tornado enters ──
    3: {
      duration: 18,
      spawnInterval: 1700,
      maxAlive: 3,
      minAlive: 2,
      pool: { scorpion: 5, crusher: 3, tornado: 2 },
      combos: {
        single: 4,
        pair_opposite: 3,
        burst_single: 1,
        pair_adjacent: 2,
      },
      dirCooldown: 900,
    },

    // ── Wave 4 — Tornado pressure ──
    4: {
      duration: 20,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 4, crusher: 3, tornado: 3 },
      combos: {
        single: 5,
        pair_opposite: 3,
        burst_single: 2,
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 2 ──

    // ── Wave 5 — Golem enters + stagger ──
    5: {
      duration: 22,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 4, crusher: 2, tornado: 3, golem: 1 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 550 },
        pair_adjacent: { weight: 2, stagger: 500 },
        burst_single:  { weight: 1, stagger: 350 },
      },
      dirCooldown: 1000,
    },

    // ── Wave 6 — BREATHER + stagger ──
    6: {
      duration: 22,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 7, tornado: 3 },
      combos: {
        single: 4,
        burst_single:  { weight: 4, stagger: 350 },
        pair_opposite: { weight: 2, stagger: 550 },
      },
      dirCooldown: 900,
    },

    // ── UPGRADE 3 ──

    // ── Wave 7 — Crusher + tornado hell ──
    7: {
      duration: 22,
      spawnInterval: 2200,
      maxAlive: 3,
      minAlive: 1,
      pool: { crusher: 5, tornado: 5 },
      combos: {
        single: 5,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 550 },
      },
      dirCooldown: 1100,
    },

    // ── Wave 8 — Full mix returns ──
    8: {
      duration: 22,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 3, crusher: 4, tornado: 3 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 650 },
        burst_single:  { weight: 2, stagger: 400 },
        pair_adjacent: { weight: 1, stagger: 600 },
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 4 ──

    // ── Wave 9 — Triple intro ──
    9: {
      duration: 25,
      spawnInterval: 1900,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 3, crusher: 3, tornado: 3, golem: 1 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 600 },
        burst_single:  { weight: 2, stagger: 400 },
        triple:        { weight: 2, stagger: 550 },
      },
      dirCooldown: 1000,
    },

    // ── Wave 10 — Last stand ──
    10: {
      duration: 20,
      spawnInterval: 2100,
      maxAlive: 5,
      minAlive: 2,
      pool: { scorpion: 2, crusher: 5, tornado: 2, golem: 1 },
      combos: {
        single: 2,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 550 },
        burst_single:  { weight: 2, stagger: 400 },
        triple:        { weight: 1, stagger: 550 },
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 5 ──

    // ── Wave 11 — FINAL: Sandstorm ──
    11: {
      duration: 25,
      spawnInterval: 1400,
      maxAlive: 5,
      minAlive: 2,
      pool: { tornado: 5, scorpion: 5 },
      combos: {
        pair_opposite: { weight: 3, stagger: 700 },
        burst_single:  { weight: 3, stagger: 500 },
        rush:          { weight: 2, stagger: 600 },
        surround:      { weight: 1, stagger: 800 },
      },
      dirCooldown: 800,
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