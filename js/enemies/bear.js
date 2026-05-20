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
  damagePct: 0.50,
  speedMult: 1.2,
  points:    4538,
  hitSound:  'flesh',
  shoots:    false,
  deathColors: ['#885533', '#aa7744', '#664422'],

  /* --- Strike particle burst --- */
  _spawnStrikeParticles(e) {
    const arena = document.getElementById('G');
    if (!arena) return;
    const count = 8;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'bear-particle';
      // random direction spread
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
      const dist  = 30 + Math.random() * 35;
      p.style.left = e.x + 'px';
      p.style.top  = e.y + 'px';
      p.style.setProperty('--bpx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--bpy', Math.sin(angle) * dist + 'px');
      arena.appendChild(p);
      setTimeout(() => p.remove(), 400);
    }
  },

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

      // critical phase — last 500ms
      if (e._chargeTimer <= 500 && e.el && !e.el.classList.contains('bear-charge-critical')) {
        e.el.classList.add('bear-charge-critical');
      }

      if (e._chargeTimer <= 0) {
        // strike visual
        if (e.el) {
          e.el.classList.remove('bear-charging', 'bear-charge-critical');
          e.el.classList.add('bear-strike');
          setTimeout(() => {
            if (e.el) {
              e.el.classList.remove('bear-strike');
              // restart charge cycle
              e.el.classList.add('bear-charging');
            }
          }, 300);
        }

        // particle burst
        this._spawnStrikeParticles(e);

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