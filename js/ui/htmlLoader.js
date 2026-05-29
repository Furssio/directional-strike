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

/* ── LOAD HTML PARTIALS (0% → 30%) ── */

async function _loadHTMLPartials() {
  const container = document.getElementById('G');
  const step = 30 / HTML_PARTIALS.length;

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
  // tell CrazyGames we're loading
  if (window.CrazyGames && window.CrazyGames.SDK) {
    try { window.CrazyGames.SDK.game.loadingStart(); }
    catch (e) { /* ignore */ }
  }

  // Phase 1: load HTML partials (0% → 30%)
  _setProgress(0, 'LOADING');
  await _loadHTMLPartials();

  // Phase 2: load game bundle (30% → 80%)
  _setProgress(30, 'LOADING');
  await _loadScript('js/game.bundle.js');
  _setProgress(80, 'LOADING');

  // init pause bindings now that DOM + code are ready
  if (typeof _initPauseBindings === 'function') _initPauseBindings();

  // Phase 3: init CrazyGames SDK (80% → 90%)
  if (typeof CrazySDKWrapper !== 'undefined') {
    await CrazySDKWrapper.init();
  }
  _setProgress(90, 'LOADING');

  // Phase 4: init UI bindings (90% → 100%)
  if (typeof UiBind !== 'undefined') UiBind.init();
  _setProgress(100, 'READY');

  // Phase 5: boot complete — show game
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