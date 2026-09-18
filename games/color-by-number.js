/* ============================================================
   GAME 47 — COLOR BY NUMBER (Kreativiti & Digital)
   Mewarnakan gambar mengikut nombor. Hasil disimpan ke
   GALERI SAYA. Permainan kreatif — tiada skor.
   ============================================================ */
"use strict";
(function () {
  /* Setiap gambar: warna bernombor + kawasan (path SVG) bernombor */
  var PICTURES = [
    { name: "Rumah", colors: { 1: "#E05252", 2: "#F2A65A", 3: "#8FBF9F", 4: "#7EA6E0" }, svg: [
      '<path data-n="1" d="M60 100 L100 55 L140 100 Z"/>',
      '<path data-n="2" d="M70 100 L130 100 L130 150 L70 150 Z"/>',
      '<path data-n="3" d="M95 115 L105 115 L105 150 L95 150 Z"/>',
      '<path data-n="4" d="M78 112 h14 v14 h-14 Z M110 112 h14 v14 h-14 Z"/>',
      '<path data-n="2" d="M55 150 h130 v12 h-130 Z"/>'
    ]},
    { name: "Roket", colors: { 1: "#E8A2B0", 2: "#7EA6E0", 3: "#F0BE4D", 4: "#E05252" }, svg: [
      '<path data-n="2" d="M100 30 Q118 60 118 100 L82 100 Q82 60 100 30 Z"/>',
      '<path data-n="1" d="M82 100 L64 132 L82 126 Z M118 100 L136 132 L118 126 Z"/>',
      '<path data-n="3" d="M100 44 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0"/>',
      '<path data-n="4" d="M92 100 L108 100 L100 122 Z"/>',
      '<path data-n="2" d="M88 126 Q100 140 112 126 L112 132 Q100 146 88 132 Z"/>'
    ]},
    { name: "Kura-kura", colors: { 1: "#5FA97C", 2: "#A9805B", 3: "#E0C53B" }, svg: [
      '<path data-n="1" d="M55 105 a45 38 0 1 1 90 0 a45 38 0 1 1 -90 0 Z"/>',
      '<path data-n="3" d="M85 78 a16 12 0 1 1 30 0 a16 12 0 1 1 -30 0 Z"/>',
      '<path data-n="2" d="M145 100 a14 12 0 1 0 8 -20 a14 12 0 1 0 -8 20 Z"/>',
      '<path data-n="2" d="M62 118 l-14 16 h12 Z M138 118 l14 16 h-12 Z M88 128 l-6 16 h12 Z M112 128 l6 16 h-12 Z"/>',
      '<path data-n="3" d="M92 128 l16 0 l-8 14 Z"/>'
    ]},
    { name: "Ikan", colors: { 1: "#F2A65A", 2: "#7EA6E0", 3: "#E05252" }, svg: [
      '<path data-n="1" d="M55 100 Q85 65 120 78 Q140 85 150 100 Q140 115 120 122 Q85 135 55 100 Z"/>',
      '<path data-n="2" d="M150 100 L172 82 L172 118 Z"/>',
      '<path data-n="2" d="M95 76 L108 58 L118 76 Z"/>',
      '<path data-n="3" d="M78 94 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0"/>',
      '<path data-n="3" d="M118 90 q14 10 0 20 q-6 -10 0 -20 Z"/>'
    ]},
    { name: "Kupu-kupu", colors: { 1: "#B49AE0", 2: "#E8A2B0", 3: "#F0BE4D", 4: "#33413F" }, svg: [
      '<path data-n="1" d="M100 100 Q60 55 52 90 Q46 118 100 105 Z"/>',
      '<path data-n="2" d="M100 100 Q60 150 55 122 Q52 100 100 108 Z"/>',
      '<path data-n="1" d="M100 100 Q140 55 148 90 Q154 118 100 105 Z"/>',
      '<path data-n="2" d="M100 100 Q140 150 145 122 Q148 100 100 108 Z"/>',
      '<path data-n="4" d="M96 88 L104 88 L102 122 L98 122 Z"/>',
      '<path data-n="3" d="M98 88 L86 70 L92 68 L102 84 Z M102 88 L114 70 L108 68 L98 84 Z"/>'
    ]},
    { name: "Pokok", colors: { 1: "#5FA97C", 2: "#A9805B", 3: "#E05252" }, svg: [
      '<path data-n="1" d="M100 30 Q140 60 132 92 L68 92 Q60 60 100 30 Z"/>',
      '<path data-n="1" d="M75 78 Q120 70 128 104 L72 104 Q55 85 75 78 Z"/>',
      '<path data-n="2" d="M92 104 L108 104 L104 150 L96 150 Z"/>',
      '<path data-n="3" d="M132 92 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 Z"/>',
      '<path data-n="3" d="M70 104 m-8 0 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 Z"/>',
      '<path data-n="2" d="M60 150 h80 v8 h-80 Z"/>'
    ]},
    { name: "Kereta", colors: { 1: "#E05252", 2: "#33413F", 3: "#7EA6E0", 4: "#E0C53B" }, svg: [
      '<path data-n="1" d="M48 112 L56 96 Q60 88 76 88 L124 88 Q140 88 144 96 L152 112 L48 112 Z"/>',
      '<path data-n="1" d="M60 96 Q80 74 100 74 Q120 74 140 96 Z"/>',
      '<path data-n="3" d="M88 78 L96 88 L84 88 Z M110 78 L118 88 L104 88 Z"/>',
      '<path data-n="2" d="M70 112 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0"/>',
      '<path data-n="2" d="M130 112 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -12 0"/>',
      '<path data-n="4" d="M48 104 q-10 2 -12 8 l12 0 Z"/>'
    ]},
    { name: "Istana", colors: { 1: "#B49AE0", 2: "#7EA6E0", 3: "#E05252", 4: "#F0BE4D" }, svg: [
      '<path data-n="2" d="M52 150 L52 90 L80 90 L80 150 Z M120 150 L120 90 L148 90 L148 150 Z"/>',
      '<path data-n="1" d="M48 90 L66 62 L84 90 Z M116 90 L134 62 L152 90 Z"/>',
      '<path data-n="2" d="M80 150 L80 108 L120 108 L120 150 Z"/>',
      '<path data-n="1" d="M74 108 L100 86 L126 108 Z"/>',
      '<path data-n="3" d="M92 122 L108 122 L108 150 L92 150 Z"/>',
      '<path data-n="4" d="M99 76 L101 76 L101 62 L99 62 Z M100 62 q10 2 8 10 q-8 0 -8 -10 Z"/>'
    ]},
    { name: "Bunga", colors: { 1: "#E8A2B0", 2: "#F0BE4D", 3: "#5FA97C" }, svg: [
      '<path data-n="1" d="M100 95 m-26 0 a12 16 0 1 1 8 -16 a12 16 0 1 1 16 0 a12 16 0 1 1 8 16 a12 16 0 1 1 -16 14 a12 16 0 1 1 -16 -14 Z"/>',
      '<path data-n="2" d="M100 95 m-13 0 a13 13 0 1 0 26 0 a13 13 0 1 0 -26 0 Z"/>',
      '<path data-n="3" d="M96 108 L104 108 L108 150 L92 150 Z"/>',
      '<path data-n="3" d="M96 126 q-20 -4 -22 -20 q18 -2 22 14 Z"/>',
      '<path data-n="3" d="M104 132 q20 -4 22 -20 q-18 -2 -22 14 Z"/>'
    ]},
    { name: "Pelangi", colors: { 1: "#E05252", 2: "#F2A65A", 3: "#F0BE4D", 4: "#5FA97C", 5: "#7EA6E0", 6: "#B49AE0" }, svg: [
      '<path data-n="1" d="M40 140 a60 60 0 0 1 120 0 l-12 0 a48 48 0 0 0 -96 0 Z"/>',
      '<path data-n="2" d="M52 140 a48 48 0 0 1 96 0 l-12 0 a36 36 0 0 0 -72 0 Z"/>',
      '<path data-n="3" d="M64 140 a36 36 0 0 1 72 0 l-12 0 a24 24 0 0 0 -48 0 Z"/>',
      '<path data-n="4" d="M76 140 a24 24 0 0 1 48 0 l-12 0 a12 12 0 0 0 -24 0 Z"/>',
      '<path data-n="5" d="M88 140 a12 12 0 0 1 24 0 Z"/>',
      '<path data-n="6" d="M46 132 q14 -12 28 0 q-14 12 -28 0 Z M126 132 q14 -12 28 0 q-14 12 -28 0 Z"/>'
    ]}
  ];

  MK.registerGame({
    id: "color-by-number",
    name: "Color by Number",
    icon: "🖍️",
    cat: "kreativiti",
    engine: "creative",
    sticker: "🖼️",
    desc: "Warnakan gambar mengikut nombor dan simpan hasilnya ke Galeri!",
    allowTimer: false,
    instruction: function (l, d) {
      return "Pilih warna mengikut nombor, kemudian ketuk kawasan yang mempunyai nombor sama. Siapkan keseluruhan gambar!";
    },
    startLevel: function (mount, api) {
      var pic = PICTURES[(api.level - 1) % PICTURES.length];
      var filled = 0;
      var total = 0;

      mount.innerHTML = "";
      mount.appendChild(MK.el("div", "prompt small", "🖍️ " + pic.name + " — warnakan ikut nombor!"));

      var board = MK.el("div", null);
      board.style.cssText = "background:#fff;border-radius:16px;border:2px solid var(--line);padding:6px;max-width:420px;margin:0 auto";
      var NS = "http://www.w3.org/2000/svg";
      var svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 200 170");
      svg.style.width = "100%";
      board.appendChild(svg);
      mount.appendChild(board);

      var regionEls = [];
      pic.svg.forEach(function (dstr) {
        var re = /<path([^>]*)>/g, m2;
        while ((m2 = re.exec(dstr))) {
          var attrs = m2[1];
          var nm = attrs.match(/data-n="(\d+)"/);
          var dd = attrs.match(/d="([^"]+)"/);
          if (!dd) continue;
          var n = nm ? parseInt(nm[1], 10) : 1;
          var el = document.createElementNS(NS, "path");
          el.setAttribute("d", dd[1]);
          el.setAttribute("fill", "#F2EEE0");
          el.setAttribute("stroke", "#C9C0AF");
          el.setAttribute("stroke-width", "2.5");
          el.setAttribute("data-n", n);
          el.style.cursor = "pointer";
          el.addEventListener("click", function () { tryFill(el, n); });
          svg.appendChild(el);
          regionEls.push({ el: el, n: n });
          total++;
        }
      });

      /* palet bernombor */
      var palette = MK.el("div", "tool-row");
      palette.style.marginTop = "18px";
      var sel = 1;
      Object.keys(pic.colors).forEach(function (k, i) {
        var wrap = MK.el("div", null);
        wrap.style.cssText = "display:flex;flex-direction:column;align-items:center;gap:2px";
        var b = MK.el("button", "swatch" + (i === 0 ? " sel" : ""));
        b.style.background = pic.colors[k];
        b.setAttribute("aria-label", "Warna nombor " + k);
        var lab = MK.el("div", null, k);
        lab.style.cssText = "font-weight:900;font-size:.85rem;color:var(--ink)";
        b.addEventListener("click", function () {
          sel = parseInt(k, 10);
          palette.querySelectorAll(".swatch").forEach(function (x) { x.classList.remove("sel"); });
          b.classList.add("sel");
          api.sfx("tap");
        });
        wrap.appendChild(b);
        wrap.appendChild(lab);
        palette.appendChild(wrap);
      });
      mount.appendChild(palette);

      function tryFill(el, n) {
        if (el.dataset.done) return;
        if (n === sel) {
          el.dataset.done = "1";
          el.setAttribute("fill", pic.colors[n]);
          el.classList.add("found-pop");
          api.sfx("pop");
          filled++;
          api.progress(filled, total);
          if (filled >= total) {
            api.sfx("win");
            api.feedback(true, pic.name + " siap! Cantik sekali! 🎉");
            offerSave();
          }
        } else {
          api.sfx("retry");
          api.feedback(false, "Kawasan ini bernombor " + n + " — pilih warna nombor " + n + "!");
          el.style.stroke = "#E09552";
          setTimeout(function () { el.style.stroke = "#C9C0AF"; }, 700);
        }
      }

      function offerSave() {
        var row = MK.el("div", "tool-row mt12");
        var saveBtn = MK.el("button", "btn primary", "💾 Simpan ke Galeri");
        saveBtn.addEventListener("click", function () {
          var inner = svg.innerHTML;
          MK.Gallery.saveSVG('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 170">' + inner + "</svg>", "color-by-number", pic.name + " Berwarna")
            .then(function () { api.sfx("star"); MK.toast("Disimpan ke Galeri! 🖼️"); api.saveCreative(); })
            .catch(function () { MK.toast("Gagal disimpan, tetapi karya anda tetap cantik!"); });
        });
        var doneBtn = MK.el("button", "btn", "✨ Tamat");
        doneBtn.addEventListener("click", function () { api.finishCreative("Status: Selesai 🖍️"); });
        row.appendChild(saveBtn);
        row.appendChild(doneBtn);
        mount.appendChild(row);
      }

      api.hint(function () {
        var rem = regionEls.find(function (r) { return !r.el.dataset.done; });
        if (rem) {
          rem.el.style.stroke = "#F0BE4D";
          rem.el.setAttribute("stroke-width", "5");
          MK.toast("💡 Kawasan bernombor " + rem.n + " masih belum diwarnakan!");
          setTimeout(function () { rem.el.style.stroke = "#C9C0AF"; rem.el.setAttribute("stroke-width", "2.5"); }, 2200);
        }
      });
      api.progress(0, total);
    }
  });
})();
