/* ============================================================
   GAME 52 — CIPTA CERITA (Bahasa & Literasi)
   Pilih watak, tempat dan objek — aplikasi bantu susun cerita
   pendek Bahasa Melayu dalam bentuk kad bergambar.
   Boleh baca (suara), ubah pilihan, dan tulis ayat sendiri.
   ============================================================ */
"use strict";
(function () {
  var WATAK = [
    { n: "Ali", e: "👦" }, { n: "Siti", e: "👧" }, { n: "Adik Iman", e: "🧒" },
    { n: "Robot Mikro", e: "🤖" }, { n: "Kucing Belang", e: "🐱" }, { n: "Anjing Comel", e: "🐶" },
    { n: "Arnab Pintar", e: "🐰" }, { n: "Nenek Aisyah", e: "👵" }
  ];
  var TEMPAT = [
    { n: "rumah nenek", e: "🏠" }, { n: "sekolah", e: "🏫" }, { n: "taman bunga", e: "🌷" },
    { n: "pantai", e: "🏖️" }, { n: "angkasa lepas", e: "🚀" }, { n: "hutan hijau", e: "🌳" },
    { n: "pasar malam", e: "🌃" }, { n: "zoo", e: "🦓" }
  ];
  var OBJEK = [
    { n: "peta ajaib", e: "🗺️" }, { n: "kotak misteri", e: "📦" }, { n: "bola bercahaya", e: "🔮" },
    { n: "buku mantera", e: "📖" }, { n: "kunci emas", e: "🗝️" }, { n: "topi terbang", e: "🎩" },
    { n: "beg ajaib", e: "🎒" }, { n: "lampu kecil", e: "🔋" }
  ];
  var MASALAH = [
    { n: "hujan turun dengan tiba-tiba", e: "🌧️" }, { n: "jambatan telah rosak", e: "🌉" },
    { n: "kawan tersesat", e: "🧭" }, { n: "objek itu tergelincir masuk longkang", e: "🕳️" },
    { n: "seekor haiwan besar menghalang laluan", e: "🐘" }, { n: "matahari hampir terbenam", e: "🌅" }
  ];
  var PENYELESAIAN = [
    { n: "meminta pertolongan seorang kawan", e: "🤝" }, { n: "mencipta alat daripada objek di sekeliling", e: "🔧" },
    { n: "berfikir dengan tenang dan mencari jalan lain", e: "💡" }, { n: "bekerjasama membina semula", e: "🏗️" },
    { n: "menunggu sehingga keadaan selamat", e: "⏳" }, { n: "memberanikan diri bertanya arah", e: "🙋" }
  ];

  MK.registerGame({
    id: "cipta-cerita",
    name: "Cipta Cerita",
    icon: "📖",
    cat: "bahasa",
    engine: "custom",
    sticker: "✍️",
    desc: "Pilih watak, tempat dan objek untuk membina cerita pendek anda sendiri!",
    instruction: function (l, d) {
      return "Pilih watak, tempat dan objek — cerita anda akan tersusun secara automatik. Baca, ubah, dan tulis ayat sendiri jika mahu!";
    },
    startLevel: function (mount, api) {
      var level = api.level;
      var gunaMasalah = level >= 3 || api.diff === "cabaran";
      var gunaPenyelesaian = level >= 5 || api.diff === "cabaran";
      var langkah = 0;
      var pilihan = { watak: null, tempat: null, objek: null, masalah: null, penyelesaian: null };
      var ayatSendiri = "";

      var langkahSenarai = ["watak", "tempat", "objek"];
      if (gunaMasalah) langkahSenarai.push("masalah");
      if (gunaPenyelesaian) langkahSenarai.push("penyelesaian");
      var BANK = { watak: WATAK, tempat: TEMPAT, objek: OBJEK, masalah: MASALAH, penyelesaian: PENYELESAIAN };
      var JUDUL = { watak: "Siapa watak cerita?", tempat: "Di mana cerita berlaku?", objek: "Objek apa ditemui?", masalah: "Apa masalahnya?", penyelesaian: "Bagaimana penyelesaiannya?" };

      mount.innerHTML = "";
      var promptEl = MK.el("div", "prompt small", "");
      mount.appendChild(promptEl);

      function kemaskiniPrompt() {
        promptEl.innerHTML = "📖 Langkah " + (langkah + 1) + "/" + langkahSenarai.length + " — " + JUDUL[langkahSenarai[Math.min(langkah, langkahSenarai.length - 1)]];
        api.progress(Math.min(langkah, langkahSenarai.length), langkahSenarai.length + 1);
      }

      function skrinPilih() {
        mount.innerHTML = "";
        mount.appendChild(promptEl);
        langkah = Math.min(langkah, langkahSenarai.length - 1);
        var kunci = langkahSenarai[langkah];
        kemaskiniPrompt();
        var kotak = MK.el("div", "story-grid");
        BANK[kunci].forEach(function (item) {
          var b = MK.el("button", "card-pick");
          b.innerHTML = '<span class="cp-emoji">' + item.e + '</span><span class="cp-nama">' + item.n + "</span>";
          b.addEventListener("click", function () {
            pilihan[kunci] = item;
            api.sfx("pop");
            langkah++;
            if (langkah >= langkahSenarai.length) skrinCerita();
            else skrinPilih();
          });
          kotak.appendChild(b);
        });
        mount.appendChild(kotak);
        /* butang balik jika bukan langkah pertama */
        if (langkah > 0) {
          var balik = MK.el("button", "tool-btn", "⬅️ Ubah Pilihan Sebelum Ini");
          balik.addEventListener("click", function () { api.sfx("tap"); langkah--; skrinPilih(); });
          mount.appendChild(balik);
        }
      }

      function binaCerita() {
        var w = pilihan.watak, t = pilihan.tempat, o = pilihan.objek;
        var kad = [];
        kad.push({ e: w.e, teks: MK.Gen.pick(["Pada suatu hari, " + w.n + " sedang berasa sangat gembira.", "Pada suatu pagi yang cerah, " + w.n + " bersiap untuk bermula.", "Semalam, " + w.n + " bangun dengan penuh semangat."]) });
        kad.push({ e: t.e, teks: MK.Gen.pick([w.n + " pun pergi ke " + t.n + ".", w.n + " berjalan jauh sehingga sampai ke " + t.n + ".", "Perjalanan membawa " + w.n + " ke " + t.n + "."]) });
        kad.push({ e: o.e, teks: MK.Gen.pick(["Di situ, " + w.n + " menemui " + o.n + "!", "Tiba-tiba, sesuatu bercahaya — ia ialah " + o.n + "!", w.n + " terkejut apabila menjumpai " + o.n + "!"]) });
        if (gunaMasalah && pilihan.masalah) {
          kad.push({ e: pilihan.masalah.e, teks: MK.Gen.pick(["Tetapi, " + pilihan.masalah.n + ".", "Nasib tidak menyebelahi — " + pilihan.masalah.n + ".", "Tiba-tiba ada masalah: " + pilihan.masalah.n + "."]) });
        }
        if (gunaPenyelesaian && pilihan.penyelesaian) {
          kad.push({ e: pilihan.penyelesaian.e, teks: MK.Gen.pick([w.n + " Bijak! Ia " + pilihan.penyelesaian.n + ".", w.n + " tidak putus asa — ia " + pilihan.penyelesaian.n + ".", "Dengan idea pintar, " + w.n + " " + pilihan.penyelesaian.n + "."]) });
        }
        kad.push({ e: "🌈", teks: MK.Gen.pick(["Akhirnya, " + w.n + " pulang dengan hati gembira. Tamat!", "Matahari terbenam, dan " + w.n + " tersenyum puas. Tamat!", "Itulah pengembaraan " + w.n + " yang tidak akan dilupakan. Tamat!"]) });
        if (ayatSendiri && ayatSendiri.trim()) {
          kad.push({ e: "✍️", teks: ayatSendiri.trim() });
        }
        return kad;
      }

      function skrinCerita() {
        mount.innerHTML = "";
        mount.appendChild(promptEl);
        api.progress(langkahSenarai.length, langkahSenarai.length + 1);
        promptEl.innerHTML = "📖 Cerita Anda Siap — <b>" + (pilihan.watak ? pilihan.watak.n : "") + " di " + (pilihan.tempat ? pilihan.tempat.n : "") + "</b>";
        var kad = binaCerita();
        var kotak = MK.el("div", "story-cards");
        kad.forEach(function (k, i) {
          var c = MK.el("div", "story-card");
          c.innerHTML = '<div class="sc-emoji">' + k.e + '</div><div class="sc-teks">' + MK.esc(k.teks) + "</div>";
          kotak.appendChild(c);
        });
        mount.appendChild(kotak);

        /* ruang tulis ayat sendiri */
        var tulisRow = MK.el("div", "tool-row");
        var ta = MK.el("textarea", "story-input");
        ta.rows = 2;
        ta.placeholder = "✍️ Tulis ayat anda sendiri untuk ditambah ke cerita (pilihan)…";
        ta.value = ayatSendiri;
        ta.addEventListener("input", function () { ayatSendiri = ta.value; });
        tulisRow.appendChild(ta);
        var tambah = MK.el("button", "tool-btn", "➕ Tambah Ayat Saya");
        tambah.addEventListener("click", function () {
          api.sfx("pop");
          skrinCerita();
        });
        tulisRow.appendChild(tambah);
        mount.appendChild(tulisRow);

        var actRow = MK.el("div", "tool-row");
        var baca = MK.el("button", "tool-btn", "🔊 Baca Cerita");
        baca.addEventListener("click", function () {
          api.sfx("tap");
          var teks = binaCerita().map(function (k) { return k.teks; }).join(" ");
          api.speak(teks);
          MK.toast("Cerita sedang dibaca… 🔊");
        });
        var ubah = MK.el("button", "tool-btn", "✏️ Ubah Pilihan");
        ubah.addEventListener("click", function () { api.sfx("tap"); langkah = 0; skrinPilih(); });
        var baharu = MK.el("button", "tool-btn", "🔄 Cipta Cerita Baharu");
        baharu.addEventListener("click", function () {
          api.sfx("flip");
          pilihan = { watak: null, tempat: null, objek: null, masalah: null, penyelesaian: null };
          ayatSendiri = "";
          langkah = 0;
          skrinPilih();
        });
        var simpan = MK.el("button", "tool-btn", "💾 Simpan Cerita");
        simpan.addEventListener("click", function () {
          try {
            var kad2 = binaCerita();
            var teks = kad2.map(function (k) { return k.e + " " + k.teks; }).join("  •  ");
            var sv = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#FDFBF5"/><rect x="16" y="16" width="368" height="268" rx="14" fill="#fff" stroke="#B9AF98" stroke-width="2"/><text x="200" y="52" text-anchor="middle" font-size="22" font-weight="800" fill="#33413F">📖 Cerita Saya</text>';
            var yy = 92;
            kad2.slice(0, 5).forEach(function (k) {
              sv += '<text x="40" y="' + yy + '" font-size="14" fill="#33413F">' + MK.esc(k.teks.length > 64 ? k.teks.slice(0, 61) + "…" : k.teks) + "</text>";
              yy += 30;
            });
            sv += '<text x="200" y="272" text-anchor="middle" font-size="12" fill="#6B7A78">MINDAKU • Cipta Cerita</text></svg>';
            MK.Gallery.saveSVG(sv, "cipta-cerita", "Cerita " + (pilihan.watak ? pilihan.watak.n : "Saya"))
              .then(function () { api.sfx("star"); MK.toast("Cerita disimpan ke Galeri! 📖⭐"); api.saveCreative(); })
              .catch(function () { MK.toast("Gagal disimpan — cerita anda tetap ada!"); });
          } catch (e) { MK.toast("Gagal disimpan — cerita anda tetap ada!"); }
        });
        var siap = MK.el("button", "btn primary", "✨ Cerita Siap!");
        siap.addEventListener("click", function () {
          api.sfx("win");
          api.feedback(true, "Cerita yang menarik! Kamu seorang penulis cilik! 📖");
          api.finishCreative("Status: Cerita '" + (pilihan.watak ? pilihan.watak.n : "") + " di " + (pilihan.tempat ? pilihan.tempat.n : "") + "' dicipta 📖");
        });
        actRow.appendChild(baca);
        actRow.appendChild(ubah);
        actRow.appendChild(baharu);
        actRow.appendChild(simpan);
        actRow.appendChild(siap);
        mount.appendChild(actRow);
        mount.appendChild(MK.el("div", "soft-note", "Tekan 'Tambah Ayat Saya' selepas menulis untuk kemas kini kad cerita."));
      }
      api.hint(function () {
        MK.toast("💡 Kombinasi lucu: Robot Mikro di pantai menemui topi terbang!");
      });

      skrinPilih();
    }
  });
})();
