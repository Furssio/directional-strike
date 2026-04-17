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
  sprite:      'assets/enemies/slime.png',
  size:        48,
  hpPct:       0.80,
  damagePct:   0.30,
  contactHits: 1,
  speedMult: 0.48,
  points:      8,
  shoots:      false,
  wobble:      { frequency: 1.8, amplitude: 18 },
  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 28;
    if (distToCenter <= 160) return 20;
    return 14;
  },
  onDeath(parent) {
    const childDef = EnemyRegistry.get('slime_medium');
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
});

EnemyRegistry.register({
  id:          'slime_medium',
  emoji:       '🟢',
  sprite:      'assets/enemies/slime.png',
  size:        32,
  hpPct:       0.45,
  damagePct:   0.18,
  contactHits: 1,
  speedMult:   0.42,
  points:      3,
  shoots:      false,
  wobble:      { frequency: 2.8, amplitude: 10 },
  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 12;
    if (distToCenter <= 160) return 6;
    return 2;
  },
});