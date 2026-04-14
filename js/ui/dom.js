/* ═══════════════════════════════════════
   DOM.JS
   All DOM element references + utilities.

   Used by: hud.js, screens.js, game systems
   Depends on: nothing
   ═══════════════════════════════════════ */

const sMenu    = document.getElementById('screen-menu');
const sAbility = document.getElementById('screen-ability');
const sGame    = document.getElementById('screen-game');
const sOver    = document.getElementById('screen-over');
const sMapSelect = document.getElementById('screen-map-select');


const arena          = document.getElementById('arena');
const flashEl        = document.getElementById('flash');
const lvlPop         = document.getElementById('level-up-pop');
const specialRing    = document.getElementById('special-ring');
const rangeEl        = document.getElementById('attack-range');
const comboEl        = document.getElementById('combo-display');
const scoreEl        = document.getElementById('score-display');
const levelEl        = document.getElementById('level-display');
const playerEl       = document.getElementById('player');
const hpBar          = document.getElementById('player-hp-bar');
const progressBar    = document.getElementById('progress-bar');
const comboTimerWrap = document.getElementById('combo-timer-wrap');
const comboTimerBar  = document.getElementById('combo-timer-bar');
const specialBar     = document.getElementById('special-bar');
const specialWrap    = document.getElementById('special-wrap');
const specialLabel   = document.getElementById('special-label');
const finalScoreEl   = document.getElementById('final-score');
const finalLevelEl   = document.getElementById('final-level');
const bestLabel      = document.getElementById('best-label');
const menuBest       = document.getElementById('menu-best');
const btnSpecial     = document.getElementById('btn-special');
const btnMute        = document.getElementById('btn-mute');

/* ── UTILITIES ── */

function getArenaSize() {
  const r = arena.getBoundingClientRect();
  return { w: r.width, h: r.height };
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}