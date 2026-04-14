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
  'js/modes/adventure/adventureDirector.js',

  /* ── MAPS ── */
  'js/modes/adventure/maps/map01_forest/map.js',

  /* ── UI ── */
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

  (function loadScript(i) {
    if (i >= ADVENTURE_SCRIPTS.length) {
      _adventureLoaded = true;
      if (callback) callback();
      return;
    }

    const s = document.createElement('script');
    s.src   = ADVENTURE_SCRIPTS[i];
    s.onload  = () => loadScript(i + 1);
    s.onerror = e => console.error('Failed to load:', ADVENTURE_SCRIPTS[i], e);
    document.head.appendChild(s);
  })(0);
}

/* ── START ADVENTURE MAP ────────────────
   Called by mapSelect when user picks a map.
   @param mapId  id from MapRegistry
─────────────────────────────────────── */
function startAdventureMap(mapId) {
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
  startGame();

  // overwrite initial wave display for adventure
  if (typeof updateWaveDisplay === 'function') {
    updateWaveDisplay(1, false);
  }
}