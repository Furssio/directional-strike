/* ═══════════════════════════════════════
   TUTORIAL.JS
   First-time tutorial during Wave 1.
   Freezes game at key moments, shows
   keyboard hints, teaches attack/parry/special.

   Only runs once — sets localStorage flag.
   After completion, Wave 1 plays normally.

   Used by: adventureDirector.js
   Depends on: state.js, spawn.js, config.js,
               combat.js, input.js, hud.js
   ═══════════════════════════════════════ */

const Tutorial = (() => {

  const STORAGE_KEY = 'ds_tutorial_done';

  let _active       = false;
  let _phase        = 0;       // 0=not started, 1=attack, 2=parry, 3=special
  let _step         = 0;       // sub-step within phase
  let _frozen       = false;   // game frozen waiting for input
  let _waitingDir   = null;    // direction we're waiting player to press
  let _waitingSpace = false;   // waiting for spacebar
  let _hintEl       = null;    // DOM element for keyboard hint
  let _spawned      = [];      // enemies spawned by tutorial
  let _completed    = false;

  /* ── CHECK IF TUTORIAL NEEDED ─────── */
  function isNeeded() {
    try {
      return !localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return true;
    }
  }

  function _markDone() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (e) { /* silent */ }
  }

  /* ── HINT DISPLAY ─────────────────── */

  function _showHint(imagePath) {
    _removeHint();
    const el = document.createElement('div');
    el.id = 'tutorial-hint';
    el.style.cssText =
      'position:absolute;z-index:90;' +
      'left:50%;top:50%;transform:translate(-50%,40px);' +
      'pointer-events:none;' +
      'animation:tutorialPulse 0.6s ease-in-out infinite alternate;';

    const img = document.createElement('img');
    img.src = imagePath;
    img.style.cssText =
      'width:96px;height:auto;image-rendering:pixelated;';
    el.appendChild(img);

    arena.appendChild(el);
    _hintEl = el;
  }

  function _removeHint() {
    if (_hintEl) {
      _hintEl.remove();
      _hintEl = null;
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

    // temporarily override speed for tutorial enemies
    const origSpeed = def.speedMult;
    if (speedOverride) def.speedMult = speedOverride;

    spawnEnemyDirected(def, dir);
    const enemy = enemies[enemies.length - 1];

    // register in gate system
    dirGateEnemies[dir].push(enemy);

    def.speedMult = origSpeed;
    _spawned.push(enemy);
    return enemy;
  }

  /* ── RANGE CHECK ──────────────────── */

  function _isInRange(enemy) {
    if (!enemy || !enemy.isAlive()) return false;
    const { w, h } = getArenaSize();
    const cx = w / 2;
    const cy = h / 2;
    const arenaSize = Math.min(w, h);
    const range = player.getAttackRange(arenaSize);
    const dist = enemy.distToCenter(cx, cy);
    return dist <= range;
  }

  function _isInRangeBullet(bullet) {
    if (!bullet) return false;
    const { w, h } = getArenaSize();
    const cx = w / 2;
    const cy = h / 2;
    const arenaSize = Math.min(w, h);
    const range = player.getAttackRange(arenaSize);
    const dx = bullet.x - cx;
    const dy = bullet.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist <= range;
  }

  /* ── PHASE A: ATTACK ──────────────── */

  let _phaseAEnemy = null;

  function _startPhaseA() {
    _phase = 1;
    _step  = 0;
    // step 0: spawn ravager from right
    _phaseAEnemy = _spawnFromDir('ravager', 'right', 0.9);
  }

  function _tickPhaseA() {
    // step 0: ravager from right — wait for range, freeze, show hint
    if (_step === 0) {
      if (_phaseAEnemy && _isInRange(_phaseAEnemy)) {
        _freeze();
        _showHint('assets/ui/keys_arrow_right.png');
        _waitingDir = 'right';
        _step = 1;
      }
      // if enemy died before range (shouldn't happen), skip
      if (_phaseAEnemy && !_phaseAEnemy.isAlive()) _step = 2;
      return;
    }

    // step 1: waiting for player to press right (handled by onInput)
    if (_step === 1) return;

    // step 2: spawn ravager from up
    if (_step === 2) {
      _phaseAEnemy = _spawnFromDir('ravager', 'up', 0.8);
      _step = 3;
      return;
    }

    // step 3: wait for range, freeze, show hint
    if (_step === 3) {
      if (_phaseAEnemy && _isInRange(_phaseAEnemy)) {
        _freeze();
        _showHint('assets/ui/keys_arrow_up.png');
        _waitingDir = 'up';
        _step = 4;
      }
      if (_phaseAEnemy && !_phaseAEnemy.isAlive()) _step = 5;
      return;
    }

    // step 4: waiting for player to press up (handled by onInput)
    if (_step === 4) return;

    // step 5: spawn 2 ravagers (left + down) — no freeze, player handles alone
    if (_step === 5) {
      _spawnFromDir('ravager', 'left', 1.2);
      _spawnFromDir('ravager', 'down', 1.2);
      _step = 6;
      return;
    }

    // step 6: wait for both to die
    if (_step === 6) {
      const alive = enemies.filter(e => e.isAlive()).length;
      if (alive === 0) {
        _startPhaseB();
      }
      return;
    }
  }

  /* ── PHASE B: PARRY ───────────────── */

  let _phaseBCrusher = null;
  let _phaseBWaiting = false;

  function _startPhaseB() {
    _phase = 2;
    _step  = 0;
    _phaseBWaiting = false;
    // spawn crusher from top, slow
    _phaseBCrusher = _spawnFromDir('crusher', 'up', 0.6);
  }

  function _tickPhaseB() {
    // step 0: wait for crusher to fire bullet
    if (_step === 0) {
      // check if any bullet exists
      if (bullets.length > 0) {
        _step = 1;
      }
      // if crusher died somehow, skip to phase C
      if (_phaseBCrusher && !_phaseBCrusher.isAlive()) {
        _startPhaseC();
      }
      return;
    }

    // step 1: wait for bullet to enter range, then freeze
    if (_step === 1) {
      if (bullets.length > 0 && _isInRangeBullet(bullets[0])) {
        _freeze();
        _showHint('assets/ui/keys_arrow_up.png');
        _waitingDir = 'up';
        _step = 2;
      }
      // if bullet missed or was destroyed
      if (bullets.length === 0) {
        _step = 3;
      }
      return;
    }

    // step 2: waiting for player to press up for parry (handled by onInput)
    if (_step === 2) return;

    // step 3: let crusher approach and die naturally
    if (_step === 3) {
      const alive = enemies.filter(e => e.isAlive()).length;
      if (alive === 0) {
        _startPhaseC();
      }
      return;
    }
  }

  /* ── PHASE C: SPECIAL ─────────────── */

  function _startPhaseC() {
    _phase = 3;
    _step  = 0;

    // fill special bar to 100%
    player.specialCharge = 100;
    updateSpecialBar();

    // spawn 4 ravagers from all directions
    _spawnFromDir('ravager', 'up',    1.3);
    _spawnFromDir('ravager', 'down',  1.3);
    _spawnFromDir('ravager', 'left',  1.3);
    _spawnFromDir('ravager', 'right', 1.3);
  }

  function _tickPhaseC() {
    // step 0: wait for enemies to get close, then freeze
    if (_step === 0) {
      // check if at least 2 are in range
      let inRange = 0;
      for (const e of enemies) {
        if (e.isAlive() && _isInRange(e)) inRange++;
      }
      if (inRange >= 2) {
        _freeze();
        _showHint('assets/ui/key_space.png');
        _waitingSpace = true;
        _step = 1;
      }
      return;
    }

    // step 1: waiting for spacebar (handled by onInput)
    if (_step === 1) return;

    // step 2: tutorial done, let remaining enemies die naturally
    if (_step === 2) {
      const alive = enemies.filter(e => e.isAlive()).length;
      if (alive === 0) {
        _complete();
      }
      return;
    }
  }

  /* ── COMPLETION ───────────────────── */

  function _complete() {
    _active    = false;
    _completed = true;
    _removeHint();
    _markDone();
  }

  /* ── PUBLIC API ───────────────────── */

  return {

    /* Check if tutorial should run */
    isNeeded() {
      return isNeeded();
    },

    /* Start tutorial — called by adventureDirector at wave 1 */
    start() {
      if (!isNeeded()) return false;

      // mark tutorial done IMMEDIATELY so exiting mid-tutorial
      // doesn't block spawning on other maps
      _markDone();

      _active    = true;
      _phase     = 0;
      _step      = 0;
      _frozen    = false;
      _completed = false;
      _spawned   = [];
      _waitingDir   = null;
      _waitingSpace = false;

      // small delay before first spawn so player sees the arena
      setTimeout(() => {
        if (_active) _startPhaseA();
      }, 800);

      return true;
    },

    /* Called every tick by adventureDirector */
    tick(dt) {
      if (!_active || _frozen) return;

      if (_phase === 1) _tickPhaseA();
      if (_phase === 2) _tickPhaseB();
      if (_phase === 3) _tickPhaseC();
    },

    /* Called from input.js when player presses a direction */
    onDirInput(dir) {
      if (!_active || !_frozen) return false;

      // waiting for specific direction
      if (_waitingDir && dir === _waitingDir) {
        _waitingDir = null;
        _unfreeze();

        // let combat handle the actual hit
        handleDir(dir);

        // advance to next step
        if (_phase === 1) {
          // after right press → go to step 2 (spawn up)
          // after up press → go to step 5 (spawn left+down)
          if (_step === 1) _step = 2;
          else if (_step === 4) _step = 5;
        }
        if (_phase === 2) {
          // after parry → go to step 3 (let crusher die)
          if (_step === 2) _step = 3;
        }

        return true;
      }

      return false; // wrong direction, ignore
    },

    /* Called from input.js when player presses spacebar */
    onSpaceInput() {
      if (!_active || !_frozen || !_waitingSpace) return false;

      _waitingSpace = false;
      _unfreeze();

      // let combat handle the special activation
      activateSpecial();

      _step = 2; // go to cleanup step
      return true;
    },

    /* Getters */
    isActive()    { return _active; },
    isFrozen()    { return _frozen; },
    isCompleted() { return _completed; },

    /* Force skip (for debug) */
    skip() {
      _complete();
    },

    /* Reset state — called when restarting a map */
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
    },

  };

})();