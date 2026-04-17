/* ═══════════════════════════════════════
   PLAYER.JS
   Player class — state and methods
   during a match.

   Stats come from PLAYER_STATS (stats.js).
   Ability comes from AbilityRegistry
   (the equipped ability id).

   Used by: systems/loop.js
   Depends on: stats.js, AbilityRegistry, config.js
   ═══════════════════════════════════════ */

class Player {

  constructor(abilityId) {

    // ── ability equipped ──
    this.ability = AbilityRegistry.get(abilityId || PLAYER_STATS.defaultAbility);

    // ── hp ──
    this.maxHp = PLAYER_STATS.maxHp;
    this.hp    = this.maxHp;

    // ── progression ──
    this.score = 0;
    this.kills = 0;

    // ── combo ──
    this.combo      = 0;
    this.comboTimer = 0;

    // ── special ──
    this.specialCharge = 0;
    this.specialActive = false;
    this.specialTimer  = 0;

    // ── stats from PLAYER_STATS ──
    this.attackRangePct = PLAYER_STATS.rangePct;
    this.damageMult     = PLAYER_STATS.damageMult;
    this.emoji          = PLAYER_STATS.emoji;
    this.color          = PLAYER_STATS.color;

    // ── ability modifiers (future-proofed) ──
    this.specialChargeMult = 1;
    this.comboDecayBonus   = 0;
    this.stunChance        = 0;
    this.doubleAttack      = false;
    this.thorns            = false;

    // ── internal flag ──
    this._wasSpecialReady = false;
  }

  takeDamage(pct) {
    if (this.specialActive && this.ability.blocksBullets) return;
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
    return Math.round(PLAYER_STATS.maxHp * CONFIG.base.hitDamagePct * this.damageMult);
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
    this.specialTimer     = this.ability.duration;
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