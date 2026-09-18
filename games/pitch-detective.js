/* ============================================================
   GAME 08 — PITCH DETECTIVE (Auditori & Fonologi)
   Kenal pasti nada tinggi dan nada rendah dengan visual nota.
   ============================================================ */
"use strict";
(function () {
  /* Nada: frekuensi & ketinggian bar visual */
  var HI = 880, LO = 220, MID = 440;

  function barsHTML() {
    return '<div class="row center" style="align-items:flex-end;gap:18px;min-height:150px;justify-content:center">' +
      '<div id="bar1" style="width:52px;border-radius:10px 10px 0 0;background:#B9CFCB;height:12px;transition:height .5s ease"></div>' +
      '<div id="bar2" style="width:52px;border-radius:10px 10px 0 0;background:#B9CFCB;height:12px;transition:height .5s ease"></div>' +
      "</div>";
  }

  MK.registerGame({
    id: "pitch-detective",
    name: "Pitch Detective",
    icon: "🎚️",
    cat: "auditori",
    engine: "custom",
    sticker: "🎹",
    desc: "Kenal pasti nada tinggi dan nada rendah dengan bantuan visual nota.",
    instruction: function (l, d) {
      return l <= 5
        ? "Dengar nota itu. Nada tinggi seperti burung kecil; nada rendah seperti gergasi. Pilih jawapan!"
        : "Dengar dua nota. Nota yang manakah lebih tinggi? Boleh dengar semula.";
    },
    startLevel: function (mount, api) {
      var perLevel = 5, tIdx = 0, mistakes = 0;
      var mode = api.level <= 5 ? "single" : "compare";
      var current = null;

      function play(freq, barEl) {
        MK.Audio.playFreq(freq, 0.6);
        if (barEl) {
          barEl.style.background = "#3E7C82";
          barEl.style.height = Math.min(140, Math.round(freq / 1000 * 130 + 18)) + "px";
        }
      }

      function build() {
        mount.innerHTML = "";
        mount.appendChild(MK.el("div", "prompt small", "Detektif Nada (" + (tIdx + 1) + "/" + perLevel + ")"));
        var holder = MK.el("div", null, barsHTML());
        mount.appendChild(holder);
        var bar1 = holder.querySelector("#bar1"), bar2 = holder.querySelector("#bar2");

        if (mode === "single") {
          var gap = api.diff === "cabaran" ? 160 : api.diff === "mudah" ? 480 : 320;
          var isHi = MK.Gen.chance(0.5);
          var f = isHi ? HI - MK.Gen.ri(0, 80) : LO + MK.Gen.ri(0, 80);
          if (api.diff === "mudah") f = isHi ? HI : LO;
          current = { f: f, isHi: isHi };
          var pb = MK.el("button", "btn primary big", "▶ Dengar Nota");
          pb.addEventListener("click", function () { play(f, bar1); });
          mount.appendChild(pb);
          var ch = MK.el("div", "choices c2");
          [["☁️ Nada Tinggi", true], ["🐘 Nada Rendah", false]].forEach(function (p) {
            var b = MK.el("button", "choice", '<span class="cem">' + p[0].split(" ")[0] + "</span><span>" + p[0].split(" ").slice(1).join(" ") + "</span>");
            b.addEventListener("click", function () {
              if (p[1] === isHi) right();
              else wrong(b);
            });
            ch.appendChild(b);
          });
          mount.appendChild(ch);
        } else {
          var gap2 = api.diff === "cabaran" ? 120 : 280;
          var hiFirst = MK.Gen.chance(0.5);
          var f1 = hiFirst ? HI - MK.Gen.ri(0, 60) : LO + MK.Gen.ri(0, 60);
          var f2 = hiFirst ? LO + MK.Gen.ri(0, 60) : HI - MK.Gen.ri(0, 60);
          if (api.diff !== "cabaran") { f1 = hiFirst ? HI : LO; f2 = hiFirst ? LO : HI; }
          else { var jitter = MK.Gen.ri(60, 140); f1 = hiFirst ? 760 : 300 + jitter; f2 = hiFirst ? 300 + jitter : 760; }
          current = { f1: f1, f2: f2, hiFirst: hiFirst };
          var row = MK.el("div", "row center wrap");
          [["▶ Nota 1", 1], ["▶ Nota 2", 2]].forEach(function (p) {
            var b = MK.el("button", "btn big", p[0]);
            b.style.flex = "1 1 130px";
            b.addEventListener("click", function () {
              play(p[1] === 1 ? f1 : f2, p[1] === 1 ? bar1 : bar2);
            });
            row.appendChild(b);
          });
          mount.appendChild(row);
          var ch2 = MK.el("div", "choices c2");
          [["Nota 1 lebih tinggi", 1], ["Nota 2 lebih tinggi", 2]].forEach(function (p) {
            var b = MK.el("button", "choice", "<span>" + p[0] + "</span>");
            b.addEventListener("click", function () {
              var ans = hiFirst ? 1 : 2;
              if (p[1] === ans) right();
              else wrong(b);
            });
            ch2.appendChild(b);
          });
          mount.appendChild(ch2);
        }
        function right() {
          api.sfx("good"); api.feedback(true);
          tIdx++; api.progress(tIdx, perLevel);
          setTimeout(function () {
            if (tIdx >= perLevel) api.complete({ mistakes: mistakes }); else build();
          }, 850);
        }
        function wrong(b) {
          mistakes++; api.sfx("retry"); api.feedback(false);
          b.classList.add("shake-soft");
          setTimeout(function () { b.classList.remove("shake-soft"); }, 500);
        }
      }
      api.hint(function () {
        if (mode === "single") {
          MK.toast(current.isHi ? "💡 Nota ini seperti burung kecil — tinggi!" : "💡 Nota ini seperti gergasi — rendah!");
        } else {
          MK.toast(current.hiFirst ? "💡 Nota pertama lebih tinggi — dengar lagi!" : "💡 Nota kedua lebih tinggi — dengar lagi!");
        }
      });
      build();
    }
  });
})();
