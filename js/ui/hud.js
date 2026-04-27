/* ═══════════════════════════════════════
   HUD.JS
   Pixel bar system — HP and Special bars
   live inside the arena above the player.

   Used by: game systems, loop.js
   Depends on: dom.js, state.js, config.js
   ═══════════════════════════════════════ */

let _lastHpPct = 1;

function updateHpBar() {
  const pct = player.hpPercent();
  const w   = Math.round(pct * 100);
  hpBar.style.width = w + '%';

  hpBar.classList.remove('hp-low', 'hp-crit');
  if (pct <= CONFIG.player.hpBarYellowPct) {
    hpBar.classList.add('hp-crit');
  } else if (pct <= CONFIG.player.hpBarGreenPct) {
    hpBar.classList.add('hp-low');
  }

  if (pct > _lastHpPct + 0.05) {
    hpBar.classList.remove('heal-flash');
    void hpBar.offsetWidth;
    hpBar.classList.add('heal-flash');
    setTimeout(() => hpBar.classList.remove('heal-flash'), 500);
  }

  _lastHpPct = pct;
}

function updateSpecialBar() {
  const pct     = player.specialCharge;
  const ab      = player.ability;
  const isReady = player.isSpecialReady();
  const barEl   = document.getElementById('bar-special');

  specialBar.classList.add('charge-tick');
  specialBar.style.width = pct + '%';
  setTimeout(() => specialBar.classList.remove('charge-tick'), 200);

  const iconEl = document.getElementById('special-icon');
  if (iconEl) iconEl.textContent = ab.icon;

  if (isReady && !player.specialActive) {
    barEl.classList.add('bar-ready');
    playerEl.classList.add('special-ready');

    if (!player._wasSpecialReady) {
      player._wasSpecialReady = true;
      SFX.specialReady();
    }

  } else if (!player.specialActive) {
    barEl.classList.remove('bar-ready');
    playerEl.classList.remove('special-ready');
    player._wasSpecialReady = false;
  }
}

function updateProgress() {
  const needed = ActiveDirector.getKillsNeeded();
  const pct    = Math.min(ActiveDirector.getKills() / needed, 1);
  progressBar.style.width = Math.round(pct * 100) + '%';
}

function updateWaveDisplay(wave, isBoss) {
  levelEl.textContent = isBoss ? 'BOSS' : 'wave ' + wave;

  // wave color: 1-4 green, 5-8 yellow, 9-10 red
  if (wave <= 4)      levelEl.style.color = '#44cc44';
  else if (wave <= 8) levelEl.style.color = '#ddaa22';
  else                levelEl.style.color = '#ee4444';

  if (isBoss) {
    levelEl.style.color = '#ee4444';
    return;
  }

  lvlPop.textContent   = 'wave ' + wave + '!';
  lvlPop.style.color   = levelEl.style.color;
  lvlPop.style.opacity = '1';
  setTimeout(() => lvlPop.style.opacity = '0', 1200);
}
let _comboScore = 0;
let _comboKills = 0;
let _activeComboFloat = null;

function getComboColor(kills) {
  if (kills >= 20) return 'c-rainbow';
  if (kills >= 15) return 'c-purple';
  if (kills >= 11) return 'c-red';
  if (kills >= 8)  return 'c-orange';
  if (kills >= 5)  return 'c-yellow';
  if (kills >= 3)  return 'c-blue';
  return 'c-white';
}

function getComboTier(kills) {
  if (kills >= 20) return 't7';
  if (kills >= 15) return 't6';
  if (kills >= 11) return 't5';
  if (kills >= 8)  return 't4';
  if (kills >= 5)  return 't3';
  if (kills >= 3)  return 't2';
  return '';
}

function spawnComboFloat(x, y, pts, mult, kills) {
  // remove previous float
  if (_activeComboFloat && _activeComboFloat.parentNode) {
    _activeComboFloat.remove();
  }

  const el = document.createElement('div');
  const colorClass = getComboColor(kills);
  const tierClass  = getComboTier(kills);
  el.className = 'combo-float ' + colorClass;

  // diagonal offset — slightly to the right and up
  const offsetX = 15 + Math.random() * 10;
  const offsetY = -10;

  el.style.left = (x + offsetX) + 'px';
  el.style.top  = (y + offsetY) + 'px';

  el.innerHTML =
    '<div class="combo-float-pts ' + tierClass + '">' + pts + '</div>' +
    '<div class="combo-float-mult">x' + mult.toFixed(1) + '</div>';

  arena.appendChild(el);
  _activeComboFloat = el;

  setTimeout(() => {
    if (el.parentNode) el.remove();
    if (_activeComboFloat === el) _activeComboFloat = null;
  }, 1800);
}

function onComboKill(x, y, pts) {
  if (player.combo < CONFIG.combo.minKills) {
    _comboScore = 0;
    _comboKills = 0;
    return;
  }

  _comboKills++;
  _comboScore += pts;
  const mult = player.getComboMult();

  spawnComboFloat(x, y, _comboScore, mult, _comboKills);
}

function updateComboDisplay() {
  const c = player.combo;

  if (c >= CONFIG.combo.minKills) {
    comboEl.textContent   = 'x' + player.getComboMult().toFixed(1);
    comboEl.style.opacity = '1';

    comboTimerWrap.style.opacity = '1';
    const maxDecay = CONFIG.combo.decayMs + player.comboDecayBonus;
    comboTimerBar.style.width = Math.max(0, player.comboTimer / maxDecay * 100) + '%';

  } else {
    comboEl.style.opacity        = '0';
    comboTimerWrap.style.opacity = '0';

    // combo ended — reset
    _comboScore = 0;
    _comboKills = 0;
  }
}

function updateRangeCircle() {
  const { w, h } = getArenaSize();
  const size  = Math.min(w, h);
  const range = player.getAttackRange(size);
  const d     = range * 2;

  rangeEl.style.width       = d + 'px';
  rangeEl.style.height      = d + 'px';
  rangeEl.style.borderColor = `rgba(${hexToRgb(player.color)}, 0.5)`;
  rangeEl.style.background  = `rgba(${hexToRgb(player.color)}, 0.05)`;
}