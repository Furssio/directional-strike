/* ═══════════════════════════════════════
   GOLEM.JS
   Very slow, very tanky — 3 hits to kill.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'golem',
  emoji:     '🗿',
  sprite:    'assets/enemies/golem.png',
  size:      52,
  hpPct:     1.65,
  hpPct: 1.20,
  speedMult: 0.44,
  points:    40,
  shoots:    false,
  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 35;
    if (distToCenter <= 160) return 25;
    return 18;
  },
});