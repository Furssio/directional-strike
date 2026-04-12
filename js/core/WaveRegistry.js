/* ═══════════════════════════════════════
   WAVEREGISTRY.JS
   Central registry for wave definitions.
   Each wave registers its own config —
   stress target, enemy pool, special events.

   Used by: modes/infinite/waves.js
   Depends on: nothing
   ═══════════════════════════════════════ */

const WaveRegistry = (() => {

  const _waves = {};

  return {

    register(def) {
      if (_waves[def.wave]) {
        console.warn(`WaveRegistry: wave "${def.wave}" already registered.`);
        return;
      }
      _waves[def.wave] = def;
    },

    get(wave) {
      return _waves[wave] || null;
    },

    all() {
      return Object.values(_waves)
        .sort((a, b) => a.wave - b.wave);
    },

  };

})();