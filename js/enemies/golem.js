/* ═══════════════════════════════════════
   GOLEM.JS
   Very slow, very tanky — 3 hits to kill.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'golem',
  emoji:     '🗿',
  sprite:        'assets/enemies/golem/idle.png',
  spriteFrames:  12,
  spriteFrameW:  104,
  spriteFrameH:  104,
  spriteSpeed:   1.0,
  size:          104,
  hpPct:     1.50,
  speedMult: 0.60,
  damagePct: 0.40,
  points:    2500,
  shoots:    false,
  calcStress(distToCenter) {
  if (distToCenter <= 80)  return 40;
  if (distToCenter <= 160) return 30;
  return 20;
},
});