const HTML_PARTIALS = [
  'html/screen-menu.html',
  'html/screen-game.html',
  'html/screen-over.html',
  'html/screen-ability.html',
  'html/screen-map-select.html',
  'html/screen-challenge.html',
];

async function loadHTMLPartials() {
  const container = document.getElementById('G');
  for (const path of HTML_PARTIALS) {
    try {
      const res  = await fetch(path);
      const html = await res.text();
      container.insertAdjacentHTML('beforeend', html);
    } catch(e) {
      console.error('HTMLLoader: impossibile caricare', path, e);
    }
  }
}

loadHTMLPartials().then(() => {
  const s   = document.createElement('script');
  s.src     = 'js/modes/infinite/main.js';
  s.onload  = () => {
    // bind UI sounds after all HTML + scripts are ready
    if (typeof UiBind !== 'undefined') UiBind.init();
  };
  s.onerror = e => console.error('Impossibile caricare main.js', e);
  document.head.appendChild(s);
});