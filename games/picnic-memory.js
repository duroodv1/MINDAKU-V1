/* ============================================================
   GAME 11 — PICNIC MEMORY (Memori & Perhatian)
   Lihat suasana berkelah, satu objek hilang — kenal pasti!
   Timer OFF secara default (tiada tekanan masa).
   ============================================================ */
"use strict";

/* Pembantu kongsi untuk permainan memori fasa belajar */
MK.MemoryGames = {
  /* Fasa mengingat: papar kandungan sehingga pemain sedia */
  studyPhase: function (mount, title, buildScene, readyLabel) {
    return new Promise(function (resolve) {
      mount.innerHTML = "";
      mount.appendChild(MK.el("div", "prompt small", title));
      var scene = MK.el("div", null);
      scene.style.cssText = "background:#FDFBF5;border-radius:16px;padding:14px;min-height:160px";
      buildScene(scene);
      mount.appendChild(scene);
      var btn = MK.el("button", "btn primary big mt12", readyLabel || "✅ Saya Dah Ingat!");
      btn.addEventListener("click", function () { MK.Audio.sfx("tap"); resolve(); });
      mount.appendChild(btn);
      mount.appendChild(MK.el("div", "soft-note", "Ambil masa anda — tiada had masa 🙂"));
    });
  },
  shuffleIndices: function (n) {
    var a = []; for (var i = 0; i < n; i++) a.push(i);
    return MK.Gen.shuffle(a);
  }
};

(function () {
  MK.registerGame({
    id: "picnic-memory",
    name: "Picnic Memory",
    icon: "🧺",
    cat: "memori",
    engine: "custom",
    sticker: "🍓",
    desc: "Lihat barang berkelah, kemudian kenal pasti objek yang hilang. Tiada timer!",
    allowTimer: false,
    instruction: function (l, d) {
      return "Lihat semua barang di atas tikar berkelah. Apabila anda sedia, tekan butang — satu barang akan hilang!";
    },
    startLevel: function (mount, api) {
      var perLevel = 3, round = 0, mistakes = 0;
      var bank = MK.Data.list("mathematics", "picnic");
      var n = Math.min(4 + Math.floor(api.level / 2), 10); // 4..9 objek
      if (api.diff === "mudah") n = Math.max(3, n - 2);
      if (api.diff === "cabaran") n = Math.min(12, n + 2);

      function play() {
        var items = MK.Gen.sample(bank, n + 1); // +1 untuk pengganggu
        var scene = items.slice(0, n);
        var missing = MK.Gen.ri(0, n - 1);

        MK.MemoryGames.studyPhase(mount, "Barang berkelah (" + (round + 1) + "/" + perLevel + ")", function (sceneEl) {
          var grid = MK.el("div", "row wrap center");
          grid.style.gap = "8px";
          scene.forEach(function (it) {
            var d = MK.el("div", null, '<div style="font-size:2rem">' + it.e + '</div><div style="font-size:.7rem;font-weight:800;color:var(--ink-soft)">' + it.n + "</div>");
            d.style.cssText += ";width:82px;padding:8px 4px;background:#fff;border:2px solid var(--line);border-radius:12px;text-align:center";
            grid.appendChild(d);
          });
          sceneEl.appendChild(grid);
        }).then(function () {
          /* fasa jawab: satu hilang */
          mount.innerHTML = "";
          mount.appendChild(MK.el("div", "prompt small", "Barang mana yang hilang?"));
          var grid2 = MK.el("div", "row wrap center");
          grid2.style.gap = "8px";
          scene.forEach(function (it, i) {
            var inner = i === missing
              ? '<div style="font-size:2rem;color:#C9C0AF">❓</div><div style="font-size:.7rem;font-weight:800;color:var(--ink-faint)">Hilang?</div>'
              : '<div style="font-size:2rem">' + it.e + '</div><div style="font-size:.7rem;font-weight:800;color:var(--ink-soft)">' + it.n + "</div>";
            var d = MK.el("div", null, inner);
            d.style.cssText += ";width:82px;padding:8px 4px;background:#fff;border:2px solid var(--line);border-radius:12px;text-align:center";
            grid2.appendChild(d);
          });
          mount.appendChild(grid2);

          var nCh = api.diff === "cabaran" ? 4 : 3;
          var others = MK.Gen.sample(items.slice(n).concat(bank.filter(function (b) { return scene.indexOf(b) < 0 && b !== items[n]; })), nCh - 1);
          var opts = MK.Gen.shuffle([scene[missing]].concat(others));
          var grid3 = MK.el("div", "choices");
          opts.forEach(function (o) {
            var b = MK.el("button", "choice", '<span class="cem">' + o.e + "</span><span>" + o.n + "</span>");
            b.addEventListener("click", function () {
              if (o === scene[missing]) {
                b.classList.add("correct");
                api.sfx("good"); api.feedback(true);
                round++; api.progress(round, perLevel);
                setTimeout(function () {
                  if (round >= perLevel) api.complete({ mistakes: mistakes }); else play();
                }, 900);
              } else {
                mistakes++;
                b.classList.add("shake-soft");
                setTimeout(function () { b.classList.remove("shake-soft"); }, 500);
                api.sfx("retry"); api.feedback(false);
              }
            });
            grid3.appendChild(b);
          });
          mount.appendChild(grid3);
          api._picHint = function () {
            for (var i = 0; i < opts.length; i++) {
              if (opts[i] === scene[missing]) { grid3.children[i].classList.add("hinted"); }
            }
            MK.toast("💡 Barang yang bersinar itulah yang hilang!");
          };
        });
      }
      api.hint(function () { if (api._picHint) api._picHint(); });
      play();
    }
  });
})();
