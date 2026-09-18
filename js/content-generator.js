/* ============================================================
   MINDAKU V.1 — content-generator.js
   Muat data JSON (dengan bank sandaran jika gagal) + penjana
   kandungan prosedural: nombor, pola, perkataan, memori, maze,
   matematik, dsb. Kandungan baharu boleh ditambah melalui
   /data/*.json tanpa mengubah enjin permainan.
   ============================================================ */
"use strict";

/* ====================== MK.Data ====================== */
MK.Data = (function () {
  var FILES = {
    games: "games.json", vocabulary: "vocabulary.json", shapes: "shapes.json",
    sounds: "sounds.json", mathematics: "mathematics.json", patterns: "patterns.json",
    habitats: "habitats.json", routines: "routines.json", safety: "safety.json", questions: "questions.json"
  };
  var banks = {};
  var loadedOk = false;

  /* Bank sandaran minimum — digunakan hanya jika JSON gagal dimuatkan */
  var FALLBACK = {
    vocabulary: {
      words: [
        { w: "BUKU", e: "📚", cat: "sekolah" }, { w: "PENSEL", e: "✏️", cat: "sekolah" }, { w: "MEJA", e: "🪑", cat: "rumah" },
        { w: "BOLA", e: "⚽", cat: "permainan" }, { w: "EPAL", e: "🍎", cat: "makanan" }, { w: "NASI", e: "🍚", cat: "makanan" },
        { w: "KUCING", e: "🐱", cat: "haiwan" }, { w: "AYAM", e: "🐔", cat: "haiwan" }, { w: "IKAN", e: "🐟", cat: "haiwan" },
        { w: "BOTOL", e: "🍶", cat: "objek" }, { w: "PAYUNG", e: "☂️", cat: "objek" }, { w: "ROTI", e: "🍞", cat: "makanan" },
        { w: "SAPI", e: "🧼", cat: "objek" }, { w: "JAM", e: "⏰", cat: "objek" }, { w: "KERA", e: "🐵", cat: "haiwan" },
        { w: "POKOK", e: "🌳", cat: "alam" }, { w: "BUNGA", e: "🌸", cat: "alam" }, { w: "MATAHARI", e: "☀️", cat: "alam" },
        { w: "KERETA", e: "🚗", cat: "pengangkutan" }, { w: "BOT", e: "⛵", cat: "pengangkutan" }, { w: "TOPI", e: "🎩", cat: "pakaian" },
        { w: "KASUT", e: "👟", cat: "pakaian" }, { w: "BAJU", e: "👕", cat: "pakaian" }, { w: "SUSU", e: "🥛", cat: "makanan" }
      ],
      spell: [
        { w: "BOLA", e: "⚽" }, { w: "BUKU", e: "📚" }, { w: "MEJA", e: "🪑" }, { w: "ROTI", e: "🍞" },
        { w: "SUSU", e: "🥛" }, { w: "TOPI", e: "🎩" }, { w: "IKAN", e: "🐟" }, { w: "JAM", e: "⏰" },
        { w: "PAYUNG", e: "☂️" }, { w: "EPAL", e: "🍎" }, { w: "BUNGA", e: "🌸" }, { w: "POKOK", e: "🌳" }
      ],
      syllable: [
        { w: "BUKU", s: 2 }, { w: "MEJA", s: 2 }, { w: "ROTI", s: 2 }, { w: "KUCING", s: 2 }, { w: "BOLA", s: 2 },
        { w: "SAPI", s: 2 }, { w: "MATA", s: 2 }, { w: "GELAS", s: 2 }, { w: "TOPI", s: 2 },
        { w: "GAJAH", s: 2 }, { w: "AYAM", s: 2 }, { w: "TELEVISYEN", s: 4 }, { w: "BENDERA", s: 3 }, { w: "SEPATU", s: 3 },
        { w: "PERPUSTAKAAN", s: 4 }, { w: "MOTOSIKAL", s: 4 }, { w: "KERAJAAN", s: 3 }
      ],
      categories: {
        haiwan: { label: "Haiwan", emoji: "🐾", items: ["KUCING", "AYAM", "IKAN"] },
        makanan: { label: "Makanan", emoji: "🍎", items: ["NASI", "ROTI", "EPAL"] },
        pengangkutan: { label: "Pengangkutan", emoji: "🚗", items: ["KERETA", "BOT", "BAS"] }
      }
    },
    sounds: {
      items: [
        { id: "lembu", label: "Lembu", emoji: "🐄", cat: "haiwan", recipe: "moo" },
        { id: "burung", label: "Burung", emoji: "🐦", cat: "haiwan", recipe: "chirp" },
        { id: "kereta", label: "Kereta", emoji: "🚗", cat: "kenderaan", recipe: "engine" },
        { id: "siren", label: "Ambulan", emoji: "🚑", cat: "kenderaan", recipe: "siren" },
        { id: "hujan", label: "Hujan", emoji: "🌧️", cat: "alam", recipe: "rain" },
        { id: "ombak", label: "Ombak", emoji: "🌊", cat: "alam", recipe: "wave" },
        { id: "loceng", label: "Loceng", emoji: "🔔", cat: "objek", recipe: "bell" },
        { id: "dram", label: "Dram", emoji: "🥁", cat: "objek", recipe: "drum" }
      ],
      cats: { haiwan: { label: "Haiwan", emoji: "🐾" }, kenderaan: { label: "Kenderaan", emoji: "🚗" }, alam: { label: "Alam", emoji: "🌳" }, objek: { label: "Objek", emoji: "🔔" } }
    },
    shapes: {
      shapes: [
        { id: "bulatan", name: "Bulatan", emoji: "⭕", sides: 0, vertices: 0, dim: "2D" },
        { id: "segitiga", name: "Segi Tiga", emoji: "🔺", sides: 3, vertices: 3, dim: "2D" },
        { id: "segiempat", name: "Segi Empat Sama", emoji: "🟦", sides: 4, vertices: 4, dim: "2D" },
        { id: "pentagon", name: "Pentagon", emoji: "⬟", sides: 5, vertices: 5, dim: "2D" },
        { id: "heksagon", name: "Heksagon", emoji: "⬢", sides: 6, vertices: 6, dim: "2D" }
      ],
      solids: [
        { id: "kubus", name: "Kubus", emoji: "🧊", faces: 6, note: "Kubus mempunyai 6 permukaan." },
        { id: "sfera", name: "Sfera", emoji: "⚽", faces: 1, note: "Sfera bulat seperti bola." },
        { id: "silinder", name: "Silinder", emoji: "🥫", faces: 3, note: "Silinder seperti tin." },
        { id: "kon", name: "Kon", emoji: "🍦", faces: 2, note: "Kon seperti aiskrim." }
      ]
    },
    mathematics: {
      addMax: [10, 20, 50, 100, 200, 500], mulMax: [5, 10, 10, 12, 12, 12],
      picnic: [
        { "n": "Roti", "e": "🍞" }, { "n": "Epal", "e": "🍎" }, { "n": "Jus", "e": "🧃" },
        { "n": "Tikar", "e": "🧺" }, { "n": "Topi", "e": "👒" }, { "n": "Bola", "e": "⚽" },
        { "n": "Payung", "e": "☂️" }, { "n": "Kamera", "e": "📷" }, { "n": "Kuih", "e": "🥮" }, { "n": "Pisang", "e": "🍌" }
      ],
      recipe: [
        { "n": "Roti", "e": "🍞" }, { "n": "Telur", "e": "🥚" }, { "n": "Keju", "e": "🧀" },
        { "n": "Sayur", "e": "🥬" }, { "n": "Tomato", "e": "🍅" }, { "n": "Ayam", "e": "🍗" },
        { "n": "Nasi", "e": "🍚" }, { "n": "Susu", "e": "🥛" }, { "n": "Madu", "e": "🍯" }, { "n": "Coklat", "e": "🍫" }
      ],
      shopping: {
        scenarios: [
          { "s": "Sekolah esok! Pilih barang yang anda PERLU.", "essentials": ["Buku", "Pensel"], "others": ["Mainan kereta", "Gula-gula"] }
        ],
        items: [
          { "n": "Buku", "e": "📚", "p": 4 }, { "n": "Pensel", "e": "✏️", "p": 2 },
          { "n": "Payung", "e": "☂️", "p": 7 }, { "n": "Mainan kereta", "e": "🏎️", "p": 7 },
          { "n": "Gula-gula", "e": "🍬", "p": 1 }, { "n": "Bola", "e": "⚽", "p": 6 }
        ]
      }
    },
    patterns: { attrs: { warna: ["🔴", "🔵", "🟡", "🟢"], bentuk: ["⭐", "❤️", "🔺", "⬤"] } },
    habitats: {
      habitats: [
        { id: "laut", label: "Laut", emoji: "🌊", animals: ["IKAN PAUS", "IKAN YU", "KETAM"] },
        { id: "hutan", label: "Hutan", emoji: "🌳", animals: ["HARIMAU", "GAJAH", "MONYET"] },
        { id: "padangpasir", label: "Padang Pasir", emoji: "🏜️", animals: ["UNTA", "KALA JENGKING", "ULAT PASIR"] },
        { id: "artik", label: "Artik", emoji: "🧊", animals: ["BERUANG KUTUB", "PINGUIN", "ANJING LAUT"] },
        { id: "sungai", label: "Sungai", emoji: "🏞️", animals: ["BUAYA", "IKAN HARUAN", "UDANG"] }
      ],
      weather: [
        { id: "cerah", label: "Cerah", emoji: "☀️", wear: ["Topi"], notWear: ["Kot tebal"], activity: ["Bermain di taman"], notActivity: ["Tidur sepanjang hari"], why: "Hari cerah panas — lindungi diri daripada matahari." },
        { id: "hujan", label: "Hujan", emoji: "🌧️", wear: ["Payung"], notWear: ["Baju nipis"], activity: ["Membaca di rumah"], notActivity: ["Bermain di luar"], why: "Hujan basah — payung membantu kita kering." },
        { id: "ribut", label: "Ribut", emoji: "⛈️", wear: ["Kekal di dalam rumah"], notWear: ["Payung besar di luar"], activity: ["Mewarna"], notActivity: ["Berbasikal"], why: "Ribut berbahaya — selamatkan diri di dalam rumah." }
      ],
      plants: [
        { id: "akar", label: "Akar", emoji: "🌿", func: "Menyerap air dari tanah" },
        { id: "batang", label: "Batang", emoji: "🪵", func: "Menyokong tumbuhan" },
        { id: "daun", label: "Daun", emoji: "🍃", func: "Membuat makanan dengan cahaya matahari" },
        { id: "bunga", label: "Bunga", emoji: "🌸", func: "Menjadi buah selepas pendebungaan" },
        { id: "buah", label: "Buah", emoji: "🍎", func: "Menyimpan biji" }
      ],
      planets: [
        { id: "merkurius", label: "Merkurius", color: "#B7AFA6", size: 6, ring: false, fact: "Planet paling hampir dengan Matahari." },
        { id: "bumi", label: "Bumi", color: "#4C90D9", size: 11, ring: false, fact: "Planet kita." },
        { id: "musytari", label: "Musytari", color: "#D9A066", size: 22, ring: true, fact: "Planet terbesar." },
        { id: "neptun", label: "Neptun", color: "#4C6FD9", size: 14, ring: false, fact: "Planet paling jauh." }
      ]
    },
    routines: {
      sets: [
        { name: "Pagi", steps: ["Bangun tidur", "Mandi", "Gosok gigi", "Sarapan", "Pakai baju sekolah", "Pergi sekolah"], distractors: ["Bermain bola", "Menonton TV", "Makan malam"] },
        { name: "Petang", steps: ["Balik sekolah", "Tukar baju", "Makan bekal", "Rehat", "Buat kerja rumah", "Bermain"], distractors: ["Gosok gigi", "Tidur", "Sarapan"] }
      ],
      room: {
        zones: [
          { id: "rakbuku", label: "Rak Buku", emoji: "📚" },
          { id: "almari", label: "Almari", emoji: "🚪" },
          { id: "rakkasut", label: "Rak Kasut", emoji: "👟" },
          { id: "kotakmainan", label: "Kotak Mainan", emoji: "🧸" }
        ],
        items: [
          { "n": "Buku cerita", "e": "📚", "zone": "rakbuku" },
          { "n": "Buku latihan", "e": "📒", "zone": "rakbuku" },
          { "n": "Baju", "e": "👕", "zone": "almari" },
          { "n": "Seluar", "e": "👖", "zone": "almari" },
          { "n": "Kasut sekolah", "e": "👟", "zone": "rakkasut" },
          { "n": "Selipar", "e": "🩴", "zone": "rakkasut" },
          { "n": "Patung beruang", "e": "🧸", "zone": "kotakmainan" },
          { "n": "Bola", "e": "⚽", "zone": "kotakmainan" }
        ]
      },
      schoolbag: {
        scenarios: [
          { "s": "Esok hari sekolah biasa. Apa yang perlu dibawa?", "essentials": ["Buku teks", "Pensel", "Botol air"], "distractors": ["Mainan kereta", "Bola sepak", "Komik"] }
        ],
        items: [
          { "n": "Buku teks", "e": "📚" }, { "n": "Pensel", "e": "✏️" }, { "n": "Botol air", "e": "🍶" },
          { "n": "Bekal makan", "e": "🥪" }, { "n": "Mainan kereta", "e": "🏎️" }, { "n": "Bola sepak", "e": "⚽" }, { "n": "Komik", "e": "📕" }
        ]
      }
    },
    safety: {
      safeUnsafe: [
        { s: "Bermain jauh daripada kolam ketika tiada orang dewasa", safe: true, why: "Keselamatan diri penting — tunggu orang dewasa bersama kita di kolam." },
        { s: "Menyentuh wayar elektrik yang terdedah", safe: false, why: "Wayar elektrik berbahaya. Beritahu orang dewasa dengan segera." }
      ],
      askFirst: [
        { s: "Anda mahu meminjam pensel rakan sekelas", correct: "Boleh saya pinjam pensel awak?", wrong: ["Beri saya pensel awak!", "Ambil sahaja pensel itu"] }
      ],
      whatDo: [
        { s: "Anda ternampak kaca pecah di lantai sekolah", options: [{ t: "Beritahu cikgu dengan segera", best: true, why: "Orang dewasa boleh membersihkannya dengan selamat." }, { t: "Sentuh kaca itu", best: false, why: "Kaca pecah boleh melukakan tangan kita." }, { t: "Buat-buat tidak nampak", best: false, why: "Orang lain mungkin tercedera. Beritahu orang dewasa." }] }
      ],
      road: [
        { q: "Apa yang perlu dilakukan sebelum melintas jalan?", choices: ["Lihat kiri dan kanan", "Terus berlari merentas", "Main telefon"], answer: 0 }
      ],
      personalSpace: [
        { s: "Ibu ingin memeluk anda goodbye", who: "keluarga", answer: "dekat", why: "Keluarga terdekat boleh berada hampir." },
        { s: "Kawan baik ingin berbual dengan anda", who: "kawan", answer: "sederhana", why: "Kawan berada pada jarak kira-kira satu lengan." },
        { s: "Orang baharu dikenali ingin berbual", who: "baru", answer: "jauh", why: "Dengan orang baru, jarak lebih jauh lebih selesa dan sopan." }
      ]
    },
    questions: {
      analogies: [
        { a: "Panas", b: "Matahari", c: "Sejuk", d: "Air batu" },
        { a: "Basah", b: "Hujan", c: "Kering", d: "Matahari" }
      ],
      oddOne: [
        { items: ["🍎", "🍌", "🍊", "🚗"], odd: "🚗", why: "Kereta bukan makanan." }
      ],
      sentences: [
        { words: ["Ali", "makan", "nasi"], display: "Ali makan nasi." },
        { words: ["Kami", "bermain", "bola", "di padang"], display: "Kami bermain bola di padang." }
      ],
      logic: [
        { type: "size", text: "Ali lebih tinggi daripada Abu. Abu lebih tinggi daripada Bakar. Siapa paling tinggi?", names: ["Ali", "Abu", "Bakar"], answer: "Ali" }
      ],
      weather: [
        { id: "cerah", label: "Cerah", emoji: "☀️", wear: ["Topi", "Cermin mata hitam", "Baju selesa"], activity: ["Bermain di taman", "Mengayuh basikal"], notWear: ["Payung"], notActivity: ["Tidur sepanjang hari"] }
      ],
      plants: [
        { id: "akar", label: "Akar", emoji: "🌿", func: "Menyerap air dan zat dari tanah" }
      ],
      planets: [
        { id: "merkurius", label: "Merkurius", color: "#B7AFA6", size: 6, ring: false, fact: "Planet paling hampir dengan Matahari" },
        { id: "bumi", label: "Bumi", color: "#4C90D9", size: 11, ring: false, fact: "Planet kita" },
        { id: "musytari", label: "Musytari", color: "#D9A066", size: 22, ring: true, fact: "Planet terbesar" },
        { id: "neptun", label: "Neptun", color: "#4C6FD9", size: 14, ring: false, fact: "Planet paling jauh" }
      ],
      colors: {
        primary: [
          { id: "merah", label: "Merah", hex: "#E05252", emoji: "🔴" },
          { id: "kuning", label: "Kuning", hex: "#F0C93B", emoji: "🟡" },
          { id: "biru", label: "Biru", hex: "#4C7FD9", emoji: "🔵" }
        ],
        secondary: [
          { id: "oren", label: "Oren", mix: ["merah", "kuning"], hex: "#E8833A" },
          { id: "hijau", label: "Hijau", mix: ["kuning", "biru"], hex: "#5FA97C" },
          { id: "ungu", label: "Ungu", mix: ["merah", "biru"], hex: "#8A5FBF" }
        ],
        tertiary: [
          { id: "oren-merah", label: "Oren Kemerahan", mix: ["merah", "oren"], hex: "#DD6B4F" },
          { id: "hijau-kuningan", label: "Hijau Kekuningan", mix: ["kuning", "hijau"], hex: "#9BBD5F" }
        ]
      },
      objectHunt: {
        scenes: [
          { id: "bilik", label: "Bilik Tidur", emoji: "🛏️", props: ["🛏️", "🪑", "🪟", "🧸", "📚", "👕"], bg: "#F4EFE3", targets: ["🧸", "📚", "🎫", "🔑", "🪀"] },
          { id: "taman", label: "Taman", emoji: "🌳", props: ["🌳", "🌻", "🦋", "🐦", "🍄", "🪨"], bg: "#E8F0E0", targets: ["🦋", "🐦", "🍄", "🐞", "🦆"] }
        ]
      },
      colors: [
        { mix: ["merah", "kuning"], result: "oren", hex: "#E8833A" }
      ]
    },
    games: {}
  };

  function init() {
    var base = (location.href.replace(/[^/]*$/, "")) + "data/";
    var names = Object.keys(FILES);
    return Promise.allSettled(names.map(function (n) {
      return fetch(base + FILES[n], { cache: "no-cache" }).then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      }).then(function (j) { banks[n] = j; });
    })).then(function (results) {
      loadedOk = results.some(function (r) { return r.status === "fulfilled"; });
      results.forEach(function (r, i) {
        if (r.status !== "fulfilled") {
          console.warn("Data tidak dimuat (guna sandaran):", names[i]);
          banks[names[i]] = FALLBACK[names[i]] || {};
        }
      });
      return banks;
    }).catch(function () {
      names.forEach(function (n) { if (!banks[n]) banks[n] = FALLBACK[n] || {}; });
      return banks;
    });
  }

  /* Ambil bank; gabungkan sandaran sebagai asas jika tiada */
  function bank(name) {
    if (banks[name]) return banks[name];
    if (FALLBACK[name]) return FALLBACK[name];
    return {};
  }
  /* Ambil senarai dari laluan titik, gabung dengan sandaran */
  function list(name, path) {
    var b = bank(name);
    var parts = path.split(".");
    var v = b;
    for (var i = 0; i < parts.length; i++) { if (v == null) break; v = v[parts[i]]; }
    if (v && v.length) return v;
    var f = FALLBACK[name]; v = f;
    for (var j = 0; j < parts.length; j++) { if (v == null) break; v = v[parts[j]]; }
    return v || [];
  }

  return { init: init, bank: bank, list: list, isLoaded: function () { return loadedOk; } };
})();

/* ====================== MK.Gen ====================== */
MK.Gen = (function () {
  function ri(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function sample(arr, n) { return shuffle(arr).slice(0, Math.max(0, Math.min(n, arr.length))); }
  function chance(p) { return Math.random() < p; }

  /* Elak berulang: pilih item yang tiada dalam 'recent' */
  function pickAvoid(arr, recent, maxTry) {
    if (!arr.length) return null;
    if (!recent || !recent.length) return pick(arr);
    for (var i = 0; i < (maxTry || 12); i++) {
      var c = pick(arr);
      if (recent.indexOf(c) < 0) return c;
    }
    return pick(arr);
  }

  /* Skala kesukaran: level 1..10, diff 0/1/2 → faktor 0..1 + bonus */
  function diffScale(level, diff) {
    var d = diff === "mudah" ? 0 : diff === "cabaran" ? 2 : 1;
    return Math.max(0, Math.min(1, (level - 1) / 9 + d * 0.16 - 0.05));
  }

  /* Pilihan jawapan salah yang munasabah untuk nombor */
  function numChoices(correct, spread, count, opts) {
    var set = [correct];
    var guard = 0;
    while (set.length < count && guard++ < 60) {
      var delta = ri(1, spread) * (chance(0.5) ? 1 : -1);
      var v = correct + delta;
      if (v >= (opts && opts.min != null ? opts.min : 0) && set.indexOf(v) < 0) set.push(v);
    }
    while (set.length < count) set.push(correct + set.length + 1);
    return set.map(String);
  }

  /* Perkataan → bilangan suku kata (kira kumpulan vokal BM) */
  function syllables(word) {
    var w = String(word).toUpperCase().replace(/[^A-Z]/g, "");
    var m = w.match(/[AEIOU]+/g);
    if (!m) return 1;
    return m.length;
  }

  /* Ayat → perkataan */
  function words(sentence) { return String(sentence).trim().split(/\s+/); }

  return { ri: ri, pick: pick, shuffle: shuffle, sample: sample, chance: chance, pickAvoid: pickAvoid, diffScale: diffScale, numChoices: numChoices, syllables: syllables, words: words };
})();
