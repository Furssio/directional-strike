/* ═══════════════════════════════════════
   PAUSE.JS
   Pause system — freezes game loop,
   shows overlay with continue/retry/exit.

   Used by: input.js (P key + button)
   Depends on: state.js, loop.js, screens.js
   ═══════════════════════════════════════ */

let paused = false;

function togglePause() {
  if (!running) return;
  if (paused) resumeGame();
  else pauseGame();
}

function pauseGame() {
  if (!running || paused) return;
  paused = true;
  clearInterval(gameLoop);
  gameLoop = null;

  const pauseOv = document.getElementById('pause-overlay');
  if (pauseOv) pauseOv.classList.remove('hidden');

  // update maps/menu button text based on mode
  const mapsBtn = document.getElementById('pause-maps');
  if (mapsBtn) {
    mapsBtn.textContent = (typeof ChallengeDirector !== 'undefined' &&
      ActiveDirector === ChallengeDirector) ? 'MENU' : 'MAPS';
  }

  // sync volume slider with current volume
  _syncPauseVolume();

  // freeze ability audio
  if (typeof SFX !== 'undefined') SFX.pauseAll();
  if (typeof RangeCircle !== 'undefined') RangeCircle.stop();
  if (typeof SFX !== 'undefined') SFX.pauseOpen();
  if (typeof CrazySDKWrapper !== 'undefined') CrazySDKWrapper.gameplayStop();

  // retry pause bindings if not ready yet
  if (!_pauseBindingsReady) _initPauseBindings();
}

function resumeGame() {
  if (!paused) return;
  paused = false;

  const pauseOv = document.getElementById('pause-overlay');
  if (pauseOv) pauseOv.classList.add('hidden');

  lastTick = performance.now();
  gameLoop = setInterval(tick, 16);

  // resume ability audio
  if (typeof SFX !== 'undefined') SFX.resumeAll();
  if (typeof RangeCircle !== 'undefined') RangeCircle.start();
  if (typeof SFX !== 'undefined') SFX.pauseClose();
  if (typeof CrazySDKWrapper !== 'undefined') CrazySDKWrapper.gameplayStart();
}

/* ── SYNC VOLUME SLIDER ── */

function _syncPauseVolume() {
  const slider = document.getElementById('pause-volume-slider');
  if (!slider) return;
  slider.value = Math.round(CONFIG.audio.volume * 100);
}

/* ── BUTTON BINDINGS ── */

let _pauseBindingsReady = false;

function _initPauseBindings() {
  if (_pauseBindingsReady) return;

  const btnPause    = document.getElementById('btn-pause');
  const btnContinue = document.getElementById('pause-continue');
  const btnRetry    = document.getElementById('pause-retry');
  const btnMaps     = document.getElementById('pause-maps');

  // only check elements that MUST exist
  if (!btnPause || !btnContinue || !btnRetry || !btnMaps) {
    return;
  }

  _pauseBindingsReady = true;

  btnPause.addEventListener('click', () => {
    togglePause();
  });

  btnContinue.addEventListener('click', () => {
    resumeGame();
  });

  btnRetry.addEventListener('click', () => {
    if (typeof Transition !== 'undefined' && Transition.isPlaying()) return;
    resumeGame();
    Transition.play('fast', () => {
      equippedAbilityId = getEquippedAbility();
      if (typeof ChallengeDirector !== 'undefined' && ActiveDirector === ChallengeDirector) {
        ChallengeDirector.init();
        resetUpgradeChoices();
        startGame(true);
        _isFirstAbilityChoice = true;
        startChallengeChoice('ability');
      } else if (typeof AdventureDirector !== 'undefined' && ActiveDirector === AdventureDirector) {
        if (!AdventureDirector.restart()) {
          showScreen(sMenu);
          return;
        }
        startGame(true);
      } else {
        startGame(true);
      }
    }, () => {
      startGameLoop();
    });
  });

  btnMaps.addEventListener('click', () => {
    if (typeof Transition !== 'undefined' && Transition.isPlaying()) return;
    resumeGame();
    Transition.play('fast', () => {
      endGame();
      if (typeof ChallengeDirector !== 'undefined' && ActiveDirector === ChallengeDirector) {
        showScreen(sMenu);
      } else {
        showScreen(sMapSelect);
        if (typeof initMapSelect === 'function') initMapSelect();
      }
    });
  });

  // volume slider binding
  const volSlider = document.getElementById('pause-volume-slider');
  if (volSlider) {
    volSlider.addEventListener('input', (e) => {
      const vol = parseInt(e.target.value) / 100;
      CONFIG.audio.volume = vol;
      if (typeof AudioCore !== 'undefined') AudioCore.vol(vol);
      try { localStorage.setItem('ds_volume', vol); } catch(x) {}
    });
  }
}

// DOM is ready (htmlLoader loaded partials before main.js)
_initPauseBindings();