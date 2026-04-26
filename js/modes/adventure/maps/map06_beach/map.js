MapRegistry.register({
  id:         'map06_beach',
  order:      6,
  name:       'Beach',
  theme:      'beach',
  background: 'assets/maps/map06_beach/background_01.png',

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
    scorpion: 2,
    parrot:   1,
    crab:     2,
    turtle:   2,
  },
  introWaves: {
    1: { pool: ['scorpion'], kills: 1 },
    2: { pool: ['crab'],     kills: 2 },
    3: { pool: ['parrot'],   kills: 2 },
    4: { pool: ['turtle'],   kills: 2 },
    5: { pool: ['scorpion', 'crab'], kills: 3 },
  },

  enemyPool: {
    scorpion: { fromWave: 6, weight: 4 },
    crab:     { fromWave: 6, weight: 3 },
    parrot:   { fromWave: 8, weight: 2 },
    turtle:   { fromWave: 10, weight: 2 },
  },

  boss: {
    name:           'Tide Reaper',
    desc:           'The sea rises',
    icon:           '🏖️',
    enemyPool:      { crab: { weight: 8 }, turtle: { weight: 2 } },
    killsToAdvance: 80,
    speedMult:      1.0,
    spawnIntervalMs: 350,
    maxEnemies:     5,
    stressTarget:   90,
  },

  unlocksAbility: null,
});