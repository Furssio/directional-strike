/* ═══════════════════════════════════════
   SLIMES.JS
   Slime enemy — 2 phases (large/medium).
   Large: 2 hit → dies → spawns 2 Medium
   Medium: 1 hit → dies → gone
   Total hits to clear a Large: 4.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:          'slime_large',
  emoji:       '🟢',
  sprite:        'assets/enemies/slime/idle.png',
  spriteFrames:  12,
  spriteFrameW:  96,
  spriteFrameH:  96,
  spriteSpeed:   0.7,
  size:          96,
  hpPct:       0.80,
  damagePct:   0.30,
  contactHits: 1,
  speedMult:   0.75,
  points:      855,
  hitSound:  'slime',
  shoots:      false,
  deathColors: ['#44cc55', '#22aa33', '#88ff77'],
  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 28;
    if (distToCenter <= 160) return 20;
    return 14;
  },
  onDeath(parent) {
    const childDef = EnemyRegistry.get('slime_medium');
    if (!childDef) return;

    const { w, h } = getArenaSize();
    const perpX = (parent.dir === 'up' || parent.dir === 'down') ? 1 : 0;
    const perpY = (parent.dir === 'left' || parent.dir === 'right') ? 1 : 0;
    const offset = 18;

    for (let i = 0; i < 2; i++) {
      if (!running) return;

      const sign = i === 0 ? -1 : 1;
      const sx   = parent.x + perpX * offset * sign;
      const sy   = parent.y + perpY * offset * sign;

      const child = new Enemy(childDef, sx, sy, parent.dir, 1, w, h);

     if (player.specialActive && player.ability.onEnemySpawn) player.ability.onEnemySpawn(child);

      const el = document.createElement('div');
      el.className        = 'enemy';
      el.style.width      = child.size + 'px';
      el.style.height     = child.size + 'px';
      el.style.left       = sx + 'px';
      el.style.top        = sy + 'px';
     el.style.backgroundImage = `url(${childDef.sprite})`;
      el.style.imageRendering  = 'pixelated';

      if (childDef.spriteFrames && childDef.spriteFrames > 1) {
        const fw = childDef.spriteFrameW || child.size;
        const fh = childDef.spriteFrameH || child.size;
        const frames = childDef.spriteFrames;
        const scale = child.size / fh;
        const scaledW = Math.round(fw * frames * scale);
        el.style.backgroundSize = `${scaledW}px ${child.size}px`;
        el.style.backgroundRepeat = 'no-repeat';
        const dur = childDef.spriteSpeed || 0.8;
        const animName = `eIdle_${childDef.id}_${child.size}`;
        if (!document.getElementById('anim-' + animName)) {
          const s = document.createElement('style');
          s.id = 'anim-' + animName;
          s.textContent = `@keyframes ${animName}{from{background-position-x:0}to{background-position-x:-${scaledW}px}}`;
          document.head.appendChild(s);
        }
        el.style.animation = `${animName} ${dur}s steps(${frames}) infinite`;
      } else {
        el.style.backgroundSize = 'cover';
      }

      el.style.transform = 'translate(-50%,-50%)';

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
    }
  },
});

EnemyRegistry.register({
  id:          'slime_medium',
  emoji:       '🟢',
  sprite:        'assets/enemies/slime/idle.png',
  spriteFrames:  12,
  spriteFrameW:  96,
  spriteFrameH:  96,
  spriteSpeed:   0.7,
  size:          48,
  hpPct:       0.45,
  damagePct:   0.18,
  contactHits: 1,
  speedMult:   0.42,
  points:      300,
  hitSound:  'slime',
  shoots:      false,
  deathColors: ['#44cc55', '#22aa33', '#88ff77'],
  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 12;
    if (distToCenter <= 160) return 6;
    return 2;
  },
});