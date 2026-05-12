/* ═══════════════════════════════════════
   DEBUG.JS
   Debug overlay + hotkeys for testing.
   Active only when CONFIG.debug = true.
   Zero overhead when disabled.

   Loaded LAST in index.html.
   Reads game state passively — never
   modifies game logic.

   Hotkeys:
     Q — skip wave timer to 10s remaining

   Depends on: config.js, state.js,
               adventureDirector.js, orbs.js
   ═══════════════════════════════════════ */

(() => {
  if (!CONFIG.debug) return;

  /* ── PANEL DOM ─────────────────────── */
  const panel = document.createElement('div');
  panel.id = 'debug-panel';
 panel.style.cssText =
    'position:fixed;top:8px;right:8px;' +
    'background:rgba(0,0,0,0.88);color:#0f0;' +
    'font-family:"Courier New",monospace;font-size:11px;' +
    'padding:8px 10px;border:1px solid #0f0;border-radius:4px;' +
    'z-index:9999;pointer-events:none;' +
    'line-height:1.4;white-space:pre;overflow:hidden;' +
    'image-rendering:auto;display:flex;gap:12px;';
  document.body.appendChild(panel);

  /* ── HOTKEY ─────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'q' || e.key === 'Q') {
      if (!running) return;
      if (typeof AdventureDirector === 'undefined' || ActiveDirector !== AdventureDirector) return;
      AdventureDirector.debugSkipTimer();
    }

    // G — toggle Frost Touch III (45% freeze chance)
    if (e.key === 'g' || e.key === 'G') {
      if (!running || !player) return;
      if (player._frostChance > 0) {
        player._frostChance = 0;
        console.log('[DEBUG] Frost Touch OFF');
      } else {
        player._frostChance = 0.45;
        console.log('[DEBUG] Frost Touch III ON (45%)');
      }
    }
  });

  /* ── FORMAT HELPERS ─────────────────── */

  function ms2s(ms) {
    return (ms / 1000).toFixed(1) + 's';
  }

  function fmtPool(wc) {
    if (!wc || !wc.pool) return '—';
    return Object.entries(wc.pool)
      .map(([name, w]) => name + ':' + w)
      .join(' ');
  }

  function fmtBool(v) {
    return v ? 'YES' : 'no';
  }

  /* ── SECTION BUILDERS ──────────────── */

  function buildWaveSection(d) {
    let s = '═══ WAVE ═══════════════════\n';
    s += 'Wave:      ' + d.wave + ' / ' + d.totalWaves + '\n';
    s += 'Timer:     ' + ms2s(d.waveTimeLeft) + ' / ' + ms2s(d.waveDuration) + '\n';
    s += 'Elapsed:   ' + ms2s(d.waveElapsed) + '\n';
    s += 'Draining:  ' + fmtBool(d.draining) + '\n';
    s += 'Final:     ' + fmtBool(d.isFinalWave) + '\n';
    s += 'UpgradeW:  ' + fmtBool(d.isUpgradeWave) + '\n';
    return s;
  }

  function buildSpawnSection(d) {
    const wc = d.waveConfig;
    let s = '═══ SPAWN ══════════════════\n';
    s += 'Interval:  ' + d.spawnInterval + 'ms\n';
    s += 'MaxAlive:  ' + d.maxAlive + '\n';
    s += 'MinAlive:  ' + d.minAlive + '\n';
    s += 'OnField:   ' + enemies.length + '\n';
    s += 'Bullets:   ' + bullets.length + '\n';
    s += 'BurstQ:    ' + d.burstQueue + '\n';
    if (wc) {
      s += 'BurstCh:   ' + ((wc.burstChance || 0) * 100).toFixed(0) + '%\n';
      s += 'BurstSz:   ' + (wc.burstSize || 0) + '\n';
    }
    s += 'InputRate: ' + d.inputRate + '\n';
    return s;
  }

  function buildPoolSection(d) {
    const wc = d.waveConfig;
    let s = '═══ POOL ═══════════════════\n';
    s += fmtPool(wc) + '\n';
    return s;
  }

  function buildEnemySection() {
    let s = '═══ ENEMIES ════════════════\n';
    if (enemies.length === 0) {
      s += '(none)\n';
      return s;
    }
    // count by type
    const counts = {};
    for (const e of enemies) {
      const n = e.name || e.def.id || '?';
      counts[n] = (counts[n] || 0) + 1;
    }
    for (const [name, count] of Object.entries(counts)) {
      s += '  ' + name + ': ' + count + '\n';
    }
    return s;
  }

  function buildSpeedSection() {
    let s = '═══ SPEED ══════════════════\n';
    const map = ActiveDirector.getCurrentMap ? ActiveDirector.getCurrentMap() : null;
    const w = ActiveDirector.getWave ? ActiveDirector.getWave() : 1;
    const si = (map && map.speedIncreasePerLevel)
      ? map.speedIncreasePerLevel
      : CONFIG.difficulty.speedIncreasePerLevel;
    const rawMult = 1 + (w - 1) * si;
    const cappedMult = Math.min(CONFIG.difficulty.maxSpeedMult, rawMult);
    s += 'WaveMult:  ' + cappedMult.toFixed(2) + '\n';
    if (player && player.speedMultiplier !== 1) {
      s += 'PlayerSM:  ' + player.speedMultiplier.toFixed(2) + '\n';
    }
    return s;
  }

  function buildOrbSection() {
    let s = '═══ ORBS ═══════════════════\n';
    if (typeof OrbSystem === 'undefined' || !OrbSystem._debug) {
      s += '(not loaded)\n';
      return s;
    }
    const o = OrbSystem._debug();
    s += 'Active:    ' + (o.activeOrb ? o.activeOrb + ' (' + o.activeOrbDir + ')' : 'none') + '\n';
    s += 'Cooldown:  ' + ms2s(Math.max(0, o.cooldownMs)) + '\n';
    s += 'NextRoll:  ' + ms2s(Math.max(0, o.rollTimerMs)) + '\n';
    s += 'Heal%:     ' + (o.healChance * 100).toFixed(1) + '%\n';
    s += 'Atk%:      ' + (o.attackChance * 100).toFixed(1) + '%\n';
    s += 'Def%:      ' + (o.defenseChance * 100).toFixed(1) + '%\n';
    if (o.orbBonus > 0) {
      s += 'Bonus:     +' + (o.orbBonus * 100).toFixed(1) + '%\n';
    }
    if (o.attackBuffMs > 0) {
      s += 'AtkBuff:   ' + ms2s(o.attackBuffMs) + '\n';
    }
    if (o.defenseBuffMs > 0) {
      s += 'DefBuff:   ' + ms2s(o.defenseBuffMs) + '\n';
    }
    return s;
  }

  function buildPlayerSection() {
    let s = '═══ PLAYER ═════════════════\n';
    if (!player) {
      s += '(no player)\n';
      return s;
    }
    s += 'HP:        ' + player.hp + ' / ' + player.maxHp + '\n';
    s += 'Special:   ' + Math.round(player.specialCharge) + '%\n';
    s += 'SpecActv:  ' + fmtBool(player.specialActive) + '\n';
    s += 'Combo:     ' + player.combo + '\n';
    if (player.ability) {
      s += 'Ability:   ' + player.ability.id + '\n';
    }
    return s;
  }

  function buildGateSection() {
    let s = '═══ GATES ══════════════════\n';
    if (typeof dirGateEnemies === 'undefined') return s + '(n/a)\n';
    for (const dir of ['up', 'down', 'left', 'right']) {
      const list = dirGateEnemies[dir];
      let alive = 0;
      for (const e of list) { if (e.isAlive()) alive++; }
      s += '  ' + dir.padEnd(6) + ': ' + alive + '\n';
    }
    return s;
  }

  /* ── UPDATE LOOP ───────────────────── */

  function update() {
    if (!CONFIG.debug) return;

    // clear panel
    panel.innerHTML = '';

    if (running && typeof AdventureDirector !== 'undefined' && ActiveDirector === AdventureDirector) {
      const d = AdventureDirector._debug();
      const map = AdventureDirector.getCurrentMap();

      // column 1
      let c1 = '⚙ DEBUG\n';
      c1 += 'Map: ' + (map ? map.name : '?') + '\n\n';
      c1 += buildWaveSection(d);
      c1 += '\n';
      c1 += buildSpawnSection(d);
      c1 += '\n';
      c1 += buildPoolSection(d);

      // column 2
      let c2 = '';
      c2 += buildEnemySection();
      c2 += '\n';
      c2 += buildSpeedSection();
      c2 += '\n';
      c2 += buildGateSection();
      c2 += '\n';
      c2 += buildOrbSection();
      c2 += '\n';
      c2 += buildPlayerSection();
      c2 += '\n[Q] skip to 10s';
      c2 += '\n[G] frost ' + (player && player._frostChance > 0 ? 'ON ' + Math.round(player._frostChance * 100) + '%' : 'off');

      const col1 = document.createElement('div');
      col1.textContent = c1;
      const col2 = document.createElement('div');
      col2.textContent = c2;
      panel.appendChild(col1);
      panel.appendChild(col2);

    } else if (running) {
      let txt = '⚙ DEBUG (infinite)\n\n';
      txt += buildEnemySection();
      txt += '\n';
      txt += buildPlayerSection();
      const col = document.createElement('div');
      col.textContent = txt;
      panel.appendChild(col);
    } else {
      const col = document.createElement('div');
      col.textContent = '⚙ DEBUG\n(not in game)';
      panel.appendChild(col);
    }

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);

})();