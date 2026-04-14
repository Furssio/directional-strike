/* ═══════════════════════════════════════
   SCREENS.JS
   Screen navigation, character selection,
   ability overlay, score popup, high score.

   Used by: input.js, loop.js, director
   Depends on: dom.js, state.js, config.js,
               AbilityRegistry, CharacterRegistry,
               audio.js
   ═══════════════════════════════════════ */

/* ── SCREEN NAVIGATION ── */

function showScreen(s) {
  [sMenu, sChar, sGame, sOver, sSoon].forEach(x => x.style.display = 'none');
  s.style.display = 'block';
}

/* ── HIGH SCORE ── */

function getBestScore() {
  return parseInt(localStorage.getItem('ds_best') || '0');
}

function saveBestScore(score) {
  localStorage.setItem('ds_best', score);
}

function updateMenuBest() {
  const b = getBestScore();
  menuBest.textContent = b > 0 ? 'best: ' + b + ' pts' : '';
}

/* ── SCORE POPUP ── */

function showScorePop(x, y, pts) {
  const pop = document.createElement('div');
  pop.className   = 'score-pop';
  pop.textContent = '+' + pts;
  pop.style.left  = x + 'px';
  pop.style.top   = (y - 10) + 'px';
  arena.appendChild(pop);
  setTimeout(() => pop.remove(), 750);
}

/* ── CHARACTER SELECTION ── */

function buildCharScreen(selectedCharId) {
  const grid = document.getElementById('char-grid');
  grid.innerHTML = '';

  CharacterRegistry.all().forEach(ch => {
    const card = document.createElement('div');
    card.className = 'char-card' + (ch.id === selectedCharId ? ' selected' : '');
    card.style.setProperty('--char-color', ch.color);

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

    card.addEventListener('click', () => {
      onCharSelected(ch.id);
      document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });

    grid.appendChild(card);
  });
}

/* ── ABILITY OVERLAY ── */

function showAbilityChoice() {
  choosingAbility = true;

  abilityTitle.textContent = `⬆ wave ${Director.getWave()} complete!`;

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
        ${ab.exclusive ? `<div class="ability-tag">⭐ exclusive ${ab.exclusive}</div>` : ''}
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

function selectAbility(ab) {
  ab.effect(player);
  player.acquiredAbilities.push(ab.id);

  SFX.abilityPick();
  abilityOverlay.classList.remove('visible');
  choosingAbility = false;

  updateHpBar();
  updateRangeCircle();

  // 3 second countdown then resume
  let count = 3;
  const pop = document.getElementById('level-up-pop');
  pop.style.opacity = '1';
  pop.textContent   = count + '...';

  const cd = setInterval(() => {
    count--;
    if (count > 0) {
      pop.textContent = count + '...';
    } else {
      clearInterval(cd);
      pop.style.opacity = '0';
    }
  }, 1000);
}

function pickAbilities() {
  const charId    = player.charDef.id;
  const exclusive = AbilityRegistry.all(a => a.exclusive === charId && !player.acquiredAbilities.includes(a.id));
  const generic   = AbilityRegistry.all(a => a.exclusive === null   && !player.acquiredAbilities.includes(a.id));
  const all       = [...exclusive, ...generic];

  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }

  const result = [];

  if (exclusive.length > 0) {
    result.push(exclusive[Math.floor(Math.random() * exclusive.length)]);
  }

  for (const a of all) {
    if (result.length >= 3) break;
    if (!result.includes(a)) result.push(a);
  }

  while (result.length < 3) {
    const all2 = AbilityRegistry.all();
    const fallback = all2[Math.floor(Math.random() * all2.length)];
    if (!result.includes(fallback)) result.push(fallback);
  }

  return result.slice(0, 3);
}