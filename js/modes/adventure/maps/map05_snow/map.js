MapRegistry.register({

  id:    'map05_snow',
  order: 5,
  name:  'Snow',
  theme: 'snow',
  icon:  '❄️',
  background: 'assets/maps/map05_snow/background_01.webp',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  waveConfig: {

    // ── Wave 1 — New enemies intro ──
    1: {
      duration: 10,
      spawnInterval: 2600,
      maxAlive: 3,
      minAlive: 1,
      pool: { spectral_deer: 7, wolf: 3 },
      combos: {
        single: 10,
      },
      dirCooldown: 1200,
    },

    // ── Wave 2 — Bear enters ──
    2: {
      duration: 10,
      spawnInterval: 2400,
      maxAlive: 3,
      minAlive: 1,
      pool: { bear: 4, spectral_deer: 4, ravager: 2 },
      combos: {
        single: 7,
        pair_opposite: 3,
      },
      dirCooldown: 1200,
    },

    // ── UPGRADE 1 ──

    // ── Wave 3 — Wolf + deer mix ──
    3: {
      duration: 15,
      spawnInterval: 2200,
      maxAlive: 4,
      minAlive: 1,
      pool: { spectral_deer: 4, wolf: 4, ravager: 2 },
      combos: {
        single: 6,
        pair_opposite: 3,
        burst_single: 1,
      },
      dirCooldown: 1100,
    },

    // ── Wave 4 — Bear + wolf pressure ──
    4: {
      duration: 20,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { bear: 4, wolf: 4, ravager: 2 },
      combos: {
        single: 5,
        pair_opposite: 3,
        burst_single: 2,
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 2 ──

    // ── Wave 5 — Full mix + stagger ──
    5: {
      duration: 22,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { spectral_deer: 3, wolf: 3, bear: 2, ravager: 2 },
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
      pool: { ravager: 6, spectral_deer: 4 },
      combos: {
        single: 4,
        burst_single:  { weight: 4, stagger: 350 },
        pair_opposite: { weight: 2, stagger: 550 },
      },
      dirCooldown: 900,
    },

    // ── UPGRADE 3 ──

    // ── Wave 7 — Wolf heavy ──
    7: {
      duration: 25,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { wolf: 5, spectral_deer: 3, bear: 2 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 550 },
        burst_single:  { weight: 1, stagger: 400 },
      },
      dirCooldown: 1000,
    },

    // ── Wave 8 — Bear + deer ──
    8: {
      duration: 25,
      spawnInterval: 2200,
      maxAlive: 4,
      minAlive: 2,
      pool: { bear: 4, spectral_deer: 4, ravager: 2 },
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
      maxAlive: 5,
      minAlive: 2,
      pool: { spectral_deer: 3, wolf: 3, bear: 2, ravager: 2 },
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
      duration: 28,
      spawnInterval: 1800,
      maxAlive: 5,
      minAlive: 2,
      pool: { spectral_deer: 3, wolf: 3, bear: 2, ravager: 2 },
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

    // ── Wave 11 — FINAL: Blizzard ──
    11: {
      duration: 25,
      spawnInterval: 1500,
      maxAlive: 5,
      minAlive: 2,
      pool: { wolf: 5, spectral_deer: 5 },
      combos: {
        pair_opposite: { weight: 3, stagger: 700 },
        burst_single:  { weight: 3, stagger: 500 },
        rush:          { weight: 2, stagger: 600 },
        surround:      { weight: 1, stagger: 800 },
      },
      dirCooldown: 1000,
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