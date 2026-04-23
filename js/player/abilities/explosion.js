/* ═══════════════════════════════════════
   EXPLOSION.JS
   Explosion — instantly kills all enemies
   within attack range. No duration.

   Used by: Player.js (via AbilityRegistry)
   Depends on: AbilityRegistry
   ═══════════════════════════════════════ */

AbilityRegistry.register({
  id:       'explosion',
  name:     'Explosion',
  desc:     'kills all enemies in range instantly',
  icon:     '💥',
  barColor: '#EF4444',
  duration: 1,

  piercing:      false,
  blocksBullets: false,

  onActivate() {
    if (!player) return;

    const { w, h }    = getArenaSize();
    const cx          = w / 2;
    const cy          = h / 2;
    const arenaSize   = Math.min(w, h);
    const attackRange = player.getAttackRange(arenaSize);

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e    = enemies[i];
      if (e.underground) continue;

      const dx   = e.x - cx;
      const dy   = e.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= attackRange) {
        spawnParticles(e.x, e.y, player.color, e.isElite);
        e.el.remove();
        enemies.splice(i, 1);
        registerKill(e);
      }
    }

    SFX.kill();
    triggerShake();
  },

  onDeactivate() {},
});