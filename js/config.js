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

};