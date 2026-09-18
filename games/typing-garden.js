/* ============================================================
   GAME 48 — TYPING GARDEN (Kreativiti & Digital)
   Taip huruf: benih tumbuh, daun muncul, perkataan terbentuk.
   Papan kekunci dalam skrin + kekunci fizikal.
   ============================================================ */
"use strict";
(function () {
  var ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

  MK.registerGame({
    id: "typing-garden",
    name: "Typing Garden",
    icon: "🌱",
    cat: "kreativiti",
    engine: "custom",
    sticker: "⌨️",
    desc: "Taip huruf dengan betul dan tonton taman anda membesar!",
    instruction: function (l, d) {
      return "Taip huruf yang diminta menggunakan papan kekunci (atau kekunci komputer anda). Setiap huruf betul membuat tumbuhan membesar!";
    },
    startLevel: function (mount, api) {
      var perLevel = api.diff === "mudah" ? 3 : 4;
      var wordsBank = MK.Data.list("vocabulary", "spell");
      var maxLen = api.level <= 2 ? 4 : api.level <= 4 ? 5 : api.level <= 6 ? 6 : api.level <= 8 ? 7 : 9;
      var pool = wordsBank.filter(function (w) { return w.w.length <= maxLen && w.w.length >= 3; });
      if (api.diff === "cabaran") pool = wordsBank.filter(function (w) { return w.w.length >= 5; });
      if (!pool.length) pool = wordsBank;

      var tIdx = 0, mistakes = 0, typed = 0;
      var word = null, pos = 0;

      var STAGES = ["🌰", "🌱", "🌿", "☘️", "🌳", "🌳✨", "🌸🌳", "🌸🌳✨"];

      function build() {
        word = MK.Gen.pickAvoid(pool, api.ctx.recentWords || []);
        (api.ctx.recentWords = api.ctx.recentWords || []).push(word.w);
        if (api.ctx.recentWords.length > 6) api.ctx.recentWords.shift();
        pos = 0;

        mount.innerHTML = "";
        mount.appendChild(MK.el("div", "prompt small", "Taman Taipan (" + (tIdx + 1) + "/" + perLevel + ")"));

        /* taman */
        var garden = MK.el("div", null);
        garden.style.cssText = "background:linear-gradient(#EAF3F7 0%,#E8F0DF 60%,#DCEBE0 100%);border-radius:16px;padding:14px;min-height:150px;display:flex;align-items:flex-end;justify-content:center";
        var plant = MK.el("div", null);
        plant.style.fontSize = "3rem";
        plant.textContent = STAGES[0];
        plant.classList.add("grow-stage");
        garden.appendChild(plant);
        mount.appendChild(garden);

        /* perkataan sasaran */
        var wordRow = MK.el("div", "row center");
        wordRow.style.cssText = "margin:10px 0;flex-wrap:wrap;gap:6px";
        var letterEls = [];
        word.w.split("").forEach(function (ch) {
          var c = MK.el("div", "oslot", '<span style="font-size:1.2rem">' + ch + "</span>");
          c.style.opacity = "0.35";
          wordRow.appendChild(c);
          letterEls.push(c);
        });
        mount.appendChild(wordRow);
        mount.appendChild(MK.el("div", "sub-prompt", "Taip: <b>" + word.w[pos] + "</b> " + word.e));

        /* papan kekunci */
        var kb = MK.el("div", null);
        kb.style.cssText = "display:flex;flex-direction:column;gap:6px;align-items:center";
        ROWS.forEach(function (row) {
          var r = MK.el("div", "row");
          r.style.gap = "5px";
          row.split("").forEach(function (L) {
            var b = MK.el("button", "tool-btn kb-key", L);
            b.style.cssText = "min-width:34px;min-height:46px;padding:0 6px;font-size:1rem;border-radius:9px";
            if (L === word.w[pos]) b.classList.add("on");
            b.addEventListener("click", function () { hit(L, b); });
            kb.appendChild(r).appendChild(b);
          });
        });
        mount.appendChild(kb);

        function highlight() {
          kb.querySelectorAll(".kb-key").forEach(function (b) {
            b.classList.toggle("on", b.textContent === word.w[pos]);
          });
          var sub = mount.querySelector(".sub-prompt");
          if (sub && pos < word.w.length) sub.innerHTML = "Taip: <b>" + word.w[pos] + "</b> " + word.e;
        }

        function hit(L, btn) {
          if (pos >= word.w.length) return;
          if (L === word.w[pos]) {
            letterEls[pos].style.opacity = "1";
            letterEls[pos].style.borderColor = "var(--good)";
            pos++;
            typed++;
            api.sfx("pop");
            var stage = Math.min(STAGES.length - 1, Math.floor((pos / word.w.length) * (STAGES.length - 1)));
            plant.textContent = STAGES[stage];
            plant.classList.remove("grow-stage");
            void plant.offsetWidth;
            plant.classList.add("grow-stage");
            if (pos >= word.w.length) {
              api.sfx("win");
              plant.textContent = "🌸🌳🎉";
              plant.classList.add("bloom");
              api.feedback(true, word.w + " — hebat! Tumbuhan mekar!");
              tIdx++; api.progress(tIdx, perLevel);
              setTimeout(function () {
                if (tIdx >= perLevel) api.complete({ mistakes: mistakes }); else build();
              }, 1200);
            } else highlight();
          } else {
            mistakes++;
            api.sfx("retry");
            api.feedback(false, "Itu huruf " + L + ". Huruf seterusnya ialah " + word.w[pos] + ".");
            if (btn) {
              btn.classList.add("shake-soft");
              setTimeout(function () { btn.classList.remove("shake-soft"); }, 500);
            }
          }
        }

        /* kekunci fizikal */
        var kh = function (ev) {
          if (!/^[a-zA-Z]$/.test(ev.key)) return;
          ev.preventDefault();
          hit(ev.key.toUpperCase(), null);
        };
        document.addEventListener("keydown", kh);
        api.onCleanup(function () { document.removeEventListener("keydown", kh); });

        api._typeHint = function () {
          MK.toast("💡 Lihat papan kekunci — kekunci yang bersinar ialah huruf seterusnya!");
        };
      }
      api.hint(function () { if (api._typeHint) api._typeHint(); });
      build();
    }
  });
})();
