/* ============================================================
   GAME 14 — WHAT CHANGED? (Memori & Perhatian)
   Lihat pemandangan, kemudian cari apa yang berubah.
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "what-changed",
    name: "What Changed?",
    icon: "🔎",
    cat: "memori",
    engine: "custom",
    sticker: "🔍",
    desc: "Lihat pemandangan dengan teliti, kemudian cari objek yang berubah!",
    allowTimer: false,
    instruction: function (l, d) {
      return "Lihat pemandangan. Selepas anda sedia, beberapa objek akan berubah — ketuk objek yang berubah!";
    },
    startLevel: function (mount, api) {
      var perLevel = 2, round = 0, mistakes = 0;
      var bank = MK.Data.list("mathematics", "picnic");
      var n = Math.min(6 + Math.floor(api.level / 2), 12); // 6..11 objek
      var changes = api.level <= 3 ? 1 : api.level <= 6 ? 2 : 3;
      if (api.diff === "mudah") changes = Math.max(1, changes - 1);
      if (api.diff === "cabaran") changes = Math.min(4, changes + 1);

      function cellHtml(it, w) {
        return '<div style="font-size:1.9rem">' + it.e + '</div><div style="font-size:.62rem;font-weight:800;color:var(--ink-soft)">' + it.n + "</div>";
      }
      function makeGrid(items, w) {
        var grid = MK.el("div", "row wrap center");
        grid.style.gap = "8px";
        items.forEach(function (it) {
          var d = MK.el("div", null, cellHtml(it, w));
          d.style.cssText += ";width:" + w + "px;padding:8px 4px;background:#fff;border:2.5px solid var(--line);border-radius:12px;text-align:center;transition:all .25s ease";
          grid.appendChild(d);
        });
        return grid;
      }

      function play() {
        var items = MK.Gen.sample(bank, n + changes);
        var before = items.slice(0, n);
        var changeIdx = MK.Gen.sample(before.map(function (_, i) { return i; }), changes);
        var after = before.map(function (x) { return x; });
        changeIdx.forEach(function (ci, k) {
          after[ci] = items[n + k]; // objek baharu menggantikan
        });
        var found = {};

        MK.MemoryGames.studyPhase(mount, "Ingat pemandangan (" + (round + 1) + "/" + perLevel + ")", function (sceneEl) {
          sceneEl.appendChild(makeGrid(before, 84));
        }).then(function () {
          mount.innerHTML = "";
          mount.appendChild(MK.el("div", "prompt small", "Ketuk objek yang <b>berubah</b> (" + changes + " objek)"));
          var grid = makeGrid(after, 84);
          var nFound = 0;
          Array.prototype.forEach.call(grid.children, function (d, i) {
            var changed = changeIdx.indexOf(i) >= 0;
            d.style.cursor = "pointer";
            d.setAttribute("role", "button");
            d.setAttribute("tabindex", "0");
            d.addEventListener("click", function () {
              if (d.dataset.done) return;
              if (changed) {
                d.dataset.done = "1";
                d.style.borderColor = "var(--good)";
                d.style.background = "var(--soft-good)";
                d.classList.add("found-pop");
                api.sfx("pop");
                nFound++;
                if (nFound >= changes) {
                  api.sfx("win"); api.feedback(true);
                  round++; api.progress(round, perLevel);
                  setTimeout(function () {
                    if (round >= perLevel) api.complete({ mistakes: mistakes }); else play();
                  }, 950);
                } else {
                  api.feedback(true, "Jumpa satu! Cari " + (changes - nFound) + " lagi.");
                }
              } else {
                mistakes++;
                d.classList.add("shake-soft");
                setTimeout(function () { d.classList.remove("shake-soft"); }, 500);
                api.sfx("retry"); api.feedback(false);
              }
            });
          });
          mount.appendChild(grid);
          api._wcHint = function () {
            var i = changeIdx.find(function (c) { return !grid.children[c].dataset.done; });
            if (i != null) {
              grid.children[i].classList.add("hint-glow");
              setTimeout(function () { grid.children[i].classList.remove("hint-glow"); }, 2400);
              MK.toast("💡 Objek yang bersinar telah berubah!");
            }
          };
        });
      }
      api.hint(function () { if (api._wcHint) api._wcHint(); });
      play();
    }
  });
})();
