MapRegistry.register({
  id:         'map06_beach',
  order:      6,
  name:       'Beach',
  theme:      'beach',
  background: 'assets/maps/map06_beach/background_01.png',
  stressTarget: 34,
  enemyPool: {
    ravager: { fromWave: 1, weight: 8 },
    crusher: { fromWave: 3, weight: 2 },
  },
  boss: {
    name:           'Tide Reaper',
    desc:           'The sea rises',
    icon:           '🏖️',
    enemyPool:      { crusher: { weight: 10 } },
    killsToAdvance: 20,
    speedMult:      1.4,
    maxEnemies:     5,
  },
  unlocksAbility: null,
});