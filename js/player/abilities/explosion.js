/* ═══════════════════════════════════════
   EXPLOSION.JS
   Explosion — instantly kills all enemies
   within attack range. Violent burst with
   ground scorch mark. Dark reds + black.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry, juice.js
   ═══════════════════════════════════════ */

AbilityRegistry.register({
  id:       'explosion',
  name:     'Explosion',
  desc:     'kills all enemies in range instantly',
  icon:     '💥',
  barColor: '#EF4444',
  duration: 1,

  piercing:      false,
  blocksBullets: false,

  onActivate() {
    if (!player) return;

    const { w, h }    = getArenaSize();
    const cx          = w / 2;
    const cy          = h / 2;
    const arenaSize   = Math.min(w, h);
    const attackRange = player.getAttackRange(arenaSize);

    // ── Kill all enemies in range ──
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (e.underground) continue;

      const dx   = e.x - cx;
      const dy   = e.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= attackRange) {
        spawnParticles(e.x, e.y, player.color, e.isElite);
        e.el.remove();
        enemies.splice(i, 1);
        registerKill(e);
      }
    }

    SFX.kill();

    const a = document.getElementById('arena');

    // ── Heavy shake ──
    a.classList.remove('explosion-shake');
    void a.offsetWidth;
    a.classList.add('explosion-shake');
    setTimeout(() => a.classList.remove('explosion-shake'), 550);

    // ── Dark red flash ──
    const flash = document.createElement('div');
    flash.className = 'explosion-flash';
    flash.style.width  = (attackRange * 0.8) + 'px';
    flash.style.height = (attackRange * 0.8) + 'px';
    a.appendChild(flash);
    setTimeout(() => { if (flash.parentNode) flash.remove(); }, 350);

    // ── Debris burst ──
    _explosionDebris(cx, cy, attackRange);

    // ── Scorch mark on ground ──
    const scorch = document.createElement('div');
    scorch.className = 'explosion-scorch';
    const scorchSize = attackRange * 1.6;
    scorch.style.width  = scorchSize + 'px';
    scorch.style.height = scorchSize + 'px';
    a.appendChild(scorch);

    // ── Embers inside scorch ──
    const embers = [];
  const emberCount = 14;
    for (let i = 0; i < emberCount; i++) {
      const em = document.createElement('div');
      em.className = 'explosion-ember';
      const angle  = Math.random() * Math.PI * 2;
      const dist   = Math.random() * attackRange * 0.55;
      const sz     = 2 + Math.random() * 3;
      const colors = ['#aa0000', '#cc1100', '#880000', '#661100'];
      em.style.width      = sz + 'px';
      em.style.height     = sz + 'px';
      em.style.background = colors[Math.floor(Math.random() * colors.length)];
      em.style.left       = (cx + Math.cos(angle) * dist) + 'px';
      em.style.top        = (cy + Math.sin(angle) * dist) + 'px';
      em.style.transform  = 'translate(-50%, -50%)';
      em.style.animationDelay = (Math.random() * 0.4) + 's';
      a.appendChild(em);
      embers.push(em);
    }

   // ── Embers start dying after 1.2s ──
    setTimeout(() => {
      embers.forEach(em => em.classList.add('dying'));
    }, 1200);

    // ── Scorch starts fading after 1s ──
    setTimeout(() => {
      scorch.classList.add('fading');
    }, 1000);

    // ── Full cleanup after 5.5s (1s wait + 4s fade) ──
    setTimeout(() => {
      if (scorch.parentNode) scorch.remove();
      embers.forEach(em => { if (em.parentNode) em.remove(); });
    }, 5500);
  },

  onDeactivate() {},
});

/* ── Chaotic debris burst from center ──
   Dark chunks and red sparks. */

function _explosionDebris(cx, cy, range) {
  const count  = 32;
  const colors = ['#aa0000', '#cc1100', '#660000', '#881100',
                  '#440000', '#bb2200', '#551100'];

  for (let i = 0; i < count; i++) {
    const p     = document.createElement('div');
    p.className = 'particle';

    const isBig = Math.random() < 0.3;
    const size  = isBig ? (6 + Math.random() * 6) : (2 + Math.random() * 4);
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 4.5;
    const color = colors[Math.floor(Math.random() * colors.length)];

    p.style.cssText =
      `width:${size}px;height:${size}px;background:${color};` +
      `left:${cx}px;top:${cy}px;opacity:1;image-rendering:pixelated;`;
    arena.appendChild(p);

    const start = performance.now();
    const life  = 250 + Math.random() * 300;
    const dist  = range * (0.4 + Math.random() * 0.6);
    const vx    = Math.cos(angle);
    const vy    = Math.sin(angle);
    const grav  = isBig ? 0.003 : 0;

    (function anim(now) {
      const t = (now - start) / life;
      if (t >= 1) { p.remove(); return; }

      const ex = cx + vx * speed * t * dist * 0.5;
      const ey = cy + vy * speed * t * dist * 0.5 + grav * t * t * dist * 80;
      p.style.left    = ex + 'px';
      p.style.top     = ey + 'px';
      p.style.opacity = (1 - t * t) + '';
      requestAnimationFrame(anim);
    })(performance.now());
  }
}