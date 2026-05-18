/* ═══════════════════════════════════════
   SCALER.JS
   Auto-scales #G to fill viewport
   like a browser zoom. Logical coords
   stay at 620px, visuals scale up.
   ═══════════════════════════════════════ */

(function() {
  const G = document.getElementById('G');
  const BASE = 620; // logical size in px

  function rescale() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // contain: fit the largest scale without overflow
    const scale = Math.min(vw / BASE, vh / BASE);
    G.style.transform = 'scale(' + scale + ')';
  }

  rescale();
  window.addEventListener('resize', rescale);
})();