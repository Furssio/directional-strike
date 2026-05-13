/* ═══════════════════════════════════════
   MAPSELECT.JS
   Adventure Mode — map selection screen.
   Builds a vertical list of maps showing
   locked / unlocked / completed state.

   Used by: input.js (menu navigation),
            adventure/main.js
   Depends on: MapRegistry, Progress,
               dom.js, state.js, audio.js
   ═══════════════════════════════════════ */

let selectedMapId  = null;
let _carouselIndex = 0;
let _carouselMaps  = [];

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

function _allPlayableCompleted() {
  return DISPLAY_ORDER
    .filter(id => !_isBossMap(id))
    .every(id => Progress.isMapCompleted(id));
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
  // sort maps by visual display order
  const allMaps = MapRegistry.all();
  _carouselMaps = DISPLAY_ORDER
    .map(id => allMaps.find(m => m.id === id))
    .filter(Boolean);

  _carouselIndex = 0;

  // start on first unfinished playable map
  const firstUnfinished = _carouselMaps.findIndex(m =>
    !_isBossMap(m.id) &&
    Progress.isMapUnlocked(m.id) &&
    !Progress.isMapCompleted(m.id)
  );
  if (firstUnfinished >= 0) _carouselIndex = firstUnfinished;

  _buildCarouselTrack();
  _renderCarousel();
  _bindCarouselButtons();
  _buildAbilityPicker();

  // set initial map preview background
  const map = _carouselMaps[_carouselIndex];
  const demoEl = document.getElementById('mapselect-demo');
  if (map && map.background && demoEl) {
    demoEl.style.backgroundImage = `url(${map.background})`;
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

    const bg = map.background || '';
    if (bg) slide.style.backgroundImage = `url('${bg}')`;
    else    slide.style.background = '#333';

    const isBoss = _isBossMap(map.id);

    if (isBoss) {
      slide.classList.add('is-boss');
      slide.classList.add('is-locked');
      // glitch effect only after moon completed
      if (moonDone) slide.classList.add('is-glitch');
    } else {
      const unlocked = Progress.isMapUnlocked(map.id);
      if (!unlocked) slide.classList.add('is-locked');
    }

    // lock icon for boss and locked maps
    if (isBoss || !Progress.isMapUnlocked(map.id)) {
      const lock = document.createElement('div');
      lock.className = 'slide-lock';
      lock.textContent = '🔒';
      slide.appendChild(lock);
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

  // visual level number (1-based index in display order)
  const visualLevel = DISPLAY_ORDER.indexOf(map.id) + 1;
  const isBoss      = _isBossMap(map.id);
  const moonDone    = Progress.isMapCompleted('moon');

  // header
  document.getElementById('carousel-map-name').textContent =
    (isBoss && !moonDone) ? map.name : map.name;

  // sub text
  const sub = document.getElementById('carousel-map-sub');
  sub.classList.remove('coming-soon');
  if (isBoss && moonDone) {
    sub.textContent = 'COMING SOON';
    sub.classList.add('coming-soon');
  } else if (isBoss) {
    sub.textContent = 'LOCKED';
  } else {
    sub.textContent = `level ${visualLevel}`;
  }

  // completed
  const completed = Progress.isMapCompleted(map.id);
  document.getElementById('carousel-completed').textContent =
    completed ? '✓ COMPLETED' : '';

  // best score
  const bestEl = document.getElementById('carousel-best');
  if (bestEl) {
    const key  = 'ds_best_' + map.id;
    const best = localStorage.getItem(key);
    bestEl.textContent = (completed && best) ? 'BEST: ' + best + ' pts' : '';
  }

  // play button — boss always disabled
  const unlocked = !isBoss && Progress.isMapUnlocked(map.id);
  const btn      = document.getElementById('btn-map-play');
  btn.disabled   = !unlocked;

  // sync map preview background
  const demoEl = document.getElementById('mapselect-demo');
  if (demoEl && map.background) {
    demoEl.style.backgroundImage = `url(${map.background})`;
  }

  // enemy card — hide for boss maps
  _renderEnemyCard(map);
}


/* ── BIND BUTTONS ── */
function _bindCarouselButtons() {
  document.getElementById('carousel-prev').onclick = () => _shiftCarousel(-1);
  document.getElementById('carousel-next').onclick = () => _shiftCarousel(1);
  document.getElementById('btn-map-play').onclick  = () => {
    const map = _carouselMaps[_carouselIndex];
    if (map && !_isBossMap(map.id) && Progress.isMapUnlocked(map.id)) {
      onMapSelected(map.id);
    }
  };
}

function _shiftCarousel(dir) {
  const next = _carouselIndex + dir;
  if (next < 0 || next >= _carouselMaps.length) return;
  _carouselIndex = next;
  _renderCarousel();
}


/* ── MAP SELECTED ── */
function onMapSelected(mapId) {
  if (Transition.isPlaying()) return;
  selectedMapId = mapId;
  SFX.abilityPick();
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
  ravager:       'Fast rusher',
  crusher:       'Shoots bullets',
  golem:         'Tanky, 3 hits',
  slime_large:   'Splits in two',
  slime_lava:    'Spits lava',
  golem_lava:    'Splits sideways',
  bear:          'Charges attack',
  crab:          'Emerges + spawns',
  scorpion:      'Poison sting',
  eagle:         'Rush then shoot',
  frog:          'Parryable jumps',
  kitsune:       'Lunges close',
  nara_deer:     'Changes direction',
  oni:           '4 hits, bounces',
  parrot:        'Double shot',
  spectral_deer: 'Fades in/out',
  star:          'Very fast, parry',
  thunder_hound: 'Dodges first hit',
  tornado:       'Fast, parryable',
  turtle:        'Shell then slow',
  wolf:          'Bounces back',
};

function _renderEnemyCard(map) {
  const list = document.getElementById('enemy-preview-list');
  if (!list) return;
  list.innerHTML = '';

  // hide enemies for boss maps
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


/* ═══════════════════════════════════════
   ABILITY PICKER — mini carousel
   ═══════════════════════════════════════ */
let _abilityList  = [];
let _abilityIndex = 0;

function _buildAbilityPicker() {
  _abilityList = AbilityRegistry.all();
  const equipped = getEquippedAbility();
  _abilityIndex = Math.max(0, _abilityList.findIndex(a => a.id === equipped));
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
  saveEquippedAbility(ab.id);
  _renderAbilityPicker();
}

function _renderAbilityPicker() {
  const ab = _abilityList[_abilityIndex];
  if (!ab) return;
  const img  = document.getElementById('ability-pick-img');
  const name = document.getElementById('ability-pick-name');
  if (img)  img.src = 'assets/abilities/' + ab.id + '.png';
  if (name) name.textContent = ab.name;
}