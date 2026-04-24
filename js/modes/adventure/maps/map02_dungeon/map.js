MapRegistry.register({

  id:    'map02_dungeon',
  order: 2,
  name:  'Dungeon',
  theme: 'dungeon',
  icon:  '🪨',
  background: 'assets/maps/map02_dungeon/background_01.png',

  stressTarget: 29,
  stressRampPerWave: 1.8,
  speedIncreasePerLevel: 0.04,
  killsBase: 6,
  killsScaling: 1.12,
  minEnemiesAlive: 2,

  enemyPool: {
    ravager:     { fromWave: 1, weight: 7 },
    slime_large: { fromWave: 1, weight: 5 },
    golem:       { fromWave: 3, weight: 3 },
  },

  boss: {
    name:           'Slime Flood',
    desc:           'The dungeon oozes from every wall',
    icon:           '🟢',
    enemyPool: {
      slime_large: { weight: 10 },
    },
    killsToAdvance:  50,
    speedMult:       0.8,
    spawnIntervalMs: 450,
    maxEnemies:      8,
    stressTarget:    80,
  },
  unlocksAbility: null,
});