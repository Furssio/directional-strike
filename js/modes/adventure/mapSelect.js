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