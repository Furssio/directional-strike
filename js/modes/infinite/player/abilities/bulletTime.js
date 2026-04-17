/* ═══════════════════════════════════════
   BULLETTIME.JS
   Bullet Time — slows all enemies and
   bullets for a short duration.
   Player's default special ability.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry, state.js
   ═══════════════════════════════════════ */

AbilityRegistry.register({
  id:       'bullet_time',
  name:     'Bullet Time',
  desc:     'slows all enemies for 3s',
  icon:     '🌀',
  barColor: '#E24B4A',
  duration: 3000,

  // special behavior flags
  piercing:      false,
  blocksBullets: false,

  onActivate(enemies) {
    enemies.forEach(e => e.setSlowed(true, 0.25));
    bullets.forEach(b => {
      b.vx = b.vxBase * 0.25;
      b.vy = b.vyBase * 0.25;
    });
  },

  onDeactivate(enemies) {
    enemies.forEach(e => e.setSlowed(false, 1));
    bullets.forEach(b => {
      b.vx = b.vxBase;
      b.vy = b.vyBase;
    });
  },
});