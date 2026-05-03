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

    // ── ability modifiers ──
    this.specialChargeMult = 1;
    this.comboDecayBonus   = 0;
    this.stunChance        = 0;
    this.doubleAttack      = false;
    this.thorns            = false;

    // ── global speed multiplier (abilities like BulletTime) ──
    this.speedMultiplier = 1.0;

    this.rangePctMultiplier = 1.0;
    this.oneHitActive       = false;
    this.doubleStrikeActive = false;
    this.slashActive        = false;

    // ── upgrade properties (set by upgradeChoice.js apply) ──
    this._defenseMult          = 1;      // iron skin
    this._critChance           = 0;      // critical hit
    this._frostChance          = 0;      // frost touch
    this._luckyBlockChance     = 0;      // lucky shield
    this._vampKillInterval     = 0;      // vampiric (0 = inactive)
    this._vampHealPct          = 0;      // vampiric
    this._vampKillCount        = 0;      // vampiric counter
    this._abilityDurationMult  = 1;      // ability boost
    this._orbChanceBonus       = 0;      // orb hunter (flat add)
    this._berserkerAtkThreshold = 0;     // berserker atk
    this._berserkerAtkBonus    = 0;      // berserker atk
    this._berserkerDefThreshold = 0;     // berserker def
    this._berserkerDefBonus    = 0;      // berserker def
    this._maxSpecialSlots      = 1;      // extra slot (1 = default, max 3)

    // ── internal flag ──
    this._wasSpecialReady = false;
  }

  /* ── DAMAGE ─────────────────────────── */

  takeDamage(pct) {
    // shield ability blocks all damage
    if (this.specialActive && this.ability.blocksBullets) return;

    // lucky shield — chance to block hit completely
    if (this._luckyBlockChance > 0 && Math.random() < this._luckyBlockChance) {
      if (typeof showActionPop === 'function') {
        const { w, h } = getArenaSize();
        showActionPop('up', 'BLOCKED!', '#44ffaa');
      }
      if (typeof SFX !== 'undefined') SFX.hit();
      return;
    }

    let dmgPct = pct;

    // orb defense buff
    if (typeof OrbSystem !== 'undefined' && OrbSystem.hasDefenseBuff()) dmgPct *= 0.5;

    // iron skin multiplier
    if (this._defenseMult < 1) dmgPct *= this._defenseMult;

    // berserker DEF — reduce damage when low HP
    if (this._berserkerDefBonus > 0 && this.hpPercent() <= this._berserkerDefThreshold) {
      dmgPct *= (1 - this._berserkerDefBonus);
    }

    this.hp = Math.max(0, this.hp - Math.round(this.maxHp * dmgPct));
    this.resetCombo();
  }

  isAlive()   { return this.hp > 0; }
  hpPercent() { return this.hp / this.maxHp; }

  getComboMult() {
    const m = CONFIG.combo.multipliers;
    return m[Math.min(this.combo, m.length - 1)];
  }

  getAttackRange(arenaSize) {
    return arenaSize * this.attackRangePct * this.rangePctMultiplier;
  }

  /* ── HIT DAMAGE ─────────────────────── */

  getHitDamage() {
    if (this.oneHitActive) return 99999;
    if (this.slashActive) return Math.round(PLAYER_STATS.maxHp * 1.0);

    let dmg = Math.round(PLAYER_STATS.maxHp * CONFIG.base.hitDamagePct * this.damageMult);

    // orb attack buff
    if (typeof OrbSystem !== 'undefined' && OrbSystem.hasAttackBuff()) dmg *= 2;

    // berserker ATK — bonus damage when low HP
    if (this._berserkerAtkBonus > 0 && this.hpPercent() <= this._berserkerAtkThreshold) {
      dmg = Math.round(dmg * (1 + this._berserkerAtkBonus));
    }

    // critical hit — roll happens here, flag stored for combat.js pop
    this._lastHitWasCrit = false;
    if (this._critChance > 0 && Math.random() < this._critChance) {
      dmg *= 2;
      this._lastHitWasCrit = true;
    }

    return dmg;
  }

  /* ── COMBO ──────────────────────────── */

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

    // extra slot: max charge is slots * 100
    const maxCharge = this._maxSpecialSlots * 100;
    this.specialCharge = Math.min(maxCharge, this.specialCharge + baseCharge * this.specialChargeMult);

    // vampiric — heal every X kills
    if (this._vampKillInterval > 0) {
      this._vampKillCount++;
      if (this._vampKillCount >= this._vampKillInterval) {
        this._vampKillCount = 0;
        const healAmt = Math.round(this.maxHp * this._vampHealPct);
        this.hp = Math.min(this.maxHp, this.hp + healAmt);
        if (typeof updateHpBar === 'function') updateHpBar();
        if (typeof showActionPop === 'function') {
          showActionPop('up', 'HEAL!', '#44ff66');
        }
      }
    }
  }

  /* ── SPECIAL ────────────────────────── */

  isSpecialReady() {
    return this.specialCharge >= 100 && !this.specialActive;
  }

  activateSpecial() {
    if (!this.isSpecialReady()) return false;

    this.specialActive    = true;
    this.specialCharge   -= 100;  // consume one slot worth
    this._wasSpecialReady = false;

    // ability boost — multiply duration
    this.specialTimer = this.ability.duration * this._abilityDurationMult;

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
        this.ability.onDeactivate(enemies);

        const pe = document.getElementById('player');
        if (pe) pe.classList.remove('special-active');
        const sr = document.getElementById('special-ring');
        if (sr) sr.classList.remove('active');
      }
    }
  }

}