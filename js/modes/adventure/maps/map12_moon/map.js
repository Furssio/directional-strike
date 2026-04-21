MapRegistry.register({
  id:         'map12_moon',
  order:      12,
  name:       'Moon',
  theme:      'moon',
  background: 'assets/maps/map12_moon/background_01.png',
  stressTarget: 42,
  enemyPool: {
    ravager: { fromWave: 1, weight: 7 },
    crusher: { fromWave: 2, weight: 3 },
  },
  boss: {
    name:           'Lunar Specter',
    desc:           'The moon bleeds',
    icon:           '🌙',
    enemyPool:      { golem: { weight: 10 } },
    killsToAdvance: 20,
    speedMult:      1.6,
    maxEnemies:     5,
  },
  unlocksAbility: null,
});