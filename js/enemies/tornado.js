/* ═══════════════════════════════════════
   TORNADO.JS
   Fast parryable enemy — no hp bar.
   1 hit to kill. Rushes straight to center.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'tornado',
  sprite:    'assets/enemies/tornado/idle.png',
  size:      66,
  hpPct:     0.01,
  damagePct: 0.28,
  speedMult: 1.6,
  points:    400,
  shoots:    false,
  noHpBar:   true,
  parryable: true,
  calcStress(distToCenter) {
    if (distToCenter <= 120) return 18;
    return 8;
  },
});