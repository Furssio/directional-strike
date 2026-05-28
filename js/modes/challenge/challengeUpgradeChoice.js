/* ═══════════════════════════════════════
   CHALLENGEUPGRADECHOICE.JS
   Challenge Mode choice screen.
   Two types:
   - 'ability' = 4 random abilities, must pick one
   - 'stat'    = normal upgrade cards (reuses UPGRADE_CHAINS)

   Reuses the same #upgrade-choice overlay as adventure.
   Calls ChallengeDirector.resumeAfterChoice() on done.

   Used by: challengeDirector.js
   Depends on: upgradeChoice.js (UPGRADE_CHAINS, _pickedTiers),
               AbilityRegistry, dom.js, state.js, Player.js
   ═══════════════════════════════════════ */

let _challengeChoiceType   = null;   // 'ability' or 'stat'
let _challengeChoiceActive = false;
let _challengeAbilityPicks = [null, null, null, null];
let _challengeInputBlocked = false;
let _challengeCountdown    = false;
let _isFirstAbilityChoice  = false;

/* ── START CHALLENGE CHOICE ─────────── */

function startChallengeChoice(type) {
  _challengeChoiceType   = type;
  _challengeChoiceActive = true;
  _challengeCountdown    = false;

  // cleanup active ability + orbs
  if (typeof cleanupAbilityEffects === 'function') cleanupAbilityEffects();
  if (typeof OrbSystem !== 'undefined') OrbSystem.reset();

  if (type === 'ability') {
    _buildAbilityChoice();
  } else {
    _buildStatChoice();
  }
}

/* ── ABILITY CHOICE ─────────────────── */

function _buildAbilityChoice() {
  const allAbilities = AbilityRegistry.all();

  // exclude currently equipped ability so player always switches
  const currentId = player.ability ? player.ability.id : null;
  const available = allAbilities.filter(a => a.id !== currentId);

  const shuffled = available.sort(() => Math.random() - 0.5);
  const picks    = shuffled.slice(0, 4);

  // pad if less than 4 (only possible if fewer than 4 abilities exist)
  while (picks.length < 4 && available.length > 0) {
    picks.push(available[Math.floor(Math.random() * available.length)]);
  }

  const dirs     = ['up', 'down', 'left', 'right'];
  const keyHints = { up: '↑', down: '↓', left: '←', right: '→' };

  for (let i = 0; i < 4; i++) {
    _challengeAbilityPicks[i] = picks[i];
    const el = document.getElementById('upgrade-' + dirs[i]);

    const a = picks[i];
    const iconSrc = 'assets/abilities/' + a.id + '.png';

    el.innerHTML =
      '<div class="upgrade-card challenge-ability-card">' +
        '<div class="upgrade-card-icon"><img src="' + iconSrc + '" alt="' + a.id + '" style="width:48px;height:48px;image-rendering:pixelated;"></div>' +
        '<div class="upgrade-card-name" style="color:#51eefc">' + (a.name || a.id) + '</div>' +
        '<div class="upgrade-card-desc">' + (a.desc || '') + '</div>' +
        '<div class="upgrade-card-key">' + keyHints[dirs[i]] + '</div>' +
      '</div>';

    el.style.animationDelay = (i * 80) + 'ms';
  }

  _showChallengeOverlay();
}

/* ── STAT CHOICE (reuses UPGRADE_CHAINS) ── */

function _buildStatChoice() {
  // reuse adventure pool builder
  const pool = _buildAvailablePool();

  // if no upgrades left, skip directly to next wave
  if (pool.length === 0) {
    _challengeChoiceActive = false;
    _challengeChoiceType   = null;
    ChallengeDirector.resumeAfterChoice();
    return;
  }

  const shuffled = pool.sort(() => Math.random() - 0.5);
  const picks    = shuffled.slice(0, 4);

  while (picks.length < 4 && pool.length > 0) {
    picks.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  const resolved = picks.map(p => {
    const tier = p.chain.tiers[p.tierIndex];
    return {
      chainId:   p.chain.id,
      tierIndex: p.tierIndex,
      icon:      p.chain.icon,
      name:      tier.name,
      desc:      tier.desc,
      apply:     tier.apply,
    };
  });

  const dirs     = ['up', 'down', 'left', 'right'];
  const keyHints = { up: '↑', down: '↓', left: '←', right: '→' };

  // store in the same array used by adventure upgradeChoice
  for (let i = 0; i < 4; i++) {
    _currentChoices[i] = resolved[i] || null;
    const el = document.getElementById('upgrade-' + dirs[i]);

    if (!resolved[i]) {
      el.innerHTML = '';
      continue;
    }

    const r = resolved[i];
    const tierColors = ['#ffffff', '#ffdd44', '#ff8844'];
    const tierColor  = tierColors[r.tierIndex] || '#ffffff';

    el.innerHTML =
      '<div class="upgrade-card">' +
        '<div class="upgrade-card-icon">' + r.icon + '</div>' +
        '<div class="upgrade-card-name" style="color:' + tierColor + '">' + r.name + '</div>' +
        '<div class="upgrade-card-desc">' + r.desc + '</div>' +
        '<div class="upgrade-card-key">' + keyHints[dirs[i]] + '</div>' +
      '</div>';

    el.style.animationDelay = (i * 80) + 'ms';
  }

  _showChallengeOverlay();
}

/* ── SHOW OVERLAY ───────────────────── */

function _showChallengeOverlay() {
  const overlay = document.getElementById('upgrade-choice');
  overlay.classList.add('active');

  // title
  let titleEl = document.getElementById('upgrade-title');
  if (!titleEl) {
    titleEl = document.createElement('div');
    titleEl.id = 'upgrade-title';
    overlay.appendChild(titleEl);
  }

  const waveNum = ChallengeDirector.getWave();

  if (_challengeChoiceType === 'ability' && waveNum === 0) {
    // first ability choice — before wave 1
    titleEl.innerHTML =
      '<div class="upgrade-title-wave">CHALLENGE MODE</div>' +
      '<div class="upgrade-title-sub">CHOOSE YOUR ABILITY</div>';
  } else if (_challengeChoiceType === 'ability') {
    titleEl.innerHTML =
      '<div class="upgrade-title-wave">WAVE ' + waveNum + ' COMPLETE</div>' +
      '<div class="upgrade-title-sub">SWITCH ABILITY</div>';
  } else {
    titleEl.innerHTML =
      '<div class="upgrade-title-wave">WAVE ' + waveNum + ' COMPLETE</div>' +
      '<div class="upgrade-title-sub">CHOOSE YOUR UPGRADE</div>';
  }

  titleEl.style.opacity   = '0';
  titleEl.style.animation = 'upgradeTitleIn 0.6s ease-out forwards';

// arrow hint — always recreate in arena (same as adventure mode)
  let hintEl = document.getElementById('upgrade-arrow-hint');
  if (hintEl) hintEl.remove();
  hintEl = document.createElement('div');
  hintEl.id = 'upgrade-arrow-hint';
  hintEl.innerHTML =
    '<img src="assets/ui/keyboard_arrows.png" alt="" class="upgrade-hint-img" />' +
    '<div class="upgrade-hint-text">use arrows to select</div>';
  arena.appendChild(hintEl);

  // block input for 1.5s, hide hint until ready
  _challengeInputBlocked = true;
  hintEl.style.opacity = '0';
  hintEl.style.animation = 'none';
  setTimeout(() => {
    _challengeInputBlocked = false;
    const h = document.getElementById('upgrade-arrow-hint');
    if (h) {
      h.style.opacity = '';
      h.style.animation = '';
    }
  }, 1500);
}

/* ── SELECT (called from combat.js handleDir) ── */

function selectChallengeUpgrade(dir) {
  if (!_challengeChoiceActive || _challengeCountdown || _challengeInputBlocked) return false;

  const dirIndex = { up: 0, down: 1, left: 2, right: 3 };
  const idx      = dirIndex[dir];

  if (_challengeChoiceType === 'ability') {
    return _selectAbility(dir, idx);
  } else {
    return _selectStat(dir, idx);
  }
}

/* ── SELECT ABILITY ─────────────────── */

function _selectAbility(dir, idx) {
  const ability = _challengeAbilityPicks[idx];
  if (!ability) return false;

  // equip chosen ability
  player.ability = ability;
  equippedAbilityId = ability.id;

  SFX.cardPick();
  _highlightChosen(dir);

  _challengeCountdown    = true;
  _challengeChoiceActive = false;

  _showCountdown(3, () => {
    _cleanupOverlay();

    if (_isFirstAbilityChoice) {
      // first choice done — count it so next choice is 'stat'
      _isFirstAbilityChoice = false;
      ChallengeDirector.countChoice();
      ChallengeDirector.startFirstWave();
    } else {
      ChallengeDirector.resumeAfterChoice();
    }
  });

  return true;
}

/* ── SELECT STAT ────────────────────── */

function _selectStat(dir, idx) {
  const choice = _currentChoices[idx];
  if (!choice) return false;

  choice.apply(player);
  _pickedTiers[choice.chainId] = choice.tierIndex;

  SFX.cardPick();
  _highlightChosen(dir);

  _challengeCountdown    = true;
  _challengeChoiceActive = false;

  _showCountdown(3, () => {
    _cleanupOverlay();
    ChallengeDirector.resumeAfterChoice();
  });

  return true;
}

/* ── HIGHLIGHT + FADE ───────────────── */

function _highlightChosen(dir) {
  const dirs = ['up', 'down', 'left', 'right'];
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById('upgrade-' + dirs[i]);
    if (dirs[i] === dir) {
      el.classList.add('upgrade-chosen');
    } else {
      el.classList.add('upgrade-faded');
    }
  }
 const hintEl = document.getElementById('upgrade-arrow-hint');
if (hintEl) hintEl.remove();
}

/* ── CLEANUP OVERLAY ────────────────── */

function _cleanupOverlay() {
  document.getElementById('upgrade-choice').classList.remove('active');

  const titleEl = document.getElementById('upgrade-title');
  if (titleEl) titleEl.style.animation = '';

  const dirs = ['up', 'down', 'left', 'right'];
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById('upgrade-' + dirs[i]);
    el.classList.remove('upgrade-chosen', 'upgrade-faded');
    el.style.opacity        = '';
    el.style.animationDelay = '';
  }

  const hintEl = document.getElementById('upgrade-arrow-hint');
  if (hintEl) hintEl.style.opacity = '';

  _challengeCountdown = false;
}

/* ── RESET ──────────────────────────── */

function resetChallengeChoices() {
  _challengeChoiceType   = null;
  _challengeChoiceActive = false;
  _challengeAbilityPicks = [null, null, null, null];
  _challengeInputBlocked = false;
  _challengeCountdown    = false;
  _isFirstAbilityChoice  = false;
  document.getElementById('upgrade-choice').classList.remove('active');
  const hintEl = document.getElementById('upgrade-arrow-hint');
  if (hintEl) hintEl.remove();
}

/* ── QUERY (used by combat.js) ──────── */

function isChoosingChallengeUpgrade() {
  return _challengeChoiceActive;
}