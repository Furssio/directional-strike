/* ═══════════════════════════════════════
   EVENTS.JS
   Stress modifications from game events
   and time decay.

   Used by: director.js
   Depends on: config.js
   ═══════════════════════════════════════ */

/* ── ON DAMAGE ──────────────────────────
   Player took damage — spike stress.
   @param stress  current stress value
   @return        new stress value        */
function stressOnDamage(stress) {
  return Math.min(100, stress + CONFIG.director.stress.onDamage);
}

/* ── ON KILL ────────────────────────────
   Enemy died — reduce stress.
   @param stress  current stress value
   @return        new stress value        */
function stressOnKill(stress) {
  return Math.max(0, stress + CONFIG.director.stress.onKill);
}

/* ── DECAY ──────────────────────────────
   Stress decays over time naturally.
   @param stress  current stress value
   @param dt      delta time in ms
   @return        new stress value        */
function stressDecay(stress, dt) {
  const decay = CONFIG.director.stress.decayPerSecond * dt / 1000;
  return Math.max(0, stress - decay);
}