/* ═══════════════════════════════════════
   SPAWNER.JS
   Enemy pool, direction picking and
   group spawn logic for Infinite Mode.

   Used by: director.js
   Depends on: state.js, config.js,
               systems/spawn.js, waves.js
   ═══════════════════════════════════════ */

const dirCooldowns    = { up: 0, down: 0, left: 0, right: 0 };
const DIR_COOLDOWN_MS = 1200;

/* ── RESET ──────────────────────────────
   Called on init to reset cooldowns.    */
function resetSpawnerCooldowns() {
  dirCooldowns.up = dirCooldowns.down = dirCooldowns.left = dirCooldowns.right = 0;
}

/* ── UPDATE COOLDOWNS ───────────────────
   Called every tick.
   @param dt  delta time in ms           */
function updateSpawnerCooldowns(dt) {
  for (const dir of ['up', 'down', 'left', 'right']) {
    dirCooldowns[dir] = Math.max(0, dirCooldowns[dir] - dt);
  }
}

/* ── BUILD ENEMY POOL ───────────────────
   Returns available enemy types for
   current wave based on fromWave/weight. */
function buildEnemyPool(wave) {
  const pool = [];
  const ep   = CONFIG.director.enemyPool;

  for (const [name, cfg] of Object.entries(ep)) {
    if (wave >= cfg.fromWave) {
      for (let i = 0; i < cfg.weight; i++) {
        pool.push(name);
      }
    }
  }

  return pool;
}

/* ── PICK DIRECTION ─────────────────────
   Picks an available side (cooldown = 0).
   If all on cooldown picks the lowest.  */
function pickDir() {
  const dirs      = ['up', 'down', 'left', 'right'];
  const available = dirs.filter(d => dirCooldowns[d] <= 0);

  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }

  return dirs.reduce((a, b) => dirCooldowns[a] < dirCooldowns[b] ? a : b);
}

/* ── GET SPAWN INTERVAL ─────────────────
   Returns ms until next spawn group
   based on director state.
   @param state  'fast' / 'normal' / 'slow' */
function getSpawnInterval(state) {
  const d = CONFIG.director;
  if (state === 'fast') return d.spawnIntervalFast;
  if (state === 'slow') return d.spawnIntervalSlow;
  return d.spawnIntervalNormal;
}

/* ── SPAWN GROUP ────────────────────────
   Spawns a group of enemies based on
   current director state.
   @param state  'fast' / 'normal' / 'slow'
   @param wave   current wave number       */
function spawnGroup(state, wave) {
  if (!running || choosingAbility) return;

  const d    = CONFIG.director;
  const pool = buildEnemyPool(wave);
  if (pool.length === 0) return;

  let groupSize;
  if (state === 'fast')      groupSize = d.groupSizeFast;
  else if (state === 'slow') groupSize = d.groupSizeSlow;
  else                       groupSize = d.groupSizeNormal;

  const maxEnemies = Math.min(
    d.maxEnemiesCap,
    Math.floor(d.maxEnemiesBase + wave * d.maxEnemiesPerWave)
  );

  const toSpawn = Math.min(groupSize, Math.max(0, maxEnemies - enemies.length));

  for (let i = 0; i < toSpawn; i++) {
    const enemyName = pool[Math.floor(Math.random() * pool.length)];
    const def = EnemyRegistry.get(enemyName);
    const dir       = pickDir();

    dirCooldowns[dir] = DIR_COOLDOWN_MS;

    setTimeout(() => {
      if (running) spawnEnemyDirected(def, dir);
    }, i * 180);
  }
}