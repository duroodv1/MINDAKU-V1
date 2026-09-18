/* ============================================================
   GAME 24 — FAIR SHARE (Matematik)
   Bahagikan objek sama rata. 12 biskut ÷ 3 pinggan.
   Tahap tinggi memperkenalkan baki.
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "fair-share",
    name: "Fair Share",
    icon: "🍪",
    cat: "matematik",
    engine: "custom",
    sticker: "🍽️",
    desc: "Bahagikan biskut sama rata ke atas pinggan. Tahap tinggi ada baki!",
    instruction: function (l, d) {
      return "Ketuk pinggan untuk meletakkan satu biskut daripada bakul. Kongsi sama rata, kemudian tekan Semak!";
    },
    startLevel: function (mount, api) {
      var perLevel = 3, round = 0, mistakes = 0;
      var maxDiv = Math.min(3 + Math.floor(api.level / 2), 8);
      if (api.diff === "mudah") maxDiv = Math.max(2, maxDiv - 2);
      if (api.diff === "cabaran") maxDiv = Math.min(10, maxDiv + 1);
      var withRemainder = api.level >= 6 && api.diff !== "mudah";

      function play() {
        var plates = MK.Gen.ri(2, maxDiv);
        var share = MK.Gen.ri(2, api.diff === "cabaran" ? 6 : 4);
        var rem = withRemainder && MK.Gen.chance(0.6) ? MK.Gen.ri(1, plates - 1) : 0;
        var total = plates * share + rem;
        var basket = total;
        var onPlate = [];
        for (var i = 0; i < plates; i++) onPlate.push(0);

        mount.innerHTML = "";
        mount.appendChild(MK.el("div", "prompt small",
          "Bahagikan <b>" + total + " biskut</b> kepada <b>" + plates + " pinggan</b> secara sama rata" +
          (rem ? " (ada baki!)" : "") + " (" + (round + 1) + "/" + perLevel + ")"));

        var basketEl = MK.el("div", null);
        basketEl.style.cssText = "background:#FBEFE3;border:2.5px solid #E0C9A8;border-radius:16px;padding:10px 16px;text-align:center";
        function renderBasket() {
          basketEl.innerHTML = "<div style='font-size:.8rem;font-weight:800;color:#9A6A2F'>BAKUL</div><div style='font-size:1.5rem;line-height:1.25'>" + Array(basket + 1).join("🍪") + "</div><div style='font-size:.75rem;font-weight:700'>" + basket + " biskut lagi</div>";
        }
        mount.appendChild(basketEl);

        var plateRow = MK.el("div", "row center wrap");
        plateRow.style.gap = "10px";
        var plateEls = [];
        for (var p = 0; p < plates; p++) {
          (function (idx) {
            var pl = MK.el("button", null);
            pl.style.cssText = "background:#fff;border:3px solid var(--line);border-radius:16px;min-width:96px;min-height:110px;padding:8px;display:flex;flex-direction:column;align-items:center;gap:2px";
            pl.setAttribute("aria-label", "Pinggan " + (idx + 1));
            pl.addEventListener("click", function () {
              if (basket <= 0) { MK.toast("Bakul sudah kosong 🙂"); return; }
              basket--; onPlate[idx]++;
              api.sfx("place");
              renderAll();
            });
            plateRow.appendChild(pl);
            plateEls.push(pl);
          })(p);
        }
        mount.appendChild(plateRow);

        var btnRow = MK.el("div", "row center wrap");
        var back = MK.el("button", "btn ghost", "↩︎ Ambil Semula");
        back.addEventListener("click", function () {
          var last = onPlate.findIndex(function (x) { return x > 0; });
          if (last >= 0) { onPlate[last]--; basket++; api.sfx("tap"); renderAll(); }
        });
        var check = MK.el("button", "btn primary big", "✅ Semak");
        check.addEventListener("click", function () { checkAll(); });
        btnRow.appendChild(back); btnRow.appendChild(check);
        mount.appendChild(btnRow);

        function renderAll() {
          renderBasket();
          plateEls.forEach(function (el, i) {
            el.innerHTML = "<div style='font-size:.75rem;font-weight:800;color:var(--ink-faint)'>PINGGAN " + (i + 1) + "</div>" +
              "<div style='font-size:1.3rem;line-height:1.3;min-height:34px'>" + (onPlate[i] ? Array(onPlate[i] + 1).join("🍪") : "—") + "</div>";
          });
        }
        function checkAll() {
          var shares = onPlate.slice();
          var left = basket;
          var allEqual = shares.every(function (x) { return x === shares[0]; });
          var ok = allEqual && left === rem;
          if (ok && shares[0] > 0) {
            api.sfx("win");
            api.feedback(true, "Sama rata! Setiap pinggan dapat " + shares[0] + (rem ? ", baki " + rem + " di bakul." : "."));
            round++; api.progress(round, perLevel);
            setTimeout(function () {
              if (round >= perLevel) api.complete({ mistakes: mistakes }); else play();
            }, 1200);
          } else {
            mistakes++;
            api.sfx("retry");
            if (!allEqual) api.feedback(false, "Belum sama rata — setiap pinggan mesti sama banyak!");
            else if (left !== rem) api.feedback(false, left > rem ? "Masih ada biskut di bakul — teruskan membahagi!" : "Terlalu banyak diletakkan. Ambil semula sedikit!");
          }
        }
        api._fairHint = function () {
          MK.toast("💡 Setiap pinggan patut dapat " + share + " biskut" + (rem ? " dan " + rem + " lagi tinggal di bakul" : "") + "!");
        };
        renderAll();
      }
      api.hint(function () { if (api._fairHint) api._fairHint(); });
      play();
    }
  });
})();
