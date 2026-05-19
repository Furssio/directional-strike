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
      }
      return;
    }
  },

  onHit(e) {
    if (e._wolfState !== 'approach') return;

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