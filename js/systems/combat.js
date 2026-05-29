/* ═══════════════════════════════════════
   COMBAT.JS
   Attack, kill registration and
   special ability activation.

   Used by: input.js, loop.js
   Depends on: state.js, dom.js, config.js,
               audio.js, hud.js, juice.js
   ═══════════════════════════════════════ */

/* ── ATTACK SPRITE ────────────────────
   Swaps player sprite to attack frame
   for the slash duration, then restores idle.
   Frame map: 1=down, 2=right, 3=left, 4=up */

let _atkSpriteTimer = null;

const _ATK_FRAMES = { down: 1, right: 2, left: 3, up: 4 };

function showAttackSprite(dir) {
  if (!playerEl) return;

  // clear pending restore
  if (_atkSpriteTimer) clearTimeout(_atkSpriteTimer);

  const frame = _ATK_FRAMES[dir] || 1;

  // swap to attack spritesheet, show correct frame
  playerEl.style.animation          = 'none';
  playerEl.style.backgroundImage    = 'url(assets/characters/attack.png)';
  playerEl.style.backgroundSize     = '480px 96px';
  playerEl.style.backgroundPosition = `-${frame * 96}px 0px`;

  // restore idle after attack flash (120ms)
  _atkSpriteTimer = setTimeout(() => {
    playerEl.style.backgroundImage    = 'url(assets/characters/player_idle.png)';
    playerEl.style.backgroundSize     = '1152px 96px';
    playerEl.style.backgroundPosition = '0px 0px';
    playerEl.style.animation          = 'playerIdle 1.2s steps(12) infinite';
    _atkSpriteTimer = null;
  }, 120);
}

function showSlashEffect(dir) {
  // full-line trail when slash ability is active
  if (player && player.slashActive) {
    showSlashTrail(dir);
    return;
  }

  // screen shake on every attack during one-hit
  if (player && player.oneHitActive) {
    triggerShake();
  }

  const { w, h } = getArenaSize();
  const cx = w / 2;
  const cy = h / 2;

  const el = document.createElement('div');
  el.className = 'slash-effect';

  const dist = 89;
  let x = cx, y = cy;
  let rot = 0;

  if (dir === 'right') { x += dist; rot = 0; }
  if (dir === 'left')  { x -= dist; rot = 180; }
  if (dir === 'up')    { y -= dist; rot = -90; }
  if (dir === 'down')  { y += dist; rot = 90; }

  el.style.left = x + 'px';
  el.style.top  = y + 'px';
  el.style.transform = `translate(-50%,-50%) rotate(${rot}deg)`;

  arena.appendChild(el);
  setTimeout(() => el.remove(), 260);
}

/* ── KILL ── */

function registerKill(e, multiKill) {

  if (e.def.onDeath) {
    e.def.onDeath(e);
    showScorePop(e.x, e.y, e.points);
    player.score += e.points;
    scoreEl.textContent = player.score;
    return;
  }


  const mkMult = multiKill && multiKill >= 2 ? multiKill : 1;
  const mult   = player.getComboMult() * mkMult;
  const pts    = Math.round(e.points * mult);

  player.score += pts;
  player.kills += 1;
  if (!player.specialActive) {
    player.addKill();
  }
  ActiveDirector.onKill();

  showScorePop(e.x, e.y, pts);
  scoreEl.textContent = player.score;
  onComboKill(e.x, e.y, pts);
  updateComboDisplay();
  updateSpecialBar();
  updateProgress();
}

/* ── SPECIAL ── */

function activateSpecial() {
  if (!running) return;
  if (_choosingUpgrade || _countdownActive || _inputBlocked) return;
  if (!player.activateSpecial()) return;

  SFX.special();

  playerEl.classList.add('special-active');
  specialRing.classList.add('active');
  const barSpecialEl = document.getElementById('bar-special');
  if (barSpecialEl) barSpecialEl.classList.remove('bar-ready');

  player.ability.onActivate(enemies);
}

/* ── ATTACK ── */

function handleDir(dir) {
  if (!running || choosingAbility || isAttacking) return;

  // challenge upgrade choice — selecting with direction
  if (typeof isChoosingChallengeUpgrade === 'function' && isChoosingChallengeUpgrade()) {
    selectChallengeUpgrade(dir);
    return;
  }

  // upgrade choice — selecting with direction
  if (typeof isChoosingUpgrade === 'function' && isChoosingUpgrade()) {
    selectUpgrade(dir);
    return;
  }
  isAttacking = true;
  SFX.slash();
  showAttackSprite(dir);

  const hitDmg      = player.getHitDamage();
  const { w, h }    = getArenaSize();
  const cx          = w / 2;
  const cy          = h / 2;
  const arenaSize   = Math.min(w, h);
  const attackRange = player.getAttackRange(arenaSize);
  const isPiercing  = (player.specialActive && player.ability.piercing) || player.slashActive;

  let dirs = [dir];
  if (player.doubleAttack && !isPiercing) {
    dirs = [dir, ...getAdjacentDirs(dir)];
  }
 if (player.doubleStrikeActive) {
    const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
    const opp = opposites[dir];
    if (!dirs.includes(opp)) dirs.push(opp);
  }

  showSlashEffect(dir);
  if (player.doubleStrikeActive) {
    const opp = { up: 'down', down: 'up', left: 'right', right: 'left' }[dir];
    showSlashEffect(opp);
  }
  let anyHit = false;

  // check orb collection
  if (typeof OrbSystem !== 'undefined') {
    if (OrbSystem.checkCollect(dir, attackRange)) anyHit = true;
  }

  for (const d of dirs) {

    /* ── PARRY BULLETS ── */
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const b = bullets[bi];
      if (!b.owner || b.owner.dir !== d) continue;

      const bdx   = b.x - cx;
      const bdy   = b.y - cy;
      const bdist = Math.sqrt(bdx * bdx + bdy * bdy);
      if (bdist > attackRange) continue;

      anyHit = true;
      SFX.parry();
      spawnParticles(b.x, b.y, { size: 24, deathColors: ['#378ADD', '#55aaff', '#2266bb'] });
      showActionPop(d, 'PARRY', '#44ddff');
      b.el.remove();
      if (b.owner) b.owner.hasBullet = false;
      bullets.splice(bi, 1);
    }

    /* ── PARRY TORNADOES (parryable enemies) ── */
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e  = enemies[i];
      if (!e.def.parryable) continue;
      if (e.dir !== d) continue;
      if (e.underground) continue;

      const dx   = e.x - cx;
      const dy   = e.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > attackRange) continue;

      anyHit = true;
      SFX.parry();
      spawnParticles(e.x, e.y, e.def);
      showActionPop(d, 'PARRY', '#44ddff');
      e.el.remove();
      enemies.splice(i, 1);
      registerKill(e);
    }

    /* ── HIT ENEMIES ── */
    if (isPiercing) {
      let _killsThisSwing = 0;

      for (let i = enemies.length - 1; i >= 0; i--) {
        const e  = enemies[i];
        if (e.dir !== d) continue;
        if (e.underground) continue;

        const dx   = e.x - cx;
        const dy   = e.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (!player.slashActive && dist > attackRange) continue;

        anyHit = true;
        if (player.oneHitActive) SFX.oneHitSmash();
        else SFX.hitByType(e.def.hitSound || 'flesh');
        e.flashHit();
        e.hit(hitDmg);
        if (e.hpFill) e.hpFill.style.width = Math.round(e.hpPercent() * 100) + '%';

        // frost touch — freeze BEFORE onHit so enemy can't teleport/jump
        if (e.isAlive() && player._frostChance > 0 && Math.random() < player._frostChance && !e.frozen) {
          e.freeze(CONFIG.combat.freezeDuration || 2000);
          SFX.freeze();
          showActionPop(d, 'FREEZE!', '#44ddff');
        }

        // onHit only if NOT frozen
        if (e.def.onHit && e.isAlive() && !e.frozen) e.def.onHit(e);

        // critical hit pop
        if (player._lastHitWasCrit) {
          SFX.crit();
          showActionPop(d, 'CRIT!', '#ff4444');
        }

        if (!e.isAlive()) {
          _killsThisSwing++;
          if (e.frozen) e.clearFreeze();
          spawnParticles(e.x, e.y, e.def);
          e.el.remove();
          enemies.splice(i, 1);
          registerKill(e, _killsThisSwing);
        }
      }

      if (_killsThisSwing >= 2) {
        const labels = { 2: 'DOUBLE KILL', 3: 'TRIPLE KILL', 4: 'MEGA KILL' };
        const label  = labels[_killsThisSwing] || 'ULTRA KILL';
        const colors = { 2: '#ffdd44', 3: '#ff8844', 4: '#ff44ff' };
        const color  = colors[_killsThisSwing] || '#ff44ff';
        SFX.multiKill(_killsThisSwing);
        showActionPop(d, label, color);
        triggerComboBump();
      }

    } else {
      let _killsThisSwing = 0;

      for (let i = enemies.length - 1; i >= 0; i--) {
        const e  = enemies[i];
        if (e.dir !== d) continue;
        if (e.underground) continue;

        const dx   = e.x - cx;
        const dy   = e.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > attackRange) continue;

        anyHit = true;
        if (player.oneHitActive) SFX.oneHitSmash();
        else SFX.hitByType(e.def.hitSound || 'flesh');
        e.flashHit();
        e.hit(hitDmg);
        if (e.hpFill) e.hpFill.style.width = Math.round(e.hpPercent() * 100) + '%';

        
        // frost touch — freeze BEFORE onHit so enemy can't teleport/jump
        if (e.isAlive() && player._frostChance > 0 && Math.random() < player._frostChance && !e.frozen) {
          e.freeze(CONFIG.combat.freezeDuration || 2000);
          SFX.freeze();
          showActionPop(d, 'FREEZE!', '#44ddff');
        }

        // onHit only if NOT frozen
        if (e.def.onHit && e.isAlive() && !e.frozen) e.def.onHit(e);

        // stun chance (base ability)
        if (player.stunChance > 0 && Math.random() < player.stunChance) {
          e.stun(1000);
        }

        // critical hit pop
        if (player._lastHitWasCrit) {
          SFX.crit();
          showActionPop(d, 'CRIT!', '#ff4444');
        }

        if (!e.isAlive()) {
          _killsThisSwing++;
          if (e.frozen) e.clearFreeze();
          spawnParticles(e.x, e.y, e.def);
          e.el.remove();
          enemies.splice(i, 1);
          registerKill(e, _killsThisSwing);
        }
      }

      if (_killsThisSwing >= 2) {
        const labels = { 2: 'DOUBLE KILL', 3: 'TRIPLE KILL', 4: 'MEGA KILL' };
        const label  = labels[_killsThisSwing] || 'ULTRA KILL';
        const colors = { 2: '#ffdd44', 3: '#ff8844', 4: '#ff44ff' };
        const color  = colors[_killsThisSwing] || '#ff44ff';
        showActionPop(d, label, color);
        triggerComboBump();
      }
    }
  }

  if (!anyHit) {
    showActionPop(dir, 'MISS', '#ff4444');
    player.resetCombo();
    updateComboDisplay();
  }

  // dynamic cooldown: shorter on hit, longer on miss
  const cd = anyHit
    ? CONFIG.attack.hitCooldownMs
    : CONFIG.attack.missCooldownMs;
  setTimeout(() => isAttacking = false, cd);
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