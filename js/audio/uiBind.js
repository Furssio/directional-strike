/* ═══════════════════════════════════════
   AUDIO/UIBIND.JS
   Binds hover/click sounds to all UI buttons
   using event delegation. Must be loaded AFTER
   all HTML partials are in the DOM.

   Depends on: audio/index.js (SFX)
   ═══════════════════════════════════════ */

const UiBind = (() => {

  let _bound = false;

  /* ── SELECTORS ── */
  // containers for event delegation
  const CONTAINERS = [
    '#screen-menu',
    '#screen-map-select',
    '#screen-ability',
    '#screen-game',
  ];

  // elements that trigger sounds
  const CLICKABLE = 'button, .mode-card, .map-slide, .ability-item';

  function _isClickable(el) {
    return el && el.matches && el.matches(CLICKABLE);
  }

  function _findClickable(target, container) {
    // walk up from target to container looking for a clickable
    let el = target;
    while (el && el !== container) {
      if (_isClickable(el)) return el;
      el = el.parentElement;
    }
    return null;
  }

  /* ── BIND ── */
  function init() {
    if (_bound) return;
    _bound = true;

    CONTAINERS.forEach(sel => {
      const container = document.querySelector(sel);
      if (!container) return;

      // click sound
      container.addEventListener('click', (e) => {
        if (_findClickable(e.target, container)) {
          SFX.click();
        }
      });

      // hover sound (pointer only, not touch)
      container.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'touch') return;
        if (_findClickable(e.target, container)) {
          SFX.hover();
        }
      }, true); // capture phase for delegation
    });
  }

  return { init };

})();