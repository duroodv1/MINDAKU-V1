/* ============================================================
   GAME 30 — LOGIC PUZZLE (Logik & Penyelesaian Masalah)
   Latihan susunan, perbandingan, saiz, kedudukan, urutan.
   ============================================================ */
"use strict";
(function () {
  var SIZES = ["paling tinggi", "paling pendek", "paling berat", "paling ringan", "paling pantas", "paling lambat"];

  MK.registerGame({
    id: "logic-puzzle",
    name: "Logic Puzzle",
    icon: "🧩",
    cat: "logik",
    engine: "quiz",
    sticker: "🦉",
    desc: "Selesaikan teka-teki logik: siapa lebih tinggi? Siapa di tengah?",
    tasksPerLevel: 5,
    instruction: function (l, d) {
      return "Baca dengan teliti dan gunakan logik untuk menjawab. Anda boleh!";
    },
    makeTask: function (level, diff, ctx) {
      var names = (MK.Data.bank("questions").logic || {}).cleanNames || (MK.Data.bank("questions").logic || {}).names || ["Ali", "Abu", "Bakar", "Moli", "Diana"];
      var nNames = level <= 3 ? 3 : level <= 7 ? 3 : 4;
      if (diff === "cabaran") nNames = 4;
      var picked = MK.Gen.sample(names, nNames);
      var A = picked[0], B = picked[1], C = picked[2];

      var kinds = level <= 4 ? ["superlative"] :
                  level <= 6 ? ["superlative", "middle"] :
                  level <= 8 ? ["superlative", "middle", "sequence"] :
                  ["superlative", "middle", "sequence", "not"];
      var kind = MK.Gen.pick(kinds);

      if (kind === "superlative") {
        var attr = MK.Gen.pick(["tinggi", "berat", "pantas"]);
        var askMax = MK.Gen.chance(0.5);
        // susunan: A > B > C
        var text = A + " lebih " + attr + " daripada " + B + ". " + B + " lebih " + attr + " daripada " + C + ".";
        var ans = askMax ? A : C;
        var q = "Siapa yang <b>paling " + attr + "</b>?";
        if (!askMax) q = "Siapa yang <b>paling " + (attr === "tinggi" ? "pendek" : attr === "berat" ? "ringan" : "lambat") + "</b>?";
        var others = picked.filter(function (n) { return n !== ans; });
        var ch = [{ label: ans, correct: true }].concat(others.map(function (o) { return { label: o, correct: false }; }));
        return { key: "lp-s-" + picked.join() + attr, kind: "quiz", prompt: text, sub: q, choices: MK.Gen.shuffle(ch), explain: "Susunannya: " + A + " → " + B + " → " + C + ". Jadi jawapannya " + ans + "." };
      }
      if (kind === "middle") {
        var text2 = A + " berdiri paling depan. " + C + " berdiri paling belakang. " + B + " berdiri di antara mereka.";
        var ch2 = [{ label: B, correct: true }, { label: A, correct: false }, { label: C, correct: false }];
        return { key: "lp-m-" + picked.join(), kind: "quiz", prompt: text2, sub: "Siapa berdiri <b>di tengah</b> barisan?", choices: MK.Gen.shuffle(ch2), explain: "Susunan barisan: " + A + ", " + B + ", " + C + "." };
      }
      if (kind === "sequence") {
        // urutan hari / nombor
        var days = ["Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu", "Ahad"];
        var di = MK.Gen.ri(0, 5);
        var q2 = "Hari ini " + days[di] + ". Apakah <b>esok</b>?";
        var ans2 = days[(di + 1) % 7];
        var ch3 = [{ label: ans2, correct: true }];
        days.filter(function (d) { return d !== ans2; }).slice(0, 2).forEach(function (d) { ch3.push({ label: d, correct: false }); });
        return { key: "lp-d-" + di, kind: "quiz", prompt: q2, choices: MK.Gen.shuffle(ch3), explain: "Selepas " + days[di] + " datangnya " + ans2 + "." };
      }
      // not: penafian
      var items = ["bola", "patung", "kereta mainan", "blok", "puzzle"];
      var who = MK.Gen.pick(picked);
      var notItem = MK.Gen.pick(items);
      var hasItem = MK.Gen.pick(items.filter(function (x) { return x !== notItem; }));
      var text3 = who + " tidak memegang " + notItem + ". " + who + " memegang " + hasItem + ".";
      var q3 = "Apakah yang " + who + " pegang?";
      var ch4 = [{ label: hasItem, correct: true }, { label: notItem, correct: false }];
      var extra = MK.Gen.sample(items.filter(function (x) { return x !== hasItem && x !== notItem; }), diff === "cabaran" ? 2 : 1);
      extra.forEach(function (x) { ch4.push({ label: x, correct: false }); });
      return { key: "lp-n-" + who + notItem, kind: "quiz", prompt: text3, sub: q3, choices: MK.Gen.shuffle(ch4), explain: who + " memegang " + hasItem + "." };
    }
  });
})();
