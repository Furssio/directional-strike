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

/* ── BUILD ── */
function buildMapSelectScreen() {
  _carouselMaps  = MapRegistry.all();
  _carouselIndex = 0;

  // parti dalla prima mappa non completata, o la prima
  const firstUnfinished = _carouselMaps.findIndex(m =>
    Progress.isMapUnlocked(m.id) && !Progress.isMapCompleted(m.id)
  );
  if (firstUnfinished >= 0) _carouselIndex = firstUnfinished;

  _buildCarouselTrack();
  _renderCarousel();
  _bindCarouselButtons();
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
  const completed = Progress.isMapCompleted(map.id);
  document.getElementById('carousel-completed').textContent =
    completed ? 'COMPLETED' : '';

  // play button
  const unlocked = Progress.isMapUnlocked(map.id);
  const btn      = document.getElementById('btn-map-play');
  btn.disabled   = !unlocked;
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