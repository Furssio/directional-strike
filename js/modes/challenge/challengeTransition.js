/* ═══════════════════════════════════════
   CHALLENGETRANSITION.JS
   Map rotation, picking, change animation
   and history for challenge mode.

   Used by: challengeDirector.js
   Depends on: config.js, MapRegistry,
               ChallengeDimension
   ═══════════════════════════════════════ */

const ChallengeTransition = (() => {

  let mapHistory = [];

  function reset() {
    mapHistory = [];
  }

  function getHistory() {
    return mapHistory.slice();
  }

  function pushHistory(mapId) {
    mapHistory.push(mapId);
  }

  /* ── MAP PICKING ───────────────────── */

  function pickNextMap(cycle) {
    const c = CONFIG.challenge;

    // determine pool based on cycle
    let pool;
    if (cycle <= c.mapRotation.earlyCycleEnd) {
      pool = c.mapRotation.earlyMaps.slice();
      if (cycle >= 2) {
        const late     = c.mapRotation.lateMaps;
        const addCount = Math.min(cycle - 1, 2);
        const shuffled = late.slice().sort(() => Math.random() - 0.5);
        for (let i = 0; i < addCount; i++) {
          if (shuffled[i]) pool.push(shuffled[i]);
        }
      }
    } else {
      pool = c.mapRotation.allMaps.slice();
      // breather chance
      if (Math.random() < c.mapRotation.breatherChance) {
        return MapRegistry.get(c.mapRotation.breatherMap);
      }
    }

    // filter recent
    const history    = mapHistory.slice(-c.mapRotation.historySize);
    let candidates   = pool.filter(id => !history.includes(id));
    if (candidates.length === 0) candidates = pool.slice();

    const mapId = candidates[Math.floor(Math.random() * candidates.length)];
    return MapRegistry.get(mapId);
  }

  /* ── MAP CHANGE ANIMATION ──────────── */

  function playChange(newMap, onSwapBg) {
    const colors = CONFIG.challenge.mapColors;
    const isDim  = !!newMap.isDimension;
    const mapId  = newMap.id;

    const themeColor = colors[mapId] ? colors[mapId][0] : '#ffffff';
    const themeDark  = colors[mapId] ? colors[mapId][1] : '#888888';
    const displayName = (newMap.name || mapId).toUpperCase();

    if (isDim) {
      return MapTransition.playDimension(onSwapBg);
    } else {
      return MapTransition.playNormal(
        displayName, themeColor, themeDark, onSwapBg
      );
    }
  }

  return {
    reset,
    getHistory,
    pushHistory,
    pickNextMap,
    playChange,
  };

})();