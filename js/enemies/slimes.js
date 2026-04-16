/* ═══════════════════════════════════════
   SLIMES.JS
   Slime enemy — 3 phases (large/medium/small).
   On death, large spawns 2 medium,
   medium spawns 3 small, small dies.
   Same sprite scaled via CSS size property.

   Used by: EnemyRegistry
   Depends on: EnemyRegistry
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:          'slime_large',
  emoji:       '🟢',
  sprite:      'assets/enemies/slime.png',
  size:        48,
  hpPct:       0.30,
  damagePct:   0.40,
  contactHits: 1,
  speedMult:   0.55,
  points:      5,
  shoots:      false,
  splitInto:   'slime_medium',
  splitCount:  2,
  wobble:      { frequency: 1.8, amplitude: 18 },
  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 35;
    if (distToCenter <= 160) return 20;
    return 10;
  },
});

EnemyRegistry.register({
  id:          'slime_medium',
  emoji:       '🟢',
  sprite:      'assets/enemies/slime.png',
  size:        32,
  hpPct:       0.18,
  damagePct:   0.20,
  contactHits: 2,
  speedMult:   0.40,
  points:      3,
  shoots:      false,
  splitInto:   'slime_small',
  splitCount:  3,
  wobble:      { frequency: 2.8, amplitude: 10 },
  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 18;
    if (distToCenter <= 160) return 10;
    return 4;
  },
});

EnemyRegistry.register({
  id:          'slime_small',
  emoji:       '🟢',
  sprite:      'assets/enemies/slime.png',
  size:        20,
  hpPct:       0.10,
  damagePct:   0.10,
  contactHits: 3,
  speedMult:   0.28,
  points:      1,
  shoots:      false,
  splitInto:   null,
  splitCount:  0,
  wobble:      { frequency: 4.2, amplitude: 5 },
  calcStress(distToCenter) {
    if (distToCenter <= 80) return 7;
    return 2;
  },
});