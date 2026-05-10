/* ═══════════════════════════════════════
   BULLETTIME.JS
   Bullet Time — slows everything in the
   arena for a short duration.
   Ninja instinct: dark pulse + vignette.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry
   ═══════════════════════════════════════ */

AbilityRegistry.register({
  id:       'bullet_time',
  name:     'Bullet Time',
  desc:     'slows everything for 3s',
  icon:     '🌀',
  barColor: '#E24B4A',
  duration: 5000,

  piercing:      false,
  blocksBullets: false,

  onActivate() {
    if (player) player.speedMultiplier = 0.25;

    const a = document.getElementById('arena');
    if (!a) return;

    // add persistent overlay if not present
    if (!a.querySelector('.bt-overlay')) {
      const ov = document.createElement('div');
      ov.className = 'bt-overlay';
      a.appendChild(ov);
    }

    // activate CSS effects
    a.classList.remove('bullet-time-ending');
    a.classList.add('bullet-time-active');


    // sound
    if (typeof SFX !== 'undefined') SFX.bulletTimeStart();
  },

  /* ── called by spawn.js for new enemies during ability ── */
  onEnemySpawn(enemy) {
    // no per-enemy effects needed for bullet time
    // (speedMultiplier on player already slows everything)
  },

  onDeactivate() {
    if (player) player.speedMultiplier = 1.0;

    const a = document.getElementById('arena');
    if (!a) return;

    // smooth fade out
    a.classList.remove('bullet-time-active');
    a.classList.add('bullet-time-ending');

    setTimeout(() => {
      a.classList.remove('bullet-time-ending');
      const ov = a.querySelector('.bt-overlay');
      if (ov) ov.remove();
    }, 550);

   
    // sound
    if (typeof SFX !== 'undefined') SFX.bulletTimeStop();
  },
});