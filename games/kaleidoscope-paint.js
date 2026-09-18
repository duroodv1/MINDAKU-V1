/* ============================================================
   GAME 46 — KALEIDOSCOPE PAINT (Kreativiti & Digital)
   Lukisan interaktif: free paint, mirror, kaleidoscope,
   undo, redo, clear, save, gallery. Warna tenang.
   Permainan kreatif — tiada skor.
   ============================================================ */
"use strict";
(function () {
  var PALETTE = ["#3E7C82", "#F2A65A", "#8FBF9F", "#E8875F", "#B49AE0", "#F0BE4D", "#E8A2B0", "#6FAECB", "#7EA6E0", "#33413F"];

  MK.registerGame({
    id: "kaleidoscope-paint",
    name: "Kaleidoscope Paint",
    icon: "🖌️",
    cat: "kreativiti",
    engine: "creative",
    sticker: "🎨",
    desc: "Lukis dengan mod cermin dan kaleidoskop yang menakjubkan!",
    allowTimer: false,
    instruction: function (l, d) {
      return "Pilih warna dan mod, kemudian lukis dengan jari atau tetikus. Simpan karya anda ke Galeri!";
    },
    startLevel: function (mount, api) {
      mount.innerHTML = "";
      mount.appendChild(MK.el("div", "prompt small", "🎨 Studio Lukisan Kaleidoskop — Level " + api.level + " (tema bebas!)"));

      var SIZE = 480;
      var wrap = MK.el("div", "canvas-wrap");
      wrap.style.maxWidth = "480px";
      wrap.style.margin = "0 auto";
      var canvas = document.createElement("canvas");
      canvas.width = SIZE; canvas.height = SIZE;
      canvas.style.cssText = "width:100%;height:auto;background:#FFFDF8;cursor:crosshair;touch-action:none";
      wrap.appendChild(canvas);
      mount.appendChild(wrap);
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "#FFFDF8";
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      var state = { color: PALETTE[0], size: 8, mode: 1, drawing: false, last: null };
      var undoStack = [], redoStack = [];

      function snapshot() {
        try {
          undoStack.push(ctx.getImageData(0, 0, SIZE, SIZE));
          if (undoStack.length > 12) undoStack.shift();
          redoStack.length = 0;
        } catch (e) { }
      }
      function undo() {
        if (!undoStack.length) { MK.toast("Tiada apa-apa untuk buat asal 🙂"); return; }
        try {
          redoStack.push(ctx.getImageData(0, 0, SIZE, SIZE));
          ctx.putImageData(undoStack.pop(), 0, 0);
          api.sfx("tap");
        } catch (e) { }
      }
      function redo() {
        if (!redoStack.length) return;
        try {
          undoStack.push(ctx.getImageData(0, 0, SIZE, SIZE));
          ctx.putImageData(redoStack.pop(), 0, 0);
          api.sfx("tap");
        } catch (e) { }
      }

      /* Lukis satu segmen dengan semua salinan cermin/putaran */
      function drawSeg(x0, y0, x1, y1) {
        var cx = SIZE / 2, cy = SIZE / 2;
        var copies = state.mode === 1 ? 1 : state.mode === 2 ? 2 : state.mode;
        for (var k = 0; k < copies; k++) {
          var ang = (k / copies) * Math.PI * 2;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(ang);
          if (state.mode === 2 && k === 1) ctx.scale(1, -1); // cermin menegak
          ctx.beginPath();
          ctx.moveTo(x0 - cx, y0 - cy);
          ctx.lineTo(x1 - cx, y1 - cy);
          ctx.strokeStyle = state.color;
          ctx.lineWidth = state.size;
          ctx.stroke();
          ctx.restore();
        }
      }
      function pos(cx, cy) {
        var r = canvas.getBoundingClientRect();
        return { x: (cx - r.left) * (SIZE / r.width), y: (cy - r.top) * (SIZE / r.height) };
      }
      /* Lapisan input sejagat: Pointer → Sentuhan → Tetikus */
      var ptrOK = false, lastTouch = 0;
      function strokeStart(cx, cy) {
        snapshot();
        state.drawing = true;
        state.last = pos(cx, cy);
        drawSeg(state.last.x, state.last.y, state.last.x + 0.01, state.last.y);
      }
      function strokeDraw(cx, cy) {
        if (!state.drawing) return;
        var p = pos(cx, cy);
        drawSeg(state.last.x, state.last.y, p.x, p.y);
        state.last = p;
      }
      function stop() { state.drawing = false; }
      if (window.PointerEvent) {
        canvas.addEventListener("pointerdown", function (e) {
          e.preventDefault();
          ptrOK = true;
          try { canvas.setPointerCapture(e.pointerId); } catch (err) { }
          strokeStart(e.clientX, e.clientY);
        });
        canvas.addEventListener("pointermove", function (e) { strokeDraw(e.clientX, e.clientY); });
        canvas.addEventListener("pointerup", stop);
        canvas.addEventListener("pointercancel", stop);
      }
      canvas.addEventListener("touchstart", function (e) {
        if (ptrOK) return;
        e.preventDefault();
        lastTouch = Date.now();
        var t = e.changedTouches[0];
        strokeStart(t.clientX, t.clientY);
      }, { passive: false });
      canvas.addEventListener("touchmove", function (e) {
        if (ptrOK || !state.drawing) return;
        e.preventDefault();
        var t = e.changedTouches[0];
        strokeDraw(t.clientX, t.clientY);
      }, { passive: false });
      canvas.addEventListener("touchend", function (e) { if (ptrOK) return; e.preventDefault(); stop(); }, { passive: false });
      canvas.addEventListener("touchcancel", function () { if (!ptrOK) stop(); });
      canvas.addEventListener("mousedown", function (e) {
        if (ptrOK || Date.now() - lastTouch < 600) return;
        strokeStart(e.clientX, e.clientY);
      });
      document.addEventListener("mousemove", function (e) { if (!ptrOK && state.drawing && canvas.isConnected) strokeDraw(e.clientX, e.clientY); });
      document.addEventListener("mouseup", function () { if (!ptrOK && state.drawing && canvas.isConnected) stop(); });

      /* Baris alat: mod */
      var modeRow = MK.el("div", "tool-row");
      [[1, "✏️ Bebas"], [2, "🪞 Cermin"], [4, "❇️ 4"], [6, "✳️ 6"], [8, "🌀 8"]].forEach(function (m) {
        var b = MK.el("button", "tool-btn" + (state.mode === m[0] ? " on" : ""), m[1]);
        b.addEventListener("click", function () {
          state.mode = m[0];
          modeRow.querySelectorAll(".tool-btn").forEach(function (x) { x.classList.remove("on"); });
          b.classList.add("on");
          api.sfx("tap");
        });
        modeRow.appendChild(b);
      });
      mount.appendChild(modeRow);

      /* Warna */
      var colorRow = MK.el("div", "tool-row");
      PALETTE.forEach(function (c, i) {
        var b = MK.el("button", "swatch" + (i === 0 ? " sel" : ""));
        b.style.background = c;
        b.setAttribute("aria-label", "Warna " + (i + 1));
        b.addEventListener("click", function () {
          state.color = c;
          colorRow.querySelectorAll(".swatch").forEach(function (x) { x.classList.remove("sel"); });
          b.classList.add("sel");
          api.sfx("tap");
        });
        colorRow.appendChild(b);
      });
      mount.appendChild(colorRow);

      /* Saiz + tindakan */
      var actRow = MK.el("div", "tool-row");
      [["↩︎ Undo", undo], ["↪︎ Redo", redo]].forEach(function (a) {
        var b = MK.el("button", "tool-btn", a[0]);
        b.addEventListener("click", a[1]);
        actRow.appendChild(b);
      });
      [["⚪ Tipis", 4], ["🟣 Sederhana", 9], ["🔵 Tebal", 16]].forEach(function (s) {
        var b = MK.el("button", "tool-btn" + (state.size === s[1] ? " on" : ""), s[0]);
        b.addEventListener("click", function () {
          state.size = s[1];
          actRow.querySelectorAll(".tool-btn").forEach(function (x) { x.classList.remove("on"); });
          b.classList.add("on");
          api.sfx("tap");
        });
        actRow.appendChild(b);
      });
      mount.appendChild(actRow);

      var actRow2 = MK.el("div", "tool-row");
      var clearBtn = MK.el("button", "tool-btn", "🗑️ Kosongkan");
      clearBtn.addEventListener("click", async function () {
        var okd = await MK.confirmBox("Kosongkan kanvas?", "Lukisan semasa akan dipadam.", "Kosongkan", "Batal");
        if (!okd) return;
        snapshot();
        ctx.fillStyle = "#FFFDF8";
        ctx.fillRect(0, 0, SIZE, SIZE);
        api.sfx("pop");
      });
      var saveBtn = MK.el("button", "tool-btn", "💾 Simpan ke Galeri");
      saveBtn.addEventListener("click", function () {
        MK.Gallery.saveCanvas(canvas, "kaleidoscope-paint", "Lukisan Kaleidoskop L" + api.level)
          .then(function () { api.sfx("star"); MK.toast("Karya disimpan ke Galeri! 🖼️"); api.saveCreative(); })
          .catch(function () { MK.toast("Maaf, gagal disimpan — tetapi teruskan melukis!"); });
      });
      var doneBtn = MK.el("button", "btn primary", "✨ Siap & Tamat");
      doneBtn.addEventListener("click", function () {
        MK.Gallery.saveCanvas(canvas, "kaleidoscope-paint", "Lukisan Kaleidoskop L" + api.level)
          .catch(function () { })
          .then(function () { api.finishCreative("Status: Disimpan ke Galeri 🖼️"); });
      });
      actRow2.appendChild(clearBtn);
      actRow2.appendChild(saveBtn);
      actRow2.appendChild(doneBtn);
      mount.appendChild(actRow2);
      mount.appendChild(MK.el("div", "soft-note", "Mod ❇️ 6 dan 🌀 8 menghasilkan corak kaleidoskop cantik — cuba!"));
    }
  });
})();
