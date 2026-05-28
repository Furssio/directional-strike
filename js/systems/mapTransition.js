/* ═══════════════════════════════════════
   MAPTRANSITION.JS
   Challenge Mode map change effect.
   Rift particles + dimension cracks.

   Creates a canvas overlay inside #arena.
   Two modes: normal (particle flood) and
   dimension (cracks + glitch + chaos).

   Used by: challengeDirector.js
   Depends on: dom.js (arena element)
   ═══════════════════════════════════════ */

const MapTransition = (() => {

  /* ── DOM REFS ──────────────────────── */
  let canvas   = null;
  let ctx      = null;
  let nameEl   = null;
  let textEl   = null;
  let flashEl  = null;
  let arenaEl  = null;
  let W = 500, H = 500;

  /* ── ANIM STATE ────────────────────── */
  let particles = [];
  let cracks    = [];
  let animId    = null;
  let running   = false;

  const PX = 4; // pixel size

  /* ── SETUP DOM (called once) ───────── */

  function _ensureDOM() {
    arenaEl = document.getElementById('arena');
    if (!arenaEl) return;

    // canvas
    if (!document.getElementById('map-transition-canvas')) {
      canvas = document.createElement('canvas');
      canvas.id = 'map-transition-canvas';
      arenaEl.appendChild(canvas);
    } else {
      canvas = document.getElementById('map-transition-canvas');
    }
    ctx = canvas.getContext('2d');

    // name container
    if (!document.getElementById('map-transition-name')) {
      nameEl = document.createElement('div');
      nameEl.id = 'map-transition-name';
      nameEl.innerHTML = '<span id="map-transition-text"></span>';
      arenaEl.appendChild(nameEl);
    } else {
      nameEl = document.getElementById('map-transition-name');
    }
    textEl = document.getElementById('map-transition-text');

    // flash overlay (reuse #flash if exists, else create)
    if (!document.getElementById('map-transition-flash')) {
      flashEl = document.createElement('div');
      flashEl.id = 'map-transition-flash';
      flashEl.style.cssText =
        'position:absolute;inset:0;z-index:34;' +
        'pointer-events:none;opacity:0;border-radius:12px;';
      arenaEl.appendChild(flashEl);
    } else {
      flashEl = document.getElementById('map-transition-flash');
    }

    _resize();
  }

  function _resize() {
    if (!arenaEl || !canvas) return;
    W = arenaEl.clientWidth;
    H = arenaEl.clientHeight;
    canvas.width  = W;
    canvas.height = H;
  }

  /* ── HELPERS ───────────────────────── */

  function _hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  }

  function _wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  /* ── PARTICLE SYSTEM ───────────────── */

  function _spawnScatter(color, colorDark, count) {
    const rgb1 = _hexToRgb(color);
    const rgb2 = _hexToRgb(colorDark);
    const cx = W / 2, cy = H / 2;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist  = 20 + Math.random() * 60;
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      const size = PX * (1 + Math.floor(Math.random() * 2));
      const tAngle = Math.random() * Math.PI * 2;
      const tDist  = 100 + Math.random() * (Math.max(W, H) * 0.5);
      const tx = x + Math.cos(tAngle) * tDist;
      const ty = y + Math.sin(tAngle) * tDist;
      const useAlt = Math.random() < 0.3;
      const bright = Math.random() < 0.15;
      const rgb = bright ? [255, 255, 255] : (useAlt ? rgb2 : rgb1);

      particles.push({
        x, y, tx, ty, size,
        r: rgb[0], g: rgb[1], b: rgb[2],
        phase: 'scatter',
        born: performance.now() + Math.random() * 400,
        lifespan: 800 + Math.random() * 1200,
        maxAlpha: 0.6 + Math.random() * 0.4,
      });
    }
  }

  function _spawnCover(color, colorDark) {
    const rgb1 = _hexToRgb(color);
    const rgb2 = _hexToRgb(colorDark);
    const cx = W / 2, cy = H / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);
    const cols = Math.ceil(W / PX);
    const rows = Math.ceil(H / PX);

    for (let gy = 0; gy < rows; gy += 2) {
      for (let gx = 0; gx < cols; gx += 2) {
        if (Math.random() < 0.35) continue;
        const x = gx * PX;
        const y = gy * PX;
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const delay = (dist / maxDist) * 600;
        const useAlt = Math.random() < 0.3;
        const bright = Math.random() < 0.1;
        const rgb = bright ? [255, 255, 255] : (useAlt ? rgb2 : rgb1);

        particles.push({
          x, y, tx: x, ty: y, size: PX,
          r: rgb[0], g: rgb[1], b: rgb[2],
          phase: 'cover',
          born: performance.now() + delay,
          lifespan: 500 + Math.random() * 300,
          maxAlpha: 0.85 + Math.random() * 0.15,
        });
      }
    }
  }

  /* ── CRACK SYSTEM (dimension only) ─── */

  function _spawnCracks(color) {
    const rgb = _hexToRgb(color);
    const cx = W / 2, cy = H / 2;
    const numMain = 10 + Math.floor(Math.random() * 6);

    for (let i = 0; i < numMain; i++) {
      const angle = (Math.PI * 2 / numMain) * i +
                    (Math.random() - 0.5) * 0.3;
      const ocx = cx + (Math.random() - 0.5) * 40;
      const ocy = cy + (Math.random() - 0.5) * 40;
      _buildBranch(ocx, ocy, angle,
        250 + Math.random() * Math.max(W, H) * 0.4,
        rgb, 3 + Math.random() * 2, i * 30, 0);
    }
  }

  function _buildBranch(sx, sy, angle, totalLen, rgb, thickness, delay, depth) {
    const segs = 12 + Math.floor(Math.random() * 8);
    const segLen = totalLen / segs;
    const points = [{ x: sx, y: sy }];
    let x = sx, y = sy;

    for (let i = 0; i < segs; i++) {
      const jitter = (Math.random() - 0.5) * 0.6;
      const a = angle + jitter;
      x += Math.cos(a) * segLen;
      y += Math.sin(a) * segLen;
      points.push({ x, y });

      // sub-branches
      if (depth < 2 && i > 3 && Math.random() < 0.25) {
        const bAngle = angle +
          (Math.random() < 0.5 ? 1 : -1) *
          (0.4 + Math.random() * 0.8);
        _buildBranch(x, y, bAngle,
          totalLen * 0.4, rgb, thickness * 0.6,
          delay + i * 15, depth + 1);
      }
    }

    cracks.push({
      points, thickness,
      r: rgb[0], g: rgb[1], b: rgb[2],
      born: performance.now() + delay,
      growDuration: 600 + Math.random() * 400,
      maxAlpha: 0.9,
      glowSize: thickness * 3,
    });
  }

  /* ── RENDER LOOP ───────────────────── */

  function _render() {
    ctx.clearRect(0, 0, W, H);
    const now = performance.now();

    // draw cracks
    for (let i = 0; i < cracks.length; i++) {
      const c = cracks[i];
      const age = now - c.born;
      if (age < 0) continue;
      const progress = Math.min(1, age / c.growDuration);
      const drawPts = Math.max(2, Math.floor(c.points.length * progress));
      const fadeIn = Math.min(1, age / 300);
      const alpha = c.maxAlpha * fadeIn;

      // glow
      ctx.save();
      ctx.globalAlpha = alpha * 0.3;
      ctx.strokeStyle = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
      ctx.lineWidth = c.glowSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(c.points[0].x, c.points[0].y);
      for (let j = 1; j < drawPts; j++) {
        ctx.lineTo(c.points[j].x, c.points[j].y);
      }
      ctx.stroke();

      // core (white)
      ctx.globalAlpha = alpha;
      ctx.lineWidth = c.thickness;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.moveTo(c.points[0].x, c.points[0].y);
      for (let j = 1; j < drawPts; j++) {
        ctx.lineTo(c.points[j].x, c.points[j].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const age = now - p.born;
      if (age < 0) continue;
      const life = age / p.lifespan;
      if (life > 1) { particles.splice(i, 1); continue; }

      let alpha, dx, dy;

      if (p.phase === 'cover') {
        // fade in → hold → fade out
        alpha = life < 0.3
          ? (life / 0.3) * p.maxAlpha
          : life < 0.7
            ? p.maxAlpha
            : p.maxAlpha * (1 - (life - 0.7) / 0.3);
        dx = p.x;
        dy = p.y;
      } else {
        // scatter outward
        const t = life;
        dx = p.x + (p.tx - p.x) * t;
        dy = p.y + (p.ty - p.y) * t;
        alpha = life < 0.2
          ? (life / 0.2) * p.maxAlpha
          : p.maxAlpha * (1 - (life - 0.2) / 0.8);
      }

      if (alpha <= 0) continue;

      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgb(' + p.r + ',' + p.g + ',' + p.b + ')';
      ctx.fillRect(Math.floor(dx), Math.floor(dy), p.size, p.size);
    }

    ctx.globalAlpha = 1;

    if (particles.length > 0 || cracks.length > 0) {
      animId = requestAnimationFrame(_render);
    } else {
      animId = null;
    }
  }

  function _startRender() {
    if (!animId) animId = requestAnimationFrame(_render);
  }

  function _stopRender() {
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    particles = [];
    cracks    = [];
    if (ctx) ctx.clearRect(0, 0, W, H);
  }

  /* ── SHAKE ─────────────────────────── */

  function _shake(duration, intensity) {
    if (!arenaEl) return;
    const start = performance.now();
    function tick() {
      const e = performance.now() - start;
      if (e > duration) { arenaEl.style.transform = ''; return; }
      const f = 1 - e / duration;
      const ox = (Math.random() - 0.5) * intensity * f * 2;
      const oy = (Math.random() - 0.5) * intensity * f * 2;
      arenaEl.style.transform =
        'translate(' + ox + 'px,' + oy + 'px)';
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ── GLITCH SHAKE (dimension) ──────── */

  function _glitchShake(duration) {
    if (!arenaEl) return;
    const start = performance.now();
    function tick() {
      const e = performance.now() - start;
      if (e > duration) {
        arenaEl.style.transform = '';
        return;
      }
      if (Math.random() < 0.15) {
        const ox = (Math.random() - 0.5) * 12;
        const oy = (Math.random() - 0.5) * 12;
        arenaEl.style.transform =
          'translate(' + ox + 'px,' + oy + 'px)';
      }
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ── FLASH ─────────────────────────── */

  function _flash(color, inMs, holdMs, outMs, maxOpacity) {
    if (!flashEl) return _wait(inMs + holdMs + outMs);

    flashEl.style.background = color;
    flashEl.style.transition = 'opacity ' + inMs + 'ms ease-in';
    flashEl.style.opacity = String(maxOpacity || 0.7);

    return _wait(inMs + holdMs).then(() => {
      flashEl.style.transition = 'opacity ' + outMs + 'ms ease-out';
      flashEl.style.opacity = '0';
      return _wait(outMs);
    });
  }

  /* ── SHOW MAP NAME ─────────────────── */

  function _showName(name, color, pulse) {
    if (!nameEl || !textEl) return;
    textEl.style.color = color;
    textEl.textContent = name;
    textEl.classList.toggle('pulse', !!pulse);
    nameEl.classList.remove('fade-out');
    nameEl.classList.add('visible');
  }

  function _hideName() {
    if (!nameEl) return;
    nameEl.classList.add('fade-out');
    nameEl.classList.remove('visible');
    return _wait(600).then(() => {
      nameEl.classList.remove('fade-out');
      if (textEl) textEl.classList.remove('pulse');
    });
  }

  /* ═══════════════════════════════════
     PUBLIC — NORMAL TRANSITION
     ═══════════════════════════════════ */

  async function playNormal(mapName, color, colorDark, onSwapBg) {
    if (running) return;
    running = true;
    _ensureDOM();
    _resize();
    _stopRender();

    // Phase 1 — scatter particles from center
    SFX.mapNormalRise();
    _spawnScatter(color, colorDark, 80);
    _startRender();

    await _wait(500);
    _spawnScatter(color, colorDark, 120);

    await _wait(500);

    // Phase 2 — cover screen with pixel flood
    SFX.mapNormalCover();
    _spawnCover(color, colorDark);

    await _wait(700);

    // Phase 3 — flash + swap background
    SFX.mapNormalFlash();
    flashEl.style.background = color;
    flashEl.style.transition = 'opacity 0.12s ease-in';
    flashEl.style.opacity = '0.6';

    await _wait(150);

    // callback: change the actual map bg
    if (onSwapBg) onSwapBg();

    // remove cover particles
    particles = particles.filter(p => p.phase !== 'cover');

    flashEl.style.transition = 'opacity 0.6s ease-out';
    flashEl.style.opacity = '0';

    await _wait(400);

    // Phase 4 — show map name
    SFX.mapNormalReveal();
    _showName(mapName, color, false);

    await _wait(2000);

    await _hideName();

    _stopRender();
    running = false;
  }

  /* ═══════════════════════════════════
     PUBLIC — DIMENSION TRANSITION
     ═══════════════════════════════════ */

  async function playDimension(onSwapBg) {
    if (running) return;
    running = true;
    _ensureDOM();
    _resize();
    _stopRender();

    const color     = '#ff00ff';
    const colorDark = '#880088';

    // Phase 1 — ominous particles
    SFX.mapDimDrone();
    _spawnScatter(color, colorDark, 40);
    _startRender();

    await _wait(300);

    // Phase 2 — glitch + cracks
    SFX.mapDimCracks();
    _glitchShake(3500);
    _spawnCracks(color);
    _spawnScatter(color, colorDark, 60);

    await _wait(400);
    _spawnScatter(color, colorDark, 80);

    await _wait(400);
    _spawnScatter('#ffffff', '#aaaaaa', 40);

    // Phase 3 — glitch flashes
    for (let i = 0; i < 5; i++) {
      SFX.mapDimGlitch();
      const c = i % 2 === 0 ? color : '#ffffff';
      flashEl.style.background = c;
      flashEl.style.transition = 'opacity 0.04s';
      flashEl.style.opacity =
        String(0.2 + Math.random() * 0.5);
      await _wait(60 + Math.random() * 80);
      flashEl.style.opacity = '0';
      await _wait(40 + Math.random() * 60);
    }

    // Phase 4 — final burst + cover
    _spawnCover(color, colorDark);

    await _wait(600);

    // big shake + white flash
    SFX.mapDimExplode();
    _shake(500, 8);

    flashEl.style.background = '#ffffff';
    flashEl.style.transition = 'opacity 0.08s';
    flashEl.style.opacity = '0.95';

    await _wait(200);

    // swap bg
    if (onSwapBg) onSwapBg();
    cracks = [];
    particles = particles.filter(p => p.phase !== 'cover');

    flashEl.style.background = color;
    flashEl.style.transition = 'opacity 1s ease-out';
    flashEl.style.opacity = '0';

    await _wait(600);

    // Phase 5 — DIMENSION name with pulse
    SFX.mapDimReveal();
    _showName('DIMENSION', color, true);

    await _wait(2500);

    await _hideName();

    _stopRender();
    running = false;
  }

  /* ── CLEANUP ───────────────────────── */

  function cleanup() {
    _stopRender();
    if (nameEl) {
      nameEl.classList.remove('visible', 'fade-out');
    }
    if (textEl) textEl.classList.remove('pulse');
    if (flashEl) flashEl.style.opacity = '0';
    if (arenaEl) arenaEl.style.transform = '';
    running = false;
  }

  /* ── PUBLIC API ────────────────────── */

  return {
    playNormal,
    playDimension,
    cleanup,
    isRunning() { return running; },
  };

})();