/* ═══════════════════════════════════════
   HTMLLOADER.JS
   Loads HTML partials, then all game
   scripts, then boots the game.
   Shows loading progress on #loading-screen.
   ═══════════════════════════════════════ */

const HTML_PARTIALS = [
  'html/screen-menu.html',
  'html/screen-game.html',
  'html/screen-over.html',
  'html/screen-ability.html',
  'html/screen-map-select.html',
  'html/screen-challenge.html',
  'html/slot-overlay.html',
];

/* ── PROGRESS BAR ── */

const _loadBar = document.getElementById('loading-bar-fill');
const _loadText = document.getElementById('loading-text');

function _setProgress(pct, label) {
  if (_loadBar) _loadBar.style.width = Math.min(100, pct) + '%';
  if (_loadText && label) _loadText.textContent = label;
}

/* ── LOAD HTML PARTIALS (0% → 15%) ── */

async function _loadHTMLPartials() {
  const container = document.getElementById('G');
  const step = 15 / HTML_PARTIALS.length;

  for (let i = 0; i < HTML_PARTIALS.length; i++) {
    try {
      const res = await fetch(HTML_PARTIALS[i]);
      if (!res.ok) {
        console.error('HTMLLoader: HTTP error', res.status, HTML_PARTIALS[i]);
        continue;
      }
      const html = await res.text();
      container.insertAdjacentHTML('beforeend', html);
    } catch (e) {
      console.error('HTMLLoader: failed to load', HTML_PARTIALS[i], e);
    }
    _setProgress((i + 1) * step, 'LOADING');
  }
}

/* ── LOAD SCRIPTS SEQUENTIALLY (15% → 85%) ── */

function _loadScripts(scripts, startPct, endPct) {
  return new Promise((resolve) => {
    const range = endPct - startPct;
    let loaded = 0;

    (function next(i) {
      if (i >= scripts.length) {
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = scripts[i];
      s.onload = () => {
        loaded++;
        _setProgress(startPct + (loaded / scripts.length) * range, 'LOADING');
        next(i + 1);
      };
      s.onerror = (e) => {
        console.error('Failed to load script:', scripts[i], e);
        loaded++;
        next(i + 1);
      };
      document.head.appendChild(s);
    })(0);
  });
}

/* ── BOOT SEQUENCE ── */

async function _boot() {
  // tell CrazyGames we're loading
  if (window.CrazyGames && window.CrazyGames.SDK) {
    try { window.CrazyGames.SDK.game.loadingStart(); }
    catch (e) { /* ignore */ }
  }

  // Phase 1: load HTML partials (0% → 15%)
  _setProgress(0, 'LOADING');
  await _loadHTMLPartials();

  // init pause bindings now that screen-game.html is in DOM
  if (typeof _initPauseBindings === 'function') _initPauseBindings();

  // Phase 2: load main.js to get SCRIPTS array (15% → 16%)
  _setProgress(15, 'LOADING');
  await _loadScripts(['js/modes/infinite/main.js'], 15, 16);

  // Phase 3: load all game scripts from SCRIPTS array (16% → 80%)
  if (typeof SCRIPTS !== 'undefined') {
    await _loadScripts(SCRIPTS, 16, 80);
  }

  // Phase 4: init CrazyGames SDK (80% → 85%)
  _setProgress(80, 'LOADING');
  if (typeof CrazySDKWrapper !== 'undefined') {
    await CrazySDKWrapper.init();
  }

  // Phase 5: preload adventure mode (85% → 95%)
  _setProgress(85, 'LOADING');
  await new Promise((resolve) => {
    if (typeof loadAdventureMode === 'function') {
      loadAdventureMode(resolve);
    } else {
      resolve();
    }
  });
  _setProgress(95, 'LOADING');

  // Phase 6: init UI bindings (95%)
  if (typeof UiBind !== 'undefined') UiBind.init();

  // Phase 7: boot complete — show game (95% → 100%)
  _setProgress(100, 'READY');
  _showGame();
}

/* ── SHOW GAME + HIDE LOADING ── */

function _showGame() {
  const G = document.getElementById('G');
  const loadScreen = document.getElementById('loading-screen');

  // show game container
  if (G) G.style.display = '';

  // re-run scaler now that G is visible
  window.dispatchEvent(new Event('resize'));

  // start menu (fireflies + music)
  if (typeof startMenuFireflies === 'function') startMenuFireflies();
  if (typeof Music !== 'undefined') Music.playMenu();

  // tell CrazyGames loading is done
  if (typeof CrazySDKWrapper !== 'undefined') CrazySDKWrapper.loadingStop();

  // fade out loading screen
  if (loadScreen) {
    loadScreen.classList.add('fade-out');
    setTimeout(() => {
      loadScreen.remove();
    }, 600);
  }
}

/* ── START ── */
_boot();