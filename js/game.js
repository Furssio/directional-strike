/* ═══════════════════════════════════════
   GAME.JS
   Logica di gioco principale.
   Entry point — viene caricato per ultimo.

   Dipende da: config.js, abilities.js,
               audio.js, Player.js, Enemy.js,
               Bullet.js, ui.js
   Usato da: nessuno (è il file finale)

   RESPONSABILITÀ:
   - stato globale della partita
   - game loop (tick ogni 16ms)
   - spawn nemici e proiettili
   - collision detection
   - gestione attacco (handleDir)
   - gestione scudo e speciale
   - effetti juice (shake, particelle)
   - eventi input (tastiera + touch)
   - start / end partita

   VARIABILI GLOBALI ESPOSTE (usate da ui.js):
   - player          → oggetto Player corrente
   - enemies         → array nemici attivi
   - choosingAbility → true durante overlay abilità
   ═══════════════════════════════════════ */

/* ══════════════════════════════════════
   STATO GLOBALE PARTITA
   ══════════════════════════════════════ */

let player          = null;   // oggetto Player corrente
let enemies         = [];     // array Enemy attivi nell'arena
let bullets         = [];     // array Bullet attivi nell'arena
let spawnTimer      = null;   // timeout spawn prossimo nemico
let gameLoop        = null;   // interval del tick
let running         = false;  // true mentre la partita è in corso
let choosingAbility = false;  // true durante pausa scelta abilità
let lastTick        = 0;      // timestamp ultimo frame (per delta time)

/* personaggio selezionato nella schermata selezione
   default: warrior — viene aggiornato da onCharSelected() */
let selectedCharId = 'warrior';

/* ══════════════════════════════════════
   CALLBACK DA UI.JS
   Funzioni chiamate dalla UI per
   aggiornare lo stato in game.js
   ══════════════════════════════════════ */

/* chiamata da buildCharScreen() quando il player
   clicca su una card personaggio */
function onCharSelected(charId) {
  selectedCharId = charId;
}

/* ══════════════════════════════════════
   DIFFICOLTÀ — HELPERS
   ══════════════════════════════════════ */

/* moltiplicatore velocità nemici per il livello corrente
   cap a maxSpeedMult per non diventare impossibile */
function getSpeedMult() {
  return Math.min(
    CONFIG.difficulty.maxSpeedMult,
    1 + (player.level - 1) * CONFIG.difficulty.speedIncreasePerLevel
  );
}

/* intervallo spawn in ms per il livello corrente
   diminuisce ogni livello fino al minimo */
function getSpawnInterval() {
  return Math.max(
    CONFIG.difficulty.minSpawnInterval,
    CONFIG.difficulty.baseSpawnInterval - (player.level - 1) * CONFIG.difficulty.spawnIntervalReductionPerLevel
  );
}

/* sceglie il tipo di nemico da spawnare
   in base alle probabilità del livello corrente */
function pickEnemyDef() {
  const d  = CONFIG.difficulty;
  const lv = player.level;

  // armor appare dal livello armorStartLevel
  const armorChance = lv >= d.armorStartLevel
    ? Math.min(d.maxArmorChance, (lv - d.armorStartLevel + 1) * d.armorChancePerLevel)
    : 0;

  const tankChance = Math.min(
    d.maxTankChance,
    d.baseTankChance + (lv - 1) * d.tankChanceIncreasePerLevel
  );

  const r = Math.random();
  if (r < armorChance)               return CONFIG.enemies.armor;
  if (r < armorChance + tankChance)  return CONFIG.enemies.tank;
  return CONFIG.enemies.grunt;
}

/* ══════════════════════════════════════
   SPAWN
   ══════════════════════════════════════ */

/* schedula il prossimo spawn con l'interval del livello corrente.
   Si ferma da solo se !running o choosingAbility. */
function scheduleSpawn() {
  spawnTimer = setTimeout(() => {
    if (running && !choosingAbility) {
      spawnEnemy();
      scheduleSpawn();
    } else if (running) {
      // in pausa abilità — riprova tra poco
      scheduleSpawn();
    }
  }, getSpawnInterval());
}

/* crea un nemico e lo aggiunge all'arena.
   Spawn sempre dal bordo nella direzione casuale,
   allineato al centro sull'asse perpendicolare. */
function spawnEnemy() {
  if (!running) return;

  const { w, h } = getArenaSize();
  const cx = w / 2;
  const cy = h / 2;

  // direzione casuale
  const dirs = ['up', 'down', 'left', 'right'];
  const dir  = dirs[Math.floor(Math.random() * 4)];

  // posizione fuori dal bordo
  const m = 30;
  let x, y;
  if (dir === 'up')    { x = cx;     y = -m;    }
  if (dir === 'down')  { x = cx;     y = h + m; }
  if (dir === 'left')  { x = -m;     y = cy;    }
  if (dir === 'right') { x = w + m;  y = cy;    }

  const def    = pickEnemyDef();
  const enemy  = new Enemy(def, x, y, dir, getSpeedMult(), w, h);

  // se warrior bullet time attivo → nemico già rallentato
  if (player.specialActive && player.charDef.id === 'warrior') {
    enemy.setSlowed(true, player.charDef.special.slowMult);
  }

  // crea elemento DOM
  const el = document.createElement('div');
  el.className  = 'enemy';
  el.style.width     = enemy.size + 'px';
  el.style.height    = enemy.size + 'px';
  el.style.fontSize  = Math.round(enemy.size * 0.5) + 'px';
  el.textContent     = enemy.emoji;
  el.style.left      = x + 'px';
  el.style.top       = y + 'px';

  // barra HP del nemico
  const hpWrap = document.createElement('div');
  hpWrap.className = 'enemy-hp-wrap';
  const hpFill = document.createElement('div');
  hpFill.className = 'enemy-hp-fill';
  hpFill.style.width = '100%';
  hpWrap.appendChild(hpFill);
  el.appendChild(hpWrap);

  arena.appendChild(el);
  enemy.el     = el;
  enemy.hpFill = hpFill;
  enemies.push(enemy);
}

/* crea un proiettile sparato dal nemico verso il centro.
   @param enemy  nemico che spara */
function spawnBullet(enemy) {
  const { w, h } = getArenaSize();
  const cx = w / 2;
  const cy = h / 2;

  // vettore normalizzato verso il centro
  const dx   = cx - enemy.x;
  const dy   = cy - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 1) return;

  const vx = dx / dist * enemy.bulletSpeed;
  const vy = dy / dist * enemy.bulletSpeed;

  const b  = new Bullet(enemy.x, enemy.y, vx, vy, enemy.bulletDamagePct);
  const el = document.createElement('div');
  el.className  = 'bullet';
  el.style.left = b.x + 'px';
  el.style.top  = b.y + 'px';

  arena.appendChild(el);
  b.el = el;
  bullets.push(b);
  SFX.bullet();
}

/* ══════════════════════════════════════
   JUICE — EFFETTI VISIVI
   ══════════════════════════════════════ */

/* spawn particelle colorate alla morte di un nemico.
   @param x, y    posizione in px nell'arena
   @param color   colore hex del personaggio corrente
   @param isElite true per nemici elite (più particelle) */
function spawnParticles(x, y, color, isElite) {
  const cfg   = CONFIG.juice.particles;
  const count = isElite ? cfg.killCountElite : cfg.killCount;

  for (let i = 0; i < count; i++) {
    const p     = document.createElement('div');
    p.className = 'particle';

    const size  = cfg.minSize + Math.random() * (cfg.maxSize - cfg.minSize);
    const angle = Math.random() * Math.PI * 2;
    const speed = cfg.minSpeed + Math.random() * (cfg.maxSpeed - cfg.minSpeed);
    const vx    = Math.cos(angle) * speed;
    const vy    = Math.sin(angle) * speed;

    p.style.cssText = `width:${size}px;height:${size}px;background:${color};left:${x}px;top:${y}px;opacity:1;`;
    arena.appendChild(p);

    const start = performance.now();

    function animParticle(now) {
      const t = (now - start) / cfg.lifetime;
      if (t >= 1) { p.remove(); return; }

      p.style.left      = (x + vx * speed * t * 18) + 'px';
      p.style.top       = (y + vy * speed * t * 18) + 'px';
      p.style.opacity   = 1 - t;
      p.style.transform = `translate(-50%,-50%) scale(${1 - t * 0.5})`;
      requestAnimationFrame(animParticle);
    }

    requestAnimationFrame(animParticle);
  }
}

/* screen shake dell'arena — attivato su danno ricevuto */
let shakeTimeout = null;
function triggerShake() {
  if (!CONFIG.juice.shakeOnDamage) return;
  arena.classList.remove('shake');
  void arena.offsetWidth; // reflow per riavviare animazione CSS
  arena.classList.add('shake');
  clearTimeout(shakeTimeout);
  shakeTimeout = setTimeout(() => arena.classList.remove('shake'), 300);
}

/* ══════════════════════════════════════
   KILL — LOGICA CENTRALIZZATA
   Chiamata ogni volta che un nemico muore,
   sia da attacco diretto che da thorns.
   ══════════════════════════════════════ */

/* registra una kill: aggiorna score, combo, speciale,
   controlla level up e mostra UI conseguente.
   @param e  oggetto Enemy morto */
function registerKill(e) {
  SFX.kill();

  const mult = player.getComboMult();
  const pts  = Math.round(e.points * mult);

  player.score          += pts;
  player.kills          += 1;
  player.killsThisLevel += 1;
  player.addKill();

  showScorePop(e.x, e.y, pts);
  scoreEl.textContent = player.score;
  updateComboDisplay();
  updateSpecialBar();

  // controlla se ha raggiunto le kill per il level up
  const needed = player.killsForNextLevel();
  if (player.killsThisLevel >= needed) {
    player.level++;
    player.killsThisLevel = 0;
    levelEl.textContent = 'livello ' + player.level;
    updateProgress();
    showAbilityChoice(); // pausa — mostra overlay abilità
  } else {
    updateProgress();
  }
}

/* ══════════════════════════════════════
   SCUDO
   ══════════════════════════════════════ */

/* attiva / disattiva lo scudo.
   Lo scudo blocca proiettili e, se ha shieldHealAmt,
   recupera HP all'attivazione.
   @param on  true = attiva, false = disattiva */
function setShield(on) {
  player.shielded = on;

  if (on) {
    playerEl.classList.add('shielded');
    SFX.shield();
    // abilità scudo curativo
    if (player.shieldHealAmt > 0) {
      player.hp = Math.min(player.maxHp, player.hp + player.shieldHealAmt);
      updateHpBar();
    }
  } else {
    playerEl.classList.remove('shielded');
  }

  shieldRing.className        = on ? 'active' : '';
  btnShield.className         = 'cbtn' + (on ? ' active' : '');
}

/* ══════════════════════════════════════
   ABILITÀ SPECIALE
   ══════════════════════════════════════ */

/* attiva l'abilità speciale del personaggio corrente.
   Ogni personaggio ha un effetto diverso:
   - warrior → rallenta tutti i nemici (bullet time)
   - mage    → piercing — gestito in handleDir()
   - tank    → invincibilità — gestita in Player.takeDamage() */
function activateSpecial() {
  if (!running || player.shielded || choosingAbility) return;
  if (!player.activateSpecial()) return; // ritorna false se non pronta

  SFX.special();

  const charId = player.charDef.id;
  playerEl.classList.add('special-active');
  specialRing.classList.add('active');
  btnSpecial.classList.add('active-special');
  specialWrap.classList.remove('ready');

  // effetto warrior: rallenta tutti i nemici presenti e futuri
  if (charId === 'warrior') {
    enemies.forEach(e => e.setSlowed(true, player.charDef.special.slowMult));
  }

  // timeout per la fine dell'abilità
  setTimeout(() => {
    player.specialActive = false;
    playerEl.classList.remove('special-active');
    specialRing.classList.remove('active');
    btnSpecial.className = 'cbtn';

    // rimuovi slow warrior
    if (charId === 'warrior') {
      enemies.forEach(e => e.setSlowed(false, 1));
    }
  }, player.charDef.special.duration);
}

/* ══════════════════════════════════════
   ATTACCO
   ══════════════════════════════════════ */

/* gestisce un attacco nella direzione premuta.
   Modalità normale: colpisce il nemico più vicino nel range.
   Modalità piercing (mago speciale): colpisce tutti nella linea.
   Modalità doubleAttack (abilità mago): colpisce anche adiacenti.

   @param dir  direzione: 'up' / 'down' / 'left' / 'right' */
function handleDir(dir) {
  if (!running || player.shielded || choosingAbility) return;

  const hitDmg     = player.getHitDamage();
  const { w, h }   = getArenaSize();
  const cx         = w / 2;
  const cy         = h / 2;
  const arenaSize  = Math.min(w, h);
  const attackRange = player.getAttackRange(arenaSize);
  const isPiercing = player.specialActive && player.charDef.id === 'mage';

  // doubleAttack colpisce anche le direzioni adiacenti
  const dirs = player.doubleAttack && !isPiercing
    ? [dir, ...getAdjacentDirs(dir)]
    : [dir];

  let anyHit = false;

  for (const d of dirs) {

    if (isPiercing) {
      // ── PIERCING: tutti i nemici nella direzione ──
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e  = enemies[i];
        if (e.dir !== d) continue;

        const dx   = e.x - cx;
        const dy   = e.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > attackRange) continue;

        anyHit = true;
        SFX.hit();
        e.flashHit();
        e.hit(hitDmg);
        e.hpFill.style.width = Math.round(e.hpPercent() * 100) + '%';

        if (!e.isAlive()) {
          spawnParticles(e.x, e.y, player.charDef.color, e.isElite);
          e.el.remove();
          enemies.splice(i, 1);
          registerKill(e);
        }
      }

    } else {
      // ── NORMALE: solo il nemico più vicino ──
      let best     = null;
      let bestDist = Infinity;

      for (const e of enemies) {
        if (e.dir !== d) continue;

        const dx   = e.x - cx;
        const dy   = e.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > attackRange) continue;
        if (dist < bestDist) { bestDist = dist; best = e; }
      }

      if (best) {
        anyHit = true;
        SFX.hit();
        best.flashHit();
        best.hit(hitDmg);
        best.hpFill.style.width = Math.round(best.hpPercent() * 100) + '%';

        // stun chance da abilità warrior_heavy
        if (player.stunChance > 0 && Math.random() < player.stunChance) {
          best.stun(1000);
        }

        if (!best.isAlive()) {
          spawnParticles(best.x, best.y, player.charDef.color, best.isElite);
          best.el.remove();
          enemies.splice(enemies.indexOf(best), 1);
          registerKill(best);
        }
      }
    }
  }

  if (!anyHit) SFX.miss();
}

/* restituisce le direzioni adiacenti a quella premuta.
   Usato da doubleAttack del mago.
   @param dir  direzione principale
   @return     array delle 2 direzioni perpendicolari */
function getAdjacentDirs(dir) {
  const map = {
    up:    ['left', 'right'],
    down:  ['left', 'right'],
    left:  ['up',   'down'],
    right: ['up',   'down'],
  };
  return map[dir] || [];
}

/* ══════════════════════════════════════
   GAME LOOP — TICK
   Chiamato ogni 16ms da setInterval.
   Muove nemici e proiettili, controlla collisioni.
   ══════════════════════════════════════ */
function tick() {
  if (!running || choosingAbility) return;

  const now = performance.now();
  const dt  = Math.min(now - lastTick, 50); // cap 50ms per evitare salti
  lastTick  = now;

  // aggiorna timer combo e speciale
  player.tickSpecial(dt);
  updateComboDisplay();
  updateSpecialBar();

  const { w, h } = getArenaSize();
  const cx        = w / 2;
  const cy        = h / 2;
  const hitR      = 28;       // raggio collisione player-nemico
  const bulletHitR = 22;      // raggio collisione player-proiettile
  const arenaSize = Math.min(w, h);
  const attackRange = player.getAttackRange(arenaSize);

  /* ── AGGIORNA NEMICI ── */
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e  = enemies[i];
    const dx = cx - e.x;
    const dy = cy - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) continue;

    // muovi verso il centro
    e.x += dx / dist * e.speed;
    e.y += dy / dist * e.speed;
    e.el.style.left = e.x + 'px';
    e.el.style.top  = e.y + 'px';

    // opacità ridotta fuori dal range — feedback visivo
    e.el.style.opacity = dist <= attackRange ? '1' : '0.5';

    // logica sparo (solo tank)
    if (e.shoots) {
      const curDist = e.distToCenter(cx, cy);

      if (!e.firstShotFired && curDist <= e.firstShotDist) {
        // primo colpo quando entra nella distanza trigger
        e.firstShotFired = true;
        spawnBullet(e);
        e.shootTimer = 0;

      } else if (e.firstShotFired) {
        e.shootTimer += dt;
        if (e.shootTimer >= e.shootInterval) {
          spawnBullet(e);
          e.shootTimer = 0;
        }
      }
    }

    // collisione con il player
    if (dist < hitR) {

      // thorns: nemico prende danno se tank in fortezza
      if (player.thorns && player.specialActive && player.charDef.id === 'tank') {
        e.hit(Math.round(CONFIG.player.maxHp * 0.15));
        e.hpFill.style.width = Math.round(e.hpPercent() * 100) + '%';
        if (!e.isAlive()) {
          spawnParticles(e.x, e.y, player.charDef.color, e.isElite);
          e.el.remove();
          registerKill(e);
          enemies.splice(i, 1);
          continue;
        }
      }

      // danno al player
      e.el.remove();
      enemies.splice(i, 1);
      player.takeDamage(e.damagePct);
      updateHpBar();
      updateComboDisplay();
      SFX.damage();
      triggerShake();

      // flash rosso arena
      flashEl.style.opacity = '1';
      setTimeout(() => flashEl.style.opacity = '0', 200);

      // aggiorna emoji player in base alla vita
      const p = player.hpPercent();
      playerEl.textContent = p > 0.5 ? player.charDef.emoji : p > 0.25 ? '😨' : '😰';

      if (!player.isAlive()) { endGame(); return; }
    }
  }

  /* ── AGGIORNA PROIETTILI ── */
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;
    b.el.style.left = b.x + 'px';
    b.el.style.top  = b.y + 'px';

    // rimuovi se fuori arena
    if (b.x < -20 || b.x > w + 20 || b.y < -20 || b.y > h + 20) {
      b.el.remove();
      bullets.splice(i, 1);
      continue;
    }

    // collisione con il player
    const dx   = cx - b.x;
    const dy   = cy - b.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < bulletHitR) {
      b.el.remove();
      bullets.splice(i, 1);

      // scudo o fortezza tank bloccano il proiettile
      if (player.shielded || (player.specialActive && player.charDef.id === 'tank')) continue;

      player.takeDamage(b.damagePct);
      updateHpBar();
      updateComboDisplay();
      SFX.damage();
      triggerShake();

      flashEl.style.opacity = '1';
      setTimeout(() => flashEl.style.opacity = '0', 150);

      const p = player.hpPercent();
      playerEl.textContent = p > 0.5 ? player.charDef.emoji : p > 0.25 ? '😨' : '😰';

      if (!player.isAlive()) { endGame(); return; }
    }
  }
}

/* ══════════════════════════════════════
   START / END PARTITA
   ══════════════════════════════════════ */

/* inizia una nuova partita con il personaggio selezionato */
function startGame() {
  SFX.init();

  const charDef = CONFIG.characters[selectedCharId];
  player        = new Player(charDef);
  enemies       = [];
  bullets       = [];
  running       = true;
  choosingAbility = false;
  lastTick      = performance.now();

  // pulizia DOM
  document.querySelectorAll('.enemy, .bullet, .particle').forEach(e => e.remove());
  abilityOverlay.classList.remove('visible');

  // reset HUD
  updateHpBar();
  updateProgress();
  updateComboDisplay();
  updateSpecialBar();
  scoreEl.textContent = '0';
  levelEl.textContent = 'livello 1';

  // reset player visivo
  playerEl.textContent = charDef.emoji;
  playerEl.className   = '';
  shieldRing.className  = '';
  specialRing.className = '';
  btnSpecial.className  = 'cbtn';
  btnSpecial.textContent = '⚡';
  specialWrap.classList.remove('ready');

  showScreen(sGame);

  // aggiorna range circle dopo che il DOM è visibile
  setTimeout(updateRangeCircle, 50);

  // avvia loop
  clearTimeout(spawnTimer);
  clearInterval(gameLoop);
  scheduleSpawn();
  gameLoop = setInterval(tick, 16);
}

/* termina la partita, mostra game over */
function endGame() {
  SFX.gameOver();

  running         = false;
  choosingAbility = false;

  clearTimeout(spawnTimer);
  clearInterval(gameLoop);

  // pulizia
  enemies.forEach(e => e.setSlowed(false, 1));
  document.querySelectorAll('.enemy, .bullet, .particle').forEach(e => e.remove());
  enemies = [];
  bullets = [];
  abilityOverlay.classList.remove('visible');

  // salva record
  const best  = getBestScore();
  const isNew = player.score > best;
  if (isNew) saveBestScore(player.score);

  // popola schermata game over
  finalScoreEl.textContent = player.score;
  finalLevelEl.textContent = 'livello ' + player.level + ' · ' + player.kills + ' kill';
  bestLabel.textContent    = isNew
    ? 'nuovo record! 🎉'
    : 'record: ' + Math.max(best, player.score);

  updateMenuBest();
  showScreen(sOver);
}

/* ══════════════════════════════════════
   EVENTI INPUT
   ══════════════════════════════════════ */

/* ── MENU ── */
document.getElementById('btn-infinite').addEventListener('click', () => {
  buildCharScreen(selectedCharId);
  showScreen(sChar);
});
document.getElementById('btn-story').addEventListener('click', () => showScreen(sSoon));

/* ── SELEZIONE PERSONAGGIO ── */
document.getElementById('btn-char-confirm').addEventListener('click', startGame);
document.getElementById('btn-char-back').addEventListener('click', () => showScreen(sMenu));

/* ── GAME OVER ── */
document.getElementById('btn-restart').addEventListener('click', () => {
  buildCharScreen(selectedCharId);
  showScreen(sChar);
});
document.getElementById('btn-home').addEventListener('click', () => {
  updateMenuBest();
  showScreen(sMenu);
});

/* ── STORIA PRESTO ── */
document.getElementById('btn-soon-back').addEventListener('click', () => showScreen(sMenu));

/* ── MUTO ── */
btnMute.addEventListener('click', () => {
  SFX.init();
  CONFIG.audio.enabled = !CONFIG.audio.enabled;
  btnMute.textContent  = CONFIG.audio.enabled ? '🔊 audio on' : '🔇 audio off';
});

/* ── DIREZIONI (click + touch) ── */
['up', 'down', 'left', 'right'].forEach(dir => {
  const btn = document.getElementById('btn-' + dir);
  btn.addEventListener('click', () => handleDir(dir));
  btn.addEventListener('touchstart', e => {
    e.preventDefault();
    handleDir(dir);
  }, { passive: false });
});

/* ── SCUDO (mousedown + touch) ──
   Lo scudo è hold — attivo finché tieni premuto */
btnShield.addEventListener('mousedown', () => setShield(true));
btnShield.addEventListener('touchstart', e => {
  e.preventDefault();
  setShield(true);
}, { passive: false });

document.addEventListener('mouseup',  () => { if (player && running) setShield(false); });
document.addEventListener('touchend', () => { if (player && running) setShield(false); });

/* ── SPECIALE (mousedown + touch) ── */
btnSpecial.addEventListener('mousedown', activateSpecial);
btnSpecial.addEventListener('touchstart', e => {
  e.preventDefault();
  activateSpecial();
}, { passive: false });

/* ── TASTIERA ──
   Frecce     → attacco direzionale
   S (hold)   → scudo
   D          → abilità speciale */
document.addEventListener('keydown', e => {

  // S = scudo (hold)
  if (e.code === 'KeyS') {
    e.preventDefault();
    if (running && !choosingAbility) setShield(true);
    return;
  }

  // D = speciale
  if (e.code === 'KeyD') {
    e.preventDefault();
    activateSpecial();
    return;
  }

  // frecce = attacco
  const map = {
    ArrowUp:    'up',
    ArrowDown:  'down',
    ArrowLeft:  'left',
    ArrowRight: 'right',
  };

  if (map[e.key]) {
    e.preventDefault();
    const btn = document.getElementById('btn-' + map[e.key]);
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 120);
    handleDir(map[e.key]);
  }
});

document.addEventListener('keyup', e => {
  // rilascia scudo quando si alza S
  if (e.code === 'KeyS') {
    e.preventDefault();
    if (running) setShield(false);
  }
});

/* ══════════════════════════════════════
   INIT
   ══════════════════════════════════════ */

// mostra il record al caricamento della pagina
updateMenuBest();