/* ============================================================
   GAME 15 — SHOPPING MEMORY (Memori & Perhatian)
   Lihat senarai barang, senarai disembunyikan, kemudian pilih
   barang yang perlu dibeli.
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "shopping-memory",
    name: "Shopping Memory",
    icon: "🛒",
    cat: "memori",
    engine: "custom",
    sticker: "📝",
    desc: "Ingat senarai belanja, kemudian pilih barang yang tepat daripada rak!",
    allowTimer: false,
    instruction: function (l, d) {
      return "Ingat senarai barang yang perlu dibeli. Selepas disembunyikan, pilih barang yang sama di rak!";
    },
    startLevel: function (mount, api) {
      var perLevel = 3, round = 0, mistakes = 0;
      var bank = (MK.Data.list("mathematics", "shopping") || {}).items || [
        { n: "Buku", e: "📚", p: 4 }, { n: "Pensel", e: "✏️", p: 2 }, { n: "Payung", e: "☂️", p: 7 },
        { n: "Bola", e: "⚽", p: 6 }, { n: "Gula-gula", e: "🍬", p: 1 }, { n: "Komik", e: "📕", p: 5 }
      ];
      var listLen = Math.min(3 + Math.floor(api.level / 3), 6);
      var shelfExtra = api.diff === "mudah" ? 2 : api.diff === "cabaran" ? 7 : 4;
      if (api.diff === "mudah") listLen = Math.max(3, listLen - 1);

      function play() {
        var items = MK.Gen.sample(bank, listLen + shelfExtra);
        var list = items.slice(0, listLen);
        var shelf = MK.Gen.shuffle(items);

        MK.MemoryGames.studyPhase(mount, "Senarai belanja (" + (round + 1) + "/" + perLevel + ")", function (sceneEl) {
          var ul = MK.el("div", null);
          ul.style.cssText = "display:flex;flex-direction:column;gap:6px";
          list.forEach(function (it, i) {
            var r = MK.el("div", null, '<b style="color:var(--brand-deep)">' + (i + 1) + '.</b> <span style="font-size:1.4rem">' + it.e + "</span> <b>" + it.n + "</b>");
            r.style.cssText += ";background:#fff;border:2px solid var(--line);border-radius:10px;padding:6px 12px";
            ul.appendChild(r);
          });
          sceneEl.appendChild(ul);
        }).then(function () {
          mount.innerHTML = "";
          mount.appendChild(MK.el("div", "prompt small", "Pilih " + listLen + " barang daripada senarai tadi"));
          var grid = MK.el("div", "choices");
          var sel = {};
          shelf.forEach(function (it) {
            var b = MK.el("button", "choice", '<span class="cem">' + it.e + "</span><span>" + it.n + "</span>");
            b.addEventListener("click", function () {
              MK.Audio.sfx("tap");
              if (sel[it.n]) { delete sel[it.n]; b.classList.remove("selected"); }
              else { sel[it.n] = true; b.classList.add("selected"); }
              checkBtn.disabled = Object.keys(sel).length !== listLen;
            });
            b._item = it;
            grid.appendChild(b);
          });
          mount.appendChild(grid);
          var checkBtn = MK.el("button", "btn primary big", "✅ Semak Bakul Saya");
          checkBtn.disabled = true;
          checkBtn.addEventListener("click", function () {
            var ok = list.every(function (x) { return sel[x.n]; }) && Object.keys(sel).length === listLen;
            if (ok) {
              api.sfx("win"); api.feedback(true);
              round++; api.progress(round, perLevel);
              setTimeout(function () {
                if (round >= perLevel) api.complete({ mistakes: mistakes }); else play();
              }, 950);
            } else {
              mistakes++;
              api.sfx("retry"); api.feedback(false, "Belum tepat. Semak semula bakul anda!");
              Object.keys(sel).forEach(function (k) { delete sel[k]; });
              grid.querySelectorAll(".choice").forEach(function (c) { c.classList.remove("selected"); });
              checkBtn.disabled = true;
            }
          });
          mount.appendChild(checkBtn);
          api._shopHint = function () {
            var missing = list.filter(function (x) { return !sel[x.n]; });
            if (missing.length) {
              MK.toast("💡 " + missing[0].e + " " + missing[0].n + " ada dalam senarai!");
              grid.querySelectorAll(".choice").forEach(function (c) {
                if (c._item === missing[0]) c.classList.add("hinted");
              });
            }
          };
        });
      }
      api.hint(function () { if (api._shopHint) api._shopHint(); });
      play();
    }
  });
})();
