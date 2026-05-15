/* ═══════════════════════════════════════
   ONI.JS
   Heavy demon — 4 hits. Each hit bounces
   it back to the start of its line and
   it comes back faster each time.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'oni',
  sprite:    'assets/enemies/oni/idle.png',
  spriteFrames:  12,
  spriteFrameW:  110,
  spriteFrameH:  110,
  spriteSpeed:   1.0,
  size:          110,
  hpPct:     2.10,
  damagePct: 0.40,
  speedMult: 0.60,
  points:    4890,
  hitSound:  'demon',
  shoots:    false,

  onHit(e) {
    // bounce back to edge of arena
    const { w, h } = getArenaSize();
    const cx = w / 2;
    const cy = h / 2;
    const m  = CONFIG.spawn.edgeMargin;

    if (e.dir === 'up')    { e.x = cx; e.y = -m; }
    if (e.dir === 'down')  { e.x = cx; e.y = h + m; }
    if (e.dir === 'left')  { e.x = -m; e.y = cy; }
    if (e.dir === 'right') { e.x = w + m; e.y = cy; }

    if (e.el) {
      e.el.style.left = e.x + 'px';
      e.el.style.top  = e.y + 'px';
    }

    // get faster each hit
    e._hitCount = (e._hitCount || 0) + 1;
    e.speed = e.baseSpeed * (1 + e._hitCount * 0.5);
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 35;
    if (distToCenter <= 160) return 20;
    return 10;
  },
});