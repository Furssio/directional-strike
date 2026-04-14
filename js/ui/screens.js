/* ═══════════════════════════════════════
   SCREENS.JS
   Screen navigation, score popup, high score.

   Used by: input.js, loop.js
   Depends on: dom.js, state.js
   ═══════════════════════════════════════ */

/* ── SCREEN NAVIGATION ── */

function showScreen(s) {
  [sMenu, sGame, sOver, sSoon].forEach(x => x.style.display = 'none');
  s.style.display = 'block';
}

/* ── HIGH SCORE ── */

function getBestScore() {
  return parseInt(localStorage.getItem('ds_best') || '0');
}

function saveBestScore(score) {
  localStorage.setItem('ds_best', score);
}

function updateMenuBest() {
  const b = getBestScore();
  menuBest.textContent = b > 0 ? 'best: ' + b + ' pts' : '';
}

/* ── SCORE POPUP ── */

function showScorePop(x, y, pts) {
  const pop = document.createElement('div');
  pop.className   = 'score-pop';
  pop.textContent = '+' + pts;
  pop.style.left  = x + 'px';
  pop.style.top   = (y - 10) + 'px';
  arena.appendChild(pop);
  setTimeout(() => pop.remove(), 750);
}