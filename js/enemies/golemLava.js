/* ═══════════════════════════════════════
   GOLEMLAVA.JS
   Lava golem — 2 hits, when killed splits
   into 2 small golems on the side lines.
   Each small golem is 1 hit.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'golem_lava',
  sprite:    'assets/enemies/golem_lava/idle.png',
  spriteFrames:  12,
  spriteFrameW:  112,
  spriteFrameH:  112,
  spriteSpeed:   1.0,
  size:          112,
  hpPct:     0.65,
  damagePct: 0.34,
  speedMult: 0.44,
  points:    1476,
  shoots:    false,

  onDeath(parent) {
    const childDef = EnemyRegistry.get('golem_lava_small');
    if (!childDef) return;

    const { w, h } = getArenaSize();
    const cx = w / 2;
    const cy = h / 2;
    const dx = parent.x - cx;
    const dy = parent.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    const sideDirs = {
      up:    ['left', 'right'],
      down:  ['left', 'right'],
      left:  ['up',   'down'],
      right: ['up',   'down'],
    };
    const splits = sideDirs[parent.dir] || ['left', 'right'];

    for (let i = 0; i < 2; i++) {
      setTimeout(() => {
        if (!running) return;

        const newDir = splits[i];
        let sx, sy;
        if (newDir === 'up')    { sx = cx; sy = cy - dist; }
        if (newDir === 'down')  { sx = cx; sy = cy + dist; }
        if (newDir === 'left')  { sx = cx - dist; sy = cy; }
        if (newDir === 'right') { sx = cx + dist; sy = cy; }

        const child = new Enemy(childDef, sx, sy, newDir, 1, w, h);

        if (player.specialActive) player.ability.onActivate([child]);

        const el = document.createElement('div');
        el.className        = 'enemy';
        el.style.width      = child.size + 'px';
        el.style.height     = child.size + 'px';
        el.style.left       = sx + 'px';
        el.style.top        = sy + 'px';
        el.style.backgroundImage = `url(${childDef.sprite})`;
        el.style.backgroundSize  = 'cover';
        el.style.imageRendering  = 'pixelated';

        const rotMap = { down: 0, left: 90, up: 180, right: 270 };
        el.style.transform = `translate(-50%,-50%) rotate(${rotMap[newDir]}deg)`;

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
    if (distToCenter <= 80)  return 30;
    if (distToCenter <= 160) return 18;
    return 10;
  },
});

EnemyRegistry.register({
  id:        'golem_lava_small',
  sprite:    'assets/enemies/golem_lava/idle.png',
  spriteFrames:  12,
  spriteFrameW:  112,
  spriteFrameH:  112,
  spriteSpeed:   1.0,
  size:          57,
  hpPct:     0.30,
  damagePct: 0.25,
  speedMult: 0.55,
  points:    800,
  shoots:    false,

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 15;
    return 5;
  },
});