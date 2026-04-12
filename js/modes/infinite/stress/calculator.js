/* ═══════════════════════════════════════
   CALCULATOR.JS
   Stress calculation — reads current
   game state and returns a stress value.

   Used by: director.js
   Depends on: state.js, config.js, waves.js
   ═══════════════════════════════════════ */

/* ── CALC SITUATIONAL STRESS ────────────
   Looks at enemies on field, player hp
   and returns current stress 0-100.
   @param cx, cy  arena center in px      */
function calcStress(cx, cy) {
  const d          = CONFIG.director.stress;
  let   s          = 0;
  let   gruntCount = 0;

  for (const e of enemies) {
    if (e.name === 'tank') {
      s += d.tank;

    } else if (e.name === 'armor') {
      const dist = e.distToCenter(cx, cy);
      if (dist <= d.armorDistClose)    s += d.armorClose;
      else if (dist <= d.armorDistMid) s += d.armorMid;
      else                             s += d.armorFar;

    } else if (e.name === 'grunt') {
      gruntCount++;
    }
  }

  if (gruntCount > 0) {
    s += d.gruntAlone;
    s += Math.max(0, gruntCount - 1) * d.gruntExtra;
  }

  const hpPct = player.hpPercent();
  if (hpPct <= 0.25)      s += d.lowHp25;
  else if (hpPct <= 0.50) s += d.lowHp50;

  return Math.min(100, Math.max(0, s));
}

/* ── GET DIRECTOR STATE ─────────────────
   Compares stress vs wave target.
   Returns 'fast' / 'normal' / 'slow'
   @param stress     current stress value
   @param wave       current wave number
   @param isBoss     is this a boss wave   */
function getDirectorState(stress, wave, isBoss) {
  const target = getWaveTarget(wave, isBoss);
  const tol    = CONFIG.director.tolerance;

  if (stress < target - tol) return 'fast';
  if (stress > target + tol) return 'slow';
  return 'normal';
}