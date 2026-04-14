/* ═══════════════════════════════════════
   INPUT.JS
   All keyboard and touch event listeners.

   Used by: nobody — self-executing
   Depends on: state.js, combat.js,
               ui/screens.js, audio.js
   ═══════════════════════════════════════ */

/* ── MENU NAVIGATION ── */

document.getElementById('btn-infinite').addEventListener('click', () => {
  startGame();
});
document.getElementById('btn-story').addEventListener('click', () => showScreen(sSoon));

document.getElementById('btn-restart').addEventListener('click', () => {
  startGame();
});
document.getElementById('btn-home').addEventListener('click', () => {
  updateMenuBest();
  showScreen(sMenu);
});

document.getElementById('btn-soon-back').addEventListener('click', () => showScreen(sMenu));

/* ── AUDIO ── */

btnMute.addEventListener('click', () => {
  SFX.init();
  CONFIG.audio.enabled = !CONFIG.audio.enabled;
  btnMute.textContent  = CONFIG.audio.enabled ? '🔊 audio on' : '🔇 audio off';
});

/* ── DIRECTIONAL BUTTONS ── */

['up', 'down', 'left', 'right'].forEach(dir => {
  const btn = document.getElementById('btn-' + dir);
  btn.addEventListener('click', () => handleDir(dir));
  btn.addEventListener('touchstart', e => {
    e.preventDefault();
    handleDir(dir);
  }, { passive: false });
});

/* ── SPECIAL ── */

btnSpecial.addEventListener('mousedown', activateSpecial);
btnSpecial.addEventListener('touchstart', e => {
  e.preventDefault();
  activateSpecial();
}, { passive: false });

/* ── KEYBOARD ── */

document.addEventListener('keydown', e => {
  // Space = special
  if (e.code === 'Space') {
    e.preventDefault();
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
    const btn = document.getElementById('btn-' + map[e.key]);
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 120);
    handleDir(map[e.key]);
  }
});

/* ── DEV CHEATS ── */
const DEV_CHEATS = true; // set to false before publishing

document.addEventListener('keydown', e => {
  if (!DEV_CHEATS || !running) return;

  // W — skip to next wave
  if (e.code === 'KeyW') {
    e.preventDefault();
    const needed = Director.getKillsNeeded();
    const kills  = Director.getKills();
    const diff   = needed - kills;
    for (let i = 0; i < diff; i++) Director.onKill();
    return;
  }

  // K — full HP
  if (e.code === 'KeyK') {
    e.preventDefault();
    player.hp = player.maxHp;
    updateHpBar();
    return;
  }

  // F — full special bar
  if (e.code === 'KeyF') {
    e.preventDefault();
    player.specialCharge = 100;
    updateSpecialBar();
    return;
  }
});

updateMenuBest();