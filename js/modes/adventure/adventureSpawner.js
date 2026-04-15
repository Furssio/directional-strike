/* ═══════════════════════════════════════
   ADVENTURESPAWNER.JS
   Enemy spawning for Adventure Mode.
   Reads enemy pool from the current map
   (or boss config if it's a boss wave).

   Reuses from modes/infinite/spawner.js:
   - dirCooldowns, resetSpawnerCooldowns
   - updateSpawnerCooldowns, pickDir
   - getSpawnInterval

   Used by: modes/adventure/adventureDirector.js
   Depends on: state.js, config.js,
               systems/spawn.js,
               modes/infinite/spawner.js (reused functions)
   ═══════════════════════════════════════ */

/* ── BUILD ENEMY POOL ───────────────────
   Returns enemy types for current wave.
   On boss wave, uses boss.enemyPool.
   Otherwise uses map.enemyPool.
─────────────────────────────────────── */
function buildEnemyPoolForMap(wave, map, isBoss) {
  const poolSrc = (isBoss && map.boss && map.boss.enemyPool)
    ? map.boss.enemyPool
    : map.enemyPool;

  const pool = [];

  for (const [name, cfg] of Object.entries(poolSrc)) {
    const fromWave = cfg.fromWave !== undefined ? cfg.fromWave : 1;
    if (wave >= fromWave) {
      for (let i = 0; i < cfg.weight; i++) {
        pool.push(name);
      }
    }
  }

  return pool;
}

/* ── SPAWN GROUP FOR MAP ────────────────
   Spawns a group of enemies for the
   current wave/state. Boss waves can
   override group size and enemy cap.

   @param state    'fast' / 'normal' / 'slow'
   @param wave     current wave number
   @param map      map definition
   @param isBoss   true if boss wave
─────────────────────────────────────── */
function spawnGroupForMap(state, wave, map, isBoss) {
  if (!running) return;

  const d    = CONFIG.director;
  const pool = buildEnemyPoolForMap(wave, map, isBoss);
  if (pool.length === 0) return;

  const boss = (isBoss && map.boss) ? map.boss : null;

  // group size: boss override > director state default
  let groupSize;
  if (boss && boss.groupSize !== undefined) {
    groupSize = boss.groupSize;
  } else if (state === 'fast') {
    groupSize = d.groupSizeFast;
  } else if (state === 'slow') {
    groupSize = d.groupSizeSlow;
  } else {
    groupSize = d.groupSizeNormal;
  }

  // max enemies in arena: boss override > formula
  const maxEnemies = (boss && boss.maxEnemies !== undefined)
    ? boss.maxEnemies
    : Math.min(d.maxEnemiesCap, Math.floor(d.maxEnemiesBase + wave * d.maxEnemiesPerWave));

  const toSpawn = enemies.length === 0
    ? Math.min(groupSize, maxEnemies)
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