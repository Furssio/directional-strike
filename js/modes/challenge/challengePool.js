/* ═══════════════════════════════════════
   CHALLENGEPOOL.JS
   Pool building, enemy picking, combo
   system with stagger queue.

   Used by: challengeDirector.js
   Depends on: config.js, EnemyRegistry,
               adventureSpawner.js (gate),
               ChallengeScaling
   ═══════════════════════════════════════ */

const ChallengePool = (() => {

  /* ── STAGGER QUEUE ─────────────────── */
  let _staggerQueue = [];

  function resetQueue() {
    _staggerQueue = [];
  }

  function tickQueue(dt) {
    for (let i = _staggerQueue.length - 1; i >= 0; i--) {
      _staggerQueue[i].delay -= dt;
      if (_staggerQueue[i].delay <= 0) {
        const item = _staggerQueue[i];
        _staggerQueue.splice(i, 1);
        if (enemies.length >= item.maxAlive) continue;
        _doSpawn(item.dir, item.pool, item.dirCooldown);
      }
    }
  }

  function queueLength() {
    return _staggerQueue.length;
  }

  /* ── BUILD POOL ────────────────────── */

  function buildPool(waveConfig, currentMap) {
    if (waveConfig && waveConfig.pool) {
      const pool = [];
      for (const [name, weight] of Object.entries(waveConfig.pool)) {
        for (let i = 0; i < weight; i++) pool.push(name);
      }
      return pool;
    }
    if (currentMap && currentMap.enemyPool) {
      const pool = [];
      for (const [name, cfg] of Object.entries(currentMap.enemyPool)) {
        const w = cfg.weight || 1;
        for (let i = 0; i < w; i++) pool.push(name);
      }
      return pool;
    }
    return ['ravager'];
  }

  /* ── PICK FROM POOL ────────────────── */

  function pickFromPool(pool, currentMap) {
    if (pool.length === 0) return null;
    const fieldCounts = {};
    for (const e of enemies) {
      fieldCounts[e.name] = (fieldCounts[e.name] || 0) + 1;
    }

    let available = pool;
    if (currentMap && currentMap.maxInField) {
      available = pool.filter(name => {
        const cap = currentMap.maxInField[name];
        if (cap === undefined) return true;
        return (fieldCounts[name] || 0) < cap;
      });
    }
    if (available.length === 0) return null;
    const name = available[Math.floor(Math.random() * available.length)];
    return EnemyRegistry.get(name);
  }

  /* ── SPAWN HELPERS ─────────────────── */

  function _doSpawn(dir, pool, dirCooldown, currentMap) {
    const def = pickFromPool(pool, currentMap);
    if (!def) return false;
    spawnEnemyDirected(def, dir);
    registerSpawnedEnemy(dir);
    setDirCooldown(dir, dirCooldown);
    return true;
  }

  function _queueSpawn(dir, pool, delayMs, maxAlive, dirCooldown) {
    _staggerQueue.push({
      dir, pool, delay: delayMs, maxAlive, dirCooldown,
    });
  }

  /* ── COMBO HELPERS ─────────────────── */

  function getCombos(waveConfig) {
    if (waveConfig && waveConfig.combos) return waveConfig.combos;
    return null;
  }

  function pickCombo(combos) {
    const entries = Object.entries(combos);
    let total = 0;
    for (const [, val] of entries) {
      total += (typeof val === 'object') ? val.weight : val;
    }
    if (total <= 0) return 'single';
    let roll = Math.random() * total;
    for (const [pattern, val] of entries) {
      const w = (typeof val === 'object') ? val.weight : val;
      roll -= w;
      if (roll <= 0) return pattern;
    }
    return entries[0][0];
  }

  function _getStagger(pattern, waveConfig) {
    if (waveConfig && waveConfig.combos && waveConfig.combos[pattern]) {
      const val = waveConfig.combos[pattern];
      if (typeof val === 'object' && val.stagger !== undefined) {
        return val.stagger;
      }
    }
    const defaults = CONFIG.adventure.comboStagger || {};
    if (defaults[pattern] !== undefined) return defaults[pattern];
    return 400;
  }

  /* ── EXECUTE COMBO ─────────────────── */

  function executeCombo(pattern, ctx) {
    const { waveConfig, currentMap, maxAlive, dirCooldown } = ctx;
    const pool = buildPool(waveConfig, currentMap);
    if (pool.length === 0) return false;

    const qCount = _staggerQueue.length;
    if (enemies.length >= maxAlive + 1) return false;
    if (enemies.length >= maxAlive && qCount > 0) return false;

    const stagger = _getStagger(pattern, waveConfig);

    if (pattern === 'single') {
      const dir = pickDirAdventure();
      if (!dir) return false;
      return _doSpawn(dir, pool, dirCooldown, currentMap);
    }

    if (pattern === 'pair_opposite') {
      const dirs = pickDirOpposite();
      if (!dirs) return executeCombo('single', ctx);
      _doSpawn(dirs[0], pool, dirCooldown, currentMap);
      _queueSpawn(dirs[1], pool, stagger, maxAlive, dirCooldown);
      return true;
    }

    if (pattern === 'pair_adjacent') {
      const dirs = pickDirAdjacent();
      if (!dirs) return executeCombo('single', ctx);
      _doSpawn(dirs[0], pool, dirCooldown, currentMap);
      _queueSpawn(dirs[1], pool, stagger, maxAlive, dirCooldown);
      return true;
    }

    if (pattern === 'burst_single') {
      const dir = pickDirAdventure();
      if (!dir) return false;
      _doSpawn(dir, pool, dirCooldown, currentMap);
      _queueSpawn(dir, pool, stagger, maxAlive, dirCooldown);
      return true;
    }

    if (pattern === 'triple') {
      const dirs = pickDir3();
      if (!dirs) return executeCombo('pair_opposite', ctx);
      _doSpawn(dirs[0], pool, dirCooldown, currentMap);
      _queueSpawn(dirs[1], pool, stagger, maxAlive, dirCooldown);
      _queueSpawn(dirs[2], pool, stagger * 2, maxAlive, dirCooldown);
      return true;
    }

    if (pattern === 'rush') {
      const dir = pickDirAdventure();
      if (!dir) return false;
      _doSpawn(dir, pool, dirCooldown, currentMap);
      _queueSpawn(dir, pool, stagger, maxAlive, dirCooldown);
      _queueSpawn(dir, pool, stagger * 2, maxAlive, dirCooldown);
      return true;
    }

    if (pattern === 'surround') {
      const dirs = pickDirAll();
      if (!dirs) return executeCombo('triple', ctx);
      _doSpawn(dirs[0], pool, dirCooldown, currentMap);
      _queueSpawn(dirs[1], pool, stagger, maxAlive, dirCooldown);
      _queueSpawn(dirs[2], pool, stagger * 2, maxAlive, dirCooldown);
      _queueSpawn(dirs[3], pool, stagger * 3, maxAlive, dirCooldown);
      return true;
    }

    return executeCombo('single', ctx);
  }

  /* ── PUBLIC API ────────────────────── */

  return {
    resetQueue,
    tickQueue,
    queueLength,
    buildPool,
    pickFromPool,
    getCombos,
    pickCombo,
    executeCombo,
  };

})();