/* ═══════════════════════════════════════
   SLIMELAVA.JS
   Lava slime — slow, spits lava (parryable).
   2 hits, then splits into 2 small lava
   slimes (1 hit each, no spit).
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'slime_lava',
  sprite:    'assets/enemies/slime_lava/idle.png',
  size:      66,
  hpPct:     0.80,
  damagePct: 0.30,
  speedMult: 0.48,
  points:    799,
  shoots:    false,
  wobble:    { frequency: 1.8, amplitude: 18 },

  onTick(e, cx, cy) {
    if (e._hasSpit) return;

    const curDist = e.distToCenter(cx, cy);
    if (!e._firstSpitFired && curDist <= e.spawnDist * CONFIG.bullet.firstShotDistPct) {
      e._firstSpitFired = true;
      e._hasSpit = true;
      _spawnLavaSpit(e);
    }
  },

  onDeath(parent) {
    const childDef = EnemyRegistry.get('slime_lava_small');
    if (!childDef) return;

    const { w, h } = getArenaSize();

    for (let i = 0; i < 2; i++) {
      setTimeout(() => {
        if (!running) return;

        const angle  = (i / 2) * Math.PI * 2;
        const radius = 22 + Math.random() * 12;
        const ox     = Math.cos(angle) * radius;
        const oy     = Math.sin(angle) * radius;

        const child = new Enemy(childDef, parent.x + ox, parent.y + oy, parent.dir, 1, w, h);

        if (player.specialActive) player.ability.onActivate([child]);

        const el = document.createElement('div');
        el.className        = 'enemy';
        el.style.width      = child.size + 'px';
        el.style.height     = child.size + 'px';
        el.style.left       = (parent.x + ox) + 'px';
        el.style.top        = (parent.y + oy) + 'px';
        el.style.backgroundImage = `url(${childDef.sprite})`;
        el.style.backgroundSize  = 'cover';
        el.style.imageRendering  = 'pixelated';

        const rotMap = { down: 0, left: 90, up: 180, right: 270 };
        el.style.transform = `translate(-50%,-50%) rotate(${rotMap[parent.dir]}deg)`;

        const hpWrap = document.createElement('div');
        hpWrap.className = 'enemy-hp-wrap';
        const hpFill = document.createElement('div');
        hpFill.className   = 'enemy-hp-fill';
        hpFill.style.width = '100%';
        hpWrap.appendChild(hpFill);
        el.appendChild(hpWrap);

        arena.appendChild(el);
        child.el     = el;
        child.hpFill = hpFill;
        enemies.push(child);
      }, i * 80);
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 28;
    if (distToCenter <= 160) return 20;
    return 14;
  },
});

EnemyRegistry.register({
  id:        'slime_lava_small',
  sprite:    'assets/enemies/slime_lava/idle.png',
  size:      45,
  hpPct:     0.45,
  damagePct: 0.18,
  speedMult: 0.42,
  points:    3,
  shoots:    false,
  wobble:    { frequency: 2.8, amplitude: 10 },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 12;
    if (distToCenter <= 160) return 6;
    return 2;
  },
});

/* ── LAVA SPIT (parryable projectile) ── */
function _spawnLavaSpit(enemy) {
  const { w, h } = getArenaSize();
  const cx = w / 2;
  const cy = h / 2;

  const dx   = cx - enemy.x;
  const dy   = cy - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;

  const spitDef = {
    id:        '_lava_spit',
    sprite:    'assets/enemies/bullet_rock/idle.png',
    size:      14,
    hpPct:     0.01,
    damagePct: 0.20,
    speedMult: 2.5,
    points:    500,
    shoots:    false,
    noHpBar:   true,
    parryable: true,
    calcStress() { return 0; },
  };

  const spit = new Enemy(spitDef, enemy.x, enemy.y, enemy.dir, 1, w, h);
  spit.speed = CONFIG.base.enemyBaseSpeed * 2.5;

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
  spit.el    = el;
  spit.hpFill = null;
  enemies.push(spit);

  setTimeout(() => { if (enemy.isAlive()) enemy._hasSpit = false; }, 3000);

  SFX.bullet();
}