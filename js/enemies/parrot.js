/* ═══════════════════════════════════════
   PARROT.JS
   Ranged enemy — like crusher but 1 hit,
   fires 2 rocks in sequence.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:              'parrot',
  sprite:          'assets/enemies/parrot/idle.png',
  spriteFrames:  8,
  spriteFrameW:  72,
  spriteFrameH:  72,
  spriteSpeed:   1.0,
  size:          72,
  hpPct:           0.30,
  damagePct:       0.20,
  speedMult:       0.50,
  points:          2217,
  hitSound:  'flesh',
  shoots:          false,
  bulletDamagePct: 0.15,
  bulletSpeed:     4.0,
  noHpBar:         true,
  deathColors: ['#33cc44', '#ff4444', '#3388ff'],
  bulletType: 'bullet-coconut',

  onTick(e, cx, cy) {
    if (e._shotsFired === undefined) {
      e._shotsFired = 0;
      e._shotDelay  = 0;
    }

    const curDist = e.distToCenter(cx, cy);

    // first shot at threshold distance
    if (!e.firstShotFired && curDist <= e.firstShotDist) {
      e.firstShotFired = true;
      e._shotsFired = 1;
      spawnBullet(e);
      e._shotDelay = 600; // ms before second shot
    }

    // second shot after delay
    if (e._shotsFired === 1 && e._shotDelay > 0) {
      e._shotDelay -= 16 * player.speedMultiplier;
      if (e._shotDelay <= 0) {
        e._shotsFired = 2;
        spawnBullet(e);
      }
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 120) return 20;
    return 8;
  },
});