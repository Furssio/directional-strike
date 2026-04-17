/* ═══════════════════════════════════════
   STATS.JS
   Fixed player stats. Single source of
   truth for the player's base values.

   Used by: Player.js
   Depends on: nothing
   ═══════════════════════════════════════ */

const PLAYER_STATS = {
  emoji:      '🧑',
  color:      '#E24B4A',
  rangePct:   0.26,
  damageMult: 1.6,
  maxHp:      100,

  // default equipped ability id (auto-registered from abilities/)
  defaultAbility: 'bullet_time',
};