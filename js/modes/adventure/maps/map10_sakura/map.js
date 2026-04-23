MapRegistry.register({
  id:         'map10_sakura',
  order:      10,
  name:       'Sakura',
  theme:      'sakura',
  background: 'assets/maps/map10_sakura/background_01.png',
  stressTarget: 40,
  enemyPool: {
    
    enemyPool: {
    kitsune:   { fromWave: 1, weight: 3 },
    nara_deer: { fromWave: 1, weight: 3 },
    frog:      { fromWave: 2, weight: 3 },
    oni:       { fromWave: 1, weight: 3 },
  },
  },
  boss: {
    name:           'Shadow Oni',
    desc:           'The spirit awakens',
    icon:           '🌸',
    enemyPool:      { golem: { weight: 10 } },
    killsToAdvance: 20,
    speedMult:      1.5,
    maxEnemies:     5,
  },
  unlocksAbility: null,
});