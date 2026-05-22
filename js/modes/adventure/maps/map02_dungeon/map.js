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

  /* ── WAVE CONFIG ─────────────────────────
     Dungeon identity: slimes that split + tanky golems.
     Slimes create extra bodies on death → maxAlive stays
     lower than Forest to avoid screen flood.
     Golems are slow but 3-hit — they clog lanes.
     Ravagers fill gaps as fast cannon fodder.

     Rhythm: slower spawn intervals than Forest
     because slime splits add "free" enemies.
  ─────────────────────────────────────────── */
  waveConfig: {

    // ── Wave 1 — Intro ──
    // Ravagers + first slimes. Player learns slimes split.
    // All singles, gentle rhythm. No combos needed —
    // slime splitting already adds complexity.
    1: {
      duration: 15,
      spawnInterval: 1400,
      maxAlive: 3,
      minAlive: 2,
      pool: { ravager: 6, slime_large: 4 },
      combos: {
        single: 3,
        pair_opposite: 4, stagger: 300,
        burst_single: 2,stagger: 300,
        triple: 2, stagger: 300,
      },
      dirCooldown: 600,
    },

    // ── Wave 2 — Slimes from both sides ──
    // First pair_opposite: slime + ravager from opposite ends.
    // Player starts juggling split cleanup + new threats.
    2: {
      duration: 15,
      spawnInterval: 1400,
      maxAlive: 3,
      minAlive: 2,
      pool: { ravager: 6, slime_large: 4 },
      combos: {
        single: 2, 
        pair_opposite: 5, stagger: 600,
        burst_single: 3,stagger: 300,
      },
      dirCooldown: 600,
},
    // ── UPGRADE 1 ──

    // ── Wave 3 — Golem enters ──
    // First golem. Slow, tanky, clogs a lane.
    // Mostly singles so player can focus on learning
    // the 3-hit pattern without other pressure.
    3: {
      duration: 20,
      spawnInterval: 1900,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 3, slime_large: 4, golem: 3 },
      combos: {
        single: 6, 
        pair_opposite: 3, stagger: 600,
        burst_single: 1, stagger: 600,
      },
      dirCooldown: 900,
    },

    // ── Wave 4 — Golem + slime pressure ──
    // More golems in pool. Burst_single lets
    // 2 ravagers come from same side — satisfying
    // double kill while golem approaches from other side.
    4: {
      duration: 20,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 4, slime_large: 3, golem: 3 },
      combos: {
        single: 5, 
        pair_opposite: 3, stagger: 600,
        burst_single: 2, stagger: 600,
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 2 ──

    // ── Wave 5 — Adjacent pairs ──
    // Slime from one side + golem from adjacent.
    // Player must decide: kill slime fast (splits!)
    // or chip golem first. Tactical moment.
    5: {
      duration: 20,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 3, slime_large: 4, golem: 3 },
      combos: {
        single: 4, 
        pair_opposite: 3,  stagger: 600,
        pair_adjacent: 2, stagger: 600,
        burst_single: 1, stagger: 600,

      },
      dirCooldown: 1000,
    },

    // ── Wave 6 — BREATHER ──
    // Ravager flood, minimal golems.
    // Player just upgraded — let them feel powerful.
    // Bursts and singles, fast kills, dopamine.
    6: {
      duration: 20,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 8, golem: 2 },
      combos: {
        single: 4, 
        burst_single: 4, stagger: 600,
        pair_opposite: 2, stagger: 600,
      },
      dirCooldown: 900,
    },

    // ── UPGRADE 3 ──

    // ── Wave 7 — Slime swamp ──
    // Heavy slime wave. Screen fills with splits.
    // Lower maxAlive because splits add bodies.
    // Golems mixed in to clog lanes while
    // player deals with slime children.
    7: {
      duration: 20,
      spawnInterval: 2200,
      maxAlive: 4,
      minAlive: 2,
      pool: { slime_large: 6, golem: 3, ravager: 1 },
      combos: {
        single: 5, stagger: 600,
        pair_opposite: 3, stagger: 600,
        pair_adjacent: 2, stagger: 600,
      },
      dirCooldown: 1100,
    },

    // ── Wave 8 — Golem heavy ──
    // More golems, fewer slimes. Lanes get clogged.
    // Player must manage which golem to focus.
    // Burst_single ravagers give breathing room kills.
    8: {
      duration: 20,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 3, slime_large: 3, golem: 4 },
      combos: {
        single: 4, stagger: 400,
        pair_opposite: 3, stagger: 500,
        burst_single: 2, stagger: 700,
        pair_adjacent: 1, stagger: 700,
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 4 ──

    // ── Wave 9 — Triple intro ──
    // First triple: 3 directions at once.
    // Player has 4 upgrades, can handle it.
    // Golem from one side + slime + ravager from others.
    // Intense but fair.
    9: {
      duration: 20,
      spawnInterval: 1900,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 3, slime_large: 4, golem: 3 },
      combos: {
        single: 3, stagger: 600,
        pair_opposite: 3, stagger: 800,
        burst_single: 2, stagger: 500,
        triple: 2, stagger: 700,
      },
      dirCooldown: 900,
    },

    // ── Wave 10 — Last stand ──
    // Everything cranked up. More enemies, faster spawns.
    // Triple more common. Player must use special wisely.
    10: {
      duration: 25,
      spawnInterval: 1800,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 3, slime_large: 4, golem: 3 },
      combos: {
        single: 2, stagger: 600,
        pair_opposite: 3, stagger: 800,
        pair_adjacent: 2, stagger: 900,
        burst_single: 2, stagger: 400,
        triple: 1,
      },
      dirCooldown: 800,
    },

    // ── UPGRADE 5 ──

    // ── Wave 11 — FINAL: Slime flood ──
    // Pure slime chaos. They split everywhere.
    // Rush = 3 slimes same direction, splits create a wall.
    // Surround = slimes from all 4 sides, panic moment.
    // Player with 5 upgrades mows through them.
    // maxAlive stays at 5 because splits add tons more.
    11: {
      duration: 30,
      spawnInterval: 1400,
      maxAlive: 5,
      minAlive: 2,
      pool: { slime_large: 10 },
      combos: {
        pair_opposite: 3, stagger: 800,
        burst_single: 3, stagger: 600,
        rush: 2, stagger: 700,
        surround: 1, stagger: 900,
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