/* ═══════════════════════════════════════
   ENEMY.JS
   Classe Enemy — stato e metodi di ogni
   nemico presente nell'arena.

   Dipende da: config.js
   Usato da: game.js, ui.js

   REGOLA: questa classe gestisce SOLO lo stato
   del nemico. Non tocca mai il DOM direttamente
   tranne per aggiornare el.style e le classi CSS
   (slowed, enemy-hit) che sono effetti visivi
   strettamente legati all'entità.

   STATO PRINCIPALE:
   - x, y         → posizione attuale in px nell'arena
   - dir          → direzione di provenienza: 'up'/'down'/'left'/'right'
   - hp / maxHp   → vita
   - speed        → velocità attuale (può essere modificata da slow/stun)
   - baseSpeed    → velocità originale (usata per ripristino dopo slow)
   - el           → elemento DOM del nemico
   - hpFill       → elemento DOM della barra HP
   - isElite      → true per tank e armor (più particelle alla morte)

   TIPI DI NEMICO (da CONFIG.enemies):
   - grunt  → 1 hit, veloce
   - tank   → 2 hit, spara proiettili
   - armor  → 3 hit, lento
   ═══════════════════════════════════════ */

class Enemy {

  /* ── COSTRUTTORE ────────────────────────
     @param def     oggetto nemico da CONFIG.enemies
     @param x, y   posizione iniziale in px
     @param dir     direzione di spawn ('up'/'down'/'left'/'right')
     @param sMult   moltiplicatore velocità del livello corrente
     @param arenaW  larghezza arena in px (per calcolo distanza)
     @param arenaH  altezza arena in px
  ─────────────────────────────────────── */
  constructor(def, x, y, dir, sMult, arenaW, arenaH) {

    // ── identità ──
    this.name  = def.name;
    this.emoji = def.emoji;
    this.size  = def.size;

    // elite = tank o armor — più particelle alla morte
    this.isElite = (def.name === 'tank' || def.name === 'armor');

    // ── vita ──
    this.maxHp = Math.round(CONFIG.player.maxHp * def.hpPct);
    this.hp    = this.maxHp;

    // ── danno da contatto ──
    this.damagePct = def.damagePct;

    // ── velocità ──
    // baseSpeed conservata per ripristino dopo slow/stun
    this.baseSpeed = CONFIG.base.enemyBaseSpeed * def.speedMult * sMult;
    this.speed     = this.baseSpeed;

    // ── punti per kill ──
    this.points = def.points;

    // ── proiettili (solo tank) ──
    this.shoots          = def.shoots          || false;
    this.shootInterval   = def.shootInterval   || 0;
    this.bulletDamagePct = def.bulletDamagePct || 0;
    this.bulletSpeed     = def.bulletSpeed     || 0;
    this.firstShotFired  = false;
    this.shootTimer      = 0;

    // ── posizione e direzione ──
    this.x   = x;
    this.y   = y;
    this.dir = dir;

    // ── distanza primo colpo ──
    // il tank spara il primo colpo a metà strada verso il centro
    const cx = arenaW / 2;
    const cy = arenaH / 2;
    const dx = cx - x;
    const dy = cy - y;
    this.spawnDist    = Math.sqrt(dx * dx + dy * dy);
    this.firstShotDist = this.spawnDist * CONFIG.bullet.firstShotDistPct;

    // ── DOM ──
    // el e hpFill vengono assegnati da game.js dopo la creazione
    this.el     = null;
    this.hpFill = null;
  }

  /* ── STATO VITA ─────────────────────────  */
  hpPercent() { return this.hp / this.maxHp; }
  isAlive()   { return this.hp > 0; }

  /* ── RICEVI DANNO ───────────────────────
     @param dmg  danno in HP assoluti
  ─────────────────────────────────────── */
  hit(dmg) {
    this.hp = Math.max(0, this.hp - dmg);
  }

  /* ── DISTANZA DAL CENTRO ────────────────
     Usata per trigger primo colpo del tank
     e per collision detection con il player.

     @param cx, cy  coordinate del centro arena
     @return        distanza in px
  ─────────────────────────────────────── */
  distToCenter(cx, cy) {
    const dx = cx - this.x;
    const dy = cy - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /* ── SLOW ───────────────────────────────
     Attivato dal Bullet Time del guerriero.
     Modifica la velocità e aggiunge classe CSS.

     @param on    true = applica slow, false = rimuovi
     @param mult  moltiplicatore velocità (es. 0.25 = 25%)
  ─────────────────────────────────────── */
  setSlowed(on, mult) {
    this.speed = on ? this.baseSpeed * mult : this.baseSpeed;
    if (this.el) this.el.classList.toggle('slowed', on);
  }

  /* ── STUN ───────────────────────────────
     Ferma il nemico per ms millisecondi.
     Attivato da abilità warrior_heavy (Colpo Pesante).
     Si ripristina automaticamente dopo la durata.

     @param ms  durata stun in millisecondi
  ─────────────────────────────────────── */
  stun(ms) {
    const prevSpeed = this.speed;
    this.speed = 0;
    if (this.el) this.el.classList.add('slowed');

    setTimeout(() => {
      // ripristina solo se ancora vivo
      if (this.isAlive()) {
        this.speed = prevSpeed;
        if (this.el) this.el.classList.remove('slowed');
      }
    }, ms);
  }

  /* ── FLASH HIT ──────────────────────────
     Lampeggio bianco quando il nemico viene colpito.
     Usa animazione CSS enemy-hit definita in style.css.
     Il reflow forzato (offsetWidth) permette di
     riavviare l'animazione anche se già in corso.
  ─────────────────────────────────────── */
  flashHit() {
    if (!this.el) return;

    // rimuovi la classe per resettare l'animazione
    this.el.classList.remove('enemy-hit');

    // reflow forzato — necessario per riavviare animazione CSS
    void this.el.offsetWidth;

    this.el.classList.add('enemy-hit');
    setTimeout(() => {
      if (this.el) this.el.classList.remove('enemy-hit');
    }, CONFIG.juice.hitFlashMs);
  }

}