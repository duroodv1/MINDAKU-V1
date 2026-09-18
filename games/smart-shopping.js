/* ============================================================
   GAME 38 — SMART SHOPPING (Kehidupan Harian)
   Bajet RM20 — pilih barang yang diperlukan tanpa melebihi
   bajet. Belanja secara bijak!
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "smart-shopping",
    name: "Smart Shopping",
    icon: "🛍️",
    cat: "kehidupan",
    engine: "custom",
    sticker: "💰",
    desc: "Gunakan bajet anda dengan bijak — beli hanya yang diperlukan!",
    instruction: function (l, d) {
      return "Baca situasi, pilih barang yang diperlukan, dan pastikan jumlah TIDAK melebihi bajet. Kemudian tekan Semak!";
    },
    startLevel: function (mount, api) {
      var perLevel = 2, round = 0, mistakes = 0;
      var data = MK.Data.bank("mathematics").shopping || {};
      var items = data.items || [];
      var scenarios = data.scenarios || [];

      function play() {
        var sc = scenarios[(api.level - 1 + round) % scenarios.length];
        var essItems = sc.essentials.map(function (n) {
          return items.find(function (it) { return it.n === n; });
        }).filter(Boolean);
        var otherPool = sc.others.map(function (n) {
          return items.find(function (it) { return it.n === n; });
        }).filter(Boolean);
        var nOther = api.diff === "mudah" ? 2 : api.diff === "cabaran" ? 5 : 3;
        var others = MK.Gen.sample(otherPool, nOther);
        var shelf = MK.Gen.shuffle(essItems.concat(others));
        var essSum = essItems.reduce(function (a, x) { return a + x.p; }, 0);
        var slack = api.diff === "cabaran" ? MK.Gen.ri(0, 1) : api.diff === "mudah" ? MK.Gen.ri(3, 6) : MK.Gen.ri(1, 3);
        var budget = essSum + slack;
        var sel = {};

        mount.innerHTML = "";
        mount.appendChild(MK.el("div", "prompt small", "🛒 " + MK.esc(sc.s) + " (" + (round + 1) + "/" + perLevel + ")"));
        var budgetCard = MK.el("div", "chip");
        budgetCard.style.cssText += ";font-size:1.05rem;padding:10px 18px";
        function renderBudget() {
          var sum = selItems().reduce(function (a, x) { return a + x.p; }, 0);
          budgetCard.innerHTML = "💰 Bajet: RM" + budget + " • Terpakai: RM" + sum +
            (sum > budget ? " ⚠️" : " ✔️");
          budgetCard.style.color = sum > budget ? "#B3563C" : "var(--ink-soft)";
        }
        mount.appendChild(budgetCard);

        function selItems() {
          return shelf.filter(function (x) { return sel[x.n]; });
        }

        var grid = MK.el("div", "choices");
        shelf.forEach(function (it) {
          var b = MK.el("button", "choice" + (sel[it.n] ? " selected" : ""),
            '<span class="cem">' + it.e + "</span><span>" + it.n + "<br>RM" + it.p + "</span>");
          b.addEventListener("click", function () {
            MK.Audio.sfx("tap");
            if (sel[it.n]) { delete sel[it.n]; b.classList.remove("selected"); }
            else { sel[it.n] = true; b.classList.add("selected"); }
            renderBudget();
            checkBtn.disabled = Object.keys(sel).length === 0;
          });
          b._item = it;
          grid.appendChild(b);
        });
        mount.appendChild(grid);

        var checkBtn = MK.el("button", "btn primary big", "✅ Semak Bakul");
        checkBtn.disabled = true;
        checkBtn.addEventListener("click", function () {
          var chosen = selItems();
          var sum = chosen.reduce(function (a, x) { return a + x.p; }, 0);
          var hasAllEss = essItems.every(function (e) { return sel[e.n]; });
          var onlyEss = chosen.every(function (c) { return essItems.indexOf(c) >= 0; });
          var needOnly = api.diff === "cabaran";
          var ok = hasAllEss && sum <= budget && (needOnly ? onlyEss : true);
          if (ok) {
            api.sfx("win");
            api.feedback(true, "Belanja bijak! RM" + sum + " daripada RM" + budget + ".");
            round++; api.progress(round, perLevel);
            setTimeout(function () {
              if (round >= perLevel) api.complete({ mistakes: mistakes }); else play();
            }, 1100);
          } else {
            mistakes++;
            api.sfx("retry");
            if (sum > budget) api.feedback(false, "Melebihi bajet! Buang barang yang tidak perlu.");
            else if (!hasAllEss) api.feedback(false, "Barang penting masih kurang. Baca semula situasinya!");
            else api.feedback(false, "Anda beli barang yang tidak diperlukan. Buang yang tidak perlu!");
          }
        });
        mount.appendChild(checkBtn);
        renderBudget();
        api._shopHint2 = function () {
          var missing = essItems.filter(function (e) { return !sel[e.n]; });
          if (missing.length) MK.toast("💡 Anda masih perlukan: " + missing.map(function (m) { return m.e + " " + m.n; }).join(", "));
          else MK.toast("💡 Itu sahaja yang diperlukan — tekan Semak!");
        };
      }
      api.hint(function () { if (api._shopHint2) api._shopHint2(); });
      play();
    }
  });
})();
