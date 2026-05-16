/* ═══════════════════════════════════════
   AUDIO/AMBIENCE.JS
   Procedural ambient beat generator.
   Uses AudioCore (Web Audio API).

   API: Ambience.start(bpm), Ambience.stop()
   ═══════════════════════════════════════ */

const Ambience = (() => {

  let _timer = null;
  let _step = 0;
  let _running = false;

  const BPM = 110;
  const VOL = 0.25;

  /* ── DRUM SOUNDS ── */

  function kick() {
    const ctx = AudioCore.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // sub bass thump
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
    g.gain.setValueAtTime(VOL * 0.8, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);

    // click transient
    AudioCore.noise({ duration: 0.02, gain: VOL * 0.3, highpass: 800 });
  }

  function hihat() {
    AudioCore.noise({ duration: 0.05, gain: VOL * 0.15, highpass: 7000, lowpass: 14000 });
  }

  function hihatOpen() {
    AudioCore.noise({ duration: 0.12, gain: VOL * 0.12, highpass: 6000, lowpass: 15000 });
  }

  function snare() {
    const ctx = AudioCore.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // body
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
    g.gain.setValueAtTime(VOL * 0.35, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);

    // noise rattle
    AudioCore.noise({ duration: 0.1, gain: VOL * 0.25, highpass: 2000, lowpass: 8000 });
  }

  /* ── BASS NOTE ── */
  function bass(freq) {
    const ctx = AudioCore.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(VOL * 0.18, now);
    g.gain.setValueAtTime(VOL * 0.18, now + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  /* ── ARPEGGIO NOTE ── */
  function arp(freq) {
    const ctx = AudioCore.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(VOL * 0.08, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
  }

  /* ── SEQUENCER ──
     16-step pattern at given BPM.
     Each step = 1 sixteenth note.
     step:  0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15
     kick:  X  .  .  .  X  .  .  .  X  .  .  .  X  .  .  .
     snare: .  .  .  .  .  .  .  .  X  .  .  .  .  .  .  .
     hihat: X  .  X  .  X  .  X  .  X  .  X  .  X  .  X  .
     bass:  X  .  .  .  .  .  X  .  .  .  .  .  X  .  .  X
     arp:   .  .  .  X  .  .  .  .  .  .  .  X  .  .  X  .
  ──────────────────────────────────────── */

  // minor key: E2 bass, E minor arp (E4, G4, B4, E5)
  const BASS_NOTES = [82.4, 82.4, 73.4, 82.4]; // E2, E2, D2, E2
  const ARP_NOTES  = [329.6, 392.0, 493.9, 659.3]; // E4, G4, B4, E5

  let _bassIdx = 0;
  let _arpIdx  = 0;

  function _tick() {
    const s = _step % 16;

    // kick on 0, 4, 8, 12
    if (s % 4 === 0) kick();

    // snare on 8
    if (s === 8) snare();

    // hihat on even steps
    if (s % 2 === 0) {
      if (s === 6 || s === 14) hihatOpen();
      else hihat();
    }

    // bass on 0, 6, 12, 15
    if (s === 0 || s === 6 || s === 12 || s === 15) {
      bass(BASS_NOTES[_bassIdx % BASS_NOTES.length]);
      _bassIdx++;
    }

    // arp on 3, 11, 14
    if (s === 3 || s === 11 || s === 14) {
      arp(ARP_NOTES[_arpIdx % ARP_NOTES.length]);
      _arpIdx++;
    }

    _step++;
  }

  /* ── PUBLIC API ── */

  function start(bpm) {
    if (_running) stop();
    _running = true;
    _step = 0;
    _bassIdx = 0;
    _arpIdx = 0;
    const interval = (60 / (bpm || BPM)) / 4 * 1000; // sixteenth note in ms
    _timer = setInterval(_tick, interval);
  }

  function stop() {
    _running = false;
    if (_timer) { clearInterval(_timer); _timer = null; }
  }

  function isRunning() { return _running; }

  return { start, stop, isRunning };

})();