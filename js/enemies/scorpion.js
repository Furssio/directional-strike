/* ═══════════════════════════════════════
   SCORPION.JS
   Hides underground while approaching.
   Becomes visible when in attack range.
   Poisons player on contact.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'scorpion',
  sprite:    'assets/enemies/scorpion/idle.png',
  size:      32,
  hpPct:     0.30,
  damagePct: 0.15,
  speedMult: 1.8,
  points:    20,
  shoots:    false,
  noHpBar:   true,

  // while underground: not visible, not hittable
  underground: true,

  onContact(player) {
    // poison: 5% hp per second for 3 seconds
    if (!player.poisonEffects) player.poisonEffects = [];
    player.poisonEffects.push({ ticksLeft: 3, timer: 0 });
  },

  onTick(e, cx, cy, attackRange) {
    const dx   = e.x - cx;
    const dy   = e.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (e.underground && dist <= attackRange) {
      // emerge — become visible and hittable
      e.underground = false;
      if (e.el) {
        e.el.style.opacity = '1';
        e.el.style.pointerEvents = 'auto';
      }
    }

    // sand particles while underground
    if (e.underground && e.el) {
      e._particleTimer = (e._particleTimer || 0) + 16;
      if (e._particleTimer >= 120) {
        e._particleTimer = 0;
        spawnSandParticle(e.x, e.y);
      }
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 20;
    if (distToCenter <= 160) return 10;
    return 4;
  },
});