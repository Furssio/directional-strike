/* ═══════════════════════════════════════
   RANGEBOOST.JS
   Range Boost — increases attack range
   by 50% for 4 seconds.
   Unlocked by completing Map 1 (Forest).

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

  onActivate(enemies) {
    if (player) player.attackRangePct *= 1.5;
    updateRangeCircle();
  },

  onDeactivate(enemies) {
    if (player) player.attackRangePct /= 1.5;
    updateRangeCircle();
  },
});