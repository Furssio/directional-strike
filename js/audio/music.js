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

    const gVol = (CONFIG.music && CONFIG.music.gameBaseVol) || 0.35;
_introHandle.volume       = _vol() * gVol;
    _introHandle.playbackRate = _rate;

    _introHandle.onEnded = () => {
      _introHandle = null;
      // if killed or fading during intro, don't start loop
      if (_phase !== 'intro') return;

      _phase      = 'loop';
      _loopHandle = AudioCore.playFile(loopPath, { loop: true, volume: 1.0, force: true });
      if (_loopHandle) {
        const gVol2 = (CONFIG.music && CONFIG.music.gameBaseVol) || 0.35;
_loopHandle.volume       = _vol() * gVol2;
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

    const gVol = (CONFIG.music && CONFIG.music.gameBaseVol) || 0.35;
    const targetVol = _vol() * gVol;
    const fadeDur = (CONFIG.music && CONFIG.music.breathFade) || 1500;
    const fadeStep = 30;
    const fadeTicks = Math.max(1, Math.floor(fadeDur / fadeStep));

    _loopHandle = AudioCore.playFile(_breathPath, { loop: false, volume: 1.0, force: true });
    if (!_loopHandle) return;

    // fade in from 0
    _loopHandle.volume       = 0;
    _loopHandle.playbackRate = _rate;

    let fadeInStep = 0;
    const fadeInTimer = setInterval(() => {
      fadeInStep++;
      if (!_loopHandle || _phase !== 'breath') { clearInterval(fadeInTimer); return; }
      _loopHandle.volume = targetVol * (fadeInStep / fadeTicks);
      if (fadeInStep >= fadeTicks) {
        clearInterval(fadeInTimer);
        _loopHandle.volume = targetVol;
      }
    }, fadeStep);

// schedule fade out before track ends
    const _schedFadeOut = () => {
      if (!_loopHandle || !_loopHandle.duration || _phase !== 'breath') return;
      const dur = _loopHandle.duration / _rate;
      const fadeStart = Math.max(0, (dur - fadeDur / 1000) * 1000);
      _breathTimer = setTimeout(() => {
        _breathTimer = null;
        if (!_loopHandle || _phase !== 'breath') return;
        let fadeOutStep = 0;
        const curVol = _loopHandle.volume;
        const foTimer = setInterval(() => {
          fadeOutStep++;
          if (!_loopHandle) { clearInterval(foTimer); return; }
          _loopHandle.volume = Math.max(0, curVol * (1 - fadeOutStep / fadeTicks));
          if (fadeOutStep >= fadeTicks) clearInterval(foTimer);
        }, fadeStep);
      }, fadeStart);
    };

    // buffer might not be loaded yet — wait for duration
    if (_loopHandle.duration > 0) {
      _schedFadeOut();
    } else {
      const _waitDur = setInterval(() => {
        if (!_loopHandle) { clearInterval(_waitDur); return; }
        if (_loopHandle.duration > 0) {
          clearInterval(_waitDur);
          _schedFadeOut();
        }
      }, 100);
    }

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
 function playMap(mapId, opts) {
    if (!CONFIG.music || !CONFIG.music.mapTracks) return;
    const trackName = CONFIG.music.mapTracks[mapId];
    if (!trackName) return;

    const keepRate = (opts && opts.keepRate);
    _kill();
    if (!keepRate) _rate = 1.0;
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
    if (CONFIG.music) CONFIG.music.volume = _volume;
    try { localStorage.setItem('ds_music_volume', _volume.toFixed(2)); } catch (e) {}
    try { localStorage.setItem('ds_music_volume', _volume.toFixed(2)); } catch (e) {}

    const gVol = (CONFIG.music && CONFIG.music.gameBaseVol) || 0.35;
_applyVol(_introHandle, gVol);
_applyVol(_loopHandle,  gVol);

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