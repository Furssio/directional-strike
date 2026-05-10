/* ═══════════════════════════════════════
   MUSIC.JS
   Background music manager.
   Play, stop, crossfade between tracks.

   Depends on: audio.js (AudioCore)
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

  function isPlaying() {
    return _current && !_current.paused;
  }

  return { play, stop, isPlaying };

})();