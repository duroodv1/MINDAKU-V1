/* ============================================================
   GAME 18 — SENTENCE TRAIN (Bahasa & Literasi)
   Susun perkataan menjadi ayat yang betul.
   Ali / makan / nasi → "Ali makan nasi." Kereta api bergerak!
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "sentence-train",
    name: "Sentence Train",
    icon: "🚂",
    cat: "bahasa",
    engine: "order",
    sticker: "🚃",
    desc: "Susun perkataan menjadi ayat yang betul. Kereta api akan bergerak!",
    tasksPerLevel: 4,
    instruction: function (l, d) {
      return "Ketuk perkataan mengikut urutan untuk membina ayat yang betul. Kereta api akan bergerak apabila ayat betul!";
    },
    makeTask: function (level, diff, ctx) {
      var bank = MK.Data.list("questions", "sentences");
      var maxLen = level <= 2 ? 3 : level <= 4 ? 4 : level <= 6 ? 5 : level <= 8 ? 6 : 7;
      var pool = bank.filter(function (s) { return s.words.length <= maxLen && s.words.length >= 3; });
      if (diff === "mudah") pool = bank.filter(function (s) { return s.words.length <= Math.max(3, maxLen - 1); });
      if (!pool.length) pool = bank;
      var s = MK.Gen.pickAvoid(pool, ctx.recentSentences || []);
      (ctx.recentSentences = ctx.recentSentences || []).push(s.display);
      if (ctx.recentSentences.length > 6) ctx.recentSentences.shift();

      var tokens = s.words.map(function (w, i) { return { id: "t" + i, label: w }; });
      var answer = tokens.map(function (t) { return t.id; });
      return {
        key: "st-" + s.display,
        kind: "order",
        prompt: "Susun ayat: <b>" + MK.esc(s.display) + "</b>",
        tokens: tokens,
        answer: answer,
        success: "train",
        explain: "Ayat yang tersusun: " + s.display
      };
    }
  });
})();
