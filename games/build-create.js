/* ============================================================
   GAME 50 — BUILD & CREATE (Kreativiti & Digital)
   Permainan binaan bebas: blok, bentuk, warna, struktur.
   Tiada jawapan salah. Tiada penalti. Simpan ke GALERI SAYA.
   ============================================================ */
"use strict";
(function () {
  var SHAPES = [
    { id: "square", label: "Blok", emoji: "🟦" },
    { id: "circle", label: "Bulat", emoji: "🔵" },
    { id: "triangle", label: "Segi Tiga", emoji: "🔺" },
    { id: "star", label: "Bintang", emoji: "⭐" },
    { id: "heart", label: "Hati", emoji: "❤️" },
    { id: "grass", label: "Rumput", emoji: "🌿" }
  ];
  var COLORS = ["#7EA6E0", "#F2A65A", "#8FBF9F", "#E8875F", "#B49AE0", "#F0BE4D", "#E8A2B0", "#6FAECB"];

  MK.registerGame({
    id: "build-create",
    name: "Build & Create",
    icon: "🏗️",
    cat: "kreativiti",
    engine: "creative",
    sticker: "🏰",
    desc: "Bina apa sahaja yang anda suka — tiada jawapan salah, tiada penalti!",
    allowTimer: false,
    instruction: function (l, d) {
      return "Pilih bentuk dan warna, kemudian ketuk papan untuk meletakkan. Seret untuk alihkan. Bina karya anda!";
    },
    startLevel: function (mount, api) {
      var THEMES = ["Bandar Impian", "Istana Ajaib", "Zoo Saya", "Rumah Masa Depan", "Taman Permainan", "Bot Lautan", "Menara Tinggi", "Kampung Saya", "Stesen Angkasa", "Dunia Saya"];
      var theme = THEMES[(api.level - 1) % THEMES.length];
      var state = { shape: "square", color: COLORS[0], sel: null };
      var placed = [];

      mount.innerHTML = "";
      mount.appendChild(MK.el("div", "prompt small", "🏗️ Tema bebas: <b>" + theme + "</b> — bina apa sahaja!"));

      /* papan */
      var boardWrap = MK.el("div", "canvas-wrap");
      boardWrap.style.cssText += ";max-width:480px;margin:0 auto;background:#FDFBF5";
      /* ketinggian dikira dengan JS — CSS min() tidak disokong WebView lama (<Chromium 79);
         tanpa ini papan menjadi 0px tinggi dan permainan "tidak berfungsi" */
      function fitBoard() {
        var h = Math.round(Math.min(400, window.innerWidth * 0.7));
        boardWrap.style.height = Math.max(240, h) + "px";
      }
      fitBoard();
      var onRz = function () { if (!boardWrap.isConnected) { window.removeEventListener("resize", onRz); return; } fitBoard(); };
      window.addEventListener("resize", onRz);
      var NS = "http://www.w3.org/2000/svg";
      var svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 480 400");
      svg.style.cssText = "width:100%;height:100%;touch-action:none";
      boardWrap.appendChild(svg);
      mount.appendChild(boardWrap);

      var gridG = document.createElementNS(NS, "g");
      for (var gx = 0; gx <= 480; gx += 24) {
        var l = document.createElementNS(NS, "line");
        l.setAttribute("x1", gx); l.setAttribute("y1", 0); l.setAttribute("x2", gx); l.setAttribute("y2", 400);
        l.setAttribute("stroke", "#EFEBE0"); l.setAttribute("stroke-width", "1");
        gridG.appendChild(l);
      }
      for (var gy = 0; gy <= 400; gy += 24) {
        var l2 = document.createElementNS(NS, "line");
        l2.setAttribute("x1", 0); l2.setAttribute("y1", gy); l2.setAttribute("x2", 480); l2.setAttribute("y2", gy);
        l2.setAttribute("stroke", "#EFEBE0"); l2.setAttribute("stroke-width", "1");
        gridG.appendChild(l2);
      }
      svg.appendChild(gridG);

      function shapeEl(kind, color, x, y, size) {
        var g = document.createElementNS(NS, "g");
        var el;
        if (kind === "circle") el = document.createElementNS(NS, "circle");
        else el = document.createElementNS(NS, "polygon");
        el.setAttribute("fill", color);
        el.setAttribute("stroke", "rgba(0,0,0,.12)");
        el.setAttribute("stroke-width", "2");
        var s = size || 22;
        if (kind === "circle") {
          el.setAttribute("cx", "0"); el.setAttribute("cy", "0"); el.setAttribute("r", String(s));
        } else if (kind === "square") {
          el.setAttribute("points", (-s) + "," + (-s) + " " + s + "," + (-s) + " " + s + "," + s + " " + (-s) + "," + s);
        } else if (kind === "triangle") {
          el.setAttribute("points", "0," + (-s) + " " + s + "," + s + " " + (-s) + "," + s);
        } else if (kind === "star") {
          var pts = [];
          for (var i = 0; i < 10; i++) {
            var r = i % 2 === 0 ? s + 3 : (s + 3) * 0.45;
            var a = -Math.PI / 2 + (i * Math.PI) / 5;
            pts.push((r * Math.cos(a)).toFixed(1) + "," + (r * Math.sin(a)).toFixed(1));
          }
          el.setAttribute("points", pts.join(" "));
        } else if (kind === "heart") {
          el = document.createElementNS(NS, "path");
          var d = "M0 " + (s * 0.4) + " C " + (-s * 1.2) + " " + (-s * 0.5) + " " + (-s * 0.5) + " " + (-s * 1.2) + " 0 " + (-s * 0.35) +
            " C " + (s * 0.5) + " " + (-s * 1.2) + " " + (s * 1.2) + " " + (-s * 0.5) + " 0 " + (s * 0.4) + " Z";
          el.setAttribute("d", d);
          el.setAttribute("fill", color);
        } else { // grass
          el = document.createElementNS(NS, "path");
          el.setAttribute("d", "M-" + s + " " + s + " Q-" + (s * 0.5) + " -" + s + " 0 -" + (s * 0.2) + " Q" + (s * 0.5) + " -" + s + " " + s + " " + s + " Z");
          el.setAttribute("fill", color);
        }
        g.appendChild(el);
        g.setAttribute("transform", "translate(" + x + "," + y + ")");
        g.style.cursor = "grab";
        return g;
      }

      function pos(cx, cy) {
        var r = svg.getBoundingClientRect();
        return { x: (cx - r.left) * (480 / r.width), y: (cy - r.top) * (400 / r.height) };
      }
      function snap(v) { return Math.round(v / 12) * 12; }

      var dragTarget = null, dragOff = { x: 0, y: 0 }, moved = false, ptrOK = false, lastTouch = 0;

      /* ---------- Lapisan input sejagat ----------
         1) Pointer Events — pelayar baharu (Chrome, Edge, Safari 13+)
         2) Sentuhan (touch) — pelayar lama tanpa Pointer Events
         3) Tetikus (mouse) — pelayar desktop lama
         Hanya satu lapisan aktif pada satu masa (ptrOK). */
      function down(cx, cy, target, capture) {
        var p = pos(cx, cy);
        var hit = target && target.closest ? target.closest("g") : null;
        if (hit && hit !== gridG && hit.dataset.placed) {
          /* seret item sedia ada */
          dragTarget = hit;
          dragOff.x = parseFloat(hit.dataset.x) - p.x;
          dragOff.y = parseFloat(hit.dataset.y) - p.y;
          moved = false;
          if (capture) { try { capture(); } catch (err) { } }
        } else {
          /* letak bentuk baharu */
          var x = snap(p.x), y = snap(p.y);
          var el = shapeEl(state.shape, state.color, x, y);
          el.dataset.placed = "1";
          el.dataset.x = x; el.dataset.y = y;
          el.classList.add("drop-in");
          svg.appendChild(el);
          placed.push(el);
          api.sfx("place");
        }
      }
      function move(cx, cy) {
        if (!dragTarget) return;
        var p = pos(cx, cy);
        var x = snap(p.x + dragOff.x), y = snap(p.y + dragOff.y);
        dragTarget.dataset.x = x; dragTarget.dataset.y = y;
        dragTarget.setAttribute("transform", "translate(" + x + "," + y + ")");
        moved = true;
      }
      function up() {
        if (dragTarget && moved) api.sfx("tap");
        dragTarget = null;
      }

      if (window.PointerEvent) {
        svg.addEventListener("pointerdown", function (e) {
          ptrOK = true;
          down(e.clientX, e.clientY, e.target, function () { svg.setPointerCapture(e.pointerId); });
        });
        svg.addEventListener("pointermove", function (e) { move(e.clientX, e.clientY); });
        svg.addEventListener("pointerup", up);
        svg.addEventListener("pointercancel", up);
      }
      svg.addEventListener("touchstart", function (e) {
        if (ptrOK) return;
        e.preventDefault();
        lastTouch = Date.now();
        var t = e.changedTouches[0];
        down(t.clientX, t.clientY, e.target, null);
      }, { passive: false });
      svg.addEventListener("touchmove", function (e) {
        if (ptrOK || !dragTarget) return;
        e.preventDefault();
        var t = e.changedTouches[0];
        move(t.clientX, t.clientY);
      }, { passive: false });
      svg.addEventListener("touchend", function (e) { if (ptrOK) return; e.preventDefault(); up(); }, { passive: false });
      svg.addEventListener("touchcancel", function () { if (!ptrOK) up(); });
      svg.addEventListener("mousedown", function (e) {
        if (ptrOK || Date.now() - lastTouch < 600) return;
        down(e.clientX, e.clientY, e.target, null);
      });
      document.addEventListener("mousemove", function (e) { if (!ptrOK && dragTarget && svg.isConnected) move(e.clientX, e.clientY); });
      document.addEventListener("mouseup", function () { if (!ptrOK && dragTarget && svg.isConnected) up(); });

      /* alat */
      var shapeRow = MK.el("div", "tool-row");
      SHAPES.forEach(function (s, i) {
        var b = MK.el("button", "tool-btn" + (i === 0 ? " on" : ""), s.emoji + " " + s.label);
        b.addEventListener("click", function () {
          state.shape = s.id;
          shapeRow.querySelectorAll(".tool-btn").forEach(function (x) { x.classList.remove("on"); });
          b.classList.add("on");
          api.sfx("tap");
        });
        shapeRow.appendChild(b);
      });
      mount.appendChild(shapeRow);

      var colorRow = MK.el("div", "tool-row");
      COLORS.forEach(function (c, i) {
        var b = MK.el("button", "swatch" + (i === 0 ? " sel" : ""));
        b.style.background = c;
        b.setAttribute("aria-label", "Warna");
        b.addEventListener("click", function () {
          state.color = c;
          colorRow.querySelectorAll(".swatch").forEach(function (x) { x.classList.remove("sel"); });
          b.classList.add("sel");
          api.sfx("tap");
        });
        colorRow.appendChild(b);
      });
      mount.appendChild(colorRow);

      var actRow = MK.el("div", "tool-row");
      var delBtn = MK.el("button", "tool-btn", "❌ Padam Terakhir");
      delBtn.addEventListener("click", function () {
        var last = placed.pop();
        if (last) { last.remove(); api.sfx("pop"); }
        else MK.toast("Papan sudah kosong 🙂");
      });
      var clearBtn = MK.el("button", "tool-btn", "🗑️ Kosongkan");
      clearBtn.addEventListener("click", async function () {
        if (!placed.length) return;
        var okd = await MK.confirmBox("Kosongkan papan?", "Semua bentuk akan dipadam.", "Kosongkan", "Batal");
        if (!okd) return;
        placed.forEach(function (p2) { p2.remove(); });
        placed = [];
        api.sfx("pop");
      });
      var saveBtn = MK.el("button", "tool-btn", "💾 Simpan ke Galeri");
      saveBtn.addEventListener("click", function () {
        try {
          var inner = svg.innerHTML;
          var clone = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 400"><rect width="480" height="400" fill="#FDFBF5"/>' + inner + "</svg>";
          MK.Gallery.saveSVG(clone, "build-create", theme)
            .then(function () { api.sfx("star"); MK.toast("Ciptaan disimpan ke Galeri! 🏰"); api.saveCreative(); })
            .catch(function () { MK.toast("Gagal disimpan — teruskan membina!"); });
        } catch (e) { MK.toast("Gagal disimpan — teruskan membina!"); }
      });
      var doneBtn = MK.el("button", "btn primary", "✨ Siap & Tamat");
      doneBtn.addEventListener("click", function () {
        api.finishCreative(placed.length ? "Status: Dicipta 🏗️ (" + placed.length + " bentuk)" : "Status: Dicipta 🏗️");
      });
      actRow.appendChild(delBtn);
      actRow.appendChild(clearBtn);
      actRow.appendChild(saveBtn);
      actRow.appendChild(doneBtn);
      mount.appendChild(actRow);
      mount.appendChild(MK.el("div", "soft-note", "Tema hanyalah cadangan — bina apa sahaja yang anda imaginasi!"));
    }
  });
})();
