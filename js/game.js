/* ═══════════════════════════════════════
   GAME.JS
   Main game logic.
   Entry point — loaded last.

   Depends on: config.js, abilities.js,
               audio.js, Player.js, Enemy.js,
               Bullet.js, ui.js
   Used by: nobody (this is the final file)

   RESPONSIBILITIES:
   - global game state
   - game loop (tick every 16ms)
   - enemy and bullet spawning
   - collision detection
   - attack handling (handleDir)
   - shield and special management
   - juice effects (shake, particles)
   - input events (keyboard + touch)
   - start / end game
   ═══════════════════════════════════════ */

/* ══════════════════════════════════════
   GLOBAL GAME STATE
   ══════════════════════════════════════ */

let player          = null;
let enemies         = [];
let bullets         = [];
let gameLoop        = null;
let running         = false;
let choosingAbility = false;
let lastTick        = 0;

let selectedCharId = 'warrior';

/* ══════════════════════════════════════
   UI CALLBACKS
   ══════════════════════════════════════ */

function onCharSelected(charId) {
  selectedCharId = charId;
}

/* ══════════════════════════════════════
   SPAWN
   ══════════════════════════════════════ */

function spawnEnemyDirected(def, dir) {
  if (!running) return;

  const { w, h } = getArenaSize();
  const cx = w / 2;
  const cy = h / 2;
  const m  = 30;

  let x, y;
  if (dir === 'up')    { x = cx;    y = -m;    }
  if (dir === 'down')  { x = cx;    y = h + m; }
  if (dir === 'left')  { x = -m;    y = cy;    }
  if (dir === 'right') { x = w + m; y = cy;    }

  const spread = 60;
  if (dir === 'up'   || dir === 'down')  x += (Math.random() - 0.5) * spread;
  if (dir === 'left' || dir === 'right') y += (Math.random() - 0.5) * spread;

  const speedMult = 1 + (Director.getWave() - 1) * CONFIG.difficulty.speedIncreasePerLevel;
  const sMult     = Math.min(CONFIG.difficulty.maxSpeedMult, speedMult);
  const enemy     = new Enemy(def, x, y, dir, sMult, w, h);

  if (player.specialActive && player.charDef.id === 'warrior') {
    enemy.setSlowed(true, player.charDef.special.slowMult);
  }

  const el = document.createElement('div');
  el.className       = 'enemy';
  el.style.width     = enemy.size + 'px';
  el.style.height    = enemy.size + 'px';
  el.style.fontSize  = Math.round(enemy.size * 0.5) + 'px';
  el.textContent     = enemy.emoji;
  el.style.left      = x + 'px';
  el.style.top       = y + 'px';

  const hpWrap = document.createElement('div');
  hpWrap.className = 'enemy-hp-wrap';
  const hpFill = document.createElement('div');
  hpFill.className = 'enemy-hp-fill';
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
  b.el = el;
  bullets.push(b);
  SFX.bullet();
}

/* ══════════════════════════════════════
   JUICE — VISUAL EFFECTS
   ══════════════════════════════════════ */

function spawnParticles(x, y, color, isElite) {
  const cfg   = CONFIG.juice.particles;
  const count = isElite ? cfg.killCountElite : cfg.killCount;

  for (let i = 0; i < count; i++) {
    const p     = document.createElement('div');
    p.className = 'particle';

    const size  = cfg.minSize + Math.random() * (cfg.maxSize - cfg.minSize);
    const angle = Math.random() * Math.PI * 2;
    const speed = cfg.minSpeed + Math.random() * (cfg.maxSpeed - cfg.minSpeed);
    const vx    = Math.cos(angle) * speed;
    const vy    = Math.sin(angle) * speed;

    p.style.cssText = `width:${size}px;height:${size}px;background:${color};left:${x}px;top:${y}px;opacity:1;`;
    arena.appendChild(p);

    const start = performance.now();

    function animParticle(now) {
      const t = (now - start) / cfg.lifetime;
      if (t >= 1) { p.remove(); return; }

      p.style.left      = (x + vx * speed * t * 18) + 'px';
      p.style.top       = (y + vy * speed * t * 18) + 'px';
      p.style.opacity   = 1 - t;
      p.style.transform = `translate(-50%,-50%) scale(${1 - t * 0.5})`;
      requestAnimationFrame(animParticle);
    }

    requestAnimationFrame(animParticle);
  }
}

let shakeTimeout = null;
function triggerShake() {
  if (!CONFIG.juice.shakeOnDamage) return;
  arena.classList.remove('shake');
  void arena.offsetWidth;
  arena.classList.add('shake');
  clearTimeout(shakeTimeout);
  shakeTimeout = setTimeout(() => arena.classList.remove('shake'), 300);
}

/* ══════════════════════════════════════
   KILL — CENTRALIZED LOGIC
   ══════════════════════════════════════ */

function registerKill(e) {
  SFX.kill();

  const mult = player.getComboMult();
  const pts  = Math.round(e.points * mult);

  player.score += pts;
  player.kills += 1;
  player.addKill();
  Director.onKill();

  showScorePop(e.x, e.y, pts);
  scoreEl.textContent = player.score;
  updateComboDisplay();
  updateSpecialBar();
  updateProgress();
}

/* ══════════════════════════════════════
   SHIELD
   ══════════════════════════════════════ */

function setShield(on) {
  player.shielded = on;

  if (on) {
    playerEl.classList.add('shielded');
    SFX.shield();
    if (player.shieldHealAmt > 0) {
      player.hp = Math.min(player.maxHp, player.hp + player.shieldHealAmt);
      updateHpBar();
    }
  } else {
    playerEl.classList.remove('shielded');
  }

  shieldRing.className = on ? 'active' : '';
  btnShield.className  = 'cbtn' + (on ? ' active' : '');
}

/* ══════════════════════════════════════
   SPECIAL ABILITY
   ══════════════════════════════════════ */

function activateSpecial() {
  if (!running || player.shielded || choosingAbility) return;
  if (!player.activateSpecial()) return;

  SFX.special();

  const charId = player.charDef.id;
  playerEl.classList.add('special-active');
  specialRing.classList.add('active');
  btnSpecial.classList.add('active-special');
  specialWrap.classList.remove('ready');

  if (charId === 'warrior') {
    enemies.forEach(e => e.setSlowed(true, player.charDef.special.slowMult));
  }

  setTimeout(() => {
    player.specialActive = false;
    playerEl.classList.remove('special-active');
    specialRing.classList.remove('active');
    btnSpecial.className = 'cbtn';

    if (charId === 'warrior') {
      enemies.forEach(e => e.setSlowed(false, 1));
    }
  }, player.charDef.special.duration);
}

/* ══════════════════════════════════════
   ATTACK
   ══════════════════════════════════════ */

function handleDir(dir) {
  if (!running || player.shielded || choosingAbility) return;

  const hitDmg      = player.getHitDamage();
  const { w, h }    = getArenaSize();
  const cx          = w / 2;
  const cy          = h / 2;
  const arenaSize   = Math.min(w, h);
  const attackRange = player.getAttackRange(arenaSize);
  const isPiercing  = player.specialActive && player.charDef.id === 'mage';

  const dirs = player.doubleAttack && !isPiercing
    ? [dir, ...getAdjacentDirs(dir)]
    : [dir];

  let anyHit = false;

  for (const d of dirs) {

    if (isPiercing) {
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e  = enemies[i];
        if (e.dir !== d) continue;

        const dx   = e.x - cx;
        const dy   = e.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > attackRange) continue;

        anyHit = true;
        SFX.hit();
        e.flashHit();
        e.hit(hitDmg);
        e.hpFill.style.width = Math.round(e.hpPercent() * 100) + '%';

        if (!e.isAlive()) {
          spawnParticles(e.x, e.y, player.charDef.color, e.isElite);
          e.el.remove();
          enemies.splice(i, 1);
          registerKill(e);
        }
      }

    } else {
      let best     = null;
      let bestDist = Infinity;

      for (const e of enemies) {
        if (e.dir !== d) continue;

        const dx   = e.x - cx;
        const dy   = e.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > attackRange) continue;
        if (dist < bestDist) { bestDist = dist; best = e; }
      }

      if (best) {
        anyHit = true;
        SFX.hit();
        best.flashHit();
        best.hit(hitDmg);
        best.hpFill.style.width = Math.round(best.hpPercent() * 100) + '%';

        if (player.stunChance > 0 && Math.random() < player.stunChance) {
          best.stun(1000);
        }

        if (!best.isAlive()) {
          spawnParticles(best.x, best.y, player.charDef.color, best.isElite);
          best.el.remove();
          enemies.splice(enemies.indexOf(best), 1);
          registerKill(best);
        }
      }
    }
  }

  if (!anyHit) SFX.miss();
}

function getAdjacentDirs(dir) {
  const map = {
    up:    ['left', 'right'],
    down:  ['left', 'right'],
    left:  ['up',   'down'],
    right: ['up',   'down'],
  };
  return map[dir] || [];
}

/* ══════════════════════════════════════
   GAME LOOP — TICK
   ══════════════════════════════════════ */

function tick() {
  if (!running || choosingAbility) return;

  const now = performance.now();
  const dt  = Math.min(now - lastTick, 50);
  lastTick  = now;

  player.tickSpecial(dt);
  Director.tick(dt);
  updateComboDisplay();
  updateSpecialBar();

  const { w, h }    = getArenaSize();
  const cx          = w / 2;
  const cy          = h / 2;
  const hitR        = 28;
  const bulletHitR  = 22;
  const arenaSize   = Math.min(w, h);
  const attackRange = player.getAttackRange(arenaSize);

  /* ── UPDATE ENEMIES ── */
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e    = enemies[i];
    const dx   = cx - e.x;
    const dy   = cy - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) continue;

    e.x += dx / dist * e.speed;
    e.y += dy / dist * e.speed;
    e.el.style.left = e.x + 'px';
    e.el.style.top  = e.y + 'px';

    e.el.style.opacity = dist <= attackRange ? '1' : '0.5';

    if (e.shoots) {
      const curDist = e.distToCenter(cx, cy);

      if (!e.firstShotFired && curDist <= e.firstShotDist) {
        e.firstShotFired = true;
        spawnBullet(e);
        e.shootTimer = 0;
      } else if (e.firstShotFired) {
        e.shootTimer += dt;
        if (e.shootTimer >= e.shootInterval) {
          spawnBullet(e);
          e.shootTimer = 0;
        }
      }
    }

    if (dist < hitR) {

      if (player.thorns && player.specialActive && player.charDef.id === 'tank') {
        e.hit(Math.round(CONFIG.player.maxHp * 0.15));
        e.hpFill.style.width = Math.round(e.hpPercent() * 100) + '%';
        if (!e.isAlive()) {
          spawnParticles(e.x, e.y, player.charDef.color, e.isElite);
          e.el.remove();
          registerKill(e);
          enemies.splice(i, 1);
          continue;
        }
      }

      e.el.remove();
      enemies.splice(i, 1);
      player.takeDamage(e.damagePct);
      updateHpBar();
      updateComboDisplay();
      SFX.damage();
      Director.onDamage();
      triggerShake();

      flashEl.style.opacity = '1';
      setTimeout(() => flashEl.style.opacity = '0', 200);

      const p = player.hpPercent();
      playerEl.textContent = p > 0.5 ? player.charDef.emoji : p > 0.25 ? '😨' : '😰';

      if (!player.isAlive()) { endGame(); return; }
    }
  }

  /* ── UPDATE BULLETS ── */
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;
    b.el.style.left = b.x + 'px';
    b.el.style.top  = b.y + 'px';

    if (b.x < -20 || b.x > w + 20 || b.y < -20 || b.y > h + 20) {
      b.el.remove();
      bullets.splice(i, 1);
      continue;
    }

    const dx   = cx - b.x;
    const dy   = cy - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < bulletHitR) {
      b.el.remove();
      bullets.splice(i, 1);

      if (player.shielded || (player.specialActive && player.charDef.id === 'tank')) continue;

      player.takeDamage(b.damagePct);
      updateHpBar();
      updateComboDisplay();
      SFX.damage();
      Director.onDamage();
      triggerShake();

      flashEl.style.opacity = '1';
      setTimeout(() => flashEl.style.opacity = '0', 150);

      const p = player.hpPercent();
      playerEl.textContent = p > 0.5 ? player.charDef.emoji : p > 0.25 ? '😨' : '😰';

      if (!player.isAlive()) { endGame(); return; }
    }
  }
}

/* ══════════════════════════════════════
   START / END GAME
   ══════════════════════════════════════ */

function startGame() {
  SFX.init();

  const charDef   = CONFIG.characters[selectedCharId];
  player          = new Player(charDef);
  enemies         = [];
  bullets         = [];
  running         = true;
  choosingAbility = false;
  lastTick        = performance.now();

  document.querySelectorAll('.enemy, .bullet, .particle').forEach(e => e.remove());
  abilityOverlay.classList.remove('visible');

  updateHpBar();
  updateProgress();
  updateComboDisplay();
  updateSpecialBar();
  scoreEl.textContent = '0';
  levelEl.textContent = 'wave 1';

  playerEl.textContent   = charDef.emoji;
  playerEl.className     = '';
  shieldRing.className   = '';
  specialRing.className  = '';
  btnSpecial.className   = 'cbtn';
  btnSpecial.textContent = '⚡';
  specialWrap.classList.remove('ready');

  showScreen(sGame);
  setTimeout(updateRangeCircle, 50);

  clearInterval(gameLoop);
  Director.init();
  gameLoop = setInterval(tick, 16);
}

function endGame() {
  SFX.gameOver();

  running         = false;
  choosingAbility = false;

  clearInterval(gameLoop);
  Director.stop();

  enemies.forEach(e => e.setSlowed(false, 1));
  document.querySelectorAll('.enemy, .bullet, .particle').forEach(e => e.remove());
  enemies = [];
  bullets = [];
  abilityOverlay.classList.remove('visible');

  const best  = getBestScore();
  const isNew = player.score > best;
  if (isNew) saveBestScore(player.score);

  finalScoreEl.textContent = player.score;
  finalLevelEl.textContent = 'wave ' + Director.getWave() + ' · ' + player.kills + ' kills';
  bestLabel.textContent    = isNew
    ? 'new record! 🎉'
    : 'best: ' + Math.max(best, player.score);

  updateMenuBest();
  showScreen(sOver);
}

/* ══════════════════════════════════════
   INPUT EVENTS
   ══════════════════════════════════════ */

document.getElementById('btn-infinite').addEventListener('click', () => {
  buildCharScreen(selectedCharId);
  showScreen(sChar);
});
document.getElementById('btn-story').addEventListener('click', () => showScreen(sSoon));

document.getElementById('btn-char-confirm').addEventListener('click', startGame);
document.getElementById('btn-char-back').addEventListener('click', () => showScreen(sMenu));

document.getElementById('btn-restart').addEventListener('click', () => {
  buildCharScreen(selectedCharId);
  showScreen(sChar);
});
document.getElementById('btn-home').addEventListener('click', () => {
  updateMenuBest();
  showScreen(sMenu);
});

document.getElementById('btn-soon-back').addEventListener('click', () => showScreen(sMenu));

btnMute.addEventListener('click', () => {
  SFX.init();
  CONFIG.audio.enabled = !CONFIG.audio.enabled;
  btnMute.textContent  = CONFIG.audio.enabled ? '🔊 audio on' : '🔇 audio off';
});

['up', 'down', 'left', 'right'].forEach(dir => {
  const btn = document.getElementById('btn-' + dir);
  btn.addEventListener('click', () => handleDir(dir));
  btn.addEventListener('touchstart', e => {
    e.preventDefault();
    handleDir(dir);
  }, { passive: false });
});

btnShield.addEventListener('mousedown', () => setShield(true));
btnShield.addEventListener('touchstart', e => {
  e.preventDefault();
  setShield(true);
}, { passive: false });

document.addEventListener('mouseup',  () => { if (player && running) setShield(false); });
document.addEventListener('touchend', () => { if (player && running) setShield(false); });

btnSpecial.addEventListener('mousedown', activateSpecial);
btnSpecial.addEventListener('touchstart', e => {
  e.preventDefault();
  activateSpecial();
}, { passive: false });

document.addEventListener('keydown', e => {
  if (e.code === 'KeyS') {
    e.preventDefault();
    if (running && !choosingAbility) setShield(true);
    return;
  }
  if (e.code === 'KeyD') {
    e.preventDefault();
    activateSpecial();
    return;
  }

  const map = {
    ArrowUp:    'up',
    ArrowDown:  'down',
    ArrowLeft:  'left',
    ArrowRight: 'right',
  };

  if (map[e.key]) {
    e.preventDefault();
    const btn = document.getElementById('btn-' + map[e.key]);
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 120);
    handleDir(map[e.key]);
  }
});

document.addEventListener('keyup', e => {
  if (e.code === 'KeyS') {
    e.preventDefault();
    if (running) setShield(false);
  }
});

/* ══════════════════════════════════════
   INIT
   ══════════════════════════════════════ */

updateMenuBest();