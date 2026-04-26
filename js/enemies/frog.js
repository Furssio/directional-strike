/* ═══════════════════════════════════════
   FROG.JS
   Jumping enemy — makes 3 jumps toward
   center. Each jump launches a parryable
   projectile. 1 hit to kill.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'frog',
  sprite:    'assets/enemies/frog/idle.png',
  size:      51,
  hpPct:     0.30,
  damagePct: 0.22,
  speedMult: 0.0,
  points:    20,
  shoots:    false,
  noHpBar:   true,
  customMovement: true,

  onTick(e, cx, cy) {
    if (e._jumpCount === undefined) {
      e._jumpCount = 0;
      e._jumpTimer = 1000;
      e._maxJumps  = 3;
      e._jumping   = false;

      // calc total distance and jump distance
      const dx = cx - e.x;
      const dy = cy - e.y;
      e._totalDist = Math.sqrt(dx * dx + dy * dy);
      e._jumpDist  = e._totalDist / (e._maxJumps + 2);
    }

    if (e._jumpCount >= e._maxJumps) {
      // after all jumps, walk slowly to center
      const dx = cx - e.x;
      const dy = cy - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 3) {
        const spd = CONFIG.base.enemyBaseSpeed * 0.8 * player.speedMultiplier;
        e.x += (dx / dist) * spd;
        e.y += (dy / dist) * spd;
        if (e.el) {
          e.el.style.left = e.x + 'px';
          e.el.style.top  = e.y + 'px';
        }
      }
      return;
    }

    e._jumpTimer -= 16 * player.speedMultiplier;

    if (e._jumpTimer <= 0 && !e._jumping) {
      e._jumping = true;

      // jump toward center
      const dx = cx - e.x;
      const dy = cy - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) {
        e.x += (dx / dist) * e._jumpDist;
        e.y += (dy / dist) * e._jumpDist;
      }

      if (e.el) {
        e.el.style.left = e.x + 'px';
        e.el.style.top  = e.y + 'px';
      }

      // launch parryable projectile
      _spawnFrogSpit(e);

      e._jumpCount++;
      e._jumping = false;
      e._jumpTimer = 1400;
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 18;
    if (distToCenter <= 160) return 10;
    return 4;
  },
});

/* ── FROG SPIT (parryable projectile) ── */
function _spawnFrogSpit(enemy) {
  const { w, h } = getArenaSize();
  const cx = w / 2;
  const cy = h / 2;

  const dx   = cx - enemy.x;
  const dy   = cy - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;

  const spitDef = {
    id:        '_frog_spit',
    sprite:    'assets/enemies/bullet_rock/idle.png',
    size:      12,
    hpPct:     0.01,
    damagePct: 0.15,
    speedMult: 2.0,
    points:    5,
    shoots:    false,
    noHpBar:   true,
    parryable: true,
    calcStress() { return 0; },
  };

  const spit = new Enemy(spitDef, enemy.x, enemy.y, enemy.dir, 1, w, h);
  spit.speed = CONFIG.base.enemyBaseSpeed * 2.0;

  const el = document.createElement('div');
  el.className        = 'enemy';
  el.style.width      = spit.size + 'px';
  el.style.height     = spit.size + 'px';
  el.style.left       = enemy.x + 'px';
  el.style.top        = enemy.y + 'px';
  el.style.backgroundImage = `url(${spitDef.sprite})`;
  el.style.backgroundSize  = 'cover';
  el.style.imageRendering  = 'pixelated';
  el.style.transform  = 'translate(-50%,-50%)';

  arena.appendChild(el);
  spit.el     = el;
  spit.hpFill = null;
  enemies.push(spit);

  SFX.bullet();
}