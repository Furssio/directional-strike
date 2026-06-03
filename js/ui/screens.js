/* ═══════════════════════════════════════
   SCREENS.JS
   Screen navigation, score popup, high score.

   Used by: input.js, loop.js
   Depends on: dom.js, state.js
   ═══════════════════════════════════════ */

/* ── SCREEN NAVIGATION ── */

function showScreen(s) {
  [sMenu, sGame, sAbility, sMapSelect, sChallenge].forEach(x => {
    if (x) x.style.display = 'none';
  });
 s.style.display = 'block';

  // stop map music when entering game (playMap starts it in startGame)
  if (s === sGame && typeof Music !== 'undefined') Music.stop();

  // always hide overlays when switching screens
  if (overOverlay) overOverlay.classList.add('hidden');
  if (completeOverlay) completeOverlay.classList.add('hidden');

 // stop all ability audio when leaving game screen
  if (s !== sGame && typeof SFX !== 'undefined') SFX.stopAll();

  // cleanup challenge choice state when leaving game
  if (s !== sGame) {
    if (typeof resetChallengeChoices === 'function') resetChallengeChoices();
    if (typeof resetUpgradeChoices === 'function') resetUpgradeChoices();
    const arrowHint = document.getElementById('upgrade-arrow-hint');
    if (arrowHint) arrowHint.remove();
  }

  // fireflies only on menu
  if (s === sMenu) startMenuFireflies();
  else stopMenuFireflies();

  // menu music: play on any non-game screen, let it continue across screens
  if (s !== sGame && typeof Music !== 'undefined') {
    Music.playMenu();
  }
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

function showMapComplete(map, hasSlot) {
  // stop game loop
  running = false;
  clearInterval(gameLoop);

  // fade out map music
  if (typeof Music !== 'undefined') Music.fadeOut();

  // mark first play as done
  try { localStorage.setItem('ds_first_play_done', '1'); }
  catch (e) { /* silent */ }
  if (typeof CrazySDKWrapper !== 'undefined') {
    CrazySDKWrapper.gameplayStop();
    CrazySDKWrapper.happytime();
  }

  // populate overlay
  document.getElementById('complete-map-name').textContent = map.name || map.id;
  document.getElementById('complete-score').textContent =
    (player ? player.score : 0).toLocaleString();

  // hide ability section + buttons initially
  const abilitySection = document.getElementById('complete-ability');
  abilitySection.classList.add('hidden');
  const btnCol = document.querySelector('.complete-btn-col');
  if (btnCol) btnCol.style.display = 'none';

  // show overlay
  completeOverlay.classList.remove('hidden');

  // setup button handlers now (they stay hidden until ready)
  _setupCompleteButtons();

  if (hasSlot && typeof SlotMachine !== 'undefined') {
    // short delay so player sees score first, then open slot
    setTimeout(() => {
      SlotMachine.open({
        mode: 'guaranteed',
        isLastVideo: false,
        onResult: (abilityId) => {
          // ability already unlocked by SlotMachine internally
          if (abilityId) {
            const aDef = AbilityRegistry.get(abilityId);
            if (aDef) {
              document.getElementById('complete-ability-icon').innerHTML =
                '<img src="assets/abilities/' + aDef.id + '.png" width="48" height="48" style="image-rendering:pixelated">';
              document.getElementById('complete-ability-name').textContent = aDef.name || aDef.id;
              document.getElementById('complete-ability-desc').textContent = aDef.desc || '';
              abilitySection.classList.remove('hidden');
            }
          }
        },
        onClose: () => {
          // show buttons after slot closes
          if (btnCol) btnCol.style.display = '';
        },
      });
    }, 800);
  } else {
    // no slot — show buttons immediately
    if (btnCol) btnCol.style.display = '';
  }
}



function _setupCompleteButtons() {
  const btnAgain = document.getElementById('btn-play-again');
  const btnMaps  = document.getElementById('btn-complete-maps');

  const newAgain = btnAgain.cloneNode(true);
  btnAgain.parentNode.replaceChild(newAgain, btnAgain);
  newAgain.addEventListener('click', () => {
    if (Transition.isPlaying()) return;
    completeOverlay.classList.add('hidden');
    cleanupArena();
    Transition.play('fast', () => {
      equippedAbilityId = getEquippedAbility();
      if (AdventureDirector.restart()) {
        startGame(true);
      } else {
        showScreen(sMapSelect);
        if (typeof initMapSelect === 'function') initMapSelect();
      }
    }, () => {
      startGameLoop();
    });
  });

  const newMaps = btnMaps.cloneNode(true);
  btnMaps.parentNode.replaceChild(newMaps, btnMaps);
  newMaps.addEventListener('click', () => {
    if (Transition.isPlaying()) return;
    completeOverlay.classList.add('hidden');
    cleanupArena();
    // stamp animation for the just-completed map
    const completedMap = AdventureDirector.getCurrentMap();
    if (completedMap && typeof setPendingStamp === 'function') {
      setPendingStamp(completedMap.id);
    }
    Transition.play('fast', () => {
      showScreen(sMapSelect);
      if (typeof initMapSelect === 'function') initMapSelect();
    });
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

      if (f.x < -5) f.x = 105;
      if (f.x > 105) f.x = -5;
      if (f.y < -5) f.y = 105;
      if (f.y > 105) f.y = -5;

      const wx = Math.sin(t * 0.8 + f.phase) * 0.3;
      const wy = Math.cos(t * 0.6 + f.phase) * 0.2;

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
