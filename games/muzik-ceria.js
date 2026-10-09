/* ============================================================
   GAME 53 — MUZIK CERIA (Auditori & Fonologi)
   Tekan alat muzik maya (dram, piano, loceng, marakas) untuk
   menghasilkan bunyi. Mod "Main Bebas" + mod "Ikut Irama".
   Kawalan kelantangan, butang senyap dan ulangi bunyi.
   ============================================================ */
"use strict";
(function () {
  /* nota piano (Hz): C4 D4 E4 G4 A4 */
  var NOTA = [262, 294, 330, 392, 440];
  var NAMA_NOTA = ["Do", "Re", "Mi", "Sol", "La"];

  MK.registerGame({
    id: "muzik-ceria",
    name: "Muzik Ceria",
    icon: "🎵",
    cat: "auditori",
    engine: "custom",
    sticker: "🎶",
    desc: "Tekan alat muzik maya untuk menghasilkan bunyi dan ikuti corak irama yang seronok!",
    allowTimer: false,
    instruction: function (l, d) {
      return "Mod Bebas: tekan mana-mana alat muzik! Mod Ikut Irama: dengar corak bunyi, kemudian tekan alat muzik mengikut urutan yang sama.";
    },
    startLevel: function (mount, api) {
      var ALAT = [
        { id: "dram", nama: "Dram", emoji: "🥁", main: function () { api.sfx("drum"); } },
        { id: "piano", nama: "Piano", emoji: "🎹", main: function (notaIdx) { MK.Audio.playFreq(NOTA[notaIdx != null ? notaIdx : Math.floor(Math.random() * NOTA.length)], 0.5); } },
        { id: "loceng", nama: "Loceng", emoji: "🔔", main: function () { api.sfx("chime"); } },
        { id: "marakas", nama: "Marakas", emoji: "🎵", main: function () { api.sfx("coin"); } }
      ];
      var mod = "bebas";
      var jumlahPusingan = 3, pusinganSiap = 0, kesilapan = 0;
      var corak = [], langkahPemain = 0, fasa = "dengar"; /* dengar | main | tunggu */
      var timerMain = null, volLama = null, senyap = false;

      mount.innerHTML = "";
      var promptEl = MK.el("div", "prompt small", "");
      mount.appendChild(promptEl);

      function kemaskiniPrompt() {
        if (mod === "bebas") promptEl.innerHTML = "🎵 Mod Bebas — tekan alat muzik dan cipta irama anda sendiri!";
        else promptEl.innerHTML = "🎧 Mod Ikut Irama — Pusingan " + (pusinganSiap + 1) + "/" + jumlahPusingan + " — <b>" + (fasa === "dengar" ? "Dengar dengan teliti…" : fasa === "main" ? "Giliran anda! Ulang corak bunyi 🎯" : "Sedia…") + "</b>";
      }

      /* ---------- baris alat muzik ---------- */
      var barisAlat = MK.el("div", "tool-row");
      var alatBtn = {};
      ALAT.forEach(function (a) {
        var b = MK.el("button", "alat-btn");
        b.innerHTML = '<span class="ab-emoji">' + a.emoji + '</span><span class="ab-nama">' + a.nama + "</span>";
        b.setAttribute("aria-label", "Main " + a.nama);
        b.addEventListener("click", function () { tekan(a); });
        alatBtn[a.id] = b;
        barisAlat.appendChild(b);
      });
      mount.appendChild(barisAlat);

      /* kekunci piano tambahan */
      var pianoRow = MK.el("div", "tool-row");
      pianoRow.appendChild(MK.el("div", "slabel", "🎹 Kekunci Piano"));
      var pianoKeys = MK.el("div", "piano-strip");
      NOTA.forEach(function (f, i) {
        var k = MK.el("button", "piano-key", NAMA_NOTA[i]);
        k.addEventListener("click", function () {
          MK.Audio.playFreq(f, 0.5);
          kilas(k);
          if (mod === "ikut" && fasa === "main") semak("piano", i);
        });
        pianoKeys.appendChild(k);
      });
      pianoRow.appendChild(pianoKeys);
      mount.appendChild(pianoRow);

      function kilas(el) {
        el.classList.remove("ab-kilas");
        void el.offsetWidth;
        el.classList.add("ab-kilas");
      }
      function tekan(a, notaIdx) {
        try { a.main(notaIdx); } catch (e) { }
        kilas(alatBtn[a.id]);
        if (mod === "ikut" && fasa === "main") semak(a.id, notaIdx);
      }

      /* ---------- mod ---------- */
      var modRow = MK.el("div", "tool-row");
      var btnBebas = MK.el("button", "pill on", "🎵 Main Bebas");
      var btnIkut = MK.el("button", "pill", "🎧 Ikut Irama");
      btnBebas.addEventListener("click", function () { tukarMod("bebas"); });
      btnIkut.addEventListener("click", function () { tukarMod("ikut"); });
      modRow.appendChild(btnBebas);
      modRow.appendChild(btnIkut);
      mount.appendChild(modRow);

      function tukarMod(m) {
        mod = m;
        api.sfx("tap");
        btnBebas.classList.toggle("on", m === "bebas");
        btnIkut.classList.toggle("on", m === "ikut");
        hentiCorak();
        if (m === "ikut") { pusinganSiap = 0; kesilapan = 0; api.progress(0, jumlahPusingan); mulaPusingan(); }
        else { fasa = "dengar"; kemaskiniPrompt(); api.progress(0, 1); }
      }

      /* ---------- kawalan bunyi ---------- */
      var kawalRow = MK.el("div", "tool-row");
      kawalRow.appendChild(MK.el("div", "slabel", "Kelantangan"));
      var slider = MK.el("input", "vol-slider");
      slider.type = "range";
      slider.min = "0"; slider.max = "100"; slider.value = "80";
      slider.addEventListener("input", function () {
        senyap = false;
        gunaVol(slider.value / 100);
      });
      kawalRow.appendChild(slider);
      var btnSenyap = MK.el("button", "tool-btn", "🔇 Senyap");
      btnSenyap.addEventListener("click", function () {
        senyap = !senyap;
        gunaVol(senyap ? 0 : slider.value / 100);
        btnSenyap.textContent = senyap ? "🔈 Nyala Bunyi" : "🔇 Senyap";
        api.sfx("tap");
      });
      var btnUlang = MK.el("button", "tool-btn", "🔁 Ulang Bunyi");
      btnUlang.addEventListener("click", function () {
        if (mod === "ikut" && corak.length) { hentiCorak(); mainCorak(); }
        else api.sfx("tap");
      });
      kawalRow.appendChild(btnSenyap);
      kawalRow.appendChild(btnUlang);
      mount.appendChild(kawalRow);

      function gunaVol(v) {
        if (volLama == null && MK.Audio.setVolume) { /* simpan lalai sekali */ }
        if (MK.Audio.setVolume) MK.Audio.setVolume(v * 0.3);
      }

      /* ---------- logik Ikut Irama ---------- */
      function panjangCorak() {
        var asas = 3 + Math.floor(api.level / 2);           /* 3..8 mengikut level */
        if (api.diff === "mudah") asas = Math.max(3, asas - 1);
        if (api.diff === "cabaran") asas = Math.min(8, asas + 1);
        return Math.min(8, asas);
      }
      function mulaPusingan() {
        fasa = "dengar";
        kemaskiniPrompt();
        corak = [];
        var n = panjangCorak();
        for (var i = 0; i < n; i++) {
          var a = ALAT[Math.floor(Math.random() * ALAT.length)];
          corak.push({ alat: a.id, nota: a.id === "piano" ? Math.floor(Math.random() * NOTA.length) : null });
        }
        timerMain = setTimeout(mainCorak, 900);
      }
      function mainCorak() {
        fasa = "tunggu";
        kemaskiniPrompt();
        var t = 500;
        corak.forEach(function (c, i) {
          timerMain = setTimeout(function () {
            var a = ALAT.filter(function (x) { return x.id === c.alat; })[0];
            if (a) { try { a.main(c.nota); } catch (e) { } kilas(alatBtn[a.id]); }
          }, t + i * 650);
        });
        timerMain = setTimeout(function () {
          fasa = "main";
          langkahPemain = 0;
          kemaskiniPrompt();
        }, t + corak.length * 650 + 350);
      }
      function semak(alatId, notaIdx) {
        if (fasa !== "main") return;
        var jangka = corak[langkahPemain];
        var betul = jangka && jangka.alat === alatId && (jangka.alat !== "piano" || jangka.nota === notaIdx || notaIdx == null);
        if (jangka && jangka.alat === "piano" && alatId === "piano" && notaIdx == null) betul = false; /* piano strip vs butang — terima mana-mana */
        if (betul) {
          langkahPemain++;
          if (langkahPemain >= corak.length) {
            fasa = "tunggu";
            pusinganSiap++;
            api.sfx("star");
            api.progress(pusinganSiap, jumlahPusingan);
            api.feedback(true, "Tepat! Irama diulang dengan betul 🎶");
            if (pusinganSiap >= jumlahPusingan) {
              api.sfx("win");
              setTimeout(function () { api.complete({ mistakes: kesilapan, stars: 3 }); }, 800);
            } else {
              timerMain = setTimeout(mulaPusingan, 1400);
            }
          }
        } else {
          kesilapan++;
          api.sfx("retry");
          api.feedback(false, "Hampir! Dengar semula corak bunyi dan cuba lagi — anda boleh! 💪");
          fasa = "tunggu";
          kemaskiniPrompt();
          timerMain = setTimeout(function () { fasa = "main"; langkahPemain = 0; kemaskiniPrompt(); }, 1200);
        }
      }
      function hentiCorak() {
        if (timerMain) { clearTimeout(timerMain); timerMain = null; }
      }

      api.onCleanup(function () {
        hentiCorak();
        if (MK.Audio.setVolume) MK.Audio.setVolume(null); /* pulangkan kelantangan lalai */
      });
      api.hint(function () {
        if (mod === "ikut") MK.toast("💡 Dengar baik-baik: dram berbunyi 'boom', loceng 'ting!', marakas 'cha-cha'!");
        else MK.toast("💡 Tekan 'Ikut Irama' untuk ujian pendengaran yang seronok!");
      });

      api.progress(0, 1);
      kemaskiniPrompt();
    }
  });
})();
