/* ═══════════════════════════════════════
   SCREENS.JS
   Screen navigation, score popup, high score.

   Used by: input.js, loop.js
   Depends on: dom.js, state.js
   ═══════════════════════════════════════ */

/* ── SCREEN NAVIGATION ── */

function showScreen(s) {
  [sMenu, sGame, sOver, sAbility, sMapSelect].forEach(x => x.style.display = 'none');
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

const _popColors = ['#FFD700','#44ddff','#ff66aa','#66ff66','#ff8844','#aa88ff','#ffff44'];

function showScorePop(x, y, pts) {
  const pop = document.createElement('div');
  const inCombo = player && player.combo >= CONFIG.combo.minKills;
  pop.className = 'score-pop' + (inCombo ? ' combo-pop' : '');
  pop.textContent = '+' + pts.toLocaleString();
  pop.style.left  = x + 'px';
  pop.style.top   = (y - 25) + 'px';
  pop.style.color = _popColors[Math.floor(Math.random() * _popColors.length)];
  arena.appendChild(pop);
  setTimeout(() => pop.remove(), 850);
}