/* ============================================================
   GAME 41 — PERSONAL SPACE (Sosial & Keselamatan)
   Konsep ruang peribadi secara neutral dan mudah difahami:
   keluarga, kawan, orang baharu. Visual jarak yang sesuai.
   Tidak menakutkan.
   ============================================================ */
"use strict";
(function () {
  function sceneSVG(distance) {
    // jarak: dekat / sederhana / jauh (neutral & tenang)
    var xs = { dekat: 165, sederhana: 130, jauh: 85 };
    var x = xs[distance] || 130;
    var owl1 = '<g transform="translate(150,120)">' + miniOwl("#6FAE9B") + "</g>";
    var owl2 = '<g transform="translate(' + x + ',124)">' + miniOwl("#E8A2B0") + "</g>";
    var line = '<line x1="' + (x + 26) + '" y1="150" x2="138" y2="150" stroke="#C9C0AF" stroke-width="3" stroke-dasharray="6 5"/>';
    return '<svg viewBox="0 0 300 170" style="width:100%;max-width:330px;margin:0 auto;display:block" aria-hidden="true">' +
      '<rect x="0" y="158" width="300" height="12" rx="6" fill="#E8DFC8"/>' + owl2 + line + owl1 + "</svg>";
  }
  function miniOwl(color) {
    return '<ellipse cx="0" cy="0" rx="24" ry="28" fill="' + color + '"/>' +
      '<circle cx="-9" cy="-8" r="7" fill="#fff"/><circle cx="9" cy="-8" r="7" fill="#fff"/>' +
      '<circle cx="-9" cy="-8" r="3.2" fill="#33413F"/><circle cx="9" cy="-8" r="3.2" fill="#33413F"/>' +
      '<path d="M0 2 L5 10 L-5 10 Z" fill="#F2A65A"/>' +
      '<ellipse cx="-22" cy="4" rx="6" ry="13" fill="' + color + '" opacity=".8"/>' +
      '<ellipse cx="22" cy="4" rx="6" ry="13" fill="' + color + '" opacity=".8"/>';
  }

  MK.registerGame({
    id: "personal-space",
    name: "Personal Space",
    icon: "🫂",
    cat: "sosial",
    engine: "custom",
    sticker: "💫",
    desc: "Belajar tentang jarak yang selesa dengan keluarga, kawan dan orang baharu.",
    instruction: function (l, d) {
      return "Lihat situasi dan pilih jarak yang paling selesa dan sopan. Ikut rasa selesa anda!";
    },
    startLevel: function (mount, api) {
      var perLevel = 4, tIdx = 0, mistakes = 0;
      var bank = MK.Data.list("safety", "personalSpace");

      function build() {
        var item = MK.Gen.pickAvoid(bank, api.ctx.recentPS || []);
        (api.ctx.recentPS = api.ctx.recentPS || []).push(item.s);
        if (api.ctx.recentPS.length > 6) api.ctx.recentPS.shift();

        mount.innerHTML = "";
        mount.appendChild(MK.el("div", "prompt small", "Jarak yang sesuai (" + (tIdx + 1) + "/" + perLevel + ")"));
        mount.appendChild(MK.el("div", "sub-prompt", "🦉 (anda) &nbsp;·&nbsp; " + MK.esc(item.s)));

        var options = [
          { id: "dekat", label: "Hampir", emoji: "🤗" },
          { id: "sederhana", label: "Sederhana", emoji: "🙂" },
          { id: "jauh", label: "Lebih Jauh", emoji: "👋" }
        ];
        var grid = MK.el("div", "choices");
        MK.Gen.shuffle(options.slice()).forEach(function (o) {
          var b = MK.el("button", "choice", sceneSVG(o.id) + "<span>" + o.emoji + " " + o.label + "</span>");
          b.addEventListener("click", function () {
            if (o.id === item.answer) {
              b.classList.add("correct");
              api.sfx("good");
              api.feedback(true, item.why);
              tIdx++; api.progress(tIdx, perLevel);
              setTimeout(function () {
                if (tIdx >= perLevel) api.complete({ mistakes: mistakes }); else build();
              }, 1500);
            } else {
              mistakes++;
              api.sfx("retry");
              api.feedback(false, "Jarak itu kurang selesa untuk situasi ini. Cuba lagi!");
              b.classList.add("dimmed");
            }
          });
          grid.appendChild(b);
        });
        mount.appendChild(grid);
      }
      api.hint(function () {
        MK.toast("💡 Keluarga boleh hampir, kawan sederhana, orang baharu lebih jauh.");
      });
      build();
    }
  });
})();
