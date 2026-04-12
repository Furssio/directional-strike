/* ═══════════════════════════════════════
   INPUT.JS
   All keyboard and touch event listeners.

   Used by: nobody — self-executing
   Depends on: state.js, combat.js,
               ui/screens.js, audio.js
   ═══════════════════════════════════════ */

/* ── MENU NAVIGATION ── */

document.getElementById('btn-infinite').addEventListener('click', () => {
  buildCharScreen(selectedCharId);
  showScreen(sChar);
});
document.getElementById('btn-story').addEventListener('click', () => showScreen(sSoon));

document.getElementById('btn-char-confirm').addEventListener('click', startGame);
document.getElementById('btn-char-back').addEventListener('click', () => showScreen(sMenu));

document.getElementById('btn-restart').addEventListener('click', () => {
  buildCharScreen(selectedCharId);
  showScreen(sChar);
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

/* ── SHIELD ── */

btnShield.addEventListener('mousedown', () => setShield(true));
btnShield.addEventListener('touchstart', e => {
  e.preventDefault();
  setShield(true);
}, { passive: false });

document.addEventListener('mouseup',  () => { if (player && running) setShield(false); });
document.addEventListener('touchend', () => { if (player && running) setShield(false); });

/* ── SPECIAL ── */

btnSpecial.addEventListener('mousedown', activateSpecial);
btnSpecial.addEventListener('touchstart', e => {
  e.preventDefault();
  activateSpecial();
}, { passive: false });

/* ── KEYBOARD ── */

document.addEventListener('keydown', e => {
  if (e.code === 'KeyS') {
    e.preventDefault();
    if (running && !choosingAbility) setShield(true);
    return;
  }
  if (e.code === 'KeyD') {
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

document.addEventListener('keyup', e => {
  if (e.code === 'KeyS') {
    e.preventDefault();
    if (running) setShield(false);
  }
});
/* ══════════════════════════════════════
   UI CALLBACKS
   ══════════════════════════════════════ */

function onCharSelected(charId) {
  selectedCharId = charId;
}
updateMenuBest();