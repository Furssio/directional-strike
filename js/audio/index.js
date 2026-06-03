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
  hit:          () => SfxCombat.hit(),
  hitFlesh:     () => SfxCombat.hitFlesh(),
  hitRock:      () => SfxCombat.hitRock(),
  hitSlime:     () => SfxCombat.hitSlime(),
  hitShell:     () => SfxCombat.hitShell(),
  hitEthereal:  () => SfxCombat.hitEthereal(),
  hitThunder:   () => SfxCombat.hitThunder(),
  hitDemon:     () => SfxCombat.hitDemon(),
  comboTick:      (combo, tierIndex) => SfxCombat.comboTick(combo, tierIndex),
  comboThreshold: (tierIndex)        => SfxCombat.comboThreshold(tierIndex),
  comboLost:      (combo) => SfxCombat.comboLost(combo),
   freeze:    () => SfxCombat.freeze(),
   multiKill: (count) => SfxCombat.multiKill(count),
   luckyShield: () => SfxCombat.luckyShield(),
   berserker: () => SfxCombat.berserker(),

  // dispatch by enemy material type
  hitByType(type) {
    const fn = this['hit' + type.charAt(0).toUpperCase() + type.slice(1)];
    if (fn) fn();
    else SfxCombat.hit();
  },
  parry:     () => SfxCombat.parry(),
  crit:      () => SfxCombat.crit(),
  slash:     () => SfxCombat.slash(),
  orbCollect:   () => SfxCombat.orbCollect(),
  healOrb:      () => SfxCombat.healOrb(),
  healVampiric: () => SfxCombat.healVampiric(),
  healAbility:  () => SfxCombat.healAbility(),
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
  explosionStart:  () => SfxAbilities.explosionStart(),
  shieldAbsorb:    () => SfxAbilities.shieldAbsorb(),
  rangeBoostStart: () => SfxAbilities.rangeBoostStart(),
 slashAttack:     () => SfxAbilities.slashAttack(),
  oneHitSmash:     () => SfxCombat.oneHitSmash(),

  /* ── UI ── */
  levelUp:      () => SfxUi.levelUp(),
  abilityPick:  () => SfxUi.abilityPick(),
  shield:       () => SfxUi.shield(),
  click:        () => SfxUi.click(),
  hover:        () => SfxUi.hover(),
  back:         () => SfxUi.back(),
  error:        () => SfxUi.error(),
  pauseOpen:    () => SfxUi.pauseOpen(),
  pauseClose:   () => SfxUi.pauseClose(),
  mapSlide:     () => SfxUi.mapSlide(),
  mapConfirm:   () => SfxUi.mapConfirm(),
  cardHover:    () => SfxUi.cardHover(),
  cardPick:     () => SfxUi.cardPick(),
  countdown:    () => SfxUi.countdown(),
  countdownGo:  () => SfxUi.countdownGo(),
  mapComplete:  () => SfxUi.mapComplete(),
 transIn:      () => SfxUi.transIn(),
  transOut:     () => SfxUi.transOut(),
  slotTick:     () => SfxUi.slotTick(),
  slotStop:     () => SfxUi.slotStop(),
  slotWin:      () => SfxUi.slotWin(),
  slotNearMiss: () => SfxUi.slotNearMiss(),
 mapNormalRise:    () => SfxUi.mapNormalRise(),
  mapNormalCover:   () => SfxUi.mapNormalCover(),
  mapNormalFlash:   () => SfxUi.mapNormalFlash(),
  mapNormalReveal:  () => SfxUi.mapNormalReveal(),
  mapDimDrone:      () => SfxUi.mapDimDrone(),
  mapDimCracks:     () => SfxUi.mapDimCracks(),
  mapDimGlitch:     () => SfxUi.mapDimGlitch(),
  mapDimExplode:    () => SfxUi.mapDimExplode(),
  mapDimReveal:     () => SfxUi.mapDimReveal(),
  tutorialAlert: () => SfxUi.tutorialAlert(),
    stampSlam:     () => SfxUi.stampSlam(),
  progressTick:  (i, t) => SfxUi.progressTick(i, t),

 /* ── MUSIC ── */
  playMap:      (mapId) => Music.playMap(mapId),
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
  },
};