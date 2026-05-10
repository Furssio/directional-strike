/* ═══════════════════════════════════════
   SFX-UI.JS
   UI sound effects: level up, ability pick,
   shield block, menu sounds.

   Depends on: audio.js (AudioCore)
   ═══════════════════════════════════════ */

const SfxUi = (() => {

  const t = (o) => AudioCore.tone(o);

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

  };

})();