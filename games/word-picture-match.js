/* ============================================================
   GAME 16 — WORD PICTURE MATCH (Bahasa & Literasi)
   Padankan perkataan dengan gambar. 🍎 → EPAL
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "word-picture-match",
    name: "Word Picture Match",
    icon: "🔗",
    cat: "bahasa",
    engine: "match",
    sticker: "📖",
    desc: "Padankan perkataan dengan gambar yang betul.",
    tasksPerLevel: 3,
    instruction: function (l, d) {
      return "Ketuk satu perkataan di kiri, kemudian ketuk gambar yang sepadan di kanan.";
    },
    makeTask: function (level, diff, ctx) {
      var words = MK.Data.list("vocabulary", "words");
      var n = diff === "mudah" ? (ctx.ease ? 2 : 3) : diff === "cabaran" ? 5 : 4;
      var picked = MK.Gen.sample(words, n);
      var shuffledRight = MK.Gen.shuffle(picked.slice());
      return {
        key: "wpm-" + picked.map(function (p) { return p.w; }).sort().join("-"),
        kind: "match",
        prompt: "Padankan perkataan dengan gambar",
        pairs: shuffledRight.map(function (p) {
          return { a: { id: "w-" + p.w, label: p.w }, b: { id: "p-" + p.w, label: "", emoji: p.e } };
        }),
        explain: "Perkataan dan gambar yang sepadan membantu kita mengenal makna."
      };
    }
  });
})();
