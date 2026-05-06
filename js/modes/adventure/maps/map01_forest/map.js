MapRegistry.register({

  id:    'map01_forest',
  order: 1,
  name:  'Forest',
  theme: 'forest',
  icon:  '🌲',
  background: 'assets/maps/map01_forest/background_01.png',

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  /* ── ENEMY SCALING ──────────────────────
     Permanent stat boosts that activate at
     specific waves. Once active, they stay
     for the rest of the run.
     Player upgrades after wave 2,4,6,8,10
     → enemies scale at wave 3,5,7,9,11
     Both grow together — upgrade choice
     becomes meaningful.
  ─────────────────────────────────────────── */
  scalingAt: {
    3: {
      ravager: { speedMult: 1.08 },
    },
    5: {
      crusher: { hpMult: 1.5 },
    },
    7: {
      ravager: { hits: 2 },
      crusher: { hpMult: 1.8 },
    },
    9: {
      ravager: { hits: 2, speedMult: 1.15 },
      crusher: { hpMult: 2.0, speedMult: 1.1 },
    },
    11: {
      ravager: { speedMult: 1.2 },
    },
  },

  /* ── WAVE CONFIG ─────────────────────────
     duration:      seconds
     spawnInterval: ms between spawns
     maxAlive:      max enemies on field
     minAlive:      spawn faster if below this
     pool:          { enemyId: weight }
     burstChance:   0-1 chance to spawn burst
     burstSize:     enemies per burst
  ─────────────────────────────────────────── */
  waveConfig: {

    // Wave 1 — TUTORIAL / easy intro
    1: {
      duration: 12,
      spawnInterval: 3000,
      maxAlive: 2,
      minAlive: 1,
      pool: { ravager: 7, crusher: 3 },
      burstChance: 0,
      burstSize: 1,
    },

    // Wave 2 — First real wave
    2: {
      duration: 15,
      spawnInterval: 2200,
      maxAlive: 3,
      minAlive: 1,
      pool: { ravager: 7, crusher: 3 },
      burstChance: 0,
      burstSize: 1,
    },

    // ── UPGRADE 1 → enemies scale at wave 3 ──

    // Wave 3 — Ravagers slightly faster
    3: {
      duration: 18,
      spawnInterval: 2000,
      maxAlive: 3,
      minAlive: 1,
      pool: { ravager: 7, crusher: 3 },
      burstChance: 0,
      burstSize: 1,
    },

    // Wave 4 — More enemies, first bursts
    4: {
      duration: 20,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 6, crusher: 4 },
      burstChance: 0.15,
      burstSize: 2,
    },

    // ── UPGRADE 2 → enemies scale at wave 5 ──

    // Wave 5 — Crushers get tankier
    5: {
      duration: 22,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 6, crusher: 4 },
      burstChance: 0.2,
      burstSize: 2,
    },

    // Wave 6 — Steady pressure
    6: {
      duration: 25,
      spawnInterval: 1700,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 6, crusher: 4 },
      burstChance: 0.2,
      burstSize: 2,
    },

    // ── UPGRADE 3 → enemies scale at wave 7 ──

    // Wave 7 — Ravagers now 2-hit, crushers beefier
    7: {
      duration: 25,
      spawnInterval: 1700,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 5, crusher: 5 },
      burstChance: 0.2,
      burstSize: 2,
    },

    // Wave 8 — Maintain intensity
    8: {
      duration: 28,
      spawnInterval: 1600,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 5, crusher: 5 },
      burstChance: 0.25,
      burstSize: 2,
    },

    // ── UPGRADE 4 → enemies scale at wave 9 ──

    // Wave 9 — Everything tougher
    9: {
      duration: 28,
      spawnInterval: 1600,
      maxAlive: 5,
      minAlive: 2,
      pool: { ravager: 5, crusher: 5 },
      burstChance: 0.25,
      burstSize: 2,
    },

    // Wave 10 — Last stand
    10: {
      duration: 30,
      spawnInterval: 1500,
      maxAlive: 6,
      minAlive: 2,
      pool: { ravager: 5, crusher: 5 },
      burstChance: 0.3,
      burstSize: 2,
    },

    // ── UPGRADE 5 → enemies scale at wave 11 ──

    // Wave 11 — FINAL WAVE
    // Ravager flood, fast but 1-hit again
    // Victory lap — player with 5 upgrades destroys everything
    11: {
      duration: 35,
      spawnInterval: 700,
      maxAlive: 7,
      minAlive: 3,
      pool: { ravager: 10 },
      burstChance: 0.4,
      burstSize: 3,
    },

  },

  /* fallback pool — only used if a wave has no waveConfig entry */
  enemyPool: {
    ravager: { fromWave: 1, weight: 8 },
    crusher: { fromWave: 3, weight: 2 },
  },

  unlocksAbility: 'range_boost',
});