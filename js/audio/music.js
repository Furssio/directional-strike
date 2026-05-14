/* ═══════════════════════════════════════
   AUDIO/MUSIC.JS
   Background music manager.
   Play, stop, pause, resume tracks.

   Depends on: audio/core.js (AudioCore)
   ═══════════════════════════════════════ */

const Music = (() => {

  let _current = null;

  function play(path, { volume = 0.4, loop = true } = {}) {
    stop();
    _current = AudioCore.playFile(path, { volume, loop });
  }

  function stop() {
    AudioCore.stopFile(_current);
    _current = null;
  }

  function pause() {
    if (_current && !_current.paused) {
      _current.pause();
    }
  }

  function resume() {
    if (_current && _current.paused && _current.currentTime > 0) {
      _current.play();
    }
  }

  function isPlaying() {
    return _current && !_current.paused;
  }

  return { play, stop, pause, resume, isPlaying };

})();