MapRegistry.register({
  id:         'map03_desert',
  order:      3,
  name:       'Desert',
  theme:      'desert',
  background: 'assets/maps/map03_desert/background_01.png',
  stressTarget: 30,
  enemyPool: {
    ravager: { fromWave: 1, weight: 8 },
    crusher: { fromWave: 3, weight: 2 },
  },
  boss: {
    name: 'Sand Colossus',
    desc: 'The desert trembles',
    icon: '🏜️',
    enemyPool: { crusher: { weight: 10 } },
    killsToAdvance: 20,
    speedMult: 1.4,
    maxEnemies: 5,
  },
  unlocksAbility: null,
});