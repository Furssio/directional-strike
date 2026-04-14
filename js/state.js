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