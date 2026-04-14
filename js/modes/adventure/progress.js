/* ═══════════════════════════════════════
   PROGRESS.JS
   Adventure Mode progression — saved in
   localStorage.

   Tracks:
   - which maps have been completed
   - which abilities have been unlocked

   A map is UNLOCKED if:
   - it's the first map (order === 1), or
   - the previous map (by order) is completed

   An ability is UNLOCKED if:
   - it was granted by completing a map, or
   - it was unlocked via rewarded ad (future)

   Used by: mapSelect.js, adventureDirector.js,
            ui/abilityScreen.js
   Depends on: MapRegistry
   ═══════════════════════════════════════ */

const Progress = (() => {

  const KEY_MAPS      = 'ds_adv_maps_completed';
  const KEY_ABILITIES = 'ds_adv_abilities_unlocked';

  /* ── INTERNAL ──────────────────────── */

  function _load(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch(e) {
      return [];
    }
  }

  function _save(key, arr) {
    try {
      localStorage.setItem(key, JSON.stringify(arr));
    } catch(e) {}
  }

  return {

    /* ── MAPS ─────────────────────────── */

    getCompletedMaps() {
      return _load(KEY_MAPS);
    },

    isMapCompleted(mapId) {
      return this.getCompletedMaps().includes(mapId);
    },

    isMapUnlocked(mapId) {
      const map = MapRegistry.get(mapId);
      if (!map) return false;
      if (map.order === 1) return true;

      const prev = MapRegistry.all().find(m => m.order === map.order - 1);
      return prev ? this.isMapCompleted(prev.id) : false;
    },

    markMapCompleted(mapId) {
      const list = this.getCompletedMaps();
      if (!list.includes(mapId)) {
        list.push(mapId);
        _save(KEY_MAPS, list);
      }
    },

    /* ── ABILITIES ────────────────────── */

    getUnlockedAbilities() {
      return _load(KEY_ABILITIES);
    },

    isAbilityUnlocked(abilityId) {
      return this.getUnlockedAbilities().includes(abilityId);
    },

    unlockAbility(abilityId) {
      const list = this.getUnlockedAbilities();
      if (!list.includes(abilityId)) {
        list.push(abilityId);
        _save(KEY_ABILITIES, list);
        return true;   // just unlocked
      }
      return false;    // already had it
    },

    /* ── RESET (dev only) ─────────────── */

    reset() {
      localStorage.removeItem(KEY_MAPS);
      localStorage.removeItem(KEY_ABILITIES);
    },

  };

})();