/* ═══════════════════════════════════════
   TORNADO.JS
   Fast parryable enemy — no hp bar.
   1 hit to kill. Rushes straight to center.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'tornado',
  sprite:    'assets/enemies/tornado/idle.png',
  size:      44,
  hpPct:     0.01,
  damagePct: 0.28,
  speedMult: 2.2,
  points:    15,
  shoots:    false,
  noHpBar:   true,
  parryable: true,
  calcStress(distToCenter) {
    if (distToCenter <= 120) return 18;
    return 8;
  },
});