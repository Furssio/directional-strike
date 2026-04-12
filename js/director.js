/* ═══════════════════════════════════════
   DIRECTOR.JS
   AI Director — controlla il pacing del gioco.
   Calcola lo stress del giocatore in tempo
   reale e decide quando e cosa spawnare.

   Dipende da: config.js, classes/Enemy.js
   Usato da: game.js

   COME FUNZIONA:
   1. Ogni tick calcola lo stress situazionale
      in base ai nemici in campo, danno, vita
   2. Confronta stress con il target della wave
   3. Decide intervallo e dimensione gruppo spawn
   4. Spawna nemici bilanciando i 4 lati

   EVENTI ESTERNI:
   - Director.onDamage() → chiamato quando player riceve danno
   - Director.onKill()   → chiamato quando nemico muore
   - Director.init()     → chiamato a inizio partita
   - Director.tick(dt)   → chiamato ogni frame dal game loop
   - Director.nextWave() → chiamato quando wave è completata
   ═══════════════════════════════════════ */

const Director = (() => {

  /* ── STATO INTERNO ────────────────────── */
  let wave          = 1;      // wave corrente
  let stress        = 0;      // stress attuale 0-100
  let spawnTimer    = 0;      // ms prima del prossimo spawn
  let killsThisWave = 0;      // kill nella wave corrente
  let isBossWave    = false;  // true se wave multiplo di 10
  let active        = false;  // true mentre il gioco è in corso

  /* cooldown direzioni — evita spawn ripetuti sullo stesso lato
     ogni lato ha un timer in ms prima di poter rispawnare */
  const dirCooldowns = { up: 0, down: 0, left: 0, right: 0 };
  const DIR_COOLDOWN_MS = 1200; // ms cooldown per lato dopo uno spawn

  /* ── STRESS TARGET ──────────────────────
     Restituisce il target stress per la wave corrente.
     Wave 1-10 usa valori fissi da config.
     Wave 11+ calcolato con formula. */
  function getWaveTarget() {
    const d = CONFIG.director;

    // wave 1-10 usa tabella fissa
    if (wave <= 10 && d.waveTargets[wave] !== undefined) {
      return d.waveTargets[wave];
    }

    // wave 11+ formula scalata
    const base   = d.baseTarget + (wave - 1) * d.targetIncreasePerWave;
    const target = Math.min(d.maxTarget, base);
    return isBossWave ? Math.min(d.maxTarget, target + d.bossTargetBonus) : target;
  }

  /* ── CALCOLA STRESS SITUAZIONALE ────────
     Analizza i nemici in campo e restituisce
     il livello di stress attuale.
     @param cx, cy  centro arena in px */
  function calcStress(cx, cy) {
    const d   = CONFIG.director.stress;
    let   s   = 0;
    let   gruntCount = 0;

    for (const e of enemies) {
      if (e.name === 'tank') {
        s += d.tank;

      } else if (e.name === 'armor') {
        const dist = e.distToCenter(cx, cy);
        if (dist <= d.armorDistClose)     s += d.armorClose;
        else if (dist <= d.armorDistMid)  s += d.armorMid;
        else                              s += d.armorFar;

      } else if (e.name === 'grunt') {
        gruntCount++;
      }
    }

    // grunt: primo vale poco, ogni extra vale di più
    if (gruntCount > 0) {
      s += d.gruntAlone;
      s += Math.max(0, gruntCount - 1) * d.gruntExtra;
    }

    // modificatori vita
    const hpPct = player.hpPercent();
    if (hpPct <= 0.25)      s += d.lowHp25;
    else if (hpPct <= 0.50) s += d.lowHp50;

    return Math.min(100, Math.max(0, s));
  }

  /* ── STATO DIRECTOR ─────────────────────
     Confronta stress attuale con target.
     Restituisce 'fast' / 'normal' / 'slow' */
  function getState() {
    const target = getWaveTarget();
    const tol    = CONFIG.director.tolerance;

    if (stress < target - tol) return 'fast';
    if (stress > target + tol) return 'slow';
    return 'normal';
  }

  /* ── POOL NEMICI PER WAVE ───────────────
     Costruisce il pool dei nemici disponibili
     per la wave corrente in base a fromWave e weight. */
  function buildEnemyPool() {
    const pool = [];
    const ep   = CONFIG.director.enemyPool;

    for (const [name, cfg] of Object.entries(ep)) {
      if (wave >= cfg.fromWave) {
        for (let i = 0; i < cfg.weight; i++) {
          pool.push(name);
        }
      }
    }

    return pool;
  }

  /* ── SCEGLI DIREZIONE ───────────────────
     Sceglie un lato disponibile (cooldown = 0).
     Se tutti in cooldown sceglie quello con
     cooldown più basso. */
  function pickDir() {
    const dirs      = ['up', 'down', 'left', 'right'];
    const available = dirs.filter(d => dirCooldowns[d] <= 0);

    if (available.length > 0) {
      return available[Math.floor(Math.random() * available.length)];
    }

    // tutti in cooldown — prendi quello con meno tempo
    return dirs.reduce((a, b) => dirCooldowns[a] < dirCooldowns[b] ? a : b);
  }

  /* ── SPAWN GRUPPO ───────────────────────
     Spawna un gruppo di nemici.
     Il numero dipende dallo stato del Director.
     I lati vengono scelti evitando ripetizioni. */
  function spawnGroup() {
    if (!active || choosingAbility) return;

    const state   = getState();
    const d       = CONFIG.director;
    const pool    = buildEnemyPool();
    if (pool.length === 0) return;

    // dimensione gruppo in base allo stato
    let groupSize;
    if (state === 'fast')        groupSize = d.groupSizeFast;
    else if (state === 'slow')   groupSize = d.groupSizeSlow;
    else                         groupSize = d.groupSizeNormal;

    // cap nemici in arena
    const maxEnemies = Math.min(
      d.maxEnemiesCap,
      Math.floor(d.maxEnemiesBase + wave * d.maxEnemiesPerWave)
    );

    const toSpawn = Math.min(groupSize, Math.max(0, maxEnemies - enemies.length));

    for (let i = 0; i < toSpawn; i++) {
      const enemyName = pool[Math.floor(Math.random() * pool.length)];
      const def       = CONFIG.enemies[enemyName];
      const dir       = pickDir();

      // applica cooldown al lato usato
      dirCooldowns[dir] = DIR_COOLDOWN_MS;

      // piccolo delay tra nemici dello stesso gruppo
      setTimeout(() => {
        if (active) spawnEnemyDirected(def, dir);
      }, i * 180);
    }
  }

  /* ── INTERVAL SPAWN ─────────────────────
     Restituisce l'intervallo in ms per il
     prossimo gruppo in base allo stato. */
  function getSpawnInterval() {
    const state = getState();
    const d     = CONFIG.director;

    if (state === 'fast') return d.spawnIntervalFast;
    if (state === 'slow') return d.spawnIntervalSlow;
    return d.spawnIntervalNormal;
  }

  /* ── KILL PER AVANZARE ──────────────────
     Kill necessarie per completare la wave corrente. */
  function killsToAdvance() {
    const d = CONFIG.director;
    return Math.round(d.killsToAdvanceBase * Math.pow(d.killsToAdvanceScaling, wave - 1));
  }

  /* ══════════════════════════════════════
     API PUBBLICA
     ══════════════════════════════════════ */
  return {

    /* ── INIT ───────────────────────────
       Chiamato da startGame() in game.js */
    init() {
      wave          = 1;
      stress        = 0;
      spawnTimer    = 0;
      killsThisWave = 0;
      isBossWave    = false;
      active        = true;
      dirCooldowns.up = dirCooldowns.down = dirCooldowns.left = dirCooldowns.right = 0;
    },

    /* ── STOP ───────────────────────────
       Chiamato da endGame() */
    stop() {
      active = false;
    },

    /* ── ON DAMAGE ──────────────────────
       Chiamato quando il player riceve danno */
    onDamage() {
      stress = Math.min(100, stress + CONFIG.director.stress.onDamage);
    },

    /* ── ON KILL ────────────────────────
       Chiamato quando un nemico muore.
       Aggiorna kill count e controlla avanzamento wave. */
    onKill() {
      stress        = Math.max(0, stress + CONFIG.director.stress.onKill);
      killsThisWave++;

      // controlla se wave completata
      if (killsThisWave >= killsToAdvance()) {
        this.nextWave();
      }
    },

    /* ── NEXT WAVE ──────────────────────
       Avanza alla wave successiva.
       Se boss wave → pausa per scelta abilità. */
    nextWave() {
      wave++;
      killsThisWave = 0;
      isBossWave    = (wave % 10 === 0);

      // aggiorna HUD wave
      if (typeof updateWaveDisplay === 'function') updateWaveDisplay(wave, isBossWave);

      if (isBossWave) {
        // boss wave → mostra overlay abilità dopo breve pausa
        setTimeout(() => {
          if (active) showAbilityChoice();
        }, 800);
      }
    },

    /* ── TICK ───────────────────────────
       Chiamato ogni frame dal game loop.
       @param dt  delta time in ms */
    tick(dt) {
      if (!active || choosingAbility) return;

      const { w, h } = getArenaSize();
      const cx = w / 2;
      const cy = h / 2;

      // aggiorna stress situazionale
      stress = calcStress(cx, cy);

      // decay stress nel tempo
      const decay = CONFIG.director.stress.decayPerSecond * dt / 1000;
      stress      = Math.max(0, stress - decay);

      // aggiorna timer spawn
      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnGroup();
        spawnTimer = getSpawnInterval();
      }

      // aggiorna cooldown direzioni
      for (const dir of ['up', 'down', 'left', 'right']) {
        dirCooldowns[dir] = Math.max(0, dirCooldowns[dir] - dt);
      }
    },

    /* getter per HUD/debug */
    getWave()   { return wave; },
    getStress() { return Math.round(stress); },
    getTarget() { return Math.round(getWaveTarget()); },
    isBoss()    { return isBossWave; },
    getKills()  { return killsThisWave; },
    getKillsNeeded() { return killsToAdvance(); },

  };

})();