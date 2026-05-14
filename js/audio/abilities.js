/* ═══════════════════════════════════════
   AUDIO/ABILITIES.JS
   Ability sound effects. Procedural and
   file-based audio for special abilities.
   Manages pause/resume/stop for looping
   or long-duration ability audio.

   Depends on: audio/core.js (AudioCore)
   ═══════════════════════════════════════ */

const SfxAbilities = (() => {

  const PATHS = {
    bulletTime: 'assets/audio/sfx/abilities/bullet_time.mp3',
  };

  let _btAudio = null;
  let _btFadeTimer = null;

  function _killBtAudio() {
    if (_btFadeTimer) {
      clearInterval(_btFadeTimer);
      _btFadeTimer = null;
    }
    if (_btAudio) {
      AudioCore.stopFile(_btAudio);
      _btAudio = null;
    }
  }

  return {

    special() {
      AudioCore.tone({ type: 'sine', freq: 880, freq2: 1200, duration: 0.25, attack: 0.01, decay: 0.08, sustain: 0.5, release: 0.12, gain: 0.6 });
      setTimeout(() =>
        AudioCore.tone({ type: 'sine', freq: 1100, freq2: 1400, duration: 0.2, attack: 0.005, decay: 0.06, sustain: 0.4, release: 0.1, gain: 0.4 })
      , 80);
    },

    specialReady() {
      AudioCore.tone({ type: 'sine', freq: 1000, freq2: 1200, duration: 0.12, attack: 0.003, decay: 0.04, sustain: 0.4, release: 0.06, gain: 0.3 });
    },

    bulletTimeStart() {
      _killBtAudio();
      _btAudio = AudioCore.playFile(PATHS.bulletTime);
    },

    bulletTimeStop() {
      if (!_btAudio) return;
      if (_btFadeTimer) return;

      const audio = _btAudio;
      const startVol = audio.volume;
      const steps = 10;
      const interval = 500 / steps;
      let step = 0;

      _btFadeTimer = setInterval(() => {
        step++;
        audio.volume = Math.max(0, startVol * (1 - step / steps));
        if (step >= steps) {
          _killBtAudio();
        }
      }, interval);
    },

    pauseAll() {
      if (_btAudio && !_btAudio.paused) {
        _btAudio.pause();
      }
    },

    resumeAll() {
      if (_btAudio && _btAudio.paused && _btAudio.currentTime > 0) {
        _btAudio.play();
      }
    },

    stopAll() {
      _killBtAudio();
    },

  };

})();