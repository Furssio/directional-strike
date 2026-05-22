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

  /* ── WAVE CONFIG ─────────────────────────
     Beach identity: crab (underground, spawns 2 small),
     parrot (2 bullets in sequence), scorpion (poison),
     turtle (fast in shell, tanky after first hit).

     Crabs are like slimes — they add bodies on emerge.
     Keep maxAlive lower because crab smalls flood.
     Parrots add ranged pressure without being as
     oppressive as crushers.
     Turtle = rare lane-blocker, 4 hits.

     Rhythm: medium. Crabs create bursts of action
     when they emerge + spawn smalls. Between emerges
     the field feels calmer — natural wave feel.

     Stagger increased in late waves because
     enemies are faster by wave 9-11.
  ─────────────────────────────────────────── */
  waveConfig: {

    // ── Wave 1 — Intro ──
    // Scorpion (player knows from Desert) + parrot (new).
    // Parrot shoots 2 bullets = player learns to dodge
    // sequences. All singles, easy rhythm.
    1: {
      duration: 18,
      spawnInterval: 1900,
      maxAlive: 3,
      minAlive: 2,
      pool: { crab: 6, parrot: 4 },
      combos: {
        single: 4,
        pair_opposite: 3,
        pair_adjacent: 2,
        burst_single: 1,
      },
      dirCooldown: 1000,
    },

    // ── Wave 2 — First pairs ──
    // Scorpion underground from one side,
    // parrot shooting from opposite.
    // Player juggles poison + bullets.
    2: {
      duration: 18,
      spawnInterval: 1900,
      maxAlive: 3,
      minAlive: 2,
      pool: { scorpion: 3, parrot: 4, crab: 3 },
      ombos: {
        single: 4,
        pair_opposite: 3,
        pair_adjacent: 2,
        burst_single: 1,
      },
      dirCooldown: 1200,
    },

    // ── UPGRADE 1 ──

    // ── Wave 3 — Crab enters ──
    // Underground + spawns 2 smalls on emerge.
    // Mostly singles so player can learn the
    // crab mechanic without other pressure.
    3: {
      duration: 15,
      spawnInterval: 2200,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 4, parrot: 2, crab: 4 },
      ombos: {
        single: 4,
        pair_opposite: 3,
        pair_adjacent: 2,
        burst_single: 1,
      },
      dirCooldown: 1100,
    },

    // ── Wave 4 — Crab + parrot pressure ──
    // Crab emerges and floods smalls while
    // parrot shoots from another direction.
    // Burst_single: 2 scorpions same side = quick kills.
    4: {
      duration: 20,
      spawnInterval: 1900,
      maxAlive: 4,
      minAlive: 2,
      pool: {  crab: 6, turtle: 4 },
      ombos: {
        single: 4, 
        pair_opposite: 3, 
        pair_adjacent: 2, 
        burst_single: 1, 
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 2 ──

    // ── Wave 5 — Turtle enters ──
    // Fast in shell, tanky after first hit (4hp).
    // Rare but clogs a lane hard.
    // Adjacent pairs: crab + turtle from 90° = nasty.
    5: {
      duration: 22,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 3, parrot: 3, crab: 3, turtle: 1 },
      combos: {
        single: 4, 
        pair_opposite: 3, 
        pair_adjacent: 2, 
        burst_single: 1, 
      },
      dirCooldown: 1000,
    },

    // ── Wave 6 — BREATHER ──
    // Scorpion + parrot only. No crabs, no turtles.
    // Player knows these enemies well by now.
    // Bursts of scorpions = quick poison kills.
    // Feels easy after upgrade — dopamine.
    6: {
      duration: 22,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 5, parrot: 5 },
      combos: {
        single: 4,
        burst_single: 4,
        pair_opposite: 2,
      },
      dirCooldown: 900,
    },

    // ── UPGRADE 3 ──

    // ── Wave 7 — Crab heavy ──
    // Lots of crabs emerging and spawning smalls.
    // Field fills fast — maxAlive stays at 4
    // because smalls add bodies.
    // Parrot mixed in for ranged chaos.
    7: {
      duration: 25,
      spawnInterval: 2200,
      maxAlive: 5,
      minAlive: 4,
      pool: { crab: 5,  scorpion: 5 },
      combos: {
        single: 5,
        pair_opposite: 3,
        pair_adjacent: 2,
      },
      dirCooldown: 1000,
    },

    // ── Wave 8 — Full mix ──
    // Everything together. Turtle rare but
    // when it shows up player must decide
    // what to focus. Stagger starts increasing
    // because enemies are faster now.
    8: {
      duration: 25,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 3, parrot: 3, crab: 3, turtle: 1 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 450 },
        burst_single: 2,
        pair_adjacent: 1,
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 4 ──

    // ── Wave 9 — Triple intro ──
    // 3 directions at once. Crab + scorpion + parrot
    // from 3 sides. Stagger bumped up because
    // wave speed multiplier is high now.
    9: {
      duration: 25,
      spawnInterval: 1900,
      maxAlive: 5,
      minAlive: 2,
      pool: { scorpion: 3, parrot: 3, crab: 3, turtle: 1 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 450 },
        burst_single: 2,
        triple: { weight: 2, stagger: 500 },
      },
      dirCooldown: 900,
    },

    // ── Wave 10 — Last stand ──
    // Everything cranked. More triples.
    // Stagger generous because speed is high.
    10: {
      duration: 28,
      spawnInterval: 1800,
      maxAlive: 5,
      minAlive: 2,
      pool: { scorpion: 3, parrot: 3, crab: 3, turtle: 1 },
      combos: {
        single: 2,
        pair_opposite: { weight: 3, stagger: 500 },
        pair_adjacent: { weight: 2, stagger: 450 },
        burst_single: 2,
        triple: { weight: 1, stagger: 500 },
      },
      dirCooldown: 800,
    },

    // ── UPGRADE 5 ──

    // ── Wave 11 — FINAL: Crab Tide ──
    // Pure crab flood. Emerge + smalls everywhere.
    // Rush = 3 crabs same side = massive small swarm.
    // Surround = crabs from all 4 = panic.
    // Stagger high because it's chaotic enough.
    11: {
      duration: 30,
      spawnInterval: 1400,
      maxAlive: 5,
      minAlive: 2,
      pool: { crab: 6, parrot: 3, turtle: 1 },
      combos: {
        pair_opposite: { weight: 3, stagger: 500 },
        burst_single: 3,
        rush: { weight: 2, stagger: 400 },
        surround: { weight: 1, stagger: 550 },
      },
      dirCooldown: 600,
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