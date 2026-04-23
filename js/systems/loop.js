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

  player      = new Player(equippedAbilityId);
  enemies     = [];
  bullets     = [];
  running     = true;
  isAttacking = false;
  lastTick    = performance.now();

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
  // poison tick
  if (player.poisonEffects && player.poisonEffects.length > 0) {
    for (let i = player.poisonEffects.length - 1; i >= 0; i--) {
      const pe = player.poisonEffects[i];
      pe.timer += dt;
      if (pe.timer >= 1000) {
        pe.timer -= 1000;
        player.takeDamage(0.05);
        updateHpBar();
        if (!player.isAlive()) { endGame(); return; }
        pe.ticksLeft--;
        if (pe.ticksLeft <= 0) player.poisonEffects.splice(i, 1);
      }
    }
  }
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

    // cleanup: remove enemies that died outside of combat
    // (e.g. crab emerging, self-destructing enemies)
    if (!e.isAlive() && e._emerged) {
      if (e.el && e.el.parentNode) e.el.remove();
      enemies.splice(i, 1);
      if (e.def.onDeath) e.def.onDeath(e);
      continue;
    }

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

  if (!e.def.customMovement) {
      const sm = player.speedMultiplier;
      e.x += (nx * e.speed + wx) * sm;
      e.y += (ny * e.speed + wy) * sm;
      e.el.style.left = e.x + 'px';
      e.el.style.top  = e.y + 'px';
    }

   if (!e.underground && !e.def.customOpacity) {
      e.el.style.opacity = dist <= attackRange ? '1' : '0.5';
    }
    if (e.def.onTick) e.def.onTick(e, cx, cy, attackRange);

    if (dist < hitR && !e.underground) {

      if (player.thorns && player.specialActive && player.ability.blocksBullets) {
        e.hit(Math.round(PLAYER_STATS.maxHp * 0.15));
        if (e.hpFill) e.hpFill.style.width = Math.round(e.hpPercent() * 100) + '%';
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
        if (e.def.onContact) e.def.onContact(player);
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
    const sm = player.speedMultiplier;
    b.x += b.vx * sm;
    b.y += b.vy * sm;
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

      if (!player.isAlive()) { endGame(); return; }
    }
  }
}