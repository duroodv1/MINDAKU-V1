/* ============================================================
   MINDAKU V.1 — audio.js
   Semua bunyi dijana secara sintesis (WebAudio) — tiada fail
   audio luar, 100% offline. Lembut, tidak mengejutkan, gagal
   secara senyap (permainan tetap berjalan).
   ============================================================ */
"use strict";
MK.Audio = (function () {
  var ctx = null, master = null, unlocked = false;
  var VOL = 0.5;

  function unlock() {
    try {
      if (unlocked) return;
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!ctx) { ctx = new AC(); master = ctx.createGain(); master.gain.value = VOL; master.connect(ctx.destination); }
      if (ctx.state === "suspended") ctx.resume();
      unlocked = true;
    } catch (e) { /* tiada audio — teruskan */ }
  }
  function ok() { return unlocked && ctx && MK.Settings.get("sfx"); }
  function now() { return ctx.currentTime; }

  /* Nada asas dengan envelope lembut */
  function tone(freq, start, dur, type, vol, endFreq) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(freq, start);
    if (endFreq) o.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), start + dur);
    g.gain.setValueAtTime(0.0001, start);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, start + Math.min(0.05, dur / 3));
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    o.connect(g); g.connect(master);
    o.start(start); o.stop(start + dur + 0.05);
  }
  /* Hingar (untuk hujan, angin, ombak) */
  function noise(start, dur, vol, filterFreq, sweepTo) {
    var len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    var src = ctx.createBufferSource(); src.buffer = buf;
    var f = ctx.createBiquadFilter(); f.type = "lowpass";
    f.frequency.setValueAtTime(filterFreq || 900, start);
    if (sweepTo) f.frequency.linearRampToValueAtTime(sweepTo, start + dur);
    var g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(vol || 0.1, start + dur * 0.3);
    g.gain.linearRampToValueAtTime(0.0001, start + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(start); src.stop(start + dur + 0.05);
  }

  /* ----- Resipi bunyi permainan ----- */
  var SFX = {
    tap: function (t) { tone(660, t, 0.06, "sine", 0.08); },
    pop: function (t) { tone(520, t, 0.09, "triangle", 0.14, 780); },
    flip: function (t) { tone(440, t, 0.07, "triangle", 0.1, 560); },
    good: function (t) { tone(523, t, 0.12, "sine", 0.14); tone(659, t + 0.09, 0.14, "sine", 0.14); tone(784, t + 0.18, 0.22, "sine", 0.12); },
    win: function (t) { [523, 587, 659, 784, 1046].forEach(function (f, i) { tone(f, t + i * 0.11, 0.26, "sine", 0.12); }); },
    retry: function (t) { tone(392, t, 0.16, "sine", 0.1, 330); },
    star: function (t) { tone(880, t, 0.1, "triangle", 0.12); tone(1174, t + 0.08, 0.16, "triangle", 0.1); },
    coin: function (t) { tone(988, t, 0.07, "square", 0.06); tone(1319, t + 0.06, 0.16, "square", 0.05); },
    hint: function (t) { tone(587, t, 0.1, "sine", 0.1); tone(784, t + 0.09, 0.14, "sine", 0.1); },
    drum: function (t) { noise(t, 0.08, 0.22, 400); tone(150, t, 0.12, "sine", 0.24, 90); },
    place: function (t) { tone(300, t, 0.08, "triangle", 0.12, 240); },
    match: function (t) { tone(587, t, 0.1, "sine", 0.12); tone(880, t + 0.08, 0.14, "sine", 0.12); },
    chime: function (t) { tone(784, t, 0.4, "sine", 0.1); tone(988, t + 0.02, 0.44, "sine", 0.06); }
  };
  function sfx(name) {
    try {
      if (!ok()) return;
      unlock();
      var fn = SFX[name] || SFX.tap;
      fn(now());
    } catch (e) { /* gagal senyap */ }
  }

  /* ----- Bunyi tema (untuk permainan auditori) ----- */
  var SOUNDS = {
    moo: function (t) { tone(147, t, 0.5, "sawtooth", 0.11, 110); tone(220, t, 0.5, "sine", 0.06, 165); },
    meow: function (t) { tone(620, t, 0.14, "sawtooth", 0.08, 480); tone(540, t + 0.16, 0.28, "sawtooth", 0.08, 700); },
    quack: function (t) { tone(300, t, 0.12, "square", 0.07, 340); tone(280, t + 0.14, 0.12, "square", 0.07, 320); },
    chirp: function (t) { for (var i = 0; i < 3; i++) tone(1800 + i * 120, t + i * 0.14, 0.07, "sine", 0.08, 2400); },
    owl: function (t) { tone(349, t, 0.28, "sine", 0.11); tone(311, t + 0.3, 0.34, "sine", 0.11); },
    frog: function (t) { tone(110, t, 0.1, "sawtooth", 0.12, 90); tone(110, t + 0.12, 0.1, "sawtooth", 0.12, 90); },
    engine: function (t) { tone(65, t, 1.0, "sawtooth", 0.09, 58); noise(t, 1.0, 0.05, 300); },
    horn: function (t) { tone(440, t, 0.3, "square", 0.05); tone(554, t, 0.3, "square", 0.05); },
    siren: function (t) { for (var i = 0; i < 2; i++) { tone(600, t + i * 0.6, 0.3, "sine", 0.07, 900); tone(900, t + i * 0.6 + 0.3, 0.3, "sine", 0.07, 600); } },
    train: function (t) { tone(98, t, 1.2, "sawtooth", 0.09, 92); noise(t, 1.2, 0.04, 250); tone(392, t + 0.2, 0.5, "square", 0.04); },
    boat: function (t) { tone(110, t, 0.9, "sawtooth", 0.08, 98); tone(220, t + 0.3, 0.6, "sine", 0.05); },
    rain: function (t) { noise(t, 1.6, 0.09, 1600, 1200); },
    wind: function (t) { noise(t, 1.8, 0.08, 500, 900); },
    wave: function (t) { noise(t, 1.2, 0.1, 700, 250); noise(t + 1.1, 1.0, 0.07, 500, 200); },
    thunder: function (t) { noise(t, 1.1, 0.16, 180, 60); tone(55, t, 0.9, "sine", 0.1, 40); },
    bee: function (t) { tone(220, t, 0.9, "sawtooth", 0.05, 260); tone(226, t, 0.9, "sawtooth", 0.05, 265); },
    bell: function (t) { tone(1319, t, 0.5, "sine", 0.1); tone(1976, t, 0.35, "sine", 0.04); },
    clock: function (t) { for (var i = 0; i < 4; i++) noise(t + i * 0.3, 0.03, 0.12, 2000); },
    drum: function (t) { noise(t, 0.1, 0.2, 400); tone(150, t, 0.14, "sine", 0.2, 90); },
    pop: function (t) { tone(400, t, 0.08, "triangle", 0.13, 700); },
    note_hi: function (t) { tone(880, t, 0.45, "sine", 0.14); },
    note_lo: function (t) { tone(220, t, 0.45, "sine", 0.14); },
    note_mid: function (t) { tone(440, t, 0.45, "sine", 0.14); }
  };
  /* Main bunyi tema. `vol` 0..1 */
  function playSound(recipe, when, vol) {
    try {
      if (!unlocked || !ctx) return false;
      var fn = SOUNDS[recipe];
      if (!fn) return false;
      var t = when != null ? when : now();
      fn(t);
      return true;
    } catch (e) { return false; }
  }
  /* Betul-betul main walau SFX OFF? (permainan auditori perlu bunyi)
     Guna tetapan voice sebagai "audio permainan auditori" jika sfx off. */
  function playGameSound(recipe) {
    try {
      unlock();
      if (!ctx) return false;
      return playSound(recipe);
    } catch (e) { return false; }
  }

  /* ----- Muzik latar lembut (pentatonik) — OFF sedia kala ----- */
  var musicTimer = null, musicStep = 0;
  var PENTA = [261.6, 293.7, 329.6, 392.0, 440.0, 523.3];
  function startMusic() {
    try {
      unlock();
      if (musicTimer || !ctx) return;
      var tick = function () {
        try {
          if (!MK.Settings.get("music")) { stopMusic(); return; }
          var t = now();
          var f = PENTA[Math.floor(Math.random() * PENTA.length)];
          var o = ctx.createOscillator(), g = ctx.createGain();
          o.type = "sine"; o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(0.035, t + 0.8);
          g.gain.linearRampToValueAtTime(0.0001, t + 3.2);
          o.connect(g); g.connect(master);
          o.start(t); o.stop(t + 3.4);
        } catch (e) { }
      };
      tick();
      musicTimer = setInterval(tick, 2600);
    } catch (e) { }
  }
  function stopMusic() {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  }

  /* Main nada pada frekuensi tertentu (untuk permainan nada) */
  function playFreq(freq, dur) {
    try {
      unlock();
      if (!ctx) return false;
      tone(freq, now(), dur || 0.55, "sine", 0.16);
      return true;
    } catch (e) { return false; }
  }

  return {
    unlock: unlock, sfx: sfx, playSound: playSound, playGameSound: playGameSound, playFreq: playFreq,
    startMusic: startMusic, stopMusic: stopMusic, supported: function () { return !!(window.AudioContext || window.webkitAudioContext); }
  };
})();
