MapRegistry.register({

  id:    'map01_forest',
  order: 1,
  name:  'Forest',
  theme: 'forest',
  icon:  '🌲',
  background: 'assets/maps/map01_forest/background_01.webp',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,


  waveConfig: {

    // ── Wave 1 — TUTORIAL ──
    // Tutorial.js handles spawning. Fallback only.
    1: {
      duration: 7,
      spawnInterval: 3000,
      maxAlive: 3,
      minAlive: 1,
      pool: { ravager: 10 },
      burstChance: 0,
      burstSize: 1,
    },

    // ── Wave 2 — First real wave ──
    2: {
      duration: 13,
      spawnInterval: 1800,
      maxAlive: 3,
      minAlive: 1,
      pool: { ravager: 8, crusher: 2 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 550 },
        pair_adjacent: { weight: 2, stagger: 500 },
        burst_single:  { weight: 1, stagger: 350 },
      },
      speedOverrides: {
    ravager: 1.5,
  },
      dirCooldown: 1200,
    },

    // ── UPGRADE 1 ──

    // ── Wave 3 — Pairs become common ──
    3: {
      duration: 13,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 7, crusher: 3 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 550 },
        pair_adjacent: { weight: 2, stagger: 500 },
        burst_single:  { weight: 1, stagger: 350 },
      },
      speedOverrides: {
    ravager: 1.5,
  },
      dirCooldown: 1100,
    },

    // ── Wave 4 — Burst introduction ──
    4: {
      duration: 13,
      spawnInterval: 1900,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 7, crusher: 3 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 550 },
        pair_adjacent: { weight: 2, stagger: 500 },
        burst_single:  { weight: 1, stagger: 350 },
      },
      speedOverrides: {
    ravager: 1.5,
  },
      dirCooldown: 1000,
    },

    // ── UPGRADE 2 ──

    // ── Wave 5 — Adjacent pairs + wider stagger ──
    5: {
      duration: 16,
      spawnInterval: 2000,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 7, crusher: 3 },
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
      duration: 16,
      spawnInterval: 1800,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 9, crusher: 1 },
      combos: {
        single: 5,
        burst_single:  { weight: 3, stagger: 350 },
        pair_opposite: { weight: 2, stagger: 550 },
      },
      speedOverrides: {
    ravager: 1.6,
  },
      dirCooldown: 900,
    },

    // ── UPGRADE 3 ──

    // ── Wave 7 — Crushers return ──
    7: {
      duration: 16,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 6, crusher: 4 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 550 },
        burst_single:  { weight: 1, stagger: 400 },
      },
      dirCooldown: 1000,
    },

    // ── Wave 8 — ALL CRUSHER ──
    8: {
      duration: 16,
      spawnInterval: 2200,
      maxAlive: 3,
      minAlive: 2,
      pool: { crusher: 10 },
      combos: {
        single: 6,
        pair_opposite: { weight: 3, stagger: 650 },
        pair_adjacent: { weight: 1, stagger: 600 },
      },
      dirCooldown: 1200,
    },

    // ── UPGRADE 4 ──

    // ── Wave 9 — Triple introduction ──
    9: {
      duration: 16,
      spawnInterval: 1800,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 6, crusher: 4 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 600 },
        burst_single:  { weight: 2, stagger: 400 },
        triple:        { weight: 2, stagger: 550 },
      },
      dirCooldown: 900,
    },

    // ── Wave 10 — Last stand ──
    10: {
      duration: 18,
      spawnInterval: 1600,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 6, crusher: 4 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 650 },
        pair_adjacent: { weight: 2, stagger: 700 },
        burst_single:  { weight: 2, stagger: 400 },
        triple:        { weight: 1, stagger: 550 },
      },
      dirCooldown: 1200,
    },

    // ── UPGRADE 5 ──

    // ── Wave 11 — FINAL WAVE ──
    11: {
      duration: 20,
      spawnInterval: 1200,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 10 },
      combos: {
        pair_opposite: { weight: 3, stagger: 500 },
        burst_single:  { weight: 3, stagger: 350 },
        rush:          { weight: 3, stagger: 400 },
        surround:      { weight: 1, stagger: 550 },
      },
      dirCooldown: 300,
    },

  },

  /* fallback pool */
  enemyPool: {
    ravager: { fromWave: 1, weight: 8 },
    crusher: { fromWave: 3, weight: 2 },
  },

  unlocksAbility: null,
});