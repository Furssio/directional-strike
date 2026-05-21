/* ═══════════════════════════════════════
   CONFIG.JS
   All game values in one place.
   Characters and enemies are defined
   in their own files — not here.

   Depends on: nothing
   Used by: everything
   ═══════════════════════════════════════ */

const CONFIG = {

  /* ── DEBUG ──────────────────────────────
     debug: enables debug overlay + hotkeys
  ─────────────────────────────────────── */
 debug: true,

  /* ── DEV MODE ───────────────────────────
     devUnlockAll: true = all maps + abilities
     unlocked. Set false to test real progression.
     Toggle with debug overlay (T key).
  ─────────────────────────────────────── */
  devUnlockAll: false,       // unlock all maps + abilities
devUnlockMapsOnly: false,  // unlock maps but NOT abilities (for slot testing)

  /* ── PLAYABLE MAP ORDER ─────────────────
     Progression order for adventure mode.
     Boss maps are excluded — always locked.
     Used by Progress.isMapUnlocked().
  ─────────────────────────────────────── */
  playableOrder: [
    'map01_forest', 'map02_dungeon', 'map03_desert',
    'map05_snow', 'map06_beach', 'map07_clouds',
    'map09_volcano', 'map10_sakura', 'map12_moon',
  ],

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
    minKills:           3,
    decayMs:            3000,
    chargePerKill:      8,
    chargePerComboKill: 14,

    // color tiers — each entry: [minKills, multiplier]
    // combo tick sound plays from minKills onward
    // combo threshold sound plays at each tier change
    tiers: [
      [3,  1.0],   // white
      [6,  1.2],   // blue
      [12, 1.5],   // yellow
      [20, 2.0],   // orange
      [30, 2.5],   // red
      [40, 3.0],   // purple
      [50, 4.0],   // rainbow
    ],
  },
  /* ── ATTACK ─────────────────────────────
     hitCooldownMs:   ms between attacks on a successful hit
     missCooldownMs:  ms penalty when attack hits nothing
                      (longer = punishes random spam)
  ─────────────────────────────────────── */
  attack: {
    hitCooldownMs:  80,
    missCooldownMs: 190,
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
    volume:  parseFloat(localStorage.getItem('ds_volume')) || 1.0,
},
  /* ── JUICE ──────────────────────────────
     Visual feedback parameters.
  ─────────────────────────────────────── */
  juice: {
  particles: {
  killCount:      12,
  killCountElite: 20,
  minSize:        3,
  maxSize:        8,
  minSpeed:       2.5,
  maxSpeed:       6.0,
  friction:       0.92,
  minLifetime:    300,
  maxLifetime:    600,
  flash:          true,
  flashDuration:  60,
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
    /* upgrade choice triggers after these waves */
    upgradeAfterWaves: [2, 4, 6, 8, 10],

    /* spawn pacing — fallback when map doesn't override */
    defaultSpawnInterval: 1800,
    spawnAccelPct:        0.30,
    defaultMaxAlive:      4,
    defaultMinAlive:      2,

    /* input tracker — anti-boredom system */
    inputWindowMs:        3000,
    inputIdleThreshold:   1,
    inputIdleSpawnMs:     600,

    // ... existing adventure config stays ...

  // ── COMBO SYSTEM DEFAULTS ──────────────
  // Default direction cooldown (ms) — how long
  // a direction is blocked after spawning.
  // Can be overridden per wave with dirCooldown.
  defaultDirCooldown: 800,

  // Default stagger per combo pattern (ms).
  // This is the delay between enemies in
  // a multi-enemy combo. Can be overridden
  // per wave with 'stagger' in waveConfig.
  comboStagger: {
    single:        0,
    pair_opposite: 400,
    pair_adjacent: 350,
    burst_single:  250,
    triple:        400,
    rush:          300,
    surround:      500,
  },
  },



/* ── CHALLENGE ─────────────────────────
     Challenge Mode — infinite survival.
     Maps rotate, difficulty scales with caps.
     Two choice types alternate: stat & ability.

     wavePerMap:        waves before map changes
     waveDuration:      base (ms), increment, cap, slowdownAfterWave
     spawn:             base interval/maxAlive/minAlive, scaling, caps
     choiceSchedule:    array of {untilWave, every} — how often choices appear
     choicePattern:     alternating types: 'stat' and 'ability'
     abilityChoiceCount: how many abilities shown per choice (pick 1)
     mapPool:           map ids available for rotation
     dimensionEvent:    every X map changes, chance to trigger dimension map
     difficultyCap:     wave number where scaling stops
  ─────────────────────────────────────── */
  challenge: {

    /* — map rotation — */
    wavesPerMap: 10,

    /* — wave duration curve (ms) —
       Starts at base, grows by increment each wave.
       Growth slows after slowdownAfterWave (increment halves).
       Stops growing at cap. */
    waveDuration: {
      base:               15000,
      incrementPerWave:   800,
      slowdownAfterWave:  20,
      slowdownFactor:     0.5,
      cap:                45000,
    },

    /* — spawn scaling —
       spawnInterval shrinks each wave (faster spawns).
       maxAlive grows each wave (more enemies).
       Everything has a cap so it never breaks. */
    spawn: {
      baseInterval:         1800,
      intervalDecayPerWave: 25,
      intervalCap:          600,

      baseMaxAlive:         4,
      maxAliveGrowPerWave:  0.2,
      maxAliveCap:          12,

      baseMinAlive:         2,
      minAliveGrowPerWave:  0.1,
      minAliveCap:          6,

      baseBurstChance:      0.0,
      burstChanceGrow:      0.02,
      burstChanceCap:       0.35,
      burstSize:            2,
    },

    /* — choice schedule —
       untilWave: this bracket applies up to wave X
       every: choice appears every N waves
       Last entry has no untilWave = applies forever */
    choiceSchedule: [
      { untilWave: 10, every: 2 },
      { untilWave: 20, every: 3 },
      { untilWave: 30, every: 4 },
      { every: 5 },
    ],

    /* — choice types —
       Alternate between these. First choice is ALWAYS 'ability'.
       'stat' = normal upgrade cards (attack, speed, hp, etc.)
       'ability' = 4 random abilities, must pick one (swap current) */
    choiceTypes: ['ability', 'stat'],

    /* how many ability cards shown per ability choice */
    abilityChoiceCount: 4,

    /* — map pool — playable map ids (no boss maps) */
    mapPool: [
      'map01_forest', 'map02_dungeon', 'map03_desert',
      'map05_snow', 'map06_beach', 'map07_clouds',
      'map09_volcano', 'map10_sakura', 'map12_moon',
    ],

    /* — dimension event —
       Special map with mixed enemies from all maps.
       afterMaps: can't appear before this many map changes
       chance: probability each map change (after afterMaps) */
    dimensionEvent: {
      afterMaps: 3,
      chance:    0.2,
    },

    /* — difficulty cap —
       After this wave, spawn params stop scaling.
       Wave duration also stops growing (separate cap above).
       Game continues infinitely at this difficulty. */
    difficultyCap: 60,

    /* — map theme colors —
       Used by map transition effect.
       Each map id maps to [color, colorDark]. */
    mapColors: {
      map01_forest:  ['#44aa66', '#226633'],
      map02_dungeon: ['#8888aa', '#555577'],
      map03_desert:  ['#ddaa55', '#997733'],
      map05_snow:    ['#88ccff', '#4488bb'],
      map06_beach:   ['#55ccbb', '#228877'],
      map07_clouds:  ['#aaccff', '#5577aa'],
      map09_volcano: ['#ff6644', '#aa3311'],
      map10_sakura:  ['#ff88aa', '#aa4466'],
      map12_moon:    ['#aa88ff', '#6644bb'],
      dimension:     ['#ff00ff', '#880088'],
    },
  },

  /* ── ABILITIES UNLOCK SYSTEM ────────────
     Slot machine progression for unlocking
     special abilities.

     defaultAbility:  always unlocked from start
     rarities:        rarity tier per ability
     weights:         slot probability per rarity
     slotAfterMaps:   maps that trigger guaranteed slot
     menuSlots:       rewarded ad slot config
  ─────────────────────────────────────── */

abilities: {
    defaultAbility: 'bullet_time',
    
    rarities: {
        bullet_time:    'epic',
        double_strike:  'rare',
        explosion:      'rare',
        full_heal:      'legendary',
        one_hit:        'rare',
        range_boost:    'rare',
        shield:         'epic',
        slash:          'legendary'
    },
    
    // Weights for slot probability
    weights: {
        rare:      35,
        epic:      20,
        legendary: 10
    },
    
    // Maps that trigger guaranteed slot after completion
    slotAfterMaps: [
        'map01_forest',   // after map 1
        'map03_desert',   // after map 3
        'map06_beach',    // after map 5
        'map09_volcano',  // after map 7
        'map10_sakura'    // after map 8 — legendary guaranteed
    ],
    
    // Menu slot machine (rewarded ad)
    menuSlots: {
        maxVideos:       3,
        spinsPerVideo:   3,
        // Last video guarantees ability if none found in first 2
        guaranteedLastVideo: true
    }
},

};