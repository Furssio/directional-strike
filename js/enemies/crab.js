/* ═══════════════════════════════════════
   CRAB.JS
   Underground enemy — travels hidden,
   when it reaches attack range it dies
   and spawns 2 small crabs side by side.
   Uses onDeath (same pattern as slime).
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'crab',
  sprite:    'assets/enemies/crab/idle.png',
  size:      41,
  hpPct:     0.01,
  damagePct: 0.18,
  speedMult: 1.4,
  points:    0,
  hitSound:  'shell',
  shoots:    false,
  noHpBar:   true,
  underground:     true,
  undergroundSpeed: 0.5,
  customOpacity:   true,

  onTick(e, cx, cy, attackRange) {
    const dx   = e.x - cx;
    const dy   = e.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // sand particles while underground
    if (e.underground && e.el) {
      e._particleTimer = (e._particleTimer || 0) + 16 * player.speedMultiplier;
      if (e._particleTimer >= 80) {
        e._particleTimer = 0;
        spawnSandParticle(e.x, e.y);
      }
    }

    // emerge when in range — force kill to trigger onDeath
    if (e.underground && dist <= attackRange) {
      e.underground = false;
      e.hp = 0;
      if (e.el) e.el.remove();
      // onDeath will be called by the _noKill cleanup in loop.js
      e._emerged = true;
    }
  },

  onDeath(parent) {
    const childDef = EnemyRegistry.get('crab_small');
    if (!childDef) return;

    const { w, h } = getArenaSize();
    const perpX = (parent.dir === 'up' || parent.dir === 'down') ? 1 : 0;
    const perpY = (parent.dir === 'left' || parent.dir === 'right') ? 1 : 0;
    const offset = 20;

    for (let i = 0; i < 2; i++) {
      const sign = i === 0 ? -1 : 1;
      const sx = parent.x + perpX * offset * sign;
      const sy = parent.y + perpY * offset * sign;

      const child = new Enemy(childDef, sx, sy, parent.dir, 1, w, h);
      child.speed = child.baseSpeed;

      if (player.specialActive && player.ability.onEnemySpawn) player.ability.onEnemySpawn(child);

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
      el.style.transform = `translate(-50%,-50%) rotate(${rotMap[parent.dir]}deg)`;

      arena.appendChild(el);
      child.el     = el;
      child.hpFill = null;
      enemies.push(child);
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
  size:      29,
  hpPct:     0.30,
  damagePct: 0.15,
  speedMult: 0.90,
  points:    347,
  hitSound:  'shell',
  shoots:    false,
  noHpBar:   true,

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 10;
    return 4;
  },
});