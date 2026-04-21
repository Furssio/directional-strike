MapRegistry.register({
  id:         'map09_volcano',
  order:      9,
  name:       'Volcano',
  theme:      'volcano',
  background: 'assets/maps/map09_volcano/background_01.png',
  stressTarget: 38,
  enemyPool: {
    ravager: { fromWave: 1, weight: 7 },
    crusher: { fromWave: 2, weight: 3 },
  },
  boss: {
    name:           'Magma Lord',
    desc:           'The volcano erupts',
    icon:           '🌋',
    enemyPool:      { golem: { weight: 10 } },
    killsToAdvance: 20,
    speedMult:      1.5,
    maxEnemies:     5,
  },
  unlocksAbility: null,
});