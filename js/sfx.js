/* ═══════════════════════════════════════
   SFX.JS — BACKWARD COMPATIBILITY
   Maps old SFX.method() calls to new
   split audio modules.

   Load AFTER: audio.js, sfx-combat.js,
   sfx-abilities.js, sfx-ui.js
   ═══════════════════════════════════════ */

const SFX = {
  init:        () => AudioCore.init(),

  // combat
  hit:         () => SfxCombat.hit(),
  kill:        () => SfxCombat.kill(),
  damage:      () => SfxCombat.damage(),
  miss:        () => SfxCombat.miss(),
  bullet:      () => SfxCombat.bullet(),
  gameOver:    () => SfxCombat.gameOver(),

  // abilities
  special:          () => SfxAbilities.special(),
  specialReady:     () => SfxAbilities.specialReady(),
  bulletTimeStart:  () => SfxAbilities.bulletTimeStart(),
  bulletTimeStop:   () => SfxAbilities.bulletTimeStop(),

  // ui
  levelUp:     () => SfxUi.levelUp(),
  abilityPick: () => SfxUi.abilityPick(),
  shield:      () => SfxUi.shield(),

  // global controls
  pauseAll:    () => SfxAbilities.pauseAll(),
  resumeAll:   () => SfxAbilities.resumeAll(),
  stopAll:     () => SfxAbilities.stopAll(),
};