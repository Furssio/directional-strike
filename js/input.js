/* ═══════════════════════════════════════
   INPUT.JS
   All keyboard and touch event listeners.

   Used by: nobody — self-executing
   Depends on: state.js, combat.js,
               ui/screens.js, ui/abilityScreen.js,
               audio.js
   ═══════════════════════════════════════ */

/* ── MENU NAVIGATION ── */

document.getElementById('btn-restart').addEventListener('click', () => {
  if (Transition.isPlaying()) return;
  overOverlay.classList.add('hidden');
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

document.getElementById('btn-adventure').addEventListener('click', () => {
  if (Transition.isPlaying()) return;
  if (typeof DemoMode !== 'undefined') DemoMode.stop();
  Transition.play('fast', () => {
    loadAdventureMode(() => {
      buildMapSelectScreen();
      showScreen(sMapSelect);
    });
  });
});

// challenge mode
document.getElementById('btn-challenge').addEventListener('click', () => {
  if (Transition.isPlaying()) return;
  if (typeof DemoMode !== 'undefined') DemoMode.stop();
  Transition.play('fast', () => {
    buildChallengeScreen();
    showScreen(sChallenge);
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
document.getElementById('btn-howtoplay').addEventListener('click', () => {
  const popup = document.getElementById('info-popup');
  if (popup) popup.classList.remove('hidden');
});

document.getElementById('info-close').addEventListener('click', () => {
  const popup = document.getElementById('info-popup');
  if (popup) popup.classList.add('hidden');
});

// close info on click outside card
document.getElementById('info-popup').addEventListener('click', (e) => {
  if (e.target.id === 'info-popup') {
    e.target.classList.add('hidden');
  }
});

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

document.getElementById('btn-home').addEventListener('click', () => {
  if (Transition.isPlaying()) return;
  overOverlay.classList.add('hidden');
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

document.getElementById('btn-map-back').addEventListener('click', () => {
  if (Transition.isPlaying()) return;
  Transition.play('fast', () => {
    showScreen(sMenu);
    if (typeof DemoMode !== 'undefined') DemoMode.start();
  });
});

/* ── CHALLENGE SCREEN BUTTONS ── */

document.getElementById('btn-challenge-back').addEventListener('click', () => {
  if (Transition.isPlaying()) return;
  if (typeof DemoMode !== 'undefined') DemoMode.stop();
  Transition.play('fast', () => {
    showScreen(sMenu);
    if (typeof DemoMode !== 'undefined') DemoMode.start();
  });
});

document.getElementById('btn-challenge-play').addEventListener('click', () => {
  if (Transition.isPlaying()) return;
  SFX.mapConfirm();
  Music.fadeOut(500);
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
    _menuSoundBtn.querySelector('.menu-btn-icon').textContent = icon;
    _menuSoundBtn.classList.toggle('muted', CONFIG.audio.volume <= 0);
  }
}

// handle slider input
function _onVolumeChange(e) {
  AudioCore.setVolume(parseInt(e.target.value) / 100);
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
  };

  if (map[e.key]) {
    e.preventDefault();
    if (paused) return;
    if (e.repeat) return;
    // tutorial intercept
    if (typeof Tutorial !== 'undefined' && Tutorial.isActive() && Tutorial.isFrozen()) {
      Tutorial.onDirInput(map[e.key]);
      return;
    }
    const btn = document.getElementById('btn-' + map[e.key]);
    if (btn) btn.classList.add('pressed');
    setTimeout(() => { if (btn) btn.classList.remove('pressed'); }, 120);
    handleDir(map[e.key]);
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


updateMenuBest();