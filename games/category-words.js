/* ============================================================
   GAME 17 — CATEGORY WORDS (Bahasa & Literasi)
   Kategorikan perkataan: Haiwan / Makanan / Pengangkutan...
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "category-words",
    name: "Category Words",
    icon: "🗂️",
    cat: "bahasa",
    engine: "sort",
    sticker: "🗃️",
    desc: "Masukkan setiap perkataan ke dalam kumpulan yang betul.",
    tasksPerLevel: 2,
    instruction: function (l, d) {
      return "Ketuk perkataan, kemudian ketuk kategori yang betul untuknya.";
    },
    makeTask: function (level, diff, ctx) {
      var cats = MK.Data.bank("vocabulary").categories || {};
      var catKeys = Object.keys(cats);
      var nCats = diff === "mudah" ? 2 : diff === "cabaran" ? Math.min(4, catKeys.length) : 3;
      var chosen = MK.Gen.sample(catKeys, nCats);
      var perCat = diff === "mudah" ? 1 : diff === "cabaran" ? 3 : 2;
      if (ctx.ease) perCat = Math.max(1, perCat - 1);

      var bins = chosen.map(function (k) { return { id: k, label: cats[k].label, emoji: cats[k].emoji }; });
      var items = [];
      chosen.forEach(function (k) {
        MK.Gen.sample(cats[k].items, perCat).forEach(function (w, i) {
          var full = MK.Data.list("vocabulary", "words").find(function (x) { return x.w === w; });
          items.push({ id: k + "-" + w + i, label: w, emoji: full ? full.e : "🔤", bin: k });
        });
      });
      return {
        key: "cw-" + items.map(function (i) { return i.label; }).sort().join("-"),
        kind: "sort",
        prompt: "Kategorikan perkataan",
        bins: bins,
        items: items,
        explain: "Mengelompokkan perkataan membantu kita memahami maksudnya."
      };
    }
  });
})();
