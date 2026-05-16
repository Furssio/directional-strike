/* ═══════════════════════════════════════
   AUDIO/MUSIC.JS
   Background music manager.
   Play, stop, fade out, pause, resume.

   Depends on: audio/core.js (AudioCore)
   ═══════════════════════════════════════ */

const Music = (() => {

  const PATHS = {
    menu: 'assets/audio/music/menu.mp3',
  };

  let _current = null;
  let _currentPath = null;
  let _fadeTimer = null;
  let _baseVolume = 0.4;

  /* ── PLAY ──
     If same track already playing, do nothing.
     Otherwise stop current and start new. */
  function play(path, { volume = 0.4, loop = true } = {}) {
    // same track already playing — skip
    if (_currentPath === path && _current && !_current.paused) return;
    // same track paused (e.g. after pause()) — resume instead
    if (_currentPath === path && _current && _current.paused) {
      _current.play();
      return;
    }
    _kill();
    _baseVolume = volume;
    _currentPath = path;
    _current = AudioCore.playFile(path, { volume, loop });
  }
  /* ── STOP (instant) ── */
  function stop() {
    _kill();
  }

  /* ── FADE OUT ──
     Gradually reduce volume, then kill.
     @param duration  ms (default 500)
     @param onDone    callback after fade completes */
  function fadeOut(duration = 500, onDone) {
    if (!_current || _current.paused) {
      _kill();
      if (onDone) onDone();
      return;
    }
    if (_fadeTimer) clearInterval(_fadeTimer);
    const step = 30;
    const ticks = Math.max(1, Math.floor(duration / step));
    const volDrop = _current.volume / ticks;
    _fadeTimer = setInterval(() => {
      if (!_current) {
        clearInterval(_fadeTimer);
        _fadeTimer = null;
        if (onDone) onDone();
        return;
      }
      _current.volume = Math.max(0, _current.volume - volDrop);
      if (_current.volume <= 0.01) {
        _kill();
        if (onDone) onDone();
      }
    }, step);
  }

  /* ── PAUSE / RESUME ── */
  function pause() {
    if (_current && !_current.paused) _current.pause();
  }

  function resume() {
    if (_current && _current.paused && _current.currentTime > 0) _current.play();
  }

  function isPlaying() {
    return _current !== null && !_current.paused;
  }

  /* ── HELPERS ── */
  function playMenu() {
    play(PATHS.menu, { volume: 0.15, loop: true });
  }

  /* ── INTERNAL CLEANUP ── */
  function _kill() {
    if (_fadeTimer) { clearInterval(_fadeTimer); _fadeTimer = null; }
    if (_current) { AudioCore.stopFile(_current); _current = null; }
    _currentPath = null;
  }

  return { play, stop, fadeOut, pause, resume, isPlaying, playMenu, PATHS };

})();