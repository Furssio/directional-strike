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
  speedMult: 1.8,
  points:    3553,
  hitSound:  'shell',
  shoots:    false,
  deathColors: ['#448844', '#669944', '#336633', '#88aa66'],

  /* --- Shell fragment burst --- */
  _spawnShellPieces(e) {
    const arena = document.getElementById('G');
    if (!arena) return;
    const count = 10;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'turtle-shell-piece';
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
      const dist  = 25 + Math.random() * 40;
      const rot   = (Math.random() - 0.5) * 360;
      p.style.left = e.x + 'px';
      p.style.top  = e.y + 'px';
      p.style.setProperty('--sx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--sy', Math.sin(angle) * dist + 'px');
      p.style.setProperty('--sr', rot + 'deg');
      arena.appendChild(p);
      setTimeout(() => p.remove(), 500);
    }
  },

  onHit(e) {
    if (e._exposed) return;
    e._exposed = true;
    e.speed = e.baseSpeed * 0.15;

    // shell crack FX
    this._spawnShellPieces(e);

    if (e.el) {
      // flash + shake
      e.el.classList.add('turtle-crack');
      setTimeout(() => {
        if (e.el) {
          e.el.classList.remove('turtle-crack');
          // change sprite to exposed
          e.el.style.backgroundImage = "url('assets/enemies/turtle/exposed.png')";
          // wobble when exposed
          e.el.classList.add('turtle-exposed');
          setTimeout(() => {
            if (e.el) e.el.classList.remove('turtle-exposed');
          }, 500);
        }
      }, 300);
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 25;
    if (distToCenter <= 160) return 15;
    return 8;
  },
});