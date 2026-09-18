/* ============================================================
   GAME 33 — COLOR LAB (Sains & Dunia)
   Campurkan warna: primer → sekunder → tertier.
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "color-lab",
    name: "Color Lab",
    icon: "🎨",
    cat: "sains",
    engine: "custom",
    sticker: "🧪",
    desc: "Campurkan warna primer untuk menghasilkan warna baharu!",
    instruction: function (l, d) {
      return "Pilih dua warna untuk dicampur, kemudian tekan CAMPUR dan lihat hasilnya!";
    },
    startLevel: function (mount, api) {
      var data = MK.Data.bank("questions").colors || {};
      var primary = data.primary || [];
      var secondary = data.secondary || [];
      var tertiary = data.tertiary || [];
      var perLevel = 4, tIdx = 0, mistakes = 0;
      var phase = api.level <= 4 ? "secondary" : api.level <= 7 ? "secondary" : "all";
      var allowTertiary = api.level >= 5 && api.diff !== "mudah";

      function build() {
        // sasaran
        var pool = allowTertiary && MK.Gen.chance(0.5) && tertiary.length ? tertiary : secondary;
        var target = MK.Gen.pick(pool);
        mount.innerHTML = "";
        mount.appendChild(MK.el("div", "prompt small", "Buat warna: <b>" + target.label + "</b> (" + (tIdx + 1) + "/" + perLevel + ")"));

        var swatch = MK.el("div", null);
        swatch.style.cssText = "width:110px;height:110px;border-radius:50%;margin:6px auto;background:conic-gradient(" +
          primary.map(function (p) { return p.hex; }).join(",") + "," + primary[0].hex + ");border:4px solid #fff;box-shadow:var(--shadow)";
        var targetDot = MK.el("div", null);
        targetDot.style.cssText = "width:64px;height:64px;border-radius:50%;margin:6px auto;background:" + target.hex + ";border:3px solid #fff;box-shadow:0 0 0 2px var(--line)";
        mount.appendChild(targetDot);
        mount.appendChild(MK.el("div", "sub-prompt", "Sasaran"));

        var sel = [];
        var opts = primary.concat(api.diff === "mudah" ? [] : secondary.slice(0, 3));
        var grid = MK.el("div", "tool-row");
        opts.forEach(function (c) {
          var b = MK.el("button", "swatch" + (sel.indexOf(c) >= 0 ? " sel" : ""));
          b.style.background = c.hex;
          b.setAttribute("aria-label", c.label);
          b.addEventListener("click", function () {
            MK.Audio.sfx("tap");
            var i = sel.indexOf(c);
            if (i >= 0) { sel.splice(i, 1); b.classList.remove("sel"); }
            else {
              if (sel.length >= 2) { MK.toast("Dua warna sahaja setiap campuran 🙂"); return; }
              sel.push(c); b.classList.add("sel");
            }
            mixBtn.disabled = sel.length !== 2;
          });
          grid.appendChild(b);
        });
        mount.appendChild(grid);

        var result = MK.el("div", "sub-prompt", "");
        mount.appendChild(result);
        var mixBtn = MK.el("button", "btn primary big", "🧪 CAMPUR!");
        mixBtn.disabled = true;
        mixBtn.addEventListener("click", function () {
          var ids = sel.map(function (s) { return s.id; }).sort();
          var ok = ids.join("+") === target.mix.slice().sort().join("+");
          var mixed = ok ? target : findMix(ids);
          result.innerHTML = "<span class='dot' style='display:inline-block;width:38px;height:38px;border-radius:50%;vertical-align:middle;background:" + mixed.hex + ";border:2px solid #fff;box-shadow:0 0 0 2px var(--line)'></span> " +
            (ok ? "<b>Itulah dia — " + mixed.label + "!</b>" : "Anda dapat <b>" + mixed.label + "</b>. Cuba lagi!");
          if (ok) {
            api.sfx("good"); api.feedback(true, mixed.label + " = " + sel.map(function (s) { return s.label; }).join(" + "));
            tIdx++; api.progress(tIdx, perLevel);
            setTimeout(function () {
              if (tIdx >= perLevel) api.complete({ mistakes: mistakes }); else build();
            }, 1200);
          } else {
            mistakes++;
            api.sfx("retry"); api.feedback(false);
          }
        });
        mount.appendChild(mixBtn);

        function findMix(ids) {
          var all = secondary.concat(tertiary);
          var found = all.find(function (c) { return c.mix.slice().sort().join("+") === ids.join("+"); });
          if (found) return found;
          return { label: "warna baharu", hex: "#C9C0AF", mix: ids };
        }
      }
      api.hint(function () {
        var lbl = mount.querySelector(".prompt.small");
        var tname = lbl ? lbl.textContent.replace("Buat warna:", "").trim().split("(")[0].trim() : "";
        var all = secondary.concat(tertiary);
        var t = all.find(function (c) { return c.label.toUpperCase() === tname.toUpperCase(); });
        if (t) MK.toast("💡 Cuba mula dengan warna " + t.mix[0] + "!");
        else MK.toast("💡 Campurkan dua warna primer: merah + kuning = oren, kuning + biru = hijau, merah + biru = ungu!");
      });
      build();
    }
  });
})();
