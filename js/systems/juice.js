/* ═══════════════════════════════════════
   JUICE.JS
   Visual feedback effects — particles,
   screen shake, damage flash.

   Used by: combat.js, loop.js
   Depends on: dom.js, config.js
   ═══════════════════════════════════════ */

function spawnParticles(x, y, color, isElite) {
  const cfg   = CONFIG.juice.particles;
  const count = isElite ? cfg.killCountElite : cfg.killCount;

  for (let i = 0; i < count; i++) {
    const p     = document.createElement('div');
    p.className = 'particle';

    const size  = cfg.minSize + Math.random() * (cfg.maxSize - cfg.minSize);
    const angle = Math.random() * Math.PI * 2;
    const speed = cfg.minSpeed + Math.random() * (cfg.maxSpeed - cfg.minSpeed);
    const vx    = Math.cos(angle) * speed;
    const vy    = Math.sin(angle) * speed;

    p.style.cssText = `width:${size}px;height:${size}px;background:${color};left:${x}px;top:${y}px;opacity:1;`;
    arena.appendChild(p);

    const start = performance.now();

    function animParticle(now) {
      const t = (now - start) / cfg.lifetime;
      if (t >= 1) { p.remove(); return; }

      p.style.left      = (x + vx * speed * t * 18) + 'px';
      p.style.top       = (y + vy * speed * t * 18) + 'px';
      p.style.opacity   = 1 - t;
      p.style.transform = `translate(-50%,-50%) scale(${1 - t * 0.5})`;
      requestAnimationFrame(animParticle);
    }

    requestAnimationFrame(animParticle);
  }
}

let shakeTimeout = null;
function triggerShake() {
  if (!CONFIG.juice.shakeOnDamage) return;
  arena.classList.remove('shake');
  void arena.offsetWidth;
  arena.classList.add('shake');
  clearTimeout(shakeTimeout);
  shakeTimeout = setTimeout(() => arena.classList.remove('shake'), 300);
}