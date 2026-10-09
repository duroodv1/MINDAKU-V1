/* ============================================================
   GAME 26 — STAR MAZE 2.0 (Logik & Penyelesaian Masalah)
   Maze dijana secara algoritma (recursive backtracker)
   + laluan berbilang untuk kesukaran "cabaran".
   UPGRADE 2.0: KETUK mana-mana petak putih — burung hantu 🦉
   akan mencari jalan paling pendek dan berjalan sendiri!
   (Butang D-pad, anak panah papan kekunci dan leret juga boleh.)
   Tiada penalti, tiada tekanan masa — semata-mata eksplorasi.
   ============================================================ */
"use strict";
(function () {
  /* Jana maze pada grid tile (2w+1)×(2h+1) + buka dinding untuk laluan berbilang */
  function genMaze(w, h, loops) {
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
        /* buka dinding antara sel semasa dan sel seterusna —
           titik tengah: (cx+nx+1, cy+ny+1) — SIMETRI untuk semua arah */
        g[cy + nxt[1] + 1][cx + nxt[0] + 1] = 0;
        stack.push(nxt);
      } else stack.pop();
    }
    /* buka beberapa dinding dalaman supaya ada laluan alternatif */
    var opened = 0, guard = 0;
    while (opened < loops && guard++ < 300) {
      var wx = MK.Gen.ri(1, W - 2), wy = MK.Gen.ri(1, H - 2);
      if (!g[wy][wx]) continue;
      var menegak = (wx % 2 === 0) && (wy % 2 === 1); /* antara kiri-kanan */
      var mendatar = (wx % 2 === 1) && (wy % 2 === 0); /* antara atas-bawah */
      if (menegak && !g[wy][wx - 1] && !g[wy][wx + 1]) { g[wy][wx] = 0; opened++; }
      else if (mendatar && !g[wy - 1][wx] && !g[wy + 1][wx]) { g[wy][wx] = 0; opened++; }
    }
    return g;
  }

  MK.registerGame({
    id: "star-maze",
    name: "Star Maze",
    icon: "🦉",
    cat: "logik",
    engine: "custom",
    sticker: "⭐",
    desc: "Ketuk mana-mana petak — burung hantu cari jalan sendiri! Kumpul semua bintang dan sampai ke bendera.",
    instruction: function (l, d) {
      return "Ketuk mana-mana petak putih — 🦉 akan mencari jalan ke sana! Kumpul semua ⭐ untuk membuka 🚩 pintu keluar. Butang anak panah juga boleh digunakan.";
    },
    startLevel: function (mount, api) {
      var level = api.level, diff = api.diff;
      var w = Math.min(3 + Math.floor(level / 2), 8), h = w, loops = 1;
      if (diff === "mudah") { w = Math.max(3, w - 1); h = Math.max(3, h - 1); loops = 0; }
      if (diff === "cabaran") { w = Math.min(9, w + 1); h = Math.min(9, h + 1); loops = 3; }

      var maze = genMaze(w, h, loops);
      var W = maze[0].length, H = maze.length;
      var player = { x: 1, y: 1 };
      var goal = { x: W - 2, y: H - 2 };
      var stars = {}, starEls = {};
      var nStars = Math.min(2 + Math.floor(level / 3), 5);
      var collected = 0, moves = 0, won = false;
      var walkId = 0, walkTimer = null, swipedAt = 0;

      /* letak bintang di sel laluan rawak (bukan mula/tamat) */
      var tries = 0;
      while (Object.keys(stars).length < nStars && tries++ < 300) {
        var sx = 1 + 2 * MK.Gen.ri(0, w - 1), sy = 1 + 2 * MK.Gen.ri(0, h - 1);
        if ((sx === 1 && sy === 1) || (sx === goal.x && sy === goal.y)) continue;
        if (stars[sx + "," + sy]) continue;
        stars[sx + "," + sy] = true;
      }

      mount.innerHTML = "";
      var promptEl = MK.el("div", "prompt small", "");
      mount.appendChild(promptEl);
      function updPrompt() {
        promptEl.innerHTML = "🦉 Star Maze Level " + level + " — kumpul ⭐ <b>" + collected + "/" + nStars + "</b>";
      }
      updPrompt();

      /* ---------- papan ---------- */
      var wrap = MK.el("div");
      wrap.style.cssText = "display:flex;justify-content:center;touch-action:none";
      var box = MK.el("div");
      box.style.position = "relative";
      var grid = MK.el("div", "board-grid");
      var avail = Math.min(340, Math.max(220, (window.innerWidth || 360) - 28));
      var cellPx = Math.max(16, Math.min(44, Math.floor((avail - 2 * (W - 1)) / W)));
      var gap = 2;
      grid.style.gridTemplateColumns = "repeat(" + W + "," + cellPx + "px)";
      grid.style.gap = gap + "px";
      box.appendChild(grid);

      var cells = [];
      for (var y = 0; y < H; y++) {
        for (var x = 0; x < W; x++) {
          var c = MK.el("div", "bcell " + (maze[y][x] ? "wall" : "path"));
          c.style.width = cellPx + "px";
          c.style.height = cellPx + "px";
          c.style.fontSize = Math.floor(cellPx * 0.62) + "px";
          c.style.display = "flex";
          c.style.alignItems = "center";
          c.style.justifyContent = "center";
          c.dataset.x = x; c.dataset.y = y;
          if (stars[x + "," + y]) {
            var st = MK.el("span", "anim-float", "⭐");
            st.style.display = "inline-block";
            st.style.fontSize = Math.floor(cellPx * 0.6) + "px";
            c.appendChild(st);
            starEls[x + "," + y] = st;
          }
          grid.appendChild(c);
          cells.push(c);
        }
      }
      function cellAt(x, y) { return cells[y * W + x]; }
      function setGoal() {
        var el = cellAt(goal.x, goal.y);
        if (el) el.textContent = collected >= nStars ? "🚩" : "🔒";
      }
      setGoal();

      /* pemain 🦉 — lapisan terapung, pergerakan lancar (tiada render semula) */
      var pl = MK.el("div", null, "🦉");
      pl.style.cssText = "position:absolute;display:flex;align-items:center;justify-content:center;" +
        "pointer-events:none;z-index:2;filter:drop-shadow(0 2px 2px rgba(0,0,0,.18));" +
        "transition:left .16s ease,top .16s ease";
      pl.style.width = cellPx + "px";
      pl.style.height = cellPx + "px";
      pl.style.fontSize = Math.floor(cellPx * 0.72) + "px";
      box.appendChild(pl);
      function placePlayer() {
        pl.style.left = (player.x * (cellPx + gap)) + "px";
        pl.style.top = (player.y * (cellPx + gap)) + "px";
      }
      placePlayer();
      wrap.appendChild(box);
      mount.appendChild(wrap);

      /* ---------- logik pergerakan ---------- */
      function bfs(sx, sy, tx, ty) {
        if (tx < 0 || ty < 0 || tx >= W || ty >= H || maze[ty][tx]) return null;
        var prev = {}, seen = {};
        seen[sx + "," + sy] = true;
        var q = [[sx, sy]];
        while (q.length) {
          var cu = q.shift();
          if (cu[0] === tx && cu[1] === ty) {
            var path = [], cur = tx + "," + ty;
            while (cur) { var p = cur.split(","); path.push([+p[0], +p[1]]); cur = prev[cur]; }
            return path.reverse();
          }
          [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(function (d) {
            var nx = cu[0] + d[0], ny = cu[1] + d[1], k = nx + "," + ny;
            if (nx >= 0 && ny >= 0 && nx < W && ny < H && !maze[ny][nx] && !seen[k]) {
              seen[k] = true; prev[k] = cu[0] + "," + cu[1]; q.push([nx, ny]);
            }
          });
        }
        return null;
      }

      function onArrive() {
        var k = player.x + "," + player.y;
        var c = cellAt(player.x, player.y);
        if (c && !c.dataset.v) { c.dataset.v = "1"; c.style.background = "#FCEFC4"; } /* jejak langkah */
        if (stars[k]) {
          delete stars[k];
          collected++;
          var st = starEls[k];
          if (st) {
            st.classList.remove("anim-float");
            st.classList.add("star-pop");
            setTimeout(function () { if (st.parentNode) st.parentNode.removeChild(st); }, 500);
          }
          api.sfx("star");
          updPrompt();
          api.progress(collected, nStars);
          if (collected >= nStars) { setGoal(); api.sfx("good"); MK.toast("🔓 Pintu keluar terbuka!"); }
        }
        if (player.x === goal.x && player.y === goal.y) {
          if (collected >= nStars) {
            if (!won) {
              won = true;
              api.sfx("win");
              api.feedback(true, "Anda sampai! " + moves + " langkah. Hebat!");
              setTimeout(function () { api.complete({ mistakes: 0, stars: 3 }); }, 900);
            }
          } else {
            api.feedback(false, "Pintu masih berkunci — kumpul " + (nStars - collected) + " bintang lagi!");
          }
        }
      }
      function moveTo(x, y) { player.x = x; player.y = y; moves++; placePlayer(); onArrive(); }
      function step(dx, dy) {
        if (won) return;
        var nx = player.x + dx, ny = player.y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) return;
        if (maze[ny][nx]) { api.sfx("tap"); return; } /* dinding — bunyi lembut sahaja, tiada penalti */
        stopWalk();
        moveTo(nx, ny);
      }
      function stopWalk() { walkId++; if (walkTimer) { clearTimeout(walkTimer); walkTimer = null; } }
      function walkTo(tx, ty) {
        if (won) return;
        if (tx === player.x && ty === player.y) return;
        var path = bfs(player.x, player.y, tx, ty);
        if (!path || path.length < 2) { api.sfx("tap"); return; } /* petak dinding — bunyi lembut */
        stopWalk();
        var id = ++walkId, i = 1;
        var delay = path.length > 12 ? 110 : 170; /* laluan panjang — langkah lebih pantas */
        (function next() {
          if (id !== walkId || won) { walkTimer = null; return; }
          if (i >= path.length) { walkTimer = null; return; }
          moveTo(path[i][0], path[i][1]);
          i++;
          walkTimer = setTimeout(next, delay);
        })();
      }

      /* ---------- input 1: KETUK petak (utama!) ---------- */
      grid.addEventListener("click", function (e) {
        if (Date.now() - swipedAt < 700) return; /* abaikan klik sejurus leret */
        var c = e.target && e.target.closest ? e.target.closest(".bcell") : null;
        if (!c) return;
        walkTo(+c.dataset.x, +c.dataset.y);
      });

      /* ---------- input 2: D-pad ---------- */
      var pad = MK.el("div", "dpad");
      var padDef = [["", "↑", ""], ["←", "", "→"], ["", "↓", ""]];
      var dirs = { "↑": [0, -1], "↓": [0, 1], "←": [-1, 0], "→": [1, 0] };
      padDef.forEach(function (row) {
        row.forEach(function (k) {
          if (!k) { pad.appendChild(MK.el("div", "dempty")); return; }
          var b = MK.el("button", "dbtn", k);
          b.setAttribute("aria-label", "Gerak " + k);
          b.addEventListener("click", function () { step(dirs[k][0], dirs[k][1]); });
          pad.appendChild(b);
        });
      });
      mount.appendChild(pad);

      /* ---------- input 3: papan kekunci ---------- */
      var kh = function (ev) {
        var map = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
        if (map[ev.key]) { ev.preventDefault(); step(map[ev.key][0], map[ev.key][1]); }
      };
      document.addEventListener("keydown", kh);

      /* ---------- input 4: leret (bonus) — Pointer → Sentuhan → Tetikus ---------- */
      var sx0 = null, sy0 = null, ptrOK = false, lastTouch = 0;
      function swipeEnd(cx, cy) {
        if (sx0 == null) return;
        var dx = cx - sx0, dy = cy - sy0;
        sx0 = sy0 = null;
        if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
        swipedAt = Date.now();
        if (Math.abs(dx) > Math.abs(dy)) step(dx > 0 ? 1 : -1, 0);
        else step(0, dy > 0 ? 1 : -1);
      }
      if (window.PointerEvent) {
        wrap.addEventListener("pointerdown", function (e) {
          ptrOK = true;
          try { wrap.setPointerCapture(e.pointerId); } catch (err) { }
          var c = MK.evtXY(e); if (c) { sx0 = c.x; sy0 = c.y; }
        });
        wrap.addEventListener("pointerup", function (e) { var c = MK.evtXY(e); if (c) swipeEnd(c.x, c.y); });
        wrap.addEventListener("pointercancel", function () { sx0 = sy0 = null; });
      }
      wrap.addEventListener("touchstart", function (e) {
        if (ptrOK) return;
        lastTouch = Date.now();
        var c = MK.evtXY(e); if (c) { sx0 = c.x; sy0 = c.y; }
      }, { passive: true });
      wrap.addEventListener("touchmove", function (e) { if (!ptrOK) e.preventDefault(); }, { passive: false });
      wrap.addEventListener("touchend", function (e) {
        if (ptrOK) return;
        var c = MK.evtXY(e); if (c) swipeEnd(c.x, c.y);
      });
      wrap.addEventListener("mousedown", function (e) {
        if (ptrOK || Date.now() - lastTouch < 600) return;
        var c = MK.evtXY(e); if (c) { sx0 = c.x; sy0 = c.y; }
      });
      wrap.addEventListener("mouseup", function (e) {
        if (ptrOK || Date.now() - lastTouch < 600 || sx0 == null) return;
        var c = MK.evtXY(e); if (c) swipeEnd(c.x, c.y);
      });

      /* ---------- petunjuk: tunjuk 5 langkah pertama ke matlamat ---------- */
      api.hint(function () {
        var path = bfs(player.x, player.y, goal.x, goal.y);
        if (!path) return;
        var lit = [];
        path.slice(1, 6).forEach(function (p) {
          var c = cellAt(p[0], p[1]);
          if (c) { c.style.boxShadow = "inset 0 0 0 3px #F0BE4D"; lit.push(c); }
        });
        MK.toast("💡 Ikuti petak emas sekejap sahaja!");
        setTimeout(function () { lit.forEach(function (c) { c.style.boxShadow = ""; }); }, 2200);
      });

      api.onCleanup(function () {
        document.removeEventListener("keydown", kh);
        if (walkTimer) clearTimeout(walkTimer);
      });

      api.progress(0, nStars);
    }
  });
})();
