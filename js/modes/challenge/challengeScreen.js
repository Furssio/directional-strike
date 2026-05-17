/* ═══════════════════════════════════════
   CHALLENGESCREEN.JS
   Builds the challenge pre-game screen.
   Shows map13_dark card, best wave record,
   and starts DemoMode with dark dimension bg.

   Used by: input.js
   Depends on: DemoMode, ChallengeDirector
   ═══════════════════════════════════════ */

const CHALLENGE_BG = 'assets/maps/map13_dark/background_01.png';

function buildChallengeScreen() {
  // set card background
  const card = document.getElementById('challenge-card');
  if (card) {
    card.style.backgroundImage = `url('${CHALLENGE_BG}')`;
  }

  // set demo background
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

  // start demo mode in the challenge demo area
  DemoMode.start('challenge-demo', { autoRotate: false });
  DemoMode.setMap(CHALLENGE_BG);
}