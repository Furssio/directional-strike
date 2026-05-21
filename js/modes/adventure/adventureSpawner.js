/* ═══════════════════════════════════════
   ADVENTURESPAWNER.JS
   Enemy spawning for Adventure Mode.

   === HOW THE SPAWN SYSTEM WORKS ===

   This file handles WHERE enemies spawn.
   The adventureDirector decides WHEN and
   WHAT pattern (combo) to use.

   GATE SYSTEM:
   Each direction (up/down/left/right) has
   a "gate". A gate tracks which enemies
   were spawned from that direction.
   A direction is "free" when:
   - it has fewer alive enemies than maxPerDirection
   - the last enemy spawned has crossed the
     gate threshold (moved close enough to center)

   DIRECTION COOLDOWN:
   After spawning from a direction, that
   direction goes on cooldown (can't spawn
   again for X ms). This prevents the same
   side from being spammed repeatedly.
   Cooldown is configurable per wave.

   DIRECTION PICKING:
   The combo system in adventureDirector
   requests directions with specific rules:
   - 'any':      any free direction
   - 'opposite': two opposite dirs (up+down or left+right)
   - 'adjacent': two adjacent dirs (up+right, down+left, etc.)
   - 'spread3':  three directions
   - 'all':      all four directions

   ANTI-REPETITION:
   The system tracks the last 2 directions
   used and avoids them when possible.
   This creates natural variety.

   Used by: modes/adventure/adventureDirector.js
   Depends on: state.js, config.js,
               systems/spawn.js
   ═══════════════════════════════════════ */

// ── GATE SYSTEM ────────────────────────
// Tracks enemies spawned per direction
const dirGateEnemies = { up: [], down: [], left: [], right: [] };

// ── DIRECTION COOLDOWNS ────────────────
// Timestamp (ms) when each direction becomes free again
const _dirCooldownUntil = { up: 0, down: 0, left: 0, right: 0 };

// ── ANTI-REPETITION ────────────────────
// Last 2 directions used, to avoid repeating
let _advLastDirs = [];

// ── OPPOSITE / ADJACENT MAPS ───────────
const _oppositeDirs = { up: 'down', down: 'up', left: 'right', right: 'left' };
const _adjacentDirs = {
  up:    ['left', 'right'],
  down:  ['left', 'right'],
  left:  ['up', 'down'],
  right: ['up', 'down'],
};

/* ── RESET ──────────────────────────────
   Called at start of each wave.
   Clears all tracking data.
───────────────────────────────────────── */
function resetAdventureSpawner() {
  dirGateEnemies.up    = [];
  dirGateEnemies.down  = [];
  dirGateEnemies.left  = [];
  dirGateEnemies.right = [];
  _dirCooldownUntil.up    = 0;
  _dirCooldownUntil.down  = 0;
  _dirCooldownUntil.left  = 0;
  _dirCooldownUntil.right = 0;
  _advLastDirs = [];
}

/* ── IS DIRECTION FREE ──────────────────
   A direction is free when:
   1. Its cooldown has expired
   2. It has fewer alive enemies than maxPerDirection
   3. The last enemy spawned has passed the gate threshold

   Returns true/false.
───────────────────────────────────────── */
function isDirFree(dir) {
  // check cooldown first
  if (performance.now() < _dirCooldownUntil[dir]) return false;

  const list = dirGateEnemies[dir];

  // clean dead enemies from tracking
  for (let i = list.length - 1; i >= 0; i--) {
    if (!list[i].isAlive()) list.splice(i, 1);
  }

  // max enemies per direction (configurable per map)
  const map = ActiveDirector.getCurrentMap ? ActiveDirector.getCurrentMap() : null;
  const maxPerDir = (map && map.maxPerDirection) || 4;
  if (list.length >= maxPerDir) return false;

  // if no enemies on this line, it's free
  if (list.length === 0) return true;

  // allow next spawn only if the LAST enemy
  // has passed the gate threshold (moved close to center)
  const { w, h } = getArenaSize();
  const cx       = w / 2;
  const cy       = h / 2;
  const mapGate  = (map && map.gateThreshold !== undefined) ? map.gateThreshold : 0.40;
  const gate     = Math.min(w, h) * mapGate;
  const last     = list[list.length - 1];
  const dist     = last.distToCenter(cx, cy);

  return dist <= gate;
}

/* ── SET DIRECTION COOLDOWN ─────────────
   After spawning from a direction, block
   it for cooldownMs milliseconds.
   Called by adventureDirector after each spawn.
───────────────────────────────────────── */
function setDirCooldown(dir, cooldownMs) {
  _dirCooldownUntil[dir] = performance.now() + cooldownMs;
}

/* ── PICK SINGLE FREE DIRECTION ─────────
   Returns one random free direction,
   avoiding the last 2 used directions.
   Returns null if none are free.
───────────────────────────────────────── */
function pickDirAdventure() {
  const dirs = ['up', 'down', 'left', 'right'];
  const free = dirs.filter(d => isDirFree(d));
  if (free.length === 0) return null;

  // prefer directions not recently used
  let candidates = free.filter(d => !_advLastDirs.includes(d));
  if (candidates.length === 0) candidates = free;

  const pick = candidates[Math.floor(Math.random() * candidates.length)];

  _advLastDirs.push(pick);
  if (_advLastDirs.length > 2) _advLastDirs.shift();

  return pick;
}

/* ── PICK OPPOSITE PAIR ─────────────────
   Returns [dir1, dir2] where dir2 is
   opposite to dir1 (up+down or left+right).
   Both must be free. Returns null if
   no opposite pair is available.

   Example: returns ['up', 'down'] or ['left', 'right']
───────────────────────────────────────── */
function pickDirOpposite() {
  const pairs = [['up', 'down'], ['left', 'right']];
  // shuffle pairs to avoid always picking same axis
  if (Math.random() > 0.5) pairs.reverse();

  for (const pair of pairs) {
    if (isDirFree(pair[0]) && isDirFree(pair[1])) {
      // prefer pair that doesn't repeat last dirs
      _advLastDirs.push(pair[0], pair[1]);
      if (_advLastDirs.length > 4) _advLastDirs.splice(0, _advLastDirs.length - 2);
      return pair;
    }
  }
  return null;
}

/* ── PICK ADJACENT PAIR ─────────────────
   Returns [dir1, dir2] where dir2 is
   adjacent to dir1 (up+right, down+left, etc.)
   Both must be free. Returns null if none.

   Example: returns ['up', 'right'] or ['down', 'left']
───────────────────────────────────────── */
function pickDirAdjacent() {
  const dirs = ['up', 'down', 'left', 'right'];
  // shuffle to randomize
  for (let i = dirs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
  }

  for (const d of dirs) {
    if (!isDirFree(d)) continue;
    const adj = _adjacentDirs[d];
    // shuffle adjacents too
    const adjShuffled = Math.random() > 0.5 ? [adj[0], adj[1]] : [adj[1], adj[0]];
    for (const a of adjShuffled) {
      if (isDirFree(a)) {
        _advLastDirs.push(d, a);
        if (_advLastDirs.length > 4) _advLastDirs.splice(0, _advLastDirs.length - 2);
        return [d, a];
      }
    }
  }
  return null;
}

/* ── PICK 3 DIRECTIONS ──────────────────
   Returns [dir1, dir2, dir3] — any 3
   free directions. Returns null if
   fewer than 3 are free.
───────────────────────────────────────── */
function pickDir3() {
  const dirs = ['up', 'down', 'left', 'right'];
  const free = dirs.filter(d => isDirFree(d));
  if (free.length < 3) return null;

  // shuffle and pick first 3
  for (let i = free.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [free[i], free[j]] = [free[j], free[i]];
  }
  const picked = free.slice(0, 3);
  _advLastDirs = picked.slice(-2);
  return picked;
}

/* ── PICK ALL 4 DIRECTIONS ──────────────
   Returns ['up','down','left','right']
   only if ALL 4 are free. Otherwise null.
───────────────────────────────────────── */
function pickDirAll() {
  const dirs = ['up', 'down', 'left', 'right'];
  if (dirs.every(d => isDirFree(d))) {
    _advLastDirs = [];
    return dirs;
  }
  return null;
}

/* ── REGISTER SPAWNED ENEMY ─────────────
   After spawning an enemy, call this to
   register it in the gate tracking system.
   Called by adventureDirector after each
   spawnEnemyDirected() call.
───────────────────────────────────────── */
function registerSpawnedEnemy(dir) {
  const enemy = enemies[enemies.length - 1];
  if (enemy) dirGateEnemies[dir].push(enemy);
}

/* ── BUILD ENEMY POOL (legacy) ──────────
   Returns weighted enemy pool for maps
   that still use the old enemyPool format.
   New waves should use waveConfig.pool.
───────────────────────────────────────── */
function buildEnemyPoolForMap(wave, map, isBoss) {
  // intro waves override
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

/* ── FALLBACK SPAWN (legacy) ────────────
   Used when a wave has NO combos defined.
   Spawns 1 enemy from 1 random direction.
   This is the old behavior — keeps
   backward compatibility with existing
   waveConfigs that don't have combos yet.
───────────────────────────────────────── */
function spawnGroupForMap(state, wave, map, isBoss) {
  if (!running) return;

  const d    = CONFIG.director;
  const pool = buildEnemyPoolForMap(wave, map, isBoss);
  if (pool.length === 0) return;

  const boss = (isBoss && map.boss) ? map.boss : null;
  const isIntro = !isBoss && map.introWaves && map.introWaves[wave];

  const maxEnemies = (boss && boss.maxEnemies !== undefined)
    ? boss.maxEnemies
    : isIntro
      ? 3
      : (map.maxEnemies !== undefined)
        ? map.maxEnemies
        : Math.min(d.maxEnemiesCap, Math.floor(d.maxEnemiesBase + wave * d.maxEnemiesPerWave));

  if (enemies.length >= maxEnemies) return;

  let dir = pickDirAdventure();

  // fallback: if all dirs gate-blocked and field nearly empty
  if (!dir && enemies.length < (map.minEnemiesAlive || 2)) {
    const dirs = ['up', 'down', 'left', 'right'];
    const fallback = dirs.filter(d => {
      const list = dirGateEnemies[d];
      let alive = 0;
      for (const e of list) { if (e.isAlive()) alive++; }
      return alive < 2;
    });
    if (fallback.length > 0) {
      let fbCandidates = fallback.filter(d => !_advLastDirs.includes(d));
      if (fbCandidates.length === 0) fbCandidates = fallback;
      dir = fbCandidates[Math.floor(Math.random() * fbCandidates.length)];
      _advLastDirs.push(dir);
      if (_advLastDirs.length > 2) _advLastDirs.shift();
    }
  }
  if (!dir) return;

  const typeCounts = {};
  for (const e of enemies) {
    if (e.dir === dir) {
      typeCounts[e.name] = (typeCounts[e.name] || 0) + 1;
    }
  }

  const filtered = pool.filter(name => (typeCounts[name] || 0) < 2);
  if (filtered.length === 0) return;

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
  dirGateEnemies[dir].push(enemies[enemies.length - 1]);
}