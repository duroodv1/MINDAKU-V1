/* ============================================================
   GAME 09 — SYLLABLE FROG (Auditori & Fonologi)
   Dengar perkataan, ketuk drum ikut bilangan suku kata.
   Katak melompat ke daun teratai. BU-KU = 2.
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "syllable-frog",
    name: "Syllable Frog",
    icon: "🐸",
    cat: "auditori",
    engine: "custom",
    sticker: "🥁",
    desc: "Dengar perkataan dan ketuk drum mengikut bilangan suku kata. Katak akan melompat!",
    instruction: function (l, d) {
      return "Dengar perkataan, kemudian ketuk dram sebanyak suku katanya. Contoh: BU-KU = 2 ketukan. Tekan Siap bila bersedia!";
    },
    startLevel: function (mount, api) {
      var perLevel = api.diff === "mudah" ? 3 : 4;
      var tIdx = 0, mistakes = 0;
      var words = MK.Data.list("vocabulary", "syllable");
      var maxSyl = api.level <= 3 ? 2 : api.level <= 6 ? 3 : api.level <= 8 ? 4 : 5;
      var pool = words.filter(function (w) { return w.s <= maxSyl && w.s >= 2; });
      if (api.diff === "cabaran") pool = words.filter(function (w) { return w.s >= 3; });
      if (!pool.length) pool = words;
      var current = null, taps = 0, answered = false;

      function build() {
        current = MK.Gen.pickAvoid(pool, (api.ctx.recentWords = api.ctx.recentWords || []));
        api.ctx.recentWords.push(current.w);
        if (api.ctx.recentWords.length > 6) api.ctx.recentWords.shift();
        taps = 0; answered = false;

        mount.innerHTML = "";
        mount.appendChild(MK.el("div", "prompt small", "Ketuk drum ikut suku kata (" + (tIdx + 1) + "/" + perLevel + ")"));

        /* laluan daun teratai */
        var pads = current.s + (api.diff === "mudah" ? 0 : 1);
        var path = MK.el("div", "row center wrap");
        path.style.gap = "6px";
        var padEls = [];
        for (var i = 0; i < Math.max(3, pads); i++) {
          var pad = MK.el("div", null, i === 0 ? "🐸" : "🍃");
          pad.style.cssText = "font-size:1.9rem;width:54px;height:54px;display:flex;align-items:center;justify-content:center;background:#DCEBE0;border-radius:50%;border:3px solid #8FBF9F;transition:all .3s ease";
          pad.setAttribute("aria-label", "Daun teratai " + (i + 1));
          path.appendChild(pad);
          padEls.push(pad);
        }
        mount.appendChild(path);

        var controls = MK.el("div", "row center wrap");
        var listen = MK.el("button", "btn", "🔊 Dengar Perkataan");
        listen.addEventListener("click", function () { speakWord(); });
        var drum = MK.el("button", "btn accent big", "🥁 KETUK DRUM");
        drum.style.minWidth = "180px";
        drum.addEventListener("click", function () {
          if (answered) return;
          if (taps >= padEls.length) return;
          MK.Audio.sfx("drum");
          var frog = padEls[Math.min(taps, padEls.length - 1)];
          frog.classList.add("frog-hop");
          setTimeout(function () { frog.classList.remove("frog-hop"); }, 520);
          if (taps + 1 < padEls.length) {
            padEls[taps].textContent = "🍃";
            padEls[taps + 1].textContent = "🐸";
          }
          taps++;
        });
        var done = MK.el("button", "btn primary", "✅ Siap");
        done.addEventListener("click", function () { check(); });
        controls.appendChild(listen);
        controls.appendChild(drum);
        controls.appendChild(done);
        mount.appendChild(controls);

        var wordLine = MK.el("div", "sub-prompt", "");
        mount.appendChild(wordLine);

        function speakWord() {
          var ok = MK.TTS.speak(current.w);
          if (!ok) {
            wordLine.innerHTML = "📖 (Suara tidak tersedia) Perkataan: <b>" + current.w + "</b> — kira suku katanya!";
          }
        }
        function check() {
          if (answered) return;
          if (taps === 0) { MK.toast("Ketuk drum dahulu 🙂"); return; }
          answered = true;
          if (taps === current.s) {
            api.sfx("good");
            wordLine.innerHTML = "✅ <b>" + current.w + "</b> ada <b>" + current.s + "</b> suku kata. Hebat!";
            api.feedback(true);
            tIdx++; api.progress(tIdx, perLevel);
            setTimeout(function () {
              if (tIdx >= perLevel) api.complete({ mistakes: mistakes }); else build();
            }, 1400);
          } else {
            mistakes++;
            api.sfx("retry");
            api.feedback(false, "Anda ketuk " + taps + " kali. Dengar sekali lagi dan cuba lagi!");
            setTimeout(function () {
              answered = false;
              taps = 0;
              padEls.forEach(function (p, i) { p.textContent = i === 0 ? "🐸" : "🍃"; });
              speakWord();
            }, 1600);
          }
        }
        api._frogHint = function () { MK.toast("💡 Perkataan " + current.w + " ada " + current.s + " suku kata — ketuk " + current.s + " kali!"); };
        setTimeout(speakWord, 500);
      }
      api.hint(function () { if (api._frogHint) api._frogHint(); });
      build();
    }
  });
})();
