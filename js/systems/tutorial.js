/* ═══════════════════════════════════════
   TUTORIAL.JS  (v2 — cutscene rework)
   Cinematic intro + interactive tutorial
   during first Wave 1 play.

   Phase 0: cutscene — zoom player, alert
     bubble, zoom out, ravager with rage
     bubble walks in.
   Phase 1: attack — learn directional hit
   Phase 2: parry  — deflect a bullet
   Phase 3: special — use charged ability

   Only runs once — sets localStorage flag.
   Skip button available throughout.

   Used by: adventureDirector.js
   Depends on: state.js, spawn.js, config.js,
               combat.js, input.js, hud.js
   ═══════════════════════════════════════ */

const Tutorial = (() => {

  const STORAGE_KEY = 'ds_tutorial_done';

  /* ── State ─────────────────────────── */
  let _active       = false;
  let _phase        = 0;     // 0=cutscene 1=attack 2=parry 3=special
  let _step         = 0;
  let _frozen       = false;
  let _waitingDir   = null;
  let _waitingSpace = false;
  let _hintEl       = null;
  let _skipEl       = null;
  let _spawned      = [];
  let _completed    = false;

  /* ── Cutscene state ────────────────── */
  let _csTimeouts     = [];
  let _playerBubbleEl = null;
  let _rageBubbleEl   = null;
  let _rageBubbleTgt  = null;

  /* ── Phase refs ────────────────────── */
  let _phaseAEnemy   = null;
  let _phaseBCrusher = null;

  /* ── Assets ────────────────────────── */
  const BUBBLE_ALERT = 'assets/ui/tutorial/bubble_alert.png';
  const BUBBLE_RAGE  = 'assets/ui/tutorial/bubble_rage.png';
  const _TOUCH_HAND  = 'assets/ui/touch_hand.png';

  const _KEY_IMAGES = {
    right:  'assets/ui/keys_arrow_right.png',
    left:   'assets/ui/keys_arrow_left.png',
    up:     'assets/ui/keys_arrow_up.png',
    down:   'assets/ui/keys_arrow_down.png',
    center: 'assets/ui/key_space.png',
  };

  const _WASD = { right: 'D', left: 'A', up: 'W', down: 'S' };

  const _HAND_POS = {
    right:  { left: '75%', top: '50%' },
    left:   { left: '25%', top: '50%' },
    up:     { left: '50%', top: '20%' },
    down:   { left: '50%', top: '80%' },
    center: { left: '50%', top: '42%' },
  };

  /* ── localStorage ──────────────────── */
  function isNeeded() {
    try { return !localStorage.getItem(STORAGE_KEY); }
    catch (e) { return true; }
  }

  function _markDone() {
    try { localStorage.setItem(STORAGE_KEY, '1'); }
    catch (e) { /* silent */ }
  }

  /* ── Safe delayed call (guarded) ───── */
  function _later(fn, ms) {
    const id = setTimeout(() => {
      if (!_active) return;
      try { fn(); } catch (e) { /* never crash */ }
    }, ms);
    _csTimeouts.push(id);
    return id;
  }

  function _clearTimeouts() {
    for (let i = 0; i < _csTimeouts.length; i++) clearTimeout(_csTimeouts[i]);
    _csTimeouts = [];
  }

  /* ── Arena helper ──────────────────── */
  function _arena() {
    return document.getElementById('arena');
  }

  /* ═══════════════════════════════════
     CAMERA (CSS zoom on #arena)
     Only during cutscene. Cleaned up
     completely before gameplay starts.
     ═══════════════════════════════════ */

  function _camZoomIn() {
    const a = _arena();
    if (!a) return;
    a.classList.add('tutorial-cam');
    void a.offsetWidth;              // force reflow for transition
    a.classList.add('tutorial-zoom-in');
  }

  function _camZoomOut() {
    const a = _arena();
    if (!a) return;
    a.classList.remove('tutorial-zoom-in');
    // tutorial-cam stays so the transition animates back
  }

  function _camCleanup() {
    const a = _arena();
    if (!a) return;
    a.classList.remove('tutorial-cam', 'tutorial-zoom-in');
    a.style.transform = '';
  }

  /* ═══════════════════════════════════
     PLAYER BUBBLE (cutscene only)
     ═══════════════════════════════════ */

  function _showPlayerBubble() {
    _removePlayerBubble();
    const a = _arena();
    if (!a) return;

    const el = document.createElement('div');
    el.className = 'tutorial-bubble tutorial-bubble-enter';
    el.innerHTML = '<img src="' + BUBBLE_ALERT + '" alt="!">';
    el.style.left = '50%';
    el.style.top  = '50%';
    el.style.marginTop = '-48px';
    a.appendChild(el);
    _playerBubbleEl = el;

    // enter → float after animation
    _later(() => {
      if (!_playerBubbleEl) return;
      _playerBubbleEl.classList.remove('tutorial-bubble-enter');
      _playerBubbleEl.classList.add('tutorial-bubble-float');
    }, 420);
  }

  function _fadePlayerBubble() {
    if (!_playerBubbleEl) return;
    _playerBubbleEl.classList.remove('tutorial-bubble-float');
    _playerBubbleEl.classList.add('tutorial-bubble-exit');
    const ref = _playerBubbleEl;
    _later(() => { if (ref && ref.parentNode) ref.remove(); }, 350);
    _playerBubbleEl = null;
  }

  function _removePlayerBubble() {
    if (_playerBubbleEl) { _playerBubbleEl.remove(); _playerBubbleEl = null; }
  }

  /* ═══════════════════════════════════
     RAGE BUBBLE (follows enemy)
     ═══════════════════════════════════ */

  function _showRageBubble(enemy) {
    _removeRageBubble();
    const a = _arena();
    if (!a || !enemy) return;

    const el = document.createElement('div');
    el.className = 'tutorial-bubble tutorial-bubble-enter';
    el.innerHTML = '<img src="' + BUBBLE_RAGE + '" alt="!!">';
    a.appendChild(el);
    _rageBubbleEl  = el;
    _rageBubbleTgt = enemy;
    _updateRageBubblePos();

    _later(() => {
      if (!_rageBubbleEl) return;
      _rageBubbleEl.classList.remove('tutorial-bubble-enter');
    }, 420);
  }

  function _updateRageBubblePos() {
    if (!_rageBubbleEl || !_rageBubbleTgt) return;
    try {
      const e = _rageBubbleTgt;
      if (typeof e.isAlive === 'function' && !e.isAlive()) {
        _removeRageBubble();
        return;
      }
      _rageBubbleEl.style.left = e.x + 'px';
      _rageBubbleEl.style.top  = (e.y - 48) + 'px';
    } catch (err) {
      _removeRageBubble();
    }
  }

  function _removeRageBubble() {
    if (_rageBubbleEl) { _rageBubbleEl.remove(); _rageBubbleEl = null; }
    _rageBubbleTgt = null;
  }

  /* ═══════════════════════════════════
     HINT DISPLAY (arrow + WASD)
     ═══════════════════════════════════ */

  function _showHint(dir) {
    _removeHint();
    const a = _arena();
    if (!a) return;

    const el = document.createElement('div');
    el.id = 'tutorial-hint';
    const mobile = typeof isMobile === 'function' && isMobile();

    if (mobile) {
      // Touch hand positioned in direction
      const pos = _HAND_POS[dir] || _HAND_POS.center;
      el.className = 'tutorial-hint-touch';
      el.style.cssText =
        'position:absolute;z-index:90;pointer-events:none;' +
        'left:' + pos.left + ';top:' + pos.top + ';' +
        'transform:translate(-50%,-50%);';
      const img = document.createElement('img');
      img.src = _TOUCH_HAND;
      el.appendChild(img);
    } else {
      el.className = 'tutorial-hint-key';
      el.style.cssText =
        'position:absolute;z-index:90;pointer-events:none;' +
        'left:50%;top:50%;transform:translate(-50%,40px);';

      if (dir === 'center') {
        // Space key — just the image, no WASD
        const img = document.createElement('img');
        img.src = _KEY_IMAGES.center;
        img.style.cssText = 'width:96px;height:auto;image-rendering:pixelated;';
        el.appendChild(img);
      } else {
        // Arrow + "or" + WASD key cap
        const combo = document.createElement('div');
        combo.className = 'tutorial-hint-combo';

        const img = document.createElement('img');
        img.src = _KEY_IMAGES[dir];
        combo.appendChild(img);

        const orLbl = document.createElement('div');
        orLbl.className = 'tutorial-hint-or';
        orLbl.textContent = 'or';
        combo.appendChild(orLbl);

        const key = document.createElement('div');
        key.className = 'tutorial-wasd-key';
        key.textContent = _WASD[dir];
        combo.appendChild(key);

        el.appendChild(combo);
      }
    }

    a.appendChild(el);
    _hintEl = el;
  }

  function _removeHint() {
    if (_hintEl) { _hintEl.remove(); _hintEl = null; }
  }

  /* ═══════════════════════════════════
     SKIP BUTTON
     ═══════════════════════════════════ */

  function _showSkip() {
    _removeSkip();
    const a = _arena();
    if (!a) return;

    const btn = document.createElement('div');
    btn.id = 'tutorial-skip';
    btn.textContent = 'SKIP TUTORIAL';
    btn.addEventListener('click', () => { _doSkip(); });
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      _doSkip();
    }, { passive: false });
    a.appendChild(btn);
    _skipEl = btn;
  }

  function _removeSkip() {
    if (_skipEl) { _skipEl.remove(); _skipEl = null; }
  }

  function _doSkip() {
    if (!_active) return;
    // Full cleanup — camera, bubbles, timeouts
    _clearTimeouts();
    _camCleanup();
    _removePlayerBubble();
    _removeRageBubble();
    _complete();

    // Stop game → map select
    running = false;
    if (gameLoop) { clearInterval(gameLoop); gameLoop = null; }
    if (typeof cleanupArena === 'function') cleanupArena();
    if (typeof Transition !== 'undefined') {
      Transition.play('fast', () => {
        if (typeof showScreen === 'function') showScreen(sMapSelect);
        if (typeof initMapSelect === 'function') initMapSelect();
      });
    } else {
      if (typeof showScreen === 'function') showScreen(sMapSelect);
      if (typeof initMapSelect === 'function') initMapSelect();
    }
  }

  /* ═══════════════════════════════════
     FREEZE / UNFREEZE
     ═══════════════════════════════════ */

  function _freeze() {
    _frozen = true;
    if (gameLoop) { clearInterval(gameLoop); gameLoop = null; }
  }

  function _unfreeze() {
    _frozen = false;
    _removeHint();
    lastTick = performance.now();
    gameLoop = setInterval(tick, 16);
  }

  /* ═══════════════════════════════════
     SPAWN HELPER
     ═══════════════════════════════════ */

  function _spawnFromDir(enemyId, dir, speedOverride) {
    const def = EnemyRegistry.get(enemyId);
    if (!def) return null;

    const origSpeed = def.speedMult;
    if (speedOverride) def.speedMult = speedOverride;

    spawnEnemyDirected(def, dir);
    const enemy = enemies[enemies.length - 1];
    dirGateEnemies[dir].push(enemy);

    def.speedMult = origSpeed;
    _spawned.push(enemy);
    return enemy;
  }

  /* ═══════════════════════════════════
     RANGE CHECK
     ═══════════════════════════════════ */

  function _isInRange(enemy) {
    if (!enemy || typeof enemy.isAlive !== 'function' || !enemy.isAlive()) return false;
    const s = getArenaSize();
    if (!s) return false;
    const cx = s.w / 2, cy = s.h / 2;
    const range = player.getAttackRange(Math.min(s.w, s.h));
    return enemy.distToCenter(cx, cy) <= range;
  }

  function _isInRangeBullet(bullet) {
    if (!bullet) return false;
    const s = getArenaSize();
    if (!s) return false;
    const cx = s.w / 2, cy = s.h / 2;
    const range = player.getAttackRange(Math.min(s.w, s.h));
    const dx = bullet.x - cx, dy = bullet.y - cy;
    return Math.sqrt(dx * dx + dy * dy) <= range;
  }

  /* ═══════════════════════════════════
     PHASE 0 — CUTSCENE
     Zoom on player → alert bubble →
     zoom out → Phase A starts
     ═══════════════════════════════════ */

  function _startCutscene() {
    _phase = 0;
    _step  = 0;

    // T+0: zoom in on player
    _camZoomIn();

    // T+900ms: show alert bubble above player
    _later(() => { _showPlayerBubble(); }, 900);

    // T+2100ms: fade bubble out
    _later(() => { _fadePlayerBubble(); }, 2100);

    // T+2500ms: zoom out (transition back)
    _later(() => { _camZoomOut(); }, 2500);

    // T+3400ms: cleanup camera, start gameplay
    // T+3400ms: cleanup camera, start gameplay
    _later(() => {
      _camCleanup();
      _startPhaseA();
    }, 3400);
  }

  /* ═══════════════════════════════════
     PHASE A — ATTACK
     ═══════════════════════════════════ */

  function _startPhaseA() {
    _phase = 1;
    _step  = 0;
    _phaseAEnemy = _spawnFromDir('ravager', 'right', 1.2);
    _showRageBubble(_phaseAEnemy);
  }

  function _tickPhaseA() {
    // Keep rage bubble following the ravager
    _updateRageBubblePos();

    if (_step === 0) {
      if (_phaseAEnemy && _isInRange(_phaseAEnemy)) {
        _removeRageBubble();
        _freeze();
        _showHint('right');
        _waitingDir = 'right';
        _step = 1;
      }
      // Edge case: killed before freeze
      if (_phaseAEnemy && typeof _phaseAEnemy.isAlive === 'function'
          && !_phaseAEnemy.isAlive()) {
        _removeRageBubble();
        _step = 2;
      }
      return;
    }
    if (_step === 1) return;   // waiting for right arrow input

    if (_step === 2) {
      // Second ravager from top
      _phaseAEnemy = _spawnFromDir('ravager', 'up', 1.1);
      _step = 3;
      return;
    }
    if (_step === 3) {
      if (_phaseAEnemy && _isInRange(_phaseAEnemy)) {
        _freeze();
        _showHint('up');
        _waitingDir = 'up';
        _step = 4;
      }
      if (_phaseAEnemy && typeof _phaseAEnemy.isAlive === 'function'
          && !_phaseAEnemy.isAlive()) _step = 5;
      return;
    }
    if (_step === 4) return;   // waiting for up arrow input

    if (_step === 5) {
      // Two more ravagers, no hints — player does it alone
      _spawnFromDir('ravager', 'left',  1.5);
      _spawnFromDir('ravager', 'down',  1.5);
      _step = 6;
      return;
    }
    if (_step === 6) {
      const alive = enemies.filter(e => e.isAlive()).length;
      if (alive === 0) _startPhaseB();
      return;
    }
  }

  /* ═══════════════════════════════════
     PHASE B — PARRY
     ═══════════════════════════════════ */

  function _startPhaseB() {
    _phase = 2;
    _step  = 0;
    _phaseBCrusher = _spawnFromDir('crusher', 'up', 0.8);
  }

  function _tickPhaseB() {
    if (_step === 0) {
      if (bullets.length > 0) _step = 1;
      if (_phaseBCrusher && !_phaseBCrusher.isAlive()) _startPhaseC();
      return;
    }
    if (_step === 1) {
      if (bullets.length > 0 && _isInRangeBullet(bullets[0])) {
        _freeze();
        _showHint('up');
        _waitingDir = 'up';
        _step = 2;
      }
      if (bullets.length === 0) _step = 3;
      return;
    }
    if (_step === 2) return;   // waiting for up arrow input
    if (_step === 3) {
      const alive = enemies.filter(e => e.isAlive()).length;
      if (alive === 0) _startPhaseC();
      return;
    }
  }

  /* ═══════════════════════════════════
     PHASE C — SPECIAL
     ═══════════════════════════════════ */

  function _startPhaseC() {
    _phase = 3;
    _step  = 0;

    player.specialCharge = 100;
    if (typeof updateSpecialBar === 'function') updateSpecialBar();

    _spawnFromDir('ravager', 'up',    1.6);
    _spawnFromDir('ravager', 'down',  1.6);
    _spawnFromDir('ravager', 'left',  1.6);
    _spawnFromDir('ravager', 'right', 1.6);
  }

  function _tickPhaseC() {
    if (_step === 0) {
      let inRange = 0;
      for (const e of enemies) {
        if (e.isAlive() && _isInRange(e)) inRange++;
      }
      if (inRange >= 2) {
        _freeze();
        _showHint('center');
        _waitingSpace = true;
        _step = 1;
      }
      return;
    }
    if (_step === 1) return;   // waiting for space input
    if (_step === 2) {
      const alive = enemies.filter(e => e.isAlive()).length;
      if (alive === 0) _complete();
      return;
    }
  }

  /* ═══════════════════════════════════
     COMPLETION
     ═══════════════════════════════════ */

  function _complete() {
    _active    = false;
    _completed = true;
    _clearTimeouts();
    _camCleanup();
    _removeHint();
    _removeSkip();
    _removePlayerBubble();
    _removeRageBubble();
    _markDone();
  }

  /* ═══════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════ */

  return {

    isNeeded() { return isNeeded(); },

    start() {
      if (!isNeeded()) return false;
      _markDone();

      _active       = true;
      _phase        = 0;
      _step         = 0;
      _frozen       = false;
      _completed    = false;
      _spawned      = [];
      _waitingDir   = null;
      _waitingSpace = false;

      _showSkip();
      _startCutscene();
      return true;
    },

    tick(dt) {
      if (!_active || _frozen) return;
      if (_phase === 1) _tickPhaseA();
      if (_phase === 2) _tickPhaseB();
      if (_phase === 3) _tickPhaseC();
    },

    onDirInput(dir) {
      if (!_active || !_frozen) return false;
      if (_waitingDir && dir === _waitingDir) {
        _waitingDir = null;
        _unfreeze();
        handleDir(dir);
        if (_phase === 1) {
          if (_step === 1)      _step = 2;
          else if (_step === 4) _step = 5;
        }
        if (_phase === 2 && _step === 2) _step = 3;
        return true;
      }
      return false;
    },

    onSpaceInput() {
      if (!_active || !_frozen || !_waitingSpace) return false;
      _waitingSpace = false;
      _unfreeze();
      if (typeof activateSpecial === 'function') activateSpecial();
      _step = 2;
      return true;
    },

    isActive()    { return _active; },
    isFrozen()    { return _frozen; },
    isCompleted() { return _completed; },
    skip()        { _doSkip(); },

    reset() {
      _active       = false;
      _phase        = 0;
      _step         = 0;
      _frozen       = false;
      _completed    = false;
      _waitingDir   = null;
      _waitingSpace = false;
      _spawned      = [];
      _clearTimeouts();
      _camCleanup();
      _removeHint();
      _removeSkip();
      _removePlayerBubble();
      _removeRageBubble();
    },
  };

})();