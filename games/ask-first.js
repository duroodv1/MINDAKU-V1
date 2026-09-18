/* ============================================================
   GAME 42 — ASK FIRST (Sosial & Keselamatan)
   Latihan meminta izin dengan sopan.
   "Bolehkah saya guna pensel awak?"
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "ask-first",
    name: "Ask First",
    icon: "🙏",
    cat: "sosial",
    engine: "quiz",
    sticker: "🤝",
    desc: "Latih diri meminta izin sebelum menggunakan barang orang lain.",
    tasksPerLevel: 4,
    instruction: function (l, d) {
      return "Pilih cara yang paling sopan dan bersopan untuk meminta izin!";
    },
    makeTask: function (level, diff, ctx) {
      var bank = MK.Data.list("safety", "askFirst");
      var item = MK.Gen.pickAvoid(bank, ctx.recentAF || []);
      (ctx.recentAF = ctx.recentAF || []).push(item.s);
      if (ctx.recentAF.length > 6) ctx.recentAF.shift();

      var nWrong = diff === "mudah" ? 1 : 2;
      var wrongs = MK.Gen.sample(item.wrong, Math.min(nWrong, item.wrong.length));
      var ch = [{ label: "🙏 " + item.correct, correct: true }]
        .concat(wrongs.map(function (w) { return { label: "🙅 " + w, correct: false }; }));
      return {
        key: "af-" + item.s,
        kind: "quiz",
        prompt: MK.esc(item.s),
        sub: "Apakah cara terbaik untuk meminta izin?",
        choices: MK.Gen.shuffle(ch),
        list: true,
        explain: "Meminta izin menunjukkan rasa hormat kita kepada orang lain."
      };
    }
  });
})();
