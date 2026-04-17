/* ═══════════════════════════════════════
   ADVENTURESPAWNER.JS
   Enemy spawning for Adventure Mode.
   Reads enemy pool from the current map
   (or boss config if it's a boss wave).

   Direction unlock: a direction is free
   when the last enemy spawned from it
   has crossed the gate threshold
   (arenaSize * 0.25 from center).

   Used by: modes/adventure/adventureDirector.js
   Depends on: state.js, config.js,
               systems/spawn.js,
               modes/infinite/spawner.js (reused functions)
   ═══════════════════════════════════════ */

// ultimo nemico spawnato per direzione — null = direzione libera
const dirGateEnemy = { up: null, down: null, left: null, right: null };

function resetAdventureSpawner() {
  dirGateEnemy.up    = null;
  dirGateEnemy.down  = null;
  dirGateEnemy.left  = null;
  dirGateEnemy.right = null;
}

/* ── IS DIR FREE ────────────────────────
   Direzione libera se:
   - nessun nemico registrato, oppure
   - il nemico è morto, oppure
   - il nemico ha superato la soglia
─────────────────────────────────────── */
function isDirFree(dir) {
  const e = dirGateEnemy[dir];
  if (!e) return true;
  if (!e.isAlive()) { dirGateEnemy[dir] = null; return true; }

  const { w, h } = getArenaSize();
  const cx       = w / 2;
  const cy       = h / 2;
  const gate = Math.min(w, h) * 0.40;
  const dist     = e.distToCenter(cx, cy);

  if (dist <= gate) { dirGateEnemy[dir] = null; return true; }
  return false;
}

/* ── PICK DIR ───────────────────────────
   Sceglie una direzione libera casuale.
   Se nessuna è libera, non spawna.
─────────────────────────────────────── */
function pickDirAdventure() {
  const dirs = ['up', 'down', 'left', 'right'];
  const free = dirs.filter(d => isDirFree(d));
  if (free.length === 0) return null;
  return free[Math.floor(Math.random() * free.length)];
}

/* ── BUILD ENEMY POOL ───────────────────
   Returns enemy types for current wave.
─────────────────────────────────────── */
function buildEnemyPoolForMap(wave, map, isBoss) {
  const poolSrc = (isBoss && map.boss && map.boss.enemyPool)
    ? map.boss.enemyPool
    : map.enemyPool;

  const pool = [];
  for (const [name, cfg] of Object.entries(poolSrc)) {
    const fromWave = cfg.fromWave !== undefined ? cfg.fromWave : 1;
    if (wave >= fromWave) {
      for (let i = 0; i < cfg.weight; i++) pool.push(name);
    }
  }
  return pool;
}

/* ── SPAWN GROUP FOR MAP ────────────────
   Spawna un nemico alla volta, solo se
   la direzione è libera (gate system).
─────────────────────────────────────── */
function spawnGroupForMap(state, wave, map, isBoss) {
  if (!running) return;

  const d    = CONFIG.director;
  const pool = buildEnemyPoolForMap(wave, map, isBoss);
  if (pool.length === 0) return;

  const boss = (isBoss && map.boss) ? map.boss : null;

  const maxEnemies = (boss && boss.maxEnemies !== undefined)
    ? boss.maxEnemies
    : Math.min(d.maxEnemiesCap, Math.floor(d.maxEnemiesBase + wave * d.maxEnemiesPerWave));

  if (enemies.length >= maxEnemies) return;

  const dir = pickDirAdventure();
  if (!dir) return;

  const enemyName = pool[Math.floor(Math.random() * pool.length)];
  const def       = EnemyRegistry.get(enemyName);
  if (!def) return;

  spawnEnemyDirected(def, dir);

  // registra l'ultimo nemico spawnato da questa direzione
  dirGateEnemy[dir] = enemies[enemies.length - 1];
}