/* ═══════════════════════════════════════
   KITSUNE.JS
   Sneaky fox — approaches slowly, then
   lunges fast when in attack range.
   1 hit to kill.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'kitsune',
  sprite:    'assets/enemies/kitsune/idle.png',
  spriteFrames:  12,
  spriteFrameW:  76,
  spriteFrameH:  76,
  spriteSpeed:   1.0,
  size:          76,
  hpPct:     0.30,
  damagePct: 0.30,
  speedMult: 0.80,
  points:    1755,
  hitSound:  'flesh',
  shoots:    false,
  noHpBar:   true,
  deathColors: ['#ffaa33', '#ff7711', '#ffffff'],

  /* --- Dash trail behind kitsune --- */
  _spawnTrail(e, cx, cy) {
    const arena = document.getElementById('G');
    if (!arena) return;
    const dx = cx - e.x;
    const dy = cy - e.y;
    const d  = Math.sqrt(dx * dx + dy * dy) || 1;
    const dirX = dx / d;
    const dirY = dy / d;
    const count = 5;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'kitsune-trail';
      const offset = (Math.random() - 0.5) * 20;
      const trailDist = 15 + Math.random() * 25;
      p.style.left = (e.x + offset * -dirY) + 'px';
      p.style.top  = (e.y + offset * dirX) + 'px';
      p.style.setProperty('--kx', (-dirX * trailDist) + 'px');
      p.style.setProperty('--ky', (-dirY * trailDist) + 'px');
      const angle = Math.atan2(dirY, dirX) * (180 / Math.PI);
      p.style.transform = `rotate(${angle}deg)`;
      arena.appendChild(p);
      setTimeout(() => p.remove(), 350);
    }
  },

  onTick(e, cx, cy, attackRange) {
    if (e._lunging) return;

    const dx   = e.x - cx;
    const dy   = e.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= attackRange) {
      e._lunging = true;
      e.speed = e.baseSpeed * 2.5;

      // lunge FX
      if (e.el) e.el.classList.add('kitsune-lunge');
      this._spawnTrail(e, cx, cy);
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 18;
    if (distToCenter <= 160) return 10;
    return 4;
  },
});