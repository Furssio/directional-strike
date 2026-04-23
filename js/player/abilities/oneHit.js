/* ═══════════════════════════════════════
   ONEHIT.JS
   One Hit — all enemies die in 1 hit
   for 4 seconds.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry
   ═══════════════════════════════════════ */

AbilityRegistry.register({
  id:       'one_hit',
  name:     'One Hit',
  desc:     'all enemies die in 1 hit for 4s',
  icon:     '⚡',
  barColor: '#FBBF24',
  duration: 4000,

  piercing:      false,
  blocksBullets: false,

  onActivate() {
    if (player) player.oneHitActive = true;
  },

  onDeactivate() {
    if (player) player.oneHitActive = false;
  },
});