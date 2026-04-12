/* ═══════════════════════════════════════
   BRON.JS
   The Tank — balanced, invincible special.
   Registers itself into CharacterRegistry.
   ═══════════════════════════════════════ */

CharacterRegistry.register({
  id:         'bron',
  emoji:      '🛡️',
  name:       'Bron',
  desc:       'balanced, invincible special',
  rangePct:   0.38,
  damageMult: 1.0,
  color:      '#22C55E',
  special: {
    name:     'Fortress',
    desc:     'invincible for 4s',
    icon:     '🔰',
    duration: 4000,
    barColor: '#22C55E',
  },
  stats: { range: 3, damage: 3, hp: 5 },
  abilities: ['bron_fort_ext', 'bron_thorns'],
});
[
  {
    id:        'bron_fort_ext',
    name:      'Bunker',
    icon:      '🔰',
    exclusive: 'bron',
    desc:      'Fortress lasts 2 extra seconds.',
    effect(p) { p.charDef.special.duration += 2000; },
  },
  {
    id:        'bron_thorns',
    name:      'Thorns',
    icon:      '🌵',
    exclusive: 'bron',
    desc:      'Enemies take damage on contact during Fortress.',
    effect(p) { p.thorns = true; },
  },
].forEach(a => AbilityRegistry.register(a));