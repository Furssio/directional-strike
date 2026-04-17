/* ═══════════════════════════════════════
   SLIMES.JS
   Slime enemy — 2 phases (large/medium).
   Large: 2 hit → dies → spawns 2 Medium
   Medium: 1 hit → dies → gone
   Total hits to clear a Large: 4.
   ═══════════════════════════════════════ */

EnemyRegistry.register({
  id:          'slime_large',
  emoji:       '🟢',
  sprite:      'assets/enemies/slime.png',
  size:        48,
  hpPct:       0.80,
  damagePct:   0.30,
  contactHits: 1,
  speedMult:   0.55,
  points:      8,
  shoots:      false,
  splitInto:   'slime_medium',
  splitCount:  2,
  wobble:      { frequency: 1.8, amplitude: 18 },
  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 25;
    if (distToCenter <= 160) return 12;
    return 5;
  },
});

EnemyRegistry.register({
  id:          'slime_medium',
  emoji:       '🟢',
  sprite:      'assets/enemies/slime.png',
  size:        32,
  hpPct:       0.45,
  damagePct:   0.18,
  contactHits: 1,
  speedMult:   0.42,
  points:      3,
  shoots:      false,
  splitInto:   null,
  splitCount:  0,
  wobble:      { frequency: 2.8, amplitude: 10 },
  calcStress(distToCenter) {
    if (distToCenter <= 80)  return 12;
    if (distToCenter <= 160) return 6;
    return 2;
  },
});