/* ============================================================
   GAME 22 — MATH GARDEN (Matematik)
   Latihan tambah dan tolak dengan objek visual sebagai bantuan.
   ============================================================ */
"use strict";
(function () {
  var FLOWER = "🌼";

  function group(em, n) { return Array(n + 1).join(em); }

  MK.registerGame({
    id: "math-garden",
    name: "Math Garden",
    icon: "➕",
    cat: "matematik",
    engine: "quiz",
    sticker: "🧮",
    desc: "Menambah dan menolak dengan bantuan bunga visual.",
    tasksPerLevel: 5,
    instruction: function (l, d) {
      return "Selesaikan operasi. Gunakan bunga sebagai bantuan untuk mengira!";
    },
    makeTask: function (level, diff, ctx) {
      var cfgA = MK.Data.bank("mathematics").add || {};
      var cfgS = MK.Data.bank("mathematics").sub || {};
      var maxesA = cfgA.maxByLevel || [10, 15, 20, 30, 50, 60, 80, 100, 150, 200];
      var maxesS = cfgS.maxByLevel || [8, 10, 15, 20, 30, 40, 50, 60, 80, 100];
      var dBoost = diff === "cabaran" ? 2 : diff === "mudah" ? 0 : 1;
      var maxA = (maxesA[Math.min(9, level - 1)] || 20) + dBoost * 15;
      var maxS = (maxesS[Math.min(9, level - 1)] || 10) + dBoost * 10;
      if (ctx.ease) { maxA = Math.max(10, Math.round(maxA / 2)); maxS = Math.max(8, Math.round(maxS / 2)); }
      var useWord = level >= 7 && diff !== "mudah" && MK.Gen.chance(0.35);
      var isAdd = MK.Gen.chance(0.55);

      var a, b, ans, q, visual;
      if (isAdd) {
        a = MK.Gen.ri(1, Math.max(2, maxA - 2));
        b = MK.Gen.ri(1, Math.max(1, maxA - a));
        ans = a + b;
        q = a + " + " + b + " = ?";
        visual = group(FLOWER, Math.min(a, 12)) + " ➕ " + group(FLOWER, Math.min(b, 12)) +
          (a > 12 || b > 12 ? "<div style='font-size:.75rem'>(+ " + Math.max(0, a - 12) + " dan " + Math.max(0, b - 12) + " lagi…)</div>" : "");
      } else {
        a = MK.Gen.ri(2, Math.max(3, maxS));
        b = MK.Gen.ri(1, a - 1);
        ans = a - b;
        q = a + " − " + b + " = ?";
        var crossed = group("❌", Math.min(b, 12));
        visual = group(FLOWER, Math.min(a, 12)) + "<div style='font-size:1rem;line-height:1'>" + crossed + "</div>";
      }

      if (useWord) {
        var tpls = (MK.Data.bank("mathematics").wordProblems || []).filter(function (t) {
          return t.op === (isAdd ? "add" : "sub");
        });
        if (tpls.length) {
          var tpl = MK.Gen.pick(tpls).tpl;
          q = tpl.replace("{a}", a).replace("{b}", b);
        }
      }

      var nCh = diff === "mudah" ? (ctx.ease ? 2 : 3) : diff === "cabaran" ? 4 : 3;
      var nums = MK.Gen.numChoices(ans, Math.max(2, Math.round(ans / 6)), nCh);
      var ch = nums.map(function (x) { return { label: "<span style='font-size:1.5rem'>" + x + "</span>", correct: String(x) === String(ans) }; });
      if (!ch.some(function (c) { return c.correct; })) ch[0] = { label: "<span style='font-size:1.5rem'>" + ans + "</span>", correct: true };

      return {
        key: "mg-" + q,
        kind: "quiz",
        prompt: q,
        sub: visual,
        choices: MK.Gen.shuffle(ch),
        explain: a + (isAdd ? " + " : " − ") + b + " = " + ans
      };
    }
  });
})();
