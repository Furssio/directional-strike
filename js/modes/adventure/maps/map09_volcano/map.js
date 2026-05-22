MapRegistry.register({

  id:    'map09_volcano',
  order: 9,
  name:  'Volcano',
  theme: 'volcano',
  icon:  '🌋',
  background: 'assets/maps/map09_volcano/background_01.webp',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  /* ── WAVE CONFIG ─────────────────────────
     Volcano identity: ravager (fast, 1hp),
     slime_lava (spits lava parryable, splits),
     crusher (slow, shoots bullet),
     golem_lava (splits into 2 lateral smalls).

     Slime_lava + golem_lava both SPLIT — field
     floods with bodies fast. Keep maxAlive tight.
     Crusher adds ranged pressure from distance.
     Ravager is the fast filler between heavies.

     Rhythm: heavy. Lots of tanky enemies that
     split on death. Player must manage lanes
     carefully — killing a golem_lava opens TWO
     new threats from the sides.

     Difficulty bump from Clouds: enemies are
     tankier, splits flood the field, stagger
     compensates as always.
  ─────────────────────────────────────────── */
  waveConfig: {

    // ── Wave 1 — Intro ──
    // Ravager (known from Forest) + slime_lava (new).
    // Slime_lava spits parryable lava + splits.
    // Singles mostly so player learns the split.
    1: {
      duration: 15,
      spawnInterval: 2200,
      maxAlive: 3,
      minAlive: 1,
      pool: { ravager: 6, slime_lava: 4 },
      combos: {
        single: 6,
        pair_opposite: 2,
        burst_single: 2,
      },
      dirCooldown: 1100,
    },

    // ── Wave 2 — Pairs start ──
    // Slime_lava from one side, ravager opposite.
    // Splits start filling the field naturally.
    2: {
      duration: 18,
      spawnInterval: 2000,
      maxAlive: 3,
      minAlive: 2,
      pool: { ravager: 3, slime_lava: 4, crusher: 3 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 500 },
        pair_adjacent: { weight: 2, stagger: 450 },
        burst_single: 1,
      },
      dirCooldown: 1100,
    },

    // ── UPGRADE 1 ──

    // ── Wave 3 — Crusher enters ──
    // Slow but shoots bullets. Player learns to
    // prioritize: kill crusher before it shoots,
    // or deal with slime splits first?
    3: {
      duration: 18,
      spawnInterval: 2000,
      maxAlive: 3,
      minAlive: 1,
      pool: { ravager: 2, slime_lava: 4, crusher: 4 },
      combos: {
        single: 5,
        pair_opposite: { weight: 3, stagger: 550 },
        burst_single: 2,
      },
      dirCooldown: 1100,
    },

    // ── Wave 4 — Crusher more present ──
    // Crusher + slime_lava pairs = bullet dodging
    // while managing splits. Adjacent combos appear.
    4: {
      duration: 20,
      spawnInterval: 1900,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 2, golem_lava: 3, crusher: 5 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 550 },
        burst_single: 1,
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 2 ──

    // ── Wave 5 — Golem_lava enters ──
    // Splits into 2 lateral smalls on death.
    // Rare but impactful — killing one creates
    // 2 new threats from the sides. Player must
    // plan which lane to clear first.
    5: {
      duration: 22,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 2, slime_lava: 3, golem_lava: 4 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 650 },
        pair_adjacent: { weight: 2, stagger: 600 },
        burst_single: 1,
      },
      dirCooldown: 1000,
    },

    // ── Wave 6 — BREATHER ──
    // Ravager only. Fast 1hp enemies, player
    // mows them down after upgrade. Burst_single
    // = 2 ravagers in a row = quick satisfying kills.
    6: {
      duration: 20,
      spawnInterval: 1700,
      maxAlive: 3,
      minAlive: 2,
      pool: {  slime_lava: 3, golem_lava: 4, crusher: 3, },
      combos: {
        single: 3,
        burst_single: 5,
        pair_opposite: { weight: 2, stagger: 600 },
      },
      dirCooldown: 900,
    },

    // ── UPGRADE 3 ──

    // ── Wave 7 — Full mix ──
    // All 4 enemies. Golem_lava weight up.
    // Splits from both slime and golem flood field.
    // Stagger climbing to compensate.
    7: {
      duration: 25,
      spawnInterval: 1700,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 3, slime_lava: 3, crusher: 2, golem_lava: 2 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 700 },
        pair_adjacent: { weight: 2, stagger: 650 },
        burst_single: 2,
      },
      dirCooldown: 900,
    },

    // ── Wave 8 — Triple intro ──
    // 3 directions. Golem_lava + crusher + slime
    // from 3 sides = lane management nightmare.
    // High stagger on triple — fair but scary.
    8: {
      duration: 25,
      spawnInterval: 1600,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 3, slime_lava: 3, crusher: 2, golem_lava: 2 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 700 },
        burst_single: 2,
        triple: { weight: 2, stagger: 750 },
      },
      dirCooldown: 850,
    },

    // ── UPGRADE 4 ──

    // ── Wave 9 — Cranking up ──
    // SpawnInterval drops, stagger rises.
    // More triples. Golem_lava splits
    // make the field chaotic.
    9: {
      duration: 28,
      spawnInterval: 1500,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 3, slime_lava: 3, crusher: 2, golem_lava: 2 },
      combos: {
        single: 2,
        pair_opposite: { weight: 3, stagger: 750 },
        pair_adjacent: { weight: 2, stagger: 700 },
        burst_single: 2,
        triple: { weight: 2, stagger: 800 },
      },
      dirCooldown: 800,
    },

    // ── Wave 10 — Last stand ──
    // Rush appears — 3 ravagers same side = quick kills.
    // Stagger high everywhere. Getting intense.
    10: {
      duration: 28,
      spawnInterval: 1400,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 3, slime_lava: 3, crusher: 2, golem_lava: 2 },
      combos: {
        single: 2,
        pair_opposite: { weight: 3, stagger: 750 },
        burst_single: 2,
        rush: { weight: 2, stagger: 550 },
        triple: { weight: 1, stagger: 800 },
      },
      dirCooldown: 800,
    },

    // ── UPGRADE 5 ──

    // ── Wave 11 — FINAL: Eruption ──
    // Golem_lava + slime_lava flood. Both split
    // on death = bodies EVERYWHERE. Surround =
    // lava from all 4 sides. Stagger at max
    // because splits already flood the field.
    11: {
      duration: 30,
      spawnInterval: 1200,
      maxAlive: 5,
      minAlive: 3,
      pool: { golem_lava: 5, slime_lava: 4, crusher: 1 },
      combos: {
        pair_opposite: { weight: 3, stagger: 750 },
        burst_single: 3,
        rush: { weight: 2, stagger: 550 },
        surround: { weight: 1, stagger: 850 },
      },
      dirCooldown: 600,
    },

  },

  /* fallback pool */
  enemyPool: {
    ravager:    { fromWave: 1, weight: 5 },
    slime_lava: { fromWave: 1, weight: 4 },
    crusher:    { fromWave: 3, weight: 3 },
    golem_lava: { fromWave: 5, weight: 2 },
  },

  unlocksAbility: null,

});