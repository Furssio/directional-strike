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
}

function resumeGame() {
  if (!paused) return;
  paused = false;
  document.getElementById('pause-overlay').classList.add('hidden');
  lastTick = performance.now();
  gameLoop = setInterval(tick, 16);
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
document.getElementById('pause-exit').addEventListener('click', () => {
  if (Transition.isPlaying()) return;
  resumeGame();
  Transition.play('fast', () => {
    endGame();
    showScreen(sMenu);
    if (typeof DemoMode !== 'undefined') DemoMode.start();
  });
});