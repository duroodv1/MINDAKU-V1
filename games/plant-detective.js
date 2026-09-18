/* ============================================================
   GAME 34 — PLANT DETECTIVE (Sains & Dunia)
   Kenal bahagian tumbuhan: akar, batang, daun, bunga, buah.
   ============================================================ */
"use strict";
(function () {
  function plantSVG() {
    return '<svg viewBox="0 0 220 260" style="width:min(300px,80vw);height:auto;margin:0 auto;display:block" aria-hidden="true">' +
      '<ellipse cx="110" cy="240" rx="80" ry="14" fill="#E8DFC8"/>' +
      // buah
      '<g id="p-buah" style="cursor:pointer"><circle cx="150" cy="96" r="20" fill="#E05252" stroke="#fff" stroke-width="3"/><path d="M150 76 q3 -8 8 -10" stroke="#5FA97C" stroke-width="3" fill="none"/></g>' +
      // bunga
      '<g id="p-bunga" style="cursor:pointer">' +
      '<circle cx="110" cy="62" r="10" fill="#F0BE4D"/>' +
      '<circle cx="110" cy="44" r="9" fill="#E8875F"/><circle cx="127" cy="57" r="9" fill="#E8875F"/>' +
      '<circle cx="121" cy="77" r="9" fill="#E8875F"/><circle cx="99" cy="77" r="9" fill="#E8875F"/>' +
      '<circle cx="93" cy="57" r="9" fill="#E8875F"/></g>' +
      // daun
      '<g id="p-daun" style="cursor:pointer"><path d="M110 120 Q80 118 70 140 Q95 146 110 132 Z" fill="#5FA97C" stroke="#fff" stroke-width="2"/><path d="M110 150 Q140 148 150 170 Q125 176 110 162 Z" fill="#5FA97C" stroke="#fff" stroke-width="2"/></g>' +
      // batang
      '<rect id="p-batang" x="102" y="80" width="16" height="110" rx="7" fill="#A9805B" stroke="#fff" stroke-width="2" style="cursor:pointer"/>' +
      // akar
      '<g id="p-akar" style="cursor:pointer" fill="none" stroke="#8A6B4F" stroke-width="5" stroke-linecap="round">' +
      '<path d="M110 190 q-16 14 -28 34"/><path d="M110 190 q16 14 26 36"/><path d="M110 190 q0 18 -2 34"/></g>' +
      "</svg>";
  }

  MK.registerGame({
    id: "plant-detective",
    name: "Plant Detective",
    icon: "🌿",
    cat: "sains",
    engine: "custom",
    sticker: "🌻",
    desc: "Jadi detektif tumbuhan! Kenal pasti akar, batang, daun, bunga dan buah.",
    instruction: function (l, d) {
      return "Ketuk bahagian tumbuhan yang diminta pada gambar. Jadilah detektif tumbuhan!";
    },
    startLevel: function (mount, api) {
      var parts = MK.Data.bank("habitats").plants ||
        [{ id: "akar", label: "Akar", func: "Menyerap air dari tanah" }];
      var perLevel = 5, tIdx = 0, mistakes = 0;
      var mode = api.level <= 4 ? "tap" : MK.Gen.pick(["tap", "func", "func"]);

      function build() {
        var target = MK.Gen.pickAvoid(parts, api.ctx.recentParts || []);
        (api.ctx.recentParts = api.ctx.recentParts || []).push(target.id);
        if (api.ctx.recentParts.length > 5) api.ctx.recentParts.shift();

        mount.innerHTML = "";
        if (mode === "tap") {
          mount.appendChild(MK.el("div", "prompt small", "Ketuk: <b>" + target.label.toUpperCase() + "</b> (" + (tIdx + 1) + "/" + perLevel + ")"));
          var holder = MK.el("div", null, plantSVG());
          mount.appendChild(holder);
          holder.querySelectorAll("[id^='p-']").forEach(function (g) {
            var id = g.id.replace("p-", "");
            g.addEventListener("click", function () {
              if (id === target.id) {
                g.style.filter = "drop-shadow(0 0 6px #F0BE4D)";
                right(target.label + ": " + target.func + ".");
              } else {
                mistakes++;
                api.sfx("retry"); api.feedback(false, "Itu " + partName(id) + ". Cuba lagi!");
              }
            });
          });
        } else {
          // fungsi: apakah bahagian yang berfungsi begini?
          var others = MK.Gen.sample(parts.filter(function (p) { return p.id !== target.id; }), 2);
          mount.appendChild(MK.el("div", "prompt small", "Bahagian mana yang…"));
          mount.appendChild(MK.el("div", "sub-prompt", "“" + target.func + "”?"));
          var holder2 = MK.el("div", null, plantSVG());
          mount.appendChild(holder2);
          var ch = MK.el("div", "choices");
          MK.Gen.shuffle([target].concat(others)).forEach(function (p) {
            var b = MK.el("button", "choice", p.emoji + " <span>" + p.label + "</span>");
            b.addEventListener("click", function () {
              if (p.id === target.id) right(p.label + ": " + p.func + ".");
              else wrong(b);
            });
            ch.appendChild(b);
          });
          mount.appendChild(ch);
        }
        function partName(id) {
          var p = parts.find(function (x) { return x.id === id; });
          return p ? p.label : id;
        }
        function right(ex) {
          api.sfx("good"); api.feedback(true);
          MK.toast("🌿 " + ex);
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
        MK.toast("💡 Akar di bawah tanah, batang menyokong, daun hijau membuat makanan, bunga cantik jadi buah!");
      });
      build();
    }
  });
})();
