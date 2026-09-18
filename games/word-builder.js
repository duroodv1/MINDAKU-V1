/* ============================================================
   GAME 19 — WORD BUILDER (Bahasa & Literasi)
   Susun huruf menjadi perkataan. A → Y → A → M = AYAM
   ============================================================ */
"use strict";
(function () {
  var ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  MK.registerGame({
    id: "word-builder",
    name: "Word Builder",
    icon: "🧱",
    cat: "bahasa",
    engine: "order",
    sticker: "🔠",
    desc: "Susun huruf membentuk perkataan yang betul.",
    tasksPerLevel: 4,
    instruction: function (l, d) {
      return "Ketuk huruf satu demi satu untuk membina perkataan. Petunjuk gambar akan membantu anda!";
    },
    makeTask: function (level, diff, ctx) {
      var bank = MK.Data.list("vocabulary", "spell");
      var maxLen = level <= 2 ? 4 : level <= 4 ? 5 : level <= 6 ? 6 : level <= 8 ? 7 : 9;
      var pool = bank.filter(function (w) { return w.w.length <= maxLen && w.w.length >= 3; });
      if (diff === "cabaran") pool = bank.filter(function (w) { return w.w.length >= 5; });
      if (!pool.length) pool = bank;
      var item = MK.Gen.pickAvoid(pool, ctx.recentWords || []);
      (ctx.recentWords = ctx.recentWords || []).push(item.w);
      if (ctx.recentWords.length > 6) ctx.recentWords.shift();

      var letters = item.w.split("");
      var nDis = diff === "mudah" ? 0 : diff === "cabaran" ? 3 : 1;
      var extras = MK.Gen.sample(ALPHABET.filter(function (a) { return letters.indexOf(a) < 0; }), nDis);
      var tokens = MK.Gen.shuffle(letters.concat(extras)).map(function (L, i) { return { id: "L" + i, label: L }; });

      /* jawapan: huruf perkataan mengikut urutan — padankan dengan token
         yang membawa huruf tersebut (gelintar mengikut kedudukan) */
      var used = {};
      var answer = [];
      letters.forEach(function (L) {
        for (var i = 0; i < tokens.length; i++) {
          if (tokens[i].label === L && !used[i]) { used[i] = 1; answer.push(tokens[i].id); break; }
        }
      });
      return {
        key: "wb-" + item.w,
        kind: "order",
        prompt: "Bina perkataan: " + item.e + " <i style='color:var(--ink-faint)'>(" + item.w.length + " huruf)</i>",
        tokens: tokens,
        answer: answer,
        explain: "Perkataan yang betul ialah " + item.w + "!"
      };
    }
  });
})();
