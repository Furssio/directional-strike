/* ═══════════════════════════════════════
   MAP01_FOREST.JS
   First Adventure map — introductory.
   Easy stress target, limited enemy pool.

   To tweak this map's difficulty or
   unlocked ability, edit only this file.
   ═══════════════════════════════════════ */

MapRegistry.register({

  /* ── IDENTITY ─────────────────────── */
  id:    'map01_forest',
  order: 1,
  name:  'Forest',
  theme: 'forest',           // for future visual styling
  icon:  '🌲',

  /* ── DIFFICULTY ───────────────────── */
  stressTarget: 22,          // easy — introductory map

  /* ── ENEMY POOL ───────────────────── */
  enemyPool: {
    ravager: { fromWave: 1, weight: 8 },
    crusher: { fromWave: 3, weight: 2 },
  },

  /* ── REWARD ───────────────────────── */
  unlocksAbility: 'one_shot_shield',

});