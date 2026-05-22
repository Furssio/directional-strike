/* ═══════════════════════════════════════
   CHALLENGESCREEN.JS
   Builds the challenge pre-game screen.
   Shows map13_dark card, best wave record,
   and static dark dimension background.

   Used by: input.js
   Depends on: ChallengeDirector
   ═══════════════════════════════════════ */

const CHALLENGE_BG = 'assets/maps/map13_dark/background_01.webp';

function buildChallengeScreen() {
  // set card background
  const card = document.getElementById('challenge-card');
  if (card) {
    card.style.backgroundImage = `url('${CHALLENGE_BG}')`;
  }

  // set demo background — static, no DemoMode
  const demo = document.getElementById('challenge-demo');
  if (demo) {
    demo.style.backgroundImage = `url('${CHALLENGE_BG}')`;
  }

  // best wave record
  const bestEl = document.getElementById('challenge-best');
  if (bestEl) {
    const best = ChallengeDirector.getBestWave();
    bestEl.textContent = best > 0 ? 'BEST: WAVE ' + best : '';
  }
}