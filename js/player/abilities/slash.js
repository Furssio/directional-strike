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
      const c = a.querySelector('.slash-aura-canvas');
      if (c) c.remove();
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

  const { w, h } = getArenaSize();
  const isHoriz = (dir === 'left' || dir === 'right');
  const len = isHoriz ? w / 2 : h / 2;
  const thickness = 60;

  const canvas = document.createElement('canvas');
  const cw = isHoriz ? Math.round(len) : thickness;
  const ch = isHoriz ? thickness : Math.round(len);
  canvas.width = cw;
  canvas.height = ch;
  canvas.style.cssText = `
    position: absolute;
    pointer-events: none;
    z-index: 8;
    image-rendering: pixelated;
  `;

  const cx = w / 2;
  const cy = h / 2;

  if (dir === 'right') {
    canvas.style.left = cx + 'px';
    canvas.style.top  = (cy - thickness / 2) + 'px';
  } else if (dir === 'left') {
    canvas.style.left = (cx - len) + 'px';
    canvas.style.top  = (cy - thickness / 2) + 'px';
  } else if (dir === 'up') {
    canvas.style.left = (cx - thickness / 2) + 'px';
    canvas.style.top  = (cy - len) + 'px';
  } else {
    canvas.style.left = (cx - thickness / 2) + 'px';
    canvas.style.top  = cy + 'px';
  }

  a.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // animate expansion
  const totalFrames = 10;
  const frameDur = 15;
  let frame = 0;

  function drawFrame() {
    frame++;
    const expansion = Math.min(frame / totalFrames, 1);
    ctx.clearRect(0, 0, cw, ch);

    const maxLen = isHoriz ? cw : ch;
    const curLen = Math.round(maxLen * expansion);
    const mid = isHoriz ? ch / 2 : cw / 2;

    // blade shape: wide at base, tapers to point
    // use gradient fills for smooth color blending

    // ── OUTER GLOW (dark navy, wide, blended) ──
    const glowGrad = isHoriz
      ? ctx.createLinearGradient(0, 0, curLen, 0)
      : ctx.createLinearGradient(0, 0, 0, curLen);
    glowGrad.addColorStop(0,   `rgba(8, 15, 60, ${0.4 * expansion})`);
    glowGrad.addColorStop(0.5, `rgba(12, 30, 100, ${0.25 * expansion})`);
    glowGrad.addColorStop(1,   `rgba(8, 15, 60, 0)`);

    ctx.fillStyle = glowGrad;
    if (isHoriz) {
      // tapered shape using path
      ctx.beginPath();
      ctx.moveTo(0, mid - 30);
      ctx.lineTo(curLen, mid - 4);
      ctx.lineTo(curLen, mid + 4);
      ctx.lineTo(0, mid + 30);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(mid - 30, 0);
      ctx.lineTo(mid - 4, curLen);
      ctx.lineTo(mid + 4, curLen);
      ctx.lineTo(mid + 30, 0);
      ctx.closePath();
      ctx.fill();
    }

    // ── MAIN BLADE (dark blue → blue, blended gradient) ──
    const bladeGrad = isHoriz
      ? ctx.createLinearGradient(0, 0, curLen, 0)
      : ctx.createLinearGradient(0, 0, 0, curLen);
    bladeGrad.addColorStop(0,   `rgba(18, 60, 180, ${0.9 * expansion})`);
    bladeGrad.addColorStop(0.3, `rgba(14, 50, 160, ${0.8 * expansion})`);
    bladeGrad.addColorStop(0.7, `rgba(10, 35, 130, ${0.6 * expansion})`);
    bladeGrad.addColorStop(1,   `rgba(8, 20, 80, 0)`);

    ctx.fillStyle = bladeGrad;
    if (isHoriz) {
      ctx.beginPath();
      ctx.moveTo(0, mid - 18);
      ctx.lineTo(curLen, mid - 2);
      ctx.lineTo(curLen, mid + 2);
      ctx.lineTo(0, mid + 18);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(mid - 18, 0);
      ctx.lineTo(mid - 2, curLen);
      ctx.lineTo(mid + 2, curLen);
      ctx.lineTo(mid + 18, 0);
      ctx.closePath();
      ctx.fill();
    }

    // ── BRIGHT CORE (white-cyan → cyan → blue, thin, blended) ──
    const coreGrad = isHoriz
      ? ctx.createLinearGradient(0, 0, curLen, 0)
      : ctx.createLinearGradient(0, 0, 0, curLen);
    coreGrad.addColorStop(0,   `rgba(180, 220, 255, ${0.95 * expansion})`);
    coreGrad.addColorStop(0.2, `rgba(81, 200, 252, ${0.85 * expansion})`);
    coreGrad.addColorStop(0.5, `rgba(40, 120, 220, ${0.7 * expansion})`);
    coreGrad.addColorStop(1,   `rgba(18, 60, 160, 0)`);

    ctx.fillStyle = coreGrad;
    if (isHoriz) {
      ctx.beginPath();
      ctx.moveTo(0, mid - 6);
      ctx.lineTo(curLen * 0.85, mid - 1);
      ctx.lineTo(curLen * 0.85, mid + 1);
      ctx.lineTo(0, mid + 6);
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(mid - 6, 0);
      ctx.lineTo(mid - 1, curLen * 0.85);
      ctx.lineTo(mid + 1, curLen * 0.85);
      ctx.lineTo(mid + 6, 0);
      ctx.closePath();
      ctx.fill();
    }

    // ── EDGE PARTICLES (dark blue fragments) ──
    const fragCount = Math.round(6 * expansion);
    for (let i = 0; i < fragCount; i++) {
      const fProgress = Math.random();
      const fPos = Math.round(fProgress * curLen);
      // blade width at this point
      const bwHere = 18 * (1 - fProgress * fProgress * 0.8);
      const fOff = (Math.random() > 0.5 ? 1 : -1) * (bwHere * 0.5 + Math.random() * 8);
      const fSize = 1 + Math.round(Math.random() * 2);
      const fAlpha = (0.4 + Math.random() * 0.3) * expansion;

      ctx.fillStyle = `rgba(12, 40, 140, ${fAlpha})`;
      if (isHoriz) {
        ctx.fillRect(fPos, Math.round(mid + fOff), fSize, fSize);
      } else {
        ctx.fillRect(Math.round(mid + fOff), fPos, fSize, fSize);
      }
    }

    // ── SPARKS ──
    const sparkCount = Math.round(3 * expansion);
    for (let i = 0; i < sparkCount; i++) {
      const sp = Math.random() * curLen;
      const sOff = (Math.random() - 0.5) * 20;
      const ss = 1 + Math.round(Math.random());
      if (Math.random() < 0.4) {
        ctx.fillStyle = `rgba(180, 220, 255, ${0.7 + Math.random() * 0.3})`;
      } else {
        ctx.fillStyle = `rgba(40, 120, 220, ${0.5 + Math.random() * 0.3})`;
      }
      if (isHoriz) {
        ctx.fillRect(Math.round(sp), Math.round(mid + sOff), ss, ss);
      } else {
        ctx.fillRect(Math.round(mid + sOff), Math.round(sp), ss, ss);
      }
    }

    if (frame < totalFrames) {
      setTimeout(drawFrame, frameDur);
    } else {
      setTimeout(() => {
        canvas.style.transition = 'opacity 150ms ease-out';
        canvas.style.opacity = '0';
        setTimeout(() => canvas.remove(), 160);
      }, 60);
    }
  }

  // flash at center on attack
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: absolute;
    left: ${w / 2}px; top: ${h / 2}px;
    width: 24px; height: 24px;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle,
      rgba(120,180,255,0.7) 0%,
      rgba(18,60,160,0.3) 50%,
      transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9;
  `;
  a.appendChild(flash);
  setTimeout(() => flash.remove(), 100);

  drawFrame();
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