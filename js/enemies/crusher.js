/* ═══════════════════════════════════════
   CRUSHER.JS
   Slow enemy — shoots bullets.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:              'crusher',
  emoji:           '👾',
  size:            46,
  hpPct:           0.65,
  damagePct:       0.34,
  speedMult:       0.60,
  points:          25,
  shoots:          true,
  shootInterval:   2000,
  bulletDamagePct: 0.20,
  bulletSpeed:     4.5,
  calcStress(distToCenter) {
    return 25;
  },
});