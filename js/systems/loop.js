/* ═══════════════════════════════════════
   LOOP.JS
   Game loop, start and end game.

   Used by: input.js
   Depends on: state.js, dom.js, config.js,
               combat.js, spawn.js, juice.js,
               ui/hud.js, ui/screens.js,
               audio.js, Player.js
   ═══════════════════════════════════════ */

/* ── START / END ── */

function startGame() {
  SFX.init();

  player    = new Player(equippedAbilityId);
  enemies   = [];
  bullets   = [];
  running   = true;
  lastTick  = performance.now();

  document.querySelectorAll('.enemy, .bullet, .particle').forEach(e => e.remove());

  updateHpBar();
  updateProgress();
  updateComboDisplay();
  updateSpecialBar();
  scoreEl.textContent = '0';
  levelEl.textContent = 'wave 1';

  playerEl.textContent   = '';
  playerEl.style.backgroundImage = 'url(assets/characters/player.png)';
  playerEl.style.backgroundSize  = 'cover';
  playerEl.style.imageRendering  = 'pixelated';
  playerEl.className     = '';
  specialRing.className  = '';
  btnSpecial.className   = 'cbtn';
  btnSpecial.textContent = '⚡';
  specialWrap.classList.remove('ready');

  showScreen(sGame);
  setTimeout(updateRangeCircle, 50);

  clearInterval(gameLoop);
  if (ActiveDirector === Director) ActiveDirector.init();
  gameLoop = setInterval(tick, 16);
}

function endGame() {
  SFX.gameOver();

  running = false;

  clearInterval(gameLoop);
  ActiveDirector.stop();

  enemies.forEach(e => e.setSlowed(false, 1));
  document.querySelectorAll('.enemy, .bullet, .particle').forEach(e => e.remove());
  enemies = [];
  bullets = [];

  const best  = getBestScore();
  const isNew = player.score > best;
  if (isNew) saveBestScore(player.score);

  finalScoreEl.textContent = player.score;
  finalLevelEl.textContent = 'wave ' + ActiveDirector.getWave() + ' · ' + player.kills + ' kills';
  bestLabel.textContent    = isNew
    ? 'new record! 🎉'
    : 'best: ' + Math.max(best, player.score);

  updateMenuBest();
  showScreen(sOver);
}

/* ── TICK ── */

function tick() {
  if (!running) return;

  const now = performance.now();
  const dt  = Math.min(now - lastTick, 50);
  lastTick  = now;

  player.tickSpecial(dt);
  ActiveDirector.tick(dt);
  updateComboDisplay();
  updateSpecialBar();

  const { w, h }    = getArenaSize();
  const cx          = w / 2;
  const cy          = h / 2;
  const hitR        = CONFIG.spawn.hitRadius;
  const bulletHitR  = CONFIG.spawn.bulletHitRadius;
  const arenaSize   = Math.min(w, h);
  const attackRange = player.getAttackRange(arenaSize);

  /* ── UPDATE ENEMIES ── */
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e    = enemies[i];
    const dx   = cx - e.x;
    const dy   = cy - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) continue;

    // ── MOVIMENTO (wobble per slime, dritto per gli altri) ──
    const nx = dx / dist;
    const ny = dy / dist;

    let wx = 0, wy = 0;
    if (e.wobble) {
      e.wobbleTime = (e.wobbleTime || 0) + dt;
      const perp = e.wobble.amplitude *
                   Math.sin(e.wobbleTime * 0.001 * e.wobble.frequency * Math.PI * 2);
      wx = -ny * perp * 0.05;
      wy =  nx * perp * 0.05;
    }

    e.x += nx * e.speed + wx;
    e.y += ny * e.speed + wy;
    e.el.style.left = e.x + 'px';
    e.el.style.top  = e.y + 'px';

    e.el.style.opacity = dist <= attackRange ? '1' : '0.5';

    if (e.shoots && !e.hasBullet) {
      const curDist = e.distToCenter(cx, cy);
      if (!e.firstShotFired && curDist <= e.firstShotDist) {
        e.firstShotFired = true;
        e.hasBullet = true;
        spawnBullet(e);
      }
    }

    if (dist < hitR) {

      if (player.thorns && player.specialActive && player.ability.blocksBullets) {
        e.hit(Math.round(PLAYER_STATS.maxHp * 0.15));
        e.hpFill.style.width = Math.round(e.hpPercent() * 100) + '%';
        if (!e.isAlive()) {
          spawnParticles(e.x, e.y, player.color, e.isElite);
          e.el.remove();
          registerKill(e);
          enemies.splice(i, 1);
          continue;
        }
      }

      e.el.remove();
      enemies.splice(i, 1);

      // ── DANNO CONTATTO (multi-hit per slime medium/small) ──
      const hits = e.contactHits || 1;
      for (let h = 0; h < hits; h++) {
        player.takeDamage(e.damagePct);
      }

      updateHpBar();
      updateComboDisplay();
      SFX.damage();
      ActiveDirector.onDamage();
      triggerShake();

      flashEl.style.opacity = '1';
      setTimeout(() => flashEl.style.opacity = '0', 200);

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
      if (b.owner) b.owner.hasBullet = false;
      bullets.splice(i, 1);
      continue;
    }

    const dx   = cx - b.x;
    const dy   = cy - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < bulletHitR) {
      b.el.remove();
      if (b.owner) b.owner.hasBullet = false;
      bullets.splice(i, 1);

      if (player.specialActive && player.ability.blocksBullets) continue;

      player.takeDamage(b.damagePct);
      updateHpBar();
      updateComboDisplay();
      SFX.damage();
      ActiveDirector.onDamage();
      triggerShake();

      flashEl.style.opacity = '1';
      setTimeout(() => flashEl.style.opacity = '0', 150);

      if (!player.isAlive()) { endGame(); return; }\
    }
  }
}