/* ═══════════════════════════════════════
   MAIN.JS
   Entry point for Infinite Mode.
   Loads all scripts in order.

   This is the only script referenced in
   index.html for this mode.
   ═══════════════════════════════════════ */

const SCRIPTS = [
  'js/config.js',
  'js/abilities.js',
  'js/audio.js',
  'js/classes/Player.js',
  'js/classes/Enemy.js',
  'js/classes/Bullet.js',
  'js/state.js',
  'js/modes/infinite/director.js',
  'js/ui/dom.js',
  'js/ui/hud.js',
  'js/ui/screens.js',
  'js/systems/juice.js',
  'js/systems/spawn.js',
  'js/systems/combat.js',
  'js/systems/loop.js',
  'js/input.js',
];

(function loadScripts(scripts, index) {
  if (index >= scripts.length) return;
  const s = document.createElement('script');
  s.src = scripts[index];
  s.onload = () => loadScripts(scripts, index + 1);
  s.onerror = (e) => console.error('Failed to load script:', scripts[index], e);
  document.head.appendChild(s);
})(SCRIPTS, 0);