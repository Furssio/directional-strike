/* ═══════════════════════════════════════
   PROGRESS.JS
   Adventure Mode progression — saved in
   localStorage.

   Tracks:
   - which maps have been completed
   - which abilities have been unlocked
   - menu slot video counter

   A map is UNLOCKED if:
   - devUnlockAll is true, or
   - it's the first map (order === 1), or
   - the previous map (by order) is completed

   An ability is UNLOCKED if:
   - devUnlockAll is true, or
   - it's the default ability, or
   - it was unlocked via slot machine

   Used by: mapSelect.js, adventureDirector.js,
            ui/abilityScreen.js
   Depends on: CONFIG, MapRegistry
   ═══════════════════════════════════════ */

const Progress = (() => {

  const KEY_MAPS         = 'ds_adv_maps_completed';
  const KEY_ABILITIES    = 'ds_adv_abilities_unlocked';
  const KEY_MENU_VIDEOS  = 'ds_menu_videos_used';
  const KEY_SLOTS_GIVEN  = 'ds_slots_given';

  /* ── INTERNAL STORAGE ──────────────── */

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

  function _loadInt(key) {
    try {
      return parseInt(localStorage.getItem(key)) || 0;
    } catch(e) {
      return 0;
    }
  }

  function _saveInt(key, val) {
    try {
      localStorage.setItem(key, String(val));
    } catch(e) {}
  }

  /* ── SLOT ROLL LOGIC ───────────────── */

  function _getWeightedPool() {
    const locked = Progress.getLockedAbilities();
    if (locked.length === 0) return [];

    const rarities = CONFIG.abilities.rarities;
    const weights  = CONFIG.abilities.weights;

    return locked.map(id => ({
      id,
      weight: weights[rarities[id]] || 0,
    }));
  }

  function _pickFromPool(pool) {
    if (pool.length === 0) return null;

    const totalWeight = pool.reduce((sum, e) => sum + e.weight, 0);
    if (totalWeight <= 0) return null;

    let roll = Math.random() * totalWeight;
    for (const entry of pool) {
      roll -= entry.weight;
      if (roll <= 0) return entry.id;
    }
    // fallback — last entry
    return pool[pool.length - 1].id;
  }

  /* ── PUBLIC API ────────────────────── */

  const Progress = {

    /* ── MAPS ─────────────────────────── */

    getCompletedMaps() {
      return _load(KEY_MAPS);
    },

    isMapCompleted(mapId) {
      return this.getCompletedMaps().includes(mapId);
    },

    isMapUnlocked(mapId) {
      if (CONFIG.devUnlockAll) return true;

      const map = MapRegistry.get(mapId);
      if (!map) return false;
      if (map.order === 1) return true;

      const prev = MapRegistry.all()
        .find(m => m.order === map.order - 1);
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
      const list = _load(KEY_ABILITIES);
      // Always include default
      const def = CONFIG.abilities.defaultAbility;
      if (!list.includes(def)) list.push(def);
      return list;
    },

    isAbilityUnlocked(abilityId) {
      if (CONFIG.devUnlockAll) return true;
      if (abilityId === CONFIG.abilities.defaultAbility) return true;
      return _load(KEY_ABILITIES).includes(abilityId);
    },

    unlockAbility(abilityId) {
      const list = _load(KEY_ABILITIES);
      if (!list.includes(abilityId)) {
        list.push(abilityId);
        _save(KEY_ABILITIES, list);
        return true;
      }
      return false;
    },

    getLockedAbilities() {
      const unlocked = this.getUnlockedAbilities();
      const all = Object.keys(CONFIG.abilities.rarities);
      return all.filter(id => !unlocked.includes(id));
    },

    /* ── SLOT MACHINE ─────────────────── */

    /**
     * Check if completing this map should
     * trigger the guaranteed slot machine.
     */
    shouldTriggerSlot(mapId) {
      if (this.getLockedAbilities().length === 0) return false;
      const slotMaps = CONFIG.abilities.slotAfterMaps;
      if (!slotMaps.includes(mapId)) return false;

      // Check if slot was already given for this map
      const given = _load(KEY_SLOTS_GIVEN);
      return !given.includes(mapId);
    },

    /**
     * Mark that the slot was given for this map.
     * Prevents double-trigger on replay.
     */
    markSlotGiven(mapId) {
      const given = _load(KEY_SLOTS_GIVEN);
      if (!given.includes(mapId)) {
        given.push(mapId);
        _save(KEY_SLOTS_GIVEN, given);
      }
    },

    /**
     * Roll the slot machine.
     * guaranteed = true  → always returns an ability id
     * guaranteed = false → ~1/6 chance per spin, can return null
     */
    rollSlot(guaranteed) {
      const pool = _getWeightedPool();
      if (pool.length === 0) return null;

      if (guaranteed) {
        return _pickFromPool(pool);
      }

      // Non-guaranteed: ~1/6 chance to hit
      if (Math.random() > (1 / 6)) return null;
      return _pickFromPool(pool);
    },

    /* ── MENU VIDEOS (REWARDED AD) ────── */

    getMenuVideosUsed() {
      return _loadInt(KEY_MENU_VIDEOS);
    },

    canUseMenuVideo() {
      const max = CONFIG.abilities.menuSlots.maxVideos;
      return this.getMenuVideosUsed() < max
          && this.getLockedAbilities().length > 0;
    },

    useMenuVideo() {
      const used = this.getMenuVideosUsed();
      _saveInt(KEY_MENU_VIDEOS, used + 1);
      return used + 1;
    },

    /**
     * Is this the last available video?
     * Used to force guaranteed ability.
     */
    isLastMenuVideo() {
      const max = CONFIG.abilities.menuSlots.maxVideos;
      return this.getMenuVideosUsed() === max - 1;
    },

    /* ── RESET (dev only) ─────────────── */

    reset() {
      localStorage.removeItem(KEY_MAPS);
      localStorage.removeItem(KEY_ABILITIES);
      localStorage.removeItem(KEY_MENU_VIDEOS);
      localStorage.removeItem(KEY_SLOTS_GIVEN);
    },

  };

  return Progress;

})();