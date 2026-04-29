/* ═══════════════════════════════════════
   UPGRADECHOICE.JS
   Upgrade choice screen at waves 3, 6, 9.
   Player picks by attacking in a direction.

   Pool: 12 upgrades, each with random
   variants (different % values).
   All upgrades are pure buffs — no costs.

   Used by: adventureDirector.js, combat.js
   Depends on: dom.js, state.js, Player.js
   ═══════════════════════════════════════ */

/* ── UPGRADE DEFINITIONS ──────────────
   Each upgrade has:
   - id:       unique base id (used once per map)
   - icon:     emoji displayed in the card
   - name:     display name
   - variants: array of { desc, apply(player) }
               one variant is picked at random
   ───────────────────────────────────── */

const UPGRADE_POOL = [

  { id: 'vitality', icon: '❤️', name: 'Vitality',
    variants: [
      { desc: '+20% max HP',  apply(p) { const bonus = Math.round(p.maxHp * 0.20); p.maxHp += bonus; p.hp += bonus; updateHpBar(); } },
      { desc: '+10% max HP',  apply(p) { const bonus = Math.round(p.maxHp * 0.10); p.maxHp += bonus; p.hp += bonus; updateHpBar(); } },
      { desc: '+5% max HP',   apply(p) { const bonus = Math.round(p.maxHp * 0.05); p.maxHp += bonus; p.hp += bonus; updateHpBar(); } },
    ],
  },

  { id: 'iron_skin', icon: '🛡️', name: 'Iron Skin',
    variants: [
      { desc: '-20% damage taken', apply(p) { p._defenseMult = (p._defenseMult || 1) * 0.80; } },
      { desc: '-10% damage taken', apply(p) { p._defenseMult = (p._defenseMult || 1) * 0.90; } },
      { desc: '-5% damage taken',  apply(p) { p._defenseMult = (p._defenseMult || 1) * 0.95; } },
    ],
  },

  { id: 'long_reach', icon: '📡', name: 'Long Reach',
    variants: [
      { desc: '+5% range',  apply(p) { p.attackRangePct *= 1.05; updateRangeCircle(); } },
      { desc: '+3% range',  apply(p) { p.attackRangePct *= 1.03; updateRangeCircle(); } },
      { desc: '+2% range',  apply(p) { p.attackRangePct *= 1.02; updateRangeCircle(); } },
    ],
  },

  { id: 'sharp_blade', icon: '🗡️', name: 'Sharp Blade',
    variants: [
      { desc: '+20% attack',  apply(p) { p.damageMult *= 1.20; } },
      { desc: '+10% attack',  apply(p) { p.damageMult *= 1.10; } },
      { desc: '+5% attack',   apply(p) { p.damageMult *= 1.05; } },
    ],
  },

  { id: 'extra_slot', icon: '⚡', name: 'Extra Slot',
    variants: [
      { desc: '+1 ability slot', apply(p) { p._maxSlots = Math.min(3, (p._maxSlots || 1) + 1); } },
    ],
  },

  { id: 'ability_boost', icon: '⏱️', name: 'Ability Boost',
    variants: [
      { desc: '+30% ability duration', apply(p) { p._abilityDurationMult = (p._abilityDurationMult || 1) * 1.30; } },
      { desc: '+20% ability duration', apply(p) { p._abilityDurationMult = (p._abilityDurationMult || 1) * 1.20; } },
      { desc: '+10% ability duration', apply(p) { p._abilityDurationMult = (p._abilityDurationMult || 1) * 1.10; } },
    ],
  },

  { id: 'vampiric', icon: '🩸', name: 'Vampiric',
    variants: [
      { desc: 'heal 2% HP every 5 kills', apply(p) { p._vampKillInterval = 5; p._vampHealPct = 0.02; p._vampKillCount = 0; } },
      { desc: 'heal 1% HP every 3 kills',  apply(p) { p._vampKillInterval = 3; p._vampHealPct = 0.01; p._vampKillCount = 0; } },
    ],
  },

  { id: 'frost_touch', icon: '❄️', name: 'Frost Touch',
    variants: [
      { desc: '20% chance to freeze',  apply(p) { p._frostChance = Math.min(1, (p._frostChance || 0) + 0.20); } },
      { desc: '15% chance to freeze',  apply(p) { p._frostChance = Math.min(1, (p._frostChance || 0) + 0.15); } },
      { desc: '10% chance to freeze',  apply(p) { p._frostChance = Math.min(1, (p._frostChance || 0) + 0.10); } },
    ],
  },

  { id: 'critical_hit', icon: '💥', name: 'Critical Hit',
    variants: [
      { desc: '20% chance for 2x damage', apply(p) { p._critChance = Math.min(1, (p._critChance || 0) + 0.20); } },
      { desc: '15% chance for 2x damage', apply(p) { p._critChance = Math.min(1, (p._critChance || 0) + 0.15); } },
      { desc: '10% chance for 2x damage', apply(p) { p._critChance = Math.min(1, (p._critChance || 0) + 0.10); } },
    ],
  },

  { id: 'berserker', icon: '🔥', name: 'Berserker',
    variants: [
      { desc: 'below 30% HP: +40% attack', apply(p) { p._berserkerThreshold = 0.30; p._berserkerAtkBonus = 0.40; } },
      { desc: 'below 40% HP: +25% defense', apply(p) { p._berserkerThreshold = 0.40; p._berserkerDefBonus = 0.25; } },
    ],
  },

  { id: 'lucky_shield', icon: '🍀', name: 'Lucky Shield',
    variants: [
      { desc: '20% chance to block a hit', apply(p) { p._luckyBlockChance = Math.min(1, (p._luckyBlockChance || 0) + 0.20); } },
      { desc: '15% chance to block a hit', apply(p) { p._luckyBlockChance = Math.min(1, (p._luckyBlockChance || 0) + 0.15); } },
      { desc: '10% chance to block a hit', apply(p) { p._luckyBlockChance = Math.min(1, (p._luckyBlockChance || 0) + 0.10); } },
    ],
  },

  { id: 'orb_hunter', icon: '🔮', name: 'Orb Hunter',
    variants: [
      { desc: '+50% orb chance', apply(p) { p._orbChanceMult = (p._orbChanceMult || 1) * 1.50; } },
      { desc: '+30% orb chance', apply(p) { p._orbChanceMult = (p._orbChanceMult || 1) * 1.30; } },
    ],
  },

];


/* ── STATE ─────────────────────────── */

let _choosingUpgrade = false;
let _currentChoices  = [null, null, null, null];
let _usedUpgrades    = [];
let _countdownActive = false;
let _inputBlocked    = false;

function isChoosingUpgrade() {
  return _choosingUpgrade;
}


/* ── START CHOICE SCREEN ───────────── */

function startUpgradeChoice() {
  _choosingUpgrade = true;

  // pick 4 random upgrades not yet used (by base id)
  const available = UPGRADE_POOL.filter(u => !_usedUpgrades.includes(u.id));
  const shuffled  = available.sort(() => Math.random() - 0.5);
  const picks     = shuffled.slice(0, 4);

  // fallback: if less than 4 available, fill with random from full pool
  while (picks.length < 4) {
    picks.push(UPGRADE_POOL[Math.floor(Math.random() * UPGRADE_POOL.length)]);
  }

  // for each pick, select a random variant
  const resolved = picks.map(u => {
    const v = u.variants[Math.floor(Math.random() * u.variants.length)];
    return { id: u.id, icon: u.icon, name: u.name, desc: v.desc, apply: v.apply };
  });

  const dirs     = ['up', 'down', 'left', 'right'];
  const keyHints = { up: '↑', down: '↓', left: '←', right: '→' };

  for (let i = 0; i < 4; i++) {
    _currentChoices[i] = resolved[i];
    const el = document.getElementById('upgrade-' + dirs[i]);

    el.innerHTML =
      '<div class="upgrade-card">' +
        '<div class="upgrade-card-icon">' + resolved[i].icon + '</div>' +
        '<div class="upgrade-card-name">' + resolved[i].name + '</div>' +
        '<div class="upgrade-card-desc">' + resolved[i].desc + '</div>' +
        '<div class="upgrade-card-key">' + keyHints[dirs[i]] + '</div>' +
      '</div>';

    // stagger entrance animation
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

  // arrow hint at bottom
 let hintEl = document.getElementById('upgrade-arrow-hint');
  if (!hintEl) {
    hintEl = document.createElement('div');
    hintEl.id = 'upgrade-arrow-hint';
    hintEl.textContent = 'use arrow keys';
    overlay.appendChild(hintEl);
  }

  // block input for 1.5s so player can read the options
  _inputBlocked = true;
  hintEl.style.visibility = 'hidden';
  setTimeout(() => {
    _inputBlocked = false;
    hintEl.style.visibility = 'visible';
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
  _usedUpgrades.push(choice.id);

  SFX.abilityPick();

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
  if (hintEl) hintEl.style.opacity = '0';

  // start countdown
  _countdownActive = true;
  _choosingUpgrade = false;

  _showCountdown(3, () => {
    // hide overlay
    document.getElementById('upgrade-choice').classList.remove('active');
    const titleEl = document.getElementById('upgrade-title');
    if (titleEl) titleEl.style.animation = '';

    // reset styles
    for (let i = 0; i < 4; i++) {
      const el = document.getElementById('upgrade-' + dirs[i]);
      el.classList.remove('upgrade-chosen', 'upgrade-faded');
      el.style.opacity        = '';
      el.style.animationDelay = '';
    }

    if (hintEl) hintEl.style.opacity = '';
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
      countEl.style.display = 'none';
      callback();
      return;
    }
    countEl.style.display = 'block';
    countEl.textContent   = count;
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
  _usedUpgrades    = [];
  _currentChoices  = [null, null, null, null];
  _choosingUpgrade = false;
  _countdownActive = false;
  _inputBlocked    = false;
  document.getElementById('upgrade-choice').classList.remove('active');
}