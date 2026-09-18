/* ============================================================
   GAME 10 — LISTEN & SPELL (Auditori & Fonologi)
   Dengar perkataan, kemudian pilih huruf mengikut urutan betul.
   Contoh: BOLA → B → O → L → A.
   ============================================================ */
"use strict";
(function () {
  var ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  MK.registerGame({
    id: "listen-spell",
    name: "Listen & Spell",
    icon: "🔤",
    cat: "auditori",
    engine: "custom",
    sticker: "✍️",
    desc: "Dengar perkataan dan pilih huruf mengikut urutan yang betul.",
    instruction: function (l, d) {
      return "Dengar perkataan, kemudian ketuk huruf satu demi satu mengikut urutan ejaan yang betul.";
    },
    startLevel: function (mount, api) {
      var perLevel = api.diff === "mudah" ? 3 : 4;
      var tIdx = 0, mistakes = 0;
      var bank = MK.Data.list("vocabulary", "spell");
      var maxLen = api.level <= 2 ? 4 : api.level <= 4 ? 5 : api.level <= 6 ? 6 : api.level <= 8 ? 7 : 9;
      var pool = bank.filter(function (w) { return w.w.length <= maxLen && w.w.length >= 3; });
      if (api.diff === "cabaran") pool = bank.filter(function (w) { return w.w.length >= 5; });
      if (!pool.length) pool = bank;
      var current = null, typed = [];

      function build() {
        current = MK.Gen.pickAvoid(pool, (api.ctx.recentWords = api.ctx.recentWords || []));
        api.ctx.recentWords.push(current.w);
        if (api.ctx.recentWords.length > 6) api.ctx.recentWords.shift();
        typed = [];

        mount.innerHTML = "";
        mount.appendChild(MK.el("div", "prompt small", "Eja perkataan yang anda dengar (" + (tIdx + 1) + "/" + perLevel + ")"));

        var top = MK.el("div", "row center wrap");
        var listen = MK.el("button", "btn", "🔊 Dengar Perkataan");
        listen.addEventListener("click", function () { speakWord(); });
        var emojiHint = MK.el("div", "chip", current.e + " petunjuk");
        top.appendChild(listen);
        if (api.diff === "mudah") top.appendChild(emojiHint);
        mount.appendChild(top);

        /* baris ejaan */
        var spellRow = MK.el("div", "order-slots");
        spellRow.style.minHeight = "62px";
        mount.appendChild(spellRow);

        function renderSpell() {
          spellRow.innerHTML = "";
          for (var i = 0; i < current.w.length; i++) {
            var ch = typed[i] ? typed[i] : "•";
            spellRow.appendChild(MK.el("div", "oslot", '<span style="font-size:1.3rem">' + ch + "</span>"));
          }
        }

        /* huruf pilihan: huruf perkataan + pengganggu */
        var nDis = api.diff === "mudah" ? 0 : api.diff === "cabaran" ? 4 : 2;
        var letters = current.w.split("");
        var extra = MK.Gen.sample(ALPHABET.filter(function (a) { return letters.indexOf(a) < 0; }), nDis);
        var opts = MK.Gen.shuffle(letters.concat(extra));
        var grid = MK.el("div", "choices");
        opts.forEach(function (L, i) {
          var b = MK.el("button", "choice", '<span class="cem">' + L + "</span>");
          b.style.minHeight = "64px";
          b.addEventListener("click", function () {
            var need = current.w[typed.length];
            if (L === need) {
              typed.push(L);
              api.sfx("pop");
              renderSpell();
              if (typed.length === current.w.length) {
                api.sfx("win");
                api.feedback(true, current.w + " — ejaan tepat!");
                MK.TTS.speak(current.w);
                tIdx++; api.progress(tIdx, perLevel);
                setTimeout(function () {
                  if (tIdx >= perLevel) api.complete({ mistakes: mistakes }); else build();
                }, 1200);
              }
            } else {
              mistakes++;
              b.classList.add("shake-soft");
              setTimeout(function () { b.classList.remove("shake-soft"); }, 500);
              api.sfx("retry");
              api.feedback(false, "Belum tepat. Huruf seterusnya ialah bunyi “" + current.w[typed.length] + "”.");
            }
          });
          grid.appendChild(b);
        });
        mount.appendChild(grid);
        renderSpell();

        function speakWord() {
          var ok = MK.TTS.speak(current.w + ". " + current.w.split("").join("... "));
          if (!ok) {
            MK.toast("📖 Suara tidak tersedia — permainan bacaan: lihat perkataan 3 saat!");
            var flash = MK.el("div", "sub-prompt", "<b style='font-size:1.4rem'>" + current.w + "</b>");
            spellRow.replaceWith(flash);
            setTimeout(function () { flash.replaceWith(spellRow); renderSpell(); }, 2600);
          }
        }
        api._spellHint = function () {
          MK.toast("💡 Huruf seterusnya ialah “" + current.w[typed.length] + "”");
        };
        setTimeout(speakWord, 500);
      }
      api.hint(function () { if (api._spellHint) api._spellHint(); });
      build();
    }
  });
})();
