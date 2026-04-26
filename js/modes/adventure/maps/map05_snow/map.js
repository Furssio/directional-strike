MapRegistry.register({
  id:         'map05_snow',
  order:      5,
  name:       'Snow',
  theme:      'snow',
  background: 'assets/maps/map05_snow/background_01.png',

  wavesPerMap: 20,

  stressTarget: 30,
  stressRampPerWave: 3,
  speedIncreasePerLevel: 0.015,
  killsBase: 7,
  killsScaling: 1.22,
  minEnemiesAlive: 2,
  speedVariationChance: 0.30,
  speedVariationBoosts: [1.15, 1.20, 1.25],

  introWaves: {
    1: { pool: ['spectral_deer'], kills: 2 },
    2: { pool: ['spectral_deer'], kills: 2 },
    3: { pool: ['wolf'],          kills: 2 },
    4: { pool: ['wolf'],          kills: 2 },
    5: { pool: ['bear'],          kills: 1 },
  },

 maxEnemies: 4,

  maxInField: {
    spectral_deer: 2,
    wolf: 2,
    bear: 1,
  },

  enemyPool: {
    spectral_deer: { fromWave: 6, weight: 4 },
    wolf:          { fromWave: 6, weight: 3 },
    bear:          { fromWave: 10, weight: 2 },
  },
 boss: {
    name:           'Frost Giant',
    desc:           'The blizzard arrives',
    icon:           '❄️',
    enemyPool:      { spectral_deer: { weight: 10 } },
    killsToAdvance: 80,
    speedMult:      1.3,
    spawnIntervalMs: 350,
    maxEnemies:     9,
    stressTarget:   90,
  },
  unlocksAbility: null,
});