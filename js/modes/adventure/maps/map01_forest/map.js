MapRegistry.register({

  id:    'map01_forest',
  order: 1,
  name:  'Forest',
  theme: 'forest',
  icon:  '🌲',
  background: 'assets/maps/map01_forest/background_01.png',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {
    11: {
      ravager: { speedMult: 1.2 },
    },
  },

  /* ── WAVE CONFIG ─────────────────────────

     COMBO PATTERNS AVAILABLE:
     single:        1 enemy, 1 direction — bread and butter
     pair_opposite:  1+1 from opposite sides — player turns fast
     pair_adjacent:  1+1 from adjacent sides — player turns 90°
     burst_single:   2 from same direction — one hit kills both
     triple:         1 from 3 directions — pressure moment
     rush:           3 from same direction — satisfying line kill
     surround:       1 from all 4 — panic moment, use special!

     combos weights = probability. Higher = more likely.
     single:8 + pair_opposite:2 = 80% single, 20% pair.

     dirCooldown: ms before same direction can spawn again.
     High = more spread across directions.
     Low = same direction can repeat faster.

     stagger: ms delay between enemies in same combo.
     Only needed as override — each pattern has defaults
     in CONFIG.adventure.comboStagger.

     If 'combos' is missing → old system (burstChance/burstSize).
     Wave 1 has NO combos → tutorial handles spawning directly.
  ─────────────────────────────────────────── */
  waveConfig: {

    // ── Wave 1 — TUTORIAL ──
    // No combos! Tutorial.js handles all spawning.
    // This config is only used as fallback if tutorial is skipped.
    1: {
      duration: 12,
      spawnInterval: 3000,
      maxAlive: 2,
      minAlive: 1,
      pool: { ravager: 7, crusher: 3 },
      burstChance: 0,
      burstSize: 1,
    },

    // ── Wave 2 — First real wave ──
    // Almost all single spawns. Player learns the rhythm.
    // One pair_opposite every now and then to teach "enemies
    // come from multiple sides" without overwhelming.
    2: {
      duration: 15,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 1,
      pool: { ravager: 8, crusher: 2 },
      combos: {
        single: 8,
        pair_opposite: 2,
      },
      dirCooldown: 1200,
    },

    // ── UPGRADE 1 ──

    // ── Wave 3 — Pairs become common ──
    // Player just got first upgrade, feels stronger.
    // More pair_opposite to raise engagement.
    3: {
      duration: 15,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 1,
      pool: { ravager: 7, crusher: 3 },
      combos: {
        single: 6,
        pair_opposite: 3,
        burst_single: 1,
      },
      dirCooldown: 1100,
    },

    // ── Wave 4 — Burst introduction ──
    // First time 2 enemies come from same direction.
    // Player discovers "I can hit both with one attack!"
    // Satisfying moment.
    4: {
      duration: 15,
      spawnInterval: 1900,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 7, crusher: 3 },
      combos: {
        single: 5,
        pair_opposite: 3,
        burst_single: 2,
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 2 ──

    // ── Wave 5 — Adjacent pairs ──
    // New combo type: enemies from 2 sides at 90°.
    // Different feel from opposite — player turns less
    // but enemies converge to same corner area.
    5: {
      duration: 20,
      spawnInterval: 2000,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 7, crusher: 3 },
      combos: {
        single: 4,
        pair_opposite: 3,
        pair_adjacent: 2,
        burst_single: 1,
      },
      dirCooldown: 1000,
    },

    // ── Wave 6 — BREATHER ──
    // Ravager-heavy, fewer crushers.
    // Player just upgraded, feels powerful.
    // Mostly singles and bursts — satisfying kills.
    6: {
      duration: 20,
      spawnInterval: 1800,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 9, crusher: 1 },
      combos: {
        single: 5,
        burst_single: 3,
        pair_opposite: 2,
      },
      dirCooldown: 900,
    },

    // ── UPGRADE 3 ──

    // ── Wave 7 — Crushers return ──
    // More dangerous mix. Crusher bullets
    // force player to parry while handling
    // ravagers from other directions.
    7: {
      duration: 20,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 6, crusher: 4 },
      combos: {
        single: 4,
        pair_opposite: 3,
        pair_adjacent: 2,
        burst_single: 1,
      },
      dirCooldown: 1000,
    },

    // ── Wave 8 — ALL CRUSHER ──
    // Pure bullet hell. Fewer on field but
    // every enemy shoots. Player must parry
    // and manage space carefully.
    // Mostly singles — 2 crushers at once is enough pressure.
    8: {
      duration: 20,
      spawnInterval: 2200,
      maxAlive: 3,
      minAlive: 1,
      pool: { crusher: 10 },
      combos: {
        single: 6,
        pair_opposite: 3,
        pair_adjacent: 1,
      },
      dirCooldown: 1200,
    },

    // ── UPGRADE 4 ──

    // ── Wave 9 — Triple introduction ──
    // First time 3 directions at once.
    // Player has 4 upgrades — can handle it.
    // Rare but intense when it happens.
    9: {
      duration: 20,
      spawnInterval: 1800,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 6, crusher: 4 },
      combos: {
        single: 3,
        pair_opposite: 3,
        burst_single: 2,
        triple: 2,
      },
      dirCooldown: 900,
    },

    // ── Wave 10 — Last stand ──
    // Everything on the table. Longer wave.
    // High pressure but player is strong.
    10: {
      duration: 25,
      spawnInterval: 1600,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 6, crusher: 4 },
      combos: {
        single: 3,
        pair_opposite: 3,
        pair_adjacent: 2,
        burst_single: 2,
        triple: 1,
      },
      dirCooldown: 800,
    },

    // ── UPGRADE 5 ──

    // ── Wave 11 — FINAL WAVE ──
    // Victory lap! Ravager flood.
    // Fast spawns, lots of combos.
    // Player with 5 upgrades destroys everything.
    // First surround — epic moment to end the map.
    11: {
      duration: 25,
      spawnInterval: 1200,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 10 },
      combos: {
        single: 0, stagger: 200,
        pair_opposite: 3, stagger: 300,
        burst_single: 3,stagger: 300,
        rush: 3,stagger: 300,
        surround: 1,stagger: 300
      },
      dirCooldown: 300,
    },

  },

  /* fallback pool — only used if a wave has no waveConfig entry */
  enemyPool: {
    ravager: { fromWave: 1, weight: 8 },
    crusher: { fromWave: 3, weight: 2 },
  },

  unlocksAbility: null,
});