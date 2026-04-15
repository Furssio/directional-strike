/* ═══════════════════════════════════════
   MAP01_FOREST.JS
   First Adventure map — introductory.
   Easy stress target, limited enemy pool.
   Boss wave: Ravager Rush.

   To tweak this map's difficulty, ability,
   or boss, edit only this file.
   ═══════════════════════════════════════ */

MapRegistry.register({

  /* ── IDENTITY ─────────────────────── */
  id:    'map01_forest',
  order: 1,
  name:  'Forest',
  theme: 'forest',
  icon:  '🌲',
  background: 'assets/maps/map01_forest/background_01.png',

  /* ── DIFFICULTY (waves 1-9) ──────── */
  stressTarget: 22,

  /* ── ENEMY POOL (waves 1-9) ──────── */
  enemyPool: {
    ravager: { fromWave: 1, weight: 8 },
    crusher: { fromWave: 3, weight: 2 },
  },

  /* ── BOSS WAVE (wave 10) ─────────── */
 boss: {
    name:           'Ravager Rush',
    desc:           'A wild horde swarms the arena',
    icon:           '👹',
    enemyPool: {
      ravager: { weight: 10 },
    },
    killsToAdvance:   100,
    speedMult:        1.65,    // era 1.35 → ora +65% velocità
    spawnIntervalMs:  450,     // era 800 → spawn quasi doppio
    maxEnemies:       7,       // era 6 → un po' più affollato
    burstChance:      0.40,    // era 0.30 → raffiche più frequenti
    burstDelay:       300,     // era 400 → raffica più stretta
  },
  /* ── REWARD ───────────────────────── */
  unlocksAbility: 'range_boost',

});