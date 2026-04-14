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
    killsPerLevelBase:     8,
    killsPerLevelScaling:  1.20,
    speedIncreasePerLevel: 0.06,
    maxSpeedMult:          2.0,
  },

  /* ── BASE ───────────────────────────────
     enemyBaseSpeed: base speed for all enemies (px/tick)
     hitDamagePct:   base player damage as % of maxHp
  ─────────────────────────────────────── */
  base: {
    enemyBaseSpeed: 1.8,
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

  /* ── SPAWN ──────────────────────────────
     dirCooldownMs:   ms before same direction can spawn again
     groupSpawnDelay: ms between each enemy in a group
     spread:          random position offset on spawn (px)
     edgeMargin:      how far outside arena enemies spawn (px)
     hitRadius:       collision radius player vs enemy (px)
     bulletHitRadius: collision radius player vs bullet (px)
  ─────────────────────────────────────── */
  spawn: {
    dirCooldownMs:   2200,
    groupSpawnDelay: 300,
    spread:          60,
    edgeMargin:      30,
    hitRadius:       28,
    bulletHitRadius: 22,
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
      20,  // wave 1  — very easy, 1-2 grunts max
      24,  // wave 2  — still easy
      28,  // wave 3  — first crusher possible but rare
      32,  // wave 4
      36,  // wave 5  — golem enters pool
      40,  // wave 6
      44,  // wave 7
      50,  // wave 8
      58,  // wave 9
      72,  // wave 10 — BOSS
    ],

    /* wave 11+ formula */
    baseTarget:            28,
    targetIncreasePerWave: 1.5,
    maxTarget:             92,
    bossTargetBonus:       20,

    /* director states */
    tolerance: 15,

    /* spawn intervals in ms */
    spawnIntervalFast:   600,
    spawnIntervalNormal: 1200,
    spawnIntervalSlow:   2400,

    /* group sizes */
    groupSizeFast:   2,
    groupSizeNormal: 1,
    groupSizeSlow:   1,

    /* wave progression */
    killsToAdvanceBase:    10,
    killsToAdvanceScaling: 1.18,

    /* max enemies in arena */
    maxEnemiesBase:    3,
    maxEnemiesPerWave: 0.25,
    maxEnemiesCap:     10,

    /* enemy pool per wave — uses registry ids */
    enemyPool: {
      ravager: { fromWave: 1, weight: 9 },
      crusher: { fromWave: 5, weight: 1 },
      golem:   { fromWave: 7, weight: 1 },
    },

  },
/* ── ADVENTURE ──────────────────────────
     Adventure Mode — structured progression
     through themed maps. Each map has its
     own stress target and enemy pool.

     wavesPerMap:   number of waves to complete a map
     stressTarget:  fixed stress target for normal waves (1 to wavesPerMap-1)
                    overridable per map in map.js
  ─────────────────────────────────────── */
  adventure: {
    wavesPerMap:  9,   // for now only 1-9, boss wave added later
    stressTarget: 25,  // default, each map can override
  },
};