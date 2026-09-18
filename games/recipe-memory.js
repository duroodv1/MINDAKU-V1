/* ============================================================
   GAME 12 — RECIPE MEMORY (Memori & Perhatian)
   Lihat bahan mengikut urutan, kemudian susun semula urutan
   yang betul. Contoh: roti → telur → keju → sayur.
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "recipe-memory",
    name: "Recipe Memory",
    icon: "🥪",
    cat: "memori",
    engine: "custom",
    sticker: "🧑‍🍳",
    desc: "Ingat urutan bahan mengikut turutan, kemudian susun semula!",
    allowTimer: false,
    instruction: function (l, d) {
      return "Ingat urutan bahan yang dipaparkan. Kemudian ketuk bahan mengikut urutan yang sama.";
    },
    startLevel: function (mount, api) {
      var perLevel = 3, round = 0, mistakes = 0;
      var bank = MK.Data.list("mathematics", "recipe");
      var len = Math.min(3 + Math.floor(api.level / 2), 7); // 3..7 bahan
      if (api.diff === "mudah") len = Math.max(3, len - 1);
      if (api.diff === "cabaran") len = Math.min(8, len + 1);
      var nDis = api.diff === "cabaran" ? 2 : api.diff === "sederhana" ? 1 : 0;

      function play() {
        var items = MK.Gen.sample(bank, len + nDis);
        var answer = items.slice(0, len);
        var extras = items.slice(len);
        var poolItems = MK.Gen.shuffle(answer.concat(extras)).map(function (it) { return { it: it, used: false }; });

        MK.MemoryGames.studyPhase(mount, "Resipi: ingat urutan (" + (round + 1) + "/" + perLevel + ")", function (sceneEl) {
          var row = MK.el("div", "row wrap center");
          row.style.gap = "8px";
          answer.forEach(function (it, i) {
            var d = MK.el("div", null, '<div style="font-weight:900;color:var(--brand-deep)">' + (i + 1) + '</div><div style="font-size:2rem">' + it.e + '</div><div style="font-size:.7rem;font-weight:800">' + it.n + "</div>");
            d.style.cssText += ";width:86px;padding:8px 4px;background:#fff;border:2px solid var(--line);border-radius:12px;text-align:center";
            row.appendChild(d);
          });
          sceneEl.appendChild(row);
        }).then(function () {
          mount.innerHTML = "";
          mount.appendChild(MK.el("div", "prompt small", "Susun bahan mengikut urutan tadi"));
          var slots = MK.el("div", "order-slots");
          var gridWrap = MK.el("div", "order-pool");
          var placed = []; // item atau null

          function renderSlots() {
            slots.innerHTML = "";
            for (var i = 0; i < answer.length; i++) {
              (function (idx) {
                if (placed[idx]) {
                  var s = MK.el("button", "oslot", placed[idx].e + " " + placed[idx].n);
                  s.setAttribute("aria-label", "Buang " + placed[idx].n);
                  s.addEventListener("click", function () {
                    var st = poolItems.find(function (p) { return p.it === placed[idx] && p.used; });
                    if (st) st.used = false;
                    placed[idx] = null;
                    MK.Audio.sfx("tap");
                    renderSlots(); renderPool();
                  });
                  slots.appendChild(s);
                } else {
                  slots.appendChild(MK.el("div", "oslot", String(idx + 1)));
                }
              })(i);
            }
          }
          function renderPool() {
            gridWrap.innerHTML = "";
            poolItems.forEach(function (st) {
              var b = MK.el("button", "otoken" + (st.used ? " used" : ""), st.it.e + " " + st.it.n);
              b.addEventListener("click", function () {
                if (st.used) return;
                MK.Audio.sfx("tap");
                var i = 0;
                while (i < answer.length && placed[i]) i++;
                if (i >= answer.length) return;
                placed[i] = st.it;
                st.used = true;
                renderSlots(); renderPool();
                if (placed.every(function (p) { return p; })) check();
              });
              gridWrap.appendChild(b);
            });
          }
          function check() {
            var ok = placed.every(function (p, i) { return p === answer[i]; });
            if (ok) {
              api.sfx("win"); api.feedback(true);
              round++; api.progress(round, perLevel);
              setTimeout(function () {
                if (round >= perLevel) api.complete({ mistakes: mistakes }); else play();
              }, 950);
            } else {
              mistakes++;
              api.sfx("retry"); api.feedback(false, "Urutan belum tepat. Ketuk bahan di atas untuk menukar!");
              slots.classList.add("shake-soft");
              setTimeout(function () { slots.classList.remove("shake-soft"); }, 550);
            }
          }
          mount.appendChild(slots);
          mount.appendChild(gridWrap);
          renderSlots(); renderPool();

          api._recHint = function () {
            for (var i = 0; i < answer.length; i++) {
              if (!placed[i] || placed[i] !== answer[i]) {
                MK.toast("💡 Bahan ke-" + (i + 1) + " ialah " + answer[i].n + " " + answer[i].e);
                return;
              }
            }
          };
        });
      }
      api.hint(function () { if (api._recHint) api._recHint(); });
      play();
    }
  });
})();
