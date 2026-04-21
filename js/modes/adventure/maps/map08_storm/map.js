MapRegistry.register({
  id:         'map08_storm',
  order:      8,
  name:       'Storm',
  theme:      'storm',
  background: 'assets/maps/map08_storm/background_01.png',
  stressTarget: 55,
  enemyPool: {
    ravager: { fromWave: 1, weight: 6 },
    crusher: { fromWave: 1, weight: 2 },
    golem:   { fromWave: 1, weight: 2 },
  },
  boss: {
    name:           'Thunder Hound',
    desc:           'Lightning incarnate',
    icon:           '🌩️',
    enemyPool:      { crusher: { weight: 10 } },
    killsToAdvance: 25,
    speedMult:      1.8,
    maxEnemies:     5,
  },
  unlocksAbility: null,
});