/* ═══════════════════════════════════════
   UPGRADECHOICE.JS
   Upgrade choice screen at waves 3, 6, 9.
   Player picks by attacking in a direction.

   TIER CHAIN SYSTEM:
   - 13 base upgrades, each with tiers I→II→III
     (Extra Slot has only I→II)
   - Picking tier I unlocks tier II in the pool
   - Picking tier II unlocks tier III
   - Total: 36 unique upgrades

   Used by: adventureDirector.js, combat.js
   Depends on: dom.js, state.js, Player.js
   ═══════════════════════════════════════ */

/* ── UPGRADE CHAINS ───────────────────
   Each chain has:
   - id:    base id (e.g. 'critical_hit')
   - icon:  emoji displayed in card
   - tiers: array of { name, desc, apply(p) }
            index 0 = tier I, 1 = II, 2 = III
   ───────────────────────────────────── */

const UPGRADE_CHAINS = [

  { id: 'vitality', icon: '❤️', tiers: [
    { name: 'Vitality I',   desc: '+10% max HP',
      apply(p) { const b = Math.round(p.maxHp * 0.10); p.maxHp += b; p.hp += b; updateHpBar(); } },
    { name: 'Vitality II',  desc: '+20% max HP',
      apply(p) { const b = Math.round(p.maxHp * 0.20); p.maxHp += b; p.hp += b; updateHpBar(); } },
    { name: 'Vitality III', desc: '+30% max HP',
      apply(p) { const b = Math.round(p.maxHp * 0.30); p.maxHp += b; p.hp += b; updateHpBar(); } },
  ]},

  { id: 'iron_skin', icon: '🛡️', tiers: [
    { name: 'Iron Skin I',   desc: 'take 10% less damage',
      apply(p) { p._defenseMult = (p._defenseMult || 1) * 0.90; } },
    { name: 'Iron Skin II',  desc: 'take 20% less damage',
      apply(p) { p._defenseMult = (p._defenseMult || 1) * 0.80; } },
    { name: 'Iron Skin III', desc: 'take 30% less damage',
      apply(p) { p._defenseMult = (p._defenseMult || 1) * 0.70; } },
  ]},

  { id: 'long_reach', icon: '📡', tiers: [
    { name: 'Long Reach I',   desc: 'hit enemies further away',
      apply(p) { p.attackRangePct *= 1.03; updateRangeCircle(); } },
    { name: 'Long Reach II',  desc: 'hit enemies even further',
      apply(p) { p.attackRangePct *= 1.05; updateRangeCircle(); } },
    { name: 'Long Reach III', desc: 'hit enemies much further',
      apply(p) { p.attackRangePct *= 1.08; updateRangeCircle(); } },
  ]},

  { id: 'sharp_blade', icon: '🗡️', tiers: [
    { name: 'Sharp Blade I',   desc: 'deal 10% more damage',
      apply(p) { p.damageMult *= 1.10; } },
    { name: 'Sharp Blade II',  desc: 'deal 20% more damage',
      apply(p) { p.damageMult *= 1.20; } },
    { name: 'Sharp Blade III', desc: 'deal 30% more damage',
      apply(p) { p.damageMult *= 1.30; } },
  ]},

  { id: 'critical_hit', icon: '💥', tiers: [
    { name: 'Critical Hit I',   desc: '15% chance to deal double damage',
      apply(p) { p._critChance = 0.15; } },
    { name: 'Critical Hit II',  desc: '30% chance to deal double damage',
      apply(p) { p._critChance = 0.30; } },
    { name: 'Critical Hit III', desc: '45% chance to deal double damage',
      apply(p) { p._critChance = 0.45; } },
  ]},

  { id: 'frost_touch', icon: '❄️', tiers: [
    { name: 'Frost Touch I',   desc: '15% chance to freeze enemy',
      apply(p) { p._frostChance = 0.15; } },
    { name: 'Frost Touch II',  desc: '30% chance to freeze enemy',
      apply(p) { p._frostChance = 0.30; } },
    { name: 'Frost Touch III', desc: '45% chance to freeze enemy',
      apply(p) { p._frostChance = 0.45; } },
  ]},

  { id: 'lucky_shield', icon: '🍀', tiers: [
    { name: 'Lucky Shield I',   desc: '15% chance to dodge a hit',
      apply(p) { p._luckyBlockChance = 0.15; } },
    { name: 'Lucky Shield II',  desc: '30% chance to dodge a hit',
      apply(p) { p._luckyBlockChance = 0.30; } },
    { name: 'Lucky Shield III', desc: '40% chance to dodge a hit',
      apply(p) { p._luckyBlockChance = 0.40; } },
  ]},

  { id: 'vampiric', icon: '🩸', tiers: [
    { name: 'Vampiric I',   desc: 'heal on every 5 kills',
      apply(p) { p._vampKillInterval = 5; p._vampHealPct = 0.02; p._vampKillCount = 0; } },
    { name: 'Vampiric II',  desc: 'heal on every 4 kills',
      apply(p) { p._vampKillInterval = 4; p._vampHealPct = 0.03; p._vampKillCount = 0; } },
    { name: 'Vampiric III', desc: 'heal on every 3 kills',
      apply(p) { p._vampKillInterval = 3; p._vampHealPct = 0.04; p._vampKillCount = 0; } },
  ]},

  { id: 'ability_boost', icon: '⏱️', tiers: [
    { name: 'Ability Boost I',   desc: 'special lasts 20% longer',
      apply(p) { p._abilityDurationMult = 1.20; } },
    { name: 'Ability Boost II',  desc: 'special lasts 40% longer',
      apply(p) { p._abilityDurationMult = 1.40; } },
    { name: 'Ability Boost III', desc: 'special lasts 60% longer',
      apply(p) { p._abilityDurationMult = 1.60; } },
  ]},

  { id: 'orb_hunter', icon: '🔮', tiers: [
    { name: 'Orb Hunter I',   desc: 'orbs appear 10% more often',
      apply(p) { p._orbChanceBonus = 0.10; } },
    { name: 'Orb Hunter II',  desc: 'orbs appear 20% more often',
      apply(p) { p._orbChanceBonus = 0.20; } },
    { name: 'Orb Hunter III', desc: 'orbs appear 30% more often',
      apply(p) { p._orbChanceBonus = 0.30; } },
  ]},

  { id: 'berserker_atk', icon: '🔥', tiers: [
    { name: 'Berserker ATK I',   desc: 'low HP: +30% damage',
      apply(p) { p._berserkerAtkThreshold = 0.30; p._berserkerAtkBonus = 0.30; } },
    { name: 'Berserker ATK II',  desc: 'low HP: +50% damage',
      apply(p) { p._berserkerAtkThreshold = 0.30; p._berserkerAtkBonus = 0.50; } },
    { name: 'Berserker ATK III', desc: 'low HP: +75% damage',
      apply(p) { p._berserkerAtkThreshold = 0.30; p._berserkerAtkBonus = 0.75; } },
  ]},

  { id: 'berserker_def', icon: '🔥', tiers: [
    { name: 'Berserker DEF I',   desc: 'low HP: take 20% less damage',
      apply(p) { p._berserkerDefThreshold = 0.30; p._berserkerDefBonus = 0.20; } },
    { name: 'Berserker DEF II',  desc: 'low HP: take 35% less damage',
      apply(p) { p._berserkerDefThreshold = 0.30; p._berserkerDefBonus = 0.35; } },
    { name: 'Berserker DEF III', desc: 'low HP: take 50% less damage',
      apply(p) { p._berserkerDefThreshold = 0.30; p._berserkerDefBonus = 0.50; } },
  ]},

  { id: 'extra_slot', icon: '⚡', tiers: [
    { name: 'Extra Slot I',  desc: '+1 special charge',
      apply(p) { p._maxSpecialSlots = 2; } },
    { name: 'Extra Slot II', desc: '+1 special charge',
      apply(p) { p._maxSpecialSlots = 3; } },
  ]},

];


/* ── STATE ─────────────────────────── */

let _choosingUpgrade = false;
let _currentChoices  = [null, null, null, null];
let _pickedTiers     = {};   // { chainId: tierIndex } — tracks highest tier picked
let _countdownActive = false;
let _inputBlocked    = false;

function isChoosingUpgrade() {
  return _choosingUpgrade;
}


/* ── BUILD AVAILABLE POOL ──────────── */

function _buildAvailablePool() {
  const available = [];

  for (const chain of UPGRADE_CHAINS) {
    const pickedTier = _pickedTiers[chain.id]; // undefined, 0, 1, or 2

    if (pickedTier === undefined) {
      // never picked this chain — offer tier I (index 0)
      available.push({ chain, tierIndex: 0 });
    } else {
      // picked some tier — offer the next one if it exists
      const nextTier = pickedTier + 1;
      if (nextTier < chain.tiers.length) {
        available.push({ chain, tierIndex: nextTier });
      }
      // if already at max tier, this chain is done — skip
    }
  }

  return available;
}


/* ── START CHOICE SCREEN ───────────── */

function startUpgradeChoice() {
  _choosingUpgrade = true;

  // hide wave timer during upgrade choice
  if (_timerEl) _timerEl.style.display = 'none';

  // cancel any active ability and orb buffs
  if (typeof cleanupAbilityEffects === 'function') cleanupAbilityEffects();
  if (typeof OrbSystem !== 'undefined') {
    OrbSystem.reset();
  }

  // build pool of available upgrades
  const pool = _buildAvailablePool();

  // shuffle and pick 4
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const picks    = shuffled.slice(0, 4);

  // fallback: if less than 4 available, fill with random from pool
  while (picks.length < 4 && pool.length > 0) {
    picks.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  // resolve each pick into a display object
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

  for (let i = 0; i < 4; i++) {
    _currentChoices[i] = resolved[i] || null;
    const el = document.getElementById('upgrade-' + dirs[i]);

    if (!resolved[i]) {
      el.innerHTML = '';
      continue;
    }

    const r = resolved[i];
    // tier badge color: I = white, II = yellow, III = orange
    const tierNum    = r.tierIndex + 1;
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

  // show overlay
  const overlay = document.getElementById('upgrade-choice');
  overlay.classList.add('active');

  // title
  let titleEl = document.getElementById('upgrade-title');
  if (!titleEl) {
    titleEl = document.createElement('div');
    titleEl.id = 'upgrade-title';
    overlay.appendChild(titleEl);
  }
  const waveNum = AdventureDirector.getWave();
  titleEl.innerHTML =
    '<div class="upgrade-title-wave">WAVE ' + waveNum + ' COMPLETE</div>' +
    '<div class="upgrade-title-sub">CHOOSE YOUR UPGRADE</div>';
  titleEl.style.opacity   = '0';
  titleEl.style.animation = 'upgradeTitleIn 0.6s ease-out forwards';

  // arrow hint — under player (in arena, not overlay)
  let hintEl = document.getElementById('upgrade-arrow-hint');
  if (!hintEl) {
    hintEl = document.createElement('div');
    hintEl.id = 'upgrade-arrow-hint';
    arena.appendChild(hintEl);
  }
  hintEl.innerHTML =
    '<img src="assets/ui/keyboard_arrows.png" alt="" class="upgrade-hint-img" />' +
    '<div class="upgrade-hint-text">use arrows to select</div>';

  // block input for 1.5s so player can read
  _inputBlocked = true;
  hintEl.style.opacity = '0';
  hintEl.style.animation = 'none';
  setTimeout(() => {
    _inputBlocked = false;
    const h = document.getElementById('upgrade-arrow-hint');
    if (h) {
      h.style.opacity = '';
      h.style.animation = '';
    }
  }, 1500);
}


/* ── SELECT UPGRADE ────────────────── */

function selectUpgrade(dir) {
  if (!_choosingUpgrade || _countdownActive || _inputBlocked) return false;

  const dirIndex = { up: 0, down: 1, left: 2, right: 3 };
  const choice   = _currentChoices[dirIndex[dir]];
  if (!choice) return false;

  // apply upgrade to player
  choice.apply(player);

  // track picked tier for chain progression
  _pickedTiers[choice.chainId] = choice.tierIndex;

  SFX.cardPick();

  // highlight chosen, fade others
  const dirs = ['up', 'down', 'left', 'right'];
  for (let i = 0; i < 4; i++) {
    const el = document.getElementById('upgrade-' + dirs[i]);
    if (dirs[i] === dir) {
      el.classList.add('upgrade-chosen');
    } else {
      el.classList.add('upgrade-faded');
    }
  }

  // hide arrow hint
  const hintEl = document.getElementById('upgrade-arrow-hint');
  if (hintEl) hintEl.remove();

  // start countdown
  _countdownActive = true;
  _choosingUpgrade = false;

  _showCountdown(3, () => {
    document.getElementById('upgrade-choice').classList.remove('active');
    const titleEl = document.getElementById('upgrade-title');
    if (titleEl) titleEl.style.animation = '';

    for (let i = 0; i < 4; i++) {
      const el = document.getElementById('upgrade-' + dirs[i]);
      el.classList.remove('upgrade-chosen', 'upgrade-faded');
      el.style.opacity        = '';
      el.style.animationDelay = '';
    }

    // hintEl already removed
    _countdownActive = false;
    AdventureDirector.resumeAfterChoice();
  });

  return true;
}


/* ── COUNTDOWN ─────────────────────── */

function _showCountdown(from, callback) {
  let countEl = document.getElementById('countdown-display');
  if (!countEl) {
    countEl = document.createElement('div');
    countEl.id = 'countdown-display';
    arena.appendChild(countEl);
  }

  let count = from;
  const delayMs = 800;

  function showNext() {
   if (count <= 0) {
      SFX.countdownGo();
      countEl.style.display = 'none';
      // restore wave timer
      if (_timerEl) _timerEl.style.display = 'block';
      callback();
      return;
    }
    countEl.style.display = 'block';
    countEl.textContent   = count;
    if (count > 0) SFX.countdown();
    countEl.style.animation = 'none';
    void countEl.offsetWidth;
    countEl.style.animation = 'countdownPop ' + delayMs + 'ms ease-out forwards';
    count--;
    setTimeout(showNext, delayMs);
  }
  showNext();
}


/* ── RESET ─────────────────────────── */

function resetUpgradeChoices() {
  _pickedTiers     = {};
  _currentChoices  = [null, null, null, null];
  _choosingUpgrade = false;
  _countdownActive = false;
  _inputBlocked    = false;
  document.getElementById('upgrade-choice').classList.remove('active');
}