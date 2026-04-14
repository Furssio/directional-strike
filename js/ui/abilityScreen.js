/* ═══════════════════════════════════════
   ABILITYSCREEN.JS
   Ability selection screen.
   Shows all registered abilities, lets
   the player pick one to equip.
   Saves choice in localStorage.

   Used by: input.js
   Depends on: dom.js, AbilityRegistry
   ═══════════════════════════════════════ */

const ABILITY_STORAGE_KEY = 'ds_ability';
const DEFAULT_ABILITY_ID  = 'bullet_time';

/* ── PERSISTENCE ── */

function getEquippedAbility() {
  return localStorage.getItem(ABILITY_STORAGE_KEY) || DEFAULT_ABILITY_ID;
}

function saveEquippedAbility(id) {
  localStorage.setItem(ABILITY_STORAGE_KEY, id);
}

/* ── BUILD SCREEN ── */

function buildAbilityScreen() {
  const list = document.getElementById('ability-list');
  list.innerHTML = '';

  const equipped = getEquippedAbility();
  const all      = AbilityRegistry.all();

  all.forEach(ab => {
    const card = document.createElement('div');
    card.className = 'ability-option' + (ab.id === equipped ? ' selected' : '');
    card.style.setProperty('--ab-color', ab.barColor);

    card.innerHTML = `
      <div class="ability-icon-big">${ab.icon}</div>
      <div class="ability-info-big">
        <div class="ability-name-big">${ab.name}</div>
        <div class="ability-desc-big">${ab.desc}</div>
      </div>
      <div class="ability-check">✓</div>
    `;

    card.addEventListener('click', () => {
      saveEquippedAbility(ab.id);
      buildAbilityScreen();
    });

    list.appendChild(card);
  });
}