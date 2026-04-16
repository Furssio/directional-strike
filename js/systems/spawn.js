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

let speedMult = 1 + (ActiveDirector.getWave() - 1) * CONFIG.difficulty.speedIncreasePerLevel;

  // adventure mode boss can apply an extra speed multiplier
  if (typeof ActiveDirector.isBoss === 'function' && ActiveDirector.isBoss()) {
    const map = ActiveDirector.getCurrentMap && ActiveDirector.getCurrentMap();
    if (map && map.boss && map.boss.speedMult) {
      speedMult *= map.boss.speedMult;
    }
  }

  const sMult = Math.min(CONFIG.difficulty.maxSpeedMult, speedMult);
  const enemy     = new Enemy(def, x, y, dir, sMult, w, h);

  if (player.specialActive) {
    player.ability.onActivate([enemy]);
  }

  const el = document.createElement('div');
el.className      = 'enemy';
el.style.width    = enemy.size + 'px';
el.style.height   = enemy.size + 'px';
el.style.left     = x + 'px';
el.style.top      = y + 'px';

if (enemy.def.sprite) {
  el.style.backgroundImage = `url(${enemy.def.sprite})`;
  el.style.backgroundSize  = 'cover';
  el.style.imageRendering  = 'pixelated';
} else {
  el.style.fontSize = Math.round(enemy.size * 0.5) + 'px';
  el.textContent    = enemy.emoji;
}

// rotazione in base alla direzione
const rotMap = { down: 0, left: 90, up: 180, right: 270 };
el.style.transform = `translate(-50%,-50%) rotate(${rotMap[dir]}deg)`;

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

  const slowMult = (player && player.specialActive) ? 0.25 : 1;
  const b = new Bullet(enemy.x, enemy.y, vx * slowMult, vy * slowMult, enemy.bulletDamagePct);
// salva sempre velocità piena come base per onDeactivate
b.vxBase = vx;
b.vyBase = vy;
  const el = document.createElement('div');
  el.className  = 'bullet';
  el.style.left = b.x + 'px';
  el.style.top  = b.y + 'px';
  el.style.backgroundImage = 'url(assets/enemies/bullet_rock.png)';
  el.style.backgroundSize  = 'cover';
  el.style.imageRendering  = 'pixelated';
  el.style.backgroundColor = 'transparent';
  el.style.border          = 'none';

  arena.appendChild(el);
  b.el    = el;
  b.owner = enemy;
  bullets.push(b);
  SFX.bullet();
}