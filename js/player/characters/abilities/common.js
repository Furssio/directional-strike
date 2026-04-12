/* ═══════════════════════════════════════
   COMMON.JS
   Abilities available to all characters.
   ═══════════════════════════════════════ */

[
  {
    id:        'hp_boost',
    name:      'Vitality',
    icon:      '❤️',
    exclusive: null,
    desc:      'Recover 25 HP and increase max HP by 10%.',
    effect(p) {
      p.maxHp = Math.round(p.maxHp * 1.10);
      p.hp    = Math.min(p.maxHp, p.hp + 25);
    },
  },
  {
    id:        'damage_up',
    name:      'Sharp Blade',
    icon:      '🗡️',
    exclusive: null,
    desc:      'Your attacks deal 20% more damage.',
    effect(p) {
      p.damageMult *= 1.20;
    },
  },
  {
    id:        'range_up',
    name:      'Long Reach',
    icon:      '📡',
    exclusive: null,
    desc:      'Attack range increases by 15%.',
    effect(p) {
      p.attackRangePct *= 1.15;
      updateRangeCircle();
    },
  },
  {
    id:        'special_charge',
    name:      'Fast Charge',
    icon:      '⚡',
    exclusive: null,
    desc:      'Special bar charges 30% faster.',
    effect(p) {
      p.specialChargeMult = (p.specialChargeMult || 1) * 1.30;
    },
  },
  {
    id:        'combo_time',
    name:      'Focus',
    icon:      '🔵',
    exclusive: null,
    desc:      'Combo lasts 1.5 seconds longer before expiring.',
    effect(p) {
      p.comboDecayBonus = (p.comboDecayBonus || 0) + 1500;
    },
  },
  {
    id:        'shield_regen',
    name:      'Healing Shield',
    icon:      '🛡️',
    exclusive: null,
    desc:      'Activating shield recovers 5 HP.',
    effect(p) {
      p.shieldHealAmt = (p.shieldHealAmt || 0) + 5;
    },
  },
].forEach(a => AbilityRegistry.register(a));