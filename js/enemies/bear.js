/* ═══════════════════════════════════════
   BEAR.JS
   Slow tanky enemy — stops in range and
   charges a devastating attack every 2s.
   4 hits to kill.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:        'bear',
  sprite:    'assets/enemies/bear/idle.png',
  spriteFrames:  12,
  spriteFrameW:  100,
  spriteFrameH:  100,
  spriteSpeed:   1.0,
  size:          100,
  hpPct:     1.50,
  damagePct: 1.50,
  speedMult: 4538,
  points:    50,
  shoots:    false,

  onTick(e, cx, cy, attackRange) {
    const dx   = e.x - cx;
    const dy   = e.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= attackRange * 0.70) {
      // stop moving once in range
      e.speed = 0;

      // init charge timer on first arrival
      if (e._chargeTimer === undefined) {
        e._chargeTimer = 2000;
        if (e.el) e.el.classList.add('bear-charging');
      }

      e._chargeTimer -= 16 * player.speedMultiplier;

      if (e._chargeTimer <= 0) {
        // attack — damage exceeds max hp
        player.takeDamage(e.damagePct);
        updateHpBar();
        SFX.damage();
        ActiveDirector.onDamage();
        triggerShake();

        flashEl.style.opacity = '1';
        setTimeout(() => flashEl.style.opacity = '0', 200);

        if (!player.isAlive()) { endGame(); return; }

        // reset timer for next attack
        e._chargeTimer = 2000;
      }
    }
  },

 calcStress(distToCenter) {
    if (distToCenter <= 80)  return 10;
    if (distToCenter <= 160) return 5;
    return 2;
  },
});