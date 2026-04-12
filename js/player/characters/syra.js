/* ═══════════════════════════════════════
   SYRA.JS
   The Mage — long range, low damage.
   ═══════════════════════════════════════ */

CharacterRegistry.register({
  id:         'syra',
  emoji:      '🧙',
  name:       'Syra',
  desc:       'long range, low damage',
  rangePct:   0.52,
  damageMult: 0.7,
  color:      '#8B5CF6',
  special: {
    name:          'Piercing',
    desc:          'shots pass through enemies for 3s',
    icon:          '✨',
    duration:      3000,
    barColor:      '#8B5CF6',
    piercing:      true,
    blocksBullets: false,
    onActivate(enemies) {},
    onDeactivate(enemies) {},
  },
  stats: { range: 5, damage: 2, hp: 2 },
  abilities: ['syra_pierce_ext', 'syra_double'],
});

[
  {
    id:        'syra_pierce_ext',
    name:      'Eternal Ray',
    icon:      '✨',
    exclusive: 'syra',
    desc:      'Piercing lasts 1.5 extra seconds.',
    effect(p) { p.charDef.special.duration += 1500; },
  },
  {
    id:        'syra_double',
    name:      'Double Ray',
    icon:      '🔮',
    exclusive: 'syra',
    desc:      'Attacks also hit adjacent directions.',
    effect(p) { p.doubleAttack = true; },
  },
].forEach(a => AbilityRegistry.register(a));