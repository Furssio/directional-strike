/* ═══════════════════════════════════════
   CRAZYSDK.JS
   CrazyGames SDK v3 wrapper.
   Centralizes all SDK calls. Falls back
   gracefully when SDK is unavailable
   (disabled environment or localhost
   without SDK loaded).

   Replaces AdPlaceholder for rewarded ads.
   Also handles: game events, settings,
   happytime, leaderboard score submission.

   Used by: loop.js, slotMachine.js,
            mapSelect.js, input.js
   Depends on: CONFIG, SFX, Music
   ═══════════════════════════════════════ */

const CrazySDKWrapper = (() => {

  /* ── STATE ─────────────────────────── */
  let _initialized = false;
  let _environment = 'disabled'; // 'local' | 'crazygames' | 'disabled'

  /* ── LEADERBOARD ENCRYPTION KEY ─────
     32-byte base64 key for AES-GCM.
     Generate at: https://www.digitalsanctuary.com/aes-key-generator-free
     Set this BEFORE submitting to CrazyGames.
     ──────────────────────────────────── */
 const ENCRYPTION_KEY = 'Rc0CclITzXe0aXddtkXac8ieQ0ELF/kgF7BvaFSIqDM=';

  /* ── SDK AVAILABLE CHECK ───────────── */

  function _sdkAvailable() {
    return _initialized &&
           _environment !== 'disabled' &&
           window.CrazyGames &&
           window.CrazyGames.SDK;
  }

  function _sdk() {
    return window.CrazyGames.SDK;
  }

  /* ── INIT ──────────────────────────── */

  async function init() {
    if (!window.CrazyGames || !window.CrazyGames.SDK) {
      console.log('[CrazySDK] SDK not loaded — running without SDK');
      _environment = 'disabled';
      return;
    }

    try {
      await window.CrazyGames.SDK.init();
      _environment = window.CrazyGames.SDK.environment;
      _initialized = true;
      console.log('[CrazySDK] Initialized — environment:', _environment);

      // respect muteAudio setting
      _applySettings(_sdk().game.settings);
      _sdk().game.addSettingsChangeListener(_applySettings);

    } catch (e) {
      console.warn('[CrazySDK] Init failed:', e);
      _environment = 'disabled';
    }
  }

  /* ── SETTINGS (muteAudio) ──────────── */

  function _applySettings(settings) {
    if (!settings) return;
    if (settings.muteAudio) {
      CONFIG.audio.enabled = false;
      if (typeof Music !== 'undefined') Music.stop();
    }
  }

  /* ── REWARDED ADS ──────────────────── */

  /**
   * Show a rewarded ad.
   * onSuccess: called when ad finishes (give reward)
   * onError:   called when ad fails (no reward)
   *
   * On localhost: shows fake overlay (same as old
   * AdPlaceholder behavior for testing).
   * On CrazyGames: real SDK call.
   * On disabled: calls onError immediately.
   */
  function showRewarded(onSuccess, onError) {
    // mute game audio before ad
    if (typeof SFX !== 'undefined') SFX.pauseAll();
    if (typeof Music !== 'undefined') Music.stop();

    // disabled environment — no ads available
    if (!_sdkAvailable()) {
      if (_environment === 'local') {
        // localhost: simulate ad for testing
        _showFakeAd(onSuccess, onError);
        return;
      }
      // truly disabled — no reward
      _resumeAudio();
      if (onError) onError();
      return;
    }

    // real SDK call
    _sdk().ad.requestAd('rewarded', {
      adStarted: () => {
        // audio already muted above
        console.log('[CrazySDK] Rewarded ad started');
      },
      adFinished: () => {
        console.log('[CrazySDK] Rewarded ad finished');
        _resumeAudio();
        if (onSuccess) onSuccess();
      },
      adError: (error) => {
        console.warn('[CrazySDK] Rewarded ad error:', error);
        _resumeAudio();
        if (onError) onError();
      },
    });
  }

  /* ── FAKE AD (localhost testing) ────── */

  const FAKE_AD_DURATION = 1500;

  function _showFakeAd(onSuccess, onError) {
    const ov = document.createElement('div');
    ov.style.cssText =
      'position:fixed;inset:0;z-index:300;' +
      'background:rgba(0,0,0,0.92);' +
      'display:flex;align-items:center;justify-content:center;' +
      'flex-direction:column;gap:12px;';

    const txt = document.createElement('div');
    txt.style.cssText =
      'font-family:"Press Start 2P",monospace;font-size:10px;' +
      'color:#aaa;letter-spacing:2px;';
    txt.textContent = 'AD PLACEHOLDER';

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

    requestAnimationFrame(() => { fill.style.width = '100%'; });

    setTimeout(() => {
      ov.remove();
      _resumeAudio();
      if (onSuccess) onSuccess();
    }, FAKE_AD_DURATION);
  }

  /* ── RESUME AUDIO ──────────────────── */

  function _resumeAudio() {
    if (typeof SFX !== 'undefined') SFX.resumeAll();
  }

  /* ── GAME EVENTS ───────────────────── */

  function gameplayStart() {
    if (!_sdkAvailable()) return;
    try { _sdk().game.gameplayStart(); }
    catch (e) { console.warn('[CrazySDK] gameplayStart error:', e); }
  }

  function gameplayStop() {
    if (!_sdkAvailable()) return;
    try { _sdk().game.gameplayStop(); }
    catch (e) { console.warn('[CrazySDK] gameplayStop error:', e); }
  }

  function loadingStart() {
    if (!_sdkAvailable()) return;
    try { _sdk().game.loadingStart(); }
    catch (e) { console.warn('[CrazySDK] loadingStart error:', e); }
  }

  function loadingStop() {
    if (!_sdkAvailable()) return;
    try { _sdk().game.loadingStop(); }
    catch (e) { console.warn('[CrazySDK] loadingStop error:', e); }
  }

  function happytime() {
    if (!_sdkAvailable()) return;
    try { _sdk().game.happytime(); }
    catch (e) { console.warn('[CrazySDK] happytime error:', e); }
  }

  /* ── LEADERBOARD ───────────────────── */

  /**
   * Encrypt score with AES-GCM for
   * CrazyGames leaderboard anti-cheat.
   */
  async function _encryptScore(score) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const algorithm = { name: 'AES-GCM', iv: iv };

    const keyBytes = new Uint8Array(
      atob(ENCRYPTION_KEY)
        .split('')
        .map(c => c.charCodeAt(0))
    );

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw', keyBytes, algorithm, false, ['encrypt']
    );

    const dataBuffer = new TextEncoder().encode(score.toString());
    const encryptedBuffer = await window.crypto.subtle.encrypt(
      algorithm, cryptoKey, dataBuffer
    );

    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Submit score to CrazyGames leaderboard.
   * Used for challenge mode best wave.
   */
  async function submitScore(score) {
    if (!_sdkAvailable()) {
      console.log('[CrazySDK] submitScore skipped — SDK not available. Score:', score);
      return;
    }

    try {
      const encrypted = await _encryptScore(score);
      _sdk().user.submitScore({
        encryptedScore: encrypted,
        score: score,
      });
      console.log('[CrazySDK] Score submitted:', score);
    } catch (e) {
      console.warn('[CrazySDK] submitScore error:', e);
    }
  }

  /* ── PUBLIC API ────────────────────── */

  return {
    init,
    showRewarded,
    gameplayStart,
    gameplayStop,
    loadingStart,
    loadingStop,
    happytime,
    submitScore,
    getEnvironment() { return _environment; },
    isAvailable()    { return _sdkAvailable(); },
  };

})();