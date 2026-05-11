/* ═══════════════════════════════════════
   SHIELD.JS
   Shield — player is invincible for 5s.
   Glowing bubble with firefly particles.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry
   ═══════════════════════════════════════ */

const ShieldFX = (() => {
  let _canvas = null;
  let _ctx = null;
  let _raf = null;
  let _fireflies = [];
  let _time = 0;
  let _active = false;
  let _flashTimer = 0;
  let _ripples = [];

  const SIZE = 180;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const BUBBLE_R = 54;
  const FIREFLY_COUNT = 10;

  /* ── FIREFLY SETUP ── */

  function _initFireflies() {
    _fireflies = [];
    for (let i = 0; i < FIREFLY_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 30;
      _fireflies.push({
        x:        CX + Math.cos(angle) * dist,
        y:        CY + Math.sin(angle) * dist,
        vx:       (Math.random() - 0.5) * 0.3,
        vy:       (Math.random() - 0.5) * 0.3,
        size:     1.5 + Math.random() * 1.5,
        phase:    Math.random() * Math.PI * 2,
        glowSpd:  0.4 + Math.random() * 0.6,
      });
    }
  }

  /* ── DRAW ── */

  function _draw() {
    if (!_active) return;

    const dt = 0.016;
    _time += dt;
    _ctx.clearRect(0, 0, SIZE, SIZE);

    // ── BUBBLE BODY ──
    // outer glow
    const glowPulse = 0.5 + 0.15 * Math.sin(_time * 1.2);
    const outerGlow = _ctx.createRadialGradient(CX, CY, BUBBLE_R - 4, CX, CY, BUBBLE_R + 14);
    outerGlow.addColorStop(0, `rgba(81, 238, 252, ${0.12 * glowPulse})`);
    outerGlow.addColorStop(1, 'rgba(81, 238, 252, 0)');
    _ctx.fillStyle = outerGlow;
    _ctx.beginPath();
    _ctx.arc(CX, CY, BUBBLE_R + 14, 0, Math.PI * 2);
    _ctx.fill();

    // bubble fill — gradient for volume (light top-left, dark bottom-right)
    const bubbleGrad = _ctx.createRadialGradient(
      CX - 14, CY - 16, 4,
      CX, CY, BUBBLE_R
    );
    bubbleGrad.addColorStop(0, 'rgba(180, 245, 255, 0.12)');
    bubbleGrad.addColorStop(0.4, 'rgba(81, 238, 252, 0.06)');
    bubbleGrad.addColorStop(0.8, 'rgba(40, 140, 220, 0.04)');
    bubbleGrad.addColorStop(1, 'rgba(20, 80, 180, 0.02)');
    _ctx.fillStyle = bubbleGrad;
    _ctx.beginPath();
    _ctx.arc(CX, CY, BUBBLE_R, 0, Math.PI * 2);
    _ctx.fill();

    // bubble border — pulsing
    const borderAlpha = 0.25 + 0.12 * Math.sin(_time * 1.5);
    _ctx.beginPath();
    _ctx.arc(CX, CY, BUBBLE_R, 0, Math.PI * 2);
    _ctx.strokeStyle = `rgba(81, 238, 252, ${borderAlpha})`;
    _ctx.lineWidth = 1.5;
    _ctx.stroke();

    // inner edge highlight (thin bright ring inside)
    const innerAlpha = 0.1 + 0.06 * Math.sin(_time * 1.8 + 1);
    _ctx.beginPath();
    _ctx.arc(CX, CY, BUBBLE_R - 3, 0, Math.PI * 2);
    _ctx.strokeStyle = `rgba(160, 245, 255, ${innerAlpha})`;
    _ctx.lineWidth = 0.5;
    _ctx.stroke();

    // ── SPECULAR HIGHLIGHT (moving reflection) ──
    const reflectAngle = _time * 0.3;
    const refX = CX - 16 + Math.sin(reflectAngle) * 8;
    const refY = CY - 18 + Math.cos(reflectAngle * 0.7) * 6;
    const reflectGrad = _ctx.createRadialGradient(refX, refY, 0, refX, refY, 14);
    const refAlpha = 0.15 + 0.08 * Math.sin(_time * 0.8);
    reflectGrad.addColorStop(0, `rgba(220, 255, 255, ${refAlpha})`);
    reflectGrad.addColorStop(1, 'rgba(220, 255, 255, 0)');
    _ctx.fillStyle = reflectGrad;
    _ctx.beginPath();
    _ctx.arc(refX, refY, 14, 0, Math.PI * 2);
    _ctx.fill();

    // small second highlight (bottom-right, dimmer)
    const ref2X = CX + 12 + Math.sin(reflectAngle * 0.5 + 2) * 5;
    const ref2Y = CY + 14 + Math.cos(reflectAngle * 0.6 + 1) * 4;
    const ref2Grad = _ctx.createRadialGradient(ref2X, ref2Y, 0, ref2X, ref2Y, 8);
    ref2Grad.addColorStop(0, `rgba(200, 250, 255, ${refAlpha * 0.5})`);
    ref2Grad.addColorStop(1, 'rgba(200, 250, 255, 0)');
    _ctx.fillStyle = ref2Grad;
    _ctx.beginPath();
    _ctx.arc(ref2X, ref2Y, 8, 0, Math.PI * 2);
    _ctx.fill();

    // ── FIREFLIES ──
    for (const f of _fireflies) {
      // slow drifting movement
      f.vx += (Math.random() - 0.5) * 0.02;
      f.vy += (Math.random() - 0.5) * 0.02;
      // dampen
      f.vx *= 0.98;
      f.vy *= 0.98;
      f.x += f.vx;
      f.y += f.vy;

      // keep inside bubble
      const dx = f.x - CX;
      const dy = f.y - CY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > BUBBLE_R - 8) {
        // push back gently
        f.x -= dx * 0.03;
        f.y -= dy * 0.03;
        f.vx -= dx * 0.005;
        f.vy -= dy * 0.005;
      }

      // glow pulsing — slow like fireflies
      const glow = 0.5 + 0.5 * Math.sin(_time * f.glowSpd + f.phase);
      const alpha = 0.15 + glow * 0.55;
      const s = Math.round(f.size + glow * 1.5);

      // pixel square
      _ctx.fillStyle = `rgba(160, 250, 255, ${alpha})`;
      const px = Math.round(f.x) - Math.floor(s / 2);
      const py = Math.round(f.y) - Math.floor(s / 2);
      _ctx.fillRect(px, py, s, s);

      // soft glow around firefly
      const fGlow = _ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 6 + glow * 4);
      fGlow.addColorStop(0, `rgba(81, 238, 252, ${alpha * 0.3})`);
      fGlow.addColorStop(1, 'rgba(81, 238, 252, 0)');
      _ctx.fillStyle = fGlow;
      _ctx.fillRect(f.x - 10, f.y - 10, 20, 20);
    }

    // ── FLASH (on kill) ──
    if (_flashTimer > 0) {
      _flashTimer -= dt;
      const fProgress = 1 - (_flashTimer / 0.25);
      const fAlpha = 0.35 * (1 - fProgress);
      _ctx.beginPath();
      _ctx.arc(CX, CY, BUBBLE_R + 2, 0, Math.PI * 2);
      _ctx.fillStyle = `rgba(200, 255, 255, ${fAlpha})`;
      _ctx.fill();

      // border flashes brighter
      _ctx.beginPath();
      _ctx.arc(CX, CY, BUBBLE_R, 0, Math.PI * 2);
      _ctx.strokeStyle = `rgba(200, 255, 255, ${fAlpha + 0.2})`;
      _ctx.lineWidth = 2.5;
      _ctx.stroke();
    }

    // ── RIPPLES (expanding rings on kill) ──
    for (let i = _ripples.length - 1; i >= 0; i--) {
      const rp = _ripples[i];
      rp.t += dt;
      const progress = rp.t / rp.duration;
      if (progress >= 1) { _ripples.splice(i, 1); continue; }

      const radius = BUBBLE_R + progress * 25;
      const alpha = 0.5 * (1 - progress);

      _ctx.beginPath();
      _ctx.arc(CX, CY, radius, 0, Math.PI * 2);
      _ctx.strokeStyle = `rgba(81, 238, 252, ${alpha})`;
      _ctx.lineWidth = 1.5 * (1 - progress);
      _ctx.stroke();
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
    _ripples = [];
    _flashTimer = 0;
    _active = true;
    _initFireflies();
    _draw();

    a.classList.add('shield-active');
  }

  function stop() {
    _active = false;
    if (_raf) { cancelAnimationFrame(_raf); _raf = null; }

    const a = document.getElementById('arena');
    if (a) {
      a.classList.remove('shield-active');
      if (_canvas && _canvas.parentNode) _canvas.remove();
    }
    _canvas = null;
    _ctx = null;
    _fireflies = [];
    _ripples = [];
  }

  function ripple() {
    if (!_active) return;
    _flashTimer = 0.25;
    _ripples.push({ t: 0, duration: 0.4 });
    // fireflies scatter briefly
    for (const f of _fireflies) {
      const dx = f.x - CX;
      const dy = f.y - CY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      f.vx += (dx / dist) * 1.5;
      f.vy += (dy / dist) * 1.5;
    }
  }

  return { start, stop, ripple };
})();

/* ── ABILITY REGISTRATION ── */

AbilityRegistry.register({
  id:       'shield',
  name:     'Shield',
  desc:     'invincible for 5s',
  icon:     '🛡️',
  barColor: '#3B82F6',
  duration: 5000,

  piercing:      false,
  blocksBullets: true,

  onActivate()   { ShieldFX.start(); },
  onDeactivate() { ShieldFX.stop(); },
});

/* ── RIPPLE TRIGGER (called from loop.js) ── */

function triggerShieldRipple() {
  ShieldFX.ripple();
}