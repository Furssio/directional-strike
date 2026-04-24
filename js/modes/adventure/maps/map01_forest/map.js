MapRegistry.register({

  id:    'map01_forest',
  order: 1,
  name:  'Forest',
  theme: 'forest',
  icon:  '🌲',
  background: 'assets/maps/map01_forest/background_01.png',

  stressTarget: 15,
  stressRampPerWave: 2,
  speedIncreasePerLevel: 0.04,
  killsBase: 6,
  killsScaling: 1.12,
  minEnemiesAlive: 2,

  enemyPool: {
    ravager: { fromWave: 1, weight: 8 },
    crusher: { fromWave: 3, weight: 2 },
  },

 boss: {
    name:           'Ravager Rush',
    desc:           'A wild horde swarms the arena',
    icon:           '👹',
    enemyPool: {
      ravager: { weight: 10 },
    },
    killsToAdvance:   70,
    speedMult:        1.1,
    spawnIntervalMs:  300,
    maxEnemies:       12,
    stressTarget:     80,
  },
  unlocksAbility: 'range_boost',
});