/* ═══════════════════════════════════════
   COMBAT.JS
   Attack, kill registration and
   special ability activation.

   Used by: input.js, loop.js
   Depends on: state.js, dom.js, config.js,
               audio.js, hud.js, juice.js
   ═══════════════════════════════════════ */

/* ── KILL ── */

// sostituisci registerKill con questa versione

function registerKill(e) {
  // slime split — spawna figli, non è una vera kill
  if (e.splitInto) {
    spawnSlimeChildren(e);
    showScorePop(e.x, e.y, e.points);
    player.score += e.points;
    scoreEl.textContent = player.score;
    return;
  }

  SFX.kill();

  const mult = player.getComboMult();
  const pts  = Math.round(e.points * mult);

  player.score += pts;
  player.kills += 1;
  player.addKill();
  ActiveDirector.onKill();

  showScorePop(e.x, e.y, pts);
  scoreEl.textContent = player.score;
  updateComboDisplay();
  updateSpecialBar();
  updateProgress();
}

/* ── SPECIAL ── */

function activateSpecial() {
  if (!running) return;
  if (!player.activateSpecial()) return;

  SFX.special();

  playerEl.classList.add('special-active');
  specialRing.classList.add('active');
  btnSpecial.classList.add('active-special');
  specialWrap.classList.remove('ready');

  player.ability.onActivate(enemies);

  setTimeout(() => {
    player.specialActive = false;
    playerEl.classList.remove('special-active');
    specialRing.classList.remove('active');
    btnSpecial.className = 'cbtn';

    player.ability.onDeactivate(enemies);
  }, player.ability.duration);
}

/* ── ATTACK ── */

function handleDir(dir) {
  if (!running || choosingAbility || isAttacking) return;
  isAttacking = true;
  // cooldown will be set at the end of the function based on hit/miss

  const hitDmg      = player.getHitDamage();
  const { w, h }    = getArenaSize();
  const cx          = w / 2;
  const cy          = h / 2;
  const arenaSize   = Math.min(w, h);
  const attackRange = player.getAttackRange(arenaSize);
  const isPiercing  = player.specialActive && player.ability.piercing;

  const dirs = player.doubleAttack && !isPiercing
    ? [dir, ...getAdjacentDirs(dir)]
    : [dir];

  let anyHit = false;

 for (const d of dirs) {

    /* ── PARRY BULLETS ──
       Destroy any bullet coming from direction d
       within attack range. Each directional strike
       can intercept incoming bullets. */
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      const b = bullets[bi];
      if (!b.owner || b.owner.dir !== d) continue;

      const bdx   = b.x - cx;
      const bdy   = b.y - cy;
      const bdist = Math.sqrt(bdx * bdx + bdy * bdy);
      if (bdist > attackRange) continue;

      // hit!
      anyHit = true;
      SFX.hit();
      spawnParticles(b.x, b.y, '#378ADD', false);
      b.el.remove();
      if (b.owner) b.owner.hasBullet = false;
      bullets.splice(bi, 1);
    }

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
          spawnParticles(e.x, e.y, player.color, e.isElite);
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
          spawnParticles(best.x, best.y, player.color, best.isElite);
          best.el.remove();
          enemies.splice(enemies.indexOf(best), 1);
          registerKill(best);
        }
      }
    }
  }

  if (!anyHit) SFX.miss();

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