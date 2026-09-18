/* ============================================================
   GAME 44 — ROAD SAFETY MISSION (Sosial & Keselamatan)
   Lampu isyarat, lintasan zebra, lihat kiri kanan,
   topi keledar, menunggu sebelum melintas.
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "road-safety",
    name: "Road Safety Mission",
    icon: "🚥",
    cat: "sosial",
    engine: "quiz",
    sticker: "🚸",
    desc: "Misi keselamatan jalan raya: isyarat, zebra, keledar dan banyak lagi!",
    tasksPerLevel: 5,
    instruction: function (l, d) {
      return "Selesaikan misi keselamatan jalan raya anda dengan memilih tindakan yang selamat!";
    },
    makeTask: function (level, diff, ctx) {
      var bank = MK.Data.list("safety", "road");

      // Level 4 & 8: susun langkah melintas dengan selamat
      if (level === 4 || (level === 8 && diff === "cabaran")) {
        var steps = [
          { id: "r1", label: "Berhenti di tepi jalan" },
          { id: "r2", label: "Lihat kiri dan kanan" },
          { id: "r3", label: "Tunggu jalan kosong / isyarat hijau" },
          { id: "r4", label: "Melintas di lintasan zebra" },
          { id: "r5", label: "Terus berjalan tanpa berlari" }
        ];
        if (diff === "mudah") steps = steps.slice(0, 3);
        return {
          key: "rs-order-" + diff,
          kind: "order",
          prompt: "Susun langkah untuk melintas jalan dengan <b>selamat</b>",
          tokens: MK.Gen.shuffle(steps),
          answer: steps.map(function (s) { return s.id; }),
          explain: "Berhenti → Lihat → Tunggu → Melintas → Berjalan. Selamat sentiasa!"
        };
      }

      var item = MK.Gen.pickAvoid(bank, ctx.recentRS || []);
      (ctx.recentRS = ctx.recentRS || []).push(item.q);
      if (ctx.recentRS.length > 8) ctx.recentRS.shift();

      var nCh = diff === "mudah" ? 2 : 3;
      var idxs = [item.answer].concat(
        MK.Gen.sample(item.choices.map(function (_, i) { return i; }).filter(function (i) { return i !== item.answer; }), nCh - 1)
      );
      var ch = idxs.map(function (i) { return { label: item.choices[i], correct: i === item.answer }; });
      return {
        key: "rs-" + item.q,
        kind: "quiz",
        prompt: "🚸 " + MK.esc(item.q),
        choices: MK.Gen.shuffle(ch),
        list: true,
        explain: item.why
      };
    }
  });
})();
