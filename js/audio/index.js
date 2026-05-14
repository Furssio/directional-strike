/* ═══════════════════════════════════════
   AUDIO/INDEX.JS
   Global SFX wrapper. Single entry point
   for all game audio. pauseAll/resumeAll/
   stopAll are centralized across all
   subsystems (abilities + music).

   Load AFTER: core.js, combat.js, ui.js,
   abilities.js, music.js

   Exposes: window.SFX
   ═══════════════════════════════════════ */

const SFX = {

  // legacy — now auto-inits, kept as safe no-op
  init: () => AudioCore.init(),

  /* ── COMBAT ── */
  hit:       () => SfxCombat.hit(),
  kill:      () => SfxCombat.kill(),
  damage:    () => SfxCombat.damage(),
  miss:      () => SfxCombat.miss(),
  bullet:    () => SfxCombat.bullet(),
  gameOver:  () => SfxCombat.gameOver(),

  /* ── ABILITIES ── */
  special:         () => SfxAbilities.special(),
  specialReady:    () => SfxAbilities.specialReady(),
  bulletTimeStart: () => SfxAbilities.bulletTimeStart(),
  bulletTimeStop:  () => SfxAbilities.bulletTimeStop(),

  /* ── UI ── */
  levelUp:     () => SfxUi.levelUp(),
  abilityPick: () => SfxUi.abilityPick(),
  shield:      () => SfxUi.shield(),
  click:       () => SfxUi.click(),
  hover:       () => SfxUi.hover(),
  transIn:     () => SfxUi.transIn(),
  transOut:    () => SfxUi.transOut(),

  /* ── MUSIC ── */
  playMusic:    (path, opts) => Music.play(path, opts),
  stopMusic:    () => Music.stop(),
  musicPlaying: () => Music.isPlaying(),

  /* ── GLOBAL CONTROLS ── */
  pauseAll() {
    SfxAbilities.pauseAll();
    Music.pause();
  },

  resumeAll() {
    SfxAbilities.resumeAll();
    Music.resume();
  },

  stopAll() {
    SfxAbilities.stopAll();
    Music.stop();
  },
};