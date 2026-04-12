/* ═══════════════════════════════════════
   CHARACTERREGISTRY.JS
   Central registry for all playable
   characters. Each character file calls
   CharacterRegistry.register() to add
   itself. The system never hardcodes
   character lists anywhere else.

   Used by: ui/screens.js, Player.js
   Depends on: nothing
   ═══════════════════════════════════════ */

const CharacterRegistry = (() => {

  const _characters = {};

  return {

    /* ── REGISTER ───────────────────────
       Called by each character file.
       @param def  character definition object
    ─────────────────────────────────────── */
    register(def) {
      if (_characters[def.id]) {
        console.warn(`CharacterRegistry: "${def.id}" already registered.`);
        return;
      }
      _characters[def.id] = def;
    },

    /* ── GET ────────────────────────────
       @param id  character id string
       @return    character definition or null
    ─────────────────────────────────────── */
    get(id) {
      return _characters[id] || null;
    },

    /* ── ALL ────────────────────────────
       Returns all registered characters
       as an array.
    ─────────────────────────────────────── */
    all() {
      return Object.values(_characters);
    },

  };

})();