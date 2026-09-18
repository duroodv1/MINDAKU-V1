/* ============================================================
   GAME 43 — SAFE OR UNSAFE? (Sosial & Keselamatan)
   Kenal situasi selamat / tidak selamat.
   Penerangan ringkas selepas setiap pilihan. Tidak menakutkan.
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "safe-unsafe",
    name: "Safe or Unsafe?",
    icon: "🚦",
    cat: "sosial",
    engine: "quiz",
    sticker: "🛡️",
    desc: "Kenal pasti situasi selamat dan tidak selamat, dengan penerangan ringkas.",
    tasksPerLevel: 5,
    instruction: function (l, d) {
      return "Baca situasi dan pilih SELAMAT atau TIDAK SELAMAT. Penerangan akan dipaparkan selepas itu!";
    },
    makeTask: function (level, diff, ctx) {
      var bank = MK.Data.list("safety", "safeUnsafe");
      var item = MK.Gen.pickAvoid(bank, ctx.recentSU || []);
      (ctx.recentSU = ctx.recentSU || []).push(item.s);
      if (ctx.recentSU.length > 8) ctx.recentSU.shift();

      return {
        key: "su-" + item.s,
        kind: "quiz",
        prompt: "🤔 " + MK.esc(item.s),
        sub: "Situasi ini selamat atau tidak?",
        choices: [
          { label: "✅ SELAMAT", correct: !!item.safe },
          { label: "⚠️ TIDAK SELAMAT", correct: !item.safe }
        ],
        explain: item.why
      };
    }
  });
})();
