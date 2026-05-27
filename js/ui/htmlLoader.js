const HTML_PARTIALS = [
  'html/screen-menu.html',
  'html/screen-game.html',
  'html/screen-over.html',
  'html/screen-ability.html',
  'html/screen-map-select.html',
  'html/screen-challenge.html',
  'html/slot-overlay.html',
];

async function loadHTMLPartials() {
  const container = document.getElementById('G');
  for (const path of HTML_PARTIALS) {
    try {
      const res = await fetch(path);
      if (!res.ok) {
        console.error('HTMLLoader: HTTP error', res.status, path);
        continue;
      }
      const html = await res.text();
      container.insertAdjacentHTML('beforeend', html);
    } catch(e) {
      console.error('HTMLLoader: impossibile caricare', path, e);
    }
  }
}

loadHTMLPartials().then(() => {
  // init pause bindings now that screen-game.html is in DOM
  if (typeof _initPauseBindings === 'function') _initPauseBindings();

  const s   = document.createElement('script');
  s.src     = 'js/modes/infinite/main.js';
  s.onload  = () => {
    if (typeof UiBind !== 'undefined') UiBind.init();
  };
  s.onerror = e => console.error('Impossibile caricare main.js', e);
  document.head.appendChild(s);
});