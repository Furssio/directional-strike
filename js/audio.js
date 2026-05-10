/* ═══════════════════════════════════════
   AUDIO.JS — CORE
   Web Audio API context, tone() and noise()
   helpers. File audio playback utility.

   Depends on: config.js (CONFIG.audio)
   ═══════════════════════════════════════ */

const AudioCore = (() => {

  let ctx = null;

  const vol = () => CONFIG.audio.volume;

  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) {
      console.warn('Web Audio API not available', e);
    }
  }

  function getCtx() { return ctx; }

  function tone({
    type = 'sine', freq = 440, freq2 = null,
    duration = 0.15, attack = 0.005, decay = 0.05,
    sustain = 0.6, release = 0.1, gain = 1.0, detune = 0,
  } = {}) {
    if (!ctx || !CONFIG.audio.enabled) return;
    try {
      const g   = ctx.createGain();
      g.connect(ctx.destination);
      const now = ctx.currentTime;
      const pk  = gain * vol();

      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(pk, now + attack);
      g.gain.linearRampToValueAtTime(pk * sustain, now + attack + decay);
      g.gain.setValueAtTime(pk * sustain, now + duration - release);
      g.gain.linearRampToValueAtTime(0, now + duration);

      const o = ctx.createOscillator();
      o.type         = type;
      o.detune.value = detune;
      o.frequency.setValueAtTime(freq, now);
      if (freq2) o.frequency.linearRampToValueAtTime(freq2, now + duration);

      o.connect(g);
      o.start(now);
      o.stop(now + duration + 0.02);
    } catch(e) {}
  }

  function noise({
    duration = 0.1, gain = 0.5,
    highpass = 0, lowpass = 4000,
  } = {}) {
    if (!ctx || !CONFIG.audio.enabled) return;
    try {
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);

      const src = ctx.createBufferSource();
      src.buffer = buf;

      const g = ctx.createGain();
      g.gain.value = gain * vol();
      src.connect(g);

      let last = g;
      if (highpass > 0) {
        const f = ctx.createBiquadFilter();
        f.type = 'highpass'; f.frequency.value = highpass;
        last.connect(f); last = f;
      }
      if (lowpass < 20000) {
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass'; f.frequency.value = lowpass;
        last.connect(f); last = f;
      }

      last.connect(ctx.destination);
      src.start();
      src.stop(ctx.currentTime + duration + 0.02);
    } catch(e) {}
  }

  /* ── FILE PLAYBACK UTILITY ── */
  function playFile(path, { loop = false, volume = 1.0 } = {}) {
    if (!CONFIG.audio.enabled) return null;
    try {
      const audio  = new Audio(path);
      audio.volume = volume * vol();
      audio.loop   = loop;
      audio.play();
      return audio;
    } catch(e) { return null; }
  }

  function stopFile(audio) {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }

  return { init, getCtx, tone, noise, playFile, stopFile, vol };

})();