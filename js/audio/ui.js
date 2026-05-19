/* ═══════════════════════════════════════
   AUDIO/UI.JS
   UI sound effects — modern RPG pixel style.
   Clean sine/triangle tones with lowpass
   filters, no harsh square waves.

   Depends on: audio/core.js (AudioCore)
   ═══════════════════════════════════════ */

const SfxUi = (() => {

  const t = (o) => AudioCore.tone(o);
  const n = (o) => AudioCore.noise(o);

  /* helper: delayed tone */
  function td(delay, o) {
    setTimeout(() => t(o), delay);
  }

  /* helper: delayed noise */
  function nd(delay, o) {
    setTimeout(() => n(o), delay);
  }

  return {

    /* ── HOVER: soft bell tap ── */
    hover() {
      t({ type: 'sine', freq: 1800, duration: 0.07, attack: 0.003,
          decay: 0.03, sustain: 0.15, release: 0.03, gain: 0.08 });
      t({ type: 'sine', freq: 2700, duration: 0.05, attack: 0.003,
          decay: 0.02, sustain: 0.1, release: 0.02, gain: 0.04 });
    },

    /* ── CLICK: crisp confirmation ping ── */
    click() {
      t({ type: 'triangle', freq: 800, duration: 0.06, attack: 0.003,
          decay: 0.025, sustain: 0.3, release: 0.02, gain: 0.18 });
      t({ type: 'sine', freq: 1200, duration: 0.08, attack: 0.005,
          decay: 0.03, sustain: 0.2, release: 0.03, gain: 0.1 });
      n({ duration: 0.03, gain: 0.04, highpass: 4000, lowpass: 8000 });
    },

    /* ── BACK: gentle descending tone ── */
    back() {
      t({ type: 'triangle', freq: 700, freq2: 400, duration: 0.12,
          attack: 0.005, decay: 0.04, sustain: 0.3, release: 0.05, gain: 0.15 });
      t({ type: 'sine', freq: 1050, freq2: 600, duration: 0.1,
          attack: 0.005, decay: 0.03, sustain: 0.2, release: 0.04, gain: 0.06 });
    },

    /* ── ERROR: muffled double thud ── */
    error() {
      t({ type: 'triangle', freq: 250, duration: 0.12, attack: 0.005,
          decay: 0.05, sustain: 0.4, release: 0.05, gain: 0.2 });
      td(90, { type: 'triangle', freq: 200, duration: 0.15, attack: 0.005,
          decay: 0.05, sustain: 0.35, release: 0.06, gain: 0.18 });
      nd(50, { duration: 0.08, gain: 0.06, highpass: 100, lowpass: 600 });
    },

    /* ── PAUSE OPEN: airy descending whoosh ── */
    pauseOpen() {
      t({ type: 'sine', freq: 900, freq2: 350, duration: 0.25,
          attack: 0.01, decay: 0.08, sustain: 0.3, release: 0.1, gain: 0.15 });
      t({ type: 'sine', freq: 1350, freq2: 520, duration: 0.2,
          attack: 0.01, decay: 0.06, sustain: 0.2, release: 0.08, gain: 0.07 });
      n({ duration: 0.12, gain: 0.06, highpass: 1000, lowpass: 4000 });
    },

    /* ── PAUSE CLOSE: ascending shimmer ── */
    pauseClose() {
      t({ type: 'sine', freq: 400, freq2: 900, duration: 0.18,
          attack: 0.008, decay: 0.05, sustain: 0.35, release: 0.07, gain: 0.16 });
      t({ type: 'sine', freq: 600, freq2: 1350, duration: 0.15,
          attack: 0.008, decay: 0.04, sustain: 0.25, release: 0.06, gain: 0.08 });
      nd(50, { duration: 0.08, gain: 0.05, highpass: 2000, lowpass: 6000 });
    },

    /* ── MAP SLIDE: soft swipe tick ── */
    mapSlide() {
      t({ type: 'sine', freq: 600, freq2: 900, duration: 0.06,
          attack: 0.003, decay: 0.02, sustain: 0.2, release: 0.025, gain: 0.12 });
      n({ duration: 0.025, gain: 0.04, highpass: 3000, lowpass: 7000 });
    },

    /* ── MAP CONFIRM: warm ascending chime ── */
    mapConfirm() {
      t({ type: 'sine', freq: 523, duration: 0.1, attack: 0.005,
          decay: 0.03, sustain: 0.4, release: 0.04, gain: 0.18 });
      td(80, { type: 'sine', freq: 659, duration: 0.1, attack: 0.005,
          decay: 0.03, sustain: 0.4, release: 0.04, gain: 0.16 });
      td(160, { type: 'sine', freq: 784, duration: 0.15, attack: 0.005,
          decay: 0.04, sustain: 0.35, release: 0.07, gain: 0.18 });
      td(160, { type: 'sine', freq: 1568, duration: 0.12, attack: 0.008,
          decay: 0.04, sustain: 0.15, release: 0.06, gain: 0.06 });
    },

    /* ── CARD HOVER: tiny crystal tap ── */
    cardHover() {
      t({ type: 'sine', freq: 1400, duration: 0.05, attack: 0.003,
          decay: 0.02, sustain: 0.15, release: 0.02, gain: 0.07 });
      t({ type: 'sine', freq: 2100, duration: 0.04, attack: 0.003,
          decay: 0.015, sustain: 0.1, release: 0.015, gain: 0.03 });
    },

    /* ── CARD PICK: magic sparkle confirm ── */
    cardPick() {
      t({ type: 'sine', freq: 523, duration: 0.08, attack: 0.004,
          decay: 0.025, sustain: 0.4, release: 0.03, gain: 0.16 });
      td(60, { type: 'sine', freq: 784, duration: 0.08, attack: 0.004,
          decay: 0.025, sustain: 0.4, release: 0.03, gain: 0.14 });
      td(120, { type: 'sine', freq: 1047, duration: 0.12, attack: 0.005,
          decay: 0.035, sustain: 0.3, release: 0.05, gain: 0.16 });
      nd(120, { duration: 0.06, gain: 0.06, highpass: 4000, lowpass: 10000 });
      td(150, { type: 'sine', freq: 1568, duration: 0.08, attack: 0.008,
          decay: 0.03, sustain: 0.12, release: 0.04, gain: 0.05 });
    },

    /* ── COUNTDOWN: resonant bell tick ── */
    countdown() {
      t({ type: 'sine', freq: 520, duration: 0.15, attack: 0.004,
          decay: 0.05, sustain: 0.3, release: 0.07, gain: 0.2 });
      t({ type: 'sine', freq: 1040, duration: 0.1, attack: 0.004,
          decay: 0.04, sustain: 0.15, release: 0.05, gain: 0.07 });
    },

    /* ── COUNTDOWN GO: burst of energy ── */
    countdownGo() {
      t({ type: 'sine', freq: 520, duration: 0.06, attack: 0.003,
          decay: 0.02, sustain: 0.4, release: 0.02, gain: 0.2 });
      td(50, { type: 'sine', freq: 1047, duration: 0.2, attack: 0.005,
          decay: 0.06, sustain: 0.3, release: 0.1, gain: 0.22 });
      td(50, { type: 'sine', freq: 1568, duration: 0.15, attack: 0.008,
          decay: 0.05, sustain: 0.15, release: 0.08, gain: 0.08 });
      nd(50, { duration: 0.1, gain: 0.1, highpass: 2000, lowpass: 7000 });
    },

    /* ── MAP COMPLETE: victory fanfare ── */
    mapComplete() {
      const notes = [
        { f: 523, d: 0.12 }, { f: 659, d: 0.12 },
        { f: 784, d: 0.12 }, { f: 1047, d: 0.25 },
      ];
      let time = 0;
      notes.forEach(({ f, d }) => {
        td(time, { type: 'sine', freq: f, duration: d, attack: 0.006,
            decay: 0.04, sustain: 0.4, release: d * 0.4, gain: 0.18 });
        td(time, { type: 'sine', freq: f * 1.5, duration: d * 0.7,
            attack: 0.008, decay: 0.03, sustain: 0.15, release: d * 0.3, gain: 0.05 });
        time += Math.round(d * 850);
      });
      nd(time - 50, { duration: 0.15, gain: 0.07, highpass: 3000, lowpass: 10000 });
    },

    /* ── GAME OVER: somber descent ── */
    gameOver() {
      const notes = [
        { f: 440, d: 0.22 }, { f: 380, d: 0.22 },
        { f: 330, d: 0.25 }, { f: 220, d: 0.4 },
      ];
      let time = 0;
      notes.forEach(({ f, d }) => {
        td(time, { type: 'sine', freq: f, duration: d, attack: 0.01,
            decay: 0.06, sustain: 0.45, release: d * 0.35, gain: 0.2 });
        td(time, { type: 'sine', freq: f * 0.5, duration: d, attack: 0.015,
            decay: 0.06, sustain: 0.3, release: d * 0.3, gain: 0.08 });
        time += Math.round(d * 800);
      });
      nd(time - 100, { duration: 0.25, gain: 0.08, highpass: 100, lowpass: 800 });
    },

    /* ── LEVEL UP: warm ascending sequence ── */
    levelUp() {
      const seq = [
        { f: 440, d: 0.1 }, { f: 550, d: 0.1 },
        { f: 660, d: 0.1 }, { f: 880, d: 0.18 },
      ];
      seq.forEach((s, i) =>
        td(i * 90, { type: 'sine', freq: s.f, duration: s.d,
            attack: 0.005, decay: 0.04, sustain: 0.4, release: 0.06, gain: 0.18 })
      );
    },

    /* ── ABILITY PICK: kept for legacy compat ── */
    abilityPick() {
      t({ type: 'sine', freq: 660, freq2: 990, duration: 0.20,
          attack: 0.005, decay: 0.06, sustain: 0.4, release: 0.1, gain: 0.18 });
      td(100, { type: 'sine', freq: 990, duration: 0.15, attack: 0.003,
          decay: 0.05, sustain: 0.3, release: 0.08, gain: 0.12 });
    },

    /* ── SHIELD BLOCK: soft resonant tap ── */
    shield() {
      t({ type: 'sine', freq: 520, freq2: 620, duration: 0.12,
          attack: 0.01, decay: 0.04, sustain: 0.4, release: 0.06, gain: 0.18 });
    },

    /* ── TRANSITION IN: rumble down ── */
    transIn() {
      n({ duration: 0.35, gain: 0.15, highpass: 200, lowpass: 2000 });
      t({ type: 'sine', freq: 300, freq2: 80, duration: 0.30,
          attack: 0.01, decay: 0.08, sustain: 0.4, release: 0.15, gain: 0.15 });
    },

    /* ── TRANSITION OUT: shimmer up ── */
    transOut() {
      n({ duration: 0.25, gain: 0.10, highpass: 800, lowpass: 4000 });
      t({ type: 'sine', freq: 150, freq2: 400, duration: 0.25,
          attack: 0.01, decay: 0.06, sustain: 0.4, release: 0.12, gain: 0.12 });
    },

    /* ── SLOT TICK: mechanical click during spin ── */
    slotTick() {
      t({ type: 'triangle', freq: 1200, freq2: 800, duration: 0.03,
          attack: 0.002, decay: 0.01, sustain: 0.15, release: 0.01, gain: 0.06 });
      n({ duration: 0.015, gain: 0.03, highpass: 3000, lowpass: 8000 });
    },

    /* ── SLOT STOP: thunk when reel lands ── */
    slotStop() {
      t({ type: 'triangle', freq: 300, freq2: 180, duration: 0.12,
          attack: 0.004, decay: 0.04, sustain: 0.4, release: 0.06, gain: 0.2 });
      t({ type: 'sine', freq: 600, duration: 0.08, attack: 0.003,
          decay: 0.03, sustain: 0.2, release: 0.04, gain: 0.08 });
      n({ duration: 0.06, gain: 0.08, highpass: 200, lowpass: 1500 });
    },

    /* ── SLOT WIN: triumphant fanfare ── */
    slotWin() {
      t({ type: 'sine', freq: 523, duration: 0.1, attack: 0.005,
          decay: 0.03, sustain: 0.45, release: 0.04, gain: 0.2 });
      td(100, { type: 'sine', freq: 659, duration: 0.1, attack: 0.005,
          decay: 0.03, sustain: 0.45, release: 0.04, gain: 0.18 });
      td(200, { type: 'sine', freq: 784, duration: 0.1, attack: 0.005,
          decay: 0.03, sustain: 0.45, release: 0.04, gain: 0.18 });
      td(300, { type: 'sine', freq: 1047, duration: 0.25, attack: 0.005,
          decay: 0.05, sustain: 0.4, release: 0.12, gain: 0.22 });
      td(300, { type: 'sine', freq: 1568, duration: 0.2, attack: 0.008,
          decay: 0.04, sustain: 0.15, release: 0.1, gain: 0.07 });
      nd(350, { duration: 0.15, gain: 0.08, highpass: 3000, lowpass: 10000 });
    },

    /* ── SLOT NEAR MISS: tense descending whiff ── */
    slotNearMiss() {
      t({ type: 'sine', freq: 600, freq2: 250, duration: 0.35,
          attack: 0.008, decay: 0.08, sustain: 0.4, release: 0.15, gain: 0.18 });
      td(50, { type: 'sine', freq: 900, freq2: 375, duration: 0.3,
          attack: 0.008, decay: 0.06, sustain: 0.25, release: 0.12, gain: 0.08 });
      nd(100, { duration: 0.15, gain: 0.06, highpass: 200, lowpass: 1200 });
    },

  };

})();