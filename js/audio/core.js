/* ═══════════════════════════════════════
   AUDIO/CORE.JS
   Web Audio API context with auto-init on
   first user gesture. Provides tone(), noise(),
   playFile(), stopFile() utilities.
   Master volume via setVolume() — persisted
   in localStorage.

   Depends on: config.js (CONFIG.audio)
   ═══════════════════════════════════════ */

const AudioCore = (() => {

  let ctx = null;
  let _bound = false;

  /* ── AUTO-INIT ON FIRST USER GESTURE ── */
  function _autoInit() {
    if (_bound) return;
    _bound = true;
    const handler = () => {
      init();
      if (ctx && ctx.state === 'suspended') ctx.resume();
      document.removeEventListener('click', handler);
      document.removeEventListener('touchstart', handler);
      document.removeEventListener('keydown', handler);
    };
    document.addEventListener('click', handler);
    document.addEventListener('touchstart', handler);
    document.addEventListener('keydown', handler);
  }

  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not available', e);
    }
  }

  function getCtx() { return ctx; }
  const vol = () => CONFIG.audio.volume;

  /* ── MUTE CHECK ── */
  function _isMuted() {
    return !CONFIG.audio.enabled || CONFIG.audio.volume <= 0;
  }

  /* ── SET VOLUME ──
     Sets master volume 0.0–1.0. Persists to localStorage.
     When volume hits 0: stops all active ability audio + music. */
  function setVolume(val) {
    CONFIG.audio.volume = Math.max(0, Math.min(1, val));
    localStorage.setItem('ds_volume', CONFIG.audio.volume.toFixed(2));

    if (CONFIG.audio.volume <= 0) {
      SfxAbilities.stopAll();
      Music.stop();
    }
  }

  function isMuted() {
    return _isMuted();
  }

  function tone({
    type = 'sine', freq = 440, freq2 = null,
    duration = 0.15, attack = 0.005, decay = 0.05,
    sustain = 0.6, release = 0.1, gain = 1.0, detune = 0,
  } = {}) {
    if (!ctx || _isMuted()) return;
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
    } catch (e) {}
  }

  function noise({
    duration = 0.1, gain = 0.5,
    highpass = 0, lowpass = 4000,
  } = {}) {
    if (!ctx || _isMuted()) return;
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
    } catch (e) {}
  }

  /* ── FILE PLAYBACK ── */
  function playFile(path, { loop = false, volume = 1.0 } = {}) {
    if (_isMuted()) return null;
    try {
      const audio  = new Audio(path);
      audio.volume = volume * vol();
      audio.loop   = loop;
      audio.play();
      return audio;
    } catch (e) { return null; }
  }

  function stopFile(audio) {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }

  // auto-bind on script load
  _autoInit();

  return { init, getCtx, tone, noise, playFile, stopFile, vol, setVolume, isMuted };

})();