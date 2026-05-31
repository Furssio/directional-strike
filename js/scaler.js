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

    const isMobileDevice = navigator.maxTouchPoints > 0 && window.matchMedia('(pointer: coarse)').matches;
    const isPortrait = vh > vw;

    let scale;
    if (isMobileDevice && isPortrait) {
      // fill width, shift down ~25% of empty space
      scale = vw / BASE;
      const scaledH = BASE * scale;
      const gap = vh - scaledH;
      const offsetY = gap > 0 ? gap * 0.45 : 0;
      G.style.position = 'fixed';
      G.style.top = offsetY + 'px';
      G.style.left = '0';
      G.style.transformOrigin = 'top left';
    } else if (isMobileDevice) {
      // landscape: fill height, center horizontally
      scale = vh / BASE;
      const offsetX = (vw - BASE * scale) / 2;
      G.style.position = 'fixed';
      G.style.top = '0';
      G.style.left = offsetX + 'px';
      G.style.transformOrigin = 'top left';
    } else {
      // desktop: centered as before
      scale = Math.min(vw / BASE, vh / BASE);
      G.style.position = '';
      G.style.top = '';
      G.style.left = '';
      G.style.transformOrigin = 'center center';
    }

    G.style.transform = 'scale(' + scale + ')';
  }

  rescale();
  window.addEventListener('resize', rescale);
})();