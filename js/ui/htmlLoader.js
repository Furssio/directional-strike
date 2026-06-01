/* ═══════════════════════════════════════
   HTMLLOADER.JS
   Loads HTML partials, then the game
   bundle, then boots the game.
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

/* ── TIMING HELPER (shows on screen) ── */

const _bootTimers = {};
let _debugDiv = null;

function _mark(label) {
  const now = performance.now();
  _bootTimers[label] = now;

  // create debug div on first call
  if (!_debugDiv) {
    _debugDiv = document.createElement('div');
    _debugDiv.style.cssText =
      'position:fixed;bottom:10px;left:10px;right:10px;' +
      'font:10px monospace;color:#0f0;background:rgba(0,0,0,0.85);' +
      'padding:8px;z-index:99999;max-height:40vh;overflow-y:auto;' +
      'border:1px solid #0f0;border-radius:4px;';
    document.body.appendChild(_debugDiv);
  }

  // show elapsed since previous mark
  const keys = Object.keys(_bootTimers);
  if (keys.length > 1) {
    const prev = _bootTimers[keys[keys.length - 2]];
    const delta = Math.round(now - prev);
    _debugDiv.innerHTML += keys[keys.length - 2] + ' → ' + label + ': <b>' + delta + 'ms</b><br>';
  } else {
    _debugDiv.innerHTML += label + ': ' + Math.round(now) + 'ms<br>';
  }
}

/* ── LOAD HTML PARTIALS (0% → 30%) — PARALLEL ── */

async function _loadHTMLPartials() {
  const container = document.getElementById('G');

  const results = await Promise.all(
    HTML_PARTIALS.map(async (url) => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error('HTMLLoader: HTTP error', res.status, url);
          return '';
        }
        return await res.text();
      } catch (e) {
        console.error('HTMLLoader: failed to load', url, e);
        return '';
      }
    })
  );

  // insert in correct order
  for (const html of results) {
    if (html) container.insertAdjacentHTML('beforeend', html);
  }
  _setProgress(30, 'LOADING');
}

/* ── LOAD SINGLE SCRIPT ── */

function _loadScript(src) {
  return new Promise((resolve) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = (e) => {
      console.error('Failed to load:', src, e);
      resolve();
    };
    document.head.appendChild(s);
  });
}

/* ── BOOT SEQUENCE ── */

async function _boot() {
  _mark('BOOT START');

  // tell CrazyGames we're loading
  if (window.CrazyGames && window.CrazyGames.SDK) {
    try { window.CrazyGames.SDK.game.loadingStart(); }
    catch (e) { /* ignore */ }
  }

  // Phase 1: load HTML partials (0% → 30%)
  _setProgress(0, 'LOADING');
  await _loadHTMLPartials();
  _mark('HTML DONE');

  // Phase 2: load game bundle (30% → 80%)
  _setProgress(30, 'LOADING');
  await _loadScript('js/game.bundle.js');
  _mark('JS BUNDLE DONE');
  _setProgress(80, 'LOADING');

  // init pause bindings now that DOM + code are ready
  if (typeof _initPauseBindings === 'function') _initPauseBindings();

 // Phase 3: init CrazyGames SDK (80% → 90%) — with timeout
  if (typeof CrazySDKWrapper !== 'undefined') {
    await Promise.race([
      CrazySDKWrapper.init(),
      new Promise(resolve => setTimeout(resolve, 2000))
    ]);
  }
  _mark('SDK DONE');
  _setProgress(90, 'LOADING');

  // Phase 4: init UI bindings (90% → 100%)
  if (typeof UiBind !== 'undefined') UiBind.init();
  _mark('UIBIND DONE');
  _setProgress(100, 'READY');

  // Phase 5: boot complete — show game
  _showGame();
  _mark('BOOT COMPLETE');

  // show total
  const keys = Object.keys(_bootTimers);
  const total = Math.round(_bootTimers[keys[keys.length-1]] - _bootTimers[keys[0]]);
  if (_debugDiv) _debugDiv.innerHTML += '<br><b>TOTAL: ' + total + 'ms</b>';

  // auto-hide debug after 10 seconds
  setTimeout(() => { if (_debugDiv) _debugDiv.style.display = 'none'; }, 10000);
}

/* ── SHOW GAME + HIDE LOADING ── */

function _showGame() {
  const G = document.getElementById('G');
  const loadScreen = document.getElementById('loading-screen');

  // show game container
  if (G) G.style.display = '';

  // re-run scaler now that G is visible
  window.dispatchEvent(new Event('resize'));

  // tell CrazyGames loading is done
  if (typeof CrazySDKWrapper !== 'undefined') CrazySDKWrapper.loadingStop();

  // check if first time ever playing
  let isFirstPlay = false;
  try {
    isFirstPlay = !localStorage.getItem('ds_first_play_done') &&
                  !localStorage.getItem('ds_tutorial_done');
  }
  catch (e) { isFirstPlay = false; }

  if (isFirstPlay && typeof AdventureDirector !== 'undefined') {
    // FIRST PLAY: skip menu, go straight to map 1
    ActiveDirector = AdventureDirector;

    if (typeof getEquippedAbility === 'function') {
      equippedAbilityId = getEquippedAbility();
    }
    AdventureDirector.init('map01_forest');
    startGame(true);

    // fade out loading, then start game loop
    if (loadScreen) {
      loadScreen.classList.add('fade-out');
      setTimeout(() => {
        loadScreen.remove();
        startGameLoop();
      }, 600);
    } else {
      startGameLoop();
    }
  } else {
    // RETURNING PLAYER: normal menu
    if (typeof startMenuFireflies === 'function') startMenuFireflies();
    if (typeof Music !== 'undefined') Music.playMenu();

    if (loadScreen) {
      loadScreen.classList.add('fade-out');
      setTimeout(() => {
        loadScreen.remove();
      }, 600);
    }
  }
}

/* ── START ── */
_boot();