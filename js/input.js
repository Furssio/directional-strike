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

// how to play — placeholder
document.getElementById('btn-howtoplay').addEventListener('click', () => {
  // TODO: show how to play screen
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

/* ── AUDIO ── */

// SFX toggle
document.getElementById('btn-sfx').addEventListener('click', () => {
  SFX.init();
  CONFIG.audio.enabled = !CONFIG.audio.enabled;
  document.getElementById('btn-sfx').classList.toggle('muted', !CONFIG.audio.enabled);
  document.getElementById('btn-sfx').querySelector('.menu-btn-icon').textContent =
    CONFIG.audio.enabled ? '🔊' : '🔇';
});

// Music toggle — placeholder for now
document.getElementById('btn-music').addEventListener('click', () => {
  const btn = document.getElementById('btn-music');
  btn.classList.toggle('muted');
  btn.querySelector('.menu-btn-icon').textContent =
    btn.classList.contains('muted') ? '🔇' : '🎵';
});

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
    if (ActiveDirector === AdventureDirector) {
      for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].el) enemies[i].el.remove();
        enemies.splice(i, 1);
      }
      for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].el.remove();
        bullets.splice(i, 1);
      }
      AdventureDirector.nextWave();
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