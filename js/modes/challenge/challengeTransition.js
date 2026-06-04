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
  let _recentPool = []; // tracks unplayed maps in current rotation

  function reset() {
    mapHistory = [];
    _recentPool = [];
  }

  function getHistory() {
    return mapHistory.slice();
  }

  function pushHistory(mapId) {
    mapHistory.push(mapId);
    // remove from recent pool
    const idx = _recentPool.indexOf(mapId);
    if (idx !== -1) _recentPool.splice(idx, 1);
  }

  /* ── MAP PICKING ───────────────────── */

  function pickNextMap(_cycle) {
    const allMaps = CONFIG.challenge.mapRotation.allMaps;

    // if pool is empty, refill with all maps
    if (_recentPool.length === 0) {
      _recentPool = allMaps.slice();
    }

    // pick random from remaining pool
    const idx   = Math.floor(Math.random() * _recentPool.length);
    const mapId = _recentPool[idx];
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

    // fade out current music before animation
    if (typeof Music !== 'undefined') {
      Music.fadeOut(800);
    }

    // schedule new map music near end of animation
    // dimension: silence during dimension wave (eerie feel)
    // normal: start music at ~3/4 of animation
    if (typeof Music !== 'undefined' && !isDim) {
      setTimeout(() => {
        Music.playMap(mapId);
      }, 3500);
    }

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