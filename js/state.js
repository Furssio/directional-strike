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
let choosingAbility = false;
let lastTick        = 0;
let selectedCharId  = 'warrior';