MapRegistry.register({

  id:    'map01_forest',
  order: 1,
  name:  'Forest',
  theme: 'forest',
  icon:  '🌲',
  background: 'assets/maps/map01_forest/background_01.png',

  wavesPerMap: 10,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  waveConfig: {
    1:  { spawnInterval: 2500, maxAlive: 2, minAlive: 1, pool: { ravager: 10 }, burstChance: 0, burstSize: 1 },
    2:  { spawnInterval: 2200, maxAlive: 3, minAlive: 1, pool: { ravager: 5, crusher: 5 }, burstChance: 0.2, burstSize: 2 },
    4:  { spawnInterval: 1800, maxAlive: 4, minAlive: 2, pool: { ravager: 10 }, burstChance: 0.3, burstSize: 2 },
    5:  { spawnInterval: 1600, maxAlive: 5, minAlive: 2, pool: { ravager: 8, crusher: 2 }, burstChance: 0.4, burstSize: 2 },
    7:  { spawnInterval: 1400, maxAlive: 5, minAlive: 2, pool: { ravager: 7, crusher: 3 }, burstChance: 0.4, burstSize: 3 },
    8:  { spawnInterval: 1200, maxAlive: 6, minAlive: 2, pool: { ravager: 6, crusher: 4 }, burstChance: 0.5, burstSize: 3 },
  },

  /* fallback pool for waves without waveConfig */
  enemyPool: {
    ravager: { fromWave: 1, weight: 8 },
    crusher: { fromWave: 5, weight: 2 },
  },

  boss: {
    name:           'Ravager Rush',
    desc:           'A wild horde swarms the arena',
    icon:           '👹',
    pool:           { ravager: 10 },
    killsToAdvance: 70,
    speedMult:      1.1,
    spawnInterval:  400,
    maxAlive:       10,
    minAlive:       4,
  },

  unlocksAbility: 'range_boost',
});