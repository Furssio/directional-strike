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
const dirGateEnemies = { up: [], down: [], left: [], right: [] };

function resetAdventureSpawner() {
  dirGateEnemies.up    = [];
  dirGateEnemies.down  = [];
  dirGateEnemies.left  = [];
  dirGateEnemies.right = [];
  _advLastDirs = [];
}

function isDirFree(dir) {
  const list = dirGateEnemies[dir];

  // clean dead enemies
  for (let i = list.length - 1; i >= 0; i--) {
    if (!list[i].isAlive()) list.splice(i, 1);
  }

  // max 2 enemies per direction
  if (list.length >= 2) return false;

  // if no enemies on this line, it's free
  if (list.length === 0) return true;

  // 1 enemy on line — allow second only if first has passed the gate
  const { w, h } = getArenaSize();
  const cx       = w / 2;
  const cy       = h / 2;
  const gate     = Math.min(w, h) * 0.40;
  const dist     = list[0].distToCenter(cx, cy);

  return dist <= gate;
}
/* ── PICK DIR ───────────────────────────
   Sceglie una direzione libera casuale.
   Se nessuna è libera, non spawna.
─────────────────────────────────────── */
let _advLastDirs = [];

function resetAdventureSpawnerHistory() {
  _advLastDirs = [];
}

function pickDirAdventure() {
  const dirs = ['up', 'down', 'left', 'right'];
  const free = dirs.filter(d => isDirFree(d));
  if (free.length === 0) return null;

  // avoid repeating last 2 directions
  let candidates = free.filter(d => !_advLastDirs.includes(d));
  if (candidates.length === 0) candidates = free;

  const pick = candidates[Math.floor(Math.random() * candidates.length)];

  _advLastDirs.push(pick);
  if (_advLastDirs.length > 2) _advLastDirs.shift();

  return pick;
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

  // don't spawn if potential kills from alive enemies cover remaining kills
  const killsNeeded = AdventureDirector.getKillsNeeded();
  const killsLeft = killsNeeded - AdventureDirector.getKills();
  let potentialKills = 0;
  for (const e of enemies) {
    if (e.def.onDeath) potentialKills += 3;
    else potentialKills += 1;
  }
  if (potentialKills >= killsLeft) return;

  const dir = pickDirAdventure();
  if (!dir) return;

  // count enemies of each type on this direction
  const typeCounts = {};
  for (const e of enemies) {
    if (e.dir === dir) {
      typeCounts[e.name] = (typeCounts[e.name] || 0) + 1;
    }
  }

  // filter pool: max 2 of same type per direction
  const filtered = pool.filter(name => (typeCounts[name] || 0) < 2);
  if (filtered.length === 0) return;

  const enemyName = filtered[Math.floor(Math.random() * filtered.length)];
  const def       = EnemyRegistry.get(enemyName);
  if (!def) return;

 spawnEnemyDirected(def, dir);

  // registra il nemico spawnato in questa direzione
  dirGateEnemies[dir].push(enemies[enemies.length - 1]);
}