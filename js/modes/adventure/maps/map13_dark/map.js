MapRegistry.register({
  id:         'map13_dark',
  order:      13,
  name:       'Dark Dimension',
  theme:      'dark',
  background: 'assets/maps/map13_dark/background_01.webp',
  stressTarget: 70,
  enemyPool: {
    ravager: { fromWave: 1, weight: 5 },
    crusher: { fromWave: 1, weight: 3 },
    golem:   { fromWave: 1, weight: 2 },
  },
  boss: {
    name: 'Evil Eye',
    desc: 'The final darkness',
    icon: '🕳️',
    enemyPool: { golem: { weight: 10 } },
    killsToAdvance: 40,
    speedMult: 2.0,
    maxEnemies: 6,
  },
  unlocksAbility: null,
});