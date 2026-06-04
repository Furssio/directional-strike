MapRegistry.register({

  id:    'map10_sakura',
  order: 10,
  name:  'Sakura',
  theme: 'sakura',
  icon:  '🌸',
  background: 'assets/maps/map10_sakura/background_01.webp',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  /* ── WAVE CONFIG ─────────────────────────
     Sakura identity: kitsune (slow, lunges in range),
     nara_deer (fades, 1 direction change),
     frog (3 parryable jumps then walks),
     oni (4hp, bounces off wall, faster each hit).

     All enemies have TRICKY movement — lunges,
     direction changes, bounces. This map is about
     reading enemy patterns, not raw speed.

     Oni is the star: 4hp tank that gets FASTER
     each time you hit it. Player must commit
     to finishing it or it snowballs.

     Rhythm: deliberate. Enemies are slow-ish but
     unpredictable. Stagger high because player
     needs time to read each enemy's behavior.
     maxAlive stays low — oni alone demands focus.
  ─────────────────────────────────────────── */
  waveConfig: {

    // ── Wave 1 — Intro ──
    // Kitsune (slow, lunges) + nara_deer (fades, changes dir).
    // Both have tricky movement — player learns
    // to watch before attacking.
   1: {
  duration: 15,
  spawnInterval: 1900,
  maxAlive: 3,
  minAlive: 1,
  pool: { kitsune: 4, nara_deer: 4, frog: 1, oni: 1 },
  speedOverrides: {
    kitsune: 1.2,
    nara_deer: 1.1,
    frog: 1.1,
    oni: 1.2,
  },
  combos: {
    single: 6,
    pair_opposite: 2,
    burst_single: 2,
  },
  dirCooldown: 1100,
},

    // ── Wave 2 — Pairs start ──
    // Kitsune from one side, nara_deer opposite.
    // Nara_deer fades in/out — can surprise.
    2: {
  duration: 18,
  spawnInterval: 1800,
  maxAlive: 3,
  minAlive: 2,
  pool: { kitsune: 4, nara_deer: 3, frog: 2, oni: 1 },
  speedOverrides: {
    kitsune: 1.25,
    nara_deer: 1.15,
    frog: 1.15,
    oni: 1.25,
  },
  combos: {
    single: 4,
    pair_opposite: { weight: 3, stagger: 550 },
    pair_adjacent: { weight: 2, stagger: 500 },
    burst_single: 1,
  },
  dirCooldown: 1000,
},

    // ── UPGRADE 1 ──

    // ── Wave 3 — Frog enters ──
    // 3 parryable jumps then walks to center.
    // Player learns parry timing on jumps.
    // Mostly singles to focus on frog mechanic.
   3: {
  duration: 18,
  spawnInterval: 1700,
  maxAlive: 3,
  minAlive: 1,
  pool: { kitsune: 3, nara_deer: 3, frog: 3, oni: 1 },
  speedOverrides: {
    kitsune: 1.3,
    nara_deer: 1.2,
    frog: 1.2,
    oni: 1.3,
  },
  combos: {
    single: 5,
    pair_opposite: { weight: 3, stagger: 550 },
    burst_single: 2,
  },
  dirCooldown: 1000,
},

    // ── Wave 4 — Frog more present ──
    // Frog + kitsune from adjacent sides =
    // frog jumping while kitsune lunges. Tricky.
    4: {
  duration: 20,
  spawnInterval: 1600,
  maxAlive: 4,
  minAlive: 2,
  pool: { kitsune: 3, nara_deer: 3, frog: 3, oni: 1 },
  speedOverrides: {
    kitsune: 1.35,
    nara_deer: 1.25,
    frog: 1.25,
    oni: 1.35,
  },
  combos: {
    single: 4,
    pair_opposite: { weight: 3, stagger: 600 },
    pair_adjacent: { weight: 2, stagger: 600 },
    burst_single: 1,
  },
  dirCooldown: 950,
},

    // ── UPGRADE 2 ──

    // ── Wave 5 — Oni enters ──
    // 4hp, bounces off wall, faster each hit.
    // RARE but demands full attention. Player
    // must commit to finishing it quickly.
    // Keep maxAlive low — oni needs space.
    5: {
      duration: 22,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { kitsune: 3, nara_deer: 3, frog: 3, oni: 1 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 650 },
        pair_adjacent: { weight: 2, stagger: 650 },
        burst_single: 1,
      },
      dirCooldown: 1000,
    },

    // ── Wave 6 — BREATHER ──
    // Kitsune + nara_deer only. No frog, no oni.
    // Player knows these well — feels manageable.
    // Burst_single = 2 kitsune same side, quick lunges.
    6: {
      duration: 20,
      spawnInterval: 1700,
      maxAlive: 4,
      minAlive: 2,
      pool: { kitsune: 5, nara_deer: 5 },
      combos: {
        single: 3,
        burst_single: 5,
        pair_opposite: { weight: 2, stagger: 650 },
      },
      dirCooldown: 900,
    },

    // ── UPGRADE 3 ──

    // ── Wave 7 — Full mix returns ──
    // All 4 back. Oni slightly more common.
    // Stagger climbing — enemies are faster now.
    7: {
      duration: 25,
      spawnInterval: 1650,
      maxAlive: 4,
      minAlive: 2,
      pool: { kitsune: 3, nara_deer: 3, frog: 2, oni: 2 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 700 },
        pair_adjacent: { weight: 2, stagger: 700 },
        burst_single: 2,
      },
      dirCooldown: 900,
    },

    // ── Wave 8 — Triple intro ──
    // 3 directions. Oni + frog + kitsune from
    // 3 sides = every enemy needs different timing.
    // High stagger on triple — fair but intense.
    8: {
      duration: 25,
      spawnInterval: 1550,
      maxAlive: 4,
      minAlive: 2,
      pool: { kitsune: 3, nara_deer: 3, frog: 2, oni: 2 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 750 },
        burst_single: 2,
        triple: { weight: 2, stagger: 800 },
      },
      dirCooldown: 850,
    },

    // ── UPGRADE 4 ──

    // ── Wave 9 — Cranking up ──
    // More triples. Oni weight up — player
    // juggles bouncing tanks from multiple sides.
    // Stagger keeps rising.
    9: {
      duration: 28,
      spawnInterval: 1450,
      maxAlive: 4,
      minAlive: 2,
      pool: { kitsune: 3, nara_deer: 2, frog: 2, oni: 3 },
      combos: {
        single: 2,
        pair_opposite: { weight: 3, stagger: 800 },
        pair_adjacent: { weight: 2, stagger: 750 },
        burst_single: 2,
        triple: { weight: 2, stagger: 850 },
      },
      dirCooldown: 800,
    },

    // ── Wave 10 — Last stand ──
    // Rush = 3 frogs same side = parry chain!
    // Stagger high everywhere. Getting real.
    10: {
      duration: 28,
      spawnInterval: 1350,
      maxAlive: 4,
      minAlive: 2,
      pool: { kitsune: 3, nara_deer: 2, frog: 2, oni: 3 },
      combos: {
        single: 2,
        pair_opposite: { weight: 3, stagger: 800 },
        burst_single: 2,
        rush: { weight: 2, stagger: 600 },
        triple: { weight: 1, stagger: 850 },
      },
      dirCooldown: 800,
    },

    // ── UPGRADE 5 ──

    // ── Wave 11 — FINAL: Oni Rampage ──
    // Oni flood. 4hp tanks bouncing everywhere,
    // getting faster with each hit. Pure chaos
    // but stagger at maximum — always fair.
    // Frog mixed in for parry relief moments.
    11: {
      duration: 30,
      spawnInterval: 1200,
      maxAlive: 4,
      minAlive: 2,
      pool: { oni: 7, frog: 3 },
      combos: {
        pair_opposite: { weight: 3, stagger: 800 },
        burst_single: 3,
        rush: { weight: 2, stagger: 600 },
        surround: { weight: 1, stagger: 900 },
      },
      dirCooldown: 600,
    },

  },

  /* fallback pool */
  enemyPool: {
    kitsune:   { fromWave: 1, weight: 3 },
    nara_deer: { fromWave: 1, weight: 3 },
    frog:      { fromWave: 3, weight: 3 },
    oni:       { fromWave: 5, weight: 1 },
  },

  unlocksAbility: null,

});