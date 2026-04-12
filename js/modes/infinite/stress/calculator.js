/* ═══════════════════════════════════════
   CALCULATOR.JS
   Stress calculation — reads current
   game state and returns a stress value.
   ═══════════════════════════════════════ */

function calcStress(cx, cy) {
  const d          = CONFIG.director.stress;
  let   s          = 0;
  let   gruntCount = 0;

  for (const e of enemies) {
    const dist = e.distToCenter(cx, cy);

    if (e.def && typeof e.def.calcStress === 'function') {
      const es = e.def.calcStress(dist);
      if (e.def.id === 'ravager') {
        gruntCount++;
      } else {
        s += es;
      }
    }
  }

  // ravager: primo vale poco, ogni extra vale di più
  if (gruntCount > 0) {
    s += d.gruntAlone;
    s += Math.max(0, gruntCount - 1) * d.gruntExtra;
  }

  const hpPct = player.hpPercent();
  if (hpPct <= 0.25)      s += d.lowHp25;
  else if (hpPct <= 0.50) s += d.lowHp50;

  return Math.min(100, Math.max(0, s));
}

function getDirectorState(stress, wave, isBoss) {
  const target = getWaveTarget(wave, isBoss);
  const tol    = CONFIG.director.tolerance;

  if (stress < target - tol) return 'fast';
  if (stress > target + tol) return 'slow';
  return 'normal';
}