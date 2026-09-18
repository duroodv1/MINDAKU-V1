/* ============================================================
   GAME 35 — WEATHER EXPLORER (Sains & Dunia)
   Kenal cuaca: cerah, hujan, mendung, ribut, pelangi.
   Pilih pakaian dan aktiviti yang sesuai.
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "weather-explorer",
    name: "Weather Explorer",
    icon: "🌤️",
    cat: "sains",
    engine: "quiz",
    sticker: "🌦️",
    desc: "Pilih pakaian dan aktiviti yang sesuai mengikut cuaca!",
    tasksPerLevel: 5,
    instruction: function (l, d) {
      return "Lihat cuaca hari ini dan pilih pilihan yang paling sesuai!";
    },
    makeTask: function (level, diff, ctx) {
      var weathers = MK.Data.list("habitats", "weather");
      var w = MK.Gen.pickAvoid(weathers, ctx.recentWeather || []);
      (ctx.recentWeather = ctx.recentWeather || []).push(w.id);
      if (ctx.recentWeather.length > 6) ctx.recentWeather.shift();

      var mode = level <= 3 ? "id" : level <= 6 ? "wear" : MK.Gen.pick(["wear", "activity", "id"]);

      if (mode === "id") {
        // cuaca dari penerangan
        var others = MK.Gen.sample(weathers.filter(function (x) { return x.id !== w.id; }), 2);
        var ch = [{ label: w.emoji + "<span>" + w.label + "</span>", correct: true }]
          .concat(others.map(function (o) { return { label: o.emoji + "<span>" + o.label + "</span>", correct: false }; }));
        return {
          key: "we-id-" + w.id, kind: "quiz",
          prompt: "Langit kelihatan seperti ini — apakah cuacanya?",
          sub: '<span style="font-size:3rem">' + w.emoji + "</span>",
          choices: MK.Gen.shuffle(ch), explain: w.why
        };
      }
      if (mode === "wear") {
        var good = w.wear || [];
        var bad = w.notWear || [];
        if (!good.length || !bad.length) return makeTask(Math.max(1, level - 1), diff, ctx);
        // satu jawapan betul + pengganggu hanya daripada senarai tidak sesuai
        var right = MK.Gen.pick(good);
        var wrongs = MK.Gen.sample(bad, Math.min(2, bad.length));
        var ch2 = [{ label: "👕 " + right, correct: true }]
          .concat(wrongs.map(function (x) { return { label: "🚫 " + x, correct: false }; }));
        return {
          key: "we-wear-" + w.id + "-" + right, kind: "quiz",
          prompt: "Cuaca <b>" + w.label + "</b> " + w.emoji,
          sub: "Pilih pakaian yang PALING sesuai:",
          choices: MK.Gen.shuffle(ch2), list: true, explain: w.why
        };
      }
      var gA = w.activity || [], bA = w.notActivity || [];
      if (!gA.length || !bA.length) return makeTask(Math.max(1, level - 1), diff, ctx);
      var rightA = MK.Gen.pick(gA);
      var wrongsA = MK.Gen.sample(bA, Math.min(2, bA.length));
      var ch3 = [{ label: "✅ " + rightA, correct: true }]
        .concat(wrongsA.map(function (x) { return { label: "🚫 " + x, correct: false }; }));
      return {
        key: "we-act-" + w.id + "-" + rightA, kind: "quiz",
        prompt: "Cuaca <b>" + w.label + "</b> " + w.emoji,
        sub: "Pilih aktiviti yang PALING sesuai:",
        choices: MK.Gen.shuffle(ch3), list: true, explain: w.why
      };
    }
  });
})();
