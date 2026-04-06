/* ═══════════════════════════════════════
   UI.JS
   Tutto ciò che tocca il DOM.
   Aggiornamenti HUD, schermate, overlay
   scelta abilità, schermata personaggi.

   Dipende da: config.js, abilities.js,
               classes/Player.js, audio.js
   Usato da: game.js

   REGOLA: questo file non contiene logica
   di gioco. Legge lo stato da player/CONFIG
   e aggiorna il DOM di conseguenza.
   Non modifica mai lo stato del player
   tranne selectAbility() che applica l'effetto
   dell'abilità scelta e choosingAbility in game.js.

   VARIABILI GLOBALI CHE USA (da game.js):
   - player          → oggetto Player corrente
   - enemies         → array nemici correnti
   - choosingAbility → flag pausa scelta abilità
   ═══════════════════════════════════════ */

/* ══════════════════════════════════════
   DOM REFS
   Tutti i riferimenti agli elementi HTML.
   Definiti qui una volta sola e riusati.
   ══════════════════════════════════════ */
const sMenu    = document.getElementById('screen-menu');
const sChar    = document.getElementById('screen-char');
const sGame    = document.getElementById('screen-game');
const sOver    = document.getElementById('screen-over');
const sSoon    = document.getElementById('screen-story-soon');

const arena          = document.getElementById('arena');
const flashEl        = document.getElementById('flash');
const lvlPop         = document.getElementById('level-up-pop');
const shieldRing     = document.getElementById('shield-ring');
const specialRing    = document.getElementById('special-ring');
const rangeEl        = document.getElementById('attack-range');
const comboEl        = document.getElementById('combo-display');
const scoreEl        = document.getElementById('score-display');
const levelEl        = document.getElementById('level-display');
const playerEl       = document.getElementById('player');
const hpBar          = document.getElementById('player-hp-bar');
const progressBar    = document.getElementById('progress-bar');
const comboTimerWrap = document.getElementById('combo-timer-wrap');
const comboTimerBar  = document.getElementById('combo-timer-bar');
const specialBar     = document.getElementById('special-bar');
const specialWrap    = document.getElementById('special-wrap');
const specialLabel   = document.getElementById('special-label');
const finalScoreEl   = document.getElementById('final-score');
const finalLevelEl   = document.getElementById('final-level');
const bestLabel      = document.getElementById('best-label');
const menuBest       = document.getElementById('menu-best');
const btnShield      = document.getElementById('btn-shield');
const btnSpecial     = document.getElementById('btn-special');
const btnMute        = document.getElementById('btn-mute');
const abilityOverlay = document.getElementById('ability-overlay');
const abilityCardsEl = document.getElementById('ability-cards');
const abilityTitle   = document.getElementById('ability-title');

/* ══════════════════════════════════════
   NAVIGAZIONE SCHERMATE
   ══════════════════════════════════════ */

/* mostra una schermata e nasconde tutte le altre
   @param s  elemento DOM della schermata da mostrare */
function showScreen(s) {
  [sMenu, sChar, sGame, sOver, sSoon].forEach(x => x.style.display = 'none');
  s.style.display = 'block';
}

/* ══════════════════════════════════════
   LOCALSTORAGE — RECORD
   ══════════════════════════════════════ */

function getBestScore() {
  return parseInt(localStorage.getItem('ds_best') || '0');
}

function saveBestScore(score) {
  localStorage.setItem('ds_best', score);
}

/* aggiorna il testo record nel menu principale */
function updateMenuBest() {
  const b = getBestScore();
  menuBest.textContent = b > 0 ? 'record: ' + b + ' punti' : '';
}

/* ══════════════════════════════════════
   HUD — BARRA HP PLAYER
   ══════════════════════════════════════ */

/* aggiorna larghezza e colore barra HP
   verde → giallo → rosso in base alle soglie in CONFIG */
function updateHpBar() {
  const pct = player.hpPercent();
  hpBar.style.width      = Math.round(pct * 100) + '%';
  hpBar.style.background = pct > CONFIG.player.hpBarGreenPct
    ? '#639922'
    : pct > CONFIG.player.hpBarYellowPct
      ? '#BA7517'
      : '#A32D2D';
}

/* ══════════════════════════════════════
   HUD — BARRA PROGRESSO LIVELLO
   ══════════════════════════════════════ */

/* aggiorna la barra grigia in fondo all'HUD
   mostra le kill del livello corrente su quelle necessarie */
function updateProgress() {
  const needed = player.killsForNextLevel();
  const pct    = Math.min(player.killsThisLevel / needed, 1);
  progressBar.style.width = Math.round(pct * 100) + '%';
}

/* ══════════════════════════════════════
   HUD — COMBO E DECAY TIMER
   ══════════════════════════════════════ */

/* aggiorna testo combo e barra azzurra del decay timer
   la barra scompare quando la combo si azzera */
function updateComboDisplay() {
  const c = player.combo;

  if (c >= CONFIG.combo.minKills) {
    comboEl.textContent  = 'x' + player.getComboMult().toFixed(1) + ' (' + c + ' kill)';
    comboEl.style.opacity = '1';

    // barra decay — mostra il tempo rimanente prima del reset
    comboTimerWrap.style.opacity = '1';
    const maxDecay = CONFIG.combo.decayMs + player.comboDecayBonus;
    comboTimerBar.style.width = Math.max(0, player.comboTimer / maxDecay * 100) + '%';

  } else {
    comboEl.style.opacity        = '0';
    comboTimerWrap.style.opacity = '0';
  }
}

/* ══════════════════════════════════════
   HUD — BARRA SPECIALE
   ══════════════════════════════════════ */

/* aggiorna barra speciale, label e stato bottone.
   Quando piena: pulse CSS + suono una volta sola.
   3 stati bottone: inattivo / pronto / attivo */
function updateSpecialBar() {
  const pct     = player.specialCharge;
  const ch      = player.charDef;
  const isReady = player.isSpecialReady();

  // barra
  specialBar.style.width      = pct + '%';
  specialBar.style.background = ch.special.barColor;

  // label
  specialLabel.textContent = `${ch.special.icon} ${ch.special.name} ${Math.round(pct)}%`;

  // CSS variable per il colore del pulse
  specialWrap.style.setProperty('--special-color', ch.special.barColor);

  if (isReady && !player.specialActive) {
    // stato PRONTO
    specialWrap.classList.add('ready');
    btnSpecial.className    = 'cbtn ready';
    btnSpecial.textContent  = ch.special.icon;
    specialLabel.style.color = ch.special.barColor;

    // suono "speciale pronta" — una sola volta
    if (!player._wasSpecialReady) {
      player._wasSpecialReady = true;
      SFX.specialReady();
    }

  } else if (!player.specialActive) {
    // stato INATTIVO
    specialWrap.classList.remove('ready');
    btnSpecial.className    = 'cbtn';
    btnSpecial.textContent  = '⚡';
    specialLabel.style.color = '#888';
    player._wasSpecialReady  = false;
  }
}

/* ══════════════════════════════════════
   HUD — RANGE CIRCLE
   ══════════════════════════════════════ */

/* aggiorna dimensione e colore del cerchio
   tratteggiato che mostra il range di attacco.
   Colore preso dal personaggio corrente. */
function updateRangeCircle() {
  const { w, h } = getArenaSize();
  const size  = Math.min(w, h);
  const range = player.getAttackRange(size);
  const d     = range * 2;

  rangeEl.style.width       = d + 'px';
  rangeEl.style.height      = d + 'px';
  rangeEl.style.borderColor = `rgba(${hexToRgb(player.charDef.color)}, 0.5)`;
  rangeEl.style.background  = `rgba(${hexToRgb(player.charDef.color)}, 0.05)`;
}

/* ══════════════════════════════════════
   POPUP SCORE
   ══════════════════════════════════════ */

/* mostra "+N" animato nella posizione del nemico ucciso
   @param x, y  coordinate in px nell'arena
   @param pts   punti da mostrare */
function showScorePop(x, y, pts) {
  const pop = document.createElement('div');
  pop.className   = 'score-pop';
  pop.textContent = '+' + pts;
  pop.style.left  = x + 'px';
  pop.style.top   = (y - 10) + 'px';
  arena.appendChild(pop);
  setTimeout(() => pop.remove(), 750);
}

/* ══════════════════════════════════════
   POPUP LEVEL UP
   ══════════════════════════════════════ */

/* mostra "livello N!" al centro dell'arena per 900ms */
function showLevelUpPop() {
  lvlPop.textContent  = 'livello ' + player.level + '!';
  lvlPop.style.opacity = '1';
  setTimeout(() => lvlPop.style.opacity = '0', 900);
}

/* ══════════════════════════════════════
   SELEZIONE PERSONAGGIO
   ══════════════════════════════════════ */

/* costruisce la griglia di selezione personaggio
   con stat bar e descrizione abilità speciale.
   @param selectedCharId  id del personaggio selezionato */
function buildCharScreen(selectedCharId) {
  const grid = document.getElementById('char-grid');
  grid.innerHTML = '';

  Object.values(CONFIG.characters).forEach(ch => {
    const card = document.createElement('div');
    card.className = 'char-card' + (ch.id === selectedCharId ? ' selected' : '');

    // CSS var per il colore del bordo selezione
    card.style.setProperty('--char-color', ch.color);

    // stat bar per range / damage / hp (valori 1-5)
    const statRows = ['range', 'damage', 'hp'].map(s => `
      <div class="stat-row">
        <span class="stat-label">${s}</span>
        <div class="stat-bar-wrap">
          <div class="stat-bar-fill" style="width:${ch.stats[s] * 20}%;background:${ch.color}"></div>
        </div>
      </div>`).join('');

    card.innerHTML = `
      <div class="char-emoji">${ch.emoji}</div>
      <div class="char-name">${ch.name}</div>
      <div class="char-desc">${ch.desc}</div>
      <div class="char-stats">${statRows}</div>
      <div class="char-ability">${ch.special.icon} ${ch.special.name}<br>${ch.special.desc}</div>
    `;

    // selezione — aggiorna selectedCharId in game.js tramite callback
    card.addEventListener('click', () => {
      onCharSelected(ch.id);
      document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });

    grid.appendChild(card);
  });
}

/* ══════════════════════════════════════
   OVERLAY SCELTA ABILITÀ
   ══════════════════════════════════════ */

/* mostra l'overlay con 3 abilità casuali da scegliere.
   Blocca il gioco tramite choosingAbility in game.js.
   Garantisce almeno 1 esclusiva del personaggio se disponibile. */
function showAbilityChoice() {
  choosingAbility = true;

  abilityTitle.textContent = `⬆ livello ${player.level}!`;

  const choices = pickAbilities();
  abilityCardsEl.innerHTML = '';

  choices.forEach(ab => {
    const card = document.createElement('div');
    card.className = 'ability-card' + (ab.exclusive ? ' exclusive' : '');

    card.innerHTML = `
      <div class="ability-icon">${ab.icon}</div>
      <div class="ability-info">
        <div class="ability-name">${ab.name}</div>
        <div class="ability-desc">${ab.desc}</div>
        ${ab.exclusive ? `<div class="ability-tag">⭐ esclusiva ${ab.exclusive}</div>` : ''}
      </div>
    `;

    card.addEventListener('click', () => selectAbility(ab));
    card.addEventListener('touchstart', e => {
      e.preventDefault();
      selectAbility(ab);
    }, { passive: false });

    abilityCardsEl.appendChild(card);
  });

  abilityOverlay.classList.add('visible');
}

/* applica l'abilità scelta al player e chiude l'overlay
   @param ab  oggetto abilità da ABILITIES */
function selectAbility(ab) {
  ab.effect(player);
  player.acquiredAbilities.push(ab.id);

  SFX.abilityPick();
  abilityOverlay.classList.remove('visible');
  choosingAbility = false;

  // aggiorna HUD dopo l'effetto
  updateHpBar();
  updateRangeCircle();
}

/* seleziona 3 abilità casuali per la scelta.
   Logica: garantisce almeno 1 esclusiva del personaggio
   se disponibile, poi riempie con generiche. */
function pickAbilities() {
  const charId    = player.charDef.id;
  const exclusive = ABILITIES.filter(a => a.exclusive === charId && !player.acquiredAbilities.includes(a.id));
  const generic   = ABILITIES.filter(a => a.exclusive === null   && !player.acquiredAbilities.includes(a.id));
  const all       = [...exclusive, ...generic];

  // mescola
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }

  const result = [];

  // garantisce almeno 1 esclusiva
  if (exclusive.length > 0) {
    result.push(exclusive[Math.floor(Math.random() * exclusive.length)]);
  }

  // riempie fino a 3
  for (const a of all) {
    if (result.length >= 3) break;
    if (!result.includes(a)) result.push(a);
  }

  // fallback se il pool è quasi esaurito
  while (result.length < 3) {
    const fallback = ABILITIES[Math.floor(Math.random() * ABILITIES.length)];
    if (!result.includes(fallback)) result.push(fallback);
  }

  return result.slice(0, 3);
}

/* ══════════════════════════════════════
   UTILITIES DOM
   ══════════════════════════════════════ */

/* dimensioni attuali dell'arena in px
   (varia in base alla dimensione del browser) */
function getArenaSize() {
  const r = arena.getBoundingClientRect();
  return { w: r.width, h: r.height };
}

/* converte colore hex in stringa "R,G,B"
   usata per rgba() nel CSS via JS
   @param hex  stringa tipo '#E24B4A'
   @return     stringa tipo '226,75,74' */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}