/* ═══════════════════════════════════════
   WOLF.JS
   Fast predator — rushes to range, when
   hit leaps back outside range, then
   lunges again even faster. 2 hits.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'wolf',
  sprite:    'assets/enemies/wolf/idle.png',
  spriteFrames:  12,
  spriteFrameW:  84,
  spriteFrameH:  84,
  spriteSpeed:   1.0,
  size:          84,
  hpPct:     0.65,
  damagePct: 0.30,
  speedMult: 1.10,
  points:    2234,
  hitSound:  'flesh',
  shoots:    false,
  deathColors: ['#777777', '#999999', '#555555'],

  /* --- Wind burst at position, spreading in a direction --- */
  _spawnWind(x, y, dirX, dirY) {
    const arena = document.getElementById('G');
    if (!arena) return;
    const count = 7;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'wolf-wind';
      // spread along leap direction with some randomness
      const spread = (Math.random() - 0.5) * 1.2;
      const baseAngle = Math.atan2(dirY, dirX);
      const angle = baseAngle + spread;
      const dist = 20 + Math.random() * 40;
      p.style.left = x + 'px';
      p.style.top  = y + 'px';
      p.style.setProperty('--wx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--wy', Math.sin(angle) * dist + 'px');
      arena.appendChild(p);
      setTimeout(() => p.remove(), 400);
    }
  },

  /* --- Dash lines trailing behind lunge --- */
  _spawnDash(x, y, dirX, dirY) {
    const arena = document.getElementById('G');
    if (!arena) return;
    const count = 5;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'wolf-dash';
      // lines trail behind (opposite of movement dir)
      const offset = (Math.random() - 0.5) * 30;
      const trailDist = 15 + Math.random() * 25;
      p.style.left = (x + offset * dirY) + 'px';
      p.style.top  = (y + offset * -dirX) + 'px';
      p.style.setProperty('--dx', (-dirX * trailDist) + 'px');
      p.style.setProperty('--dy', (-dirY * trailDist) + 'px');
      // rotate to match movement direction
      const angle = Math.atan2(dirY, dirX) * (180 / Math.PI);
      p.style.transform = `rotate(${angle}deg)`;
      arena.appendChild(p);
      setTimeout(() => p.remove(), 350);
    }
  },

  onTick(e, cx, cy, attackRange) {
    if (e._wolfState === undefined) {
      e._wolfState = 'approach';
    }

    if (e._wolfState === 'waiting') {
      e.speed = 0;
      e._waitTimer -= 16 * player.speedMultiplier;
      if (e._waitTimer <= 0) {
        e._wolfState = 'lunge';
        e.speed = e.baseSpeed * 2.5;

        // dash FX on lunge start
        const dx = cx - e.x;
        const dy = cy - e.y;
        const d  = Math.sqrt(dx * dx + dy * dy) || 1;
        this._spawnDash(e.x, e.y, dx / d, dy / d);
      }
      return;
    }
  },

  onHit(e) {
    if (e._wolfState !== 'approach') return;

    // save old position for FX
    const oldX = e.x;
    const oldY = e.y;

    // instant leap back outside range
    const { w, h } = getArenaSize();
    const cx = w / 2;
    const cy = h / 2;
    const dx = e.x - cx;
    const dy = e.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      const arenaSize   = Math.min(w, h);
      const attackRange = player.getAttackRange(arenaSize);
      const jumpDist    = attackRange * 1.6;

      e.x = cx + (dx / dist) * jumpDist;
      e.y = cy + (dy / dist) * jumpDist;

      if (e.el) {
        e.el.style.left = e.x + 'px';
        e.el.style.top  = e.y + 'px';
      }

      // wind FX at old position, blowing in leap direction
      const leapDx = e.x - oldX;
      const leapDy = e.y - oldY;
      const leapD  = Math.sqrt(leapDx * leapDx + leapDy * leapDy) || 1;
      this._spawnWind(oldX, oldY, leapDx / leapD, leapDy / leapD);
    }

    e._wolfState = 'waiting';
    e._waitTimer = 500;
    e.speed = 0;
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 12;
    if (distToCenter <= 160) return 6;
    return 2;
  },
});