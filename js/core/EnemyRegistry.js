/* ═══════════════════════════════════════
   ENEMYREGISTRY.JS
   Central registry for all enemy types.
   Each enemy file calls
   EnemyRegistry.register() to add itself.

   Used by: modes/infinite/spawner.js
   Depends on: nothing
   ═══════════════════════════════════════ */

const EnemyRegistry = (() => {

  const _enemies = {};

  return {

    register(def) {
      if (_enemies[def.id]) {
        console.warn(`EnemyRegistry: "${def.id}" already registered.`);
        return;
      }
      _enemies[def.id] = def;
    },

    get(id) {
      return _enemies[id] || null;
    },

    all() {
      return Object.values(_enemies);
    },

  };

})();