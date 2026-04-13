/* ═══════════════════════════════════════
   LOOP.JS
   Game loop, start and end game.

   Used by: nobody — entry point
   Depends on: state.js, dom.js, config.js,
               combat.js, spawn.js, juice.js,
               ui/hud.js, ui/screens.js,
               audio.js, classes/Player.js
   ═══════════════════════════════════════ */

/* ── START / END ── */

function startGame() {
  SFX.init();

  const charDef = CharacterRegistry.get(selectedCharId);
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

/* ── TICK ── */

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

    e.x += dx / dist * e.speed;
    e.y += dy / dist * e.speed;
    e.el.style.left = e.x + 'px';
    e.el.style.top  = e.y + 'px';

    e.el.style.opacity = dist <= attackRange ? '1' : '0.5';

    if (e.shoots) {
      const curDist = e.distToCenter(cx, cy);

      if (!e.firstShotFired && curDist <= e.firstShotDist) {
        e.firstShotFired = true;
        if (!e.hasBullet) { e.hasBullet = true; spawnBullet(e); }
        e.shootTimer = 0;
      } else if (e.firstShotFired) {
        e.shootTimer += dt;
        if (e.shootTimer >= e.shootInterval) {
          if (!e.hasBullet) { e.hasBullet = true; spawnBullet(e); }
          e.shootTimer = 0;
        }
      }
    }

    if (dist < hitR) {

      if (player.thorns && player.specialActive && player.charDef.special.blocksBullets) {
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

      if (player.shielded || (player.specialActive && player.charDef.special.blocksBullets)) continue;

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
