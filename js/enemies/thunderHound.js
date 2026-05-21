/* ═══════════════════════════════════════
   THUNDERHOUND.JS
   Fast enemy — dodges first hit by
   teleporting to its right side, outside
   range. Second hit kills it.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'thunder_hound',
  sprite:    'assets/enemies/thunder_hound/idle.png',
  spriteFrames:  12,
  spriteFrameW:  120,
  spriteFrameH:  120,
  spriteSpeed:   1.2,
  size:          120,
  hpPct:     2.50,
  damagePct: 0.28,
  speedMult: 1.6,
  points:    2222,
  hitSound:  'ethereal',
  shoots:    false,
  deathColors: ['#4488ff', '#2255cc', '#aaddff'],

  /* --- Lightning burst at position --- */
  _spawnBolts(x, y) {
    const arena = document.getElementById('G');
    if (!arena) return;
    const count = 6;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'thound-bolt';
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.6;
      const dist  = 25 + Math.random() * 35;
      p.style.left = x + 'px';
      p.style.top  = y + 'px';
      p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--ty', Math.sin(angle) * dist + 'px');
      arena.appendChild(p);
      setTimeout(() => p.remove(), 350);
    }
  },

  /* --- Zap cross at position --- */
  _spawnZap(x, y) {
    const arena = document.getElementById('G');
    if (!arena) return;
    const z = document.createElement('div');
    z.className = 'thound-zap';
    z.style.left = x + 'px';
    z.style.top  = y + 'px';
    arena.appendChild(z);
    setTimeout(() => z.remove(), 250);
  },

  onHit(e) {
    if (e._dodged) {
      if (e.hpFill) e.hpFill.style.width = '0%';
      // second hit — force kill
      e.hp = 0;
      return;
    }

    e._dodged = true;

    // undo damage — dodge
    e.hp = e.maxHp;
    if (e.hpFill) e.hpFill.style.width = '100%';

    // save old position for FX
    const oldX = e.x;
    const oldY = e.y;

    const rightOf = { up: 'left', left: 'down', down: 'right', right: 'up' };
    const newDir = rightOf[e.dir];

    const { w, h } = getArenaSize();
    const cx = w / 2;
    const cy = h / 2;
    const arenaSize   = Math.min(w, h);
    const attackRange = player.getAttackRange(arenaSize);
    const placeDist   = attackRange * 1.6;

    if (newDir === 'up')    { e.x = cx; e.y = cy - placeDist; }
    if (newDir === 'down')  { e.x = cx; e.y = cy + placeDist; }
    if (newDir === 'left')  { e.x = cx - placeDist; e.y = cy; }
    if (newDir === 'right') { e.x = cx + placeDist; e.y = cy; }

    e.dir = newDir;
    e.speed = e.baseSpeed * 1.2;

    const rotMap = { down: 0, left: 90, up: 180, right: 270 };
    if (e.el) {
      e.el.style.left = e.x + 'px';
      e.el.style.top  = e.y + 'px';
      e.el.style.transform = `translate(-50%,-50%) rotate(${rotMap[newDir]}deg)`;

      // flash on hound
      e.el.classList.add('thound-flash');
      setTimeout(() => {
        if (e.el) e.el.classList.remove('thound-flash');
      }, 350);
    }

    // lightning FX at old and new positions
    this._spawnBolts(oldX, oldY);
    this._spawnZap(oldX, oldY);
    this._spawnBolts(e.x, e.y);
    this._spawnZap(e.x, e.y);
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 20;
    if (distToCenter <= 160) return 10;
    return 4;
  },
});