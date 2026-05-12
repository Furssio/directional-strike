/* ═══════════════════════════════════════
   RANGEBOOST.JS
   Range Boost — increases attack range
   by 50% for 4 seconds.
   Emerald energy field: particles + waves.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry, config.js
   ═══════════════════════════════════════ */

const RangeBoostFX = (() => {
  // ── COLORS ──
  const C_CORE     = '#2ECC71';
  const C_GLOW     = '#50C878';
  const C_BRIGHT   = '#ADFFD2';
  const C_DIM      = '#1B8A4E';

  // ── STATE ──
  let _canvas    = null;
  let _ctx       = null;
  let _rafId     = null;
  let _particles = [];
  let _waves     = [];
  let _t         = 0;
  let _phase     = 'none'; // 'intro', 'idle', 'outro'
  let _phaseT    = 0;
  let _maxR      = 0;
  let _cx        = 0;
  let _cy        = 0;

  const INTRO_DUR  = 600;
  const OUTRO_DUR  = 400;
  const WAVE_COUNT = 3;
  const PARTICLE_COUNT = 40;

  // ── PARTICLES ──
  function _initParticles() {
    _particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      // target distance — spread across range
      const targetDist = 0.2 + Math.random() * 0.75;
      _particles.push({
        angle,
        targetDist,    // as fraction of maxR
        currentDist: 0,// starts at center (intro animation)
        size: Math.random() > 0.6 ? 3 : 2,
        drift: 0.3 + Math.random() * 0.5,    // orbital speed
        driftDir: Math.random() > 0.5 ? 1 : -1,
        bob: Math.random() * Math.PI * 2,     // radial bobbing phase
        bobAmp: 0.02 + Math.random() * 0.04,  // bobbing amplitude
        bobSpeed: 1.5 + Math.random() * 2,
        pulse: Math.random() * Math.PI * 2,   // opacity pulse
        pulseSpeed: 2 + Math.random() * 3,
        bright: Math.random() > 0.7,          // some are brighter
      });
    }
  }

  // ── WAVES ──
  function _initWaves() {
    _waves = [];
    for (let i = 0; i < WAVE_COUNT; i++) {
      _waves.push({
        progress: i / WAVE_COUNT, // staggered start (0..1 = center..edge)
        speed: 0.3 + Math.random() * 0.15,
      });
    }
  }

  // ── DRAW ──
  function _draw(dt) {
    if (!_ctx || !_canvas) return;
    const w = _canvas.width;
    const h = _canvas.height;
    _ctx.clearRect(0, 0, w, h);

    _t += dt;
    _phaseT += dt;

    // ── PHASE PROGRESS ──
    let introP = 1; // 0→1 during intro
    let outroP = 0; // 0→1 during outro

    if (_phase === 'intro') {
      introP = Math.min(_phaseT / INTRO_DUR, 1);
      // ease out cubic
      introP = 1 - Math.pow(1 - introP, 3);
      if (_phaseT >= INTRO_DUR) _phase = 'idle';
    } else if (_phase === 'outro') {
      outroP = Math.min(_phaseT / OUTRO_DUR, 1);
      // ease in quad
      outroP = outroP * outroP;
      if (outroP >= 1) { stop(); return; }
    }

    // scale factor: 0→1 on intro, 1→0 on outro
    const scale = _phase === 'outro' ? 1 - outroP : introP;
    // alpha factor
    const alpha = _phase === 'outro' ? 1 - outroP : Math.min(introP * 1.5, 1);

    _ctx.imageSmoothingEnabled = false;

    // ── DRAW WAVES ──
    for (const wave of _waves) {
      wave.progress += (dt / 1000) * wave.speed;
      if (wave.progress > 1) wave.progress -= 1;

      const waveR = wave.progress * _maxR * scale;
      // opacity: strong near center, fades at edge
      const waveAlpha = (1 - wave.progress) * 0.4 * alpha;
      if (waveAlpha < 0.01) continue;

      // glow ring
      _ctx.beginPath();
      _ctx.arc(_cx, _cy, Math.max(waveR, 1), 0, Math.PI * 2);
      _ctx.closePath();
      _ctx.strokeStyle = C_GLOW;
      _ctx.lineWidth = 3;
      _ctx.globalAlpha = waveAlpha * 0.4;
      _ctx.stroke();

      // core ring
      _ctx.beginPath();
      _ctx.arc(_cx, _cy, Math.max(waveR, 1), 0, Math.PI * 2);
      _ctx.closePath();
      _ctx.strokeStyle = C_CORE;
      _ctx.lineWidth = 1;
      _ctx.globalAlpha = waveAlpha;
      _ctx.stroke();
    }

    // ── DRAW PARTICLES ──
    for (const p of _particles) {
      // orbital drift
      p.angle += p.drift * p.driftDir * dt * 0.001;

      // radial bobbing
      p.bob += p.bobSpeed * dt * 0.001;
      const bobOffset = Math.sin(p.bob) * p.bobAmp;

      // intro: particles fly out from center
      // outro: particles fly back to center
      if (_phase === 'intro') {
        p.currentDist = p.targetDist * introP;
      } else if (_phase === 'outro') {
        p.currentDist = p.targetDist * (1 - outroP);
      } else {
        // idle — smoothly settle at target
        p.currentDist += (p.targetDist - p.currentDist) * 0.05;
      }

      const dist = (p.currentDist + bobOffset) * _maxR * scale;
      const px = _cx + Math.cos(p.angle) * dist;
      const py = _cy + Math.sin(p.angle) * dist;

      // opacity pulse
      p.pulse += p.pulseSpeed * dt * 0.001;
      const pAlpha = (0.4 + 0.6 * Math.sin(p.pulse) * 0.5 + 0.5) * alpha;

      // glow behind particle
      _ctx.globalAlpha = pAlpha * 0.25;
      _ctx.fillStyle = C_GLOW;
      _ctx.fillRect(
        Math.round(px) - 1,
        Math.round(py) - 1,
        p.size + 2,
        p.size + 2
      );

      // core particle
      _ctx.globalAlpha = pAlpha;
      _ctx.fillStyle = p.bright ? C_BRIGHT : C_CORE;
      _ctx.fillRect(Math.round(px), Math.round(py), p.size, p.size);
    }

    _ctx.globalAlpha = 1;
  }

  // ── ANIMATION LOOP ──
  let _lastFrame = 0;
  function _loop(timestamp) {
    if (!_canvas) return;
    const dt = _lastFrame ? timestamp - _lastFrame : 16;
    _lastFrame = timestamp;
    _draw(Math.min(dt, 50));
    _rafId = requestAnimationFrame(_loop);
  }

  // ── PUBLIC API ──
  function start() {
    stop();

    const arena = document.getElementById('arena');
    if (!arena) return;

    _canvas = document.createElement('canvas');
    _canvas.classList.add('rb-canvas');
    _canvas.width  = arena.offsetWidth;
    _canvas.height = arena.offsetHeight;
    _canvas.style.cssText = `
      position: absolute; top: 0; left: 0;
      width: ${arena.offsetWidth}px; height: ${arena.offsetHeight}px;
      z-index: 15; pointer-events: none;
      image-rendering: pixelated;
    `;
    _ctx = _canvas.getContext('2d');
    arena.appendChild(_canvas);
    arena.classList.add('range-boost-active');

    const arenaSize = Math.min(_canvas.width, _canvas.height);
    _cx = _canvas.width / 2;
    _cy = _canvas.height / 2;
    _maxR = player.getAttackRange(arenaSize);

    _initParticles();
    _initWaves();

    _t = 0;
    _phaseT = 0;
    _phase = 'intro';
    _lastFrame = 0;

    // micro shake on activation
    if (typeof triggerShake === 'function') triggerShake();

    _rafId = requestAnimationFrame(_loop);
  }

  function fadeOut() {
    _phase = 'outro';
    _phaseT = 0;
  }

  function stop() {
    if (_rafId) { cancelAnimationFrame(_rafId); _rafId = null; }
    if (_canvas && _canvas.parentNode) _canvas.remove();
    _canvas = null;
    _ctx = null;
    _particles = [];
    _waves = [];
    _phase = 'none';
    _lastFrame = 0;

    const arena = document.getElementById('arena');
    if (arena) arena.classList.remove('range-boost-active');
  }

  return { start, fadeOut, stop };
})();


AbilityRegistry.register({
  id:       'range_boost',
  name:     'Range Boost',
  desc:     'increases attack range by 50% for 4s',
  icon:     '🎯',
  barColor: '#F59E0B',
  duration: 4000,

  piercing:      false,
  blocksBullets: false,

  onActivate() {
    if (player) {
      player.rangePctMultiplier = 1.5;
      updateRangeCircle();
    }
    RangeBoostFX.start();
  },

  onDeactivate() {
    if (player) {
      player.rangePctMultiplier = 1.0;
      updateRangeCircle();
    }
    RangeBoostFX.fadeOut();
  },
});