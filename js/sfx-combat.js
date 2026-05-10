/* ═══════════════════════════════════════
   SFX-COMBAT.JS
   Combat sound effects: hit, kill, damage,
   miss, bullet, game over.

   Depends on: audio.js (AudioCore)
   ═══════════════════════════════════════ */

const SfxCombat = (() => {

  const t = (o) => AudioCore.tone(o);
  const n = (o) => AudioCore.noise(o);

  return {

    hit() {
      t({ type: 'square', freq: 180, freq2: 80, duration: 0.08, attack: 0.002, decay: 0.03, sustain: 0.3, release: 0.04, gain: 0.6 });
      n({ duration: 0.05, gain: 0.25, highpass: 800, lowpass: 3000 });
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