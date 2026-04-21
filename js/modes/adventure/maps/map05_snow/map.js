MapRegistry.register({
  id:         'map05_snow',
  order:      5,
  name:       'Snow',
  theme:      'snow',
  background: 'assets/maps/map05_snow/background_01.png',
  stressTarget: 32,
  enemyPool: {
    ravager: { fromWave: 1, weight: 8 },
    crusher: { fromWave: 3, weight: 2 },
  },
  boss: {
    name:           'Frost Giant',
    desc:           'The blizzard arrives',
    icon:           '❄️',
    enemyPool:      { golem: { weight: 10 } },
    killsToAdvance: 20,
    speedMult:      1.4,
    maxEnemies:     5,
  },
  unlocksAbility: null,
});