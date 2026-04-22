/* ═══════════════════════════════════════
   CRAB.JS
   Underground enemy — like scorpion but
   when it emerges, the parent disappears
   and 2 small crabs spawn side by side.
   Each small crab is 1 hit.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'crab',
  sprite:    'assets/enemies/crab/idle.png',
  size:      34,
  hpPct:     0.01,
  damagePct: 0.18,
  speedMult: 1.4,
  points:    5,
  shoots:    false,
  noHpBar:   true,
  underground:     true,
  undergroundSpeed: 0.5,
  customOpacity:   true,

  onTick(e, cx, cy, attackRange) {
    const dx   = e.x - cx;
    const dy   = e.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (e.underground && dist <= attackRange) {
      // emerge — kill parent, spawn 2 small crabs
     e.underground = false;
      if (e.el) e.el.remove();

      // remove parent from enemies array immediately
      const idx = enemies.indexOf(e);
      if (idx !== -1) enemies.splice(idx, 1);
      const childDef = EnemyRegistry.get('crab_small');
      if (!childDef) return;

      const { w, h } = getArenaSize();
      const perpX = (e.dir === 'up' || e.dir === 'down') ? 1 : 0;
      const perpY = (e.dir === 'left' || e.dir === 'right') ? 1 : 0;
      const offset = 20;

      for (let i = 0; i < 2; i++) {
        const sign = i === 0 ? -1 : 1;
        const cx2 = e.x + perpX * offset * sign;
        const cy2 = e.y + perpY * offset * sign;

        const child = new Enemy(childDef, cx2, cy2, e.dir, 1, w, h);
        child.speed = child.baseSpeed;

        if (player.specialActive) player.ability.onActivate([child]);

        const el = document.createElement('div');
        el.className        = 'enemy';
        el.style.width      = child.size + 'px';
        el.style.height     = child.size + 'px';
        el.style.left       = cx2 + 'px';
        el.style.top        = cy2 + 'px';
        el.style.backgroundImage = `url(${childDef.sprite})`;
        el.style.backgroundSize  = 'cover';
        el.style.imageRendering  = 'pixelated';

        const rotMap = { down: 0, left: 90, up: 180, right: 270 };
        el.style.transform = `translate(-50%,-50%) rotate(${rotMap[e.dir]}deg)`;

        if (!childDef.noHpBar) {
          const hpWrap = document.createElement('div');
          hpWrap.className = 'enemy-hp-wrap';
          const hpFill = document.createElement('div');
          hpFill.className   = 'enemy-hp-fill';
          hpFill.style.width = '100%';
          hpWrap.appendChild(hpFill);
          el.appendChild(hpWrap);
          child.hpFill = hpFill;
        }

        arena.appendChild(el);
        child.el = el;
        enemies.push(child);
      }

      return;
    }

    // sand particles while underground
    if (e.underground && e.el) {
      e._particleTimer = (e._particleTimer || 0) + 16;
      if (e._particleTimer >= 80) {
        e._particleTimer = 0;
        spawnSandParticle(e.x, e.y);
      }
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 15;
    if (distToCenter <= 160) return 8;
    return 3;
  },
});

EnemyRegistry.register({
  id:        'crab_small',
  sprite:    'assets/enemies/crab/idle.png',
  size:      24,
  hpPct:     0.30,
  damagePct: 0.15,
  speedMult: 0.90,
  points:    10,
  shoots:    false,
  noHpBar:   true,

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 10;
    return 4;
  },
});