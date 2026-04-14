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