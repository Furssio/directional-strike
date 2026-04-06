/* ═══════════════════════════════════════
   AUDIO.JS
   Sistema audio proceduale via Web Audio API.
   Tutti i suoni sono generati in tempo reale,
   zero file esterni.

   Dipende da: config.js (CONFIG.audio)
   Usato da: game.js, ui.js

   REGOLA: ogni suono è un metodo pubblico
   di SFX. Per aggiungere un suono nuovo
   aggiungi un metodo qui e chiamalo dove serve.

   COME FUNZIONA:
   - tone()  → genera un oscillatore con inviluppo ADSR
   - noise() → genera rumore bianco filtrato
   I suoni complessi combinano più tone() e noise()
   con setTimeout per sequenze temporali.

   AudioContext viene creato solo al primo
   SFX.init() — necessario per policy browser
   (non si può creare prima di un gesto utente).
   ═══════════════════════════════════════ */

const SFX = (() => {

  // contesto audio — null finché non viene chiamato init()
  let ctx = null;

  // volume master preso da CONFIG
  const vol = () => CONFIG.audio.volume;

  /* ── INIT ───────────────────────────────
     Da chiamare al primo gesto utente
     (click su "inizia partita" o simile).
     Sicuro chiamarlo più volte — fa niente
     se il contesto esiste già.
  ─────────────────────────────────────── */
  function init() {
    if (ctx) return;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) {
      console.warn('Web Audio API non disponibile', e);
    }
  }

  /* ── TONE ───────────────────────────────
     Genera un oscillatore con inviluppo ADSR.

     @param type     tipo onda: sine / square / sawtooth / triangle
     @param freq     frequenza iniziale in Hz
     @param freq2    frequenza finale (opzionale — crea sweep)
     @param duration durata totale in secondi
     @param attack   tempo salita in secondi
     @param decay    tempo discesa al sustain in secondi
     @param sustain  livello sustain (0.0 → 1.0 del peak)
     @param release  tempo discesa finale in secondi
     @param gain     volume (0.0 → 1.0, moltiplicato per vol())
     @param detune   detune in cents
  ─────────────────────────────────────── */
  function tone({
    type     = 'sine',
    freq     = 440,
    freq2    = null,
    duration = 0.15,
    attack   = 0.005,
    decay    = 0.05,
    sustain  = 0.6,
    release  = 0.1,
    gain     = 1.0,
    detune   = 0,
  } = {}) {
    if (!ctx || !CONFIG.audio.enabled) return;
    try {
      const g   = ctx.createGain();
      g.connect(ctx.destination);
      const now = ctx.currentTime;
      const pk  = gain * vol();

      // inviluppo ADSR
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(pk, now + attack);
      g.gain.linearRampToValueAtTime(pk * sustain, now + attack + decay);
      g.gain.setValueAtTime(pk * sustain, now + duration - release);
      g.gain.linearRampToValueAtTime(0, now + duration);

      const o = ctx.createOscillator();
      o.type          = type;
      o.detune.value  = detune;
      o.frequency.setValueAtTime(freq, now);
      if (freq2) o.frequency.linearRampToValueAtTime(freq2, now + duration);

      o.connect(g);
      o.start(now);
      o.stop(now + duration + 0.02);
    } catch(e) {}
  }

  /* ── NOISE ──────────────────────────────
     Genera rumore bianco filtrato.

     @param duration durata in secondi
     @param gain     volume (moltiplicato per vol())
     @param highpass frequenza highpass filter in Hz (0 = nessun filtro)
     @param lowpass  frequenza lowpass filter in Hz (20000 = nessun filtro)
  ─────────────────────────────────────── */
  function noise({
    duration = 0.1,
    gain     = 0.5,
    highpass = 0,
    lowpass  = 4000,
  } = {}) {
    if (!ctx || !CONFIG.audio.enabled) return;
    try {
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
      const d   = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);

      const src = ctx.createBufferSource();
      src.buffer = buf;

      const g = ctx.createGain();
      g.gain.value = gain * vol();
      src.connect(g);

      // catena filtri opzionale
      let last = g;
      if (highpass > 0) {
        const f = ctx.createBiquadFilter();
        f.type            = 'highpass';
        f.frequency.value = highpass;
        last.connect(f);
        last = f;
      }
      if (lowpass < 20000) {
        const f = ctx.createBiquadFilter();
        f.type            = 'lowpass';
        f.frequency.value = lowpass;
        last.connect(f);
        last = f;
      }

      last.connect(ctx.destination);
      src.start();
      src.stop(ctx.currentTime + duration + 0.02);
    } catch(e) {}
  }

  /* ══════════════════════════════════════
     SUONI PUBBLICI
     Ogni metodo corrisponde a un evento di gioco.
     ══════════════════════════════════════ */
  return {

    init,

    /* colpo a segno — nemico nel range colpito */
    hit() {
      tone({ type: 'square', freq: 180, freq2: 80, duration: 0.08, attack: 0.002, decay: 0.03, sustain: 0.3, release: 0.04, gain: 0.6 });
      noise({ duration: 0.05, gain: 0.25, highpass: 800, lowpass: 3000 });
    },

    /* nemico eliminato — doppio tono ascendente */
    kill() {
      tone({ type: 'sine', freq: 330, freq2: 520, duration: 0.18, attack: 0.005, decay: 0.06, sustain: 0.5, release: 0.08, gain: 0.8 });
      setTimeout(() =>
        tone({ type: 'sine', freq: 660, freq2: 880, duration: 0.14, attack: 0.003, decay: 0.05, sustain: 0.4, release: 0.06, gain: 0.5 })
      , 60);
    },

    /* danno ricevuto — impatto basso + rumore */
    damage() {
      tone({ type: 'sawtooth', freq: 120, freq2: 60, duration: 0.18, attack: 0.002, decay: 0.08, sustain: 0.2, release: 0.08, gain: 0.7 });
      noise({ duration: 0.12, gain: 0.4, highpass: 200, lowpass: 1500 });
    },

    /* scudo attivato — tono morbido breve */
    shield() {
      tone({ type: 'sine', freq: 520, freq2: 620, duration: 0.12, attack: 0.01, decay: 0.04, sustain: 0.5, release: 0.06, gain: 0.35 });
    },

    /* abilità speciale attivata — doppio tono acuto */
    special() {
      tone({ type: 'sine', freq: 880, freq2: 1200, duration: 0.25, attack: 0.01, decay: 0.08, sustain: 0.5, release: 0.12, gain: 0.6 });
      setTimeout(() =>
        tone({ type: 'sine', freq: 1100, freq2: 1400, duration: 0.2, attack: 0.005, decay: 0.06, sustain: 0.4, release: 0.1, gain: 0.4 })
      , 80);
    },

    /* barra speciale appena raggiunta 100% — ping breve */
    specialReady() {
      tone({ type: 'sine', freq: 1000, freq2: 1200, duration: 0.12, attack: 0.003, decay: 0.04, sustain: 0.4, release: 0.06, gain: 0.3 });
    },

    /* level up — fanfara a 4 note crescenti */
    levelUp() {
      const seq = [
        { f: 440, d: 0.10 },
        { f: 550, d: 0.10 },
        { f: 660, d: 0.10 },
        { f: 880, d: 0.18 },
      ];
      seq.forEach((s, i) =>
        setTimeout(() =>
          tone({ type: 'sine', freq: s.f, duration: s.d, attack: 0.005, decay: 0.04, sustain: 0.6, release: 0.06, gain: 0.55 })
        , i * 90)
      );
    },

    /* abilità scelta — conferma piacevole */
    abilityPick() {
      tone({ type: 'sine', freq: 660, freq2: 990, duration: 0.20, attack: 0.005, decay: 0.06, sustain: 0.5, release: 0.1, gain: 0.5 });
      setTimeout(() =>
        tone({ type: 'sine', freq: 990, duration: 0.15, attack: 0.003, decay: 0.05, sustain: 0.4, release: 0.08, gain: 0.35 })
      , 100);
    },

    /* proiettile sparato dal tank — whoosh discendente */
    bullet() {
      tone({ type: 'sine', freq: 800, freq2: 300, duration: 0.14, attack: 0.002, decay: 0.05, sustain: 0.3, release: 0.07, gain: 0.28 });
    },

    /* game over — caduta a 3 note discendenti */
    gameOver() {
      const seq = [
        { f: 330, d: 0.18 },
        { f: 220, d: 0.18 },
        { f: 165, d: 0.28 },
      ];
      seq.forEach((s, i) =>
        setTimeout(() =>
          tone({ type: 'sawtooth', freq: s.f, duration: s.d, attack: 0.005, decay: 0.08, sustain: 0.4, release: 0.1, gain: 0.45 })
        , i * 160)
      );
    },

    /* direzione premuta senza nemici nel range — click vuoto */
    miss() {
      tone({ type: 'sine', freq: 200, freq2: 160, duration: 0.07, attack: 0.002, decay: 0.03, sustain: 0.2, release: 0.03, gain: 0.2 });
    },

  };

})();