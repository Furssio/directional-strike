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
  spriteSpeed:   1.0,
  size:          120,
  hpPct:     9.00,
  damagePct: 0.28,
  speedMult: 1.6,
  points:    2222,
  hitSound:  'ethereal',
  shoots:    false,
  

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
    e.speed = e.baseSpeed * 2.2;

    const rotMap = { down: 0, left: 90, up: 180, right: 270 };
    if (e.el) {
      e.el.style.left = e.x + 'px';
      e.el.style.top  = e.y + 'px';
      e.el.style.transform = `translate(-50%,-50%) rotate(${rotMap[newDir]}deg)`;
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 20;
    if (distToCenter <= 160) return 10;
    return 4;
  },
});