/* ═══════════════════════════════════════
   SHIELD.JS
   Shield — player is invincible for 5s.
   Uses blocksBullets flag already checked
   in Player.takeDamage().

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry
   ═══════════════════════════════════════ */

AbilityRegistry.register({
  id:       'shield',
  name:     'Shield',
  desc:     'invincible for 5s',
  icon:     '🛡️',
  barColor: '#3B82F6',
  duration: 5000,

  piercing:      false,
  blocksBullets: true,

  onActivate() {},
  onDeactivate() {},
});