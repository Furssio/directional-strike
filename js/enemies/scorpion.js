EnemyRegistry.register({
  id:        'scorpion',
  sprite:    'assets/enemies/scorpion/idle.png',
  size:      48,
  hpPct:     0.30,
  damagePct: 0.15,
  speedMult: 1.00,
  points:    20,
  shoots:    false,
  noHpBar:   true,

  // while underground: not visible, not hittable
  underground:      true,
  undergroundSpeed:  0.7,   // multiplier while underground (slow)

  onContact(player) {
    // poison: 5% hp per second for 3 seconds
    if (!player.poisonEffects) player.poisonEffects = [];
    player.poisonEffects.push({ ticksLeft: 3, timer: 0 });
  },

  onTick(e, cx, cy, attackRange) {
    const dx   = e.x - cx;
    const dy   = e.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (e.underground && dist <= attackRange) {
      // emerge — become visible, hittable, full speed
      e.underground = false;
      e.speed = e.baseSpeed;
      if (e.el) {
        e.el.style.opacity = '1';
        e.el.style.pointerEvents = 'auto';
      }
    }

    // sand particles while underground
    if (e.underground && e.el) {
      e._particleTimer = (e._particleTimer || 0) + 16 * player.speedMultiplier;
      if (e._particleTimer >= 80 / player.speedMultiplier) {
        e._particleTimer = 0;
        spawnSandParticle(e.x, e.y);
      }
    }
  },

  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 12;
    if (distToCenter <= 160) return 6;
    return 2;
  },
});