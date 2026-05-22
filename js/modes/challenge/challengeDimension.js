/* ═══════════════════════════════════════
   CHALLENGEDIMENSION.JS
   Dimension map: mixed enemies from all
   maps using class system.

   Used by: challengeDirector.js
   Depends on: config.js, ChallengeScaling
   ═══════════════════════════════════════ */

const ChallengeDimension = (() => {

  let _dimPool    = [];
  let _dimClasses = [];

  function reset() {
    _dimPool    = [];
    _dimClasses = [];
  }

  function buildMap() {
    return {
      id:          'dimension',
      name:        'Dimension',
      background:  'assets/maps/map13_dark/background_01.png',
      enemyPool:   {},
      isDimension: true,
    };
  }

  function initPool() {
    const classes    = CONFIG.challenge.enemyClasses;
    const classNames = Object.keys(classes);
    // shuffle
    for (let i = classNames.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [classNames[i], classNames[j]] = [classNames[j], classNames[i]];
    }
    // pick 4 classes, 1 enemy each
    _dimClasses = classNames.slice(0, 4);
    _dimPool    = [];
    for (const cls of _dimClasses) {
      const members = classes[cls];
      const pick    = members[Math.floor(Math.random() * members.length)];
      _dimPool.push({ name: pick, cls: cls });
    }
  }

  function rotatePool() {
    const classes    = CONFIG.challenge.enemyClasses;
    const allClasses = Object.keys(classes);
    const replaceIdx = Math.floor(Math.random() * _dimPool.length);
    const oldCls     = _dimPool[replaceIdx].cls;

    let available = allClasses.filter(c =>
      !_dimClasses.includes(c) || c === oldCls
    );
    if (available.length === 0) {
      available = allClasses.filter(c => c !== oldCls);
    }
    const newCls   = available[Math.floor(Math.random() * available.length)];
    const members  = classes[newCls];
    const newEnemy = members[Math.floor(Math.random() * members.length)];

    _dimClasses[replaceIdx] = newCls;
    _dimPool[replaceIdx]    = { name: newEnemy, cls: newCls };
  }

  function buildWaveConfig(wave) {
    // pool from current dimension enemies
    const pool = {};
    for (const entry of _dimPool) {
      pool[entry.name] = 3;
    }

    const tierName = CONFIG.challenge.dimensionTier || 'hard';

    let combos, dirCooldown, spawnInterval, maxAlive, minAlive;

    if (tierName === 'easy') {
      combos        = { single: 6, pair_opposite: 2, burst_single: 1 };
      dirCooldown   = 1200;
      spawnInterval = 2200;
      maxAlive      = 3;
      minAlive      = 1;
    } else if (tierName === 'medium') {
      combos = {
        single: 5,
        pair_opposite: { weight: 3, stagger: 800 },
        pair_adjacent: { weight: 2, stagger: 750 },
        burst_single: 1,
      };
      dirCooldown   = 1100;
      spawnInterval = 2000;
      maxAlive      = 3;
      minAlive      = 1;
    } else if (tierName === 'hard') {
      combos = {
        single: 3,
        pair_opposite: { weight: 3, stagger: 800 },
        pair_adjacent: { weight: 2, stagger: 750 },
        burst_single: 2,
        triple: { weight: 1, stagger: 850 },
      };
      dirCooldown   = 900;
      spawnInterval = 1600;
      maxAlive      = 4;
      minAlive      = 2;
    } else { // peak
      combos = {
        single: 2,
        pair_opposite: { weight: 3, stagger: 850 },
        burst_single: 2,
        triple: { weight: 2, stagger: 900 },
        rush: { weight: 1, stagger: 750 },
      };
      dirCooldown   = 800;
      spawnInterval = 1500;
      maxAlive      = 4;
      minAlive      = 2;
    }

    return { pool, combos, dirCooldown, spawnInterval, maxAlive, minAlive };
  }

  function getPool() {
    return _dimPool.slice();
  }

  return {
    reset,
    buildMap,
    initPool,
    rotatePool,
    buildWaveConfig,
    getPool,
  };

})();