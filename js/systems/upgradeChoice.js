/* ═══════════════════════════════════════
   UPGRADECHOICE.JS
   Upgrade choice screen at waves 3, 6, 9.
   Player picks by attacking in a direction.
   Animated entrance + 3-2-1 countdown
   before next wave starts.

   Used by: adventureDirector.js, combat.js
   Depends on: dom.js, state.js
   ═══════════════════════════════════════ */

const UPGRADE_POOL = [
  { id: 'fury',      icon: '🔥', name: 'Fury',      desc: 'attack 20% faster',       cost: 'take 15% more damage',  apply(p) { CONFIG.attack.hitCooldownMs *= 0.8; CONFIG.attack.missCooldownMs *= 0.8; p._furyDmgMult = (p._furyDmgMult || 1) + 0.15; } },
  { id: 'magnetism', icon: '🧲', name: 'Magnetism',  desc: 'range +15%',              cost: 'enemies 10% faster',    apply(p) { p.attackRangePct *= 1.15; CONFIG.base.enemyBaseSpeed *= 1.10; updateRangeCircle(); } },
  { id: 'patience',  icon: '❄️', name: 'Patience',   desc: 'combo lasts 2s longer',   cost: 'attack 10% slower',     apply(p) { p.comboDecayBonus += 2000; CONFIG.attack.hitCooldownMs *= 1.1; CONFIG.attack.missCooldownMs *= 1.1; } },
  { id: 'risk',      icon: '💀', name: 'Risk',       desc: 'points x2',               cost: '-10% max HP',           apply(p) { p._pointsMult = (p._pointsMult || 1) * 2; p.maxHp = Math.round(p.maxHp * 0.9); p.hp = Math.min(p.hp, p.maxHp); updateHpBar(); } },
  { id: 'surge',     icon: '⚡', name: 'Surge',      desc: 'special charges 25% faster', cost: 'lasts 1s less',      apply(p) { p.specialChargeMult *= 1.25; } },
  { id: 'flow',      icon: '🌀', name: 'Flow',       desc: 'no miss cooldown',        cost: 'combo decays 1s faster', apply(p) { CONFIG.attack.missCooldownMs = 10; p.comboDecayBonus -= 1000; } },
  { id: 'endurance', icon: '🛡️', name: 'Endurance',  desc: '+20% max HP',             cost: 'range -10%',            apply(p) { p.maxHp = Math.round(p.maxHp * 1.2); p.hp += Math.round(PLAYER_STATS.maxHp * 0.2); updateHpBar(); p.attackRangePct *= 0.9; updateRangeCircle(); } },
  { id: 'precision', icon: '🎯', name: 'Precision',  desc: 'damage +30%',             cost: 'range -15%',            apply(p) { p.damageMult *= 1.3; p.attackRangePct *= 0.85; updateRangeCircle(); } },
  { id: 'greed',     icon: '💎', name: 'Greed',      desc: 'points +50%',             cost: 'take 10% more damage',  apply(p) { p._pointsMult = (p._pointsMult || 1) * 1.5; p._greedDmgMult = (p._greedDmgMult || 1) + 0.10; } },
  { id: 'regen',     icon: '🌿', name: 'Regen',      desc: 'heal 2 HP per second',    cost: 'damage -10%',           apply(p) { p._regenRate = (p._regenRate || 0) + 2; p.damageMult *= 0.9; } },
  { id: 'momentum',  icon: '⏱️', name: 'Momentum',   desc: 'enemies slow 5% per 5 kills', cost: 'resets each wave', apply(p) { p._momentumActive = true; } },
  { id: 'vampiric',  icon: '🩸', name: 'Vampiric',   desc: 'heal 1 HP per kill',      cost: 'damage -15%',           apply(p) { p._vampiric = true; p.damageMult *= 0.85; } },
];

let _choosingUpgrade = false;
let _currentChoices = [null, null, null, null]; // up, down, left, right
let _usedUpgrades = [];
let _countdownActive = false;

function isChoosingUpgrade() {
  return _choosingUpgrade;
}

function startUpgradeChoice() {
  _choosingUpgrade = true;

  // pick 4 random upgrades not yet used
  const available = UPGRADE_POOL.filter(u => !_usedUpgrades.includes(u.id));
  const shuffled = available.sort(() => Math.random() - 0.5);
  const picks = shuffled.slice(0, 4);
  while (picks.length < 4) picks.push(UPGRADE_POOL[Math.floor(Math.random() * UPGRADE_POOL.length)]);

  const dirs = ['up', 'down', 'left', 'right'];
  const keyHints = { up: '↑', down: '↓', left: '←', right: '→' };

  for (let i = 0; i < 4; i++) {
    _currentChoices[i] = picks[i];
    const el = document.getElementById('upgrade-' + dirs[i]);
    el.innerHTML =
      '<div class="upgrade-option-icon">' + picks[i].icon + '</div>' +
      '<div class="upgrade-option-name">' + picks[i].name + '</div>' +
      '<div class="upgrade-option-desc">' + picks[i].desc + '</div>' +
      '<div class="upgrade-option-cost">' + picks[i].cost + '</div>' +
      '<div class="key-hint">' + keyHints[dirs[i]] + '</div>';
    el.style.animationDelay = (i * 100) + 'ms';
  }

  // show overlay with title
  const overlay = document.getElementById('upgrade-choice');
  overlay.classList.add('active');

  // show wave complete + choose title
  let titleEl = document.getElementById('upgrade-title');
  if (!titleEl) {
    titleEl = document.createElement('div');
    titleEl.id = 'upgrade-title';
    titleEl.style.cssText =
      'position:absolute;top:12%;left:50%;transform:translateX(-50%);' +
      'text-align:center;z-index:60;pointer-events:none;' +
      'font-family:"Press Start 2P",monospace;';
    overlay.appendChild(titleEl);
  }
  const waveNum = AdventureDirector.getWave();
  titleEl.innerHTML =
    '<div style="font-size:16px;color:#44ff66;margin-bottom:8px;' +
    'text-shadow:2px 2px 0 #000;">WAVE ' + waveNum + ' COMPLETE</div>' +
    '<div style="font-size:10px;color:#ffffff;' +
    'text-shadow:1px 1px 0 #000;">CHOOSE YOUR UPGRADE</div>';
  titleEl.style.opacity = '0';
  titleEl.style.animation = 'upgradeTitleIn 0.5s ease-out forwards';
}

function selectUpgrade(dir) {
  if (!_choosingUpgrade || _countdownActive) return false;

  const dirIndex = { up: 0, down: 1, left: 2, right: 3 };
  const choice = _currentChoices[dirIndex[dir]];
  if (!choice) return false;

  // apply upgrade
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
      el.style.opacity = '0.2';
    }
  }

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
      el.classList.remove('upgrade-chosen');
      el.style.opacity = '';
      el.style.animationDelay = '';
    }

    _countdownActive = false;
    AdventureDirector.resumeAfterChoice();
  });

  return true;
}

function _showCountdown(from, callback) {
  let countEl = document.getElementById('countdown-display');
  if (!countEl) {
    countEl = document.createElement('div');
    countEl.id = 'countdown-display';
    countEl.style.cssText =
      'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);' +
      'font-family:"Press Start 2P",monospace;font-size:32px;color:#ffffff;' +
      'text-shadow:3px 3px 0 #000;z-index:70;pointer-events:none;';
    arena.appendChild(countEl);
  }

  let count = from;
  const delayMs = 280; // fast countdown, not real seconds

  function showNext() {
    if (count <= 0) {
      countEl.style.display = 'none';
      callback();
      return;
    }
    countEl.style.display = 'block';
    countEl.textContent = count;
    countEl.style.animation = 'none';
    void countEl.offsetWidth;
    countEl.style.animation = 'countdownPop ' + delayMs + 'ms ease-out forwards';
    count--;
    setTimeout(showNext, delayMs);
  }
  showNext();
}

function resetUpgradeChoices() {
  _usedUpgrades = [];
  _currentChoices = [null, null, null, null];
  _choosingUpgrade = false;
  _countdownActive = false;
  document.getElementById('upgrade-choice').classList.remove('active');
}