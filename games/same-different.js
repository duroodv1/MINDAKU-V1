/* ============================================================
   GAME 07 — SAME OR DIFFERENT? (Auditori & Fonologi)
   Dengar dua bunyi. Pilih SAMA atau BERBEZA.
   ============================================================ */
"use strict";
(function () {
  /* Pasangan bunyi: {a, b, same} */
  function makePair(diff, level, ctx) {
    var items = MK.Data.list("sounds", "items");
    var a = MK.Gen.pick(items);
    if (diff === "mudah" || ctx.ease) {
      // sama: bunyi serupa; berbeza: sangat berbeza
      if (MK.Gen.chance(0.5)) return { a: a.recipe, b: a.recipe, same: true, ea: a.emoji, eb: a.emoji };
      var b;
      do { b = MK.Gen.pick(items); } while (b.recipe === a.recipe || b.cat === a.cat);
      return { a: a.recipe, b: b.recipe, same: false, ea: a.emoji, eb: b.emoji };
    }
    if (diff === "sederhana") {
      if (MK.Gen.chance(0.5)) return { a: a.recipe, b: a.recipe, same: true, ea: a.emoji, eb: a.emoji };
      // berbeza halus: kategori sama, bunyi berbeza
      var b2;
      do { b2 = MK.Gen.pick(items); } while (b2.recipe === a.recipe);
      return { a: a.recipe, b: b2.recipe, same: false, ea: a.emoji, eb: b2.emoji };
    }
    // cabaran: nada berdekatan dalam keluarga sama
    var fam = MK.Gen.pick(["note_hi", "note_lo", "note_mid", "bell", "chirp"]);
    var fam2 = MK.Gen.chance(0.5) ? fam : MK.Gen.pick(["note_hi", "note_lo", "note_mid"]);
    return { a: fam, b: fam2, same: fam === fam2, ea: "🎵", eb: "🎵" };
  }

  MK.registerGame({
    id: "same-different",
    name: "Same or Different?",
    icon: "🔀",
    cat: "auditori",
    engine: "custom",
    sticker: "🎼",
    desc: "Dengar dua bunyi dan tentukan sama atau berbeza.",
    instruction: function (l, d) {
      return "Dengar Bunyi 1 dan Bunyi 2, kemudian pilih SAMA atau BERBEZA. Boleh dengar semula!";
    },
    startLevel: function (mount, api) {
      var perLevel = api.diff === "mudah" ? 4 : 5;
      var tIdx = 0, mistakes = 0;
      var current = null;

      function build() {
        current = makePair(api.diff, api.level, api.ctx);
        mount.innerHTML = "";
        mount.appendChild(MK.el("div", "prompt small", "Bandingkan bunyi (" + (tIdx + 1) + "/" + perLevel + ")"));
        var row = MK.el("div", "row center wrap");
        [["▶ Bunyi 1", "a"], ["▶ Bunyi 2", "b"]].forEach(function (p) {
          var b = MK.el("button", "btn big", p[0]);
          b.style.flex = "1 1 130px";
          b.addEventListener("click", function () {
            MK.Audio.playGameSound(p[1] === "a" ? current.a : current.b);
            api.sfx("tap");
          });
          row.appendChild(b);
        });
        mount.appendChild(row);
        var ch = MK.el("div", "choices c2");
        [["SAMA ✔", true], ["BERBEZA ✖", false]].forEach(function (p) {
          var b = MK.el("button", "choice", '<span class="cem">' + (p[1] ? "🟰" : "🔀") + "</span><span>" + p[0] + "</span>");
          b.addEventListener("click", function () {
            if (p[1] === current.same) {
              api.sfx("good"); api.feedback(true);
              tIdx++; api.progress(tIdx, perLevel);
              setTimeout(function () {
                if (tIdx >= perLevel) api.complete({ mistakes: mistakes });
                else build();
              }, 900);
            } else {
              mistakes++;
              api.sfx("retry"); api.feedback(false);
              b.classList.add("shake-soft");
              setTimeout(function () { b.classList.remove("shake-soft"); }, 500);
            }
          });
          ch.appendChild(b);
        });
        mount.appendChild(ch);
      }
      api.hint(function () {
        MK.Audio.playGameSound(current.a);
        setTimeout(function () { MK.Audio.playGameSound(current.b); }, 1300);
        MK.toast("Dengar semula kedua-dua bunyi dengan teliti 💡");
      });
      build();
    }
  });
})();
