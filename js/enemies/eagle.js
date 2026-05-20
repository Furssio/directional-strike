/* ═══════════════════════════════════════
   EAGLE.JS
   Fast flyer — rushes toward center.
   When hit, vanishes and reappears from
   the opposite side as a shooter (like
   crusher). 2 hits total.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'eagle',
  sprite:    'assets/enemies/eagle/idle.png',
  size:      72,
  hpPct:     0.65,
  damagePct: 0.25,
  speedMult: 1.8,
  points:    2810,
  hitSound:  'flesh',
  shoots:    false,
  bulletDamagePct: 0.15,
  bulletSpeed:     4.0,
  rotateToDirection: true,
  deathColors: ['#dddddd', '#aaaaaa', '#776633'],
   bulletType: 'bullet-dark',

  onHit(e) {
    if (e._phase2) return;
    e._phase2 = true;

    // vanish and reappear from opposite side
    const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
    const newDir = opposites[e.dir];

    const { w, h } = getArenaSize();
    const cx = w / 2;
    const cy = h / 2;
    const m  = CONFIG.spawn.edgeMargin;

    if (newDir === 'up')    { e.x = cx; e.y = -m; }
    if (newDir === 'down')  { e.x = cx; e.y = h + m; }
    if (newDir === 'left')  { e.x = -m; e.y = cy; }
    if (newDir === 'right') { e.x = w + m; e.y = cy; }

    e.dir = newDir;
    e.speed = e.baseSpeed * 0.50;
    e.firstShotFired = false;
    e.hasBullet = false;

    // recalc first shot distance from new position
    const dx = cx - e.x;
    const dy = cy - e.y;
    e.spawnDist     = Math.sqrt(dx * dx + dy * dy);
    e.firstShotDist = e.spawnDist * CONFIG.bullet.firstShotDistPct;

    // phase 2: change sprite + remove rotation
    if (e.el) {
      e.el.style.left = e.x + 'px';
      e.el.style.top  = e.y + 'px';
      e.el.style.backgroundImage = 'url(assets/enemies/eagle/idle2.png)';
      e.el.style.transform = 'translate(-50%,-50%)';
    }
  },

  onTick(e, cx, cy) {
    if (!e._phase2) return;

    // phase 2: shoot like crusher
    if (e.hasBullet) return;
    const curDist = e.distToCenter(cx, cy);
    if (!e.firstShotFired && curDist <= e.firstShotDist) {
      e.firstShotFired = true;
      e.hasBullet = true;
      spawnBullet(e);
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 22;
    if (distToCenter <= 160) return 12;
    return 5;
  },
});