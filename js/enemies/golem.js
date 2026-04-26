/* ═══════════════════════════════════════
   GOLEM.JS
   Very slow, very tanky — 3 hits to kill.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'golem',
  emoji:     '🗿',
  sprite: 'assets/enemies/golem/idle.png',
  size:      78,
  hpPct:     1.00,
  speedMult: 0.60,
  points:    40,
  shoots:    false,
  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 35;
    if (distToCenter <= 160) return 25;
    return 18;
  },
});