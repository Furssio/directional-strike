/* ═══════════════════════════════════════
   TRANSITION.JS
   Pixel dissolve screen transition.
   Cells appear in random order to cover,
   then disappear in random order to reveal.

   Usage:
     Transition.play('fast', onMiddle, onComplete)
     Transition.play('fast', onMiddle)
     Transition.play(onMiddle)

   onMiddle:   called when screen is fully covered (swap screens here)
   onComplete: called when transition is fully done (start game here)

   Speeds: 'fast', 'normal', 'slow'
   ═══════════════════════════════════════ */

const Transition = (() => {

  const COLS = 12;
  const ROWS = 10;
  const TOTAL = COLS * ROWS;

  const SPEEDS = {
    fast:   { cellDelay: 4,  hold: 100 },
    normal: { cellDelay: 6,  hold: 140 },
    slow:   { cellDelay: 9,  hold: 180 },
  };

  let overlay = null;
  let cells   = [];
  let busy    = false;

  /* ── Build overlay once, inside #G ── */
  function init() {
    if (overlay) return;
    const container = document.getElementById('G');
    if (!container) return;

    // #G needs position for absolute child
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    overlay = document.createElement('div');
    overlay.id = 'transition-overlay';
    overlay.style.setProperty('--tr-cols', COLS);
    overlay.style.setProperty('--tr-rows', ROWS);

    for (let i = 0; i < TOTAL; i++) {
      const cell = document.createElement('div');
      cell.className = 'tr-cell';
      overlay.appendChild(cell);
      cells.push(cell);
    }

    container.appendChild(overlay);
  }

  /* ── Shuffle array (Fisher-Yates) ── */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ── Animate cells in order ── */
  function animateCells(order, show, cellDelay) {
    return new Promise(resolve => {
      order.forEach((idx, i) => {
        setTimeout(() => {
          if (show) cells[idx].classList.add('active');
          else      cells[idx].classList.remove('active');
          if (i === order.length - 1) {
            setTimeout(resolve, 20);
          }
        }, i * cellDelay);
      });
    });
  }

  /* ── Public: play transition ── */
  async function play(speedOrCb, middleOrCb, maybeComplete) {
    if (busy) return;

    // parse arguments
    let speedName  = 'normal';
    let onMiddle   = null;
    let onComplete = null;

    if (typeof speedOrCb === 'function') {
      // play(onMiddle)
      onMiddle = speedOrCb;
    } else if (typeof speedOrCb === 'string') {
      speedName = speedOrCb;
      if (typeof middleOrCb === 'function') {
        onMiddle = middleOrCb;
      }
      if (typeof maybeComplete === 'function') {
        onComplete = maybeComplete;
      }
    }

    const speed = SPEEDS[speedName] || SPEEDS.normal;

    busy = true;
    init();

    // Phase 1: dissolve IN
    const orderIn = shuffle([...Array(TOTAL).keys()]);
    await animateCells(orderIn, true, speed.cellDelay);

    // Screen covered — swap screens
    if (onMiddle) onMiddle();

    // Phase 2: hold
    await new Promise(r => setTimeout(r, speed.hold));

    // Phase 3: dissolve OUT
    const orderOut = shuffle([...Array(TOTAL).keys()]);
    await animateCells(orderOut, false, speed.cellDelay);

    busy = false;

    // Transition fully done — start game
    if (onComplete) onComplete();
  }

  function isPlaying() {
    return busy;
  }

  return { play, isPlaying };
})();