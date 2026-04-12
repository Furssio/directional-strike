/* ═══════════════════════════════════════
   BULLET.JS
   Bullet class — projectile fired by
   Crusher toward the player.

   Used by: systems/spawn.js, systems/loop.js
   Depends on: nothing
   ═══════════════════════════════════════ */

class Bullet {

  constructor(x, y, vx, vy, dmgPct) {
    this.x         = x;
    this.y         = y;
    this.vx        = vx;
    this.vy        = vy;
    this.damagePct = dmgPct;
    this.el        = null;
  }

}