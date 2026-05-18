/* ═══════════════════════════════════════
   SLOTMACHINE.JS
   3-reel slot machine for ability unlocks.

   Two modes:
   - 'guaranteed': 1 spin, always match (3 equal)
   - 'menu': 3 spins per video, ~1/6 each,
     near-miss on 3rd if all empty

   Usage:
     SlotMachine.open({
       mode: 'guaranteed' | 'menu',
       isLastVideo: false,
       onResult: (abilityId | null) => {},
       onClose: () => {}
     });

   Depends on: CONFIG, Progress, AbilityRegistry
   Used by: screens.js, mapSelect.js
   ═══════════════════════════════════════ */

const SlotMachine = (() => {

  /* ── STATE ─────────────────────────── */
  let _active     = false;
  let _mode       = null;
  let _isLastVid  = false;
  let _onResult   = null;
  let _onClose    = null;
  let _spins      = 0;
  let _maxSpins   = 1;
  let _foundAny   = false;
  let _lastResult = null;
  let _spinning   = false;

  /* ── DOM REFS ──────────────────────── */
  let _overlay, _card, _title, _subtitle;
  let _reelWindow, _reels, _highlight;
  let _resultEl, _resultIcon, _resultName;
  let _resultRarity, _resultDesc;
  let _nearMissEl, _nearText;
  let _spinCount, _btn;

  /* ── REEL CONFIG ───────────────────── */
  const REEL_COUNT    = 3;
  const ICONS_PER_REEL = 20;
  const ICON_SIZE     = 48;
  const ICON_GAP      = 6;
  const ICON_STEP     = ICON_SIZE + ICON_GAP; // 54px per icon
  const VISIBLE_ROWS  = 3; // show 3 rows in window
  const WINDOW_H      = ICON_STEP * VISIBLE_ROWS - ICON_GAP; // 156px

  // stagger delay between reels stopping (ms)
  const REEL_STAGGER  = 350;
  const BASE_DURATION = 1800;

  function _cacheDom() {
    _overlay      = document.getElementById('slot-overlay');
    _card         = document.getElementById('slot-card');
    _title        = document.getElementById('slot-title');
    _subtitle     = document.getElementById('slot-subtitle');
    _reelWindow   = document.getElementById('slot-window');
    _reels        = [
      document.getElementById('slot-reel-0'),
      document.getElementById('slot-reel-1'),
      document.getElementById('slot-reel-2'),
    ];
    _highlight    = document.getElementById('slot-highlight');
    _resultEl     = document.getElementById('slot-result');
    _resultIcon   = document.getElementById('slot-result-icon');
    _resultName   = document.getElementById('slot-result-name');
    _resultRarity = document.getElementById('slot-result-rarity');
    _resultDesc   = document.getElementById('slot-result-desc');
    _nearMissEl   = document.getElementById('slot-near-miss');
    _nearText     = document.getElementById('slot-near-text');
    _spinCount    = document.getElementById('slot-spin-count');
    _btn          = document.getElementById('slot-btn');
  }

  /* ── RARITY HELPERS ────────────────── */
  const RARITY_COLORS = {
    rare:      { main: '#4488ff', glow: 'rgba(68,136,255,0.5)',  label: 'RARE' },
    epic:      { main: '#aa44ff', glow: 'rgba(170,68,255,0.5)',  label: 'EPIC' },
    legendary: { main: '#ffd700', glow: 'rgba(255,215,0,0.5)',   label: 'LEGENDARY' },
  };

  function _getRarity(id) {
    return CONFIG.abilities.rarities[id] || 'rare';
  }

  /* ── ALL ABILITY IDS ───────────────── */
  function _allIds() {
    return Object.keys(CONFIG.abilities.rarities);
  }

  function _randomId() {
    const ids = _allIds();
    return ids[Math.floor(Math.random() * ids.length)];
  }

  function _randomIdExcept(excludeId) {
    const ids = _allIds().filter(id => id !== excludeId);
    return ids[Math.floor(Math.random() * ids.length)];
  }

  /* ── ROLL LOGIC ────────────────────── */

  function _rollSpin() {
    const locked = Progress.getLockedAbilities();
    if (locked.length === 0) return { result: null, nearMiss: false };

    // guaranteed mode: always match
    if (_mode === 'guaranteed') {
      return { result: Progress.rollSlot(true), nearMiss: false };
    }

    // menu mode
    const isThirdSpin = (_spins === _maxSpins - 1);

    // last video + last spin + nothing found = guaranteed
    if (_isLastVid && isThirdSpin && !_foundAny) {
      if (CONFIG.abilities.menuSlots.guaranteedLastVideo) {
        return { result: Progress.rollSlot(true), nearMiss: false };
      }
    }

    const result = Progress.rollSlot(false);

    // near miss: 3rd spin, nothing found in all 3
    if (isThirdSpin && !_foundAny && result === null) {
      return { result: null, nearMiss: true };
    }

    return { result, nearMiss: false };
  }

  function _pickNearMissLegendary() {
    const legs = Object.entries(CONFIG.abilities.rarities)
      .filter(([, r]) => r === 'legendary')
      .map(([id]) => id);
    return legs[Math.floor(Math.random() * legs.length)];
  }

  /* ── BUILD REELS ───────────────────── */

  /**
   * Build 3 reels with random icons.
   * Returns array of 3 target icon ids
   * (what each reel lands on in center row).
   */
  function _buildReels(rollData) {
    const allIds = _allIds();
    let targets = []; // what the center row shows

    if (rollData.result) {
      // match: all 3 same
      targets = [rollData.result, rollData.result, rollData.result];
    } else if (rollData.nearMiss) {
      // 2 match + 3rd different
      const legId = _pickNearMissLegendary();
      const diffId = _randomIdExcept(legId);
      targets = [legId, legId, diffId];
    } else {
      // no match: all different (make sure no accidental 3-match)
      targets[0] = _randomId();
      targets[1] = _randomId();
      targets[2] = _randomId();
      // prevent accidental triple match
      while (targets[0] === targets[1] && targets[1] === targets[2]) {
        targets[2] = _randomId();
      }
    }

    // build each reel
    for (let r = 0; r < REEL_COUNT; r++) {
      const reel = _reels[r];
      reel.innerHTML = '';

      for (let i = 0; i < ICONS_PER_REEL; i++) {
        let iconId;

        // target is at index ICONS_PER_REEL - 2 (second to last)
        // so center row in window lands on it
        if (i === ICONS_PER_REEL - 2) {
          iconId = targets[r];
        } else {
          iconId = allIds[Math.floor(Math.random() * allIds.length)];
        }

        const img = document.createElement('img');
        img.src = 'assets/abilities/' + iconId + '.png';
        img.alt = iconId;
        img.dataset.id = iconId;
        reel.appendChild(img);
      }

      // reset position
      reel.style.transition = 'none';
      reel.style.top = '0px';
    }

    return targets;
  }

  /* ── ANIMATION ─────────────────────── */

  function _animateSpin(rollData, callback) {
    _spinning = true;
    _btn.disabled = true;

    const targets = _buildReels(rollData);

    // force reflow
    _reels.forEach(r => r.offsetHeight);

    // target position: land icon at index (ICONS_PER_REEL - 2) in center row
    // center row = row index 1 (of 0,1,2 visible)
    // top of window shows row 0, center is row 1
    // we want targetIdx icon at vertical center of window
    const targetIdx = ICONS_PER_REEL - 2;
    const centerOffset = Math.floor(VISIBLE_ROWS / 2) * ICON_STEP;
    const targetTop = -(targetIdx * ICON_STEP) + centerOffset;

    // animate each reel with stagger
    _reels.forEach((reel, i) => {
      const duration = BASE_DURATION + (i * REEL_STAGGER);
      const delay = i * 150; // start delay

      setTimeout(() => {
        reel.style.transition = `top ${duration}ms cubic-bezier(0.15, 0.85, 0.35, 1.0)`;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            reel.style.top = targetTop + 'px';
          });
        });
      }, delay);
    });

    // callback after last reel stops
    const totalTime = 150 * (REEL_COUNT - 1) + BASE_DURATION + (REEL_COUNT - 1) * REEL_STAGGER + 300;
    setTimeout(() => {
      _spinning = false;
      callback(rollData);
    }, totalTime);
  }

  /* ── SHOW RESULT ───────────────────── */

  function _showResult(rollData) {
    if (rollData.result) {
      // match! unlock ability
      Progress.unlockAbility(rollData.result);
      _foundAny   = true;
      _lastResult = rollData.result;

      const aDef   = AbilityRegistry.get(rollData.result);
      const rarity = _getRarity(rollData.result);
      const rc     = RARITY_COLORS[rarity];

      // glow on window
      _reelWindow.className = 'glow-' + rarity;

      // show result
      _resultIcon.innerHTML = '<img src="assets/abilities/' +
        rollData.result + '.png" width="48" height="48" ' +
        'style="image-rendering:pixelated">';
      _resultName.textContent = aDef ? (aDef.name || aDef.id) : rollData.result;
      _resultRarity.textContent = rc.label;
      _resultRarity.className = 'rarity-' + rarity;
      _resultDesc.textContent = aDef ? (aDef.desc || '') : '';
      _resultEl.classList.remove('hidden');
      _nearMissEl.classList.add('hidden');

      if (typeof SFX !== 'undefined') SFX.abilityPick();

    } else if (rollData.nearMiss) {
      // near miss — 2 match, 3rd different
      _reelWindow.className = '';
      _resultEl.classList.add('hidden');
      _nearMissEl.classList.remove('hidden');

      _card.style.animation = 'none';
      _card.offsetHeight;
      _card.style.animation = 'nearMissShake 0.5s ease-out';

    } else {
      // empty
      _reelWindow.className = '';
      _resultEl.classList.add('hidden');
      _nearMissEl.classList.add('hidden');
    }

    _spins++;
    _updateSpinCount();
    _afterSpin();
  }

  function _afterSpin() {
    if (_mode === 'guaranteed') {
      _btn.textContent = 'CONTINUE';
      _btn.classList.add('slot-btn-done');
      _btn.disabled = false;
      _btn.onclick  = _finish;
      return;
    }

    // menu mode: more spins?
    if (_spins < _maxSpins) {
      _btn.textContent = _foundAny ? 'SPIN AGAIN' : 'SPIN';
      _btn.disabled = false;
      _btn.onclick  = _startSpin;
    } else {
      _btn.textContent = _foundAny ? 'CONTINUE' : 'CLOSE';
      _btn.classList.add('slot-btn-done');
      _btn.disabled = false;
      _btn.onclick  = _finish;
    }
  }

  function _updateSpinCount() {
    if (_mode === 'guaranteed') {
      _spinCount.textContent = '';
      return;
    }
    const left = _maxSpins - _spins;
    if (left > 0) {
      _spinCount.textContent = left + ' spin' + (left > 1 ? 's' : '') + ' left';
    } else {
      _spinCount.textContent = '';
    }
  }

  /* ── SPIN TRIGGER ──────────────────── */

  function _startSpin() {
    if (_spinning) return;

    // reset visual state
    _resultEl.classList.add('hidden');
    _nearMissEl.classList.add('hidden');
    _reelWindow.className = '';

    const rollData = _rollSpin();
    _animateSpin(rollData, _showResult);
  }

  /* ── FINISH ────────────────────────── */

  function _finish() {
    _active = false;
    _overlay.classList.add('hidden');

    // clean up reels
    _reels.forEach(r => {
      r.innerHTML = '';
      r.style.transition = 'none';
      r.style.top = '0px';
    });
    _reelWindow.className = '';
    _btn.classList.remove('slot-btn-done');

    if (_onResult) _onResult(_lastResult);
    if (_onClose) _onClose();
  }

  /* ── SHOW UI ───────────────────────── */

  function _showUI() {
    _cacheDom();

    // reset state
    _resultEl.classList.add('hidden');
    _nearMissEl.classList.add('hidden');
    _reelWindow.className = '';
    _reels.forEach(r => {
      r.innerHTML = '';
      r.style.top = '0px';
    });
    _btn.classList.remove('slot-btn-done');
    _btn.disabled = false;

    if (_mode === 'guaranteed') {
      _title.textContent    = 'NEW ABILITY!';
      _subtitle.textContent = 'Tap to reveal your reward';
      _btn.textContent      = 'SPIN';
    } else {
      _title.textContent    = 'ABILITY SLOT';
      _subtitle.textContent = 'Try your luck!';
      _btn.textContent      = 'SPIN';
    }

    _updateSpinCount();
    _btn.onclick = _startSpin;
    _overlay.classList.remove('hidden');
  }

  /* ── PUBLIC API ────────────────────── */

  return {

    open(opts) {
      if (_active) return;

      if (Progress.getLockedAbilities().length === 0) {
        if (opts.onResult) opts.onResult(null);
        if (opts.onClose) opts.onClose();
        return;
      }

      _active     = true;
      _mode       = opts.mode || 'guaranteed';
      _isLastVid  = opts.isLastVideo || false;
      _onResult   = opts.onResult || null;
      _onClose    = opts.onClose || null;
      _spins      = 0;
      _maxSpins   = _mode === 'guaranteed'
        ? 1
        : CONFIG.abilities.menuSlots.spinsPerVideo;
      _foundAny   = false;
      _lastResult = null;
      _spinning   = false;

      _showUI();
    },

    isActive() { return _active; },

    close() {
      if (!_active) return;
      _finish();
    },

    getRarity(id) { return _getRarity(id); },
    RARITY_COLORS,
  };

})();