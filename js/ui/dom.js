/* ═══════════════════════════════════════
   DOM.JS
   All DOM element references + utilities.

   Used by: hud.js, screens.js, game systems
   Depends on: nothing
   ═══════════════════════════════════════ */

const sMenu      = document.getElementById('screen-menu');
const sAbility   = document.getElementById('screen-ability');
const sGame      = document.getElementById('screen-game');
const sMapSelect = document.getElementById('screen-map-select');
const sChallenge = document.getElementById('screen-challenge');

const overOverlay     = document.getElementById('over-overlay');
const completeOverlay = document.getElementById('complete-overlay');

const arena          = document.getElementById('arena');
const flashEl        = document.getElementById('flash');
const lvlPop         = document.getElementById('level-up-pop');
const specialRing    = document.getElementById('special-ring');
const rangeEl        = document.getElementById('attack-range');
const comboEl        = null; // removed from HUD — combo shown via combo-float
const scoreEl        = document.getElementById('score-display');
const levelEl        = document.getElementById('level-display');
const playerEl       = document.getElementById('player');
const hpBar          = document.getElementById('player-hp-bar');
const progressBar    = null; // removed — adventure uses timer, infinite not used
// combo timer removed from HUD — combo shown via combo-float
const comboTimerWrap = null;
const comboTimerBar  = null;
const specialBar     = document.getElementById('special-bar');
const finalScoreEl   = document.getElementById('over-score');
const finalLevelEl   = document.getElementById('over-wave');
const bestLabel      = document.getElementById('over-best');
const menuBest       = document.getElementById('menu-best');
const btnMute        = document.getElementById('btn-mute');

/* ── UTILITIES ── */

function getArenaSize() {
  return { w: arena.offsetWidth, h: arena.offsetHeight };
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function setArenaBackground(url) {
  arena.style.backgroundImage = url ? `url('${url}')` : 'none';
  arena.style.backgroundColor = url ? 'transparent' : '#2a2a2a';
}