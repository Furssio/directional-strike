MapRegistry.register({
  id:         'map04_temple',
  order:      4,
  name:       'Temple',
  theme:      'temple',
  background: 'assets/maps/map04_temple/background_01.png',
  stressTarget: 50,
  enemyPool: {
    ravager: { fromWave: 1, weight: 6 },
    crusher: { fromWave: 1, weight: 2 },
    golem:   { fromWave: 1, weight: 2 },
  },
  boss: {
    name:           'Giant Golem',
    desc:           'The temple guardian awakens',
    icon:           '⛩️',
    enemyPool:      { golem: { weight: 10 } },
    killsToAdvance: 25,
    speedMult:      1.7,
    maxEnemies:     4,
  },
  unlocksAbility: null,
});