/* ═══════════════════════════════════════
   STAR.JS
   Small fast projectile-like enemy.
   Rushes to center, parryable. 1 hit.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'star',
  sprite:    'assets/enemies/star/idle.png',
  size:      42,
  hpPct:     0.01,
  damagePct: 0.22,
  speedMult: 2.4,
  points:    700,
  hitSound:  'ethereal',
  shoots:    false,
  noHpBar:   true,
  parryable: true,

  calcStress(distToCenter) {
    if (distToCenter <= 120) return 16;
    return 6;
  },
});