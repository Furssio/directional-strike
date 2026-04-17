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
    if (!player) return;
    // salva il base solo alla prima chiamata, ignora le successive (spawn nemici)
    if (!this._baseRangePct) {
      this._baseRangePct = player.attackRangePct;
      player.attackRangePct = this._baseRangePct * 1.5;
      updateRangeCircle();
    }
  },

  onDeactivate(enemies) {
    if (!player) return;
    if (this._baseRangePct) {
      player.attackRangePct = this._baseRangePct;
      this._baseRangePct = null;
    }
    updateRangeCircle();
  },
});