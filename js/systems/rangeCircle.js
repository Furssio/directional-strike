/* ═══════════════════════════════════════
   RANGECIRCLE.JS
   Blood ritual circle drawn on canvas
   inside #attack-range. Irregular edges,
   blood drops, slow floating particles.

   Used by: hud.js (updateRangeCircle)
   Depends on: dom.js (rangeEl)
   ═══════════════════════════════════════ */

const RangeCircle = (() => {
  let _canvas = null;
  let _ctx = null;
  let _animId = null;
  let _particles = [];
  let _drops = [];
  let _size = 0;
  let _noiseOffsets = []; // irregular edge
  let _time = 0;

  // blood palette
  const BLOOD_DARK   = '#3A0808';
  const BLOOD_MID    = '#6B1010';
  const BLOOD_BASE   = '#8B0000';
  const BLOOD_LIGHT  = '#AA2222';
  const BLOOD_BRIGHT = '#CC3333';

  const NUM_PARTICLES = 14;
  const NUM_DROPS = 20;
  const EDGE_POINTS = 64; // resolution of irregular circle

  /* ── INIT ── */
  function init() {
    if (_canvas) return;
    _canvas = document.createElement('canvas');
    _canvas.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;' +
      'pointer-events:none;image-rendering:pixelated;';
    rangeEl.appendChild(_canvas);
    _ctx = _canvas.getContext('2d');

    // generate noise offsets for irregular edge
    _noiseOffsets = [];
    for (let i = 0; i < EDGE_POINTS; i++) {
      _noiseOffsets.push({
        offset: (Math.random() - 0.5) * 0.08,
        speed: 0.0001 + Math.random() * 0.00015,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  /* ── RESIZE + REGENERATE ── */
  function resize(diameter) {
    if (!_canvas) init();
    const d = Math.round(diameter);
    if (d === _size) return;
    _size = d;

    // canvas pixel size = CSS size for crisp rendering
    _canvas.width = d;
    _canvas.height = d;

    _generateDrops();
    _generateParticles();
    _draw();

    // start animation loop if not running
    if (!_animId) _animate();
  }

  /* ── GENERATE BLOOD DROPS (static) ── */
  function _generateDrops() {
    _drops = [];
    const r = _size / 2;
    for (let i = 0; i < NUM_DROPS; i++) {
      const angle = Math.random() * Math.PI * 2;
      // cluster drops near the circle edge
      const dist = r * (0.85 + Math.random() * 0.3);
      _drops.push({
        x: r + Math.cos(angle) * dist,
        y: r + Math.sin(angle) * dist,
        radius: 1 + Math.random() * 2.5,
        opacity: 0.3 + Math.random() * 0.5,
        color: [BLOOD_DARK, BLOOD_MID, BLOOD_BASE, BLOOD_LIGHT][Math.floor(Math.random() * 4)]
      });
    }
  }

  /* ── GENERATE FLOATING PARTICLES ── */
  function _generateParticles() {
    _particles = [];
    const r = _size / 2;
    for (let i = 0; i < NUM_PARTICLES; i++) {
      const angle = Math.random() * Math.PI * 2;
      _particles.push({
        angle: angle,
        dist: r * (0.88 + Math.random() * 0.12),
        radius: 0.8 + Math.random() * 1.5,
        speed: 0.02 + Math.random() * 0.04, // degrees per frame — slow orbit
        opacity: 0.2 + Math.random() * 0.5,
        drift: Math.random() * 0.3, // radial drift amplitude
        driftSpeed: 0.001 + Math.random() * 0.002,
        color: [BLOOD_MID, BLOOD_BASE, BLOOD_LIGHT, BLOOD_BRIGHT][Math.floor(Math.random() * 4)]
      });
    }
  }

  /* ── DRAW FRAME ── */
  function _draw() {
    const ctx = _ctx;
    const d = _size;
    const r = d / 2;
    ctx.clearRect(0, 0, d, d);

    // ── 1. IRREGULAR BLOOD CIRCLE (filled area) ──
    ctx.beginPath();
    for (let i = 0; i <= EDGE_POINTS; i++) {
      const idx = i % EDGE_POINTS;
      const angle = (idx / EDGE_POINTS) * Math.PI * 2;
      const n = _noiseOffsets[idx];
      const wobble = n.offset * Math.sin(_time * n.speed + n.phase);
      const edgeR = r * (0.95 + wobble);
      const x = r + Math.cos(angle) * edgeR;
      const y = r + Math.sin(angle) * edgeR;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();

    // subtle radial gradient fill
    const grad = ctx.createRadialGradient(r, r, r * 0.7, r, r, r);
    grad.addColorStop(0, 'rgba(58, 8, 8, 0.0)');
    grad.addColorStop(0.6, 'rgba(58, 8, 8, 0.03)');
    grad.addColorStop(0.85, 'rgba(107, 16, 16, 0.06)');
    grad.addColorStop(1, 'rgba(139, 0, 0, 0.1)');
    ctx.fillStyle = grad;
    ctx.fill();

    // ── 2. BLOOD RING (main edge line) ──
    // draw multiple passes for thick, uneven look
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    // outer glow
    _drawIrregularRing(ctx, r, 0.96, 3.5, 'rgba(139, 0, 0, 0.15)');
    // main ring
    _drawIrregularRing(ctx, r, 0.95, 2.5, 'rgba(139, 0, 0, 0.45)');
    // inner edge
    _drawIrregularRing(ctx, r, 0.93, 1.5, 'rgba(107, 16, 16, 0.3)');

    ctx.restore();

    // ── 3. BLOOD SMEARS along the ring ──
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + _time * 0.0001;
      const smearR = r * (0.90 + Math.sin(_time * 0.0005 + i) * 0.04);
      const sx = r + Math.cos(angle) * smearR;
      const sy = r + Math.sin(angle) * smearR;
      const smearLen = 3 + Math.random() * 5;

      ctx.beginPath();
      ctx.arc(sx, sy, smearLen, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(107, 16, 16, ${0.08 + Math.sin(_time * 0.001 + i * 2) * 0.04})`;
      ctx.fill();
    }

    // ── 4. STATIC DROPS ──
    for (const drop of _drops) {
      ctx.beginPath();
      ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
      ctx.fillStyle = drop.color;
      ctx.globalAlpha = drop.opacity * (0.8 + Math.sin(_time * 0.002 + drop.x) * 0.2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // ── 5. FLOATING PARTICLES ──
    for (const p of _particles) {
      const driftOffset = Math.sin(_time * p.driftSpeed) * p.drift * r * 0.1;
      const px = r + Math.cos(p.angle) * (p.dist + driftOffset);
      const py = r + Math.sin(p.angle) * (p.dist + driftOffset);

      ctx.beginPath();
      ctx.arc(px, py, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity * (0.6 + Math.sin(_time * 0.003 + p.angle) * 0.4);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  /* ── DRAW ONE IRREGULAR RING ── */
  function _drawIrregularRing(ctx, r, radiusMult, lineWidth, color) {
    ctx.beginPath();
    for (let i = 0; i <= EDGE_POINTS; i++) {
      const idx = i % EDGE_POINTS;
      const angle = (idx / EDGE_POINTS) * Math.PI * 2;
      const n = _noiseOffsets[idx];
      const wobble = n.offset * Math.sin(_time * n.speed + n.phase);
      const edgeR = r * (radiusMult + wobble);
      const x = r + Math.cos(angle) * edgeR;
      const y = r + Math.sin(angle) * edgeR;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  /* ── ANIMATION LOOP ── */
  function _animate() {
    _time += 16; // ~60fps increment

    // move particles along orbit
    for (const p of _particles) {
      p.angle += p.speed * 0.01;
    }

    _draw();
    _animId = requestAnimationFrame(_animate);
  }

  /* ── STOP (cleanup) ── */
  function stop() {
    if (_animId) {
      cancelAnimationFrame(_animId);
      _animId = null;
    }
  }

  /* ── RESTART (after stop) ── */
  function start() {
    if (!_animId && _canvas) _animate();
  }

  return { init, resize, stop, start };
})();