/* ═══════════════════════════════════════
   UISOUNDS.JS
   Centralized UI sound bindings.
   Attaches hover + click SFX to all
   UI buttons across every screen.

   Load AFTER: sfx.js
   Depends on: SFX (sfx.js)
   ═══════════════════════════════════════ */

const UiSounds = (() => {

  /* ── STATIC BUTTON SELECTORS ── */
  const BUTTON_SELECTORS = [
    // menu
    '#btn-adventure',
    '#btn-challenge',
    '#btn-sfx',
    '#btn-music',
    '#btn-howtoplay',
    // map select
    '#btn-map-back',
    '#carousel-prev',
    '#carousel-next',
    '#btn-map-play',
    '#ability-prev',
    '#ability-next',
    // ability screen
    '#btn-ability-back',
    // pause
    '#btn-pause',
    '#pause-continue',
    '#pause-retry',
    '#pause-maps',
    '#pause-sfx',
    '#pause-music',
    // game over
    '#btn-restart',
    '#btn-home',
    // map complete
    '#btn-play-again',
    '#btn-complete-maps',
  ];

  /* ── ENSURE AUDIO CONTEXT ON FIRST INTERACTION ── */
  let _audioReady = false;
  function _ensureAudio() {
    if (_audioReady) return;
    _audioReady = true;
    SFX.init();
  }

  /* ── ATTACH TO STATIC BUTTONS ── */
  function _bindStatic() {
    BUTTON_SELECTORS.forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.addEventListener('mouseenter', () => { _ensureAudio(); SFX.hover(); });
      el.addEventListener('click', () => { _ensureAudio(); SFX.click(); });
    });
  }

  /* ── EVENT DELEGATION FOR DYNAMIC BUTTONS ── */
  // map complete + game over overlays clone buttons,
  // ability list builds cards dynamically
  function _bindDynamic() {
    // over overlay — delegated click/hover on .over-btn
    const overOv = document.getElementById('over-overlay');
    if (overOv) {
      overOv.addEventListener('click', e => {
        if (e.target.closest('.over-btn')) SFX.click();
      });
      overOv.addEventListener('mouseenter', e => {
        if (e.target.closest('.over-btn')) SFX.hover();
      }, true);
    }

    // complete overlay — delegated click/hover on .complete-btn
    const compOv = document.getElementById('complete-overlay');
    if (compOv) {
      compOv.addEventListener('click', e => {
        if (e.target.closest('.complete-btn')) SFX.click();
      });
      compOv.addEventListener('mouseenter', e => {
        if (e.target.closest('.complete-btn')) SFX.hover();
      }, true);
    }

    // ability list — delegated for .ability-item cards
    const abList = document.getElementById('ability-list');
    if (abList) {
      abList.addEventListener('click', e => {
        if (e.target.closest('.ability-item')) SFX.click();
      });
      abList.addEventListener('mouseenter', e => {
        if (e.target.closest('.ability-item')) SFX.hover();
      }, true);
    }

    // map slides — delegated for carousel clicks
    const track = document.getElementById('carousel-track');
    if (track) {
      track.addEventListener('click', e => {
        if (e.target.closest('.map-slide')) SFX.click();
      });
      track.addEventListener('mouseenter', e => {
        if (e.target.closest('.map-slide')) SFX.hover();
      }, true);
    }
  }

  /* ── INIT ── */
  function init() {
    _bindStatic();
    _bindDynamic();
  }

  // auto-init — by the time this script loads,
  // HTML partials are already in the DOM
  init();

  return { init };

})();

