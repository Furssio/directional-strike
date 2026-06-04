MapRegistry.register({

  id:    'map02_dungeon',
  order: 2,
  name:  'Dungeon',
  theme: 'dungeon',
  icon:  '🪨',
  background: 'assets/maps/map02_dungeon/background_01.webp',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  waveConfig: {

    // ── Wave 1 — Intro ──
    1: {
      duration: 10,
      spawnInterval: 1400,
      maxAlive: 3,
      minAlive: 2,
      pool: { ravager: 6, slime_large: 4 },
      combos: {
        single: 3,
        pair_opposite: 4,
        burst_single: 2,
        triple: 2,
      },
      speedOverrides: {
    ravager: 1.5,
  },
      dirCooldown: 600,
    },

    // ── Wave 2 — Slimes from both sides ──
    2: {
      duration: 14,
      spawnInterval: 1400,
      maxAlive: 3,
      minAlive: 2,
      pool: { ravager: 6, slime_large: 4 },
      combos: {
        single: 2,
        pair_opposite: 5,
        burst_single: 3,
      },
      speedOverrides: {
    ravager: 1.5,
    slime_large: 1.1,
  },
      dirCooldown: 600,
    },

    // ── UPGRADE 1 ──

    // ── Wave 3 — Golem enters ──
    3: {
      duration: 14,
      spawnInterval: 1900,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 4, slime_large: 4, golem: 2 },
      combos: {
        single: 6,
        pair_opposite: 3,
        burst_single: 1,
      },
      speedOverrides: {
    ravager: 1.5,
    slime_large: 1.2,
    golem: 1.0,
  },
      dirCooldown: 900,
    },

    // ── Wave 4 — Golem + slime pressure ──
    4: {
      duration: 14,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 4, slime_large: 3, golem: 3 },
      combos: {
        single: 5,
        pair_opposite: 3,
        burst_single: 2,
      },
      speedOverrides: {
    golem: 1.3,
  },
      dirCooldown: 1000,
    },

    // ── UPGRADE 2 ──

    // ── Wave 5 — Adjacent pairs + wider stagger ──
    5: {
      duration: 17,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 3, slime_large: 4, golem: 3 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 550 },
        pair_adjacent: { weight: 2, stagger: 500 },
        burst_single:  { weight: 1, stagger: 350 },
      },
      speedOverrides: {
    ravager: 1.6,
    slime_large: 1.4,
  },
      dirCooldown: 1000,
    },

    // ── Wave 6 — BREATHER + stagger ──
    6: {
      duration: 17,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 8, golem: 2 },
      combos: {
        single: 4,
        burst_single:  { weight: 4, stagger: 350 },
        pair_opposite: { weight: 2, stagger: 550 },
      },
      speedOverrides: {
    ravager: 1.6,
    golem: 2.0,
  },
      dirCooldown: 900,
    },

    // ── UPGRADE 3 ──

    // ── Wave 7 — Slime swamp ──
    7: {
      duration: 17,
      spawnInterval: 2200,
      maxAlive: 4,
      minAlive: 2,
      pool: { slime_large: 6, golem: 3, ravager: 1 },
      combos: {
        single: 5,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 550 },
      },
      dirCooldown: 1100,
    },

    // ── Wave 8 — Golem heavy ──
    8: {
      duration: 17,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 3, slime_large: 3, golem: 4 },
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
      duration: 17,
      spawnInterval: 1900,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 3, slime_large: 4, golem: 3 },
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
      duration: 20,
      spawnInterval: 1800,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 3, slime_large: 4, golem: 3 },
      combos: {
        single: 2,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 550 },
        burst_single:  { weight: 2, stagger: 400 },
        triple:        { weight: 1, stagger: 550 },
      },
      dirCooldown: 800,
    },

    // ── UPGRADE 5 ──

    // ── Wave 11 — FINAL: Slime flood ──
    11: {
      duration: 22,
      spawnInterval: 1400,
      maxAlive: 5,
      minAlive: 2,
      pool: { slime_large: 10 },
      combos: {
        pair_opposite: { weight: 3, stagger: 800 },
        burst_single:  { weight: 3, stagger: 600 },
        rush:          { weight: 2, stagger: 700 },
        surround:      { weight: 1, stagger: 900 },
      },
      dirCooldown: 600,
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