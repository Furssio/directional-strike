/* ═══════════════════════════════════════
   ONI.JS
   Heavy demon — 4 hits. Each hit bounces
   it back to the start of its line and
   it comes back faster each time.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'oni',
  sprite:    'assets/enemies/oni/idle.png',
  spriteFrames:  12,
  spriteFrameW:  110,
  spriteFrameH:  110,
  spriteSpeed:   1.0,
  size:          110,
  hpPct:     2.10,
  damagePct: 0.40,
  speedMult: 0.60,
  points:    4890,
  hitSound:  'demon',
  shoots:    false,
  deathColors: ['#cc2222', '#881111', '#ff4444', '#440000'],

  /* --- Impact particles at hit position --- */
  _spawnImpact(x, y) {
    const arena = document.getElementById('G');
    if (!arena) return;
    const count = 8;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'oni-impact';
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
      const dist  = 25 + Math.random() * 35;
      p.style.left = x + 'px';
      p.style.top  = y + 'px';
      p.style.setProperty('--ix', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--iy', Math.sin(angle) * dist + 'px');
      arena.appendChild(p);
      setTimeout(() => p.remove(), 400);
    }
  },

  onHit(e) {
    // impact FX at current position before bounce
    this._spawnImpact(e.x, e.y);

    // brief white flash
    if (e.el) {
      e.el.classList.add('oni-hit-flash');
      setTimeout(() => {
        if (e.el) e.el.classList.remove('oni-hit-flash');
      }, 120);
    }

    // bounce back to edge of arena
    const { w, h } = getArenaSize();
    const cx = w / 2;
    const cy = h / 2;
    const m  = CONFIG.spawn.edgeMargin;

    if (e.dir === 'up')    { e.x = cx; e.y = -m; }
    if (e.dir === 'down')  { e.x = cx; e.y = h + m; }
    if (e.dir === 'left')  { e.x = -m; e.y = cy; }
    if (e.dir === 'right') { e.x = w + m; e.y = cy; }

    if (e.el) {
      e.el.style.left = e.x + 'px';
      e.el.style.top  = e.y + 'px';
    }

    // get faster each hit + rage tint
    e._hitCount = (e._hitCount || 0) + 1;
    e.speed = e.baseSpeed * (1 + e._hitCount * 0.5);

    // apply rage tint based on hits taken
    if (e.el) {
      e.el.classList.remove('oni-rage-1', 'oni-rage-2', 'oni-rage-3');
      if (e._hitCount >= 3)      e.el.classList.add('oni-rage-3');
      else if (e._hitCount >= 2) e.el.classList.add('oni-rage-2');
      else                       e.el.classList.add('oni-rage-1');
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 35;
    if (distToCenter <= 160) return 20;
    return 10;
  },
});