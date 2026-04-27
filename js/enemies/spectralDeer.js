/* ═══════════════════════════════════════
   SPECTRALDEER.JS
   Ghostly enemy — fades in and out while
   approaching. Switches direction twice
   when opacity hits 0. Always hittable.
   1 hit to kill.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'spectral_deer',
  sprite:    'assets/enemies/spectral_deer/idle.png',
  size:      75,
  hpPct:     0.30,
  damagePct: 0.25,
  speedMult: 0.85,
  points:    2015,
  shoots:    false,
  noHpBar:   true,
  customOpacity: true,

  onTick(e, cx, cy, attackRange) {
    // init fade state
   if (e._fadePhase === undefined) {
      e._fadePhase   = 1.0;
      e._fadeDir     = 0;     // don't fade yet
      e._switchCount = 0;
      e._switched    = false;
      e._initCooldown = 800;  // ms before first flicker
    }

    if (e._initCooldown > 0) {
      e._initCooldown -= 16 * player.speedMultiplier;
      if (e.el) e.el.style.opacity = '1';
      return;
    }

    if (e._fadeDir === 0) e._fadeDir = -1;

    const fadeSpeed = 0.0018;
    const speedRatio = e.speed / (CONFIG.base.enemyBaseSpeed * 1.00); // 1.00 = base speedMult
    e._fadePhase += e._fadeDir * fadeSpeed * 16 * player.speedMultiplier * Math.max(1, speedRatio);

    // clamp
    if (e._fadePhase <= 0) {
      e._fadePhase = 0;

      // switch line when hitting 0 (max 2 times)
      if (!e._switched && e._switchCount < 1) {
        e._switched = true;
        e._switchCount++;

        const dx   = e.x - cx;
        const dy   = e.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const dirs = ['up', 'down', 'left', 'right'].filter(d => d !== e.dir);
        const newDir = dirs[Math.floor(Math.random() * dirs.length)];

        if (newDir === 'up' || newDir === 'down') {
          e.x = cx;
          e.y = newDir === 'up' ? cy - dist : cy + dist;
        } else {
          e.y = cy;
          e.x = newDir === 'left' ? cx - dist : cx + dist;
        }

        e.dir = newDir;
        const rotMap = { down: 0, left: 90, up: 180, right: 270 };
        if (e.el) e.el.style.transform = `translate(-50%,-50%) rotate(${rotMap[newDir]}deg)`;
      }

      // start fading back in
      e._fadeDir = 1;
    }

    if (e._fadePhase >= 1) {
      e._fadePhase = 1;
      // after fully visible, start fading out again (if switches left)
      if (e._switchCount < 1) {
        e._fadeDir   = -1;
        e._switched  = false;
      }
    }

    if (e.el) e.el.style.opacity = e._fadePhase + '';
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 6;
    if (distToCenter <= 160) return 3;
    return 1;
  },
});