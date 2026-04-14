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