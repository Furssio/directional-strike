/* ═══════════════════════════════════════
   AUDIO/CORE.JS
   Web Audio API context with auto-init on
   first user gesture. Provides tone(), noise(),
   playFile(), stopFile() utilities.

   playFile() uses Web Audio API (fetch +
   decodeAudioData + BufferSourceNode) instead
   of HTMLAudioElement to avoid Media Session
   notifications on mobile.

   Includes auto-recovery for suspended/closed
   AudioContext (fixes audio stopping on tab
   switch, screen lock, or browser throttle).

   Master volume via setVolume() — persisted
   in localStorage.

   Depends on: config.js (CONFIG.audio)
   ═══════════════════════════════════════ */

const AudioCore = (() => {

  let ctx = null;
  let _bound = false;
  let _bufferCache = {};     // path → AudioBuffer
  let _pendingLoads = {};    // path → Promise<AudioBuffer>

  /* ═══════════════════════════════════
     CONTEXT MANAGEMENT
     ═══════════════════════════════════ */

  function _createCtx() {
    try {
      const c = new (window.AudioContext || window.webkitAudioContext)();
      // auto-resume if browser suspends context spontaneously
      c.addEventListener('statechange', () => {
        if (c.state === 'suspended' && !_isMuted()) {
          c.resume().catch(() => {});
        }
      });
      return c;
    } catch (e) {
      console.warn('Web Audio API not available', e);
      return null;
    }
  }

  function init() {
    if (ctx) return;
    ctx = _createCtx();
  }

  /* ── ENSURE CONTEXT IS ALIVE AND RUNNING ──
     Called before every audio operation.
     Handles: suspended (resume), closed (recreate),
     interrupted (iOS-specific state). */
  function _ensureCtx() {
    if (!ctx) {
      init();
      if (!ctx) return false;
    }

    // context died — recreate
    if (ctx.state === 'closed') {
      ctx = _createCtx();
      if (!ctx) return false;
      // old buffers are invalid on new context
      _bufferCache = {};
      _pendingLoads = {};
    }

    // context suspended — resume (async but fire-and-forget)
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    return true;
  }

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

  /* ── VISIBILITY CHANGE: resume on tab/app return ── */
  function _initVisibility() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
      }
    });
  }

  function getCtx() { return ctx; }
  const vol = () => CONFIG.audio.volume;

  /* ── MUTE CHECK ── */
  function _isMuted() {
    return !CONFIG.audio.enabled || CONFIG.audio.volume <= 0;
  }

  /* ── SET VOLUME ── */
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

  /* ═══════════════════════════════════
     TONE — procedural oscillator
     ═══════════════════════════════════ */
  function tone({
    type = 'sine', freq = 440, freq2 = null,
    duration = 0.15, attack = 0.005, decay = 0.05,
    sustain = 0.6, release = 0.1, gain = 1.0, detune = 0,
  } = {}) {
    if (_isMuted()) return;
    if (!_ensureCtx()) return;
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

  /* ═══════════════════════════════════
     NOISE — procedural noise burst
     ═══════════════════════════════════ */
  function noise({
    duration = 0.1, gain = 0.5,
    highpass = 0, lowpass = 4000,
  } = {}) {
    if (_isMuted()) return;
    if (!_ensureCtx()) return;
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

  /* ═══════════════════════════════════
     BUFFER CACHE — fetch once, reuse
     ═══════════════════════════════════ */
  function _getBuffer(path) {
    if (_bufferCache[path]) return Promise.resolve(_bufferCache[path]);
    if (_pendingLoads[path]) return _pendingLoads[path];

    _pendingLoads[path] = fetch(path)
      .then(r => r.arrayBuffer())
      .then(ab => ctx.decodeAudioData(ab))
      .then(buf => {
        _bufferCache[path] = buf;
        delete _pendingLoads[path];
        return buf;
      })
      .catch(e => {
        delete _pendingLoads[path];
        console.warn('AudioCore: failed to load', path, e);
        return null;
      });

    return _pendingLoads[path];
  }

  /* ═══════════════════════════════════
     AUDIO HANDLE — wraps BufferSourceNode
     Mimics HTMLAudioElement interface:
       .volume, .paused, .currentTime,
       .loop, .pause(), .play()
     Used by sfx-abilities and music for
     pause/resume/fade without changes.
     ═══════════════════════════════════ */
  function _createHandle(opts) {
    const h = {
      _gain:      null,
      _source:    null,
      _buffer:    null,
      _startCtx:  0,
      _offset:    0,
      _volume:    opts.volume * vol(),
      _loop:      opts.loop,
      _paused:    false,
      _stopped:   false,
      _playing:   false,

      get volume()  { return this._volume; },
      set volume(v) {
        this._volume = Math.max(0, Math.min(1, v));
        if (this._gain) {
          try { this._gain.gain.value = this._volume; } catch (e) {}
        }
      },

      get paused() {
        return this._paused || this._stopped || !this._playing;
      },

      get currentTime() {
        if (this._stopped) return 0;
        if (this._paused)  return this._offset;
        if (!this._playing || !ctx) return 0;
        const pos = this._offset + (ctx.currentTime - this._startCtx);
        if (this._buffer && this._loop) return pos % this._buffer.duration;
        return pos;
      },

      get loop()  { return this._loop; },
      set loop(v) {
        this._loop = v;
        if (this._source) this._source.loop = v;
      },

      _start(buffer) {
        if (this._stopped) return;
        if (!ctx || ctx.state === 'closed') return;
        this._buffer = buffer;

        this._gain = ctx.createGain();
        this._gain.gain.value = this._volume;
        this._gain.connect(ctx.destination);

        this._source = ctx.createBufferSource();
        this._source.buffer = buffer;
        this._source.loop   = this._loop;
        this._source.connect(this._gain);

        this._source.onended = () => {
          if (!this._paused && !this._stopped) {
            this._playing = false;
            this._stopped = true;
            if (this._gain) { this._gain.disconnect(); this._gain = null; }
            this._source = null;
          }
        };

        this._startCtx = ctx.currentTime;
        this._source.start(0, this._offset);
        this._playing = true;
        this._paused  = false;
      },

      pause() {
        if (!this._playing || this._paused || this._stopped) return;
        const elapsed = ctx.currentTime - this._startCtx;
        this._offset = this._offset + elapsed;
        if (this._buffer && this._loop) {
          this._offset = this._offset % this._buffer.duration;
        }
        this._paused  = true;
        this._playing = false;
        if (this._source) {
          try { this._source.onended = null; this._source.stop(); } catch (e) {}
          this._source = null;
        }
        if (this._gain) {
          this._gain.disconnect();
          this._gain = null;
        }
      },

      play() {
        if (this._stopped) return;
        if (!this._paused || !this._buffer) return;
        this._start(this._buffer);
      },

      stop() {
        this._stopped = true;
        this._playing = false;
        this._paused  = false;
        this._offset  = 0;
        if (this._source) {
          try { this._source.onended = null; this._source.stop(); } catch (e) {}
          this._source = null;
        }
        if (this._gain) {
          this._gain.disconnect();
          this._gain = null;
        }
      },
    };

    return h;
  }

  /* ═══════════════════════════════════
     playFile — PUBLIC API
     ═══════════════════════════════════ */
  function playFile(path, { loop = false, volume = 1.0 } = {}) {
    if (_isMuted()) return null;
    if (!_ensureCtx()) return null;

    const handle = _createHandle({ loop, volume });

    _getBuffer(path).then(buffer => {
      if (buffer && !handle._stopped) {
        handle._start(buffer);
      }
    });

    return handle;
  }

  /* ═══════════════════════════════════
     stopFile — PUBLIC API
     ═══════════════════════════════════ */
  function stopFile(handle) {
    if (!handle) return;
    if (typeof handle.stop === 'function') {
      handle.stop();
      return;
    }
    // legacy HTMLAudioElement fallback
    if (handle.pause) {
      handle.pause();
      try { handle.currentTime = 0; } catch (e) {}
    }
  }

  // auto-bind + visibility listener on script load
  _autoInit();
  _initVisibility();

  return { init, getCtx, tone, noise, playFile, stopFile, vol, setVolume, isMuted };

})();