MapRegistry.register({

  totalWaves: 11,
  minEnemiesAlive: 1,
  maxPerDirection: 4,

  /* ── ENEMY SCALING ──────────────────────
     Permanent stat boosts that activate at
     specific waves. Once active, they stay
     for the rest of the run.

     How damage works:
       player hit dmg = maxHp * hitDamagePct * damageMult
                      = 100 * 0.34 * 1.6 = 54 base
       enemy HP = maxHp * hpPct * hpMult

     Hit thresholds (base 54 dmg):
       1 hit = HP ≤ 54
       2 hit = HP 55-108
       3 hit = HP 109-162

     Sharp Blade I raises dmg to 59.
     So hpMult 1.85 on ravager (HP 55.5)
     = 2 hit base, but 1 hit with SB I.
     Attack upgrades feel rewarding.

     Player upgrades after wave 2,4,6,8,10
     → enemies scale at wave 5,11
  ─────────────────────────────────────────── */
  scalingAt: {
   
    // Final wave — ravagers speed up for victory lap
    11: {
      ravager: { speedMult: 1.2 },
    },
  },

  /* ── WAVE CONFIG ─────────────────────────
     duration:      seconds
     spawnInterval: ms between spawns
     maxAlive:      max enemies on field
     minAlive:      fast-spawn if below this
     pool:          { enemyId: weight }
     burstChance:   0-1 chance per spawn tick
     burstSize:     enemies per burst
  ─────────────────────────────────────────── */
  waveConfig: {

    // Wave 1 — TUTORIAL / easy intro
    1: {
      duration: 15,
      spawnInterval: 3000,
      maxAlive: 2,
      minAlive: 1,
      pool: { ravager: 7, slime: 3 },
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

    // ── UPGRADE 1 ──

    // Wave 3 — Slightly tighter spawns
    3: {
      duration: 20,
      spawnInterval: 2000,
      maxAlive: 3,
      minAlive: 1,
      pool: { ravager: 7, crusher: 3 },
      burstChance: 0,
      burstSize: 1,
    },

    // Wave 4 — More enemies, first bursts
    4: {
      duration: 25,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 6, crusher: 4 },
      burstChance: 0.15,
      burstSize: 2,
    },

    // ── UPGRADE 2 → ravager scales to 2-hit at wave 5 ──

    // Wave 5 — Peak difficulty for beginners
    // Ravager now 2-hit, same pressure as wave 4
    5: {
      duration: 25,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 6, crusher: 4 },
      burstChance: 0.2,
      burstSize: 2,
    },

    // Wave 6 — BREATHER: ravager-only, no crusher
    // Player just got upgrade, feels powerful
    // But ravagers are 2-hit now so still engaging
    6: {
      duration: 25,
      spawnInterval: 1700,
      maxAlive: 5,
      minAlive: 3,
      pool: { ravager: 10 },
      burstChance: 0.2,
      burstSize: 2,
    },

    // ── UPGRADE 3 ──

    // Wave 7 — Crusher returns, like wave 4 but
    // ravagers are 2-hit so player feels the difference
    7: {
      duration: 25,
      spawnInterval: 1800,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 6, crusher: 4 },
      burstChance: 0.15,
      burstSize: 2,
    },

    // Wave 8 — ALL CRUSHER: dangerous but fewer on field
    // Player must parry bullets and manage space
    8: {
      duration: 30,
      spawnInterval: 1700,
      maxAlive: 3,
      minAlive: 2,
      pool: { crusher: 10 },
      burstChance: 0.2,
      burstSize: 2,
    },

    // ── UPGRADE 4 ──

    // Wave 9 — Mix returns, ravager-heavy
    9: {
      duration: 30,
      spawnInterval: 1700,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 6, crusher: 4 },
      burstChance: 0.25,
      burstSize: 2,
    },

    // Wave 10 — Last stand, same mix
    10: {
      duration: 30,
      spawnInterval: 1600,
      maxAlive: 4,
      minAlive: 2,
      pool: { ravager: 6, crusher: 4 },
      burstChance: 0.3,
      burstSize: 2,
    },
    // ── UPGRADE 5 → ravagers speed up at wave 11 ──

    // Wave 11 — FINAL WAVE: victory lap
    // Ravager flood, fast (speedMult 1.2), 1-hit again
    // Player with 5 upgrades destroys everything
    11: {
      duration: 35,
      spawnInterval: 700,
      maxAlive: 4,
      minAlive: 2,
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

  
  unlocksAbility: null,
});