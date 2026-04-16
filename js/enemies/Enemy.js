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

    // ── contact damage ──
    this.damagePct = def.damagePct;

    // ── speed ──
    this.baseSpeed = CONFIG.base.enemyBaseSpeed * def.speedMult * sMult;
    this.speed     = this.baseSpeed;

    // ── points ──
    this.points = def.points;

    // ── bullets (crusher only) ──
    this.shoots          = def.shoots          || false;
    this.shootInterval   = def.shootInterval   || 0;
    this.bulletDamagePct = def.bulletDamagePct || 0;
    this.bulletSpeed     = def.bulletSpeed     || 0;
    this.firstShotFired  = false;
    this.shootTimer      = 0;

// ── points ── dopo questa riga
this.points = def.points;

// aggiungi queste 3 sezioni:

// ── split on death (slime) ──
this.splitInto  = def.splitInto  || null;
this.splitCount = def.splitCount || 0;

// ── multi-hit contact damage ──
this.contactHits = def.contactHits || 1;

// ── wobble movement ──
this.wobble     = def.wobble || null;
this.wobbleTime = 0;

    // ── position and direction ──
    this.x   = x;
    this.y   = y;
    this.dir = dir;

    // ── first shot distance ──
    const cx = arenaW / 2;
    const cy = arenaH / 2;
    const dx = cx - x;
    const dy = cy - y;
    this.spawnDist     = Math.sqrt(dx * dx + dy * dy);
    this.firstShotDist = this.spawnDist * CONFIG.bullet.firstShotDistPct;

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

}