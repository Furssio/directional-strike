MapRegistry.register({
  id:         'map03_desert',
  order:      3,
  name:       'Desert',
  theme:      'desert',
  background: 'assets/maps/map03_desert/background_01.png',
  stressTarget: 30,
   enemyPool: {
    crusher:  { fromWave: 1, weight: 3 },
    tornado:  { fromWave: 1, weight: 4 },
    scorpion: { fromWave: 2, weight: 3 },
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