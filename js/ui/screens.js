/* ═══════════════════════════════════════
   SCREENS.JS
   Screen navigation, score popup, high score.

   Used by: input.js, loop.js
   Depends on: dom.js, state.js
   ═══════════════════════════════════════ */

/* ── SCREEN NAVIGATION ── */

function showScreen(s) {
  [sMenu, sGame, sOver, sAbility, sMapSelect, sMapComplete].forEach(x => x.style.display = 'none');
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
  if (!menuBest) return;
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
/* ── MAP COMPLETE ── */

function showMapComplete(map, newlyUnlocked) {
  // stop game loop
  running = false;

  // populate card
  document.getElementById('map-complete-icon').textContent = map.icon || '🏆';
  document.getElementById('map-complete-name').textContent = map.name;

  // ability unlock section
  const abilitySection = document.getElementById('map-complete-ability');
  if (newlyUnlocked && map.unlocksAbility) {
    const aDef = AbilityRegistry.get(map.unlocksAbility);
    if (aDef) {
      document.getElementById('map-complete-ability-icon').innerHTML =
        '<img src="assets/abilities/' + aDef.id + '.png" width="48" height="48" style="image-rendering:pixelated">';
      document.getElementById('map-complete-ability-name').textContent = aDef.name || aDef.id;
      document.getElementById('map-complete-ability-desc').textContent = aDef.desc || '';
      abilitySection.classList.remove('hidden');
    }
  } else {
    abilitySection.classList.add('hidden');
  }

  // show screen
  showScreen(sMapComplete);

  // button handlers (clean up old listeners)
  const btnContinue = document.getElementById('btn-map-continue');
  const btnAbilities = document.getElementById('btn-go-abilities');

  const newContinue = btnContinue.cloneNode(true);
  btnContinue.parentNode.replaceChild(newContinue, btnContinue);
  newContinue.addEventListener('click', () => {
    showScreen(sMapSelect);
    if (typeof initMapSelect === 'function') initMapSelect();
  });

  const newAbilities = btnAbilities.cloneNode(true);
  btnAbilities.parentNode.replaceChild(newAbilities, btnAbilities);
  newAbilities.addEventListener('click', () => {
    showScreen(sMapSelect);
    if (typeof initMapSelect === 'function') initMapSelect();
  });
}