MapRegistry.register({

  id:    'map12_moon',
  order: 12,
  name:  'Moon',
  theme: 'moon',
  icon:  '🌙',
  background: 'assets/maps/map12_moon/background_01.webp',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  /* ── WAVE CONFIG ─────────────────────────
     Moon — FINAL MAP. Player is a veteran.
     No teaching needed, start fast and stay fast.

     Enemies: spectral_deer (ghost, 2 dir changes),
     star (fastest, parryable), eagle (2-phase rush+shoot),
     thunder_hound (teleport dodge, 2hp),
     oni (4hp tank, bounces faster each hit).

     All 5 are trick enemies — no filler like ravager.
     Every spawn demands a specific reaction.

     Starts at the tempo where other maps END.
     spawnInterval begins at 1800 instead of 2200.
     Combos from wave 1. Stagger high because
     enemies are fast — always fair, never cheap.
  ─────────────────────────────────────────── */
  waveConfig: {

    // ── Wave 1 — No warm-up ──
    // Spectral_deer + star right away with pairs.
    // Player knows both — jump straight into action.
    1: {
  duration: 15,
  spawnInterval: 1600,
  maxAlive: 3,
  minAlive: 2,
  pool: { spectral_deer: 3, star: 3, eagle: 2, thunder_hound: 1, oni: 1, frog: 1 },
  speedOverrides: {
    spectral_deer: 1.2,
    thunder_hound: 1.7,
    oni: 1.1,
  },
  combos: {
    single: 4,
    pair_opposite: { weight: 3, stagger: 600 },
    burst_single: 3,
  },
  dirCooldown: 950,
},

    // ── Wave 2 — Already pressing ──
    // Adjacent pairs + burst. Tempo already
    // higher than most maps' wave 4.
    2: {
  duration: 18,
  spawnInterval: 1500,
  maxAlive: 3,
  minAlive: 2,
  pool: { spectral_deer: 3, star: 3, eagle: 2, thunder_hound: 1, oni: 1, frog: 1 },
  speedOverrides: {
    spectral_deer: 1.25,
    thunder_hound: 1.75,
    oni: 1.15,
  },
  combos: {
    single: 3,
    pair_opposite: { weight: 3, stagger: 600 },
    pair_adjacent: { weight: 2, stagger: 600 },
    burst_single: 2,
  },
  dirCooldown: 950,
},

    // ── UPGRADE 1 ──

    // ── Wave 3 — Eagle enters ──
    // 2-phase rush + shoot. No easing in —
    // eagle appears alongside star and deer.
    3: {
  duration: 18,
  spawnInterval: 1500,
  maxAlive: 4,
  minAlive: 2,
  pool: { spectral_deer: 2, star: 3, eagle: 2, thunder_hound: 2, oni: 1, frog: 1 },
  speedOverrides: {
    spectral_deer: 1.3,
    thunder_hound: 1.8,
    oni: 1.2,
  },
  combos: {
    single: 3,
    pair_opposite: { weight: 3, stagger: 650 },
    pair_adjacent: { weight: 2, stagger: 650 },
    burst_single: 2,
  },
  dirCooldown: 900,
},

    // ── Wave 4 — Thunder_hound enters ──
    // Teleport dodge + eagle 2-phase = both
    // punish mindless attacking. Player must
    // be precise with every swing.
    4: {
  duration: 20,
  spawnInterval: 1450,
  maxAlive: 4,
  minAlive: 2,
  pool: { spectral_deer: 2, star: 3, eagle: 2, thunder_hound: 2, oni: 1, frog: 1 },
  speedOverrides: {
    spectral_deer: 1.35,
    thunder_hound: 1.85,
    oni: 1.25,
  },
  combos: {
    single: 3,
    pair_opposite: { weight: 3, stagger: 700 },
    pair_adjacent: { weight: 2, stagger: 700 },
    burst_single: 2,
  },
  dirCooldown: 900,
},

    // ── UPGRADE 2 ──

    // ── Wave 5 — Oni enters ──
    // 4hp bouncing tank. Even as rare spawn,
    // oni changes the entire field dynamic.
    // All 5 enemies now in play.
    5: {
  duration: 22,
  spawnInterval: 1400,
  maxAlive: 4,
  minAlive: 2,
  pool: { spectral_deer: 2, star: 2, eagle: 2, thunder_hound: 2, oni: 2, frog: 1 },
  speedOverrides: {
    spectral_deer: 1.4,
    thunder_hound: 1.9,
    oni: 1.3,
  },
  combos: {
    single: 3,
    pair_opposite: { weight: 3, stagger: 750 },
    pair_adjacent: { weight: 2, stagger: 700 },
    burst_single: 2,
  },
  dirCooldown: 900,
},

    // ── Wave 6 — BREATHER ──
    // Star only. Pure speed parry rush.
    // Even the breather is fast — this is Moon.
    // Burst + rush = parry chains for days.
    6: {
  duration: 20,
  spawnInterval: 1400,
  maxAlive: 4,
  minAlive: 2,
  pool: { star: 6, frog: 4 },
  combos: {
    single: 2,
    burst_single: 4,
    rush: { weight: 2, stagger: 500 },
    pair_opposite: { weight: 2, stagger: 650 },
  },
  dirCooldown: 800,
},

    // ── UPGRADE 3 ──

    // ── Wave 7 — Full mix, triple ──
    // All 5 back. Triple already here —
    // other maps waited until wave 8-9.
    7: {
  duration: 25,
  spawnInterval: 1350,
  maxAlive: 4,
  minAlive: 2,
  pool: { spectral_deer: 2, star: 2, eagle: 2, thunder_hound: 2, oni: 2, frog: 1 },
  speedOverrides: {
    spectral_deer: 1.45,
    thunder_hound: 1.95,
    oni: 1.35,
  },
  combos: {
    single: 2,
    pair_opposite: { weight: 3, stagger: 750 },
    burst_single: 2,
    triple: { weight: 2, stagger: 850 },
  },
  dirCooldown: 850,
},

    // ── Wave 8 — Heavy triples ──
    // More triples, adjacent pairs nastier.
    // Oni weight up — bouncing tanks everywhere.
    8: {
  duration: 25,
  spawnInterval: 1300,
  maxAlive: 4,
  minAlive: 2,
  pool: { spectral_deer: 2, star: 2, eagle: 2, thunder_hound: 2, oni: 2, frog: 1 },
  speedOverrides: {
    spectral_deer: 1.5,
    thunder_hound: 2.0,
    oni: 1.4,
  },
  combos: {
    single: 2,
    pair_opposite: { weight: 3, stagger: 800 },
    pair_adjacent: { weight: 2, stagger: 800 },
    burst_single: 2,
    triple: { weight: 2, stagger: 850 },
  },
  dirCooldown: 800,
},

    // ── UPGRADE 4 ──

    // ── Wave 9 — Relentless ──
    // SpawnInterval at 1350. Rush appears.
    // 3 stars same side = parry chain relief
    // between the tricky enemies.
   9: {
  duration: 28,
  spawnInterval: 1250,
  maxAlive: 4,
  minAlive: 2,
  pool: { spectral_deer: 2, star: 2, eagle: 2, thunder_hound: 2, oni: 2, frog: 1 },
  speedOverrides: {
    spectral_deer: 1.55,
    thunder_hound: 2.05,
    oni: 1.45,
  },
  combos: {
    single: 2,
    pair_opposite: { weight: 3, stagger: 850 },
    burst_single: 2,
    rush: { weight: 2, stagger: 650 },
    triple: { weight: 2, stagger: 900 },
  },
  dirCooldown: 800,
},

    // ── Wave 10 — Last stand ──
    // Surround appears. Everything at max.
    // This is the hardest non-final wave
    // in the entire game.
    10: {
  duration: 28,
  spawnInterval: 1200,
  maxAlive: 5,
  minAlive: 2,
  pool: { spectral_deer: 2, star: 2, eagle: 2, thunder_hound: 2, oni: 2, frog: 1 },
  speedOverrides: {
    spectral_deer: 1.6,
    thunder_hound: 2.1,
    oni: 1.5,
  },
  combos: {
    single: 1,
    pair_opposite: { weight: 3, stagger: 850 },
    burst_single: 2,
    rush: { weight: 2, stagger: 650 },
    triple: { weight: 2, stagger: 900 },
    surround: { weight: 1, stagger: 950 },
  },
  dirCooldown: 750,
},

    // ── UPGRADE 5 ──

    // ── Wave 11 — FINAL: Moonlight Siege ──
    // The final wave of the entire game.
    // All 5 enemies, all combos, max intensity.
    // Surround weight up. Stagger at absolute max.
    // If the player survives this, they've beaten
    // Directional Strike.
    11: {
  duration: 30,
  spawnInterval: 1100,
  maxAlive: 5,
  minAlive: 3,
  pool: { spectral_deer: 2, star: 2, eagle: 2, thunder_hound: 2, oni: 2, frog: 1 },
  speedOverrides: {
    spectral_deer: 1.65,
    thunder_hound: 2.1,
    oni: 1.55,
  },
  combos: {
    pair_opposite: { weight: 3, stagger: 850 },
    burst_single: 2,
    rush: { weight: 2, stagger: 650 },
    triple: { weight: 3, stagger: 900 },
    surround: { weight: 2, stagger: 950 },
  },
  dirCooldown: 600,
},

  },

  /* fallback pool */
  enemyPool: {
    spectral_deer:  { fromWave: 1, weight: 3 },
    star:           { fromWave: 1, weight: 3 },
    eagle:          { fromWave: 3, weight: 3 },
    thunder_hound:  { fromWave: 4, weight: 2 },
    oni:            { fromWave: 5, weight: 2 },
  },

  unlocksAbility: null,

});