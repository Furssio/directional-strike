/* ═══════════════════════════════════════
   FULLHEAL.JS
   Full Heal — instantly restores all HP.
   No duration, effect is immediate.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry
   ═══════════════════════════════════════ */

AbilityRegistry.register({
  id:       'full_heal',
  name:     'Full Heal',
  desc:     'restores all HP instantly',
  icon:     '❤️',
  barColor: '#22C55E',
  duration: 1,

  piercing:      false,
  blocksBullets: false,

  onActivate() {
    if (player) {
      player.hp = player.maxHp;
      updateHpBar();

      // green heal glow (reuses orb heal effect)
      playerEl.classList.remove('orb-heal-effect');
      void playerEl.offsetWidth;
      playerEl.classList.add('orb-heal-effect');
      setTimeout(() => playerEl.classList.remove('orb-heal-effect'), 1500);
    }
  },

  onDeactivate() {},
});