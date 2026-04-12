/* ═══════════════════════════════════════
   PLAYER.JS
   Player class — state and methods
   during a match.

   Used by: systems/loop.js
   Depends on: config.js
   ═══════════════════════════════════════ */

class Player {

  constructor(charDef) {

    this.charDef = charDef;

    // ── hp ──
    this.maxHp = CONFIG.player.maxHp;
    this.hp    = this.maxHp;

    // ── progression ──
    this.score          = 0;
    this.level          = 1;
    this.kills          = 0;
    this.killsThisLevel = 0;

    // ── combo ──
    this.combo      = 0;
    this.comboTimer = 0;

    // ── special ──
    this.specialCharge = 0;
    this.specialActive = false;
    this.specialTimer  = 0;

    // ── stats from character ──
    this.attackRangePct = charDef.rangePct;
    this.damageMult     = charDef.damageMult;

    // ── ability modifiers ──
    this.specialChargeMult = 1;
    this.comboDecayBonus   = 0;
    this.shieldHealAmt     = 0;
    this.stunChance        = 0;
    this.doubleAttack      = false;
    this.thorns            = false;

    // ── shield ──
    this.shielded = false;

    // ── acquired abilities ──
    this.acquiredAbilities = [];

    // ── internal flag ──
    this._wasSpecialReady = false;
  }

  killsForNextLevel() {
    const base    = CONFIG.difficulty.killsPerLevelBase;
    const scaling = CONFIG.difficulty.killsPerLevelScaling;
    return Math.round(base * Math.pow(scaling, this.level - 1));
  }

  takeDamage(pct) {
    if (this.specialActive && this.charDef.special.blocksBullets) return;
    this.hp = Math.max(0, this.hp - Math.round(this.maxHp * pct));
    this.resetCombo();
  }

  isAlive()   { return this.hp > 0; }
  hpPercent() { return this.hp / this.maxHp; }

  getComboMult() {
    const m = CONFIG.combo.multipliers;
    return m[Math.min(this.combo, m.length - 1)];
  }

  getAttackRange(arenaSize) {
    return arenaSize * this.attackRangePct;
  }

  getHitDamage() {
    return Math.round(CONFIG.player.maxHp * CONFIG.base.hitDamagePct * this.damageMult);
  }

  resetCombo() {
    this.combo      = 0;
    this.comboTimer = 0;
  }

  addKill() {
    const inCombo = this.combo >= CONFIG.combo.minKills;
    this.combo++;
    this.comboTimer = CONFIG.combo.decayMs + this.comboDecayBonus;

    const baseCharge = inCombo
      ? CONFIG.combo.chargePerComboKill
      : CONFIG.combo.chargePerKill;
    this.specialCharge = Math.min(100, this.specialCharge + baseCharge * this.specialChargeMult);
  }

  isSpecialReady() {
    return this.specialCharge >= 100 && !this.specialActive;
  }

  activateSpecial() {
    if (!this.isSpecialReady()) return false;
    this.specialActive    = true;
    this.specialCharge    = 0;
    this._wasSpecialReady = false;
    this.specialTimer     = this.charDef.special.duration;
    return true;
  }

  tickSpecial(dt) {
    if (this.combo > 0 && this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) this.resetCombo();
    }

    if (this.specialActive) {
      this.specialTimer -= dt;
      if (this.specialTimer <= 0) {
        this.specialActive = false;
        this.specialTimer  = 0;
      }
    }
  }

}