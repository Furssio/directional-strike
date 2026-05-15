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
      t({ type: 'sawtooth', freq: 120, freq2: 60, duration: 0.18, attack: 0.002, decay: 0.08, sustain: 0.2, release: 0.08, gain: 0.7 });
      n({ duration: 0.12, gain: 0.4, highpass: 200, lowpass: 1500 });
    },

    miss() {
      t({ type: 'sine', freq: 200, freq2: 160, duration: 0.07, attack: 0.002, decay: 0.03, sustain: 0.2, release: 0.03, gain: 0.2 });
    },

    parry() {
      // metallic deflect — sharp tink + body + spark
      const rnd = 1 + (Math.random() - 0.5) * 0.06;
      t({ type: 'sine',     freq: 1800 * rnd, duration: 0.04, attack: 0.001, decay: 0.015, sustain: 0.2, release: 0.02, gain: 0.45 });
      t({ type: 'triangle', freq: 900 * rnd,  duration: 0.07, attack: 0.002, decay: 0.03,  sustain: 0.3, release: 0.03, gain: 0.35 });
      n({ duration: 0.04, gain: 0.18, highpass: 3000, lowpass: 8000 });
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

     slash() {
      const path = SLASH_PATHS[Math.floor(Math.random() * SLASH_PATHS.length)];
      AudioCore.playFile(path, { volume: 0.05 });
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