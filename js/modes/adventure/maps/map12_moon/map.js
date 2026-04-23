MapRegistry.register({
  id:         'map12_moon',
  order:      12,
  name:       'Moon',
  theme:      'moon',
  background: 'assets/maps/map12_moon/background_01.png',
  stressTarget: 42,
  enemyPool: {
    star:           { fromWave: 1, weight: 4 },
    spectral_deer:  { fromWave: 1, weight: 3 },
    thunder_hound:  { fromWave: 3, weight: 2 },
    oni:            { fromWave: 5, weight: 2 },
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