/* ============================================================
   GAME 21 — GARDEN COUNTING (Matematik)
   Kira bunga, buah, rama-rama dan objek taman.
   ============================================================ */
"use strict";
(function () {
  var GARDEN = {
    bunga: ["🌸", "🌺", "🌻", "🌷"],
    buah: ["🍎", "🍓", "🍊", "🍇"],
    rama: ["🦋", "🐝", "🐞"],
    tumbuhan: ["🌿", "🍀", "🌱"],
    haiwan: ["🐰", "🐢", "🐸", "🐤"]
  };

  MK.registerGame({
    id: "garden-counting",
    name: "Garden Counting",
    icon: "🌼",
    cat: "matematik",
    engine: "quiz",
    sticker: "🌻",
    desc: "Kira objek di dalam taman dengan teliti.",
    tasksPerLevel: 5,
    instruction: function (l, d) {
      return "Kira objek yang diminta dengan teliti, kemudian ketuk jawapan yang betul.";
    },
    makeTask: function (level, diff, ctx) {
      var kind = MK.Gen.pick(Object.keys(GARDEN));
      var max = 5 + level * 2; // 7..25
      if (diff === "mudah") max = Math.max(5, max - 5);
      if (diff === "cabaran") max += 4;
      var n = MK.Gen.ri(Math.max(3, max - 6), max);

      var useDistract = (level >= 4 && diff !== "mudah") || diff === "cabaran";
      var targetEmoji = MK.Gen.pick(GARDEN[kind]);
      var distractEmoji = MK.Gen.pick(GARDEN[kind === "bunga" ? "haiwan" : "bunga"]);
      var nDis = useDistract ? MK.Gen.ri(2, 5) : 0;

      var objs = [];
      for (var i = 0; i < n; i++) objs.push(targetEmoji);
      for (var j = 0; j < nDis; j++) objs.push(distractEmoji);
      objs = MK.Gen.shuffle(objs);

      var choices = MK.Gen.numChoices(n, Math.max(2, Math.round(n / 4)), diff === "mudah" ? 2 : diff === "cabaran" ? 4 : 3);
      var ch = choices.map(function (c) { return { label: "<span style='font-size:1.6rem'>" + c + "</span>", correct: String(c) === String(n) }; });
      if (!ch.some(function (c) { return c.correct; })) ch[0] = { label: "<span style='font-size:1.6rem'>" + n + "</span>", correct: true };

      var scene = '<div style="font-size:1.7rem;line-height:1.5;letter-spacing:3px;max-width:420px;margin:0 auto">' + objs.join("") + "</div>";
      return {
        key: "gc-" + kind + "-" + n + "-" + nDis,
        kind: "quiz",
        prompt: (useDistract ? "Kira hanya <b>" + targetEmoji + "</b>!" : "Berapa banyak objek ini?"),
        sub: scene + (useDistract ? "<div style='margin-top:4px;font-size:.8rem'>(abaikan " + distractEmoji + ")</div>" : ""),
        choices: MK.Gen.shuffle(ch),
        explain: "Jumlahnya ialah " + n + "."
      };
    }
  });
})();
