/* ═══════════════════════════════════════
   ENEMY.JS
   Enemy class — state and methods for
   every enemy in the arena.

   Used by: systems/spawn.js, systems/loop.js
   Depends on: config.js
   ═══════════════════════════════════════ */

class Enemy {

  constructor(def, x, y, dir, sMult, arenaW, arenaH) {

    // ── identity ──
    this.def   = def;
    this.name  = def.id;
    this.emoji = def.emoji;
    this.size  = def.size;

    this.isElite = (def.id === 'crusher' || def.id === 'golem');

    // ── hp ──
    this.maxHp = Math.round(CONFIG.player.maxHp * def.hpPct);
    this.hp    = this.maxHp;

    // ── damage ──
    this.damagePct   = def.damagePct;
    this.contactHits = def.contactHits || 1;

    // ── speed ──
    this.baseSpeed = CONFIG.base.enemyBaseSpeed * def.speedMult * sMult;
    this.speed     = this.baseSpeed;

    // ── points ──
    this.points = def.points;

    // ── wobble movement ──
    this.wobble     = def.wobble || null;
    this.wobbleTime = 0;

    // ── bullet state (used by crusher via onTick) ──
    this.hasBullet      = false;
    this.firstShotFired = false;
    this.bulletSpeed    = def.bulletSpeed     || 0;
    this.bulletDamagePct= def.bulletDamagePct || 0;

    const cx = arenaW / 2;
    const cy = arenaH / 2;
    const dx = cx - x;
    const dy = cy - y;
    this.spawnDist     = Math.sqrt(dx * dx + dy * dy);
    this.firstShotDist = this.spawnDist * CONFIG.bullet.firstShotDistPct;

    // ── position and direction ──
    this.x   = x;
    this.y   = y;
    this.dir = dir;

    // ── DOM ──
    this.el     = null;
    this.hpFill = null;
  }

  hpPercent() { return this.hp / this.maxHp; }
  isAlive()   { return this.hp > 0; }

  hit(dmg) {
    this.hp = Math.max(0, this.hp - dmg);
  }

  distToCenter(cx, cy) {
    const dx = cx - this.x;
    const dy = cy - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  setSlowed(on, mult) {
    this.speed = on ? this.baseSpeed * mult : this.baseSpeed;
    if (this.el) this.el.classList.toggle('slowed', on);
  }

  stun(ms) {
    const prevSpeed = this.speed;
    this.speed = 0;
    if (this.el) this.el.classList.add('slowed');

    setTimeout(() => {
      if (this.isAlive()) {
        this.speed = prevSpeed;
        if (this.el) this.el.classList.remove('slowed');
      }
    }, ms);
  }

  flashHit() {
    if (!this.el) return;
    this.el.classList.remove('enemy-hit');
    void this.el.offsetWidth;
    this.el.classList.add('enemy-hit');
    setTimeout(() => {
      if (this.el) this.el.classList.remove('enemy-hit');
    }, CONFIG.juice.hitFlashMs);
  }

  /* ── FREEZE WITH TIMED THAW ── */

  freeze(duration) {
    if (this.frozen) return;
    this.frozen = true;
    this._frozenSpeed = this.speed;
    this.speed = 0;
    if (this.el) this.el.classList.add('frozen');

    // crack shake at 35% and 70% of duration
    const crack1 = Math.round(duration * 0.35);
    const crack2 = Math.round(duration * 0.70);

    this._freezeTimers = [];

    this._freezeTimers.push(setTimeout(() => {
      this._freezeCrack();
    }, crack1));

    this._freezeTimers.push(setTimeout(() => {
      this._freezeCrack();
    }, crack2));

    // thaw at end
    this._freezeTimers.push(setTimeout(() => {
      this._thaw();
    }, duration));
  }

  _freezeCrack() {
    if (!this.el || !this.frozen) return;

    // mini-shake
    this.el.classList.remove('freeze-crack');
    void this.el.offsetWidth;
    this.el.classList.add('freeze-crack');
    setTimeout(() => {
      if (this.el) this.el.classList.remove('freeze-crack');
    }, 300);

    // ice pixel particles
    for (let i = 0; i < 4; i++) {
      const p = document.createElement('div');
      p.className = 'ice-particle';
      const ox = (Math.random() - 0.5) * this.size * 0.8;
      const oy = (Math.random() - 0.5) * this.size * 0.8;
      p.style.left = (this.x + ox) + 'px';
      p.style.top  = (this.y + oy) + 'px';
      arena.appendChild(p);
      setTimeout(() => p.remove(), 500);
    }
  }

  _thaw() {
    if (!this.frozen) return;
    this.frozen = false;
    this._freezeTimers = [];

    if (this.el) {
      this.el.classList.remove('frozen', 'freeze-crack');
    }

    // reset to base speed — loses any custom state (wolf accel, oni boost, etc.)
    this.speed = this.baseSpeed;

    // thaw particles burst
    if (this.el) {
      for (let i = 0; i < 6; i++) {
        const p = document.createElement('div');
        p.className = 'ice-particle ice-particle-burst';
        const ox = (Math.random() - 0.5) * this.size;
        const oy = (Math.random() - 0.5) * this.size;
        p.style.left = (this.x + ox) + 'px';
        p.style.top  = (this.y + oy) + 'px';
        arena.appendChild(p);
        setTimeout(() => p.remove(), 600);
      }
    }
  }

  clearFreeze() {
    // cleanup when enemy dies while frozen
    if (this._freezeTimers) {
      this._freezeTimers.forEach(t => clearTimeout(t));
      this._freezeTimers = [];
    }
    this.frozen = false;
  }

}