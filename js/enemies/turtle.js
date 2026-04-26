/* ═══════════════════════════════════════
   TURTLE.JS
   Shell rush — fast in shell toward center.
   When hit, exits shell and becomes very
   slow. 4 hits total.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'turtle',
  sprite:    'assets/enemies/turtle/shell.png',
  size:      66,
  hpPct:     2.10,
  damagePct: 0.30,
  speedMult: 2.0,
  points:    35,
  shoots:    false,

  onHit(e) {
    if (e._exposed) return;
    e._exposed = true;
    e.speed = e.baseSpeed * 0.15;

    if (e.el) {
      e.el.style.backgroundImage = "url('assets/enemies/turtle/exposed.png')";
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 25;
    if (distToCenter <= 160) return 15;
    return 8;
  },
});