/* ═══════════════════════════════════════
   SLASH.JS
   Slash — each attack hits ALL enemies
   in that direction for 4 seconds.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry
   ═══════════════════════════════════════ */

AbilityRegistry.register({
  id:       'slash',
  name:     'Slash',
  desc:     'attacks hit all enemies in a line for 4s',
  icon:     '🗡️',
  barColor: '#EC4899',
  duration: 4000,

  piercing:      false,
  blocksBullets: false,

  onActivate() {
    if (player) player.slashActive = true;
  },

  onDeactivate() {
    if (player) player.slashActive = false;
  },
});