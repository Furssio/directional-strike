
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
  const ab      = player.ability;
  const isReady = player.isSpecialReady();
  const barEl   = document.getElementById('bar-special');
  const maxSlots = player._maxSpecialSlots || 1;

  // normalize charge to 0-100% visual range
  const maxCharge = maxSlots * 100;
  const visualPct = Math.min(100, (player.specialCharge / maxCharge) * 100);

  specialBar.classList.add('charge-tick');
  specialBar.style.width = visualPct + '%';
  setTimeout(() => specialBar.classList.remove('charge-tick'), 200);

  // render slot divider lines
  _renderSlotDividers(maxSlots);

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
  // adventure mode: countdown timer
  if (ActiveDirector.getWaveDuration && ActiveDirector.getWaveDuration() > 0) {
    const left = ActiveDirector.getWaveTimeLeft();
    const secs = Math.ceil(Math.max(0, left) / 1000);
    const mins = Math.floor(secs / 60);
    const s    = secs % 60;
    const timeStr = mins + ':' + (s < 10 ? '0' : '') + s;

   // update timer display
    if (!_timerEl) _createTimerEl();
    // hide timer during upgrade choice and countdown
    if (_choosingUpgrade || _countdownActive || _inputBlocked ||
        _challengeChoiceActive || _challengeCountdown || _challengeInputBlocked) {
      _timerEl.style.display = 'none';
      return;
    }
    _timerEl.textContent = timeStr;

    // color: white > yellow > red as time runs out
    const pct = left / ActiveDirector.getWaveDuration();
    if (pct > 0.5)      _timerEl.style.color = '#ffffff';
    else if (pct > 0.25) _timerEl.style.color = '#ddaa22';
    else                 _timerEl.style.color = '#ee4444';

    _timerEl.style.display = 'block';

    // progress bar removed from DOM
  if (progressBar) progressBar.style.width = '0%';
    return;
  }

  // hide timer in infinite mode
  if (_timerEl) _timerEl.style.display = 'none';

  // infinite mode: kills progress
  if (progressBar) {
    const needed = ActiveDirector.getKillsNeeded();
    const pct    = Math.min(ActiveDirector.getKills() / needed, 1);
    progressBar.style.width = Math.round(pct * 100) + '%';
    progressBar.style.background = '#666';
  }
}

/* ── TIMER ELEMENT ── */
let _timerEl = null;

function _createTimerEl() {
  _timerEl = document.createElement('div');
  _timerEl.id = 'wave-timer';
  _timerEl.style.cssText =
    'position:absolute;top:8px;left:50%;transform:translateX(-50%);' +
    'font-family:"Press Start 2P",monospace;font-size:14px;color:#fff;' +
    'z-index:50;text-shadow:2px 2px 0 #000, -1px -1px 0 #000;' +
    'pointer-events:none;';
  arena.appendChild(_timerEl);
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

// color classes mapped to tier index from CONFIG.combo.tiers
const COMBO_COLORS = ['c-white', 'c-blue', 'c-yellow', 'c-orange', 'c-red', 'c-purple', 'c-rainbow'];
const COMBO_TIERS  = ['', 't2', 't3', 't4', 't5', 't6', 't7'];

function getComboColor(kills) {
  const tiers = CONFIG.combo.tiers;
  let idx = 0;
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (kills >= tiers[i][0]) { idx = i; break; }
  }
  return COMBO_COLORS[idx] || 'c-white';
}

function getComboTier(kills) {
  const tiers = CONFIG.combo.tiers;
  let idx = 0;
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (kills >= tiers[i][0]) { idx = i; break; }
  }
  return COMBO_TIERS[idx] || '';
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
    _comboTarget = 0;
    return;
  }

  const oldTarget = _comboTarget;
  _comboTarget += pts;
  const mult = player.getComboMult();

  const el = _getComboEl();
  const ptsEl = el.querySelector('.combo-float-pts');
  const multEl = el.querySelector('.combo-float-mult');

  // use player.combo as single source of truth — matches audio tiers
  const colorClass = getComboColor(player.combo);
  const tierClass = getComboTier(player.combo);
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
  _comboTarget = 0;
  if (_comboEl) {
    _comboEl.classList.remove('visible');
    _comboEl.classList.remove('fading');
  }
  clearTimeout(_comboFadeTimer);
}

function updateComboDisplay() {
  if (player.combo < CONFIG.combo.minKills) {
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
/* ── ACTION POP (MISS, PARRY, DOUBLE KILL etc.) ── */

function showActionPop(dir, text, color) {
  const { w, h } = getArenaSize();
  const cx = w / 2;
  const cy = h / 2;

  // position based on direction
  const dist = 70;
  let x = cx, y = cy;
  if (dir === 'up')    y -= dist;
  if (dir === 'down')  y += dist;
  if (dir === 'left')  x -= dist;
  if (dir === 'right') x += dist;

  const pop = document.createElement('div');
  pop.className = 'action-pop';
  pop.textContent = text;
  pop.style.left  = x + 'px';
  pop.style.top   = y + 'px';
  pop.style.color = color;
  arena.appendChild(pop);
  setTimeout(() => pop.remove(), 800);
}

/* ── COMBO BUMP EFFECT ── */

function triggerComboBump() {
  const el = _getComboEl();
  el.classList.remove('combo-bump');
  void el.offsetWidth;
  el.classList.add('combo-bump');
  setTimeout(() => el.classList.remove('combo-bump'), 400);
}
/* ── EXTRA SLOT DIVIDERS ── */
let _slotDividerCount = 0;

function _renderSlotDividers(maxSlots) {
  if (maxSlots === _slotDividerCount) return; // already rendered
  _slotDividerCount = maxSlots;

  // remove old dividers
  document.querySelectorAll('.slot-divider').forEach(el => el.remove());

  if (maxSlots <= 1) return;

  const barBg = document.querySelector('#bar-special .pixel-bar-bg');
  if (!barBg) return;

  for (let i = 1; i < maxSlots; i++) {
    const pct = (i / maxSlots) * 100;
    const div = document.createElement('div');
    div.className = 'slot-divider';
    div.style.cssText =
      'position:absolute;top:0;bottom:0;width:2px;' +
      'left:' + pct + '%;' +
      'background:#ffffff;opacity:0.6;z-index:2;' +
      'box-shadow:0 0 3px rgba(255,255,255,0.4);';
    barBg.appendChild(div);
  }
}