MapRegistry.register({

  id:    'map05_snow',
  order: 5,
  name:  'Snow',
  theme: 'snow',
  icon:  '❄️',
  background: 'assets/maps/map05_snow/background_01.png',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  /* ── WAVE CONFIG ─────────────────────────
     Snow identity: spectral_deer (fade in/out,
     direction changes), wolf (bounces back faster),
     bear (stops in range, charges). All NEW enemies
     the player hasn't seen — big hook moment.

     Rhythm: medium-slow. Deer fading makes them
     unpredictable, wolf bounce adds chaos after
     first hit, bear charges force reaction.
     No ranged enemies = pure melee pressure.

     Difficulty: slightly above Desert.
     Combos a bit more aggressive from wave 5+.
     Player is experienced by now — can handle it.
  ─────────────────────────────────────────── */
  waveConfig: {

    // ── Wave 1 — New enemies intro ──
    // Deer + wolf. Player learns deer fading
    // and wolf bounce mechanic. All singles,
    // let them observe and adapt.
    1: {
      duration: 15,
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
    // Bear stops and charges — totally different
    // from anything before. Pairs start: deer from
    // one side while bear charges from opposite.
    2: {
      duration: 15,
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
    // Player got first upgrade. More wolves
    // in the mix — bouncing adds unpredictability.
    // First burst_single: 2 deer same side,
    // both fading = tricky to track.
    3: {
      duration: 18,
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
    // No deer — pure melee aggression.
    // Bear charges from one side, wolf rushes
    // from opposite. Player must prioritize.
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

    // ── Wave 5 — Full mix, adjacent pairs ──
    // All 4 enemies together for the first time.
    // Adjacent pairs: bear from one side + wolf
    // from 90° = player juggles two mechanics.
    5: {
      duration: 22,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { spectral_deer: 3, wolf: 3, bear: 2, ravager: 2 },
      combos: {
        single: 4,
        pair_opposite: 3,
        pair_adjacent: 2,
        burst_single: 1,
      },
      dirCooldown: 1000,
    },

    // ── Wave 6 — BREATHER ──
    // Ravager + deer flood. No bears, no wolves.
    // Fast kills, satisfying bursts.
    // Player feels the upgrade power.
    6: {
      duration: 22,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 6, spectral_deer: 4 },
      combos: {
        single: 4,
        burst_single: 4,
        pair_opposite: 2,
      },
      dirCooldown: 900,
    },

    // ── UPGRADE 3 ──

    // ── Wave 7 — Wolf heavy ──
    // Lots of wolves bouncing around.
    // Deer mixed in for fading chaos.
    // Bear rare but dangerous when it appears.
    7: {
      duration: 25,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { wolf: 5, spectral_deer: 3, bear: 2 },
      combos: {
        single: 4,
        pair_opposite: 3,
        pair_adjacent: 2,
        burst_single: 1,
      },
      dirCooldown: 1000,
    },

    // ── Wave 8 — Bear + deer ──
    // Bears charge while deer fade in/out.
    // Lower maxAlive because bears clog lanes.
    // Burst_single bears = two charges same side, scary.
    8: {
      duration: 25,
      spawnInterval: 2200,
      maxAlive: 4,
      minAlive: 2,
      pool: { bear: 4, spectral_deer: 4, ravager: 2 },
      combos: {
        single: 4,
        pair_opposite: 3,
        burst_single: 2,
        pair_adjacent: 1,
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 4 ──

    // ── Wave 9 — Triple intro ──
    // 3 directions at once. Full enemy mix.
    // Wolf + bear + deer from 3 sides =
    // pure chaos, player must use special.
    9: {
      duration: 25,
      spawnInterval: 1900,
      maxAlive: 5,
      minAlive: 2,
      pool: { spectral_deer: 3, wolf: 3, bear: 2, ravager: 2 },
      combos: {
        single: 3,
        pair_opposite: 3,
        burst_single: 2,
        triple: 2,
      },
      dirCooldown: 900,
    },

    // ── Wave 10 — Last stand ──
    // Everything cranked. More triples.
    // Wolf bounces + deer fading + bear charges
    // from multiple sides. Intense but fair
    // with 4 upgrades.
    10: {
      duration: 28,
      spawnInterval: 1800,
      maxAlive: 5,
      minAlive: 2,
      pool: { spectral_deer: 3, wolf: 3, bear: 2, ravager: 2 },
      combos: {
        single: 2,
        pair_opposite: 3,
        pair_adjacent: 2,
        burst_single: 2,
        triple: 1,
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 5 ──

    // ── Wave 11 — FINAL: Blizzard ──
    // Wolf + deer flood. Wolves bouncing
    // everywhere, deer fading in and out.
    // Rush = 3 wolves same side = bounce chaos.
    // Surround = panic moment to close the map.
    11: {
      duration: 25,
      spawnInterval: 1500,
      maxAlive: 5,
      minAlive: 2,
      pool: { wolf: 5, spectral_deer: 5 },
      combos: {
        pair_opposite: 3, stagger: 600,
        burst_single: 3,
        rush: 2, 
        surround: 1, stagger: 800,
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