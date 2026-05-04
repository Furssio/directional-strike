/* ═══════════════════════════════════════
   DEMO MODE
   Automated background gameplay for the
   main menu. Bot player fights enemies
   on a rotating map background.

   Self-contained — uses its own arena,
   enemies array and spawn logic. Does
   NOT touch game state (state.js).

   Used by: input.js (menu navigation)
   Depends on: EnemyRegistry, config.js
   ═══════════════════════════════════════ */

const DemoMode = (() => {

  /* ── CONFIG ── */
  const SPAWN_INTERVAL  = 1800;
  const BOT_REACT_MS    = 220;
  const MAP_CHANGE_MS   = 5500;
  const ARENA_W         = 500;
  const ARENA_H         = 500;
  const CX              = ARENA_W / 2;
  const CY              = ARENA_H / 2;
  const HIT_RADIUS      = 28;
  const ATTACK_RANGE    = ARENA_W * 0.234;
  const HIT_DAMAGE      = 34;
  const EDGE_MARGIN     = 30;
  const SPREAD          = 60;

  /* ── SPAWN SEQUENCE (loops forever) ── */
  const SPAWN_SEQ = [
    'ravager', 'ravager', 'crusher', 'ravager',
    'tornado', 'ravager', 'slime_large', 'ravager',
    'ravager', 'tornado', 'crusher', 'ravager',
    'ravager', 'ravager', 'slime_large', 'tornado',
  ];

  /* ── MAP BACKGROUNDS ── */
  const MAP_BGS = [
    'assets/maps/map01_forest/background_01.png',
    'assets/maps/map02_dungeon/background_01.png',
    'assets/maps/map03_desert/background_01.png',
    'assets/maps/map04_temple/background_01.png',
    'assets/maps/map05_snow/background_01.png',
    'assets/maps/map06_beach/background_01.png',
    'assets/maps/map07_clouds/background_01.png',
    'assets/maps/map08_storm/background_01.png',
    'assets/maps/map09_volcano/background_01.png',
    'assets/maps/map10_sakura/background_01.png',
    'assets/maps/map11_dragon/background_01.png',
    'assets/maps/map12_moon/background_01.png',
    'assets/maps/map13_dark/background_01.png',
  ];

  /* ── STATE ── */
  let active      = false;
  let arenaEl     = null;
  let playerEl    = null;
  let dEnemies    = [];
  let spawnIdx    = 0;
  let mapIdx      = 0;
  let loopId      = null;
  let spawnTimer  = 0;
  let botTimer    = 0;
  let mapTimer    = 0;
  let lastTick    = 0;

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
    const id  = SPAWN_SEQ[spawnIdx % SPAWN_SEQ.length];
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

    // sprite setup
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

    dEnemies.push({
      el, x: pos.x, y: pos.y, dir,
      hp: def.hp || 1, size, speed, def, id,
    });
  }

  /* ═══════════════════════════════════
     BOT AI
     ═══════════════════════════════════ */

  function getEnemyDir(e) {
    const dx = e.x - CX;
    const dy = e.y - CY;
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    }
    return dy > 0 ? 'down' : 'up';
  }

  function botAttack() {
    // find closest enemy in range
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

    // hit all enemies in that direction within range
    for (let i = dEnemies.length - 1; i >= 0; i--) {
      const e = dEnemies[i];
      if (getEnemyDir(e) !== dir) continue;

      const dx = e.x - CX;
      const dy = e.y - CY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > ATTACK_RANGE) continue;

      e.hp -= HIT_DAMAGE;

      // flash hit
      e.el.style.filter = 'brightness(3) saturate(0)';
      setTimeout(() => {
        if (e.el) e.el.style.filter = '';
      }, 110);

      if (e.hp <= 0) {
        demoKill(e, i);
      }
    }
  }

  function demoKill(e, idx) {
    spawnDemoParticles(e.x, e.y, '#E24B4A');
    showDemoScorePop(e.x, e.y);

    // slime split
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

    dEnemies.push({
      el, x: parent.x + offsetX, y: parent.y + offsetY,
      dir, hp: def.hp || 1, size, speed, def, id: childId,
    });
  }

  /* ═══════════════════════════════════
     VISUAL EFFECTS
     ═══════════════════════════════════ */

  function showDemoSlash(dir) {
    const el = document.createElement('div');
    el.className = 'demo-slash';

    const dist = 89;
    let x = CX, y = CY;
    let rot = 0;

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
    const count = 8;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'demo-particle';

      const size  = 3 + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.8 + Math.random() * 2.5;
      const vx    = Math.cos(angle) * speed;
      const vy    = Math.sin(angle) * speed;

      p.style.cssText = `width:${size}px;height:${size}px;background:${color};left:${x}px;top:${y}px;opacity:1;`;
      arenaEl.appendChild(p);

      const start = performance.now();
      function anim(now) {
        const t = (now - start) / 400;
        if (t >= 1) { p.remove(); return; }
        p.style.left    = (x + vx * speed * t * 18) + 'px';
        p.style.top     = (y + vy * speed * t * 18) + 'px';
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
     MAP ROTATION
     ═══════════════════════════════════ */

  function changeMap() {
    mapIdx = (mapIdx + 1) % MAP_BGS.length;
    arenaEl.classList.remove('map-fade');
    void arenaEl.offsetWidth;
    arenaEl.classList.add('map-fade');

    // change bg at the midpoint of the fade
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

    // ── spawn timer ──
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnTimer = SPAWN_INTERVAL;
      if (dEnemies.length < 6) spawnEnemy();
    }

    // ── bot timer ──
    botTimer -= dt;
    if (botTimer <= 0) {
      botTimer = BOT_REACT_MS + Math.random() * 100;
      botAttack();
    }

    // ── map change timer ──
    mapTimer -= dt;
    if (mapTimer <= 0) {
      mapTimer = MAP_CHANGE_MS;
      changeMap();
    }

    // ── move enemies toward center ──
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

      // opacity based on range
      e.el.style.opacity = dist <= ATTACK_RANGE ? '1' : '0.5';

      // remove if reaches center (no damage, just despawn)
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

  function start() {
    if (active) return;

    arenaEl  = document.getElementById('demo-arena');
    playerEl = document.getElementById('demo-player');
    if (!arenaEl) return;

    active     = true;
    dEnemies   = [];
    spawnIdx   = 0;
    mapIdx     = Math.floor(Math.random() * MAP_BGS.length);
    spawnTimer = 500;
    botTimer   = 800;
    mapTimer   = MAP_CHANGE_MS;
    lastTick   = performance.now();

    // set initial map
    arenaEl.style.backgroundImage = `url(${MAP_BGS[mapIdx]})`;

    loopId = requestAnimationFrame(tick);
  }

  function stop() {
    active = false;
    if (loopId) cancelAnimationFrame(loopId);
    loopId = null;

    // cleanup
    if (arenaEl) {
      arenaEl.querySelectorAll('.demo-enemy, .demo-particle, .demo-slash, .demo-score-pop')
        .forEach(el => el.remove());
    }
    dEnemies = [];
  }

  return { start, stop };

})();