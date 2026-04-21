MapRegistry.register({
  id:         'map07_clouds',
  order:      7,
  name:       'Clouds',
  theme:      'clouds',
  background: 'assets/maps/map07_clouds/background_01.png',
  stressTarget: 36,
  enemyPool: {
    ravager: { fromWave: 1, weight: 8 },
    crusher: { fromWave: 3, weight: 2 },
  },
  boss: {
    name:           'Storm Rider',
    desc:           'Lightning strikes from above',
    icon:           '☁️',
    enemyPool:      { crusher: { weight: 10 } },
    killsToAdvance: 20,
    speedMult:      1.5,
    maxEnemies:     5,
  },
  unlocksAbility: null,
});