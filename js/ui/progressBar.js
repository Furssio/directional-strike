/* ═══════════════════════════════════════
   PROGRESSBAR.JS
   Reusable wave progress bar component.
   Renders a segmented bar with wave colors,
   labels, and percentage. Supports static
   render and animated fill.

   Used by: mapSelect.js, screens.js
   Depends on: (none — pure UI component)
   ═══════════════════════════════════════ */

const ProgressBar = (() => {

  const WAVE_COLORS = [
    '#4ade80', '#4ade80',   // wave 1-2: green
    '#a3e635', '#a3e635',   // wave 3-4: lime
    '#fbbf24', '#fbbf24',   // wave 5-6: yellow
    '#f97316', '#f97316',   // wave 7-8: orange
    '#ef4444', '#ef4444',   // wave 9-10: red
    '#a855f7',              // wave 11: purple
  ];

  // internal state
  let _container  = null;
  let _totalWaves = 0;
  let _filled     = 0;
  let _segments   = [];
  let _labels     = [];
  let _pctEl      = null;
  let _trackEl    = null;
  let _animTimer  = null;

  /* ── RENDER — build bar from scratch ── */
  function render(container, filledWaves, totalWaves, opts) {
    opts = opts || {};
    reset();

    _container  = container;
    _totalWaves = totalWaves;
    _filled     = filledWaves;
    container.innerHTML = '';

    const showLabels  = opts.showLabels !== false;
    const showPct     = opts.showPct !== false;
    const isCompleted = opts.isCompleted || false;
    const pct = totalWaves > 0
      ? Math.round((filledWaves / totalWaves) * 100) : 0;

    // labels row: wave numbers + percentage
    const labelsRow = document.createElement('div');
    labelsRow.className = 'progress-labels';

    if (showLabels) {
      for (let i = 0; i < totalWaves; i++) {
        const lbl = document.createElement('div');
        lbl.className = 'progress-label' + (i < filledWaves ? ' filled' : '');
        lbl.textContent = i + 1;
        labelsRow.appendChild(lbl);
        _labels.push(lbl);
      }
    }

    if (showPct) {
      _pctEl = document.createElement('div');
      _pctEl.className = 'progress-pct' + (isCompleted ? ' complete' : '');
      _pctEl.textContent = pct + '%';
      labelsRow.appendChild(_pctEl);
    }

    container.appendChild(labelsRow);

    // track with segments
    _trackEl = document.createElement('div');
    _trackEl.className = 'progress-track' + (isCompleted ? ' complete' : '');

    for (let i = 0; i < totalWaves; i++) {
      const seg = document.createElement('div');
      seg.className = 'progress-segment';
      if (i < filledWaves) {
        _applyFill(seg, i);
      } else {
        seg.classList.add('empty');
      }
      _trackEl.appendChild(seg);
      _segments.push(seg);
    }

    container.appendChild(_trackEl);
  }

  /* ── FILL single segment visually ── */
  function _applyFill(seg, index) {
    seg.classList.remove('empty');
    seg.classList.add('filled');
    const col = WAVE_COLORS[index] || '#a855f7';
    seg.style.background = col;
    seg.style.boxShadow  = '0 0 4px ' + col + '88';
  }

  /* ── UPDATE pct + label for a newly filled index ── */
  function _updateAfterFill(index) {
    if (_labels[index]) _labels[index].classList.add('filled');
    _filled = index + 1;
    if (_pctEl) {
      const pct = Math.round((_filled / _totalWaves) * 100);
      _pctEl.textContent = pct + '%';
    }
  }

  /* ── ANIMATE TO — fill wave by wave with delay ── */
  function animateTo(targetWave, opts, callback) {
    opts = opts || {};
    const delay = opts.stepDelay || 160;
    const onStep = opts.onStep || null;
    const startFrom = _filled;

    if (targetWave <= startFrom) {
      if (callback) callback();
      return;
    }

    let current = startFrom;
    _animTimer = setInterval(() => {
      _applyFill(_segments[current], current);
      _updateAfterFill(current);
      if (onStep) onStep(current, targetWave);
      current++;
      if (current >= targetWave) {
        clearInterval(_animTimer);
        _animTimer = null;
        if (callback) callback();
      }
    }, delay);
  }

  /* ── COMPLETE — fill all + add glow ── */
  function complete(opts, callback) {
    // backward compat: complete(callback) still works
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    opts = opts || {};
    const stepDelay = opts.stepDelay || 100;
    const onStep = opts.onStep || null;

    animateTo(_totalWaves, { stepDelay: stepDelay, onStep: onStep }, () => {
      if (_trackEl) _trackEl.classList.add('complete');
      if (_pctEl) {
        _pctEl.classList.add('complete');
        _pctEl.textContent = '100%';
      }
      if (callback) callback();
    });
  }

  /* ── RESET — clean everything ── */
  function reset() {
    if (_animTimer) {
      clearInterval(_animTimer);
      _animTimer = null;
    }
    if (_container) _container.innerHTML = '';
    _container  = null;
    _segments   = [];
    _labels     = [];
    _pctEl      = null;
    _trackEl    = null;
    _totalWaves = 0;
    _filled     = 0;
  }

  return { render, animateTo, complete, reset };
})();