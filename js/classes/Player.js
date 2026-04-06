/* ═══════════════════════════════════════
   PLAYER.JS
   Classe Player — tutto lo stato e i metodi
   del giocatore durante una partita.

   Dipende da: config.js
   Usato da: game.js, ui.js

   REGOLA: questa classe gestisce SOLO lo stato
   del player. Non tocca mai il DOM direttamente.
   Il DOM viene aggiornato da ui.js.

   STATO PRINCIPALE:
   - hp / maxHp       → vita
   - score            → punteggio
   - level            → livello corrente
   - kills            → kill totali
   - killsThisLevel   → kill nel livello corrente
   - combo            → kill consecutive senza danno
   - comboTimer       → ms rimanenti prima del decay
   - specialCharge    → 0-100 barra speciale
   - specialActive    → true mentre l'abilità è attiva
   - specialTimer     → ms rimanenti dell'abilità speciale

   MODIFICATORI DA ABILITÀ ROGUELITE:
   - damageMult       → moltiplicatore danno attacco
   - attackRangePct   → % range sull'arena
   - specialChargeMult→ moltiplicatore carica speciale
   - comboDecayBonus  → ms extra prima del decay combo
   - shieldHealAmt    → HP recuperati ad ogni scudo
   - stunChance       → probabilità stordire nemico (0.0-1.0)
   - doubleAttack     → colpisce direzioni adiacenti
   - thorns           → danno da contatto durante fortezza
   ═══════════════════════════════════════ */

class Player {

  /* ── COSTRUTTORE ────────────────────────
     @param charDef  oggetto personaggio da CONFIG.characters
                     es. CONFIG.characters.warrior
  ─────────────────────────────────────── */
  constructor(charDef) {

    // riferimento alla definizione del personaggio scelto
    this.charDef = charDef;

    // ── vita ──
    this.maxHp = CONFIG.player.maxHp;
    this.hp    = this.maxHp;

    // ── progressione partita ──
    this.score          = 0;
    this.level          = 1;
    this.kills          = 0;
    this.killsThisLevel = 0;

    // ── combo ──
    this.combo      = 0;     // kill consecutive
    this.comboTimer = 0;     // ms rimanenti prima del decay

    // ── speciale ──
    this.specialCharge = 0;      // 0-100
    this.specialActive = false;
    this.specialTimer  = 0;      // ms rimanenti effetto

    // ── stat base dal personaggio ──
    this.attackRangePct = charDef.rangePct;
    this.damageMult     = charDef.damageMult;

    // ── modificatori da abilità roguelite ──
    // questi vengono modificati da ABILITIES[n].effect(player)
    this.specialChargeMult = 1;
    this.comboDecayBonus   = 0;
    this.shieldHealAmt     = 0;
    this.stunChance        = 0;
    this.doubleAttack      = false;
    this.thorns            = false;

    // ── stato scudo ──
    this.shielded = false;

    // ── abilità già acquisite (evita duplicati) ──
    this.acquiredAbilities = [];

    // ── flag interno per suono "speciale pronta" ──
    // evita che il suono suoni in loop ogni tick
    this._wasSpecialReady = false;
  }

  /* ── KILL PER SALIRE DI LIVELLO ─────────
     Scala esponenzialmente: livello 1 → 8 kill,
     livello 2 → 10, livello 3 → 12 ecc.
     Formula: base * scaling^(level-1)
  ─────────────────────────────────────── */
  killsForNextLevel() {
    const base    = CONFIG.difficulty.killsPerLevelBase;
    const scaling = CONFIG.difficulty.killsPerLevelScaling;
    return Math.round(base * Math.pow(scaling, this.level - 1));
  }

  /* ── DANNO RICEVUTO ─────────────────────
     Il tank in Fortezza è invincibile.
     Il danno azzera sempre la combo.

     @param pct  percentuale di maxHp da sottrarre
  ─────────────────────────────────────── */
  takeDamage(pct) {
    // tank invincibile durante la speciale
    if (this.specialActive && this.charDef.id === 'tank') return;

    this.hp = Math.max(0, this.hp - Math.round(this.maxHp * pct));
    this.resetCombo();
  }

  /* ── STATO VITA ─────────────────────────  */
  isAlive()    { return this.hp > 0; }
  hpPercent()  { return this.hp / this.maxHp; }

  /* ── MOLTIPLICATORE COMBO ───────────────
     Usa l'indice della combo per scalare
     nell'array CONFIG.combo.multipliers.
     Cap all'ultimo elemento se combo supera la lista.
  ─────────────────────────────────────── */
  getComboMult() {
    const m = CONFIG.combo.multipliers;
    return m[Math.min(this.combo, m.length - 1)];
  }

  /* ── RANGE DI ATTACCO ───────────────────
     @param arenaSize  dimensione arena in px (min tra w e h)
     @return           range in px
  ─────────────────────────────────────── */
  getAttackRange(arenaSize) {
    return arenaSize * this.attackRangePct;
  }

  /* ── DANNO ATTACCO ──────────────────────
     Danno base * moltiplicatore personaggio.
     Viene modificato da abilità damage_up.
  ─────────────────────────────────────── */
  getHitDamage() {
    return Math.round(CONFIG.player.maxHp * CONFIG.base.hitDamagePct * this.damageMult);
  }

  /* ── RESET COMBO ────────────────────────
     Azzerata quando: ricevi danno, timer scade.
  ─────────────────────────────────────── */
  resetCombo() {
    this.combo      = 0;
    this.comboTimer = 0;
  }

  /* ── AGGIUNGI KILL ALLA COMBO ───────────
     Incrementa combo, resetta il timer decay,
     carica la barra speciale.
     La carica è maggiore se già in combo.
  ─────────────────────────────────────── */
  addKill() {
    const inCombo = this.combo >= CONFIG.combo.minKills;
    this.combo++;

    // resetta il timer decay — base + bonus da abilità
    this.comboTimer = CONFIG.combo.decayMs + this.comboDecayBonus;

    // carica barra speciale
    const baseCharge = inCombo
      ? CONFIG.combo.chargePerComboKill
      : CONFIG.combo.chargePerKill;
    this.specialCharge = Math.min(100, this.specialCharge + baseCharge * this.specialChargeMult);
  }

  /* ── SPECIALE PRONTA ────────────────────
     True solo se carica piena E speciale non già attiva.
  ─────────────────────────────────────── */
  isSpecialReady() {
    return this.specialCharge >= 100 && !this.specialActive;
  }

  /* ── ATTIVA SPECIALE ────────────────────
     Svuota la barra, attiva il timer.
     @return true se attivata, false se non pronta
  ─────────────────────────────────────── */
  activateSpecial() {
    if (!this.isSpecialReady()) return false;

    this.specialActive    = true;
    this.specialCharge    = 0;
    this._wasSpecialReady = false;
    this.specialTimer     = this.charDef.special.duration;
    return true;
  }

  /* ── TICK TIMER ─────────────────────────
     Da chiamare ogni frame nel game loop.
     Aggiorna il decay della combo e
     il timer dell'abilità speciale.

     @param dt  delta time in ms dall'ultimo frame
  ─────────────────────────────────────── */
  tickSpecial(dt) {

    // decay combo
    if (this.combo > 0 && this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.resetCombo();
    }

    // timer speciale
    if (this.specialActive) {
      this.specialTimer -= dt;
      if (this.specialTimer <= 0) {
        this.specialActive = false;
        this.specialTimer  = 0;
      }
    }
  }

}