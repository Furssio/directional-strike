/* ═══════════════════════════════════════
   SLOTMACHINE.JS
   Slot machine state management and UI flow.

   Two modes:
   - 'guaranteed': 1 spin, always wins
   - 'menu': 3 spins per video, max 3 videos
     (9 spins total). Last spin of last video
     guaranteed if nothing found yet.

   Usage:
     SlotMachine.open({
       mode: 'guaranteed' | 'menu',
       onResult: (abilityId | null) => {},
       onClose: () => {}
     });

   Depends on: CONFIG, Progress, AbilityRegistry,
               SlotReels
   Used by: screens.js, mapSelect.js
   ═══════════════════════════════════════ */

const SlotMachine = (() => {

  /* ── STATE ─────────────────────────── */
  let _active    = false;
  let _mode      = null;
  let _onResult  = null;
  let _onClose   = null;
  let _spinning  = false;

  // per-video
  let _spins     = 0;
  let _maxSpins  = 3;
  let _foundAny  = false;

  // cross-video (menu mode)
  let _videoNum    = 0;
  let _totalVideos = 3;
  let _allResults  = [];

  /* ── DOM CACHE ─────────────────────── */
  let _overlay, _card, _title, _subtitle;
  let _reelWindow, _reels;
  let _resultEl, _resultIcon, _resultName;
  let _resultRarity, _resultDesc;
  let _nearMissEl, _nearText;
  let _spinCount, _btn, _closeBtn;

  const RARITY_COLORS = {
    rare:      { main: '#4488ff', label: 'RARE' },
    epic:      { main: '#aa44ff', label: 'EPIC' },
    legendary: { main: '#ffd700', label: 'LEGENDARY' },
  };

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
    _resultEl     = document.getElementById('slot-result');
    _resultIcon   = document.getElementById('slot-result-icon');
    _resultName   = document.getElementById('slot-result-name');
    _resultRarity = document.getElementById('slot-result-rarity');
    _resultDesc   = document.getElementById('slot-result-desc');
    _nearMissEl   = document.getElementById('slot-near-miss');
    _nearText     = document.getElementById('slot-near-text');
    _spinCount    = document.getElementById('slot-spin-count');
    _btn          = document.getElementById('slot-btn');
    _closeBtn     = document.getElementById('slot-close-btn');
  }

  /* ── ROLL LOGIC ────────────────────── */

  function _isLastSpinOfLastVideo() {
    return _videoNum >= _totalVideos
        && _spins === _maxSpins - 1;
  }

  function _roll() {
    const locked = Progress.getLockedAbilities();
    if (locked.length === 0) return { result: null, nearMiss: false };

    // guaranteed mode
    if (_mode === 'guaranteed') {
      return { result: Progress.rollSlot(true), nearMiss: false };
    }

    // menu: last spin of last video, nothing found = guaranteed
    if (_isLastSpinOfLastVideo() && !_foundAny && _allResults.length === 0) {
      return { result: Progress.rollSlot(true), nearMiss: false };
    }

    const result = Progress.rollSlot(false);

    // near miss: 3rd spin of video, all empty
    if (_spins === _maxSpins - 1 && !_foundAny && result === null) {
      return { result: null, nearMiss: true };
    }

    return { result, nearMiss: false };
  }

  /* ── SPIN ───────────────────────────── */

  function _startSpin() {
    if (_spinning) return;
    _spinning = true;
    _btn.disabled = true;
    if (_closeBtn) _closeBtn.classList.add('hidden');

    // reset visuals
    _resultEl.classList.add('hidden');
    _nearMissEl.classList.add('hidden');
    _reelWindow.className = '';

    const rollData = _roll();
    SlotReels.build(_reels, rollData);

    SlotReels.animate(_reels, () => {
      _spinning = false;
      _onSpinDone(rollData);
    });
  }

  /* ── SPIN RESULT ───────────────────── */

  function _onSpinDone(rollData) {
    if (rollData.result) {
      // WIN
      Progress.unlockAbility(rollData.result);
      _foundAny = true;
      _allResults.push(rollData.result);

      const aDef   = AbilityRegistry.get(rollData.result);
      const rarity = CONFIG.abilities.rarities[rollData.result] || 'rare';
      const rc     = RARITY_COLORS[rarity];

      _reelWindow.className = 'glow-' + rarity;
      _resultIcon.innerHTML =
        '<img src="assets/abilities/' + rollData.result +
        '.png" width="48" height="48" style="image-rendering:pixelated">';
      _resultName.textContent   = aDef ? (aDef.name || aDef.id) : rollData.result;
      _resultRarity.textContent = rc.label;
      _resultRarity.className   = 'rarity-' + rarity;
      _resultDesc.textContent   = aDef ? (aDef.desc || '') : '';
      _resultEl.classList.remove('hidden');
      _nearMissEl.classList.add('hidden');
      if (typeof SFX !== 'undefined') SFX.slotWin();

    } else if (rollData.nearMiss) {
      // NEAR MISS
      _reelWindow.className = '';
      _resultEl.classList.add('hidden');
      _nearMissEl.classList.remove('hidden');
      _nearText.textContent = 'SO CLOSE!';
      if (typeof SFX !== 'undefined') SFX.slotNearMiss();
      _card.style.animation = 'none';
      _card.offsetHeight;
      _card.style.animation = 'nearMissShake 0.5s ease-out';

    } else {
      // EMPTY
      _reelWindow.className = '';
      _resultEl.classList.add('hidden');
      _nearMissEl.classList.add('hidden');
    }

    _spins++;
    _updateButtons();
  }

  /* ── BUTTON STATE ──────────────────── */

  function _updateButtons() {

    // --- GUARANTEED ---
    if (_mode === 'guaranteed') {
      _btn.textContent = 'CONTINUE';
      _btn.classList.add('slot-btn-done');
      _btn.disabled = false;
      _btn.onclick  = _finish;
      if (_closeBtn) _closeBtn.classList.add('hidden');
      _spinCount.textContent = '';
      return;
    }

    // --- MENU: more spins this video ---
    if (_spins < _maxSpins) {
      const left = _maxSpins - _spins;
      _spinCount.textContent = left + ' spin' + (left > 1 ? 's' : '') + ' left';
      _btn.textContent = 'SPIN';
      _btn.classList.remove('slot-btn-done');
      _btn.disabled = false;
      _btn.onclick  = _startSpin;
      if (_closeBtn) _closeBtn.classList.add('hidden');
      return;
    }

    // --- MENU: 3 spins done, more videos? ---
    const canNext = Progress.canUseMenuVideo()
      && Progress.getLockedAbilities().length > 0;

    if (canNext) {
      const videosLeft = _totalVideos - _videoNum;
      const spinsLeft  = videosLeft * _maxSpins;

      _spinCount.textContent =
        spinsLeft + ' spin' + (spinsLeft > 1 ? 's' : '') + ' remaining';

      _btn.textContent = videosLeft === 1
        ? '▶ LAST CHANCE — 3 SPINS'
        : '▶ WATCH AD — 3 MORE SPINS';
      _btn.classList.remove('slot-btn-done');
      _btn.disabled = false;
      _btn.onclick  = _nextVideo;

      // show X to close without watching more
      if (_closeBtn) {
        _closeBtn.classList.remove('hidden');
        _closeBtn.onclick = _finish;
      }
    } else {
      // no more videos or all unlocked
      _btn.textContent = _allResults.length > 0 ? 'CONTINUE' : 'CLOSE';
      _btn.classList.add('slot-btn-done');
      _btn.disabled = false;
      _btn.onclick  = _finish;
      if (_closeBtn) _closeBtn.classList.add('hidden');
      _spinCount.textContent = '';
    }
  }

  /* ── NEXT VIDEO ────────────────────── */

  function _nextVideo() {
    // consume 1 video
    Progress.useMenuVideo();
    _videoNum++;

    // reset per-video state
    _spins    = 0;
    _foundAny = false;
    _resultEl.classList.add('hidden');
    _nearMissEl.classList.add('hidden');
    _reelWindow.className = '';

    const videosLeft = _totalVideos - _videoNum;
    _subtitle.textContent = videosLeft === 0
      ? 'Final spins — now or never!'
      : 'Try your luck!';

    // show spin button
    const left = _maxSpins;
    _spinCount.textContent = left + ' spin' + (left > 1 ? 's' : '') + ' left';
    _btn.textContent = 'SPIN';
    _btn.classList.remove('slot-btn-done');
    _btn.disabled = false;
    _btn.onclick  = _startSpin;
    if (_closeBtn) _closeBtn.classList.add('hidden');
  }

  /* ── FINISH ────────────────────────── */

  function _finish() {
    _active = false;
    _overlay.classList.add('hidden');
    SlotReels.reset(_reels);
    _reelWindow.className = '';
    _btn.classList.remove('slot-btn-done');

    const lastResult = _allResults.length > 0
      ? _allResults[_allResults.length - 1]
      : null;

    if (_onResult) _onResult(lastResult);
    if (_onClose)  _onClose();
  }

  /* ── SHOW UI ───────────────────────── */

 function _showUI() {
    _cacheDom();

    // reset everything
    _resultEl.classList.add('hidden');
    _nearMissEl.classList.add('hidden');
    _reelWindow.className = '';
    SlotReels.reset(_reels);
    // pre-fill reels with random icons (not empty)
    SlotReels.showInitial(_reels);
    _btn.classList.remove('slot-btn-done');
    _btn.disabled = false;
    if (_closeBtn) _closeBtn.classList.add('hidden');

    if (_mode === 'guaranteed') {
      _title.textContent     = 'NEW ABILITY!';
      _subtitle.textContent  = 'Tap to reveal your reward';
      _spinCount.textContent = '';
    } else {
      _title.textContent     = 'ABILITY SLOT';
      _subtitle.textContent  = 'Try your luck!';
      _spinCount.textContent = _maxSpins + ' spins left';
    }

    _btn.textContent = 'SPIN';
    _btn.onclick     = _startSpin;
    _overlay.classList.remove('hidden');
  }

  /* ── PUBLIC API ────────────────────── */

  return {

    open(opts) {
      if (_active) return;
      if (Progress.getLockedAbilities().length === 0) {
        if (opts.onResult) opts.onResult(null);
        if (opts.onClose)  opts.onClose();
        return;
      }

      _active   = true;
      _mode     = opts.mode || 'guaranteed';
      _onResult = opts.onResult || null;
      _onClose  = opts.onClose  || null;
      _spinning = false;
      _spins    = 0;
      _foundAny = false;
      _maxSpins = _mode === 'guaranteed'
        ? 1
        : CONFIG.abilities.menuSlots.spinsPerVideo;
      _allResults = [];

      if (_mode === 'menu') {
        // consume first video
        Progress.useMenuVideo();
        _videoNum    = Progress.getMenuVideosUsed();
        _totalVideos = CONFIG.abilities.menuSlots.maxVideos;
      } else {
        _videoNum    = 0;
        _totalVideos = 0;
      }

      _showUI();
    },

    isActive() { return _active; },
    close()    { if (_active) _finish(); },

    getRarity(id) {
      return CONFIG.abilities.rarities[id] || 'rare';
    },
    RARITY_COLORS,
  };

})();