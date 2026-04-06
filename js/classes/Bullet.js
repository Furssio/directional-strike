/* ═══════════════════════════════════════
   BULLET.JS
   Classe Bullet — rappresenta un proiettile
   sparato dal nemico tank verso il player.

   Dipende da: config.js
   Usato da: game.js (spawnBullet, tick)

   REGOLA: classe volutamente minimale.
   Contiene solo dati di stato — posizione,
   velocità e danno. Tutta la logica di
   movimento e collisione è in game.js.

   CICLO DI VITA:
   1. Creato da spawnBullet() in game.js
   2. el (DOM) assegnato subito dopo la creazione
   3. Mosso ogni tick aggiornando x, y e el.style
   4. Rimosso quando esce dall'arena o colpisce il player
   ═══════════════════════════════════════ */

class Bullet {

  /* ── COSTRUTTORE ────────────────────────
     @param x, y    posizione iniziale (spawn dal nemico)
     @param vx, vy  velocità in px/tick verso il centro
     @param dmgPct  danno come % del maxHp del player
  ─────────────────────────────────────── */
  constructor(x, y, vx, vy, dmgPct) {

    // ── posizione attuale ──
    this.x = x;
    this.y = y;

    // ── velocità (direzione + intensità) ──
    // calcolata in spawnBullet() normalizzando
    // il vettore verso il centro dell'arena
    this.vx = vx;
    this.vy = vy;

    // ── danno al player in caso di hit ──
    this.damagePct = dmgPct;

    // ── elemento DOM ──
    // assegnato da game.js subito dopo new Bullet()
    this.el = null;
  }

}