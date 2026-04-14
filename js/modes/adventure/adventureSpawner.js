/* ═══════════════════════════════════════
   ADVENTURESPAWNER.JS
   Enemy spawning for Adventure Mode.
   Reads enemy pool from the current map
   instead of global CONFIG.

   Reuses from modes/infinite/spawner.js:
   - dirCooldowns, resetSpawnerCooldowns
   - updateSpawnerCooldowns, pickDir
   - getSpawnInterval

   Used by: modes/adventure/adventureDirector.js
   Depends on: state.js, config.js,
               systems/spawn.js,
               modes/infinite/spawner.js (reused functions)
   ═══════════════════════════════════════ */

/* ── BUILD ENEMY POOL FROM MAP ──────────
   Returns available enemy types for
   current wave based on the map's pool.
   @param wave  current wave number
   @param map   map definition from MapRegistry
─────────────────────────────────────── */
function buildEnemyPoolForMap(wave, map) {
  const pool = [];
  const ep   = map.enemyPool;

  for (const [name, cfg] of Object.entries(ep)) {
    if (wave >= cfg.fromWave) {
      for (let i = 0; i < cfg.weight; i++) {
        pool.push(name);
      }
    }
  }

  return pool;
}

/* ── SPAWN GROUP FOR MAP ────────────────
   Spawns a group of enemies based on
   current director state and map pool.
   @param state  'fast' / 'normal' / 'slow'
   @param wave   current wave number
   @param map    map definition
─────────────────────────────────────── */
function spawnGroupForMap(state, wave, map) {
  if (!running || choosingAbility) return;

  const d    = CONFIG.director;
  const pool = buildEnemyPoolForMap(wave, map);
  if (pool.length === 0) return;

  let groupSize;
  if (state === 'fast')      groupSize = d.groupSizeFast;
  else if (state === 'slow') groupSize = d.groupSizeSlow;
  else                       groupSize = d.groupSizeNormal;

  const maxEnemies = Math.min(
    d.maxEnemiesCap,
    Math.floor(d.maxEnemiesBase + wave * d.maxEnemiesPerWave)
  );

  const toSpawn = enemies.length === 0
    ? 1
    : Math.min(groupSize, Math.max(0, maxEnemies - enemies.length));

  for (let i = 0; i < toSpawn; i++) {
    const enemyName = pool[Math.floor(Math.random() * pool.length)];
    const def       = EnemyRegistry.get(enemyName);
    const dir       = pickDir();

    dirCooldowns[dir] = CONFIG.spawn.dirCooldownMs;

    setTimeout(() => {
      if (running) spawnEnemyDirected(def, dir);
    }, i * CONFIG.spawn.groupSpawnDelay);
  }
}