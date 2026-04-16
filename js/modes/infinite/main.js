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

  /* ── PLAYER ── */
  'js/player/stats.js',
  'js/player/Player.js',
  'js/player/abilities/bulletTime.js',

  /* ── AUDIO ── */
  'js/audio.js',

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