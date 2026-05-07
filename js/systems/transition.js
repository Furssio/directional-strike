/* ═══════════════════════════════════════
   TRANSITION.JS
   Pixel-grid screen transition (GBC style).
   Spiral-in to cover, spiral-out to reveal.

   Usage: Transition.play(() => { /* swap screen */

const Transition = (() => {
  const COLS = 10;
  const ROWS = 8;
  const CELL_DELAY = 18;       // ms between each cell
  const HOLD_TIME = 150;       // ms pause while screen covered
  let overlay = null;
  let cells = [];
  let spiralOrder = [];
  let busy = false;

  /* ── Build overlay once ── */
  function init() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'transition-overlay';
    overlay.style.setProperty('--tr-cols', COLS);
    overlay.style.setProperty('--tr-rows', ROWS);

    for (let i = 0; i < COLS * ROWS; i++) {
      const cell = document.createElement('div');
      cell.className = 'tr-cell';
      overlay.appendChild(cell);
      cells.push(cell);
    }

    document.body.appendChild(overlay);
    spiralOrder = buildSpiralOrder(COLS, ROWS);
  }

  /* ── Spiral order: outside → center ── */
  function buildSpiralOrder(cols, rows) {
    const order = [];
    let top = 0, bottom = rows - 1, left = 0, right = cols - 1;

    while (top <= bottom && left <= right) {
      // top row
      for (let c = left; c <= right; c++) order.push(top * cols + c);
      top++;
      // right col
      for (let r = top; r <= bottom; r++) order.push(r * cols + right);
      right--;
      // bottom row
      if (top <= bottom) {
        for (let c = right; c >= left; c--) order.push(bottom * cols + c);
        bottom--;
      }
      // left col
      if (left <= right) {
        for (let r = bottom; r >= top; r--) order.push(r * cols + left);
        left++;
      }
    }
    return order;
  }

  /* ── Animate cells on/off ── */
  function animateCells(indices, addClass, callback) {
    indices.forEach((cellIndex, i) => {
      setTimeout(() => {
        if (addClass) {
          cells[cellIndex].classList.add('active');
        } else {
          cells[cellIndex].classList.remove('active');
        }
        // fire callback after last cell
        if (i === indices.length - 1 && callback) {
          setTimeout(callback, 30);
        }
      }, i * CELL_DELAY);
    });
  }

  /* ── Public: play transition ── */
  function play(onMiddle) {
    if (busy) return;
    busy = true;
    init();

    // Phase 1: spiral IN (cover screen)
    animateCells(spiralOrder, true, () => {
      // Screen is covered — execute callback
      if (onMiddle) onMiddle();

      // Phase 2: hold briefly, then spiral OUT (reveal)
      setTimeout(() => {
        const reversed = [...spiralOrder].reverse();
        animateCells(reversed, false, () => {
          busy = false;
        });
      }, HOLD_TIME);
    });
  }

  /* ── Public: check if running ── */
  function isPlaying() {
    return busy;
  }

  return { play, isPlaying };
})();