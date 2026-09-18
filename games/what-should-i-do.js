/* ============================================================
   GAME 45 — WHAT SHOULD I DO? (Sosial & Keselamatan)
   Membuat keputusan berdasarkan situasi. Pilihan neutral,
   tanpa visual menakutkan.
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "what-should-i-do",
    name: "What Should I Do?",
    icon: "🧭",
    cat: "sosial",
    engine: "quiz",
    sticker: "🌟",
    desc: "Berfikir dan pilih tindakan yang paling sesuai untuk setiap situasi.",
    tasksPerLevel: 4,
    instruction: function (l, d) {
      return "Baca situasi dan pilih tindakan yang paling sesuai. Semua jawapan akan diterangkan!";
    },
    makeTask: function (level, diff, ctx) {
      var bank = MK.Data.list("safety", "whatDo");
      var item = MK.Gen.pickAvoid(bank, ctx.recentWD || []);
      (ctx.recentWD = ctx.recentWD || []).push(item.s);
      if (ctx.recentWD.length > 6) ctx.recentWD.shift();

      var opts = item.options.slice();
      if (diff === "mudah" && opts.length > 2) {
        // kekal pilihan betul + satu salah
        var best = opts.find(function (o) { return o.best; });
        var oneWrong = opts.find(function (o) { return !o.best; });
        opts = [best, oneWrong];
      }
      var ch = opts.map(function (o) { return { label: o.t, correct: !!o.best, why: o.why }; });
      return {
        key: "wd-" + item.s,
        kind: "quiz",
        prompt: "🤔 " + MK.esc(item.s),
        sub: "Apakah tindakan yang paling sesuai?",
        choices: MK.Gen.shuffle(ch),
        list: true,
        explain: "Tindakan terbaik: " + item.options.find(function (o) { return o.best; }).t + " — " + item.options.find(function (o) { return o.best; }).why
      };
    }
  });
})();
