/* ============================================================
   MINDAKU V.1 — tts.js
   Suara (Text-to-Speech) pilihan. Jika tidak disokong / gagal,
   aplikasi terus berjalan tanpa suara.
   ============================================================ */
"use strict";
MK.TTS = (function () {
  var voice = null, voiceChecked = false;

  function supported() {
    try { return "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined"; }
    catch (e) { return false; }
  }

  function pickVoice() {
    if (!supported()) return null;
    if (voiceChecked && voice) return voice;
    try {
      var vs = speechSynthesis.getVoices() || [];
      // Utamakan suara Bahasa Melayu (ms / ms-MY), kemudian Indonesia (id)
      voice = vs.find(function (v) { return /^ms/i.test(v.lang); })
           || vs.find(function (v) { return /^id/i.test(v.lang); })
           || null;
      voiceChecked = true;
    } catch (e) { voice = null; }
    return voice;
  }
  if (supported()) {
    try { speechSynthesis.onvoiceschanged = function () { voiceChecked = false; pickVoice(); }; } catch (e) { }
  }

  /* Baca teks dengan sopan; panggilan berturut-turut dibatalkan. */
  function speak(text, opts) {
    try {
      if (!supported() || !MK.Settings.get("voice")) return false;
      if (!text) return false;
      var u = new SpeechSynthesisUtterance(String(text));
      var v = pickVoice();
      if (v) u.voice = v;
      u.lang = (v && v.lang) || "ms-MY";
      u.rate = opts && opts.rate ? opts.rate : 0.95;
      u.pitch = opts && opts.pitch ? opts.pitch : 1.05;
      u.volume = 0.9;
      try { speechSynthesis.cancel(); } catch (e) { }
      speechSynthesis.speak(u);
      return true;
    } catch (e) { return false; }
  }

  function stop() {
    try { if (supported()) speechSynthesis.cancel(); } catch (e) { }
  }

  return { speak: speak, stop: stop, supported: supported, hasMalayVoice: function () { return !!pickVoice(); } };
})();
