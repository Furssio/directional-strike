/* ═══════════════════════════════════════
   MAIN.JS
   Entry point for Infinite Mode.
   Loads all scripts in order.
   ═══════════════════════════════════════ */

const SCRIPTS = [

  /* ── CONFIG ── */
  'js/config.js',

  /* ── CORE REGISTRIES ── */
  'js/core/EnemyRegistry.js',
  'js/core/AbilityRegistry.js',
  'js/core/WaveRegistry.js',

  /* ── ENEMIES ── */
  'js/enemies/Enemy.js',
  'js/enemies/Bullet.js',
  'js/enemies/ravager.js',
  'js/enemies/crusher.js',
  'js/enemies/golem.js',
  'js/enemies/slimes.js',
  'js/enemies/tornado.js',
  'js/enemies/scorpion.js',
  'js/enemies/bear.js',
  'js/enemies/spectralDeer.js',
  'js/enemies/wolf.js',
  'js/enemies/parrot.js',
  'js/enemies/crab.js',
  'js/enemies/turtle.js',
  'js/enemies/eagle.js',
  'js/enemies/thunderHound.js',
  'js/enemies/slimeLava.js',
  'js/enemies/golemLava.js',
  'js/enemies/naraDeer.js',
  'js/enemies/kitsune.js',
  'js/enemies/oni.js',
  'js/enemies/frog.js',
  'js/enemies/star.js',

 /* ── PLAYER ── */
  'js/player/stats.js',
  'js/player/Player.js',
  'js/player/abilities/bulletTime.js',
  'js/player/abilities/rangeBoost.js',
  'js/player/abilities/shield.js',
  'js/player/abilities/fullHeal.js',
  'js/player/abilities/explosion.js',
  'js/player/abilities/oneHit.js',
  'js/player/abilities/doubleStrike.js',
  'js/player/abilities/slash.js',

  /* ── AUDIO ── */
  'js/audio.js',
  'js/sfx-combat.js',
  'js/sfx-abilities.js',
  'js/sfx-ui.js',
  'js/sfx.js',
  'js/music.js',
  
  /* ── STATE ── */
  'js/state.js',

  /* ── INFINITE MODE ── */
  'js/modes/infinite/waves.js',
  'js/modes/infinite/stress/calculator.js',
  'js/modes/infinite/stress/events.js',
  'js/modes/infinite/spawner.js',
  'js/modes/infinite/director.js',

  /* ── UI ── */
  'js/ui/dom.js',
  'js/ui/hud.js',
  'js/ui/screens.js',
  'js/ui/abilityScreen.js',

  /* ── SYSTEMS ── */
  'js/systems/juice.js',
  'js/systems/spawn.js',
  'js/systems/combat.js',
  'js/systems/loop.js',
  'js/systems/pause.js',
  'js/systems/upgradeChoice.js',
  'js/systems/orbs.js',
  'js/systems/demoMode.js',
  'js/systems/transition.js',

  /* ── INPUT ── */
  'js/input.js',
  
 /* ── ADVENTURE (entry, does not auto-run) ── */
  'js/modes/adventure/main.js',
];

(function loadScripts(scripts, index) {
  if (index >= scripts.length) return;
  const s = document.createElement('script');
  s.src = scripts[index];
  s.onload = () => loadScripts(scripts, index + 1);
  s.onerror = (e) => console.error('Failed to load script:', scripts[index], e);
  document.head.appendChild(s);
})(SCRIPTS, 0);