/* ============================================================
   GAME 20 — WORD ANALOGY (Bahasa & Literasi)
   Latihan hubungan perkataan. Panas : Matahari :: Sejuk : ?
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "word-analogy",
    name: "Word Analogy",
    icon: "🧠",
    cat: "bahasa",
    engine: "quiz",
    sticker: "💡",
    desc: "Cari hubungan antara perkataan dan lengkapkan analogi.",
    tasksPerLevel: 5,
    instruction: function (l, d) {
      return "Lihat hubungan sepasang perkataan pertama, kemudian pilih pasangan yang sepadan.";
    },
    makeTask: function (level, diff, ctx) {
      var bank = MK.Data.list("questions", "analogies");
      var nCh = diff === "mudah" ? (ctx.ease ? 2 : 3) : diff === "cabaran" ? 4 : 3;
      var a = MK.Gen.pickAvoid(bank, ctx.recentAn || []);
      (ctx.recentAn = ctx.recentAn || []).push(a);
      if (ctx.recentAn.length > 8) ctx.recentAn.shift();

      var others = MK.Gen.sample(bank.filter(function (x) { return x.d !== a.d; }), nCh - 1);
      var ch = [{ label: a.d, correct: true }].concat(others.map(function (o) { return { label: o.d, correct: false }; }));
      return {
        key: "wa-" + a.a + a.c,
        kind: "quiz",
        prompt: "<b>" + a.a + " : " + a.b + "</b><br><b>" + a.c + " : ?</b>",
        sub: "Apakah perkataan yang sepadan?",
        choices: MK.Gen.shuffle(ch),
        list: true,
        explain: a.a + " berkaitan dengan " + a.b + ", seperti " + a.c + " berkaitan dengan " + a.d + "."
      };
    }
  });
})();
