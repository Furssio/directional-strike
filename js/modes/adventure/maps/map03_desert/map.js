MapRegistry.register({
  id:         'map03_desert',
  order:      3,
  name:       'Desert',
  theme:      'desert',
  icon:       '🏜️',
  background: 'assets/maps/map03_desert/background_01.png',

  stressTarget: 35,
  stressRampPerWave: 2.2,
  speedIncreasePerLevel: 0.03,
  killsBase: 7,
  killsScaling: 1.18,
  minEnemiesAlive: 2,

  speedOverrides: {
    crusher:  0.85,
  },

  enemyPool: {
    scorpion: { fromWave: 1, weight: 5 },
    crusher:  { fromWave: 2, weight: 6 },
    golem:    { fromWave: 3, weight: 3 },
    tornado:  { fromWave: 4, weight: 2 },
  },

boss: {
    name:           'Sand Colossus',
    desc:           'The desert trembles',
    icon:           '🏜️',
    enemyPool: {
      tornado:  { weight: 5 },
      scorpion: { weight: 5 },
    },
    killsToAdvance:  80,
    speedMult:       0.80,
    spawnIntervalMs: 300,
    maxEnemies:      14,
    stressTarget:    90,
  },

  unlocksAbility: null,
});