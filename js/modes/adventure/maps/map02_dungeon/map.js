/* ═══════════════════════════════════════
   MAP02_DUNGEON.JS
   Second Adventure map — dungeon/cavern.
   Introduces slimes and golem.
   Boss wave: The Stone Warden.
   ═══════════════════════════════════════ */

MapRegistry.register({

  id:    'map02_dungeon',
  order: 2,
  name:  'Dungeon',
  theme: 'dungeon',
  icon:  '🪨',

  stressTarget: 28,

  enemyPool: {
    ravager:     { fromWave: 1, weight: 5 },
    slime_large: { fromWave: 2, weight: 5 },
    golem:       { fromWave: 6, weight: 2 },
  },

  boss: {
    name:          'The Stone Warden',
    desc:          'The dungeon trembles under his steps',
    icon:          '🗿',
    enemyPool: {
      golem:       { weight: 7 },
      slime_large: { weight: 3 },
    },
    killsToAdvance:  50,
    speedMult:       1.4,
    spawnIntervalMs: 700,
    maxEnemies:      5,
    burstChance:     0.20,
    burstDelay:      400,
  },

  unlocksAbility: 'slow_field',
});