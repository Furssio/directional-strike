/* ═══════════════════════════════════════
   ONEHIT.JS
   One Hit — all enemies die in 1 hit
   for 4 seconds. Red super saiyan aura
   (CSS only) + screen shake on attacks.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry
   ═══════════════════════════════════════ */

AbilityRegistry.register({
  id:       'one_hit',
  name:     'One Hit',
  desc:     'all enemies die in 1 hit for 4s',
  icon:     '⚡',
  barColor: '#FBBF24',
  duration: 4000,

  piercing:      false,
  blocksBullets: false,

  onActivate() {
    if (player) player.oneHitActive = true;

    const a = document.getElementById('arena');
    if (!a) return;

    a.classList.add('one-hit-active');

    // create CSS aura overlay
    const aura = document.createElement('div');
    aura.className = 'onehit-aura';
    a.appendChild(aura);
  },

  onDeactivate() {
    if (player) player.oneHitActive = false;

    const a = document.getElementById('arena');
    if (!a) return;

    a.classList.remove('one-hit-active');

    // remove aura
    const aura = a.querySelector('.onehit-aura');
    if (aura) aura.remove();
  },
});