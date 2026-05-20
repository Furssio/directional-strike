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

const _map = ActiveDirector.getCurrentMap && ActiveDirector.getCurrentMap();
const _wave = ActiveDirector.getWave();
const _isIntro = _map && _map.introWaves && _map.introWaves[_wave];

let speedMult = 1;
if (!_isIntro) {
  const _speedIncrease = (_map && _map.speedIncreasePerLevel)
    ? _map.speedIncreasePerLevel
    : CONFIG.difficulty.speedIncreasePerLevel;
  speedMult = 1 + (_wave - 1) * _speedIncrease;
}

  // adventure mode boss can apply an extra speed multiplier
  if (typeof ActiveDirector.isBoss === 'function' && ActiveDirector.isBoss()) {
    const map = ActiveDirector.getCurrentMap && ActiveDirector.getCurrentMap();
    if (map && map.boss && map.boss.speedMult) {
      speedMult *= map.boss.speedMult;
    }
  }

 let sMult = Math.min(CONFIG.difficulty.maxSpeedMult, speedMult);

  // per-map speed override for specific enemy types
  const _mapOverrides = ActiveDirector.getCurrentMap && ActiveDirector.getCurrentMap();
  if (_mapOverrides && _mapOverrides.speedOverrides && _mapOverrides.speedOverrides[def.id]) {
    sMult *= (_mapOverrides.speedOverrides[def.id] / def.speedMult);
  }

  

  // 40% chance for random speed variation
  const _svChance = (_map && _map.speedVariationChance !== undefined) ? _map.speedVariationChance : 0.40;
  const _svBoosts = (_map && _map.speedVariationBoosts) ? _map.speedVariationBoosts : [1.05, 1.08, 1.10, 1.12, 1.15];
  if (_svChance > 0 && Math.random() < _svChance) {
    sMult *= _svBoosts[Math.floor(Math.random() * _svBoosts.length)];
  }

  const enemy     = new Enemy(def, x, y, dir, sMult, w, h);

  if (player.specialActive && player.ability.onEnemySpawn) {
    player.ability.onEnemySpawn(enemy);
  }

  const el = document.createElement('div');
el.className      = 'enemy';
el.style.width    = enemy.size + 'px';
el.style.height   = enemy.size + 'px';
el.style.left     = x + 'px';
el.style.top      = y + 'px';

if (enemy.def.sprite) {
  el.style.backgroundImage  = `url(${enemy.def.sprite})`;
  el.style.imageRendering   = 'pixelated';

 if (enemy.def.spriteFrames && enemy.def.spriteFrames > 1) {
    const fw = enemy.def.spriteFrameW || enemy.size;
    const fh = enemy.def.spriteFrameH || enemy.size;
    const frames = enemy.def.spriteFrames;
    // scale sprite to fit enemy.size
    const scale = enemy.size / fh;
    const scaledW = Math.round(fw * frames * scale);
    const scaledH = enemy.size;
    el.style.backgroundSize = `${scaledW}px ${scaledH}px`;
    el.style.backgroundRepeat = 'no-repeat';
    const dur = enemy.def.spriteSpeed || 0.8;
    const animName = `eIdle_${enemy.def.id}_${enemy.size}`;
    if (!document.getElementById('anim-' + animName)) {
      const style = document.createElement('style');
      style.id = 'anim-' + animName;
      style.textContent = `@keyframes ${animName}{from{background-position-x:0}to{background-position-x:-${scaledW}px}}`;
      document.head.appendChild(style);
    }
    el.style.animation = `${animName} ${dur}s steps(${frames}) infinite`;
  } else {
    el.style.backgroundSize = 'cover';
  }
} else {
  el.style.fontSize = Math.round(enemy.size * 0.5) + 'px';
  el.textContent    = enemy.emoji;
}

// rotazione in base alla direzione
el.style.transform = 'translate(-50%,-50%)';
// rotate enemies that need direction-based rotation (e.g. eagle dive)
if (enemy.def.rotateToDirection) {
  const rotMap = { down: 0, left: 90, up: 180, right: 270 };
  el.style.transform = `translate(-50%,-50%) rotate(${rotMap[dir]}deg)`;
}

 if (!enemy.def.noHpBar) {
    const hpWrap = document.createElement('div');
    hpWrap.className = 'enemy-hp-wrap';
    const hpFill = document.createElement('div');
    hpFill.className   = 'enemy-hp-fill';
    hpFill.style.width = '100%';
    hpWrap.appendChild(hpFill);
    el.appendChild(hpWrap);
    enemy.hpFill = hpFill;
  } else {
    enemy.hpFill = null;
  }

  arena.appendChild(el);
  enemy.el = el;
  // start underground if enemy has underground flag
  enemy.underground = enemy.def.underground ? true : false;
  if (enemy.underground) {
    el.style.opacity = '0';
    if (enemy.def.undergroundSpeed) {
      enemy.speed = enemy.baseSpeed * enemy.def.undergroundSpeed;
    }
  }
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

const b = new Bullet(enemy.x, enemy.y, vx, vy, enemy.bulletDamagePct, enemy.def.bulletType);// salva sempre velocità piena come base per onDeactivate
b.vxBase = vx;
b.vyBase = vy;
  const el = document.createElement('div');
  el.className  = 'bullet';
  el.style.left = b.x + 'px';
  el.style.top  = b.y + 'px';
  el.style.backgroundImage = `url(${b.sprite})`;
  el.style.backgroundSize  = 'cover';
  el.style.imageRendering  = 'pixelated';
  el.style.backgroundColor = 'transparent';
  el.style.border          = 'none';

  // apply bullet type visual class
  if (b.bulletType) el.classList.add(b.bulletType);

  arena.appendChild(el);
  b.el    = el;
  b.owner = enemy;
  bullets.push(b);
  SFX.bullet();
}
