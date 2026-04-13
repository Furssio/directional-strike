/* ═══════════════════════════════════════
   COMBAT.JS
   Attack, kill registration, shield
   and special ability activation.
   ═══════════════════════════════════════ */

/* ── KILL ── */

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

/* ── SHIELD ── */

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

/* ── SPECIAL ── */

function activateSpecial() {
  if (!running || player.shielded || choosingAbility) return;
  if (!player.activateSpecial()) return;

  SFX.special();

  playerEl.classList.add('special-active');
  specialRing.classList.add('active');
  btnSpecial.classList.add('active-special');
  specialWrap.classList.remove('ready');

  player.charDef.special.onActivate(enemies);

  setTimeout(() => {
    player.specialActive = false;
    playerEl.classList.remove('special-active');
    specialRing.classList.remove('active');
    btnSpecial.className = 'cbtn';

    player.charDef.special.onDeactivate(enemies);
  }, player.charDef.special.duration);
}

/* ── ATTACK ── */

function handleDir(dir) {
  if (!running || player.shielded || choosingAbility || isAttacking) return;
  isAttacking = true;
  setTimeout(() => isAttacking = false, 80);
  const hitDmg      = player.getHitDamage();
  const { w, h }    = getArenaSize();
  const cx          = w / 2;
  const cy          = h / 2;
  const arenaSize   = Math.min(w, h);
  const attackRange = player.getAttackRange(arenaSize);
  const isPiercing  = player.specialActive && player.charDef.special.piercing;

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