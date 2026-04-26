MapRegistry.register({
  id:         'map07_clouds',
  order:      7,
  name:       'Clouds',
  theme:      'clouds',
  background: 'assets/maps/map07_clouds/background_01.png',

  wavesPerMap: 20,

  stressTarget: 30,
  stressRampPerWave: 2,
  speedIncreasePerLevel: 0.015,
  killsBase: 7,
  killsScaling: 1.20,
  minEnemiesAlive: 1,
  maxEnemies: 4,

  speedVariationChance: 0.25,
  speedVariationBoosts: [1.10, 1.15, 1.20],

  maxInField: {
    tornado:       2,
    eagle:         2,
    thunder_hound: 1,
  },

  introWaves: {
    1: { pool: ['tornado'],       kills: 3 },
    2: { pool: ['tornado'],       kills: 3 },
    3: { pool: ['eagle'],         kills: 2 },
    4: { pool: ['eagle'],         kills: 2 },
    5: { pool: ['thunder_hound'], kills: 2 },
  },

  enemyPool: {
    tornado:       { fromWave: 6, weight: 4 },
    eagle:         { fromWave: 6, weight: 3 },
    thunder_hound: { fromWave: 9, weight: 2 },
  },

  boss: {
    name:           'Storm Rider',
    desc:           'Lightning strikes from above',
    icon:           '⛈️',
    enemyPool:      { tornado: { weight: 7 }, eagle: { weight: 3 } },
    killsToAdvance: 80,
    speedMult:      1.0,
    spawnIntervalMs: 350,
    maxEnemies:     5,
    stressTarget:   90,
  },

  unlocksAbility: null,
});