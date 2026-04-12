/* ═══════════════════════════════════════
   CONFIG.JS
   All game values in one place.
   Characters and enemies are defined
   in their own files — not here.

   Depends on: nothing
   Used by: everything
   ═══════════════════════════════════════ */

const CONFIG = {

  /* ── PLAYER ─────────────────────────────
     maxHp:            base max HP
     hpBarGreenPct:    above this % → green
     hpBarYellowPct:   above this % → yellow
                       below → red
  ─────────────────────────────────────── */
  player: {
    maxHp:          100,
    hpBarGreenPct:  0.50,
    hpBarYellowPct: 0.25,
  },

  /* ── COMBO ──────────────────────────────
     minKills:           kills before multiplier activates
     multipliers:        multiplier list by combo count
     decayMs:            ms before combo resets
     chargePerKill:      special bar % per normal kill
     chargePerComboKill: special bar % per kill in combo
  ─────────────────────────────────────── */
  combo: {
    minKills:           2,
    multipliers:        [1, 1, 1.5, 2, 2.5, 3],
    decayMs:            3000,
    chargePerKill:      8,
    chargePerComboKill: 14,
  },

  /* ── DIFFICULTY ─────────────────────────
     speedIncreasePerLevel: +% enemy speed per wave
     maxSpeedMult:          speed cap
     killsPerLevelBase:     kills needed at wave 1
     killsPerLevelScaling:  multiplier per wave
  ─────────────────────────────────────── */
  difficulty: {
    killsPerLevelBase:    8,
    killsPerLevelScaling: 1.20,
    speedIncreasePerLevel: 0.10,
    maxSpeedMult:          2.5,
  },

  /* ── BASE ───────────────────────────────
     enemyBaseSpeed: base speed for all enemies (px/tick)
     hitDamagePct:   base player damage as % of maxHp
  ─────────────────────────────────────── */
  base: {
    enemyBaseSpeed: 2.2,
    hitDamagePct:   0.34,
  },

  /* ── BULLET ─────────────────────────────
     firstShotDistPct: crusher fires first shot when
                       distance <= spawnDist * this value
  ─────────────────────────────────────── */
  bullet: {
    firstShotDistPct: 0.75,
  },

  /* ── AUDIO ──────────────────────────────
     enabled: global audio toggle
     volume:  master volume 0.0 → 1.0
  ─────────────────────────────────────── */
  audio: {
    enabled: true,
    volume:  0.4,
  },

  /* ── JUICE ──────────────────────────────
     Visual feedback parameters.
  ─────────────────────────────────────── */
  juice: {
    particles: {
      killCount:      10,
      killCountElite: 18,
      minSize:        3,
      maxSize:        7,
      minSpeed:       1.8,
      maxSpeed:       4.5,
      lifetime:       420,
    },
    hitFlashMs:       110,
    shakeOnDamage:    true,
    shakeOnKillElite: true,
  },

  /* ── DIRECTOR ───────────────────────────
     Controls game pacing via stress meter.
  ─────────────────────────────────────── */
  director: {

    /* stress weights per event */
    stress: {
      gruntAlone:      5,
      gruntExtra:      8,
      onDamage:        20,
      onKill:         -10,
      lowHp50:         10,
      lowHp25:         20,
      decayPerSecond:   3,
    },

    /* stress target per wave 1-10 */
    waveTargets: [
      0,   // index 0 unused
      25,  // wave 1
      30,  // wave 2
      35,  // wave 3
      38,  // wave 4
      42,  // wave 5
      45,  // wave 6
      48,  // wave 7
      52,  // wave 8
      58,  // wave 9
      75,  // wave 10 — BOSS
    ],

    /* wave 11+ formula */
    baseTarget:           30,
    targetIncreasePerWave: 1.5,
    maxTarget:            92,
    bossTargetBonus:      20,

    /* director states */
    tolerance: 15,

    /* spawn intervals in ms */
    spawnIntervalFast:   400,
    spawnIntervalNormal: 900,
    spawnIntervalSlow:   1800,

    /* group sizes */
    groupSizeFast:   3,
    groupSizeNormal: 2,
    groupSizeSlow:   1,

    /* wave progression */
    killsToAdvanceBase:    12,
    killsToAdvanceScaling: 1.18,

    /* max enemies in arena */
    maxEnemiesBase:    4,
    maxEnemiesPerWave: 0.3,
    maxEnemiesCap:     12,

    /* enemy pool per wave — uses registry ids */
    enemyPool: {
      ravager: { fromWave: 1, weight: 6 },
      crusher: { fromWave: 3, weight: 3 },
      golem:   { fromWave: 5, weight: 2 },
    },

  },

};