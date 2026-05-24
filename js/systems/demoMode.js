/* ═══════════════════════════════════════
   DEMO MODE
   Automated background gameplay.
   Can run in any container element.

   Used by: input.js, mapSelect.js
   Depends on: EnemyRegistry, config.js
   ═══════════════════════════════════════ */

const DemoMode = (() => {

  const SPAWN_INTERVAL  = 1800;
  const BOT_REACT_MS    = 220;
  const MAP_CHANGE_MS   = 5500;
  const HIT_RADIUS      = 28;
  const HIT_DAMAGE      = 34;
  const EDGE_MARGIN     = 30;
  const SPREAD          = 60;

  let ARENA_W = 500;
  let ARENA_H = 500;
  let CX = 250;
  let CY = 250;
  let ATTACK_RANGE = 500 * 0.234;

  const DEFAULT_POOL = [
    'ravager', 'ravager', 'crusher', 'ravager',
    'tornado', 'ravager', 'slime_large', 'ravager',
    'ravager', 'tornado', 'crusher', 'ravager',
    'ravager', 'ravager', 'slime_large', 'tornado',
  ];

  let spawnPool = DEFAULT_POOL;

  const MAP_BGS = [
    'assets/maps/map01_forest/background_01.webp',
    'assets/maps/map02_dungeon/background_01.webp',
    'assets/maps/map03_desert/background_01.webp',
    'assets/maps/map04_temple/background_01.webp',
    'assets/maps/map05_snow/background_01.webp',
    'assets/maps/map06_beach/background_01.webp',
    'assets/maps/map07_clouds/background_01.webp',
    'assets/maps/map08_storm/background_01.webp',
    'assets/maps/map09_volcano/background_01.webp',
    'assets/maps/map10_sakura/background_01.webp',
    'assets/maps/map11_dragon/background_01.webp',
    'assets/maps/map12_moon/background_01.webp',
    'assets/maps/map13_dark/background_01.webp',
];

  let active      = false;
  let arenaEl     = null;
  let dEnemies    = [];
  let spawnIdx    = 0;
  let mapIdx      = 0;
  let loopId      = null;
  let spawnTimer  = 0;
  let botTimer    = 0;
  let mapTimer    = 0;
  let lastTick    = 0;
  let autoRotate  = true;

  function updateArenaSize() {
    if (!arenaEl) return;
    ARENA_W = arenaEl.offsetWidth;
    ARENA_H = arenaEl.offsetHeight;
    CX = ARENA_W / 2;
    CY = ARENA_H / 2;
    ATTACK_RANGE = Math.min(ARENA_W, ARENA_H) * 0.234;
  }

  /* ═══════════════════════════════════
     SPAWN
     ═══════════════════════════════════ */

  function pickDir() {
    const dirs = ['up', 'down', 'left', 'right'];
    return dirs[Math.floor(Math.random() * dirs.length)];
  }

  function spawnPos(dir) {
    let x, y;
    if (dir === 'up')    { x = CX; y = -EDGE_MARGIN; }
    if (dir === 'down')  { x = CX; y = ARENA_H + EDGE_MARGIN; }
    if (dir === 'left')  { x = -EDGE_MARGIN; y = CY; }
    if (dir === 'right') { x = ARENA_W + EDGE_MARGIN; y = CY; }
    if (dir === 'up'   || dir === 'down')  x += (Math.random() - 0.5) * SPREAD;
    if (dir === 'left' || dir === 'right') y += (Math.random() - 0.5) * SPREAD;
    return { x, y, dir };
  }

  function spawnEnemy() {
    const id  = spawnPool[spawnIdx % spawnPool.length];
    spawnIdx++;
    const def = EnemyRegistry.get(id);
    if (!def) return;

    const dir  = pickDir();
    const pos  = spawnPos(dir);
    const size = def.size || 32;

    const el = document.createElement('div');
    el.className = 'demo-enemy';
    el.style.width  = size + 'px';
    el.style.height = size + 'px';
    el.style.left   = pos.x + 'px';
    el.style.top    = pos.y + 'px';

    if (def.sprite) {
      el.style.backgroundImage = `url(${def.sprite})`;
      el.style.imageRendering  = 'pixelated';
      if (def.spriteFrames && def.spriteFrames > 1) {
        const fw = def.spriteFrameW || size;
        const fh = def.spriteFrameH || size;
        const scale = size / fh;
        const scaledW = Math.round(fw * def.spriteFrames * scale);
        el.style.backgroundSize   = `${scaledW}px ${size}px`;
        el.style.backgroundRepeat = 'no-repeat';
        const dur = def.spriteSpeed || 0.8;
        const animName = `dIdle_${id}_${size}`;
        if (!document.getElementById('anim-' + animName)) {
          const style = document.createElement('style');
          style.id = 'anim-' + animName;
          style.textContent = `@keyframes ${animName}{from{background-position-x:0}to{background-position-x:-${scaledW}px}}`;
          document.head.appendChild(style);
        }
        el.style.animation = `${animName} ${dur}s steps(${def.spriteFrames}) infinite`;
      } else {
        el.style.backgroundSize = 'cover';
      }
    }

    arenaEl.appendChild(el);
    const speed = (def.speedMult || 1) * CONFIG.base.enemyBaseSpeed;
    dEnemies.push({ el, x: pos.x, y: pos.y, dir, hp: def.hp || 1, size, speed, def, id });
  }

  /* ═══════════════════════════════════
     BOT AI
     ═══════════════════════════════════ */

  function getEnemyDir(e) {
    const dx = e.x - CX;
    const dy = e.y - CY;
    if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
    return dy > 0 ? 'down' : 'up';
  }

  function botAttack() {
    let closest = null;
    let closestDist = Infinity;
    for (const e of dEnemies) {
      const dx = e.x - CX;
      const dy = e.y - CY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < closestDist && dist <= ATTACK_RANGE) {
        closest = e;
        closestDist = dist;
      }
    }
    if (!closest) return;

    const dir = getEnemyDir(closest);
    showDemoSlash(dir);

    for (let i = dEnemies.length - 1; i >= 0; i--) {
      const e = dEnemies[i];
      if (getEnemyDir(e) !== dir) continue;
      const dx = e.x - CX;
      const dy = e.y - CY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > ATTACK_RANGE) continue;

      e.hp -= HIT_DAMAGE;
      e.el.style.filter = 'brightness(3) saturate(0)';
      setTimeout(() => { if (e.el) e.el.style.filter = ''; }, 110);

      if (e.hp <= 0) {
        demoKill(e, i);
      }
    }
  }

  function demoKill(e, idx) {
    spawnDemoParticles(e.x, e.y, '#E24B4A');
    showDemoScorePop(e.x, e.y);
    if (e.id === 'slime_large') {
      spawnChildSlime(e, 'slime_medium', 24);
      spawnChildSlime(e, 'slime_medium', 24);
    }
    e.el.remove();
    dEnemies.splice(idx, 1);
  }

  function spawnChildSlime(parent, childId, size) {
    const def = EnemyRegistry.get(childId);
    if (!def) return;
    const offsetX = (Math.random() - 0.5) * 30;
    const offsetY = (Math.random() - 0.5) * 30;

    const el = document.createElement('div');
    el.className = 'demo-enemy';
    el.style.width  = size + 'px';
    el.style.height = size + 'px';
    el.style.left   = (parent.x + offsetX) + 'px';
    el.style.top    = (parent.y + offsetY) + 'px';

    if (def.sprite) {
      el.style.backgroundImage = `url(${def.sprite})`;
      el.style.imageRendering  = 'pixelated';
      if (def.spriteFrames && def.spriteFrames > 1) {
        const fw = def.spriteFrameW || size;
        const fh = def.spriteFrameH || size;
        const scale = size / fh;
        const scaledW = Math.round(fw * def.spriteFrames * scale);
        el.style.backgroundSize   = `${scaledW}px ${size}px`;
        el.style.backgroundRepeat = 'no-repeat';
        const dur = def.spriteSpeed || 0.8;
        const animName = `dIdle_${childId}_${size}`;
        if (!document.getElementById('anim-' + animName)) {
          const style = document.createElement('style');
          style.id = 'anim-' + animName;
          style.textContent = `@keyframes ${animName}{from{background-position-x:0}to{background-position-x:-${scaledW}px}}`;
          document.head.appendChild(style);
        }
        el.style.animation = `${animName} ${dur}s steps(${def.spriteFrames}) infinite`;
      } else {
        el.style.backgroundSize = 'cover';
      }
    }

    arenaEl.appendChild(el);
    const speed = (def.speedMult || 1) * CONFIG.base.enemyBaseSpeed;
    const dir   = getEnemyDir({ x: parent.x + offsetX, y: parent.y + offsetY });
    dEnemies.push({ el, x: parent.x + offsetX, y: parent.y + offsetY, dir, hp: def.hp || 1, size, speed, def, id: childId });
  }

  /* ═══════════════════════════════════
     VISUAL EFFECTS
     ═══════════════════════════════════ */

  function showDemoSlash(dir) {
    const el = document.createElement('div');
    el.className = 'demo-slash';
    const dist = 89;
    let x = CX, y = CY, rot = 0;
    if (dir === 'right') { x += dist; rot = 0; }
    if (dir === 'left')  { x -= dist; rot = 180; }
    if (dir === 'up')    { y -= dist; rot = -90; }
    if (dir === 'down')  { y += dist; rot = 90; }
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    el.style.transform = `translate(-50%,-50%) rotate(${rot}deg)`;
    arenaEl.appendChild(el);
    setTimeout(() => el.remove(), 260);
  }

  function spawnDemoParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.className = 'demo-particle';
      const size  = 3 + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.8 + Math.random() * 2.5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      p.style.cssText = `width:${size}px;height:${size}px;background:${color};left:${x}px;top:${y}px;opacity:1;`;
      arenaEl.appendChild(p);
      const start = performance.now();
      function anim(now) {
        const t = (now - start) / 400;
        if (t >= 1) { p.remove(); return; }
        p.style.left = (x + vx * speed * t * 18) + 'px';
        p.style.top  = (y + vy * speed * t * 18) + 'px';
        p.style.opacity = 1 - t;
        requestAnimationFrame(anim);
      }
      requestAnimationFrame(anim);
    }
  }

  function showDemoScorePop(x, y) {
    const pts = [10, 15, 20, 25][Math.floor(Math.random() * 4)];
    const el  = document.createElement('div');
    el.className   = 'demo-score-pop';
    el.textContent = '+' + pts;
    el.style.left  = x + 'px';
    el.style.top   = y + 'px';
    arenaEl.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  /* ═══════════════════════════════════
     MAP
     ═══════════════════════════════════ */

  function changeMap() {
    mapIdx = (mapIdx + 1) % MAP_BGS.length;
    arenaEl.classList.remove('map-fade');
    void arenaEl.offsetWidth;
    arenaEl.classList.add('map-fade');
    setTimeout(() => {
      arenaEl.style.backgroundImage = `url(${MAP_BGS[mapIdx]})`;
    }, 350);
  }

  /* ═══════════════════════════════════
     MAIN LOOP
     ═══════════════════════════════════ */

  function tick() {
    if (!active) return;
    const now = performance.now();
    const dt  = Math.min(now - lastTick, 50);
    lastTick  = now;
    updateArenaSize();

    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnTimer = SPAWN_INTERVAL;
      if (dEnemies.length < 6) spawnEnemy();
    }

    botTimer -= dt;
    if (botTimer <= 0) {
      botTimer = BOT_REACT_MS + Math.random() * 100;
      botAttack();
    }

    if (autoRotate) {
      mapTimer -= dt;
      if (mapTimer <= 0) {
        mapTimer = MAP_CHANGE_MS;
        changeMap();
      }
    }

    for (let i = dEnemies.length - 1; i >= 0; i--) {
      const e  = dEnemies[i];
      const dx = CX - e.x;
      const dy = CY - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) continue;
      const nx = dx / dist;
      const ny = dy / dist;
      e.x += nx * e.speed;
      e.y += ny * e.speed;
      e.el.style.left = e.x + 'px';
      e.el.style.top  = e.y + 'px';
      e.el.style.opacity = dist <= ATTACK_RANGE ? '1' : '0.5';
      if (dist < HIT_RADIUS) {
        e.el.remove();
        dEnemies.splice(i, 1);
      }
    }

    loopId = requestAnimationFrame(tick);
  }

  /* ═══════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════ */

  function start(targetId, options) {
    if (active) stop();

    const id = targetId || 'demo-arena';
    arenaEl  = document.getElementById(id);
    if (!arenaEl) return;

    autoRotate = options && options.autoRotate === false ? false : true;

    active     = true;
    dEnemies   = [];
    spawnIdx   = 0;
    spawnPool  = DEFAULT_POOL;
    mapIdx     = Math.floor(Math.random() * MAP_BGS.length);
    spawnTimer = 500;
    botTimer   = 800;
    mapTimer   = MAP_CHANGE_MS;
    lastTick   = performance.now();

    arenaEl.style.backgroundImage = `url(${MAP_BGS[mapIdx]})`;
    updateArenaSize();
    loopId = requestAnimationFrame(tick);
  }

  function stop() {
    active = false;
    if (loopId) cancelAnimationFrame(loopId);
    loopId = null;
    if (arenaEl) {
      arenaEl.querySelectorAll('.demo-enemy, .demo-particle, .demo-slash, .demo-score-pop')
        .forEach(el => el.remove());
    }
    dEnemies = [];
  }

  // set map manually (for map select sync)
  function setMap(bgPath) {
    if (!arenaEl) return;
    arenaEl.classList.remove('map-fade');
    void arenaEl.offsetWidth;
    arenaEl.classList.add('map-fade');
    setTimeout(() => {
      arenaEl.style.backgroundImage = `url(${bgPath})`;
    }, 350);
  }

  // set enemy pool for map-specific preview
  function setEnemyPool(ids) {
    if (!ids || ids.length === 0) { spawnPool = DEFAULT_POOL; return; }
    // build weighted pool: repeat each id for variety
    spawnPool = [];
    ids.forEach(id => {
      const def = EnemyRegistry.get(id);
      if (def) spawnPool.push(id);
    });
    if (spawnPool.length === 0) spawnPool = DEFAULT_POOL;
    spawnIdx = 0;
  }

  return { start, stop, setMap, setEnemyPool };

})();