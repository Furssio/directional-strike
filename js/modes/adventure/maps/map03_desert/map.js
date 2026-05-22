MapRegistry.register({

  id:    'map03_desert',
  order: 3,
  name:  'Desert',
  theme: 'desert',
  icon:  '🏜️',
  background: 'assets/maps/map03_desert/background_01.png',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  /* ── WAVE CONFIG ─────────────────────────
     Desert identity: scorpions (underground + poison),
     crushers (bullets), tornados (fast + parryable).
     Golems as rare lane-blockers.

     Scorpions emerge in range = surprise factor.
     Tornados are fast = pair_opposite with tornado
     means player must react FAST to parry.
     Crushers shoot = lanes stay dangerous even
     after killing the immediate threat.

     Rhythm: medium spawn intervals. Scorpions
     don't split like slimes but poison adds
     sustained pressure after each hit.
  ─────────────────────────────────────────── */
  waveConfig: {

    // ── Wave 1 — Intro ──
    // Scorpions + crushers. Player learns scorpion
    // underground behavior and poison mechanic.
    // All singles, gentle start.
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
    // Scorpion from one side + crusher from opposite.
    // Player juggles poison threat + bullet threat.
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
    // Fast + parryable. Comes in singles mostly
    // so player can learn the parry timing.
    // Burst_single: 2 scorpions same side = quick kills.
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
    // More tornados in pool. Pair_opposite with
    // tornado = fast enemy from one side, slow
    // scorpion from other. Player prioritizes.
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

    // ── Wave 5 — Golem enters ──
    // Rare but clogs a lane. While player chips
    // golem, scorpion emerges from another side.
    // Adjacent pairs: golem + scorpion from 90° = nasty.
    5: {
      duration: 22,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 4, crusher: 2, tornado: 3, golem: 1 },
      combos: {
        single: 4, stagger: 400,
        pair_opposite: 3, 
        pair_adjacent: 2, 
        burst_single: 1, 
      },
      dirCooldown: 1000,
    },

    // ── Wave 6 — BREATHER ──
    // Scorpion + tornado only. No crushers, no golems.
    // Tornados are parryable = satisfying.
    // Bursts of scorpions = quick poison kills.
    // Player feels upgraded and powerful.
    6: {
      duration: 22,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 7, tornado: 3 },
      combos: {
        single: 4, stagger: 700,
        burst_single: 4, 
        pair_opposite: 2, 
      },
      dirCooldown: 900,
    },

    // ── UPGRADE 3 ──

    // ── Wave 7 — Crusher + tornado hell ──
    // Bullets flying + fast tornados.
    // No scorpions = different feel, pure ranged chaos.
    // Fewer on field but every enemy is dangerous.
    7: {
      duration: 22,
      spawnInterval: 2200,
      maxAlive: 3,
      minAlive: 1,
      pool: { crusher: 5, tornado: 5 },
      combos: {
        single: 5,
        pair_opposite: 3, 
        pair_adjacent: 2, 
      },
      dirCooldown: 1100,
    },

    // ── Wave 8 — Full mix returns ──
    // Everything together. Scorpion surprise +
    // crusher bullets + tornado speed.
    // More enemies, faster rhythm.
    8: {
      duration: 22,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 3, crusher: 4, tornado: 3 },
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
    // 3 directions at once. Golem returns to
    // clog one lane while scorpion + tornado
    // come from other two. Intense.
    9: {
      duration: 25,
      spawnInterval: 1900,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 3, crusher: 3, tornado: 3, golem: 1 },
      combos: {
        single: 3,
        pair_opposite: 3,
        burst_single: 2,
        triple: 2,
      },
      dirCooldown: 1000,
    },

    // ── Wave 10 — Last stand ──
    // Crusher-heavy. Bullets everywhere.
    // Triple more common. Player must use
    // special wisely to survive.
    10: {
      duration: 20,
      spawnInterval: 2100,
      maxAlive: 5,
      minAlive: 2,
      pool: { scorpion: 2, crusher: 5, tornado: 2, golem: 1 },
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

    // ── Wave 11 — FINAL: Sandstorm ──
    // Tornado + scorpion flood. Fast parryable
    // enemies mixed with poison surprises.
    // Rush = 3 tornados in a line, satisfying parry chain.
    // Surround = panic moment to end the map.
    11: {
      duration: 25,
      spawnInterval: 1400,
      maxAlive: 5,
      minAlive: 2,
      pool: { tornado: 5, scorpion: 5 },
      combos: {
        pair_opposite: 3,
        burst_single: 3,
        rush: 2,
        surround: 1,
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