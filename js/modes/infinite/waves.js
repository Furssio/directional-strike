/* ═══════════════════════════════════════
   WAVES.JS
   Wave definitions and progression data
   for Infinite Mode.

   Used by: director.js, stress/calculator.js
   Depends on: config.js
   ═══════════════════════════════════════ */

/* ── KILLS NEEDED PER WAVE ──────────────
   How many kills to complete each wave.
   Scales exponentially. */
function killsToAdvance(wave) {
  const d = CONFIG.director;
  return Math.round(d.killsToAdvanceBase * Math.pow(d.killsToAdvanceScaling, wave - 1));
}

/* ── STRESS TARGET PER WAVE ─────────────
   Wave 1-10 uses fixed table from config.
   Wave 11+ uses scaling formula. */
function getWaveTarget(wave, isBossWave) {
  const d = CONFIG.director;

  if (wave <= 10 && d.waveTargets[wave] !== undefined) {
    return d.waveTargets[wave];
  }

  const base   = d.baseTarget + (wave - 1) * d.targetIncreasePerWave;
  const target = Math.min(d.maxTarget, base);
  return isBossWave ? Math.min(d.maxTarget, target + d.bossTargetBonus) : target;
}

/* ── IS BOSS WAVE ───────────────────────
   Every 10 waves is a boss wave. */
function isBossWave(wave) {
  return wave % 10 === 0;
}