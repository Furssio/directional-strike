/* ═══════════════════════════════════════
   ORBS.JS
   Collectible orbs that spawn from the
   edges and walk toward center like
   enemies. Player collects by attacking
   in their direction when in range.
   If not collected, they reach center
   and disappear (no damage).

   Types: heal (green), attack (red),
          defense (blue).

   Used by: adventureDirector.js, combat.js
   Depends on: state.js, dom.js, config.js
   ═══════════════════════════════════════ */

const OrbSystem = (() => {

  let _activeOrb   = null;
  let _cooldownMs  = 0;
  let _rollTimerMs = 0;

  const ORB_ROLL_INTERVAL = 3000;
  const ORB_COOLDOWN      = 8000;
  const ORB_SIZE           = 22;
  const ORB_SPEED          = 1.2;
  const ORB_HIT_RADIUS     = 24;

  /* ── EFFECT DURATIONS ── */
  const ATTACK_DURATION  = 8000;
  const DEFENSE_DURATION = 8000;
  const HEAL_PERCENT     = 0.30;

  /* ── ACTIVE BUFFS ── */
  let _attackBuffMs  = 0;
  let _defenseBuffMs = 0;

  /* ── PROBABILITY TABLES ── */

  function _healChance() {
    if (!player) return 0;
    const pct = player.hpPercent();
    if (pct <= 0.20) return 0.50;
    if (pct <= 0.40) return 0.30;
    if (pct <= 0.60) return 0.15;
    if (pct <= 0.90) return 0.05;
    return 0.01;
  }

  function _attackChance() {
    if (!ActiveDirector || !ActiveDirector.getWaveDuration) return 0.02;
    const dur  = ActiveDirector.getWaveDuration();
    const left = ActiveDirector.getWaveTimeLeft();
    if (dur <= 0) return 0.02;
    const pct = left / dur;
    if (pct <= 0.20) return 0.15;
    if (pct <= 0.40) return 0.08;
    return 0.02;
  }

  function _defenseChance() {
    if (!ActiveDirector) return 0.02;
    const w = ActiveDirector.getWave();
    if (ActiveDirector.isBoss())  return 0.20;
    if (w >= 7) return 0.10;
    if (w >= 4) return 0.05;
    return 0.02;
  }

  /* ── SPAWN ORB ── */

  function _spawnOrb(type) {
    if (_activeOrb) return;

    const { w, h } = getArenaSize();
    const cx = w / 2;
    const cy = h / 2;
    const m  = CONFIG.spawn.edgeMargin;

    // pick random direction
    const dirs = ['up', 'down', 'left', 'right'];
    const dir  = dirs[Math.floor(Math.random() * dirs.length)];

    // spawn from edge like enemies
    let x, y;
    if (dir === 'up')    { x = cx; y = -m; }
    if (dir === 'down')  { x = cx; y = h + m; }
    if (dir === 'left')  { x = -m; y = cy; }
    if (dir === 'right') { x = w + m; y = cy; }

    // colors
    const colors = {
      heal:    { bg: '#44ff66', glow: '0 0 12px #44ff66' },
      attack:  { bg: '#ff4444', glow: '0 0 12px #ff4444' },
      defense: { bg: '#4488ff', glow: '0 0 12px #4488ff' },
    };
    const c = colors[type];

    // create DOM element
    const el = document.createElement('div');
    el.className = 'orb orb-' + type;
    el.style.cssText =
      'position:absolute;width:' + ORB_SIZE + 'px;height:' + ORB_SIZE + 'px;' +
      'left:' + x + 'px;top:' + y + 'px;' +
      'transform:translate(-50%,-50%);border-radius:50%;' +
      'background:' + c.bg + ';box-shadow:' + c.glow + ';' +
      'z-index:25;pointer-events:none;' +
      'animation:orbFloat 1s ease-in-out infinite alternate;';

    arena.appendChild(el);

    _activeOrb = { type, dir, x, y, el };
  }

  /* ── COLLECT ORB ── */

  function _collectOrb() {
    if (!_activeOrb) return;
    const orb = _activeOrb;

    // spawn particles at orb position
    const colors = { heal: '#44ff66', attack: '#ff4444', defense: '#4488ff' };
    if (typeof spawnParticles === 'function') {
      spawnParticles(orb.x, orb.y, colors[orb.type], false);
    }

    // apply effect
    if (orb.type === 'heal') {
      const healAmt = Math.round(player.maxHp * HEAL_PERCENT);
      player.hp = Math.min(player.maxHp, player.hp + healAmt);
      updateHpBar();
      _showPlayerEffect('heal');
      SFX.specialReady();
    }

    if (orb.type === 'attack') {
      _attackBuffMs = ATTACK_DURATION;
      _showPlayerEffect('attack');
      SFX.special();
    }

    if (orb.type === 'defense') {
      _defenseBuffMs = DEFENSE_DURATION;
      _showPlayerEffect('defense');
      SFX.special();
    }

    // cleanup
    orb.el.remove();
    _activeOrb  = null;
    _cooldownMs = ORB_COOLDOWN;
  }

  /* ── REMOVE ORB (reached center) ── */

  function _removeOrb() {
    if (!_activeOrb) return;
    _activeOrb.el.remove();
    _activeOrb  = null;
    _cooldownMs = 2000;
  }

  /* ── PLAYER EFFECTS ── */

  function _showPlayerEffect(type) {
    playerEl.classList.remove('orb-heal-effect', 'orb-attack-effect', 'orb-defense-effect');
    void playerEl.offsetWidth;

    if (type === 'heal') {
      playerEl.classList.add('orb-heal-effect');
      setTimeout(() => playerEl.classList.remove('orb-heal-effect'), 1500);
    }
    if (type === 'attack') {
      playerEl.classList.add('orb-attack-effect');
    }
    if (type === 'defense') {
      playerEl.classList.add('orb-defense-effect');
    }
  }

  return {

    /* ── TICK ── */
    tick(dt) {
      // tick buff timers
      if (_attackBuffMs > 0) {
        _attackBuffMs -= dt;
        if (_attackBuffMs <= 0) {
          _attackBuffMs = 0;
          playerEl.classList.remove('orb-attack-effect');
        }
      }
      if (_defenseBuffMs > 0) {
        _defenseBuffMs -= dt;
        if (_defenseBuffMs <= 0) {
          _defenseBuffMs = 0;
          playerEl.classList.remove('orb-defense-effect');
        }
      }

      // tick cooldown
      if (_cooldownMs > 0) {
        _cooldownMs -= dt;
        return;
      }

      // move active orb toward center
      if (_activeOrb) {
        const { w, h } = getArenaSize();
        const cx = w / 2;
        const cy = h / 2;
        const orb = _activeOrb;

        const dx = cx - orb.x;
        const dy = cy - orb.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // reached center — disappear without damage
        if (dist < ORB_HIT_RADIUS) {
          _removeOrb();
          return;
        }

        // move toward center
        const nx = dx / dist;
        const ny = dy / dist;
        const speed = ORB_SPEED * (player ? player.speedMultiplier : 1);
        orb.x += nx * speed;
        orb.y += ny * speed;
        orb.el.style.left = orb.x + 'px';
        orb.el.style.top  = orb.y + 'px';

        // opacity: dim when out of range, bright when in range
        const arenaSize   = Math.min(w, h);
        const attackRange = player ? player.getAttackRange(arenaSize) : 0;
        orb.el.style.opacity = dist <= attackRange ? '1' : '0.5';

        return;
      }

      // probability roll
      _rollTimerMs -= dt;
      if (_rollTimerMs > 0) return;
      _rollTimerMs = ORB_ROLL_INTERVAL;

      const roll = Math.random();
      const hc = _healChance();
      const ac = _attackChance();
      const dc = _defenseChance();

      if (roll < hc) {
        _spawnOrb('heal');
      } else if (roll < hc + ac) {
        _spawnOrb('attack');
      } else if (roll < hc + ac + dc) {
        _spawnOrb('defense');
      }
    },

    /* ── CHECK COLLECTION (called from combat.js) ── */
    checkCollect(dir, attackRange) {
      if (!_activeOrb) return false;
      if (_activeOrb.dir !== dir) return false;

      const { w, h } = getArenaSize();
      const cx = w / 2;
      const cy = h / 2;
      const dx = _activeOrb.x - cx;
      const dy = _activeOrb.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= attackRange) {
        _collectOrb();
        return true;
      }
      return false;
    },

    /* ── BUFF QUERIES ── */
    hasAttackBuff()  { return _attackBuffMs > 0; },
    hasDefenseBuff() { return _defenseBuffMs > 0; },

    /* ── RESET ── */
    reset() {
      if (_activeOrb) _activeOrb.el.remove();
      _activeOrb     = null;
      _cooldownMs    = 0;
      _rollTimerMs   = 0;
      _attackBuffMs  = 0;
      _defenseBuffMs = 0;
      playerEl.classList.remove('orb-heal-effect', 'orb-attack-effect', 'orb-defense-effect');
    },
  };

})();