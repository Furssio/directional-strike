/* ═══════════════════════════════════════
   AUDIO/MUSIC.JS
   Background music manager.
   Two modes:
   - intro+loop: seamless transition from
     intro file to looping file.
   - breath: single file that restarts
     with a pause between plays (for
     tracks that don't loop cleanly).

   Independent volume from SFX, persisted
   in localStorage as ds_music_volume.

   Depends on: audio/core.js (AudioCore),
               config.js (CONFIG.music)
   ═══════════════════════════════════════ */

const Music = (() => {

  const TRACK_BASE = 'assets/audio/music/maps/';
  const PATHS      = { menu: 'assets/audio/music/menu.mp3' };

  /* ── STATE ── */
  let _introHandle   = null;
  let _loopHandle    = null;
  let _menuHandle    = null;
  let _currentTrack  = null;
  let _phase         = 'idle'; // idle | menu | intro | loop | breath | fadeout
  let _rate          = 1.0;
  let _fadeTimer     = null;
  let _breathTimer   = null;
  let _breathPath    = null;

  /* ── VOLUME (independent from SFX) ── */
  let _volume = CONFIG.music ? CONFIG.music.volume : 0.4;

  function _vol() { return _volume; }

  function _applyVol(handle, base) {
    if (handle) handle.volume = _vol() * (base || 1.0);
  }

  function _applyRate(handle) {
    if (handle) handle.playbackRate = _rate;
  }

  /* ═══════════════════════════════════
     INTERNAL CLEANUP
     ═══════════════════════════════════ */

  function _kill() {
    if (_fadeTimer)   { clearInterval(_fadeTimer);  _fadeTimer   = null; }
    if (_breathTimer) { clearTimeout(_breathTimer); _breathTimer = null; }

    if (_introHandle) { AudioCore.stopFile(_introHandle); _introHandle = null; }
    if (_loopHandle)  { AudioCore.stopFile(_loopHandle);  _loopHandle  = null; }
    if (_menuHandle)  { AudioCore.stopFile(_menuHandle);  _menuHandle  = null; }

    _currentTrack = null;
    _breathPath   = null;
    _phase        = 'idle';
  }

  /* ═══════════════════════════════════
     INTRO + LOOP (seamless)
     ═══════════════════════════════════ */

  function _startIntroLoop(trackName) {
    const introPath = TRACK_BASE + trackName + '_intro.ogg';
    const loopPath  = TRACK_BASE + trackName + '_loop.ogg';

    _phase = 'intro';
    _introHandle = AudioCore.playFile(introPath, { loop: false, volume: 1.0, force: true });
    if (!_introHandle) { _phase = 'idle'; return; }

    _introHandle.volume       = _vol();
    _introHandle.playbackRate = _rate;

    _introHandle.onEnded = () => {
      _introHandle = null;
      // if killed or fading during intro, don't start loop
      if (_phase !== 'intro') return;

      _phase      = 'loop';
      _loopHandle = AudioCore.playFile(loopPath, { loop: true, volume: 1.0, force: true });
      if (_loopHandle) {
        _loopHandle.volume       = _vol();
        _loopHandle.playbackRate = _rate;
      }
    };
  }

  /* ═══════════════════════════════════
     BREATH LOOP (moon)
     Play once → silence → play again
     ═══════════════════════════════════ */

  function _startBreath(trackName) {
    const path  = TRACK_BASE + trackName + '.ogg';
    _breathPath = path;
    _phase      = 'breath';
    _playBreathOnce();
  }

  function _playBreathOnce() {
    if (_phase !== 'breath' || !_breathPath) return;

    _loopHandle = AudioCore.playFile(_breathPath, { loop: false, volume: 1.0, force: true });
    if (!_loopHandle) return;

    _loopHandle.volume       = _vol();
    _loopHandle.playbackRate = _rate;

    _loopHandle.onEnded = () => {
      _loopHandle = null;
      if (_phase !== 'breath') return;

      const pause = (CONFIG.music && CONFIG.music.breathPause) || 800;
      _breathTimer = setTimeout(() => {
        _breathTimer = null;
        _playBreathOnce();
      }, pause);
    };
  }

  /* ═══════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════ */

  /* ── PLAY MAP MUSIC ── */
  function playMap(mapId) {
    if (!CONFIG.music || !CONFIG.music.mapTracks) return;
    const trackName = CONFIG.music.mapTracks[mapId];
    if (!trackName) return;

    _kill();
    _rate          = 1.0;
    _currentTrack  = trackName;

    if (_vol() <= 0) return;

    const isBreath = (CONFIG.music.breathTracks || []).includes(trackName);
    if (isBreath) {
      _startBreath(trackName);
    } else {
      _startIntroLoop(trackName);
    }
  }

  /* ── MENU MUSIC ── */
  function playMenu() {
    // already playing menu — skip
    if (_phase === 'menu' && _menuHandle && !_menuHandle.paused) return;
    // paused menu — resume
    if (_phase === 'menu' && _menuHandle && _menuHandle.paused) {
      _menuHandle.play();
      return;
    }

    _kill();
    _phase = 'menu';

    const baseVol   = (CONFIG.music && CONFIG.music.menuBaseVol) || 0.4;
    _menuHandle     = AudioCore.playFile(PATHS.menu, { loop: true, volume: 1.0, force: true });
    if (_menuHandle) _menuHandle.volume = _vol() * baseVol;
  }

  /* ── STOP (instant) ── */
  function stop() {
    _kill();
  }

  /* ── FADE OUT ── */
  function fadeOut(duration, onDone) {
    duration = duration || (CONFIG.music && CONFIG.music.fadeOutDuration) || 3000;

    const handle = _introHandle || _loopHandle || _menuHandle;
    if (!handle || handle.paused) {
      _kill();
      if (onDone) onDone();
      return;
    }

    if (_fadeTimer) clearInterval(_fadeTimer);
    // stop breath timer so no new instance starts during fade
    if (_breathTimer) { clearTimeout(_breathTimer); _breathTimer = null; }

    const prevPhase = _phase;
    _phase = 'fadeout';

    const step    = 30;
    const ticks   = Math.max(1, Math.floor(duration / step));
    const startV  = handle.volume;
    const volDrop = startV / ticks;

    _fadeTimer = setInterval(() => {
      const h = _introHandle || _loopHandle || _menuHandle;
      if (!h) {
        clearInterval(_fadeTimer);
        _fadeTimer = null;
        _kill();
        if (onDone) onDone();
        return;
      }
      h.volume = Math.max(0, h.volume - volDrop);
      if (h.volume <= 0.005) {
        _kill();
        if (onDone) onDone();
      }
    }, step);
  }

  /* ── CANCEL FADE (restore volume) ── */
  function cancelFade() {
    if (_fadeTimer) { clearInterval(_fadeTimer); _fadeTimer = null; }
    if (_phase !== 'fadeout') return;

    const h = _introHandle || _loopHandle;
    if (h) {
      h.volume = _vol();
      _phase = _introHandle ? 'intro' : 'loop';
    } else {
      _phase = 'idle';
    }
  }

  /* ── PAUSE / RESUME ── */
  function pause() {
    if (_introHandle && !_introHandle.paused) _introHandle.pause();
    if (_loopHandle  && !_loopHandle.paused)  _loopHandle.pause();
    if (_menuHandle  && !_menuHandle.paused)  _menuHandle.pause();
  }

  function resume() {
    if (_vol() <= 0) return;
    if (_introHandle && _introHandle.paused) _introHandle.play();
    if (_loopHandle  && _loopHandle.paused)  _loopHandle.play();
    if (_menuHandle  && _menuHandle.paused)  _menuHandle.play();
  }

  /* ── VOLUME ── */
  function setVolume(val) {
    _volume = Math.max(0, Math.min(1, val));
    try { localStorage.setItem('ds_music_volume', _volume.toFixed(2)); } catch (e) {}

    _applyVol(_introHandle, 1.0);
    _applyVol(_loopHandle,  1.0);

    const baseVol = (CONFIG.music && CONFIG.music.menuBaseVol) || 0.4;
    _applyVol(_menuHandle, baseVol);

    if (_volume <= 0 && _phase !== 'idle' && _phase !== 'menu') {
      _kill();
    }
  }

  function getVolume() { return _volume; }

  /* ── PLAYBACK RATE ── */
  function setRate(rate) {
    const max = (CONFIG.music && CONFIG.music.maxSpeed) || 1.35;
    _rate = Math.min(max, Math.max(0.5, rate));
    _applyRate(_introHandle);
    _applyRate(_loopHandle);
  }

  function incrementRate(amount) {
    setRate(_rate + (amount || 0.05));
  }

  function resetRate() {
    _rate = 1.0;
  }

  /* ── QUERIES ── */
  function isPlaying() {
    if (_introHandle && !_introHandle.paused) return true;
    if (_loopHandle  && !_loopHandle.paused)  return true;
    if (_menuHandle  && !_menuHandle.paused)  return true;
    return false;
  }

  function isFading() { return _phase === 'fadeout'; }

  return {
    playMap, playMenu,
    stop, fadeOut, cancelFade,
    pause, resume,
    isPlaying, isFading,
    setVolume, getVolume,
    setRate, incrementRate, resetRate,
    PATHS,
  };

})();