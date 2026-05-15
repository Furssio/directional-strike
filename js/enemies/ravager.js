/* ═══════════════════════════════════════
   RAVAGER.JS
   Fast enemy — 1 hit to kill.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'ravager',
  emoji:     '👹',
  sprite:        'assets/enemies/ravager/idle.png',
  spriteFrames:  12,
  spriteFrameW:  72,
  spriteFrameH:  72,
  spriteSpeed:   1.2,
  size:          72,
  hpPct:     0.30,
  damagePct: 0.34,
  speedMult: 1.3,
  points:    899,
  hitSound:  'flesh',
  shoots:    false,
  calcStress(distToCenter) {
    return 0; // handled as group in calculator
  },
});