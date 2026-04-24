MapRegistry.register({
  id:         'map03_desert',
  order:      3,
  name:       'Desert',
  theme:      'desert',
  icon:       '🏜️',
  background: 'assets/maps/map03_desert/background_01.png',

  stressTarget: 25,
  stressRampPerWave: 2,
  speedIncreasePerLevel: 0.04,
  killsBase: 6,
  killsScaling: 1.12,
  minEnemiesAlive: 2,

  enemyPool: {
    tornado:  { fromWave: 1, weight: 5 },
    crusher:  { fromWave: 1, weight: 4 },
    scorpion: { fromWave: 3, weight: 3 },
  },

  boss: {
    name:           'Sand Colossus',
    desc:           'The desert trembles',
    icon:           '🏜️',
    enemyPool: {
      tornado:  { weight: 6 },
      scorpion: { weight: 4 },
    },
    killsToAdvance: 45,
    speedMult:      1.1,
    spawnIntervalMs: 350,
    maxEnemies:     10,
    stressTarget:   80,
  },

  unlocksAbility: null,
});