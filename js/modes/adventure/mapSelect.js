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