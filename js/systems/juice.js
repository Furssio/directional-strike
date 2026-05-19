/* ═══════════════════════════════════════
   JUICE.JS
   Visual feedback effects — particles,
   screen shake, damage flash.

   Used by: combat.js, loop.js
   Depends on: dom.js, config.js
   ═══════════════════════════════════════ */

/* ── DEFAULT DEATH COLORS ─────────────
   Used when enemy has no deathColors.
   Based on enemy size bracket.
──────────────────────────────────────── */
const _defaultDeathColors = {
  small:  ['#ffffff', '#cccccc', '#999999'],
  medium: ['#ffffff', '#dddddd', '#aaaaaa'],
  large:  ['#ffffff', '#eeeeee', '#bbbbbb'],
};

/* ── KILL FLASH ───────────────────────── */
function _spawnKillFlash(x, y) {
  const cfg = CONFIG.juice.particles;
  if (!cfg.flash) return;

  const fl = document.createElement('div');
  fl.style.cssText = `
    position:absolute;left:${x}px;top:${y}px;
    width:24px;height:24px;
    background:radial-gradient(circle,rgba(255,255,255,0.9),rgba(255,255,255,0) 70%);
    border-radius:50%;pointer-events:none;
    transform:translate(-50%,-50%);z-index:90;
  `;
  arena.appendChild(fl);
  setTimeout(() => fl.remove(), cfg.flashDuration);
}

/* ── MAIN PARTICLE SYSTEM ─────────────── */
function spawnParticles(x, y, enemyDef) {
  const cfg = CONFIG.juice.particles;

  // resolve death config from enemy def
  const dp = (enemyDef && enemyDef.deathParticles) || {};
  const enemySize = (enemyDef && enemyDef.size) || 48;

  // pick color palette
  let colors;
  if (dp.colors && dp.colors.length) {
    colors = dp.colors;
  } else if (enemyDef && enemyDef.deathColors && enemyDef.deathColors.length) {
    colors = enemyDef.deathColors;
  } else {
    if (enemySize <= 48)       colors = _defaultDeathColors.small;
    else if (enemySize <= 72)  colors = _defaultDeathColors.medium;
    else                       colors = _defaultDeathColors.large;
  }

  // count
  const isElite = enemySize >= 80;
  const baseCount = isElite ? cfg.killCountElite : cfg.killCount;
  const count = dp.count || baseCount;

  // physics overrides
  const fric = dp.friction != null ? dp.friction : cfg.friction;

  // flash
  _spawnKillFlash(x, y);

  // spawn particles
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size = cfg.minSize + Math.random() * (cfg.maxSize - cfg.minSize);
    const color = colors[Math.floor(Math.random() * colors.length)];

    // explode outward — random direction
    const angle = Math.random() * Math.PI * 2;
    const speed = cfg.minSpeed + Math.random() * (cfg.maxSpeed - cfg.minSpeed);
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;

    // lifetime variance
    const lifetime = cfg.minLifetime + Math.random() * (cfg.maxLifetime - cfg.minLifetime);

    // offset from origin
    let px = 0;
    let py = 0;

    p.style.cssText = `
      width:${size}px;height:${size}px;
      background:${color};
      left:${x}px;top:${y}px;
      opacity:1;border-radius:0;
      pointer-events:none;
    `;
    arena.appendChild(p);

    const start = performance.now();

    function animParticle(now) {
      const elapsed = now - start;
      const t = elapsed / lifetime;
      if (t >= 1) { p.remove(); return; }

      // friction slows them down — they stop naturally
      vx *= fric;
      vy *= fric;

      px += vx;
      py += vy;

      // fade out in last 40%
      const opacity = t > 0.6 ? 1 - ((t - 0.6) / 0.4) : 1;

      // scale down in last 25%
      const scale = t > 0.75 ? 1 - ((t - 0.75) / 0.25) * 0.5 : 1;

      p.style.left = (x + px) + 'px';
      p.style.top = (y + py) + 'px';
      p.style.opacity = opacity;
      p.style.transform = `translate(-50%,-50%) scale(${scale})`;

      requestAnimationFrame(animParticle);
    }

    requestAnimationFrame(animParticle);
  }
}
/* ── SCREEN SHAKE ─────────────────────── */
let shakeTimeout = null;
function triggerShake() {
  if (!CONFIG.juice.shakeOnDamage) return;
  arena.classList.remove('shake');
  void arena.offsetWidth;
  arena.classList.add('shake');
  clearTimeout(shakeTimeout);
  shakeTimeout = setTimeout(() => arena.classList.remove('shake'), 300);
}

/* ── SAND PARTICLES (desert map) ──────── */
function spawnSandParticle(x, y) {
  const p = document.createElement('div');
  p.className = 'particle';

  const size  = 5 + Math.random() * 5;
  const angle = Math.random() * Math.PI * 2;
  const speed = 0.6 + Math.random() * 1.2;
  const vx    = Math.cos(angle) * speed;
  const vy    = Math.sin(angle) * speed;

  const colors = ['#b5893a', '#a07830', '#c49a45'];
  const color  = colors[Math.floor(Math.random() * colors.length)];

  p.style.cssText = `width:${size}px;height:${size}px;background:${color};left:${x}px;top:${y}px;opacity:0.9;`;
  arena.appendChild(p);

  const start = performance.now();
  function anim(now) {
    const t = (now - start) / 550;
    if (t >= 1) { p.remove(); return; }
    p.style.left    = (x + vx * speed * t * 10) + 'px';
    p.style.top     = (y + vy * speed * t * 10) + 'px';
    p.style.opacity = (1 - t) * 0.9 + '';
    requestAnimationFrame(anim);
  }
  requestAnimationFrame(anim);
}