MapRegistry.register({

  id:    'map02_dungeon',
  order: 2,
  name:  'Dungeon',
  theme: 'dungeon',
  icon:  '🪨',
  background: 'assets/maps/map02_dungeon/background_01.png',
  stressTarget: 28,
speedIncreasePerLevel: 0.12,
 enemyPool: {
    ravager:     { fromWave: 1, weight: 8 },
    slime_large: { fromWave: 2, weight: 3 },
    golem:       { fromWave: 6, weight: 2 },
  },

 boss: {
    name:          'The Stone Warden',
    desc:          'The dungeon trembles under his steps',
    icon:          '🗿',
    enemyPool: {
      golem: { weight: 10 },
    },
    killsToAdvance:  15,
    speedMult:       1.3,
    maxEnemies:      4,
  },
  unlocksAbility: 'slow_field',
});