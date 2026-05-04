/* ═══════════════════════════════════════
   INPUT.JS
   All keyboard and touch event listeners.

   Used by: nobody — self-executing
   Depends on: state.js, combat.js,
               ui/screens.js, ui/abilityScreen.js,
               audio.js
   ═══════════════════════════════════════ */

/* ── MENU NAVIGATION ── */

document.getElementById('btn-infinite').addEventListener('click', () => {
  DemoMode.stop();
  equippedAbilityId = getEquippedAbility();
  ActiveDirector = Director;
  startGame();
});
document.getElementById('btn-adventure').addEventListener('click', () => {
  DemoMode.stop();
  loadAdventureMode(() => {
    buildMapSelectScreen();
    showScreen(sMapSelect);
  });
});

// challenge mode — locked for now
document.getElementById('btn-challenge').addEventListener('click', () => {
  // TODO: unlock after adventure complete
});

// how to play — placeholder
document.getElementById('btn-howtoplay').addEventListener('click', () => {
  // TODO: show how to play screen
});
document.getElementById('btn-abilities').addEventListener('click', () => {
  DemoMode.stop();
  buildAbilityScreen();
  showScreen(sAbility);
});
document.getElementById('btn-ability-back').addEventListener('click', () => {
  showScreen(sMenu);
  DemoMode.start();
});

document.getElementById('btn-restart').addEventListener('click', () => {
  equippedAbilityId = getEquippedAbility();

  // Adventure Mode: re-init the current map before starting
  if (ActiveDirector && ActiveDirector === AdventureDirector) {
    if (!AdventureDirector.restart()) {
      // safety fallback — no map loaded, go back to menu
      showScreen(sMenu);
      return;
    }
  }

  startGame();
});
document.getElementById('btn-home').addEventListener('click', () => {
  updateMenuBest();
  showScreen(sMenu);
  DemoMode.start();
});

document.getElementById('btn-map-back').addEventListener('click', () => {
  showScreen(sMenu);
  DemoMode.start();
});

/* ── AUDIO ── */

// SFX toggle
document.getElementById('btn-sfx').addEventListener('click', () => {
  SFX.init();
  CONFIG.audio.enabled = !CONFIG.audio.enabled;
  document.getElementById('btn-sfx').classList.toggle('muted', !CONFIG.audio.enabled);
  document.getElementById('btn-sfx').querySelector('.menu-btn-icon').textContent =
    CONFIG.audio.enabled ? '🔊' : '🔇';
});

// Music toggle — placeholder for now
document.getElementById('btn-music').addEventListener('click', () => {
  const btn = document.getElementById('btn-music');
  btn.classList.toggle('muted');
  btn.querySelector('.menu-btn-icon').textContent =
    btn.classList.contains('muted') ? '🔇' : '🎵';
});

/* ── DIRECTIONAL BUTTONS ── */

['up', 'down', 'left', 'right'].forEach(dir => {
  const btn = document.getElementById('btn-' + dir);
  if (btn) {
    btn.addEventListener('click', () => {
      handleDir(dir);
      if (ActiveDirector && ActiveDirector.trackInput) ActiveDirector.trackInput();
    });
    btn.addEventListener('touchstart', e => {
      e.preventDefault();
      handleDir(dir);
      if (ActiveDirector && ActiveDirector.trackInput) ActiveDirector.trackInput();
    }, { passive: false });
  }
});
/* ── SPECIAL ── */

const specialBtn = document.getElementById('btn-special');
if (specialBtn) {
  specialBtn.addEventListener('mousedown', () => {
    activateSpecial();
    if (ActiveDirector && ActiveDirector.trackInput) ActiveDirector.trackInput();
  });
  specialBtn.addEventListener('touchstart', e => {
    e.preventDefault();
    activateSpecial();
    if (ActiveDirector && ActiveDirector.trackInput) ActiveDirector.trackInput();
  }, { passive: false });
}
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
    if (btn) btn.classList.add('pressed');
    setTimeout(() => { if (btn) btn.classList.remove('pressed'); }, 120);
    handleDir(map[e.key]);
    if (ActiveDirector && ActiveDirector.trackInput) ActiveDirector.trackInput();
  }
});

/* ── DEV CHEATS ── */
const DEV_CHEATS = true;

document.addEventListener('keydown', e => {
  if (!DEV_CHEATS || !running) return;

  if (e.code === 'KeyW') {
    e.preventDefault();
    const needed = ActiveDirector.getKillsNeeded();
    const kills  = ActiveDirector.getKills();
    const diff   = needed - kills;
    for (let i = 0; i < diff; i++) ActiveDirector.onKill();
    return;
  }

  if (e.code === 'KeyK') {
    e.preventDefault();
    player.hp = player.maxHp;
    updateHpBar();
    return;
  }

  if (e.code === 'KeyF') {
    e.preventDefault();
    player.specialCharge = 100;
    updateSpecialBar();
    return;
  }
});

updateMenuBest();
DemoMode.start();
// btnMute removed — audio controls now in menu bottom bar (btn-sfx, btn-music)