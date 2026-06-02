/* ═══════════════════════════════════════
   INPUT.JS
   All keyboard and touch event listeners.

   Used by: nobody — self-executing
   Depends on: state.js, combat.js,
               ui/screens.js, ui/abilityScreen.js,
               audio.js
   ═══════════════════════════════════════ */

/* ── SAFE BIND HELPER ── */
function _safeBind(id, event, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, handler);
}

/* ── MENU NAVIGATION ── */

_safeBind('btn-restart', 'click', () => {
  if (Transition.isPlaying()) return;
  if (overOverlay) overOverlay.classList.add('hidden');
  cleanupArena();
  Transition.play('fast', () => {
    // challenge mode restart
    if (ActiveDirector && ActiveDirector === ChallengeDirector) {
      startChallengeGame();
      return;
    }
    // adventure mode restart
    equippedAbilityId = getEquippedAbility();
    if (ActiveDirector && ActiveDirector === AdventureDirector) {
      if (!AdventureDirector.restart()) {
        showScreen(sMenu);
        return;
      }
    }
    startGame(true);
  }, () => {
    startGameLoop();
  });
});

_safeBind('btn-adventure', 'click', () => {
  if (Transition.isPlaying()) return;
  if (typeof DemoMode !== 'undefined') DemoMode.stop();
  Transition.play('fast', () => {
    try {
      loadAdventureMode(() => {
        buildMapSelectScreen();
        showScreen(sMapSelect);
      });
    } catch (e) {
      console.error('[INPUT] loadAdventureMode failed', e);
      showScreen(sMenu);
    }
  });
});

// challenge mode
_safeBind('btn-challenge', 'click', () => {
  if (Transition.isPlaying()) return;
  if (typeof DemoMode !== 'undefined') DemoMode.stop();
  Transition.play('fast', () => {
    try {
      buildChallengeScreen();
      showScreen(sChallenge);
    } catch (e) {
      console.error('[INPUT] buildChallengeScreen failed', e);
      showScreen(sMenu);
    }
  });
});

// splash text on challenge hover
const _challengeCard = document.getElementById('btn-challenge');
const _splashEl = document.getElementById('menu-splash');
const _splashTexts = [
  'For experienced\nwarriors only!',
  'Beat Adventure\nmode first!',
  'Think you are\nready? 💀',
  'Endless chaos\nawaits...',
  'No mercy.\nNo checkpoints.',
];

if (_challengeCard && _splashEl) {
  _challengeCard.addEventListener('mouseenter', () => {
    const txt = _splashTexts[Math.floor(Math.random() * _splashTexts.length)];
    _splashEl.textContent = txt;
    _splashEl.classList.add('visible');
  });
  _challengeCard.addEventListener('mouseleave', () => {
    _splashEl.classList.remove('visible');
  });
}

// how to play — info popup
_safeBind('btn-howtoplay', 'click', () => {
  const popup = document.getElementById('info-popup');
  if (popup) popup.classList.remove('hidden');
});

_safeBind('info-close', 'click', () => {
  const popup = document.getElementById('info-popup');
  if (popup) popup.classList.add('hidden');
});

// close info on click outside card
const _infoPopup = document.getElementById('info-popup');
if (_infoPopup) {
  _infoPopup.addEventListener('click', (e) => {
    if (e.target.id === 'info-popup') {
      e.target.classList.add('hidden');
    }
  });
}

const _btnAbilities = document.getElementById('btn-abilities');
if (_btnAbilities) {
  _btnAbilities.addEventListener('click', () => {
    if (typeof DemoMode !== 'undefined') DemoMode.stop();
    buildAbilityScreen();
    showScreen(sAbility);
  });
}

const _btnAbilityBack = document.getElementById('btn-ability-back');
if (_btnAbilityBack) {
  _btnAbilityBack.addEventListener('click', () => {
    showScreen(sMenu);
    if (typeof DemoMode !== 'undefined') DemoMode.start();
  });
}

_safeBind('btn-home', 'click', () => {
  if (Transition.isPlaying()) return;
  if (overOverlay) overOverlay.classList.add('hidden');
  cleanupArena();
  Transition.play('fast', () => {
    // challenge mode: go back to menu
    if (ActiveDirector && ActiveDirector === ChallengeDirector) {
      showScreen(sMenu);
      if (typeof DemoMode !== 'undefined') DemoMode.start();
      return;
    }
    // adventure mode: go back to map select
    showScreen(sMapSelect);
    if (typeof initMapSelect === 'function') initMapSelect();
  });
});

_safeBind('btn-map-back', 'click', () => {
  if (Transition.isPlaying()) return;
  Transition.play('fast', () => {
    showScreen(sMenu);
    if (typeof DemoMode !== 'undefined') DemoMode.start();
  });
});

/* ── CHALLENGE SCREEN BUTTONS ── */

_safeBind('btn-challenge-back', 'click', () => {
  if (Transition.isPlaying()) return;
  if (typeof DemoMode !== 'undefined') DemoMode.stop();
  Transition.play('fast', () => {
    showScreen(sMenu);
    if (typeof DemoMode !== 'undefined') DemoMode.start();
  });
});

_safeBind('btn-challenge-play', 'click', () => {
  if (Transition.isPlaying()) return;
  if (typeof SFX !== 'undefined') SFX.mapConfirm();
  if (typeof Music !== 'undefined') Music.fadeOut(500);
  if (typeof DemoMode !== 'undefined') DemoMode.stop();
  Transition.play('normal', () => {
    startChallengeGame();
  }, () => {
    startGameLoop();
  });
});


/* ── AUDIO — VOLUME SLIDER ── */

const _menuSlider  = document.getElementById('menu-volume-slider');
const _pauseSlider = document.getElementById('pause-volume-slider');
const _menuPopup   = document.getElementById('menu-volume-popup');
const _menuSoundBtn = document.getElementById('btn-sound');

// sync all sliders + icon to current volume
function _syncVolumeUI() {
  const pct = Math.round(CONFIG.audio.volume * 100);
  if (_menuSlider)  _menuSlider.value  = pct;
  if (_pauseSlider) _pauseSlider.value = pct;

  // update menu button icon
  const icon = CONFIG.audio.volume <= 0 ? '🔇' : '🔊';
  if (_menuSoundBtn) {
    const iconEl = _menuSoundBtn.querySelector('.menu-btn-icon');
    if (iconEl) iconEl.textContent = icon;
    _menuSoundBtn.classList.toggle('muted', CONFIG.audio.volume <= 0);
  }
}

// handle slider input
function _onVolumeChange(e) {
  if (typeof AudioCore !== 'undefined') AudioCore.setVolume(parseInt(e.target.value) / 100);
  _syncVolumeUI();
}

if (_menuSlider)  _menuSlider.addEventListener('input', _onVolumeChange);
if (_pauseSlider) _pauseSlider.addEventListener('input', _onVolumeChange);

// menu button toggles popup
if (_menuSoundBtn && _menuPopup) {
  _menuSoundBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    _menuPopup.classList.toggle('hidden');
    _syncVolumeUI();
  });

  // close popup on click outside
  document.addEventListener('click', (e) => {
    if (!_menuPopup.contains(e.target) && e.target !== _menuSoundBtn && !_menuSoundBtn.contains(e.target)) {
      _menuPopup.classList.add('hidden');
    }
  });
}

// sync on load
_syncVolumeUI();

/* ── DIRECTIONAL BUTTONS ── */

['up', 'down', 'left', 'right'].forEach(dir => {
  const btn = document.getElementById('btn-' + dir);
  if (btn) {
    btn.addEventListener('click', () => {
      if (paused) return;
      if (typeof Tutorial !== 'undefined' && Tutorial.isActive() && Tutorial.isFrozen()) {
        Tutorial.onDirInput(dir);
        return;
      }
      handleDir(dir);
      if (ActiveDirector && ActiveDirector.trackInput) ActiveDirector.trackInput();
    });
  }
});

/* ── SPECIAL ── */

const specialBtn = document.getElementById('btn-special');
if (specialBtn) {
  let _specialTouched = false;

  specialBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    _specialTouched = true;
    if (paused) return;
    if (typeof Tutorial !== 'undefined' && Tutorial.isActive() && Tutorial.isFrozen()) {
      Tutorial.onSpaceInput();
      return;
    }
    activateSpecial();
    if (ActiveDirector && ActiveDirector.trackInput) ActiveDirector.trackInput();
  }, { passive: false });

  specialBtn.addEventListener('mousedown', () => {
    if (_specialTouched) { _specialTouched = false; return; }
    if (paused) return;
    if (typeof Tutorial !== 'undefined' && Tutorial.isActive() && Tutorial.isFrozen()) {
      Tutorial.onSpaceInput();
      return;
    }
    activateSpecial();
    if (ActiveDirector && ActiveDirector.trackInput) ActiveDirector.trackInput();
  });
}

/* ── TOUCH INPUT (mobile) ── */

const _touchArena = document.getElementById('arena');
if (_touchArena && navigator.maxTouchPoints > 0) {
  _touchArena.addEventListener('touchstart', (e) => {
    // let interactive elements handle their own taps
    const t = e.target;
    if (t.closest('button, a, .game-btn, #over-overlay, #complete-overlay, #slot-overlay, #upgrade-choice, #pause-overlay, #hud-right, #slot-card, .menu-btn')) {
      return; // don't preventDefault, let click fire
    }

    e.preventDefault();
    if (paused) return;
    if (!running) return;

    // don't intercept when overlays are showing
    const overEl = document.getElementById('over-overlay');
    const compEl = document.getElementById('complete-overlay');
    if (overEl && !overEl.classList.contains('hidden')) return;
    if (compEl && !compEl.classList.contains('hidden')) return;

    const touch = e.touches[0];
    const rect = _touchArena.getBoundingClientRect();

    // normalized position 0→1
    const nx = (touch.clientX - rect.left) / rect.width;
    const ny = (touch.clientY - rect.top) / rect.height;

    // distance from center (player position)
    const dx = nx - 0.5;
    const dy = ny - 0.5;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // center tap = special (radius = player size 96px / arena 620px)
    const deadZone = 48 / 620;

    if (dist <= deadZone) {
      // tutorial intercept
      if (typeof Tutorial !== 'undefined' && Tutorial.isActive() && Tutorial.isFrozen()) {
        Tutorial.onSpaceInput();
        return;
      }
      activateSpecial();
      if (ActiveDirector && ActiveDirector.trackInput) ActiveDirector.trackInput();
      return;
    }

    // angle → direction
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    let dir;
    if (angle >= -45 && angle < 45)        dir = 'right';
    else if (angle >= 45 && angle < 135)   dir = 'down';
    else if (angle >= -135 && angle < -45) dir = 'up';
    else                                   dir = 'left';

    // tutorial intercept
    if (typeof Tutorial !== 'undefined' && Tutorial.isActive() && Tutorial.isFrozen()) {
      Tutorial.onDirInput(dir);
      return;
    }

    handleDir(dir);
    if (ActiveDirector && ActiveDirector.trackInput) ActiveDirector.trackInput();
  }, { passive: false });
}
/* ── KEYBOARD ── */

document.addEventListener('keydown', e => {
  // P = pause
  if (e.code === 'KeyP') {
    e.preventDefault();
    togglePause();
    return;
  }

  // Space = special
  if (e.code === 'Space') {
    e.preventDefault();
    if (paused) return;
    if (e.repeat) return;
    // tutorial intercept
    if (typeof Tutorial !== 'undefined' && Tutorial.isActive() && Tutorial.isFrozen()) {
      Tutorial.onSpaceInput();
      return;
    }
    activateSpecial();
    return;
  }

 const map = {
    ArrowUp:    'up',
    ArrowDown:  'down',
    ArrowLeft:  'left',
    ArrowRight: 'right',
    KeyW:       'up',
    KeyS:       'down',
    KeyA:       'left',
    KeyD:       'right',
  };

  if (map[e.code]) {
    e.preventDefault();
    if (paused) return;
    if (e.repeat) return;
    // tutorial intercept
    if (typeof Tutorial !== 'undefined' && Tutorial.isActive() && Tutorial.isFrozen()) {
      Tutorial.onDirInput(map[e.code]);
      return;
    }
    const btn = document.getElementById('btn-' + map[e.code]);
    if (btn) btn.classList.add('pressed');
    setTimeout(() => { if (btn) btn.classList.remove('pressed'); }, 120);
    handleDir(map[e.code]);
    if (ActiveDirector && ActiveDirector.trackInput) ActiveDirector.trackInput();
  }
});

/* ── DEV CHEATS ── */
const DEV_CHEATS = true;

document.addEventListener('keydown', e => {
  if (!DEV_CHEATS || !running) return;

  if (e.code === 'KeyW') {
    e.preventDefault();
    const needed = ActiveDirector.getKillsNeeded();
    const kills  = ActiveDirector.getKills();
    const diff   = needed - kills;
    for (let i = 0; i < diff; i++) ActiveDirector.onKill();
    return;
  }

  if (e.code === 'KeyK') {
    e.preventDefault();
    player.hp = player.maxHp;
    updateHpBar();
    return;
  }

  if (e.code === 'KeyF') {
    e.preventDefault();
    player.specialCharge = 100;
    updateSpecialBar();
    return;
  }

  // M = skip entire wave (clear field + advance to next)
  if (e.code === 'KeyM') {
    e.preventDefault();
    if (ActiveDirector === AdventureDirector || ActiveDirector === ChallengeDirector) {
      for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].el) enemies[i].el.remove();
        enemies.splice(i, 1);
      }
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].el.remove();
        bullets.splice(i, 1);
      }
      ActiveDirector.nextWave();
    }
    return;
  }
});

/* ── CHALLENGE GAME START ── */

function startChallengeGame() {
  // ensure adventure scripts (MapRegistry, etc.) are loaded
  loadAdventureMode(() => {
    ActiveDirector = ChallengeDirector;
    ChallengeDirector.init();

    // reset upgrade tier tracking for new run
    if (typeof resetUpgradeChoices === 'function') resetUpgradeChoices();
    if (typeof resetChallengeChoices === 'function') resetChallengeChoices();

    // start game with temporary ability — player picks in first choice
    equippedAbilityId = 'shield';
    startGame(true);

    // immediately show ability choice
    _isFirstAbilityChoice = true;
    startChallengeChoice('ability');
  });
}

if (typeof updateMenuBest === 'function') updateMenuBest();