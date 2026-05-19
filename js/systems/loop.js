/* ═══════════════════════════════════════
   LOOP.JS
   Game loop, start and end game.

   Used by: input.js
   Depends on: state.js, dom.js, config.js,
               combat.js, spawn.js, juice.js,
               ui/hud.js, ui/screens.js,
               audio.js, Player.js
   ═══════════════════════════════════════ */

/* ── ABILITY CLEANUP ──
   Removes all ability visual effects and stops audio.
   Called on startGame, endGame, and exit to menu. */

function cleanupAbilityEffects() {
  // call onDeactivate on active ability before cleanup
  if (player && player.specialActive && player.ability && player.ability.onDeactivate) {
    player.ability.onDeactivate(enemies);
  }

  if (typeof SFX !== 'undefined') SFX.stopAll();

  const a = document.getElementById('arena');
  if (a) {
   // bullet time
    a.classList.remove('bullet-time-active');
    a.classList.remove('bullet-time-ending');
    const ov = a.querySelector('.bt-overlay');
    if (ov) ov.remove();

    // explosion
    a.classList.remove('explosion-shake');
    a.querySelectorAll('.explosion-ring, .explosion-flash, .explosion-scorch, .explosion-ember').forEach(el => el.remove());

    // shield
    ShieldFX.stop();

    // slash
    SlashFX.stop();
    a.querySelectorAll('.slash-aura-canvas').forEach(el => el.remove());

    // one hit
    a.classList.remove('one-hit-active');
    a.querySelectorAll('.onehit-aura').forEach(el => el.remove());

    // range boost
    if (typeof RangeBoostFX !== 'undefined') RangeBoostFX.stop();
  }

  // restore range circle in case ability hid it
  if (typeof rangeEl !== 'undefined' && rangeEl) rangeEl.style.display = '';

  if (player && player.specialActive && player.ability) {
    player.specialActive = false;
    player.specialTimer  = 0;
    player.speedMultiplier = 1.0;
  }
}

/* ── START / END ── */

function startGame(delayLoop) {
  SFX.init();

  // reset ad continue for new run
  if (typeof AdPlaceholder !== 'undefined') AdPlaceholder.resetContinue();

  // cleanup any active ability effects from previous game
  cleanupAbilityEffects();

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
  playerEl.style.backgroundImage = 'url(assets/characters/player_idle.png)';
  playerEl.style.backgroundSize  = '1152px 96px';
  playerEl.style.backgroundRepeat = 'no-repeat';
  playerEl.style.imageRendering  = 'pixelated';
  playerEl.style.animation       = 'playerIdle 1.2s steps(12) infinite';
 playerEl.className     = '';
  specialRing.className  = '';
  const _barSpecial = document.getElementById('bar-special');
  if (_barSpecial) _barSpecial.classList.remove('bar-ready');
  playerEl.classList.remove('special-ready');

showScreen(sGame);
  setTimeout(updateRangeCircle, 50);

  clearInterval(gameLoop);
  if (ActiveDirector === Director) ActiveDirector.init();

  if (!delayLoop) {
    gameLoop = setInterval(tick, 16);
  }
}


function startGameLoop() {
  if (paused) return;
  lastTick = performance.now();
  clearInterval(gameLoop);
  gameLoop = setInterval(tick, 16);
}

function endGame() {
  cleanupAbilityEffects();
  SFX.gameOver();

  running = false;

  clearInterval(gameLoop);
  ActiveDirector.stop();

  // challenge: save best wave
  if (ActiveDirector === ChallengeDirector && typeof ChallengeDirector.onGameOver === 'function') {
    ChallengeDirector.onGameOver();
  }

  const best  = getBestScore();
  const isNew = player.score > best;
  if (isNew) saveBestScore(player.score);

  finalScoreEl.textContent = player.score.toLocaleString();
  finalLevelEl.textContent = 'WAVE ' + ActiveDirector.getWave() + ' · ' + player.kills + ' KILLS';
  bestLabel.textContent    = isNew
    ? 'NEW RECORD!'
    : 'BEST: ' + Math.max(best, player.score).toLocaleString();

  updateMenuBest();

  // ── AD CONTINUE BUTTON ──
  _buildAdContinueButton();

  // show game over overlay
  overOverlay.classList.remove('hidden');
}

/* ── AD CONTINUE BUTTON ──────────────
   Builds the "watch ad to continue"
   button inside #over-ad-slot.
   Only shown once per run.
   Challenge mode: hidden if past best. */

function _buildAdContinueButton() {
  const slot = document.getElementById('over-ad-slot');
  if (!slot) return;
  slot.innerHTML = '';

  if (typeof AdPlaceholder === 'undefined') return;
  if (!AdPlaceholder.canContinue()) return;

  const btn = document.createElement('button');
  btn.className = 'over-btn over-btn-ad';
  btn.innerHTML = '▶ WATCH AD — CONTINUE';
  slot.appendChild(btn);

  btn.addEventListener('click', () => {
    btn.disabled = true;
    btn.style.opacity = '0.5';

    AdPlaceholder.showRewarded(() => {
      AdPlaceholder.useContinue();
      _executeContinue();
    }, () => {
      // ad failed — re-enable button
      btn.disabled = false;
      btn.style.opacity = '1';
    });
  });
}

/* ── EXECUTE CONTINUE ────────────────
   Resumes game from start of current
   wave with full HP and defense boost.
   Cleans arena, shows 3-2-1 countdown,
   then restarts the game loop.          */

function _executeContinue() {
  // hide game over overlay
  overOverlay.classList.add('hidden');

  // clean arena (enemies, bullets, particles)
  cleanupArena();

  // restore player HP to full
  player.hp = player.maxHp;
  updateHpBar();

  // apply defense boost (same as orb defense, 8s)
  if (typeof OrbSystem !== 'undefined') {
    // use orb system internal state for consistency
    // we trigger it via the public effect
    playerEl.classList.add('orb-defense-effect');
  }

  // reset spawner gates
  if (typeof resetAdventureSpawner === 'function') resetAdventureSpawner();

 // restart current wave (not wave+1)
  ActiveDirector.restartCurrentWave();

  // re-activate game loop flag
  running = true;

  // show countdown then start loop
  _showContinueCountdown(() => {
    // apply defense buff AFTER countdown
    // so the 8s timer starts when gameplay begins
    if (typeof OrbSystem !== 'undefined') {
      OrbSystem._forceDefenseBuff(8000);
    }
    startGameLoop();
  });
}

/* ── CONTINUE COUNTDOWN ──────────────
   3-2-1 countdown overlay before
   resuming gameplay after ad continue. */

function _showContinueCountdown(onComplete) {
  let count = 3;

  const pop = document.createElement('div');
  pop.className = 'continue-countdown';
  pop.style.cssText =
    'position:absolute;inset:0;display:flex;' +
    'align-items:center;justify-content:center;z-index:80;' +
    'pointer-events:none;';

  const num = document.createElement('div');
  num.style.cssText =
    'font-family:"Press Start 2P",monospace;' +
    'font-size:48px;color:#51eefc;' +
    'text-shadow:0 0 20px rgba(81,238,252,0.5),2px 2px 0 #000;';
  num.textContent = count;
  pop.appendChild(num);
  arena.appendChild(pop);

  const iv = setInterval(() => {
    count--;
    if (count <= 0) {
      clearInterval(iv);
      pop.remove();
      if (onComplete) onComplete();
    } else {
      num.textContent = count;
    }
  }, 800);
}

/* cleanup enemies/bullets — called when leaving game over */
function cleanupArena() {
  document.querySelectorAll('.enemy, .bullet, .particle').forEach(e => e.remove());
  enemies = [];
  bullets = [];
}

/* ── TICK ── */

function tick() {
  if (!running || paused) return;

  const now = performance.now();
  const dt  = Math.min(now - lastTick, 50);
  lastTick  = now;

 if (!_choosingUpgrade && !_countdownActive && !_inputBlocked &&
     !_challengeChoiceActive && !_challengeCountdown && !_challengeInputBlocked) {
  player.tickSpecial(dt);
}
updateProgress();
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

  if (!e.def.customMovement && !e.frozen) {
      const sm = player.speedMultiplier;
      e.x += (nx * e.speed + wx) * sm;
      e.y += (ny * e.speed + wy) * sm;
      e.el.style.left = e.x + 'px';
      e.el.style.top  = e.y + 'px';
    }

   if (!e.underground && !e.def.customOpacity) {
      e.el.style.opacity = dist <= attackRange ? '1' : '0.70';
    }
    if (e.def.onTick && !e.frozen) e.def.onTick(e, cx, cy, attackRange);

    if (dist < hitR && !e.underground) {

      if (player.thorns && player.specialActive && player.ability.blocksBullets) {
        e.hit(Math.round(PLAYER_STATS.maxHp * 0.15));
        if (e.hpFill) e.hpFill.style.width = Math.round(e.hpPercent() * 100) + '%';
        if (!e.isAlive()) {
          spawnParticles(e.x, e.y, player.color, e.isElite);
          SFX.shieldAbsorb();
          triggerShieldRipple();
          e.el.remove();
          registerKill(e);
          enemies.splice(i, 1);
          continue;
        }
      }

     e.el.remove();
      enemies.splice(i, 1);

      // shield absorbs contact — register as kill to keep gate system clean
      if (player.specialActive && player.ability.blocksBullets) {
        e.hp = 0;
        spawnParticles(e.x, e.y, player.color, e.isElite);
        SFX.shieldAbsorb();
        triggerShieldRipple();
        registerKill(e);
        continue;
      }

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