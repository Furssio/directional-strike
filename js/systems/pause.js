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
  document.getElementById('pause-overlay').classList.remove('hidden');

  // sync toggle states with menu buttons
  _syncPauseToggles();

  // freeze ability audio
  if (typeof SFX !== 'undefined') SFX.pauseAll();
}

function resumeGame() {
  if (!paused) return;
  paused = false;
  document.getElementById('pause-overlay').classList.add('hidden');
  lastTick = performance.now();
  gameLoop = setInterval(tick, 16);

  // resume ability audio
  if (typeof SFX !== 'undefined') SFX.resumeAll();
}

/* ── SYNC TOGGLE STATES ── */

function _syncPauseToggles() {
  // SFX
  const pSfx = document.getElementById('pause-sfx');
  const sfxOff = !CONFIG.audio.enabled;
  pSfx.classList.toggle('muted', sfxOff);
  pSfx.querySelector('.pause-btn-icon').textContent = sfxOff ? '🔇' : '🔊';

  // Music
  const pMusic = document.getElementById('pause-music');
  const menuMusic = document.getElementById('btn-music');
  const musicOff = menuMusic.classList.contains('muted');
  pMusic.classList.toggle('muted', musicOff);
  pMusic.querySelector('.pause-btn-icon').textContent = musicOff ? '🔇' : '🎵';
}

/* ── BUTTON BINDINGS ── */

document.getElementById('btn-pause').addEventListener('click', () => {
  togglePause();
});

document.getElementById('pause-continue').addEventListener('click', () => {
  resumeGame();
});

document.getElementById('pause-retry').addEventListener('click', () => {
  if (Transition.isPlaying()) return;
  resumeGame();
  Transition.play('fast', () => {
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

document.getElementById('pause-maps').addEventListener('click', () => {
  if (Transition.isPlaying()) return;
  resumeGame();
  Transition.play('fast', () => {
    endGame();
    showScreen(sMapSelect);
    if (typeof initMapSelect === 'function') initMapSelect();
  });
});

/* ── SFX TOGGLE ── */
document.getElementById('pause-sfx').addEventListener('click', () => {
  SFX.init();
  CONFIG.audio.enabled = !CONFIG.audio.enabled;
  const off = !CONFIG.audio.enabled;

  // update pause button
  const pSfx = document.getElementById('pause-sfx');
  pSfx.classList.toggle('muted', off);
  pSfx.querySelector('.pause-btn-icon').textContent = off ? '🔇' : '🔊';

  // sync menu button
  const mSfx = document.getElementById('btn-sfx');
  mSfx.classList.toggle('muted', off);
  mSfx.querySelector('.menu-btn-icon').textContent = off ? '🔇' : '🔊';
});

/* ── MUSIC TOGGLE ── */
document.getElementById('pause-music').addEventListener('click', () => {
  const off = !document.getElementById('pause-music').classList.contains('muted');

  // update pause button
  const pMusic = document.getElementById('pause-music');
  pMusic.classList.toggle('muted', off);
  pMusic.querySelector('.pause-btn-icon').textContent = off ? '🔇' : '🎵';

  // sync menu button
  const mMusic = document.getElementById('btn-music');
  mMusic.classList.toggle('muted', off);
  mMusic.querySelector('.menu-btn-icon').textContent = off ? '🔇' : '🎵';
});