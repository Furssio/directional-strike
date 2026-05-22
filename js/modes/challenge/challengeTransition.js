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
    const c   = CONFIG.challenge;
    const rot = c.mapRotation;

    // breather chance
    if (cycle > 1 && Math.random() < rot.breatherChance) {
      return MapRegistry.get(rot.breatherMap);
    }

    // pick pool based on cycle
    let pool;
    if (cycle <= 3) {
      // cycles 1-3: easy maps only
      pool = rot.easyMaps.slice();
    } else if (cycle <= 6) {
      // cycles 4-6: easy + medium
      pool = rot.easyMaps.concat(rot.mediumMaps);
    } else {
      // cycles 7+: all maps
      pool = rot.allMaps.slice();
    }

    // filter recent
    const history  = mapHistory.slice(-rot.historySize);
    let candidates = pool.filter(id => !history.includes(id));
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