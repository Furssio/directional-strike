/* ═══════════════════════════════════════
   SLASH.JS
   Slash — piercing attacks that ignore
   range and deal massive damage for 3s.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry
   ═══════════════════════════════════════ */

AbilityRegistry.register({
  id:       'slash',
  name:     'Slash',
  desc:     'piercing full-line attacks with high damage for 3s',
  icon:     '🗡️',
  barColor: '#EC4899',
  duration: 3000,

  piercing:      false,
  blocksBullets: false,

  onActivate() {
    if (player) player.slashActive = true;
  },

  onDeactivate() {
    if (player) player.slashActive = false;
  },
});