/* ═══════════════════════════════════════
   STATE.JS
   Global game state — shared across all
   systems and modes.

   Used by: everything
   Depends on: nothing
   ═══════════════════════════════════════ */

let player          = null;
let enemies         = [];
let bullets         = [];
let gameLoop        = null;
let running         = false;
let choosingAbility = false;   // kept for director clear-enemies compat
let lastTick        = 0;
let isAttacking     = false;

// ability equipped for next match (default = player's default ability)
let equippedAbilityId = null;
let ActiveDirector = null;

// ── MOBILE DETECTION ──
// true for phones/tablets with coarse pointer (not desktop touchscreen)
const _isMobile = navigator.maxTouchPoints > 0 && window.matchMedia('(pointer: coarse)').matches;
function isMobile() { return _isMobile; }