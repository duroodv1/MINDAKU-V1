/* ============================================================
   GAME 26 — STAR MAZE (Logik & Penyelesaian Masalah)
   Maze dijana secara algoritma (recursive backtracker).
   Cari laluan, kumpul bintang, sampai ke destinasi.
   ============================================================ */
"use strict";
(function () {
  /* Jana maze pada grid tile (2w+1)×(2h+1) */
  function genMaze(w, h) {
    var W = 2 * w + 1, H = 2 * h + 1;
    var g = [];
    for (var y = 0; y < H; y++) { g.push([]); for (var x = 0; x < W; x++) g[y].push(1); }
    var stack = [[0, 0]];
    var visited = { "0,0": true };
    g[1][1] = 0;
    while (stack.length) {
      var cur = stack[stack.length - 1];
      var cx = cur[0], cy = cur[1];
      var nbs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
        .map(function (d) { return [cx + d[0], cy + d[1]]; })
        .filter(function (n) { return n[0] >= 0 && n[0] < w && n[1] >= 0 && n[1] < h && !visited[n[0] + "," + n[1]]; });
      if (nbs.length) {
        var nxt = nbs[Math.floor(Math.random() * nbs.length)];
        visited[nxt[0] + "," + nxt[1]] = true;
        g[2 * nxt[1] + 1][2 * nxt[0] + 1] = 0;
        g[cy + 1 + nxt[1] - cy][cx + 1 + nxt[0] - cx] = 0; // buka dinding antara
        stack.push(nxt);
      } else stack.pop();
    }
    return g;
  }

  MK.registerGame({
    id: "star-maze",
    name: "Star Maze",
    icon: "🌀",
    cat: "logik",
    engine: "custom",
    sticker: "⭐",
    desc: "Cari laluan, kumpul semua bintang dan sampai ke bendera!",
    instruction: function (l, d) {
      return "Gerakkan watak 🦉 dengan butang anak panah (atau leret papan). Kumpul semua ⭐ untuk membuka pintu keluar!";
    },
    startLevel: function (mount, api) {
      var w = Math.min(4 + Math.floor(api.level / 2), 8); // 5x5..11x11 tile
      var h = w;
      if (api.diff === "mudah") { w = Math.max(3, w - 1); h = Math.max(3, h - 1); }
      if (api.diff === "cabaran") { w = Math.min(9, w + 1); h = Math.min(9, h + 1); }

      var maze = genMaze(w, h);
      var W = maze[0].length, H = maze.length;
      var player = { x: 1, y: 1 };
      var goal = { x: W - 2, y: H - 2 };
      var stars = {};
      var nStars = Math.min(2 + Math.floor(api.level / 3), 5);
      // letak bintang di laluan sel rawak (bukan mula/tamat)
      var tries = 0;
      while (Object.keys(stars).length < nStars && tries++ < 200) {
        var sx = 1 + 2 * MK.Gen.ri(0, w - 1), sy = 1 + 2 * MK.Gen.ri(0, h - 1);
        if ((sx === 1 && sy === 1) || (sx === goal.x && sy === goal.y)) continue;
        if (stars[sx + "," + sy]) continue;
        stars[sx + "," + sy] = true;
      }
      var collected = 0, moves = 0, mistakes = 0;

      mount.innerHTML = "";
      mount.appendChild(MK.el("div", "prompt small", "Maze Level " + api.level + " — kumpul ⭐ " + collected + "/" + nStars));

      var wrap = MK.el("div", null);
      wrap.style.cssText = "display:flex;justify-content:center;touch-action:none";
      var grid = MK.el("div", "board-grid");
      var cellPx = Math.max(26, Math.min(44, Math.floor(360 / W)));
      grid.style.gridTemplateColumns = "repeat(" + W + "," + cellPx + "px)";
      grid.style.gap = "2px";
      wrap.appendChild(grid);
      mount.appendChild(wrap);

      function render() {
        grid.innerHTML = "";
        for (var y = 0; y < H; y++) {
          for (var x = 0; x < W; x++) {
            var c = MK.el("div", "bcell" + (maze[y][x] ? " wall" : " path"));
            c.style.width = cellPx + "px";
            c.style.height = cellPx + "px";
            c.style.fontSize = Math.floor(cellPx * 0.62) + "px";
            if (x === goal.x && y === goal.y) {
              c.classList.add("goal");
              c.innerHTML = collected >= nStars ? "🚩" : "🔒";
            } else if (stars[x + "," + y]) {
              c.classList.add("star");
              c.innerHTML = "⭐";
            }
            if (x === player.x && y === player.y) {
              var pl = MK.el("div", "pl maze-player", "🦉");
              pl.style.position = "absolute";
              c.style.position = "relative";
              c.appendChild(pl);
            }
            grid.appendChild(c);
          }
        }
      }

      function move(dx, dy) {
        var nx = player.x + dx, ny = player.y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) return;
        if (maze[ny][nx]) { api.sfx("tap"); return; }
        player.x = nx; player.y = ny;
        moves++;
        if (stars[nx + "," + ny]) {
          delete stars[nx + "," + ny];
          collected++;
          api.sfx("star");
          mount.querySelector(".prompt.small").innerHTML = "Maze Level " + api.level + " — kumpul ⭐ " + collected + "/" + nStars;
        }
        if (nx === goal.x && ny === goal.y) {
          if (collected >= nStars) {
            api.sfx("win");
            api.feedback(true, "Anda sampai! " + moves + " langkah. Hebat!");
            setTimeout(function () {
              api.complete({ mistakes: mistakes, stars: collected >= nStars ? 3 : 2 });
            }, 900);
            render();
            return;
          } else {
            api.feedback(false, "Pintu masih berkunci — kumpul " + (nStars - collected) + " bintang lagi!");
          }
        }
        render();
      }

      /* D-pad */
      var pad = MK.el("div", "dpad");
      var padDef = [
        ["", "↑", ""], ["←", "", "→"], ["", "↓", ""]
      ];
      var dirs = { "↑": [0, -1], "↓": [0, 1], "←": [-1, 0], "→": [1, 0] };
      padDef.forEach(function (row) {
        row.forEach(function (k) {
          if (!k) { pad.appendChild(MK.el("div", "dempty")); return; }
          var b = MK.el("button", "dbtn", k);
          b.setAttribute("aria-label", "Gerak " + k);
          b.addEventListener("click", function () { move(dirs[k][0], dirs[k][1]); });
          pad.appendChild(b);
        });
      });
      mount.appendChild(pad);

      /* papan kekunci */
      var kh = function (ev) {
        var map = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
        if (map[ev.key]) { ev.preventDefault(); move(map[ev.key][0], map[ev.key][1]); }
      };
      document.addEventListener("keydown", kh);
      api.onCleanup(function () { document.removeEventListener("keydown", kh); });

      /* swipe — lapisan input sejagat: Pointer → Sentuhan → Tetikus */
      var sx = null, sy = null, ptrOK = false, lastTouch = 0;
      function swipeEnd(cx, cy) {
        if (sx == null) return;
        var dx = cx - sx, dy = cy - sy;
        sx = sy = null;
        if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
        if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? 1 : -1, 0);
        else move(0, dy > 0 ? 1 : -1);
      }
      if (window.PointerEvent) {
        wrap.addEventListener("pointerdown", function (e) { ptrOK = true; try { wrap.setPointerCapture(e.pointerId); } catch (err) { } var c = MK.evtXY(e); if (c) { sx = c.x; sy = c.y; } });
        wrap.addEventListener("pointerup", function (e) { var c = MK.evtXY(e); if (c) swipeEnd(c.x, c.y); });
        wrap.addEventListener("pointercancel", function () { sx = sy = null; });
      }
      wrap.addEventListener("touchstart", function (e) {
        if (ptrOK) return;
        e.preventDefault();
        lastTouch = Date.now();
        var c = MK.evtXY(e);
        if (c) { sx = c.x; sy = c.y; }
      }, { passive: false });
      wrap.addEventListener("touchend", function (e) {
        if (ptrOK) return;
        e.preventDefault();
        var c = MK.evtXY(e);
        if (c) swipeEnd(c.x, c.y);
      }, { passive: false });
      wrap.addEventListener("touchcancel", function () { if (!ptrOK) { sx = sy = null; } });
      wrap.addEventListener("mousedown", function (e) {
        if (ptrOK || Date.now() - lastTouch < 600) return;
        var c = MK.evtXY(e);
        if (c) { sx = c.x; sy = c.y; }
      });
      wrap.addEventListener("mouseup", function (e) {
        if (ptrOK || Date.now() - lastTouch < 600 || sx == null) return;
        var c = MK.evtXY(e);
        if (c) swipeEnd(c.x, c.y);
      });

      api.hint(function () {
        // tunjuk laluan ringkas: BFS dari pemain ke matlamat
        var q = [[player.x, player.y]];
        var prev = {};
        var seen = {};
        seen[player.x + "," + player.y] = true;
        while (q.length) {
          var c = q.shift();
          if (c[0] === goal.x && c[1] === goal.y) break;
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
            var nx = c[0] + d[0], ny = c[1] + d[1];
            var k = nx + "," + ny;
            if (nx >= 0 && ny >= 0 && nx < W && ny < H && !maze[ny][nx] && !seen[k]) {
              seen[k] = true; prev[k] = c[0] + "," + c[1]; q.push([nx, ny]);
            }
          });
        }
        var path = [];
        var cur = goal.x + "," + goal.y;
        while (cur && cur !== player.x + "," + player.y) { path.push(cur); cur = prev[cur]; }
        path.slice(0, 5).forEach(function (k) {
          var p = k.split(",");
          var idx = parseInt(p[1], 10) * W + parseInt(p[0], 10);
          if (grid.children[idx]) grid.children[idx].style.boxShadow = "inset 0 0 0 3px var(--star)";
        });
        MK.toast("💡 Ikuti petak berwarna emas sekejap sahaja!");
        setTimeout(render, 2200);
      });

      render();
      api.progress(0, 1);
    }
  });
})();
