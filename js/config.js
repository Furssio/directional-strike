/* ═══════════════════════════════════════
   CONFIG.JS
   Tutti i valori numerici e definizioni
   del gioco in un unico posto.

   Dipende da: niente — è il primo file caricato
   Usato da: tutti gli altri file JS

   REGOLA: se vuoi cambiare un numero del gioco
   lo cambi QUI, non nei file di logica.
   ═══════════════════════════════════════ */

const CONFIG = {

  /* ── GIOCATORE ──────────────────────────
     Vita massima e soglie colore barra HP.
     hpBarGreenPct:  sopra questa % → verde
     hpBarYellowPct: sopra questa % → giallo
     sotto hpBarYellowPct            → rosso
  ─────────────────────────────────────── */
  player: {
    maxHp:            100,
    hpBarGreenPct:    0.50,
    hpBarYellowPct:   0.25,
  },

  /* ── PERSONAGGI ─────────────────────────
     Ogni personaggio ha:
     - id:         chiave univoca (stringa)
     - emoji:      icona visiva
     - name:       nome mostrato in UI
     - desc:       descrizione breve
     - rangePct:   range attacco (% della dimensione arena)
     - damageMult: moltiplicatore danno base
     - color:      colore hex — usato per range circle, particelle, UI
     - special:    abilità speciale (vedi sotto)
     - stats:      valori 1-5 solo per le barre UI nella schermata selezione
  ─────────────────────────────────────── */
  characters: {

    warrior: {
      id:         'warrior',
      emoji:      '⚔️',
      name:       'guerriero',
      desc:       'alto danno, range corto',
      rangePct:   0.26,
      damageMult: 1.6,
      color:      '#E24B4A',
      special: {
        name:     'Bullet Time',
        desc:     'rallenta tutti i nemici per 3s',
        icon:     '🌀',
        duration: 3000,   // ms durata effetto
        slowMult: 0.25,   // i nemici vanno al 25% della velocità
        barColor: '#E24B4A',
      },
      stats: { range: 1, damage: 5, hp: 3 },
    },

    mage: {
      id:         'mage',
      emoji:      '🧙',
      name:       'mago',
      desc:       'range lungo, danno basso',
      rangePct:   0.52,
      damageMult: 0.7,
      color:      '#8B5CF6',
      special: {
        name:     'Piercing',
        desc:     'colpi trapassanti per 3s',
        icon:     '✨',
        duration: 3000,   // ms durata effetto
        barColor: '#8B5CF6',
      },
      stats: { range: 5, damage: 2, hp: 2 },
    },

    tank: {
      id:         'tank',
      emoji:      '🛡️',
      name:       'tank',
      desc:       'bilanciato, invincibile',
      rangePct:   0.38,
      damageMult: 1.0,
      color:      '#22C55E',
      special: {
        name:     'Fortezza',
        desc:     'invincibile per 4s',
        icon:     '🔰',
        duration: 4000,   // ms durata effetto
        barColor: '#22C55E',
      },
      stats: { range: 3, damage: 3, hp: 5 },
    },

  },

  /* ── NEMICI ─────────────────────────────
     Ogni nemico ha:
     - name:            chiave interna
     - hpPct:           HP come % del maxHp del player
     - damagePct:       danno contatto come % del maxHp player
     - speedMult:       moltiplicatore sulla velocità base
     - points:          punti base per kill
     - emoji:           icona visiva
     - size:            dimensione in px
     - shoots:          true se spara proiettili
     - shootInterval:   ms tra un colpo e l'altro
     - bulletDamagePct: danno proiettile come % del maxHp player
     - bulletSpeed:     velocità proiettile in px/tick
  ─────────────────────────────────────── */
  enemies: {

    grunt: {
      name:       'grunt',
      hpPct:      0.30,
      damagePct:  0.34,
      speedMult:  1.0,
      points:     10,
      emoji:      '👹',
      size:       36,
      shoots:     false,
    },

    tank: {
      name:            'tank',
      hpPct:           0.65,
      damagePct:       0.34,
      speedMult:       0.60,
      points:          25,
      emoji:           '👾',
      size:            46,
      shoots:          true,
      shootInterval:   2000,
      bulletDamagePct: 0.20,
      bulletSpeed:     4.5,
    },

    armor: {
      name:       'armor',
      hpPct:      0.95,
      damagePct:  0.40,
      speedMult:  0.38,
      points:     40,
      emoji:      '🗿',
      size:       52,
      shoots:     false,
    },

  },

  /* ── COMBO ──────────────────────────────
     minKills:          kill minime per attivare il moltiplicatore
     multipliers:       lista moltiplicatori per numero di combo
                        indice 0-1 = x1, indice 2 = x1.5 ecc.
     decayMs:           ms senza kill prima che la combo si azzeri
     chargePerKill:     % barra speciale per kill normale
     chargePerComboKill:% barra speciale per kill in combo attiva
  ─────────────────────────────────────── */
  combo: {
    minKills:           2,
    multipliers:        [1, 1, 1.5, 2, 2.5, 3],
    decayMs:            3000,
    chargePerKill:      8,
    chargePerComboKill: 14,
  },

  /* ── DIFFICOLTÀ ─────────────────────────
     killsPerLevelBase:    kill richieste al livello 1
     killsPerLevelScaling: moltiplicatore per ogni livello successivo
                           es. 1.20 = +20% kill richieste ogni livello
                           livello 1→8, 2→10, 3→12, 4→14, 5→17...
     speedIncreasePerLevel: +% velocità nemici per livello
     maxSpeedMult:          cap velocità massima
     baseSpawnInterval:     ms tra uno spawn e l'altro al livello 1
     minSpawnInterval:      cap minimo spawn interval
     spawnIntervalReductionPerLevel: ms tolti all'interval per livello
  ─────────────────────────────────────── */
  difficulty: {
    killsPerLevelBase:              8,
    killsPerLevelScaling:           1.20,
    speedIncreasePerLevel:          0.10,
    maxSpeedMult:                   2.5,
    baseSpawnInterval:              1400,
    minSpawnInterval:               550,
    spawnIntervalReductionPerLevel: 120,
    baseTankChance:                 0.30,
    tankChanceIncreasePerLevel:     0.03,
    maxTankChance:                  0.50,
    armorStartLevel:                3,
    armorChancePerLevel:            0.04,
    maxArmorChance:                 0.25,
  },

  /* ── BASE ───────────────────────────────
     enemyBaseSpeed: velocità base di tutti i nemici (px/tick)
     hitDamagePct:   danno base del player come % di maxHp
                     viene moltiplicato per damageMult del personaggio
  ─────────────────────────────────────── */
  base: {
    enemyBaseSpeed: 2.2,
    hitDamagePct:   0.34,
  },

  /* ── PROIETTILI ─────────────────────────
     firstShotDistPct: il tank spara il primo colpo quando
                       la distanza dal centro è <= spawnDist * questo valore
  ─────────────────────────────────────── */
  bullet: {
    firstShotDistPct: 0.75,
  },

  /* ── AUDIO ──────────────────────────────
     enabled: toggle globale audio on/off
     volume:  volume master 0.0 → 1.0
  ─────────────────────────────────────── */
  audio: {
    enabled: true,
    volume:  0.4,
  },

  /* ── JUICE VISIVO ───────────────────────
     Tutti i parametri degli effetti visivi.
     particles:
       killCount:      numero particelle per kill normale (grunt)
       killCountElite: numero particelle per kill elite (tank/armor)
       minSize/maxSize: dimensione particella in px
       minSpeed/maxSpeed: velocità particella
       lifetime:       durata animazione in ms
     hitFlashMs:       durata flash bianco sul nemico colpito
     shakeOnDamage:    true = arena trema quando ricevi danno
     shakeOnKillElite: true = arena trema anche su kill elite
  ─────────────────────────────────────── */
  juice: {
    particles: {
      killCount:      10,
      killCountElite: 18,
      minSize:        3,
      maxSize:        7,
      minSpeed:       1.8,
      maxSpeed:       4.5,
      lifetime:       420,
    },
    hitFlashMs:       110,
    shakeOnDamage:    true,
    shakeOnKillElite: true,
  },
/* ── DIRECTOR AI ────────────────────────
     Sistema che controlla il pacing del gioco.
     Calcola lo stress del giocatore in tempo
     reale e decide quando e cosa spawnare.

     STRESS: numero 0-100 che rappresenta
     la pressione attuale sul giocatore.
     Sale con danno/nemici pericolosi,
     scende con kill/tempo senza danno.

     WAVE TARGET: ogni wave ha un livello
     di stress ideale. Il Director lavora
     per mantenere il giocatore a quel livello.
  ─────────────────────────────────────── */
  director: {

    /* ── PESI STRESS NEMICI ──
       Quanto stress aggiunge ogni nemico
       in base al tipo e alla situazione.
       distMid/distClose in px dall'arena center */
    stress: {
      tank:              25,   // tank in campo — sempre alto
      armorFar:           5,   // armor lontano — quasi ignorabile
      armorMid:          15,   // armor a metà strada
      armorClose:        30,   // armor vicino — urgente
      gruntAlone:         5,   // grunt da solo — facile
      gruntExtra:         8,   // ogni grunt aggiuntivo in campo
      armorDistMid:     160,   // px — soglia lontano→medio
      armorDistClose:    80,   // px — soglia medio→vicino

      /* modificatori eventi */
      onDamage:          20,   // danno ricevuto → stress immediato
      onKill:           -10,   // kill → stress immediato
      lowHp50:           10,   // vita sotto 50% → stress passivo
      lowHp25:           20,   // vita sotto 25% → stress passivo
      decayPerSecond:     3,   // stress decay ogni secondo senza eventi
    },

    /* ── STRESS TARGET PER WAVE ──
       Il Director cerca di mantenere
       il giocatore a questo livello.
       Wave boss (multipli di 10) molto più alti. */
    waveTargets: [
      0,   // indice 0 non usato
      25,  // wave 1
      30,  // wave 2
      35,  // wave 3
      38,  // wave 4
      42,  // wave 5
      45,  // wave 6
      48,  // wave 7
      52,  // wave 8
      58,  // wave 9
      75,  // wave 10 — BOSS
    ],

    /* stress target per wave oltre la 10
       calcolato automaticamente dal Director
       con questa formula:
       baseTarget + (wave - 1) * targetIncreasePerWave
       cap a maxTarget */
    baseTarget:              30,
    targetIncreasePerWave:    1.5,
    maxTarget:               92,
    bossTargetBonus:         20,  // wave boss → target + questo valore

    /* ── STATI DIRECTOR ──
       tolerance: margine prima di cambiare stato
       se stress < target - tolerance → spawna di più
       se stress > target + tolerance → rallenta */
    tolerance:               15,

    /* ── SPAWN ──
       intervalli spawn in ms per stato Director */
    spawnIntervalFast:      400,   // stress troppo basso → spawn aggressivo
    spawnIntervalNormal:    900,   // stress nel target → ritmo normale
    spawnIntervalSlow:     1800,   // stress troppo alto → pausa

    /* dimensione gruppo spawn per stato */
    groupSizeFast:            3,   // stress basso → gruppi da 3
    groupSizeNormal:          2,   // normale → gruppi da 2
    groupSizeSlow:            1,   // stress alto → uno alla volta

    /* ── WAVE ──
       killsToAdvance: kill necessarie per passare
       alla wave successiva — scala per wave */
    killsToAdvanceBase:      12,
    killsToAdvanceScaling:    1.18,

    /* nemici max in arena contemporaneamente
       aumenta con le wave */
    maxEnemiesBase:           4,
    maxEnemiesPerWave:        0.3,  // +0.3 per wave
    maxEnemiesCap:           12,

    /* ── COMPOSIZIONE NEMICI PER WAVE ──
       ogni entry definisce da quale wave
       quel nemico inizia ad apparire e
       il suo peso nel pool (più alto = più frequente) */
    enemyPool: {
      grunt: { fromWave: 1,  weight: 6 },
      tank:  { fromWave: 3,  weight: 3 },
      armor: { fromWave: 5,  weight: 2 },
    },

  },
};