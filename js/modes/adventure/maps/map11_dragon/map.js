MapRegistry.register({
  id:         'map11_dragon',
  order:      11,
  name:       'Dragon Temple',
  theme:      'dragon',
  background: 'assets/maps/map11_dragon/background_01.png',
  stressTarget: 60,
  enemyPool: {
    ravager: { fromWave: 1, weight: 5 },
    crusher: { fromWave: 1, weight: 3 },
    golem:   { fromWave: 1, weight: 2 },
  },
  boss: {
    name:           'The Dragon',
    desc:           'Fire and fury unleashed',
    icon:           '🐉',
    enemyPool:      { golem: { weight: 10 } },
    killsToAdvance: 30,
    speedMult:      1.9,
    maxEnemies:     4,
  },
  unlocksAbility: null,
});