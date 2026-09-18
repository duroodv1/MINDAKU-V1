/* ============================================================
   GAME 49 — OBJECT HUNT (Kreativiti & Digital)
   Cari objek tersembunyi dalam bilik, taman, rak mainan, kelas.
   Objek dijumpai: bercahaya, ditanda, masuk checklist.
   Tahap lanjut: clue siluet.
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "object-hunt",
    name: "Object Hunt",
    icon: "🔎",
    cat: "kreativiti",
    engine: "custom",
    sticker: "🗺️",
    desc: "Cari objek tersembunyi dalam pemandangan yang sibuk!",
    instruction: function (l, d) {
      return "Cari semua objek dalam senarai. Ketuk objek tersebut di dalam pemandangan. Teliti!"
    },
    startLevel: function (mount, api) {
      var scenes = MK.Data.list("questions", "objectHunt").scenes || [];
      var scene = scenes.length ? scenes[(api.level - 1) % scenes.length] : { label: "Cari", emoji: "🔎", props: ["📦", "🧸", "📚"], bg: "#F4EFE3", targets: ["🔑", "🎫", "🪀"] };
      var nTargets = Math.min(3 + Math.floor(api.level / 2), 6);
      if (api.diff === "mudah") nTargets = Math.max(2, nTargets - 1);
      var useSilhouette = api.diff === "cabaran" || api.level >= 7;
      var nFiller = 26 + api.level * 2 + (api.diff === "cabaran" ? 10 : 0);

      var targets = MK.Gen.sample(scene.targets, nTargets);
      var filler = [];
      for (var i = 0; i < nFiller; i++) filler.push(MK.Gen.pick(scene.props));
      var cells = MK.Gen.shuffle(filler.concat(targets));
      var found = {};

      mount.innerHTML = "";
      mount.appendChild(MK.el("div", "prompt small", "Cari dalam: <b>" + scene.label + "</b> " + scene.emoji));

      /* senarai semak */
      var check = MK.el("div", "row center wrap");
      check.style.cssText = "gap:6px;flex-wrap:wrap";
      targets.forEach(function (t) {
        var c = MK.el("div", "chip");
        c.dataset.t = t;
        c.innerHTML = useSilhouette
          ? '<span class="em" style="filter:grayscale(1);opacity:.55">' + t + "</span><span>?</span>"
          : '<span class="em">' + t + "</span>";
        check.appendChild(c);
      });
      mount.appendChild(check);

      /* pemandangan */
      var board = MK.el("div", "row wrap");
      board.style.cssText = "background:" + (scene.bg || "#F4EFE3") + ";border-radius:16px;padding:10px;gap:2px;justify-content:center";
      cells.forEach(function (em, idx) {
        var c = MK.el("button", "bcell");
        c.style.cssText = "width:44px;height:44px;font-size:1.35rem;background:transparent;border:none;border-radius:8px;display:flex;align-items:center;justify-content:center";
        c.textContent = em;
        c.setAttribute("aria-label", "objek");
        c.addEventListener("click", function () {
          if (c.dataset.done) return;
          if (targets.indexOf(em) >= 0 && !found[em]) {
            found[em] = true;
            c.dataset.done = "1";
            c.style.background = "#FFF3D6";
            c.style.boxShadow = "0 0 0 3px #F0BE4D";
            c.classList.add("found-pop");
            api.sfx("star");
            var chip = check.querySelector('[data-t="' + em + '"]');
            if (chip) chip.innerHTML = '<span class="em">' + em + "</span><span>✔</span>";
            var n = Object.keys(found).length;
            api.progress(n, targets.length);
            if (n >= targets.length) {
              api.sfx("win");
              api.feedback(true, "Semua objek dijumpai! Mata helang anda! 🦅");
              setTimeout(function () { api.complete({ mistakes: api._ohMistakes || 0 }); }, 1000);
            } else {
              api.feedback(true, "Jumpa! " + (targets.length - n) + " lagi.");
            }
          } else if (targets.indexOf(em) >= 0) {
            // sudah dijumpai melalui sel lain yang sama
            api.sfx("tap");
          } else {
            api._ohMistakes = (api._ohMistakes || 0) + 1;
            c.classList.add("shake-soft");
            setTimeout(function () { c.classList.remove("shake-soft"); }, 500);
            api.sfx("retry");
            api.feedback(false, "Bukan yang itu — cari objek dalam senarai!");
          }
        });
        board.appendChild(c);
      });
      mount.appendChild(board);

      api.hint(function () {
        var missing = targets.filter(function (t) { return !found[t]; });
        if (missing.length) {
          MK.toast("💡 Cari: " + (useSilhouette ? "objek dengan bentuk " + missing[0] : missing[0]) + " — ia berada di suatu tempat!");
        }
      });
      api._ohMistakes = 0;
      api.progress(0, targets.length);
    }
  });
})();
