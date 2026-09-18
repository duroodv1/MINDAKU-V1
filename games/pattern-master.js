/* ============================================================
   GAME 28 — PATTERN MASTER (Logik & Penyelesaian Masalah)
   Lengkapkan pola: AB, AAB, ABB, ABC, AABB, ABBC,
   pola pelbagai atribut & pola nombor.
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "pattern-master",
    name: "Pattern Master",
    icon: "🔁",
    cat: "logik",
    engine: "quiz",
    sticker: "🧿",
    desc: "Cari objek seterusnya untuk melengkapkan pola.",
    tasksPerLevel: 5,
    instruction: function (l, d) {
      return "Lihat pola dan ketuk objek yang datang seterusnya!";
    },
    makeTask: function (level, diff, ctx) {
      var data = MK.Data.bank("patterns") || {};
      var types = data.types || ["AB", "AAB", "ABB", "ABC", "AABB", "ABBC"];
      var attrKeys = ["warna", "bentuk", "haiwan", "buah"];
      var attrs = data.attrs || {};
      // jenis pola mengikut level
      var typeIdx = Math.min(types.length - 1, Math.floor((level - 1) / 2));
      if (diff === "cabaran") typeIdx = Math.min(types.length - 1, typeIdx + 1);
      if (diff === "mudah") typeIdx = Math.max(0, typeIdx - 1);
      if (ctx.ease) typeIdx = 0;
      var type = types[typeIdx];

      var useNumbers = level >= 8 && diff !== "mudah" && MK.Gen.chance(0.4);

      if (useNumbers) {
        // pola nombor bertambah
        var start = MK.Gen.ri(1, 5), step = diff === "cabaran" ? MK.Gen.pick([2, 3, 5]) : 2;
        var seq = [];
        for (var i = 0; i < 4; i++) seq.push(start + i * step);
        var ans = start + 4 * step;
        var nCh = 3;
        var nums = MK.Gen.numChoices(ans, step + 1, nCh);
        var ch = nums.map(function (x) { return { label: "<span style='font-size:1.5rem'>" + x + "</span>", correct: String(x) === String(ans) }; });
        if (!ch.some(function (c) { return c.correct; })) ch[0].correct = true;
        return {
          key: "pm-n-" + seq.join(","),
          kind: "quiz",
          prompt: seq.join(", ") + ", <b>?</b>",
          sub: "Apakah nombor seterusnya?",
          choices: MK.Gen.shuffle(ch),
          explain: "Setiap nombor bertambah " + step + "."
        };
      }

      var attrKey = MK.Gen.pick(attrKeys);
      var attr = attrs[attrKey] || attrs.warna;
      var nSymbols = { AB: 2, AAB: 2, ABB: 2, ABC: 3, AABB: 2, ABBC: 3 }[type] || 2;
      var picks = MK.Gen.sample(attr, nSymbols);
      // turutan unit: contoh AAB → [A,A,B]
      var units = {
        AB: [0, 1], AAB: [0, 0, 1], ABB: [0, 1, 1], ABC: [0, 1, 2],
        AABB: [0, 0, 1, 1], ABBC: [0, 1, 1, 2]
      }[type];
      var shown = [];
      var cycles = diff === "cabaran" ? 2 : 2;
      for (var c = 0; c < cycles; c++) units.forEach(function (u) { shown.push(picks[u]); });
      var answerItem = picks[units[0]]; // kitaran seterusnya bermula semula
      shown.push(null); // tanda soal
      var seqHtml = shown.map(function (s) { return s ? '<span style="font-size:1.9rem">' + s.emoji + "</span>" : '<span style="font-size:1.9rem;border:3px dashed var(--star);border-radius:10px;padding:2px 8px">?</span>'; }).join(" ");

      var nCh = diff === "mudah" ? 2 : diff === "cabaran" ? 4 : 3;
      var others = MK.Gen.sample(attr.filter(function (a) { return picks.indexOf(a) < 0; }), nCh - 1);
      var ch2 = [{ label: '<span class="cem">' + answerItem.emoji + "</span>", correct: true }]
        .concat(others.map(function (o) { return { label: '<span class="cem">' + o.emoji + "</span>", correct: false }; }));
      return {
        key: "pm-" + type + "-" + attrKey + "-" + picks.map(function (p) { return p.id; }).join("-"),
        kind: "quiz",
        prompt: seqHtml,
        sub: "Apakah objek seterusnya?",
        choices: MK.Gen.shuffle(ch2),
        explain: "Pola " + type + " berulang: " + picks.map(function (p) { return p.emoji; }).join(" ") + "."
      };
    }
  });
})();
