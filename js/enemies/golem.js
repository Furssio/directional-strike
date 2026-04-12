/* ═══════════════════════════════════════
   GOLEM.JS
   Very slow, very tanky — 3 hits to kill.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'golem',
  emoji:     '🗿',
  size:      52,
  hpPct:     0.95,
  damagePct: 0.40,
  speedMult: 0.38,
  points:    40,
  shoots:    false,
  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 30;
    if (distToCenter <= 160) return 15;
    return 5;
  },
});