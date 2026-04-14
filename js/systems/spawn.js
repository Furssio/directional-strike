/* ═══════════════════════════════════════
   SPAWN.JS
   Physical creation of enemies and bullets.
   Handles DOM element creation and
   attaches them to the arena.

   Used by: modes/infinite/director.js
   Depends on: state.js, dom.js, config.js,
               classes/Enemy.js, classes/Bullet.js
   ═══════════════════════════════════════ */

function spawnEnemyDirected(def, dir) {
  if (!running) return;

  const { w, h } = getArenaSize();
  const cx = w / 2;
  const cy = h / 2;
  const m  = CONFIG.spawn.edgeMargin;

  let x, y;
  if (dir === 'up')    { x = cx;    y = -m;    }
  if (dir === 'down')  { x = cx;    y = h + m; }
  if (dir === 'left')  { x = -m;    y = cy;    }
  if (dir === 'right') { x = w + m; y = cy;    }

  const spread = CONFIG.spawn.spread;
  if (dir === 'up'   || dir === 'down')  x += (Math.random() - 0.5) * spread;
  if (dir === 'left' || dir === 'right') y += (Math.random() - 0.5) * spread;

  const speedMult = 1 + (Director.getWave() - 1) * CONFIG.difficulty.speedIncreasePerLevel;
  const sMult     = Math.min(CONFIG.difficulty.maxSpeedMult, speedMult);
  const enemy     = new Enemy(def, x, y, dir, sMult, w, h);

  if (player.specialActive) {
    player.ability.onActivate([enemy]);
  }

  const el = document.createElement('div');
  el.className      = 'enemy';
  el.style.width    = enemy.size + 'px';
  el.style.height   = enemy.size + 'px';
  el.style.fontSize = Math.round(enemy.size * 0.5) + 'px';
  el.textContent    = enemy.emoji;
  el.style.left     = x + 'px';
  el.style.top      = y + 'px';

  const hpWrap = document.createElement('div');
  hpWrap.className = 'enemy-hp-wrap';
  const hpFill = document.createElement('div');
  hpFill.className   = 'enemy-hp-fill';
  hpFill.style.width = '100%';
  hpWrap.appendChild(hpFill);
  el.appendChild(hpWrap);

  arena.appendChild(el);
  enemy.el     = el;
  enemy.hpFill = hpFill;
  enemies.push(enemy);
}

function spawnBullet(enemy) {
  const { w, h } = getArenaSize();
  const cx = w / 2;
  const cy = h / 2;

  const dx   = cx - enemy.x;
  const dy   = cy - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;

  const vx = dx / dist * enemy.bulletSpeed;
  const vy = dy / dist * enemy.bulletSpeed;

  const b  = new Bullet(enemy.x, enemy.y, vx, vy, enemy.bulletDamagePct);
  const el = document.createElement('div');
  el.className  = 'bullet';
  el.style.left = b.x + 'px';
  el.style.top  = b.y + 'px';

  arena.appendChild(el);
  b.el    = el;
  b.owner = enemy;
  bullets.push(b);
  SFX.bullet();
}