/* ============================================================
   GAME 36 — DAILY ROUTINE (Kehidupan Harian)
   Susun rutin harian mengikut urutan betul. Ada distractor!
   Timer boleh diaktifkan tetapi OFF secara default.
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "daily-routine",
    name: "Daily Routine",
    icon: "⏰",
    cat: "kehidupan",
    engine: "order",
    sticker: "📅",
    desc: "Susun rutin harian mengikut urutan yang betul!",
    tasksPerLevel: 3,
    instruction: function (l, d) {
      return "Ketuk langkah mengikut urutan yang betul dari awal hingga akhir. Abaikan kad yang tidak berkaitan!";
    },
    makeTask: function (level, diff, ctx) {
      var sets = MK.Data.list("routines", "sets");
      var set = sets[(level - 1) % sets.length];
      var nDis = diff === "mudah" ? 0 : diff === "cabaran" ? 3 : 1;
      var distract = MK.Gen.sample(set.distractors || [], nDis);

      var steps = set.steps.map(function (s, i) { return { id: "s" + i, label: s }; });
      var answer = steps.map(function (t) { return t.id; });
      var extras = distract.map(function (d, i) { return { id: "d" + i, label: d }; });
      return {
        key: "dr-" + set.name + "-" + diff,
        kind: "order",
        prompt: "Susun rutin: <b>" + MK.esc(set.name) + "</b>",
        tokens: MK.Gen.shuffle(steps.concat(extras)),
        answer: answer,
        explain: "Urutan yang betul: " + set.steps.join(" → ")
      };
    }
  });
})();
