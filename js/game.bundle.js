/* === js/scaler.js === */
/* ═══════════════════════════════════════
   SCALER.JS
   Auto-scales #G to fill viewport
   like a browser zoom. Logical coords
   stay at 620px, visuals scale up.
   ═══════════════════════════════════════ */

(function() {
  const G = document.getElementById('G');
  const BASE = 620; // logical size in px

  function rescale() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const isMobileDevice = navigator.maxTouchPoints > 0 && window.matchMedia('(pointer: coarse)').matches;
    const isPortrait = vh > vw;

    let scale;
    if (isMobileDevice && isPortrait) {
      // fill width, shift down ~25% of empty space
      scale = vw / BASE;
      const scaledH = BASE * scale;
      const gap = vh - scaledH;
      const offsetY = gap > 0 ? gap * 0.45 : 0;
      G.style.position = 'fixed';
      G.style.top = offsetY + 'px';
      G.style.left = '0';
      G.style.transformOrigin = 'top left';
    } else if (isMobileDevice) {
      // landscape: fill height, center horizontally
      scale = vh / BASE;
      const offsetX = (vw - BASE * scale) / 2;
      G.style.position = 'fixed';
      G.style.top = '0';
      G.style.left = offsetX + 'px';
      G.style.transformOrigin = 'top left';
    } else {
      // desktop: centered as before
      scale = Math.min(vw / BASE, vh / BASE);
      G.style.position = '';
      G.style.top = '';
      G.style.left = '';
      G.style.transformOrigin = 'center center';
    }

    G.style.transform = 'scale(' + scale + ')';
  }

  rescale();
  window.addEventListener('resize', rescale);
})();

/* === js/config.js === */
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
 debug: false,

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
    chargePerKill:      6,
    chargePerComboKill: 10,

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

  /* ── COMBAT ─────────────────────────────
     freezeDuration: ms enemy stays frozen
  ─────────────────────────────────────── */
  combat: {
    freezeDuration: 2000,
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
    volume: (() => { try { return parseFloat(localStorage.getItem('ds_volume')) || 1.0; } catch(e) { return 1.0; } })(),
},

  /* ── MUSIC ──────────────────────────
     Map music system.
     volume:           independent music volume 0.0 → 1.0
     fadeOutDuration:   ms for end-game/complete fade
     speedIncrement:    playbackRate bump per step
     speedEveryWaves:   increment rate every N waves
     maxSpeed:          playbackRate cap
     menuBaseVol:       menu music base volume (scaled by slider)
     mapTracks:         mapId → track name
     breathTracks:      tracks that use fade-restart instead of seamless loop
     breathPause:       ms of silence between breath loops
  ─────────────────────────────────────── */
  music: {
    volume: (() => { try { const v = parseFloat(localStorage.getItem('ds_music_volume')); return isNaN(v) ? 0.4 : v; } catch(e) { return 0.4; } })(),
    fadeOutDuration: 3000,
    speedIncrement: 0.05,
    speedEveryWaves: 2,
    maxSpeed: 1.35,
    menuBaseVol: 0.4,

    mapTracks: {
      map01_forest:  'forest',
      map03_desert:  'forest',
      map06_beach:   'forest',
      map02_dungeon: 'dungeon',
      map09_volcano: 'dungeon',
      map05_snow:    'snow',
      map07_clouds:  'snow',
      map10_sakura:  'sakura',
      map12_moon:    'moon',
    },

    breathTracks: ['moon'],
    breathPause: 800,
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

  /* ── MAP DIFFICULTY TIERS ─────────────
   Visual difficulty system (Geometry Dash style).
   Each playable map has a tier that controls
   border color, label, and CSS effects.
─────────────────────────────────────── */
mapDifficulty: {
  tiers: {
    easy:   { label: 'EASY',   color: '#4ade80' },
    normal: { label: 'NORMAL', color: '#fbbf24' },
    hard:   { label: 'HARD',   color: '#f97316' },
    insane: { label: 'INSANE', color: '#ef4444' },
    demon:  { label: 'DEMON',  color: '#a855f7' },
  },
  maps: {
    map01_forest:  'easy',
    map02_dungeon: 'easy',
    map03_desert:  'normal',
    map05_snow:    'normal',
    map06_beach:   'hard',
    map07_clouds:  'hard',
    map09_volcano: 'insane',
    map10_sakura:  'insane',
    map12_moon:    'demon',
  },
},


/* ── CHALLENGE ─────────────────────────
   Challenge Mode — infinite survival.
   Combo system + sawtooth difficulty.
   Maps rotate every 10 waves, difficulty
   rises within cycle then drops on change.
   Floor rises each cycle until plateau.
─────────────────────────────────────── */
challenge: {

  wavesPerMap: 10,

  /* wave duration in SECONDS */
  waveDuration: {
    base:              15,
    incrementPerWave:  0,
    slowdownAfterWave: 999,
    slowdownFactor:    1,
    cap:               15,
  },

/* speed scaling every 5 waves (index = step) */
/* step = floor((wave-1) / 5), cap at last entry */
speedSteps: [1.00, 1.10, 1.20, 1.30, 1.40, 1.50],


  /* maps challenge wave position (1-10) to adventure wave number */
  /* per-map tier ranges (adventure wave numbers) */
  mapTierRanges: {
    map01_forest:  { easy: [3, 4], medium: [5, 6], hard: [9, 9] },
    map02_dungeon: { easy: [3, 4], medium: [5, 6], hard: [7, 8] },
    map03_desert:  { easy: [3, 4], medium: [5, 6], hard: [7, 8] },
    map05_snow:    { easy: [3, 4], medium: [5, 7], hard: [7, 8] },
    map06_beach:   { easy: [3, 4], medium: [5, 6], hard: [7, 8] },
    map07_clouds:  { easy: [3, 4], medium: [5, 6], hard: [7, 8] },
    map09_volcano: { easy: [3, 4], medium: [5, 6], hard: [7, 8] },
    map12_moon:    { easy: [2, 3], medium: [4, 5], hard: [6, 6] },
  },

  waveTiers: {
    1: 'easy', 2: 'easy',
    3: 'medium', 4: 'medium', 5: 'medium',
    6: 'hard', 7: 'hard', 8: 'hard',
    9: 'hard', 10: 'hard',
  },

  /* floor scaling per completed cycle (multipliers) */
  floorScaling: {
    spawnIntervalMult: 0,
    dirCooldownMult:   0,
    maxAlivePlus:      0,
},

  /* map rotation */
  mapRotation: {
    easyMaps: [
      'map01_forest', 'map02_dungeon', 'map03_desert', 'map05_snow',
    ],
    mediumMaps: [
      'map06_beach', 'map07_clouds', 'map09_volcano',
    ],
    hardMaps: [
      'map10_sakura', 'map12_moon',
    ],
    allMaps: [
      'map01_forest', 'map02_dungeon', 'map03_desert',
      'map05_snow', 'map06_beach', 'map07_clouds',
      'map09_volcano', 'map10_sakura', 'map12_moon',
    ],
    historySize: 3,
    breatherMap: 'map01_forest',
    breatherChance: 0.10,
  },

  /* dimension wave: always wave 10 of each cycle */
  /* dimension tier scales with wave */
dimensionTiers: [
    { untilWave: 10, tier: 'medium' },
    { untilWave: 20, tier: 'hard' },
    { tier: 'peak' },
],

  /* enemy classes for dimension pool */
  enemyClasses: {
    fodder:   ['ravager', 'star', 'tornado'],
    splitter: ['slime_large', 'slime_lava', 'crab'],
    tank:     ['golem', 'golem_lava', 'turtle', 'oni'],
    ranged:   ['crusher', 'parrot', 'eagle'],
    tricky:   ['wolf', 'bear', 'spectral_deer', 'nara_deer',
               'kitsune', 'thunder_hound', 'scorpion', 'frog'],
  },

  /* choice schedule */
choiceSchedule: [
    { every: 5 },
],

  choiceTypes: ['ability', 'stat'],
  abilityChoiceCount: 4,

  /* map theme colors */
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
        range_boost:    'epic',
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
        maxVideos:       2,
        spinsPerVideo:   1,
        guaranteedLastVideo: true
    }
},

};

/* === js/crazysdk.js === */
/* ═══════════════════════════════════════
   CRAZYSDK.JS
   CrazyGames SDK v3 wrapper.
   Centralizes all SDK calls. Falls back
   gracefully when SDK is unavailable
   (disabled environment or localhost
   without SDK loaded).

   Replaces AdPlaceholder for rewarded ads.
   Also handles: game events, settings,
   happytime, leaderboard score submission.

   Used by: loop.js, slotMachine.js,
            mapSelect.js, input.js
   Depends on: CONFIG, SFX, Music
   ═══════════════════════════════════════ */

const CrazySDKWrapper = (() => {

  /* ── STATE ─────────────────────────── */
  let _initialized = false;
  let _environment = 'disabled'; // 'local' | 'crazygames' | 'disabled'

  /* ── LEADERBOARD ENCRYPTION KEY ─────
     32-byte base64 key for AES-GCM.
     Generate at: https://www.digitalsanctuary.com/aes-key-generator-free
     Set this BEFORE submitting to CrazyGames.
     ──────────────────────────────────── */
 const ENCRYPTION_KEY = 'Rc0CclITzXe0aXddtkXac8ieQ0ELF/kgF7BvaFSIqDM=';

  /* ── SDK AVAILABLE CHECK ───────────── */

  function _sdkAvailable() {
    return _initialized &&
           _environment !== 'disabled' &&
           window.CrazyGames &&
           window.CrazyGames.SDK;
  }

  function _sdk() {
    return window.CrazyGames.SDK;
  }

  /* ── INIT ──────────────────────────── */

  async function init() {
    if (!window.CrazyGames || !window.CrazyGames.SDK) {
      console.log('[CrazySDK] SDK not loaded — running without SDK');
      _environment = 'disabled';
      return;
    }

    try {
      await window.CrazyGames.SDK.init();
      _environment = window.CrazyGames.SDK.environment;
      _initialized = true;
      console.log('[CrazySDK] Initialized — environment:', _environment);

      // respect muteAudio setting
      _applySettings(_sdk().game.settings);
      _sdk().game.addSettingsChangeListener(_applySettings);

    } catch (e) {
      console.warn('[CrazySDK] Init failed:', e);
      _environment = 'disabled';
    }
  }

  /* ── SETTINGS (muteAudio) ──────────── */

  function _applySettings(settings) {
    if (!settings) return;
    if (settings.muteAudio) {
      CONFIG.audio.enabled = false;
      if (typeof Music !== 'undefined') Music.stop();
    }
  }

  /* ── REWARDED ADS ──────────────────── */

  /**
   * Show a rewarded ad.
   * onSuccess: called when ad finishes (give reward)
   * onError:   called when ad fails (no reward)
   *
   * On localhost: shows fake overlay (same as old
   * AdPlaceholder behavior for testing).
   * On CrazyGames: real SDK call.
   * On disabled: calls onError immediately.
   */
  function showRewarded(onSuccess, onError) {
    // mute game audio before ad
    if (typeof SFX !== 'undefined') SFX.pauseAll();
    if (typeof Music !== 'undefined') Music.stop();

    // disabled environment — no ads available
    if (!_sdkAvailable()) {
      if (_environment === 'local') {
        // localhost: simulate ad for testing
        _showFakeAd(onSuccess, onError);
        return;
      }
      // truly disabled — no reward
      _resumeAudio();
      if (onError) onError();
      return;
    }

    // real SDK call
    _sdk().ad.requestAd('rewarded', {
      adStarted: () => {
        // audio already muted above
        console.log('[CrazySDK] Rewarded ad started');
      },
      adFinished: () => {
        console.log('[CrazySDK] Rewarded ad finished');
        _resumeAudio();
        if (onSuccess) onSuccess();
      },
      adError: (error) => {
        console.warn('[CrazySDK] Rewarded ad error:', error);
        _resumeAudio();
        if (onError) onError();
      },
    });
  }

  /* ── FAKE AD (localhost testing) ────── */

  const FAKE_AD_DURATION = 1500;

  function _showFakeAd(onSuccess, onError) {
    const ov = document.createElement('div');
    ov.style.cssText =
      'position:fixed;inset:0;z-index:300;' +
      'background:rgba(0,0,0,0.92);' +
      'display:flex;align-items:center;justify-content:center;' +
      'flex-direction:column;gap:12px;';

    const txt = document.createElement('div');
    txt.style.cssText =
      'font-family:"Press Start 2P",monospace;font-size:10px;' +
      'color:#aaa;letter-spacing:2px;';
    txt.textContent = 'AD PLACEHOLDER';

    const bar = document.createElement('div');
    bar.style.cssText =
      'width:120px;height:4px;background:rgba(255,255,255,0.15);' +
      'border-radius:2px;overflow:hidden;';

    const fill = document.createElement('div');
    fill.style.cssText =
      'width:0%;height:100%;background:#51eefc;' +
      'transition:width ' + FAKE_AD_DURATION + 'ms linear;';

    bar.appendChild(fill);
    ov.appendChild(txt);
    ov.appendChild(bar);
    document.body.appendChild(ov);

    requestAnimationFrame(() => { fill.style.width = '100%'; });

    setTimeout(() => {
      ov.remove();
      _resumeAudio();
      if (onSuccess) onSuccess();
    }, FAKE_AD_DURATION);
  }

  /* ── RESUME AUDIO ──────────────────── */

  function _resumeAudio() {
    if (typeof SFX !== 'undefined') SFX.resumeAll();
  }

  /* ── GAME EVENTS ───────────────────── */

  function gameplayStart() {
    if (!_sdkAvailable()) return;
    try { _sdk().game.gameplayStart(); }
    catch (e) { console.warn('[CrazySDK] gameplayStart error:', e); }
  }

  function gameplayStop() {
    if (!_sdkAvailable()) return;
    try { _sdk().game.gameplayStop(); }
    catch (e) { console.warn('[CrazySDK] gameplayStop error:', e); }
  }

  function loadingStart() {
    if (!_sdkAvailable()) return;
    try { _sdk().game.loadingStart(); }
    catch (e) { console.warn('[CrazySDK] loadingStart error:', e); }
  }

  function loadingStop() {
    if (!_sdkAvailable()) return;
    try { _sdk().game.loadingStop(); }
    catch (e) { console.warn('[CrazySDK] loadingStop error:', e); }
  }

  function happytime() {
    if (!_sdkAvailable()) return;
    try { _sdk().game.happytime(); }
    catch (e) { console.warn('[CrazySDK] happytime error:', e); }
  }

  /* ── LEADERBOARD ───────────────────── */

  /**
   * Encrypt score with AES-GCM for
   * CrazyGames leaderboard anti-cheat.
   */
  async function _encryptScore(score) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const algorithm = { name: 'AES-GCM', iv: iv };

    const keyBytes = new Uint8Array(
      atob(ENCRYPTION_KEY)
        .split('')
        .map(c => c.charCodeAt(0))
    );

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw', keyBytes, algorithm, false, ['encrypt']
    );

    const dataBuffer = new TextEncoder().encode(score.toString());
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      algorithm, cryptoKey, dataBuffer
    );

    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Submit score to CrazyGames leaderboard.
   * Used for challenge mode best wave.
   */
  async function submitScore(score) {
    if (!_sdkAvailable()) {
      console.log('[CrazySDK] submitScore skipped — SDK not available. Score:', score);
      return;
    }

    try {
      const encrypted = await _encryptScore(score);
      _sdk().user.submitScore({
        encryptedScore: encrypted,
        score: score,
      });
      console.log('[CrazySDK] Score submitted:', score);
    } catch (e) {
      console.warn('[CrazySDK] submitScore error:', e);
    }
  }

  /* ── PUBLIC API ────────────────────── */

  return {
    init,
    showRewarded,
    gameplayStart,
    gameplayStop,
    loadingStart,
    loadingStop,
    happytime,
    submitScore,
    getEnvironment() { return _environment; },
    isAvailable()    { return _sdkAvailable(); },
  };

})();

/* === js/core/EnemyRegistry.js === */
/* ═══════════════════════════════════════
   ENEMYREGISTRY.JS
   Central registry for all enemy types.
   Each enemy file calls
   EnemyRegistry.register() to add itself.

   Used by: modes/infinite/spawner.js
   Depends on: nothing
   ═══════════════════════════════════════ */

const EnemyRegistry = (() => {

  const _enemies = {};

  return {

    register(def) {
      if (_enemies[def.id]) {
        console.warn(`EnemyRegistry: "${def.id}" already registered.`);
        return;
      }
      _enemies[def.id] = def;
    },

    get(id) {
      return _enemies[id] || null;
    },

    all() {
      return Object.values(_enemies);
    },

  };

})();

/* === js/core/AbilityRegistry.js === */
/* ═══════════════════════════════════════
   ABILITYREGISTRY.JS
   Central registry for all abilities.
   Each ability file calls
   AbilityRegistry.register() to add itself.

   Used by: player/abilities/*
   Depends on: nothing
   ═══════════════════════════════════════ */

const AbilityRegistry = (() => {

  const _abilities = {};

  return {

    register(def) {
      if (_abilities[def.id]) {
        console.warn(`AbilityRegistry: "${def.id}" already registered.`);
        return;
      }
      _abilities[def.id] = def;
    },

    get(id) {
      return _abilities[id] || null;
    },

    all(filter) {
      const list = Object.values(_abilities);
      return filter ? list.filter(filter) : list;
    },

  };

})();

/* === js/core/WaveRegistry.js === */
/* ═══════════════════════════════════════
   WAVEREGISTRY.JS
   Central registry for wave definitions.
   Each wave registers its own config —
   stress target, enemy pool, special events.

   Used by: modes/infinite/waves.js
   Depends on: nothing
   ═══════════════════════════════════════ */

const WaveRegistry = (() => {

  const _waves = {};

  return {

    register(def) {
      if (_waves[def.wave]) {
        console.warn(`WaveRegistry: wave "${def.wave}" already registered.`);
        return;
      }
      _waves[def.wave] = def;
    },

    get(wave) {
      return _waves[wave] || null;
    },

    all() {
      return Object.values(_waves)
        .sort((a, b) => a.wave - b.wave);
    },

  };

})();

/* === js/enemies/Enemy.js === */
/* ═══════════════════════════════════════
   ENEMY.JS
   Enemy class — state and methods for
   every enemy in the arena.

   Used by: systems/spawn.js, systems/loop.js
   Depends on: config.js
   ═══════════════════════════════════════ */

class Enemy {

  constructor(def, x, y, dir, sMult, arenaW, arenaH) {

    // ── identity ──
    this.def   = def;
    this.name  = def.id;
    this.emoji = def.emoji;
    this.size  = def.size;

    this.isElite = (def.id === 'crusher' || def.id === 'golem');

    // ── hp ──
    this.maxHp = Math.round(CONFIG.player.maxHp * def.hpPct);
    this.hp    = this.maxHp;

    // ── damage ──
    this.damagePct   = def.damagePct;
    this.contactHits = def.contactHits || 1;

    // ── speed ──
    this.baseSpeed = CONFIG.base.enemyBaseSpeed * def.speedMult * sMult;
    this.speed     = this.baseSpeed;

    // ── points ──
    this.points = def.points;

    // ── wobble movement ──
    this.wobble     = def.wobble || null;
    this.wobbleTime = 0;

    // ── bullet state (used by crusher via onTick) ──
    this.hasBullet      = false;
    this.firstShotFired = false;
    this.bulletSpeed    = def.bulletSpeed     || 0;
    this.bulletDamagePct= def.bulletDamagePct || 0;

    const cx = arenaW / 2;
    const cy = arenaH / 2;
    const dx = cx - x;
    const dy = cy - y;
    this.spawnDist     = Math.sqrt(dx * dx + dy * dy);
    this.firstShotDist = this.spawnDist * CONFIG.bullet.firstShotDistPct;

    // ── position and direction ──
    this.x   = x;
    this.y   = y;
    this.dir = dir;

    // ── DOM ──
    this.el     = null;
    this.hpFill = null;
  }

  hpPercent() { return this.hp / this.maxHp; }
  isAlive()   { return this.hp > 0; }

  hit(dmg) {
    this.hp = Math.max(0, this.hp - dmg);
  }

  distToCenter(cx, cy) {
    const dx = cx - this.x;
    const dy = cy - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  setSlowed(on, mult) {
    this.speed = on ? this.baseSpeed * mult : this.baseSpeed;
    if (this.el) this.el.classList.toggle('slowed', on);
  }

  stun(ms) {
    const prevSpeed = this.speed;
    this.speed = 0;
    if (this.el) this.el.classList.add('slowed');

    setTimeout(() => {
      if (this.isAlive()) {
        this.speed = prevSpeed;
        if (this.el) this.el.classList.remove('slowed');
      }
    }, ms);
  }

  flashHit() {
    if (!this.el) return;
    this.el.classList.remove('enemy-hit');
    void this.el.offsetWidth;
    this.el.classList.add('enemy-hit');
    setTimeout(() => {
      if (this.el) this.el.classList.remove('enemy-hit');
    }, CONFIG.juice.hitFlashMs);
  }

  /* ── FREEZE WITH TIMED THAW ── */

  freeze(duration) {
    if (this.frozen) return;
    this.frozen = true;
    this._frozenSpeed = this.speed;
    this.speed = 0;
    if (this.el) this.el.classList.add('frozen');

    // crack shake at 35% and 70% of duration
    const crack1 = Math.round(duration * 0.35);
    const crack2 = Math.round(duration * 0.70);

    this._freezeTimers = [];

    this._freezeTimers.push(setTimeout(() => {
      this._freezeCrack();
    }, crack1));

    this._freezeTimers.push(setTimeout(() => {
      this._freezeCrack();
    }, crack2));

    // thaw at end
    this._freezeTimers.push(setTimeout(() => {
      this._thaw();
    }, duration));
  }

  _freezeCrack() {
    if (!this.el || !this.frozen) return;

    // mini-shake
    this.el.classList.remove('freeze-crack');
    void this.el.offsetWidth;
    this.el.classList.add('freeze-crack');
    setTimeout(() => {
      if (this.el) this.el.classList.remove('freeze-crack');
    }, 300);

    // ice pixel particles
    for (let i = 0; i < 4; i++) {
      const p = document.createElement('div');
      p.className = 'ice-particle';
      const ox = (Math.random() - 0.5) * this.size * 0.8;
      const oy = (Math.random() - 0.5) * this.size * 0.8;
      p.style.left = (this.x + ox) + 'px';
      p.style.top  = (this.y + oy) + 'px';
      arena.appendChild(p);
      setTimeout(() => p.remove(), 500);
    }
  }

  _thaw() {
    if (!this.frozen) return;
    this.frozen = false;
    this._freezeTimers = [];

    if (this.el) {
      this.el.classList.remove('frozen', 'freeze-crack');
    }

    // reset to base speed — loses any custom state (wolf accel, oni boost, etc.)
    this.speed = this.baseSpeed;

    // thaw particles burst
    if (this.el) {
      for (let i = 0; i < 6; i++) {
        const p = document.createElement('div');
        p.className = 'ice-particle ice-particle-burst';
        const ox = (Math.random() - 0.5) * this.size;
        const oy = (Math.random() - 0.5) * this.size;
        p.style.left = (this.x + ox) + 'px';
        p.style.top  = (this.y + oy) + 'px';
        arena.appendChild(p);
        setTimeout(() => p.remove(), 600);
      }
    }
  }

  clearFreeze() {
    // cleanup when enemy dies while frozen
    if (this._freezeTimers) {
      this._freezeTimers.forEach(t => clearTimeout(t));
      this._freezeTimers = [];
    }
    this.frozen = false;
  }

}

/* === js/enemies/Bullet.js === */
/* ═══════════════════════════════════════
   BULLET.JS
   Bullet class — projectile fired by
   Crusher toward the player.

   Used by: systems/spawn.js, systems/loop.js
   Depends on: nothing
   ═══════════════════════════════════════ */

class Bullet {

  constructor(x, y, vx, vy, dmgPct, bulletType) {
    this.x          = x;
    this.y          = y;
    this.vx         = vx;
    this.vy         = vy;
    this.vxBase     = vx;
    this.vyBase     = vy;
    this.damagePct  = dmgPct;
    this.bulletType = bulletType || null;
    this.el         = null;
    this.sprite     = 'assets/enemies/bullet_rock/idle.png';
  }

}

/* === js/enemies/ravager.js === */
/* ═══════════════════════════════════════
   RAVAGER.JS
   Fast enemy — 1 hit to kill.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'ravager',
  emoji:     '👹',
  sprite:        'assets/enemies/ravager/idle.png',
  spriteFrames:  12,
  spriteFrameW:  72,
  spriteFrameH:  72,
  spriteSpeed:   1.2,
  size:          72,
  hpPct:     0.30,
  damagePct: 0.34,
  speedMult: 1.3,
  points:    899,
  hitSound:  'flesh',
  shoots:    false,
  deathColors: ['#cc3333', '#ff5544', '#881111'],
  calcStress(distToCenter) {
    return 0;
  },
});

/* === js/enemies/crusher.js === */
/* ═══════════════════════════════════════
   CRUSHER.JS
   Slow enemy — shoots bullets.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:              'crusher',
  emoji:           '👾',
 sprite:        'assets/enemies/crusher/idle.png',
  spriteFrames:  12,
  spriteFrameW:  92,
  spriteFrameH:  92,
  spriteSpeed:   1.0,
  size:          92,
  hpPct:           0.65,
  damagePct:       0.34,
  speedMult:       0.60,
  points:          1659,
  shoots:          true,
  shootInterval:   2000,
  hitSound:  'flesh',
  bulletDamagePct: 0.20,
  bulletSpeed:     4.5,
  deathColors: ['#7766aa', '#554488', '#9988cc'],
  calcStress(distToCenter) {
    return 25;
  },
  onTick(e, cx, cy) {
    if (e.hasBullet) return;
    const curDist = e.distToCenter(cx, cy);
    if (!e.firstShotFired && curDist <= e.firstShotDist) {
      e.firstShotFired = true;
      e.hasBullet = true;
      spawnBullet(e);
    }
  },
});

/* === js/enemies/golem.js === */
/* ═══════════════════════════════════════
   GOLEM.JS
   Very slow, very tanky — 3 hits to kill.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'golem',
  emoji:     '🗿',
  sprite:        'assets/enemies/golem/idle.png',
  spriteFrames:  12,
  spriteFrameW:  104,
  spriteFrameH:  104,
  spriteSpeed:   0.8,
  size:          104,
  hpPct:     1.50,
  speedMult: 0.47, 
  damagePct: 0.40,
  points:    2500,
  hitSound:  'rock',
  shoots:    false,
  deathColors: ['#888888', '#666666', '#aaaaaa', '#555555'],
  calcStress(distToCenter) {
  if (distToCenter <= 80)  return 40;
  if (distToCenter <= 160) return 30;
  return 20;
},
});

/* === js/enemies/slimes.js === */
/* ═══════════════════════════════════════
   SLIMES.JS
   Slime enemy — 2 phases (large/medium).
   Large: 2 hit → dies → spawns 2 Medium
   Medium: 1 hit → dies → gone
   Total hits to clear a Large: 4.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:          'slime_large',
  emoji:       '🟢',
  sprite:        'assets/enemies/slime/idle.png',
  spriteFrames:  12,
  spriteFrameW:  96,
  spriteFrameH:  96,
  spriteSpeed:   0.7,
  size:          96,
  hpPct:       0.80,
  damagePct:   0.30,
  contactHits: 1,
  speedMult:   0.68,
  points:      855,
  hitSound:  'slime',
  shoots:      false,
  deathColors: ['#44cc55', '#22aa33', '#88ff77'],
  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 28;
    if (distToCenter <= 160) return 20;
    return 14;
  },
  onDeath(parent) {
    const childDef = EnemyRegistry.get('slime_medium');
    if (!childDef) return;

    const { w, h } = getArenaSize();
    const perpX = (parent.dir === 'up' || parent.dir === 'down') ? 1 : 0;
    const perpY = (parent.dir === 'left' || parent.dir === 'right') ? 1 : 0;
    const offset = 18;

    for (let i = 0; i < 2; i++) {
      if (!running) return;

      const sign = i === 0 ? -1 : 1;
      const sx   = parent.x + perpX * offset * sign;
      const sy   = parent.y + perpY * offset * sign;

      const child = new Enemy(childDef, sx, sy, parent.dir, 1, w, h);

     if (player.specialActive && player.ability.onEnemySpawn) player.ability.onEnemySpawn(child);

      const el = document.createElement('div');
      el.className        = 'enemy';
      el.style.width      = child.size + 'px';
      el.style.height     = child.size + 'px';
      el.style.left       = sx + 'px';
      el.style.top        = sy + 'px';
     el.style.backgroundImage = `url(${childDef.sprite})`;
      el.style.imageRendering  = 'pixelated';

      if (childDef.spriteFrames && childDef.spriteFrames > 1) {
        const fw = childDef.spriteFrameW || child.size;
        const fh = childDef.spriteFrameH || child.size;
        const frames = childDef.spriteFrames;
        const scale = child.size / fh;
        const scaledW = Math.round(fw * frames * scale);
        el.style.backgroundSize = `${scaledW}px ${child.size}px`;
        el.style.backgroundRepeat = 'no-repeat';
        const dur = childDef.spriteSpeed || 0.8;
        const animName = `eIdle_${childDef.id}_${child.size}`;
        if (!document.getElementById('anim-' + animName)) {
          const s = document.createElement('style');
          s.id = 'anim-' + animName;
          s.textContent = `@keyframes ${animName}{from{background-position-x:0}to{background-position-x:-${scaledW}px}}`;
          document.head.appendChild(s);
        }
        el.style.animation = `${animName} ${dur}s steps(${frames}) infinite`;
      } else {
        el.style.backgroundSize = 'cover';
      }

      el.style.transform = 'translate(-50%,-50%)';

      const hpWrap = document.createElement('div');
      hpWrap.className = 'enemy-hp-wrap';
      const hpFill = document.createElement('div');
      hpFill.className   = 'enemy-hp-fill';
      hpFill.style.width = '100%';
      hpWrap.appendChild(hpFill);
      el.appendChild(hpWrap);

      arena.appendChild(el);
      child.el     = el;
      child.hpFill = hpFill;
      enemies.push(child);
    }
  },
});

EnemyRegistry.register({
  id:          'slime_medium',
  emoji:       '🟢',
  sprite:        'assets/enemies/slime/idle.png',
  spriteFrames:  12,
  spriteFrameW:  96,
  spriteFrameH:  96,
  spriteSpeed:   0.7,
  size:          48,
  hpPct:       0.45,
  damagePct:   0.18,
  contactHits: 1,
  speedMult:   0.42,
  points:      300,
  hitSound:  'slime',
  shoots:      false,
  deathColors: ['#44cc55', '#22aa33', '#88ff77'],
  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 12;
    if (distToCenter <= 160) return 6;
    return 2;
  },
});

/* === js/enemies/tornado.js === */
/* ═══════════════════════════════════════
   TORNADO.JS
   Fast parryable enemy — no hp bar.
   1 hit to kill. Rushes straight to center.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'tornado',
 sprite:        'assets/enemies/tornado/idle.png',
  spriteFrames:  12,
  spriteFrameW:  88,
  spriteFrameH:  88,
  spriteSpeed:   0.6,
  size:          88,
  hpPct:     0.01,
  damagePct: 0.28,
  speedMult: 1.6,
  points:    400,
  shoots:    false,
  noHpBar:   true,
  parryable: true,
  deathColors: ['#aabbcc', '#88aacc', '#ccddee'],
  calcStress(distToCenter) {
    if (distToCenter <= 120) return 18;
    return 8;
  },
});

/* === js/enemies/scorpion.js === */
EnemyRegistry.register({
  id:        'scorpion',
  sprite:    'assets/enemies/scorpion/idle.png',
  size:      32,
  hpPct:     0.30,
  damagePct: 0.15,
  speedMult: 1.00,
  points:    799,
  hitSound:  'flesh',
  shoots:    false,
  noHpBar:   true,
  deathColors: ['#554433', '#776644', '#998855'],

  // while underground: not visible, not hittable
  underground:      true,
  undergroundSpeed:  1.2,   // multiplier while underground (slow)

  onContact(player) {
    // poison: 5% hp per second for 3 seconds
    if (!player.poisonEffects) player.poisonEffects = [];
    player.poisonEffects.push({ ticksLeft: 3, timer: 0 });
  },

  onTick(e, cx, cy, attackRange) {
    const dx   = e.x - cx;
    const dy   = e.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (e.underground && dist <= attackRange) {
      // emerge — become visible, hittable, full speed
      e.underground = false;
      e.speed = e.baseSpeed;
      if (e.el) {
        e.el.style.opacity = '1';
        e.el.style.pointerEvents = 'auto';
      }
    }

    // sand particles while underground
    if (e.underground && e.el) {
      e._particleTimer = (e._particleTimer || 0) + 16 * player.speedMultiplier;
      if (e._particleTimer >= 80 / player.speedMultiplier) {
        e._particleTimer = 0;
        spawnSandParticle(e.x, e.y);
      }
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 12;
    if (distToCenter <= 160) return 6;
    return 2;
  },
});

/* === js/enemies/bear.js === */
/* ═══════════════════════════════════════
   BEAR.JS
   Slow tanky enemy — stops in range and
   charges a devastating attack every 2s.
   4 hits to kill.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'bear',
  sprite:    'assets/enemies/bear/idle.png',
  spriteFrames:  12,
  spriteFrameW:  100,
  spriteFrameH:  100,
  spriteSpeed:   1.0,
  size:          100,
  hpPct:     1.50,
  damagePct: 0.50,
  speedMult: 0.75,
  points:    4538,
  hitSound:  'flesh',
  shoots:    false,
  deathColors: ['#885533', '#aa7744', '#664422'],

  /* --- Strike particle burst --- */
  _spawnStrikeParticles(e) {
    const arena = document.getElementById('G');
    if (!arena) return;
    const count = 8;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'bear-particle';
      // random direction spread
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
      const dist  = 30 + Math.random() * 35;
      p.style.left = e.x + 'px';
      p.style.top  = e.y + 'px';
      p.style.setProperty('--bpx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--bpy', Math.sin(angle) * dist + 'px');
      arena.appendChild(p);
      setTimeout(() => p.remove(), 400);
    }
  },

  onTick(e, cx, cy, attackRange) {
    const dx   = e.x - cx;
    const dy   = e.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= attackRange * 0.70) {
      // stop moving once in range
      e.speed = 0;

      // init charge timer on first arrival
      if (e._chargeTimer === undefined) {
        e._chargeTimer = 2000;
        if (e.el) e.el.classList.add('bear-charging');
      }

      e._chargeTimer -= 16 * player.speedMultiplier;

      // critical phase — last 500ms
      if (e._chargeTimer <= 500 && e.el && !e.el.classList.contains('bear-charge-critical')) {
        e.el.classList.add('bear-charge-critical');
      }

      if (e._chargeTimer <= 0) {
        // strike visual
        if (e.el) {
          e.el.classList.remove('bear-charging', 'bear-charge-critical');
          e.el.classList.add('bear-strike');
          setTimeout(() => {
            if (e.el) {
              e.el.classList.remove('bear-strike');
              // restart charge cycle
              e.el.classList.add('bear-charging');
            }
          }, 300);
        }

        // particle burst
        this._spawnStrikeParticles(e);

        // attack — damage exceeds max hp
        player.takeDamage(e.damagePct);
        updateHpBar();
        SFX.damage();
        ActiveDirector.onDamage();
        triggerShake();

        flashEl.style.opacity = '1';
        setTimeout(() => flashEl.style.opacity = '0', 200);

        if (!player.isAlive()) { endGame(); return; }

        // reset timer for next attack
        e._chargeTimer = 2000;
      }
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 10;
    if (distToCenter <= 160) return 5;
    return 2;
  },
});

/* === js/enemies/spectralDeer.js === */
/* ═══════════════════════════════════════
   SPECTRALDEER.JS
   Ghostly enemy — fades in and out while
   approaching. Switches direction twice
   when opacity hits 0. Always hittable.
   1 hit to kill.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'spectral_deer',
  sprite:    'assets/enemies/spectral_deer/idle.png',
  spriteFrames:  12,
  spriteFrameW:  100,
  spriteFrameH:  100,
  spriteSpeed:   1.0,
  size:          100,
  hpPct:     0.30,
  damagePct: 0.25,
  speedMult: 0.85,
  points:    2015,
  hitSound:  'ethereal',
  shoots:    false,
  noHpBar:   true,
  customOpacity: true,
  deathColors: ['#aabbff', '#8899dd', '#ccddff'],

  onTick(e, cx, cy, attackRange) {
    // init fade state
   if (e._fadePhase === undefined) {
      e._fadePhase   = 1.0;
      e._fadeDir     = 0;     // don't fade yet
      e._switchCount = 0;
      e._switched    = false;
      e._initCooldown = 800;  // ms before first flicker
    }

    if (e._initCooldown > 0) {
      e._initCooldown -= 16 * player.speedMultiplier;
      if (e.el) e.el.style.opacity = '1';
      return;
    }

    if (e._fadeDir === 0) e._fadeDir = -1;

    const fadeSpeed = 0.0018;
    const speedRatio = e.speed / (CONFIG.base.enemyBaseSpeed * 1.00); // 1.00 = base speedMult
    e._fadePhase += e._fadeDir * fadeSpeed * 16 * player.speedMultiplier * Math.max(1, speedRatio);

    // clamp
    if (e._fadePhase <= 0) {
      e._fadePhase = 0;

      // switch line when hitting 0 (max 2 times)
      if (!e._switched && e._switchCount < 1) {
        e._switched = true;
        e._switchCount++;

        const dx   = e.x - cx;
        const dy   = e.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const dirs = ['up', 'down', 'left', 'right'].filter(d => d !== e.dir);
        const newDir = dirs[Math.floor(Math.random() * dirs.length)];

        if (newDir === 'up' || newDir === 'down') {
          e.x = cx;
          e.y = newDir === 'up' ? cy - dist : cy + dist;
        } else {
          e.y = cy;
          e.x = newDir === 'left' ? cx - dist : cx + dist;
        }

        e.dir = newDir;
        const rotMap = { down: 0, left: 90, up: 180, right: 270 };
        if (e.el) e.el.style.transform = `translate(-50%,-50%) rotate(${rotMap[newDir]}deg)`;
      }

      // start fading back in
      e._fadeDir = 1;
    }

    if (e._fadePhase >= 1) {
      e._fadePhase = 1;
      // after fully visible, start fading out again (if switches left)
      if (e._switchCount < 1) {
        e._fadeDir   = -1;
        e._switched  = false;
      }
    }

    if (e.el) e.el.style.opacity = e._fadePhase + '';
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 6;
    if (distToCenter <= 160) return 3;
    return 1;
  },
});

/* === js/enemies/wolf.js === */
/* ═══════════════════════════════════════
   WOLF.JS
   Fast predator — rushes to range, when
   hit leaps back outside range, then
   lunges again even faster. 2 hits.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'wolf',
  sprite:    'assets/enemies/wolf/idle.png',
  spriteFrames:  12,
  spriteFrameW:  84,
  spriteFrameH:  84,
  spriteSpeed:   1.0,
  size:          84,
  hpPct:     0.65,
  damagePct: 0.30,
  speedMult: 1.10,
  points:    2234,
  hitSound:  'flesh',
  shoots:    false,
  deathColors: ['#777777', '#999999', '#555555'],

  /* --- Wind burst at position, spreading in a direction --- */
  _spawnWind(x, y, dirX, dirY) {
    const arena = document.getElementById('G');
    if (!arena) return;
    const count = 7;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'wolf-wind';
      // spread along leap direction with some randomness
      const spread = (Math.random() - 0.5) * 1.2;
      const baseAngle = Math.atan2(dirY, dirX);
      const angle = baseAngle + spread;
      const dist = 20 + Math.random() * 40;
      p.style.left = x + 'px';
      p.style.top  = y + 'px';
      p.style.setProperty('--wx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--wy', Math.sin(angle) * dist + 'px');
      arena.appendChild(p);
      setTimeout(() => p.remove(), 400);
    }
  },

  /* --- Dash lines trailing behind lunge --- */
  _spawnDash(x, y, dirX, dirY) {
    const arena = document.getElementById('G');
    if (!arena) return;
    const count = 5;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'wolf-dash';
      // lines trail behind (opposite of movement dir)
      const offset = (Math.random() - 0.5) * 30;
      const trailDist = 15 + Math.random() * 25;
      p.style.left = (x + offset * dirY) + 'px';
      p.style.top  = (y + offset * -dirX) + 'px';
      p.style.setProperty('--dx', (-dirX * trailDist) + 'px');
      p.style.setProperty('--dy', (-dirY * trailDist) + 'px');
      // rotate to match movement direction
      const angle = Math.atan2(dirY, dirX) * (180 / Math.PI);
      p.style.transform = `rotate(${angle}deg)`;
      arena.appendChild(p);
      setTimeout(() => p.remove(), 350);
    }
  },

  onTick(e, cx, cy, attackRange) {
    if (e._wolfState === undefined) {
      e._wolfState = 'approach';
    }

    if (e._wolfState === 'waiting') {
      e.speed = 0;
      e._waitTimer -= 16 * player.speedMultiplier;
      if (e._waitTimer <= 0) {
        e._wolfState = 'lunge';
        e.speed = e.baseSpeed * 2.5;

        // dash FX on lunge start
        const dx = cx - e.x;
        const dy = cy - e.y;
        const d  = Math.sqrt(dx * dx + dy * dy) || 1;
        this._spawnDash(e.x, e.y, dx / d, dy / d);
      }
      return;
    }
  },

  onHit(e) {
    if (e._wolfState !== 'approach') return;

    // save old position for FX
    const oldX = e.x;
    const oldY = e.y;

    // instant leap back outside range
    const { w, h } = getArenaSize();
    const cx = w / 2;
    const cy = h / 2;
    const dx = e.x - cx;
    const dy = e.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const arenaSize   = Math.min(w, h);
      const attackRange = player.getAttackRange(arenaSize);
      const jumpDist    = attackRange * 1.6;

      e.x = cx + (dx / dist) * jumpDist;
      e.y = cy + (dy / dist) * jumpDist;

      if (e.el) {
        e.el.style.left = e.x + 'px';
        e.el.style.top  = e.y + 'px';
      }

      // wind FX at old position, blowing in leap direction
      const leapDx = e.x - oldX;
      const leapDy = e.y - oldY;
      const leapD  = Math.sqrt(leapDx * leapDx + leapDy * leapDy) || 1;
      this._spawnWind(oldX, oldY, leapDx / leapD, leapDy / leapD);
    }

    e._wolfState = 'waiting';
    e._waitTimer = 500;
    e.speed = 0;
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 12;
    if (distToCenter <= 160) return 6;
    return 2;
  },
});

/* === js/enemies/parrot.js === */
/* ═══════════════════════════════════════
   PARROT.JS
   Ranged enemy — like crusher but 1 hit,
   fires 2 rocks in sequence.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:              'parrot',
  sprite:          'assets/enemies/parrot/idle.png',
  spriteFrames:  8,
  spriteFrameW:  72,
  spriteFrameH:  72,
  spriteSpeed:   1.0,
  size:          72,
  hpPct:           0.40,
  damagePct:       0.20,
  speedMult:       0.70,
  points:          2217,
  hitSound:  'flesh',
  shoots:          false,
  bulletDamagePct: 0.15,
  bulletSpeed:     4.0,
  noHpBar:         true,
  deathColors: ['#33cc44', '#ff4444', '#3388ff'],
  bulletType: 'bullet-coconut',

  onTick(e, cx, cy) {
    if (e._shotsFired === undefined) {
      e._shotsFired = 0;
      e._shotDelay  = 0;
    }

    const curDist = e.distToCenter(cx, cy);

    // first shot at threshold distance
    if (!e.firstShotFired && curDist <= e.firstShotDist) {
      e.firstShotFired = true;
      e._shotsFired = 1;
      spawnBullet(e);
      e._shotDelay = 600; // ms before second shot
    }

    // second shot after delay
    if (e._shotsFired === 1 && e._shotDelay > 0) {
      e._shotDelay -= 16 * player.speedMultiplier;
      if (e._shotDelay <= 0) {
        e._shotsFired = 2;
        spawnBullet(e);
      }
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 120) return 20;
    return 8;
  },
});

/* === js/enemies/crab.js === */
/* ═══════════════════════════════════════
   CRAB.JS
   Underground enemy — travels hidden,
   when it reaches attack range it dies
   and spawns 2 small crabs side by side.
   Uses onDeath (same pattern as slime).
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'crab',
  sprite:    'assets/enemies/crab/idle.png',
  size:      41,
  hpPct:     0.01,
  damagePct: 0.18,
  speedMult: 1.4,
  points:    0,
  hitSound:  'shell',
  shoots:    false,
  noHpBar:   true,
  underground:     true,
  undergroundSpeed: 1.3,
  customOpacity:   true,
deathColors: ['#cc5533', '#ff7744', '#993322'],
  onTick(e, cx, cy, attackRange) {
    const dx   = e.x - cx;
    const dy   = e.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // sand particles while underground
    if (e.underground && e.el) {
      e._particleTimer = (e._particleTimer || 0) + 16 * player.speedMultiplier;
      if (e._particleTimer >= 80) {
        e._particleTimer = 0;
        spawnSandParticle(e.x, e.y);
      }
    }

    // emerge when in range — force kill to trigger onDeath
    if (e.underground && dist <= attackRange) {
      e.underground = false;
      e.hp = 0;
      if (e.el) e.el.remove();
      // onDeath will be called by the _noKill cleanup in loop.js
      e._emerged = true;
    }
  },

  onDeath(parent) {
    const childDef = EnemyRegistry.get('crab_small');
    if (!childDef) return;

    const { w, h } = getArenaSize();
    const perpX = (parent.dir === 'up' || parent.dir === 'down') ? 1 : 0;
    const perpY = (parent.dir === 'left' || parent.dir === 'right') ? 1 : 0;
    const offset = 20;

    for (let i = 0; i < 2; i++) {
      const sign = i === 0 ? -1 : 1;
      const sx = parent.x + perpX * offset * sign;
      const sy = parent.y + perpY * offset * sign;

      const child = new Enemy(childDef, sx, sy, parent.dir, 1, w, h);
      child.speed = child.baseSpeed;

      if (player.specialActive && player.ability.onEnemySpawn) player.ability.onEnemySpawn(child);

      const el = document.createElement('div');
      el.className        = 'enemy';
      el.style.width      = child.size + 'px';
      el.style.height     = child.size + 'px';
      el.style.left       = sx + 'px';
      el.style.top        = sy + 'px';
      el.style.backgroundImage = `url(${childDef.sprite})`;
      el.style.backgroundSize  = 'cover';
      el.style.imageRendering  = 'pixelated';

      const rotMap = { down: 0, left: 90, up: 180, right: 270 };
      el.style.transform = `translate(-50%,-50%) rotate(${rotMap[parent.dir]}deg)`;

      arena.appendChild(el);
      child.el     = el;
      child.hpFill = null;
      enemies.push(child);
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 15;
    if (distToCenter <= 160) return 8;
    return 3;
  },
});

EnemyRegistry.register({
  id:        'crab_small',
  sprite:    'assets/enemies/crab/idle.png',
  size:      29,
  hpPct:     0.30,
  damagePct: 0.15,
  speedMult: 1.2,
  points:    347,
  hitSound:  'shell',
  shoots:    false,
  noHpBar:   true,
  deathColors: ['#cc5533', '#ff7744', '#993322'],

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 10;
    return 4;
  },
});

/* === js/enemies/turtle.js === */
/* ═══════════════════════════════════════
   TURTLE.JS
   Shell rush — fast in shell toward center.
   When hit, exits shell and becomes very
   slow. 4 hits total.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'turtle',
  sprite:    'assets/enemies/turtle/shell.png',
  size:      66,
  hpPct:     2.10,
  damagePct: 0.30,
  speedMult: 1.8,
  points:    3553,
  hitSound:  'shell',
  shoots:    false,
  deathColors: ['#448844', '#669944', '#336633', '#88aa66'],

  /* --- Shell fragment burst --- */
  _spawnShellPieces(e) {
    const arena = document.getElementById('G');
    if (!arena) return;
    const count = 10;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'turtle-shell-piece';
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
      const dist  = 25 + Math.random() * 40;
      const rot   = (Math.random() - 0.5) * 360;
      p.style.left = e.x + 'px';
      p.style.top  = e.y + 'px';
      p.style.setProperty('--sx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--sy', Math.sin(angle) * dist + 'px');
      p.style.setProperty('--sr', rot + 'deg');
      arena.appendChild(p);
      setTimeout(() => p.remove(), 500);
    }
  },

  onHit(e) {
    if (e._exposed) return;
    e._exposed = true;
    e.speed = e.baseSpeed * 0.15;

    // shell crack FX
    this._spawnShellPieces(e);

    if (e.el) {
      // flash + shake
      e.el.classList.add('turtle-crack');
      setTimeout(() => {
        if (e.el) {
          e.el.classList.remove('turtle-crack');
          // change sprite to exposed
          e.el.style.backgroundImage = "url('assets/enemies/turtle/exposed.png')";
          // wobble when exposed
          e.el.classList.add('turtle-exposed');
          setTimeout(() => {
            if (e.el) e.el.classList.remove('turtle-exposed');
          }, 500);
        }
      }, 300);
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 25;
    if (distToCenter <= 160) return 15;
    return 8;
  },
});

/* === js/enemies/eagle.js === */
/* ═══════════════════════════════════════
   EAGLE.JS
   Fast flyer — rushes toward center.
   When hit, vanishes and reappears from
   the opposite side as a shooter (like
   crusher). 2 hits total.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'eagle',
  sprite:    'assets/enemies/eagle/idle.png',
  size:      72,
  hpPct:     0.80,
  damagePct: 0.25,
  speedMult: 1.9,
  points:    2810,
  hitSound:  'flesh',
  shoots:    false,
  bulletDamagePct: 0.30,
  bulletSpeed:     4.0,
  rotateToDirection: true,
  deathColors: ['#dddddd', '#aaaaaa', '#776633'],
   bulletType: 'bullet-dark',

  /* --- Wind burst at vanish position --- */
  _spawnWind(x, y, dirX, dirY) {
    const arena = document.getElementById('G');
    if (!arena) return;
    const count = 12;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'eagle-wind';
      const spread = (Math.random() - 0.5) * 1.4;
      const baseAngle = Math.atan2(dirY, dirX);
      const angle = baseAngle + spread;
      const dist = 30 + Math.random() * 60;
      p.style.left = x + 'px';
      p.style.top  = y + 'px';
      p.style.setProperty('--wx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--wy', Math.sin(angle) * dist + 'px');
      arena.appendChild(p);
      setTimeout(() => p.remove(), 450);
    }
  },

  onHit(e) {
    if (e._phase2) return;
    e._phase2 = true;

    // save old position for FX
    const oldX = e.x;
    const oldY = e.y;

    // vanish and reappear from opposite side
    const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
    const newDir = opposites[e.dir];

    const { w, h } = getArenaSize();
    const cx = w / 2;
    const cy = h / 2;
    const m  = CONFIG.spawn.edgeMargin;

    if (newDir === 'up')    { e.x = cx; e.y = -m; }
    if (newDir === 'down')  { e.x = cx; e.y = h + m; }
    if (newDir === 'left')  { e.x = -m; e.y = cy; }
    if (newDir === 'right') { e.x = w + m; e.y = cy; }

    e.dir = newDir;
    e.speed = e.baseSpeed * 0.50;
    e.firstShotFired = false;
    e.hasBullet = false;

    // wind FX at old position (vanish effect)
    const dx = e.x - oldX;
    const dy = e.y - oldY;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    this._spawnWind(oldX, oldY, dx / dist, dy / dist);

    // recalc first shot distance from new position
    const sdx = cx - e.x;
    const sdy = cy - e.y;
    e.spawnDist     = Math.sqrt(sdx * sdx + sdy * sdy);
    e.firstShotDist = e.spawnDist * CONFIG.bullet.firstShotDistPct;

    // phase 2: change sprite + remove rotation
    if (e.el) {
      e.el.style.left = e.x + 'px';
      e.el.style.top  = e.y + 'px';
      e.el.style.backgroundImage = 'url(assets/enemies/eagle/idle2.png)';
      e.el.style.transform = 'translate(-50%,-50%)';
    }
  },

  onTick(e, cx, cy) {
    if (!e._phase2) return;

    // phase 2: shoot like crusher
    if (e.hasBullet) return;
    const curDist = e.distToCenter(cx, cy);
    if (!e.firstShotFired && curDist <= e.firstShotDist) {
      e.firstShotFired = true;
      e.hasBullet = true;
      spawnBullet(e);
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 22;
    if (distToCenter <= 160) return 12;
    return 5;
  },
});

/* === js/enemies/thunderHound.js === */
/* ═══════════════════════════════════════
   THUNDERHOUND.JS
   Fast enemy — dodges first hit by
   teleporting to its right side, outside
   range. Second hit kills it.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'thunder_hound',
  sprite:    'assets/enemies/thunder_hound/idle.png',
  spriteFrames:  12,
  spriteFrameW:  120,
  spriteFrameH:  120,
  spriteSpeed:   1.2,
  size:          120,
  hpPct:     2.50,
  damagePct: 0.28,
  speedMult: 1.6,
  points:    2222,
  hitSound:  'ethereal',
  shoots:    false,
  deathColors: ['#4488ff', '#2255cc', '#aaddff'],

  /* --- Lightning burst at position --- */
  _spawnBolts(x, y) {
    const arena = document.getElementById('G');
    if (!arena) return;
    const count = 6;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'thound-bolt';
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.6;
      const dist  = 25 + Math.random() * 35;
      p.style.left = x + 'px';
      p.style.top  = y + 'px';
      p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
      arena.appendChild(p);
      setTimeout(() => p.remove(), 350);
    }
  },

  /* --- Zap cross at position --- */
  _spawnZap(x, y) {
    const arena = document.getElementById('G');
    if (!arena) return;
    const z = document.createElement('div');
    z.className = 'thound-zap';
    z.style.left = x + 'px';
    z.style.top  = y + 'px';
    arena.appendChild(z);
    setTimeout(() => z.remove(), 250);
  },

  onHit(e) {
    if (e._dodged) {
      if (e.hpFill) e.hpFill.style.width = '0%';
      // second hit — force kill
      e.hp = 0;
      return;
    }

    e._dodged = true;

    // undo damage — dodge
    e.hp = e.maxHp;
    if (e.hpFill) e.hpFill.style.width = '100%';

    // save old position for FX
    const oldX = e.x;
    const oldY = e.y;

    const rightOf = { up: 'left', left: 'down', down: 'right', right: 'up' };
    const newDir = rightOf[e.dir];

    const { w, h } = getArenaSize();
    const cx = w / 2;
    const cy = h / 2;
    const arenaSize   = Math.min(w, h);
    const attackRange = player.getAttackRange(arenaSize);
    const placeDist   = attackRange * 1.6;

    if (newDir === 'up')    { e.x = cx; e.y = cy - placeDist; }
    if (newDir === 'down')  { e.x = cx; e.y = cy + placeDist; }
    if (newDir === 'left')  { e.x = cx - placeDist; e.y = cy; }
    if (newDir === 'right') { e.x = cx + placeDist; e.y = cy; }

    e.dir = newDir;
    e.speed = e.baseSpeed * 1.2;

    const rotMap = { down: 0, left: 90, up: 180, right: 270 };
    if (e.el) {
      e.el.style.left = e.x + 'px';
      e.el.style.top  = e.y + 'px';
      e.el.style.transform = `translate(-50%,-50%) rotate(${rotMap[newDir]}deg)`;

      // flash on hound
      e.el.classList.add('thound-flash');
      setTimeout(() => {
        if (e.el) e.el.classList.remove('thound-flash');
      }, 350);
    }

    // lightning FX at old and new positions
    this._spawnBolts(oldX, oldY);
    this._spawnZap(oldX, oldY);
    this._spawnBolts(e.x, e.y);
    this._spawnZap(e.x, e.y);
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 20;
    if (distToCenter <= 160) return 10;
    return 4;
  },
});

/* === js/enemies/slimeLava.js === */
/* ═══════════════════════════════════════
   SLIMELAVA.JS
   Lava slime — slow, spits lava (parryable).
   2 hits, then splits into 2 small lava
   slimes (1 hit each, no spit).
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'slime_lava',
  sprite:    'assets/enemies/slime_lava/idle.png',
  size:      66,
  hpPct:     0.80,
  damagePct: 0.30,
  speedMult: 0.48,
  points:    799,
  hitSound:  'slime',
  shoots:    false,
  wobble:    { frequency: 1.8, amplitude: 18 },
  deathColors: ['#ff6622', '#ffaa33', '#cc3300'],

  onTick(e, cx, cy) {
    if (e._hasSpit) return;

    const curDist = e.distToCenter(cx, cy);
    if (!e._firstSpitFired && curDist <= e.spawnDist * CONFIG.bullet.firstShotDistPct) {
      e._firstSpitFired = true;
      e._hasSpit = true;
      _spawnLavaSpit(e);
    }
  },

  onDeath(parent) {
    const childDef = EnemyRegistry.get('slime_lava_small');
    if (!childDef) return;

    const { w, h } = getArenaSize();

    for (let i = 0; i < 2; i++) {
      setTimeout(() => {
        if (!running) return;

        const angle  = (i / 2) * Math.PI * 2;
        const radius = 22 + Math.random() * 12;
        const ox     = Math.cos(angle) * radius;
        const oy     = Math.sin(angle) * radius;

        const child = new Enemy(childDef, parent.x + ox, parent.y + oy, parent.dir, 1, w, h);

        if (player.specialActive && player.ability.onEnemySpawn) player.ability.onEnemySpawn(child);

        const el = document.createElement('div');
        el.className        = 'enemy';
        el.style.width      = child.size + 'px';
        el.style.height     = child.size + 'px';
        el.style.left       = (parent.x + ox) + 'px';
        el.style.top        = (parent.y + oy) + 'px';
        el.style.backgroundImage = `url(${childDef.sprite})`;
        el.style.backgroundSize  = 'cover';
        el.style.imageRendering  = 'pixelated';

        const rotMap = { down: 0, left: 90, up: 180, right: 270 };
        el.style.transform = `translate(-50%,-50%) rotate(${rotMap[parent.dir]}deg)`;

        const hpWrap = document.createElement('div');
        hpWrap.className = 'enemy-hp-wrap';
        const hpFill = document.createElement('div');
        hpFill.className   = 'enemy-hp-fill';
        hpFill.style.width = '100%';
        hpWrap.appendChild(hpFill);
        el.appendChild(hpWrap);

        arena.appendChild(el);
        child.el     = el;
        child.hpFill = hpFill;
        enemies.push(child);
      }, i * 80);
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 28;
    if (distToCenter <= 160) return 20;
    return 14;
  },
});

EnemyRegistry.register({
  id:        'slime_lava_small',
  sprite:    'assets/enemies/slime_lava/idle.png',
  size:      45,
  hpPct:     0.45,
  damagePct: 0.18,
  speedMult: 0.42,
  points:    3,
  hitSound:  'slime',
  shoots:    false,
  wobble:    { frequency: 2.8, amplitude: 10 },
  deathColors: ['#ff6622', '#ffaa33', '#cc3300'],

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 12;
    if (distToCenter <= 160) return 6;
    return 2;
  },
});

/* ── LAVA SPIT (parryable projectile) ── */
function _spawnLavaSpit(enemy) {
  const { w, h } = getArenaSize();
  const cx = w / 2;
  const cy = h / 2;

  const dx   = cx - enemy.x;
  const dy   = cy - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;

  const spitDef = {
    id:        '_lava_spit',
    sprite: 'assets/enemies/bullet_lava/idle.png',
    size:      32,
    hpPct:     0.01,
    damagePct: 0.20,
    speedMult: 2.5,
    points:    500,
    shoots:    false,
    noHpBar:   true,
    parryable: true,
    calcStress() { return 0; },
  };

  const spit = new Enemy(spitDef, enemy.x, enemy.y, enemy.dir, 1, w, h);
  spit.speed = CONFIG.base.enemyBaseSpeed * 2.5;

  const el = document.createElement('div');
  el.className        = 'enemy';
  el.style.width      = spit.size + 'px';
  el.style.height     = spit.size + 'px';
  el.style.left       = enemy.x + 'px';
  el.style.top        = enemy.y + 'px';
  el.style.backgroundImage = `url(${spitDef.sprite})`;
  el.style.backgroundSize  = 'cover';
  el.style.imageRendering  = 'pixelated';
  el.style.transform  = 'translate(-50%,-50%)';
  el.classList.add('bullet-lava');

  arena.appendChild(el);
  spit.el    = el;
  spit.hpFill = null;
  enemies.push(spit);

  setTimeout(() => { if (enemy.isAlive()) enemy._hasSpit = false; }, 3000);

  SFX.bullet();
}

/* === js/enemies/golemLava.js === */
/* ═══════════════════════════════════════
   GOLEMLAVA.JS
   Lava golem — 2 hits, when killed splits
   into 2 small golems on the side lines.
   Each small golem is 1 hit.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'golem_lava',
  sprite:    'assets/enemies/golem_lava/idle.png',
  spriteFrames:  12,
  spriteFrameW:  112,
  spriteFrameH:  112,
  spriteSpeed:   1.0,
  size:          112,
  hpPct:     0.65,
  damagePct: 0.34,
  speedMult: 0.44,
  points:    1476,
  hitSound:  'rock',
  shoots:    false,
   deathColors: ['#ff4400', '#cc6633', '#884422', '#ffaa33'],

  onDeath(parent) {
    const childDef = EnemyRegistry.get('golem_lava_small');
    if (!childDef) return;

    const { w, h } = getArenaSize();
    const cx = w / 2;
    const cy = h / 2;
    const dx = parent.x - cx;
    const dy = parent.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const sideDirs = {
      up:    ['left', 'right'],
      down:  ['left', 'right'],
      left:  ['up',   'down'],
      right: ['up',   'down'],
    };
    const splits = sideDirs[parent.dir] || ['left', 'right'];

    for (let i = 0; i < 2; i++) {
      setTimeout(() => {
        if (!running) return;

        const newDir = splits[i];
        let sx, sy;
        if (newDir === 'up')    { sx = cx; sy = cy - dist; }
        if (newDir === 'down')  { sx = cx; sy = cy + dist; }
        if (newDir === 'left')  { sx = cx - dist; sy = cy; }
        if (newDir === 'right') { sx = cx + dist; sy = cy; }

        const child = new Enemy(childDef, sx, sy, newDir, 1, w, h);

       if (player.specialActive && player.ability.onEnemySpawn) player.ability.onEnemySpawn(child);

        const el = document.createElement('div');
        el.className        = 'enemy';
        el.style.width      = child.size + 'px';
        el.style.height     = child.size + 'px';
        el.style.left       = sx + 'px';
        el.style.top        = sy + 'px';
        el.style.backgroundImage = `url(${childDef.sprite})`;
        el.style.backgroundSize  = 'cover';
        el.style.imageRendering  = 'pixelated';

        const rotMap = { down: 0, left: 90, up: 180, right: 270 };
        el.style.transform = `translate(-50%,-50%) rotate(${rotMap[newDir]}deg)`;

        const hpWrap = document.createElement('div');
        hpWrap.className = 'enemy-hp-wrap';
        const hpFill = document.createElement('div');
        hpFill.className   = 'enemy-hp-fill';
        hpFill.style.width = '100%';
        hpWrap.appendChild(hpFill);
        el.appendChild(hpWrap);

        arena.appendChild(el);
        child.el     = el;
        child.hpFill = hpFill;
        enemies.push(child);
      }, i * 80);
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 30;
    if (distToCenter <= 160) return 18;
    return 10;
  },
});

EnemyRegistry.register({
  id:        'golem_lava_small',
  sprite:    'assets/enemies/golem_lava/idle.png',
  spriteFrames:  12,
  spriteFrameW:  112,
  spriteFrameH:  112,
  spriteSpeed:   1.0,
  size:          57,
  hpPct:     0.30,
  damagePct: 0.25,
  speedMult: 0.55,
  points:    800,
  hitSound:  'rock',
  shoots:    false,
  deathColors: ['#ff4400', '#cc6633', '#ffaa33'],

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 15;
    return 5;
  },
});

/* === js/enemies/naraDeer.js === */
/* ═══════════════════════════════════════
   NARADEER.JS
   Nara deer — same behavior as spectral
   deer but different skin. Fades and
   switches direction once. 1 hit.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'nara_deer',
  sprite:    'assets/enemies/nara_deer/idle.png',
  spriteFrames:  12,
  spriteFrameW:  92,
  spriteFrameH:  92,
  spriteSpeed:   1.0,
  size:          92,
  hpPct:     0.30,
  damagePct: 0.25,
  speedMult: 1.1,
  points:    1354,
  hitSound:  'ethereal',
  shoots:    false,
  noHpBar:   true,
  customOpacity: true,
  deathColors: ['#ddbb88', '#bb9966', '#ffffff'],

  onTick(e, cx, cy, attackRange) {
    if (e._fadePhase === undefined) {
      e._fadePhase   = 1.0;
      e._fadeDir     = 0;
      e._switchCount = 0;
      e._switched    = false;
      e._initCooldown = 800;  // ms before first flicker
    }

    if (e._initCooldown > 0) {
      e._initCooldown -= 16 * player.speedMultiplier;
      if (e.el) e.el.style.opacity = '1';
      return;
    }

    if (e._fadeDir === 0) e._fadeDir = -1;

    const fadeSpeed = 0.0018;
    const speedRatio = e.speed / (CONFIG.base.enemyBaseSpeed * 0.85); // 0.85 = nara base speedMult
    e._fadePhase += e._fadeDir * fadeSpeed * 16 * player.speedMultiplier * Math.max(1, speedRatio);

    if (e._fadePhase <= 0) {
      e._fadePhase = 0;

      if (!e._switched && e._switchCount < 1) {
        e._switched = true;
        e._switchCount++;

        const dx   = e.x - cx;
        const dy   = e.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const dirs = ['up', 'down', 'left', 'right'].filter(d => d !== e.dir);
        const newDir = dirs[Math.floor(Math.random() * dirs.length)];

        if (newDir === 'up' || newDir === 'down') {
          e.x = cx;
          e.y = newDir === 'up' ? cy - dist : cy + dist;
        } else {
          e.y = cy;
          e.x = newDir === 'left' ? cx - dist : cx + dist;
        }

        e.dir = newDir;
        const rotMap = { down: 0, left: 90, up: 180, right: 270 };
        if (e.el) e.el.style.transform = `translate(-50%,-50%) rotate(${rotMap[newDir]}deg)`;
      }

      e._fadeDir = 1;
    }

    if (e._fadePhase >= 1) {
      e._fadePhase = 1;
      if (e._switchCount < 1) {
        e._fadeDir  = -1;
        e._switched = false;
      }
    }

    if (e.el) e.el.style.opacity = e._fadePhase + '';
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 15;
    if (distToCenter <= 160) return 8;
    return 3;
  },
});

/* === js/enemies/kitsune.js === */
/* ═══════════════════════════════════════
   KITSUNE.JS
   Sneaky fox — approaches slowly, then
   lunges fast when in attack range.
   1 hit to kill.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'kitsune',
  sprite:    'assets/enemies/kitsune/idle.png',
  spriteFrames:  12,
  spriteFrameW:  76,
  spriteFrameH:  76,
  spriteSpeed:   1.0,
  size:          76,
  hpPct:     0.30,
  damagePct: 0.30,
  speedMult: 0.75,
  points:    1755,
  hitSound:  'flesh',
  shoots:    false,
  noHpBar:   true,
  deathColors: ['#ffaa33', '#ff7711', '#ffffff'],

  /* --- Dash trail behind kitsune --- */
  _spawnTrail(e, cx, cy) {
    const arena = document.getElementById('G');
    if (!arena) return;
    const dx = cx - e.x;
    const dy = cy - e.y;
    const d  = Math.sqrt(dx * dx + dy * dy) || 1;
    const dirX = dx / d;
    const dirY = dy / d;
    const count = 5;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'kitsune-trail';
      const offset = (Math.random() - 0.5) * 20;
      const trailDist = 15 + Math.random() * 25;
      p.style.left = (e.x + offset * -dirY) + 'px';
      p.style.top  = (e.y + offset * dirX) + 'px';
      p.style.setProperty('--kx', (-dirX * trailDist) + 'px');
      p.style.setProperty('--ky', (-dirY * trailDist) + 'px');
      const angle = Math.atan2(dirY, dirX) * (180 / Math.PI);
      p.style.transform = `rotate(${angle}deg)`;
      arena.appendChild(p);
      setTimeout(() => p.remove(), 350);
    }
  },

  onTick(e, cx, cy, attackRange) {
    if (e._lunging) return;

    const dx   = e.x - cx;
    const dy   = e.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= attackRange) {
      e._lunging = true;
      e.speed = e.baseSpeed * 2.5;

      // lunge FX
      if (e.el) e.el.classList.add('kitsune-lunge');
      this._spawnTrail(e, cx, cy);
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 18;
    if (distToCenter <= 160) return 10;
    return 4;
  },
});

/* === js/enemies/oni.js === */
/* ═══════════════════════════════════════
   ONI.JS
   Heavy demon — 4 hits. Each hit bounces
   it back to the start of its line and
   it comes back faster each time.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'oni',
  sprite:    'assets/enemies/oni/idle.png',
  spriteFrames:  12,
  spriteFrameW:  110,
  spriteFrameH:  110,
  spriteSpeed:   1.0,
  size:          110,
  hpPct:     2.10,
  damagePct: 0.40,
  speedMult: 0.60,
  points:    4890,
  hitSound:  'demon',
  shoots:    false,
  deathColors: ['#cc2222', '#881111', '#ff4444', '#440000'],

  /* --- Impact particles at hit position --- */
  _spawnImpact(x, y) {
    const arena = document.getElementById('G');
    if (!arena) return;
    const count = 8;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'oni-impact';
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
      const dist  = 25 + Math.random() * 35;
      p.style.left = x + 'px';
      p.style.top  = y + 'px';
      p.style.setProperty('--ix', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--iy', Math.sin(angle) * dist + 'px');
      arena.appendChild(p);
      setTimeout(() => p.remove(), 400);
    }
  },

  onHit(e) {
    // impact FX at current position before bounce
    this._spawnImpact(e.x, e.y);

    // brief white flash
    if (e.el) {
      e.el.classList.add('oni-hit-flash');
      setTimeout(() => {
        if (e.el) e.el.classList.remove('oni-hit-flash');
      }, 120);
    }

    // bounce back to edge of arena
    const { w, h } = getArenaSize();
    const cx = w / 2;
    const cy = h / 2;
    const m  = CONFIG.spawn.edgeMargin;

    if (e.dir === 'up')    { e.x = cx; e.y = -m; }
    if (e.dir === 'down')  { e.x = cx; e.y = h + m; }
    if (e.dir === 'left')  { e.x = -m; e.y = cy; }
    if (e.dir === 'right') { e.x = w + m; e.y = cy; }

    if (e.el) {
      e.el.style.left = e.x + 'px';
      e.el.style.top  = e.y + 'px';
    }

    // get faster each hit + rage tint
    e._hitCount = (e._hitCount || 0) + 1;
    e.speed = e.baseSpeed * (1 + e._hitCount * 0.5);

    // apply rage tint based on hits taken
    if (e.el) {
      e.el.classList.remove('oni-rage-1', 'oni-rage-2', 'oni-rage-3');
      if (e._hitCount >= 3)      e.el.classList.add('oni-rage-3');
      else if (e._hitCount >= 2) e.el.classList.add('oni-rage-2');
      else                       e.el.classList.add('oni-rage-1');
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 35;
    if (distToCenter <= 160) return 20;
    return 10;
  },
});

/* === js/enemies/frog.js === */
/* ═══════════════════════════════════════
   FROG.JS
   Jumping enemy — makes 3 jumps toward
   center. Each jump launches a parryable
   projectile. 1 hit to kill.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'frog',
  sprite:    'assets/enemies/frog/idle.png',
  spriteFrames:  12,
  spriteFrameW:  68,
  spriteFrameH:  68,
  spriteSpeed:   1.0,
  size:          68,
  hpPct:     0.30,
  damagePct: 0.22,
  speedMult: 0.0,
  points:    1237,
  hitSound:  'flesh',
  shoots:    false,
  noHpBar:   true,
  customMovement: true,
deathColors: ['#55aa44', '#88cc66', '#337722'],
  onTick(e, cx, cy) {
    if (e._jumpCount === undefined) {
      e._jumpCount = 0;
      e._jumpTimer = 1000;
      e._maxJumps  = 3;
      e._jumping   = false;

      // calc total distance and jump distance
      const dx = cx - e.x;
      const dy = cy - e.y;
      e._totalDist = Math.sqrt(dx * dx + dy * dy);
      e._jumpDist  = e._totalDist / (e._maxJumps + 2);
    }

    if (e._jumpCount >= e._maxJumps) {
      // after all jumps, walk slowly to center
      const dx = cx - e.x;
      const dy = cy - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 3) {
        const spd = CONFIG.base.enemyBaseSpeed * 0.8 * player.speedMultiplier;
        e.x += (dx / dist) * spd;
        e.y += (dy / dist) * spd;
        if (e.el) {
          e.el.style.left = e.x + 'px';
          e.el.style.top  = e.y + 'px';
        }
      }
      return;
    }

    e._jumpTimer -= 16 * player.speedMultiplier;

    if (e._jumpTimer <= 0 && !e._jumping) {
      e._jumping = true;

      // jump toward center
      const dx = cx - e.x;
      const dy = cy - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        e.x += (dx / dist) * e._jumpDist;
        e.y += (dy / dist) * e._jumpDist;
      }

      if (e.el) {
        e.el.style.left = e.x + 'px';
        e.el.style.top  = e.y + 'px';
      }

      // launch parryable projectile
      _spawnFrogSpit(e);

      e._jumpCount++;
      e._jumping = false;
      e._jumpTimer = 1400;
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 18;
    if (distToCenter <= 160) return 10;
    return 4;
  },
});

/* ── FROG SPIT (parryable projectile) ── */
function _spawnFrogSpit(enemy) {
  const { w, h } = getArenaSize();
  const cx = w / 2;
  const cy = h / 2;

  const dx   = cx - enemy.x;
  const dy   = cy - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;

  const spitDef = {
    id:        '_frog_spit',
    sprite: 'assets/enemies/bullet_spit/idle.png',
    size:      32,
    hpPct:     0.01,
    damagePct: 0.15,
    speedMult: 2.0,
    points:    5,
    shoots:    false,
    noHpBar:   true,
    parryable: true,
    calcStress() { return 0; },
  };

  const spit = new Enemy(spitDef, enemy.x, enemy.y, enemy.dir, 1, w, h);
  spit.speed = CONFIG.base.enemyBaseSpeed * 2.0;

  const el = document.createElement('div');
  el.className        = 'enemy';
  el.style.width      = spit.size + 'px';
  el.style.height     = spit.size + 'px';
  el.style.left       = enemy.x + 'px';
  el.style.top        = enemy.y + 'px';
  el.style.backgroundImage = `url(${spitDef.sprite})`;
  el.style.backgroundSize  = 'cover';
  el.style.imageRendering  = 'pixelated';
  el.style.transform  = 'translate(-50%,-50%)';
  el.classList.add('bullet-spit');

  arena.appendChild(el);
  spit.el     = el;
  spit.hpFill = null;
  enemies.push(spit);

  SFX.bullet();
}

/* === js/enemies/star.js === */
/* ═══════════════════════════════════════
   STAR.JS
   Small fast projectile-like enemy.
   Rushes to center, parryable. 1 hit.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'star',
  sprite:    'assets/enemies/star/idle.png',
  size:      42,
  hpPct:     0.01,
  damagePct: 0.22,
  speedMult: 2.4,
  points:    700,
  hitSound:  'ethereal',
  shoots:    false,
  noHpBar:   true,
  parryable: true,
  deathColors: ['#ffdd44', '#ffaa22', '#ffffff'],

  calcStress(distToCenter) {
    if (distToCenter <= 120) return 16;
    return 6;
  },
});

/* === js/player/stats.js === */
/* ═══════════════════════════════════════
   STATS.JS
   Fixed player stats. Single source of
   truth for the player's base values.

   Used by: Player.js
   Depends on: nothing
   ═══════════════════════════════════════ */

const PLAYER_STATS = {
  emoji:      '🧑',
  color:      '#E24B4A',
  rangePct:   0.234,
  damageMult: 1.6,
  maxHp:      100,

  // default equipped ability id (auto-registered from abilities/)
  defaultAbility: 'bullet_time',
};

/* === js/player/Player.js === */
/* ═══════════════════════════════════════
   PLAYER.JS
   Player class — state and methods
   during a match.

   Stats come from PLAYER_STATS (stats.js).
   Ability comes from AbilityRegistry
   (the equipped ability id).

   Used by: systems/loop.js
   Depends on: stats.js, AbilityRegistry, config.js
   ═══════════════════════════════════════ */

class Player {

  constructor(abilityId) {

    // ── ability equipped ──
    this.ability = AbilityRegistry.get(abilityId || PLAYER_STATS.defaultAbility);

    // ── hp ──
    this.maxHp = PLAYER_STATS.maxHp;
    this.hp    = this.maxHp;

    // ── progression ──
    this.score = 0;
    this.kills = 0;

    // ── combo ──
    this.combo      = 0;
    this.comboTimer = 0;

    // ── special ──
    this.specialCharge = 0;
    this.specialActive = false;
    this.specialTimer  = 0;

    // ── stats from PLAYER_STATS ──
    this.attackRangePct = PLAYER_STATS.rangePct;
    this.damageMult     = PLAYER_STATS.damageMult;
    this.emoji          = PLAYER_STATS.emoji;
    this.color          = PLAYER_STATS.color;

    // ── ability modifiers ──
    this.specialChargeMult = 1;
    this.comboDecayBonus   = 0;
    this.stunChance        = 0;
    this.doubleAttack      = false;
    this.thorns            = false;

    // ── global speed multiplier (abilities like BulletTime) ──
    this.speedMultiplier = 1.0;

    this.rangePctMultiplier = 1.0;
    this.oneHitActive       = false;
    this.doubleStrikeActive = false;
    this.slashActive        = false;

    // ── upgrade properties (set by upgradeChoice.js apply) ──
    this._defenseMult          = 1;      // iron skin
    this._critChance           = 0;      // critical hit
    this._frostChance          = 0;      // frost touch
    this._luckyBlockChance     = 0;      // lucky shield
    this._vampKillInterval     = 0;      // vampiric (0 = inactive)
    this._vampHealPct          = 0;      // vampiric
    this._vampKillCount        = 0;      // vampiric counter
    this._abilityDurationMult  = 1;      // ability boost
    this._orbChanceBonus       = 0;      // orb hunter (flat add)
    this._berserkerAtkThreshold = 0;     // berserker atk
    this._berserkerAtkBonus    = 0;      // berserker atk
    this._berserkerDefThreshold = 0;     // berserker def
    this._berserkerDefBonus    = 0;      // berserker def
    this._maxSpecialSlots      = 1;      // extra slot (1 = default, max 3)

    // ── internal flag ──
    this._wasSpecialReady = false;
  }

  /* ── DAMAGE ─────────────────────────── */

  takeDamage(pct) {
    // shield ability blocks all damage
    if (this.specialActive && this.ability.blocksBullets) return;

    // lucky shield — chance to block hit completely
    if (this._luckyBlockChance > 0 && Math.random() < this._luckyBlockChance) {
      if (typeof showActionPop === 'function') {
        const { w, h } = getArenaSize();
        showActionPop('up', 'BLOCKED!', '#44ffaa');
      }
      if (typeof SFX !== 'undefined') SFX.luckyShield();
      return;
    }

    let dmgPct = pct;

    // orb defense buff
    if (typeof OrbSystem !== 'undefined' && OrbSystem.hasDefenseBuff()) dmgPct *= 0.5;

    // iron skin multiplier
    if (this._defenseMult < 1) dmgPct *= this._defenseMult;

    // berserker DEF — reduce damage when low HP
    if (this._berserkerDefBonus > 0 && this.hpPercent() <= this._berserkerDefThreshold) {
      dmgPct *= (1 - this._berserkerDefBonus);
    }

    this.hp = Math.max(0, this.hp - Math.round(this.maxHp * dmgPct));
    this.resetCombo();
  }

  isAlive()   { return this.hp > 0; }
  hpPercent() { return this.hp / this.maxHp; }

  /* ── COMBO TIER LOOKUP ─────────────── */

  _getComboTierIndex() {
    // returns index into CONFIG.combo.tiers for current combo count
    const tiers = CONFIG.combo.tiers;
    let idx = 0;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (this.combo >= tiers[i][0]) { idx = i; break; }
    }
    return idx;
  }

  getComboMult() {
    const tiers = CONFIG.combo.tiers;
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (this.combo >= tiers[i][0]) return tiers[i][1];
    }
    return 1;
  }

  getAttackRange(arenaSize) {
    return arenaSize * this.attackRangePct * this.rangePctMultiplier;
  }

  /* ── HIT DAMAGE ─────────────────────── */

  getHitDamage() {
    if (this.oneHitActive) return 99999;
    if (this.slashActive) return Math.round(PLAYER_STATS.maxHp * 1.0);

    let dmg = Math.round(PLAYER_STATS.maxHp * CONFIG.base.hitDamagePct * this.damageMult);

    // orb attack buff
    if (typeof OrbSystem !== 'undefined' && OrbSystem.hasAttackBuff()) dmg *= 2;

    // berserker ATK — bonus damage when low HP
    if (this._berserkerAtkBonus > 0 && this.hpPercent() <= this._berserkerAtkThreshold) {
      dmg = Math.round(dmg * (1 + this._berserkerAtkBonus));
    }

    // critical hit — roll happens here, flag stored for combat.js pop
    this._lastHitWasCrit = false;
    if (this._critChance > 0 && Math.random() < this._critChance) {
      dmg *= 2;
      this._lastHitWasCrit = true;
    }

    return dmg;
  }

  /* ── COMBO ──────────────────────────── */

  resetCombo() {
    this.combo      = 0;
    this.comboTimer = 0;
  }

  addKill() {
    const prevTier = this._getComboTierIndex();
    this.combo++;
    this.comboTimer = CONFIG.combo.decayMs + this.comboDecayBonus;

    // combo sounds — only after minKills reached
    if (this.combo >= CONFIG.combo.minKills) {
      const currTier = this._getComboTierIndex();
      if (currTier > prevTier) {
        // tier changed — play threshold sound with tier index
        if (typeof SFX !== 'undefined') SFX.comboThreshold(currTier);
      } else {
        // same tier — play tick with combo count and tier index
        if (typeof SFX !== 'undefined') SFX.comboTick(this.combo, currTier);
      }
    }

    const inCombo = this.combo >= CONFIG.combo.minKills;
    const baseCharge = inCombo
      ? CONFIG.combo.chargePerComboKill
      : CONFIG.combo.chargePerKill;

    // extra slot: max charge is slots * 100
    const maxCharge = this._maxSpecialSlots * 100;
    this.specialCharge = Math.min(maxCharge, this.specialCharge + baseCharge * this.specialChargeMult);

    // vampiric — heal every X kills
    if (this._vampKillInterval > 0) {
      this._vampKillCount++;
      if (this._vampKillCount >= this._vampKillInterval) {
        this._vampKillCount = 0;
        const healAmt = Math.round(this.maxHp * this._vampHealPct);
        this.hp = Math.min(this.maxHp, this.hp + healAmt);
        if (typeof updateHpBar === 'function') updateHpBar();
        if (typeof SFX !== 'undefined') SFX.healVampiric();
        if (typeof showActionPop === 'function') {
          showActionPop('up', 'HEAL!', '#44ff66');
        }
      }
    }
  }

  /* ── SPECIAL ────────────────────────── */

  isSpecialReady() {
    return this.specialCharge >= 100 && !this.specialActive;
  }

  activateSpecial() {
    if (!this.isSpecialReady()) return false;

    this.specialActive    = true;
    this.specialCharge   -= 100;  // consume one slot worth
    this._wasSpecialReady = false;

    // ability boost — multiply duration
    this.specialTimer = this.ability.duration * this._abilityDurationMult;

    return true;
  }

  tickSpecial(dt) {
    if (this.combo > 0 && this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.resetCombo();
    }

    if (this.specialActive) {
      this.specialTimer -= dt;
      if (this.specialTimer <= 0) {
        this.specialActive = false;
        this.specialTimer  = 0;
        this.ability.onDeactivate(enemies);

        const pe = document.getElementById('player');
        if (pe) pe.classList.remove('special-active');
        const sr = document.getElementById('special-ring');
        if (sr) sr.classList.remove('active');
      }
    }
  }

}

/* === js/player/abilities/bulletTime.js === */
/* ═══════════════════════════════════════
   BULLETTIME.JS
   Bullet Time — slows everything in the
   arena for a short duration.
   Ninja instinct: dark pulse + vignette.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry
   ═══════════════════════════════════════ */

AbilityRegistry.register({
  id:       'bullet_time',
  name:     'Bullet Time',
  desc:     'slows everything for 3s',
  icon:     '🌀',
  barColor: '#E24B4A',
  duration: 4000,

  piercing:      false,
  blocksBullets: false,

  onActivate() {
    if (player) player.speedMultiplier = 0.25;

    const a = document.getElementById('arena');
    if (!a) return;

    // add persistent overlay if not present
    if (!a.querySelector('.bt-overlay')) {
      const ov = document.createElement('div');
      ov.className = 'bt-overlay';
      a.appendChild(ov);
    }

    // activate CSS effects
    a.classList.remove('bullet-time-ending');
    a.classList.add('bullet-time-active');


    // sound
    if (typeof SFX !== 'undefined') SFX.bulletTimeStart();
  },

  /* ── called by spawn.js for new enemies during ability ── */
  onEnemySpawn(enemy) {
    // no per-enemy effects needed for bullet time
    // (speedMultiplier on player already slows everything)
  },

  onDeactivate() {
    if (player) player.speedMultiplier = 1.0;

    const a = document.getElementById('arena');
    if (!a) return;

    // smooth fade out
    a.classList.remove('bullet-time-active');
    a.classList.add('bullet-time-ending');

    setTimeout(() => {
      a.classList.remove('bullet-time-ending');
      const ov = a.querySelector('.bt-overlay');
      if (ov) ov.remove();
    }, 550);

   
    // sound
    if (typeof SFX !== 'undefined') SFX.bulletTimeStop();
  },
});

/* === js/player/abilities/rangeBoost.js === */
/* ═══════════════════════════════════════
   RANGEBOOST.JS
   Range Boost — increases attack range
   by 50% for 4 seconds.
   Emerald energy field: particles + waves.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry, config.js
   ═══════════════════════════════════════ */

const RangeBoostFX = (() => {
  // ── COLORS ──
  const C_CORE     = '#2ECC71';
  const C_GLOW     = '#50C878';
  const C_BRIGHT   = '#ADFFD2';
  const C_DIM      = '#1B8A4E';

  // ── STATE ──
  let _canvas    = null;
  let _ctx       = null;
  let _rafId     = null;
  let _particles = [];
  let _waves     = [];
  let _t         = 0;
  let _phase     = 'none'; // 'intro', 'idle', 'outro'
  let _phaseT    = 0;
  let _maxR      = 0;
  let _cx        = 0;
  let _cy        = 0;

  const INTRO_DUR  = 600;
  const OUTRO_DUR  = 400;
  const WAVE_COUNT = 3;
  const PARTICLE_COUNT = 40;

  // ── PARTICLES ──
  function _initParticles() {
    _particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      // target distance — spread across range
      const targetDist = 0.2 + Math.random() * 0.75;
      _particles.push({
        angle,
        targetDist,    // as fraction of maxR
        currentDist: 0,// starts at center (intro animation)
        size: Math.random() > 0.6 ? 3 : 2,
        drift: 0.3 + Math.random() * 0.5,    // orbital speed
        driftDir: Math.random() > 0.5 ? 1 : -1,
        bob: Math.random() * Math.PI * 2,     // radial bobbing phase
        bobAmp: 0.02 + Math.random() * 0.04,  // bobbing amplitude
        bobSpeed: 1.5 + Math.random() * 2,
        pulse: Math.random() * Math.PI * 2,   // opacity pulse
        pulseSpeed: 2 + Math.random() * 3,
        bright: Math.random() > 0.7,          // some are brighter
      });
    }
  }

  // ── WAVES ──
  function _initWaves() {
    _waves = [];
    for (let i = 0; i < WAVE_COUNT; i++) {
      _waves.push({
        progress: i / WAVE_COUNT, // staggered start (0..1 = center..edge)
        speed: 0.3 + Math.random() * 0.15,
      });
    }
  }

  // ── DRAW ──
  function _draw(dt) {
    if (!_ctx || !_canvas) return;
    const w = _canvas.width;
    const h = _canvas.height;
    _ctx.clearRect(0, 0, w, h);

    _t += dt;
    _phaseT += dt;

    // ── PHASE PROGRESS ──
    let introP = 1; // 0→1 during intro
    let outroP = 0; // 0→1 during outro

    if (_phase === 'intro') {
      introP = Math.min(_phaseT / INTRO_DUR, 1);
      // ease out cubic
      introP = 1 - Math.pow(1 - introP, 3);
      if (_phaseT >= INTRO_DUR) _phase = 'idle';
    } else if (_phase === 'outro') {
      outroP = Math.min(_phaseT / OUTRO_DUR, 1);
      // ease in quad
      outroP = outroP * outroP;
      if (outroP >= 1) { stop(); return; }
    }

    // scale factor: 0→1 on intro, 1→0 on outro
    const scale = _phase === 'outro' ? 1 - outroP : introP;
    // alpha factor
    const alpha = _phase === 'outro' ? 1 - outroP : Math.min(introP * 1.5, 1);

    _ctx.imageSmoothingEnabled = false;

    // ── DRAW WAVES ──
    for (const wave of _waves) {
      wave.progress += (dt / 1000) * wave.speed;
      if (wave.progress > 1) wave.progress -= 1;

      const waveR = wave.progress * _maxR * scale;
      // opacity: strong near center, fades at edge
      const waveAlpha = (1 - wave.progress) * 0.4 * alpha;
      if (waveAlpha < 0.01) continue;

      // glow ring
      _ctx.beginPath();
      _ctx.arc(_cx, _cy, Math.max(waveR, 1), 0, Math.PI * 2);
      _ctx.closePath();
      _ctx.strokeStyle = C_GLOW;
      _ctx.lineWidth = 3;
      _ctx.globalAlpha = waveAlpha * 0.4;
      _ctx.stroke();

      // core ring
      _ctx.beginPath();
      _ctx.arc(_cx, _cy, Math.max(waveR, 1), 0, Math.PI * 2);
      _ctx.closePath();
      _ctx.strokeStyle = C_CORE;
      _ctx.lineWidth = 1;
      _ctx.globalAlpha = waveAlpha;
      _ctx.stroke();
    }

    // ── DRAW PARTICLES ──
    for (const p of _particles) {
      // orbital drift
      p.angle += p.drift * p.driftDir * dt * 0.001;

      // radial bobbing
      p.bob += p.bobSpeed * dt * 0.001;
      const bobOffset = Math.sin(p.bob) * p.bobAmp;

      // intro: particles fly out from center
      // outro: particles fly back to center
      if (_phase === 'intro') {
        p.currentDist = p.targetDist * introP;
      } else if (_phase === 'outro') {
        p.currentDist = p.targetDist * (1 - outroP);
      } else {
        // idle — smoothly settle at target
        p.currentDist += (p.targetDist - p.currentDist) * 0.05;
      }

      const dist = (p.currentDist + bobOffset) * _maxR * scale;
      const px = _cx + Math.cos(p.angle) * dist;
      const py = _cy + Math.sin(p.angle) * dist;

      // opacity pulse
      p.pulse += p.pulseSpeed * dt * 0.001;
      const pAlpha = (0.4 + 0.6 * Math.sin(p.pulse) * 0.5 + 0.5) * alpha;

      // glow behind particle
      _ctx.globalAlpha = pAlpha * 0.25;
      _ctx.fillStyle = C_GLOW;
      _ctx.fillRect(
        Math.round(px) - 1,
        Math.round(py) - 1,
        p.size + 2,
        p.size + 2
      );

      // core particle
      _ctx.globalAlpha = pAlpha;
      _ctx.fillStyle = p.bright ? C_BRIGHT : C_CORE;
      _ctx.fillRect(Math.round(px), Math.round(py), p.size, p.size);
    }

    _ctx.globalAlpha = 1;
  }

  // ── ANIMATION LOOP ──
  let _lastFrame = 0;
  function _loop(timestamp) {
    if (!_canvas) return;
    const dt = _lastFrame ? timestamp - _lastFrame : 16;
    _lastFrame = timestamp;
    _draw(Math.min(dt, 50));
    _rafId = requestAnimationFrame(_loop);
  }

  // ── PUBLIC API ──
  function start() {
    stop();

    const arena = document.getElementById('arena');
    if (!arena) return;

    _canvas = document.createElement('canvas');
    _canvas.classList.add('rb-canvas');
    _canvas.width  = arena.offsetWidth;
    _canvas.height = arena.offsetHeight;
    _canvas.style.cssText = `
      position: absolute; top: 0; left: 0;
      width: ${arena.offsetWidth}px; height: ${arena.offsetHeight}px;
      z-index: 15; pointer-events: none;
      image-rendering: pixelated;
    `;
    _ctx = _canvas.getContext('2d');
    arena.appendChild(_canvas);
    arena.classList.add('range-boost-active');

    const arenaSize = Math.min(_canvas.width, _canvas.height);
    _cx = _canvas.width / 2;
    _cy = _canvas.height / 2;
    _maxR = player.getAttackRange(arenaSize);

    _initParticles();
    _initWaves();

    _t = 0;
    _phaseT = 0;
    _phase = 'intro';
    _lastFrame = 0;

    // micro shake on activation
    if (typeof triggerShake === 'function') triggerShake();

    _rafId = requestAnimationFrame(_loop);
  }

  function fadeOut() {
    _phase = 'outro';
    _phaseT = 0;
  }

  function stop() {
    if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
    if (_canvas && _canvas.parentNode) _canvas.remove();
    _canvas = null;
    _ctx = null;
    _particles = [];
    _waves = [];
    _phase = 'none';
    _lastFrame = 0;

    const arena = document.getElementById('arena');
    if (arena) arena.classList.remove('range-boost-active');
  }

  return { start, fadeOut, stop };
})();


AbilityRegistry.register({
  id:       'range_boost',
  name:     'Range Boost',
  desc:     'increases attack range by 50% for 4s',
  icon:     '🎯',
  barColor: '#F59E0B',
  duration: 4000,

  piercing:      false,
  blocksBullets: false,

  onActivate() {
    if (player) {
      player.rangePctMultiplier = 1.5;
      updateRangeCircle();
    }
    SFX.rangeBoostStart();
    RangeBoostFX.start();
  },

  onDeactivate() {
    if (player) {
      player.rangePctMultiplier = 1.0;
      updateRangeCircle();
    }
    RangeBoostFX.fadeOut();
  },
});

/* === js/player/abilities/shield.js === */
/* ═══════════════════════════════════════
   SHIELD.JS
   Shield — player is invincible for 5s.
   Glowing bubble with firefly particles.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry
   ═══════════════════════════════════════ */

const ShieldFX = (() => {
  let _canvas = null;
  let _ctx = null;
  let _raf = null;
  let _fireflies = [];
  let _time = 0;
  let _active = false;
  let _flashTimer = 0;
  let _ripples = [];

  const SIZE = 180;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const BUBBLE_R = 54;
  const FIREFLY_COUNT = 10;

  /* ── FIREFLY SETUP ── */

  function _initFireflies() {
    _fireflies = [];
    for (let i = 0; i < FIREFLY_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 30;
      _fireflies.push({
        x:        CX + Math.cos(angle) * dist,
        y:        CY + Math.sin(angle) * dist,
        vx:       (Math.random() - 0.5) * 0.3,
        vy:       (Math.random() - 0.5) * 0.3,
        size:     1.5 + Math.random() * 1.5,
        phase:    Math.random() * Math.PI * 2,
        glowSpd:  0.4 + Math.random() * 0.6,
      });
    }
  }

  /* ── DRAW ── */

  function _draw() {
    if (!_active) return;

    const dt = 0.016;
    _time += dt;
    _ctx.clearRect(0, 0, SIZE, SIZE);

    // ── BUBBLE BODY ──
    // outer glow
    const glowPulse = 0.5 + 0.15 * Math.sin(_time * 1.2);
    const outerGlow = _ctx.createRadialGradient(CX, CY, BUBBLE_R - 4, CX, CY, BUBBLE_R + 14);
    outerGlow.addColorStop(0, `rgba(81, 238, 252, ${0.12 * glowPulse})`);
    outerGlow.addColorStop(1, 'rgba(81, 238, 252, 0)');
    _ctx.fillStyle = outerGlow;
    _ctx.beginPath();
    _ctx.arc(CX, CY, BUBBLE_R + 14, 0, Math.PI * 2);
    _ctx.fill();

    // bubble fill — gradient for volume (light top-left, dark bottom-right)
    const bubbleGrad = _ctx.createRadialGradient(
      CX - 14, CY - 16, 4,
      CX, CY, BUBBLE_R
    );
    bubbleGrad.addColorStop(0, 'rgba(180, 245, 255, 0.12)');
    bubbleGrad.addColorStop(0.4, 'rgba(81, 238, 252, 0.06)');
    bubbleGrad.addColorStop(0.8, 'rgba(40, 140, 220, 0.04)');
    bubbleGrad.addColorStop(1, 'rgba(20, 80, 180, 0.02)');
    _ctx.fillStyle = bubbleGrad;
    _ctx.beginPath();
    _ctx.arc(CX, CY, BUBBLE_R, 0, Math.PI * 2);
    _ctx.fill();

    // bubble border — pulsing
    const borderAlpha = 0.25 + 0.12 * Math.sin(_time * 1.5);
    _ctx.beginPath();
    _ctx.arc(CX, CY, BUBBLE_R, 0, Math.PI * 2);
    _ctx.strokeStyle = `rgba(81, 238, 252, ${borderAlpha})`;
    _ctx.lineWidth = 1.5;
    _ctx.stroke();

    // inner edge highlight (thin bright ring inside)
    const innerAlpha = 0.1 + 0.06 * Math.sin(_time * 1.8 + 1);
    _ctx.beginPath();
    _ctx.arc(CX, CY, BUBBLE_R - 3, 0, Math.PI * 2);
    _ctx.strokeStyle = `rgba(160, 245, 255, ${innerAlpha})`;
    _ctx.lineWidth = 0.5;
    _ctx.stroke();

    // ── SPECULAR HIGHLIGHT (moving reflection) ──
    const reflectAngle = _time * 0.3;
    const refX = CX - 16 + Math.sin(reflectAngle) * 8;
    const refY = CY - 18 + Math.cos(reflectAngle * 0.7) * 6;
    const reflectGrad = _ctx.createRadialGradient(refX, refY, 0, refX, refY, 14);
    const refAlpha = 0.15 + 0.08 * Math.sin(_time * 0.8);
    reflectGrad.addColorStop(0, `rgba(220, 255, 255, ${refAlpha})`);
    reflectGrad.addColorStop(1, 'rgba(220, 255, 255, 0)');
    _ctx.fillStyle = reflectGrad;
    _ctx.beginPath();
    _ctx.arc(refX, refY, 14, 0, Math.PI * 2);
    _ctx.fill();

    // small second highlight (bottom-right, dimmer)
    const ref2X = CX + 12 + Math.sin(reflectAngle * 0.5 + 2) * 5;
    const ref2Y = CY + 14 + Math.cos(reflectAngle * 0.6 + 1) * 4;
    const ref2Grad = _ctx.createRadialGradient(ref2X, ref2Y, 0, ref2X, ref2Y, 8);
    ref2Grad.addColorStop(0, `rgba(200, 250, 255, ${refAlpha * 0.5})`);
    ref2Grad.addColorStop(1, 'rgba(200, 250, 255, 0)');
    _ctx.fillStyle = ref2Grad;
    _ctx.beginPath();
    _ctx.arc(ref2X, ref2Y, 8, 0, Math.PI * 2);
    _ctx.fill();

    // ── FIREFLIES ──
    for (const f of _fireflies) {
      // slow drifting movement
      f.vx += (Math.random() - 0.5) * 0.02;
      f.vy += (Math.random() - 0.5) * 0.02;
      // dampen
      f.vx *= 0.98;
      f.vy *= 0.98;
      f.x += f.vx;
      f.y += f.vy;

      // keep inside bubble
      const dx = f.x - CX;
      const dy = f.y - CY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > BUBBLE_R - 8) {
        // push back gently
        f.x -= dx * 0.03;
        f.y -= dy * 0.03;
        f.vx -= dx * 0.005;
        f.vy -= dy * 0.005;
      }

      // glow pulsing — slow like fireflies
      const glow = 0.5 + 0.5 * Math.sin(_time * f.glowSpd + f.phase);
      const alpha = 0.15 + glow * 0.55;
      const s = Math.round(f.size + glow * 1.5);

      // pixel square
      _ctx.fillStyle = `rgba(160, 250, 255, ${alpha})`;
      const px = Math.round(f.x) - Math.floor(s / 2);
      const py = Math.round(f.y) - Math.floor(s / 2);
      _ctx.fillRect(px, py, s, s);

      // soft glow around firefly
      const fGlow = _ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 6 + glow * 4);
      fGlow.addColorStop(0, `rgba(81, 238, 252, ${alpha * 0.3})`);
      fGlow.addColorStop(1, 'rgba(81, 238, 252, 0)');
      _ctx.fillStyle = fGlow;
      _ctx.fillRect(f.x - 10, f.y - 10, 20, 20);
    }

    // ── FLASH (on kill) ──
    if (_flashTimer > 0) {
      _flashTimer -= dt;
      const fProgress = 1 - (_flashTimer / 0.25);
      const fAlpha = 0.35 * (1 - fProgress);
      _ctx.beginPath();
      _ctx.arc(CX, CY, BUBBLE_R + 2, 0, Math.PI * 2);
      _ctx.fillStyle = `rgba(200, 255, 255, ${fAlpha})`;
      _ctx.fill();

      // border flashes brighter
      _ctx.beginPath();
      _ctx.arc(CX, CY, BUBBLE_R, 0, Math.PI * 2);
      _ctx.strokeStyle = `rgba(200, 255, 255, ${fAlpha + 0.2})`;
      _ctx.lineWidth = 2.5;
      _ctx.stroke();
    }

    // ── RIPPLES (expanding rings on kill) ──
    for (let i = _ripples.length - 1; i >= 0; i--) {
      const rp = _ripples[i];
      rp.t += dt;
      const progress = rp.t / rp.duration;
      if (progress >= 1) { _ripples.splice(i, 1); continue; }

      const radius = BUBBLE_R + progress * 25;
      const alpha = 0.5 * (1 - progress);

      _ctx.beginPath();
      _ctx.arc(CX, CY, radius, 0, Math.PI * 2);
      _ctx.strokeStyle = `rgba(81, 238, 252, ${alpha})`;
      _ctx.lineWidth = 1.5 * (1 - progress);
      _ctx.stroke();
    }

    _raf = requestAnimationFrame(_draw);
  }

  /* ── PUBLIC ── */

  function start() {
    const a = document.getElementById('arena');
    if (!a) return;

    _canvas = document.createElement('canvas');
    _canvas.width = SIZE;
    _canvas.height = SIZE;
    _canvas.style.cssText = `
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: ${SIZE}px; height: ${SIZE}px;
      pointer-events: none;
      z-index: 5;
      image-rendering: pixelated;
    `;
    a.appendChild(_canvas);

    _ctx = _canvas.getContext('2d');
    _time = 0;
    _ripples = [];
    _flashTimer = 0;
    _active = true;
    _initFireflies();
    _draw();

    a.classList.add('shield-active');
  }

  function stop() {
    _active = false;
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }

    const a = document.getElementById('arena');
    if (a) {
      a.classList.remove('shield-active');
      if (_canvas && _canvas.parentNode) _canvas.remove();
    }
    _canvas = null;
    _ctx = null;
    _fireflies = [];
    _ripples = [];
  }

  function ripple() {
    if (!_active) return;
    _flashTimer = 0.25;
    _ripples.push({ t: 0, duration: 0.4 });
    // fireflies scatter briefly
    for (const f of _fireflies) {
      const dx = f.x - CX;
      const dy = f.y - CY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      f.vx += (dx / dist) * 1.5;
      f.vy += (dy / dist) * 1.5;
    }
  }

  return { start, stop, ripple };
})();

/* ── ABILITY REGISTRATION ── */

AbilityRegistry.register({
  id:       'shield',
  name:     'Shield',
  desc:     'invincible for 5s',
  icon:     '🛡️',
  barColor: '#3B82F6',
  duration: 5000,

  piercing:      false,
  blocksBullets: true,

  onActivate()   { ShieldFX.start(); },
  onDeactivate() { ShieldFX.stop(); },
});

/* ── RIPPLE TRIGGER (called from loop.js) ── */

function triggerShieldRipple() {
  ShieldFX.ripple();
}

/* === js/player/abilities/fullHeal.js === */
/* ═══════════════════════════════════════
   FULLHEAL.JS
   Full Heal — instantly restores all HP.
   No duration, effect is immediate.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry
   ═══════════════════════════════════════ */

AbilityRegistry.register({
  id:       'full_heal',
  name:     'Full Heal',
  desc:     'restores all HP instantly',
  icon:     '❤️',
  barColor: '#22C55E',
  duration: 1,

  piercing:      false,
  blocksBullets: false,

  onActivate() {
    if (player) {
      player.hp = player.maxHp;
      updateHpBar();
      SFX.healAbility();

      // green heal glow (reuses orb heal effect)
      playerEl.classList.remove('orb-heal-effect');
      void playerEl.offsetWidth;
      playerEl.classList.add('orb-heal-effect');
      setTimeout(() => playerEl.classList.remove('orb-heal-effect'), 1500);
    }
  },

  onDeactivate() {},
});

/* === js/player/abilities/explosion.js === */
/* ═══════════════════════════════════════
   EXPLOSION.JS
   Explosion — instantly kills all enemies
   within attack range. Violent burst with
   ground scorch mark. Dark reds + black.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry, juice.js
   ═══════════════════════════════════════ */

AbilityRegistry.register({
  id:       'explosion',
  name:     'Explosion',
  desc:     'kills all enemies in range instantly',
  icon:     '💥',
  barColor: '#EF4444',
  duration: 1,

  piercing:      false,
  blocksBullets: false,

  onActivate() {
    if (!player) return;

    const { w, h }    = getArenaSize();
    const cx          = w / 2;
    const cy          = h / 2;
    const arenaSize   = Math.min(w, h);
    const attackRange = player.getAttackRange(arenaSize);

    // ── Kill all enemies in range ──
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (e.underground) continue;

      const dx   = e.x - cx;
      const dy   = e.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= attackRange) {
        spawnParticles(e.x, e.y, player.color, e.isElite);
        e.el.remove();
        enemies.splice(i, 1);
        registerKill(e);
      }
    }

    SFX.explosionStart();
    SFX.kill();

    const a = document.getElementById('arena');

    // ── Heavy shake ──
    a.classList.remove('explosion-shake');
    void a.offsetWidth;
    a.classList.add('explosion-shake');
    setTimeout(() => a.classList.remove('explosion-shake'), 550);

    // ── Dark red flash ──
    const flash = document.createElement('div');
    flash.className = 'explosion-flash';
    flash.style.width  = (attackRange * 0.8) + 'px';
    flash.style.height = (attackRange * 0.8) + 'px';
    a.appendChild(flash);
    setTimeout(() => { if (flash.parentNode) flash.remove(); }, 350);

    // ── Debris burst ──
    _explosionDebris(cx, cy, attackRange);

    // ── Scorch mark on ground ──
    const scorch = document.createElement('div');
    scorch.className = 'explosion-scorch';
    const scorchSize = attackRange * 1.6;
    scorch.style.width  = scorchSize + 'px';
    scorch.style.height = scorchSize + 'px';
    a.appendChild(scorch);

    // ── Embers inside scorch ──
    const embers = [];
  const emberCount = 14;
    for (let i = 0; i < emberCount; i++) {
      const em = document.createElement('div');
      em.className = 'explosion-ember';
      const angle  = Math.random() * Math.PI * 2;
      const dist   = Math.random() * attackRange * 0.55;
      const sz     = 2 + Math.random() * 3;
      const colors = ['#aa0000', '#cc1100', '#880000', '#661100'];
      em.style.width      = sz + 'px';
      em.style.height     = sz + 'px';
      em.style.background = colors[Math.floor(Math.random() * colors.length)];
      em.style.left       = (cx + Math.cos(angle) * dist) + 'px';
      em.style.top        = (cy + Math.sin(angle) * dist) + 'px';
      em.style.transform  = 'translate(-50%, -50%)';
      em.style.animationDelay = (Math.random() * 0.4) + 's';
      a.appendChild(em);
      embers.push(em);
    }

   // ── Embers start dying after 1.2s ──
    setTimeout(() => {
      embers.forEach(em => em.classList.add('dying'));
    }, 1200);

    // ── Scorch starts fading after 1s ──
    setTimeout(() => {
      scorch.classList.add('fading');
    }, 1000);

    // ── Full cleanup after 5.5s (1s wait + 4s fade) ──
    setTimeout(() => {
      if (scorch.parentNode) scorch.remove();
      embers.forEach(em => { if (em.parentNode) em.remove(); });
    }, 5500);
  },

  onDeactivate() {},
});

/* ── Chaotic debris burst from center ──
   Dark chunks and red sparks. */

function _explosionDebris(cx, cy, range) {
  const count  = 32;
  const colors = ['#aa0000', '#cc1100', '#660000', '#881100',
                  '#440000', '#bb2200', '#551100'];

  for (let i = 0; i < count; i++) {
    const p     = document.createElement('div');
    p.className = 'particle';

    const isBig = Math.random() < 0.3;
    const size  = isBig ? (6 + Math.random() * 6) : (2 + Math.random() * 4);
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 4.5;
    const color = colors[Math.floor(Math.random() * colors.length)];

    p.style.cssText =
      `width:${size}px;height:${size}px;background:${color};` +
      `left:${cx}px;top:${cy}px;opacity:1;image-rendering:pixelated;`;
    arena.appendChild(p);

    const start = performance.now();
    const life  = 250 + Math.random() * 300;
    const dist  = range * (0.4 + Math.random() * 0.6);
    const vx    = Math.cos(angle);
    const vy    = Math.sin(angle);
    const grav  = isBig ? 0.003 : 0;

    (function anim(now) {
      const t = (now - start) / life;
      if (t >= 1) { p.remove(); return; }

      const ex = cx + vx * speed * t * dist * 0.5;
      const ey = cy + vy * speed * t * dist * 0.5 + grav * t * t * dist * 80;
      p.style.left    = ex + 'px';
      p.style.top     = ey + 'px';
      p.style.opacity = (1 - t * t) + '';
      requestAnimationFrame(anim);
    })(performance.now());
  }
}

/* === js/player/abilities/oneHit.js === */
/* ═══════════════════════════════════════
   ONEHIT.JS
   One Hit — all enemies die in 1 hit
   for 4 seconds. Red super saiyan aura
   (CSS only) + screen shake on attacks.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry
   ═══════════════════════════════════════ */

AbilityRegistry.register({
  id:       'one_hit',
  name:     'One Hit',
  desc:     'all enemies die in 1 hit for 4s',
  icon:     '⚡',
  barColor: '#FBBF24',
  duration: 4000,

  piercing:      false,
  blocksBullets: false,

  onActivate() {
    if (player) player.oneHitActive = true;

    const a = document.getElementById('arena');
    if (!a) return;

    a.classList.add('one-hit-active');

    // create CSS aura overlay
    const aura = document.createElement('div');
    aura.className = 'onehit-aura';
    a.appendChild(aura);
  },

  onDeactivate() {
    if (player) player.oneHitActive = false;

    const a = document.getElementById('arena');
    if (!a) return;

    a.classList.remove('one-hit-active');

    // remove aura
    const aura = a.querySelector('.onehit-aura');
    if (aura) aura.remove();
  },
});

/* === js/player/abilities/doubleStrike.js === */
/* ═══════════════════════════════════════
   DOUBLESTRIKE.JS
   Double Strike — each attack also hits
   the opposite direction for 4 seconds.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry
   ═══════════════════════════════════════ */

AbilityRegistry.register({
  id:       'double_strike',
  name:     'Double Strike',
  desc:     'attacks also hit the opposite side for 4s',
  icon:     '⚔️',
  barColor: '#A855F7',
  duration: 4000,

  piercing:      false,
  blocksBullets: false,

  onActivate() {
    if (player) player.doubleStrikeActive = true;
  },

  onDeactivate() {
    if (player) player.doubleStrikeActive = false;
  },
});

/* === js/player/abilities/slash.js === */
/* ═══════════════════════════════════════
   SLASH.JS
   Slash — piercing full-line attacks
   with high damage for 3s.
   Dark blue aura + Bleach-style energy
   blade with blended gradient colors.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry
   ═══════════════════════════════════════ */

/* ── AURA FX (Canvas, dark blue flames — large) ── */

const SlashFX = (() => {
  let _canvas = null;
  let _ctx = null;
  let _raf = null;
  let _particles = [];
  let _active = false;
  let _time = 0;

  const SIZE = 280;
  const CX = SIZE / 2;
  const CY = SIZE / 2 + 12;

  /* ── FLAME PARTICLE ── */

  function _spawnFlame() {
    const spread = 20 + Math.random() * 16;
    const side = (Math.random() - 0.5) * 2;
    _particles.push({
      x:       CX + side * spread,
      y:       CY + 8 + Math.random() * 8,
      vx:      (Math.random() - 0.5) * 0.9,
      vy:      -(2.2 + Math.random() * 3.0),
      size:    2.5 + Math.random() * 3,
      life:    0,
      maxLife: 0.3 + Math.random() * 0.4,
    });
  }

  /* ── DRAW ── */

  function _draw() {
    if (!_active) return;

    const dt = 0.016;
    _time += dt;
    _ctx.clearRect(0, 0, SIZE, SIZE);

    for (let i = 0; i < 6; i++) _spawnFlame();

    for (let i = _particles.length - 1; i >= 0; i--) {
      const p = _particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) { _particles.splice(i, 1); continue; }

      const progress = p.life / p.maxLife;

      p.vx += (Math.random() - 0.5) * 0.5;
      p.x += p.vx;
      p.y += p.vy;
      p.vy *= 0.98;

      let alpha;
      if (progress < 0.1) {
        alpha = progress / 0.1;
      } else {
        alpha = 1 - ((progress - 0.1) / 0.9);
      }
      alpha *= 0.85;

      const sizeMult = progress < 0.25
        ? 1 + progress * 3
        : 1.75 * (1 - (progress - 0.25) / 0.75);
      const s = Math.max(1, Math.round(p.size * sizeMult));

      // dark blue palette
      const r = Math.round(8  + (18 - 8)   * (1 - progress));
      const g = Math.round(20 + (80 - 20)  * (1 - progress));
      const b = Math.round(60 + (180 - 60) * (1 - progress));

      _ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      const px = Math.round(p.x) - Math.floor(s / 2);
      const py = Math.round(p.y) - Math.floor(s / 2);
      _ctx.fillRect(px, py, s, s);

      if (s >= 2) {
        _ctx.fillStyle = `rgba(10, 26, 74, ${alpha * 0.3})`;
        _ctx.fillRect(px - 1, py - 1, s + 2, s + 2);
      }

      if (progress < 0.15 && Math.random() < 0.25) {
        _ctx.fillStyle = `rgba(51, 180, 220, ${alpha * 0.5})`;
        _ctx.fillRect(px, py, Math.max(1, s - 1), Math.max(1, s - 1));
      }
    }

    _raf = requestAnimationFrame(_draw);
  }

  /* ── PUBLIC ── */

 function start() {
    const a = document.getElementById('arena');
    if (!a) return;
    // cleanup orphaned canvases
    a.querySelectorAll('.slash-aura-canvas').forEach(c => c.remove());

    _canvas = document.createElement('canvas');
    _canvas.width = SIZE;
    _canvas.height = SIZE;
    _canvas.className = 'slash-aura-canvas';
    _canvas.style.cssText = `
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: ${SIZE}px; height: ${SIZE}px;
      pointer-events: none;
      z-index: 5;
      image-rendering: pixelated;
    `;
    a.appendChild(_canvas);

    _ctx = _canvas.getContext('2d');
    _time = 0;
    _particles = [];
    _active = true;
    _draw();

    a.classList.add('slash-active');
  }

  function stop() {
    _active = false;
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }

    const a = document.getElementById('arena');
    if (a) {
      a.classList.remove('slash-active');
      a.querySelectorAll('.slash-aura-canvas').forEach(c => c.remove());
    }
    _canvas = null;
    _ctx = null;
    _particles = [];
  }

  return { start, stop };
})();


/* ── SLASH TRAIL — blended energy blade ── */

function showSlashTrail(dir) {
  const a = document.getElementById('arena');
  if (!a) return;

  SFX.slashAttack();

  const { w, h } = getArenaSize();
  const cx = w / 2;
  const cy = h / 2;

  const duration = 300;

  // rotation based on direction
  let rot = 0;
  if (dir === 'right') rot = 0;
  if (dir === 'left')  rot = 180;
  if (dir === 'up')    rot = -90;
  if (dir === 'down')  rot = 90;

  // target position (off-screen)
  let tx = cx, ty = cy;
  if (dir === 'right') tx = w + 32;
  if (dir === 'left')  tx = -32;
  if (dir === 'up')    ty = -32;
  if (dir === 'down')  ty = h + 32;

  // create slash projectile
  const el = document.createElement('div');
  el.className = 'slash-trail-projectile';
  el.style.left = cx + 'px';
  el.style.top  = cy + 'px';
  el.style.transform = `translate(-50%,-50%) rotate(${rot}deg) scale(1.8)`;
  a.appendChild(el);

  // particle trail — track position with lerp instead of getBoundingClientRect
  const startTime = performance.now();
  const trailInterval = 20;
  const trailTimer = setInterval(() => {
    const elapsed = performance.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    // current projectile position via lerp
    const px = cx + (tx - cx) * t;
    const py = cy + (ty - cy) * t;
    // spawn particles behind the projectile along the travel axis
    _spawnSlashParticle(a, px, py, dir);
  }, trailInterval);

  // start movement after one frame
  requestAnimationFrame(() => {
    el.style.transition = `left ${duration}ms linear, top ${duration}ms linear`;
    el.style.left = tx + 'px';
    el.style.top  = ty + 'px';
  });

  // cleanup
  setTimeout(() => {
    clearInterval(trailTimer);
    el.remove();
  }, duration + 50);

  // center flash on attack
  const flash = document.createElement('div');
  flash.className = 'slash-center-flash';
  flash.style.left = cx + 'px';
  flash.style.top  = cy + 'px';
  a.appendChild(flash);
  setTimeout(() => flash.remove(), 120);
}

/* ── SLASH PARTICLE ── */

function _spawnSlashParticle(container, x, y, dir) {
  const count = 3 + Math.floor(Math.random() * 3); // 3-5 particles
  const isHoriz = (dir === 'left' || dir === 'right');

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'slash-trail-particle';

    // offset behind projectile (along travel axis) + small perpendicular spread
    let ox, oy;
    if (isHoriz) {
      // behind: opposite of travel direction, spread on Y axis (small)
      ox = (dir === 'right' ? -1 : 1) * (4 + Math.random() * 14);
      oy = (Math.random() - 0.5) * 10;
    } else {
      // behind: opposite of travel direction, spread on X axis (small)
      ox = (Math.random() - 0.5) * 10;
      oy = (dir === 'down' ? -1 : 1) * (4 + Math.random() * 14);
    }

    const size = 3 + Math.floor(Math.random() * 4); // 3-6px
    p.style.cssText = `
      left: ${x + ox}px;
      top: ${y + oy}px;
      width: ${size}px;
      height: ${size}px;
    `;
    container.appendChild(p);
    setTimeout(() => p.remove(), 350);
  }
}
/* ── ABILITY REGISTRATION ── */

AbilityRegistry.register({
  id:       'slash',
  name:     'Slash',
  desc:     'piercing full-line attacks with high damage for 3s',
  icon:     '🗡️',
  barColor: '#EC4899',
  duration: 3000,

  piercing:      false,
  blocksBullets: false,

  onActivate() {
    if (player) player.slashActive = true;
    SlashFX.start();
  },

  onDeactivate() {
    if (player) player.slashActive = false;
    SlashFX.stop();
  },
});

/* === js/audio/core.js === */
/* ═══════════════════════════════════════
   AUDIO/CORE.JS
   Web Audio API context with auto-init on
   first user gesture. Provides tone(), noise(),
   playFile(), stopFile() utilities.

   playFile() uses Web Audio API (fetch +
   decodeAudioData + BufferSourceNode) instead
   of HTMLAudioElement to avoid Media Session
   notifications on mobile.

   Includes auto-recovery for suspended/closed
   AudioContext (fixes audio stopping on tab
   switch, screen lock, or browser throttle).

   Master volume via setVolume() — persisted
   in localStorage.

   Depends on: config.js (CONFIG.audio)
   ═══════════════════════════════════════ */

const AudioCore = (() => {

  let ctx = null;
  let _bound = false;
  let _bufferCache = {};     // path → AudioBuffer
  let _pendingLoads = {};    // path → Promise<AudioBuffer>

  /* ═══════════════════════════════════
     CONTEXT MANAGEMENT
     ═══════════════════════════════════ */

  function _createCtx() {
    try {
      const c = new (window.AudioContext || window.webkitAudioContext)();
      // auto-resume if browser suspends context spontaneously
      c.addEventListener('statechange', () => {
        if (c.state === 'suspended' && !_isMuted()) {
          c.resume().catch(() => {});
        }
      });
      return c;
    } catch (e) {
      console.warn('Web Audio API not available', e);
      return null;
    }
  }

  function init() {
    if (ctx) return;
    ctx = _createCtx();
  }

  /* ── ENSURE CONTEXT IS ALIVE AND RUNNING ──
     Called before every audio operation.
     Handles: suspended (resume), closed (recreate),
     interrupted (iOS-specific state). */
  function _ensureCtx() {
    if (!ctx) {
      init();
      if (!ctx) return false;
    }

    // context died — recreate
    if (ctx.state === 'closed') {
      ctx = _createCtx();
      if (!ctx) return false;
      // old buffers are invalid on new context
      _bufferCache = {};
      _pendingLoads = {};
    }

    // context suspended — resume (async but fire-and-forget)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    return true;
  }

  /* ── AUTO-INIT ON FIRST USER GESTURE ── */
  function _autoInit() {
    if (_bound) return;
    _bound = true;
    const handler = () => {
      init();
      if (ctx && ctx.state === 'suspended') ctx.resume();
      document.removeEventListener('click', handler);
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('keydown', handler);
    };
    document.addEventListener('click', handler);
    document.addEventListener('touchstart', handler);
    document.addEventListener('keydown', handler);
  }

  /* ── VISIBILITY CHANGE: resume on tab/app return ── */
  function _initVisibility() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      }
    });
  }

  function getCtx() { return ctx; }
  const vol = () => CONFIG.audio.volume;

  /* ── MUTE CHECK ── */
  function _isMuted() {
    return !CONFIG.audio.enabled || CONFIG.audio.volume <= 0;
  }

  /* ── SET VOLUME ── */
  function setVolume(val) {
    CONFIG.audio.volume = Math.max(0, Math.min(1, val));
    localStorage.setItem('ds_volume', CONFIG.audio.volume.toFixed(2));

    if (CONFIG.audio.volume <= 0) {
      SfxAbilities.stopAll();
    }
  }

  function isMuted() {
    return _isMuted();
  }

  /* ═══════════════════════════════════
     TONE — procedural oscillator
     ═══════════════════════════════════ */
  function tone({
    type = 'sine', freq = 440, freq2 = null,
    duration = 0.15, attack = 0.005, decay = 0.05,
    sustain = 0.6, release = 0.1, gain = 1.0, detune = 0,
  } = {}) {
    if (_isMuted()) return;
    if (!_ensureCtx()) return;
    try {
      const g   = ctx.createGain();
      g.connect(ctx.destination);
      const now = ctx.currentTime;
      const pk  = gain * vol();

      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(pk, now + attack);
      g.gain.linearRampToValueAtTime(pk * sustain, now + attack + decay);
      g.gain.setValueAtTime(pk * sustain, now + duration - release);
      g.gain.linearRampToValueAtTime(0, now + duration);

      const o = ctx.createOscillator();
      o.type         = type;
      o.detune.value = detune;
      o.frequency.setValueAtTime(freq, now);
      if (freq2) o.frequency.linearRampToValueAtTime(freq2, now + duration);

      o.connect(g);
      o.start(now);
      o.stop(now + duration + 0.02);
    } catch (e) {}
  }

  /* ═══════════════════════════════════
     NOISE — procedural noise burst
     ═══════════════════════════════════ */
  function noise({
    duration = 0.1, gain = 0.5,
    highpass = 0, lowpass = 4000,
  } = {}) {
    if (_isMuted()) return;
    if (!_ensureCtx()) return;
    try {
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);

      const src = ctx.createBufferSource();
      src.buffer = buf;

      const g = ctx.createGain();
      g.gain.value = gain * vol();
      src.connect(g);

      let last = g;
      if (highpass > 0) {
        const f = ctx.createBiquadFilter();
        f.type = 'highpass'; f.frequency.value = highpass;
        last.connect(f); last = f;
      }
      if (lowpass < 20000) {
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass'; f.frequency.value = lowpass;
        last.connect(f); last = f;
      }

      last.connect(ctx.destination);
      src.start();
      src.stop(ctx.currentTime + duration + 0.02);
    } catch (e) {}
  }

  /* ═══════════════════════════════════
     BUFFER CACHE — fetch once, reuse
     ═══════════════════════════════════ */
  function _getBuffer(path) {
    if (_bufferCache[path]) return Promise.resolve(_bufferCache[path]);
    if (_pendingLoads[path]) return _pendingLoads[path];

    _pendingLoads[path] = fetch(path)
      .then(r => r.arrayBuffer())
      .then(ab => ctx.decodeAudioData(ab))
      .then(buf => {
        _bufferCache[path] = buf;
        delete _pendingLoads[path];
        return buf;
      })
      .catch(e => {
        delete _pendingLoads[path];
        console.warn('AudioCore: failed to load', path, e);
        return null;
      });

    return _pendingLoads[path];
  }

  /* ═══════════════════════════════════
     AUDIO HANDLE — wraps BufferSourceNode
     Mimics HTMLAudioElement interface:
       .volume, .paused, .currentTime,
       .loop, .pause(), .play()
     Used by sfx-abilities and music for
     pause/resume/fade without changes.
     ═══════════════════════════════════ */
  function _createHandle(opts) {
    const h = {
      _gain:      null,
      _source:    null,
      _buffer:    null,
      _startCtx:  0,
      _offset:    0,
      _volume:    opts.volume * vol(),
      _loop:      opts.loop,
      _paused:    false,
      _stopped:   false,
      _playing:   false,
      _rate:      1.0,
      onEnded:    null,

      get volume()  { return this._volume; },
      set volume(v) {
        this._volume = Math.max(0, Math.min(1, v));
        if (this._gain) {
          try { this._gain.gain.value = this._volume; } catch (e) {}
        }
      },

      get paused() {
        return this._paused || this._stopped || !this._playing;
      },

      get currentTime() {
        if (this._stopped) return 0;
        if (this._paused)  return this._offset;
        if (!this._playing || !ctx) return 0;
        const pos = this._offset + (ctx.currentTime - this._startCtx);
        if (this._buffer && this._loop) return pos % this._buffer.duration;
        return pos;
      },

      get loop()  { return this._loop; },
      set loop(v) {
        this._loop = v;
        if (this._source) this._source.loop = v;
      },

      get playbackRate() { return this._rate; },
      set playbackRate(r) {
        this._rate = r;
        if (this._source) {
          try { this._source.playbackRate.value = r; } catch (e) {}
        }
      },

      get duration() {
        return this._buffer ? this._buffer.duration : 0;
      },

      _start(buffer) {
        if (this._stopped) return;
        if (!ctx || ctx.state === 'closed') return;
        this._buffer = buffer;

        this._gain = ctx.createGain();
        this._gain.gain.value = this._volume;
        this._gain.connect(ctx.destination);

        this._source = ctx.createBufferSource();
        this._source.buffer = buffer;
        this._source.loop   = this._loop;
        this._source.playbackRate.value = this._rate;
        this._source.connect(this._gain);

        this._source.onended = () => {
          if (!this._paused && !this._stopped) {
            this._playing = false;
            this._stopped = true;
            if (this._gain) { this._gain.disconnect(); this._gain = null; }
            this._source = null;
            if (this.onEnded) this.onEnded();
          }
        };

        this._startCtx = ctx.currentTime;
        this._source.start(0, this._offset);
        this._playing = true;
        this._paused  = false;
      },

      pause() {
        if (!this._playing || this._paused || this._stopped) return;
        const elapsed = ctx.currentTime - this._startCtx;
        this._offset = this._offset + elapsed;
        if (this._buffer && this._loop) {
          this._offset = this._offset % this._buffer.duration;
        }
        this._paused  = true;
        this._playing = false;
        if (this._source) {
          try { this._source.onended = null; this._source.stop(); } catch (e) {}
          this._source = null;
        }
        if (this._gain) {
          this._gain.disconnect();
          this._gain = null;
        }
      },

      play() {
        if (this._stopped) return;
        if (!this._paused || !this._buffer) return;
        this._start(this._buffer);
      },

      stop() {
        this._stopped = true;
        this._playing = false;
        this._paused  = false;
        this._offset  = 0;
        if (this._source) {
          try { this._source.onended = null; this._source.stop(); } catch (e) {}
          this._source = null;
        }
        if (this._gain) {
          this._gain.disconnect();
          this._gain = null;
        }
      },
    };

    return h;
  }

  /* ═══════════════════════════════════
     playFile — PUBLIC API
     ═══════════════════════════════════ */
function playFile(path, { loop = false, volume = 1.0, force = false } = {}) {
    if (!force && _isMuted()) return null;
    if (!_ensureCtx()) return null;

    const handle = _createHandle({ loop, volume });

    _getBuffer(path).then(buffer => {
      if (buffer && !handle._stopped) {
        handle._start(buffer);
      }
    });

    return handle;
  }

  /* ═══════════════════════════════════
     stopFile — PUBLIC API
     ═══════════════════════════════════ */
  function stopFile(handle) {
    if (!handle) return;
    if (typeof handle.stop === 'function') {
      handle.stop();
      return;
    }
    // legacy HTMLAudioElement fallback
    if (handle.pause) {
      handle.pause();
      try { handle.currentTime = 0; } catch (e) {}
    }
  }

  // auto-bind + visibility listener on script load
  _autoInit();
  _initVisibility();

  return { init, getCtx, tone, noise, playFile, stopFile, vol, setVolume, isMuted };

})();

/* === js/audio/combat.js === */
/* ═══════════════════════════════════════
   AUDIO/COMBAT.JS
   Combat sound effects: hit, kill, damage,
   miss, bullet, game over.

   Depends on: audio/core.js (AudioCore)
   ═══════════════════════════════════════ */

const SfxCombat = (() => {

  const t = (o) => AudioCore.tone(o);
  const n = (o) => AudioCore.noise(o);

  const SLASH_PATHS = [
    'assets/audio/sfx/combat/slash_1.mp3',
    'assets/audio/sfx/combat/slash_2.mp3',
    'assets/audio/sfx/combat/slash_3.mp3',
  ];

  const HEAL_PATHS = {
    orb:      'assets/audio/sfx/combat/heal_orb.mp3',
    vampiric: 'assets/audio/sfx/combat/heal_vampiric.mp3',
    ability:  'assets/audio/sfx/combat/heal_ability.mp3',
  };

  return {

    // ── HIT BY MATERIAL ──

    hit() {
      // fallback generico — usato se hitSound manca
      t({ type: 'square', freq: 180, freq2: 80, duration: 0.08, attack: 0.002, decay: 0.03, sustain: 0.3, release: 0.04, gain: 0.6 });
      n({ duration: 0.05, gain: 0.25, highpass: 800, lowpass: 3000 });
    },

    hitFlesh() {
      // meaty thud — fist sinking into flesh, satisfying weight
      const rnd = 1 + (Math.random() - 0.5) * 0.08;
      // deep body impact
      t({ type: 'sine', freq: 160 * rnd, freq2: 90, duration: 0.18, attack: 0.003, decay: 0.06, sustain: 0.35, release: 0.09, gain: 0.55 });
      // mid punch thud
      t({ type: 'triangle', freq: 320 * rnd, freq2: 200, duration: 0.12, attack: 0.002, decay: 0.04, sustain: 0.25, release: 0.06, gain: 0.35 });
      // soft tissue noise layer
      n({ duration: 0.1, gain: 0.2, highpass: 300, lowpass: 2000 });
    },

    hitRock() {
      // hard crack — blade on stone, sharp and resonant
      const rnd = 1 + (Math.random() - 0.5) * 0.06;
      // sharp stone crack
      t({ type: 'triangle', freq: 800 * rnd, freq2: 500, duration: 0.14, attack: 0.001, decay: 0.04, sustain: 0.3, release: 0.08, gain: 0.5 });
      // deep weight underneath
      t({ type: 'sine', freq: 120 * rnd, freq2: 70, duration: 0.2, attack: 0.003, decay: 0.07, sustain: 0.3, release: 0.1, gain: 0.4 });
      // debris crunch
      n({ duration: 0.12, gain: 0.3, highpass: 600, lowpass: 4000 });
      // secondary ring — delayed, stone resonance
      setTimeout(() =>
        t({ type: 'triangle', freq: 1200 * rnd, freq2: 900, duration: 0.1, attack: 0.002, decay: 0.03, sustain: 0.2, release: 0.05, gain: 0.2 })
      , 25);
    },

    hitSlime() {
      // wet splat — viscous burst, bubbly and satisfying
      const rnd = 1 + (Math.random() - 0.5) * 0.1;
      // pitch-down blob burst
      t({ type: 'sine', freq: 550 * rnd, freq2: 180, duration: 0.2, attack: 0.002, decay: 0.06, sustain: 0.3, release: 0.1, gain: 0.45 });
      // bubbly overtone
      t({ type: 'sine', freq: 900 * rnd, freq2: 350, duration: 0.15, attack: 0.003, decay: 0.05, sustain: 0.25, release: 0.07, gain: 0.25 });
      // wet noise — filtered low for gooey feel
      n({ duration: 0.14, gain: 0.25, highpass: 200, lowpass: 1800 });
    },

    hitShell() {
      // hard clank — metallic armor impact, rings briefly
      const rnd = 1 + (Math.random() - 0.5) * 0.06;
      // primary clank
      t({ type: 'triangle', freq: 600 * rnd, freq2: 450, duration: 0.16, attack: 0.001, decay: 0.05, sustain: 0.35, release: 0.08, gain: 0.5 });
      // metallic ring overtone
      t({ type: 'sine', freq: 1400 * rnd, freq2: 1100, duration: 0.12, attack: 0.002, decay: 0.04, sustain: 0.25, release: 0.06, gain: 0.3 });
      // impact crack noise
      n({ duration: 0.08, gain: 0.22, highpass: 1000, lowpass: 5000 });
      // resonant tail — delayed
      setTimeout(() =>
        t({ type: 'sine', freq: 700 * rnd, freq2: 550, duration: 0.14, attack: 0.003, decay: 0.05, sustain: 0.2, release: 0.07, gain: 0.18 })
      , 30);
    },

    hitEthereal() {
      // airy swish — cutting through wind/spirit, hollow impact
      const rnd = 1 + (Math.random() - 0.5) * 0.08;
      // hollow whoosh sweep
      t({ type: 'sine', freq: 400 * rnd, freq2: 700, duration: 0.22, attack: 0.005, decay: 0.07, sustain: 0.3, release: 0.1, gain: 0.35 });
      // high shimmer
      t({ type: 'sine', freq: 1600 * rnd, freq2: 2200, duration: 0.16, attack: 0.004, decay: 0.05, sustain: 0.2, release: 0.08, gain: 0.18 });
      // breathy wind noise — bandpass sweep feel
      n({ duration: 0.18, gain: 0.2, highpass: 800, lowpass: 3500 });
    },

    hitThunder() {
      // electric crackle — spark burst, sharp and buzzy
      const rnd = 1 + (Math.random() - 0.5) * 0.07;
      // electric zap
      t({ type: 'sine', freq: 1000 * rnd, freq2: 600, duration: 0.12, attack: 0.001, decay: 0.03, sustain: 0.3, release: 0.07, gain: 0.45 });
      // buzzy undertone
      t({ type: 'triangle', freq: 350 * rnd, freq2: 200, duration: 0.16, attack: 0.002, decay: 0.05, sustain: 0.25, release: 0.08, gain: 0.35 });
      // electric crackle noise — high and sharp
      n({ duration: 0.1, gain: 0.3, highpass: 2000, lowpass: 8000 });
      // secondary spark — delayed
      setTimeout(() =>
        t({ type: 'sine', freq: 1400 * rnd, freq2: 800, duration: 0.08, attack: 0.001, decay: 0.02, sustain: 0.2, release: 0.04, gain: 0.25 })
      , 20);
    },

    hitDemon() {
      // demonic heavy blow — deep rumble + dark mid + ominous ring
      const rnd = 1 + (Math.random() - 0.5) * 0.06;
      // sub rumble
      t({ type: 'sine', freq: 75 * rnd, freq2: 45, duration: 0.25, attack: 0.004, decay: 0.08, sustain: 0.35, release: 0.12, gain: 0.6 });
      // dark mid growl
      t({ type: 'triangle', freq: 250 * rnd, freq2: 160, duration: 0.18, attack: 0.003, decay: 0.06, sustain: 0.3, release: 0.08, gain: 0.4 });
      // ominous high ring — delayed
      setTimeout(() =>
        t({ type: 'sine', freq: 500 * rnd, freq2: 380, duration: 0.16, attack: 0.005, decay: 0.05, sustain: 0.25, release: 0.08, gain: 0.22 })
      , 35);
      // dark noise layer
      n({ duration: 0.15, gain: 0.25, highpass: 150, lowpass: 2000 });
    },

    kill() {
      t({ type: 'sine', freq: 330, freq2: 520, duration: 0.18, attack: 0.005, decay: 0.06, sustain: 0.5, release: 0.08, gain: 0.8 });
      setTimeout(() =>
        t({ type: 'sine', freq: 660, freq2: 880, duration: 0.14, attack: 0.003, decay: 0.05, sustain: 0.4, release: 0.06, gain: 0.5 })
      , 60);
    },

    damage() {
      // player hit — sharp pain impact + body thud, punishing but not annoying
      const rnd = 1 + (Math.random() - 0.5) * 0.06;
      // sharp pain sting
      t({ type: 'sine', freq: 700 * rnd, freq2: 350, duration: 0.14, attack: 0.001, decay: 0.04, sustain: 0.3, release: 0.08, gain: 0.5 });
      // deep body impact
      t({ type: 'sine', freq: 120 * rnd, freq2: 60, duration: 0.2, attack: 0.003, decay: 0.07, sustain: 0.25, release: 0.1, gain: 0.45 });
      // dull thud noise
      n({ duration: 0.12, gain: 0.25, highpass: 200, lowpass: 2000 });
    },
    berserker() {
      // rage awakening — deep growl surge + rising power
      const rnd = 1 + (Math.random() - 0.5) * 0.04;
      // deep rumble surge
      t({ type: 'sine', freq: 80 * rnd, freq2: 140, duration: 0.35, attack: 0.005, decay: 0.1, sustain: 0.4, release: 0.15, gain: 0.5 });
      // mid growl rising
      t({ type: 'triangle', freq: 200 * rnd, freq2: 400, duration: 0.3, attack: 0.004, decay: 0.08, sustain: 0.35, release: 0.12, gain: 0.35 });
      // power noise swell
      n({ duration: 0.25, gain: 0.2, highpass: 150, lowpass: 2500 });
      // high ring — delayed, rage confirmed
      setTimeout(() =>
        t({ type: 'sine', freq: 600 * rnd, freq2: 800, duration: 0.18, attack: 0.005, decay: 0.06, sustain: 0.25, release: 0.1, gain: 0.25 })
      , 120);
    },
    miss() {
      // whiff — airy slash that hits nothing, unsatisfying but not annoying
      const rnd = 1 + (Math.random() - 0.5) * 0.08;
      // hollow swoosh descending
      t({ type: 'sine', freq: 350 * rnd, freq2: 180, duration: 0.16, attack: 0.003, decay: 0.05, sustain: 0.25, release: 0.08, gain: 0.25 });
      // airy noise layer — whoosh feel
      n({ duration: 0.14, gain: 0.18, highpass: 500, lowpass: 3000 });
    },

    parry() {
      AudioCore.playFile('assets/audio/sfx/combat/parry.mp3', { volume: 0.15 });
    },

    crit() {
      // heavy devastating blow — deep impact + mid crunch + high ring
      const rnd = 1 + (Math.random() - 0.5) * 0.05;
      // deep body slam
      t({ type: 'sine',     freq: 90 * rnd,  freq2: 50,  duration: 0.25, attack: 0.003, decay: 0.08, sustain: 0.4, release: 0.12, gain: 0.7 });
      // mid crunch
      t({ type: 'triangle', freq: 280 * rnd, freq2: 180, duration: 0.18, attack: 0.002, decay: 0.06, sustain: 0.3, release: 0.08, gain: 0.5 });
      // high metallic ring — delayed slightly
      setTimeout(() =>
        t({ type: 'sine', freq: 700 * rnd, freq2: 500, duration: 0.15, attack: 0.005, decay: 0.05, sustain: 0.3, release: 0.08, gain: 0.3 })
      , 30);
      // noise crunch layer
      n({ duration: 0.15, gain: 0.35, highpass: 400, lowpass: 2500 });
    },
oneHitSmash() {
      // devastating body blow — deep slam + bone crunch + dark ring
      const rnd = 1 + (Math.random() - 0.5) * 0.06;
      // deep body slam
      t({ type: 'sine', freq: 70 * rnd, freq2: 35, duration: 0.3, attack: 0.002, decay: 0.08, sustain: 0.4, release: 0.15, gain: 0.65 });
      // bone crunch mid
      t({ type: 'triangle', freq: 250 * rnd, freq2: 130, duration: 0.2, attack: 0.002, decay: 0.06, sustain: 0.3, release: 0.1, gain: 0.5 });
      // dark heavy noise
      n({ duration: 0.18, gain: 0.35, highpass: 150, lowpass: 2000 });
      // ominous low ring — delayed
      setTimeout(() =>
        t({ type: 'sine', freq: 140 * rnd, freq2: 90, duration: 0.2, attack: 0.005, decay: 0.06, sustain: 0.25, release: 0.1, gain: 0.3 })
      , 40);
    },
    freeze() {
      AudioCore.playFile('assets/audio/sfx/combat/freeze.mp3', { volume: 0.15 });
    },

     slash() {
      const path = SLASH_PATHS[Math.floor(Math.random() * SLASH_PATHS.length)];
      AudioCore.playFile(path, { volume: 0.05 });
    },
multiKill(count) {
      // escalating power chord — 2=double, 3=triple, 4+=mega/ultra
      const rnd = 1 + (Math.random() - 0.5) * 0.04;
      const intensity = Math.min(1, (count - 1) / 3);
      const base = 500 + intensity * 300;
      const vol = 0.35 + intensity * 0.2;
      // impact hit
      t({ type: 'sine', freq: base * rnd, freq2: base * 1.3, duration: 0.2, attack: 0.002, decay: 0.05, sustain: 0.4, release: 0.1, gain: vol });
      // power fifth
      setTimeout(() =>
        t({ type: 'sine', freq: base * 1.5 * rnd, freq2: base * 1.8, duration: 0.18, attack: 0.003, decay: 0.05, sustain: 0.35, release: 0.08, gain: vol * 0.8 })
      , 35);
      // octave ring for 3+
      if (count >= 3) {
        setTimeout(() =>
          t({ type: 'sine', freq: base * 2 * rnd, duration: 0.16, attack: 0.004, decay: 0.05, sustain: 0.3, release: 0.08, gain: vol * 0.6 })
        , 75);
      }
      // epic shimmer for 4+
      if (count >= 4) {
        n({ duration: 0.15, gain: 0.18, highpass: 3000, lowpass: 9000 });
      }
    },

    luckyShield() {
      // magic barrier deflect — warm resonant block + sparkle
      const rnd = 1 + (Math.random() - 0.5) * 0.05;
      // barrier resonance
      t({ type: 'sine', freq: 600 * rnd, freq2: 800, duration: 0.2, attack: 0.002, decay: 0.05, sustain: 0.35, release: 0.1, gain: 0.4 });
      // bright deflect ping
      t({ type: 'sine', freq: 1400 * rnd, freq2: 1800, duration: 0.14, attack: 0.001, decay: 0.03, sustain: 0.25, release: 0.08, gain: 0.3 });
      // soft sparkle noise
      n({ duration: 0.1, gain: 0.12, highpass: 2500, lowpass: 8000 });
    },


    orbCollect() {
      // crystal chime — bright ping + harmonic overtone
      const rnd = 1 + (Math.random() - 0.5) * 0.06;
      t({ type: 'sine',     freq: 1200 * rnd, freq2: 1500, duration: 0.2,  attack: 0.003, decay: 0.06, sustain: 0.4, release: 0.1,  gain: 0.4 });
      t({ type: 'triangle', freq: 2400 * rnd, freq2: 2800, duration: 0.15, attack: 0.002, decay: 0.04, sustain: 0.3, release: 0.08, gain: 0.2 });
      n({ duration: 0.06, gain: 0.1, highpass: 4000, lowpass: 10000 });
    },

      healOrb() {
      AudioCore.playFile(HEAL_PATHS.orb, { volume: 0.15 });
    },

    healVampiric() {
      AudioCore.playFile(HEAL_PATHS.vampiric, { volume: 0.12 });
    },

    healAbility() {
      AudioCore.playFile(HEAL_PATHS.ability, { volume: 0.18 });
    },

    bullet() {
      t({ type: 'sine', freq: 800, freq2: 300, duration: 0.14, attack: 0.002, decay: 0.05, sustain: 0.3, release: 0.07, gain: 0.28 });
    },
    comboTick(combo, tierIndex) {
      // pitch climbs within current tier, resets at each tier change
      // tierIndex 0=white, 1=blue, 2=yellow, 3=orange, 4=red, 5=purple, 6=rainbow
      const TIER_BASE  = [400, 500, 600, 720, 850, 1000, 1200];
      const TIER_RANGE = [80,  90,  100, 110, 120, 140,  160];
      const tiers = CONFIG.combo.tiers;
      const tierStart = tiers[tierIndex][0];
      const tierEnd   = tierIndex < tiers.length - 1 ? tiers[tierIndex + 1][0] : tierStart + 20;
      // progress within tier: 0.0 → 1.0
      const progress = Math.min(1, (combo - tierStart) / Math.max(1, tierEnd - tierStart));
      const base  = TIER_BASE[tierIndex]  || 1200;
      const range = TIER_RANGE[tierIndex] || 160;
      const pitch = base + progress * range;
      const rnd = 1 + (Math.random() - 0.5) * 0.04;
      // volume grows with tier
      const vol = Math.min(0.3, 0.12 + tierIndex * 0.03);

      // main chime — ascending within tier
      t({ type: 'sine', freq: pitch * rnd, freq2: pitch * 1.1, duration: 0.16, attack: 0.002, decay: 0.04, sustain: 0.35, release: 0.08, gain: vol });
      // harmonic overtone — richer at higher tiers
      const overtoneGain = Math.min(0.12, 0.03 + tierIndex * 0.015);
      t({ type: 'sine', freq: pitch * 2 * rnd, duration: 0.12, attack: 0.003, decay: 0.03, sustain: 0.2, release: 0.06, gain: overtoneGain });
      // shimmer noise from tier 3 (orange) onward
      if (tierIndex >= 3) {
        n({ duration: 0.08, gain: 0.06 + (tierIndex - 3) * 0.03, highpass: 4000, lowpass: 10000 });
      }
    },

    comboThreshold(tierIndex) {
      // tier-up burst — plays when color changes
      // tierIndex 0=white (never fires), 1=blue, 2=yellow, 3=orange, 4=red, 5=purple, 6=rainbow
      const TIER_CHORDS = [
        [400, 500, 600],     // 0 white (not used — first tier doesn't trigger threshold)
        [500, 625, 750],     // 1 blue — clean fifth
        [600, 750, 900],     // 2 yellow — bright
        [700, 875, 1050],    // 3 orange — warm power
        [820, 1025, 1230],   // 4 red — intense
        [950, 1190, 1425],   // 5 purple — triumphant
        [1100, 1375, 1650],  // 6 rainbow — epic climax
      ];
      const rnd = 1 + (Math.random() - 0.5) * 0.03;
      const chord = TIER_CHORDS[tierIndex] || TIER_CHORDS[6];
      const vol = Math.min(0.3, 0.15 + tierIndex * 0.02);
      const dur = 0.2 + tierIndex * 0.015;

      // three-note ascending chord
      t({ type: 'sine', freq: chord[0] * rnd, duration: dur, attack: 0.003, decay: 0.06, sustain: 0.4, release: 0.1, gain: vol });
      setTimeout(() =>
        t({ type: 'sine', freq: chord[1] * rnd, duration: dur * 0.85, attack: 0.003, decay: 0.05, sustain: 0.35, release: 0.08, gain: vol * 0.9 })
      , 40);
      setTimeout(() =>
        t({ type: 'sine', freq: chord[2] * rnd, duration: dur * 0.9, attack: 0.004, decay: 0.06, sustain: 0.3, release: 0.1, gain: vol * 0.8 })
      , 90);
      // shimmer — grows with tier
      n({ duration: 0.1 + tierIndex * 0.02, gain: 0.04 + tierIndex * 0.01, highpass: 3000, lowpass: 9000 });
      // rainbow tier (6): extra octave tail for epic feel
      if (tierIndex >= 6) {
        setTimeout(() =>
          t({ type: 'sine', freq: chord[2] * 2 * rnd, duration: 0.25, attack: 0.005, decay: 0.08, sustain: 0.25, release: 0.12, gain: 0.12 })
        , 150);
      }
    },
    comboLost(combo) {
      // deflating sigh — scales with how big the combo was
      // tier lookup for intensity: losing a rainbow combo hurts more than blue
      const tiers = CONFIG.combo.tiers;
      let tierIdx = 0;
      for (let i = tiers.length - 1; i >= 0; i--) {
        if (combo >= tiers[i][0]) { tierIdx = i; break; }
      }
      const intensity = Math.min(1, tierIdx / (tiers.length - 1));
      // sad descending tone — pitch drops more for bigger combos lost
      const startFreq = 380 + intensity * 280;
      const dur = 0.28 + intensity * 0.15;
      t({ type: 'sine', freq: startFreq, freq2: 170, duration: dur, attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.15, gain: 0.28 + intensity * 0.2 });
      // hollow undertone
      t({ type: 'triangle', freq: startFreq * 0.5, freq2: 90, duration: dur * 0.85, attack: 0.004, decay: 0.08, sustain: 0.25, release: 0.12, gain: 0.18 + intensity * 0.1 });
      // breathy noise — deflation feel, longer at high tiers
      n({ duration: 0.18 + intensity * 0.1, gain: 0.1 + intensity * 0.08, highpass: 200, lowpass: 1500 });
    },

    gameOver() {
      const seq = [{ f: 330, d: 0.18 }, { f: 220, d: 0.18 }, { f: 165, d: 0.28 }];
      seq.forEach((s, i) =>
        setTimeout(() =>
          t({ type: 'sawtooth', freq: s.f, duration: s.d, attack: 0.005, decay: 0.08, sustain: 0.4, release: 0.1, gain: 0.45 })
        , i * 160)
      );
    },

  };

})();

/* === js/audio/ui.js === */
/* ═══════════════════════════════════════
   AUDIO/UI.JS
   UI sound effects — modern RPG pixel style.
   Clean sine/triangle tones with lowpass
   filters, no harsh square waves.

   Depends on: audio/core.js (AudioCore)
   ═══════════════════════════════════════ */

const SfxUi = (() => {

  const t = (o) => AudioCore.tone(o);
  const n = (o) => AudioCore.noise(o);

  /* helper: delayed tone */
  function td(delay, o) {
    setTimeout(() => t(o), delay);
  }

  /* helper: delayed noise */
  function nd(delay, o) {
    setTimeout(() => n(o), delay);
  }

  return {

    /* ── HOVER: soft bell tap ── */
    hover() {
      t({ type: 'sine', freq: 1800, duration: 0.07, attack: 0.003,
          decay: 0.03, sustain: 0.15, release: 0.03, gain: 0.08 });
      t({ type: 'sine', freq: 2700, duration: 0.05, attack: 0.003,
          decay: 0.02, sustain: 0.1, release: 0.02, gain: 0.04 });
    },

    /* ── CLICK: crisp confirmation ping ── */
  click() {
      t({ type: 'sine', freq: 1400, duration: 0.05, attack: 0.003,
          decay: 0.02, sustain: 0.15, release: 0.02, gain: 0.04 });
      t({ type: 'sine', freq: 2100, duration: 0.04, attack: 0.003,
          decay: 0.015, sustain: 0.1, release: 0.015, gain: 0.02 });
    },

    /* ── BACK: gentle descending tone ── */
    back() {
      t({ type: 'triangle', freq: 700, freq2: 400, duration: 0.12,
          attack: 0.005, decay: 0.04, sustain: 0.3, release: 0.05, gain: 0.15 });
      t({ type: 'sine', freq: 1050, freq2: 600, duration: 0.1,
          attack: 0.005, decay: 0.03, sustain: 0.2, release: 0.04, gain: 0.06 });
    },

    /* ── ERROR: muffled double thud ── */
    error() {
      t({ type: 'triangle', freq: 250, duration: 0.12, attack: 0.005,
          decay: 0.05, sustain: 0.4, release: 0.05, gain: 0.2 });
      td(90, { type: 'triangle', freq: 200, duration: 0.15, attack: 0.005,
          decay: 0.05, sustain: 0.35, release: 0.06, gain: 0.18 });
      nd(50, { duration: 0.08, gain: 0.06, highpass: 100, lowpass: 600 });
    },

    /* ── PAUSE OPEN: airy descending whoosh ── */
    pauseOpen() {
      t({ type: 'sine', freq: 900, freq2: 350, duration: 0.25,
          attack: 0.01, decay: 0.08, sustain: 0.3, release: 0.1, gain: 0.15 });
      t({ type: 'sine', freq: 1350, freq2: 520, duration: 0.2,
          attack: 0.01, decay: 0.06, sustain: 0.2, release: 0.08, gain: 0.07 });
      n({ duration: 0.12, gain: 0.06, highpass: 1000, lowpass: 4000 });
    },

    /* ── PAUSE CLOSE: ascending shimmer ── */
    pauseClose() {
      t({ type: 'sine', freq: 400, freq2: 900, duration: 0.18,
          attack: 0.008, decay: 0.05, sustain: 0.35, release: 0.07, gain: 0.16 });
      t({ type: 'sine', freq: 600, freq2: 1350, duration: 0.15,
          attack: 0.008, decay: 0.04, sustain: 0.25, release: 0.06, gain: 0.08 });
      nd(50, { duration: 0.08, gain: 0.05, highpass: 2000, lowpass: 6000 });
    },

    /* ── MAP SLIDE: soft swipe tick ── */
    mapSlide() {
      t({ type: 'sine', freq: 600, freq2: 900, duration: 0.06,
          attack: 0.003, decay: 0.02, sustain: 0.2, release: 0.025, gain: 0.12 });
      n({ duration: 0.025, gain: 0.04, highpass: 3000, lowpass: 7000 });
    },

    /* ── MAP CONFIRM: warm ascending chime ── */
    mapConfirm() {
      t({ type: 'sine', freq: 523, duration: 0.1, attack: 0.005,
          decay: 0.03, sustain: 0.4, release: 0.04, gain: 0.18 });
      td(80, { type: 'sine', freq: 659, duration: 0.1, attack: 0.005,
          decay: 0.03, sustain: 0.4, release: 0.04, gain: 0.16 });
      td(160, { type: 'sine', freq: 784, duration: 0.15, attack: 0.005,
          decay: 0.04, sustain: 0.35, release: 0.07, gain: 0.18 });
      td(160, { type: 'sine', freq: 1568, duration: 0.12, attack: 0.008,
          decay: 0.04, sustain: 0.15, release: 0.06, gain: 0.06 });
    },

    /* ── CARD HOVER: tiny crystal tap ── */
    cardHover() {
      t({ type: 'sine', freq: 1400, duration: 0.05, attack: 0.003,
          decay: 0.02, sustain: 0.15, release: 0.02, gain: 0.07 });
      t({ type: 'sine', freq: 2100, duration: 0.04, attack: 0.003,
          decay: 0.015, sustain: 0.1, release: 0.015, gain: 0.03 });
    },

    /* ── CARD PICK: magic sparkle confirm ── */
    cardPick() {
      t({ type: 'sine', freq: 523, duration: 0.08, attack: 0.004,
          decay: 0.025, sustain: 0.4, release: 0.03, gain: 0.16 });
      td(60, { type: 'sine', freq: 784, duration: 0.08, attack: 0.004,
          decay: 0.025, sustain: 0.4, release: 0.03, gain: 0.14 });
      td(120, { type: 'sine', freq: 1047, duration: 0.12, attack: 0.005,
          decay: 0.035, sustain: 0.3, release: 0.05, gain: 0.16 });
      nd(120, { duration: 0.06, gain: 0.06, highpass: 4000, lowpass: 10000 });
      td(150, { type: 'sine', freq: 1568, duration: 0.08, attack: 0.008,
          decay: 0.03, sustain: 0.12, release: 0.04, gain: 0.05 });
    },

    /* ── COUNTDOWN: resonant bell tick ── */
    countdown() {
      t({ type: 'sine', freq: 520, duration: 0.15, attack: 0.004,
          decay: 0.05, sustain: 0.3, release: 0.07, gain: 0.2 });
      t({ type: 'sine', freq: 1040, duration: 0.1, attack: 0.004,
          decay: 0.04, sustain: 0.15, release: 0.05, gain: 0.07 });
    },

    /* ── COUNTDOWN GO: burst of energy ── */
    countdownGo() {
      t({ type: 'sine', freq: 520, duration: 0.06, attack: 0.003,
          decay: 0.02, sustain: 0.4, release: 0.02, gain: 0.2 });
      td(50, { type: 'sine', freq: 1047, duration: 0.2, attack: 0.005,
          decay: 0.06, sustain: 0.3, release: 0.1, gain: 0.22 });
      td(50, { type: 'sine', freq: 1568, duration: 0.15, attack: 0.008,
          decay: 0.05, sustain: 0.15, release: 0.08, gain: 0.08 });
      nd(50, { duration: 0.1, gain: 0.1, highpass: 2000, lowpass: 7000 });
    },

    /* ── MAP COMPLETE: victory fanfare ── */
    mapComplete() {
      const notes = [
        { f: 523, d: 0.12 }, { f: 659, d: 0.12 },
        { f: 784, d: 0.12 }, { f: 1047, d: 0.25 },
      ];
      let time = 0;
      notes.forEach(({ f, d }) => {
        td(time, { type: 'sine', freq: f, duration: d, attack: 0.006,
            decay: 0.04, sustain: 0.4, release: d * 0.4, gain: 0.18 });
        td(time, { type: 'sine', freq: f * 1.5, duration: d * 0.7,
            attack: 0.008, decay: 0.03, sustain: 0.15, release: d * 0.3, gain: 0.05 });
        time += Math.round(d * 850);
      });
      nd(time - 50, { duration: 0.15, gain: 0.07, highpass: 3000, lowpass: 10000 });
    },

    /* ── GAME OVER: somber descent ── */
    gameOver() {
      const notes = [
        { f: 440, d: 0.22 }, { f: 380, d: 0.22 },
        { f: 330, d: 0.25 }, { f: 220, d: 0.4 },
      ];
      let time = 0;
      notes.forEach(({ f, d }) => {
        td(time, { type: 'sine', freq: f, duration: d, attack: 0.01,
            decay: 0.06, sustain: 0.45, release: d * 0.35, gain: 0.2 });
        td(time, { type: 'sine', freq: f * 0.5, duration: d, attack: 0.015,
            decay: 0.06, sustain: 0.3, release: d * 0.3, gain: 0.08 });
        time += Math.round(d * 800);
      });
      nd(time - 100, { duration: 0.25, gain: 0.08, highpass: 100, lowpass: 800 });
    },

    /* ── LEVEL UP: warm ascending sequence ── */
    levelUp() {
      const seq = [
        { f: 440, d: 0.1 }, { f: 550, d: 0.1 },
        { f: 660, d: 0.1 }, { f: 880, d: 0.18 },
      ];
      seq.forEach((s, i) =>
        td(i * 90, { type: 'sine', freq: s.f, duration: s.d,
            attack: 0.005, decay: 0.04, sustain: 0.4, release: 0.06, gain: 0.18 })
      );
    },

    /* ── ABILITY PICK: kept for legacy compat ── */
    abilityPick() {
      t({ type: 'sine', freq: 660, freq2: 990, duration: 0.20,
          attack: 0.005, decay: 0.06, sustain: 0.4, release: 0.1, gain: 0.18 });
      td(100, { type: 'sine', freq: 990, duration: 0.15, attack: 0.003,
          decay: 0.05, sustain: 0.3, release: 0.08, gain: 0.12 });
    },

    /* ── SHIELD BLOCK: soft resonant tap ── */
    shield() {
      t({ type: 'sine', freq: 520, freq2: 620, duration: 0.12,
          attack: 0.01, decay: 0.04, sustain: 0.4, release: 0.06, gain: 0.18 });
    },

    /* ── TRANSITION IN: rumble down ── */
    transIn() {
      n({ duration: 0.35, gain: 0.15, highpass: 200, lowpass: 2000 });
      t({ type: 'sine', freq: 300, freq2: 80, duration: 0.30,
          attack: 0.01, decay: 0.08, sustain: 0.4, release: 0.15, gain: 0.15 });
    },

    /* ── TRANSITION OUT: shimmer up ── */
    transOut() {
      n({ duration: 0.25, gain: 0.10, highpass: 800, lowpass: 4000 });
      t({ type: 'sine', freq: 150, freq2: 400, duration: 0.25,
          attack: 0.01, decay: 0.06, sustain: 0.4, release: 0.12, gain: 0.12 });
    },

    /* ── SLOT TICK: mechanical click during spin ── */
    slotTick() {
      t({ type: 'triangle', freq: 1200, freq2: 800, duration: 0.03,
          attack: 0.002, decay: 0.01, sustain: 0.15, release: 0.01, gain: 0.06 });
      n({ duration: 0.015, gain: 0.03, highpass: 3000, lowpass: 8000 });
    },

    /* ── SLOT STOP: thunk when reel lands ── */
    slotStop() {
      t({ type: 'triangle', freq: 300, freq2: 180, duration: 0.12,
          attack: 0.004, decay: 0.04, sustain: 0.4, release: 0.06, gain: 0.2 });
      t({ type: 'sine', freq: 600, duration: 0.08, attack: 0.003,
          decay: 0.03, sustain: 0.2, release: 0.04, gain: 0.08 });
      n({ duration: 0.06, gain: 0.08, highpass: 200, lowpass: 1500 });
    },

    /* ── SLOT WIN: triumphant fanfare ── */
    slotWin() {
      t({ type: 'sine', freq: 523, duration: 0.1, attack: 0.005,
          decay: 0.03, sustain: 0.45, release: 0.04, gain: 0.2 });
      td(100, { type: 'sine', freq: 659, duration: 0.1, attack: 0.005,
          decay: 0.03, sustain: 0.45, release: 0.04, gain: 0.18 });
      td(200, { type: 'sine', freq: 784, duration: 0.1, attack: 0.005,
          decay: 0.03, sustain: 0.45, release: 0.04, gain: 0.18 });
      td(300, { type: 'sine', freq: 1047, duration: 0.25, attack: 0.005,
          decay: 0.05, sustain: 0.4, release: 0.12, gain: 0.22 });
      td(300, { type: 'sine', freq: 1568, duration: 0.2, attack: 0.008,
          decay: 0.04, sustain: 0.15, release: 0.1, gain: 0.07 });
      nd(350, { duration: 0.15, gain: 0.08, highpass: 3000, lowpass: 10000 });
    },

    /* ── SLOT NEAR MISS: tense descending whiff ── */
    slotNearMiss() {
      t({ type: 'sine', freq: 600, freq2: 250, duration: 0.35,
          attack: 0.008, decay: 0.08, sustain: 0.4, release: 0.15, gain: 0.18 });
      td(50, { type: 'sine', freq: 900, freq2: 375, duration: 0.3,
          attack: 0.008, decay: 0.06, sustain: 0.25, release: 0.12, gain: 0.08 });
      nd(100, { duration: 0.15, gain: 0.06, highpass: 200, lowpass: 1200 });
    },

    /* ═══ NORMAL MAP CHANGE — magical portal ═══ */

    /* Phase 1: mystical energy gathering */
    mapNormalRise() {
      // warm magic hum rising
      t({ type: 'sine', freq: 220, freq2: 440, duration: 0.9,
          attack: 0.05, decay: 0.15, sustain: 0.45, release: 0.35, gain: 0.3 });
      // shimmering harmonic
      t({ type: 'sine', freq: 660, freq2: 1100, duration: 0.8,
          attack: 0.06, decay: 0.12, sustain: 0.3, release: 0.3, gain: 0.15 });
      // crystal sparkle overtone
      t({ type: 'sine', freq: 1320, freq2: 1760, duration: 0.6,
          attack: 0.08, decay: 0.1, sustain: 0.2, release: 0.25, gain: 0.08 });
      // soft airy breath
      n({ duration: 0.5, gain: 0.08, highpass: 2000, lowpass: 8000 });
    },

    /* Phase 2: magic surge expanding */
    mapNormalCover() {
      // portal whoosh — ascending sweep
      t({ type: 'sine', freq: 300, freq2: 800, duration: 0.5,
          attack: 0.008, decay: 0.1, sustain: 0.4, release: 0.2, gain: 0.35 });
      // bright bell chime
      t({ type: 'sine', freq: 880, freq2: 1320, duration: 0.4,
          attack: 0.005, decay: 0.08, sustain: 0.35, release: 0.18, gain: 0.25 });
      // high sparkle layer
      t({ type: 'sine', freq: 2200, freq2: 2800, duration: 0.3,
          attack: 0.01, decay: 0.06, sustain: 0.2, release: 0.15, gain: 0.1 });
      // magical shimmer noise
      n({ duration: 0.35, gain: 0.12, highpass: 3000, lowpass: 10000 });
    },

    /* Phase 3: flash — bright burst of energy */
    mapNormalFlash() {
      // warm deep pulse
      t({ type: 'sine', freq: 180, freq2: 100, duration: 0.3,
          attack: 0.003, decay: 0.08, sustain: 0.35, release: 0.15, gain: 0.35 });
      // bright chime burst
      t({ type: 'sine', freq: 1047, freq2: 784, duration: 0.25,
          attack: 0.002, decay: 0.06, sustain: 0.3, release: 0.12, gain: 0.3 });
      // crystal ring
      t({ type: 'sine', freq: 1568, duration: 0.2,
          attack: 0.003, decay: 0.05, sustain: 0.25, release: 0.1, gain: 0.15 });
      // sparkle noise burst
      n({ duration: 0.15, gain: 0.15, highpass: 4000, lowpass: 12000 });
    },

    /* Phase 4: gentle magical echo fading */
    mapNormalReveal() {
      // warm fading bell
      t({ type: 'sine', freq: 440, freq2: 330, duration: 0.7,
          attack: 0.02, decay: 0.15, sustain: 0.25, release: 0.35, gain: 0.2 });
      // harmonic fifth above
      t({ type: 'sine', freq: 660, freq2: 500, duration: 0.6,
          attack: 0.025, decay: 0.12, sustain: 0.2, release: 0.3, gain: 0.12 });
      // soft high shimmer tail
      t({ type: 'sine', freq: 1320, freq2: 1000, duration: 0.5,
          attack: 0.03, decay: 0.1, sustain: 0.15, release: 0.25, gain: 0.06 });
      // gentle breath out
      n({ duration: 0.3, gain: 0.05, highpass: 2500, lowpass: 7000 });
    },

    /* ═══ DIMENSION MAP CHANGE — 5 phases ═══ */

    /* Phase 1: ominous drone as particles appear */
    mapDimDrone() {
      // sub bass drone — long and ominous
      t({ type: 'sine', freq: 35, freq2: 55, duration: 1.0,
          attack: 0.03, decay: 0.2, sustain: 0.5, release: 0.4, gain: 0.45 });
      // dark mid hum — unsettling
      t({ type: 'triangle', freq: 110, freq2: 160, duration: 0.9,
          attack: 0.04, decay: 0.15, sustain: 0.4, release: 0.35, gain: 0.3 });
      // low rumble noise
      n({ duration: 0.7, gain: 0.15, highpass: 50, lowpass: 800 });
    },

    /* Phase 2: cracks + glitch — dissonant rising tension */
    mapDimCracks() {
      // dissonant rising tone
      t({ type: 'triangle', freq: 180, freq2: 500, duration: 0.8,
          attack: 0.005, decay: 0.12, sustain: 0.45, release: 0.3, gain: 0.4 });
      // clashing overtone
      t({ type: 'sine', freq: 270, freq2: 700, duration: 0.7,
          attack: 0.008, decay: 0.1, sustain: 0.35, release: 0.25, gain: 0.25 });
      // chaotic noise building
      n({ duration: 0.6, gain: 0.25, highpass: 200, lowpass: 3500 });
      // glitch bursts scattered
      td(200, { type: 'square', freq: 600, freq2: 200, duration: 0.06,
          attack: 0.001, decay: 0.02, sustain: 0.3, release: 0.02, gain: 0.3 });
      td(450, { type: 'square', freq: 900, freq2: 350, duration: 0.05,
          attack: 0.001, decay: 0.015, sustain: 0.25, release: 0.02, gain: 0.25 });
      nd(350, { duration: 0.08, gain: 0.2, highpass: 1000, lowpass: 6000 });
    },

    /* Phase 3: electric burst at each glitch flash */
    mapDimGlitch() {
      // electric zap
      t({ type: 'square', freq: 800, freq2: 300, duration: 0.07,
          attack: 0.001, decay: 0.02, sustain: 0.3, release: 0.03, gain: 0.35 });
      // crackle noise
      n({ duration: 0.06, gain: 0.25, highpass: 1500, lowpass: 8000 });
    },

    /* Phase 4: massive explosion at final shake */
    mapDimExplode() {
      // massive sub slam
      t({ type: 'sine', freq: 45, freq2: 18, duration: 0.5,
          attack: 0.002, decay: 0.12, sustain: 0.45, release: 0.25, gain: 0.6 });
      // destructive mid crunch
      t({ type: 'triangle', freq: 400, freq2: 180, duration: 0.3,
          attack: 0.001, decay: 0.07, sustain: 0.35, release: 0.15, gain: 0.5 });
      // explosion noise — heavy
      n({ duration: 0.35, gain: 0.4, highpass: 100, lowpass: 4000 });
      // bright shatter
      td(80, { type: 'sine', freq: 1200, freq2: 600, duration: 0.2,
          attack: 0.002, decay: 0.05, sustain: 0.25, release: 0.1, gain: 0.3 });
    },

    /* Phase 5: dark echo while DIMENSION name shows */
    mapDimReveal() {
      // dark deep echo
      t({ type: 'sine', freq: 80, freq2: 45, duration: 0.8,
          attack: 0.015, decay: 0.2, sustain: 0.35, release: 0.35, gain: 0.3 });
      // ominous overtone
      t({ type: 'sine', freq: 160, freq2: 90, duration: 0.7,
          attack: 0.02, decay: 0.15, sustain: 0.25, release: 0.3, gain: 0.18 });
      // dark tail noise
      n({ duration: 0.4, gain: 0.1, highpass: 80, lowpass: 1200 });
    },

    /* ── TUTORIAL ALERT: quick "bwip!" — Zelda-style notice ── */
    tutorialAlert() {
      t({ type: 'sine', freq: 800, freq2: 1300, duration: 0.1,
          attack: 0.003, decay: 0.03, sustain: 0.35, release: 0.04, gain: 0.25 });
      td(60, { type: 'sine', freq: 1300, freq2: 1600, duration: 0.08,
          attack: 0.003, decay: 0.025, sustain: 0.25, release: 0.03, gain: 0.18 });
    },

    /* ── STAMP SLAM: heavy ink stamp thud ── */
    stampSlam() {
      // deep thud — physical impact
      t({ type: 'sine', freq: 120, freq2: 60, duration: 0.25,
          attack: 0.002, decay: 0.07, sustain: 0.35, release: 0.12, gain: 0.45 });
      // mid punch — paper slap
      t({ type: 'triangle', freq: 350, freq2: 200, duration: 0.15,
          attack: 0.002, decay: 0.04, sustain: 0.25, release: 0.08, gain: 0.3 });
      // ink noise burst
      n({ duration: 0.12, gain: 0.2, highpass: 200, lowpass: 2000 });
      // satisfying ring — stamp confirmed
      td(80, { type: 'sine', freq: 600, freq2: 450, duration: 0.18,
          attack: 0.005, decay: 0.05, sustain: 0.2, release: 0.08, gain: 0.15 });
    },

    /* ── PROGRESS TICK: ascending chime per segment ── */
    progressTick(index, total) {
      const progress = total > 1 ? index / (total - 1) : 1;
      const freq = 300 + progress * 500;  // 300Hz → 800Hz
      const rnd = 1 + (Math.random() - 0.5) * 0.04;
      t({ type: 'sine', freq: freq * rnd, freq2: freq * 1.08, duration: 0.08,
          attack: 0.003, decay: 0.025, sustain: 0.3, release: 0.03, gain: 0.18 });
      // soft harmonic overtone
      t({ type: 'sine', freq: freq * 2 * rnd, duration: 0.05,
          attack: 0.004, decay: 0.02, sustain: 0.15, release: 0.02, gain: 0.06 });
    },

  };

})();

/* === js/audio/abilities.js === */
/* ═══════════════════════════════════════
   AUDIO/ABILITIES.JS
   Ability sound effects. Procedural and
   file-based audio for special abilities.
   Manages pause/resume/stop for looping
   or long-duration ability audio.

   Depends on: audio/core.js (AudioCore)
   ═══════════════════════════════════════ */

const SfxAbilities = (() => {

const PATHS = {
    bulletTime: 'assets/audio/sfx/abilities/bullet_time.mp3',
    explosion:  'assets/audio/sfx/abilities/explosion.mp3',
    shield:     'assets/audio/sfx/abilities/shield.mp3',
    rangeBoost: 'assets/audio/sfx/abilities/range_boost.mp3',
    slash:      'assets/audio/sfx/abilities/slash.mp3',
  };

  let _btAudio = null;
  let _btFadeTimer = null;

  function _killBtAudio() {
    if (_btFadeTimer) {
      clearInterval(_btFadeTimer);
      _btFadeTimer = null;
    }
    if (_btAudio) {
      AudioCore.stopFile(_btAudio);
      _btAudio = null;
    }
  }

  return {

    special() {
      AudioCore.tone({ type: 'sine', freq: 880, freq2: 1200, duration: 0.25, attack: 0.01, decay: 0.08, sustain: 0.5, release: 0.12, gain: 0.6 });
      setTimeout(() =>
        AudioCore.tone({ type: 'sine', freq: 1100, freq2: 1400, duration: 0.2, attack: 0.005, decay: 0.06, sustain: 0.4, release: 0.1, gain: 0.4 })
      , 80);
    },

    specialReady() {
      AudioCore.tone({ type: 'sine', freq: 1000, freq2: 1200, duration: 0.12, attack: 0.003, decay: 0.04, sustain: 0.4, release: 0.06, gain: 0.3 });
    },

    bulletTimeStart() {
      _killBtAudio();
      _btAudio = AudioCore.playFile(PATHS.bulletTime);
    },

    bulletTimeStop() {
      if (!_btAudio) return;
      if (_btFadeTimer) return;

      const audio = _btAudio;
      const startVol = audio.volume;
      const steps = 10;
      const interval = 500 / steps;
      let step = 0;

      _btFadeTimer = setInterval(() => {
        step++;
        audio.volume = Math.max(0, startVol * (1 - step / steps));
        if (step >= steps) {
          _killBtAudio();
        }
      }, interval);
    },
    explosionStart() {
      AudioCore.playFile(PATHS.explosion, { volume: 0.18 });
    },
shieldAbsorb() {
      AudioCore.playFile(PATHS.shield, { volume: 0.15 });
    },

    rangeBoostStart() {
      AudioCore.playFile(PATHS.rangeBoost, { volume: 0.18 });
    },
    slashAttack() {
      AudioCore.playFile(PATHS.slash, { volume: 0.15 });
    },

    pauseAll() {
      if (_btAudio && !_btAudio.paused) {
        _btAudio.pause();
      }
    },

    resumeAll() {
      if (_btAudio && _btAudio.paused && _btAudio.currentTime > 0) {
        _btAudio.play();
      }
    },

    stopAll() {
      _killBtAudio();
    },

  };

})();

/* === js/audio/music.js === */
/* ═══════════════════════════════════════
   AUDIO/MUSIC.JS
   Background music manager.
   Two modes:
   - intro+loop: seamless transition from
     intro file to looping file.
   - breath: single file that restarts
     with a pause between plays (for
     tracks that don't loop cleanly).

   Independent volume from SFX, persisted
   in localStorage as ds_music_volume.

   Depends on: audio/core.js (AudioCore),
               config.js (CONFIG.music)
   ═══════════════════════════════════════ */

const Music = (() => {

  const TRACK_BASE = 'assets/audio/music/maps/';
  const PATHS      = { menu: 'assets/audio/music/menu.mp3' };

  /* ── STATE ── */
  let _introHandle   = null;
  let _loopHandle    = null;
  let _menuHandle    = null;
  let _currentTrack  = null;
  let _phase         = 'idle'; // idle | menu | intro | loop | breath | fadeout
  let _rate          = 1.0;
  let _fadeTimer     = null;
  let _breathTimer   = null;
  let _breathPath    = null;

  /* ── VOLUME (independent from SFX) ── */
  let _volume = CONFIG.music ? CONFIG.music.volume : 0.4;

  function _vol() { return _volume; }

  function _applyVol(handle, base) {
    if (handle) handle.volume = _vol() * (base || 1.0);
  }

  function _applyRate(handle) {
    if (handle) handle.playbackRate = _rate;
  }

  /* ═══════════════════════════════════
     INTERNAL CLEANUP
     ═══════════════════════════════════ */

  function _kill() {
    if (_fadeTimer)   { clearInterval(_fadeTimer);  _fadeTimer   = null; }
    if (_breathTimer) { clearTimeout(_breathTimer); _breathTimer = null; }

    if (_introHandle) { AudioCore.stopFile(_introHandle); _introHandle = null; }
    if (_loopHandle)  { AudioCore.stopFile(_loopHandle);  _loopHandle  = null; }
    if (_menuHandle)  { AudioCore.stopFile(_menuHandle);  _menuHandle  = null; }

    _currentTrack = null;
    _breathPath   = null;
    _phase        = 'idle';
  }

  /* ═══════════════════════════════════
     INTRO + LOOP (seamless)
     ═══════════════════════════════════ */

  function _startIntroLoop(trackName) {
    const introPath = TRACK_BASE + trackName + '_intro.ogg';
    const loopPath  = TRACK_BASE + trackName + '_loop.ogg';

    _phase = 'intro';
    _introHandle = AudioCore.playFile(introPath, { loop: false, volume: 1.0, force: true });
    if (!_introHandle) { _phase = 'idle'; return; }

    _introHandle.volume       = _vol();
    _introHandle.playbackRate = _rate;

    _introHandle.onEnded = () => {
      _introHandle = null;
      // if killed or fading during intro, don't start loop
      if (_phase !== 'intro') return;

      _phase      = 'loop';
      _loopHandle = AudioCore.playFile(loopPath, { loop: true, volume: 1.0, force: true });
      if (_loopHandle) {
        _loopHandle.volume       = _vol();
        _loopHandle.playbackRate = _rate;
      }
    };
  }

  /* ═══════════════════════════════════
     BREATH LOOP (moon)
     Play once → silence → play again
     ═══════════════════════════════════ */

  function _startBreath(trackName) {
    const path  = TRACK_BASE + trackName + '.ogg';
    _breathPath = path;
    _phase      = 'breath';
    _playBreathOnce();
  }

  function _playBreathOnce() {
    if (_phase !== 'breath' || !_breathPath) return;

    _loopHandle = AudioCore.playFile(_breathPath, { loop: false, volume: 1.0, force: true });
    if (!_loopHandle) return;

    _loopHandle.volume       = _vol();
    _loopHandle.playbackRate = _rate;

    _loopHandle.onEnded = () => {
      _loopHandle = null;
      if (_phase !== 'breath') return;

      const pause = (CONFIG.music && CONFIG.music.breathPause) || 800;
      _breathTimer = setTimeout(() => {
        _breathTimer = null;
        _playBreathOnce();
      }, pause);
    };
  }

  /* ═══════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════ */

  /* ── PLAY MAP MUSIC ── */
  function playMap(mapId) {
    if (!CONFIG.music || !CONFIG.music.mapTracks) return;
    const trackName = CONFIG.music.mapTracks[mapId];
    if (!trackName) return;

    _kill();
    _rate          = 1.0;
    _currentTrack  = trackName;

    if (_vol() <= 0) return;

    const isBreath = (CONFIG.music.breathTracks || []).includes(trackName);
    if (isBreath) {
      _startBreath(trackName);
    } else {
      _startIntroLoop(trackName);
    }
  }

  /* ── MENU MUSIC ── */
  function playMenu() {
    // already playing menu — skip
    if (_phase === 'menu' && _menuHandle && !_menuHandle.paused) return;
    // paused menu — resume
    if (_phase === 'menu' && _menuHandle && _menuHandle.paused) {
      _menuHandle.play();
      return;
    }

    _kill();
    _phase = 'menu';

    const baseVol   = (CONFIG.music && CONFIG.music.menuBaseVol) || 0.4;
    _menuHandle     = AudioCore.playFile(PATHS.menu, { loop: true, volume: 1.0, force: true });
    if (_menuHandle) _menuHandle.volume = _vol() * baseVol;
  }

  /* ── STOP (instant) ── */
  function stop() {
    _kill();
  }

  /* ── FADE OUT ── */
  function fadeOut(duration, onDone) {
    duration = duration || (CONFIG.music && CONFIG.music.fadeOutDuration) || 3000;

    const handle = _introHandle || _loopHandle || _menuHandle;
    if (!handle || handle.paused) {
      _kill();
      if (onDone) onDone();
      return;
    }

    if (_fadeTimer) clearInterval(_fadeTimer);
    // stop breath timer so no new instance starts during fade
    if (_breathTimer) { clearTimeout(_breathTimer); _breathTimer = null; }

    const prevPhase = _phase;
    _phase = 'fadeout';

    const step    = 30;
    const ticks   = Math.max(1, Math.floor(duration / step));
    const startV  = handle.volume;
    const volDrop = startV / ticks;

    _fadeTimer = setInterval(() => {
      const h = _introHandle || _loopHandle || _menuHandle;
      if (!h) {
        clearInterval(_fadeTimer);
        _fadeTimer = null;
        _kill();
        if (onDone) onDone();
        return;
      }
      h.volume = Math.max(0, h.volume - volDrop);
      if (h.volume <= 0.005) {
        _kill();
        if (onDone) onDone();
      }
    }, step);
  }

  /* ── CANCEL FADE (restore volume) ── */
  function cancelFade() {
    if (_fadeTimer) { clearInterval(_fadeTimer); _fadeTimer = null; }
    if (_phase !== 'fadeout') return;

    const h = _introHandle || _loopHandle;
    if (h) {
      h.volume = _vol();
      _phase = _introHandle ? 'intro' : 'loop';
    } else {
      _phase = 'idle';
    }
  }

  /* ── PAUSE / RESUME ── */
  function pause() {
    if (_introHandle && !_introHandle.paused) _introHandle.pause();
    if (_loopHandle  && !_loopHandle.paused)  _loopHandle.pause();
    if (_menuHandle  && !_menuHandle.paused)  _menuHandle.pause();
  }

  function resume() {
    if (_vol() <= 0) return;
    if (_introHandle && _introHandle.paused) _introHandle.play();
    if (_loopHandle  && _loopHandle.paused)  _loopHandle.play();
    if (_menuHandle  && _menuHandle.paused)  _menuHandle.play();
  }

  /* ── VOLUME ── */
  function setVolume(val) {
    _volume = Math.max(0, Math.min(1, val));
    try { localStorage.setItem('ds_music_volume', _volume.toFixed(2)); } catch (e) {}

    _applyVol(_introHandle, 1.0);
    _applyVol(_loopHandle,  1.0);

    const baseVol = (CONFIG.music && CONFIG.music.menuBaseVol) || 0.4;
    _applyVol(_menuHandle, baseVol);

    if (_volume <= 0 && _phase !== 'idle' && _phase !== 'menu') {
      _kill();
    }
  }

  function getVolume() { return _volume; }

  /* ── PLAYBACK RATE ── */
  function setRate(rate) {
    const max = (CONFIG.music && CONFIG.music.maxSpeed) || 1.35;
    _rate = Math.min(max, Math.max(0.5, rate));
    _applyRate(_introHandle);
    _applyRate(_loopHandle);
  }

  function incrementRate(amount) {
    setRate(_rate + (amount || 0.05));
  }

  function resetRate() {
    _rate = 1.0;
  }

  /* ── QUERIES ── */
  function isPlaying() {
    if (_introHandle && !_introHandle.paused) return true;
    if (_loopHandle  && !_loopHandle.paused)  return true;
    if (_menuHandle  && !_menuHandle.paused)  return true;
    return false;
  }

  function isFading() { return _phase === 'fadeout'; }

  return {
    playMap, playMenu,
    stop, fadeOut, cancelFade,
    pause, resume,
    isPlaying, isFading,
    setVolume, getVolume,
    setRate, incrementRate, resetRate,
    PATHS,
  };

})();

/* === js/audio/index.js === */
/* ═══════════════════════════════════════
   AUDIO/INDEX.JS
   Global SFX wrapper. Single entry point
   for all game audio. pauseAll/resumeAll/
   stopAll are centralized across all
   subsystems (abilities + music).

   Load AFTER: core.js, combat.js, ui.js,
   abilities.js, music.js

   Exposes: window.SFX
   ═══════════════════════════════════════ */

const SFX = {

  // legacy — now auto-inits, kept as safe no-op
  init: () => AudioCore.init(),

  /* ── COMBAT ── */
  hit:          () => SfxCombat.hit(),
  hitFlesh:     () => SfxCombat.hitFlesh(),
  hitRock:      () => SfxCombat.hitRock(),
  hitSlime:     () => SfxCombat.hitSlime(),
  hitShell:     () => SfxCombat.hitShell(),
  hitEthereal:  () => SfxCombat.hitEthereal(),
  hitThunder:   () => SfxCombat.hitThunder(),
  hitDemon:     () => SfxCombat.hitDemon(),
  comboTick:      (combo, tierIndex) => SfxCombat.comboTick(combo, tierIndex),
  comboThreshold: (tierIndex)        => SfxCombat.comboThreshold(tierIndex),
  comboLost:      (combo) => SfxCombat.comboLost(combo),
   freeze:    () => SfxCombat.freeze(),
   multiKill: (count) => SfxCombat.multiKill(count),
   luckyShield: () => SfxCombat.luckyShield(),
   berserker: () => SfxCombat.berserker(),

  // dispatch by enemy material type
  hitByType(type) {
    const fn = this['hit' + type.charAt(0).toUpperCase() + type.slice(1)];
    if (fn) fn();
    else SfxCombat.hit();
  },
  parry:     () => SfxCombat.parry(),
  crit:      () => SfxCombat.crit(),
  slash:     () => SfxCombat.slash(),
  orbCollect:   () => SfxCombat.orbCollect(),
  healOrb:      () => SfxCombat.healOrb(),
  healVampiric: () => SfxCombat.healVampiric(),
  healAbility:  () => SfxCombat.healAbility(),
  kill:      () => SfxCombat.kill(),
  damage:    () => SfxCombat.damage(),
  miss:      () => SfxCombat.miss(),
  bullet:    () => SfxCombat.bullet(),
  gameOver:  () => SfxCombat.gameOver(),

  /* ── ABILITIES ── */
  special:         () => SfxAbilities.special(),
  specialReady:    () => SfxAbilities.specialReady(),
  bulletTimeStart: () => SfxAbilities.bulletTimeStart(),
  bulletTimeStop:  () => SfxAbilities.bulletTimeStop(),
  explosionStart:  () => SfxAbilities.explosionStart(),
  shieldAbsorb:    () => SfxAbilities.shieldAbsorb(),
  rangeBoostStart: () => SfxAbilities.rangeBoostStart(),
 slashAttack:     () => SfxAbilities.slashAttack(),
  oneHitSmash:     () => SfxCombat.oneHitSmash(),

  /* ── UI ── */
  levelUp:      () => SfxUi.levelUp(),
  abilityPick:  () => SfxUi.abilityPick(),
  shield:       () => SfxUi.shield(),
  click:        () => SfxUi.click(),
  hover:        () => SfxUi.hover(),
  back:         () => SfxUi.back(),
  error:        () => SfxUi.error(),
  pauseOpen:    () => SfxUi.pauseOpen(),
  pauseClose:   () => SfxUi.pauseClose(),
  mapSlide:     () => SfxUi.mapSlide(),
  mapConfirm:   () => SfxUi.mapConfirm(),
  cardHover:    () => SfxUi.cardHover(),
  cardPick:     () => SfxUi.cardPick(),
  countdown:    () => SfxUi.countdown(),
  countdownGo:  () => SfxUi.countdownGo(),
  mapComplete:  () => SfxUi.mapComplete(),
 transIn:      () => SfxUi.transIn(),
  transOut:     () => SfxUi.transOut(),
  slotTick:     () => SfxUi.slotTick(),
  slotStop:     () => SfxUi.slotStop(),
  slotWin:      () => SfxUi.slotWin(),
  slotNearMiss: () => SfxUi.slotNearMiss(),
 mapNormalRise:    () => SfxUi.mapNormalRise(),
  mapNormalCover:   () => SfxUi.mapNormalCover(),
  mapNormalFlash:   () => SfxUi.mapNormalFlash(),
  mapNormalReveal:  () => SfxUi.mapNormalReveal(),
  mapDimDrone:      () => SfxUi.mapDimDrone(),
  mapDimCracks:     () => SfxUi.mapDimCracks(),
  mapDimGlitch:     () => SfxUi.mapDimGlitch(),
  mapDimExplode:    () => SfxUi.mapDimExplode(),
  mapDimReveal:     () => SfxUi.mapDimReveal(),
  tutorialAlert: () => SfxUi.tutorialAlert(),
    stampSlam:     () => SfxUi.stampSlam(),
  progressTick:  (i, t) => SfxUi.progressTick(i, t),

 /* ── MUSIC ── */
  playMap:      (mapId) => Music.playMap(mapId),
  stopMusic:    () => Music.stop(),
  musicPlaying: () => Music.isPlaying(),

  /* ── GLOBAL CONTROLS ── */
  pauseAll() {
    SfxAbilities.pauseAll();
    Music.pause();
  },

  resumeAll() {
    SfxAbilities.resumeAll();
    Music.resume();
  },

  stopAll() {
    SfxAbilities.stopAll();
  },
};

/* === js/audio/uiBind.js === */
/* ═══════════════════════════════════════
   AUDIO/UIBIND.JS
   Binds hover/click sounds to all UI buttons
   using event delegation. Must be loaded AFTER
   all HTML partials are in the DOM.

   Depends on: audio/index.js (SFX)
   ═══════════════════════════════════════ */

const UiBind = (() => {

  let _bound = false;

  /* ── SELECTORS ── */
  // containers for event delegation
  const CONTAINERS = [
    '#screen-menu',
    '#screen-map-select',
    '#screen-ability',
    '#screen-game',
  ];

  // elements that trigger sounds
  const CLICKABLE = 'button, .mode-card, .map-slide, .ability-item';

  function _isClickable(el) {
    return el && el.matches && el.matches(CLICKABLE);
  }

  function _findClickable(target, container) {
    // walk up from target to container looking for a clickable
    let el = target;
    while (el && el !== container) {
      if (_isClickable(el)) return el;
      el = el.parentElement;
    }
    return null;
  }

  /* ── BIND ── */
  function init() {
    if (_bound) return;
    _bound = true;

    CONTAINERS.forEach(sel => {
      const container = document.querySelector(sel);
      if (!container) return;

      // click sound
      container.addEventListener('click', (e) => {
        if (_findClickable(e.target, container)) {
          SFX.click();
        }
      });

      
    });
  }

  return { init };

})();

/* === js/adPlaceholder.js === */
/* ═══════════════════════════════════════
   ADPLACEHOLDER.JS
   Centralized rewarded ad placeholder.
   Simulates ad display with a brief
   loading overlay. Replace showRewarded()
   internals with real CrazyGames SDK
   at publish time (Blocco 13).

   Continue system:
   - 1 continue per run (adventure + challenge)
   - Challenge mode: only if current wave
     is <= player's best wave (fair leaderboard)
   - Resets on startGame()

   Used by: screens.js (game over continue),
            slotMachine.js (future),
            mapSelect.js (future)
   Depends on: state.js (ActiveDirector),
               ChallengeDirector (best wave check)
   ═══════════════════════════════════════ */

const AdPlaceholder = (() => {

  let _continueUsed = false;

  /* ── FAKE AD OVERLAY ─────────────────
     Shows a brief "loading" overlay to
     simulate ad playback. Replace this
     entire function body with real SDK
     call: CrazyGames.SDK.ad.requestAd(
       'rewarded', { adFinished, adError })  */

  const FAKE_AD_DURATION = 1500;

  function _createAdOverlay() {
    const ov = document.createElement('div');
    ov.id = 'ad-placeholder-overlay';
    ov.style.cssText =
      'position:fixed;inset:0;z-index:300;' +
      'background:rgba(0,0,0,0.92);' +
      'display:flex;align-items:center;justify-content:center;' +
      'flex-direction:column;gap:12px;';

    const txt = document.createElement('div');
    txt.style.cssText =
      'font-family:"Press Start 2P",monospace;font-size:10px;' +
      'color:#aaa;letter-spacing:2px;';
    txt.textContent = 'LOADING AD...';

    const bar = document.createElement('div');
    bar.style.cssText =
      'width:120px;height:4px;background:rgba(255,255,255,0.15);' +
      'border-radius:2px;overflow:hidden;';

    const fill = document.createElement('div');
    fill.style.cssText =
      'width:0%;height:100%;background:#51eefc;' +
      'transition:width ' + FAKE_AD_DURATION + 'ms linear;';

    bar.appendChild(fill);
    ov.appendChild(txt);
    ov.appendChild(bar);
    document.body.appendChild(ov);

    // animate fill bar
    requestAnimationFrame(() => {
      fill.style.width = '100%';
    });

    return ov;
  }

  return {

    /* ── SHOW REWARDED AD ────────────────
       Displays fake ad overlay, then calls
       onSuccess. Replace internals with
       CrazyGames SDK at publish time.
       onError is called if ad fails
       (never happens in placeholder).     */

    showRewarded(onSuccess, onError) {
      // delegate to CrazyGames SDK wrapper
      // handles: real ads on CrazyGames,
      // fake overlay on localhost,
      // error callback on disabled
      if (typeof CrazySDKWrapper !== 'undefined') {
        CrazySDKWrapper.showRewarded(onSuccess, onError);
      } else {
        // fallback: no SDK loaded, just succeed
        if (onSuccess) onSuccess();
      }
    },

    /* ── CAN CONTINUE ────────────────────
       Returns true if continue button
       should appear on game over screen.
       - false if already used this run
       - challenge mode: false if player
         already surpassed their best wave  */

    canContinue() {
      if (_continueUsed) return false;

      // challenge mode: block if already past best
      if (typeof ChallengeDirector !== 'undefined' &&
          ActiveDirector === ChallengeDirector) {
        const current = ChallengeDirector.getWave();
        const best    = ChallengeDirector.getBestWave();
        if (current > best) return false;
      }

      return true;
    },

    /* ── USE CONTINUE ────────────────────
       Marks continue as used for this run. */

    useContinue() {
      _continueUsed = true;
    },

    /* ── RESET CONTINUE ──────────────────
       Called from startGame() at the
       beginning of every new run.         */

    resetContinue() {
      _continueUsed = false;
    },
  };

})();

/* === js/state.js === */
/* ═══════════════════════════════════════
   STATE.JS
   Global game state — shared across all
   systems and modes.

   Used by: everything
   Depends on: nothing
   ═══════════════════════════════════════ */

let player          = null;
let enemies         = [];
let bullets         = [];
let gameLoop        = null;
let running         = false;
let choosingAbility = false;   // kept for director clear-enemies compat
let lastTick        = 0;
let isAttacking     = false;

// ability equipped for next match (default = player's default ability)
let equippedAbilityId = null;
let ActiveDirector = null;

// ── MOBILE DETECTION ──
// true for phones/tablets with coarse pointer (not desktop touchscreen)
const _isMobile = navigator.maxTouchPoints > 0 && window.matchMedia('(pointer: coarse)').matches;
function isMobile() { return _isMobile; }

/* === js/modes/infinite/director.js === */
/* ═══════════════════════════════════════
   DIRECTOR.JS
   Infinite Mode orchestrator.
   Coordinates stress, spawner and waves.

   Used by: systems/loop.js
   Depends on: stress/calculator.js,
               stress/events.js,
               spawner.js, waves.js
   ═══════════════════════════════════════ */

const Director = (() => {

  let wave          = 1;
  let stress        = 0;
  let spawnTimer    = 0;
  let killsThisWave = 0;
  let active        = false;
  let _isBossWave   = false;

  return {

    init() {
      wave          = 1;
      stress        = 0;
      spawnTimer    = 0;
      killsThisWave = 0;
      _isBossWave   = false;
      active        = true;
      resetSpawnerCooldowns();
    },

    stop() {
      active = false;
    },

    onDamage() {
      stress = stressOnDamage(stress);
    },

    onKill() {
      stress = stressOnKill(stress);
      killsThisWave++;

      if (killsThisWave >= killsToAdvance(wave)) {
        this.nextWave();
      }
    },

    nextWave() {
      wave++;
      killsThisWave = 0;
      _isBossWave   = isBossWave(wave);

      if (typeof updateWaveDisplay === 'function') updateWaveDisplay(wave, _isBossWave);

      // after a boss wave → clear all enemies and bullets
      if (isBossWave(wave - 1)) {
        enemies.forEach(e => e.el.remove());
        enemies.length = 0;
        bullets.forEach(b => b.el.remove());
        bullets.length = 0;
      }
    },

    tick(dt) {
      if (!active) return;

      const { w, h } = getArenaSize();
      const cx = w / 2;
      const cy = h / 2;

      stress = calcStress(cx, cy);
      stress = stressDecay(stress, dt);

      const state = getDirectorState(stress, wave, _isBossWave);

      spawnTimer -= getEffectiveDt(dt);
      if (spawnTimer <= 0) {
        spawnGroup(state, wave);
        spawnTimer = getSpawnInterval(state);
      }

      updateSpawnerCooldowns(dt);
    },

    getWave()        { return wave; },
    getStress()      { return Math.round(stress); },
    getTarget()      { return Math.round(getWaveTarget(wave, _isBossWave)); },
    isBoss()         { return _isBossWave; },
    getKills()       { return killsThisWave; },
    getKillsNeeded() { return killsToAdvance(wave); },
    getWaveTimeLeft() { return 0; },
    getWaveDuration() { return 0; },
  };

})();

/* === js/ui/dom.js === */
/* ═══════════════════════════════════════
   DOM.JS
   All DOM element references + utilities.

   Used by: hud.js, screens.js, game systems
   Depends on: nothing
   ═══════════════════════════════════════ */

const sMenu      = document.getElementById('screen-menu');
const sAbility   = document.getElementById('screen-ability');
const sGame      = document.getElementById('screen-game');
const sMapSelect = document.getElementById('screen-map-select');
const sChallenge = document.getElementById('screen-challenge');

const overOverlay     = document.getElementById('over-overlay');
const completeOverlay = document.getElementById('complete-overlay');

const arena          = document.getElementById('arena');
const flashEl        = document.getElementById('flash');
const lvlPop         = document.getElementById('level-up-pop');
const specialRing    = document.getElementById('special-ring');
const rangeEl        = document.getElementById('attack-range');
const comboEl        = null; // removed from HUD — combo shown via combo-float
const scoreEl        = document.getElementById('score-display');
const levelEl        = document.getElementById('level-display');
const playerEl       = document.getElementById('player');
const hpBar          = document.getElementById('player-hp-bar');
const progressBar    = null; // removed — adventure uses timer, infinite not used
// combo timer removed from HUD — combo shown via combo-float
const comboTimerWrap = null;
const comboTimerBar  = null;
const specialBar     = document.getElementById('special-bar');
const finalScoreEl   = document.getElementById('over-score');
const finalLevelEl   = document.getElementById('over-wave');
const bestLabel      = document.getElementById('over-best');
const menuBest       = document.getElementById('menu-best');
const btnMute        = document.getElementById('btn-mute');

/* ── UTILITIES ── */

function getArenaSize() {
  return { w: arena.offsetWidth, h: arena.offsetHeight };
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function setArenaBackground(url) {
  arena.style.backgroundImage = url ? `url('${url}')` : 'none';
  arena.style.backgroundColor = url ? 'transparent' : '#2a2a2a';
}

/* === js/systems/rangeCircle.js === */
/* ═══════════════════════════════════════
   RANGECIRCLE.JS
   Blood ritual circle drawn on canvas
   inside #attack-range. Irregular edges,
   blood drops, slow floating particles.

   Used by: hud.js (updateRangeCircle)
   Depends on: dom.js (rangeEl)
   ═══════════════════════════════════════ */

const RangeCircle = (() => {
  let _canvas = null;
  let _ctx = null;
  let _animId = null;
  let _particles = [];
  let _drops = [];
  let _size = 0;
  let _noiseOffsets = []; // irregular edge
  let _time = 0;

  // blood palette
  const BLOOD_DARK   = '#3A0808';
  const BLOOD_MID    = '#6B1010';
  const BLOOD_BASE   = '#8B0000';
  const BLOOD_LIGHT  = '#AA2222';
  const BLOOD_BRIGHT = '#CC3333';

  const NUM_PARTICLES = 14;
  const NUM_DROPS = 20;
  const EDGE_POINTS = 64; // resolution of irregular circle

  /* ── INIT ── */
  function init() {
    if (_canvas) return;
    _canvas = document.createElement('canvas');
    _canvas.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;' +
      'pointer-events:none;image-rendering:pixelated;';
    rangeEl.appendChild(_canvas);
    _ctx = _canvas.getContext('2d');

    // generate noise offsets for irregular edge
    _noiseOffsets = [];
    for (let i = 0; i < EDGE_POINTS; i++) {
      _noiseOffsets.push({
        offset: (Math.random() - 0.5) * 0.08,
        speed: 0.0001 + Math.random() * 0.00015,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  /* ── RESIZE + REGENERATE ── */
  function resize(diameter) {
    if (!_canvas) init();
    const d = Math.round(diameter);
    if (d === _size) return;
    _size = d;

    // canvas pixel size = CSS size for crisp rendering
    _canvas.width = d;
    _canvas.height = d;

    _generateDrops();
    _generateParticles();
    _draw();

    // start animation loop if not running
    if (!_animId) _animate();
  }

  /* ── GENERATE BLOOD DROPS (static) ── */
  function _generateDrops() {
    _drops = [];
    const r = _size / 2;
    for (let i = 0; i < NUM_DROPS; i++) {
      const angle = Math.random() * Math.PI * 2;
      // cluster drops near the circle edge
      const dist = r * (0.85 + Math.random() * 0.3);
      _drops.push({
        x: r + Math.cos(angle) * dist,
        y: r + Math.sin(angle) * dist,
        radius: 1 + Math.random() * 2.5,
        opacity: 0.3 + Math.random() * 0.5,
        color: [BLOOD_DARK, BLOOD_MID, BLOOD_BASE, BLOOD_LIGHT][Math.floor(Math.random() * 4)]
      });
    }
  }

  /* ── GENERATE FLOATING PARTICLES ── */
  function _generateParticles() {
    _particles = [];
    const r = _size / 2;
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const angle = Math.random() * Math.PI * 2;
      _particles.push({
        angle: angle,
        dist: r * (0.88 + Math.random() * 0.12),
        radius: 0.8 + Math.random() * 1.5,
        speed: 0.02 + Math.random() * 0.04, // degrees per frame — slow orbit
        opacity: 0.2 + Math.random() * 0.5,
        drift: Math.random() * 0.3, // radial drift amplitude
        driftSpeed: 0.001 + Math.random() * 0.002,
        color: [BLOOD_MID, BLOOD_BASE, BLOOD_LIGHT, BLOOD_BRIGHT][Math.floor(Math.random() * 4)]
      });
    }
  }

  /* ── DRAW FRAME ── */
  function _draw() {
    const ctx = _ctx;
    const d = _size;
    const r = d / 2;
    ctx.clearRect(0, 0, d, d);

    // ── 1. IRREGULAR BLOOD CIRCLE (filled area) ──
    ctx.beginPath();
    for (let i = 0; i <= EDGE_POINTS; i++) {
      const idx = i % EDGE_POINTS;
      const angle = (idx / EDGE_POINTS) * Math.PI * 2;
      const n = _noiseOffsets[idx];
      const wobble = n.offset * Math.sin(_time * n.speed + n.phase);
      const edgeR = r * (0.95 + wobble);
      const x = r + Math.cos(angle) * edgeR;
      const y = r + Math.sin(angle) * edgeR;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // subtle radial gradient fill
    const grad = ctx.createRadialGradient(r, r, r * 0.7, r, r, r);
    grad.addColorStop(0, 'rgba(58, 8, 8, 0.0)');
    grad.addColorStop(0.6, 'rgba(58, 8, 8, 0.03)');
    grad.addColorStop(0.85, 'rgba(107, 16, 16, 0.06)');
    grad.addColorStop(1, 'rgba(139, 0, 0, 0.1)');
    ctx.fillStyle = grad;
    ctx.fill();

    // ── 2. BLOOD RING (main edge line) ──
    // draw multiple passes for thick, uneven look
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    // outer glow
    _drawIrregularRing(ctx, r, 0.96, 3.5, 'rgba(139, 0, 0, 0.15)');
    // main ring
    _drawIrregularRing(ctx, r, 0.95, 2.5, 'rgba(139, 0, 0, 0.45)');
    // inner edge
    _drawIrregularRing(ctx, r, 0.93, 1.5, 'rgba(107, 16, 16, 0.3)');

    ctx.restore();

    // ── 3. BLOOD SMEARS along the ring ──
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + _time * 0.0001;
      const smearR = r * (0.90 + Math.sin(_time * 0.0005 + i) * 0.04);
      const sx = r + Math.cos(angle) * smearR;
      const sy = r + Math.sin(angle) * smearR;
      const smearLen = 3 + Math.random() * 5;

      ctx.beginPath();
      ctx.arc(sx, sy, smearLen, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(107, 16, 16, ${0.08 + Math.sin(_time * 0.001 + i * 2) * 0.04})`;
      ctx.fill();
    }

    // ── 4. STATIC DROPS ──
    for (const drop of _drops) {
      ctx.beginPath();
      ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
      ctx.fillStyle = drop.color;
      ctx.globalAlpha = drop.opacity * (0.8 + Math.sin(_time * 0.002 + drop.x) * 0.2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // ── 5. FLOATING PARTICLES ──
    for (const p of _particles) {
      const driftOffset = Math.sin(_time * p.driftSpeed) * p.drift * r * 0.1;
      const px = r + Math.cos(p.angle) * (p.dist + driftOffset);
      const py = r + Math.sin(p.angle) * (p.dist + driftOffset);

      ctx.beginPath();
      ctx.arc(px, py, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity * (0.6 + Math.sin(_time * 0.003 + p.angle) * 0.4);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  /* ── DRAW ONE IRREGULAR RING ── */
  function _drawIrregularRing(ctx, r, radiusMult, lineWidth, color) {
    ctx.beginPath();
    for (let i = 0; i <= EDGE_POINTS; i++) {
      const idx = i % EDGE_POINTS;
      const angle = (idx / EDGE_POINTS) * Math.PI * 2;
      const n = _noiseOffsets[idx];
      const wobble = n.offset * Math.sin(_time * n.speed + n.phase);
      const edgeR = r * (radiusMult + wobble);
      const x = r + Math.cos(angle) * edgeR;
      const y = r + Math.sin(angle) * edgeR;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  /* ── ANIMATION LOOP ── */
  function _animate() {
    _time += 16; // ~60fps increment

    // move particles along orbit
    for (const p of _particles) {
      p.angle += p.speed * 0.01;
    }

    _draw();
    _animId = requestAnimationFrame(_animate);
  }

  /* ── STOP (cleanup) ── */
  function stop() {
    if (_animId) {
      cancelAnimationFrame(_animId);
      _animId = null;
    }
  }

  /* ── RESTART (after stop) ── */
  function start() {
    if (!_animId && _canvas) _animate();
  }

  return { init, resize, stop, start };
})();

/* === js/ui/hud.js === */

/* ═══════════════════════════════════════
   HUD.JS
   Pixel bar system — HP and Special bars
   live inside the arena above the player.

   Used by: game systems, loop.js
   Depends on: dom.js, state.js, config.js
   ═══════════════════════════════════════ */

let _lastHpPct = 1;

function updateHpBar() {
  const pct = player.hpPercent();
  const w   = Math.round(pct * 100);
  hpBar.style.width = w + '%';

  hpBar.classList.remove('hp-low', 'hp-crit');
  if (pct <= CONFIG.player.hpBarYellowPct) {
    hpBar.classList.add('hp-crit');
  } else if (pct <= CONFIG.player.hpBarGreenPct) {
    hpBar.classList.add('hp-low');
  }

  if (pct > _lastHpPct + 0.05) {
    hpBar.classList.remove('heal-flash');
    void hpBar.offsetWidth;
    hpBar.classList.add('heal-flash');
    setTimeout(() => hpBar.classList.remove('heal-flash'), 500);
  }

  _lastHpPct = pct;
}

function updateSpecialBar() {
  const ab      = player.ability;
  const isReady = player.isSpecialReady();
  const barEl   = document.getElementById('bar-special');
  const maxSlots = player._maxSpecialSlots || 1;

  // normalize charge to 0-100% visual range
  const maxCharge = maxSlots * 100;
  const visualPct = Math.min(100, (player.specialCharge / maxCharge) * 100);

  specialBar.classList.add('charge-tick');
  specialBar.style.width = visualPct + '%';
  setTimeout(() => specialBar.classList.remove('charge-tick'), 200);

  // render slot divider lines
  _renderSlotDividers(maxSlots);

  const iconEl = document.getElementById('special-icon');
  if (iconEl) iconEl.textContent = ab.icon;

  if (isReady && !player.specialActive) {
    barEl.classList.add('bar-ready');
    playerEl.classList.add('special-ready');

    if (!player._wasSpecialReady) {
      player._wasSpecialReady = true;
      SFX.specialReady();
    }

  } else if (!player.specialActive) {
    barEl.classList.remove('bar-ready');
    playerEl.classList.remove('special-ready');
    player._wasSpecialReady = false;
  }
}

function updateProgress() {
  // adventure mode: countdown timer
  if (ActiveDirector.getWaveDuration && ActiveDirector.getWaveDuration() > 0) {
    const left = ActiveDirector.getWaveTimeLeft();
    const secs = Math.ceil(Math.max(0, left) / 1000);
    const mins = Math.floor(secs / 60);
    const s    = secs % 60;
    const timeStr = mins + ':' + (s < 10 ? '0' : '') + s;

   // update timer display
    if (!_timerEl) _createTimerEl();
    // hide timer during upgrade choice and countdown
    if (_choosingUpgrade || _countdownActive || _inputBlocked ||
        _challengeChoiceActive || _challengeCountdown || _challengeInputBlocked) {
      _timerEl.style.display = 'none';
      return;
    }
    _timerEl.textContent = timeStr;

    // color: white > yellow > red as time runs out
    const pct = left / ActiveDirector.getWaveDuration();
    if (pct > 0.5)      _timerEl.style.color = '#ffffff';
    else if (pct > 0.25) _timerEl.style.color = '#ddaa22';
    else                 _timerEl.style.color = '#ee4444';

    _timerEl.style.display = 'block';

    // progress bar removed from DOM
  if (progressBar) progressBar.style.width = '0%';
    return;
  }

  // hide timer in infinite mode
  if (_timerEl) _timerEl.style.display = 'none';

  // infinite mode: kills progress
  if (progressBar) {
    const needed = ActiveDirector.getKillsNeeded();
    const pct    = Math.min(ActiveDirector.getKills() / needed, 1);
    progressBar.style.width = Math.round(pct * 100) + '%';
    progressBar.style.background = '#666';
  }
}

/* ── TIMER ELEMENT ── */
let _timerEl = null;

function _createTimerEl() {
  _timerEl = document.createElement('div');
  _timerEl.id = 'wave-timer';
  _timerEl.style.cssText =
    'position:absolute;top:8px;left:50%;transform:translateX(-50%);' +
    'font-family:"Press Start 2P",monospace;font-size:14px;color:#fff;' +
    'z-index:50;text-shadow:2px 2px 0 #000, -1px -1px 0 #000;' +
    'pointer-events:none;';
  arena.appendChild(_timerEl);
}
function updateWaveDisplay(wave, isBoss) {
  levelEl.textContent = isBoss ? 'BOSS' : 'wave ' + wave;

  if (wave <= 4)      levelEl.style.color = '#44cc44';
  else if (wave <= 8) levelEl.style.color = '#ddaa22';
  else                levelEl.style.color = '#ee4444';

  if (isBoss) {
    levelEl.style.color = '#ee4444';
    return;
  }

  lvlPop.textContent   = 'wave ' + wave + '!';
  lvlPop.style.color   = levelEl.style.color;
  lvlPop.style.opacity = '1';
  setTimeout(() => lvlPop.style.opacity = '0', 1200);
}

/* ── COMBO FLOAT SYSTEM ── */

let _comboKills = 0;
let _comboTarget = 0;
let _comboAnimating = false;
let _comboFadeTimer = null;
let _comboEl = null;

// color classes mapped to tier index from CONFIG.combo.tiers
const COMBO_COLORS = ['c-white', 'c-blue', 'c-yellow', 'c-orange', 'c-red', 'c-purple', 'c-rainbow'];
const COMBO_TIERS  = ['', 't2', 't3', 't4', 't5', 't6', 't7'];

function getComboColor(kills) {
  const tiers = CONFIG.combo.tiers;
  let idx = 0;
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (kills >= tiers[i][0]) { idx = i; break; }
  }
  return COMBO_COLORS[idx] || 'c-white';
}

function getComboTier(kills) {
  const tiers = CONFIG.combo.tiers;
  let idx = 0;
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (kills >= tiers[i][0]) { idx = i; break; }
  }
  return COMBO_TIERS[idx] || '';
}

function _getComboEl() {
  if (_comboEl) return _comboEl;
  _comboEl = document.createElement('div');
  _comboEl.className = 'combo-float';
  _comboEl.innerHTML =
    '<div class="combo-float-pts"></div>' +
    '<div class="combo-float-mult"></div>';
  arena.appendChild(_comboEl);
  return _comboEl;
}

function _animateComboCounter(from, to, el, duration) {
  const start = performance.now();
  _comboAnimating = true;

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const current = Math.round(from + (to - from) * ease);
    el.textContent = current.toLocaleString();
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      _comboAnimating = false;
    }
  }
  requestAnimationFrame(step);
}

function onComboKill(x, y, pts) {
  if (player.combo < CONFIG.combo.minKills) {
    _comboTarget = 0;
    return;
  }

  const oldTarget = _comboTarget;
  _comboTarget += pts;
  const mult = player.getComboMult();

  const el = _getComboEl();
  const ptsEl = el.querySelector('.combo-float-pts');
  const multEl = el.querySelector('.combo-float-mult');

  // use player.combo as single source of truth — matches audio tiers
  const colorClass = getComboColor(player.combo);
  const tierClass = getComboTier(player.combo);
  el.className = 'combo-float visible ' + colorClass;
  ptsEl.className = 'combo-float-pts ' + tierClass;
  multEl.textContent = 'x' + mult.toFixed(1);

  _animateComboCounter(oldTarget, _comboTarget, ptsEl, 400);

  clearTimeout(_comboFadeTimer);
  _comboFadeTimer = setTimeout(() => {
    el.classList.remove('visible');
    el.classList.add('fading');
    setTimeout(() => {
      el.classList.remove('fading');
    }, 600);
  }, 2000);
}

function resetComboFloat() {
  _comboTarget = 0;
  if (_comboEl) {
    _comboEl.classList.remove('visible');
    _comboEl.classList.remove('fading');
  }
  clearTimeout(_comboFadeTimer);
}

function updateComboDisplay() {
  if (player.combo < CONFIG.combo.minKills) {
    resetComboFloat();
  }
}

function updateRangeCircle() {
  const { w, h } = getArenaSize();
  const size  = Math.min(w, h);
  const range = player.getAttackRange(size);
  const d     = range * 2;

  rangeEl.style.width  = d + 'px';
  rangeEl.style.height = d + 'px';

  // blood ritual circle draws everything on canvas
  RangeCircle.resize(d);
}
/* ── ACTION POP (MISS, PARRY, DOUBLE KILL etc.) ── */

function showActionPop(dir, text, color) {
  const { w, h } = getArenaSize();
  const cx = w / 2;
  const cy = h / 2;

  // position based on direction
  const dist = 70;
  let x = cx, y = cy;
  if (dir === 'up')    y -= dist;
  if (dir === 'down')  y += dist;
  if (dir === 'left')  x -= dist;
  if (dir === 'right') x += dist;

  const pop = document.createElement('div');
  pop.className = 'action-pop';
  pop.textContent = text;
  pop.style.left  = x + 'px';
  pop.style.top   = y + 'px';
  pop.style.color = color;
  arena.appendChild(pop);
  setTimeout(() => pop.remove(), 800);
}

/* ── COMBO BUMP EFFECT ── */

function triggerComboBump() {
  const el = _getComboEl();
  el.classList.remove('combo-bump');
  void el.offsetWidth;
  el.classList.add('combo-bump');
  setTimeout(() => el.classList.remove('combo-bump'), 400);
}
/* ── EXTRA SLOT DIVIDERS ── */
let _slotDividerCount = 0;

function _renderSlotDividers(maxSlots) {
  if (maxSlots === _slotDividerCount) return; // already rendered
  _slotDividerCount = maxSlots;

  // remove old dividers
  document.querySelectorAll('.slot-divider').forEach(el => el.remove());

  if (maxSlots <= 1) return;

  const barBg = document.querySelector('#bar-special .pixel-bar-bg');
  if (!barBg) return;

  for (let i = 1; i < maxSlots; i++) {
    const pct = (i / maxSlots) * 100;
    const div = document.createElement('div');
    div.className = 'slot-divider';
    div.style.cssText =
      'position:absolute;top:0;bottom:0;width:2px;' +
      'left:' + pct + '%;' +
      'background:#ffffff;opacity:0.6;z-index:2;' +
      'box-shadow:0 0 3px rgba(255,255,255,0.4);';
    barBg.appendChild(div);
  }
}

/* === js/ui/screens.js === */
/* ═══════════════════════════════════════
   SCREENS.JS
   Screen navigation, score popup, high score.

   Used by: input.js, loop.js
   Depends on: dom.js, state.js
   ═══════════════════════════════════════ */

/* ── SCREEN NAVIGATION ── */

function showScreen(s) {
  [sMenu, sGame, sAbility, sMapSelect, sChallenge].forEach(x => {
    if (x) x.style.display = 'none';
  });
 s.style.display = 'block';

  // stop map music when entering game (playMap starts it in startGame)
  if (s === sGame && typeof Music !== 'undefined') Music.stop();

  // always hide overlays when switching screens
  if (overOverlay) overOverlay.classList.add('hidden');
  if (completeOverlay) completeOverlay.classList.add('hidden');

 // stop all ability audio when leaving game screen
  if (s !== sGame && typeof SFX !== 'undefined') SFX.stopAll();

  // cleanup challenge choice state when leaving game
  if (s !== sGame) {
    if (typeof resetChallengeChoices === 'function') resetChallengeChoices();
    if (typeof resetUpgradeChoices === 'function') resetUpgradeChoices();
    const arrowHint = document.getElementById('upgrade-arrow-hint');
    if (arrowHint) arrowHint.remove();
  }

  // fireflies only on menu
  if (s === sMenu) startMenuFireflies();
  else stopMenuFireflies();

  // menu music: play on any non-game screen, let it continue across screens
  if (s !== sGame && typeof Music !== 'undefined') {
    Music.playMenu();
  }
}

/* ── HIGH SCORE ── */

function getBestScore() {
  return parseInt(localStorage.getItem('ds_best') || '0');
}

function saveBestScore(score) {
  localStorage.setItem('ds_best', score);
}

function updateMenuBest() {
  if (!menuBest) return;
  const b = getBestScore();
  menuBest.textContent = b > 0 ? 'best: ' + b + ' pts' : '';
}

/* ── SCORE POPUP ── */

const _popColors = ['#FFD700','#44ddff','#ff66aa','#66ff66','#ff8844','#aa88ff','#ffff44'];

function showScorePop(x, y, pts) {
  const pop = document.createElement('div');
  const inCombo = player && player.combo >= CONFIG.combo.minKills;
  pop.className = 'score-pop' + (inCombo ? ' combo-pop' : '');
  pop.textContent = '+' + pts.toLocaleString();
  pop.style.left  = x + 'px';
  pop.style.top   = (y - 25) + 'px';
  pop.style.color = _popColors[Math.floor(Math.random() * _popColors.length)];
  arena.appendChild(pop);
  setTimeout(() => pop.remove(), 850);
}

/* ── MAP COMPLETE ── */

function showMapComplete(map, hasSlot) {
  // stop game loop
  running = false;
  clearInterval(gameLoop);

  // fade out map music
  if (typeof Music !== 'undefined') Music.fadeOut();

  // mark first play as done
  try { localStorage.setItem('ds_first_play_done', '1'); }
  catch (e) { /* silent */ }
  if (typeof CrazySDKWrapper !== 'undefined') {
    CrazySDKWrapper.gameplayStop();
    CrazySDKWrapper.happytime();
  }

  // populate overlay
  document.getElementById('complete-map-name').textContent = map.name || map.id;
  document.getElementById('complete-score').textContent =
    (player ? player.score : 0).toLocaleString();

  // hide ability section + buttons initially
  const abilitySection = document.getElementById('complete-ability');
  abilitySection.classList.add('hidden');
  const btnCol = document.querySelector('.complete-btn-col');
  if (btnCol) btnCol.style.display = 'none';

  // show overlay
  completeOverlay.classList.remove('hidden');

  // setup button handlers now (they stay hidden until ready)
  _setupCompleteButtons();

  if (hasSlot && typeof SlotMachine !== 'undefined') {
    // short delay so player sees score first, then open slot
    setTimeout(() => {
      SlotMachine.open({
        mode: 'guaranteed',
        isLastVideo: false,
        onResult: (abilityId) => {
          // ability already unlocked by SlotMachine internally
          if (abilityId) {
            const aDef = AbilityRegistry.get(abilityId);
            if (aDef) {
              document.getElementById('complete-ability-icon').innerHTML =
                '<img src="assets/abilities/' + aDef.id + '.png" width="48" height="48" style="image-rendering:pixelated">';
              document.getElementById('complete-ability-name').textContent = aDef.name || aDef.id;
              document.getElementById('complete-ability-desc').textContent = aDef.desc || '';
              abilitySection.classList.remove('hidden');
            }
          }
        },
        onClose: () => {
          // show buttons after slot closes
          if (btnCol) btnCol.style.display = '';
        },
      });
    }, 800);
  } else {
    // no slot — show buttons immediately
    if (btnCol) btnCol.style.display = '';
  }
}



function _setupCompleteButtons() {
  const btnAgain = document.getElementById('btn-play-again');
  const btnMaps  = document.getElementById('btn-complete-maps');

  const newAgain = btnAgain.cloneNode(true);
  btnAgain.parentNode.replaceChild(newAgain, btnAgain);
  newAgain.addEventListener('click', () => {
    if (Transition.isPlaying()) return;
    completeOverlay.classList.add('hidden');
    cleanupArena();
    Transition.play('fast', () => {
      equippedAbilityId = getEquippedAbility();
      if (AdventureDirector.restart()) {
        startGame(true);
      } else {
        showScreen(sMapSelect);
        if (typeof initMapSelect === 'function') initMapSelect();
      }
    }, () => {
      startGameLoop();
    });
  });

  const newMaps = btnMaps.cloneNode(true);
  btnMaps.parentNode.replaceChild(newMaps, btnMaps);
  newMaps.addEventListener('click', () => {
    if (Transition.isPlaying()) return;
    completeOverlay.classList.add('hidden');
    cleanupArena();
    // stamp animation for the just-completed map
    const completedMap = AdventureDirector.getCurrentMap();
    if (completedMap && typeof setPendingStamp === 'function') {
      setPendingStamp(completedMap.id);
    }
    Transition.play('fast', () => {
      showScreen(sMapSelect);
      if (typeof initMapSelect === 'function') initMapSelect();
    });
  });
}

/* ── MENU FIREFLIES ── */

let menuFireflies = [];
let fireflyRAF = null;

function startMenuFireflies() {
  stopMenuFireflies();
  const container = document.getElementById('screen-menu');
  if (!container) return;

  const count = 40;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:absolute;
      width:3px;height:3px;
      border-radius:50%;
      background:#ffffcc;
      box-shadow:0 0 6px 2px rgba(255,255,200,0.6);
      pointer-events:none;
      z-index:10;
      opacity:0;
    `;
    container.appendChild(p);

    menuFireflies.push({
      el: p,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.1,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.7,
    });
  }

  function animFireflies(now) {
    const t = now * 0.001;
    for (const f of menuFireflies) {
      f.x += f.vx * f.speed;
      f.y += f.vy * f.speed;

      if (f.x < -5) f.x = 105;
      if (f.x > 105) f.x = -5;
      if (f.y < -5) f.y = 105;
      if (f.y > 105) f.y = -5;

      const wx = Math.sin(t * 0.8 + f.phase) * 0.3;
      const wy = Math.cos(t * 0.6 + f.phase) * 0.2;

      const alpha = (Math.sin(t * f.speed + f.phase) + 1) * 0.5;
      const opacity = alpha * 0.7 + 0.05;

      f.el.style.left = (f.x + wx) + '%';
      f.el.style.top = (f.y + wy) + '%';
      f.el.style.opacity = opacity;
    }
    fireflyRAF = requestAnimationFrame(animFireflies);
  }

  fireflyRAF = requestAnimationFrame(animFireflies);
}

function stopMenuFireflies() {
  if (fireflyRAF) {
    cancelAnimationFrame(fireflyRAF);
    fireflyRAF = null;
  }
  for (const f of menuFireflies) {
    f.el.remove();
  }
  menuFireflies = [];
}


/* === js/ui/abilityScreen.js === */
/* ═══════════════════════════════════════
   ABILITYSCREEN.JS
   Ability selection screen.
   Shows all registered abilities, lets
   the player pick one to equip.
   Saves choice in localStorage.

   Used by: input.js
   Depends on: dom.js, AbilityRegistry
   ═══════════════════════════════════════ */

const ABILITY_STORAGE_KEY = 'ds_ability';
const DEFAULT_ABILITY_ID  = 'bullet_time';

/* ── PERSISTENCE ── */

function getEquippedAbility() {
  return localStorage.getItem(ABILITY_STORAGE_KEY) || DEFAULT_ABILITY_ID;
}

function saveEquippedAbility(id) {
  localStorage.setItem(ABILITY_STORAGE_KEY, id);
}

/* ── BUILD SCREEN ── */

function buildAbilityScreen() {
  const list = document.getElementById('ability-list');
  list.innerHTML = '';

  const equipped = getEquippedAbility();
  const all      = AbilityRegistry.all();

  all.forEach(ab => {
    const card = document.createElement('div');
    card.className = 'ability-option' + (ab.id === equipped ? ' selected' : '');
    card.style.setProperty('--ab-color', ab.barColor);

    card.innerHTML = `
      <div class="ability-icon-big">${ab.icon}</div>
      <div class="ability-info-big">
        <div class="ability-name-big">${ab.name}</div>
        <div class="ability-desc-big">${ab.desc}</div>
      </div>
      <div class="ability-check">✓</div>
    `;

    card.addEventListener('click', () => {
      saveEquippedAbility(ab.id);
      buildAbilityScreen();
    });

    list.appendChild(card);
  });
}

/* === js/ui/slotMachine.js === */
/* ═══════════════════════════════════════
   SLOTMACHINE.JS
   Slot machine state management and UI flow.

   Two modes:
   - 'guaranteed': 1 spin, always wins
   - 'menu': 3 spins per video, max 3 videos
     (9 spins total). Last spin of last video
     guaranteed if nothing found yet.

   Usage:
     SlotMachine.open({
       mode: 'guaranteed' | 'menu',
       onResult: (abilityId | null) => {},
       onClose: () => {}
     });

   Depends on: CONFIG, Progress, AbilityRegistry,
               SlotReels
   Used by: screens.js, mapSelect.js
   ═══════════════════════════════════════ */

const SlotMachine = (() => {

  /* ── STATE ─────────────────────────── */
  let _active    = false;
  let _mode      = null;
  let _onResult  = null;
  let _onClose   = null;
  let _spinning  = false;

  // per-video
  let _spins     = 0;
  let _maxSpins  = 3;
  let _foundAny  = false;

  // cross-video (menu mode)
  let _videoNum    = 0;
  let _totalVideos = 3;
  let _allResults  = [];

  /* ── DOM CACHE ─────────────────────── */
  let _overlay, _card, _title, _subtitle;
  let _reelWindow, _reels;
  let _resultEl, _resultIcon, _resultName;
  let _resultRarity, _resultDesc;
  let _nearMissEl, _nearText;
  let _spinCount, _btn, _closeBtn;

  const RARITY_COLORS = {
    rare:      { main: '#4488ff', label: 'RARE' },
    epic:      { main: '#aa44ff', label: 'EPIC' },
    legendary: { main: '#ffd700', label: 'LEGENDARY' },
  };

  function _cacheDom() {
    _overlay      = document.getElementById('slot-overlay');
    _card         = document.getElementById('slot-card');
    _title        = document.getElementById('slot-title');
    _subtitle     = document.getElementById('slot-subtitle');
    _reelWindow   = document.getElementById('slot-window');
    _reels        = [
      document.getElementById('slot-reel-0'),
      document.getElementById('slot-reel-1'),
      document.getElementById('slot-reel-2'),
    ];
    _resultEl     = document.getElementById('slot-result');
    _resultIcon   = document.getElementById('slot-result-icon');
    _resultName   = document.getElementById('slot-result-name');
    _resultRarity = document.getElementById('slot-result-rarity');
    _resultDesc   = document.getElementById('slot-result-desc');
    _nearMissEl   = document.getElementById('slot-near-miss');
    _nearText     = document.getElementById('slot-near-text');
    _spinCount    = document.getElementById('slot-spin-count');
    _btn          = document.getElementById('slot-btn');
    _closeBtn     = document.getElementById('slot-close-btn');
  }

  /* ── ROLL LOGIC ────────────────────── */

  function _isLastSpinOfLastVideo() {
    return _videoNum >= _totalVideos
        && _spins === _maxSpins - 1;
  }

  function _roll() {
    const locked = Progress.getLockedAbilities();
    if (locked.length === 0) return { result: null, nearMiss: false };

    // guaranteed mode
    if (_mode === 'guaranteed') {
      return { result: Progress.rollSlot(true), nearMiss: false };
    }

    // menu mode: every spin is guaranteed
    return { result: Progress.rollSlot(true), nearMiss: false };
  }

  /* ── SPIN ───────────────────────────── */

  function _startSpin() {
    if (_spinning) return;
    _spinning = true;
    _btn.disabled = true;
    if (_closeBtn) _closeBtn.classList.add('hidden');

    // reset visuals
    _resultEl.classList.add('hidden');
    _nearMissEl.classList.add('hidden');
    _reelWindow.className = '';

    const rollData = _roll();
    SlotReels.build(_reels, rollData);

    SlotReels.animate(_reels, () => {
      _spinning = false;
      _onSpinDone(rollData);
    });
  }

  /* ── SPIN RESULT ───────────────────── */

  function _onSpinDone(rollData) {
    if (rollData.result) {
      // WIN
      Progress.unlockAbility(rollData.result);
      _foundAny = true;
      _allResults.push(rollData.result);

      const aDef   = AbilityRegistry.get(rollData.result);
      const rarity = CONFIG.abilities.rarities[rollData.result] || 'rare';
      const rc     = RARITY_COLORS[rarity];

      _reelWindow.className = 'glow-' + rarity;
      _resultIcon.innerHTML =
        '<img src="assets/abilities/' + rollData.result +
        '.png" width="48" height="48" style="image-rendering:pixelated">';
      _resultName.textContent   = aDef ? (aDef.name || aDef.id) : rollData.result;
      _resultRarity.textContent = rc.label;
      _resultRarity.className   = 'rarity-' + rarity;
      _resultDesc.textContent   = aDef ? (aDef.desc || '') : '';
      _resultEl.classList.remove('hidden');
      _nearMissEl.classList.add('hidden');
      if (typeof SFX !== 'undefined') SFX.slotWin();

    } else if (rollData.nearMiss) {
      // NEAR MISS
      _reelWindow.className = '';
      _resultEl.classList.add('hidden');
      _nearMissEl.classList.remove('hidden');
      _nearText.textContent = 'SO CLOSE!';
      if (typeof SFX !== 'undefined') SFX.slotNearMiss();
      _card.style.animation = 'none';
      _card.offsetHeight;
      _card.style.animation = 'nearMissShake 0.5s ease-out';

    } else {
      // EMPTY
      _reelWindow.className = '';
      _resultEl.classList.add('hidden');
      _nearMissEl.classList.add('hidden');
    }

    _spins++;
    _updateButtons();
  }

  /* ── BUTTON STATE ──────────────────── */

  function _updateButtons() {

    // --- GUARANTEED ---
    if (_mode === 'guaranteed') {
      _btn.textContent = 'CONTINUE';
      _btn.classList.add('slot-btn-done');
      _btn.disabled = false;
      _btn.onclick  = _finish;
      if (_closeBtn) _closeBtn.classList.add('hidden');
      _spinCount.textContent = '';
      return;
    }

    // --- MENU: spin not done yet ---
    if (_spins < _maxSpins) {
      _spinCount.textContent = '';
      _btn.textContent = 'SPIN';
      _btn.classList.remove('slot-btn-done');
      _btn.disabled = false;
      _btn.onclick  = _startSpin;
      if (_closeBtn) _closeBtn.classList.add('hidden');
      return;
    }

    // --- MENU: spin done, more videos available? ---
    const canNext = Progress.canUseMenuVideo()
      && Progress.getLockedAbilities().length > 0;

    if (canNext) {
      const videosLeft = _totalVideos - _videoNum;

      _spinCount.textContent = videosLeft + ' ad' + (videosLeft > 1 ? 's' : '') + ' left';

      _btn.textContent = '▶ WATCH AD — NEW ABILITY';
      _btn.classList.remove('slot-btn-done');
      _btn.disabled = false;
      _btn.onclick  = _nextVideo;

      // show X to close without watching more
      if (_closeBtn) {
        _closeBtn.classList.remove('hidden');
        _closeBtn.onclick = _finish;
      }
    } else {
      // no more videos or all unlocked
      _btn.textContent = 'CONTINUE';
      _btn.classList.add('slot-btn-done');
      _btn.disabled = false;
      _btn.onclick  = _finish;
      if (_closeBtn) _closeBtn.classList.add('hidden');
      _spinCount.textContent = '';
    }
  }

  /* ── NEXT VIDEO ────────────────────── */

function _nextVideo() {
    // disable button while ad plays
    _btn.disabled = true;
    if (_closeBtn) _closeBtn.classList.add('hidden');

    AdPlaceholder.showRewarded(() => {
      // ad finished — consume video and give spin
      Progress.useMenuVideo();
      _videoNum++;

      // reset per-video state
      _spins    = 0;
      _foundAny = false;
      _resultEl.classList.add('hidden');
      _nearMissEl.classList.add('hidden');
      _reelWindow.className = '';

      const videosLeft = _totalVideos - _videoNum;
      _subtitle.textContent = videosLeft === 0
        ? 'Last chance!'
        : 'Unlock a random ability!';

      // show spin button
      _spinCount.textContent = '';
      _btn.textContent = 'SPIN';
      _btn.classList.remove('slot-btn-done');
      _btn.disabled = false;
      _btn.onclick  = _startSpin;
      if (_closeBtn) _closeBtn.classList.add('hidden');

    }, () => {
      // ad failed — re-enable buttons, no video consumed
      _btn.disabled = false;
      if (_closeBtn) _closeBtn.classList.remove('hidden');
    });
  }

  /* ── FINISH ────────────────────────── */

  function _finish() {
    _active = false;
    _overlay.classList.add('hidden');
    SlotReels.reset(_reels);
    _reelWindow.className = '';
    _btn.classList.remove('slot-btn-done');

    const lastResult = _allResults.length > 0
      ? _allResults[_allResults.length - 1]
      : null;

    if (_onResult) _onResult(lastResult);
    if (_onClose)  _onClose();
  }

  /* ── SHOW UI ───────────────────────── */

 function _showUI() {
    _cacheDom();

    // reset everything
    _resultEl.classList.add('hidden');
    _nearMissEl.classList.add('hidden');
    _reelWindow.className = '';
    SlotReels.reset(_reels);
    // pre-fill reels with random icons (not empty)
    SlotReels.showInitial(_reels);
    _btn.classList.remove('slot-btn-done');
    _btn.disabled = false;
    if (_closeBtn) _closeBtn.classList.add('hidden');

    if (_mode === 'guaranteed') {
      _title.textContent     = 'NEW ABILITY!';
      _subtitle.textContent  = 'Tap to reveal your reward';
      _spinCount.textContent = '';
    } else {
      _title.textContent     = 'ABILITY SLOT';
      _subtitle.textContent  = 'Unlock a random ability!';
      _spinCount.textContent = '';
    }

    _btn.textContent = 'SPIN';
    _btn.onclick     = _startSpin;
    _overlay.classList.remove('hidden');
  }

  /* ── PUBLIC API ────────────────────── */

  return {

    open(opts) {
      if (_active) return;
      if (Progress.getLockedAbilities().length === 0) {
        if (opts.onResult) opts.onResult(null);
        if (opts.onClose)  opts.onClose();
        return;
      }

      _mode     = opts.mode || 'guaranteed';
      _onResult = opts.onResult || null;
      _onClose  = opts.onClose  || null;
      _spinning = false;
      _spins    = 0;
      _foundAny = false;
      _maxSpins = _mode === 'guaranteed'
        ? 1
        : CONFIG.abilities.menuSlots.spinsPerVideo;
      _allResults = [];

      if (_mode === 'menu') {
        _totalVideos = CONFIG.abilities.menuSlots.maxVideos;

        // show ad BEFORE opening slot
        AdPlaceholder.showRewarded(() => {
          // ad finished — consume video and open
          Progress.useMenuVideo();
          _videoNum = Progress.getMenuVideosUsed();
          _active   = true;
          _showUI();
        }, () => {
          // ad failed — don't open slot
          if (opts.onClose) opts.onClose();
        });

      } else {
        // guaranteed mode — no ad needed
        _videoNum    = 0;
        _totalVideos = 0;
        _active      = true;
        _showUI();
      }
    },

    isActive() { return _active; },
    close()    { if (_active) _finish(); },

    getRarity(id) {
      return CONFIG.abilities.rarities[id] || 'rare';
    },
    RARITY_COLORS,
  };

})();

/* === js/ui/slotReels.js === */
/* ═══════════════════════════════════════
   SLOTREELS.JS
   Slot machine reel mechanics — building,
   animating, and displaying 3-reel results.

   Pure visual component. No game logic,
   no progression, no state management.

   Used by: slotMachine.js
   Depends on: CONFIG (abilities.rarities)
   ═══════════════════════════════════════ */

const SlotReels = (() => {

  /* ── CONSTANTS ─────────────────────── */
  const REEL_COUNT     = 3;
  const ICONS_PER_REEL = 20;
  const ICON_SIZE      = 48;
  const ICON_GAP       = 6;
  const ICON_STEP      = ICON_SIZE + ICON_GAP;
  const VISIBLE_ROWS   = 3;
  const REEL_STAGGER   = 350;
  const BASE_DURATION  = 1800;
  const SPIN_DELAYS    = [0, 150, 300]; // delay before each reel starts

  /* ── HELPERS ───────────────────────── */

  function _allIds() {
    return Object.keys(CONFIG.abilities.rarities);
  }

  function _randomId() {
    const ids = _allIds();
    return ids[Math.floor(Math.random() * ids.length)];
  }

  function _randomIdExcept(excludeId) {
    const ids = _allIds().filter(id => id !== excludeId);
    return ids[Math.floor(Math.random() * ids.length)];
  }

  /* ── PICK TARGETS ──────────────────── */

  /**
   * Decide what each reel lands on.
   * rollData: { result, nearMiss }
   * Returns: [id, id, id] for center row
   */
  function _pickTargets(rollData) {
    if (rollData.result) {
      // 3 matching
      return [rollData.result, rollData.result, rollData.result];
    }

    if (rollData.nearMiss) {
      // 2 match + 1 different (legendary tease)
      // first 2 reels show same legendary, third ALMOST lands
      // on it but stops on something different
      const legs = Object.entries(CONFIG.abilities.rarities)
        .filter(([, r]) => r === 'legendary')
        .map(([id]) => id);
      const legId  = legs[Math.floor(Math.random() * legs.length)];
      const diffId = _randomIdExcept(legId);
      return [legId, legId, diffId];
    }

    // no match — all different (prevent accidental triple)
    const t = [_randomId(), _randomId(), _randomId()];
    while (t[0] === t[1] && t[1] === t[2]) {
      t[2] = _randomId();
    }
    return t;
  }

  /* ── BUILD REELS ───────────────────── */

  /**
   * Populate reel DOM elements with icons.
   * Target icon sits at index ICONS_PER_REEL - 2.
   * reelEls: array of 3 DOM elements
   * rollData: { result, nearMiss }
   * Returns: [id, id, id] targets
   */
  function build(reelEls, rollData) {
    const allIds  = _allIds();
    const targets = _pickTargets(rollData);

    for (let r = 0; r < REEL_COUNT; r++) {
      const reel = reelEls[r];
      reel.innerHTML = '';

      for (let i = 0; i < ICONS_PER_REEL; i++) {
        let iconId;

        if (i === ICONS_PER_REEL - 2) {
          // target position
          iconId = targets[r];
        } else if (rollData.nearMiss && r === 2 && i === ICONS_PER_REEL - 3) {
          // near miss: icon JUST ABOVE target on reel 3
          // is the same as reels 0 & 1 — player sees it
          // scroll past and land on the wrong one
          iconId = targets[0];
        } else {
          iconId = allIds[Math.floor(Math.random() * allIds.length)];
        }

        const img = document.createElement('img');
        img.src = 'assets/abilities/' + iconId + '.png';
        img.alt = iconId;
        img.dataset.id = iconId;
        reel.appendChild(img);
      }

      // reset position
      reel.style.transition = 'none';
      reel.style.top = '0px';
    }

    return targets;
  }

  /* ── ANIMATE ───────────────────────── */

  /**
   * Spin reels to land on targets.
   * reelEls: array of 3 DOM elements
   * callback: called when all reels stop
   */
  function animate(reelEls, callback) {
    // force reflow
    reelEls.forEach(r => r.offsetHeight);

    const targetIdx    = ICONS_PER_REEL - 2;
    const centerOffset = Math.floor(VISIBLE_ROWS / 2) * ICON_STEP;
    const targetTop    = -(targetIdx * ICON_STEP) + centerOffset;

    reelEls.forEach((reel, i) => {
      const duration = BASE_DURATION + (i * REEL_STAGGER);
      const delay    = i * 150;

      setTimeout(() => {
        reel.style.transition =
          `top ${duration}ms cubic-bezier(0.15, 0.85, 0.35, 1.0)`;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            reel.style.top = targetTop + 'px';
          });
        });
      }, delay);
    });

    // tick sound during spin
    const totalSpinMs = 150 * (REEL_COUNT - 1)
      + BASE_DURATION
      + (REEL_COUNT - 1) * REEL_STAGGER;
    let tickElapsed = 0;
    const tickInterval = 90;
    const tickTimer = setInterval(() => {
      tickElapsed += tickInterval;
      if (tickElapsed >= totalSpinMs) {
        clearInterval(tickTimer);
        return;
      }
      if (typeof SFX !== 'undefined') SFX.slotTick();
    }, tickInterval);

    // stop sound when each reel lands
    reelEls.forEach((reel, i) => {
      const stopTime = SPIN_DELAYS[i] + BASE_DURATION + (i * REEL_STAGGER);
      setTimeout(() => {
        if (typeof SFX !== 'undefined') SFX.slotStop();
      }, stopTime);
    });

    const totalMs = totalSpinMs + 300;
    setTimeout(callback, totalMs);
  }

  /* ── SHOW INITIAL (pre-fill reels) ── */

  /**
   * Fill reels with random icons so they
   * are not empty when slot opens.
   * Called by SlotMachine before first spin.
   */
  function showInitial(reelEls) {
    const allIds = _allIds();
    for (let r = 0; r < REEL_COUNT; r++) {
      const reel = reelEls[r];
      reel.innerHTML = '';
      reel.style.transition = 'none';
      reel.style.top = '0px';

      // just enough icons to fill visible rows
      for (let i = 0; i < VISIBLE_ROWS + 2; i++) {
        const iconId = allIds[Math.floor(Math.random() * allIds.length)];
        const img = document.createElement('img');
        img.src = 'assets/abilities/' + iconId + '.png';
        img.alt = iconId;
        img.dataset.id = iconId;
        reel.appendChild(img);
      }
    }
  }

  /* ── RESET ─────────────────────────── */

  function reset(reelEls) {
    reelEls.forEach(r => {
      r.innerHTML = '';
      r.style.transition = 'none';
      r.style.top = '0px';
    });
  }

  /* ── PUBLIC ────────────────────────── */
  return { build, animate, reset, showInitial };

})();

/* === js/ui/progressBar.js === */
/* ═══════════════════════════════════════
   PROGRESSBAR.JS
   Reusable wave progress bar component.
   Renders a segmented bar with wave colors,
   labels, and percentage. Supports static
   render and animated fill.

   Used by: mapSelect.js, screens.js
   Depends on: (none — pure UI component)
   ═══════════════════════════════════════ */

const ProgressBar = (() => {

  const WAVE_COLORS = [
    '#4ade80', '#4ade80',   // wave 1-2: green
    '#a3e635', '#a3e635',   // wave 3-4: lime
    '#fbbf24', '#fbbf24',   // wave 5-6: yellow
    '#f97316', '#f97316',   // wave 7-8: orange
    '#ef4444', '#ef4444',   // wave 9-10: red
    '#a855f7',              // wave 11: purple
  ];

  // internal state
  let _container  = null;
  let _totalWaves = 0;
  let _filled     = 0;
  let _segments   = [];
  let _labels     = [];
  let _pctEl      = null;
  let _trackEl    = null;
  let _animTimer  = null;

  /* ── RENDER — build bar from scratch ── */
  function render(container, filledWaves, totalWaves, opts) {
    opts = opts || {};
    reset();

    _container  = container;
    _totalWaves = totalWaves;
    _filled     = filledWaves;
    container.innerHTML = '';

    const showLabels  = opts.showLabels !== false;
    const showPct     = opts.showPct !== false;
    const isCompleted = opts.isCompleted || false;
    const pct = totalWaves > 0
      ? Math.round((filledWaves / totalWaves) * 100) : 0;

    // labels row: wave numbers + percentage
    const labelsRow = document.createElement('div');
    labelsRow.className = 'progress-labels';

    if (showLabels) {
      for (let i = 0; i < totalWaves; i++) {
        const lbl = document.createElement('div');
        lbl.className = 'progress-label' + (i < filledWaves ? ' filled' : '');
        lbl.textContent = i + 1;
        labelsRow.appendChild(lbl);
        _labels.push(lbl);
      }
    }

    if (showPct) {
      _pctEl = document.createElement('div');
      _pctEl.className = 'progress-pct' + (isCompleted ? ' complete' : '');
      _pctEl.textContent = pct + '%';
      labelsRow.appendChild(_pctEl);
    }

    container.appendChild(labelsRow);

    // track with segments
    _trackEl = document.createElement('div');
    _trackEl.className = 'progress-track' + (isCompleted ? ' complete' : '');

    for (let i = 0; i < totalWaves; i++) {
      const seg = document.createElement('div');
      seg.className = 'progress-segment';
      if (i < filledWaves) {
        _applyFill(seg, i);
      } else {
        seg.classList.add('empty');
      }
      _trackEl.appendChild(seg);
      _segments.push(seg);
    }

    container.appendChild(_trackEl);
  }

  /* ── FILL single segment visually ── */
  function _applyFill(seg, index) {
    seg.classList.remove('empty');
    seg.classList.add('filled');
    const col = WAVE_COLORS[index] || '#a855f7';
    seg.style.background = col;
    seg.style.boxShadow  = '0 0 4px ' + col + '88';
  }

  /* ── UPDATE pct + label for a newly filled index ── */
  function _updateAfterFill(index) {
    if (_labels[index]) _labels[index].classList.add('filled');
    _filled = index + 1;
    if (_pctEl) {
      const pct = Math.round((_filled / _totalWaves) * 100);
      _pctEl.textContent = pct + '%';
    }
  }

  /* ── ANIMATE TO — fill wave by wave with delay ── */
  function animateTo(targetWave, opts, callback) {
    opts = opts || {};
    const delay = opts.stepDelay || 160;
    const onStep = opts.onStep || null;
    const startFrom = _filled;

    if (targetWave <= startFrom) {
      if (callback) callback();
      return;
    }

    let current = startFrom;
    _animTimer = setInterval(() => {
      _applyFill(_segments[current], current);
      _updateAfterFill(current);
      if (onStep) onStep(current, targetWave);
      current++;
      if (current >= targetWave) {
        clearInterval(_animTimer);
        _animTimer = null;
        if (callback) callback();
      }
    }, delay);
  }

  /* ── COMPLETE — fill all + add glow ── */
  function complete(opts, callback) {
    // backward compat: complete(callback) still works
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    opts = opts || {};
    const stepDelay = opts.stepDelay || 100;
    const onStep = opts.onStep || null;

    animateTo(_totalWaves, { stepDelay: stepDelay, onStep: onStep }, () => {
      if (_trackEl) _trackEl.classList.add('complete');
      if (_pctEl) {
        _pctEl.classList.add('complete');
        _pctEl.textContent = '100%';
      }
      if (callback) callback();
    });
  }

  /* ── RESET — clean everything ── */
  function reset() {
    if (_animTimer) {
      clearInterval(_animTimer);
      _animTimer = null;
    }
    if (_container) _container.innerHTML = '';
    _container  = null;
    _segments   = [];
    _labels     = [];
    _pctEl      = null;
    _trackEl    = null;
    _totalWaves = 0;
    _filled     = 0;
  }

  return { render, animateTo, complete, reset };
})();

/* === js/systems/juice.js === */
/* ═══════════════════════════════════════
   JUICE.JS
   Visual feedback effects — particles,
   screen shake, damage flash.

   Used by: combat.js, loop.js
   Depends on: dom.js, config.js
   ═══════════════════════════════════════ */

/* ── DEFAULT DEATH COLORS ─────────────
   Used when enemy has no deathColors.
   Based on enemy size bracket.
──────────────────────────────────────── */
const _defaultDeathColors = {
  small:  ['#ffffff', '#cccccc', '#999999'],
  medium: ['#ffffff', '#dddddd', '#aaaaaa'],
  large:  ['#ffffff', '#eeeeee', '#bbbbbb'],
};

/* ── KILL FLASH ───────────────────────── */
function _spawnKillFlash(x, y) {
  const cfg = CONFIG.juice.particles;
  if (!cfg.flash) return;

  const fl = document.createElement('div');
  fl.style.cssText = `
    position:absolute;left:${x}px;top:${y}px;
    width:24px;height:24px;
    background:radial-gradient(circle,rgba(255,255,255,0.9),rgba(255,255,255,0) 70%);
    border-radius:50%;pointer-events:none;
    transform:translate(-50%,-50%);z-index:90;
  `;
  arena.appendChild(fl);
  setTimeout(() => fl.remove(), cfg.flashDuration);
}

/* ── MAIN PARTICLE SYSTEM ─────────────── */
function spawnParticles(x, y, enemyDef) {
  const cfg = CONFIG.juice.particles;

  // resolve death config from enemy def
  const dp = (enemyDef && enemyDef.deathParticles) || {};
  const enemySize = (enemyDef && enemyDef.size) || 48;

  // pick color palette
  let colors;
  if (dp.colors && dp.colors.length) {
    colors = dp.colors;
  } else if (enemyDef && enemyDef.deathColors && enemyDef.deathColors.length) {
    colors = enemyDef.deathColors;
  } else {
    if (enemySize <= 48)       colors = _defaultDeathColors.small;
    else if (enemySize <= 72)  colors = _defaultDeathColors.medium;
    else                       colors = _defaultDeathColors.large;
  }

  // count
  const isElite = enemySize >= 80;
  const baseCount = isElite ? cfg.killCountElite : cfg.killCount;
  const count = dp.count || baseCount;

  // physics overrides
  const fric = dp.friction != null ? dp.friction : cfg.friction;

  // flash
  _spawnKillFlash(x, y);

  // spawn particles
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = cfg.minSize + Math.random() * (cfg.maxSize - cfg.minSize);
    const color = colors[Math.floor(Math.random() * colors.length)];

    // explode outward — random direction
    const angle = Math.random() * Math.PI * 2;
    const speed = cfg.minSpeed + Math.random() * (cfg.maxSpeed - cfg.minSpeed);
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;

    // lifetime variance
    const lifetime = cfg.minLifetime + Math.random() * (cfg.maxLifetime - cfg.minLifetime);

    // offset from origin
    let px = 0;
    let py = 0;

    p.style.cssText = `
      width:${size}px;height:${size}px;
      background:${color};
      left:${x}px;top:${y}px;
      opacity:1;border-radius:0;
      pointer-events:none;
    `;
    arena.appendChild(p);

    const start = performance.now();

    function animParticle(now) {
      const elapsed = now - start;
      const t = elapsed / lifetime;
      if (t >= 1) { p.remove(); return; }

      // friction slows them down — they stop naturally
      vx *= fric;
      vy *= fric;

      px += vx;
      py += vy;

      // fade out in last 40%
      const opacity = t > 0.6 ? 1 - ((t - 0.6) / 0.4) : 1;

      // scale down in last 25%
      const scale = t > 0.75 ? 1 - ((t - 0.75) / 0.25) * 0.5 : 1;

      p.style.left = (x + px) + 'px';
      p.style.top = (y + py) + 'px';
      p.style.opacity = opacity;
      p.style.transform = `translate(-50%,-50%) scale(${scale})`;

      requestAnimationFrame(animParticle);
    }

    requestAnimationFrame(animParticle);
  }
}
/* ── SCREEN SHAKE ─────────────────────── */
let shakeTimeout = null;
function triggerShake() {
  if (!CONFIG.juice.shakeOnDamage) return;
  arena.classList.remove('shake');
  void arena.offsetWidth;
  arena.classList.add('shake');
  clearTimeout(shakeTimeout);
  shakeTimeout = setTimeout(() => arena.classList.remove('shake'), 300);
}

/* ── SAND PARTICLES (desert map) ──────── */
function spawnSandParticle(x, y) {
  const p = document.createElement('div');
  p.className = 'particle';

  const size  = 5 + Math.random() * 5;
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.6 + Math.random() * 1.2;
  const vx    = Math.cos(angle) * speed;
  const vy    = Math.sin(angle) * speed;

  const colors = ['#b5893a', '#a07830', '#c49a45'];
  const color  = colors[Math.floor(Math.random() * colors.length)];

  p.style.cssText = `width:${size}px;height:${size}px;background:${color};left:${x}px;top:${y}px;opacity:0.9;`;
  arena.appendChild(p);

  const start = performance.now();
  function anim(now) {
    const t = (now - start) / 550;
    if (t >= 1) { p.remove(); return; }
    p.style.left    = (x + vx * speed * t * 10) + 'px';
    p.style.top     = (y + vy * speed * t * 10) + 'px';
    p.style.opacity = (1 - t) * 0.9 + '';
    requestAnimationFrame(anim);
  }
  requestAnimationFrame(anim);
}

/* === js/systems/spawn.js === */
/* ═══════════════════════════════════════
   SPAWN.JS
   Physical creation of enemies and bullets.
   Handles DOM element creation and
   attaches them to the arena.

   Used by: modes/infinite/director.js
   Depends on: state.js, dom.js, config.js,
               classes/Enemy.js, classes/Bullet.js
   ═══════════════════════════════════════ */

function spawnEnemyDirected(def, dir) {
  if (!running) return;

  const { w, h } = getArenaSize();
  const cx = w / 2;
  const cy = h / 2;
  const m  = CONFIG.spawn.edgeMargin;

  let x, y;
  if (dir === 'up')    { x = cx;    y = -m;    }
  if (dir === 'down')  { x = cx;    y = h + m; }
  if (dir === 'left')  { x = -m;    y = cy;    }
  if (dir === 'right') { x = w + m; y = cy;    }

  const spread = CONFIG.spawn.spread;
  if (dir === 'up'   || dir === 'down')  x += (Math.random() - 0.5) * spread;
  if (dir === 'left' || dir === 'right') y += (Math.random() - 0.5) * spread;

const _map = ActiveDirector && ActiveDirector.getCurrentMap ? ActiveDirector.getCurrentMap() : null;
const _wave = ActiveDirector && ActiveDirector.getWave ? ActiveDirector.getWave() : 1;
const _isIntro = _map && _map.introWaves && _map.introWaves[_wave];

let speedMult = 1;
if (!_isIntro) {
  if (typeof ChallengeDirector !== 'undefined' && ActiveDirector === ChallengeDirector) {
    // challenge: step-based speed scaling every 5 waves
    const steps = CONFIG.challenge.speedSteps;
    const idx = Math.min(Math.floor((_wave - 1) / 5), steps.length - 1);
    speedMult = steps[idx];
}else {
    const _speedIncrease = (_map && _map.speedIncreasePerLevel)
      ? _map.speedIncreasePerLevel
      : CONFIG.difficulty.speedIncreasePerLevel;
    speedMult = 1 + (_wave - 1) * _speedIncrease;
  }
}

  // adventure mode boss can apply an extra speed multiplier
  if (typeof ActiveDirector.isBoss === 'function' && ActiveDirector.isBoss()) {
    const map = ActiveDirector.getCurrentMap && ActiveDirector.getCurrentMap();
    if (map && map.boss && map.boss.speedMult) {
      speedMult *= map.boss.speedMult;
    }
  }

 let sMult = Math.min(CONFIG.difficulty.maxSpeedMult, speedMult);

  // per-map speed override for specific enemy types
  const _mapOverrides = ActiveDirector.getCurrentMap && ActiveDirector.getCurrentMap();
  if (_mapOverrides && _mapOverrides.speedOverrides && _mapOverrides.speedOverrides[def.id]) {
    sMult *= (_mapOverrides.speedOverrides[def.id] / def.speedMult);
  }

  

  // 40% chance for random speed variation
  const _svChance = (_map && _map.speedVariationChance !== undefined) ? _map.speedVariationChance : 0.40;
  const _svBoosts = (_map && _map.speedVariationBoosts) ? _map.speedVariationBoosts : [1.05, 1.08, 1.10, 1.12, 1.15];
  if (_svChance > 0 && Math.random() < _svChance) {
    sMult *= _svBoosts[Math.floor(Math.random() * _svBoosts.length)];
  }

  const enemy     = new Enemy(def, x, y, dir, sMult, w, h);

  if (player.specialActive && player.ability.onEnemySpawn) {
    player.ability.onEnemySpawn(enemy);
  }

  const el = document.createElement('div');
el.className      = 'enemy';
el.style.width    = enemy.size + 'px';
el.style.height   = enemy.size + 'px';
el.style.left     = x + 'px';
el.style.top      = y + 'px';

if (enemy.def.sprite) {
  el.style.backgroundImage  = `url(${enemy.def.sprite})`;
  el.style.imageRendering   = 'pixelated';

 if (enemy.def.spriteFrames && enemy.def.spriteFrames > 1) {
    const fw = enemy.def.spriteFrameW || enemy.size;
    const fh = enemy.def.spriteFrameH || enemy.size;
    const frames = enemy.def.spriteFrames;
    // scale sprite to fit enemy.size
    const scale = enemy.size / fh;
    const scaledW = Math.round(fw * frames * scale);
    const scaledH = enemy.size;
    el.style.backgroundSize = `${scaledW}px ${scaledH}px`;
    el.style.backgroundRepeat = 'no-repeat';
    const dur = enemy.def.spriteSpeed || 0.8;
    const animName = `eIdle_${enemy.def.id}_${enemy.size}`;
    if (!document.getElementById('anim-' + animName)) {
      const style = document.createElement('style');
      style.id = 'anim-' + animName;
      style.textContent = `@keyframes ${animName}{from{background-position-x:0}to{background-position-x:-${scaledW}px}}`;
      document.head.appendChild(style);
    }
    el.style.animation = `${animName} ${dur}s steps(${frames}) infinite`;
  } else {
    el.style.backgroundSize = 'cover';
  }
} else {
  el.style.fontSize = Math.round(enemy.size * 0.5) + 'px';
  el.textContent    = enemy.emoji;
}

// rotazione in base alla direzione
el.style.transform = 'translate(-50%,-50%)';
// rotate enemies that need direction-based rotation (e.g. eagle dive)
if (enemy.def.rotateToDirection) {
  const rotMap = { down: 0, left: 90, up: 180, right: 270 };
  el.style.transform = `translate(-50%,-50%) rotate(${rotMap[dir]}deg)`;
}

 if (!enemy.def.noHpBar) {
    const hpWrap = document.createElement('div');
    hpWrap.className = 'enemy-hp-wrap';
    const hpFill = document.createElement('div');
    hpFill.className   = 'enemy-hp-fill';
    hpFill.style.width = '100%';
    hpWrap.appendChild(hpFill);
    el.appendChild(hpWrap);
    enemy.hpFill = hpFill;
  } else {
    enemy.hpFill = null;
  }

  arena.appendChild(el);
  enemy.el = el;
  // start underground if enemy has underground flag
  enemy.underground = enemy.def.underground ? true : false;
  if (enemy.underground) {
    el.style.opacity = '0';
    if (enemy.def.undergroundSpeed) {
      enemy.speed = enemy.baseSpeed * enemy.def.undergroundSpeed;
    }
  }
  enemies.push(enemy);
}

function spawnBullet(enemy) {
  const { w, h } = getArenaSize();
  const cx = w / 2;
  const cy = h / 2;

  const dx   = cx - enemy.x;
  const dy   = cy - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;

  const vx = dx / dist * enemy.bulletSpeed;
  const vy = dy / dist * enemy.bulletSpeed;

const b = new Bullet(enemy.x, enemy.y, vx, vy, enemy.bulletDamagePct, enemy.def.bulletType);// salva sempre velocità piena come base per onDeactivate
b.vxBase = vx;
b.vyBase = vy;
  const el = document.createElement('div');
  el.className  = 'bullet';
  el.style.left = b.x + 'px';
  el.style.top  = b.y + 'px';
  el.style.backgroundImage = `url(${b.sprite})`;
  el.style.backgroundSize  = 'cover';
  el.style.imageRendering  = 'pixelated';
  el.style.backgroundColor = 'transparent';
  el.style.border          = 'none';

  // apply bullet type visual class
  if (b.bulletType) el.classList.add(b.bulletType);

  arena.appendChild(el);
  b.el    = el;
  b.owner = enemy;
  bullets.push(b);
  SFX.bullet();
}


/* === js/systems/combat.js === */
/* ═══════════════════════════════════════
   COMBAT.JS
   Attack, kill registration and
   special ability activation.

   Used by: input.js, loop.js
   Depends on: state.js, dom.js, config.js,
               audio.js, hud.js, juice.js
   ═══════════════════════════════════════ */

/* ── ATTACK SPRITE ────────────────────
   Swaps player sprite to attack frame
   for the slash duration, then restores idle.
   Frame map: 1=down, 2=right, 3=left, 4=up */

let _atkSpriteTimer = null;

const _ATK_FRAMES = { down: 1, right: 2, left: 3, up: 4 };

function showAttackSprite(dir) {
  if (!playerEl) return;

  // clear pending restore
  if (_atkSpriteTimer) clearTimeout(_atkSpriteTimer);

  const frame = _ATK_FRAMES[dir] || 1;

  // swap to attack spritesheet, show correct frame
  playerEl.style.animation          = 'none';
  playerEl.style.backgroundImage    = 'url(assets/characters/attack.png)';
  playerEl.style.backgroundSize     = '480px 96px';
  playerEl.style.backgroundPosition = `-${frame * 96}px 0px`;

  // restore idle after attack flash (120ms)
  _atkSpriteTimer = setTimeout(() => {
    playerEl.style.backgroundImage    = 'url(assets/characters/player_idle.png)';
    playerEl.style.backgroundSize     = '1152px 96px';
    playerEl.style.backgroundPosition = '0px 0px';
    playerEl.style.animation          = 'playerIdle 1.2s steps(12) infinite';
    _atkSpriteTimer = null;
  }, 120);
}

function showSlashEffect(dir) {
  // full-line trail when slash ability is active
  if (player && player.slashActive) {
    showSlashTrail(dir);
    return;
  }

  // screen shake on every attack during one-hit
  if (player && player.oneHitActive) {
    triggerShake();
  }

  const { w, h } = getArenaSize();
  const cx = w / 2;
  const cy = h / 2;

  const el = document.createElement('div');
  el.className = 'slash-effect';

  const dist = 89;
  let x = cx, y = cy;
  let rot = 0;

  if (dir === 'right') { x += dist; rot = 0; }
  if (dir === 'left')  { x -= dist; rot = 180; }
  if (dir === 'up')    { y -= dist; rot = -90; }
  if (dir === 'down')  { y += dist; rot = 90; }

  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  el.style.transform = `translate(-50%,-50%) rotate(${rot}deg)`;

  arena.appendChild(el);
  setTimeout(() => el.remove(), 260);
}

/* ── KILL ── */

function registerKill(e, multiKill) {

  if (e.def.onDeath) {
    e.def.onDeath(e);
    showScorePop(e.x, e.y, e.points);
    player.score += e.points;
    scoreEl.textContent = player.score;
    return;
  }


  const mkMult = multiKill && multiKill >= 2 ? multiKill : 1;
  const mult   = player.getComboMult() * mkMult;
  const pts    = Math.round(e.points * mult);

  player.score += pts;
  player.kills += 1;
  if (!player.specialActive) {
    player.addKill();
  }
  ActiveDirector.onKill();

  showScorePop(e.x, e.y, pts);
  scoreEl.textContent = player.score;
  onComboKill(e.x, e.y, pts);
  updateComboDisplay();
  updateSpecialBar();
  updateProgress();
}

/* ── SPECIAL ── */

function activateSpecial() {
  if (!running) return;
  if (_choosingUpgrade || _countdownActive || _inputBlocked) return;
  if (!player.activateSpecial()) return;

  SFX.special();

  playerEl.classList.add('special-active');
  specialRing.classList.add('active');
  const barSpecialEl = document.getElementById('bar-special');
  if (barSpecialEl) barSpecialEl.classList.remove('bar-ready');

  player.ability.onActivate(enemies);
}

/* ── ATTACK ── */

function handleDir(dir) {
  if (!running || choosingAbility || isAttacking) return;

  // challenge upgrade choice — selecting with direction
  if (typeof isChoosingChallengeUpgrade === 'function' && isChoosingChallengeUpgrade()) {
    selectChallengeUpgrade(dir);
    return;
  }

  // upgrade choice — selecting with direction
  if (typeof isChoosingUpgrade === 'function' && isChoosingUpgrade()) {
    selectUpgrade(dir);
    return;
  }
  isAttacking = true;
  SFX.slash();
  showAttackSprite(dir);

  const hitDmg      = player.getHitDamage();
  const { w, h }    = getArenaSize();
  const cx          = w / 2;
  const cy          = h / 2;
  const arenaSize   = Math.min(w, h);
  const attackRange = player.getAttackRange(arenaSize);
  const isPiercing  = (player.specialActive && player.ability.piercing) || player.slashActive;

  let dirs = [dir];
  if (player.doubleAttack && !isPiercing) {
    dirs = [dir, ...getAdjacentDirs(dir)];
  }
 if (player.doubleStrikeActive) {
    const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
    const opp = opposites[dir];
    if (!dirs.includes(opp)) dirs.push(opp);
  }

  showSlashEffect(dir);
  if (player.doubleStrikeActive) {
    const opp = { up: 'down', down: 'up', left: 'right', right: 'left' }[dir];
    showSlashEffect(opp);
  }
  let anyHit = false;

  // check orb collection
  if (typeof OrbSystem !== 'undefined') {
    if (OrbSystem.checkCollect(dir, attackRange)) anyHit = true;
  }

  for (const d of dirs) {

    /* ── PARRY BULLETS ── */
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const b = bullets[bi];
      if (!b.owner || b.owner.dir !== d) continue;

      const bdx   = b.x - cx;
      const bdy   = b.y - cy;
      const bdist = Math.sqrt(bdx * bdx + bdy * bdy);
      if (bdist > attackRange) continue;

      anyHit = true;
      SFX.parry();
      spawnParticles(b.x, b.y, { size: 24, deathColors: ['#378ADD', '#55aaff', '#2266bb'] });
      showActionPop(d, 'PARRY', '#44ddff');
      b.el.remove();
      if (b.owner) b.owner.hasBullet = false;
      bullets.splice(bi, 1);
    }

    /* ── PARRY TORNADOES (parryable enemies) ── */
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e  = enemies[i];
      if (!e.def.parryable) continue;
      if (e.dir !== d) continue;
      if (e.underground) continue;

      const dx   = e.x - cx;
      const dy   = e.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > attackRange) continue;

      anyHit = true;
      SFX.parry();
      spawnParticles(e.x, e.y, e.def);
      showActionPop(d, 'PARRY', '#44ddff');
      e.el.remove();
      enemies.splice(i, 1);
      registerKill(e);
    }

    /* ── HIT ENEMIES ── */
    if (isPiercing) {
      let _killsThisSwing = 0;

      for (let i = enemies.length - 1; i >= 0; i--) {
        const e  = enemies[i];
        if (e.dir !== d) continue;
        if (e.underground) continue;

        const dx   = e.x - cx;
        const dy   = e.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (!player.slashActive && dist > attackRange) continue;

        anyHit = true;
        if (player.oneHitActive) SFX.oneHitSmash();
        else SFX.hitByType(e.def.hitSound || 'flesh');
        e.flashHit();
        e.hit(hitDmg);
        if (e.hpFill) e.hpFill.style.width = Math.round(e.hpPercent() * 100) + '%';

        // frost touch — freeze BEFORE onHit so enemy can't teleport/jump
        if (e.isAlive() && player._frostChance > 0 && Math.random() < player._frostChance && !e.frozen) {
          e.freeze(CONFIG.combat.freezeDuration || 2000);
          SFX.freeze();
          showActionPop(d, 'FREEZE!', '#44ddff');
        }

        // onHit only if NOT frozen
        if (e.def.onHit && e.isAlive() && !e.frozen) e.def.onHit(e);

        // critical hit pop
        if (player._lastHitWasCrit) {
          SFX.crit();
          showActionPop(d, 'CRIT!', '#ff4444');
        }

        if (!e.isAlive()) {
          _killsThisSwing++;
          if (e.frozen) e.clearFreeze();
          spawnParticles(e.x, e.y, e.def);
          e.el.remove();
          enemies.splice(i, 1);
          registerKill(e, _killsThisSwing);
        }
      }

      if (_killsThisSwing >= 2) {
        const labels = { 2: 'DOUBLE KILL', 3: 'TRIPLE KILL', 4: 'MEGA KILL' };
        const label  = labels[_killsThisSwing] || 'ULTRA KILL';
        const colors = { 2: '#ffdd44', 3: '#ff8844', 4: '#ff44ff' };
        const color  = colors[_killsThisSwing] || '#ff44ff';
        SFX.multiKill(_killsThisSwing);
        showActionPop(d, label, color);
        triggerComboBump();
      }

    } else {
      let _killsThisSwing = 0;

      for (let i = enemies.length - 1; i >= 0; i--) {
        const e  = enemies[i];
        if (e.dir !== d) continue;
        if (e.underground) continue;

        const dx   = e.x - cx;
        const dy   = e.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > attackRange) continue;

        anyHit = true;
        if (player.oneHitActive) SFX.oneHitSmash();
        else SFX.hitByType(e.def.hitSound || 'flesh');
        e.flashHit();
        e.hit(hitDmg);
        if (e.hpFill) e.hpFill.style.width = Math.round(e.hpPercent() * 100) + '%';

        
        // frost touch — freeze BEFORE onHit so enemy can't teleport/jump
        if (e.isAlive() && player._frostChance > 0 && Math.random() < player._frostChance && !e.frozen) {
          e.freeze(CONFIG.combat.freezeDuration || 2000);
          SFX.freeze();
          showActionPop(d, 'FREEZE!', '#44ddff');
        }

        // onHit only if NOT frozen
        if (e.def.onHit && e.isAlive() && !e.frozen) e.def.onHit(e);

        // stun chance (base ability)
        if (player.stunChance > 0 && Math.random() < player.stunChance) {
          e.stun(1000);
        }

        // critical hit pop
        if (player._lastHitWasCrit) {
          SFX.crit();
          showActionPop(d, 'CRIT!', '#ff4444');
        }

        if (!e.isAlive()) {
          _killsThisSwing++;
          if (e.frozen) e.clearFreeze();
          spawnParticles(e.x, e.y, e.def);
          e.el.remove();
          enemies.splice(i, 1);
          registerKill(e, _killsThisSwing);
        }
      }

      if (_killsThisSwing >= 2) {
        const labels = { 2: 'DOUBLE KILL', 3: 'TRIPLE KILL', 4: 'MEGA KILL' };
        const label  = labels[_killsThisSwing] || 'ULTRA KILL';
        const colors = { 2: '#ffdd44', 3: '#ff8844', 4: '#ff44ff' };
        const color  = colors[_killsThisSwing] || '#ff44ff';
        showActionPop(d, label, color);
        triggerComboBump();
      }
    }
  }

  if (!anyHit) {
    showActionPop(dir, 'MISS', '#ff4444');
    player.resetCombo();
    updateComboDisplay();
  }

  // dynamic cooldown: shorter on hit, longer on miss
  const cd = anyHit
    ? CONFIG.attack.hitCooldownMs
    : CONFIG.attack.missCooldownMs;
  setTimeout(() => isAttacking = false, cd);
}

function getAdjacentDirs(dir) {
  const map = {
    up:    ['left', 'right'],
    down:  ['left', 'right'],
    left:  ['up',   'down'],
    right: ['up',   'down'],
  };
  return map[dir] || [];
}

/* === js/systems/loop.js === */
/* ═══════════════════════════════════════
   LOOP.JS
   Game loop, start and end game.

   Used by: input.js
   Depends on: state.js, dom.js, config.js,
               combat.js, spawn.js, juice.js,
               ui/hud.js, ui/screens.js,
               audio.js, Player.js
   ═══════════════════════════════════════ */


   /* ── MOCKING MESSAGES — game over taunts ── */
const MOCK_MESSAGES = {
  early: [
    "My grandma lasted longer",
    "Premature elimination",
    "That was quick...",
  ],
  mid: [
    "Performance issues?",
    "Size doesn't matter. Skill does.",
  ],
  late: [
    "Going deep... not deep enough",
    "Don't stop now... oh wait",
  ],
  almost: [
    "Almost legendary. Almost.",
    "Victory was RIGHT THERE",
  ],
};

const MOCK_COLORS = {
  early:  '#ef4444',
  mid:    '#f97316',
  late:   '#fbbf24',
  almost: '#a855f7',
};

function _getMockTier(wave) {
  if (wave <= 2) return 'early';
  if (wave <= 5) return 'mid';
  if (wave <= 8) return 'late';
  return 'almost';
}

function _getRandomMock(wave) {
  const tier = _getMockTier(wave);
  const pool = MOCK_MESSAGES[tier];
  return {
    text:  pool[Math.floor(Math.random() * pool.length)],
    color: MOCK_COLORS[tier],
  };
}

/* ── ABILITY CLEANUP ──
   Removes all ability visual effects and stops audio.
   Called on startGame, endGame, and exit to menu. */

function cleanupAbilityEffects() {
  // call onDeactivate on active ability before cleanup
  if (player && player.specialActive && player.ability && player.ability.onDeactivate) {
    player.ability.onDeactivate(enemies);
  }

  if (typeof SFX !== 'undefined') SFX.stopAll();

  const a = document.getElementById('arena');
  if (a) {
   // bullet time
    a.classList.remove('bullet-time-active');
    a.classList.remove('bullet-time-ending');
    const ov = a.querySelector('.bt-overlay');
    if (ov) ov.remove();

    // explosion
    a.classList.remove('explosion-shake');
    a.querySelectorAll('.explosion-ring, .explosion-flash, .explosion-scorch, .explosion-ember').forEach(el => el.remove());

    // shield
    ShieldFX.stop();

    // slash
    SlashFX.stop();
    a.querySelectorAll('.slash-aura-canvas').forEach(el => el.remove());

    // one hit
    a.classList.remove('one-hit-active');
    a.querySelectorAll('.onehit-aura').forEach(el => el.remove());

    // range boost
    if (typeof RangeBoostFX !== 'undefined') RangeBoostFX.stop();
  }

  // restore range circle in case ability hid it
  if (typeof rangeEl !== 'undefined' && rangeEl) rangeEl.style.display = '';

  // restart range circle animation (in case it was stopped)
  if (typeof RangeCircle !== 'undefined') RangeCircle.start();

  if (player && player.specialActive && player.ability) {
    player.specialActive = false;
    player.specialTimer  = 0;
    player.speedMultiplier = 1.0;
  }
}

/* ── START / END ── */

function startGame(delayLoop) {
  SFX.init();

  // reset ad continue for new run
  if (typeof AdPlaceholder !== 'undefined') AdPlaceholder.resetContinue();

  // cleanup any active ability effects from previous game
  cleanupAbilityEffects();

  // remove any leftover orbs from previous game
  if (typeof OrbSystem !== 'undefined') OrbSystem.reset();

  player      = new Player(equippedAbilityId);
  enemies     = [];
  bullets     = [];
  running     = true;
  isAttacking = false;
  lastTick    = performance.now();

  document.querySelectorAll('.enemy, .bullet, .particle').forEach(e => e.remove());

  updateHpBar();
  updateProgress();
  updateComboDisplay();
  updateSpecialBar();
  scoreEl.textContent = '0';
  levelEl.textContent = 'wave 1';

  // preload attack spritesheet
  const _atkPreload = new Image();
  _atkPreload.src = 'assets/characters/attack.png';

  playerEl.textContent   = '';
  playerEl.style.backgroundImage = 'url(assets/characters/player_idle.png)';
  playerEl.style.backgroundSize  = '1152px 96px';
  playerEl.style.backgroundRepeat = 'no-repeat';
  playerEl.style.imageRendering  = 'pixelated';
  playerEl.style.animation       = 'playerIdle 1.2s steps(12) infinite';
 playerEl.className     = '';
  specialRing.className  = '';
  const _barSpecial = document.getElementById('bar-special');
  if (_barSpecial) _barSpecial.classList.remove('bar-ready');
  playerEl.classList.remove('special-ready');

showScreen(sGame);
  if (typeof CrazySDKWrapper !== 'undefined') CrazySDKWrapper.gameplayStart();

  // start map music (adventure mode)
  if (typeof Music !== 'undefined' && typeof AdventureDirector !== 'undefined' &&
      ActiveDirector === AdventureDirector) {
    const _map = AdventureDirector.getCurrentMap();
    if (_map) Music.playMap(_map.id);
  }
  setTimeout(updateRangeCircle, 50);

  clearInterval(gameLoop);
  if (ActiveDirector === Director) ActiveDirector.init();

  if (!delayLoop) {
    gameLoop = setInterval(tick, 16);
  }
}


function startGameLoop() {
  if (paused) return;
  lastTick = performance.now();
  clearInterval(gameLoop);
  gameLoop = setInterval(tick, 16);
}

function endGame() {
  cleanupAbilityEffects();
  SFX.gameOver();

  // fade out map music
  if (typeof Music !== 'undefined') Music.fadeOut();

  // mark first play as done (for first-time direct play flow)
  try { localStorage.setItem('ds_first_play_done', '1'); }
  catch (e) { /* silent */ }

  running = false;
  if (typeof CrazySDKWrapper !== 'undefined') CrazySDKWrapper.gameplayStop();

  clearInterval(gameLoop);
  ActiveDirector.stop();

  const isChallenge = typeof ChallengeDirector !== 'undefined' &&
                      ActiveDirector === ChallengeDirector;

  // ── AD CONTINUE BUTTON ──
  _buildAdContinueButton();

  // challenge: save best wave AFTER ad button check
  if (isChallenge && typeof ChallengeDirector.onGameOver === 'function') {
    ChallengeDirector.onGameOver();
    if (typeof CrazySDKWrapper !== 'undefined') {
      CrazySDKWrapper.submitScore(ChallengeDirector.getWave());
    }
  }

  // grab new elements
  const mockEl  = document.getElementById('over-mocking');
  const progEl  = document.getElementById('over-progress');
  const killsEl = document.getElementById('over-kills');

  if (isChallenge) {
    // ── CHALLENGE MODE ──
    const wave     = ChallengeDirector.getWave();
    const bestWave = ChallengeDirector.getBestWave();
    const isNew    = wave > bestWave;

    document.getElementById('over-score-label').textContent = 'WAVE';
    finalScoreEl.textContent = wave;
    finalLevelEl.textContent = '';
    if (killsEl) killsEl.textContent = player.kills + ' KILLS';
    bestLabel.textContent = isNew
      ? 'NEW RECORD!'
      : 'BEST: WAVE ' + bestWave;

    // hide adventure-only elements
    if (mockEl) mockEl.textContent = '';
    if (progEl) progEl.innerHTML = '';

  } else {
    // ── ADVENTURE MODE ──
    const best  = getBestScore();
    const isNew = player.score > best;
    if (isNew) saveBestScore(player.score);

    const wave = ActiveDirector.getWave();
    let totalWaves = 11;
    const map = AdventureDirector.getCurrentMap();
    if (map && map.totalWaves) totalWaves = map.totalWaves;

    document.getElementById('over-score-label').textContent = 'SCORE';
    finalScoreEl.textContent = player.score.toLocaleString();
    finalLevelEl.textContent = 'WAVE ' + wave + '/' + totalWaves;
    if (killsEl) killsEl.textContent = player.kills + ' KILLS';
    bestLabel.textContent = isNew
      ? 'NEW RECORD!'
      : 'BEST: ' + Math.max(best, player.score).toLocaleString();

    // ── MOCKING MESSAGE ──
    if (mockEl) {
      const mock = _getRandomMock(wave);
      mockEl.textContent = mock.text;
      mockEl.style.color = mock.color;
      mockEl.style.textShadow = '0 0 12px ' + mock.color + '88, 1px 1px 0 rgba(0,0,0,0.8)';
      mockEl.classList.remove('mock-animate');
      void mockEl.offsetWidth;
      mockEl.classList.add('mock-animate');
    }

   // ── PROGRESS BAR (animate from 0 to death wave) ──
    if (progEl && typeof ProgressBar !== 'undefined') {
      ProgressBar.render(progEl, 0, totalWaves, {
        showLabels: true,
        showPct: true,
        isCompleted: false,
      });
     setTimeout(() => {
        ProgressBar.animateTo(wave - 1, {
          stepDelay: 120,
          onStep: (idx, total) => SFX.progressTick(idx, total),
        });
      }, 400);
    }
  }

  updateMenuBest();

  // show game over overlay
  overOverlay.classList.remove('hidden');
}

/* ── AD CONTINUE BUTTON ──────────────
   Builds the "watch ad to continue"
   button inside #over-ad-slot.
   Only shown once per run.
   Challenge mode: hidden if past best. */

function _buildAdContinueButton() {
  const slot = document.getElementById('over-ad-slot');
  if (!slot) return;
  slot.innerHTML = '';

  if (typeof AdPlaceholder === 'undefined') return;
  if (!AdPlaceholder.canContinue()) return;

  const btn = document.createElement('button');
  btn.className = 'over-btn over-btn-ad';
  btn.innerHTML = '▶ WATCH AD — CONTINUE';
  slot.appendChild(btn);

  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.style.opacity = '0.5';

    AdPlaceholder.showRewarded(() => {
      AdPlaceholder.useContinue();
      _executeContinue();
    }, () => {
      // ad failed — re-enable button
      btn.disabled = false;
      btn.style.opacity = '1';
    });
  });
}

/* ── EXECUTE CONTINUE ────────────────
   Resumes game from start of current
   wave with full HP and defense boost.
   Cleans arena, shows 3-2-1 countdown,
   then restarts the game loop.          */

function _executeContinue() {
  // hide game over overlay
  overOverlay.classList.add('hidden');

  // clean arena (enemies, bullets, particles)
  cleanupArena();

  // restore player HP to full
  player.hp = player.maxHp;
  updateHpBar();

  // apply defense boost (same as orb defense, 8s)
  if (typeof OrbSystem !== 'undefined') {
    // use orb system internal state for consistency
    // we trigger it via the public effect
    playerEl.classList.add('orb-defense-effect');
  }

  // reset spawner gates
  if (typeof resetAdventureSpawner === 'function') resetAdventureSpawner();

 // restart current wave (not wave+1)
  ActiveDirector.restartCurrentWave();

  // re-activate game loop flag
  running = true;

  // restore music after ad continue
  if (typeof Music !== 'undefined') {
    Music.cancelFade();
    if (!Music.isPlaying() && typeof AdventureDirector !== 'undefined') {
      const _cmap = AdventureDirector.getCurrentMap();
      if (_cmap) Music.playMap(_cmap.id);
    }
  }

  // show countdown then start loop
  _showContinueCountdown(() => {
    if (typeof CrazySDKWrapper !== 'undefined') CrazySDKWrapper.gameplayStart();
    // apply defense buff AFTER countdown
    // so the 8s timer starts when gameplay begins
    if (typeof OrbSystem !== 'undefined') {
      OrbSystem._forceDefenseBuff(8000);
    }
    startGameLoop();
  });
}

/* ── CONTINUE COUNTDOWN ──────────────
   3-2-1 countdown overlay before
   resuming gameplay after ad continue. */

function _showContinueCountdown(onComplete) {
  let count = 3;

  const pop = document.createElement('div');
  pop.className = 'continue-countdown';
  pop.style.cssText =
    'position:absolute;inset:0;display:flex;' +
    'align-items:center;justify-content:center;z-index:80;' +
    'pointer-events:none;';

  const num = document.createElement('div');
  num.style.cssText =
    'font-family:"Press Start 2P",monospace;' +
    'font-size:48px;color:#51eefc;' +
    'text-shadow:0 0 20px rgba(81,238,252,0.5),2px 2px 0 #000;';
  num.textContent = count;
  pop.appendChild(num);
  arena.appendChild(pop);

  const iv = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(iv);
      pop.remove();
      if (onComplete) onComplete();
    } else {
      num.textContent = count;
    }
  }, 800);
}

/* cleanup enemies/bullets — called when leaving game over */
function cleanupArena() {
  document.querySelectorAll('.enemy, .bullet, .particle, .orb').forEach(e => e.remove());
  enemies = [];
  bullets = [];
  if (typeof OrbSystem !== 'undefined') OrbSystem.reset();
}

/* ── TICK ── */

function tick() {
  if (!running || paused) return;
  try {
  const now = performance.now();
  const dt  = Math.min(now - lastTick, 50);
  lastTick  = now;

 if (!_choosingUpgrade && !_countdownActive && !_inputBlocked &&
     !_challengeChoiceActive && !_challengeCountdown && !_challengeInputBlocked) {
  player.tickSpecial(dt);
}
updateProgress();
  // poison tick
  if (player.poisonEffects && player.poisonEffects.length > 0) {
    for (let i = player.poisonEffects.length - 1; i >= 0; i--) {
      const pe = player.poisonEffects[i];
      pe.timer += dt;
      if (pe.timer >= 1000) {
        pe.timer -= 1000;
        player.takeDamage(0.05);
        updateHpBar();
        if (!player.isAlive()) { endGame(); return; }
        pe.ticksLeft--;
        if (pe.ticksLeft <= 0) player.poisonEffects.splice(i, 1);
      }
    }
  }
  ActiveDirector.tick(dt);
  updateComboDisplay();
  updateSpecialBar();

  const { w, h }    = getArenaSize();
  const cx          = w / 2;
  const cy          = h / 2;
  const hitR        = CONFIG.spawn.hitRadius;
  const bulletHitR  = CONFIG.spawn.bulletHitRadius;
  const arenaSize   = Math.min(w, h);
  const attackRange = player.getAttackRange(arenaSize);

  /* ── UPDATE ENEMIES ── */
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e    = enemies[i];
    if (!e || !e.el) { enemies.splice(i, 1); continue; }

    // cleanup: remove enemies that died outside of combat
    // (e.g. crab emerging, self-destructing enemies)
    if (!e.isAlive() && e._emerged) {
      if (e.el && e.el.parentNode) e.el.remove();
      enemies.splice(i, 1);
      if (e.def.onDeath) e.def.onDeath(e);
      continue;
    }

    const dx   = cx - e.x;
    const dy   = cy - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) continue;

    // ── MOVIMENTO (wobble per slime, dritto per gli altri) ──
    const nx = dx / dist;
    const ny = dy / dist;

    let wx = 0, wy = 0;
    if (e.wobble) {
      e.wobbleTime = (e.wobbleTime || 0) + dt;
      const perp = e.wobble.amplitude *
                   Math.sin(e.wobbleTime * 0.001 * e.wobble.frequency * Math.PI * 2);
      wx = -ny * perp * 0.05;
      wy =  nx * perp * 0.05;
    }

  if (!e.def.customMovement && !e.frozen) {
      const sm = player.speedMultiplier;
      e.x += (nx * e.speed + wx) * sm;
      e.y += (ny * e.speed + wy) * sm;
      e.el.style.left = e.x + 'px';
      e.el.style.top  = e.y + 'px';
    }

   if (!e.underground && !e.def.customOpacity) {
      e.el.style.opacity = dist <= attackRange ? '1' : '0.70';
    }
    if (e.def.onTick && !e.frozen) e.def.onTick(e, cx, cy, attackRange);

    if (dist < hitR && !e.underground) {

      if (player.thorns && player.specialActive && player.ability.blocksBullets) {
        e.hit(Math.round(PLAYER_STATS.maxHp * 0.15));
        if (e.hpFill) e.hpFill.style.width = Math.round(e.hpPercent() * 100) + '%';
        if (!e.isAlive()) {
          spawnParticles(e.x, e.y, player.color, e.isElite);
          SFX.shieldAbsorb();
          triggerShieldRipple();
          e.el.remove();
          registerKill(e);
          enemies.splice(i, 1);
          continue;
        }
      }

     e.hp = 0;  // mark dead so gate system cleans up
      if (e.frozen) e.clearFreeze();
      e.el.remove();
      enemies.splice(i, 1);

      // shield absorbs contact — register as kill to keep gate system clean
      if (player.specialActive && player.ability.blocksBullets) {
        e.hp = 0;
        spawnParticles(e.x, e.y, player.color, e.isElite);
        SFX.shieldAbsorb();
        triggerShieldRipple();
        registerKill(e);
        continue;
      }

      // ── DANNO CONTATTO (multi-hit per slime medium/small) ──
      const hits = e.contactHits || 1;
      for (let h = 0; h < hits; h++) {
        player.takeDamage(e.damagePct);
        if (e.def.onContact) e.def.onContact(player);
      }

      updateHpBar();
      updateComboDisplay();
      SFX.damage();
      ActiveDirector.onDamage();
      triggerShake();

      flashEl.style.opacity = '1';
      setTimeout(() => flashEl.style.opacity = '0', 200);

      if (!player.isAlive()) { endGame(); return; }
    }
  }

  /* ── UPDATE BULLETS ── */
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    if (!b || !b.el) { bullets.splice(i, 1); continue; }
    const sm = player.speedMultiplier;
    b.x += b.vx * sm;
    b.y += b.vy * sm;
    b.el.style.left = b.x + 'px';
    b.el.style.top  = b.y + 'px';

    if (b.x < -20 || b.x > w + 20 || b.y < -20 || b.y > h + 20) {
      b.el.remove();
      if (b.owner) b.owner.hasBullet = false;
      bullets.splice(i, 1);
      continue;
    }

    const dx   = cx - b.x;
    const dy   = cy - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < bulletHitR) {
      b.el.remove();
      if (b.owner) b.owner.hasBullet = false;
      bullets.splice(i, 1);

      if (player.specialActive && player.ability.blocksBullets) continue;

      player.takeDamage(b.damagePct);
      updateHpBar();
      updateComboDisplay();
      SFX.damage();
      ActiveDirector.onDamage();
      triggerShake();

      flashEl.style.opacity = '1';
      setTimeout(() => flashEl.style.opacity = '0', 150);

      if (!player.isAlive()) { endGame(); return; }
    }
  }
  } catch (err) {
    console.error('[TICK ERROR]', err);
    if (typeof ErrorHandler !== 'undefined') {
      ErrorHandler._save && ErrorHandler._save({
        type: 'tick', message: String(err.message).substring(0, 300),
        stack: err.stack ? String(err.stack).substring(0, 500) : '',
        time: new Date().toISOString(), source: 'loop.js', line: 0, col: 0, url: '', ua: ''
      });
    }
  }
}

/* === js/systems/pause.js === */
/* ═══════════════════════════════════════
   PAUSE.JS
   Pause system — freezes game loop,
   shows overlay with continue/retry/exit.

   Used by: input.js (P key + button)
   Depends on: state.js, loop.js, screens.js
   ═══════════════════════════════════════ */

let paused = false;

function togglePause() {
  if (!running) return;
  if (paused) resumeGame();
  else pauseGame();
}

function pauseGame() {
  if (!running || paused) return;
  paused = true;
  clearInterval(gameLoop);
  gameLoop = null;

  const pauseOv = document.getElementById('pause-overlay');
  if (pauseOv) pauseOv.classList.remove('hidden');

  // update maps/menu button text based on mode
  const mapsBtn = document.getElementById('pause-maps');
  if (mapsBtn) {
    mapsBtn.textContent = (typeof ChallengeDirector !== 'undefined' &&
      ActiveDirector === ChallengeDirector) ? 'MENU' : 'MAPS';
  }

  // sync volume slider with current volume
  _syncPauseVolume();

  // freeze ability audio
  if (typeof SFX !== 'undefined') SFX.pauseAll();
  if (typeof RangeCircle !== 'undefined') RangeCircle.stop();
  if (typeof SFX !== 'undefined') SFX.pauseOpen();
  if (typeof CrazySDKWrapper !== 'undefined') CrazySDKWrapper.gameplayStop();

  // retry pause bindings if not ready yet
  if (!_pauseBindingsReady) _initPauseBindings();
}

function resumeGame() {
  if (!paused) return;
  paused = false;

  const pauseOv = document.getElementById('pause-overlay');
  if (pauseOv) pauseOv.classList.add('hidden');

  lastTick = performance.now();
  gameLoop = setInterval(tick, 16);

  // resume ability audio
  if (typeof SFX !== 'undefined') SFX.resumeAll();
  if (typeof RangeCircle !== 'undefined') RangeCircle.start();
  if (typeof SFX !== 'undefined') SFX.pauseClose();
  if (typeof CrazySDKWrapper !== 'undefined') CrazySDKWrapper.gameplayStart();
}

/* ── SYNC VOLUME SLIDER ── */

function _syncPauseVolume() {
  const slider = document.getElementById('pause-volume-slider');
  if (slider) slider.value = Math.round(CONFIG.audio.volume * 100);

  const musicSlider = document.getElementById('pause-music-slider');
  if (musicSlider && CONFIG.music) {
    musicSlider.value = Math.round(CONFIG.music.volume * 100);
  }
}

/* ── BUTTON BINDINGS ── */

let _pauseBindingsReady = false;

function _initPauseBindings() {
  if (_pauseBindingsReady) return;

  const btnPause    = document.getElementById('btn-pause');
  const btnContinue = document.getElementById('pause-continue');
  const btnRetry    = document.getElementById('pause-retry');
  const btnMaps     = document.getElementById('pause-maps');

  // only check elements that MUST exist
  if (!btnPause || !btnContinue || !btnRetry || !btnMaps) {
    return;
  }

  _pauseBindingsReady = true;

  btnPause.addEventListener('click', () => {
    togglePause();
  });

  btnContinue.addEventListener('click', () => {
    resumeGame();
  });

  btnRetry.addEventListener('click', () => {
    if (typeof Transition !== 'undefined' && Transition.isPlaying()) return;
    resumeGame();
    Transition.play('fast', () => {
      equippedAbilityId = getEquippedAbility();
      if (typeof ChallengeDirector !== 'undefined' && ActiveDirector === ChallengeDirector) {
        ChallengeDirector.init();
        resetUpgradeChoices();
        startGame(true);
        _isFirstAbilityChoice = true;
        startChallengeChoice('ability');
      } else if (typeof AdventureDirector !== 'undefined' && ActiveDirector === AdventureDirector) {
        if (!AdventureDirector.restart()) {
          showScreen(sMenu);
          return;
        }
        startGame(true);
      } else {
        startGame(true);
      }
    }, () => {
      startGameLoop();
    });
  });

  btnMaps.addEventListener('click', () => {
    if (typeof Transition !== 'undefined' && Transition.isPlaying()) return;
    resumeGame();
    Transition.play('fast', () => {
      endGame();
      if (typeof ChallengeDirector !== 'undefined' && ActiveDirector === ChallengeDirector) {
        showScreen(sMenu);
      } else {
        showScreen(sMapSelect);
        if (typeof initMapSelect === 'function') initMapSelect();
      }
    });
  });

 // volume slider binding
  const volSlider = document.getElementById('pause-volume-slider');
  if (volSlider) {
    volSlider.addEventListener('input', (e) => {
      const vol = parseInt(e.target.value) / 100;
      CONFIG.audio.volume = vol;
      if (typeof AudioCore !== 'undefined') AudioCore.setVolume(vol);
      try { localStorage.setItem('ds_volume', vol.toFixed(2)); } catch(x) {}
    });
  }

  // music volume slider binding
  const musicSlider = document.getElementById('pause-music-slider');
  if (musicSlider) {
    musicSlider.addEventListener('input', (e) => {
      const vol = parseInt(e.target.value) / 100;
      if (typeof Music !== 'undefined') Music.setVolume(vol);
    });
  }
}

// DOM is ready (htmlLoader loaded partials before main.js)
_initPauseBindings();

/* === js/systems/upgradeChoice.js === */
/* ═══════════════════════════════════════
   UPGRADECHOICE.JS
   Upgrade choice screen at waves 3, 6, 9.
   Player picks by attacking in a direction.

   TIER CHAIN SYSTEM:
   - 13 base upgrades, each with tiers I→II→III
     (Extra Slot has only I→II)
   - Picking tier I unlocks tier II in the pool
   - Picking tier II unlocks tier III
   - Total: 36 unique upgrades

   Used by: adventureDirector.js, combat.js
   Depends on: dom.js, state.js, Player.js
   ═══════════════════════════════════════ */

/* ── UPGRADE CHAINS ───────────────────
   Each chain has:
   - id:    base id (e.g. 'critical_hit')
   - icon:  emoji displayed in card
   - tiers: array of { name, desc, apply(p) }
            index 0 = tier I, 1 = II, 2 = III
   ───────────────────────────────────── */

const UPGRADE_CHAINS = [

  { id: 'vitality', icon: '❤️', tiers: [
    { name: 'Vitality I',   desc: '+10% max HP',
      apply(p) { const b = Math.round(p.maxHp * 0.10); p.maxHp += b; p.hp += b; updateHpBar(); } },
    { name: 'Vitality II',  desc: '+20% max HP',
      apply(p) { const b = Math.round(p.maxHp * 0.20); p.maxHp += b; p.hp += b; updateHpBar(); } },
    { name: 'Vitality III', desc: '+30% max HP',
      apply(p) { const b = Math.round(p.maxHp * 0.30); p.maxHp += b; p.hp += b; updateHpBar(); } },
  ]},

  { id: 'iron_skin', icon: '🛡️', tiers: [
    { name: 'Iron Skin I',   desc: 'take 10% less damage',
      apply(p) { p._defenseMult = (p._defenseMult || 1) * 0.90; } },
    { name: 'Iron Skin II',  desc: 'take 20% less damage',
      apply(p) { p._defenseMult = (p._defenseMult || 1) * 0.80; } },
    { name: 'Iron Skin III', desc: 'take 30% less damage',
      apply(p) { p._defenseMult = (p._defenseMult || 1) * 0.70; } },
  ]},

  { id: 'long_reach', icon: '📡', tiers: [
    { name: 'Long Reach I',   desc: 'hit enemies further away',
      apply(p) { p.attackRangePct *= 1.05; updateRangeCircle(); } },
    { name: 'Long Reach II',  desc: 'hit enemies even further',
      apply(p) { p.attackRangePct *= 1.10; updateRangeCircle(); } },
    { name: 'Long Reach III', desc: 'hit enemies much further',
      apply(p) { p.attackRangePct *= 1.15; updateRangeCircle(); } },
  ]},

  { id: 'sharp_blade', icon: '🗡️', tiers: [
    { name: 'Sharp Blade I',   desc: 'deal 10% more damage',
      apply(p) { p.damageMult *= 1.10; } },
    { name: 'Sharp Blade II',  desc: 'deal 20% more damage',
      apply(p) { p.damageMult *= 1.20; } },
    { name: 'Sharp Blade III', desc: 'deal 30% more damage',
      apply(p) { p.damageMult *= 1.30; } },
  ]},

  { id: 'critical_hit', icon: '💥', tiers: [
    { name: 'Critical Hit I',   desc: '15% chance to deal double damage',
      apply(p) { p._critChance = 0.15; } },
    { name: 'Critical Hit II',  desc: '30% chance to deal double damage',
      apply(p) { p._critChance = 0.30; } },
    { name: 'Critical Hit III', desc: '45% chance to deal double damage',
      apply(p) { p._critChance = 0.45; } },
  ]},

  { id: 'frost_touch', icon: '❄️', tiers: [
    { name: 'Frost Touch I',   desc: '15% chance to freeze enemy',
      apply(p) { p._frostChance = 0.15; } },
    { name: 'Frost Touch II',  desc: '30% chance to freeze enemy',
      apply(p) { p._frostChance = 0.30; } },
    { name: 'Frost Touch III', desc: '45% chance to freeze enemy',
      apply(p) { p._frostChance = 0.45; } },
  ]},

  { id: 'lucky_shield', icon: '🍀', tiers: [
    { name: 'Lucky Shield I',   desc: '15% chance to dodge a hit',
      apply(p) { p._luckyBlockChance = 0.15; } },
    { name: 'Lucky Shield II',  desc: '30% chance to dodge a hit',
      apply(p) { p._luckyBlockChance = 0.30; } },
    { name: 'Lucky Shield III', desc: '40% chance to dodge a hit',
      apply(p) { p._luckyBlockChance = 0.40; } },
  ]},

  { id: 'vampiric', icon: '🩸', tiers: [
    { name: 'Vampiric I',   desc: 'heal on every 5 kills',
      apply(p) { p._vampKillInterval = 5; p._vampHealPct = 0.02; p._vampKillCount = 0; } },
    { name: 'Vampiric II',  desc: 'heal on every 4 kills',
      apply(p) { p._vampKillInterval = 4; p._vampHealPct = 0.03; p._vampKillCount = 0; } },
    { name: 'Vampiric III', desc: 'heal on every 3 kills',
      apply(p) { p._vampKillInterval = 3; p._vampHealPct = 0.04; p._vampKillCount = 0; } },
  ]},

  { id: 'ability_boost', icon: '⏱️', tiers: [
    { name: 'Ability Boost I',   desc: 'special lasts 20% longer',
      apply(p) { p._abilityDurationMult = 1.20; } },
    { name: 'Ability Boost II',  desc: 'special lasts 40% longer',
      apply(p) { p._abilityDurationMult = 1.40; } },
    { name: 'Ability Boost III', desc: 'special lasts 60% longer',
      apply(p) { p._abilityDurationMult = 1.60; } },
  ]},

  { id: 'orb_hunter', icon: '🔮', tiers: [
    { name: 'Orb Hunter I',   desc: 'orbs appear 10% more often',
      apply(p) { p._orbChanceBonus = 0.10; } },
    { name: 'Orb Hunter II',  desc: 'orbs appear 20% more often',
      apply(p) { p._orbChanceBonus = 0.20; } },
    { name: 'Orb Hunter III', desc: 'orbs appear 30% more often',
      apply(p) { p._orbChanceBonus = 0.30; } },
  ]},

  { id: 'berserker_atk', icon: '🔥', tiers: [
    { name: 'Berserker ATK I',   desc: 'low HP: +30% damage',
      apply(p) { p._berserkerAtkThreshold = 0.30; p._berserkerAtkBonus = 0.30; } },
    { name: 'Berserker ATK II',  desc: 'low HP: +50% damage',
      apply(p) { p._berserkerAtkThreshold = 0.30; p._berserkerAtkBonus = 0.50; } },
    { name: 'Berserker ATK III', desc: 'low HP: +75% damage',
      apply(p) { p._berserkerAtkThreshold = 0.30; p._berserkerAtkBonus = 0.75; } },
  ]},

  { id: 'berserker_def', icon: '🔥', tiers: [
    { name: 'Berserker DEF I',   desc: 'low HP: take 20% less damage',
      apply(p) { p._berserkerDefThreshold = 0.30; p._berserkerDefBonus = 0.20; } },
    { name: 'Berserker DEF II',  desc: 'low HP: take 35% less damage',
      apply(p) { p._berserkerDefThreshold = 0.30; p._berserkerDefBonus = 0.35; } },
    { name: 'Berserker DEF III', desc: 'low HP: take 50% less damage',
      apply(p) { p._berserkerDefThreshold = 0.30; p._berserkerDefBonus = 0.50; } },
  ]},

  { id: 'extra_slot', icon: '⚡', tiers: [
    { name: 'Extra Slot I',  desc: '+1 special charge',
      apply(p) { p._maxSpecialSlots = 2; } },
    { name: 'Extra Slot II', desc: '+1 special charge',
      apply(p) { p._maxSpecialSlots = 3; } },
  ]},

];


/* ── STATE ─────────────────────────── */

let _choosingUpgrade = false;
let _currentChoices  = [null, null, null, null];
let _pickedTiers     = {};   // { chainId: tierIndex } — tracks highest tier picked
let _countdownActive = false;
let _inputBlocked    = false;

function isChoosingUpgrade() {
  return _choosingUpgrade;
}


/* ── BUILD AVAILABLE POOL ──────────── */

function _buildAvailablePool() {
  const available = [];

  for (const chain of UPGRADE_CHAINS) {
    const pickedTier = _pickedTiers[chain.id]; // undefined, 0, 1, or 2

    if (pickedTier === undefined) {
      // never picked this chain — offer tier I (index 0)
      available.push({ chain, tierIndex: 0 });
    } else {
      // picked some tier — offer the next one if it exists
      const nextTier = pickedTier + 1;
      if (nextTier < chain.tiers.length) {
        available.push({ chain, tierIndex: nextTier });
      }
      // if already at max tier, this chain is done — skip
    }
  }

  return available;
}


/* ── START CHOICE SCREEN ───────────── */

function startUpgradeChoice() {
  _choosingUpgrade = true;

  // hide wave timer during upgrade choice
  if (_timerEl) _timerEl.style.display = 'none';

  // cancel any active ability and orb buffs
  if (typeof cleanupAbilityEffects === 'function') cleanupAbilityEffects();
  if (typeof OrbSystem !== 'undefined') {
    OrbSystem.reset();
  }

  // build pool of available upgrades
  const pool = _buildAvailablePool();

  // shuffle and pick 4
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const picks    = shuffled.slice(0, 4);

  // fallback: if less than 4 available, fill with random from pool
  while (picks.length < 4 && pool.length > 0) {
    picks.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  // resolve each pick into a display object
  const resolved = picks.map(p => {
    const tier = p.chain.tiers[p.tierIndex];
    return {
      chainId:   p.chain.id,
      tierIndex: p.tierIndex,
      icon:      p.chain.icon,
      name:      tier.name,
      desc:      tier.desc,
      apply:     tier.apply,
    };
  });

  const dirs     = ['up', 'down', 'left', 'right'];
  const keyHints = { up: '↑', down: '↓', left: '←', right: '→' };

  for (let i = 0; i < 4; i++) {
    _currentChoices[i] = resolved[i] || null;
    const el = document.getElementById('upgrade-' + dirs[i]);

    if (!resolved[i]) {
      el.innerHTML = '';
      continue;
    }

    const r = resolved[i];
    // tier badge color: I = white, II = yellow, III = orange
    const tierNum    = r.tierIndex + 1;
    const tierColors = ['#ffffff', '#ffdd44', '#ff8844'];
    const tierColor  = tierColors[r.tierIndex] || '#ffffff';

    el.innerHTML =
      '<div class="upgrade-card">' +
        '<div class="upgrade-card-icon">' + r.icon + '</div>' +
        '<div class="upgrade-card-name" style="color:' + tierColor + '">' + r.name + '</div>' +
        '<div class="upgrade-card-desc">' + r.desc + '</div>' +
        '<div class="upgrade-card-key">' + keyHints[dirs[i]] + '</div>' +
      '</div>';

    el.style.animationDelay = (i * 80) + 'ms';
  }

  // show overlay
  const overlay = document.getElementById('upgrade-choice');
  overlay.classList.add('active');

  // title
  let titleEl = document.getElementById('upgrade-title');
  if (!titleEl) {
    titleEl = document.createElement('div');
    titleEl.id = 'upgrade-title';
    overlay.appendChild(titleEl);
  }
  const waveNum = AdventureDirector.getWave();
  titleEl.innerHTML =
    '<div class="upgrade-title-wave">WAVE ' + waveNum + ' COMPLETE</div>' +
    '<div class="upgrade-title-sub">CHOOSE YOUR UPGRADE</div>';
  titleEl.style.opacity   = '0';
  titleEl.style.animation = 'upgradeTitleIn 0.6s ease-out forwards';

  // arrow hint — always recreate fresh in arena to avoid stale refs
  let hintEl = document.getElementById('upgrade-arrow-hint');
  if (hintEl) hintEl.remove();
  hintEl = document.createElement('div');
  hintEl.id = 'upgrade-arrow-hint';
  hintEl.innerHTML =
    '<img src="assets/ui/keyboard_arrows.png" alt="" class="upgrade-hint-img" />' +
    '<div class="upgrade-hint-text">use arrows to select</div>';
  arena.appendChild(hintEl);

  // block input for 1.5s so player can read
  _inputBlocked = true;
  hintEl.style.opacity = '0';
  hintEl.style.animation = 'none';
  setTimeout(() => {
    _inputBlocked = false;
    const h = document.getElementById('upgrade-arrow-hint');
    if (h) {
      h.style.opacity = '';
      h.style.animation = '';
    }
  }, 1500);
}


/* ── SELECT UPGRADE ────────────────── */

function selectUpgrade(dir) {
  if (!_choosingUpgrade || _countdownActive || _inputBlocked) return false;

  const dirIndex = { up: 0, down: 1, left: 2, right: 3 };
  const choice   = _currentChoices[dirIndex[dir]];
  if (!choice) return false;

  // apply upgrade to player
  choice.apply(player);

  // track picked tier for chain progression
  _pickedTiers[choice.chainId] = choice.tierIndex;

  SFX.cardPick();

  // highlight chosen, fade others
  const dirs = ['up', 'down', 'left', 'right'];
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById('upgrade-' + dirs[i]);
    if (dirs[i] === dir) {
      el.classList.add('upgrade-chosen');
    } else {
      el.classList.add('upgrade-faded');
    }
  }

  // hide arrow hint
  const hintEl = document.getElementById('upgrade-arrow-hint');
  if (hintEl) hintEl.remove();

  // start countdown
  _countdownActive = true;
  _choosingUpgrade = false;

  _showCountdown(3, () => {
    document.getElementById('upgrade-choice').classList.remove('active');
    const titleEl = document.getElementById('upgrade-title');
    if (titleEl) titleEl.style.animation = '';

    for (let i = 0; i < 4; i++) {
      const el = document.getElementById('upgrade-' + dirs[i]);
      el.classList.remove('upgrade-chosen', 'upgrade-faded');
      el.style.opacity        = '';
      el.style.animationDelay = '';
    }

    // hintEl already removed
    _countdownActive = false;
    AdventureDirector.resumeAfterChoice();
  });

  return true;
}


/* ── COUNTDOWN ─────────────────────── */

function _showCountdown(from, callback) {
  let countEl = document.getElementById('countdown-display');
  if (!countEl) {
    countEl = document.createElement('div');
    countEl.id = 'countdown-display';
    arena.appendChild(countEl);
  }

  let count = from;
  const delayMs = 800;

  function showNext() {
   if (count <= 0) {
      SFX.countdownGo();
      countEl.style.display = 'none';
      // restore wave timer
      if (_timerEl) _timerEl.style.display = 'block';
      callback();
      return;
    }
    countEl.style.display = 'block';
    countEl.textContent   = count;
    if (count > 0) SFX.countdown();
    countEl.style.animation = 'none';
    void countEl.offsetWidth;
    countEl.style.animation = 'countdownPop ' + delayMs + 'ms ease-out forwards';
    count--;
    setTimeout(showNext, delayMs);
  }
  showNext();
}


/* ── RESET ─────────────────────────── */

function resetUpgradeChoices() {
  _pickedTiers     = {};
  _currentChoices  = [null, null, null, null];
  _choosingUpgrade = false;
  _countdownActive = false;
  _inputBlocked    = false;
  document.getElementById('upgrade-choice').classList.remove('active');
  const hintEl = document.getElementById('upgrade-arrow-hint');
  if (hintEl) hintEl.remove();
}

/* === js/systems/orbs.js === */
/* ═══════════════════════════════════════
   ORBS.JS
   Collectible orbs that spawn from the
   edges and walk toward center like
   enemies. Player collects by attacking
   in their direction when in range.
   If not collected, they reach center
   and disappear (no damage).

   Types: heal (green), attack (red),
          defense (blue).

   Used by: adventureDirector.js, combat.js
   Depends on: state.js, dom.js, config.js
   ═══════════════════════════════════════ */

const OrbSystem = (() => {

  let _activeOrb   = null;
  let _cooldownMs  = 8000;
  let _rollTimerMs = 0;

  const ORB_ROLL_INTERVAL = 3000;
  const ORB_COOLDOWN      = 8000;
  const ORB_SIZE           = 22;
  const ORB_SPEED          = 1.2;
  const ORB_HIT_RADIUS     = 24;

  /* ── EFFECT DURATIONS ── */
  const ATTACK_DURATION  = 8000;
  const DEFENSE_DURATION = 8000;
  const HEAL_PERCENT     = 0.30;

  /* ── ACTIVE BUFFS ── */
  let _attackBuffMs  = 0;
  let _defenseBuffMs = 0;

  /* ── PROBABILITY TABLES ── */

  function _healChance() {
    if (!player) return 0;
    const pct = player.hpPercent();
    if (pct <= 0.20) return 0.50;
    if (pct <= 0.40) return 0.30;
    if (pct <= 0.60) return 0.15;
    if (pct <= 0.90) return 0.05;
    return 0.01;
  }

  function _attackChance() {
    if (!ActiveDirector || !ActiveDirector.getWaveDuration) return 0.02;
    const dur  = ActiveDirector.getWaveDuration();
    const left = ActiveDirector.getWaveTimeLeft();
    if (dur <= 0) return 0.02;
    const pct = left / dur;
    if (pct <= 0.20) return 0.15;
    if (pct <= 0.40) return 0.08;
    return 0.02;
  }

  function _defenseChance() {
    if (!ActiveDirector) return 0.02;
    const w = ActiveDirector.getWave();
    if (ActiveDirector.isBoss())  return 0.20;
    if (w >= 7) return 0.10;
    if (w >= 4) return 0.05;
    return 0.02;
  }

  /* ── SPAWN ORB ── */

  function _spawnOrb(type) {
    if (_activeOrb) return;

    const { w, h } = getArenaSize();
    const cx = w / 2;
    const cy = h / 2;
    const m  = CONFIG.spawn.edgeMargin;

    // pick random direction
    const dirs = ['up', 'down', 'left', 'right'];
    const dir  = dirs[Math.floor(Math.random() * dirs.length)];

    // spawn from edge like enemies
    let x, y;
    if (dir === 'up')    { x = cx; y = -m; }
    if (dir === 'down')  { x = cx; y = h + m; }
    if (dir === 'left')  { x = -m; y = cy; }
    if (dir === 'right') { x = w + m; y = cy; }

    // colors
    const colors = {
      heal:    { bg: '#44ff66', glow: '0 0 12px #44ff66' },
      attack:  { bg: '#ff4444', glow: '0 0 12px #ff4444' },
      defense: { bg: '#4488ff', glow: '0 0 12px #4488ff' },
    };
    const c = colors[type];

    // create DOM element
    const el = document.createElement('div');
    el.className = 'orb orb-' + type;
    el.style.cssText =
      'position:absolute;width:' + ORB_SIZE + 'px;height:' + ORB_SIZE + 'px;' +
      'left:' + x + 'px;top:' + y + 'px;' +
      'transform:translate(-50%,-50%);border-radius:50%;' +
      'background:' + c.bg + ';box-shadow:' + c.glow + ';' +
      'z-index:25;pointer-events:none;' +
      'animation:orbFloat 1s ease-in-out infinite alternate;';

    arena.appendChild(el);

    _activeOrb = { type, dir, x, y, el };
  }

  /* ── COLLECT ORB ── */

  function _collectOrb() {
    if (!_activeOrb) return;
    const orb = _activeOrb;

    // spawn particles at orb position
    const colors = { heal: '#44ff66', attack: '#ff4444', defense: '#4488ff' };
    if (typeof spawnParticles === 'function') {
      spawnParticles(orb.x, orb.y, colors[orb.type], false);
    }

    // apply effect
   if (orb.type === 'heal') {
      const healAmt = Math.round(player.maxHp * HEAL_PERCENT);
      player.hp = Math.min(player.maxHp, player.hp + healAmt);
      updateHpBar();
      _showPlayerEffect('heal');
      SFX.healOrb();
      _showOrbLabel('HEAL +' + Math.round(HEAL_PERCENT * 100) + '%', '#44ff66');
    }

    if (orb.type === 'attack') {
      _attackBuffMs = ATTACK_DURATION;
      _showPlayerEffect('attack');
      SFX.orbCollect();
      _showOrbLabel('ATK BOOST x2', '#ff4444');
    }

    if (orb.type === 'defense') {
      _defenseBuffMs = DEFENSE_DURATION;
      _showPlayerEffect('defense');
      SFX.orbCollect();
      _showOrbLabel('DEF BOOST x2', '#4488ff');
    }

    // cleanup
    orb.el.remove();
    _activeOrb  = null;
    _cooldownMs = ORB_COOLDOWN;
  }

  /* ── REMOVE ORB (reached center) ── */

  function _removeOrb() {
    if (!_activeOrb) return;
    _activeOrb.el.remove();
    _activeOrb  = null;
    _cooldownMs = 2000;
  }

  /* ── PLAYER EFFECTS ── */

  function _showPlayerEffect(type) {
    playerEl.classList.remove('orb-heal-effect', 'orb-attack-effect', 'orb-defense-effect');
    void playerEl.offsetWidth;

    if (type === 'heal') {
      playerEl.classList.add('orb-heal-effect');
      setTimeout(() => playerEl.classList.remove('orb-heal-effect'), 1500);
    }
    if (type === 'attack') {
      playerEl.classList.add('orb-attack-effect');
    }
    if (type === 'defense') {
      playerEl.classList.add('orb-defense-effect');
    }
  }

  function _showOrbLabel(text, color) {
    const { w, h } = getArenaSize();
    const pop = document.createElement('div');
    pop.className = 'orb-label-pop';
    pop.textContent = text;
    pop.style.cssText =
      'position:absolute;left:50%;top:40%;transform:translate(-50%,-50%);' +
      'font-family:"Press Start 2P",monospace;font-size:12px;' +
      'color:' + color + ';z-index:60;pointer-events:none;' +
      'text-shadow:2px 2px 0 #000,-1px -1px 0 #000;' +
      'animation:orbLabelPop 1.2s ease-out forwards;';
    arena.appendChild(pop);
    setTimeout(() => pop.remove(), 1200);
  }
  
  return {

    /* ── TICK ── */
    tick(dt) {
      // tick buff timers
      if (_attackBuffMs > 0) {
        _attackBuffMs -= dt;
        if (_attackBuffMs <= 0) {
          _attackBuffMs = 0;
          playerEl.classList.remove('orb-attack-effect');
        }
      }
      if (_defenseBuffMs > 0) {
        _defenseBuffMs -= dt;
        if (_defenseBuffMs <= 0) {
          _defenseBuffMs = 0;
          playerEl.classList.remove('orb-defense-effect');
        }
      }

      // tick cooldown
      if (_cooldownMs > 0) {
        _cooldownMs -= dt;
        return;
      }

      // move active orb toward center
      if (_activeOrb) {
        const { w, h } = getArenaSize();
        const cx = w / 2;
        const cy = h / 2;
        const orb = _activeOrb;

        const dx = cx - orb.x;
        const dy = cy - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // reached center — disappear without damage
        if (dist < ORB_HIT_RADIUS) {
          _removeOrb();
          return;
        }

        // move toward center
        const nx = dx / dist;
        const ny = dy / dist;
        const speed = ORB_SPEED * (player ? player.speedMultiplier : 1);
        orb.x += nx * speed;
        orb.y += ny * speed;
        orb.el.style.left = orb.x + 'px';
        orb.el.style.top  = orb.y + 'px';

        // opacity: dim when out of range, bright when in range
        const arenaSize   = Math.min(w, h);
        const attackRange = player ? player.getAttackRange(arenaSize) : 0;
        orb.el.style.opacity = dist <= attackRange ? '1' : '0.5';

        return;
      }

      // probability roll
      _rollTimerMs -= dt;
      if (_rollTimerMs > 0) return;
      _rollTimerMs = ORB_ROLL_INTERVAL;

      const roll = Math.random();
      const hc = _healChance();
      const ac = _attackChance();
      const dc = _defenseChance();

     // orb hunter flat bonus — increases all chances equally
      const orbBonus = (player && player._orbChanceBonus) ? player._orbChanceBonus : 0;
      const hcB = hc + orbBonus;
      const acB = ac + orbBonus;
      const dcB = dc + orbBonus;

      if (roll < hcB) {
        _spawnOrb('heal');
      } else if (roll < hcB + acB) {
        _spawnOrb('attack');
      } else if (roll < hcB + acB + dcB) {
        _spawnOrb('defense');
      }
    },

    /* ── CHECK COLLECTION (called from combat.js) ── */
    checkCollect(dir, attackRange) {
      if (!_activeOrb) return false;
      if (_activeOrb.dir !== dir) return false;

      const { w, h } = getArenaSize();
      const cx = w / 2;
      const cy = h / 2;
      const dx = _activeOrb.x - cx;
      const dy = _activeOrb.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= attackRange) {
        _collectOrb();
        return true;
      }
      return false;
    },

    /* ── BUFF QUERIES ── */
    hasAttackBuff()  { return _attackBuffMs > 0; },
    hasDefenseBuff() { return _defenseBuffMs > 0; },

    /* ── RESET ── */
    reset() {
      if (_activeOrb) _activeOrb.el.remove();
      _activeOrb     = null;
      _cooldownMs    = 8000;
      _rollTimerMs   = 0;
      _attackBuffMs  = 0;
      _defenseBuffMs = 0;
      playerEl.classList.remove('orb-heal-effect', 'orb-attack-effect', 'orb-defense-effect');
    },

    /* ── FORCE DEFENSE BUFF ──────────────
       Used by ad continue system to apply
       defense boost without spawning orb.
       Duration in ms (default 8000).      */
    _forceDefenseBuff(durationMs) {
      _defenseBuffMs = durationMs || DEFENSE_DURATION;
      playerEl.classList.add('orb-defense-effect');
      _showOrbLabel('DEF BOOST x2', '#4488ff');
    },

    /* ── DEBUG INTERFACE ─────────────────
       Only used by debug.js. */
    _debug() {
      const orbBonus = (player && player._orbChanceBonus) ? player._orbChanceBonus : 0;
      return {
        activeOrb:    _activeOrb ? _activeOrb.type : null,
        activeOrbDir: _activeOrb ? _activeOrb.dir : null,
        cooldownMs:   _cooldownMs,
        rollTimerMs:  _rollTimerMs,
        attackBuffMs:  _attackBuffMs,
        defenseBuffMs: _defenseBuffMs,
        healChance:    (_healChance() + orbBonus),
        attackChance:  (_attackChance() + orbBonus),
        defenseChance: (_defenseChance() + orbBonus),
        orbBonus,
        rollInterval:  ORB_ROLL_INTERVAL,
        cooldownBase:  ORB_COOLDOWN,
      };
    },
  };

})();

/* === js/systems/demoMode.js === */
/* ═══════════════════════════════════════
   DEMO MODE
   Automated background gameplay.
   Can run in any container element.

   Used by: input.js, mapSelect.js
   Depends on: EnemyRegistry, config.js
   ═══════════════════════════════════════ */

const DemoMode = (() => {

  const SPAWN_INTERVAL  = 1800;
  const BOT_REACT_MS    = 220;
  const MAP_CHANGE_MS   = 5500;
  const HIT_RADIUS      = 28;
  const HIT_DAMAGE      = 34;
  const EDGE_MARGIN     = 30;
  const SPREAD          = 60;

  let ARENA_W = 500;
  let ARENA_H = 500;
  let CX = 250;
  let CY = 250;
  let ATTACK_RANGE = 500 * 0.234;

  const DEFAULT_POOL = [
    'ravager', 'ravager', 'crusher', 'ravager',
    'tornado', 'ravager', 'slime_large', 'ravager',
    'ravager', 'tornado', 'crusher', 'ravager',
    'ravager', 'ravager', 'slime_large', 'tornado',
  ];

  let spawnPool = DEFAULT_POOL;

  const MAP_BGS = [
    'assets/maps/map01_forest/background_01.webp',
    'assets/maps/map02_dungeon/background_01.webp',
    'assets/maps/map03_desert/background_01.webp',
    'assets/maps/map04_temple/background_01.webp',
    'assets/maps/map05_snow/background_01.webp',
    'assets/maps/map06_beach/background_01.webp',
    'assets/maps/map07_clouds/background_01.webp',
    'assets/maps/map08_storm/background_01.webp',
    'assets/maps/map09_volcano/background_01.webp',
    'assets/maps/map10_sakura/background_01.webp',
    'assets/maps/map11_dragon/background_01.webp',
    'assets/maps/map12_moon/background_01.webp',
    'assets/maps/map13_dark/background_01.webp',
];

  let active      = false;
  let arenaEl     = null;
  let dEnemies    = [];
  let spawnIdx    = 0;
  let mapIdx      = 0;
  let loopId      = null;
  let spawnTimer  = 0;
  let botTimer    = 0;
  let mapTimer    = 0;
  let lastTick    = 0;
  let autoRotate  = true;

  function updateArenaSize() {
    if (!arenaEl) return;
    ARENA_W = arenaEl.offsetWidth;
    ARENA_H = arenaEl.offsetHeight;
    CX = ARENA_W / 2;
    CY = ARENA_H / 2;
    ATTACK_RANGE = Math.min(ARENA_W, ARENA_H) * 0.234;
  }

  /* ═══════════════════════════════════
     SPAWN
     ═══════════════════════════════════ */

  function pickDir() {
    const dirs = ['up', 'down', 'left', 'right'];
    return dirs[Math.floor(Math.random() * dirs.length)];
  }

  function spawnPos(dir) {
    let x, y;
    if (dir === 'up')    { x = CX; y = -EDGE_MARGIN; }
    if (dir === 'down')  { x = CX; y = ARENA_H + EDGE_MARGIN; }
    if (dir === 'left')  { x = -EDGE_MARGIN; y = CY; }
    if (dir === 'right') { x = ARENA_W + EDGE_MARGIN; y = CY; }
    if (dir === 'up'   || dir === 'down')  x += (Math.random() - 0.5) * SPREAD;
    if (dir === 'left' || dir === 'right') y += (Math.random() - 0.5) * SPREAD;
    return { x, y, dir };
  }

  function spawnEnemy() {
    const id  = spawnPool[spawnIdx % spawnPool.length];
    spawnIdx++;
    const def = EnemyRegistry.get(id);
    if (!def) return;

    const dir  = pickDir();
    const pos  = spawnPos(dir);
    const size = def.size || 32;

    const el = document.createElement('div');
    el.className = 'demo-enemy';
    el.style.width  = size + 'px';
    el.style.height = size + 'px';
    el.style.left   = pos.x + 'px';
    el.style.top    = pos.y + 'px';

    if (def.sprite) {
      el.style.backgroundImage = `url(${def.sprite})`;
      el.style.imageRendering  = 'pixelated';
      if (def.spriteFrames && def.spriteFrames > 1) {
        const fw = def.spriteFrameW || size;
        const fh = def.spriteFrameH || size;
        const scale = size / fh;
        const scaledW = Math.round(fw * def.spriteFrames * scale);
        el.style.backgroundSize   = `${scaledW}px ${size}px`;
        el.style.backgroundRepeat = 'no-repeat';
        const dur = def.spriteSpeed || 0.8;
        const animName = `dIdle_${id}_${size}`;
        if (!document.getElementById('anim-' + animName)) {
          const style = document.createElement('style');
          style.id = 'anim-' + animName;
          style.textContent = `@keyframes ${animName}{from{background-position-x:0}to{background-position-x:-${scaledW}px}}`;
          document.head.appendChild(style);
        }
        el.style.animation = `${animName} ${dur}s steps(${def.spriteFrames}) infinite`;
      } else {
        el.style.backgroundSize = 'cover';
      }
    }

    arenaEl.appendChild(el);
    const speed = (def.speedMult || 1) * CONFIG.base.enemyBaseSpeed;
    dEnemies.push({ el, x: pos.x, y: pos.y, dir, hp: def.hp || 1, size, speed, def, id });
  }

  /* ═══════════════════════════════════
     BOT AI
     ═══════════════════════════════════ */

  function getEnemyDir(e) {
    const dx = e.x - CX;
    const dy = e.y - CY;
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
    return dy > 0 ? 'down' : 'up';
  }

  function botAttack() {
    let closest = null;
    let closestDist = Infinity;
    for (const e of dEnemies) {
      const dx = e.x - CX;
      const dy = e.y - CY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < closestDist && dist <= ATTACK_RANGE) {
        closest = e;
        closestDist = dist;
      }
    }
    if (!closest) return;

    const dir = getEnemyDir(closest);
    showDemoSlash(dir);

    for (let i = dEnemies.length - 1; i >= 0; i--) {
      const e = dEnemies[i];
      if (getEnemyDir(e) !== dir) continue;
      const dx = e.x - CX;
      const dy = e.y - CY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > ATTACK_RANGE) continue;

      e.hp -= HIT_DAMAGE;
      e.el.style.filter = 'brightness(3) saturate(0)';
      setTimeout(() => { if (e.el) e.el.style.filter = ''; }, 110);

      if (e.hp <= 0) {
        demoKill(e, i);
      }
    }
  }

  function demoKill(e, idx) {
    spawnDemoParticles(e.x, e.y, '#E24B4A');
    showDemoScorePop(e.x, e.y);
    if (e.id === 'slime_large') {
      spawnChildSlime(e, 'slime_medium', 24);
      spawnChildSlime(e, 'slime_medium', 24);
    }
    e.el.remove();
    dEnemies.splice(idx, 1);
  }

  function spawnChildSlime(parent, childId, size) {
    const def = EnemyRegistry.get(childId);
    if (!def) return;
    const offsetX = (Math.random() - 0.5) * 30;
    const offsetY = (Math.random() - 0.5) * 30;

    const el = document.createElement('div');
    el.className = 'demo-enemy';
    el.style.width  = size + 'px';
    el.style.height = size + 'px';
    el.style.left   = (parent.x + offsetX) + 'px';
    el.style.top    = (parent.y + offsetY) + 'px';

    if (def.sprite) {
      el.style.backgroundImage = `url(${def.sprite})`;
      el.style.imageRendering  = 'pixelated';
      if (def.spriteFrames && def.spriteFrames > 1) {
        const fw = def.spriteFrameW || size;
        const fh = def.spriteFrameH || size;
        const scale = size / fh;
        const scaledW = Math.round(fw * def.spriteFrames * scale);
        el.style.backgroundSize   = `${scaledW}px ${size}px`;
        el.style.backgroundRepeat = 'no-repeat';
        const dur = def.spriteSpeed || 0.8;
        const animName = `dIdle_${childId}_${size}`;
        if (!document.getElementById('anim-' + animName)) {
          const style = document.createElement('style');
          style.id = 'anim-' + animName;
          style.textContent = `@keyframes ${animName}{from{background-position-x:0}to{background-position-x:-${scaledW}px}}`;
          document.head.appendChild(style);
        }
        el.style.animation = `${animName} ${dur}s steps(${def.spriteFrames}) infinite`;
      } else {
        el.style.backgroundSize = 'cover';
      }
    }

    arenaEl.appendChild(el);
    const speed = (def.speedMult || 1) * CONFIG.base.enemyBaseSpeed;
    const dir   = getEnemyDir({ x: parent.x + offsetX, y: parent.y + offsetY });
    dEnemies.push({ el, x: parent.x + offsetX, y: parent.y + offsetY, dir, hp: def.hp || 1, size, speed, def, id: childId });
  }

  /* ═══════════════════════════════════
     VISUAL EFFECTS
     ═══════════════════════════════════ */

  function showDemoSlash(dir) {
    const el = document.createElement('div');
    el.className = 'demo-slash';
    const dist = 89;
    let x = CX, y = CY, rot = 0;
    if (dir === 'right') { x += dist; rot = 0; }
    if (dir === 'left')  { x -= dist; rot = 180; }
    if (dir === 'up')    { y -= dist; rot = -90; }
    if (dir === 'down')  { y += dist; rot = 90; }
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    el.style.transform = `translate(-50%,-50%) rotate(${rot}deg)`;
    arenaEl.appendChild(el);
    setTimeout(() => el.remove(), 260);
  }

  function spawnDemoParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.className = 'demo-particle';
      const size  = 3 + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.8 + Math.random() * 2.5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      p.style.cssText = `width:${size}px;height:${size}px;background:${color};left:${x}px;top:${y}px;opacity:1;`;
      arenaEl.appendChild(p);
      const start = performance.now();
      function anim(now) {
        const t = (now - start) / 400;
        if (t >= 1) { p.remove(); return; }
        p.style.left = (x + vx * speed * t * 18) + 'px';
        p.style.top  = (y + vy * speed * t * 18) + 'px';
        p.style.opacity = 1 - t;
        requestAnimationFrame(anim);
      }
      requestAnimationFrame(anim);
    }
  }

  function showDemoScorePop(x, y) {
    const pts = [10, 15, 20, 25][Math.floor(Math.random() * 4)];
    const el  = document.createElement('div');
    el.className   = 'demo-score-pop';
    el.textContent = '+' + pts;
    el.style.left  = x + 'px';
    el.style.top   = y + 'px';
    arenaEl.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  /* ═══════════════════════════════════
     MAP
     ═══════════════════════════════════ */

  function changeMap() {
    mapIdx = (mapIdx + 1) % MAP_BGS.length;
    arenaEl.classList.remove('map-fade');
    void arenaEl.offsetWidth;
    arenaEl.classList.add('map-fade');
    setTimeout(() => {
      arenaEl.style.backgroundImage = `url(${MAP_BGS[mapIdx]})`;
    }, 350);
  }

  /* ═══════════════════════════════════
     MAIN LOOP
     ═══════════════════════════════════ */

  function tick() {
    if (!active) return;
    const now = performance.now();
    const dt  = Math.min(now - lastTick, 50);
    lastTick  = now;
    updateArenaSize();

    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnTimer = SPAWN_INTERVAL;
      if (dEnemies.length < 6) spawnEnemy();
    }

    botTimer -= dt;
    if (botTimer <= 0) {
      botTimer = BOT_REACT_MS + Math.random() * 100;
      botAttack();
    }

    if (autoRotate) {
      mapTimer -= dt;
      if (mapTimer <= 0) {
        mapTimer = MAP_CHANGE_MS;
        changeMap();
      }
    }

    for (let i = dEnemies.length - 1; i >= 0; i--) {
      const e  = dEnemies[i];
      const dx = CX - e.x;
      const dy = CY - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) continue;
      const nx = dx / dist;
      const ny = dy / dist;
      e.x += nx * e.speed;
      e.y += ny * e.speed;
      e.el.style.left = e.x + 'px';
      e.el.style.top  = e.y + 'px';
      e.el.style.opacity = dist <= ATTACK_RANGE ? '1' : '0.5';
      if (dist < HIT_RADIUS) {
        e.el.remove();
        dEnemies.splice(i, 1);
      }
    }

    loopId = requestAnimationFrame(tick);
  }

  /* ═══════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════ */

  function start(targetId, options) {
    if (active) stop();

    const id = targetId || 'demo-arena';
    arenaEl  = document.getElementById(id);
    if (!arenaEl) return;

    autoRotate = options && options.autoRotate === false ? false : true;

    active     = true;
    dEnemies   = [];
    spawnIdx   = 0;
    spawnPool  = DEFAULT_POOL;
    mapIdx     = Math.floor(Math.random() * MAP_BGS.length);
    spawnTimer = 500;
    botTimer   = 800;
    mapTimer   = MAP_CHANGE_MS;
    lastTick   = performance.now();

    arenaEl.style.backgroundImage = `url(${MAP_BGS[mapIdx]})`;
    updateArenaSize();
    loopId = requestAnimationFrame(tick);
  }

  function stop() {
    active = false;
    if (loopId) cancelAnimationFrame(loopId);
    loopId = null;
    if (arenaEl) {
      arenaEl.querySelectorAll('.demo-enemy, .demo-particle, .demo-slash, .demo-score-pop')
        .forEach(el => el.remove());
    }
    dEnemies = [];
  }

  // set map manually (for map select sync)
  function setMap(bgPath) {
    if (!arenaEl) return;
    arenaEl.classList.remove('map-fade');
    void arenaEl.offsetWidth;
    arenaEl.classList.add('map-fade');
    setTimeout(() => {
      arenaEl.style.backgroundImage = `url(${bgPath})`;
    }, 350);
  }

  // set enemy pool for map-specific preview
  function setEnemyPool(ids) {
    if (!ids || ids.length === 0) { spawnPool = DEFAULT_POOL; return; }
    // build weighted pool: repeat each id for variety
    spawnPool = [];
    ids.forEach(id => {
      const def = EnemyRegistry.get(id);
      if (def) spawnPool.push(id);
    });
    if (spawnPool.length === 0) spawnPool = DEFAULT_POOL;
    spawnIdx = 0;
  }

  return { start, stop, setMap, setEnemyPool };

})();

/* === js/systems/transition.js === */
/* ═══════════════════════════════════════
   TRANSITION.JS
   Pixel dissolve screen transition.
   Cells appear in random order to cover,
   then disappear in random order to reveal.

   Usage:
     Transition.play('fast', onMiddle, onComplete)
     Transition.play('fast', onMiddle)
     Transition.play(onMiddle)

   onMiddle:   called when screen is fully covered (swap screens here)
   onComplete: called when transition is fully done (start game here)

   Speeds: 'fast', 'normal', 'slow'
   ═══════════════════════════════════════ */

const Transition = (() => {

  const COLS = 12;
  const ROWS = 10;
  const TOTAL = COLS * ROWS;

  const SPEEDS = {
    fast:   { cellDelay: 4,  hold: 100 },
    normal: { cellDelay: 6,  hold: 140 },
    slow:   { cellDelay: 9,  hold: 180 },
  };

  let overlay = null;
  let cells   = [];
  let busy    = false;

  /* ── Build overlay once, inside #G ── */
  function init() {
    if (overlay) return;
    const container = document.getElementById('G');
    if (!container) return;

    // #G needs position for absolute child
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    overlay = document.createElement('div');
    overlay.id = 'transition-overlay';
    overlay.style.setProperty('--tr-cols', COLS);
    overlay.style.setProperty('--tr-rows', ROWS);

    for (let i = 0; i < TOTAL; i++) {
      const cell = document.createElement('div');
      cell.className = 'tr-cell';
      overlay.appendChild(cell);
      cells.push(cell);
    }

    container.appendChild(overlay);
  }

  /* ── Shuffle array (Fisher-Yates) ── */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ── Animate cells in order ── */
  function animateCells(order, show, cellDelay) {
    return new Promise(resolve => {
      order.forEach((idx, i) => {
        setTimeout(() => {
          if (show) cells[idx].classList.add('active');
          else      cells[idx].classList.remove('active');
          if (i === order.length - 1) {
            setTimeout(resolve, 20);
          }
        }, i * cellDelay);
      });
    });
  }

  /* ── Calculate logo background positions ── */
  function _updateCellPositions() {
    if (!overlay || cells.length === 0) return;

    const oW = overlay.offsetWidth;
    const oH = overlay.offsetHeight;
    if (oW === 0 || oH === 0) return;

    const cellW = oW / COLS;
    const cellH = oH / ROWS;

    // logo: 55% of overlay width, centered
    const logoW = oW * 0.55;
    const logoH = logoW / (1456 / 720);
    const logoX = (oW - logoW) / 2;
    const logoY = (oH - logoH) / 2;

    for (let i = 0; i < TOTAL; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const bgX = logoX - (col * cellW);
      const bgY = logoY - (row * cellH);

      cells[i].style.backgroundSize = logoW + 'px ' + logoH + 'px';
      cells[i].style.backgroundPosition = bgX + 'px ' + bgY + 'px';
    }
  }

  /* ── Public: play transition ── */
  async function play(speedOrCb, middleOrCb, maybeComplete) {
    if (busy) return;

    // parse arguments
    let speedName  = 'normal';
    let onMiddle   = null;
    let onComplete = null;

    if (typeof speedOrCb === 'function') {
      // play(onMiddle)
      onMiddle = speedOrCb;
    } else if (typeof speedOrCb === 'string') {
      speedName = speedOrCb;
      if (typeof middleOrCb === 'function') {
        onMiddle = middleOrCb;
      }
      if (typeof maybeComplete === 'function') {
        onComplete = maybeComplete;
      }
    }

    const speed = SPEEDS[speedName] || SPEEDS.normal;

    busy = true;
    init();
    _updateCellPositions();

    // show logo for entire transition
    const tLogo = document.getElementById('transition-logo');
    if (tLogo) tLogo.classList.add('visible');

    // transition sound — cover
    try { if (typeof SFX !== 'undefined') SFX.transIn(); } catch(e) {}

    // Phase 1: dissolve IN
    const orderIn = shuffle([...Array(TOTAL).keys()]);
    await animateCells(orderIn, true, speed.cellDelay);

    // Screen covered — swap screens
    if (onMiddle) onMiddle();

    // Phase 2: hold
    await new Promise(r => setTimeout(r, speed.hold));

    // transition sound — reveal
    try { if (typeof SFX !== 'undefined') SFX.transOut(); } catch(e) {}

    // Phase 3: dissolve OUT
    const orderOut = shuffle([...Array(TOTAL).keys()]);
    await animateCells(orderOut, false, speed.cellDelay);

    // hide logo
    if (tLogo) tLogo.classList.remove('visible');

    busy = false;

    // Transition fully done — start game
    if (onComplete) onComplete();
  }

  function isPlaying() {
    return busy;
  }

  return { play, isPlaying };
})();

/* === js/systems/mapTransition.js === */
/* ═══════════════════════════════════════
   MAPTRANSITION.JS
   Challenge Mode map change effect.
   Rift particles + dimension cracks.

   Creates a canvas overlay inside #arena.
   Two modes: normal (particle flood) and
   dimension (cracks + glitch + chaos).

   Used by: challengeDirector.js
   Depends on: dom.js (arena element)
   ═══════════════════════════════════════ */

const MapTransition = (() => {

  /* ── DOM REFS ──────────────────────── */
  let canvas   = null;
  let ctx      = null;
  let nameEl   = null;
  let textEl   = null;
  let flashEl  = null;
  let arenaEl  = null;
  let W = 500, H = 500;

  /* ── ANIM STATE ────────────────────── */
  let particles = [];
  let cracks    = [];
  let animId    = null;
  let running   = false;

  const PX = 4; // pixel size

  /* ── SETUP DOM (called once) ───────── */

  function _ensureDOM() {
    arenaEl = document.getElementById('arena');
    if (!arenaEl) return;

    // canvas
    if (!document.getElementById('map-transition-canvas')) {
      canvas = document.createElement('canvas');
      canvas.id = 'map-transition-canvas';
      arenaEl.appendChild(canvas);
    } else {
      canvas = document.getElementById('map-transition-canvas');
    }
    ctx = canvas.getContext('2d');

    // name container
    if (!document.getElementById('map-transition-name')) {
      nameEl = document.createElement('div');
      nameEl.id = 'map-transition-name';
      nameEl.innerHTML = '<span id="map-transition-text"></span>';
      arenaEl.appendChild(nameEl);
    } else {
      nameEl = document.getElementById('map-transition-name');
    }
    textEl = document.getElementById('map-transition-text');

    // flash overlay (reuse #flash if exists, else create)
    if (!document.getElementById('map-transition-flash')) {
      flashEl = document.createElement('div');
      flashEl.id = 'map-transition-flash';
      flashEl.style.cssText =
        'position:absolute;inset:0;z-index:34;' +
        'pointer-events:none;opacity:0;border-radius:12px;';
      arenaEl.appendChild(flashEl);
    } else {
      flashEl = document.getElementById('map-transition-flash');
    }

    _resize();
  }

  function _resize() {
    if (!arenaEl || !canvas) return;
    W = arenaEl.clientWidth;
    H = arenaEl.clientHeight;
    canvas.width  = W;
    canvas.height = H;
  }

  /* ── HELPERS ───────────────────────── */

  function _hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  function _wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  /* ── PARTICLE SYSTEM ───────────────── */

  function _spawnScatter(color, colorDark, count) {
    const rgb1 = _hexToRgb(color);
    const rgb2 = _hexToRgb(colorDark);
    const cx = W / 2, cy = H / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist  = 20 + Math.random() * 60;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      const size = PX * (1 + Math.floor(Math.random() * 2));
      const tAngle = Math.random() * Math.PI * 2;
      const tDist  = 100 + Math.random() * (Math.max(W, H) * 0.5);
      const tx = x + Math.cos(tAngle) * tDist;
      const ty = y + Math.sin(tAngle) * tDist;
      const useAlt = Math.random() < 0.3;
      const bright = Math.random() < 0.15;
      const rgb = bright ? [255, 255, 255] : (useAlt ? rgb2 : rgb1);

      particles.push({
        x, y, tx, ty, size,
        r: rgb[0], g: rgb[1], b: rgb[2],
        phase: 'scatter',
        born: performance.now() + Math.random() * 400,
        lifespan: 800 + Math.random() * 1200,
        maxAlpha: 0.6 + Math.random() * 0.4,
      });
    }
  }

  function _spawnCover(color, colorDark) {
    const rgb1 = _hexToRgb(color);
    const rgb2 = _hexToRgb(colorDark);
    const cx = W / 2, cy = H / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    const cols = Math.ceil(W / PX);
    const rows = Math.ceil(H / PX);

    for (let gy = 0; gy < rows; gy += 2) {
      for (let gx = 0; gx < cols; gx += 2) {
        if (Math.random() < 0.35) continue;
        const x = gx * PX;
        const y = gy * PX;
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const delay = (dist / maxDist) * 600;
        const useAlt = Math.random() < 0.3;
        const bright = Math.random() < 0.1;
        const rgb = bright ? [255, 255, 255] : (useAlt ? rgb2 : rgb1);

        particles.push({
          x, y, tx: x, ty: y, size: PX,
          r: rgb[0], g: rgb[1], b: rgb[2],
          phase: 'cover',
          born: performance.now() + delay,
          lifespan: 500 + Math.random() * 300,
          maxAlpha: 0.85 + Math.random() * 0.15,
        });
      }
    }
  }

  /* ── CRACK SYSTEM (dimension only) ─── */

  function _spawnCracks(color) {
    const rgb = _hexToRgb(color);
    const cx = W / 2, cy = H / 2;
    const numMain = 10 + Math.floor(Math.random() * 6);

    for (let i = 0; i < numMain; i++) {
      const angle = (Math.PI * 2 / numMain) * i +
                    (Math.random() - 0.5) * 0.3;
      const ocx = cx + (Math.random() - 0.5) * 40;
      const ocy = cy + (Math.random() - 0.5) * 40;
      _buildBranch(ocx, ocy, angle,
        250 + Math.random() * Math.max(W, H) * 0.4,
        rgb, 3 + Math.random() * 2, i * 30, 0);
    }
  }

  function _buildBranch(sx, sy, angle, totalLen, rgb, thickness, delay, depth) {
    const segs = 12 + Math.floor(Math.random() * 8);
    const segLen = totalLen / segs;
    const points = [{ x: sx, y: sy }];
    let x = sx, y = sy;

    for (let i = 0; i < segs; i++) {
      const jitter = (Math.random() - 0.5) * 0.6;
      const a = angle + jitter;
      x += Math.cos(a) * segLen;
      y += Math.sin(a) * segLen;
      points.push({ x, y });

      // sub-branches
      if (depth < 2 && i > 3 && Math.random() < 0.25) {
        const bAngle = angle +
          (Math.random() < 0.5 ? 1 : -1) *
          (0.4 + Math.random() * 0.8);
        _buildBranch(x, y, bAngle,
          totalLen * 0.4, rgb, thickness * 0.6,
          delay + i * 15, depth + 1);
      }
    }

    cracks.push({
      points, thickness,
      r: rgb[0], g: rgb[1], b: rgb[2],
      born: performance.now() + delay,
      growDuration: 600 + Math.random() * 400,
      maxAlpha: 0.9,
      glowSize: thickness * 3,
    });
  }

  /* ── RENDER LOOP ───────────────────── */

  function _render() {
    ctx.clearRect(0, 0, W, H);
    const now = performance.now();

    // draw cracks
    for (let i = 0; i < cracks.length; i++) {
      const c = cracks[i];
      const age = now - c.born;
      if (age < 0) continue;
      const progress = Math.min(1, age / c.growDuration);
      const drawPts = Math.max(2, Math.floor(c.points.length * progress));
      const fadeIn = Math.min(1, age / 300);
      const alpha = c.maxAlpha * fadeIn;

      // glow
      ctx.save();
      ctx.globalAlpha = alpha * 0.3;
      ctx.strokeStyle = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
      ctx.lineWidth = c.glowSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(c.points[0].x, c.points[0].y);
      for (let j = 1; j < drawPts; j++) {
        ctx.lineTo(c.points[j].x, c.points[j].y);
      }
      ctx.stroke();

      // core (white)
      ctx.globalAlpha = alpha;
      ctx.lineWidth = c.thickness;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.moveTo(c.points[0].x, c.points[0].y);
      for (let j = 1; j < drawPts; j++) {
        ctx.lineTo(c.points[j].x, c.points[j].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const age = now - p.born;
      if (age < 0) continue;
      const life = age / p.lifespan;
      if (life > 1) { particles.splice(i, 1); continue; }

      let alpha, dx, dy;

      if (p.phase === 'cover') {
        // fade in → hold → fade out
        alpha = life < 0.3
          ? (life / 0.3) * p.maxAlpha
          : life < 0.7
            ? p.maxAlpha
            : p.maxAlpha * (1 - (life - 0.7) / 0.3);
        dx = p.x;
        dy = p.y;
      } else {
        // scatter outward
        const t = life;
        dx = p.x + (p.tx - p.x) * t;
        dy = p.y + (p.ty - p.y) * t;
        alpha = life < 0.2
          ? (life / 0.2) * p.maxAlpha
          : p.maxAlpha * (1 - (life - 0.2) / 0.8);
      }

      if (alpha <= 0) continue;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgb(' + p.r + ',' + p.g + ',' + p.b + ')';
      ctx.fillRect(Math.floor(dx), Math.floor(dy), p.size, p.size);
    }

    ctx.globalAlpha = 1;

    if (particles.length > 0 || cracks.length > 0) {
      animId = requestAnimationFrame(_render);
    } else {
      animId = null;
    }
  }

  function _startRender() {
    if (!animId) animId = requestAnimationFrame(_render);
  }

  function _stopRender() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    particles = [];
    cracks    = [];
    if (ctx) ctx.clearRect(0, 0, W, H);
  }

  /* ── SHAKE ─────────────────────────── */

  function _shake(duration, intensity) {
    if (!arenaEl) return;
    const start = performance.now();
    function tick() {
      const e = performance.now() - start;
      if (e > duration) { arenaEl.style.transform = ''; return; }
      const f = 1 - e / duration;
      const ox = (Math.random() - 0.5) * intensity * f * 2;
      const oy = (Math.random() - 0.5) * intensity * f * 2;
      arenaEl.style.transform =
        'translate(' + ox + 'px,' + oy + 'px)';
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ── GLITCH SHAKE (dimension) ──────── */

  function _glitchShake(duration) {
    if (!arenaEl) return;
    const start = performance.now();
    function tick() {
      const e = performance.now() - start;
      if (e > duration) {
        arenaEl.style.transform = '';
        return;
      }
      if (Math.random() < 0.15) {
        const ox = (Math.random() - 0.5) * 12;
        const oy = (Math.random() - 0.5) * 12;
        arenaEl.style.transform =
          'translate(' + ox + 'px,' + oy + 'px)';
      }
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ── FLASH ─────────────────────────── */

  function _flash(color, inMs, holdMs, outMs, maxOpacity) {
    if (!flashEl) return _wait(inMs + holdMs + outMs);

    flashEl.style.background = color;
    flashEl.style.transition = 'opacity ' + inMs + 'ms ease-in';
    flashEl.style.opacity = String(maxOpacity || 0.7);

    return _wait(inMs + holdMs).then(() => {
      flashEl.style.transition = 'opacity ' + outMs + 'ms ease-out';
      flashEl.style.opacity = '0';
      return _wait(outMs);
    });
  }

  /* ── SHOW MAP NAME ─────────────────── */

  function _showName(name, color, pulse) {
    if (!nameEl || !textEl) return;
    textEl.style.color = color;
    textEl.textContent = name;
    textEl.classList.toggle('pulse', !!pulse);
    nameEl.classList.remove('fade-out');
    nameEl.classList.add('visible');
  }

  function _hideName() {
    if (!nameEl) return;
    nameEl.classList.add('fade-out');
    nameEl.classList.remove('visible');
    return _wait(600).then(() => {
      nameEl.classList.remove('fade-out');
      if (textEl) textEl.classList.remove('pulse');
    });
  }

  /* ═══════════════════════════════════
     PUBLIC — NORMAL TRANSITION
     ═══════════════════════════════════ */

  async function playNormal(mapName, color, colorDark, onSwapBg) {
    if (running) return;
    running = true;
    _ensureDOM();
    _resize();
    _stopRender();

    // Phase 1 — scatter particles from center
    SFX.mapNormalRise();
    _spawnScatter(color, colorDark, 80);
    _startRender();

    await _wait(500);
    _spawnScatter(color, colorDark, 120);

    await _wait(500);

    // Phase 2 — cover screen with pixel flood
    SFX.mapNormalCover();
    _spawnCover(color, colorDark);

    await _wait(700);

    // Phase 3 — flash + swap background
    SFX.mapNormalFlash();
    flashEl.style.background = color;
    flashEl.style.transition = 'opacity 0.12s ease-in';
    flashEl.style.opacity = '0.6';

    await _wait(150);

    // callback: change the actual map bg
    if (onSwapBg) onSwapBg();

    // remove cover particles
    particles = particles.filter(p => p.phase !== 'cover');

    flashEl.style.transition = 'opacity 0.6s ease-out';
    flashEl.style.opacity = '0';

    await _wait(400);

    // Phase 4 — show map name
    SFX.mapNormalReveal();
    _showName(mapName, color, false);

    await _wait(2000);

    await _hideName();

    _stopRender();
    running = false;
  }

  /* ═══════════════════════════════════
     PUBLIC — DIMENSION TRANSITION
     ═══════════════════════════════════ */

  async function playDimension(onSwapBg) {
    if (running) return;
    running = true;
    _ensureDOM();
    _resize();
    _stopRender();

    const color     = '#ff00ff';
    const colorDark = '#880088';

    // Phase 1 — ominous particles
    SFX.mapDimDrone();
    _spawnScatter(color, colorDark, 40);
    _startRender();

    await _wait(300);

    // Phase 2 — glitch + cracks
    SFX.mapDimCracks();
    _glitchShake(3500);
    _spawnCracks(color);
    _spawnScatter(color, colorDark, 60);

    await _wait(400);
    _spawnScatter(color, colorDark, 80);

    await _wait(400);
    _spawnScatter('#ffffff', '#aaaaaa', 40);

    // Phase 3 — glitch flashes
    for (let i = 0; i < 5; i++) {
      SFX.mapDimGlitch();
      const c = i % 2 === 0 ? color : '#ffffff';
      flashEl.style.background = c;
      flashEl.style.transition = 'opacity 0.04s';
      flashEl.style.opacity =
        String(0.2 + Math.random() * 0.5);
      await _wait(60 + Math.random() * 80);
      flashEl.style.opacity = '0';
      await _wait(40 + Math.random() * 60);
    }

    // Phase 4 — final burst + cover
    _spawnCover(color, colorDark);

    await _wait(600);

    // big shake + white flash
    SFX.mapDimExplode();
    _shake(500, 8);

    flashEl.style.background = '#ffffff';
    flashEl.style.transition = 'opacity 0.08s';
    flashEl.style.opacity = '0.95';

    await _wait(200);

    // swap bg
    if (onSwapBg) onSwapBg();
    cracks = [];
    particles = particles.filter(p => p.phase !== 'cover');

    flashEl.style.background = color;
    flashEl.style.transition = 'opacity 1s ease-out';
    flashEl.style.opacity = '0';

    await _wait(600);

    // Phase 5 — DIMENSION name with pulse
    SFX.mapDimReveal();
    _showName('DIMENSION', color, true);

    await _wait(2500);

    await _hideName();

    _stopRender();
    running = false;
  }

  /* ── CLEANUP ───────────────────────── */

  function cleanup() {
    _stopRender();
    if (nameEl) {
      nameEl.classList.remove('visible', 'fade-out');
    }
    if (textEl) textEl.classList.remove('pulse');
    if (flashEl) flashEl.style.opacity = '0';
    if (arenaEl) arenaEl.style.transform = '';
    running = false;
  }

  /* ── PUBLIC API ────────────────────── */

  return {
    playNormal,
    playDimension,
    cleanup,
    isRunning() { return running; },
  };

})();

/* === js/input.js === */
/* ═══════════════════════════════════════
   INPUT.JS
   All keyboard and touch event listeners.

   Used by: nobody — self-executing
   Depends on: state.js, combat.js,
               ui/screens.js, ui/abilityScreen.js,
               audio.js
   ═══════════════════════════════════════ */

/* ── SAFE BIND HELPER ── */
function _safeBind(id, event, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, handler);
}

/* ── MENU NAVIGATION ── */

_safeBind('btn-restart', 'click', () => {
  if (Transition.isPlaying()) return;
  if (overOverlay) overOverlay.classList.add('hidden');
  cleanupArena();
  Transition.play('fast', () => {
    // challenge mode restart
    if (ActiveDirector && ActiveDirector === ChallengeDirector) {
      startChallengeGame();
      return;
    }
    // adventure mode restart
    equippedAbilityId = getEquippedAbility();
    if (ActiveDirector && ActiveDirector === AdventureDirector) {
      if (!AdventureDirector.restart()) {
        showScreen(sMenu);
        return;
      }
    }
    startGame(true);
  }, () => {
    startGameLoop();
  });
});

_safeBind('btn-adventure', 'click', () => {
  if (Transition.isPlaying()) return;
  if (typeof DemoMode !== 'undefined') DemoMode.stop();
  Transition.play('fast', () => {
    try {
      loadAdventureMode(() => {
        buildMapSelectScreen();
        showScreen(sMapSelect);
      });
    } catch (e) {
      console.error('[INPUT] loadAdventureMode failed', e);
      showScreen(sMenu);
    }
  });
});

// challenge mode
_safeBind('btn-challenge', 'click', () => {
  if (Transition.isPlaying()) return;
  if (typeof DemoMode !== 'undefined') DemoMode.stop();
  Transition.play('fast', () => {
    try {
      buildChallengeScreen();
      showScreen(sChallenge);
    } catch (e) {
      console.error('[INPUT] buildChallengeScreen failed', e);
      showScreen(sMenu);
    }
  });
});

// splash text on challenge hover
const _challengeCard = document.getElementById('btn-challenge');
const _splashEl = document.getElementById('menu-splash');
const _splashTexts = [
  'For experienced\nwarriors only!',
  'Beat Adventure\nmode first!',
  'Think you are\nready? 💀',
  'Endless chaos\nawaits...',
  'No mercy.\nNo checkpoints.',
];

if (_challengeCard && _splashEl) {
  _challengeCard.addEventListener('mouseenter', () => {
    const txt = _splashTexts[Math.floor(Math.random() * _splashTexts.length)];
    _splashEl.textContent = txt;
    _splashEl.classList.add('visible');
  });
  _challengeCard.addEventListener('mouseleave', () => {
    _splashEl.classList.remove('visible');
  });
}

// how to play — info popup
_safeBind('btn-howtoplay', 'click', () => {
  const popup = document.getElementById('info-popup');
  if (popup) popup.classList.remove('hidden');
});

_safeBind('info-close', 'click', () => {
  const popup = document.getElementById('info-popup');
  if (popup) popup.classList.add('hidden');
});

// close info on click outside card
const _infoPopup = document.getElementById('info-popup');
if (_infoPopup) {
  _infoPopup.addEventListener('click', (e) => {
    if (e.target.id === 'info-popup') {
      e.target.classList.add('hidden');
    }
  });
}

const _btnAbilities = document.getElementById('btn-abilities');
if (_btnAbilities) {
  _btnAbilities.addEventListener('click', () => {
    if (typeof DemoMode !== 'undefined') DemoMode.stop();
    buildAbilityScreen();
    showScreen(sAbility);
  });
}

const _btnAbilityBack = document.getElementById('btn-ability-back');
if (_btnAbilityBack) {
  _btnAbilityBack.addEventListener('click', () => {
    showScreen(sMenu);
    if (typeof DemoMode !== 'undefined') DemoMode.start();
  });
}

_safeBind('btn-home', 'click', () => {
  if (Transition.isPlaying()) return;
  if (overOverlay) overOverlay.classList.add('hidden');
  cleanupArena();
  Transition.play('fast', () => {
    // challenge mode: go back to menu
    if (ActiveDirector && ActiveDirector === ChallengeDirector) {
      showScreen(sMenu);
      if (typeof DemoMode !== 'undefined') DemoMode.start();
      return;
    }
    // adventure mode: go back to map select
    showScreen(sMapSelect);
    if (typeof initMapSelect === 'function') initMapSelect();
  });
});

_safeBind('btn-map-back', 'click', () => {
  if (Transition.isPlaying()) return;
  Transition.play('fast', () => {
    showScreen(sMenu);
    if (typeof DemoMode !== 'undefined') DemoMode.start();
  });
});

/* ── CHALLENGE SCREEN BUTTONS ── */

_safeBind('btn-challenge-back', 'click', () => {
  if (Transition.isPlaying()) return;
  if (typeof DemoMode !== 'undefined') DemoMode.stop();
  Transition.play('fast', () => {
    showScreen(sMenu);
    if (typeof DemoMode !== 'undefined') DemoMode.start();
  });
});

_safeBind('btn-challenge-play', 'click', () => {
  if (Transition.isPlaying()) return;
  if (typeof SFX !== 'undefined') SFX.mapConfirm();
  if (typeof Music !== 'undefined') Music.fadeOut(500);
  if (typeof DemoMode !== 'undefined') DemoMode.stop();
  Transition.play('normal', () => {
    startChallengeGame();
  }, () => {
    startGameLoop();
  });
});


/* ── AUDIO — VOLUME SLIDER ── */

const _menuSlider  = document.getElementById('menu-volume-slider');
const _pauseSlider = document.getElementById('pause-volume-slider');
const _menuPopup   = document.getElementById('menu-volume-popup');
const _menuSoundBtn = document.getElementById('btn-sound');

// sync all sliders + icon to current volume
function _syncVolumeUI() {
  const pct = Math.round(CONFIG.audio.volume * 100);
  if (_menuSlider)  _menuSlider.value  = pct;
  if (_pauseSlider) _pauseSlider.value = pct;

  // update menu button icon
  const icon = CONFIG.audio.volume <= 0 ? '🔇' : '🔊';
  if (_menuSoundBtn) {
    const iconEl = _menuSoundBtn.querySelector('.menu-btn-icon');
    if (iconEl) iconEl.textContent = icon;
    _menuSoundBtn.classList.toggle('muted', CONFIG.audio.volume <= 0);
  }
}

// handle slider input
function _onVolumeChange(e) {
  if (typeof AudioCore !== 'undefined') AudioCore.setVolume(parseInt(e.target.value) / 100);
  _syncVolumeUI();
}

if (_menuSlider)  _menuSlider.addEventListener('input', _onVolumeChange);
if (_pauseSlider) _pauseSlider.addEventListener('input', _onVolumeChange);

// menu button toggles popup
if (_menuSoundBtn && _menuPopup) {
  _menuSoundBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    _menuPopup.classList.toggle('hidden');
    _syncVolumeUI();
  });

  // close popup on click outside
  document.addEventListener('click', (e) => {
    if (!_menuPopup.contains(e.target) && e.target !== _menuSoundBtn && !_menuSoundBtn.contains(e.target)) {
      _menuPopup.classList.add('hidden');
    }
  });
}

// sync on load
_syncVolumeUI();

/* ── DIRECTIONAL BUTTONS ── */

['up', 'down', 'left', 'right'].forEach(dir => {
  const btn = document.getElementById('btn-' + dir);
  if (btn) {
    btn.addEventListener('click', () => {
      if (paused) return;
      if (typeof Tutorial !== 'undefined' && Tutorial.isActive() && Tutorial.isFrozen()) {
        Tutorial.onDirInput(dir);
        return;
      }
      handleDir(dir);
      if (ActiveDirector && ActiveDirector.trackInput) ActiveDirector.trackInput();
    });
  }
});

/* ── SPECIAL ── */

const specialBtn = document.getElementById('btn-special');
if (specialBtn) {
  let _specialTouched = false;

  specialBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    _specialTouched = true;
    if (paused) return;
    if (typeof Tutorial !== 'undefined' && Tutorial.isActive() && Tutorial.isFrozen()) {
      Tutorial.onSpaceInput();
      return;
    }
    activateSpecial();
    if (ActiveDirector && ActiveDirector.trackInput) ActiveDirector.trackInput();
  }, { passive: false });

  specialBtn.addEventListener('mousedown', () => {
    if (_specialTouched) { _specialTouched = false; return; }
    if (paused) return;
    if (typeof Tutorial !== 'undefined' && Tutorial.isActive() && Tutorial.isFrozen()) {
      Tutorial.onSpaceInput();
      return;
    }
    activateSpecial();
    if (ActiveDirector && ActiveDirector.trackInput) ActiveDirector.trackInput();
  });
}

/* ── TOUCH INPUT (mobile) ── */

const _touchArena = document.getElementById('arena');
if (_touchArena && navigator.maxTouchPoints > 0) {
  _touchArena.addEventListener('touchstart', (e) => {
    // let interactive elements handle their own taps
    const t = e.target;
    if (t.closest('button, a, .game-btn, #over-overlay, #complete-overlay, #slot-overlay, #upgrade-choice, #pause-overlay, #hud-right, #slot-card, .menu-btn')) {
      return; // don't preventDefault, let click fire
    }

    e.preventDefault();
    if (paused) return;
    if (!running) return;

    // don't intercept when overlays are showing
    const overEl = document.getElementById('over-overlay');
    const compEl = document.getElementById('complete-overlay');
    if (overEl && !overEl.classList.contains('hidden')) return;
    if (compEl && !compEl.classList.contains('hidden')) return;

    const touch = e.touches[0];
    const rect = _touchArena.getBoundingClientRect();

    // normalized position 0→1
    const nx = (touch.clientX - rect.left) / rect.width;
    const ny = (touch.clientY - rect.top) / rect.height;

    // distance from center (player position)
    const dx = nx - 0.5;
    const dy = ny - 0.5;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // center tap = special (radius = player size 96px / arena 620px)
    const deadZone = 48 / 620;

    if (dist <= deadZone) {
      // tutorial intercept
      if (typeof Tutorial !== 'undefined' && Tutorial.isActive() && Tutorial.isFrozen()) {
        Tutorial.onSpaceInput();
        return;
      }
      activateSpecial();
      if (ActiveDirector && ActiveDirector.trackInput) ActiveDirector.trackInput();
      return;
    }

    // angle → direction
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    let dir;
    if (angle >= -45 && angle < 45)        dir = 'right';
    else if (angle >= 45 && angle < 135)   dir = 'down';
    else if (angle >= -135 && angle < -45) dir = 'up';
    else                                   dir = 'left';

    // tutorial intercept
    if (typeof Tutorial !== 'undefined' && Tutorial.isActive() && Tutorial.isFrozen()) {
      Tutorial.onDirInput(dir);
      return;
    }

    handleDir(dir);
    if (ActiveDirector && ActiveDirector.trackInput) ActiveDirector.trackInput();
  }, { passive: false });
}
/* ── KEYBOARD ── */

document.addEventListener('keydown', e => {
  // P = pause
  if (e.code === 'KeyP') {
    e.preventDefault();
    togglePause();
    return;
  }

  // Space = special
  if (e.code === 'Space') {
    e.preventDefault();
    if (paused) return;
    if (e.repeat) return;
    // tutorial intercept
    if (typeof Tutorial !== 'undefined' && Tutorial.isActive() && Tutorial.isFrozen()) {
      Tutorial.onSpaceInput();
      return;
    }
    activateSpecial();
    return;
  }

 const map = {
    ArrowUp:    'up',
    ArrowDown:  'down',
    ArrowLeft:  'left',
    ArrowRight: 'right',
    KeyW:       'up',
    KeyS:       'down',
    KeyA:       'left',
    KeyD:       'right',
  };

  if (map[e.code]) {
    e.preventDefault();
    if (paused) return;
    if (e.repeat) return;
    // tutorial intercept
    if (typeof Tutorial !== 'undefined' && Tutorial.isActive() && Tutorial.isFrozen()) {
      Tutorial.onDirInput(map[e.code]);
      return;
    }
    const btn = document.getElementById('btn-' + map[e.code]);
    if (btn) btn.classList.add('pressed');
    setTimeout(() => { if (btn) btn.classList.remove('pressed'); }, 120);
    handleDir(map[e.code]);
    if (ActiveDirector && ActiveDirector.trackInput) ActiveDirector.trackInput();
  }
});

/* ── DEV CHEATS ── */
const DEV_CHEATS = false;

document.addEventListener('keydown', e => {
  if (!DEV_CHEATS || !running) return;

  if (e.code === 'KeyW') {
    e.preventDefault();
    const needed = ActiveDirector.getKillsNeeded();
    const kills  = ActiveDirector.getKills();
    const diff   = needed - kills;
    for (let i = 0; i < diff; i++) ActiveDirector.onKill();
    return;
  }

  if (e.code === 'KeyK') {
    e.preventDefault();
    player.hp = player.maxHp;
    updateHpBar();
    return;
  }

  if (e.code === 'KeyF') {
    e.preventDefault();
    player.specialCharge = 100;
    updateSpecialBar();
    return;
  }

  // M = skip entire wave (clear field + advance to next)
  if (e.code === 'KeyM') {
    e.preventDefault();
    if (ActiveDirector === AdventureDirector || ActiveDirector === ChallengeDirector) {
      for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].el) enemies[i].el.remove();
        enemies.splice(i, 1);
      }
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].el.remove();
        bullets.splice(i, 1);
      }
      ActiveDirector.nextWave();
    }
    return;
  }
});

/* ── CHALLENGE GAME START ── */

function startChallengeGame() {
  // ensure adventure scripts (MapRegistry, etc.) are loaded
  loadAdventureMode(() => {
    ActiveDirector = ChallengeDirector;
    ChallengeDirector.init();

    // reset upgrade tier tracking for new run
    if (typeof resetUpgradeChoices === 'function') resetUpgradeChoices();
    if (typeof resetChallengeChoices === 'function') resetChallengeChoices();

    // start game with temporary ability — player picks in first choice
    equippedAbilityId = 'shield';
    startGame(true);

    // immediately show ability choice
    _isFirstAbilityChoice = true;
    startChallengeChoice('ability');
  });
}

if (typeof updateMenuBest === 'function') updateMenuBest();

/* === js/modes/adventure/main.js === */
/* ═══════════════════════════════════════
   ADVENTURE/MAIN.JS
   Adventure Mode entry point.
   Loaded dynamically when the user opens
   Adventure from the main menu.

   Loads:
   - MapRegistry
   - Progress
   - adventureSpawner + adventureDirector
   - mapSelect UI
   - all map definitions

   Exposes:
   - startAdventureMap(mapId)
   - loadAdventureMode(callback)

   Depends on: modes/infinite/main.js loaded first
               (shared core: Enemy, Player, Director,
                spawner, stress, etc.)
   ═══════════════════════════════════════ */

const ADVENTURE_SCRIPTS = [

  /* ── CORE ADVENTURE ── */
  'js/modes/adventure/MapRegistry.js',
  'js/modes/adventure/progress.js',
  'js/modes/adventure/adventureSpawner.js',
  'js/systems/tutorial.js',
  'js/modes/adventure/adventureDirector.js',

  /* ── MAPS ── */
  
  'js/modes/adventure/maps/map01_forest/map.js',
  'js/modes/adventure/maps/map02_dungeon/map.js',
  'js/modes/adventure/maps/map03_desert/map.js',
  'js/modes/adventure/maps/map04_temple/map.js',
  'js/modes/adventure/maps/map05_snow/map.js',
  'js/modes/adventure/maps/map06_beach/map.js',
  'js/modes/adventure/maps/map07_clouds/map.js',
  'js/modes/adventure/maps/map08_storm/map.js',
  'js/modes/adventure/maps/map09_volcano/map.js',
  'js/modes/adventure/maps/map10_sakura/map.js',
  'js/modes/adventure/maps/map11_dragon/map.js',
  'js/modes/adventure/maps/map12_moon/map.js',
  'js/modes/adventure/maps/map13_dark/map.js',
  

  /* ── MAP SELECT UI ── */
  'js/modes/adventure/mapSelect.js',

];

let _adventureLoaded = false;

/* ── LOAD ADVENTURE ─────────────────────
   Loads all adventure scripts sequentially.
   Safe to call multiple times.
   @param callback  called when all loaded
─────────────────────────────────────── */
function loadAdventureMode(callback) {
  if (_adventureLoaded) {
    if (callback) callback();
    return;
  }

  // prevent double-load if called while already loading
  _adventureLoaded = true;

  (function loadScript(i) {
    if (i >= ADVENTURE_SCRIPTS.length) {
      if (callback) callback();
      return;
    }

    const s = document.createElement('script');
    s.src     = ADVENTURE_SCRIPTS[i];
    s.onload  = () => loadScript(i + 1);
    s.onerror = e => {
      console.error('Failed to load:', ADVENTURE_SCRIPTS[i], e);
      loadScript(i + 1); // continua anche se un file manca
    };
    document.head.appendChild(s);
  })(0);
}
/* ── START ADVENTURE MAP ────────────────
   Called by mapSelect when user picks a map.
   @param mapId  id from MapRegistry
─────────────────────────────────────── */
function startAdventureMap(mapId, delayLoop) {
  const map = MapRegistry.get(mapId);
  if (!map) {
    console.error(`startAdventureMap: map "${mapId}" not found.`);
    return;
  }

  // set active director so loop.js and combat.js use adventure
  ActiveDirector = AdventureDirector;

  // initialize adventure director with the chosen map
  if (!AdventureDirector.init(mapId)) return;

  // load equipped ability (same as infinite mode)
  equippedAbilityId = getEquippedAbility();

 // reuse the common startGame() from loop.js
  // delayLoop passed through from caller
  startGame(delayLoop);

  // overwrite initial wave display for adventure
  if (typeof updateWaveDisplay === 'function') {
    updateWaveDisplay(1, false);
  }
}

/* === js/modes/challenge/challengeDirector.js === */
/* ═══════════════════════════════════════
   CHALLENGEDIRECTOR.JS — v3 MODULAR
   Challenge Mode orchestrator.
   Delegates to: ChallengeScaling,
   ChallengePool, ChallengeDimension,
   ChallengeTransition.

   Used by: systems/loop.js (via ActiveDirector)
   ═══════════════════════════════════════ */

const ChallengeDirector = (() => {

  /* ── STATE ─────────────────────────── */
  let wave           = 0;
  let active         = false;
  let currentMap     = null;
  let mapsCompleted  = 0;
  let choiceCount    = 0;
  let bestWave       = 0;

  /* ── WAVE TIMER ────────────────────── */
  let waveDuration = 0;
  let waveTimeLeft = 0;
  let waveElapsed  = 0;
  let draining     = false;
  let drainPauseMs = 0;
  let spawnTimer   = 0;

  /* ── CACHED WAVE CONFIG ────────────── */
  let _currentWC    = null;
  let _dimBackupMap = null;

  /* ── INPUT TRACKER ─────────────────── */
  let _inputTimes = [];

  function _trackInput() {
    _inputTimes.push(performance.now());
  }

  function _getInputRate() {
    const now    = performance.now();
    const window = CONFIG.adventure.inputWindowMs || 3000;
    while (_inputTimes.length > 0 && now - _inputTimes[0] > window) {
      _inputTimes.shift();
    }
    return _inputTimes.length;
  }

  /* ── WAVE CONFIG CACHE ─────────────── */

  function _cacheWaveConfig() {
    if (currentMap && currentMap.isDimension) {
      _currentWC = ChallengeDimension.buildWaveConfig(wave);
    } else {
      _currentWC = ChallengeScaling.getAdventureWaveConfig(wave, currentMap);
    }
  }

  /* ── PARAM GETTERS (use cached WC) ─── */

  function _getSpawnInterval() {
    const base    = _currentWC ? _currentWC.spawnInterval : 1800;
    const floored = ChallengeScaling.applyFloorSpawnInterval(base, wave);

    if (waveDuration <= 0) return floored;
    const progress = Math.min(1, waveElapsed / waveDuration);
    const accel    = CONFIG.adventure.spawnAccelPct || 0.30;
    const factor   = 1 - (progress * accel);
    let interval   = Math.max(500, Math.round(floored * factor));

    if (player && player.speedMultiplier < 1) {
      interval = Math.round(interval / player.speedMultiplier);
    }
    return interval;
  }

  function _getMaxAlive() {
    const base = _currentWC ? _currentWC.maxAlive : 4;
    return ChallengeScaling.applyFloorMaxAlive(base, wave);
  }

  function _getMinAlive() {
    return _currentWC ? (_currentWC.minAlive || 2) : 2;
  }

  function _getDirCooldown() {
    const base = (_currentWC && _currentWC.dirCooldown !== undefined)
      ? _currentWC.dirCooldown
      : (CONFIG.adventure.defaultDirCooldown || 800);
    return ChallengeScaling.applyFloorCooldown(base, wave);
  }

  /* ── CHOICE SCHEDULE ───────────────── */

  function _getChoiceInterval(w) {
    const schedule = CONFIG.challenge.choiceSchedule;
    for (const bracket of schedule) {
      if (bracket.untilWave === undefined || w <= bracket.untilWave) {
        return bracket.every;
      }
    }
    return schedule[schedule.length - 1].every;
  }

  function _isChoiceWave(w) {
    if (w <= 0) return false;
    return (w % _getChoiceInterval(w)) === 0;
  }

  function _getNextChoiceType() {
    const types = CONFIG.challenge.choiceTypes;
    return types[choiceCount % types.length];
  }

  /* ── MAP CHANGE CHECK ──────────────── */

  function _isMapChangeWave(w) {
    return w > 0 && (w % CONFIG.challenge.wavesPerMap) === 0;
  }

  /* ── BEST WAVE (localStorage) ──────── */

  function _loadBestWave() {
    try {
      const v = localStorage.getItem('ds_challenge_best');
      return v ? parseInt(v, 10) : 0;
    } catch (e) { return 0; }
  }

  function _saveBestWave(w) {
    try {
      localStorage.setItem('ds_challenge_best', String(w));
    } catch (e) { /* silent */ }
  }

  /* ═══════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════ */

  return {

    init() {
      wave          = 0;
      active        = false;
      currentMap    = null;
      mapsCompleted = 0;
      choiceCount   = 0;
      spawnTimer    = 0;
      waveElapsed   = 0;
      waveDuration  = 0;
      waveTimeLeft  = 0;
      draining      = false;
      drainPauseMs  = 0;
      _currentWC    = null;
      _dimBackupMap = null;
      _inputTimes   = [];
      bestWave      = _loadBestWave();

      ChallengePool.resetQueue();
      ChallengeDimension.reset();
      ChallengeTransition.reset();

      // pick first map
      currentMap = ChallengeTransition.pickNextMap(1);
      ChallengeTransition.pushHistory(currentMap.id);
      setArenaBackground(currentMap.background || null);
      resetAdventureSpawner();

      return true;
    },

    startFirstWave() {
      this._startWave(1);
      active = true;
    },

    stop() {
      active = false;
    },

    trackInput() { _trackInput(); },
    countChoice() { choiceCount++; },
    onDamage() {},
    onKill()   {},

    nextWave() {
      const nextW     = wave + 1;
      const nextInCyc = ChallengeScaling.getWaveInCycle(nextW);
      const isLastOfCycle = nextInCyc === CONFIG.challenge.wavesPerMap;

      // entering dimension (last wave of cycle)
      if (isLastOfCycle && !_dimBackupMap) {
        active = false;
        _dimBackupMap = currentMap;
        ChallengeDimension.initPool();
        const dimMap = ChallengeDimension.buildMap();
        const self   = this;

        ChallengeTransition.playChange(dimMap, () => {
          currentMap = dimMap;
          setArenaBackground(dimMap.background || null);
          resetAdventureSpawner();
        }).then(() => {
          self._startWave(nextW);
          active = true;
        });
        return;
      }

      // leaving dimension → map change
      if (_isMapChangeWave(wave)) {
        active = false;
        _dimBackupMap = null;
        this._changeMap();
        return;
      }

      if (_isChoiceWave(wave)) {
        active = false;
        const type = _getNextChoiceType();
        choiceCount++;
        if (typeof startChallengeChoice === 'function') {
          startChallengeChoice(type);
        }
        return;
      }

      this._startWave(wave + 1);
    },
   _startWave(newWave) {
      wave         = newWave;
      waveElapsed  = 0;
      spawnTimer   = 0;
      draining     = false;
      drainPauseMs = 0;
      ChallengePool.resetQueue();
      resetAdventureSpawner();

      _cacheWaveConfig();

      waveDuration = ChallengeScaling.calcWaveDuration(wave);
      waveTimeLeft = waveDuration;

      if (typeof updateWaveDisplay === 'function') {
        updateWaveDisplay(wave, false);
      }
    },

    _changeMap() {
      mapsCompleted++;
      const cycle  = ChallengeScaling.getCycle(wave + 1);
      const newMap = ChallengeTransition.pickNextMap(cycle);
      const self   = this;

      function onSwapBg() {
        currentMap = newMap;
        ChallengeTransition.pushHistory(newMap.id);
        setArenaBackground(newMap.background || null);
        resetAdventureSpawner();
      }

      ChallengeTransition.playChange(newMap, onSwapBg).then(() => {
        self._afterMapChange();
      });
    },

    _afterMapChange() {
      if (_isChoiceWave(wave)) {
        const type = _getNextChoiceType();
        choiceCount++;
        if (typeof startChallengeChoice === 'function') {
          startChallengeChoice(type);
        }
        return;
      }

      active = true;
      this._startWave(wave + 1);
    },

    onGameOver() {
      active = false;
      if (wave > bestWave) {
        bestWave = wave;
        _saveBestWave(wave);
      }
    },

    tick(dt) {
  if (!active) return;

  // ── GATE CLEANUP ──────────────────
  // Purge dead enemies from gate tracking
  // every tick to prevent ghost buildup
  for (const dir of ['up', 'down', 'left', 'right']) {
    const list = dirGateEnemies[dir];
    for (let i = list.length - 1; i >= 0; i--) {
      const e = list[i];
      if (!e.isAlive() || !enemies.includes(e)) {
        list.splice(i, 1);
      }
    }
  }

  ChallengePool.tickQueue(dt);

      if (typeof OrbSystem !== 'undefined') OrbSystem.tick(dt);

      // draining
      if (draining) {
        if (enemies.length === 0 && bullets.length === 0) {
          drainPauseMs -= dt;
          if (drainPauseMs <= 0) {
            draining = false;
            this.nextWave();
          }
        }
        return;
      }

      // wave timer
      waveElapsed  += dt;
      waveTimeLeft -= dt;
      if (waveTimeLeft <= 0) {
        waveTimeLeft = 0;
        draining     = true;
        drainPauseMs = 500;
        return;
      }

      // ── SPAWN LOGIC ──
      const minAlive = _getMinAlive();
      const combos   = ChallengePool.getCombos(_currentWC);
      const ctx      = {
        waveConfig:  _currentWC,
        currentMap:  currentMap,
        maxAlive:    _getMaxAlive(),
        dirCooldown: _getDirCooldown(),
      };

      // anti-idle
      if (enemies.length < minAlive) {
        const inputRate = _getInputRate();

        if (combos) {
          const spawned = ChallengePool.executeCombo('single', ctx);
          if (!spawned) { spawnTimer = 150; return; }
        } else {
          const dir = pickDirAdventure();
          if (dir) {
            const pool = ChallengePool.buildPool(_currentWC, currentMap);
            spawnEnemyDirected(EnemyRegistry.get(pool[0]), dir);
          }
        }

        const idleThreshold = CONFIG.adventure.inputIdleThreshold || 1;
        spawnTimer = (_getInputRate() <= idleThreshold)
          ? (CONFIG.adventure.inputIdleSpawnMs || 600)
          : 400;
        return;
      }

      // standard spawn cycle
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        const interval = _getSpawnInterval();

        if (combos) {
          const pattern = ChallengePool.pickCombo(combos);
          const spawned = ChallengePool.executeCombo(pattern, ctx);
          spawnTimer = spawned ? interval : Math.min(interval, 300);
        } else {
          const dir = pickDirAdventure();
          if (dir) {
            const pool = ChallengePool.buildPool(_currentWC, currentMap);
            spawnEnemyDirected(EnemyRegistry.get(pool[0]), dir);
          }
          spawnTimer = interval;
        }
      }
    },

    /* ── GETTERS ──────────────────────── */
    getWave()          { return wave; },
    getMaxWave()       { return Infinity; },
    getStress()        { return 0; },
    getTarget()        { return 0; },
    isBoss()           { return false; },
    getKills()         { return 0; },
    getKillsNeeded()   { return 0; },
    getCurrentMap()    { return currentMap; },
    isCompleted()      { return false; },
    isBossPaused()     { return false; },
    getWaveTimeLeft()  { return waveTimeLeft; },
    getWaveDuration()  { return waveDuration; },
    getBestWave()      { return bestWave; },
    getChoiceCount()   { return choiceCount; },
    getMapsCompleted() { return mapsCompleted; },
    isDimensionMap()   { return currentMap && currentMap.isDimension; },

    resumeAfterChoice() {
      active = true;
      this._startWave(wave + 1);
    },

    restart() {
      return this.init();
    },

    restartCurrentWave() {
      this._startWave(wave);
      active = true;
    },

    /* ── DEBUG ────────────────────────── */
    _debug() {
      return {
        wave,
        active,
        draining,
        cycle:          ChallengeScaling.getCycle(wave),
        waveInCycle:    ChallengeScaling.getWaveInCycle(wave),
        tier:           ChallengeScaling.getTierName(wave),
        floorMult:      ChallengeScaling.getFloorMult(wave),
        waveDuration,
        waveTimeLeft,
        waveElapsed,
        spawnTimer,
        currentMap:     currentMap ? currentMap.id : null,
        isDimension:    currentMap ? !!currentMap.isDimension : false,
        mapsCompleted,
        choiceCount,
        nextChoiceType: _getNextChoiceType(),
        choiceInterval: _getChoiceInterval(wave),
        isChoiceWave:   _isChoiceWave(wave),
        spawnInterval:  _getSpawnInterval(),
        maxAlive:       _getMaxAlive(),
        minAlive:       _getMinAlive(),
        dirCooldown:    _getDirCooldown(),
        bestWave,
        pool:           ChallengePool.buildPool(_currentWC, currentMap),
        combos:         ChallengePool.getCombos(_currentWC),
        dimPool:        ChallengeDimension.getPool().map(
                          d => d.name + ' (' + d.cls + ')'
                        ),
        staggerQueue:   ChallengePool.queueLength(),
        cachedWC:       _currentWC,
      };
    },

    debugSkipTimer() {
      if (!active || draining) return;
      if (waveTimeLeft > 10000) {
        waveElapsed  = waveDuration - 10000;
        waveTimeLeft = 10000;
      }
    },
  };

})();

/* === js/modes/challenge/challengeUpgradeChoice.js === */
/* ═══════════════════════════════════════
   CHALLENGEUPGRADECHOICE.JS
   Challenge Mode choice screen.
   Two types:
   - 'ability' = 4 random abilities, must pick one
   - 'stat'    = normal upgrade cards (reuses UPGRADE_CHAINS)

   Reuses the same #upgrade-choice overlay as adventure.
   Calls ChallengeDirector.resumeAfterChoice() on done.

   Used by: challengeDirector.js
   Depends on: upgradeChoice.js (UPGRADE_CHAINS, _pickedTiers),
               AbilityRegistry, dom.js, state.js, Player.js
   ═══════════════════════════════════════ */

let _challengeChoiceType   = null;   // 'ability' or 'stat'
let _challengeChoiceActive = false;
let _challengeAbilityPicks = [null, null, null, null];
let _challengeInputBlocked = false;
let _challengeCountdown    = false;
let _isFirstAbilityChoice  = false;

/* ── START CHALLENGE CHOICE ─────────── */

function startChallengeChoice(type) {
  _challengeChoiceType   = type;
  _challengeChoiceActive = true;
  _challengeCountdown    = false;

  // cleanup active ability + orbs
  if (typeof cleanupAbilityEffects === 'function') cleanupAbilityEffects();
  if (typeof OrbSystem !== 'undefined') OrbSystem.reset();

  if (type === 'ability') {
    _buildAbilityChoice();
  } else {
    _buildStatChoice();
  }
}

/* ── ABILITY CHOICE ─────────────────── */

function _buildAbilityChoice() {
  const allAbilities = AbilityRegistry.all();

  // exclude currently equipped ability so player always switches
  const currentId = player.ability ? player.ability.id : null;
  const available = allAbilities.filter(a => a.id !== currentId);

  const shuffled = available.sort(() => Math.random() - 0.5);
  const picks    = shuffled.slice(0, 4);

  // pad if less than 4 (only possible if fewer than 4 abilities exist)
  while (picks.length < 4 && available.length > 0) {
    picks.push(available[Math.floor(Math.random() * available.length)]);
  }

  const dirs     = ['up', 'down', 'left', 'right'];
  const keyHints = { up: '↑', down: '↓', left: '←', right: '→' };

  for (let i = 0; i < 4; i++) {
    _challengeAbilityPicks[i] = picks[i];
    const el = document.getElementById('upgrade-' + dirs[i]);

    const a = picks[i];
    const iconSrc = 'assets/abilities/' + a.id + '.png';

    el.innerHTML =
      '<div class="upgrade-card challenge-ability-card">' +
        '<div class="upgrade-card-icon"><img src="' + iconSrc + '" alt="' + a.id + '" style="width:48px;height:48px;image-rendering:pixelated;"></div>' +
        '<div class="upgrade-card-name" style="color:#51eefc">' + (a.name || a.id) + '</div>' +
        '<div class="upgrade-card-desc">' + (a.desc || '') + '</div>' +
        '<div class="upgrade-card-key">' + keyHints[dirs[i]] + '</div>' +
      '</div>';

    el.style.animationDelay = (i * 80) + 'ms';
  }

  _showChallengeOverlay();
}

/* ── STAT CHOICE (reuses UPGRADE_CHAINS) ── */

function _buildStatChoice() {
  // reuse adventure pool builder
  const pool = _buildAvailablePool();

  // if no upgrades left, skip directly to next wave
  if (pool.length === 0) {
    _challengeChoiceActive = false;
    _challengeChoiceType   = null;
    ChallengeDirector.resumeAfterChoice();
    return;
  }

  const shuffled = pool.sort(() => Math.random() - 0.5);
  const picks    = shuffled.slice(0, 4);

  while (picks.length < 4 && pool.length > 0) {
    picks.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  const resolved = picks.map(p => {
    const tier = p.chain.tiers[p.tierIndex];
    return {
      chainId:   p.chain.id,
      tierIndex: p.tierIndex,
      icon:      p.chain.icon,
      name:      tier.name,
      desc:      tier.desc,
      apply:     tier.apply,
    };
  });

  const dirs     = ['up', 'down', 'left', 'right'];
  const keyHints = { up: '↑', down: '↓', left: '←', right: '→' };

  // store in the same array used by adventure upgradeChoice
  for (let i = 0; i < 4; i++) {
    _currentChoices[i] = resolved[i] || null;
    const el = document.getElementById('upgrade-' + dirs[i]);

    if (!resolved[i]) {
      el.innerHTML = '';
      continue;
    }

    const r = resolved[i];
    const tierColors = ['#ffffff', '#ffdd44', '#ff8844'];
    const tierColor  = tierColors[r.tierIndex] || '#ffffff';

    el.innerHTML =
      '<div class="upgrade-card">' +
        '<div class="upgrade-card-icon">' + r.icon + '</div>' +
        '<div class="upgrade-card-name" style="color:' + tierColor + '">' + r.name + '</div>' +
        '<div class="upgrade-card-desc">' + r.desc + '</div>' +
        '<div class="upgrade-card-key">' + keyHints[dirs[i]] + '</div>' +
      '</div>';

    el.style.animationDelay = (i * 80) + 'ms';
  }

  _showChallengeOverlay();
}

/* ── SHOW OVERLAY ───────────────────── */

function _showChallengeOverlay() {
  const overlay = document.getElementById('upgrade-choice');
  overlay.classList.add('active');

  // title
  let titleEl = document.getElementById('upgrade-title');
  if (!titleEl) {
    titleEl = document.createElement('div');
    titleEl.id = 'upgrade-title';
    overlay.appendChild(titleEl);
  }

  const waveNum = ChallengeDirector.getWave();

  if (_challengeChoiceType === 'ability' && waveNum === 0) {
    // first ability choice — before wave 1
    titleEl.innerHTML =
      '<div class="upgrade-title-wave">CHALLENGE MODE</div>' +
      '<div class="upgrade-title-sub">CHOOSE YOUR ABILITY</div>';
  } else if (_challengeChoiceType === 'ability') {
    titleEl.innerHTML =
      '<div class="upgrade-title-wave">WAVE ' + waveNum + ' COMPLETE</div>' +
      '<div class="upgrade-title-sub">SWITCH ABILITY</div>';
  } else {
    titleEl.innerHTML =
      '<div class="upgrade-title-wave">WAVE ' + waveNum + ' COMPLETE</div>' +
      '<div class="upgrade-title-sub">CHOOSE YOUR UPGRADE</div>';
  }

  titleEl.style.opacity   = '0';
  titleEl.style.animation = 'upgradeTitleIn 0.6s ease-out forwards';

// arrow hint — always recreate in arena (same as adventure mode)
  let hintEl = document.getElementById('upgrade-arrow-hint');
  if (hintEl) hintEl.remove();
  hintEl = document.createElement('div');
  hintEl.id = 'upgrade-arrow-hint';
  hintEl.innerHTML =
    '<img src="assets/ui/keyboard_arrows.png" alt="" class="upgrade-hint-img" />' +
    '<div class="upgrade-hint-text">use arrows to select</div>';
  arena.appendChild(hintEl);

  // block input for 1.5s, hide hint until ready
  _challengeInputBlocked = true;
  hintEl.style.opacity = '0';
  hintEl.style.animation = 'none';
  setTimeout(() => {
    _challengeInputBlocked = false;
    const h = document.getElementById('upgrade-arrow-hint');
    if (h) {
      h.style.opacity = '';
      h.style.animation = '';
    }
  }, 1500);
}

/* ── SELECT (called from combat.js handleDir) ── */

function selectChallengeUpgrade(dir) {
  if (!_challengeChoiceActive || _challengeCountdown || _challengeInputBlocked) return false;

  const dirIndex = { up: 0, down: 1, left: 2, right: 3 };
  const idx      = dirIndex[dir];

  if (_challengeChoiceType === 'ability') {
    return _selectAbility(dir, idx);
  } else {
    return _selectStat(dir, idx);
  }
}

/* ── SELECT ABILITY ─────────────────── */

function _selectAbility(dir, idx) {
  const ability = _challengeAbilityPicks[idx];
  if (!ability) return false;

  // equip chosen ability
  player.ability = ability;
  equippedAbilityId = ability.id;

  SFX.cardPick();
  _highlightChosen(dir);

  _challengeCountdown    = true;
  _challengeChoiceActive = false;

  _showCountdown(3, () => {
    _cleanupOverlay();

    if (_isFirstAbilityChoice) {
      // first choice done — count it so next choice is 'stat'
      _isFirstAbilityChoice = false;
      ChallengeDirector.countChoice();
      ChallengeDirector.startFirstWave();
    } else {
      ChallengeDirector.resumeAfterChoice();
    }
  });

  return true;
}

/* ── SELECT STAT ────────────────────── */

function _selectStat(dir, idx) {
  const choice = _currentChoices[idx];
  if (!choice) return false;

  choice.apply(player);
  _pickedTiers[choice.chainId] = choice.tierIndex;

  SFX.cardPick();
  _highlightChosen(dir);

  _challengeCountdown    = true;
  _challengeChoiceActive = false;

  _showCountdown(3, () => {
    _cleanupOverlay();
    ChallengeDirector.resumeAfterChoice();
  });

  return true;
}

/* ── HIGHLIGHT + FADE ───────────────── */

function _highlightChosen(dir) {
  const dirs = ['up', 'down', 'left', 'right'];
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById('upgrade-' + dirs[i]);
    if (dirs[i] === dir) {
      el.classList.add('upgrade-chosen');
    } else {
      el.classList.add('upgrade-faded');
    }
  }
 const hintEl = document.getElementById('upgrade-arrow-hint');
if (hintEl) hintEl.remove();
}

/* ── CLEANUP OVERLAY ────────────────── */

function _cleanupOverlay() {
  document.getElementById('upgrade-choice').classList.remove('active');

  const titleEl = document.getElementById('upgrade-title');
  if (titleEl) titleEl.style.animation = '';

  const dirs = ['up', 'down', 'left', 'right'];
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById('upgrade-' + dirs[i]);
    el.classList.remove('upgrade-chosen', 'upgrade-faded');
    el.style.opacity        = '';
    el.style.animationDelay = '';
  }

  const hintEl = document.getElementById('upgrade-arrow-hint');
  if (hintEl) hintEl.style.opacity = '';

  _challengeCountdown = false;
}

/* ── RESET ──────────────────────────── */

function resetChallengeChoices() {
  _challengeChoiceType   = null;
  _challengeChoiceActive = false;
  _challengeAbilityPicks = [null, null, null, null];
  _challengeInputBlocked = false;
  _challengeCountdown    = false;
  _isFirstAbilityChoice  = false;
  document.getElementById('upgrade-choice').classList.remove('active');
  const hintEl = document.getElementById('upgrade-arrow-hint');
  if (hintEl) hintEl.remove();
}

/* ── QUERY (used by combat.js) ──────── */

function isChoosingChallengeUpgrade() {
  return _challengeChoiceActive;
}

/* === js/modes/challenge/challengeScreen.js === */
/* ═══════════════════════════════════════
   CHALLENGESCREEN.JS
   Builds the challenge pre-game screen.
   Shows map13_dark card, best wave record,
   and static dark dimension background.

   Used by: input.js
   Depends on: ChallengeDirector
   ═══════════════════════════════════════ */

const CHALLENGE_BG = 'assets/maps/map13_dark/background_01.webp';

function buildChallengeScreen() {
  // set card background
  const card = document.getElementById('challenge-card');
  if (card) {
    card.style.backgroundImage = `url('${CHALLENGE_BG}')`;
  }

  // set demo background — static, no DemoMode
  const demo = document.getElementById('challenge-demo');
  if (demo) {
    demo.style.backgroundImage = `url('${CHALLENGE_BG}')`;
  }

  // best wave record
  const bestEl = document.getElementById('challenge-best');
  if (bestEl) {
    const best = ChallengeDirector.getBestWave();
    bestEl.textContent = best > 0 ? 'BEST: WAVE ' + best : '';
  }
}

/* === js/modes/challenge/challengeScaling.js === */
/* ═══════════════════════════════════════
   CHALLENGESCALING.JS
   Wave duration calc, floor scaling,
   tier mapping for challenge mode.

   Used by: challengeDirector.js
   Depends on: config.js
   ═══════════════════════════════════════ */

const ChallengeScaling = (() => {

  /* ── CYCLE HELPERS ─────────────────── */

  function getCycle(wave) {
    return Math.floor((wave - 1) / CONFIG.challenge.wavesPerMap) + 1;
  }

  function getWaveInCycle(wave) {
    return ((wave - 1) % CONFIG.challenge.wavesPerMap) + 1;
  }

  /* ── WAVE DURATION ─────────────────── */

  function calcWaveDuration(w) {
    const c = CONFIG.challenge.waveDuration;
    let duration = c.base;
    for (let i = 1; i < w; i++) {
      let inc = c.incrementPerWave;
      if (i >= c.slowdownAfterWave) inc *= c.slowdownFactor;
      duration += inc;
    }
    return Math.min(c.cap, Math.round(duration * 10) / 10) * 1000;
  }

  /* ── FLOOR SCALING ─────────────────── */

  function getFloorMult(_wave) {
    return 0; // floor scaling disabled — speed scales every 5 waves in spawn.js
}

  function applyFloorSpawnInterval(spawnInterval, wave) {
    const floor = getFloorMult(wave);
    const scale = CONFIG.challenge.floorScaling;
    const mult  = 1 - (floor * scale.spawnIntervalMult);
    return Math.max(600, Math.round(spawnInterval * mult));
  }

  function applyFloorCooldown(cd, wave) {
    const floor = getFloorMult(wave);
    const scale = CONFIG.challenge.floorScaling;
    const mult  = 1 - (floor * scale.dirCooldownMult);
    return Math.max(400, Math.round(cd * mult));
  }

  function applyFloorMaxAlive(ma, wave) {
    const floor = getFloorMult(wave);
    const scale = CONFIG.challenge.floorScaling;
    return Math.min(10, ma + Math.floor(floor * scale.maxAlivePlus));
  }

  /* ── TIER LOOKUP ───────────────────── */

  function getTierName(wave) {
    const waveInCyc = getWaveInCycle(wave);
    return CONFIG.challenge.waveTiers[waveInCyc] || 'medium';
  }

  function getAdventureWaveConfig(wave, currentMap) {
    if (!currentMap || !currentMap.waveConfig) return null;

    const c    = CONFIG.challenge;
    const tier = getTierName(wave);

    // per-map tier ranges
    const mapRanges = c.mapTierRanges[currentMap.id];
    let range;
    if (mapRanges && mapRanges[tier]) {
      range = mapRanges[tier];
    } else if (mapRanges) {
      range = mapRanges.hard || mapRanges.medium || [5, 6];
    } else {
      range = [5, 6];
    }

    const minW    = range[0];
    const maxW    = range[1];
    const advWave = minW + Math.floor(Math.random() * (maxW - minW + 1));

    const wc = currentMap.waveConfig[advWave];
    if (!wc) return null;

    // use map's enemyPool, NOT waveConfig pool
    // only take spawn parameters from waveConfig
    const mapPool = {};
    if (currentMap.enemyPool) {
      for (const [name, cfg] of Object.entries(currentMap.enemyPool)) {
        mapPool[name] = cfg.weight || 1;
      }
    }

    return {
      pool:          mapPool,
      spawnInterval: wc.spawnInterval,
      maxAlive:      wc.maxAlive,
      minAlive:      wc.minAlive,
      combos:        wc.combos,
      dirCooldown:   wc.dirCooldown,
    };
  }

  /* ── PUBLIC API ────────────────────── */

  return {
    getCycle,
    getWaveInCycle,
    calcWaveDuration,
    getFloorMult,
    applyFloorSpawnInterval,
    applyFloorCooldown,
    applyFloorMaxAlive,
    getTierName,
    getAdventureWaveConfig,
  };

})();

/* === js/modes/challenge/challengePool.js === */
/* ═══════════════════════════════════════
   CHALLENGEPOOL.JS
   Pool building, enemy picking, combo
   system with stagger queue.

   Used by: challengeDirector.js
   Depends on: config.js, EnemyRegistry,
               adventureSpawner.js (gate),
               ChallengeScaling
   ═══════════════════════════════════════ */

const ChallengePool = (() => {

  /* ── STAGGER QUEUE ─────────────────── */
  let _staggerQueue = [];

  function resetQueue() {
    _staggerQueue = [];
  }

  function tickQueue(dt) {
    for (let i = _staggerQueue.length - 1; i >= 0; i--) {
      _staggerQueue[i].delay -= dt;
      if (_staggerQueue[i].delay <= 0) {
        const item = _staggerQueue[i];
        _staggerQueue.splice(i, 1);
        if (enemies.length >= item.maxAlive) continue;
        _doSpawn(item.dir, item.pool, item.dirCooldown);
      }
    }
  }

  function queueLength() {
    return _staggerQueue.length;
  }

  /* ── BUILD POOL ────────────────────── */

  function buildPool(waveConfig, currentMap) {
    if (waveConfig && waveConfig.pool) {
      const pool = [];
      for (const [name, weight] of Object.entries(waveConfig.pool)) {
        for (let i = 0; i < weight; i++) pool.push(name);
      }
      return pool;
    }
    if (currentMap && currentMap.enemyPool) {
      const pool = [];
      for (const [name, cfg] of Object.entries(currentMap.enemyPool)) {
        const w = cfg.weight || 1;
        for (let i = 0; i < w; i++) pool.push(name);
      }
      return pool;
    }
    return ['ravager'];
  }

  /* ── PICK FROM POOL ────────────────── */

  function pickFromPool(pool, currentMap) {
    if (pool.length === 0) return null;
    const fieldCounts = {};
    for (const e of enemies) {
      fieldCounts[e.name] = (fieldCounts[e.name] || 0) + 1;
    }

    let available = pool;
    if (currentMap && currentMap.maxInField) {
      available = pool.filter(name => {
        const cap = currentMap.maxInField[name];
        if (cap === undefined) return true;
        return (fieldCounts[name] || 0) < cap;
      });
    }
    if (available.length === 0) return null;
    const name = available[Math.floor(Math.random() * available.length)];
    return EnemyRegistry.get(name);
  }

  /* ── SPAWN HELPERS ─────────────────── */

  function _doSpawn(dir, pool, dirCooldown, currentMap) {
    const def = pickFromPool(pool, currentMap);
    if (!def) return false;
    spawnEnemyDirected(def, dir);
    registerSpawnedEnemy(dir);
    setDirCooldown(dir, dirCooldown);
    return true;
  }

  function _queueSpawn(dir, pool, delayMs, maxAlive, dirCooldown) {
    _staggerQueue.push({
      dir, pool, delay: delayMs, maxAlive, dirCooldown,
    });
  }

  /* ── COMBO HELPERS ─────────────────── */

  function getCombos(waveConfig) {
    if (waveConfig && waveConfig.combos) return waveConfig.combos;
    return null;
  }

  function pickCombo(combos) {
    const entries = Object.entries(combos);
    let total = 0;
    for (const [, val] of entries) {
      total += (typeof val === 'object') ? val.weight : val;
    }
    if (total <= 0) return 'single';
    let roll = Math.random() * total;
    for (const [pattern, val] of entries) {
      const w = (typeof val === 'object') ? val.weight : val;
      roll -= w;
      if (roll <= 0) return pattern;
    }
    return entries[0][0];
  }

  function _getStagger(pattern, waveConfig) {
    if (waveConfig && waveConfig.combos && waveConfig.combos[pattern]) {
      const val = waveConfig.combos[pattern];
      if (typeof val === 'object' && val.stagger !== undefined) {
        return val.stagger;
      }
    }
    const defaults = CONFIG.adventure.comboStagger || {};
    if (defaults[pattern] !== undefined) return defaults[pattern];
    return 400;
  }

  /* ── EXECUTE COMBO ─────────────────── */

  function executeCombo(pattern, ctx) {
    const { waveConfig, currentMap, maxAlive, dirCooldown } = ctx;
    const pool = buildPool(waveConfig, currentMap);
    if (pool.length === 0) return false;

    const qCount = _staggerQueue.length;
    if (enemies.length >= maxAlive + 1) return false;
    if (enemies.length >= maxAlive && qCount > 0) return false;

    const stagger = _getStagger(pattern, waveConfig);

    if (pattern === 'single') {
      const dir = pickDirAdventure();
      if (!dir) return false;
      return _doSpawn(dir, pool, dirCooldown, currentMap);
    }

    if (pattern === 'pair_opposite') {
      const dirs = pickDirOpposite();
      if (!dirs) return executeCombo('single', ctx);
      _doSpawn(dirs[0], pool, dirCooldown, currentMap);
      _queueSpawn(dirs[1], pool, stagger, maxAlive, dirCooldown);
      return true;
    }

    if (pattern === 'pair_adjacent') {
      const dirs = pickDirAdjacent();
      if (!dirs) return executeCombo('single', ctx);
      _doSpawn(dirs[0], pool, dirCooldown, currentMap);
      _queueSpawn(dirs[1], pool, stagger, maxAlive, dirCooldown);
      return true;
    }

    if (pattern === 'burst_single') {
      const dir = pickDirAdventure();
      if (!dir) return false;
      _doSpawn(dir, pool, dirCooldown, currentMap);
      _queueSpawn(dir, pool, stagger, maxAlive, dirCooldown);
      return true;
    }

    if (pattern === 'triple') {
      const dirs = pickDir3();
      if (!dirs) return executeCombo('pair_opposite', ctx);
      _doSpawn(dirs[0], pool, dirCooldown, currentMap);
      _queueSpawn(dirs[1], pool, stagger, maxAlive, dirCooldown);
      _queueSpawn(dirs[2], pool, stagger * 2, maxAlive, dirCooldown);
      return true;
    }

    if (pattern === 'rush') {
      const dir = pickDirAdventure();
      if (!dir) return false;
      _doSpawn(dir, pool, dirCooldown, currentMap);
      _queueSpawn(dir, pool, stagger, maxAlive, dirCooldown);
      _queueSpawn(dir, pool, stagger * 2, maxAlive, dirCooldown);
      return true;
    }

    if (pattern === 'surround') {
      const dirs = pickDirAll();
      if (!dirs) return executeCombo('triple', ctx);
      _doSpawn(dirs[0], pool, dirCooldown, currentMap);
      _queueSpawn(dirs[1], pool, stagger, maxAlive, dirCooldown);
      _queueSpawn(dirs[2], pool, stagger * 2, maxAlive, dirCooldown);
      _queueSpawn(dirs[3], pool, stagger * 3, maxAlive, dirCooldown);
      return true;
    }

    return executeCombo('single', ctx);
  }

  /* ── PUBLIC API ────────────────────── */

  return {
    resetQueue,
    tickQueue,
    queueLength,
    buildPool,
    pickFromPool,
    getCombos,
    pickCombo,
    executeCombo,
  };

})();

/* === js/modes/challenge/challengeTransition.js === */
/* ═══════════════════════════════════════
   CHALLENGETRANSITION.JS
   Map rotation, picking, change animation
   and history for challenge mode.

   Used by: challengeDirector.js
   Depends on: config.js, MapRegistry,
               ChallengeDimension
   ═══════════════════════════════════════ */

const ChallengeTransition = (() => {

  let mapHistory = [];
  let _recentPool = []; // tracks unplayed maps in current rotation

  function reset() {
    mapHistory = [];
    _recentPool = [];
  }

  function getHistory() {
    return mapHistory.slice();
  }

  function pushHistory(mapId) {
    mapHistory.push(mapId);
    // remove from recent pool
    const idx = _recentPool.indexOf(mapId);
    if (idx !== -1) _recentPool.splice(idx, 1);
  }

  /* ── MAP PICKING ───────────────────── */

  function pickNextMap(_cycle) {
    const allMaps = CONFIG.challenge.mapRotation.allMaps;

    // if pool is empty, refill with all maps
    if (_recentPool.length === 0) {
      _recentPool = allMaps.slice();
    }

    // pick random from remaining pool
    const idx   = Math.floor(Math.random() * _recentPool.length);
    const mapId = _recentPool[idx];
    return MapRegistry.get(mapId);
  }

  /* ── MAP CHANGE ANIMATION ──────────── */

  function playChange(newMap, onSwapBg) {
    const colors = CONFIG.challenge.mapColors;
    const isDim  = !!newMap.isDimension;
    const mapId  = newMap.id;

    const themeColor = colors[mapId] ? colors[mapId][0] : '#ffffff';
    const themeDark  = colors[mapId] ? colors[mapId][1] : '#888888';
    const displayName = (newMap.name || mapId).toUpperCase();

    if (isDim) {
      return MapTransition.playDimension(onSwapBg);
    } else {
      return MapTransition.playNormal(
        displayName, themeColor, themeDark, onSwapBg
      );
    }
  }

  return {
    reset,
    getHistory,
    pushHistory,
    pickNextMap,
    playChange,
  };

})();

/* === js/modes/challenge/challengeDimension.js === */
/* ═══════════════════════════════════════
   CHALLENGEDIMENSION.JS
   Dimension map: mixed enemies from all
   maps using class system.

   Used by: challengeDirector.js
   Depends on: config.js, ChallengeScaling
   ═══════════════════════════════════════ */

const ChallengeDimension = (() => {

  let _dimPool    = [];
let _dimClasses = [];
let _dimWeights = {};

  function reset() {
    _dimPool    = [];
    _dimClasses = [];
    _dimWeights = {};
}

  function buildMap() {
    return {
      id:          'dimension',
      name:        'Dimension',
      background:  'assets/maps/map13_dark/background_01.webp',
      enemyPool:   {},
      isDimension: true,
    };
  }

  function initPool() {
    const classes    = CONFIG.challenge.enemyClasses;
    const classNames = Object.keys(classes);
    // shuffle
    for (let i = classNames.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [classNames[i], classNames[j]] = [classNames[j], classNames[i]];
    }
    // pick 4 classes, 1 enemy each
    _dimClasses = classNames.slice(0, 5);
    _dimPool    = [];
    for (const cls of _dimClasses) {
      const members = classes[cls];
      const pick    = members[Math.floor(Math.random() * members.length)];
      _dimPool.push({ name: pick, cls: cls });
    }

    // dynamic weights: picked enemies lose weight, others gain
    const allEnemies = [];
    for (const cls of Object.values(classes)) {
      for (const e of cls) allEnemies.push(e);
    }
    for (const e of allEnemies) {
      if (_dimPool.some(p => p.name === e)) {
        _dimWeights[e] = (_dimWeights[e] || 3) * 0.5;
      } else {
        _dimWeights[e] = Math.min(6, (_dimWeights[e] || 3) * 1.3);
      }
    }
  }

  function rotatePool() {
    const classes    = CONFIG.challenge.enemyClasses;
    const allClasses = Object.keys(classes);
    const replaceIdx = Math.floor(Math.random() * _dimPool.length);
    const oldCls     = _dimPool[replaceIdx].cls;

    let available = allClasses.filter(c =>
      !_dimClasses.includes(c) || c === oldCls
    );
    if (available.length === 0) {
      available = allClasses.filter(c => c !== oldCls);
    }
    const newCls   = available[Math.floor(Math.random() * available.length)];
    const members  = classes[newCls];
    const newEnemy = members[Math.floor(Math.random() * members.length)];

    _dimClasses[replaceIdx] = newCls;
    _dimPool[replaceIdx]    = { name: newEnemy, cls: newCls };
  }

  function buildWaveConfig(wave) {
    // pool with dynamic weights — used enemies lose weight
const pool = {};
for (const entry of _dimPool) {
    const w = _dimWeights[entry.name] || 3;
    pool[entry.name] = Math.max(1, w);
}
   // dynamic tier based on wave progression
const tiers = CONFIG.challenge.dimensionTiers;
let tierName = 'hard';
for (const bracket of tiers) {
    if (bracket.untilWave === undefined || wave <= bracket.untilWave) {
        tierName = bracket.tier;
        break;
    }
}

    let combos, dirCooldown, spawnInterval, maxAlive, minAlive;

    if (tierName === 'easy') {
      combos        = { single: 6, pair_opposite: 2, burst_single: 1 };
      dirCooldown   = 1200;
      spawnInterval = 2200;
      maxAlive      = 3;
      minAlive      = 1;
    } else if (tierName === 'medium') {
      combos = {
        single: 5,
        pair_opposite: { weight: 3, stagger: 800 },
        pair_adjacent: { weight: 2, stagger: 750 },
        burst_single: 1,
      };
      dirCooldown   = 1100;
      spawnInterval = 2000;
      maxAlive      = 3;
      minAlive      = 1;
    } else if (tierName === 'hard') {
      combos = {
        single: 3,
        pair_opposite: { weight: 3, stagger: 800 },
        pair_adjacent: { weight: 2, stagger: 750 },
        burst_single: 2,
        triple: { weight: 1, stagger: 850 },
      };
      dirCooldown   = 900;
      spawnInterval = 1600;
      maxAlive      = 4;
      minAlive      = 2;
    } else { // peak
      combos = {
        single: 2,
        pair_opposite: { weight: 3, stagger: 850 },
        burst_single: 2,
        triple: { weight: 2, stagger: 900 },
        rush: { weight: 1, stagger: 750 },
      };
      dirCooldown   = 800;
      spawnInterval = 1500;
      maxAlive      = 4;
      minAlive      = 2;
    }

    return { pool, combos, dirCooldown, spawnInterval, maxAlive, minAlive };
  }

  function getPool() {
    return _dimPool.slice();
  }

  return {
    reset,
    buildMap,
    initPool,
    rotatePool,
    buildWaveConfig,
    getPool,
  };

})();

/* === js/modes/adventure/MapRegistry.js === */
/* ═══════════════════════════════════════
   MAPREGISTRY.JS
   Central registry for Adventure Mode maps.
   Each map file calls MapRegistry.register()
   to add itself.

   Used by: modes/adventure/mapSelect.js,
            modes/adventure/adventureDirector.js
   Depends on: nothing
   ═══════════════════════════════════════ */

const MapRegistry = (() => {

  const _maps = {};

  return {

    /* ── REGISTER ───────────────────────
       Called by each map file.
       @param def  map definition object
    ─────────────────────────────────────── */
    register(def) {
      if (_maps[def.id]) {
        console.warn(`MapRegistry: "${def.id}" already registered.`);
        return;
      }
      _maps[def.id] = def;
    },

    /* ── GET ────────────────────────────
       @param id  map id string
       @return    map definition or null
    ─────────────────────────────────────── */
    get(id) {
      return _maps[id] || null;
    },

    /* ── ALL ────────────────────────────
       Returns all registered maps as an
       array, sorted by order field.
    ─────────────────────────────────────── */
    all() {
      return Object.values(_maps)
        .sort((a, b) => a.order - b.order);
    },

  };

})();

/* === js/modes/adventure/progress.js === */
/* ═══════════════════════════════════════
   PROGRESS.JS
   Adventure Mode progression — saved in
   localStorage.

   Tracks:
   - which maps have been completed
   - which abilities have been unlocked
   - menu slot video counter

   A map is UNLOCKED if:
   - devUnlockAll is true, or
   - it's the first map (order === 1), or
   - the previous map (by order) is completed

   An ability is UNLOCKED if:
   - devUnlockAll is true, or
   - it's the default ability, or
   - it was unlocked via slot machine

   Used by: mapSelect.js, adventureDirector.js,
            ui/abilityScreen.js
   Depends on: CONFIG, MapRegistry
   ═══════════════════════════════════════ */

const Progress = (() => {

  const KEY_MAPS         = 'ds_adv_maps_completed';
  const KEY_ABILITIES    = 'ds_adv_abilities_unlocked';
  const KEY_MENU_VIDEOS  = 'ds_menu_videos_used';
  const KEY_SLOTS_GIVEN  = 'ds_slots_given';
  const KEY_BEST_WAVE = 'ds_best_wave_';

  /* ── INTERNAL STORAGE ──────────────── */

  function _load(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch(e) {
      return [];
    }
  }

  function _save(key, arr) {
    try {
      localStorage.setItem(key, JSON.stringify(arr));
    } catch(e) {}
  }

  function _loadInt(key) {
    try {
      return parseInt(localStorage.getItem(key)) || 0;
    } catch(e) {
      return 0;
    }
  }

  function _saveInt(key, val) {
    try {
      localStorage.setItem(key, String(val));
    } catch(e) {}
  }

  /* ── SLOT ROLL LOGIC ───────────────── */

  function _getWeightedPool() {
    const locked = Progress.getLockedAbilities();
    if (locked.length === 0) return [];

    const rarities = CONFIG.abilities.rarities;
    const weights  = CONFIG.abilities.weights;

    return locked.map(id => ({
      id,
      weight: weights[rarities[id]] || 0,
    }));
  }

  function _pickFromPool(pool) {
    if (pool.length === 0) return null;

    const totalWeight = pool.reduce((sum, e) => sum + e.weight, 0);
    if (totalWeight <= 0) return null;

    let roll = Math.random() * totalWeight;
    for (const entry of pool) {
      roll -= entry.weight;
      if (roll <= 0) return entry.id;
    }
    // fallback — last entry
    return pool[pool.length - 1].id;
  }

  /* ── PUBLIC API ────────────────────── */

  const Progress = {

    /* ── MAPS ─────────────────────────── */

    getCompletedMaps() {
      return _load(KEY_MAPS);
    },

    isMapCompleted(mapId) {
      return this.getCompletedMaps().includes(mapId);
    },

    isMapUnlocked(mapId) {
  // all playable maps are always open
  if (CONFIG.playableOrder.includes(mapId)) return true;

  // boss maps — locked unless dev flags
  if (CONFIG.devUnlockAll || CONFIG.devUnlockMapsOnly) return true;
  return false;
},

    markMapCompleted(mapId) {
      const list = this.getCompletedMaps();
      if (!list.includes(mapId)) {
        list.push(mapId);
        _save(KEY_MAPS, list);
      }
    },

    /* ── BEST WAVE REACHED ────────────── */

    getBestWave(mapId) {
      try {
        return parseInt(localStorage.getItem(KEY_BEST_WAVE + mapId)) || 0;
      } catch(e) {
        return 0;
      }
    },

    saveBestWave(mapId, wave) {
      try {
        const current = this.getBestWave(mapId);
        if (wave > current) {
          localStorage.setItem(KEY_BEST_WAVE + mapId, String(wave));
        }
      } catch(e) {}
    },

    /* ── ABILITIES ────────────────────── */

    getUnlockedAbilities() {
      const list = _load(KEY_ABILITIES);
      // Always include default
      const def = CONFIG.abilities.defaultAbility;
      if (!list.includes(def)) list.push(def);
      return list;
    },

    isAbilityUnlocked(abilityId) {
  if (CONFIG.devUnlockAll && !CONFIG.devUnlockMapsOnly) return true;
  if (abilityId === CONFIG.abilities.defaultAbility) return true;
  return _load(KEY_ABILITIES).includes(abilityId);
},

    unlockAbility(abilityId) {
      const list = _load(KEY_ABILITIES);
      if (!list.includes(abilityId)) {
        list.push(abilityId);
        _save(KEY_ABILITIES, list);
        return true;
      }
      return false;
    },

    getLockedAbilities() {
      const unlocked = this.getUnlockedAbilities();
      const all = Object.keys(CONFIG.abilities.rarities);
      return all.filter(id => !unlocked.includes(id));
    },

    /* ── SLOT MACHINE ─────────────────── */

    /**
     * Check if completing this map should
     * trigger the guaranteed slot machine.
     */
    shouldTriggerSlot(mapId) {
      if (this.getLockedAbilities().length === 0) return false;
      const slotMaps = CONFIG.abilities.slotAfterMaps;
      if (!slotMaps.includes(mapId)) return false;

      // Check if slot was already given for this map
      const given = _load(KEY_SLOTS_GIVEN);
      return !given.includes(mapId);
    },

    /**
     * Mark that the slot was given for this map.
     * Prevents double-trigger on replay.
     */
    markSlotGiven(mapId) {
      const given = _load(KEY_SLOTS_GIVEN);
      if (!given.includes(mapId)) {
        given.push(mapId);
        _save(KEY_SLOTS_GIVEN, given);
      }
    },

    /**
     * Roll the slot machine.
     * guaranteed = true  → always returns an ability id
     * guaranteed = false → ~1/6 chance per spin, can return null
     */
    rollSlot(guaranteed) {
  const pool = _getWeightedPool();
  if (pool.length === 0) return null;

  if (guaranteed) {
    return _pickFromPool(pool);
  }

  // Non-guaranteed: ~1/9 chance per spin
  if (Math.random() > (1 / 9)) return null;
  return _pickFromPool(pool);
},

    /* ── MENU VIDEOS (REWARDED AD) ────── */

    getMenuVideosUsed() {
      return _loadInt(KEY_MENU_VIDEOS);
    },

    canUseMenuVideo() {
      const max = CONFIG.abilities.menuSlots.maxVideos;
      return this.getMenuVideosUsed() < max
          && this.getLockedAbilities().length > 0;
    },

    useMenuVideo() {
      const used = this.getMenuVideosUsed();
      _saveInt(KEY_MENU_VIDEOS, used + 1);
      return used + 1;
    },

    /**
     * Is this the last available video?
     * Used to force guaranteed ability.
     */
    isLastMenuVideo() {
      const max = CONFIG.abilities.menuSlots.maxVideos;
      return this.getMenuVideosUsed() === max - 1;
    },

    /* ── RESET (dev only) ─────────────── */

    reset() {
      localStorage.removeItem(KEY_MAPS);
      localStorage.removeItem(KEY_ABILITIES);
      localStorage.removeItem(KEY_MENU_VIDEOS);
      localStorage.removeItem(KEY_SLOTS_GIVEN);
// clear best waves
CONFIG.playableOrder.forEach(id => {
  localStorage.removeItem(KEY_BEST_WAVE + id);
});
    },

  };

  return Progress;

})();

/* === js/modes/adventure/adventureSpawner.js === */
/* ═══════════════════════════════════════
   ADVENTURESPAWNER.JS
   Enemy spawning for Adventure Mode.

   === HOW THE SPAWN SYSTEM WORKS ===

   This file handles WHERE enemies spawn.
   The adventureDirector decides WHEN and
   WHAT pattern (combo) to use.

   GATE SYSTEM:
   Each direction (up/down/left/right) has
   a "gate". A gate tracks which enemies
   were spawned from that direction.
   A direction is "free" when:
   - it has fewer alive enemies than maxPerDirection
   - the last enemy spawned has crossed the
     gate threshold (moved close enough to center)

   DIRECTION COOLDOWN:
   After spawning from a direction, that
   direction goes on cooldown (can't spawn
   again for X ms). This prevents the same
   side from being spammed repeatedly.
   Cooldown is configurable per wave.

   DIRECTION PICKING:
   The combo system in adventureDirector
   requests directions with specific rules:
   - 'any':      any free direction
   - 'opposite': two opposite dirs (up+down or left+right)
   - 'adjacent': two adjacent dirs (up+right, down+left, etc.)
   - 'spread3':  three directions
   - 'all':      all four directions

   ANTI-REPETITION:
   The system tracks the last 2 directions
   used and avoids them when possible.
   This creates natural variety.

   Used by: modes/adventure/adventureDirector.js
   Depends on: state.js, config.js,
               systems/spawn.js
   ═══════════════════════════════════════ */

// ── GATE SYSTEM ────────────────────────
// Tracks enemies spawned per direction
const dirGateEnemies = { up: [], down: [], left: [], right: [] };

// ── DIRECTION COOLDOWNS ────────────────
// Timestamp (ms) when each direction becomes free again
const _dirCooldownUntil = { up: 0, down: 0, left: 0, right: 0 };

// ── ANTI-REPETITION ────────────────────
// Last 2 directions used, to avoid repeating
let _advLastDirs = [];

// ── OPPOSITE / ADJACENT MAPS ───────────
const _oppositeDirs = { up: 'down', down: 'up', left: 'right', right: 'left' };
const _adjacentDirs = {
  up:    ['left', 'right'],
  down:  ['left', 'right'],
  left:  ['up', 'down'],
  right: ['up', 'down'],
};

/* ── RESET ──────────────────────────────
   Called at start of each wave.
   Clears all tracking data.
───────────────────────────────────────── */
function resetAdventureSpawner() {
  dirGateEnemies.up    = [];
  dirGateEnemies.down  = [];
  dirGateEnemies.left  = [];
  dirGateEnemies.right = [];
  _dirCooldownUntil.up    = 0;
  _dirCooldownUntil.down  = 0;
  _dirCooldownUntil.left  = 0;
  _dirCooldownUntil.right = 0;
  _advLastDirs = [];
}

/* ── IS DIRECTION FREE ──────────────────
   A direction is free when:
   1. Its cooldown has expired
   2. It has fewer alive enemies than maxPerDirection
   3. The last enemy spawned has passed the gate threshold

   Returns true/false.
───────────────────────────────────────── */
function isDirFree(dir) {
  // check cooldown first
  if (performance.now() < _dirCooldownUntil[dir]) return false;

  const list = dirGateEnemies[dir];

  // clean dead enemies from tracking
  for (let i = list.length - 1; i >= 0; i--) {
    if (!list[i].isAlive()) list.splice(i, 1);
  }

  // max enemies per direction (configurable per map)
  const map = ActiveDirector.getCurrentMap ? ActiveDirector.getCurrentMap() : null;
  const maxPerDir = (map && map.maxPerDirection) || 4;
  if (list.length >= maxPerDir) return false;

  // if no enemies on this line, it's free
  if (list.length === 0) return true;

  // allow next spawn only if the LAST enemy
  // has passed the gate threshold (moved close to center)
  const { w, h } = getArenaSize();
  const cx       = w / 2;
  const cy       = h / 2;
  const mapGate  = (map && map.gateThreshold !== undefined) ? map.gateThreshold : 0.40;
  const gate     = Math.min(w, h) * mapGate;
  const last     = list[list.length - 1];
  const dist     = last.distToCenter(cx, cy);

  return dist <= gate;
}

/* ── SET DIRECTION COOLDOWN ─────────────
   After spawning from a direction, block
   it for cooldownMs milliseconds.
   Called by adventureDirector after each spawn.
───────────────────────────────────────── */
function setDirCooldown(dir, cooldownMs) {
  _dirCooldownUntil[dir] = performance.now() + cooldownMs;
}

/* ── PICK SINGLE FREE DIRECTION ─────────
   Returns one random free direction,
   avoiding the last 2 used directions.
   Returns null if none are free.
───────────────────────────────────────── */
function pickDirAdventure() {
  const dirs = ['up', 'down', 'left', 'right'];
  const free = dirs.filter(d => isDirFree(d));
  if (free.length === 0) return null;

  // prefer directions not recently used
  let candidates = free.filter(d => !_advLastDirs.includes(d));
  if (candidates.length === 0) candidates = free;

  const pick = candidates[Math.floor(Math.random() * candidates.length)];

  _advLastDirs.push(pick);
  if (_advLastDirs.length > 2) _advLastDirs.shift();

  return pick;
}

/* ── PICK OPPOSITE PAIR ─────────────────
   Returns [dir1, dir2] where dir2 is
   opposite to dir1 (up+down or left+right).
   Both must be free. Returns null if
   no opposite pair is available.

   Example: returns ['up', 'down'] or ['left', 'right']
───────────────────────────────────────── */
function pickDirOpposite() {
  const pairs = [['up', 'down'], ['left', 'right']];
  // shuffle pairs to avoid always picking same axis
  if (Math.random() > 0.5) pairs.reverse();

  for (const pair of pairs) {
    if (isDirFree(pair[0]) && isDirFree(pair[1])) {
      // prefer pair that doesn't repeat last dirs
      _advLastDirs.push(pair[0], pair[1]);
      if (_advLastDirs.length > 4) _advLastDirs.splice(0, _advLastDirs.length - 2);
      return pair;
    }
  }
  return null;
}

/* ── PICK ADJACENT PAIR ─────────────────
   Returns [dir1, dir2] where dir2 is
   adjacent to dir1 (up+right, down+left, etc.)
   Both must be free. Returns null if none.

   Example: returns ['up', 'right'] or ['down', 'left']
───────────────────────────────────────── */
function pickDirAdjacent() {
  const dirs = ['up', 'down', 'left', 'right'];
  // shuffle to randomize
  for (let i = dirs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
  }

  for (const d of dirs) {
    if (!isDirFree(d)) continue;
    const adj = _adjacentDirs[d];
    // shuffle adjacents too
    const adjShuffled = Math.random() > 0.5 ? [adj[0], adj[1]] : [adj[1], adj[0]];
    for (const a of adjShuffled) {
      if (isDirFree(a)) {
        _advLastDirs.push(d, a);
        if (_advLastDirs.length > 4) _advLastDirs.splice(0, _advLastDirs.length - 2);
        return [d, a];
      }
    }
  }
  return null;
}

/* ── PICK 3 DIRECTIONS ──────────────────
   Returns [dir1, dir2, dir3] — any 3
   free directions. Returns null if
   fewer than 3 are free.
───────────────────────────────────────── */
function pickDir3() {
  const dirs = ['up', 'down', 'left', 'right'];
  const free = dirs.filter(d => isDirFree(d));
  if (free.length < 3) return null;

  // shuffle and pick first 3
  for (let i = free.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [free[i], free[j]] = [free[j], free[i]];
  }
  const picked = free.slice(0, 3);
  _advLastDirs = picked.slice(-2);
  return picked;
}

/* ── PICK ALL 4 DIRECTIONS ──────────────
   Returns ['up','down','left','right']
   only if ALL 4 are free. Otherwise null.
───────────────────────────────────────── */
function pickDirAll() {
  const dirs = ['up', 'down', 'left', 'right'];
  if (dirs.every(d => isDirFree(d))) {
    _advLastDirs = [];
    return dirs;
  }
  return null;
}

/* ── REGISTER SPAWNED ENEMY ─────────────
   After spawning an enemy, call this to
   register it in the gate tracking system.
   Called by adventureDirector after each
   spawnEnemyDirected() call.
───────────────────────────────────────── */
function registerSpawnedEnemy(dir) {
  const enemy = enemies[enemies.length - 1];
  if (enemy) dirGateEnemies[dir].push(enemy);
}

/* ── BUILD ENEMY POOL (legacy) ──────────
   Returns weighted enemy pool for maps
   that still use the old enemyPool format.
   New waves should use waveConfig.pool.
───────────────────────────────────────── */
function buildEnemyPoolForMap(wave, map, isBoss) {
  // intro waves override
  if (!isBoss && map.introWaves && map.introWaves[wave]) {
    return map.introWaves[wave].pool.slice();
  }

  const poolSrc = (isBoss && map.boss && map.boss.enemyPool)
    ? map.boss.enemyPool
    : map.enemyPool;

  const pool = [];
  for (const [name, cfg] of Object.entries(poolSrc)) {
    const fromWave = cfg.fromWave !== undefined ? cfg.fromWave : 1;
    if (wave >= fromWave) {
      for (let i = 0; i < cfg.weight; i++) pool.push(name);
    }
  }
  return pool;
}

/* ── FALLBACK SPAWN (legacy) ────────────
   Used when a wave has NO combos defined.
   Spawns 1 enemy from 1 random direction.
   This is the old behavior — keeps
   backward compatibility with existing
   waveConfigs that don't have combos yet.
───────────────────────────────────────── */
function spawnGroupForMap(state, wave, map, isBoss) {
  if (!running) return;

  const d    = CONFIG.director;
  const pool = buildEnemyPoolForMap(wave, map, isBoss);
  if (pool.length === 0) return;

  const boss = (isBoss && map.boss) ? map.boss : null;
  const isIntro = !isBoss && map.introWaves && map.introWaves[wave];

  const maxEnemies = (boss && boss.maxEnemies !== undefined)
    ? boss.maxEnemies
    : isIntro
      ? 3
      : (map.maxEnemies !== undefined)
        ? map.maxEnemies
        : Math.min(d.maxEnemiesCap, Math.floor(d.maxEnemiesBase + wave * d.maxEnemiesPerWave));

  if (enemies.length >= maxEnemies) return;

  let dir = pickDirAdventure();

  // fallback: if all dirs gate-blocked and field nearly empty
  if (!dir && enemies.length < (map.minEnemiesAlive || 2)) {
    const dirs = ['up', 'down', 'left', 'right'];
    const fallback = dirs.filter(d => {
      const list = dirGateEnemies[d];
      let alive = 0;
      for (const e of list) { if (e.isAlive()) alive++; }
      return alive < 2;
    });
    if (fallback.length > 0) {
      let fbCandidates = fallback.filter(d => !_advLastDirs.includes(d));
      if (fbCandidates.length === 0) fbCandidates = fallback;
      dir = fbCandidates[Math.floor(Math.random() * fbCandidates.length)];
      _advLastDirs.push(dir);
      if (_advLastDirs.length > 2) _advLastDirs.shift();
    }
  }
  if (!dir) return;

  const typeCounts = {};
  for (const e of enemies) {
    if (e.dir === dir) {
      typeCounts[e.name] = (typeCounts[e.name] || 0) + 1;
    }
  }

  const filtered = pool.filter(name => (typeCounts[name] || 0) < 2);
  if (filtered.length === 0) return;

  let finalPool = filtered;
  if (map.maxInField) {
    const fieldCounts = {};
    for (const e of enemies) {
      fieldCounts[e.name] = (fieldCounts[e.name] || 0) + 1;
    }
    finalPool = filtered.filter(name => {
      const cap = map.maxInField[name];
      if (cap === undefined) return true;
      return (fieldCounts[name] || 0) < cap;
    });
    if (finalPool.length === 0) return;
  }

  const enemyName = finalPool[Math.floor(Math.random() * finalPool.length)];
  const def       = EnemyRegistry.get(enemyName);
  if (!def) return;

  spawnEnemyDirected(def, dir);
  dirGateEnemies[dir].push(enemies[enemies.length - 1]);
}

/* === js/systems/tutorial.js === */
/* ═══════════════════════════════════════
   TUTORIAL.JS  (v2 — cutscene rework)
   Cinematic intro + interactive tutorial
   during first Wave 1 play.

   Phase 0: cutscene — zoom player, alert
     bubble, zoom out, ravager with rage
     bubble walks in.
   Phase 1: attack — learn directional hit
   Phase 2: parry  — deflect a bullet
   Phase 3: special — use charged ability

   Only runs once — sets localStorage flag.
   Skip button available throughout.

   Used by: adventureDirector.js
   Depends on: state.js, spawn.js, config.js,
               combat.js, input.js, hud.js
   ═══════════════════════════════════════ */

const Tutorial = (() => {

  const STORAGE_KEY = 'ds_tutorial_done';

  /* ── State ─────────────────────────── */
  let _active       = false;
  let _phase        = 0;     // 0=cutscene 1=attack 2=parry 3=special
  let _step         = 0;
  let _frozen       = false;
  let _waitingDir   = null;
  let _waitingSpace = false;
  let _hintEl       = null;
  let _skipEl       = null;
  let _spawned      = [];
  let _completed    = false;

  /* ── Cutscene state ────────────────── */
  let _csTimeouts     = [];
  let _playerBubbleEl = null;
  let _rageBubbleEl   = null;
  let _rageBubbleTgt  = null;

  /* ── Phase refs ────────────────────── */
  let _phaseAEnemy   = null;
  let _phaseBCrusher = null;

  /* ── Assets ────────────────────────── */
  const BUBBLE_ALERT = 'assets/ui/tutorial/bubble_alert.png';
  const BUBBLE_RAGE  = 'assets/ui/tutorial/bubble_rage.png';
  const _TOUCH_HAND  = 'assets/ui/touch_hand.png';

  const _KEY_IMAGES = {
    right:  'assets/ui/keys_arrow_right.png',
    left:   'assets/ui/keys_arrow_left.png',
    up:     'assets/ui/keys_arrow_up.png',
    down:   'assets/ui/keys_arrow_down.png',
    center: 'assets/ui/key_space.png',
  };

  const _WASD = { right: 'D', left: 'A', up: 'W', down: 'S' };

  const _HAND_POS = {
    right:  { left: '75%', top: '50%' },
    left:   { left: '25%', top: '50%' },
    up:     { left: '50%', top: '20%' },
    down:   { left: '50%', top: '80%' },
    center: { left: '50%', top: '42%' },
  };

  /* ── localStorage ──────────────────── */
  function isNeeded() {
    try { return !localStorage.getItem(STORAGE_KEY); }
    catch (e) { return true; }
  }

  function _markDone() {
    try { localStorage.setItem(STORAGE_KEY, '1'); }
    catch (e) { /* silent */ }
  }

  /* ── Safe delayed call (guarded) ───── */
  function _later(fn, ms) {
    const id = setTimeout(() => {
      if (!_active) return;
      try { fn(); } catch (e) { /* never crash */ }
    }, ms);
    _csTimeouts.push(id);
    return id;
  }

  function _clearTimeouts() {
    for (let i = 0; i < _csTimeouts.length; i++) clearTimeout(_csTimeouts[i]);
    _csTimeouts = [];
  }

  /* ── Arena helper ──────────────────── */
  function _arena() {
    return document.getElementById('arena');
  }

  /* ═══════════════════════════════════
     CAMERA (CSS zoom on #arena)
     Only during cutscene. Cleaned up
     completely before gameplay starts.
     ═══════════════════════════════════ */

  function _camZoomIn() {
    const a = _arena();
    if (!a) return;
    a.classList.add('tutorial-cam');
    void a.offsetWidth;              // force reflow for transition
    a.classList.add('tutorial-zoom-in');
  }

  function _camZoomOut() {
    const a = _arena();
    if (!a) return;
    a.classList.remove('tutorial-zoom-in');
    // tutorial-cam stays so the transition animates back
  }

  function _camCleanup() {
    const a = _arena();
    if (!a) return;
    a.classList.remove('tutorial-cam', 'tutorial-zoom-in');
    a.style.transform = '';
  }

  /* ═══════════════════════════════════
     PLAYER BUBBLE (cutscene only)
     ═══════════════════════════════════ */

  function _showPlayerBubble() {
    _removePlayerBubble();
    const a = _arena();
    if (!a) return;

    const el = document.createElement('div');
    el.className = 'tutorial-bubble tutorial-bubble-enter';
    el.innerHTML = '<img src="' + BUBBLE_ALERT + '" alt="!">';
    el.style.left = '50%';
    el.style.top  = '50%';
    el.style.marginTop = '-48px';
    a.appendChild(el);
    _playerBubbleEl = el;
    SFX.tutorialAlert();

    // enter → float after animation
    _later(() => {
      if (!_playerBubbleEl) return;
      _playerBubbleEl.classList.remove('tutorial-bubble-enter');
      _playerBubbleEl.classList.add('tutorial-bubble-float');
    }, 420);
  }

  function _fadePlayerBubble() {
    if (!_playerBubbleEl) return;
    _playerBubbleEl.classList.remove('tutorial-bubble-float');
    _playerBubbleEl.classList.add('tutorial-bubble-exit');
    const ref = _playerBubbleEl;
    _later(() => { if (ref && ref.parentNode) ref.remove(); }, 350);
    _playerBubbleEl = null;
  }

  function _removePlayerBubble() {
    if (_playerBubbleEl) { _playerBubbleEl.remove(); _playerBubbleEl = null; }
  }

  /* ═══════════════════════════════════
     RAGE BUBBLE (follows enemy)
     ═══════════════════════════════════ */

  function _showRageBubble(enemy) {
    _removeRageBubble();
    const a = _arena();
    if (!a || !enemy) return;

    const el = document.createElement('div');
    el.className = 'tutorial-bubble tutorial-bubble-enter';
    el.innerHTML = '<img src="' + BUBBLE_RAGE + '" alt="!!">';
    a.appendChild(el);
    _rageBubbleEl  = el;
    _rageBubbleTgt = enemy;
    _updateRageBubblePos();

    _later(() => {
      if (!_rageBubbleEl) return;
      _rageBubbleEl.classList.remove('tutorial-bubble-enter');
    }, 420);
  }

  function _updateRageBubblePos() {
    if (!_rageBubbleEl || !_rageBubbleTgt) return;
    try {
      const e = _rageBubbleTgt;
      if (typeof e.isAlive === 'function' && !e.isAlive()) {
        _removeRageBubble();
        return;
      }
      _rageBubbleEl.style.left = e.x + 'px';
      _rageBubbleEl.style.top  = (e.y - 48) + 'px';
    } catch (err) {
      _removeRageBubble();
    }
  }

  function _removeRageBubble() {
    if (_rageBubbleEl) { _rageBubbleEl.remove(); _rageBubbleEl = null; }
    _rageBubbleTgt = null;
  }

  /* ═══════════════════════════════════
     HINT DISPLAY (arrow + WASD)
     ═══════════════════════════════════ */

  function _showHint(dir) {
    _removeHint();
    const a = _arena();
    if (!a) return;

    const el = document.createElement('div');
    el.id = 'tutorial-hint';
    const mobile = typeof isMobile === 'function' && isMobile();

    if (mobile) {
      // Touch hand positioned in direction
      const pos = _HAND_POS[dir] || _HAND_POS.center;
      el.className = 'tutorial-hint-touch';
      el.style.cssText =
        'position:absolute;z-index:90;pointer-events:none;' +
        'left:' + pos.left + ';top:' + pos.top + ';' +
        'transform:translate(-50%,-50%);';
      const img = document.createElement('img');
      img.src = _TOUCH_HAND;
      el.appendChild(img);
    } else {
      el.className = 'tutorial-hint-key';
      el.style.cssText =
        'position:absolute;z-index:90;pointer-events:none;' +
        'left:50%;top:50%;transform:translate(-50%,40px);';

      if (dir === 'center') {
        // Space key — just the image, no WASD
        const img = document.createElement('img');
        img.src = _KEY_IMAGES.center;
        img.style.cssText = 'width:96px;height:auto;image-rendering:pixelated;';
        el.appendChild(img);
      } else {
        // Arrow + "or" + WASD key cap
        const combo = document.createElement('div');
        combo.className = 'tutorial-hint-combo';

        const img = document.createElement('img');
        img.src = _KEY_IMAGES[dir];
        combo.appendChild(img);

        const orLbl = document.createElement('div');
        orLbl.className = 'tutorial-hint-or';
        orLbl.textContent = 'or';
        combo.appendChild(orLbl);

        const key = document.createElement('div');
        key.className = 'tutorial-wasd-key';
        key.textContent = _WASD[dir];
        combo.appendChild(key);

        el.appendChild(combo);
      }
    }

    a.appendChild(el);
    _hintEl = el;
  }

  function _removeHint() {
    if (_hintEl) { _hintEl.remove(); _hintEl = null; }
  }

  /* ═══════════════════════════════════
     SKIP BUTTON
     ═══════════════════════════════════ */

  function _showSkip() {
    _removeSkip();
    const a = _arena();
    if (!a) return;

    const btn = document.createElement('div');
    btn.id = 'tutorial-skip';
    btn.textContent = 'SKIP TUTORIAL';
    btn.addEventListener('click', () => { _doSkip(); });
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      _doSkip();
    }, { passive: false });
    a.appendChild(btn);
    _skipEl = btn;
  }

  function _removeSkip() {
    if (_skipEl) { _skipEl.remove(); _skipEl = null; }
  }

  function _doSkip() {
    if (!_active) return;
    // Full cleanup — camera, bubbles, timeouts
    _clearTimeouts();
    _camCleanup();
    _removePlayerBubble();
    _removeRageBubble();
    _complete();

    // Stop game → map select
    running = false;
    if (gameLoop) { clearInterval(gameLoop); gameLoop = null; }
    if (typeof cleanupArena === 'function') cleanupArena();
    if (typeof Transition !== 'undefined') {
      Transition.play('fast', () => {
        if (typeof showScreen === 'function') showScreen(sMapSelect);
        if (typeof initMapSelect === 'function') initMapSelect();
      });
    } else {
      if (typeof showScreen === 'function') showScreen(sMapSelect);
      if (typeof initMapSelect === 'function') initMapSelect();
    }
  }

  /* ═══════════════════════════════════
     FREEZE / UNFREEZE
     ═══════════════════════════════════ */

  function _freeze() {
    _frozen = true;
    if (gameLoop) { clearInterval(gameLoop); gameLoop = null; }
  }

  function _unfreeze() {
    _frozen = false;
    _removeHint();
    lastTick = performance.now();
    gameLoop = setInterval(tick, 16);
  }

  /* ═══════════════════════════════════
     SPAWN HELPER
     ═══════════════════════════════════ */

  function _spawnFromDir(enemyId, dir, speedOverride) {
    const def = EnemyRegistry.get(enemyId);
    if (!def) return null;

    const origSpeed = def.speedMult;
    if (speedOverride) def.speedMult = speedOverride;

    spawnEnemyDirected(def, dir);
    const enemy = enemies[enemies.length - 1];
    dirGateEnemies[dir].push(enemy);

    def.speedMult = origSpeed;
    _spawned.push(enemy);
    return enemy;
  }

  /* ═══════════════════════════════════
     RANGE CHECK
     ═══════════════════════════════════ */

  function _isInRange(enemy) {
    if (!enemy || typeof enemy.isAlive !== 'function' || !enemy.isAlive()) return false;
    const s = getArenaSize();
    if (!s) return false;
    const cx = s.w / 2, cy = s.h / 2;
    const range = player.getAttackRange(Math.min(s.w, s.h));
    return enemy.distToCenter(cx, cy) <= range;
  }

  function _isInRangeBullet(bullet) {
    if (!bullet) return false;
    const s = getArenaSize();
    if (!s) return false;
    const cx = s.w / 2, cy = s.h / 2;
    const range = player.getAttackRange(Math.min(s.w, s.h));
    const dx = bullet.x - cx, dy = bullet.y - cy;
    return Math.sqrt(dx * dx + dy * dy) <= range;
  }

  /* ═══════════════════════════════════
     PHASE 0 — CUTSCENE
     Zoom on player → alert bubble →
     zoom out → Phase A starts
     ═══════════════════════════════════ */

  function _startCutscene() {
    _phase = 0;
    _step  = 0;

    // T+0: zoom in on player
    _camZoomIn();

    // T+900ms: show alert bubble above player
    _later(() => { _showPlayerBubble(); }, 900);

    // T+2100ms: fade bubble out
    _later(() => { _fadePlayerBubble(); }, 2100);

    // T+2500ms: zoom out (transition back)
    _later(() => { _camZoomOut(); }, 2500);

    // T+3400ms: cleanup camera, start gameplay
    // T+3400ms: cleanup camera, start gameplay
    _later(() => {
      _camCleanup();
      _startPhaseA();
    }, 3400);
  }

  /* ═══════════════════════════════════
     PHASE A — ATTACK
     ═══════════════════════════════════ */

  function _startPhaseA() {
    _phase = 1;
    _step  = 0;
    _phaseAEnemy = _spawnFromDir('ravager', 'right', 1.2);
    _showRageBubble(_phaseAEnemy);
  }

  function _tickPhaseA() {
    // Keep rage bubble following the ravager
    _updateRageBubblePos();

    if (_step === 0) {
      if (_phaseAEnemy && _isInRange(_phaseAEnemy)) {
        _removeRageBubble();
        _freeze();
        _showHint('right');
        _waitingDir = 'right';
        _step = 1;
      }
      // Edge case: killed before freeze
      if (_phaseAEnemy && typeof _phaseAEnemy.isAlive === 'function'
          && !_phaseAEnemy.isAlive()) {
        _removeRageBubble();
        _step = 2;
      }
      return;
    }
    if (_step === 1) return;   // waiting for right arrow input

    if (_step === 2) {
      // Second ravager from top
      _phaseAEnemy = _spawnFromDir('ravager', 'up', 1.1);
      _step = 3;
      return;
    }
    if (_step === 3) {
      if (_phaseAEnemy && _isInRange(_phaseAEnemy)) {
        _freeze();
        _showHint('up');
        _waitingDir = 'up';
        _step = 4;
      }
      if (_phaseAEnemy && typeof _phaseAEnemy.isAlive === 'function'
          && !_phaseAEnemy.isAlive()) _step = 5;
      return;
    }
    if (_step === 4) return;   // waiting for up arrow input

    if (_step === 5) {
      // Two more ravagers, no hints — player does it alone
      _spawnFromDir('ravager', 'left',  1.5);
      _spawnFromDir('ravager', 'down',  1.5);
      _step = 6;
      return;
    }
    if (_step === 6) {
      const alive = enemies.filter(e => e.isAlive()).length;
      if (alive === 0) _startPhaseB();
      return;
    }
  }

  /* ═══════════════════════════════════
     PHASE B — PARRY
     ═══════════════════════════════════ */

  function _startPhaseB() {
    _phase = 2;
    _step  = 0;
    _phaseBCrusher = _spawnFromDir('crusher', 'up', 0.8);
  }

  function _tickPhaseB() {
    if (_step === 0) {
      if (bullets.length > 0) _step = 1;
      if (_phaseBCrusher && !_phaseBCrusher.isAlive()) _startPhaseC();
      return;
    }
    if (_step === 1) {
      if (bullets.length > 0 && _isInRangeBullet(bullets[0])) {
        _freeze();
        _showHint('up');
        _waitingDir = 'up';
        _step = 2;
      }
      if (bullets.length === 0) _step = 3;
      return;
    }
    if (_step === 2) return;   // waiting for up arrow input
    if (_step === 3) {
      const alive = enemies.filter(e => e.isAlive()).length;
      if (alive === 0) _startPhaseC();
      return;
    }
  }

  /* ═══════════════════════════════════
     PHASE C — SPECIAL
     ═══════════════════════════════════ */

  function _startPhaseC() {
    _phase = 3;
    _step  = 0;

    player.specialCharge = 100;
    if (typeof updateSpecialBar === 'function') updateSpecialBar();

    _spawnFromDir('ravager', 'up',    1.6);
    _spawnFromDir('ravager', 'down',  1.6);
    _spawnFromDir('ravager', 'left',  1.6);
    _spawnFromDir('ravager', 'right', 1.6);
  }

  function _tickPhaseC() {
    if (_step === 0) {
      let inRange = 0;
      for (const e of enemies) {
        if (e.isAlive() && _isInRange(e)) inRange++;
      }
      if (inRange >= 2) {
        _freeze();
        _showHint('center');
        _waitingSpace = true;
        _step = 1;
      }
      return;
    }
    if (_step === 1) return;   // waiting for space input
    if (_step === 2) {
      const alive = enemies.filter(e => e.isAlive()).length;
      if (alive === 0) _complete();
      return;
    }
  }

  /* ═══════════════════════════════════
     COMPLETION
     ═══════════════════════════════════ */

  function _complete() {
    _active    = false;
    _completed = true;
    _clearTimeouts();
    _camCleanup();
    _removeHint();
    _removeSkip();
    _removePlayerBubble();
    _removeRageBubble();
    _markDone();
  }

  /* ═══════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════ */

  return {

    isNeeded() { return isNeeded(); },

    start() {
      if (!isNeeded()) return false;
      _markDone();

      _active       = true;
      _phase        = 0;
      _step         = 0;
      _frozen       = false;
      _completed    = false;
      _spawned      = [];
      _waitingDir   = null;
      _waitingSpace = false;

      _showSkip();
      _startCutscene();
      return true;
    },

    tick(dt) {
      if (!_active || _frozen) return;
      if (_phase === 1) _tickPhaseA();
      if (_phase === 2) _tickPhaseB();
      if (_phase === 3) _tickPhaseC();
    },

    onDirInput(dir) {
      if (!_active || !_frozen) return false;
      if (_waitingDir && dir === _waitingDir) {
        _waitingDir = null;
        _unfreeze();
        handleDir(dir);
        if (_phase === 1) {
          if (_step === 1)      _step = 2;
          else if (_step === 4) _step = 5;
        }
        if (_phase === 2 && _step === 2) _step = 3;
        return true;
      }
      return false;
    },

    onSpaceInput() {
      if (!_active || !_frozen || !_waitingSpace) return false;
      _waitingSpace = false;
      _unfreeze();
      if (typeof activateSpecial === 'function') activateSpecial();
      _step = 2;
      return true;
    },

    isActive()    { return _active; },
    isFrozen()    { return _frozen; },
    isCompleted() { return _completed; },
    skip()        { _doSkip(); },

    reset() {
      _active       = false;
      _phase        = 0;
      _step         = 0;
      _frozen       = false;
      _completed    = false;
      _waitingDir   = null;
      _waitingSpace = false;
      _spawned      = [];
      _clearTimeouts();
      _camCleanup();
      _removeHint();
      _removeSkip();
      _removePlayerBubble();
      _removeRageBubble();
    },
  };

})();

/* === js/modes/adventure/adventureDirector.js === */
/* ═══════════════════════════════════════
   ADVENTUREDIRECTOR.JS — v4 COMBO SYSTEM
   Adventure Mode orchestrator.

   === HOW THE COMBO SYSTEM WORKS ===

   Every spawn tick, instead of spawning
   1 random enemy, the system picks a
   COMBO PATTERN and spawns enemies
   according to that pattern.

   COMBO PATTERNS (defined in CONFIG):
   - single:         1 enemy from 1 direction
   - pair_opposite:  1+1 from opposite sides (up+down or left+right)
   - pair_adjacent:  1+1 from adjacent sides (up+right, down+left...)
   - burst_single:   2 enemies from SAME direction (one line)
   - triple:         1 from 3 different directions
   - rush:           3 enemies from SAME direction
   - surround:       1 from ALL 4 directions

   STAGGER:
   When a combo spawns multiple enemies,
   they don't all appear at once. There's
   a delay (stagger) between each one.
   Each pattern has its own default stagger:
   - single:        0ms (only 1 enemy)
   - pair_opposite: 400ms (player needs time to turn)
   - pair_adjacent: 350ms
   - burst_single:  250ms (same dir, one hit kills both)
   - triple:        400ms
   - rush:          300ms
   - surround:      500ms (most pressure, most time)

   HOW TO USE IN WAVECONFIG:
   Each wave can define which combos are
   available and their weights (probability).
   Higher weight = more likely to be picked.

   Example wave config:
   {
     duration: 20,
     spawnInterval: 2000,
     maxAlive: 5,
     minAlive: 2,
     pool: { ravager: 7, crusher: 3 },
     combos: {
       single: 5,        // very common
       pair_opposite: 3,  // moderate
       burst_single: 2,   // occasional
     },
     stagger: 400,        // override default stagger (optional)
     dirCooldown: 1000,   // ms before same dir can spawn again (optional)
   }

   FALLBACK:
   If a wave does NOT have 'combos' defined,
   the system uses the OLD behavior:
   single spawn + burstChance/burstSize.
   This keeps all existing maps working.

   DIRECTION COOLDOWN:
   After spawning from a direction, that
   direction is blocked for dirCooldown ms.
   This prevents the same side from being
   hammered repeatedly. Default: 800ms.
   Configurable per wave in waveConfig.

   COMBO FALLBACK:
   If the chosen combo can't spawn
   (directions blocked), the system tries
   a simpler combo automatically:
   surround → triple → pair → single → skip

   Used by: systems/loop.js
   Depends on: MapRegistry, config.js,
               adventureSpawner.js
   ═══════════════════════════════════════ */

const AdventureDirector = (() => {

  let currentMap    = null;
  let wave          = 1;
  let spawnTimer    = 0;
  let active        = false;
  let completed     = false;
  let waveTimeLeft  = 0;
  let waveDuration  = 0;
  let waveElapsed   = 0;
  let draining      = false;
  let drainPauseMs  = 0;

  /* ── STAGGER QUEUE ──────────────────
     When a combo spawns multiple enemies,
     the extras go in this queue with a
     delay. Each tick processes the queue.

     Format: { dir, pool, delay, maxAlive }
  ──────────────────────────────────────── */
  let _staggerQueue = [];

  /* ── INPUT TRACKER ──────────────────
     Counts player actions to detect idle.
  ──────────────────────────────────────── */
  let _inputTimes = [];

  function _trackInput() {
    _inputTimes.push(performance.now());
  }

  function _getInputRate() {
    const now    = performance.now();
    const window = CONFIG.adventure.inputWindowMs || 3000;
    while (_inputTimes.length > 0 && now - _inputTimes[0] > window) {
      _inputTimes.shift();
    }
    return _inputTimes.length;
  }

  /* ── WAVE CONFIG HELPERS ────────────── */

  function _getWaveConfig() {
    if (currentMap && currentMap.waveConfig && currentMap.waveConfig[wave]) {
      return currentMap.waveConfig[wave];
    }
    return null;
  }

  function _getWaveDuration() {
    const wc = _getWaveConfig();
    if (wc && wc.duration !== undefined) return wc.duration * 1000;
    return 30000;
  }

  function _getSpawnInterval() {
    const wc = _getWaveConfig();
    const base = wc ? wc.spawnInterval : CONFIG.adventure.defaultSpawnInterval;

    // sawtooth: interval shrinks as wave progresses
    if (waveDuration <= 0) return base;
    const progress = Math.min(1, waveElapsed / waveDuration);
    const accel    = CONFIG.adventure.spawnAccelPct || 0.30;
    const factor   = 1 - (progress * accel);
    let interval = Math.max(300, Math.round(base * factor));

    // slow spawn rate when bullet time is active
    if (player && player.speedMultiplier < 1) {
      interval = Math.round(interval / player.speedMultiplier);
    }

    return interval;
  }

  function _getMaxAlive() {
    const wc = _getWaveConfig();
    return wc ? wc.maxAlive : (currentMap.maxEnemies || CONFIG.adventure.defaultMaxAlive);
  }

  function _getMinAlive() {
    const wc = _getWaveConfig();
    return wc ? (wc.minAlive !== undefined ? wc.minAlive : CONFIG.adventure.defaultMinAlive)
              : (currentMap.minEnemiesAlive || CONFIG.adventure.defaultMinAlive);
  }

  function _getDirCooldown() {
    const wc = _getWaveConfig();
    if (wc && wc.dirCooldown !== undefined) return wc.dirCooldown;
    return CONFIG.adventure.defaultDirCooldown || 800;
  }

  /* ── BUILD POOL ───────────────────────
     Creates weighted array of enemy names.
     ['ravager','ravager','ravager','crusher','crusher']
  ──────────────────────────────────────── */
  function _buildPool() {
    const wc = _getWaveConfig();
    if (wc && wc.pool) {
      const pool = [];
      for (const [name, weight] of Object.entries(wc.pool)) {
        for (let i = 0; i < weight; i++) pool.push(name);
      }
      return pool;
    }
    return buildEnemyPoolForMap(wave, currentMap, false);
  }

  /* ── PICK FROM POOL ───────────────────
     Picks a random enemy from the weighted
     pool, respecting maxInField limits.
  ──────────────────────────────────────── */
  function _pickFromPool(pool) {
    if (pool.length === 0) return null;

    // count current enemies by type
    const fieldCounts = {};
    for (const e of enemies) {
      fieldCounts[e.name] = (fieldCounts[e.name] || 0) + 1;
    }

    // filter by maxInField
    let available = pool;
    if (currentMap && currentMap.maxInField) {
      available = pool.filter(name => {
        const cap = currentMap.maxInField[name];
        if (cap === undefined) return true;
        return (fieldCounts[name] || 0) < cap;
      });
    }
    if (available.length === 0) return null;

    const name = available[Math.floor(Math.random() * available.length)];
    return EnemyRegistry.get(name);
  }

  /* ── UPGRADE CHECK ──────────────────── */
  function _isUpgradeWave(w) {
    const list = CONFIG.adventure.upgradeAfterWaves || [2, 4, 6, 8, 10];
    return list.includes(w);
  }

  function _getTotalWaves() {
    if (currentMap && currentMap.totalWaves) return currentMap.totalWaves;
    return 11;
  }

  function _isFinalWave() {
    return wave === _getTotalWaves();
  }

  /* ═══════════════════════════════════
     COMBO SYSTEM
     ═══════════════════════════════════ */

  /* ── GET COMBO CONFIG ─────────────────
     Returns the combos object for current
     wave, or null if wave uses old system.
  ──────────────────────────────────────── */
  function _getCombos() {
    const wc = _getWaveConfig();
    if (wc && wc.combos) return wc.combos;
    return null;
  }

  /* ── PICK A COMBO PATTERN ─────────────
     Weighted random pick from the combos
     object. Returns pattern name string.

     Example input: { single: 5, pair_opposite: 3 }
     Total weight = 8
     'single' has 5/8 = 62.5% chance
  ──────────────────────────────────────── */
  /* ── PICK A COMBO PATTERN ─────────────
     Supports two formats in waveConfig:
     
     Simple (weight only):
       combos: { single: 5, pair_opposite: 3 }
     
     Detailed (weight + custom stagger):
       combos: {
         single: 5,
         pair_opposite: { weight: 3, stagger: 300 },
         surround: { weight: 1, stagger: 450 },
       }
     
     You can mix both formats in the same wave.
     Returns the pattern name string.
  ──────────────────────────────────────── */
  function _pickCombo(combos) {
    const entries = Object.entries(combos);
    let total = 0;
    for (const [, val] of entries) {
      total += (typeof val === 'object') ? val.weight : val;
    }
    if (total <= 0) return 'single';

    let roll = Math.random() * total;
    for (const [pattern, val] of entries) {
      const w = (typeof val === 'object') ? val.weight : val;
      roll -= w;
      if (roll <= 0) return pattern;
    }
    return entries[0][0];
  }

  /* ── GET STAGGER FOR PATTERN ──────────
     Returns delay in ms between enemies
     in a multi-enemy combo.
     Wave config can override with 'stagger'.
  ──────────────────────────────────────── */
 /* ── GET STAGGER FOR PATTERN ──────────
     Priority order:
     1. Per-combo stagger in waveConfig
        combos: { pair_opposite: { weight:3, stagger:300 } }
     2. CONFIG.adventure.comboStagger defaults
     3. Fallback 400ms
  ──────────────────────────────────────── */
  function _getStagger(pattern) {
    // check per-combo stagger in waveConfig
    const wc = _getWaveConfig();
    if (wc && wc.combos && wc.combos[pattern]) {
      const val = wc.combos[pattern];
      if (typeof val === 'object' && val.stagger !== undefined) {
        return val.stagger;
      }
    }

    // per-pattern defaults from CONFIG
    const defaults = CONFIG.adventure.comboStagger || {};
    if (defaults[pattern] !== undefined) return defaults[pattern];

    // fallback
    return 400;
  }

  /* ── SPAWN ONE ENEMY ──────────────────
     Spawns a single enemy from pool at
     the given direction. Applies cooldown.
     Returns true if spawned successfully.
  ──────────────────────────────────────── */
  function _doSpawn(dir, pool) {
    const def = _pickFromPool(pool);
    if (!def) return false;

    spawnEnemyDirected(def, dir);
    registerSpawnedEnemy(dir);
    setDirCooldown(dir, _getDirCooldown());
    return true;
  }

  /* ── QUEUE STAGGERED SPAWN ────────────
     Adds a delayed spawn to the queue.
     Will be processed in _tickStaggerQueue.
  ──────────────────────────────────────── */
  function _queueSpawn(dir, pool, delayMs) {
    _staggerQueue.push({
      dir:      dir,
      pool:     pool,
      delay:    delayMs,
      maxAlive: _getMaxAlive(),
    });
  }

  /* ── TICK STAGGER QUEUE ───────────────
     Process delayed spawns from combos.
     Called every tick.
  ──────────────────────────────────────── */
  function _tickStaggerQueue(dt) {
    for (let i = _staggerQueue.length - 1; i >= 0; i--) {
      _staggerQueue[i].delay -= dt;
      if (_staggerQueue[i].delay <= 0) {
        const item = _staggerQueue[i];
        _staggerQueue.splice(i, 1);
        if (enemies.length >= item.maxAlive) continue;
        _doSpawn(item.dir, item.pool);
      }
    }
  }

  /* ── EXECUTE COMBO ────────────────────
     Main combo executor. Picks directions
     based on pattern, spawns first enemy
     immediately, queues rest with stagger.

     If the chosen pattern can't find free
     directions, falls back to simpler
     patterns automatically:
     surround → triple → pair_opposite → single

     Returns true if at least 1 enemy spawned.
  ──────────────────────────────────────── */
  function _executeCombo(pattern) {
    const pool    = _buildPool();
    if (pool.length === 0) return false;

    const maxAlive = _getMaxAlive();
    // allow spawn if close to max but stagger queue
    // will resolve soon — prevents dead air
    const queueCount = _staggerQueue.length;
    if (enemies.length >= maxAlive + 1) return false;
    if (enemies.length >= maxAlive && queueCount > 0) return false;

    const stagger = _getStagger(pattern);

    // ── SINGLE: 1 enemy, 1 direction
    if (pattern === 'single') {
      const dir = pickDirAdventure();
      if (!dir) return false;
      return _doSpawn(dir, pool);
    }

    // ── PAIR_OPPOSITE: 1+1 from opposite sides
    if (pattern === 'pair_opposite') {
      const dirs = pickDirOpposite();
      if (!dirs) return _executeCombo('single'); // fallback
      _doSpawn(dirs[0], pool);
      _queueSpawn(dirs[1], pool, stagger);
      return true;
    }

    // ── PAIR_ADJACENT: 1+1 from adjacent sides
    if (pattern === 'pair_adjacent') {
      const dirs = pickDirAdjacent();
      if (!dirs) return _executeCombo('single'); // fallback
      _doSpawn(dirs[0], pool);
      _queueSpawn(dirs[1], pool, stagger);
      return true;
    }

    // ── BURST_SINGLE: 2 enemies same direction
    if (pattern === 'burst_single') {
      const dir = pickDirAdventure();
      if (!dir) return false;
      _doSpawn(dir, pool);
      _queueSpawn(dir, pool, stagger);
      return true;
    }

    // ── TRIPLE: 1 from 3 directions
    if (pattern === 'triple') {
      const dirs = pickDir3();
      if (!dirs) return _executeCombo('pair_opposite'); // fallback
      _doSpawn(dirs[0], pool);
      _queueSpawn(dirs[1], pool, stagger);
      _queueSpawn(dirs[2], pool, stagger * 2);
      return true;
    }

    // ── RUSH: 3 enemies same direction
    if (pattern === 'rush') {
      const dir = pickDirAdventure();
      if (!dir) return false;
      _doSpawn(dir, pool);
      _queueSpawn(dir, pool, stagger);
      _queueSpawn(dir, pool, stagger * 2);
      return true;
    }

    // ── SURROUND: 1 from all 4 directions
    if (pattern === 'surround') {
      const dirs = pickDirAll();
      if (!dirs) return _executeCombo('triple'); // fallback
      _doSpawn(dirs[0], pool);
      _queueSpawn(dirs[1], pool, stagger);
      _queueSpawn(dirs[2], pool, stagger * 2);
      _queueSpawn(dirs[3], pool, stagger * 3);
      return true;
    }

    // unknown pattern — default to single
    return _executeCombo('single');
  }

  /* ── LEGACY SPAWN (no combos) ─────────
     Used when wave has NO combos defined.
     Same behavior as old system:
     1 enemy + burstChance.
  ──────────────────────────────────────── */
  function _legacySpawn() {
    const pool = _buildPool();
    if (pool.length === 0) return;

    const maxAlive = _getMaxAlive();
    if (enemies.length >= maxAlive) return;

    const dir = pickDirAdventure();
    if (!dir) {
      // fallback for nearly empty field
      if (enemies.length < (currentMap.minEnemiesAlive || 2)) {
        const dirs = ['up', 'down', 'left', 'right'];
        const fb = dirs.filter(d => {
          const list = dirGateEnemies[d];
          let alive = 0;
          for (const e of list) { if (e.isAlive()) alive++; }
          return alive < 2;
        });
        if (fb.length > 0) {
          const pick = fb[Math.floor(Math.random() * fb.length)];
          _doSpawn(pick, pool);
        }
      }
      return;
    }

    // burst chance (old system)
    const wc = _getWaveConfig();
    const burstChance = (wc && wc.burstChance !== undefined) ? wc.burstChance : 0;
    const burstSize   = (wc && wc.burstSize !== undefined) ? wc.burstSize : 2;

    if (burstChance > 0 && Math.random() < burstChance && _staggerQueue.length === 0) {
      _doSpawn(dir, pool);
      for (let i = 1; i < burstSize; i++) {
        _queueSpawn(dir, pool, i * 500);
      }
    } else {
      _doSpawn(dir, pool);
    }
  }

  /* ═══════════════════════════════════
     MAIN DIRECTOR LOGIC
     ═══════════════════════════════════ */

  return {

    /* ── INIT ─────────────────────────── */
    init(mapId) {
      currentMap = MapRegistry.get(mapId);
      if (!currentMap) {
        console.error(`AdventureDirector: map "${mapId}" not found.`);
        return false;
      }

      wave          = 1;
      spawnTimer    = 0;
      completed     = false;
      waveElapsed   = 0;
      draining      = false;
      drainPauseMs  = 0;
      active        = true;
      _inputTimes   = [];
      _staggerQueue = [];

      waveDuration = _getWaveDuration();
      waveTimeLeft = waveDuration;

      resetAdventureSpawner();
      if (typeof resetUpgradeChoices === 'function') resetUpgradeChoices();
      setArenaBackground(currentMap.background || null);

      // save wave 1 as minimum progress
Progress.saveBestWave(currentMap.id, 1);

      // always reset tutorial state to prevent stale isActive blocking spawns
      if (typeof Tutorial !== 'undefined') Tutorial.reset();

      // tutorial on wave 1 of first map (first time only)
      if (wave === 1 && currentMap.id === 'map01_forest' &&
          typeof Tutorial !== 'undefined' && Tutorial.isNeeded()) {
        Tutorial.start();
      }

      return true;
    },

    /* ── STOP ─────────────────────────── */
    stop() {
      active = false;
    },

    /* ── INPUT TRACKING ───────────────── */
    trackInput() {
      _trackInput();
    },

    /* ── EVENTS ───────────────────────── */
    onDamage() {},
    onKill()   {},

    /* ── NEXT WAVE ────────────────────── */
    nextWave() {
      const total = _getTotalWaves();
      if (wave >= total) {
        this.completeMap();
        return;
      }
      if (_isUpgradeWave(wave)) {
        active = false;
        if (typeof startUpgradeChoice === 'function') startUpgradeChoice();
        return;
      }
      this._startWave(wave + 1);
    },

    /* ── START WAVE ───────────────────── */
   _startWave(newWave) {
      // save best wave reached
  if (currentMap) Progress.saveBestWave(currentMap.id, newWave);

  wave         = newWave;

      // music speed ramp — increment every N waves
      if (typeof Music !== 'undefined' && CONFIG.music && wave > 1) {
        const every = CONFIG.music.speedEveryWaves || 2;
        if ((wave - 1) % every === 0) {
          Music.incrementRate(CONFIG.music.speedIncrement || 0.05);
        }
      }
      waveElapsed  = 0;
      spawnTimer   = 0;
      draining     = false;
      drainPauseMs = 0;
      _staggerQueue = [];
      resetAdventureSpawner();

      waveDuration = _getWaveDuration();
      waveTimeLeft = waveDuration;

      if (typeof updateWaveDisplay === 'function') {
        updateWaveDisplay(wave, _isFinalWave());
      }
    },

    /* ── COMPLETE MAP ─────────────────── */
    completeMap() {
      if (completed) return;
      completed = true;
      active    = false;

      Progress.markMapCompleted(currentMap.id);
      Progress.saveBestWave(currentMap.id, _getTotalWaves());

      const hasSlot = Progress.shouldTriggerSlot(currentMap.id);
      if (hasSlot) Progress.markSlotGiven(currentMap.id);

      if (typeof showMapComplete === 'function') {
        showMapComplete(currentMap, hasSlot);
      }
    },

    /* ── TICK ─────────────────────────── */
    tick(dt) {
      if (!active) return;

      // ── GATE CLEANUP ──────────────────
      // Purge dead enemies from gate tracking
      // every tick to prevent ghost buildup
      for (const dir of ['up', 'down', 'left', 'right']) {
        const list = dirGateEnemies[dir];
        for (let i = list.length - 1; i >= 0; i--) {
          const e = list[i];
          if (!e.isAlive() || !enemies.includes(e)) {
            list.splice(i, 1);
          }
        }
      }

      // tutorial controls wave 1 spawning
      if (typeof Tutorial !== 'undefined' && Tutorial.isActive()) {
        Tutorial.tick(dt);
        if (typeof OrbSystem !== 'undefined') OrbSystem.tick(dt);
        _tickStaggerQueue(dt);
        return;
      }

      // process stagger queue
      _tickStaggerQueue(dt);

      // orb system
      if (typeof OrbSystem !== 'undefined') OrbSystem.tick(dt);

      // draining: waiting for enemies to die after wave timer ends
      if (draining) {
        if (enemies.length === 0 && bullets.length === 0) {
          drainPauseMs -= dt;
          if (drainPauseMs <= 0) {
            draining = false;
            this.nextWave();
          }
        }
        return;
      }

      // wave timer
      waveElapsed  += dt;
      waveTimeLeft -= dt;
      if (waveTimeLeft <= 0) {
        waveTimeLeft = 0;
        draining     = true;
        drainPauseMs = 500;
        return;
      }

      // ── SPAWN LOGIC ──

      const minAlive = _getMinAlive();
      const combos   = _getCombos();

      // anti-idle: field below minimum, force spawn
      if (enemies.length < minAlive) {
        const inputRate     = _getInputRate();
        const idleThreshold = CONFIG.adventure.inputIdleThreshold || 1;

        if (combos) {
          const spawned = _executeCombo('single');
          if (!spawned) {
            // all dirs blocked — retry very fast
            spawnTimer = 150;
            return;
          }
        } else {
          _legacySpawn();
        }

        spawnTimer = (inputRate <= idleThreshold)
          ? (CONFIG.adventure.inputIdleSpawnMs || 600)
          : 400;
        return;
      }

      // standard spawn cycle
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        const interval = _getSpawnInterval();

        if (combos) {
          const pattern = _pickCombo(combos);
          const spawned = _executeCombo(pattern);
          // if spawn was blocked (maxAlive, no free dirs),
          // retry quickly instead of waiting full interval
          spawnTimer = spawned ? interval : Math.min(interval, 300);
        } else {
          _legacySpawn();
          spawnTimer = interval;
        }
      }
    },

    /* ── GETTERS ──────────────────────── */
    getWave()           { return wave; },
    getMaxWave()        { return _getTotalWaves(); },
    getStress()         { return 0; },
    getTarget()         { return 0; },
    isBoss()            { return _isFinalWave(); },
    getKills()          { return 0; },
    getKillsNeeded()    { return 0; },
    getCurrentMap()     { return currentMap; },
    isCompleted()       { return completed; },
    isBossPaused()      { return false; },
    getWaveTimeLeft()   { return waveTimeLeft; },
    getWaveDuration()   { return waveDuration; },

    resumeAfterChoice() {
      active = true;
      this._startWave(wave + 1);
    },

    restart() {
      if (!currentMap) return false;
      return this.init(currentMap.id);
    },

    restartCurrentWave() {
      this._startWave(wave);
      active = true;
    },

    /* ── DEBUG ────────────────────────── */
    _debug() {
      return {
        wave,
        totalWaves:    _getTotalWaves(),
        waveTimeLeft,
        waveDuration,
        waveElapsed,
        draining,
        drainPauseMs,
        spawnTimer,
        active,
        completed,
        waveConfig:    _getWaveConfig(),
        spawnInterval: _getSpawnInterval(),
        maxAlive:      _getMaxAlive(),
        minAlive:      _getMinAlive(),
        pool:          _buildPool(),
        inputRate:     _getInputRate(),
        staggerQueue:  _staggerQueue.length,
        combos:        _getCombos(),
        dirCooldown:   _getDirCooldown(),
        isFinalWave:   _isFinalWave(),
        isUpgradeWave: _isUpgradeWave(wave),
      };
    },

    debugSkipTimer() {
      if (!active || draining) return;
      if (waveTimeLeft > 10000) {
        waveElapsed  = waveDuration - 10000;
        waveTimeLeft = 10000;
      }
    },

  };

})();

/* === js/modes/adventure/maps/map01_forest/map.js === */
MapRegistry.register({

  id:    'map01_forest',
  order: 1,
  name:  'Forest',
  theme: 'forest',
  icon:  '🌲',
  background: 'assets/maps/map01_forest/background_01.webp',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {
    11: {
      ravager: { speedMult: 1.2 },
    },
  },

  waveConfig: {

    // ── Wave 1 — TUTORIAL ──
    // Tutorial.js handles spawning. Fallback only.
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
    2: {
      duration: 13,
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
    3: {
      duration: 13,
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
    4: {
      duration: 13,
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

    // ── Wave 5 — Adjacent pairs + wider stagger ──
    5: {
      duration: 16,
      spawnInterval: 2000,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 7, crusher: 3 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 550 },
        pair_adjacent: { weight: 2, stagger: 500 },
        burst_single:  { weight: 1, stagger: 350 },
      },
      dirCooldown: 1000,
    },

    // ── Wave 6 — BREATHER + stagger ──
    6: {
      duration: 16,
      spawnInterval: 1800,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 9, crusher: 1 },
      combos: {
        single: 5,
        burst_single:  { weight: 3, stagger: 350 },
        pair_opposite: { weight: 2, stagger: 550 },
      },
      dirCooldown: 900,
    },

    // ── UPGRADE 3 ──

    // ── Wave 7 — Crushers return ──
    7: {
      duration: 16,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 6, crusher: 4 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 550 },
        burst_single:  { weight: 1, stagger: 400 },
      },
      dirCooldown: 1000,
    },

    // ── Wave 8 — ALL CRUSHER ──
    8: {
      duration: 16,
      spawnInterval: 2200,
      maxAlive: 3,
      minAlive: 1,
      pool: { crusher: 10 },
      combos: {
        single: 6,
        pair_opposite: { weight: 3, stagger: 650 },
        pair_adjacent: { weight: 1, stagger: 600 },
      },
      dirCooldown: 1200,
    },

    // ── UPGRADE 4 ──

    // ── Wave 9 — Triple introduction ──
    9: {
      duration: 16,
      spawnInterval: 1800,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 6, crusher: 4 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 600 },
        burst_single:  { weight: 2, stagger: 400 },
        triple:        { weight: 2, stagger: 550 },
      },
      dirCooldown: 900,
    },

    // ── Wave 10 — Last stand ──
    10: {
      duration: 18,
      spawnInterval: 1600,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 6, crusher: 4 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 550 },
        burst_single:  { weight: 2, stagger: 400 },
        triple:        { weight: 1, stagger: 550 },
      },
      dirCooldown: 800,
    },

    // ── UPGRADE 5 ──

    // ── Wave 11 — FINAL WAVE ──
    11: {
      duration: 20,
      spawnInterval: 1200,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 10 },
      combos: {
        pair_opposite: { weight: 3, stagger: 500 },
        burst_single:  { weight: 3, stagger: 350 },
        rush:          { weight: 3, stagger: 400 },
        surround:      { weight: 1, stagger: 550 },
      },
      dirCooldown: 300,
    },

  },

  /* fallback pool */
  enemyPool: {
    ravager: { fromWave: 1, weight: 8 },
    crusher: { fromWave: 3, weight: 2 },
  },

  unlocksAbility: null,
});

/* === js/modes/adventure/maps/map02_dungeon/map.js === */
MapRegistry.register({

  id:    'map02_dungeon',
  order: 2,
  name:  'Dungeon',
  theme: 'dungeon',
  icon:  '🪨',
  background: 'assets/maps/map02_dungeon/background_01.webp',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  waveConfig: {

    // ── Wave 1 — Intro ──
    1: {
      duration: 13,
      spawnInterval: 1400,
      maxAlive: 3,
      minAlive: 2,
      pool: { ravager: 6, slime_large: 4 },
      combos: {
        single: 3,
        pair_opposite: 4,
        burst_single: 2,
        triple: 2,
      },
      dirCooldown: 600,
    },

    // ── Wave 2 — Slimes from both sides ──
    2: {
      duration: 14,
      spawnInterval: 1400,
      maxAlive: 3,
      minAlive: 2,
      pool: { ravager: 6, slime_large: 4 },
      combos: {
        single: 2,
        pair_opposite: 5,
        burst_single: 3,
      },
      dirCooldown: 600,
    },

    // ── UPGRADE 1 ──

    // ── Wave 3 — Golem enters ──
    3: {
      duration: 14,
      spawnInterval: 1900,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 3, slime_large: 4, golem: 3 },
      combos: {
        single: 6,
        pair_opposite: 3,
        burst_single: 1,
      },
      dirCooldown: 900,
    },

    // ── Wave 4 — Golem + slime pressure ──
    4: {
      duration: 14,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 4, slime_large: 3, golem: 3 },
      combos: {
        single: 5,
        pair_opposite: 3,
        burst_single: 2,
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 2 ──

    // ── Wave 5 — Adjacent pairs + wider stagger ──
    5: {
      duration: 17,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 3, slime_large: 4, golem: 3 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 550 },
        pair_adjacent: { weight: 2, stagger: 500 },
        burst_single:  { weight: 1, stagger: 350 },
      },
      dirCooldown: 1000,
    },

    // ── Wave 6 — BREATHER + stagger ──
    6: {
      duration: 17,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 8, golem: 2 },
      combos: {
        single: 4,
        burst_single:  { weight: 4, stagger: 350 },
        pair_opposite: { weight: 2, stagger: 550 },
      },
      dirCooldown: 900,
    },

    // ── UPGRADE 3 ──

    // ── Wave 7 — Slime swamp ──
    7: {
      duration: 17,
      spawnInterval: 2200,
      maxAlive: 4,
      minAlive: 2,
      pool: { slime_large: 6, golem: 3, ravager: 1 },
      combos: {
        single: 5,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 550 },
      },
      dirCooldown: 1100,
    },

    // ── Wave 8 — Golem heavy ──
    8: {
      duration: 17,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 3, slime_large: 3, golem: 4 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 650 },
        burst_single:  { weight: 2, stagger: 400 },
        pair_adjacent: { weight: 1, stagger: 600 },
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 4 ──

    // ── Wave 9 — Triple intro ──
    9: {
      duration: 17,
      spawnInterval: 1900,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 3, slime_large: 4, golem: 3 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 600 },
        burst_single:  { weight: 2, stagger: 400 },
        triple:        { weight: 2, stagger: 550 },
      },
      dirCooldown: 900,
    },

    // ── Wave 10 — Last stand ──
    10: {
      duration: 20,
      spawnInterval: 1800,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 3, slime_large: 4, golem: 3 },
      combos: {
        single: 2,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 550 },
        burst_single:  { weight: 2, stagger: 400 },
        triple:        { weight: 1, stagger: 550 },
      },
      dirCooldown: 800,
    },

    // ── UPGRADE 5 ──

    // ── Wave 11 — FINAL: Slime flood ──
    11: {
      duration: 22,
      spawnInterval: 1400,
      maxAlive: 5,
      minAlive: 2,
      pool: { slime_large: 10 },
      combos: {
        pair_opposite: { weight: 3, stagger: 800 },
        burst_single:  { weight: 3, stagger: 600 },
        rush:          { weight: 2, stagger: 700 },
        surround:      { weight: 1, stagger: 900 },
      },
      dirCooldown: 600,
    },

  },

  /* fallback pool */
  enemyPool: {
    ravager:     { fromWave: 1, weight: 5 },
    slime_large: { fromWave: 1, weight: 4 },
    golem:       { fromWave: 3, weight: 3 },
  },

  unlocksAbility: null,

});

/* === js/modes/adventure/maps/map03_desert/map.js === */
MapRegistry.register({

  id:    'map03_desert',
  order: 3,
  name:  'Desert',
  theme: 'desert',
  icon:  '🏜️',
  background: 'assets/maps/map03_desert/background_01.webp',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  waveConfig: {

    // ── Wave 1 — Intro ──
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

    // ── Wave 5 — Golem enters + stagger ──
    5: {
      duration: 22,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 4, crusher: 2, tornado: 3, golem: 1 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 550 },
        pair_adjacent: { weight: 2, stagger: 500 },
        burst_single:  { weight: 1, stagger: 350 },
      },
      dirCooldown: 1000,
    },

    // ── Wave 6 — BREATHER + stagger ──
    6: {
      duration: 22,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 7, tornado: 3 },
      combos: {
        single: 4,
        burst_single:  { weight: 4, stagger: 350 },
        pair_opposite: { weight: 2, stagger: 550 },
      },
      dirCooldown: 900,
    },

    // ── UPGRADE 3 ──

    // ── Wave 7 — Crusher + tornado hell ──
    7: {
      duration: 22,
      spawnInterval: 2200,
      maxAlive: 3,
      minAlive: 1,
      pool: { crusher: 5, tornado: 5 },
      combos: {
        single: 5,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 550 },
      },
      dirCooldown: 1100,
    },

    // ── Wave 8 — Full mix returns ──
    8: {
      duration: 22,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 3, crusher: 4, tornado: 3 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 650 },
        burst_single:  { weight: 2, stagger: 400 },
        pair_adjacent: { weight: 1, stagger: 600 },
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 4 ──

    // ── Wave 9 — Triple intro ──
    9: {
      duration: 25,
      spawnInterval: 1900,
      maxAlive: 4,
      minAlive: 2,
      pool: { scorpion: 3, crusher: 3, tornado: 3, golem: 1 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 600 },
        burst_single:  { weight: 2, stagger: 400 },
        triple:        { weight: 2, stagger: 550 },
      },
      dirCooldown: 1000,
    },

    // ── Wave 10 — Last stand ──
    10: {
      duration: 20,
      spawnInterval: 2100,
      maxAlive: 5,
      minAlive: 2,
      pool: { scorpion: 2, crusher: 5, tornado: 2, golem: 1 },
      combos: {
        single: 2,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 550 },
        burst_single:  { weight: 2, stagger: 400 },
        triple:        { weight: 1, stagger: 550 },
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 5 ──

    // ── Wave 11 — FINAL: Sandstorm ──
    11: {
      duration: 25,
      spawnInterval: 1400,
      maxAlive: 5,
      minAlive: 2,
      pool: { tornado: 5, scorpion: 5 },
      combos: {
        pair_opposite: { weight: 3, stagger: 700 },
        burst_single:  { weight: 3, stagger: 500 },
        rush:          { weight: 2, stagger: 600 },
        surround:      { weight: 1, stagger: 800 },
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

/* === js/modes/adventure/maps/map04_temple/map.js === */
MapRegistry.register({

  id:    'map04_temple',
  order: 4,
  name:  'Temple',
  theme: 'temple',
  icon:  '⛩️',
  background: 'assets/maps/map04_temple/background_01.webp',

  totalWaves: 1,
  minEnemiesAlive: 1,
  maxPerDirection: 6,
  gateThreshold: 0.25,
maxPerDirection: 2,

  scalingAt: {},

  waveConfig: {

    // Wave 1 — single long wave, pure survival
    1: {
      duration: 90,
      spawnInterval: 2000,
      maxAlive: 6,
      minAlive: 2,
      pool: { crusher: 6, tornado: 4, golem: 1 },
      burstChance: 0.20,
      burstSize: 2,
    },

  },

  enemyPool: {
    crusher: { fromWave: 1, weight: 6 },
    tornado: { fromWave: 1, weight: 4 },
    golem:   { fromWave: 1, weight: 1 },
  },

  unlocksAbility: null,

});

/* === js/modes/adventure/maps/map05_snow/map.js === */
MapRegistry.register({

  id:    'map05_snow',
  order: 5,
  name:  'Snow',
  theme: 'snow',
  icon:  '❄️',
  background: 'assets/maps/map05_snow/background_01.webp',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  waveConfig: {

    // ── Wave 1 — New enemies intro ──
    1: {
      duration: 10,
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
    2: {
      duration: 10,
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
    3: {
      duration: 15,
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

    // ── Wave 5 — Full mix + stagger ──
    5: {
      duration: 22,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { spectral_deer: 3, wolf: 3, bear: 2, ravager: 2 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 550 },
        pair_adjacent: { weight: 2, stagger: 500 },
        burst_single:  { weight: 1, stagger: 350 },
      },
      dirCooldown: 1000,
    },

    // ── Wave 6 — BREATHER + stagger ──
    6: {
      duration: 22,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 6, spectral_deer: 4 },
      combos: {
        single: 4,
        burst_single:  { weight: 4, stagger: 350 },
        pair_opposite: { weight: 2, stagger: 550 },
      },
      dirCooldown: 900,
    },

    // ── UPGRADE 3 ──

    // ── Wave 7 — Wolf heavy ──
    7: {
      duration: 25,
      spawnInterval: 2000,
      maxAlive: 4,
      minAlive: 2,
      pool: { wolf: 5, spectral_deer: 3, bear: 2 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 550 },
        burst_single:  { weight: 1, stagger: 400 },
      },
      dirCooldown: 1000,
    },

    // ── Wave 8 — Bear + deer ──
    8: {
      duration: 25,
      spawnInterval: 2200,
      maxAlive: 4,
      minAlive: 2,
      pool: { bear: 4, spectral_deer: 4, ravager: 2 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 650 },
        burst_single:  { weight: 2, stagger: 400 },
        pair_adjacent: { weight: 1, stagger: 600 },
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 4 ──

    // ── Wave 9 — Triple intro ──
    9: {
      duration: 25,
      spawnInterval: 1900,
      maxAlive: 5,
      minAlive: 2,
      pool: { spectral_deer: 3, wolf: 3, bear: 2, ravager: 2 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 600 },
        burst_single:  { weight: 2, stagger: 400 },
        triple:        { weight: 2, stagger: 550 },
      },
      dirCooldown: 900,
    },

    // ── Wave 10 — Last stand ──
    10: {
      duration: 28,
      spawnInterval: 1800,
      maxAlive: 5,
      minAlive: 2,
      pool: { spectral_deer: 3, wolf: 3, bear: 2, ravager: 2 },
      combos: {
        single: 2,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 550 },
        burst_single:  { weight: 2, stagger: 400 },
        triple:        { weight: 1, stagger: 550 },
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 5 ──

    // ── Wave 11 — FINAL: Blizzard ──
    11: {
      duration: 25,
      spawnInterval: 1500,
      maxAlive: 5,
      minAlive: 2,
      pool: { wolf: 5, spectral_deer: 5 },
      combos: {
        pair_opposite: { weight: 3, stagger: 700 },
        burst_single:  { weight: 3, stagger: 500 },
        rush:          { weight: 2, stagger: 600 },
        surround:      { weight: 1, stagger: 800 },
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

/* === js/modes/adventure/maps/map06_beach/map.js === */
MapRegistry.register({

  id:    'map06_beach',
  order: 6,
  name:  'Beach',
  theme: 'beach',
  icon:  '🏖️',
  background: 'assets/maps/map06_beach/background_01.webp',

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

/* === js/modes/adventure/maps/map07_clouds/map.js === */
MapRegistry.register({

  id:    'map07_clouds',
  order: 7,
  name:  'Clouds',
  theme: 'clouds',
  icon:  '⛈️',
  background: 'assets/maps/map07_clouds/background_01.webp',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  scalingAt: {},

  /* ── WAVE CONFIG ─────────────────────────
     Clouds identity: tornado (fast, parryable),
     eagle (2-phase: rush then shoots from opposite),
     thunder_hound (dodges first hit via teleport, 2hp).

     All enemies are FAST. Tornado = parry fodder.
     Eagle = forces awareness of both sides.
     Thunder_hound = punishes mindless attacks.

     Stagger INCREASES as waves progress because
     enemies get faster — stagger compensates so
     the player always has time to react and turn.
  ─────────────────────────────────────────── */
  waveConfig: {

    1: {
      duration: 15,
      spawnInterval: 2200,
      maxAlive: 3,
      minAlive: 1,
      pool: { tornado: 6, eagle: 4 },
      combos: {
        single: 6,
        pair_opposite: 2,
        burst_single: 2,
      },
      dirCooldown: 1100,
    },

    2: {
      duration: 18,
      spawnInterval: 2000,
      maxAlive: 3,
      minAlive: 2,
      pool: { tornado: 6, eagle: 4 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 500 },
        pair_adjacent: { weight: 2, stagger: 450 },
        burst_single: 1,
      },
      dirCooldown: 1100,
    },

    // ── UPGRADE 1 ──

    3: {
      duration: 18,
      spawnInterval: 2000,
      maxAlive: 3,
      minAlive: 1,
      pool: { tornado: 5, thunder_hound: 4, eagle: 1 },
      combos: {
        single: 5,
        pair_opposite: { weight: 3, stagger: 500 },
        burst_single: 2,
      },
      dirCooldown: 1100,
    },

    4: {
      duration: 20,
      spawnInterval: 1900,
      maxAlive: 4,
      minAlive: 2,
      pool: { tornado: 5, thunder_hound: 4, eagle: 1 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 550 },
        pair_adjacent: { weight: 2, stagger: 500 },
        burst_single: 1,
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 2 ──

    5: {
      duration: 22,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { tornado: 3, eagle: 4, thunder_hound: 3 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 550 },
        burst_single: 1,
      },
      dirCooldown: 1000,
    },

    // ── BREATHER ──
    6: {
      duration: 20,
      spawnInterval: 1700,
      maxAlive: 4,
      minAlive: 2,
      pool: { tornado: 10 },
      combos: {
        single: 3,
        burst_single: 5,
        pair_opposite: { weight: 2, stagger: 550 },
      },
      dirCooldown: 900,
    },

    // ── UPGRADE 3 ──

    7: {
      duration: 25,
      spawnInterval: 1700,
      maxAlive: 4,
      minAlive: 2,
      pool: { tornado: 3, eagle: 3, thunder_hound: 4 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 650 },
        pair_adjacent: { weight: 2, stagger: 600 },
        burst_single: 2,
      },
      dirCooldown: 900,
    },

    8: {
      duration: 25,
      spawnInterval: 1600,
      maxAlive: 4,
      minAlive: 2,
      pool: { tornado: 3, eagle: 3, thunder_hound: 4 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 650 },
        burst_single: 2,
        triple: { weight: 2, stagger: 700 },
      },
      dirCooldown: 900,
    },

    // ── UPGRADE 4 ──

    9: {
      duration: 28,
      spawnInterval: 1500,
      maxAlive: 5,
      minAlive: 2,
      pool: { tornado: 3, eagle: 3, thunder_hound: 4 },
      combos: {
        single: 2,
        pair_opposite: { weight: 3, stagger: 700 },
        pair_adjacent: { weight: 2, stagger: 650 },
        burst_single: 2,
        triple: { weight: 2, stagger: 750 },
      },
      dirCooldown: 800,
    },

    10: {
      duration: 28,
      spawnInterval: 1400,
      maxAlive: 5,
      minAlive: 2,
      pool: { tornado: 3, eagle: 3, thunder_hound: 4 },
      combos: {
        single: 2,
        pair_opposite: { weight: 3, stagger: 700 },
        burst_single: 2,
        rush: { weight: 2, stagger: 500 },
        triple: { weight: 1, stagger: 750 },
      },
      dirCooldown: 800,
    },

    // ── UPGRADE 5 ──

    // ── FINAL: Storm ──
    11: {
      duration: 30,
      spawnInterval: 1200,
      maxAlive: 5,
      minAlive: 3,
      pool: { tornado: 8, thunder_hound: 2 },
      combos: {
        pair_opposite: { weight: 3, stagger: 700 },
        burst_single: 3,
        rush: { weight: 3, stagger: 500 },
        surround: { weight: 1, stagger: 800 },
      },
      dirCooldown: 600,
    },

  },

  /* fallback pool */
  enemyPool: {
    tornado:       { fromWave: 1, weight: 4 },
    eagle:         { fromWave: 1, weight: 3 },
    thunder_hound: { fromWave: 3, weight: 3 },
  },

  unlocksAbility: null,

});

/* === js/modes/adventure/maps/map08_storm/map.js === */
MapRegistry.register({
  id:         'map08_storm',
  order:      8,
  name:       'Storm',
  theme:      'storm',
  background: 'assets/maps/map08_storm/background_01.webp',
  stressTarget: 55,
  enemyPool: {
    ravager: { fromWave: 1, weight: 6 },
    crusher: { fromWave: 1, weight: 2 },
    golem:   { fromWave: 1, weight: 2 },
  },
  boss: {
    name:           'Thunder Hound',
    desc:           'Lightning incarnate',
    icon:           '🌩️',
    enemyPool:      { crusher: { weight: 10 } },
    killsToAdvance: 25,
    speedMult:      1.8,
    maxEnemies:     5,
  },
  unlocksAbility: null,
});

/* === js/modes/adventure/maps/map09_volcano/map.js === */
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

/* === js/modes/adventure/maps/map10_sakura/map.js === */
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
      spawnInterval: 2200,
      maxAlive: 3,
      minAlive: 1,
      pool: { kitsune: 5, nara_deer: 5 },
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
      spawnInterval: 2000,
      maxAlive: 3,
      minAlive: 2,
      pool: { kitsune: 5, nara_deer: 5 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 550 },
        pair_adjacent: { weight: 2, stagger: 500 },
        burst_single: 1,
      },
      dirCooldown: 1100,
    },

    // ── UPGRADE 1 ──

    // ── Wave 3 — Frog enters ──
    // 3 parryable jumps then walks to center.
    // Player learns parry timing on jumps.
    // Mostly singles to focus on frog mechanic.
    3: {
      duration: 18,
      spawnInterval: 2000,
      maxAlive: 3,
      minAlive: 1,
      pool: { kitsune: 4, nara_deer: 3, frog: 3 },
      combos: {
        single: 5,
        pair_opposite: { weight: 3, stagger: 550 },
        burst_single: 2,
      },
      dirCooldown: 1100,
    },

    // ── Wave 4 — Frog more present ──
    // Frog + kitsune from adjacent sides =
    // frog jumping while kitsune lunges. Tricky.
    4: {
      duration: 20,
      spawnInterval: 1900,
      maxAlive: 4,
      minAlive: 2,
      pool: { kitsune: 3, nara_deer: 3, frog: 4 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 600 },
        burst_single: 1,
      },
      dirCooldown: 1000,
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

/* === js/modes/adventure/maps/map11_dragon/map.js === */
MapRegistry.register({
  id:         'map11_dragon',
  order:      11,
  name:       'Dragon Temple',
  theme:      'dragon',
  background: 'assets/maps/map11_dragon/background_01.webp',
  stressTarget: 60,
  enemyPool: {
    ravager: { fromWave: 1, weight: 5 },
    crusher: { fromWave: 1, weight: 3 },
    golem:   { fromWave: 1, weight: 2 },
  },
  boss: {
    name:           'The Dragon',
    desc:           'Fire and fury unleashed',
    icon:           '🐉',
    enemyPool:      { golem: { weight: 10 } },
    killsToAdvance: 30,
    speedMult:      1.9,
    maxEnemies:     4,
  },
  unlocksAbility: null,
});

/* === js/modes/adventure/maps/map12_moon/map.js === */
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
      spawnInterval: 1800,
      maxAlive: 3,
      minAlive: 2,
      pool: { spectral_deer: 5, star: 5 },
      combos: {
        single: 4,
        pair_opposite: { weight: 3, stagger: 600 },
        burst_single: 3,
      },
      dirCooldown: 1000,
    },

    // ── Wave 2 — Already pressing ──
    // Adjacent pairs + burst. Tempo already
    // higher than most maps' wave 4.
    2: {
      duration: 18,
      spawnInterval: 1700,
      maxAlive: 3,
      minAlive: 2,
      pool: { spectral_deer: 5, star: 5 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 600 },
        pair_adjacent: { weight: 2, stagger: 600 },
        burst_single: 2,
      },
      dirCooldown: 1000,
    },

    // ── UPGRADE 1 ──

    // ── Wave 3 — Eagle enters ──
    // 2-phase rush + shoot. No easing in —
    // eagle appears alongside star and deer.
    3: {
      duration: 18,
      spawnInterval: 1650,
      maxAlive: 4,
      minAlive: 2,
      pool: { spectral_deer: 4, star: 3, eagle: 3 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 650 },
        pair_adjacent: { weight: 2, stagger: 650 },
        burst_single: 2,
      },
      dirCooldown: 1000,
    },

    // ── Wave 4 — Thunder_hound enters ──
    // Teleport dodge + eagle 2-phase = both
    // punish mindless attacking. Player must
    // be precise with every swing.
    4: {
      duration: 20,
      spawnInterval: 1600,
      maxAlive: 4,
      minAlive: 2,
      pool: { spectral_deer: 3, star: 3, eagle: 2, thunder_hound: 2 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 700 },
        pair_adjacent: { weight: 2, stagger: 700 },
        burst_single: 2,
      },
      dirCooldown: 950,
    },

    // ── UPGRADE 2 ──

    // ── Wave 5 — Oni enters ──
    // 4hp bouncing tank. Even as rare spawn,
    // oni changes the entire field dynamic.
    // All 5 enemies now in play.
    5: {
      duration: 22,
      spawnInterval: 1550,
      maxAlive: 4,
      minAlive: 2,
      pool: { spectral_deer: 2, star: 3, eagle: 2, thunder_hound: 2, oni: 1 },
      combos: {
        single: 3,
        pair_opposite: { weight: 3, stagger: 750 },
        pair_adjacent: { weight: 2, stagger: 700 },
        burst_single: 2,
      },
      dirCooldown: 950,
    },

    // ── Wave 6 — BREATHER ──
    // Star only. Pure speed parry rush.
    // Even the breather is fast — this is Moon.
    // Burst + rush = parry chains for days.
    6: {
      duration: 20,
      spawnInterval: 1500,
      maxAlive: 4,
      minAlive: 2,
      pool: { star: 10 },
      combos: {
        single: 2,
        burst_single: 4,
        rush: { weight: 2, stagger: 500 },
        pair_opposite: { weight: 2, stagger: 650 },
      },
      dirCooldown: 850,
    },

    // ── UPGRADE 3 ──

    // ── Wave 7 — Full mix, triple ──
    // All 5 back. Triple already here —
    // other maps waited until wave 8-9.
    7: {
      duration: 25,
      spawnInterval: 1450,
      maxAlive: 4,
      minAlive: 2,
      pool: { spectral_deer: 2, star: 2, eagle: 2, thunder_hound: 2, oni: 2 },
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
      spawnInterval: 1400,
      maxAlive: 4,
      minAlive: 2,
      pool: { spectral_deer: 2, star: 2, eagle: 2, thunder_hound: 2, oni: 2 },
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
      spawnInterval: 1350,
      maxAlive: 4,
      minAlive: 2,
      pool: { spectral_deer: 2, star: 2, eagle: 2, thunder_hound: 2, oni: 2 },
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
      spawnInterval: 1300,
      maxAlive: 5,
      minAlive: 2,
      pool: { spectral_deer: 2, star: 2, eagle: 2, thunder_hound: 2, oni: 2 },
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
      spawnInterval: 1200,
      maxAlive: 5,
      minAlive: 3,
      pool: { spectral_deer: 2, star: 2, eagle: 2, thunder_hound: 2, oni: 2 },
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

/* === js/modes/adventure/maps/map13_dark/map.js === */
MapRegistry.register({
  id:         'map13_dark',
  order:      13,
  name:       'Dark Dimension',
  theme:      'dark',
  background: 'assets/maps/map13_dark/background_01.webp',
  stressTarget: 70,
  enemyPool: {
    ravager: { fromWave: 1, weight: 5 },
    crusher: { fromWave: 1, weight: 3 },
    golem:   { fromWave: 1, weight: 2 },
  },
  boss: {
    name: 'Evil Eye',
    desc: 'The final darkness',
    icon: '🕳️',
    enemyPool: { golem: { weight: 10 } },
    killsToAdvance: 40,
    speedMult: 2.0,
    maxEnemies: 6,
  },
  unlocksAbility: null,
});

/* === js/modes/adventure/mapSelect.js === */
/* ═══════════════════════════════════════
   MAPSELECT.JS
   Adventure Mode — map selection screen.
   Carousel with difficulty tiers, cleared
   stamps, and auto-scroll after completion.

   Used by: input.js, adventure/main.js
   Depends on: MapRegistry, Progress,
               dom.js, state.js, audio.js
   ═══════════════════════════════════════ */

let selectedMapId    = null;
let _carouselIndex   = 0;
let _carouselMaps    = [];
let _pendingStampMap = null;

const BOSS_MAP_IDS = ['map04_temple', 'map08_storm', 'map11_dragon', 'map13_dark'];


const DISPLAY_ORDER = [
  'map01_forest', 'map02_dungeon', 'map03_desert',
  'map05_snow', 'map06_beach', 'map07_clouds',
  'map09_volcano', 'map10_sakura', 'map12_moon',
  'map04_temple', 'map08_storm', 'map11_dragon', 'map13_dark'
];

/* ── HELPERS ── */
function _isBossMap(mapId) {
  return BOSS_MAP_IDS.includes(mapId);
}

function _getMapTier(mapId) {
  const d = CONFIG.mapDifficulty;
  if (!d || !d.maps) return null;
  return d.maps[mapId] || null;
}

function _getTierInfo(mapId) {
  const tier = _getMapTier(mapId);
  if (!tier) return null;
  return CONFIG.mapDifficulty.tiers[tier] || null;
}

/* called before navigating to map select after completing a map */
function setPendingStamp(mapId) {
  _pendingStampMap = mapId;
}

/* ── EXTRACT ENEMY IDS FROM MAP DEF ── */
function _getMapEnemyIds(map) {
  const ids = new Set();
  if (map.enemyPool) {
    Object.keys(map.enemyPool).forEach(id => ids.add(id));
  }
  if (map.waveConfig) {
    Object.values(map.waveConfig).forEach(wc => {
      if (wc.pool) Object.keys(wc.pool).forEach(id => ids.add(id));
    });
  }
  if (map.introWaves) {
    Object.values(map.introWaves).forEach(iw => {
      if (iw.pool) iw.pool.forEach(id => ids.add(id));
    });
  }
  return [...ids];
}


/* ── BUILD ── */
function buildMapSelectScreen() {
  const allMaps = MapRegistry.all();
  _carouselMaps = DISPLAY_ORDER
    .map(id => allMaps.find(m => m.id === id))
    .filter(Boolean);

  _carouselIndex = 0;

  // if we just completed a map, start on that map
  if (_pendingStampMap) {
    const stampIdx = _carouselMaps.findIndex(m => m.id === _pendingStampMap);
    if (stampIdx >= 0) _carouselIndex = stampIdx;
  } else {
    // start on first unfinished playable map
    const firstUnfinished = _carouselMaps.findIndex(m =>
      !_isBossMap(m.id) && !Progress.isMapCompleted(m.id)
    );
    if (firstUnfinished >= 0) _carouselIndex = firstUnfinished;
  }

  _buildCarouselTrack();
  _renderCarousel();
  _bindCarouselButtons();
  _buildAbilityPicker();
  _buildSlotButton();

  // set initial map preview background
  const map = _carouselMaps[_carouselIndex];
  const demoEl = document.getElementById('mapselect-demo');
  if (map && map.background && demoEl) {
    demoEl.style.backgroundImage = `url(${map.background})`;
  }

  // trigger stamp slam animation if pending
  if (_pendingStampMap) {
    const pendingId = _pendingStampMap;
    _pendingStampMap = null;
    setTimeout(() => _playStampAndScroll(pendingId), 400);
  }
}


/* ── BUILD SLIDES ── */
function _buildCarouselTrack() {
  const track = document.getElementById('carousel-track');
  track.innerHTML = '';
  const moonDone = Progress.isMapCompleted('map12_moon');

  _carouselMaps.forEach((map, i) => {
    const slide = document.createElement('div');
    slide.className = 'map-slide';
    slide.dataset.index = i;
    slide.dataset.mapId = map.id;

    const bg = map.background || '';
    if (bg) slide.style.backgroundImage = `url('${bg}')`;
    else    slide.style.background = '#333';

    const isBoss = _isBossMap(map.id);
    const tier   = _getMapTier(map.id);

    // tier data attribute for CSS effects
    if (tier) slide.dataset.tier = tier;

    // tier border color
    const tierInfo = _getTierInfo(map.id);
    if (tierInfo) {
      slide.style.borderWidth = '3px';
      slide.style.borderStyle = 'solid';
      slide.style.borderColor = tierInfo.color;
    }

    if (isBoss) {
      slide.classList.add('is-boss');
      slide.classList.add('is-locked');
      if (moonDone) slide.classList.add('is-glitch');
    }

    // lock icon only for boss maps
    if (isBoss) {
      const lock = document.createElement('div');
      lock.className = 'slide-lock';
      lock.textContent = '🔒';
      slide.appendChild(lock);
    }

    // slot badge for maps that give guaranteed free spin
    const hasSlot = CONFIG.abilities.slotAfterMaps.includes(map.id);
    const slotClaimed = Progress.isMapCompleted(map.id) && !Progress.shouldTriggerSlot(map.id);
    if (hasSlot && !isBoss && !slotClaimed) {
      const badge = document.createElement('div');
      badge.className = 'slide-slot-badge';
      badge.innerHTML =
        '<img src="assets/ui/slot_icon.png" alt="slot">' +
        '<span>FREE SPIN!</span>';
      slide.appendChild(badge);
    }

    // cleared stamp for completed maps
    if (Progress.isMapCompleted(map.id)) {
      const stamp = document.createElement('div');
      stamp.className = 'slide-stamp';
      stamp.textContent = 'CLEARED';
      if (tierInfo) stamp.style.color = tierInfo.color;
      // if this is the pending stamp, start hidden for animation
      if (_pendingStampMap === map.id) {
        stamp.classList.add('stamp-pending');
      }
      slide.appendChild(stamp);
    }

    track.appendChild(slide);
  });
}


/* ── RENDER POSITIONS ── */
function _renderCarousel() {
  const maps  = _carouselMaps;
  const idx   = _carouselIndex;
  const map   = maps[idx];
  const slides = document.querySelectorAll('.map-slide');

  const posMap = {
    '-2': 'pos-far-left',
    '-1': 'pos-left',
     '0': 'pos-center',
     '1': 'pos-right',
     '2': 'pos-far-right',
  };

  slides.forEach((slide, i) => {
    slide.className = slide.className
      .replace(/\bpos-\S+/g, '')
      .trim();

    const diff = i - idx;
    if (diff < -2 || diff > 2) {
      slide.classList.add('pos-hidden');
      return;
    }
    const pos = posMap[diff.toString()];
    if (pos) slide.classList.add(pos);
  });

  const isBoss   = _isBossMap(map.id);
  const moonDone = Progress.isMapCompleted('map12_moon');

  // header — map name
  document.getElementById('carousel-map-name').textContent =
    (isBoss && !moonDone) ? '???' : map.name;

  // sub text — tier label or boss text
  const sub = document.getElementById('carousel-map-sub');
  sub.classList.remove('coming-soon');
  const tierInfo = _getTierInfo(map.id);

  if (isBoss && moonDone) {
    sub.textContent = 'COMING SOON';
    sub.style.color = '';
    sub.classList.add('coming-soon');
  } else if (isBoss) {
    sub.textContent = 'BOSS FIGHT';
    sub.style.color = '';
  } else if (tierInfo) {
    sub.textContent = tierInfo.label;
    sub.style.color = tierInfo.color;
  } else {
    sub.textContent = '';
    sub.style.color = '';
  }

  // completed + best score
  const completed = Progress.isMapCompleted(map.id);
  const compEl = document.getElementById('carousel-completed');
  if (compEl) compEl.textContent = '';

  const bestEl = document.getElementById('carousel-best');
  if (bestEl) {
    const key  = 'ds_best_' + map.id;
    const best = localStorage.getItem(key);
    bestEl.textContent = (completed && best) ? 'BEST: ' + best + ' pts' : '';
  }

  // play button — boss always disabled, playable always enabled
  const unlocked = !isBoss;
  const btn      = document.getElementById('btn-map-play');
  btn.disabled   = !unlocked;

  // sync map preview background
  const demoEl = document.getElementById('mapselect-demo');
  if (demoEl && map.background) {
    demoEl.style.backgroundImage = `url(${map.background})`;
    if (isBoss && !moonDone) {
      demoEl.style.filter = 'brightness(0.05)';
    } else if (isBoss) {
      demoEl.style.filter = 'brightness(0.25)';
    } else {
      demoEl.style.filter = '';
    }
  }

  _renderEnemyCard(map);
  _renderProgressBar(map);
}


/* ── STAMP SLAM + AUTO-SCROLL ── */
function _playStampAndScroll(mapId) {
  const map = _carouselMaps[_carouselIndex];
  if (!map) return;

  // animate bar to 100% first, then stamp slam
  const totalWaves = map.totalWaves || 11;
  const container  = document.getElementById('map-progress-bar');

  if (container && Progress.isMapCompleted(map.id)) {
    // render bar empty first, then animate to full
    ProgressBar.render(container, 0, totalWaves, {
      showLabels: true,
      showPct: true,
      isCompleted: false,
    });

   ProgressBar.complete({
      onStep: (idx, total) => SFX.progressTick(idx, total),
    }, () => {
      // bar filled — now slam the stamp
      _doStampSlam();
    });
  } else {
    // no completion animation, just stamp
    _doStampSlam();
  }

  function _doStampSlam() {
    const stamp = document.querySelector('.map-slide.pos-center .slide-stamp.stamp-pending');
    if (stamp) {
      stamp.classList.remove('stamp-pending');
      stamp.classList.add('stamp-slam');
      SFX.stampSlam();
    }
    setTimeout(() => {
      _autoScrollToNext();
    }, 1400);
  }
}

function _autoScrollToNext() {
  // find next uncompleted playable map after current index
  let nextIdx = -1;
  for (let i = _carouselIndex + 1; i < _carouselMaps.length; i++) {
    const m = _carouselMaps[i];
    if (!_isBossMap(m.id) && !Progress.isMapCompleted(m.id)) {
      nextIdx = i;
      break;
    }
  }
  // if nothing ahead, wrap to beginning
  if (nextIdx < 0) {
    for (let i = 0; i < _carouselIndex; i++) {
      const m = _carouselMaps[i];
      if (!_isBossMap(m.id) && !Progress.isMapCompleted(m.id)) {
        nextIdx = i;
        break;
      }
    }
  }
  // all completed or same position — stay
  if (nextIdx < 0 || nextIdx === _carouselIndex) return;

  const dir = nextIdx > _carouselIndex ? 1 : -1;
  const steps = Math.abs(nextIdx - _carouselIndex);
  let step = 0;

  const scrollTimer = setInterval(() => {
    _shiftCarousel(dir);
    step++;
    if (step >= steps) clearInterval(scrollTimer);
  }, 350);
}


/* ── BIND BUTTONS ── */
function _bindCarouselButtons() {
  document.getElementById('carousel-prev').onclick = () => _shiftCarousel(-1);
  document.getElementById('carousel-next').onclick = () => _shiftCarousel(1);
  document.getElementById('btn-map-play').onclick  = () => {
    const map = _carouselMaps[_carouselIndex];
    if (map && !_isBossMap(map.id)) {
      onMapSelected(map.id);
    }
  };

  // challenge mode button
  const chalBtn = document.getElementById('btn-mapsel-challenge');
  if (chalBtn) {
    // click → go to challenge screen
    chalBtn.onclick = () => {
      if (Transition.isPlaying()) return;
      if (typeof DemoMode !== 'undefined') DemoMode.stop();
      Transition.play('fast', () => {
        if (typeof buildChallengeScreen === 'function') {
          buildChallengeScreen();
          showScreen(sChallenge);
        } else {
          showScreen(sMenu);
        }
      });
    };

    // challenge splash on hover (menu style)
    const splash = document.getElementById('mapsel-challenge-splash');
    const splashTexts = [
      'No mercy.\nNo checkpoints.',
      'Endless chaos\nawaits...',
      'Think you are\nready? 💀',
      'How far can\nyou survive?',
    ];
    if (splash) {
      chalBtn.addEventListener('mouseenter', () => {
        const txt = splashTexts[Math.floor(Math.random() * splashTexts.length)];
        splash.textContent = txt;
        splash.classList.add('visible');
      });
      chalBtn.addEventListener('mouseleave', () => {
        splash.classList.remove('visible');
      });
    }
  }
}

function _shiftCarousel(dir) {
  const next = _carouselIndex + dir;
  if (next < 0 || next >= _carouselMaps.length) return;
  _carouselIndex = next;
  SFX.mapSlide();
  _renderCarousel();
}


/* ── MAP SELECTED ── */
function onMapSelected(mapId) {
  if (Transition.isPlaying()) return;
  selectedMapId = mapId;
  SFX.mapConfirm();
  Music.fadeOut(500);
  Transition.play('normal', () => {
    startAdventureMap(mapId, true);
  }, () => {
    startGameLoop();
  });
}


/* ── SHOW BOSS ANNOUNCE ── */
function showBossAnnounce(map) {
  if (!map.boss) return;

  const boss = map.boss;
  const pop  = document.getElementById('boss-announce');

  pop.innerHTML = `
    <div class="boss-announce-icon">${boss.icon || '⚠️'}</div>
    <div class="boss-announce-label">BOSS WAVE</div>
    <div class="boss-announce-name">${boss.name}</div>
    <div class="boss-announce-desc">${boss.desc || ''}</div>
  `;

  pop.classList.remove('hidden');
  pop.classList.add('show');

  setTimeout(() => {
    pop.classList.remove('show');
    setTimeout(() => pop.classList.add('hidden'), 400);
  }, CONFIG.adventure.bossAnnounceMs);
}


/* ── ENEMY HINTS ── */
const ENEMY_HINTS = {
  ravager:       'Charges straight at you',
  crusher:       'Slow but shoots at you',
  golem:         'Very tough, hard to kill',
  slime_large:   'Splits when defeated',
  slime_lava:    'Spits fire, then splits',
  golem_lava:    'Breaks into smaller ones',
  bear:          'Stops and lunges at you',
  crab:          'Pops up from underground',
  scorpion:      'Emerges close, venomous',
  eagle:         'Swoops in, then shoots',
  frog:          'Jumps at you — deflect it!',
  kitsune:       'Sneaks close, then strikes',
  nara_deer:     'Zigzags unpredictably',
  oni:           'Bounces off walls, gets faster',
  parrot:        'Fires two shots in a row',
  spectral_deer: 'Appears and vanishes',
  star:          'Blazing fast — deflect it!',
  thunder_hound: 'Teleports to dodge your first hit',
  tornado:       'Fast spin — deflect it!',
  turtle:        'Armored shell, slow without it',
  wolf:          'Leaps back, charges again faster',
};


/* ── WAVE PROGRESS BAR ── */
function _renderProgressBar(map) {
  const container = document.getElementById('map-progress-bar');
  if (!container) return;

  if (_isBossMap(map.id)) {
    container.style.display = 'none';
    return;
  }
  container.style.display = 'flex';

  const totalWaves  = map.totalWaves || 11;
  const isCompleted = Progress.isMapCompleted(map.id);
  let bestWave = isCompleted ? totalWaves : Progress.getBestWave(map.id);
  if (!isCompleted && bestWave >= totalWaves) bestWave = totalWaves - 1;

  ProgressBar.render(container, bestWave, totalWaves, {
    showLabels: true,
    showPct: true,
    isCompleted: isCompleted,
  });
}

function _renderEnemyCard(map) {
  const list = document.getElementById('enemy-preview-list');
  if (!list) return;
  list.innerHTML = '';

  if (_isBossMap(map.id)) {
    const hint = document.createElement('div');
    hint.className = 'enemy-preview-hint';
    hint.textContent = '???';
    hint.style.textAlign = 'center';
    hint.style.width = '100%';
    list.appendChild(hint);
    return;
  }

  const ids = _getMapEnemyIds(map);
  ids.forEach(id => {
    const def = EnemyRegistry.get(id);
    if (!def) return;

    const row = document.createElement('div');
    row.className = 'enemy-preview';

    const icon = document.createElement('div');
    icon.className = 'enemy-preview-icon';
    if (def.sprite) {
      icon.style.backgroundImage = `url(${def.sprite})`;
      if (def.spriteFrames && def.spriteFrames > 1) {
        const fw = def.spriteFrameW || 96;
        const fh = def.spriteFrameH || 96;
        const scale = 22 / fh;
        icon.style.backgroundSize = `${Math.round(fw * def.spriteFrames * scale)}px 22px`;
        icon.style.backgroundPosition = '0 0';
      }
    }

    const hint = document.createElement('div');
    hint.className = 'enemy-preview-hint';
    hint.textContent = ENEMY_HINTS[id] || def.name || id;

    row.appendChild(icon);
    row.appendChild(hint);
    list.appendChild(row);
  });
}

/* ── SLOT BUTTON (menu) ── */
function _buildSlotButton() {
  const btn = document.getElementById('slot-menu-btn');
  if (!btn) return;

  const hasLocked = Progress.getLockedAbilities().length > 0;
  const canVideo  = Progress.canUseMenuVideo();

  if (!hasLocked || !canVideo) {
    btn.classList.add('hidden');
    return;
  }

  const used = Progress.getMenuVideosUsed();
  const max  = CONFIG.abilities.menuSlots.maxVideos;
  const left = max - used;
  document.getElementById('slot-menu-count').textContent = left + ' left';

  btn.classList.remove('hidden');
  btn.onclick = _onSlotMenuClick;
}

function _onSlotMenuClick(e) {
  if (e) { e.stopPropagation(); e.preventDefault(); }

  if (typeof SlotMachine === 'undefined') return;
  if (!Progress.canUseMenuVideo()) return;
  if (Progress.getLockedAbilities().length === 0) return;

  SlotMachine.open({
    mode: 'menu',
    onResult: (_abilityId) => {
      _buildAbilityPicker();
    },
    onClose: () => {
      _buildSlotButton();
    },
  });
}

/* ═══════════════════════════════════════
   ABILITY PICKER — mini carousel
   ═══════════════════════════════════════ */
let _abilityList  = [];
let _abilityIndex = 0;

function _buildAbilityPicker() {
  const all      = AbilityRegistry.all();
  const unlocked = all.filter(a => Progress.isAbilityUnlocked(a.id));
  const locked   = all.filter(a => !Progress.isAbilityUnlocked(a.id));
  _abilityList   = [...unlocked, ...locked];

  const equipped = getEquippedAbility();
  const eqIdx    = _abilityList.findIndex(a => a.id === equipped);
  _abilityIndex  = eqIdx >= 0 ? eqIdx : 0;

  if (!Progress.isAbilityUnlocked(equipped)) {
    const def = CONFIG.abilities.defaultAbility;
    saveEquippedAbility(def);
    _abilityIndex = _abilityList.findIndex(a => a.id === def);
    if (_abilityIndex < 0) _abilityIndex = 0;
  }

  _renderAbilityPicker();

  const prev = document.getElementById('ability-prev');
  const next = document.getElementById('ability-next');
  if (prev) prev.onclick = () => {
    _abilityIndex = (_abilityIndex - 1 + _abilityList.length) % _abilityList.length;
    _applyAbilityPick();
  };
  if (next) next.onclick = () => {
    _abilityIndex = (_abilityIndex + 1) % _abilityList.length;
    _applyAbilityPick();
  };
}

function _applyAbilityPick() {
  const ab = _abilityList[_abilityIndex];
  if (!ab) return;
  if (Progress.isAbilityUnlocked(ab.id)) {
    saveEquippedAbility(ab.id);
  }
  _renderAbilityPicker();
}

function _renderAbilityPicker() {
  const ab = _abilityList[_abilityIndex];
  if (!ab) return;

  const img      = document.getElementById('ability-pick-img');
  const nameEl   = document.getElementById('ability-pick-name');
  const wrap     = document.getElementById('ability-card-select');
  const isLocked = !Progress.isAbilityUnlocked(ab.id);

  if (img) {
    img.src = 'assets/abilities/' + ab.id + '.png';
    img.style.filter = isLocked ? 'brightness(0.3) grayscale(1)' : 'none';
  }

  if (nameEl) {
    nameEl.textContent = isLocked ? '🔒 ' + ab.name : ab.name;
  }

  const descEl = document.getElementById('ability-pick-desc');
  if (descEl) {
    descEl.textContent = ab.desc || '';
  }

  if (wrap) {
    const rarity = CONFIG.abilities.rarities[ab.id] || 'rare';
    const colors = { rare: '#4488ff', epic: '#aa44ff', legendary: '#ffd700' };
    wrap.style.borderColor = colors[rarity] || '#4488ff';
    wrap.style.opacity = isLocked ? '0.6' : '1';
  }
}

function initMapSelect() {
  buildMapSelectScreen();
}

/* === js/debug.js === */
/* ═══════════════════════════════════════
   DEBUG.JS
   Debug overlay + hotkeys for testing.
   Active only when CONFIG.debug = true.
   Zero overhead when disabled.

   Loaded LAST in index.html.
   Reads game state passively — never
   modifies game logic.

   Hotkeys:
     Q — skip wave timer to 10s remaining
     G — toggle Frost Touch III
     R — full reset (menu/map select only)

   Depends on: config.js, state.js,
               adventureDirector.js,
               challengeDirector.js, orbs.js
   ═══════════════════════════════════════ */

(() => {
  if (!CONFIG.debug) return;

  /* ── HELPERS ────────────────────────── */

  function isDirectorActive() {
    if (typeof ActiveDirector === 'undefined' || !ActiveDirector) return false;
    if (typeof AdventureDirector !== 'undefined' && ActiveDirector === AdventureDirector) return true;
    if (typeof ChallengeDirector !== 'undefined' && ActiveDirector === ChallengeDirector) return true;
    return false;
  }

  function isChallenge() {
    return typeof ChallengeDirector !== 'undefined' && ActiveDirector === ChallengeDirector;
  }

  /* ── PANEL DOM ─────────────────────── */
  const panel = document.createElement('div');
  panel.id = 'debug-panel';
  panel.style.cssText =
    'position:fixed;top:8px;right:8px;' +
    'background:rgba(0,0,0,0.88);color:#0f0;' +
    'font-family:"Courier New",monospace;font-size:11px;' +
    'padding:8px 10px;border:1px solid #0f0;border-radius:4px;' +
    'z-index:9999;pointer-events:none;' +
    'line-height:1.4;white-space:pre;overflow:hidden;' +
    'image-rendering:auto;display:flex;gap:12px;';
  document.body.appendChild(panel);

  /* ── HOTKEYS ────────────────────────── */
  document.addEventListener('keydown', (e) => {
    // Q — skip wave to 10s remaining
    if (e.key === 'q' || e.key === 'Q') {
      if (!running) return;
      if (!isDirectorActive()) return;
      ActiveDirector.debugSkipTimer();
    }

    // G — toggle Frost Touch III (45% freeze chance)
    if (e.key === 'g' || e.key === 'G') {
      if (!running || !player) return;
      if (player._frostChance > 0) {
        player._frostChance = 0;
        console.log('[DEBUG] Frost Touch OFF');
      } else {
        player._frostChance = 0.45;
        console.log('[DEBUG] Frost Touch III ON (45%)');
      }
    }

    // R — full reset (clear all localStorage game data)
    if (e.key === 'r' || e.key === 'R') {
      if (running) return;
      if (typeof Progress !== 'undefined') {
        Progress.reset();
        Object.keys(localStorage).forEach(k => {
          if (k.startsWith('ds_')) localStorage.removeItem(k);
        });
        localStorage.removeItem('ds_equipped_ability');
        console.log('[DEBUG] FULL RESET — all progress cleared');
        if (typeof buildMapSelectScreen === 'function') {
          buildMapSelectScreen();
        }
      }
    }
  });

  /* ── FORMAT HELPERS ─────────────────── */

  function ms2s(ms) {
    return (ms / 1000).toFixed(1) + 's';
  }

  function fmtPool(wc) {
    if (!wc || !wc.pool) return '—';
    return Object.entries(wc.pool)
      .map(([name, w]) => name + ':' + w)
      .join(' ');
  }

  function fmtBool(v) {
    return v ? 'YES' : 'no';
  }

  /* ── SECTION BUILDERS ──────────────── */

  function buildWaveSection(d) {
    let s = '═══ WAVE ═══════════════════\n';
    s += 'Wave:      ' + d.wave + (d.totalWaves ? ' / ' + d.totalWaves : ' (∞)') + '\n';
    s += 'Timer:     ' + ms2s(d.waveTimeLeft) + ' / ' + ms2s(d.waveDuration) + '\n';
    s += 'Elapsed:   ' + ms2s(d.waveElapsed) + '\n';
    s += 'Draining:  ' + fmtBool(d.draining) + '\n';
    s += 'Final:     ' + fmtBool(d.isFinalWave) + '\n';
    s += 'UpgradeW:  ' + fmtBool(d.isUpgradeWave) + '\n';
    return s;
  }

  function buildSpawnSection(d) {
    const wc = d.waveConfig;
    let s = '═══ SPAWN ══════════════════\n';
    s += 'Interval:  ' + d.spawnInterval + 'ms\n';
    s += 'MaxAlive:  ' + d.maxAlive + '\n';
    s += 'MinAlive:  ' + d.minAlive + '\n';
    s += 'OnField:   ' + enemies.length + '\n';
    s += 'Bullets:   ' + bullets.length + '\n';
    s += 'StaggerQ:  ' + (d.staggerQueue || 0) + '\n';
    s += 'DirCD:     ' + (d.dirCooldown || 0) + 'ms\n';
    s += 'InputRate: ' + d.inputRate + '\n';
    if (d.combos) {
      s += 'Combos:    ';
      const entries = Object.entries(d.combos);
      s += entries.map(([p, v]) => {
        const w = (typeof v === 'object') ? v.weight : v;
        return p + ':' + w;
      }).join(' ') + '\n';
    }
    return s;
  }

  function buildPoolSection(d) {
    const wc = d.waveConfig;
    let s = '═══ POOL ═══════════════════\n';
    s += fmtPool(wc) + '\n';
    return s;
  }

  function buildEnemySection() {
    let s = '═══ ENEMIES ════════════════\n';
    if (enemies.length === 0) {
      s += '(none)\n';
      return s;
    }
    const counts = {};
    for (const e of enemies) {
      const n = e.name || e.def.id || '?';
      counts[n] = (counts[n] || 0) + 1;
    }
    for (const [name, count] of Object.entries(counts)) {
      s += '  ' + name + ': ' + count + '\n';
    }
    return s;
  }

  function buildSpeedSection() {
    let s = '═══ SPEED ══════════════════\n';
    const map = ActiveDirector.getCurrentMap ? ActiveDirector.getCurrentMap() : null;
    const w = ActiveDirector.getWave ? ActiveDirector.getWave() : 1;
    const si = (map && map.speedIncreasePerLevel)
      ? map.speedIncreasePerLevel
      : CONFIG.difficulty.speedIncreasePerLevel;
    const rawMult = 1 + (w - 1) * si;
    const cappedMult = Math.min(CONFIG.difficulty.maxSpeedMult, rawMult);
    s += 'WaveMult:  ' + cappedMult.toFixed(2) + '\n';
    if (player && player.speedMultiplier !== 1) {
      s += 'PlayerSM:  ' + player.speedMultiplier.toFixed(2) + '\n';
    }
    return s;
  }

  function buildOrbSection() {
    let s = '═══ ORBS ═══════════════════\n';
    if (typeof OrbSystem === 'undefined' || !OrbSystem._debug) {
      s += '(not loaded)\n';
      return s;
    }
    const o = OrbSystem._debug();
    s += 'Active:    ' + (o.activeOrb ? o.activeOrb + ' (' + o.activeOrbDir + ')' : 'none') + '\n';
    s += 'Cooldown:  ' + ms2s(Math.max(0, o.cooldownMs)) + '\n';
    s += 'NextRoll:  ' + ms2s(Math.max(0, o.rollTimerMs)) + '\n';
    s += 'Heal%:     ' + (o.healChance * 100).toFixed(1) + '%\n';
    s += 'Atk%:      ' + (o.attackChance * 100).toFixed(1) + '%\n';
    s += 'Def%:      ' + (o.defenseChance * 100).toFixed(1) + '%\n';
    if (o.orbBonus > 0) {
      s += 'Bonus:     +' + (o.orbBonus * 100).toFixed(1) + '%\n';
    }
    if (o.attackBuffMs > 0) {
      s += 'AtkBuff:   ' + ms2s(o.attackBuffMs) + '\n';
    }
    if (o.defenseBuffMs > 0) {
      s += 'DefBuff:   ' + ms2s(o.defenseBuffMs) + '\n';
    }
    return s;
  }

  function buildPlayerSection() {
    let s = '═══ PLAYER ═════════════════\n';
    if (!player) {
      s += '(no player)\n';
      return s;
    }
    s += 'HP:        ' + player.hp + ' / ' + player.maxHp + '\n';
    s += 'Special:   ' + Math.round(player.specialCharge) + '%\n';
    s += 'SpecActv:  ' + fmtBool(player.specialActive) + '\n';
    s += 'Combo:     ' + player.combo + '\n';
    if (player.ability) {
      s += 'Ability:   ' + player.ability.id + '\n';
    }
    return s;
  }

  function buildGateSection() {
    let s = '═══ GATES ══════════════════\n';
    if (typeof dirGateEnemies === 'undefined') return s + '(n/a)\n';

    const now = performance.now();
    const { w, h } = getArenaSize();
    const cx = w / 2;
    const cy = h / 2;
    const map = ActiveDirector.getCurrentMap ? ActiveDirector.getCurrentMap() : null;
    const mapGate = (map && map.gateThreshold !== undefined) ? map.gateThreshold : 0.40;
    const gate = Math.min(w, h) * mapGate;

    for (const dir of ['up', 'down', 'left', 'right']) {
      const list = dirGateEnemies[dir];
      let alive = 0;
      let ghost = 0;
      for (const e of list) {
        if (e.isAlive()) alive++;
        else ghost++;
      }

      // cooldown remaining
      const cdLeft = typeof _dirCooldownUntil !== 'undefined'
        ? Math.max(0, _dirCooldownUntil[dir] - now)
        : 0;

      // gate blocked? check last alive enemy distance
      let gateBlocked = false;
      let lastDist = -1;
      if (alive > 0) {
        for (let i = list.length - 1; i >= 0; i--) {
          if (list[i].isAlive()) {
            lastDist = list[i].distToCenter(cx, cy);
            gateBlocked = lastDist > gate;
            break;
          }
        }
      }

      let status = '';
      if (cdLeft > 0) status = 'CD:' + Math.round(cdLeft) + 'ms';
      else if (gateBlocked) status = 'GATE:' + Math.round(lastDist);
      else status = 'FREE';

      s += '  ' + dir.padEnd(6) + ': ' + alive + ' alive';
      if (ghost > 0) s += ' +' + ghost + '☠';
      s += ' [' + status + ']\n';
    }
    return s;
  }

  // Challenge-specific section
  function buildChallengeSection(d) {
    let s = '═══ CHALLENGE ══════════════\n';
    s += 'MapIdx:    ' + (d.mapIndex !== undefined ? d.mapIndex : '?') + '\n';
    s += 'MapsCompl: ' + (d.mapsCompleted !== undefined ? d.mapsCompleted : '?') + '\n';
    s += 'Choices:   ' + (d.choiceCount !== undefined ? d.choiceCount : '?') + '\n';
    s += 'NextChoice:' + (d.nextChoiceType || '?') + '\n';
    s += 'BestWave:  ' + (d.bestWave !== undefined ? d.bestWave : '?') + '\n';
    return s;
  }

  /* ── UPDATE LOOP ───────────────────── */

  function update() {
    if (!CONFIG.debug) return;

    panel.innerHTML = '';

    if (running && isDirectorActive()) {
      const d = ActiveDirector._debug();
      const map = ActiveDirector.getCurrentMap();
      const challenge = isChallenge();

      // column 1
      let c1 = '⚙ DEBUG' + (challenge ? ' [CHALLENGE]' : '') + '\n';
      c1 += 'Map: ' + (map ? map.name : '?') + '\n\n';
      c1 += buildWaveSection(d);
      c1 += '\n';
      c1 += buildSpawnSection(d);
      c1 += '\n';
      c1 += buildPoolSection(d);

      // column 2
      let c2 = '';
      c2 += buildEnemySection();
      c2 += '\n';
      c2 += buildSpeedSection();
      c2 += '\n';
      c2 += buildGateSection();
      c2 += '\n';
      c2 += buildOrbSection();
      c2 += '\n';
      c2 += buildPlayerSection();
      if (challenge) {
        c2 += '\n';
        c2 += buildChallengeSection(d);
      }
      c2 += '\n[Q] skip to 10s';
      c2 += '\n[R] reset all (menu only)';
      c2 += '\n[G] frost ' + (player && player._frostChance > 0 ? 'ON ' + Math.round(player._frostChance * 100) + '%' : 'off');

      const col1 = document.createElement('div');
      col1.textContent = c1;
      const col2 = document.createElement('div');
      col2.textContent = c2;
      panel.appendChild(col1);
      panel.appendChild(col2);

    } else if (running) {
      let txt = '⚙ DEBUG (infinite)\n\n';
      txt += buildEnemySection();
      txt += '\n';
      txt += buildPlayerSection();
      const col = document.createElement('div');
      col.textContent = txt;
      panel.appendChild(col);
    } else {
      const col = document.createElement('div');
      col.textContent = '⚙ DEBUG\n(not in game)';
      panel.appendChild(col);
    }

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);

})();

/* === ADVENTURE PRE-LOADED === */
_adventureLoaded = true;
