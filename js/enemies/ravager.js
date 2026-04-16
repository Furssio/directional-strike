/* ═══════════════════════════════════════
   RAVAGER.JS
   Fast enemy — 1 hit to kill.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'ravager',
  emoji:     '👹',
  sprite: 'assets/enemies/ravager.png',
  size:      48,
  hpPct:     0.30,
  damagePct: 0.34,
  speedMult: 1.0,
  points:    10,
  shoots:    false,
  calcStress(distToCenter) {
    return 0; // handled as group in calculator
  },
});