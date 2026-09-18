/* ============================================================
   GAME 13 — MEMORY MATCH (Memori & Perhatian)
   Permainan kad pasangan. Tahap: 4 → 16 kad.
   ============================================================ */
"use strict";
(function () {
  var SETS = {
    haiwan: ["🐱", "🐶", "🐰", "🦊", "🐻", "🐼", "🐸", "🦁", "🐮", "🐔", "🐧", "🦉"],
    buah: ["🍎", "🍌", "🍊", "🍇", "🍉", "🍓", "🥭", "🍍", "🥝", "🍑", "🍒", "🥥"],
    alam: ["☀️", "🌙", "⭐", "🌈", "☁️", "🌧️", "⚡", "❄️", "🌊", "🌸", "🌳", "🍃"],
    sekolah: ["📚", "✏️", "🎨", "📐", "✂️", "📝", "🎒", "🔬", "🧮", "🖊️", "📎", "🧭"]
  };

  MK.registerGame({
    id: "memory-match",
    name: "Memory Match",
    icon: "🃏",
    cat: "memori",
    engine: "memory",
    sticker: "🎴",
    desc: "Buka kad dan cari pasangan yang sama. Susun ingatan anda!",
    allowTimer: false,
    tasksPerLevel: function (l, d) { return d === "mudah" ? 1 : 2; },
    instruction: function (l, d) {
      return "Ketuk dua kad satu demi satu. Jika sama, kad kekal terbuka. Cari semua pasangan!";
    },
    makeTask: function (level, diff, ctx) {
      var pairs;
      if (level <= 2) pairs = 2;
      else if (level <= 4) pairs = 3;
      else if (level <= 6) pairs = 4;
      else if (level <= 8) pairs = 6;
      else pairs = 8;
      if (diff === "mudah" && pairs > 2) pairs = Math.max(2, pairs - 1);
      if (diff === "cabaran" && pairs < 8) pairs = Math.min(8, pairs + 1);

      var setKey = MK.Gen.pick(Object.keys(SETS));
      var emojis = MK.Gen.sample(SETS[setKey], pairs);
      var words = MK.Data.list("vocabulary", "words");

      var pairList;
      if (diff === "cabaran" && level >= 5) {
        // mod sukar: padankan emoji dengan nama (bukan gambar sama)
        pairList = emojis.map(function (em, i) {
          var match = words.find(function (w) { return w.e === em; });
          return { id: "p" + i, emoji: em, word: match ? match.w : "" };
        }).filter(function (p) { return p.word; });
        if (pairList.length < Math.max(2, pairs - 2)) {
          pairList = emojis.map(function (em, i) { return { id: "p" + i, emoji: em }; });
        }
      } else {
        pairList = emojis.map(function (em, i) { return { id: "p" + i, emoji: em } });
      }
      return {
        key: "mm-" + setKey + "-" + pairList.map(function (p) { return p.emoji; }).join(""),
        kind: "memory",
        prompt: "Cari semua pasangan!",
        pairs: pairList,
        cols: pairs <= 3 ? 3 : 4,
        explain: "Hebat! Anda mengingat kedudukan kad dengan baik."
      };
    }
  });
})();
