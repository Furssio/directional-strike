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

let selectedMapId = null;

/* ── BUILD MAP SELECT SCREEN ────────── */
function buildMapSelectScreen() {
  const list = document.getElementById('map-list');
  list.innerHTML = '';

  MapRegistry.all().forEach(map => {
    const unlocked  = Progress.isMapUnlocked(map.id);
    const completed = Progress.isMapCompleted(map.id);

    const card = document.createElement('div');
    card.className = 'map-card'
      + (unlocked  ? ' unlocked'  : ' locked')
      + (completed ? ' completed' : '');

    card.innerHTML = `
      <div class="map-order">${map.order}</div>
      <div class="map-icon">${map.icon || '🗺️'}</div>
      <div class="map-info">
        <div class="map-name">${map.name}</div>
        <div class="map-status">${_statusLabel(unlocked, completed)}</div>
      </div>
      <div class="map-badge">${completed ? '✓' : unlocked ? '▶' : '🔒'}</div>
    `;

    if (unlocked) {
      card.addEventListener('click',      () => onMapSelected(map.id));
      card.addEventListener('touchstart', e => {
        e.preventDefault();
        onMapSelected(map.id);
      }, { passive: false });
    }

    list.appendChild(card);
  });
}

function _statusLabel(unlocked, completed) {
  if (completed) return 'completed';
  if (unlocked)  return 'tap to play';
  return 'locked';
}

/* ── MAP SELECTED ────────────────────── */
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