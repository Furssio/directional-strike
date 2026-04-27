/* ═══════════════════════════════════════
   UPGRADECHOICE.JS
   Handles the upgrade choice screen at
   waves 3, 6, 9. Player picks by attacking
   in a direction.

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

function isChoosingUpgrade() {
  return _choosingUpgrade;
}

function startUpgradeChoice() {
  _choosingUpgrade = true;

  // pick 4 random upgrades not yet used
  const available = UPGRADE_POOL.filter(u => !_usedUpgrades.includes(u.id));
  const shuffled = available.sort(() => Math.random() - 0.5);
  const picks = shuffled.slice(0, 4);

  // pad if less than 4 available (shouldn't happen with 12 pool and 3 choices)
  while (picks.length < 4) picks.push(UPGRADE_POOL[Math.floor(Math.random() * UPGRADE_POOL.length)]);

  const dirs = ['up', 'down', 'left', 'right'];
  const arrows = { up: '↑', down: '↓', left: '←', right: '→' };

  for (let i = 0; i < 4; i++) {
    _currentChoices[i] = picks[i];
    const el = document.getElementById('upgrade-' + dirs[i]);
    el.innerHTML =
      '<div class="upgrade-option-icon">' + picks[i].icon + '</div>' +
      '<div class="upgrade-option-name">' + picks[i].name + '</div>' +
      '<div class="upgrade-option-desc">' + picks[i].desc + '</div>' +
      '<div class="upgrade-option-cost">' + picks[i].cost + '</div>' +
      '<div class="key-hint">' + arrows[dirs[i]] + '</div>';
  }

  document.getElementById('upgrade-choice').classList.add('active');
}

function selectUpgrade(dir) {
  if (!_choosingUpgrade) return false;

  const dirIndex = { up: 0, down: 1, left: 2, right: 3 };
  const choice = _currentChoices[dirIndex[dir]];
  if (!choice) return false;

  // apply upgrade
  choice.apply(player);
  _usedUpgrades.push(choice.id);

  // hide overlay
  document.getElementById('upgrade-choice').classList.remove('active');
  _choosingUpgrade = false;

  // resume game — advance to next wave
  AdventureDirector.resumeAfterChoice();

  SFX.abilityPick();
  return true;
}

function resetUpgradeChoices() {
  _usedUpgrades = [];
  _currentChoices = [null, null, null, null];
  _choosingUpgrade = false;
  document.getElementById('upgrade-choice').classList.remove('active');
}