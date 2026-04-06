/* ═══════════════════════════════════════
   ABILITIES.JS
   Pool completa delle abilità roguelite.
   Vengono proposte al giocatore a fine
   di ogni livello — ne sceglie 1 su 3.

   Dipende da: config.js
   Usato da: ui.js (showAbilityChoice)
             game.js (selectAbility)

   STRUTTURA DI OGNI ABILITÀ:
   {
     id:        stringa univoca — usata per evitare duplicati
     name:      nome mostrato in UI
     icon:      emoji
     exclusive: null = tutti i personaggi
                'warrior' / 'mage' / 'tank' = solo quel personaggio
     desc:      descrizione mostrata in UI
     effect(p): funzione che modifica il Player p
                viene chiamata una volta sola al momento della scelta
   }

   REGOLA: le abilità modificano solo il Player.
   Non chiamano mai funzioni di gioco direttamente,
   tranne updateRangeCircle() che è necessaria
   per aggiornare il cerchio visivo immediato.
   ═══════════════════════════════════════ */

const ABILITIES = [

  /* ══════════════════════════════════════
     ABILITÀ GENERICHE — disponibili per tutti
     ══════════════════════════════════════ */

  {
    id:        'hp_boost',
    name:      'Vitalità',
    icon:      '❤️',
    exclusive: null,
    desc:      'Recupera 25 HP e aumenta la vita massima del 10%.',
    effect(p) {
      p.maxHp = Math.round(p.maxHp * 1.10);
      p.hp    = Math.min(p.maxHp, p.hp + 25);
    },
  },

  {
    id:        'damage_up',
    name:      'Lama Affilata',
    icon:      '🗡️',
    exclusive: null,
    desc:      'I tuoi attacchi fanno il 20% di danno in più.',
    effect(p) {
      p.damageMult *= 1.20;
    },
  },

  {
    id:        'range_up',
    name:      'Lungo Braccio',
    icon:      '📡',
    exclusive: null,
    desc:      'Il range di attacco aumenta del 15%.',
    effect(p) {
      p.attackRangePct *= 1.15;
      // aggiorna subito il cerchio visivo nell'arena
      updateRangeCircle();
    },
  },

  {
    id:        'special_charge',
    name:      'Ricarica Rapida',
    icon:      '⚡',
    exclusive: null,
    desc:      'La barra speciale si carica il 30% più velocemente.',
    effect(p) {
      p.specialChargeMult = (p.specialChargeMult || 1) * 1.30;
    },
  },

  {
    id:        'combo_time',
    name:      'Concentrazione',
    icon:      '🔵',
    exclusive: null,
    desc:      'La combo dura 1.5 secondi in più prima di scadere.',
    effect(p) {
      p.comboDecayBonus = (p.comboDecayBonus || 0) + 1500;
    },
  },

  {
    id:        'shield_regen',
    name:      'Scudo Curativo',
    icon:      '🛡️',
    exclusive: null,
    desc:      'Quando attivi lo scudo recuperi 5 HP.',
    effect(p) {
      p.shieldHealAmt = (p.shieldHealAmt || 0) + 5;
    },
  },

  /* ══════════════════════════════════════
     ABILITÀ ESCLUSIVE — GUERRIERO
     ══════════════════════════════════════ */

  {
    id:        'warrior_slow_ext',
    name:      'Matrix',
    icon:      '🌀',
    exclusive: 'warrior',
    desc:      'Il Bullet Time dura 1 secondo in più.',
    effect(p) {
      p.charDef.special.duration += 1000;
    },
  },

  {
    id:        'warrior_heavy',
    name:      'Colpo Pesante',
    icon:      '💥',
    exclusive: 'warrior',
    desc:      'Ogni colpo ha il 15% di probabilità di stordire il nemico per 1s.',
    effect(p) {
      p.stunChance = (p.stunChance || 0) + 0.15;
    },
  },

  /* ══════════════════════════════════════
     ABILITÀ ESCLUSIVE — MAGO
     ══════════════════════════════════════ */

  {
    id:        'mage_pierce_ext',
    name:      'Raggio Eterno',
    icon:      '✨',
    exclusive: 'mage',
    desc:      'Il Piercing dura 1.5 secondi in più.',
    effect(p) {
      p.charDef.special.duration += 1500;
    },
  },

  {
    id:        'mage_double',
    name:      'Doppio Raggio',
    icon:      '🔮',
    exclusive: 'mage',
    desc:      'Gli attacchi normali colpiscono anche le direzioni adiacenti.',
    effect(p) {
      p.doubleAttack = true;
    },
  },

  /* ══════════════════════════════════════
     ABILITÀ ESCLUSIVE — TANK
     ══════════════════════════════════════ */

  {
    id:        'tank_fort_ext',
    name:      'Bunker',
    icon:      '🔰',
    exclusive: 'tank',
    desc:      'La Fortezza dura 2 secondi in più.',
    effect(p) {
      p.charDef.special.duration += 2000;
    },
  },

  {
    id:        'tank_thorns',
    name:      'Spine',
    icon:      '🌵',
    exclusive: 'tank',
    desc:      'Durante la Fortezza i nemici a contatto prendono danno.',
    effect(p) {
      p.thorns = true;
    },
  },

];