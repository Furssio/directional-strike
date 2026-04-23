/* ═══════════════════════════════════════
   RANGEBOOST.JS
   Range Boost — increases attack range
   by 50% for 4 seconds.
   Uses player.rangePctMultiplier so the
   range circle updates automatically.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry
   ═══════════════════════════════════════ */

AbilityRegistry.register({
  id:       'range_boost',
  name:     'Range Boost',
  desc:     'increases attack range by 50% for 4s',
  icon:     '🎯',
  barColor: '#F59E0B',
  duration: 4000,

  piercing:      false,
  blocksBullets: false,

  onActivate() {
    if (player) {
      player.rangePctMultiplier = 1.5;
      updateRangeCircle();
    }
  },

  onDeactivate() {
    if (player) {
      player.rangePctMultiplier = 1.0;
      updateRangeCircle();
    }
  },
});