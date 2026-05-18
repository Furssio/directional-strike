/* ═══════════════════════════════════════
   SLOTMACHINE.JS
   Reusable slot machine component for
   ability unlocks.

   Two modes:
   - 'guaranteed': 1 spin, always finds ability
   - 'menu': 3 spins, ~1/6 each, near-miss
     on 3rd if all empty, guaranteed last video

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
  let _window, _reel, _highlight;
  let _resultEl, _resultIcon, _resultName;
  let _resultRarity, _resultDesc;
  let _nearMissEl, _nearText;
  let _spinCount, _btn;

  function _cacheDom() {
    _overlay      = document.getElementById('slot-overlay');
    _card         = document.getElementById('slot-card');
    _title        = document.getElementById('slot-title');
    _subtitle     = document.getElementById('slot-subtitle');
    _window       = document.getElementById('slot-window');
    _reel         = document.getElementById('slot-reel');
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
    rare:      { main: '#4488ff', glow: 'rgba(68,136,255,0.5)', label: 'RARE' },
    epic:      { main: '#aa44ff', glow: 'rgba(170,68,255,0.5)', label: 'EPIC' },
    legendary: { main: '#ffd700', glow: 'rgba(255,215,0,0.5)',  label: 'LEGENDARY' },
  };

  function _getRarity(id) {
    return CONFIG.abilities.rarities[id] || 'rare';
  }

  /* ── ROLL LOGIC ────────────────────── */

  function _rollSpin() {
    const locked = Progress.getLockedAbilities();
    if (locked.length === 0) return { result: null, nearMiss: false };

    if (_mode === 'guaranteed') {
      return { result: Progress.rollSlot(true), nearMiss: false };
    }

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

  /* ── BUILD REEL ────────────────────── */

  /**
   * Build the icon strip for animation.
   * totalIcons spinning, last one is the target.
   * For near-miss: second-to-last and third-to-last
   * are the legendary, last is something else.
   */
  function _buildReel(rollData) {
    _reel.innerHTML = '';
    const locked  = Progress.getLockedAbilities();
    const allIds  = Object.keys(CONFIG.abilities.rarities);
    const count   = 18; // total icons in reel

    // decide final icon
    let finalId;
    let nearMissLeg = null;

    if (rollData.result) {
      finalId = rollData.result;
    } else if (rollData.nearMiss) {
      nearMissLeg = _pickNearMissLegendary();
      // final icon = anything NOT legendary
      const nonLeg = allIds.filter(id =>
        CONFIG.abilities.rarities[id] !== 'legendary');
      finalId = nonLeg[Math.floor(Math.random() * nonLeg.length)];
    } else {
      // empty spin — random icon
      finalId = allIds[Math.floor(Math.random() * allIds.length)];
    }

    // fill reel with random icons
    for (let i = 0; i < count; i++) {
      let iconId;

      if (i === count - 1) {
        // last = final target
        iconId = finalId;
      } else if (rollData.nearMiss && i >= count - 3 && i < count - 1) {
        // near miss: 2 legendaries before final
        iconId = nearMissLeg;
      } else {
        // random from all abilities
        iconId = allIds[Math.floor(Math.random() * allIds.length)];
      }

      const img = document.createElement('img');
      img.src = 'assets/abilities/' + iconId + '.png';
      img.alt = iconId;
      img.dataset.id = iconId;
      _reel.appendChild(img);
    }

    return count;
  }

  /* ── ANIMATION ─────────────────────── */

  function _animateSpin(rollData, callback) {
    _spinning = true;
    _btn.disabled = true;

    const count = _buildReel(rollData);

    // reset reel position to top
    _reel.style.transition = 'none';
    _reel.style.top = '0px';

    // force reflow
    _reel.offsetHeight;

    // calculate target: center last icon in window
    // each icon = 64px + 8px gap = 72px
    const iconStep  = 72;
    const windowH   = 80;
    const targetIdx = count - 1;
    const targetTop = -(targetIdx * iconStep) + (windowH / 2) - 32;

    // animate with CSS transition — ease-out for slot feel
    const duration = 2200;
    _reel.style.transition = `top ${duration}ms cubic-bezier(0.15, 0.85, 0.35, 1.0)`;

    // small delay then start
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        _reel.style.top = targetTop + 'px';
      });
    });

    setTimeout(() => {
      _spinning = false;
      callback(rollData);
    }, duration + 200);
  }

  /* ── SHOW RESULT ───────────────────── */

  function _showResult(rollData) {
    if (rollData.result) {
      // found ability!
      Progress.unlockAbility(rollData.result);
      _foundAny   = true;
      _lastResult = rollData.result;

      const aDef   = AbilityRegistry.get(rollData.result);
      const rarity = _getRarity(rollData.result);
      const rc     = RARITY_COLORS[rarity];

      // glow on window
      _window.className = 'glow-' + rarity;

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

      // sfx
      if (typeof SFX !== 'undefined') SFX.abilityPick();

    } else if (rollData.nearMiss) {
      // near miss
      _window.className = '';
      _resultEl.classList.add('hidden');
      _nearMissEl.classList.remove('hidden');

      // shake the card
      _card.style.animation = 'none';
      _card.offsetHeight;
      _card.style.animation = 'nearMissShake 0.5s ease-out';

    } else {
      // empty
      _window.className = '';
      _resultEl.classList.add('hidden');
      _nearMissEl.classList.add('hidden');
    }

    _spins++;
    _updateSpinCount();
    _afterSpin();
  }

  function _afterSpin() {
    // guaranteed mode = 1 spin, done
    if (_mode === 'guaranteed') {
      _btn.textContent = 'CONTINUE';
      _btn.classList.add('slot-btn-done');
      _btn.disabled = false;
      _btn.onclick  = _finish;
      return;
    }

    // menu mode: more spins?
    if (_spins < _maxSpins) {
      _btn.textContent = 'SPIN';
      _btn.disabled = false;
      _btn.onclick  = _startSpin;

      // if found something, change button
      if (_foundAny) {
        _btn.textContent = 'SPIN AGAIN';
      }
    } else {
      // all spins done
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
    _window.className = '';

    const rollData = _rollSpin();
    _animateSpin(rollData, _showResult);
  }

  /* ── FINISH ────────────────────────── */

  function _finish() {
    _active = false;
    _overlay.classList.add('hidden');

    // clean up reel
    _reel.innerHTML = '';
    _reel.style.transition = 'none';
    _reel.style.top = '0px';
    _window.className = '';
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
    _window.className = '';
    _reel.innerHTML = '';
    _btn.classList.remove('slot-btn-done');
    _btn.disabled = false;

    // configure text
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

    // show overlay
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