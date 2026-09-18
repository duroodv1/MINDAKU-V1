/* ============================================================
   GAME 02 — TANGRAM CHALLENGE (Bentuk & Geometri)
   Bina gambar daripada bentuk geometri: tap, drag & drop,
   putar, snap-to-position. Tiada penalti.
   ============================================================ */
"use strict";
(function () {
  var TEMPLATES = {
    triL: { pts: [[-60, 60], [60, 60], [-60, -60]], label: "Segi Tiga Besar" },
    triM: { pts: [[-42, 42], [42, 42], [-42, -42]], label: "Segi Tiga Sederhana" },
    triS: { pts: [[-30, 30], [30, 30], [-30, -30]], label: "Segi Tiga Kecil" },
    sq: { pts: [[-30, -30], [30, -30], [30, 30], [-30, 30]], label: "Segi Empat Sama" },
    rect: { pts: [[-60, -30], [60, -30], [60, 30], [-60, 30]], label: "Segi Empat Tepat" },
    para: { pts: [[-50, 30], [50, 30], [10, -30], [-90, -30]], label: "Paralellogram" }
  };
  var PCOLORS = { triL: "#7EA6E0", triM: "#8FBF9F", triS: "#F2A65A", sq: "#B49AE0", rect: "#68C3B0", para: "#E8875F" };

  /* Reka bentuk: setiap slot {t:jenis, x, y, r(darjah)} */
  var DESIGNS = [
    { name: "Rumah", emoji: "🏠", slots: [
      { t: "triL", x: 200, y: 85, r: 45 }, { t: "rect", x: 200, y: 150, r: 0 }, { t: "rect", x: 200, y: 210, r: 0 },
      { t: "triS", x: 200, y: 238, r: 225 }, { t: "sq", x: 140, y: 180, r: 0 }] },
    { name: "Bot", emoji: "⛵", slots: [
      { t: "para", x: 200, y: 295, r: 0 }, { t: "rect", x: 200, y: 215, r: 90 },
      { t: "triL", x: 235, y: 145, r: -45 }, { t: "triS", x: 165, y: 165, r: 45 }] },
    { name: "Roket", emoji: "🚀", slots: [
      { t: "triL", x: 200, y: 60, r: 45 }, { t: "rect", x: 200, y: 150, r: 90 }, { t: "sq", x: 200, y: 115, r: 45 },
      { t: "triS", x: 148, y: 210, r: -45 }, { t: "triS", x: 252, y: 210, r: 45 }, { t: "triM", x: 200, y: 275, r: 225 }] },
    { name: "Pokok", emoji: "🌳", slots: [
      { t: "triL", x: 200, y: 120, r: 45 }, { t: "triL", x: 200, y: 210, r: 225 },
      { t: "rect", x: 200, y: 305, r: 90 }, { t: "para", x: 200, y: 355, r: 0 }] },
    { name: "Kucing", emoji: "🐱", slots: [
      { t: "sq", x: 200, y: 110, r: 45 }, { t: "triS", x: 168, y: 62, r: 45 }, { t: "triS", x: 232, y: 62, r: 45 },
      { t: "triL", x: 200, y: 225, r: 225 }, { t: "para", x: 285, y: 235, r: 90 },
      { t: "triS", x: 175, y: 295, r: 45 }, { t: "triS", x: 225, y: 295, r: 45 }] },
    { name: "Ikan", emoji: "🐟", slots: [
      { t: "triL", x: 175, y: 200, r: 45 }, { t: "triL", x: 225, y: 200, r: 225 },
      { t: "triS", x: 290, y: 200, r: 225 }, { t: "triS", x: 200, y: 145, r: 225 },
      { t: "sq", x: 120, y: 120, r: 45 }, { t: "sq", x: 105, y: 85, r: 45 }] },
    { name: "Burung", emoji: "🐦", slots: [
      { t: "triL", x: 200, y: 200, r: 225 }, { t: "sq", x: 250, y: 140, r: 45 },
      { t: "triS", x: 292, y: 148, r: 135 }, { t: "triM", x: 175, y: 195, r: 45 }, { t: "triS", x: 125, y: 245, r: 225 }] },
    { name: "Arnab", emoji: "🐰", slots: [
      { t: "sq", x: 200, y: 115, r: 0 }, { t: "rect", x: 180, y: 48, r: 90 }, { t: "rect", x: 222, y: 48, r: 90 },
      { t: "triL", x: 200, y: 225, r: 225 }, { t: "triS", x: 172, y: 292, r: 45 }, { t: "triS", x: 228, y: 292, r: 45 }] },
    { name: "Istana", emoji: "🏰", slots: [
      { t: "rect", x: 115, y: 225, r: 90 }, { t: "rect", x: 285, y: 225, r: 90 },
      { t: "triL", x: 115, y: 130, r: 45 }, { t: "triL", x: 285, y: 130, r: 45 },
      { t: "sq", x: 200, y: 235, r: 0 }, { t: "triM", x: 200, y: 155, r: 45 }, { t: "triS", x: 200, y: 292, r: 225 }] },
    { name: "Robot", emoji: "🤖", slots: [
      { t: "sq", x: 200, y: 85, r: 0 }, { t: "triS", x: 200, y: 38, r: 225 },
      { t: "rect", x: 200, y: 175, r: 0 }, { t: "rect", x: 122, y: 175, r: 90 },
      { t: "rect", x: 278, y: 175, r: 90 }, { t: "rect", x: 180, y: 258, r: 90 }, { t: "rect", x: 222, y: 258, r: 90 }] }
  ];

  function rot(p, deg) {
    var a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    return [+(p[0] * c - p[1] * s).toFixed(1), +(p[0] * s + p[1] * c).toFixed(1)];
  }
  function slotPoints(slot) {
    return TEMPLATES[slot.t].pts.map(function (p) {
      var q = rot(p, slot.r);
      return [q[0] + slot.x, q[1] + slot.y];
    });
  }
  function ptsAttr(pts) { return pts.map(function (p) { return p[0] + "," + p[1]; }).join(" "); }

  MK.registerGame({
    id: "tangram-challenge",
    name: "Tangram Challenge",
    icon: "🧩",
    cat: "bentuk",
    engine: "custom",
    sticker: "🐅",
    desc: "Gunakan bentuk geometri untuk membina gambar. Tarik, putar dan padankan!",
    instruction: function (l, d) {
      return d === "mudah"
        ? "Ketuk sekeping bentuk, kemudian ketuk tempat kosong yang sepadan."
        : "Pilih bentuk, putar jika perlu, kemudian letak pada tempat yang betul. Tiada penalti!";
    },
    startLevel: function (mount, api) {
      var design = DESIGNS[(api.level - 1) % DESIGNS.length];
      var needRotate = api.diff === "cabaran";
      var showGhost = api.diff === "mudah";
      var placed = 0, mistakes = 0;
      var slotDone = design.slots.map(function () { return false; });
      var pieces = design.slots.map(function (s, i) { return { type: s.t, id: "p" + i, rot: 0, placed: false }; });
      if (api.diff !== "mudah") pieces = MK.Gen.shuffle(pieces);

      mount.appendChild(MK.el("div", "prompt small", "Bina: <b>" + design.name + "</b> " + design.emoji));
      var wrap = MK.el("div", null);
      wrap.style.display = "flex";
      wrap.style.flexDirection = "column";
      wrap.style.gap = "10px";
      mount.appendChild(wrap);

      /* papan SVG */
      var boardHolder = MK.el("div", null);
      boardHolder.style.position = "relative";
      var NS = "http://www.w3.org/2000/svg";
      var svg = document.createElementNS(NS, "svg");
      svg.setAttribute("viewBox", "0 0 400 400");
      svg.style.width = "100%";
      svg.style.maxWidth = "420px";
      svg.style.margin = "0 auto";
      svg.style.display = "block";
      svg.style.background = "#FDFBF5";
      svg.style.borderRadius = "16px";
      svg.style.touchAction = "none";
      boardHolder.appendChild(svg);
      wrap.appendChild(boardHolder);

      var slotEls = [];
      design.slots.forEach(function (slot, i) {
        var el = document.createElementNS(NS, "polygon");
        el.setAttribute("points", ptsAttr(slotPoints(slot)));
        el.setAttribute("fill", showGhost ? PCOLORS[slot.t] : "#F0EBDD");
        el.setAttribute("fill-opacity", showGhost ? "0.35" : "0.6");
        el.setAttribute("stroke", "#B9AF98");
        el.setAttribute("stroke-width", "2.5");
        el.setAttribute("stroke-dasharray", "7 6");
        el.setAttribute("stroke-linejoin", "round");
        svg.appendChild(el);
        slotEls.push(el);
      });

      function placePiece(slotIndex, pieceEl) {
        var slot = design.slots[slotIndex];
        var p = document.createElementNS(NS, "polygon");
        p.setAttribute("points", ptsAttr(slotPoints(slot)));
        p.setAttribute("fill", PCOLORS[slot.t]);
        p.setAttribute("stroke", "#fff");
        p.setAttribute("stroke-width", "3");
        p.setAttribute("stroke-linejoin", "round");
        p.classList.add("snap-in");
        svg.appendChild(p);
        slotDone[slotIndex] = true;
        placed++;
        api.sfx("place");
        if (placed >= design.slots.length) {
          api.sfx("win");
          api.feedback(true, design.name + " siap! Cantik sekali!");
          setTimeout(function () { api.complete({ mistakes: mistakes }); }, 900);
        } else {
          api.feedback(true, "Betul! " + (design.slots.length - placed) + " lagi.");
        }
      }

      /* talam bentuk */
      var trayLabel = MK.el("div", "sub-prompt", "Bentuk saya:");
      var tray = MK.el("div", "tool-row");
      wrap.appendChild(trayLabel); wrap.appendChild(tray);
      var selected = null;

      var rotateBtn = MK.el("button", "tool-btn", "🔄 Putar");
      var rotCount = MK.el("span", "soft-note", "");
      var ctrls = MK.el("div", "tool-row");
      ctrls.appendChild(rotateBtn);
      ctrls.appendChild(rotCount);
      wrap.appendChild(ctrls);

      function renderTray() {
        tray.innerHTML = "";
        pieces.forEach(function (pc) {
          if (pc.placed) return;
          var d = MK.el("button", "stile" + (selected === pc ? " sel" : ""));
          var mini = document.createElementNS(NS, "svg");
          mini.setAttribute("viewBox", "-110 -110 220 220");
          mini.setAttribute("width", "52"); mini.setAttribute("height", "52");
          var polyEl = document.createElementNS(NS, "polygon");
          polyEl.setAttribute("points", ptsAttr(TEMPLATES[pc.type].pts.map(function (p) { return rot(p, pc.rot); })));
          polyEl.setAttribute("fill", PCOLORS[pc.type]);
          polyEl.setAttribute("stroke", "#fff");
          polyEl.setAttribute("stroke-width", "8");
          mini.appendChild(polyEl);
          d.appendChild(mini);
          d.setAttribute("aria-label", TEMPLATES[pc.type].label);
          attachPieceEvents(d, pc);
          tray.appendChild(d);
        });
        rotCount.textContent = selected ? "Dipilih: " + TEMPLATES[selected.type].label + (needRotate ? " • putar ke arah betul!" : "") : "Pilih satu bentuk";
      }

      function tryPlace(pc, slotIndex) {
        var slot = design.slots[slotIndex];
        if (slotDone[slotIndex]) { api.feedback(false, "Tempat itu sudah penuh. Cuba yang lain!"); return; }
        if (slot.t !== pc.type) {
          mistakes++;
          api.sfx("retry");
          api.feedback(false, "Bentuk itu tidak sepadan di sini. Cuba tempat lain!");
          return;
        }
        if (needRotate) {
          var target = ((slot.r % 360) + 360) % 360;
          var cur = ((pc.rot % 360) + 360) % 360;
          var delta = Math.min(Math.abs(target - cur), 360 - Math.abs(target - cur));
          if (delta > 50) {
            mistakes++;
            api.feedback(false, "Hampir! Putar bentuk itu dahulu 🔄");
            return;
          }
        }
        pc.placed = true;
        if (selected === pc) selected = null;
        placePiece(slotIndex, null);
        renderTray();
      }

      function attachPieceEvents(btn, pc) {
        btn.addEventListener("click", function () {
          if (selected === pc) { selected = null; } else { selected = pc; api.sfx("tap"); }
          renderTray();
        });
      }
      rotateBtn.addEventListener("click", function () {
        if (!selected) { api.feedback(false, "Pilih satu bentuk dahulu, kemudian putar!"); return; }
        selected.rot = (selected.rot + 45) % 360;
        api.sfx("flip");
        renderTray();
      });

      /* ketuk slot terus pada papan */
      slotEls.forEach(function (el, i) {
        el.style.cursor = "pointer";
        el.addEventListener("click", function () {
          if (!selected) { api.feedback(false, "Pilih satu bentuk daripada talam dahulu 🙂"); return; }
          tryPlace(selected, i);
        });
      });

      api.hint(function () {
        for (var i = 0; i < design.slots.length; i++) {
          if (!slotDone[i]) {
            slotEls[i].setAttribute("stroke", "#F0BE4D");
            slotEls[i].setAttribute("stroke-width", "5");
            var pc = pieces.find(function (p) { return !p.placed && p.type === design.slots[i].t; });
            if (pc) { selected = pc; renderTray(); }
            setTimeout(function (k) { return function () { slotEls[k].setAttribute("stroke", "#B9AF98"); slotEls[k].setAttribute("stroke-width", "2.5"); }; }(i), 2400);
            MK.toast("Bentuk yang dipilih sepadan dengan rangka bersinar ✨");
            return;
          }
        }
      });
      renderTray();
      api.progress(0, 1);
    }
  });
})();
