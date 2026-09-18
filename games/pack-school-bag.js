/* ============================================================
   GAME 40 — PACK MY SCHOOL BAG (Kehidupan Harian)
   Pilih barang yang diperlukan. Ada distractor!
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "pack-school-bag",
    name: "Pack My School Bag",
    icon: "🎒",
    cat: "kehidupan",
    engine: "multi",
    sticker: "🎒",
    desc: "Baca situasi dan pilih hanya barang yang diperlukan!",
    tasksPerLevel: 3,
    instruction: function (l, d) {
      return "Baca situasi, kemudian pilih semua barang yang diperlukan. Jangan masukkan barang yang tidak perlu!";
    },
    makeTask: function (level, diff, ctx) {
      var data = MK.Data.bank("routines").schoolbag || {};
      var scenarios = data.scenarios || [];
      var items = data.items || [];
      var sc = scenarios[(level - 1) % scenarios.length];

      var nDis = diff === "mudah" ? 2 : diff === "cabaran" ? 5 : 3;
      if (ctx.ease) nDis = Math.max(1, nDis - 1);
      var distract = MK.Gen.sample(sc.distractors, Math.min(nDis, sc.distractors.length));

      var essObjs = sc.essentials.map(function (n) {
        return items.find(function (it) { return it.n === n; });
      }).filter(Boolean);
      var disObjs = distract.map(function (n) {
        return items.find(function (it) { return it.n === n; });
      }).filter(Boolean);

      var choices = MK.Gen.shuffle(essObjs.concat(disObjs)).map(function (it) {
        return { id: it.n, label: it.n, emoji: it.e, needed: essObjs.indexOf(it) >= 0 };
      });
      return {
        key: "psb-" + sc.s.slice(0, 18) + "-" + diff,
        kind: "multi",
        prompt: "🎒 " + MK.esc(sc.s),
        sub: "Pilih " + essObjs.length + " barang yang diperlukan:",
        choices: choices,
        confirm: "🎒 Sedia Beg!",
        explain: "Barang penting: " + essObjs.map(function (e) { return e.n; }).join(", ") + "."
      };
    }
  });
})();
