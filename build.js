const fs = require('fs');
const path = require('path');

const FILES = [
  'js/scaler.js',
  'js/config.js',
  'js/crazysdk.js',
  'js/core/EnemyRegistry.js',
  'js/core/AbilityRegistry.js',
  'js/core/WaveRegistry.js',
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
  'js/audio/core.js',
  'js/audio/combat.js',
  'js/audio/ui.js',
  'js/audio/abilities.js',
  'js/audio/music.js',
  'js/audio/index.js',
  'js/audio/uiBind.js',
  'js/adPlaceholder.js',
  'js/state.js',
  'js/modes/infinite/director.js',
  'js/ui/dom.js',
  'js/systems/rangeCircle.js',
  'js/ui/hud.js',
  'js/ui/screens.js',
  'js/ui/abilityScreen.js',
  'js/ui/slotMachine.js',
  'js/ui/slotReels.js',
  'js/systems/juice.js',
  'js/systems/spawn.js',
  'js/systems/combat.js',
  'js/systems/loop.js',
  'js/systems/pause.js',
  'js/systems/upgradeChoice.js',
  'js/systems/orbs.js',
  'js/systems/demoMode.js',
  'js/systems/transition.js',
  'js/systems/mapTransition.js',
  'js/input.js',
  'js/modes/adventure/main.js',
  'js/modes/challenge/challengeDirector.js',
  'js/modes/challenge/challengeUpgradeChoice.js',
  'js/modes/challenge/challengeScreen.js',
  'js/modes/challenge/challengeScaling.js',
  'js/modes/challenge/challengePool.js',
  'js/modes/challenge/challengeTransition.js',
  'js/modes/challenge/challengeDimension.js',
  'js/modes/adventure/MapRegistry.js',
  'js/modes/adventure/progress.js',
  'js/modes/adventure/adventureSpawner.js',
  'js/systems/tutorial.js',
  'js/modes/adventure/adventureDirector.js',
  'js/modes/adventure/maps/map01_forest/map.js',
  'js/modes/adventure/maps/map02_dungeon/map.js',
  'js/modes/adventure/maps/map03_desert/map.js',
  'js/modes/adventure/maps/map04_temple/map.js',
  'js/modes/adventure/maps/map05_snow/map.js',
  'js/modes/adventure/maps/map06_beach/map.js',
  'js/modes/adventure/maps/map07_clouds/map.js',
  'js/modes/adventure/maps/map08_storm/map.js',
  'js/modes/adventure/maps/map09_volcano/map.js',
  'js/modes/adventure/maps/map10_sakura/map.js',
  'js/modes/adventure/maps/map11_dragon/map.js',
  'js/modes/adventure/maps/map12_moon/map.js',
  'js/modes/adventure/maps/map13_dark/map.js',
  'js/modes/adventure/mapSelect.js',
  'js/debug.js',
];

const OUTPUT = 'js/game.bundle.js';
let bundle = '';
let count = 0;
let missing = 0;

for (const f of FILES) {
  const fp = path.join(__dirname, f);
  if (fs.existsSync(fp)) {
    bundle += `/* === ${f} === */\n`;
    bundle += fs.readFileSync(fp, 'utf8');
    bundle += '\n\n';
    count++;
  } else {
    console.log('  WARNING: ' + f + ' NOT FOUND');
    missing++;
  }
}

bundle += '/* === ADVENTURE PRE-LOADED === */\n';
bundle += '_adventureLoaded = true;\n';

fs.writeFileSync(path.join(__dirname, OUTPUT), bundle, 'utf8');

console.log(`Done! ${count} files -> ${OUTPUT} (${bundle.length} bytes)`);
if (missing > 0) console.log(`${missing} file(s) missing`);