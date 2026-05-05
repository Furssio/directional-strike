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

const BOSS_ORDERS = [4, 8, 11, 13];


/* ── EXTRACT ENEMY IDS FROM MAP DEF ── */
function _getMapEnemyIds(map) {
  const ids = new Set();

  // from enemyPool keys
  if (map.enemyPool) {
    Object.keys(map.enemyPool).forEach(id => ids.add(id));
  }

  // from waveConfig pools
  if (map.waveConfig) {
    Object.values(map.waveConfig).forEach(wc => {
      if (wc.pool) Object.keys(wc.pool).forEach(id => ids.add(id));
    });
  }

  // from introWaves
  if (map.introWaves) {
    Object.values(map.introWaves).forEach(iw => {
      if (iw.pool) iw.pool.forEach(id => ids.add(id));
    });
  }

  return [...ids];
}

/* ── BUILD ── */
function buildMapSelectScreen() {
  _carouselMaps  = MapRegistry.all();
  _carouselIndex = 0;

  const firstUnfinished = _carouselMaps.findIndex(m =>
    Progress.isMapUnlocked(m.id) && !Progress.isMapCompleted(m.id)
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

/* ── CREA LE SLIDE ── */
function _buildCarouselTrack() {
  const track = document.getElementById('carousel-track');
  track.innerHTML = '';

  _carouselMaps.forEach((map, i) => {
    const slide = document.createElement('div');
    slide.className  = 'map-slide';
    slide.dataset.index = i;

    const bg = map.background || '';
    if (bg) slide.style.backgroundImage = `url('${bg}')`;
    else    slide.style.background = '#333';

    if (BOSS_ORDERS.includes(map.order)) slide.classList.add('is-boss');

    const unlocked = Progress.isMapUnlocked(map.id);
    if (!unlocked) slide.classList.add('is-locked');

    track.appendChild(slide);
  });
}

/* ── RENDER POSIZIONI ── */
function _renderCarousel() {
  const maps  = _carouselMaps;
  const idx   = _carouselIndex;
  const map   = maps[idx];
  const slides = document.querySelectorAll('.map-slide');

  // posizioni relative all'indice corrente
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
    const key  = Math.max(-2, Math.min(2, diff)).toString();
    const pos  = posMap[key];
    if (pos) slide.classList.add(pos);
  });

  // header
  const isBoss = BOSS_ORDERS.includes(map.order);
  document.getElementById('carousel-map-name').textContent = map.name;
  document.getElementById('carousel-map-sub').textContent  =
    isBoss ? '⚔️ BOSS FIGHT' : `level ${map.order}`;

  // completed
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

  // play button
  const unlocked = Progress.isMapUnlocked(map.id);
  const btn      = document.getElementById('btn-map-play');
  btn.disabled   = !unlocked;

// sync map preview background
  const demoEl = document.getElementById('mapselect-demo');
  if (demoEl && map.background) {
    demoEl.style.backgroundImage = `url(${map.background})`;
  }

  // render enemy card
  _renderEnemyCard(map);
}

/* ── BIND BOTTONI ── */
function _bindCarouselButtons() {
  document.getElementById('carousel-prev').onclick = () => _shiftCarousel(-1);
  document.getElementById('carousel-next').onclick = () => _shiftCarousel(1);
  document.getElementById('btn-map-play').onclick  = () => {
    const map = _carouselMaps[_carouselIndex];
    if (map && Progress.isMapUnlocked(map.id)) onMapSelected(map.id);
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
  selectedMapId = mapId;
  SFX.abilityPick();
  startAdventureMap(mapId);
}
/* ── SHOW BOSS ANNOUNCE ────────────────
   Called by AdventureDirector when wave 10
   starts. Shows a centered popup with the
   boss name for ~2 seconds.
   @param map  current map def with boss config
─────────────────────────────────────── */
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
/* ── SHOW MAP COMPLETE ──────────────────
   Called by AdventureDirector when map is done.
   Shows popup, then auto-returns to map select.
─────────────────────────────────────── */
function showMapComplete(map, newlyUnlocked) {
  const sMapComplete = document.getElementById('screen-map-complete');

  document.getElementById('map-complete-icon').textContent = map.icon || '🗺️';
  document.getElementById('map-complete-name').textContent = map.name;

  const abilityBlock = document.getElementById('map-complete-ability');

  if (newlyUnlocked && map.unlocksAbility) {
    const ab = AbilityRegistry.get(map.unlocksAbility);
    if (ab) {
      document.getElementById('map-complete-ability-icon').textContent = ab.icon;
      document.getElementById('map-complete-ability-name').textContent = ab.name;
      document.getElementById('map-complete-ability-desc').textContent = ab.desc;
      abilityBlock.classList.remove('hidden');
    } else {
      abilityBlock.classList.add('hidden');
    }
  } else {
    abilityBlock.classList.add('hidden');
  }

  [sMenu, sGame, sOver, sAbility, sMapSelect].forEach(x => x.style.display = 'none');
  sMapComplete.style.display = 'block';

  // auto-ritorno dopo 6 secondi
  const autoTimer = setTimeout(() => _returnToMapSelect(), 6000);

  document.getElementById('btn-map-continue').onclick = () => {
    clearTimeout(autoTimer);
    _returnToMapSelect();
  };

  document.getElementById('btn-go-abilities').onclick = () => {
    clearTimeout(autoTimer);
    buildAbilityScreen();
    showScreen(sAbility);
  };
}

function _returnToMapSelect() {
  buildMapSelectScreen();
  const sMapComplete = document.getElementById('screen-map-complete');
  sMapComplete.style.display = 'none';
  showScreen(sMapSelect);
}

/* ── ENEMY HINTS (short descriptions) ── */
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
      // show only first frame
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