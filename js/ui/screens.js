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

  // fireflies only on menu
  if (s === sMenu) startMenuFireflies();
  else stopMenuFireflies();
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
/* ── MENU FIREFLIES ── */

let menuFireflies = [];
let fireflyRAF = null;

function startMenuFireflies() {
  stopMenuFireflies();
  const container = document.getElementById('screen-menu');
  if (!container) return;

  const count = 40;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:absolute;
      width:3px;height:3px;
      border-radius:50%;
      background:#ffffcc;
      box-shadow:0 0 6px 2px rgba(255,255,200,0.6);
      pointer-events:none;
      z-index:10;
      opacity:0;
    `;
    container.appendChild(p);

    menuFireflies.push({
      el: p,
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.1,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.7,
    });
  }

  function animFireflies(now) {
    const t = now * 0.001;
    for (const f of menuFireflies) {
      f.x += f.vx * f.speed;
      f.y += f.vy * f.speed;

      // wrap around
      if (f.x < -5) f.x = 105;
      if (f.x > 105) f.x = -5;
      if (f.y < -5) f.y = 105;
      if (f.y > 105) f.y = -5;

      // gentle wobble
      const wx = Math.sin(t * 0.8 + f.phase) * 0.3;
      const wy = Math.cos(t * 0.6 + f.phase) * 0.2;

      // fade in/out pulse
      const alpha = (Math.sin(t * f.speed + f.phase) + 1) * 0.5;
      const opacity = alpha * 0.7 + 0.05;

      f.el.style.left = (f.x + wx) + '%';
      f.el.style.top = (f.y + wy) + '%';
      f.el.style.opacity = opacity;
    }
    fireflyRAF = requestAnimationFrame(animFireflies);
  }

  fireflyRAF = requestAnimationFrame(animFireflies);
}

function stopMenuFireflies() {
  if (fireflyRAF) {
    cancelAnimationFrame(fireflyRAF);
    fireflyRAF = null;
  }
  for (const f of menuFireflies) {
    f.el.remove();
  }
  menuFireflies = [];
}
startMenuFireflies();