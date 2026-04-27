
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

/* ── COMBO FLOAT SYSTEM ── */

let _comboKills = 0;
let _comboTarget = 0;
let _comboAnimating = false;
let _comboFadeTimer = null;
let _comboEl = null;

function getComboColor(kills) {
  if (kills >= 50) return 'c-rainbow';
  if (kills >= 40) return 'c-purple';
  if (kills >= 30) return 'c-red';
  if (kills >= 20) return 'c-orange';
  if (kills >= 12) return 'c-yellow';
  if (kills >= 6)  return 'c-blue';
  return 'c-white';
}

function getComboTier(kills) {
  if (kills >= 50) return 't7';
  if (kills >= 40) return 't6';
  if (kills >= 30) return 't5';
  if (kills >= 20) return 't4';
  if (kills >= 12) return 't3';
  if (kills >= 6)  return 't2';
  return '';
}

function _getComboEl() {
  if (_comboEl) return _comboEl;
  _comboEl = document.createElement('div');
  _comboEl.className = 'combo-float';
  _comboEl.innerHTML =
    '<div class="combo-float-pts"></div>' +
    '<div class="combo-float-mult"></div>';
  arena.appendChild(_comboEl);
  return _comboEl;
}

function _animateComboCounter(from, to, el, duration) {
  const start = performance.now();
  _comboAnimating = true;

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3);
    const current = Math.round(from + (to - from) * ease);
    el.textContent = current.toLocaleString();
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      _comboAnimating = false;
    }
  }
  requestAnimationFrame(step);
}

function onComboKill(x, y, pts) {
  if (player.combo < CONFIG.combo.minKills) {
    _comboKills = 0;
    _comboTarget = 0;
    return;
  }

  _comboKills++;
  const oldTarget = _comboTarget;
  _comboTarget += pts;
  const mult = player.getComboMult();

  const el = _getComboEl();
  const ptsEl = el.querySelector('.combo-float-pts');
  const multEl = el.querySelector('.combo-float-mult');

  const colorClass = getComboColor(_comboKills);
  const tierClass = getComboTier(_comboKills);
  el.className = 'combo-float visible ' + colorClass;
  ptsEl.className = 'combo-float-pts ' + tierClass;
  multEl.textContent = 'x' + mult.toFixed(1);

  _animateComboCounter(oldTarget, _comboTarget, ptsEl, 400);

  clearTimeout(_comboFadeTimer);
  _comboFadeTimer = setTimeout(() => {
    el.classList.remove('visible');
    el.classList.add('fading');
    setTimeout(() => {
      el.classList.remove('fading');
    }, 600);
  }, 2000);
}

function resetComboFloat() {
  _comboKills = 0;
  _comboTarget = 0;
  if (_comboEl) {
    _comboEl.classList.remove('visible');
    _comboEl.classList.remove('fading');
  }
  clearTimeout(_comboFadeTimer);
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
    resetComboFloat();
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