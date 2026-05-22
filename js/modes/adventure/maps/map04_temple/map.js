MapRegistry.register({

  id:    'map04_temple',
  order: 4,
  name:  'Temple',
  theme: 'temple',
  icon:  '⛩️',
  background: 'assets/maps/map04_temple/background_01.webp',

  totalWaves: 1,
  minEnemiesAlive: 1,
  maxPerDirection: 6,
  gateThreshold: 0.25,
maxPerDirection: 2,

  scalingAt: {},

  waveConfig: {

    // Wave 1 — single long wave, pure survival
    1: {
      duration: 90,
      spawnInterval: 2000,
      maxAlive: 6,
      minAlive: 2,
      pool: { crusher: 6, tornado: 4, golem: 1 },
      burstChance: 0.20,
      burstSize: 2,
    },

  },

  enemyPool: {
    crusher: { fromWave: 1, weight: 6 },
    tornado: { fromWave: 1, weight: 4 },
    golem:   { fromWave: 1, weight: 1 },
  },

  unlocksAbility: null,

});