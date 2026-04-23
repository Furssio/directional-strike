/* ═══════════════════════════════════════
   KITSUNE.JS
   Sneaky fox — approaches slowly, then
   lunges fast when in attack range.
   1 hit to kill.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'kitsune',
  sprite:    'assets/enemies/kitsune/idle.png',
  size:      38,
  hpPct:     0.30,
  damagePct: 0.30,
  speedMult: 0.55,
  points:    20,
  shoots:    false,
  noHpBar:   true,

  onTick(e, cx, cy, attackRange) {
    if (e._lunging) return;

    const dx   = e.x - cx;
    const dy   = e.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= attackRange) {
      e._lunging = true;
      e.speed = e.baseSpeed * 4.0;
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 18;
    if (distToCenter <= 160) return 10;
    return 4;
  },
});