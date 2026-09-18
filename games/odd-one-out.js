/* ============================================================
   GAME 27 — ODD ONE OUT (Logik & Penyelesaian Masalah)
   Cari objek yang tidak tergolong dalam kumpulan.
   🍎 🍌 🍊 🚗 → 🚗
   ============================================================ */
"use strict";
(function () {
  /* Kumpulan janaan + bank */
  var GEN_GROUPS = [
    { items: ["🍎", "🍌", "🍊", "🍇", "🍓", "🍉"], odd: "🚗", why: "Kereta bukan buah-buahan." },
    { items: ["🐶", "🐱", "🐰", "🐹", "🐴", "🐮"], odd: "🍕", why: "Pizza bukan haiwan." },
    { items: ["🚗", "🚌", "🚲", "✈️", "⛵", "🚂"], odd: "🌳", why: "Pokok bukan kenderaan." },
    { items: ["⚽", "🏀", "🎾", "🏐", "🏓", "🎱"], odd: "🥕", why: "Lobak bukan peralatan permainan bola." },
    { items: ["🥕", "🥔", "🥬", "🌽", "🥦", "🧅"], odd: "🍩", why: "Donat bukan sayur-sayuran." },
    { items: ["👕", "👖", "🧦", "🧢", "🧣", "👗"], odd: "🍦", why: "Aiskrim bukan pakaian." },
    { items: ["📚", "✏️", "📏", "🎒", "📝", "🖍️"], odd: "🍌", why: "Pisang bukan alat tulis." },
    { items: ["☀️", "🌙", "⭐", "☁️", "🌈", "⚡"], why: "Kerusi bukan objek di langit.", odd: "🪑" },
    { items: ["🥁", "🎸", "🎻", "🎹", "🎺", "🪕"], odd: "🧁", why: "Kek bukan alat muzik." },
    { items: ["🐸", "🐟", "🦆", "🐢", "🦈", "🐙"], odd: "🐄", why: "Lembu tidak hidup di air." },
    { items: ["🏠", "🏢", "🏫", "🏥", "🏪", "🏰"], odd: "🍑", why: "Buah peach bukan bangunan." },
    { items: ["🌧️", "⛈️", "🌈", "☃️", "🌪️", "🌫️"], odd: "🔥", why: "Api bukan cuaca langit." }
  ];

  MK.registerGame({
    id: "odd-one-out",
    name: "Odd One Out",
    icon: "🤔",
    cat: "logik",
    engine: "quiz",
    sticker: "🎯",
    desc: "Cari objek yang tidak sepadan dengan kumpulannya.",
    tasksPerLevel: 5,
    instruction: function (l, d) {
      return "Lihat kumpulan objek dan ketuk objek yang TIDAK tergolong dalam kumpulan itu.";
    },
    makeTask: function (level, diff, ctx) {
      var bank = MK.Data.list("questions", "oddOne");
      var all = GEN_GROUPS.concat(bank.filter(function (g) { return g.items && g.items.indexOf(g.odd) >= 0; }));
      var g = MK.Gen.pickAvoid(all, ctx.recentOdd || []);
      (ctx.recentOdd = ctx.recentOdd || []).push(g.why);
      if (ctx.recentOdd.length > 8) ctx.recentOdd.shift();

      var nItems = diff === "mudah" ? 4 : diff === "cabaran" ? 6 : 5;
      var pool = (g.items || []).filter(function (x) { return x !== g.odd; });
      var items = MK.Gen.sample(pool, nItems - 1).concat([g.odd]);
      items = MK.Gen.shuffle(items);

      var ch = items.map(function (em) { return { label: '<span class="cem" style="font-size:2.4rem">' + em + "</span>", correct: em === g.odd }; });
      return {
        key: "ooo-" + g.why,
        kind: "quiz",
        prompt: "Yang mana satu <b>tidak tergolong</b> dalam kumpulan?",
        choices: ch,
        explain: g.why
      };
    }
  });
})();
