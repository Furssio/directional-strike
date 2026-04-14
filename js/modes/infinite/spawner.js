/* ═══════════════════════════════════════
   SPAWNER.JS
   Enemy pool, direction picking and
   group spawn logic for Infinite Mode.

   Used by: director.js
   Depends on: state.js, config.js,
               systems/spawn.js, waves.js
   ═══════════════════════════════════════ */

const dirCooldowns = { up: 0, down: 0, left: 0, right: 0 };

function resetSpawnerCooldowns() {
  dirCooldowns.up = dirCooldowns.down = dirCooldowns.left = dirCooldowns.right = 0;
}

function updateSpawnerCooldowns(dt) {
  for (const dir of ['up', 'down', 'left', 'right']) {
    dirCooldowns[dir] = Math.max(0, dirCooldowns[dir] - dt);
  }
}

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

function pickDir() {
  const dirs      = ['up', 'down', 'left', 'right'];
  const available = dirs.filter(d => dirCooldowns[d] <= 0);

  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }

  return dirs.reduce((a, b) => dirCooldowns[a] < dirCooldowns[b] ? a : b);
}

function getSpawnInterval(state) {
  const d = CONFIG.director;
  if (state === 'fast') return d.spawnIntervalFast;
  if (state === 'slow') return d.spawnIntervalSlow;
  return d.spawnIntervalNormal;
}

function spawnGroup(state, wave) {
  if (!running) return;

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

  const toSpawn = enemies.length === 0 ? 1 : Math.min(groupSize, Math.max(0, maxEnemies - enemies.length));

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