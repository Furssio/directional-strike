/* ═══════════════════════════════════════
   AUDIO/COMBAT.JS
   Combat sound effects: hit, kill, damage,
   miss, bullet, game over.

   Depends on: audio/core.js (AudioCore)
   ═══════════════════════════════════════ */

const SfxCombat = (() => {

  const t = (o) => AudioCore.tone(o);
  const n = (o) => AudioCore.noise(o);

  const SLASH_PATHS = [
    'assets/audio/sfx/combat/slash_1.mp3',
    'assets/audio/sfx/combat/slash_2.mp3',
    'assets/audio/sfx/combat/slash_3.mp3',
  ];

  const HEAL_PATHS = {
    orb:      'assets/audio/sfx/combat/heal_orb.mp3',
    vampiric: 'assets/audio/sfx/combat/heal_vampiric.mp3',
    ability:  'assets/audio/sfx/combat/heal_ability.mp3',
  };

  return {

    // ── HIT BY MATERIAL ──

    hit() {
      // fallback generico — usato se hitSound manca
      t({ type: 'square', freq: 180, freq2: 80, duration: 0.08, attack: 0.002, decay: 0.03, sustain: 0.3, release: 0.04, gain: 0.6 });
      n({ duration: 0.05, gain: 0.25, highpass: 800, lowpass: 3000 });
    },

    hitFlesh() {
      // meaty thud — fist sinking into flesh, satisfying weight
      const rnd = 1 + (Math.random() - 0.5) * 0.08;
      // deep body impact
      t({ type: 'sine', freq: 160 * rnd, freq2: 90, duration: 0.18, attack: 0.003, decay: 0.06, sustain: 0.35, release: 0.09, gain: 0.55 });
      // mid punch thud
      t({ type: 'triangle', freq: 320 * rnd, freq2: 200, duration: 0.12, attack: 0.002, decay: 0.04, sustain: 0.25, release: 0.06, gain: 0.35 });
      // soft tissue noise layer
      n({ duration: 0.1, gain: 0.2, highpass: 300, lowpass: 2000 });
    },

    hitRock() {
      // hard crack — blade on stone, sharp and resonant
      const rnd = 1 + (Math.random() - 0.5) * 0.06;
      // sharp stone crack
      t({ type: 'triangle', freq: 800 * rnd, freq2: 500, duration: 0.14, attack: 0.001, decay: 0.04, sustain: 0.3, release: 0.08, gain: 0.5 });
      // deep weight underneath
      t({ type: 'sine', freq: 120 * rnd, freq2: 70, duration: 0.2, attack: 0.003, decay: 0.07, sustain: 0.3, release: 0.1, gain: 0.4 });
      // debris crunch
      n({ duration: 0.12, gain: 0.3, highpass: 600, lowpass: 4000 });
      // secondary ring — delayed, stone resonance
      setTimeout(() =>
        t({ type: 'triangle', freq: 1200 * rnd, freq2: 900, duration: 0.1, attack: 0.002, decay: 0.03, sustain: 0.2, release: 0.05, gain: 0.2 })
      , 25);
    },

    hitSlime() {
      // wet splat — viscous burst, bubbly and satisfying
      const rnd = 1 + (Math.random() - 0.5) * 0.1;
      // pitch-down blob burst
      t({ type: 'sine', freq: 550 * rnd, freq2: 180, duration: 0.2, attack: 0.002, decay: 0.06, sustain: 0.3, release: 0.1, gain: 0.45 });
      // bubbly overtone
      t({ type: 'sine', freq: 900 * rnd, freq2: 350, duration: 0.15, attack: 0.003, decay: 0.05, sustain: 0.25, release: 0.07, gain: 0.25 });
      // wet noise — filtered low for gooey feel
      n({ duration: 0.14, gain: 0.25, highpass: 200, lowpass: 1800 });
    },

    hitShell() {
      // hard clank — metallic armor impact, rings briefly
      const rnd = 1 + (Math.random() - 0.5) * 0.06;
      // primary clank
      t({ type: 'triangle', freq: 600 * rnd, freq2: 450, duration: 0.16, attack: 0.001, decay: 0.05, sustain: 0.35, release: 0.08, gain: 0.5 });
      // metallic ring overtone
      t({ type: 'sine', freq: 1400 * rnd, freq2: 1100, duration: 0.12, attack: 0.002, decay: 0.04, sustain: 0.25, release: 0.06, gain: 0.3 });
      // impact crack noise
      n({ duration: 0.08, gain: 0.22, highpass: 1000, lowpass: 5000 });
      // resonant tail — delayed
      setTimeout(() =>
        t({ type: 'sine', freq: 700 * rnd, freq2: 550, duration: 0.14, attack: 0.003, decay: 0.05, sustain: 0.2, release: 0.07, gain: 0.18 })
      , 30);
    },

    hitEthereal() {
      // airy swish — cutting through wind/spirit, hollow impact
      const rnd = 1 + (Math.random() - 0.5) * 0.08;
      // hollow whoosh sweep
      t({ type: 'sine', freq: 400 * rnd, freq2: 700, duration: 0.22, attack: 0.005, decay: 0.07, sustain: 0.3, release: 0.1, gain: 0.35 });
      // high shimmer
      t({ type: 'sine', freq: 1600 * rnd, freq2: 2200, duration: 0.16, attack: 0.004, decay: 0.05, sustain: 0.2, release: 0.08, gain: 0.18 });
      // breathy wind noise — bandpass sweep feel
      n({ duration: 0.18, gain: 0.2, highpass: 800, lowpass: 3500 });
    },

    hitThunder() {
      // electric crackle — spark burst, sharp and buzzy
      const rnd = 1 + (Math.random() - 0.5) * 0.07;
      // electric zap
      t({ type: 'sine', freq: 1000 * rnd, freq2: 600, duration: 0.12, attack: 0.001, decay: 0.03, sustain: 0.3, release: 0.07, gain: 0.45 });
      // buzzy undertone
      t({ type: 'triangle', freq: 350 * rnd, freq2: 200, duration: 0.16, attack: 0.002, decay: 0.05, sustain: 0.25, release: 0.08, gain: 0.35 });
      // electric crackle noise — high and sharp
      n({ duration: 0.1, gain: 0.3, highpass: 2000, lowpass: 8000 });
      // secondary spark — delayed
      setTimeout(() =>
        t({ type: 'sine', freq: 1400 * rnd, freq2: 800, duration: 0.08, attack: 0.001, decay: 0.02, sustain: 0.2, release: 0.04, gain: 0.25 })
      , 20);
    },

    hitDemon() {
      // demonic heavy blow — deep rumble + dark mid + ominous ring
      const rnd = 1 + (Math.random() - 0.5) * 0.06;
      // sub rumble
      t({ type: 'sine', freq: 75 * rnd, freq2: 45, duration: 0.25, attack: 0.004, decay: 0.08, sustain: 0.35, release: 0.12, gain: 0.6 });
      // dark mid growl
      t({ type: 'triangle', freq: 250 * rnd, freq2: 160, duration: 0.18, attack: 0.003, decay: 0.06, sustain: 0.3, release: 0.08, gain: 0.4 });
      // ominous high ring — delayed
      setTimeout(() =>
        t({ type: 'sine', freq: 500 * rnd, freq2: 380, duration: 0.16, attack: 0.005, decay: 0.05, sustain: 0.25, release: 0.08, gain: 0.22 })
      , 35);
      // dark noise layer
      n({ duration: 0.15, gain: 0.25, highpass: 150, lowpass: 2000 });
    },

    kill() {
      t({ type: 'sine', freq: 330, freq2: 520, duration: 0.18, attack: 0.005, decay: 0.06, sustain: 0.5, release: 0.08, gain: 0.8 });
      setTimeout(() =>
        t({ type: 'sine', freq: 660, freq2: 880, duration: 0.14, attack: 0.003, decay: 0.05, sustain: 0.4, release: 0.06, gain: 0.5 })
      , 60);
    },

    damage() {
      // player hit — sharp pain impact + body thud, punishing but not annoying
      const rnd = 1 + (Math.random() - 0.5) * 0.06;
      // sharp pain sting
      t({ type: 'sine', freq: 700 * rnd, freq2: 350, duration: 0.14, attack: 0.001, decay: 0.04, sustain: 0.3, release: 0.08, gain: 0.5 });
      // deep body impact
      t({ type: 'sine', freq: 120 * rnd, freq2: 60, duration: 0.2, attack: 0.003, decay: 0.07, sustain: 0.25, release: 0.1, gain: 0.45 });
      // dull thud noise
      n({ duration: 0.12, gain: 0.25, highpass: 200, lowpass: 2000 });
    },
    berserker() {
      // rage awakening — deep growl surge + rising power
      const rnd = 1 + (Math.random() - 0.5) * 0.04;
      // deep rumble surge
      t({ type: 'sine', freq: 80 * rnd, freq2: 140, duration: 0.35, attack: 0.005, decay: 0.1, sustain: 0.4, release: 0.15, gain: 0.5 });
      // mid growl rising
      t({ type: 'triangle', freq: 200 * rnd, freq2: 400, duration: 0.3, attack: 0.004, decay: 0.08, sustain: 0.35, release: 0.12, gain: 0.35 });
      // power noise swell
      n({ duration: 0.25, gain: 0.2, highpass: 150, lowpass: 2500 });
      // high ring — delayed, rage confirmed
      setTimeout(() =>
        t({ type: 'sine', freq: 600 * rnd, freq2: 800, duration: 0.18, attack: 0.005, decay: 0.06, sustain: 0.25, release: 0.1, gain: 0.25 })
      , 120);
    },
    miss() {
      // whiff — airy slash that hits nothing, unsatisfying but not annoying
      const rnd = 1 + (Math.random() - 0.5) * 0.08;
      // hollow swoosh descending
      t({ type: 'sine', freq: 350 * rnd, freq2: 180, duration: 0.16, attack: 0.003, decay: 0.05, sustain: 0.25, release: 0.08, gain: 0.25 });
      // airy noise layer — whoosh feel
      n({ duration: 0.14, gain: 0.18, highpass: 500, lowpass: 3000 });
    },

    parry() {
      AudioCore.playFile('assets/audio/sfx/combat/parry.mp3', { volume: 0.15 });
    },

    crit() {
      // heavy devastating blow — deep impact + mid crunch + high ring
      const rnd = 1 + (Math.random() - 0.5) * 0.05;
      // deep body slam
      t({ type: 'sine',     freq: 90 * rnd,  freq2: 50,  duration: 0.25, attack: 0.003, decay: 0.08, sustain: 0.4, release: 0.12, gain: 0.7 });
      // mid crunch
      t({ type: 'triangle', freq: 280 * rnd, freq2: 180, duration: 0.18, attack: 0.002, decay: 0.06, sustain: 0.3, release: 0.08, gain: 0.5 });
      // high metallic ring — delayed slightly
      setTimeout(() =>
        t({ type: 'sine', freq: 700 * rnd, freq2: 500, duration: 0.15, attack: 0.005, decay: 0.05, sustain: 0.3, release: 0.08, gain: 0.3 })
      , 30);
      // noise crunch layer
      n({ duration: 0.15, gain: 0.35, highpass: 400, lowpass: 2500 });
    },
oneHitSmash() {
      // devastating body blow — deep slam + bone crunch + dark ring
      const rnd = 1 + (Math.random() - 0.5) * 0.06;
      // deep body slam
      t({ type: 'sine', freq: 70 * rnd, freq2: 35, duration: 0.3, attack: 0.002, decay: 0.08, sustain: 0.4, release: 0.15, gain: 0.65 });
      // bone crunch mid
      t({ type: 'triangle', freq: 250 * rnd, freq2: 130, duration: 0.2, attack: 0.002, decay: 0.06, sustain: 0.3, release: 0.1, gain: 0.5 });
      // dark heavy noise
      n({ duration: 0.18, gain: 0.35, highpass: 150, lowpass: 2000 });
      // ominous low ring — delayed
      setTimeout(() =>
        t({ type: 'sine', freq: 140 * rnd, freq2: 90, duration: 0.2, attack: 0.005, decay: 0.06, sustain: 0.25, release: 0.1, gain: 0.3 })
      , 40);
    },
    freeze() {
      AudioCore.playFile('assets/audio/sfx/combat/freeze.mp3', { volume: 0.15 });
    },

     slash() {
      const path = SLASH_PATHS[Math.floor(Math.random() * SLASH_PATHS.length)];
      AudioCore.playFile(path, { volume: 0.05 });
    },
multiKill(count) {
      // escalating power chord — 2=double, 3=triple, 4+=mega/ultra
      const rnd = 1 + (Math.random() - 0.5) * 0.04;
      const intensity = Math.min(1, (count - 1) / 3);
      const base = 500 + intensity * 300;
      const vol = 0.35 + intensity * 0.2;
      // impact hit
      t({ type: 'sine', freq: base * rnd, freq2: base * 1.3, duration: 0.2, attack: 0.002, decay: 0.05, sustain: 0.4, release: 0.1, gain: vol });
      // power fifth
      setTimeout(() =>
        t({ type: 'sine', freq: base * 1.5 * rnd, freq2: base * 1.8, duration: 0.18, attack: 0.003, decay: 0.05, sustain: 0.35, release: 0.08, gain: vol * 0.8 })
      , 35);
      // octave ring for 3+
      if (count >= 3) {
        setTimeout(() =>
          t({ type: 'sine', freq: base * 2 * rnd, duration: 0.16, attack: 0.004, decay: 0.05, sustain: 0.3, release: 0.08, gain: vol * 0.6 })
        , 75);
      }
      // epic shimmer for 4+
      if (count >= 4) {
        n({ duration: 0.15, gain: 0.18, highpass: 3000, lowpass: 9000 });
      }
    },

    luckyShield() {
      // magic barrier deflect — warm resonant block + sparkle
      const rnd = 1 + (Math.random() - 0.5) * 0.05;
      // barrier resonance
      t({ type: 'sine', freq: 600 * rnd, freq2: 800, duration: 0.2, attack: 0.002, decay: 0.05, sustain: 0.35, release: 0.1, gain: 0.4 });
      // bright deflect ping
      t({ type: 'sine', freq: 1400 * rnd, freq2: 1800, duration: 0.14, attack: 0.001, decay: 0.03, sustain: 0.25, release: 0.08, gain: 0.3 });
      // soft sparkle noise
      n({ duration: 0.1, gain: 0.12, highpass: 2500, lowpass: 8000 });
    },


    orbCollect() {
      // crystal chime — bright ping + harmonic overtone
      const rnd = 1 + (Math.random() - 0.5) * 0.06;
      t({ type: 'sine',     freq: 1200 * rnd, freq2: 1500, duration: 0.2,  attack: 0.003, decay: 0.06, sustain: 0.4, release: 0.1,  gain: 0.4 });
      t({ type: 'triangle', freq: 2400 * rnd, freq2: 2800, duration: 0.15, attack: 0.002, decay: 0.04, sustain: 0.3, release: 0.08, gain: 0.2 });
      n({ duration: 0.06, gain: 0.1, highpass: 4000, lowpass: 10000 });
    },

      healOrb() {
      AudioCore.playFile(HEAL_PATHS.orb, { volume: 0.15 });
    },

    healVampiric() {
      AudioCore.playFile(HEAL_PATHS.vampiric, { volume: 0.12 });
    },

    healAbility() {
      AudioCore.playFile(HEAL_PATHS.ability, { volume: 0.18 });
    },

    bullet() {
      t({ type: 'sine', freq: 800, freq2: 300, duration: 0.14, attack: 0.002, decay: 0.05, sustain: 0.3, release: 0.07, gain: 0.28 });
    },
    comboTick(combo, tierIndex) {
      // pitch climbs within current tier, resets at each tier change
      // tierIndex 0=white, 1=blue, 2=yellow, 3=orange, 4=red, 5=purple, 6=rainbow
      const TIER_BASE  = [400, 500, 600, 720, 850, 1000, 1200];
      const TIER_RANGE = [80,  90,  100, 110, 120, 140,  160];
      const tiers = CONFIG.combo.tiers;
      const tierStart = tiers[tierIndex][0];
      const tierEnd   = tierIndex < tiers.length - 1 ? tiers[tierIndex + 1][0] : tierStart + 20;
      // progress within tier: 0.0 → 1.0
      const progress = Math.min(1, (combo - tierStart) / Math.max(1, tierEnd - tierStart));
      const base  = TIER_BASE[tierIndex]  || 1200;
      const range = TIER_RANGE[tierIndex] || 160;
      const pitch = base + progress * range;
      const rnd = 1 + (Math.random() - 0.5) * 0.04;
      // volume grows with tier
      const vol = Math.min(0.6, 0.25 + tierIndex * 0.05);

      // main chime — ascending within tier
      t({ type: 'sine', freq: pitch * rnd, freq2: pitch * 1.1, duration: 0.16, attack: 0.002, decay: 0.04, sustain: 0.35, release: 0.08, gain: vol });
      // harmonic overtone — richer at higher tiers
      const overtoneGain = Math.min(0.25, 0.06 + tierIndex * 0.03);
      t({ type: 'sine', freq: pitch * 2 * rnd, duration: 0.12, attack: 0.003, decay: 0.03, sustain: 0.2, release: 0.06, gain: overtoneGain });
      // shimmer noise from tier 3 (orange) onward
      if (tierIndex >= 3) {
        n({ duration: 0.08, gain: 0.06 + (tierIndex - 3) * 0.03, highpass: 4000, lowpass: 10000 });
      }
    },

    comboThreshold(tierIndex) {
      // tier-up burst — plays when color changes
      // tierIndex 0=white (never fires), 1=blue, 2=yellow, 3=orange, 4=red, 5=purple, 6=rainbow
      const TIER_CHORDS = [
        [400, 500, 600],     // 0 white (not used — first tier doesn't trigger threshold)
        [500, 625, 750],     // 1 blue — clean fifth
        [600, 750, 900],     // 2 yellow — bright
        [700, 875, 1050],    // 3 orange — warm power
        [820, 1025, 1230],   // 4 red — intense
        [950, 1190, 1425],   // 5 purple — triumphant
        [1100, 1375, 1650],  // 6 rainbow — epic climax
      ];
      const rnd = 1 + (Math.random() - 0.5) * 0.03;
      const chord = TIER_CHORDS[tierIndex] || TIER_CHORDS[6];
      const vol = Math.min(0.6, 0.35 + tierIndex * 0.04);
      const dur = 0.2 + tierIndex * 0.015;

      // three-note ascending chord
      t({ type: 'sine', freq: chord[0] * rnd, duration: dur, attack: 0.003, decay: 0.06, sustain: 0.4, release: 0.1, gain: vol });
      setTimeout(() =>
        t({ type: 'sine', freq: chord[1] * rnd, duration: dur * 0.85, attack: 0.003, decay: 0.05, sustain: 0.35, release: 0.08, gain: vol * 0.9 })
      , 40);
      setTimeout(() =>
        t({ type: 'sine', freq: chord[2] * rnd, duration: dur * 0.9, attack: 0.004, decay: 0.06, sustain: 0.3, release: 0.1, gain: vol * 0.8 })
      , 90);
      // shimmer — grows with tier
      n({ duration: 0.1 + tierIndex * 0.02, gain: 0.1 + tierIndex * 0.02, highpass: 3000, lowpass: 9000 });
      // rainbow tier (6): extra octave tail for epic feel
      if (tierIndex >= 6) {
        setTimeout(() =>
          t({ type: 'sine', freq: chord[2] * 2 * rnd, duration: 0.25, attack: 0.005, decay: 0.08, sustain: 0.25, release: 0.12, gain: 0.25 })
        , 150);
      }
    },
    comboLost(combo) {
      // deflating sigh — scales with how big the combo was
      // tier lookup for intensity: losing a rainbow combo hurts more than blue
      const tiers = CONFIG.combo.tiers;
      let tierIdx = 0;
      for (let i = tiers.length - 1; i >= 0; i--) {
        if (combo >= tiers[i][0]) { tierIdx = i; break; }
      }
      const intensity = Math.min(1, tierIdx / (tiers.length - 1));
      // sad descending tone — pitch drops more for bigger combos lost
      const startFreq = 380 + intensity * 280;
      const dur = 0.28 + intensity * 0.15;
      t({ type: 'sine', freq: startFreq, freq2: 170, duration: dur, attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.15, gain: 0.28 + intensity * 0.2 });
      // hollow undertone
      t({ type: 'triangle', freq: startFreq * 0.5, freq2: 90, duration: dur * 0.85, attack: 0.004, decay: 0.08, sustain: 0.25, release: 0.12, gain: 0.18 + intensity * 0.1 });
      // breathy noise — deflation feel, longer at high tiers
      n({ duration: 0.18 + intensity * 0.1, gain: 0.1 + intensity * 0.08, highpass: 200, lowpass: 1500 });
    },

    gameOver() {
      const seq = [{ f: 330, d: 0.18 }, { f: 220, d: 0.18 }, { f: 165, d: 0.28 }];
      seq.forEach((s, i) =>
        setTimeout(() =>
          t({ type: 'sawtooth', freq: s.f, duration: s.d, attack: 0.005, decay: 0.08, sustain: 0.4, release: 0.1, gain: 0.45 })
        , i * 160)
      );
    },

  };

})();