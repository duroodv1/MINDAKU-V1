/* ============================================================
   GAME 32 — SOLAR MISSION (Sains & Dunia)
   Teroka sistem suria: susun planet, planet terbesar,
   planet bercincin, pilih planet sasaran, orbit.
   ============================================================ */
"use strict";
(function () {
  var NS = "http://www.w3.org/2000/svg";
  function planetSVG(p, size) {
    size = size || 56;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 80 80");
    svg.setAttribute("width", size); svg.setAttribute("height", size);
    var g = document.createElementNS(NS, "g");
    var circle = document.createElementNS(NS, "circle");
    circle.setAttribute("cx", "40"); circle.setAttribute("cy", "40");
    circle.setAttribute("r", Math.max(10, p.size));
    circle.setAttribute("fill", p.color);
    circle.setAttribute("stroke", "rgba(0,0,0,.12)");
    circle.setAttribute("stroke-width", "2");
    g.appendChild(circle);
    if (p.ring) {
      var ellipse = document.createElementNS(NS, "ellipse");
      ellipse.setAttribute("cx", "40"); ellipse.setAttribute("cy", "40");
      ellipse.setAttribute("rx", p.size + 14); ellipse.setAttribute("ry", (p.size + 14) * 0.32);
      ellipse.setAttribute("fill", "none");
      ellipse.setAttribute("stroke", "#C9A066");
      ellipse.setAttribute("stroke-width", "4");
      ellipse.setAttribute("transform", "rotate(-18 40 40)");
      g.appendChild(ellipse);
    }
    svg.appendChild(g);
    return svg;
  }

  MK.registerGame({
    id: "solar-mission",
    name: "Solar Mission",
    icon: "🪐",
    cat: "sains",
    engine: "custom",
    sticker: "🚀",
    desc: "Teroka sistem suria: susun planet, jawab misi dan kenali cincin!",
    instruction: function (l, d) {
      return "Selesaikan misi angkasa lepas anda! Susun planet ikut jarak daripada Matahari atau jawab soalan planet.";
    },
    startLevel: function (mount, api) {
      var perLevel = api.diff === "mudah" ? 3 : 4, tIdx = 0, mistakes = 0;
      var planets = (MK.Data.bank("habitats").planets || []).slice();

      function build() {
        var mode = api.level <= 2 ? "order" :
          api.level <= 3 ? "biggest" :
          api.level <= 4 ? "rings" :
          api.level <= 6 ? "order" :
          api.level <= 7 ? "target" : MK.Gen.pick(["order", "target", "biggest", "rings"]);
        mount.innerHTML = "";

        if (mode === "order") {
          var n = api.level <= 2 ? 3 : api.level <= 6 ? 5 : 8;
          if (api.diff === "mudah") n = Math.max(3, n - 1);
          var subset = planets.slice(0, n);
          var shuffled = MK.Gen.shuffle(subset.slice());
          mount.appendChild(MK.el("div", "prompt small", "Susun planet: paling hampir dengan ☀️ dahulu (" + (tIdx + 1) + "/" + perLevel + ")"));
          var slots = MK.el("div", "order-slots");
          var placed = [];
          var pool = MK.el("div", "order-pool");
          shuffled.forEach(function (p) {
            var b = MK.el("button", "otoken");
            b.appendChild(planetSVG(p, 40));
            var lbl = MK.el("span", null, p.label);
            lbl.style.fontWeight = "800";
            b.appendChild(lbl);
            b.addEventListener("click", function () {
              if (b.classList.contains("used")) return;
              MK.Audio.sfx("tap");
              b.classList.add("used");
              placed.push(p);
              renderSlots();
              if (placed.length === subset.length) check();
            });
            pool.appendChild(b);
          });
          function renderSlots() {
            slots.innerHTML = "";
            for (var i = 0; i < subset.length; i++) {
              if (placed[i]) {
                slots.appendChild(MK.el("div", "oslot", (i + 1) + ". " + placed[i].label));
              } else slots.appendChild(MK.el("div", "oslot", (i + 1)));
            }
          }
          function check() {
            var ok = placed.every(function (p, i) { return p.id === subset[i].id; });
            if (ok) right("Betul! " + subset.map(function (p) { return p.label; }).join(" → "));
            else {
              mistakes++;
              api.sfx("retry"); api.feedback(false, "Belum tepat — ketuk planet di atas untuk menyesuaikan.");
              slots.classList.add("shake-soft");
              setTimeout(function () { slots.classList.remove("shake-soft"); }, 550);
            }
          }
          // ketuk planet di slot untuk buang
          slots.addEventListener("click", function (ev) {
            var idx = Array.prototype.indexOf.call(slots.children, ev.target.closest(".oslot"));
            if (idx >= 0 && placed[idx]) {
              var p = placed.splice(idx, 1)[0];
              var btns = pool.querySelectorAll(".otoken");
              btns.forEach(function (b2) {
                if (!b2.classList.contains("used") && b2.textContent.indexOf(p.label) >= 0) b2.classList.remove("used");
              });
              renderSlots();
            }
          });
          mount.appendChild(slots);
          mount.appendChild(pool);
          renderSlots();
        } else {
          // mod kuiz planet
          var q, ans, explain, ch;
          if (mode === "biggest") {
            q = "Planet manakah yang <b>terbesar</b>?";
            ans = planets.find(function (p) { return p.id === "musytari"; });
            explain = ans.fact;
            var others = MK.Gen.sample(planets.filter(function (p) { return p.id !== "musytari"; }), api.diff === "mudah" ? 2 : 3);
            ch = [ans].concat(others);
          } else if (mode === "rings") {
            var ringed = planets.filter(function (p) { return p.ring; });
            var target = MK.Gen.pick(ringed);
            q = "Planet manakah yang <b>bercincin</b>?";
            ans = target;
            explain = target.fact;
            var others2 = MK.Gen.sample(planets.filter(function (p) { return !p.ring; }), 3);
            ch = [target].concat(others2);
          } else { // target
            var t = MK.Gen.pick(planets);
            var clues = [
              { t: "Misi ke planet <b>" + t.label + "</b>! Ketuk planet sasaran.", e: t.fact },
              { t: "Misi ke planet <b>" + t.color.toUpperCase() + "</b> mengikut warna! Ketuk planet sasaran.", e: "Planet itu ialah " + t.label + ". " + t.fact },
              { t: "Misi ke planet ke-<b>" + (planets.indexOf(t) + 1) + "</b> daripada Matahari!", e: "Planet ke-" + (planets.indexOf(t) + 1) + " ialah " + t.label + ". " + t.fact }
            ];
            var clue = MK.Gen.pick(clues);
            q = clue.t; ans = t; explain = clue.e;
            ch = MK.Gen.shuffle(planets.slice());
          }
          mount.appendChild(MK.el("div", "prompt small", q + " (" + (tIdx + 1) + "/" + perLevel + ")"));
          var grid = MK.el("div", "choices");
          ch.forEach(function (p) {
            var b = MK.el("button", "choice");
            b.appendChild(planetSVG(p, 52));
            b.appendChild(MK.el("span", null, p.label));
            b.addEventListener("click", function () {
              if (p.id === ans.id) right(explain);
              else wrong(b);
            });
            grid.appendChild(b);
          });
          mount.appendChild(grid);
        }

        function right(ex) {
          api.sfx("good"); api.feedback(true, null);
          if (ex) MK.toast("🌌 " + ex);
          tIdx++; api.progress(tIdx, perLevel);
          setTimeout(function () {
            if (tIdx >= perLevel) api.complete({ mistakes: mistakes }); else build();
          }, 950);
        }
        function wrong(b) {
          mistakes++; api.sfx("retry"); api.feedback(false);
          b.classList.add("shake-soft");
          setTimeout(function () { b.classList.remove("shake-soft"); }, 500);
        }
      }
      api.hint(function () {
        MK.toast("💡 Ingat: Musytari paling besar, Saturnus bercincin cantik, Neptun paling jauh!");
      });
      build();
    }
  });
})();
