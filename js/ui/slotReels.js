/* ═══════════════════════════════════════
   SLOTREELS.JS
   Slot machine reel mechanics — building,
   animating, and displaying 3-reel results.

   Pure visual component. No game logic,
   no progression, no state management.

   Used by: slotMachine.js
   Depends on: CONFIG (abilities.rarities)
   ═══════════════════════════════════════ */

const SlotReels = (() => {

  /* ── CONSTANTS ─────────────────────── */
  const REEL_COUNT     = 3;
  const ICONS_PER_REEL = 20;
  const ICON_SIZE      = 48;
  const ICON_GAP       = 6;
  const ICON_STEP      = ICON_SIZE + ICON_GAP;
  const VISIBLE_ROWS   = 3;
  const REEL_STAGGER   = 350;
  const BASE_DURATION  = 1800;

  /* ── HELPERS ───────────────────────── */

  function _allIds() {
    return Object.keys(CONFIG.abilities.rarities);
  }

  function _randomId() {
    const ids = _allIds();
    return ids[Math.floor(Math.random() * ids.length)];
  }

  function _randomIdExcept(excludeId) {
    const ids = _allIds().filter(id => id !== excludeId);
    return ids[Math.floor(Math.random() * ids.length)];
  }

  /* ── PICK TARGETS ──────────────────── */

  /**
   * Decide what each reel lands on.
   * rollData: { result, nearMiss }
   * Returns: [id, id, id] for center row
   */
  function _pickTargets(rollData) {
    if (rollData.result) {
      // 3 matching
      return [rollData.result, rollData.result, rollData.result];
    }

    if (rollData.nearMiss) {
      // 2 match + 1 different (legendary tease)
      const legs = Object.entries(CONFIG.abilities.rarities)
        .filter(([, r]) => r === 'legendary')
        .map(([id]) => id);
      const legId  = legs[Math.floor(Math.random() * legs.length)];
      const diffId = _randomIdExcept(legId);
      return [legId, legId, diffId];
    }

    // no match — all different (prevent accidental triple)
    const t = [_randomId(), _randomId(), _randomId()];
    while (t[0] === t[1] && t[1] === t[2]) {
      t[2] = _randomId();
    }
    return t;
  }

  /* ── BUILD REELS ───────────────────── */

  /**
   * Populate reel DOM elements with icons.
   * Target icon sits at index ICONS_PER_REEL - 2.
   * reelEls: array of 3 DOM elements
   * rollData: { result, nearMiss }
   * Returns: [id, id, id] targets
   */
  function build(reelEls, rollData) {
    const allIds  = _allIds();
    const targets = _pickTargets(rollData);

    for (let r = 0; r < REEL_COUNT; r++) {
      const reel = reelEls[r];
      reel.innerHTML = '';

      for (let i = 0; i < ICONS_PER_REEL; i++) {
        const iconId = (i === ICONS_PER_REEL - 2)
          ? targets[r]
          : allIds[Math.floor(Math.random() * allIds.length)];

        const img = document.createElement('img');
        img.src = 'assets/abilities/' + iconId + '.png';
        img.alt = iconId;
        img.dataset.id = iconId;
        reel.appendChild(img);
      }

      // reset position
      reel.style.transition = 'none';
      reel.style.top = '0px';
    }

    return targets;
  }

  /* ── ANIMATE ───────────────────────── */

  /**
   * Spin reels to land on targets.
   * reelEls: array of 3 DOM elements
   * callback: called when all reels stop
   */
  function animate(reelEls, callback) {
    // force reflow
    reelEls.forEach(r => r.offsetHeight);

    const targetIdx    = ICONS_PER_REEL - 2;
    const centerOffset = Math.floor(VISIBLE_ROWS / 2) * ICON_STEP;
    const targetTop    = -(targetIdx * ICON_STEP) + centerOffset;

    reelEls.forEach((reel, i) => {
      const duration = BASE_DURATION + (i * REEL_STAGGER);
      const delay    = i * 150;

      setTimeout(() => {
        reel.style.transition =
          `top ${duration}ms cubic-bezier(0.15, 0.85, 0.35, 1.0)`;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            reel.style.top = targetTop + 'px';
          });
        });
      }, delay);
    });

    // total time until last reel stops
    const totalMs = 150 * (REEL_COUNT - 1)
      + BASE_DURATION
      + (REEL_COUNT - 1) * REEL_STAGGER
      + 300;

    setTimeout(callback, totalMs);
  }

  /* ── RESET ─────────────────────────── */

  function reset(reelEls) {
    reelEls.forEach(r => {
      r.innerHTML = '';
      r.style.transition = 'none';
      r.style.top = '0px';
    });
  }

  /* ── PUBLIC ────────────────────────── */
  return { build, animate, reset };

})();