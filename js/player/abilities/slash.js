/* ═══════════════════════════════════════
   SLASH.JS
   Slash — piercing full-line attacks
   with high damage for 3s.
   Dark blue aura + Bleach-style energy
   blade with blended gradient colors.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry
   ═══════════════════════════════════════ */

/* ── AURA FX (Canvas, dark blue flames — large) ── */

const SlashFX = (() => {
  let _canvas = null;
  let _ctx = null;
  let _raf = null;
  let _particles = [];
  let _active = false;
  let _time = 0;

  const SIZE = 280;
  const CX = SIZE / 2;
  const CY = SIZE / 2 + 12;

  /* ── FLAME PARTICLE ── */

  function _spawnFlame() {
    const spread = 20 + Math.random() * 16;
    const side = (Math.random() - 0.5) * 2;
    _particles.push({
      x:       CX + side * spread,
      y:       CY + 8 + Math.random() * 8,
      vx:      (Math.random() - 0.5) * 0.9,
      vy:      -(2.2 + Math.random() * 3.0),
      size:    2.5 + Math.random() * 3,
      life:    0,
      maxLife: 0.3 + Math.random() * 0.4,
    });
  }

  /* ── DRAW ── */

  function _draw() {
    if (!_active) return;

    const dt = 0.016;
    _time += dt;
    _ctx.clearRect(0, 0, SIZE, SIZE);

    for (let i = 0; i < 6; i++) _spawnFlame();

    for (let i = _particles.length - 1; i >= 0; i--) {
      const p = _particles[i];
      p.life += dt;
      if (p.life >= p.maxLife) { _particles.splice(i, 1); continue; }

      const progress = p.life / p.maxLife;

      p.vx += (Math.random() - 0.5) * 0.5;
      p.x += p.vx;
      p.y += p.vy;
      p.vy *= 0.98;

      let alpha;
      if (progress < 0.1) {
        alpha = progress / 0.1;
      } else {
        alpha = 1 - ((progress - 0.1) / 0.9);
      }
      alpha *= 0.85;

      const sizeMult = progress < 0.25
        ? 1 + progress * 3
        : 1.75 * (1 - (progress - 0.25) / 0.75);
      const s = Math.max(1, Math.round(p.size * sizeMult));

      // dark blue palette
      const r = Math.round(8  + (18 - 8)   * (1 - progress));
      const g = Math.round(20 + (80 - 20)  * (1 - progress));
      const b = Math.round(60 + (180 - 60) * (1 - progress));

      _ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      const px = Math.round(p.x) - Math.floor(s / 2);
      const py = Math.round(p.y) - Math.floor(s / 2);
      _ctx.fillRect(px, py, s, s);

      if (s >= 2) {
        _ctx.fillStyle = `rgba(10, 26, 74, ${alpha * 0.3})`;
        _ctx.fillRect(px - 1, py - 1, s + 2, s + 2);
      }

      if (progress < 0.15 && Math.random() < 0.25) {
        _ctx.fillStyle = `rgba(51, 180, 220, ${alpha * 0.5})`;
        _ctx.fillRect(px, py, Math.max(1, s - 1), Math.max(1, s - 1));
      }
    }

    _raf = requestAnimationFrame(_draw);
  }

  /* ── PUBLIC ── */

 function start() {
    const a = document.getElementById('arena');
    if (!a) return;
    // cleanup orphaned canvases
    a.querySelectorAll('.slash-aura-canvas').forEach(c => c.remove());

    _canvas = document.createElement('canvas');
    _canvas.width = SIZE;
    _canvas.height = SIZE;
    _canvas.className = 'slash-aura-canvas';
    _canvas.style.cssText = `
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: ${SIZE}px; height: ${SIZE}px;
      pointer-events: none;
      z-index: 5;
      image-rendering: pixelated;
    `;
    a.appendChild(_canvas);

    _ctx = _canvas.getContext('2d');
    _time = 0;
    _particles = [];
    _active = true;
    _draw();

    a.classList.add('slash-active');
  }

  function stop() {
    _active = false;
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }

    const a = document.getElementById('arena');
    if (a) {
      a.classList.remove('slash-active');
      a.querySelectorAll('.slash-aura-canvas').forEach(c => c.remove());
    }
    _canvas = null;
    _ctx = null;
    _particles = [];
  }

  return { start, stop };
})();


/* ── SLASH TRAIL — blended energy blade ── */

function showSlashTrail(dir) {
  const a = document.getElementById('arena');
  if (!a) return;

  SFX.slashAttack();

  const { w, h } = getArenaSize();
  const cx = w / 2;
  const cy = h / 2;

  const duration = 300;

  // rotation based on direction
  let rot = 0;
  if (dir === 'right') rot = 0;
  if (dir === 'left')  rot = 180;
  if (dir === 'up')    rot = -90;
  if (dir === 'down')  rot = 90;

  // target position (off-screen)
  let tx = cx, ty = cy;
  if (dir === 'right') tx = w + 32;
  if (dir === 'left')  tx = -32;
  if (dir === 'up')    ty = -32;
  if (dir === 'down')  ty = h + 32;

  // create slash projectile
  const el = document.createElement('div');
  el.className = 'slash-trail-projectile';
  el.style.left = cx + 'px';
  el.style.top  = cy + 'px';
  el.style.transform = `translate(-50%,-50%) rotate(${rot}deg) scale(1.8)`;
  a.appendChild(el);

  // particle trail — track position with lerp instead of getBoundingClientRect
  const startTime = performance.now();
  const trailInterval = 20;
  const trailTimer = setInterval(() => {
    const elapsed = performance.now() - startTime;
    const t = Math.min(elapsed / duration, 1);
    // current projectile position via lerp
    const px = cx + (tx - cx) * t;
    const py = cy + (ty - cy) * t;
    // spawn particles behind the projectile along the travel axis
    _spawnSlashParticle(a, px, py, dir);
  }, trailInterval);

  // start movement after one frame
  requestAnimationFrame(() => {
    el.style.transition = `left ${duration}ms linear, top ${duration}ms linear`;
    el.style.left = tx + 'px';
    el.style.top  = ty + 'px';
  });

  // cleanup
  setTimeout(() => {
    clearInterval(trailTimer);
    el.remove();
  }, duration + 50);

  // center flash on attack
  const flash = document.createElement('div');
  flash.className = 'slash-center-flash';
  flash.style.left = cx + 'px';
  flash.style.top  = cy + 'px';
  a.appendChild(flash);
  setTimeout(() => flash.remove(), 120);
}

/* ── SLASH PARTICLE ── */

function _spawnSlashParticle(container, x, y, dir) {
  const count = 3 + Math.floor(Math.random() * 3); // 3-5 particles
  const isHoriz = (dir === 'left' || dir === 'right');

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'slash-trail-particle';

    // offset behind projectile (along travel axis) + small perpendicular spread
    let ox, oy;
    if (isHoriz) {
      // behind: opposite of travel direction, spread on Y axis (small)
      ox = (dir === 'right' ? -1 : 1) * (4 + Math.random() * 14);
      oy = (Math.random() - 0.5) * 10;
    } else {
      // behind: opposite of travel direction, spread on X axis (small)
      ox = (Math.random() - 0.5) * 10;
      oy = (dir === 'down' ? -1 : 1) * (4 + Math.random() * 14);
    }

    const size = 3 + Math.floor(Math.random() * 4); // 3-6px
    p.style.cssText = `
      left: ${x + ox}px;
      top: ${y + oy}px;
      width: ${size}px;
      height: ${size}px;
    `;
    container.appendChild(p);
    setTimeout(() => p.remove(), 350);
  }
}
/* ── ABILITY REGISTRATION ── */

AbilityRegistry.register({
  id:       'slash',
  name:     'Slash',
  desc:     'piercing full-line attacks with high damage for 3s',
  icon:     '🗡️',
  barColor: '#EC4899',
  duration: 3000,

  piercing:      false,
  blocksBullets: false,

  onActivate() {
    if (player) player.slashActive = true;
    SlashFX.start();
  },

  onDeactivate() {
    if (player) player.slashActive = false;
    SlashFX.stop();
  },
});