/* ═══════════════════════════════════════
   NARADEER.JS
   Nara deer — same behavior as spectral
   deer but different skin. Fades and
   switches direction once. 1 hit.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'nara_deer',
  sprite:    'assets/enemies/nara_deer/idle.png',
  spriteFrames:  12,
  spriteFrameW:  92,
  spriteFrameH:  92,
  spriteSpeed:   1.0,
  size:          92,
  hpPct:     0.30,
  damagePct: 0.25,
  speedMult: 0.75,
  points:    1354,
  shoots:    false,
  noHpBar:   true,
  customOpacity: true,

  onTick(e, cx, cy, attackRange) {
    if (e._fadePhase === undefined) {
      e._fadePhase   = 1.0;
      e._fadeDir     = 0;
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
    const speedRatio = e.speed / (CONFIG.base.enemyBaseSpeed * 0.85); // 0.85 = nara base speedMult
    e._fadePhase += e._fadeDir * fadeSpeed * 16 * player.speedMultiplier * Math.max(1, speedRatio);

    if (e._fadePhase <= 0) {
      e._fadePhase = 0;

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

      e._fadeDir = 1;
    }

    if (e._fadePhase >= 1) {
      e._fadePhase = 1;
      if (e._switchCount < 1) {
        e._fadeDir  = -1;
        e._switched = false;
      }
    }

    if (e.el) e.el.style.opacity = e._fadePhase + '';
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 15;
    if (distToCenter <= 160) return 8;
    return 3;
  },
});