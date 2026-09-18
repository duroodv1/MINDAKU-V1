/* ============================================================
   GAME 31 — ANIMAL HABITAT (Sains & Dunia)
   Padankan haiwan dengan habitatnya: laut, hutan, padang
   pasir, Artik, sungai.
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "animal-habitat",
    name: "Animal Habitat",
    icon: "🌍",
    cat: "sains",
    engine: "sort",
    sticker: "🐘",
    desc: "Hantar setiap haiwan ke habitatnya yang betul!",
    tasksPerLevel: 2,
    instruction: function (l, d) {
      return "Ketuk haiwan, kemudian ketuk habitatnya yang betul. Belajar fakta haiwan selepas itu!";
    },
    makeTask: function (level, diff, ctx) {
      var data = MK.Data.bank("habitats");
      var habs = data.habitats || [];
      var nBins = diff === "mudah" ? 2 : diff === "cabaran" ? 5 : 3;
      var perBin = diff === "mudah" ? 1 : diff === "cabaran" ? 3 : 2;
      if (ctx.ease) perBin = 1;

      var chosen = MK.Gen.sample(habs, Math.min(nBins, habs.length));
      var items = [];
      chosen.forEach(function (h) {
        MK.Gen.sample(h.animals, Math.min(perBin, h.animals.length)).forEach(function (a, i) {
          items.push({ id: h.id + "-" + a + i, label: titleCase(a), emoji: animalEmoji(a), bin: h.id });
        });
      });
      return {
        key: "ah-" + items.map(function (i) { return i.label; }).sort().join("-"),
        kind: "sort",
        prompt: "Haiwan ini tinggal di mana?",
        bins: chosen.map(function (h) { return { id: h.id, label: h.label, emoji: h.emoji }; }),
        items: MK.Gen.shuffle(items),
        explain: chosen[0] ? chosen[0].fact : "Setiap haiwan hidup di habitat yang sesuai dengannya."
      };
    }
  });

  function titleCase(s) {
    return String(s).toLowerCase().replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }
  function animalEmoji(name) {
    var map = {
      "IKAN PAUS": "🐋", "IKAN YU": "🦈", "KETAM": "🦀", "BURUNG CAMAR": "🕊️", "SOTONG": "🐙",
      "HARIMAU": "🐯", "GAJAH": "🐘", "MONYET": "🐵", "BADAK": "🦏", "BURUNG ENGGANG": "🦜",
      "UNTA": "🐪", "KALA JENGKING": "🦂", "ULAR PADANG PASIR": "🐍", "TIKUS KAKTUS": "🐭",
      "BERUANG KUTUB": "🐻‍❄️", "PINGUIN": "🐧", "ANJING LAUT": "🐬", "RUSA KUTUB": "🦌",
      "BUAYA": "🐊", "IKAN HARUAN": "🐟", "UDANG": "🦐", "KETAM SUNGAI": "🦀", "BERUK": "🐵"
    };
    return map[String(name).toUpperCase()] || "🐾";
  }
})();
