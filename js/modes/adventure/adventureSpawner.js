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

  // max enemies per direction (configurable per map)
  const map = ActiveDirector.getCurrentMap ? ActiveDirector.getCurrentMap() : null;
  const maxPerDir = (map && map.maxPerDirection) || 4;
  if (list.length >= maxPerDir) return false;

  // if no enemies on this line, it's free
  if (list.length === 0) return true;

  // allow next spawn only if the LAST spawned enemy
  // has passed the gate threshold
  const { w, h } = getArenaSize();
  const cx       = w / 2;
  const cy       = h / 2;
  const mapGate = (map && map.gateThreshold !== undefined) ? map.gateThreshold : 0.40;
const gate = Math.min(w, h) * mapGate;
  const last     = list[list.length - 1];
  const dist     = last.distToCenter(cx, cy);

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
  // intro waves override — tutorial with specific enemies
  if (!isBoss && map.introWaves && map.introWaves[wave]) {
    return map.introWaves[wave].pool.slice();
  }

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

  // intro waves: low cap for calm pacing
  const isIntro = !isBoss && map.introWaves && map.introWaves[wave];

  const maxEnemies = (boss && boss.maxEnemies !== undefined)
    ? boss.maxEnemies
    : isIntro
      ? 3
      : (map.maxEnemies !== undefined)
        ? map.maxEnemies
        : Math.min(d.maxEnemiesCap, Math.floor(d.maxEnemiesBase + wave * d.maxEnemiesPerWave));

  if (enemies.length >= maxEnemies) return;

  // don't overspawn near end of wave — only check in last few waves
  if (wave >= 12) {
    const killsNeeded = AdventureDirector.getKillsNeeded();
    const killsLeft = killsNeeded - AdventureDirector.getKills();
    let potentialKills = 0;
    for (const e of enemies) {
      if (e.def.onDeath) potentialKills += 3;
      else potentialKills += 1;
    }
    if (potentialKills >= killsLeft) return;
  }

  // try gate-respecting direction first
  let dir = pickDirAdventure();

  // FALLBACK: if all dirs are gate-blocked and field is nearly empty,
  // force a random free direction ignoring the gate threshold
  // FALLBACK: if all dirs are gate-blocked and field is nearly empty,
  // force a random free direction ignoring the gate threshold
  if (!dir && enemies.length < (map.minEnemiesAlive || 2)) {
    const dirs = ['up', 'down', 'left', 'right'];
    // pick any direction that has < 2 alive enemies (ignore gate distance)
    const fallback = dirs.filter(d => {
      const list = dirGateEnemies[d];
      let alive = 0;
      for (const e of list) { if (e.isAlive()) alive++; }
      return alive < 2;
    });
    if (fallback.length > 0) {
      // anti-ripetizione: evita ultime 2 dir usate anche nel fallback
      let fbCandidates = fallback.filter(d => !_advLastDirs.includes(d));
      if (fbCandidates.length === 0) fbCandidates = fallback;
      dir = fbCandidates[Math.floor(Math.random() * fbCandidates.length)];
      _advLastDirs.push(dir);
      if (_advLastDirs.length > 2) _advLastDirs.shift();
    }
  }
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

  // filter by maxInField — limit total alive per type
  let finalPool = filtered;
  if (map.maxInField) {
    const fieldCounts = {};
    for (const e of enemies) {
      fieldCounts[e.name] = (fieldCounts[e.name] || 0) + 1;
    }
    finalPool = filtered.filter(name => {
      const cap = map.maxInField[name];
      if (cap === undefined) return true;
      return (fieldCounts[name] || 0) < cap;
    });
    if (finalPool.length === 0) return;
  }
 const enemyName = finalPool[Math.floor(Math.random() * finalPool.length)];
  const def       = EnemyRegistry.get(enemyName);
  if (!def) return;

  spawnEnemyDirected(def, dir);

  // registra il nemico spawnato in questa direzione
  dirGateEnemies[dir].push(enemies[enemies.length - 1]);
}