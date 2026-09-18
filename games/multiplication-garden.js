/* ============================================================
   GAME 23 — MULTIPLICATION GARDEN (Matematik)
   Darab dengan susunan objek: 3 × 4 = 3 baris × 4 bunga.
   Termasuk missing factor dan word problems.
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "multiplication-garden",
    name: "Multiplication Garden",
    icon: "✖️",
    cat: "matematik",
    engine: "quiz",
    sticker: "🌷",
    desc: "Fahami darab melalui susunan baris dan lajur bunga.",
    tasksPerLevel: 5,
    instruction: function (l, d) {
      return "Lihat susunan bunga — baris daripada lajur. Jawab soalan darab!";
    },
    makeTask: function (level, diff, ctx) {
      var maxes = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      var maxF = maxes[Math.min(9, level - 1)] || 5;
      if (diff === "mudah") maxF = Math.max(3, maxF - 2);
      if (diff === "cabaran") maxF = Math.min(12, maxF + 1);
      if (ctx.ease) maxF = Math.max(2, Math.min(5, maxF));

      var mode = level <= 3 ? "visual" : level <= 5 ? "plain" : level <= 7 ? "missing" : level <= 8 ? "word" : MK.Gen.pick(["visual", "plain", "missing", "word"]);
      var r = MK.Gen.ri(2, maxF), c = MK.Gen.ri(2, maxF);
      var prod = r * c;
      var prompt, sub, ans, explain;

      var arrayHtml = (function (rows, cols, em) {
        em = em || "🌸";
        var html = '<div style="display:inline-block;text-align:center">';
        for (var i = 0; i < rows; i++) {
          html += '<div style="font-size:1.15rem;letter-spacing:2px;line-height:1.35">' + Array(cols + 1).join(em) + "</div>";
        }
        return html + "</div>";
      })(Math.min(r, 8), Math.min(c, 10));

      if (mode === "visual") {
        ans = prod;
        prompt = "Berapa jumlah bunga?<br><b>" + r + " baris × " + c + " bunga setiap baris</b>";
        sub = arrayHtml;
        explain = r + " × " + c + " = " + prod + " bunga.";
      } else if (mode === "plain") {
        ans = prod;
        prompt = "<b>" + r + " × " + c + " = ?</b>";
        sub = arrayHtml;
        explain = r + " × " + c + " = " + prod + ".";
      } else if (mode === "missing") {
        if (MK.Gen.chance(0.5)) { ans = r; prompt = "<b>? × " + c + " = " + prod + "</b>"; explain = "Faktor yang hilang ialah " + r + " kerana " + r + " × " + c + " = " + prod + "."; }
        else { ans = c; prompt = "<b>" + r + " × ? = " + prod + "</b>"; explain = "Faktor yang hilang ialah " + c + " kerana " + r + " × " + c + " = " + prod + "."; }
        sub = arrayHtml + "<div style='font-size:.8rem'>Jumlah: " + prod + "</div>";
      } else {
        ans = prod;
        var tpl = (MK.Data.bank("mathematics").wordProblems || []).filter(function (t) { return t.op === "mul"; })[0];
        prompt = (tpl ? tpl.tpl : "Sebuah bakul mengandungi {a} biji limau. Berapa biji dalam {b} bakul?")
          .replace("{a}", c).replace("{b}", r);
        sub = "";
        explain = c + " × " + r + " = " + prod + ".";
      }

      var nCh = diff === "mudah" ? 3 : diff === "cabaran" ? 4 : 3;
      var nums = MK.Gen.numChoices(ans, Math.max(3, Math.round(prod / 5)), nCh);
      var ch = nums.map(function (x) { return { label: "<span style='font-size:1.5rem'>" + x + "</span>", correct: String(x) === String(ans) }; });
      if (!ch.some(function (x2) { return x2.correct; })) ch[0] = { label: "<span style='font-size:1.5rem'>" + ans + "</span>", correct: true };

      return {
        key: "mgx-" + mode + "-" + r + "x" + c,
        kind: "quiz",
        prompt: prompt,
        sub: sub,
        choices: MK.Gen.shuffle(ch),
        explain: explain
      };
    }
  });
})();
