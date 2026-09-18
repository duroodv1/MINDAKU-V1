/* ============================================================
   GAME 25 — NUMBER CRANE (Matematik)
   Bina nombor menggunakan blok ratus, puluh dan sa.
   347 = 3 ratus + 4 puluh + 7 sa.
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "number-crane",
    name: "Number Crane",
    icon: "🏗️",
    cat: "matematik",
    engine: "custom",
    sticker: "🏗️",
    desc: "Gunakan kren untuk membina nombor dengan blok ratus, puluh dan sa.",
    instruction: function (l, d) {
      return "Ketuk butang untuk menambah blok pada setiap lajur. Bina nombor sasaran, kemudian tekan Semak!";
    },
    startLevel: function (mount, api) {
      var perLevel = 3, round = 0, mistakes = 0;
      var places = api.level <= 4 ? ["sa", "puluh"] : ["sa", "puluh", "ratus"];
      if (api.level >= 9 && api.diff === "cabaran") places = ["sa", "puluh", "ratus", "ribu"];
      var maxDigits = { ribu: 9, ratus: 9, puluh: 9, sa: 9 };

      function play() {
        var target = 0;
        var digits = {};
        places.forEach(function (p) { digits[p] = MK.Gen.ri(0, p === places[places.length - 1] ? maxDigits[p] : 9); });
        // pastikan digit tertinggi bukan sifar
        digits[places[places.length - 1]] = MK.Gen.ri(1, 9);
        var mult = { ribu: 1000, ratus: 100, puluh: 10, sa: 1 };
        places.forEach(function (p) { target += digits[p] * mult[p]; });

        var current = { sa: 0, puluh: 0, ratus: 0, ribu: 0 };

        mount.innerHTML = "";
        mount.appendChild(MK.el("div", "prompt small", "Bina nombor: <b>" + target + "</b> (" + (round + 1) + "/" + perLevel + ")"));

        var targetCard = MK.el("div", "prompt", "🎯 " + target);
        targetCard.style.fontSize = "2.2rem";
        mount.appendChild(targetCard);

        var colsRow = MK.el("div", "row center wrap");
        colsRow.style.gap = "10px";
        colsRow.style.alignItems = "flex-end";
        var colEls = {};
        places.slice().reverse().forEach(function (p) { // ribu/ratus/puluh/sa kiri→kanan
          var col = MK.el("div", null);
          col.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:4px;min-width:84px";
          var label = { ribu: "RIBU", ratus: "RATUS", puluh: "PULUH", sa: "SA" }[p];
          var blocks = MK.el("div", null);
          blocks.style.cssText = "display:flex;flex-direction:column-reverse;gap:3px;min-height:130px;justify-content:flex-start;background:#F4F0E4;border-radius:10px;padding:6px;width:72px";
          var minus = MK.el("button", "tool-btn", "−");
          minus.style.minHeight = "40px";
          var count = MK.el("div", null, "0");
          count.style.cssText = "font-weight:900;font-size:1.1rem;color:var(--brand-deep)";
          var plus = MK.el("button", "tool-btn", "+ " + label.toLowerCase());
          plus.style.minHeight = "44px";
          plus.addEventListener("click", function () {
            if (current[p] >= 9) { MK.toast("Maksimum 9 blok setiap lajur 🙂"); return; }
            current[p]++;
            api.sfx("place");
            renderBlocks();
          });
          minus.addEventListener("click", function () {
            if (current[p] <= 0) return;
            current[p]--;
            api.sfx("tap");
            renderBlocks();
          });
          col.appendChild(MK.el("div", "soft-note", label));
          col.appendChild(blocks); col.appendChild(count);
          var btns = MK.el("div", "row");
          btns.appendChild(minus); btns.appendChild(plus);
          col.appendChild(btns);
          colsRow.appendChild(col);
          colEls[p] = { blocks: blocks, count: count };
        });
        mount.appendChild(colsRow);

        function renderBlocks() {
          places.forEach(function (p) {
            var ce = colEls[p];
            ce.blocks.innerHTML = "";
            var color = { ribu: "#B49AE0", ratus: "#7EA6E0", puluh: "#8FBF9F", sa: "#F2A65A" }[p];
            for (var i = 0; i < current[p]; i++) {
              var b = MK.el("div", null);
              var big = p === "ratus" || p === "ribu";
              b.style.cssText = "width:" + (big ? "58px" : "58px") + ";height:" + (big ? "14px" : "10px") + ";background:" + color + ";border-radius:3px;border:1.5px solid rgba(0,0,0,.08)";
              b.classList.add("drop-in");
              ce.blocks.appendChild(b);
            }
            ce.count.textContent = current[p];
          });
          var val = places.reduce(function (acc, p) { return acc + current[p] * mult[p]; }, 0);
          checkBtn.innerHTML = "✅ Semak <span style='opacity:.7'>(sekarang: " + val + ")</span>";
        }

        var checkBtn = MK.el("button", "btn primary big mt12", "✅ Semak");
        checkBtn.addEventListener("click", function () {
          var val = places.reduce(function (acc, p) { return acc + current[p] * mult[p]; }, 0);
          if (val === target) {
            api.sfx("win");
            var parts = places.filter(function (p) { return digits[p] > 0; }).map(function (p) { return digits[p] + " " + p; });
            api.feedback(true, "Tepat! " + target + " = " + parts.join(" + "));
            round++; api.progress(round, perLevel);
            setTimeout(function () {
              if (round >= perLevel) api.complete({ mistakes: mistakes }); else play();
            }, 1300);
          } else {
            mistakes++;
            api.sfx("retry");
            api.feedback(false, "Nombor anda ialah " + val + ". Cuba laraskan bloknya!");
          }
        });
        mount.appendChild(checkBtn);
        api._craneHint = function () {
          MK.toast("💡 Anda perlukan: " + places.filter(function (p) { return digits[p] > 0; }).map(function (p) { return digits[p] + " " + p; }).join(", "));
        };
        renderBlocks();
      }
      api.hint(function () { if (api._craneHint) api._craneHint(); });
      play();
    }
  });
})();
