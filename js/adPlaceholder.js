/* ═══════════════════════════════════════
   ADPLACEHOLDER.JS
   Centralized rewarded ad placeholder.
   Simulates ad display with a brief
   loading overlay. Replace showRewarded()
   internals with real CrazyGames SDK
   at publish time (Blocco 13).

   Continue system:
   - 1 continue per run (adventure + challenge)
   - Challenge mode: only if current wave
     is <= player's best wave (fair leaderboard)
   - Resets on startGame()

   Used by: screens.js (game over continue),
            slotMachine.js (future),
            mapSelect.js (future)
   Depends on: state.js (ActiveDirector),
               ChallengeDirector (best wave check)
   ═══════════════════════════════════════ */

const AdPlaceholder = (() => {

  let _continueUsed = false;

  /* ── FAKE AD OVERLAY ─────────────────
     Shows a brief "loading" overlay to
     simulate ad playback. Replace this
     entire function body with real SDK
     call: CrazyGames.SDK.ad.requestAd(
       'rewarded', { adFinished, adError })  */

  const FAKE_AD_DURATION = 1500;

  function _createAdOverlay() {
    const ov = document.createElement('div');
    ov.id = 'ad-placeholder-overlay';
    ov.style.cssText =
      'position:fixed;inset:0;z-index:300;' +
      'background:rgba(0,0,0,0.92);' +
      'display:flex;align-items:center;justify-content:center;' +
      'flex-direction:column;gap:12px;';

    const txt = document.createElement('div');
    txt.style.cssText =
      'font-family:"Press Start 2P",monospace;font-size:10px;' +
      'color:#aaa;letter-spacing:2px;';
    txt.textContent = 'LOADING AD...';

    const bar = document.createElement('div');
    bar.style.cssText =
      'width:120px;height:4px;background:rgba(255,255,255,0.15);' +
      'border-radius:2px;overflow:hidden;';

    const fill = document.createElement('div');
    fill.style.cssText =
      'width:0%;height:100%;background:#51eefc;' +
      'transition:width ' + FAKE_AD_DURATION + 'ms linear;';

    bar.appendChild(fill);
    ov.appendChild(txt);
    ov.appendChild(bar);
    document.body.appendChild(ov);

    // animate fill bar
    requestAnimationFrame(() => {
      fill.style.width = '100%';
    });

    return ov;
  }

  return {

    /* ── SHOW REWARDED AD ────────────────
       Displays fake ad overlay, then calls
       onSuccess. Replace internals with
       CrazyGames SDK at publish time.
       onError is called if ad fails
       (never happens in placeholder).     */

    showRewarded(onSuccess, onError) {
      // mute game audio during ad
      if (typeof SFX !== 'undefined') SFX.pauseAll();
      if (typeof Music !== 'undefined') Music.stop();

      const ov = _createAdOverlay();

      setTimeout(() => {
        ov.remove();
        // unmute game audio after ad
        if (typeof SFX !== 'undefined') SFX.resumeAll();
        if (onSuccess) onSuccess();
      }, FAKE_AD_DURATION);
    },

    /* ── CAN CONTINUE ────────────────────
       Returns true if continue button
       should appear on game over screen.
       - false if already used this run
       - challenge mode: false if player
         already surpassed their best wave  */

    canContinue() {
      if (_continueUsed) return false;

      // challenge mode: block if already past best
      if (typeof ChallengeDirector !== 'undefined' &&
          ActiveDirector === ChallengeDirector) {
        const current = ChallengeDirector.getWave();
        const best    = ChallengeDirector.getBestWave();
        if (current > best) return false;
      }

      return true;
    },

    /* ── USE CONTINUE ────────────────────
       Marks continue as used for this run. */

    useContinue() {
      _continueUsed = true;
    },

    /* ── RESET CONTINUE ──────────────────
       Called from startGame() at the
       beginning of every new run.         */

    resetContinue() {
      _continueUsed = false;
    },
  };

})();