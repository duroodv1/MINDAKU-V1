/* ============================================================
   GAME 29 — PATTERN CITY (Logik & Penyelesaian Masalah)
   Bina bangunan mengikut pola warna, bentuk, saiz dan nombor
   (growing pattern).
   ============================================================ */
"use strict";
(function () {
  var COLORS = [
    { id: "biru", label: "Biru", hex: "#7EA6E0" },
    { id: "oren", label: "Oren", hex: "#F2A65A" },
    { id: "hijau", label: "Hijau", hex: "#8FBF9F" },
    { id: "ungu", label: "Ungu", hex: "#B49AE0" }
  ];
  function buildingSVG(colorHex, windows, height, w) {
    w = w || 64;
    var h = height || (60 + windows * 14);
    var win = "";
    for (var r = 0; r < windows; r++) {
      for (var c = 0; c < 2; c++) {
        win += '<rect x="' + (12 + c * 22) + '" y="' + (16 + r * 18) + '" width="12" height="10" rx="2" fill="#FFF7E6"/>';
      }
    }
    return '<svg viewBox="0 0 ' + w + " " + (h + 10) + '" width="' + w + '" height="' + (h + 10) + '" aria-hidden="true">' +
      '<rect x="4" y="4" width="' + (w - 8) + '" height="' + h + '" rx="6" fill="' + colorHex + '"/>' + win +
      '<rect x="4" y="' + (h - 6) + '" width="' + (w - 8) + '" height="8" fill="rgba(0,0,0,.12)"/></svg>';
  }

  MK.registerGame({
    id: "pattern-city",
    name: "Pattern City",
    icon: "🏙️",
    cat: "logik",
    engine: "custom",
    sticker: "🌆",
    desc: "Bina bandar dengan menyiapkan pola bangunan — warna, tingkap dan pertambahan!",
    instruction: function (l, d) {
      return "Lihat pola bangunan di bandar. Pilih bangunan yang betul untuk setiap tapak kosong!";
    },
    startLevel: function (mount, api) {
      var perLevel = 3, round = 0, mistakes = 0;

      function makeRound() {
        var mode = api.level <= 3 ? "warna" : api.level <= 5 ? "tingkap" : api.level <= 7 ? "warna" : api.level <= 8 ? "tingkap" : MK.Gen.pick(["warna", "tingkap", "growing"]);
        if (api.diff === "mudah" && mode === "growing") mode = "warna";
        var slots = [], answerBuildings = [];

        if (mode === "warna") {
          var nCols = api.diff === "cabaran" ? 3 : 2;
          var cols = MK.Gen.sample(COLORS, nCols);
          var seq = [];
          for (var i = 0; i < 7; i++) seq.push(cols[i % nCols]);
          var gapAt = [3, 5]; // kedudukan kosong
          seq.forEach(function (c, i2) {
            if (gapAt.indexOf(i2) >= 0) slots.push({ gap: true, correct: c });
            else slots.push({ gap: false, b: c });
          });
          answerBuildings = cols.map(function (c) { return { c: c, w: 2, id: c.id }; });
        } else if (mode === "tingkap") {
          var step = api.diff === "cabaran" ? 2 : 1;
          var base = 1;
          var color = MK.Gen.pick(COLORS);
          var seqw = [];
          for (var k = 0; k < 6; k++) seqw.push(base + k * step);
          var gapAt2 = [3, 4];
          seqw.forEach(function (w2, i3) {
            if (gapAt2.indexOf(i3) >= 0) slots.push({ gap: true, correct: { id: "w" + w2, label: w2 + " tetingkap", w: w2 } });
            else slots.push({ gap: false, b: { id: "w" + w2, w: w2 } });
          });
          var options = [];
          for (var o = 1; o <= 6; o++) options.push({ c: color, w: o, id: "w" + o });
          answerBuildings = MK.Gen.sample(options, 4);
          if (!answerBuildings.find(function (x) { return x.id === "w" + seqw[3]; })) answerBuildings[0] = options.find(function (x) { return x.id === "w" + seqw[3]; });
          if (!answerBuildings.find(function (x) { return x.id === "w" + seqw[4]; })) answerBuildings[1] = options.find(function (x) { return x.id === "w" + seqw[4]; });
        } else { // growing: +1 setiap rumah, pilih siri
          var gcolor = MK.Gen.pick(COLORS);
          var series = [];
          for (var g = 1; g <= 6; g++) series.push(g);
          var gapAt3 = [2, 4, 5];
          series.forEach(function (w3, i4) {
            if (gapAt3.indexOf(i4) >= 0) slots.push({ gap: true, correct: { id: "w" + w3, w: w3 } });
            else slots.push({ gap: false, b: { id: "w" + w3, w: w3 } });
          });
          answerBuildings = [1, 2, 3, 4].map(function (x) { return { c: gcolor, w: x, id: "w" + x }; });
        }
        return { mode: mode, slots: slots, options: answerBuildings };
      }

      function play() {
        var R = makeRound();
        var fillIdx = 0;
        var gaps = R.slots.filter(function (s) { return s.gap; });

        mount.innerHTML = "";
        mount.appendChild(MK.el("div", "prompt small", "Siapkan pola bandar (" + (round + 1) + "/" + perLevel + ") — mod: " + R.mode));

        var city = MK.el("div", "row center wrap");
        city.style.cssText = "background:linear-gradient(#EAF3F7,#F7EFD9);border-radius:16px;padding:12px 8px;align-items:flex-end;min-height:170px;gap:4px";
        var slotEls = [];
        R.slots.forEach(function (s) {
          var holder = MK.el("div", null);
          holder.style.cssText = "width:64px;display:flex;justify-content:center";
          if (s.gap) {
            var ph = MK.el("button", null, "<div style='font-size:1.6rem'>❔</div>");
            ph.style.cssText = "width:62px;height:96px;border:3px dashed var(--star);border-radius:10px;background:rgba(255,255,255,.5);display:flex;align-items:center;justify-content:center";
            ph.setAttribute("aria-label", "Tapak kosong");
            holder.appendChild(ph);
            slotEls.push({ el: ph, slot: s });
          } else {
            var hex = s.b.hex || (s.b.c && s.b.c.hex) || COLORS[0].hex;
            holder.innerHTML = buildingSVG(hex, s.b.w || 2, null, 60);
            slotEls.push({ el: null, slot: s });
          }
          city.appendChild(holder);
        });
        mount.appendChild(city);

        var opts = MK.el("div", "choices");
        var optBtns = [];
        R.options.forEach(function (op) {
          var b = MK.el("button", "choice", buildingSVG(op.c.hex, op.w, null, 56) +
            "<span style='font-size:.75rem'>" + ((op.c && op.c.label) ? op.c.label : op.w + " tetingkap") + "</span>");
          b.addEventListener("click", function () {
            if (fillIdx >= gaps.length) return;
            var need = gaps[fillIdx].correct;
            if (op.id === need.id) {
              var g = gaps[fillIdx];
              var holderEl = slotEls.filter(function (x2) { return x2.slot === g; })[0];
              holderEl.el.outerHTML = buildingSVG((op.c || COLORS[0]).hex, op.w, null, 60);
              api.sfx("place");
              fillIdx++;
              api.progress(fillIdx, gaps.length);
              if (fillIdx >= gaps.length) {
                api.sfx("win"); api.feedback(true, "Bandar siap! Pola tersusun cantik!");
                round++;
                setTimeout(function () {
                  if (round >= perLevel) api.complete({ mistakes: mistakes }); else play();
                }, 1100);
              } else {
                api.feedback(true, "Bagus! " + (gaps.length - fillIdx) + " tapak lagi.");
              }
            } else {
              mistakes++;
              b.classList.add("shake-soft");
              setTimeout(function () { b.classList.remove("shake-soft"); }, 500);
              api.sfx("retry"); api.feedback(false);
            }
          });
          opts.appendChild(b);
          optBtns.push({ b: b, op: op });
        });
        mount.appendChild(opts);

        api._cityHint = function () {
          if (fillIdx < gaps.length) {
            MK.toast("💡 Tapak seterusnya perlukan bangunan: " + (gaps[fillIdx].correct.label || (gaps[fillIdx].correct.c ? gaps[fillIdx].correct.c.label : "")));
          }
        };
      }
      api.hint(function () { if (api._cityHint) api._cityHint(); });
      play();
    }
  });
})();
