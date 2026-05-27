/* ═══════════════════════════════════════
   ERROR-HANDLER.JS
   Global error catcher. Captures all
   uncaught JS errors + unhandled promise
   rejections. Stores in localStorage
   for later inspection.

   View errors: CTRL+SHIFT+E
   Clear errors: CTRL+SHIFT+C

   Depends on: nothing (load FIRST)
   Used by: everything (passive)
   ═══════════════════════════════════════ */

const ErrorHandler = (() => {

  const STORAGE_KEY = 'ds_error_log';
  const MAX_ERRORS  = 50;

  /* ── GET STORED ERRORS ─────────────── */
  function _getLog() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  /* ── SAVE ERROR ────────────────────── */
  function _save(entry) {
    try {
      const log = _getLog();
      log.push(entry);
      // keep only last MAX_ERRORS
      while (log.length > MAX_ERRORS) log.shift();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
    } catch (e) {
      // localStorage full or disabled — ignore
    }
  }

  /* ── FORMAT ERROR ENTRY ────────────── */
  function _entry(type, message, source, line, col, stack) {
    return {
      type,
      message: String(message).substring(0, 300),
      source:  source || '',
      line:    line || 0,
      col:     col || 0,
      stack:   stack ? String(stack).substring(0, 500) : '',
      time:    new Date().toISOString(),
      url:     location.href,
      ua:      navigator.userAgent.substring(0, 150),
    };
  }

  /* ── GLOBAL ERROR HANDLER ──────────── */
  window.onerror = function(msg, source, line, col, error) {
    _save(_entry(
      'error',
      msg,
      source,
      line,
      col,
      error && error.stack ? error.stack : ''
    ));
    // don't suppress — let browser console show it too
    return false;
  };

  /* ── UNHANDLED PROMISE REJECTION ───── */
  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason;
    _save(_entry(
      'promise',
      reason && reason.message ? reason.message : String(reason),
      '',
      0,
      0,
      reason && reason.stack ? reason.stack : ''
    ));
  });

  /* ── SCRIPT LOAD ERROR TRACKER ─────── */
  // Catches <script> and <link> load failures
  window.addEventListener('error', function(event) {
    if (event.target && event.target.tagName) {
      const tag = event.target.tagName.toLowerCase();
      if (tag === 'script' || tag === 'link' || tag === 'img') {
        _save(_entry(
          'resource',
          tag + ' failed to load',
          event.target.src || event.target.href || '',
          0, 0, ''
        ));
      }
    }
  }, true); // capture phase to catch resource errors

  /* ── DEBUG OVERLAY ─────────────────── */
  let _overlay = null;

  function _showOverlay() {
    if (_overlay) { _hideOverlay(); return; }

    const log = _getLog();
    _overlay = document.createElement('div');
    _overlay.style.cssText =
      'position:fixed;inset:0;z-index:9999;' +
      'background:rgba(0,0,0,0.95);' +
      'color:#0f0;font:11px monospace;' +
      'padding:16px;overflow-y:auto;white-space:pre-wrap;';

    if (log.length === 0) {
      _overlay.textContent = '--- NO ERRORS LOGGED ---\n\nPress CTRL+SHIFT+E to close';
    } else {
      let text = '--- ERROR LOG (' + log.length + ' entries) ---\n';
      text += 'Press CTRL+SHIFT+C to clear\n';
      text += 'Press CTRL+SHIFT+E to close\n\n';
      for (let i = log.length - 1; i >= 0; i--) {
        const e = log[i];
        text += '[' + e.type.toUpperCase() + '] ' + e.time + '\n';
        text += '  msg:  ' + e.message + '\n';
        if (e.source) text += '  src:  ' + e.source + ':' + e.line + ':' + e.col + '\n';
        if (e.stack)  text += '  stack: ' + e.stack + '\n';
        text += '  ua:   ' + e.ua + '\n';
        text += '\n';
      }
      _overlay.textContent = text;
    }

    document.body.appendChild(_overlay);
  }

  function _hideOverlay() {
    if (_overlay) { _overlay.remove(); _overlay = null; }
  }

  /* ── KEYBOARD SHORTCUT ─────────────── */
 document.addEventListener('keydown', function(e) {
    if (!CONFIG.debug) return;
    // CTRL+SHIFT+E — toggle error overlay
    if (e.ctrlKey && e.shiftKey && e.key === 'E') {
      e.preventDefault();
      _showOverlay();
    }
    // CTRL+SHIFT+C — clear error log
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      try { localStorage.removeItem(STORAGE_KEY); } catch(x) {}
      if (_overlay) { _hideOverlay(); _showOverlay(); }
    }
  });

  /* ── PUBLIC API ────────────────────── */
  return {
    getLog: _getLog,
    clear() {
      try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
    },
    count() { return _getLog().length; },
  };

})();