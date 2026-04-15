/* ═══════════════════════════════════════
   HUD.JS
   All HUD update functions.

   Used by: game systems, loop.js
   Depends on: dom.js, state.js, config.js
   ═══════════════════════════════════════ */

function updateHpBar() {
  const pct = player.hpPercent();
  hpBar.style.width      = Math.round(pct * 100) + '%';
  hpBar.style.background = pct > CONFIG.player.hpBarGreenPct
    ? '#639922'
    : pct > CONFIG.player.hpBarYellowPct
      ? '#BA7517'
      : '#A32D2D';
}

function updateProgress() {
  const needed = ActiveDirector.getKillsNeeded();
  const pct    = Math.min(ActiveDirector.getKills() / needed, 1);
  progressBar.style.width = Math.round(pct * 100) + '%';
}

function updateWaveDisplay(wave, isBoss) {
  levelEl.textContent = isBoss ? '⚠️ wave ' + wave + ' — BOSS' : 'wave ' + wave;

  // skip the small "wave N!" popup on boss waves
  // (the BOSS ANNOUNCE popup handles that with more flair)
  if (isBoss) return;

  lvlPop.textContent   = 'wave ' + wave + '!';
  lvlPop.style.opacity = '1';
  setTimeout(() => lvlPop.style.opacity = '0', 1200);
}
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

function updateSpecialBar() {
  const pct     = player.specialCharge;
  const ab      = player.ability;
  const isReady = player.isSpecialReady();

  specialBar.style.width      = pct + '%';
  specialBar.style.background = ab.barColor;

  specialLabel.textContent = `${ab.icon} ${ab.name} ${Math.round(pct)}%`;

  specialWrap.style.setProperty('--special-color', ab.barColor);

  if (isReady && !player.specialActive) {
    specialWrap.classList.add('ready');
    btnSpecial.className     = 'cbtn ready';
    btnSpecial.textContent   = ab.icon;
    specialLabel.style.color = ab.barColor;

    if (!player._wasSpecialReady) {
      player._wasSpecialReady = true;
      SFX.specialReady();
    }

  } else if (!player.specialActive) {
    specialWrap.classList.remove('ready');
    btnSpecial.className     = 'cbtn';
    btnSpecial.textContent   = '⚡';
    specialLabel.style.color = '#888';
    player._wasSpecialReady  = false;
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