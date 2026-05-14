/* ═══════════════════════════════════════
   AUDIO/UI.JS
   UI sound effects: level up, ability pick,
   shield block, click, hover, transitions.

   Depends on: audio/core.js (AudioCore)
   ═══════════════════════════════════════ */

const SfxUi = (() => {

  const t = (o) => AudioCore.tone(o);
  const n = (o) => AudioCore.noise(o);

  return {

    levelUp() {
      const seq = [{ f: 440, d: 0.10 }, { f: 550, d: 0.10 }, { f: 660, d: 0.10 }, { f: 880, d: 0.18 }];
      seq.forEach((s, i) =>
        setTimeout(() =>
          t({ type: 'sine', freq: s.f, duration: s.d, attack: 0.005, decay: 0.04, sustain: 0.6, release: 0.06, gain: 0.55 })
        , i * 90)
      );
    },

    abilityPick() {
      t({ type: 'sine', freq: 660, freq2: 990, duration: 0.20, attack: 0.005, decay: 0.06, sustain: 0.5, release: 0.1, gain: 0.5 });
      setTimeout(() =>
        t({ type: 'sine', freq: 990, duration: 0.15, attack: 0.003, decay: 0.05, sustain: 0.4, release: 0.08, gain: 0.35 })
      , 100);
    },

    shield() {
      t({ type: 'sine', freq: 520, freq2: 620, duration: 0.12, attack: 0.01, decay: 0.04, sustain: 0.5, release: 0.06, gain: 0.35 });
    },

    click() {
      t({ type: 'square', freq: 800, freq2: 1000, duration: 0.06, attack: 0.003, decay: 0.02, sustain: 0.3, release: 0.03, gain: 0.25 });
    },

    hover() {
      t({ type: 'sine', freq: 1200, duration: 0.03, attack: 0.002, decay: 0.01, sustain: 0.2, release: 0.02, gain: 0.10 });
    },

    transIn() {
      n({ duration: 0.35, gain: 0.20, highpass: 200, lowpass: 2000 });
      t({ type: 'sine', freq: 300, freq2: 80, duration: 0.30, attack: 0.01, decay: 0.08, sustain: 0.4, release: 0.15, gain: 0.18 });
    },

    transOut() {
      n({ duration: 0.25, gain: 0.12, highpass: 800, lowpass: 4000 });
      t({ type: 'sine', freq: 150, freq2: 400, duration: 0.25, attack: 0.01, decay: 0.06, sustain: 0.4, release: 0.12, gain: 0.15 });
    },

  };

})();