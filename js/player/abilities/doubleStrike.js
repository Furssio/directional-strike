/* ═══════════════════════════════════════
   DOUBLESTRIKE.JS
   Double Strike — each attack also hits
   the opposite direction for 4 seconds.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry
   ═══════════════════════════════════════ */

AbilityRegistry.register({
  id:       'double_strike',
  name:     'Double Strike',
  desc:     'attacks also hit the opposite side for 4s',
  icon:     '⚔️',
  barColor: '#A855F7',
  duration: 4000,

  piercing:      false,
  blocksBullets: false,

  onActivate() {
    if (player) player.doubleStrikeActive = true;
  },

  onDeactivate() {
    if (player) player.doubleStrikeActive = false;
  },
});