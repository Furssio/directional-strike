MapRegistry.register({

  id:    'map07_clouds',
  order: 7,
  name:  'Clouds',
  theme: 'clouds',
  icon:  '⛈️',
  background: 'assets/maps/map07_clouds/background_01.webp',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  /* ── WAVE CONFIG ─────────────────────────
     Clouds identity: tornado (fast, parryable),
     eagle (2-phase: rush then shoots from opposite),
     thunder_hound (dodges first hit via teleport, 2hp).

     All enemies are FAST. Tornado = parry fodder.
     Eagle = forces awareness of both sides.
     Thunder_hound = punishes mindless attacks.

     Stagger INCREASES as waves progress because
     enemies get faster — stagger compensates so
     the player always has time to react and turn.
  ─────────────────────────────────────────── */
  waveConfig: {

    1: {
      duration: 15,
      spawnInterval: 2200,
      maxAlive: 3,
      minAlive: 1,
      pool: { tornado: 6, eagle: 4 },
      combos: {
        single: 6,
        pair_opposite: 2,
        burst_single: 2,
      },
      dirCooldown: 1100,
    },

    2: {
      duration: 18,
      spawnInterval: 2000,
      maxAlive: 3,
      minAlive: 2,
      pool: { tornado: 6, eagle: 4 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 500 },
        pair_adjacent: { weight: 2, stagger: 450 },
        burst_single: 1,
      },
      dirCooldown: 1100,
    },

    // ── UPGRADE 1 ──

    3: {
      duration: 18,
      spawnInterval: 2000,
      maxAlive: 3,
      minAlive: 1,
      pool: { tornado: 5, thunder_hound: 4, eagle: 1 },
      combos: {
        single: 5,
        pair_opposite: { weight: 3, stagger: 500 },
        burst_single: 2,
      },
      dirCooldown: 1100,
    },

    4: {
      duration: 20,
      spawnInterval: 1900,
      maxAlive: 4,
      minAlive: 2,
      pool: { tornado: 5, thunder_hound: 4, eagle: 1 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 550 },
        pair_adjacent: { weight: 2, stagger: 500 },
        burst_single: 1,
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 2 ──

    5: {
      duration: 22,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { tornado: 3, eagle: 4, thunder_hound: 3 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 550 },
        burst_single: 1,
      },
      dirCooldown: 1000,
    },

    // ── BREATHER ──
    6: {
      duration: 20,
      spawnInterval: 1700,
      maxAlive: 4,
      minAlive: 2,
      pool: { tornado: 10 },
      combos: {
        single: 3,
        burst_single: 5,
        pair_opposite: { weight: 2, stagger: 550 },
      },
      dirCooldown: 900,
    },

    // ── UPGRADE 3 ──

    7: {
      duration: 25,
      spawnInterval: 1700,
      maxAlive: 4,
      minAlive: 2,
      pool: { tornado: 3, eagle: 3, thunder_hound: 4 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 650 },
        pair_adjacent: { weight: 2, stagger: 600 },
        burst_single: 2,
      },
      dirCooldown: 900,
    },

    8: {
      duration: 25,
      spawnInterval: 1600,
      maxAlive: 4,
      minAlive: 2,
      pool: { tornado: 3, eagle: 3, thunder_hound: 4 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 650 },
        burst_single: 2,
        triple: { weight: 2, stagger: 700 },
      },
      dirCooldown: 900,
    },

    // ── UPGRADE 4 ──

    9: {
      duration: 28,
      spawnInterval: 1500,
      maxAlive: 5,
      minAlive: 2,
      pool: { tornado: 3, eagle: 3, thunder_hound: 4 },
      combos: {
        single: 2,
        pair_opposite: { weight: 3, stagger: 700 },
        pair_adjacent: { weight: 2, stagger: 650 },
        burst_single: 2,
        triple: { weight: 2, stagger: 750 },
      },
      dirCooldown: 800,
    },

    10: {
      duration: 28,
      spawnInterval: 1400,
      maxAlive: 5,
      minAlive: 2,
      pool: { tornado: 3, eagle: 3, thunder_hound: 4 },
      combos: {
        single: 2,
        pair_opposite: { weight: 3, stagger: 700 },
        burst_single: 2,
        rush: { weight: 2, stagger: 500 },
        triple: { weight: 1, stagger: 750 },
      },
      dirCooldown: 800,
    },

    // ── UPGRADE 5 ──

    // ── FINAL: Storm ──
    11: {
      duration: 30,
      spawnInterval: 1200,
      maxAlive: 5,
      minAlive: 3,
      pool: { tornado: 8, thunder_hound: 2 },
      combos: {
        pair_opposite: { weight: 3, stagger: 700 },
        burst_single: 3,
        rush: { weight: 3, stagger: 500 },
        surround: { weight: 1, stagger: 800 },
      },
      dirCooldown: 600,
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