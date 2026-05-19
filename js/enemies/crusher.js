/* ═══════════════════════════════════════
   CRUSHER.JS
   Slow enemy — shoots bullets.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:              'crusher',
  emoji:           '👾',
 sprite:        'assets/enemies/crusher/idle.png',
  spriteFrames:  12,
  spriteFrameW:  92,
  spriteFrameH:  92,
  spriteSpeed:   1.0,
  size:          92,
  hpPct:           0.65,
  damagePct:       0.34,
  speedMult:       0.60,
  points:          1659,
  shoots:          true,
  shootInterval:   2000,
  hitSound:  'flesh',
  bulletDamagePct: 0.20,
  bulletSpeed:     4.5,
  deathColors: ['#7766aa', '#554488', '#9988cc'],
  calcStress(distToCenter) {
    return 25;
  },
  onTick(e, cx, cy) {
    if (e.hasBullet) return;
    const curDist = e.distToCenter(cx, cy);
    if (!e.firstShotFired && curDist <= e.firstShotDist) {
      e.firstShotFired = true;
      e.hasBullet = true;
      spawnBullet(e);
    }
  },
});