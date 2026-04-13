/* ═══════════════════════════════════════
   KAEL.JS
   The Warrior — short range, high damage.
   ═══════════════════════════════════════ */

CharacterRegistry.register({
  id:         'kael',
  emoji:      '⚔️',
  name:       'Kael',
  desc:       'high damage, short range',
  rangePct:   0.26,
  damageMult: 1.6,
  color:      '#E24B4A',
  special: {
    name:          'Bullet Time',
    desc:          'slows all enemies for 3s',
    icon:          '🌀',
    duration:      3000,
    barColor:      '#E24B4A',
    piercing:      false,
    blocksBullets: false,
    onActivate(enemies) {
      enemies.forEach(e => e.setSlowed(true, 0.25));
      bullets.forEach(b => {
        b.vx = b.vxBase * 0.25;
        b.vy = b.vyBase * 0.25;
      });
    },
    onDeactivate(enemies) {
      enemies.forEach(e => e.setSlowed(false, 1));
      bullets.forEach(b => {
        b.vx = b.vxBase;
        b.vy = b.vyBase;
      });
    },
  },
  stats: { range: 1, damage: 5, hp: 3 },
  abilities: ['kael_slow_ext', 'kael_heavy'],
});

[
  {
    id:        'kael_slow_ext',
    name:      'Matrix',
    icon:      '🌀',
    exclusive: 'kael',
    desc:      'Bullet Time lasts 1 extra second.',
    effect(p) { p.charDef.special.duration += 1000; },
  },
  {
    id:        'kael_heavy',
    name:      'Heavy Strike',
    icon:      '💥',
    exclusive: 'kael',
    desc:      '15% chance to stun enemy for 1s on hit.',
    effect(p) { p.stunChance = (p.stunChance || 0) + 0.15; },
  },
].forEach(a => AbilityRegistry.register(a));