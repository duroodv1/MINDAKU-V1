/* ============================================================
   GAME 51 — BINA ROBOT (Kreativiti & Digital)
   Gabungkan kepala, badan, mata, mulut, tangan, kaki dan
   aksesori untuk mencipta robot sendiri. Tiada jawapan salah.
   Simpan robot ke GALERI SAYA. Bintang kreativiti!
   ============================================================ */
"use strict";
(function () {
  var WARNA = ["#7EA6E0", "#F2A65A", "#8FBF9F", "#E8875F", "#B49AE0", "#F0BE4D", "#E8A2B0", "#6FAECB"];
  var MISI = ["Robot Rakan", "Robot Penolong Rumah", "Robot Angkasa", "Robot Doktor", "Robot Chef",
    "Robot Penjaga Zoo", "Robot Taman", "Robot Bomba", "Robot Pengorbit", "Robot Bebas Saya"];
  var KEPALA = ["bulat", "kotak", "kubah", "heksagon"];
  var BADAN = ["kotak", "bulat", "roket", "kelasi"];
  var MATA = ["bulat", "bintang", "skrin"];
  var MULUT = ["senyum", "datar", "zigzag", "bulat"];
  var TANGAN = ["lurus", "angkat", "cawan"];
  var KAKI = ["roda", "kotak", "roket"];
  var AKSESORI = ["antena", "topi", "panel", "tiada"];
  var LABEL = {
    kepala: { bulat: "⚪ Bulat", kotak: "⬛ Kotak", kubah: "🌙 Kubah", heksagon: "⬢ Heksagon" },
    badan: { kotak: "🟦 Kotak", bulat: "🟣 Bulat", roket: "🚀 Roket", kelasi: "🧰 Kelasi" },
    mata: { bulat: "👁️ Bulat", bintang: "⭐ Bintang", skrin: "🖥️ Skrin" },
    mulut: { senyum: "😊 Senyum", datar: "😐 Datar", zigzag: "〰️ Zigzag", bulat: "o Bulat" },
    tangan: { lurus: "⬇️ Lurus", angkat: "🙌 Angkat", cawan: "🤲 Cawan" },
    kaki: { roda: "🛞 Roda", kotak: "🦶 Kotak", roket: "🚀 Roket" },
    aksessori: { antena: "📡 Antena", topi: "🧑‍🚀 Topi Angkasawan", panel: "🔆 Panel Surya", tiada: "🚫 Tiada" }
  };
  var NS = "http://www.w3.org/2000/svg";

  MK.registerGame({
    id: "bina-robot",
    name: "Bina Robot",
    icon: "🤖",
    cat: "kreativiti",
    engine: "creative",
    sticker: "⚙️",
    desc: "Gabungkan kepala, badan, tangan, kaki dan aksesori untuk mencipta robot anda sendiri!",
    allowTimer: false,
    instruction: function (l, d) {
      return "Pilih bentuk setiap bahagian dan warna robot anda. Tiada jawapan salah — jadikan robot anda istimewa!";
    },
    startLevel: function (mount, api) {
      var misi = MISI[(api.level - 1) % MISI.length];
      var mudah = api.diff === "mudah";
      var cabaran = api.diff === "cabaran";
      var state = { kepala: "bulat", badan: "kotak", mata: "bulat", mulut: "senyum", tangan: "lurus", kaki: "roda", aksessori: "antena", warna: WARNA[0] };
      var perubahan = 0;

      mount.innerHTML = "";
      mount.appendChild(MK.el("div", "prompt small", "🤖 Misi: <b>" + misi + "</b> — cipta robot untuk misi ini!"));

      /* ---------- papan robot ---------- */
      var wrap = MK.el("div", "canvas-wrap");
      wrap.style.cssText += ";max-width:300px;margin:0 auto;background:#FDFBF5";
      function fitBoard() {
        var h = Math.round(Math.min(340, window.innerWidth * 0.85));
        wrap.style.height = Math.max(240, h) + "px";
      }
      fitBoard();
      var onRz = function () { if (!wrap.isConnected) { window.removeEventListener("resize", onRz); return; } fitBoard(); };
      window.addEventListener("resize", onRz);

      var svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 240 320");
      svg.style.cssText = "width:100%;height:100%";
      wrap.appendChild(svg);
      mount.appendChild(wrap);

      var gKaki = document.createElementNS(NS, "g");
      var gTangan = document.createElementNS(NS, "g");
      var gBadan = document.createElementNS(NS, "g");
      var gKepala = document.createElementNS(NS, "g");
      var gMuka = document.createElementNS(NS, "g");
      var gAks = document.createElementNS(NS, "g");
      [gKaki, gTangan, gBadan, gKepala, gMuka, gAks].forEach(function (g) { svg.appendChild(g); });

      function el(tag, attrs, parent) {
        var e = document.createElementNS(NS, tag);
        for (var k in attrs) e.setAttribute(k, attrs[k]);
        (parent || gBadan).appendChild(e);
        return e;
      }
      function bintangPts(cx, cy, r) {
        var p = [];
        for (var i = 0; i < 10; i++) {
          var rr = i % 2 === 0 ? r : r * 0.45;
          var a = -Math.PI / 2 + (i * Math.PI) / 5;
          p.push((cx + rr * Math.cos(a)).toFixed(1) + "," + (cy + rr * Math.sin(a)).toFixed(1));
        }
        return p.join(" ");
      }

      function render() {
        var c = state.warna;
        var gelap = "#5C6B73";
        [gKaki, gTangan, gBadan, gKepala, gMuka, gAks].forEach(function (g) { g.innerHTML = ""; });

        /* ----- kaki (belakang) ----- */
        if (state.kaki === "roda") {
          [84, 156].forEach(function (x) {
            el("circle", { cx: x, cy: 262, r: 24, fill: gelap, stroke: "#fff", "stroke-width": 3 }, gKaki);
            el("circle", { cx: x, cy: 262, r: 9, fill: "#FDFBF5" }, gKaki);
          });
        } else if (state.kaki === "kotak") {
          [72, 140].forEach(function (x) { el("rect", { x: x, y: 222, width: 28, height: 58, rx: 8, fill: c, stroke: gelap, "stroke-width": 3 }, gKaki); });
        } else {
          [72, 140].forEach(function (x) { el("polygon", { points: (x - 14) + ",282 " + (x + 42) + ",282 " + (x + 14) + ",226", fill: c, stroke: gelap, "stroke-width": 3 }, gKaki); });
        }

        /* ----- tangan ----- */
        var tanganY = 130;
        if (state.tangan === "lurus") {
          el("rect", { x: 22, y: tanganY, width: 22, height: 66, rx: 10, fill: c, stroke: gelap, "stroke-width": 3 }, gTangan);
          el("rect", { x: 196, y: tanganY, width: 22, height: 66, rx: 10, fill: c, stroke: gelap, "stroke-width": 3 }, gTangan);
        } else if (state.tangan === "angkat") {
          el("polygon", { points: "40,150 12,102 30,92 52,132", fill: c, stroke: gelap, "stroke-width": 3 }, gTangan);
          el("circle", { cx: 20, cy: 96, r: 12, fill: "#F0BE4D", stroke: gelap, "stroke-width": 2 }, gTangan);
          el("polygon", { points: "200,150 228,102 210,92 188,132", fill: c, stroke: gelap, "stroke-width": 3 }, gTangan);
          el("circle", { cx: 220, cy: 96, r: 12, fill: "#F0BE4D", stroke: gelap, "stroke-width": 2 }, gTangan);
        } else {
          [33, 207].forEach(function (x) {
            el("rect", { x: x - 11, y: tanganY, width: 22, height: 46, rx: 10, fill: c, stroke: gelap, "stroke-width": 3 }, gTangan);
            el("circle", { cx: x, cy: tanganY + 58, r: 14, fill: "#FDFBF5", stroke: gelap, "stroke-width": 3 }, gTangan);
          });
        }

        /* ----- badan ----- */
        if (state.badan === "kotak") {
          el("rect", { x: 66, y: 106, width: 108, height: 112, rx: 14, fill: c, stroke: gelap, "stroke-width": 4 }, gBadan);
        } else if (state.badan === "bulat") {
          el("ellipse", { cx: 120, cy: 162, rx: 58, ry: 60, fill: c, stroke: gelap, "stroke-width": 4 }, gBadan);
        } else if (state.badan === "roket") {
          el("polygon", { points: "120,100 178,138 178,218 62,218 62,138", fill: c, stroke: gelap, "stroke-width": 4 }, gBadan);
        } else {
          el("rect", { x: 70, y: 110, width: 100, height: 104, rx: 8, fill: c, stroke: gelap, "stroke-width": 4 }, gBadan);
          el("rect", { x: 92, y: 122, width: 56, height: 26, rx: 6, fill: "#FDFBF5", stroke: gelap, "stroke-width": 2 }, gBadan);
        }
        /* butang badan */
        el("circle", { cx: 120, cy: 176, r: 13, fill: "#FDFBF5", stroke: gelap, "stroke-width": 3 }, gBadan);
        el("circle", { cx: 120, cy: 176, r: 5, fill: "#E8875F" }, gBadan);

        /* ----- kepala ----- */
        if (state.kepala === "bulat") {
          el("circle", { cx: 120, cy: 60, r: 40, fill: c, stroke: gelap, "stroke-width": 4 }, gKepala);
        } else if (state.kepala === "kotak") {
          el("rect", { x: 82, y: 22, width: 76, height: 74, rx: 10, fill: c, stroke: gelap, "stroke-width": 4 }, gKepala);
        } else if (state.kepala === "kubah") {
          el("path", { d: "M80,92 A40,40 0 0 1 160,92 Z", fill: c, stroke: gelap, "stroke-width": 4 }, gKepala);
        } else {
          var hp = [];
          for (var hi = 0; hi < 6; hi++) {
            var ha = -Math.PI / 2 + (hi * Math.PI) / 3;
            hp.push((120 + 44 * Math.cos(ha)).toFixed(1) + "," + (60 + 44 * Math.sin(ha)).toFixed(1));
          }
          el("polygon", { points: hp.join(" "), fill: c, stroke: gelap, "stroke-width": 4 }, gKepala);
        }

        /* ----- mata & mulut ----- */
        if (state.mata === "bulat") {
          [102, 138].forEach(function (x) {
            el("circle", { cx: x, cy: 52, r: 11, fill: "#fff", stroke: gelap, "stroke-width": 2 }, gMuka);
            el("circle", { cx: x, cy: 52, r: 5, fill: "#33413F" }, gMuka);
          });
        } else if (state.mata === "bintang") {
          [102, 138].forEach(function (x) {
            el("polygon", { points: bintangPts(x, 52, 12), fill: "#F0BE4D", stroke: gelap, "stroke-width": 2 }, gMuka);
          });
        } else {
          el("rect", { x: 90, y: 40, width: 60, height: 22, rx: 8, fill: "#33413F" }, gMuka);
          [102, 120, 138].forEach(function (x) { el("circle", { cx: x, cy: 51, r: 5, fill: "#8FE3C0" }, gMuka); });
        }
        if (state.mulut === "senyum") {
          el("path", { d: "M104,74 Q120,86 136,74", fill: "none", stroke: "#33413F", "stroke-width": 4, "stroke-linecap": "round" }, gMuka);
        } else if (state.mulut === "datar") {
          el("rect", { x: 104, y: 74, width: 32, height: 5, rx: 2, fill: "#33413F" }, gMuka);
        } else if (state.mulut === "zigzag") {
          el("polyline", { points: "102,78 110,72 118,78 126,72 134,78", fill: "none", stroke: "#33413F", "stroke-width": 3.5, "stroke-linecap": "round" }, gMuka);
        } else {
          el("circle", { cx: 120, cy: 76, r: 7, fill: "none", stroke: "#33413F", "stroke-width": 3.5 }, gMuka);
        }

        /* ----- aksesori ----- */
        if (state.aksessori === "antena") {
          el("line", { x1: 120, y1: 24, x2: 120, y2: 6, stroke: gelap, "stroke-width": 3 }, gAks);
          el("circle", { cx: 120, cy: 8, r: 6, fill: "#E8875F" }, gAks);
        } else if (state.aksessori === "topi") {
          el("ellipse", { cx: 120, cy: 27, rx: 46, ry: 9, fill: "#FDFBF5", stroke: gelap, "stroke-width": 3 }, gAks);
          el("path", { d: "M92,27 A28,20 0 0 1 148,27 Z", fill: "#FDFBF5", stroke: gelap, "stroke-width": 3 }, gAks);
        } else if (state.aksessori === "panel") {
          el("rect", { x: 12, y: 120, width: 10, height: 44, fill: gelap }, gAks);
          el("rect", { x: 218, y: 120, width: 10, height: 44, fill: gelap }, gAks);
          el("rect", { x: 2, y: 106, width: 20, height: 16, rx: 3, fill: "#8FE3C0", stroke: gelap, "stroke-width": 2 }, gAks);
          el("rect", { x: 218, y: 106, width: 20, height: 16, rx: 3, fill: "#8FE3C0", stroke: gelap, "stroke-width": 2 }, gAks);
        }
        if (cabaran) {
          /* latar bintang untuk cabaran */
          [[20, 300], [220, 296], [16, 110], [226, 200], [200, 40]].forEach(function (p) {
            el("circle", { cx: p[0], cy: p[1], r: 2.4, fill: "#F0BE4D" }, gAks);
          });
        }
      }
      render();

      /* ---------- baris pilihan ---------- */
      function barisPilihan(nama, senarai, labelSet) {
        var pilihan = senarai.slice();
        if (mudah && pilihan.length > 3) pilihan = pilihan.slice(0, 3);
        var baris = MK.el("div", "tool-row");
        baris.appendChild(MK.el("div", "slabel", nama));
        var btns = MK.el("div", "palette");
        pilihan.forEach(function (p) {
          var b = MK.el("button", "tool-btn", (labelSet[p] || p));
          if (state[nama] === p) b.classList.add("on");
          b.addEventListener("click", function () {
            state[nama] = p; perubahan++;
            api.sfx("pop");
            Array.prototype.forEach.call(btns.children, function (x) { x.classList.remove("on"); });
            b.classList.add("on");
            render();
          });
          btns.appendChild(b);
        });
        baris.appendChild(btns);
        mount.appendChild(baris);
      }
      barisPilihan("kepala", KEPALA, LABEL.kepala);
      barisPilihan("badan", BADAN, LABEL.badan);
      barisPilihan("mata", MATA, LABEL.mata);
      barisPilihan("mulut", MULUT, LABEL.mulut);
      barisPilihan("tangan", TANGAN, LABEL.tangan);
      barisPilihan("kaki", KAKI, LABEL.kaki);
      barisPilihan("aksessori", AKSESORI, LABEL.aksessori);

      /* warna */
      var warnaRow = MK.el("div", "tool-row");
      warnaRow.appendChild(MK.el("div", "slabel", "Warna"));
      var sw = MK.el("div", "palette");
      WARNA.forEach(function (w) {
        var b = MK.el("button", "swatch", "");
        b.style.background = w;
        b.setAttribute("aria-label", "Warna " + w);
        if (state.warna === w) b.classList.add("sel");
        b.addEventListener("click", function () {
          state.warna = w; perubahan++; api.sfx("tap");
          Array.prototype.forEach.call(sw.children, function (x) { x.classList.remove("sel"); });
          b.classList.add("sel");
          render();
        });
        sw.appendChild(b);
      });
      warnaRow.appendChild(sw);
      mount.appendChild(warnaRow);

      /* ---------- butang tindakan ---------- */
      var actRow = MK.el("div", "tool-row");
      var randomBtn = MK.el("button", "tool-btn", "🎲 Robot Baharu");
      randomBtn.addEventListener("click", function () {
        state.kepala = MK.Gen.pick(KEPALA);
        state.badan = MK.Gen.pick(BADAN);
        state.mata = MK.Gen.pick(MATA);
        state.mulut = MK.Gen.pick(MULUT);
        state.tangan = MK.Gen.pick(TANGAN);
        state.kaki = MK.Gen.pick(KAKI);
        state.aksessori = MK.Gen.pick(AKSESORI);
        state.warna = MK.Gen.pick(WARNA);
        perubahan++;
        api.sfx("flip");
        render();
        MK.toast("Robot baharu! 🤖 Ubah suai ikut suka anda.");
        mount.querySelectorAll(".tool-row").forEach(function () { });
      });
      var padamBtn = MK.el("button", "tool-btn", "🗑️ Padam");
      padamBtn.addEventListener("click", function () {
        state = { kepala: "bulat", badan: "kotak", mata: "bulat", mulut: "senyum", tangan: "lurus", kaki: "roda", aksessori: "tiada", warna: WARNA[0] };
        api.sfx("pop");
        render();
        MK.toast("Robot dikosongkan — mula semula! 🙂");
      });
      var simpanBtn = MK.el("button", "tool-btn", "💾 Simpan Robot");
      simpanBtn.addEventListener("click", function () {
        try {
          var clone = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 320"><rect width="240" height="320" fill="#FDFBF5"/>' + svg.innerHTML + "</svg>";
          MK.Gallery.saveSVG(clone, "bina-robot", "Robot " + misi)
            .then(function () { api.sfx("star"); MK.toast("Robot disimpan ke Galeri! 🤖⭐"); api.saveCreative(); })
            .catch(function () { MK.toast("Gagal disimpan — teruskan mencipta!"); });
        } catch (e) { MK.toast("Gagal disimpan — teruskan mencipta!"); }
      });
      var siapBtn = MK.el("button", "btn primary", "✨ Siap — Bintang Kreativiti!");
      siapBtn.addEventListener("click", function () {
        api.sfx("win");
        api.feedback(true, "⭐ Bintang Kreativiti untuk Robot " + misi + "! (" + perubahan + " ubah suai)");
        api.finishCreative("Status: Robot " + misi + " dicipta 🤖");
      });
      actRow.appendChild(randomBtn);
      actRow.appendChild(padamBtn);
      actRow.appendChild(simpanBtn);
      actRow.appendChild(siapBtn);
      mount.appendChild(actRow);
      mount.appendChild(MK.el("div", "soft-note", "Misi hanyalah ilham — bina robot apa sahaja yang anda suka!"));

      api.hint(function () {
        MK.toast("💡 Cuba tangan 'Angkat' + aksesori 'Topi' — robot angkasawan!");
      });
    }
  });
})();
