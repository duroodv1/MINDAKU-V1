/* ============================================================
   GAME 04 — SYMMETRY MIRROR (Bentuk & Geometri)
   Lengkapkan separuh gambar yang hilang mengikut simetri.
   Tahap: mudah → menegak → mendatar → corak kompleks.
   ============================================================ */
"use strict";
(function () {
  function axisFor(level) {
    if (level <= 4) return "v";
    if (level <= 6) return "h";
    return MK.Gen.chance(0.5) ? "v" : "h";
  }
  MK.registerGame({
    id: "symmetry-mirror",
    name: "Symmetry Mirror",
    icon: "🪞",
    cat: "bentuk",
    engine: "custom",
    sticker: "🦋",
    desc: "Lengkapkan bahagian yang hilang supaya corak menjadi simetri.",
    instruction: function (l, d) {
      var axis = axisFor(l);
      return axis === "h"
        ? "Corak di atas cermin sudah siap. Ketukkan petak di bawah cermin untuk melengkapkannya!"
        : "Corak di kiri cermin sudah siap. Ketukkan petak di kanan cermin untuk melengkapkannya!";
    },
    tasksPerLevel: 3,
    startLevel: function (mount, api) {
      var boardsPerLevel = api.diff === "mudah" ? 2 : 3;
      var boardIdx = 0, mistakes = 0;

      function axisFor(level) {
        if (level <= 4) return "v";
        if (level <= 6) return "h";
        return MK.Gen.chance(0.5) ? "v" : "h";
      }

      function build() {
        var level = api.level, diff = api.diff;
        var N = level <= 2 ? 6 : level <= 5 ? 8 : level <= 8 ? 8 : 10;
        if (diff === "mudah") N = Math.max(5, N - 2);
        if (diff === "cabaran") N = Math.min(12, N + 2);
        var axis = axisFor(level);
        var density = 0.35 + level * 0.03 + (diff === "cabaran" ? 0.08 : diff === "mudah" ? -0.08 : 0);
        density = Math.min(0.6, density);

        /* jana corak simetri separuh pertama */
        var cells = {};
        var half = Math.floor(N / 2);
        for (var r = 0; r < N; r++) {
          for (var c = 0; c < half; c++) {
            if (MK.Gen.chance(density)) {
              var color = level >= 7 && MK.Gen.chance(0.45) ? MK.Gen.pick(["#F2A65A", "#8FBF9F", "#B49AE0"]) : "#7EA6E0";
              if (axis === "v") cells[r + "," + c] = color;
              else cells[c + "," + r] = color;
            }
          }
        }
        /* pastikan sekurang-kurangnya 3 sel */
        var keys = Object.keys(cells);
        var guard = 0;
        while (keys.length < 3 && guard++ < 50) {
          var rr = MK.Gen.ri(0, N - 1), cc = MK.Gen.ri(0, half - 1);
          var k = axis === "v" ? rr + "," + cc : cc + "," + rr;
          cells[k] = "#7EA6E0"; keys = Object.keys(cells);
        }

        /* sel sasaran: cermin setiap sel terisi */
        var target = {};
        keys.forEach(function (k) {
          var p = k.split(",").map(Number);
          var mk = axis === "v" ? p[0] + "," + (N - 1 - p[1]) : (N - 1 - p[0]) + "," + p[1];
          target[mk] = cells[k];
        });

        mount.innerHTML = "";
        mount.appendChild(MK.el("div", "prompt small", "Lengkapkan corak simetri (" + (boardIdx + 1) + "/" + boardsPerLevel + ")"));

        var wrap = MK.el("div", null);
        wrap.style.cssText = "display:flex;justify-content:center";
        var grid = MK.el("div", "board-grid");
        var cellPx = Math.min(46, Math.floor(340 / N));
        grid.style.gridTemplateColumns = "repeat(" + N + ", " + cellPx + "px)";
        grid.style.gap = "3px";
        wrap.appendChild(grid);
        mount.appendChild(wrap);

        var filled = 0;
        var totalNeed = Object.keys(target).length;

        for (var r2 = 0; r2 < N; r2++) {
          for (var c2 = 0; c2 < N; c2++) {
            (function (r, c) {
              var key = r + "," + c;
              var cell = MK.el("button", "bcell");
              cell.style.width = cellPx + "px";
              cell.style.height = cellPx + "px";
              cell.style.borderRadius = "5px";
              var isMirrorLine = axis === "v" ? c === (N - 1) / 2 : r === (N - 1) / 2;
              var inLeftHalf = axis === "v" ? c < N / 2 : r < N / 2;
              if (isMirrorLine) {
                cell.style.background = "#D9CFA8";
                cell.style.cursor = "default";
                cell.setAttribute("aria-label", "garis cermin");
              } else if (cells[key]) {
                cell.style.background = cells[key];
                cell.style.cursor = "default";
                cell.setAttribute("aria-label", "petak berwarna");
              } else {
                cell.style.background = "#F4F0E4";
                cell.setAttribute("aria-label", "petak kosong");
                cell.addEventListener("click", function () {
                  if (target[key] && !cell.dataset.filled) {
                    cell.dataset.filled = "1";
                    cell.style.background = target[key];
                    cell.classList.add("pop");
                    filled++;
                    api.sfx("pop");
                    if (filled >= totalNeed) {
                      api.sfx("win");
                      api.feedback(true, "Corak simetri siap! Cantik!");
                      setTimeout(function () {
                        boardIdx++;
                        if (boardIdx >= boardsPerLevel) api.complete({ mistakes: mistakes });
                        else build();
                      }, 900);
                    } else {
                      api.feedback(true, "Betul! " + (totalNeed - filled) + " petak lagi.");
                    }
                  } else if (!cell.dataset.filled) {
                    mistakes++;
                    cell.classList.add("shake-soft");
                    setTimeout(function () { cell.classList.remove("shake-soft"); }, 500);
                    api.sfx("retry");
                    api.feedback(false, "Petak itu bukan cermin. Cuba petak yang sepadan!");
                  }
                });
              }
              grid.appendChild(cell);
            })(r2, c2);
          }
        }
        api.progress((boardIdx) / boardsPerLevel, boardsPerLevel);
        api._symHint = function () {
          for (var kk in target) {
            var el = grid.children[parseInt(kk.split(",")[0], 10) * N + parseInt(kk.split(",")[1], 10)];
            if (el && !el.dataset.filled) {
              el.classList.add("hint-glow");
              setTimeout(function (e) { return function () { e.classList.remove("hint-glow"); }; }(el), 2400);
              MK.toast("Petak yang bersinar ialah cermin yang betul ✨");
              return;
            }
          }
        };
      }
      api.hint(function () { if (api._symHint) api._symHint(); });
      build();
    }
  });
})();
