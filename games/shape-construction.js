/* ============================================================
   GAME 03 — SHAPE CONSTRUCTION (Bentuk & Geometri)
   Bina objek (rumah, kenderaan, dll.) daripada bentuk geometri.
   Objek siap akan beranimasi lembut.
   ============================================================ */
"use strict";
(function () {
  /* Setiap objek: senarai bentuk yang diperlukan + susunan lukisan */
  var OBJECTS = [
    { name: "Rumah", emoji: "🏠", parts: ["segiempat", "segitiga", "segiempat", "bulatan"], draw: [
      { t: "segiempat", x: 100, y: 130 }, { t: "segitiga", x: 100, y: 62 }, { t: "segiempat", x: 100, y: 145, small: true }, { t: "bulatan", x: 128, y: 118, small: true }] },
    { name: "Pokok", emoji: "🌳", parts: ["segiempat", "segitiga", "segitiga"], draw: [
      { t: "segiempat", x: 100, y: 158 }, { t: "segitiga", x: 100, y: 100 }, { t: "segitiga", x: 100, y: 68 }] },
    { name: "Bot", emoji: "⛵", parts: ["segitiga", "segiempat", "segitiga"], draw: [
      { t: "segiempat", x: 100, y: 160 }, { t: "segiempat", x: 100, y: 118, small: true }, { t: "segitiga", x: 130, y: 90 }] },
    { name: "Roket", emoji: "🚀", parts: ["segiempat", "segitiga", "segitiga", "bulatan"], draw: [
      { t: "segiempat", x: 100, y: 120 }, { t: "segitiga", x: 100, y: 60 }, { t: "segitiga", x: 72, y: 140, small: true }, { t: "bulatan", x: 100, y: 105, small: true }] },
    { name: "Kereta", emoji: "🚗", parts: ["segiempat", "segiempat", "bulatan", "bulatan"], draw: [
      { t: "segiempat", x: 100, y: 130 }, { t: "segiempat", x: 100, y: 105, small: true }, { t: "bulatan", x: 78, y: 150, small: true }, { t: "bulatan", x: 122, y: 150, small: true }] },
    { name: "Robot", emoji: "🤖", parts: ["segiempat", "segiempat", "segiempat", "segitiga"], draw: [
      { t: "segiempat", x: 100, y: 70, small: true }, { t: "segiempat", x: 100, y: 125 }, { t: "segiempat", x: 100, y: 108, small: true }, { t: "segitiga", x: 100, y: 45, small: true }] },
    { name: "Lampu Jalan", emoji: "💡", parts: ["segiempat", "bulatan", "segiempat"], draw: [
      { t: "segiempat", x: 100, y: 120 }, { t: "bulatan", x: 100, y: 65, small: true }, { t: "segiempat", x: 100, y: 158, small: true }] },
    { name: "Bas", emoji: "🚌", parts: ["segiempat", "bulatan", "bulatan", "bulatan"], draw: [
      { t: "segiempat", x: 100, y: 115 }, { t: "bulatan", x: 80, y: 145, small: true }, { t: "bulatan", x: 120, y: 145, small: true }, { t: "bulatan", x: 100, y: 105, small: true }] },
    { name: "Layang-layang", emoji: "🪁", parts: ["segiempatwujud", "segitiga", "segitiga"], draw: [
      { t: "segiempatwujud", x: 100, y: 90 }, { t: "segitiga", x: 100, y: 140, small: true }, { t: "segitiga", x: 100, y: 55, small: true }] },
    { name: "Ais Krim", emoji: "🍦", parts: ["segitiga", "bulatan", "bulatan"], draw: [
      { t: "segitiga", x: 100, y: 145 }, { t: "bulatan", x: 100, y: 85, small: true }, { t: "bulatan", x: 100, y: 108, small: true }] }
  ];

  MK.registerGame({
    id: "shape-construction",
    name: "Shape Construction",
    icon: "🏗️",
    cat: "bentuk",
    engine: "custom",
    sticker: "🏠",
    desc: "Bina objek daripada bentuk geometri. Objek siap akan beranimasi!",
    instruction: function (l, d) {
      return "Ketuk bentuk yang diperlukan untuk membina objek. Bentuk yang tidak diperlukan tidak akan diterima.";
    },
    startLevel: function (mount, api) {
      var perLevel = api.diff === "mudah" ? 2 : api.diff === "cabaran" ? 4 : 3;
      var objIdx = (api.level - 1) % OBJECTS.length;
      var done = 0, mistakes = 0;
      var obj = OBJECTS[objIdx];

      function buildObject() {
        var cur = OBJECTS[(objIdx + done) % OBJECTS.length];
        var nDistract = api.diff === "mudah" ? 0 : api.diff === "cabaran" ? 4 : 2;
        var shapes = MK.Data.list("shapes", "shapes");
        var need = cur.parts.slice();
        var extras = MK.Gen.sample(shapes.filter(function (s) { return need.indexOf(s.id) < 0; }), nDistract);
        var palette = MK.Gen.shuffle(need.concat(extras.map(function (e) { return e.id; })));
        var added = 0, needCount = need.length;

        mount.innerHTML = "";
        mount.appendChild(MK.el("div", "prompt small", "Bina: <b>" + cur.name + "</b> " + cur.emoji + " (" + (done + 1) + "/" + perLevel + ")"));

        var stage = MK.el("div", null);
        stage.style.cssText = "background:#FDFBF5;border-radius:16px;padding:6px;min-height:220px;display:flex;align-items:center;justify-content:center";
        var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("viewBox", "0 0 200 200");
        svg.style.width = Math.round(Math.min(260, window.innerWidth * 0.7)) + "px";
        svg.style.height = "auto";
        stage.appendChild(svg);
        mount.appendChild(stage);

        var grid = MK.el("div", "choices");
        mount.appendChild(grid);

        function addShape(type) {
          var part = cur.draw[added];
          var el = MK.h("<div>" + MK.ShapeArt.flat(type, part.small ? 44 : 64) + "</div>");
          var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
          var inner = MK.ShapeArt.flat(type, 64);
          var tmp = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          tmp.innerHTML = inner;
          var src = tmp.firstElementChild;
          var s = part.small ? 0.62 : 1;
          g.setAttribute("transform", "translate(" + part.x + "," + part.y + ") scale(" + s + ") translate(-80,-80)");
          g.classList.add("drop-in");
          while (src.childNodes.length) g.appendChild(src.firstChild);
          g.setAttribute("fill", "");
          svg.appendChild(g);
          added++;
          api.progress(done * perLevel + added / needCount * 0.99, perLevel);
        }

        palette.forEach(function (ptype) {
          var def = MK.Data.list("shapes", "shapes").find(function (s) { return s.id === ptype; }) || { name: ptype };
          var remaining = need.length - (cur.parts.length - need.length);
          var b = MK.el("button", "choice", MK.ShapeArt.flat(ptype, 56) + "<span>" + def.name + "</span>");
          b.addEventListener("click", function () {
            if (b.classList.contains("dimmed")) return;
            var idx = need.indexOf(ptype);
            if (idx >= 0 && added < needCount) {
              need.splice(idx, 1);
              addShape(ptype);
              api.sfx("place");
              if (added >= needCount) {
                api.sfx("win");
                stage.firstElementChild.classList.add("bloom");
                api.feedback(true, cur.name + " siap! Hebat!");
                setTimeout(function () {
                  done++;
                  if (done >= perLevel) api.complete({ mistakes: mistakes });
                  else buildObject();
                }, 1000);
              } else {
                api.feedback(true, "Bagus! " + (needCount - added) + " bentuk lagi.");
              }
            } else {
              mistakes++;
              b.classList.add("shake-soft", "dimmed");
              setTimeout(function () { b.classList.remove("shake-soft"); }, 500);
              api.sfx("retry");
              api.feedback(false, "Bentuk itu tidak diperlukan untuk " + cur.name + ".");
            }
          });
          grid.appendChild(b);
        });
      }
      api.hint(function () {
        var b = mount.querySelector(".choices .choice:not(.dimmed):not(.correct)");
        // gelakkan bentuk yang betul: cari yang masih diperlukan
        var need = (mount.dataset.need || "").split(",");
        var btns = mount.querySelectorAll(".choices .choice");
        for (var i = 0; i < btns.length; i++) {
          var label = btns[i].textContent.trim();
          var shapes = MK.Data.list("shapes", "shapes");
          var match = shapes.find(function (s) { return label.indexOf(s.name) >= 0 && curStillNeeds(s.id); });
          if (match) { btns[i].classList.add("hinted"); MK.toast("Bentuk ini diperlukan ✨"); return; }
        }
        function curStillNeeds(id) { return true; /* semua yang belum dimatikan berpotensi */ }
      });
      buildObject();
    }
  });
})();
