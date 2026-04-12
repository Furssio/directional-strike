/* ═══════════════════════════════════════
   UI.JS
   Everything that touches the DOM.
   HUD updates, screens, ability choice
   overlay, character selection screen.

   Depends on: config.js, abilities.js,
               classes/Player.js, audio.js
   Used by: game.js

   RULE: this file contains no game logic.
   It reads state from player/CONFIG and
   updates the DOM accordingly.
   It never modifies player state except
   selectAbility() which applies the chosen
   ability effect and choosingAbility in game.js.

   GLOBAL VARIABLES USED (from game.js):
   - player          → current Player object
   - enemies         → current enemies array
   - choosingAbility → ability choice pause flag
   ═══════════════════════════════════════ */

/* ══════════════════════════════════════
   DOM REFS
   ══════════════════════════════════════ */
const sMenu    = document.getElementById('screen-menu');
const sChar    = document.getElementById('screen-char');
const sGame    = document.getElementById('screen-game');
const sOver    = document.getElementById('screen-over');
const sSoon    = document.getElementById('screen-story-soon');

const arena          = document.getElementById('arena');
const flashEl        = document.getElementById('flash');
const lvlPop         = document.getElementById('level-up-pop');
const shieldRing     = document.getElementById('shield-ring');
const specialRing    = document.getElementById('special-ring');
const rangeEl        = document.getElementById('attack-range');
const comboEl        = document.getElementById('combo-display');
const scoreEl        = document.getElementById('score-display');
const levelEl        = document.getElementById('level-display');
const playerEl       = document.getElementById('player');
const hpBar          = document.getElementById('player-hp-bar');
const progressBar    = document.getElementById('progress-bar');
const comboTimerWrap = document.getElementById('combo-timer-wrap');
const comboTimerBar  = document.getElementById('combo-timer-bar');
const specialBar     = document.getElementById('special-bar');
const specialWrap    = document.getElementById('special-wrap');
const specialLabel   = document.getElementById('special-label');
const finalScoreEl   = document.getElementById('final-score');
const finalLevelEl   = document.getElementById('final-level');
const bestLabel      = document.getElementById('best-label');
const menuBest       = document.getElementById('menu-best');
const btnShield      = document.getElementById('btn-shield');
const btnSpecial     = document.getElementById('btn-special');
const btnMute        = document.getElementById('btn-mute');
const abilityOverlay = document.getElementById('ability-overlay');
const abilityCardsEl = document.getElementById('ability-cards');
const abilityTitle   = document.getElementById('ability-title');

/* ══════════════════════════════════════
   SCREEN NAVIGATION
   ══════════════════════════════════════ */

function showScreen(s) {
  [sMenu, sChar, sGame, sOver, sSoon].forEach(x => x.style.display = 'none');
  s.style.display = 'block';
}

/* ══════════════════════════════════════
   LOCALSTORAGE — HIGH SCORE
   ══════════════════════════════════════ */

function getBestScore() {
  return parseInt(localStorage.getItem('ds_best') || '0');
}

function saveBestScore(score) {
  localStorage.setItem('ds_best', score);
}

function updateMenuBest() {
  const b = getBestScore();
  menuBest.textContent = b > 0 ? 'best: ' + b + ' pts' : '';
}

/* ══════════════════════════════════════
   HUD — PLAYER HP BAR
   ══════════════════════════════════════ */

function updateHpBar() {
  const pct = player.hpPercent();
  hpBar.style.width      = Math.round(pct * 100) + '%';
  hpBar.style.background = pct > CONFIG.player.hpBarGreenPct
    ? '#639922'
    : pct > CONFIG.player.hpBarYellowPct
      ? '#BA7517'
      : '#A32D2D';
}

/* ══════════════════════════════════════
   HUD — WAVE PROGRESS BAR
   ══════════════════════════════════════ */

function updateProgress() {
  const needed = Director.getKillsNeeded();
  const pct    = Math.min(Director.getKills() / needed, 1);
  progressBar.style.width = Math.round(pct * 100) + '%';
}

/* ══════════════════════════════════════
   HUD — WAVE DISPLAY
   ══════════════════════════════════════ */

function updateWaveDisplay(wave, isBoss) {
  levelEl.textContent = isBoss ? '⚠️ wave ' + wave + ' — BOSS' : 'wave ' + wave;

  lvlPop.textContent   = isBoss ? '⚠️ BOSS WAVE!' : 'wave ' + wave + '!';
  lvlPop.style.opacity = '1';
  setTimeout(() => lvlPop.style.opacity = '0', 1200);
}

/* ══════════════════════════════════════
   HUD — COMBO AND DECAY TIMER
   ══════════════════════════════════════ */

function updateComboDisplay() {
  const c = player.combo;

  if (c >= CONFIG.combo.minKills) {
    comboEl.textContent   = 'x' + player.getComboMult().toFixed(1) + ' (' + c + ' kills)';
    comboEl.style.opacity = '1';

    comboTimerWrap.style.opacity = '1';
    const maxDecay = CONFIG.combo.decayMs + player.comboDecayBonus;
    comboTimerBar.style.width = Math.max(0, player.comboTimer / maxDecay * 100) + '%';

  } else {
    comboEl.style.opacity        = '0';
    comboTimerWrap.style.opacity = '0';
  }
}

/* ══════════════════════════════════════
   HUD — SPECIAL BAR
   ══════════════════════════════════════ */

function updateSpecialBar() {
  const pct     = player.specialCharge;
  const ch      = player.charDef;
  const isReady = player.isSpecialReady();

  specialBar.style.width      = pct + '%';
  specialBar.style.background = ch.special.barColor;

  specialLabel.textContent = `${ch.special.icon} ${ch.special.name} ${Math.round(pct)}%`;

  specialWrap.style.setProperty('--special-color', ch.special.barColor);

  if (isReady && !player.specialActive) {
    specialWrap.classList.add('ready');
    btnSpecial.className    = 'cbtn ready';
    btnSpecial.textContent  = ch.special.icon;
    specialLabel.style.color = ch.special.barColor;

    if (!player._wasSpecialReady) {
      player._wasSpecialReady = true;
      SFX.specialReady();
    }

  } else if (!player.specialActive) {
    specialWrap.classList.remove('ready');
    btnSpecial.className    = 'cbtn';
    btnSpecial.textContent  = '⚡';
    specialLabel.style.color = '#888';
    player._wasSpecialReady  = false;
  }
}

/* ══════════════════════════════════════
   HUD — RANGE CIRCLE
   ══════════════════════════════════════ */

function updateRangeCircle() {
  const { w, h } = getArenaSize();
  const size  = Math.min(w, h);
  const range = player.getAttackRange(size);
  const d     = range * 2;

  rangeEl.style.width       = d + 'px';
  rangeEl.style.height      = d + 'px';
  rangeEl.style.borderColor = `rgba(${hexToRgb(player.charDef.color)}, 0.5)`;
  rangeEl.style.background  = `rgba(${hexToRgb(player.charDef.color)}, 0.05)`;
}

/* ══════════════════════════════════════
   SCORE POPUP
   ══════════════════════════════════════ */

function showScorePop(x, y, pts) {
  const pop = document.createElement('div');
  pop.className   = 'score-pop';
  pop.textContent = '+' + pts;
  pop.style.left  = x + 'px';
  pop.style.top   = (y - 10) + 'px';
  arena.appendChild(pop);
  setTimeout(() => pop.remove(), 750);
}

/* ══════════════════════════════════════
   CHARACTER SELECTION
   ══════════════════════════════════════ */

function buildCharScreen(selectedCharId) {
  const grid = document.getElementById('char-grid');
  grid.innerHTML = '';

  Object.values(CONFIG.characters).forEach(ch => {
    const card = document.createElement('div');
    card.className = 'char-card' + (ch.id === selectedCharId ? ' selected' : '');
    card.style.setProperty('--char-color', ch.color);

    const statRows = ['range', 'damage', 'hp'].map(s => `
      <div class="stat-row">
        <span class="stat-label">${s}</span>
        <div class="stat-bar-wrap">
          <div class="stat-bar-fill" style="width:${ch.stats[s] * 20}%;background:${ch.color}"></div>
        </div>
      </div>`).join('');

    card.innerHTML = `
      <div class="char-emoji">${ch.emoji}</div>
      <div class="char-name">${ch.name}</div>
      <div class="char-desc">${ch.desc}</div>
      <div class="char-stats">${statRows}</div>
      <div class="char-ability">${ch.special.icon} ${ch.special.name}<br>${ch.special.desc}</div>
    `;

    card.addEventListener('click', () => {
      onCharSelected(ch.id);
      document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });

    grid.appendChild(card);
  });
}

/* ══════════════════════════════════════
   ABILITY CHOICE OVERLAY
   ══════════════════════════════════════ */

function showAbilityChoice() {
  choosingAbility = true;

  abilityTitle.textContent = `⬆ wave ${Director.getWave()} complete!`;

  const choices = pickAbilities();
  abilityCardsEl.innerHTML = '';

  choices.forEach(ab => {
    const card = document.createElement('div');
    card.className = 'ability-card' + (ab.exclusive ? ' exclusive' : '');

    card.innerHTML = `
      <div class="ability-icon">${ab.icon}</div>
      <div class="ability-info">
        <div class="ability-name">${ab.name}</div>
        <div class="ability-desc">${ab.desc}</div>
        ${ab.exclusive ? `<div class="ability-tag">⭐ exclusive ${ab.exclusive}</div>` : ''}
      </div>
    `;

    card.addEventListener('click', () => selectAbility(ab));
    card.addEventListener('touchstart', e => {
      e.preventDefault();
      selectAbility(ab);
    }, { passive: false });

    abilityCardsEl.appendChild(card);
  });

  abilityOverlay.classList.add('visible');
}

function selectAbility(ab) {
  ab.effect(player);
  player.acquiredAbilities.push(ab.id);

  SFX.abilityPick();
  abilityOverlay.classList.remove('visible');
  choosingAbility = false;

  updateHpBar();
  updateRangeCircle();
}

function pickAbilities() {
  const charId    = player.charDef.id;
  const exclusive = ABILITIES.filter(a => a.exclusive === charId && !player.acquiredAbilities.includes(a.id));
  const generic   = ABILITIES.filter(a => a.exclusive === null   && !player.acquiredAbilities.includes(a.id));
  const all       = [...exclusive, ...generic];

  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }

  const result = [];

  if (exclusive.length > 0) {
    result.push(exclusive[Math.floor(Math.random() * exclusive.length)]);
  }

  for (const a of all) {
    if (result.length >= 3) break;
    if (!result.includes(a)) result.push(a);
  }

  while (result.length < 3) {
    const fallback = ABILITIES[Math.floor(Math.random() * ABILITIES.length)];
    if (!result.includes(fallback)) result.push(fallback);
  }

  return result.slice(0, 3);
}

/* ══════════════════════════════════════
   DOM UTILITIES
   ══════════════════════════════════════ */

function getArenaSize() {
  const r = arena.getBoundingClientRect();
  return { w: r.width, h: r.height };
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}