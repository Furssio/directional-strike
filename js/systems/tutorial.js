/* ═══════════════════════════════════════
   TUTORIAL.JS
   First-time tutorial during Wave 1.
   Freezes game at key moments, shows
   hints (touch hand on mobile, keyboard
   keys on desktop). Skip button available.

   Only runs once — sets localStorage flag.
   After completion, Wave 1 plays normally.

   Used by: adventureDirector.js
   Depends on: state.js, spawn.js, config.js,
               combat.js, input.js, hud.js
   ═══════════════════════════════════════ */

const Tutorial = (() => {

  const STORAGE_KEY = 'ds_tutorial_done';

  let _active       = false;
  let _phase        = 0;
  let _step         = 0;
  let _frozen       = false;
  let _waitingDir   = null;
  let _waitingSpace = false;
  let _hintEl       = null;
  let _skipEl       = null;
  let _spawned      = [];
  let _completed    = false;

  /* ── HINT ASSETS ── */
  const _TOUCH_HAND = 'assets/ui/touch_hand.png';
  const _KEY_IMAGES = {
    right:  'assets/ui/keys_arrow_right.png',
    left:   'assets/ui/keys_arrow_left.png',
    up:     'assets/ui/keys_arrow_up.png',
    down:   'assets/ui/keys_arrow_down.png',
    center: 'assets/ui/key_space.png',
  };

 // hand position per direction (% of arena)
  const _HAND_POS = {
    right:  { left: '75%', top: '50%' },
    left:   { left: '25%', top: '50%' },
    up:     { left: '50%', top: '20%' },
    down:   { left: '50%', top: '80%' },
    center: { left: '50%', top: '42%' },
  };

  /* ── CHECK IF TUTORIAL NEEDED ─────── */
  function isNeeded() {
    try { return !localStorage.getItem(STORAGE_KEY); }
    catch (e) { return true; }
  }

  function _markDone() {
    try { localStorage.setItem(STORAGE_KEY, '1'); }
    catch (e) { /* silent */ }
  }

  /* ── HINT DISPLAY ─────────────────── */

  function _showHint(dir) {
    _removeHint();
    const el = document.createElement('div');
    el.id = 'tutorial-hint';

    const mobile = typeof isMobile === 'function' && isMobile();

    if (mobile) {
      // touch hand — rotated + positioned in direction
      const pos = _HAND_POS[dir] || _HAND_POS.center;
      el.className = 'tutorial-hint-touch';
      el.style.cssText =
        'position:absolute;z-index:90;pointer-events:none;' +
        'left:' + pos.left + ';top:' + pos.top + ';' +
        'transform:translate(-50%,-50%);';

      const img = document.createElement('img');
      img.src = _TOUCH_HAND;
      img.style.cssText = 'width:64px;height:64px;image-rendering:pixelated;';
      el.appendChild(img);
    } else {
      // desktop keyboard hint — centered below player
      const imgPath = _KEY_IMAGES[dir] || _KEY_IMAGES.center;
      el.className = 'tutorial-hint-key';
      el.style.cssText =
        'position:absolute;z-index:90;pointer-events:none;' +
        'left:50%;top:50%;transform:translate(-50%,40px);';

      const img = document.createElement('img');
      img.src = imgPath;
      img.style.cssText = 'width:96px;height:auto;image-rendering:pixelated;';
      el.appendChild(img);
    }

    arena.appendChild(el);
    _hintEl = el;
  }

  function _removeHint() {
    if (_hintEl) { _hintEl.remove(); _hintEl = null; }
  }

  /* ── SKIP BUTTON ──────────────────── */

  function _showSkip() {
    _removeSkip();
    const btn = document.createElement('div');
    btn.id = 'tutorial-skip';
    btn.textContent = 'SKIP';
    btn.addEventListener('click', () => { _doSkip(); });
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      _doSkip();
    }, { passive: false });
    arena.appendChild(btn);
    _skipEl = btn;
  }

  function _removeSkip() {
    if (_skipEl) { _skipEl.remove(); _skipEl = null; }
  }

  function _doSkip() {
    _complete();
    // stop game and go to map select
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

  /* ── FREEZE / UNFREEZE ────────────── */

  function _freeze() {
    _frozen = true;
    clearInterval(gameLoop);
    gameLoop = null;
  }

  function _unfreeze() {
    _frozen = false;
    _removeHint();
    lastTick = performance.now();
    gameLoop = setInterval(tick, 16);
  }

  /* ── SPAWN HELPER ─────────────────── */

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

  /* ── RANGE CHECK ──────────────────── */

  function _isInRange(enemy) {
    if (!enemy || !enemy.isAlive()) return false;
    const { w, h } = getArenaSize();
    const cx = w / 2, cy = h / 2;
    const arenaSize = Math.min(w, h);
    const range = player.getAttackRange(arenaSize);
    return enemy.distToCenter(cx, cy) <= range;
  }

  function _isInRangeBullet(bullet) {
    if (!bullet) return false;
    const { w, h } = getArenaSize();
    const cx = w / 2, cy = h / 2;
    const arenaSize = Math.min(w, h);
    const range = player.getAttackRange(arenaSize);
    const dx = bullet.x - cx, dy = bullet.y - cy;
    return Math.sqrt(dx * dx + dy * dy) <= range;
  }

  /* ── PHASE A: ATTACK ──────────────── */

  let _phaseAEnemy = null;

  function _startPhaseA() {
    _phase = 1;
    _step  = 0;
    _phaseAEnemy = _spawnFromDir('ravager', 'right', 0.9);
  }

  function _tickPhaseA() {
    if (_step === 0) {
      if (_phaseAEnemy && _isInRange(_phaseAEnemy)) {
        _freeze();
        _showHint('right');
        _waitingDir = 'right';
        _step = 1;
      }
      if (_phaseAEnemy && !_phaseAEnemy.isAlive()) _step = 2;
      return;
    }
    if (_step === 1) return;

    if (_step === 2) {
      _phaseAEnemy = _spawnFromDir('ravager', 'up', 0.8);
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
      if (_phaseAEnemy && !_phaseAEnemy.isAlive()) _step = 5;
      return;
    }
    if (_step === 4) return;

    if (_step === 5) {
      _spawnFromDir('ravager', 'left', 1.2);
      _spawnFromDir('ravager', 'down', 1.2);
      _step = 6;
      return;
    }
    if (_step === 6) {
      if (enemies.filter(e => e.isAlive()).length === 0) _startPhaseB();
      return;
    }
  }

  /* ── PHASE B: PARRY ───────────────── */

  let _phaseBCrusher = null;

  function _startPhaseB() {
    _phase = 2;
    _step  = 0;
    _phaseBCrusher = _spawnFromDir('crusher', 'up', 0.6);
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
    if (_step === 2) return;
    if (_step === 3) {
      if (enemies.filter(e => e.isAlive()).length === 0) _startPhaseC();
      return;
    }
  }

  /* ── PHASE C: SPECIAL ─────────────── */

  function _startPhaseC() {
    _phase = 3;
    _step  = 0;

    player.specialCharge = 100;
    updateSpecialBar();

    _spawnFromDir('ravager', 'up',    1.3);
    _spawnFromDir('ravager', 'down',  1.3);
    _spawnFromDir('ravager', 'left',  1.3);
    _spawnFromDir('ravager', 'right', 1.3);
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
    if (_step === 1) return;
    if (_step === 2) {
      if (enemies.filter(e => e.isAlive()).length === 0) _complete();
      return;
    }
  }

  /* ── COMPLETION ───────────────────── */

  function _complete() {
    _active    = false;
    _completed = true;
    _removeHint();
    _removeSkip();
    _markDone();
  }

  /* ── PUBLIC API ───────────────────── */

  return {

    isNeeded() { return isNeeded(); },

    start() {
      if (!isNeeded()) return false;

      _markDone();

      _active    = true;
      _phase     = 0;
      _step      = 0;
      _frozen    = false;
      _completed = false;
      _spawned   = [];
      _waitingDir   = null;
      _waitingSpace = false;

      // show skip button
      _showSkip();

      setTimeout(() => {
        if (_active) _startPhaseA();
      }, 800);

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
          if (_step === 1) _step = 2;
          else if (_step === 4) _step = 5;
        }
        if (_phase === 2) {
          if (_step === 2) _step = 3;
        }
        return true;
      }
      return false;
    },

    onSpaceInput() {
      if (!_active || !_frozen || !_waitingSpace) return false;
      _waitingSpace = false;
      _unfreeze();
      activateSpecial();
      _step = 2;
      return true;
    },

    isActive()    { return _active; },
    isFrozen()    { return _frozen; },
    isCompleted() { return _completed; },

    skip() { _doSkip(); },

    reset() {
      _active       = false;
      _phase        = 0;
      _step         = 0;
      _frozen       = false;
      _completed    = false;
      _waitingDir   = null;
      _waitingSpace = false;
      _spawned      = [];
      _removeHint();
      _removeSkip();
    },
  };

})();