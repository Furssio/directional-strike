const SCRIPTS = [
  'js/config.js',
  'js/core/CharacterRegistry.js',
  'js/core/EnemyRegistry.js',
  'js/core/AbilityRegistry.js',
  'js/core/WaveRegistry.js',
  'js/player/characters/kael.js',
  'js/player/characters/syra.js',
  'js/player/characters/bron.js',
  'js/player/abilities/common.js',
  'js/audio.js',
  'js/classes/Player.js',
  'js/classes/Enemy.js',
  'js/classes/Bullet.js',
  'js/state.js',
  'js/modes/infinite/waves.js',
  'js/modes/infinite/stress/calculator.js',
  'js/modes/infinite/stress/events.js',
  'js/modes/infinite/spawner.js',
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