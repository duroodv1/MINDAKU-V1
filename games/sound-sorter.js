/* ============================================================
   GAME 06 — SOUND SORTER (Auditori & Fonologi)
   Dengar bunyi dan kategorikan: haiwan, kenderaan, alam, objek.
   Bunyi dijana secara sintesis — berfungsi offline.
   ============================================================ */
"use strict";
(function () {
  var CATS = [
    { id: "haiwan", label: "Haiwan", emoji: "🐾" },
    { id: "kenderaan", label: "Kenderaan", emoji: "🚗" },
    { id: "alam", label: "Alam", emoji: "🌳" },
    { id: "objek", label: "Objek", emoji: "🔔" }
  ];
  function playIt(it) {
    var ok = MK.Audio.playGameSound(it.recipe);
    if (!ok) MK.toast("Bunyi tidak tersedia — lihat label selepas memilih 💡");
  }

  MK.registerGame({
    id: "sound-sorter",
    name: "Sound Sorter",
    icon: "🎧",
    cat: "auditori",
    engine: "sort",
    sticker: "👂",
    desc: "Dengar bunyi dan masukkannya ke kategori yang betul.",
    tasksPerLevel: 2,
    instruction: function (l, d) {
      return "Ketuk 🔊 untuk mendengar bunyi, kemudian ketuk kotak kategori yang betul.";
    },
    makeTask: function (level, diff, ctx) {
      var items = MK.Data.list("sounds", "items");
      var nBins = diff === "mudah" ? 2 : diff === "cabaran" ? 4 : 3;
      var perBoard = diff === "mudah" ? 3 : diff === "cabaran" ? 6 : 4;
      if (ctx.ease) perBoard = Math.max(2, perBoard - 1);
      var bins = MK.Gen.sample(CATS, nBins);
      var pool = items.filter(function (i) { return bins.some(function (b) { return b.id === i.cat; }); });
      var chosen = MK.Gen.sample(pool, Math.min(perBoard, pool.length));
      return {
        key: "ss-" + chosen.map(function (c) { return c.id; }).sort().join("-"),
        kind: "sort",
        prompt: "Dengar dan pilih kategori bunyi",
        bins: bins,
        items: chosen.map(function (c, i) {
          return { id: c.id + i, label: "Bunyi", face: "🔊", emoji: c.emoji, bin: c.cat, recipe: c.recipe, item: c };
        }),
        onPick: function (it) { playIt(it.item); },
        explain: "Setiap bunyi mempunyai sumbernya sendiri — haiwan, kenderaan, alam atau objek."
      };
    }
  });
})();
