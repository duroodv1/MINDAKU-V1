/* ============================================================
   GAME 54 — SUSUN BLOK (Bentuk & Geometri)
   Seret blok berwarna ke bayang-bayang sasaran untuk membina
   bentuk: rumah, kereta, jambatan, robot dan banyak lagi!
   Maklum balas setiap blok diletakkan betul. Cuba Lagi &
   Cabaran Baharu disediakan. Mudah / Sederhana / Cabaran.
   ============================================================ */
"use strict";
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var PALET = ["#7EA6E0", "#F2A65A", "#8FBF9F", "#E8875F", "#B49AE0", "#F0BE4D", "#E8A2B0", "#6FAECB"];
  /* Reka bentuk cabaran: setiap slot {t:jenis, x, y, w, h} — koordinat pusat */
  var REKA = [
    { nama: "Rumah", slots: [
      { t: "segi4", x: 240, y: 200, w: 120, h: 90 },
      { t: "segi3", x: 240, y: 122, w: 150, h: 75 },
      { t: "bulat", x: 240, y: 195, w: 28, h: 28 },
      { t: "segi4", x: 150, y: 235, w: 20, h: 60 },
      { t: "segi4", x: 330, y: 235, w: 20, h: 60 } ] },
    { nama: "Kereta", slots: [
      { t: "segi4", x: 240, y: 232, w: 160, h: 42 },
      { t: "segi4", x: 240, y: 193, w: 84, h: 46 },
      { t: "bulat", x: 186, y: 257, w: 36, h: 36 },
      { t: "bulat", x: 294, y: 257, w: 36, h: 36 } ] },
    { nama: "Jambatan", slots: [
      { t: "segi4", x: 240, y: 188, w: 220, h: 22 },
      { t: "segi4", x: 165, y: 236, w: 24, h: 74 },
      { t: "segi4", x: 315, y: 236, w: 24, h: 74 },
      { t: "segi3", x: 240, y: 170, w: 60, h: 44 } ] },
    { nama: "Robot", slots: [
      { t: "bulat", x: 240, y: 88, w: 62, h: 62 },
      { t: "segi4", x: 240, y: 178, w: 82, h: 98 },
      { t: "segi4", x: 206, y: 262, w: 24, h: 58 },
      { t: "segi4", x: 274, y: 262, w: 24, h: 58 },
      { t: "segi4", x: 158, y: 180, w: 20, h: 68 },
      { t: "segi4", x: 322, y: 180, w: 20, h: 68 } ] },
    { nama: "Kapal", slots: [
      { t: "segi4", x: 240, y: 240, w: 160, h: 50 },
      { t: "segi4", x: 240, y: 186, w: 14, h: 88 },
      { t: "segi3", x: 287, y: 170, w: 74, h: 82 } ] },
    { nama: "Roket", slots: [
      { t: "segi4", x: 240, y: 190, w: 62, h: 118 },
      { t: "segi3", x: 240, y: 102, w: 66, h: 60 },
      { t: "segi3", x: 197, y: 240, w: 34, h: 48 },
      { t: "segi3", x: 283, y: 240, w: 34, h: 48 },
      { t: "bulat", x: 240, y: 172, w: 26, h: 26 } ] },
    { nama: "Pokok", slots: [
      { t: "segi4", x: 240, y: 236, w: 26, h: 82 },
      { t: "bulat", x: 240, y: 142, w: 112, h: 112 },
      { t: "bulat", x: 202, y: 160, w: 20, h: 20 },
      { t: "bulat", x: 278, y: 152, w: 20, h: 20 } ] },
    { nama: "Menara", slots: [
      { t: "segi4", x: 240, y: 250, w: 140, h: 50 },
      { t: "segi4", x: 240, y: 202, w: 100, h: 48 },
      { t: "segi4", x: 240, y: 154, w: 62, h: 46 },
      { t: "segi3", x: 240, y: 108, w: 72, h: 50 } ] },
    { nama: "Kereta Api", slots: [
      { t: "segi4", x: 198, y: 214, w: 92, h: 62 },
      { t: "segi4", x: 312, y: 218, w: 104, h: 54 },
      { t: "segi3", x: 163, y: 176, w: 32, h: 44 },
      { t: "bulat", x: 172, y: 262, w: 26, h: 26 },
      { t: "bulat", x: 226, y: 262, w: 26, h: 26 },
      { t: "bulat", x: 292, y: 262, w: 26, h: 26 },
      { t: "bulat", x: 336, y: 262, w: 26, h: 26 } ] },
    { nama: "Kucing", slots: [
      { t: "bulat", x: 240, y: 108, w: 82, h: 82 },
      { t: "segi3", x: 210, y: 64, w: 30, h: 34 },
      { t: "segi3", x: 270, y: 64, w: 30, h: 34 },
      { t: "segi4", x: 240, y: 210, w: 74, h: 88 },
      { t: "segi3", x: 292, y: 224, w: 40, h: 30 } ] }
  ];

  MK.registerGame({
    id: "susun-blok",
    name: "Susun Blok",
    icon: "🧱",
    cat: "bentuk",
    engine: "custom",
    sticker: "🏗️",
    desc: "Seret blok berwarna ke bayang-bayang untuk membina rumah, kereta, robot dan banyak lagi!",
    instruction: function (l, d) {
      return "Seret blok dari dulang bawah ke bayang-bayang yang sama bentuk. Bila semua blok berada di tempatnya, karya anda siap!";
    },
    startLevel: function (mount, api) {
      var reka = REKA[(api.level - 1) % REKA.length];
      var mudah = api.diff === "mudah";
      var cabaran = api.diff === "cabaran";
      var toleransi = mudah ? 44 : cabaran ? 24 : 34;
      var SKALA_DULANG = 0.5; /* saiz blok dalam dulang */
      var slotList = reka.slots.map(function (s) { return { s: s, penuh: false }; });
      var blok = []; /* {g, slotIdx, home:{x,y}, warna} */
      var siapSemua = false;

      mount.innerHTML = "";
      mount.appendChild(MK.el("div", "prompt small", "🧱 Cabaran: <b>" + reka.nama + "</b> — " + slotList.length + " blok mesti disusun!"));

      var wrap = MK.el("div", "canvas-wrap");
      wrap.style.cssText += ";max-width:480px;margin:0 auto;background:#FDFBF5";
      function fitBoard() {
        var h = Math.round(Math.min(420, window.innerWidth * 0.9));
        wrap.style.height = Math.max(300, h) + "px";
      }
      fitBoard();
      var onRz = function () { if (!wrap.isConnected) { window.removeEventListener("resize", onRz); return; } fitBoard(); };
      window.addEventListener("resize", onRz);

      var svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 480 430");
      svg.style.cssText = "width:100%;height:100%;touch-action:none";
      wrap.appendChild(svg);
      mount.appendChild(wrap);

      function el(tag, attrs, parent) {
        var e = document.createElementNS(NS, tag);
        for (var k in attrs) e.setAttribute(k, attrs[k]);
        parent.appendChild(e);
        return e;
      }
      /* lukis bentuk blok berpusat (0,0) */
      function bentukEl(parent, t, w, h, fill, ghost) {
        if (t === "bulat") {
          return el("circle", { cx: 0, cy: 0, r: w / 2, fill: ghost ? "none" : fill, stroke: ghost ? "#B9AF98" : "rgba(0,0,0,.15)", "stroke-width": ghost ? 2.5 : 2, "stroke-dasharray": ghost ? "8 6" : "none" }, parent);
        }
        if (t === "segi3") {
          return el("polygon", { points: (-w / 2) + "," + (h / 2) + " " + (w / 2) + "," + (h / 2) + " 0," + (-h / 2), fill: ghost ? "none" : fill, stroke: ghost ? "#B9AF98" : "rgba(0,0,0,.15)", "stroke-width": ghost ? 2.5 : 2, "stroke-dasharray": ghost ? "8 6" : "none" }, parent);
        }
        return el("rect", { x: -w / 2, y: -h / 2, width: w, height: h, rx: 5, fill: ghost ? (mudah ? "rgba(185,175,152,.18)" : "none") : fill, stroke: ghost ? "#B9AF98" : "rgba(0,0,0,.15)", "stroke-width": ghost ? 2.5 : 2, "stroke-dasharray": ghost ? "8 6" : "none" }, parent);
      }

      var gridG = document.createElementNS(NS, "g");
      svg.appendChild(gridG);
      var slotG = document.createElementNS(NS, "g");
      svg.appendChild(slotG);
      var blokG = document.createElementNS(NS, "g");
      svg.appendChild(blokG);

      /* garis dulang */
      el("line", { x1: 8, y1: 312, x2: 472, y2: 312, stroke: "#EFEBE0", "stroke-width": 2 }, gridG);

      /* slot sasaran (bayang-bayang) */
      slotList.forEach(function (sl) {
        var g = document.createElementNS(NS, "g");
        g.setAttribute("transform", "translate(" + sl.s.x + "," + sl.s.y + ")");
        bentukEl(g, sl.s.t, sl.s.w, sl.s.h, "#EFEBE0", true);
        slotG.appendChild(g);
      });

      /* blok dalam dulang — diskalakan 0.5 supaya semua muat; satu baris (balut 2 baris jika perlu) */
      var susunan = slotList.map(function (sl, i) { return i; });
      for (var sh = susunan.length - 1; sh > 0; sh--) {
        var j = Math.floor(Math.random() * (sh + 1));
        var tmp = susunan[sh]; susunan[sh] = susunan[j]; susunan[j] = tmp;
      }
      var CELOS = 12, MAXW = 464;
      var lebarSkala = slotList.map(function (sl) { return Math.max(sl.s.w, sl.s.h) * SKALA_DULANG; });
      var jumlahSemua = lebarSkala.reduce(function (a, b) { return a + b; }, 0) + (susunan.length - 1) * CELOS;
      var duaBaris = jumlahSemua > MAXW;
      var kumpulan = [[]];
      if (duaBaris) {
        var setengah = susunan.length / 2;
        susunan.forEach(function (slotIdx, posisi) {
          if (kumpulan[kumpulan.length - 1].length >= Math.ceil(setengah)) kumpulan.push([]);
          kumpulan[kumpulan.length - 1].push({ slotIdx: slotIdx, posisi: posisi });
        });
      } else {
        kumpulan[0] = susunan.map(function (slotIdx, posisi) { return { slotIdx: slotIdx, posisi: posisi }; });
      }
      var kedudukanDulang = {};
      kumpulan.forEach(function (baris) {
        var lebarBaris = baris.reduce(function (a, b) { return a + lebarSkala[b.slotIdx]; }, 0) + (baris.length - 1) * CELOS;
        var xx = 240 - lebarBaris / 2;
        baris.forEach(function (item) {
          var w = lebarSkala[item.slotIdx];
          kedudukanDulang[item.posisi] = { x: xx + w / 2, y: duaBaris ? (kumpulan.indexOf(baris) === 0 ? 348 : 398) : 372 };
          xx += w + CELOS;
        });
      });
      susunan.forEach(function (slotIdx, posisi) {
        var sl = slotList[slotIdx];
        var warna = PALET[(slotIdx + posisi) % PALET.length];
        var rumah = kedudukanDulang[posisi];
        var g = document.createElementNS(NS, "g");
        g.setAttribute("transform", "translate(" + rumah.x + "," + rumah.y + ") scale(" + SKALA_DULANG + ")");
        g.dataset.slot = String(slotIdx);
        g.dataset.locked = "0";
        g.style.cursor = "grab";
        bentukEl(g, sl.s.t, sl.s.w, sl.s.h, warna, false);
        blokG.appendChild(g);
        blok.push({ g: g, slotIdx: slotIdx, home: { x: rumah.x, y: rumah.y } });
      });

      function kedudukan(cx, cy) {
        var r = svg.getBoundingClientRect();
        if (!r || !r.width || !r.height) return { x: 240, y: 200 };
        return { x: (cx - r.left) * (480 / r.width), y: (cy - r.top) * (430 / r.height) };
      }
      function letak(g, x, y, skala) { g.setAttribute("transform", "translate(" + x + "," + y + ")" + (skala ? " scale(" + skala + ")" : "")); }

      var dragBlok = null;
      function mula(cx, cy, target) {
        var hit = target && target.closest ? target.closest("g") : null;
        if (!hit || hit === gridG || hit === slotG || hit === blokG) return;
        if (hit.dataset.locked === "1") { api.sfx("tap"); return; }
        dragBlok = hit;
        hit.style.cursor = "grabbing";
        hit.dataset.tray = "0";
        var mAwal = /translate\(([-\d.]+),([-.\d]+)/.exec(hit.getAttribute("transform") || "");
        if (mAwal) letak(hit, parseFloat(mAwal[1]), parseFloat(mAwal[2]), 1);
      }
      function gerak(cx, cy) {
        if (!dragBlok) return;
        var p = kedudukan(cx, cy);
        letak(dragBlok, p.x, p.y);
      }
      function lepas() {
        if (!dragBlok) return;
        var b = dragBlok;
        dragBlok = null;
        b.style.cursor = "grab";
        var m = /translate\(([-\d.]+),([-\d.]+)/.exec(b.getAttribute("transform") || "");
        if (!m) return;
        var x = parseFloat(m[1]), y = parseFloat(m[2]);
        var slotIdx = +b.dataset.slot;
        var sl = slotList[slotIdx];
        /* hanya slot sepadan (bentuk yang sama) yang belum penuh */
        var jarak = Math.sqrt(Math.pow(x - sl.s.x, 2) + Math.pow(y - sl.s.y, 2));
        var dalamDulang = y > 315;
        if (!sl.penuh && !dalamDulang && jarak <= toleransi) {
          sl.penuh = true;
          b.dataset.locked = "1";
          letak(b, sl.s.x, sl.s.y);
          b.classList.add("drop-in-svg");
          api.sfx("place");
          var siap = slotList.filter(function (q) { return q.penuh; }).length;
          api.progress(siap, slotList.length);
          if (siap >= slotList.length) {
            siapSemua = true;
            api.sfx("win");
            api.feedback(true, "Hebat! " + reka.nama + " siap dibina! 🧱⭐");
            setTimeout(function () { api.complete({ mistakes: 0, stars: 3 }); }, 900);
          } else {
            api.feedback(true, "Blok diletakkan dengan betul! ✅");
          }
        } else {
          /* kembali ke dulang — tiada penalti */
          var rumahB = cariHome(b);
          letak(b, rumahB.x, rumahB.y, SKALA_DULANG);
          api.sfx("pop");
        }
      }
      function cariHome(g) {
        for (var i = 0; i < blok.length; i++) if (blok[i].g === g) return blok[i].home;
        return { x: 240, y: 370 };
      }
      blok.forEach(function (b) { b._home = b.home; });

      /* input sejagat: Pointer → Sentuhan → Tetikus */
      var ptrOK = false, lastTouch = 0;
      if (window.PointerEvent) {
        svg.addEventListener("pointerdown", function (e) {
          ptrOK = true;
          var c = MK.evtXY(e);
          if (c) { mula(c.x, c.y, e.target); if (dragBlok) { try { svg.setPointerCapture(e.pointerId); } catch (err) { } } }
        });
        svg.addEventListener("pointermove", function (e) { var c = MK.evtXY(e); if (c) gerak(c.x, c.y); });
        svg.addEventListener("pointerup", function () { lepas(); });
        svg.addEventListener("pointercancel", function () { lepas(); });
      }
      svg.addEventListener("touchstart", function (e) {
        if (ptrOK) return;
        e.preventDefault(); lastTouch = Date.now();
        var c = MK.evtXY(e); if (c) mula(c.x, c.y, e.target);
      }, { passive: false });
      svg.addEventListener("touchmove", function (e) {
        if (ptrOK) return;
        e.preventDefault();
        var c = MK.evtXY(e); if (c) gerak(c.x, c.y);
      }, { passive: false });
      svg.addEventListener("touchend", function (e) { if (ptrOK) return; e.preventDefault(); lepas(); }, { passive: false });
      svg.addEventListener("mousedown", function (e) {
        if (ptrOK || Date.now() - lastTouch < 600) return;
        var c = MK.evtXY(e); if (c) mula(c.x, c.y, e.target);
      });
      document.addEventListener("mousemove", function (e) {
        if (ptrOK || !dragBlok || !svg.isConnected) return;
        var c = MK.evtXY(e); if (c) gerak(c.x, c.y);
      });
      document.addEventListener("mouseup", function () { if (ptrOK || !dragBlok || !svg.isConnected) return; lepas(); });

      /* ---------- butang ---------- */
      var actRow = MK.el("div", "tool-row");
      var cubaBtn = MK.el("button", "tool-btn", "🔄 Cuba Lagi");
      cubaBtn.addEventListener("click", function () {
        if (siapSemua) { MK.toast("Anda sudah siap! 🎉"); return; }
        slotList.forEach(function (sl) { sl.penuh = false; });
        blok.forEach(function (b) {
          b.g.dataset.locked = "0";
          letak(b.g, b.home.x, b.home.y, SKALA_DULANG);
        });
        api.sfx("flip");
        api.progress(0, slotList.length);
        MK.toast("Blok dikembalikan ke dulang — cuba lagi! 💪");
      });
      var baharuBtn = MK.el("button", "tool-btn", "🎲 Cabaran Baharu");
      baharuBtn.addEventListener("click", function () {
        api.sfx("tap");
        slotList.forEach(function (sl) { sl.penuh = false; });
        /* rawak kedudukan blok dalam dulang */
        var px = blok.map(function (b) { return b.home; });
        px.sort(function () { return Math.random() - 0.5; });
        blok.forEach(function (b, i) {
          b.home = px[i]; b._home = px[i];
          b.g.dataset.locked = "0";
          letak(b.g, px[i].x, px[i].y, SKALA_DULANG);
        });
        api.progress(0, slotList.length);
        MK.toast("Kedudukan blok diacak semula! 🎲");
      });
      var simpanBtn = MK.el("button", "tool-btn", "💾 Simpan ke Galeri");
      simpanBtn.addEventListener("click", function () {
        try {
          var dalam = blokG.innerHTML;
          var clone = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 310"><rect width="480" height="310" fill="#FDFBF5"/>' + slotG.innerHTML.replace(/stroke-dasharray="8 6"/g, 'stroke-dasharray="none"') + dalam + "</svg>";
          MK.Gallery.saveSVG(clone, "susun-blok", reka.nama)
            .then(function () { api.sfx("star"); MK.toast("Karya disimpan ke Galeri! 🧱⭐"); api.saveCreative(); })
            .catch(function () { MK.toast("Gagal disimpan — teruskan bermain!"); });
        } catch (e) { MK.toast("Gagal disimpan — teruskan bermain!"); }
      });
      var siapBtn = MK.el("button", "btn primary", "✨ Siap & Tamat");
      siapBtn.addEventListener("click", function () {
        var siap = slotList.filter(function (q) { return q.penuh; }).length;
        if (siap >= slotList.length) api.finishCreative("Status: " + reka.nama + " siap dibina 🧱");
        else {
          api.sfx("retry");
          api.feedback(false, "Masih ada " + (slotList.length - siap) + " blok lagi — anda boleh! 💪");
        }
      });
      actRow.appendChild(cubaBtn);
      actRow.appendChild(baharuBtn);
      actRow.appendChild(simpanBtn);
      actRow.appendChild(siapBtn);
      mount.appendChild(actRow);

      api.hint(function () {
        /* tonjolkan satu blok yang belum diletakkan: bawa ke dulukannya berhampiran slot */
        var belum = slotList.filter(function (q) { return !q.penuh; });
        if (!belum.length) return;
        var sl = belum[0];
        MK.toast("💡 Bentuk " + (sl.s.t === "bulat" ? "BULAT" : sl.s.t === "segi3" ? "SEGITIGA" : "SEGI EMPAT") + " padan dengan bayang-bayang yang berketuk-ketuk!");
      });

      api.progress(0, slotList.length);
    }
  });
})();
