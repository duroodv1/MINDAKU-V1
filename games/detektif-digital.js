/* ============================================================
   GAME 55 — DETEKTIF DIGITAL (Sosial & Keselamatan)
   Kenal pasti maklumat peribadi dan buat pilihan selamat
   ketika menggunakan internet. Penerangan ringkas selepas
   setiap jawapan. Prinsip keselamatan internet untuk kanak-
   kanak — nada mesra, tidak menakutkan.
   ============================================================ */
"use strict";
(function () {
  /* Bank situasi digital: 1 jawapan selamat + 2 kurang selamat */
  var BANK = [
    { s: "Orang yang tidak anda kenali dalam permainan dalam talian bertanya: 'Di mana rumah kamu?'",
      pilih: [
        { t: "Beritahu alamat supaya boleh berjumpa", ok: false },
        { t: "Jangan beri alamat — beritahu ibu bapa atau penjaga", ok: true },
        { t: "Berikan alamat kawan pula", ok: false } ],
      why: "Alamat rumah ialah maklumat peribadi. Jangan sesekali kongsi dengan orang tidak dikenali dalam talian — beritahu ibu bapa atau penjaga terus." },
    { s: "Rakan baik anda minta kata laluan akaun permainan anda: 'Kita kawan, tak apa kan?'",
      pilih: [
        { t: "Berikan — dia kawan baik saya", ok: false },
        { t: "Jangan berkongsi — kata laluan hanya untuk saya sendiri", ok: true },
        { t: "Berikan tetapi tukar esok", ok: false } ],
      why: "Kata laluan tidak sesekali dikongsi, walaupun dengan kawan baik. Ia seperti kunci rumah — hanya anda yang patut memegangnya." },
    { s: "Sebuah tetingkap muncul: 'TAHNIAH! Anda menang telefon baharu! Klik di sini sekarang!'",
      pilih: [
        { t: "Klik dengan pantas sebelum habis", ok: false },
        { t: "Tutup tetingkap dan beritahu orang dewasa", ok: true },
        { t: "Isi nama dan nombor telefon untuk tuntut", ok: false } ],
      why: "Hadiah percuma yang tiba-tiba biasanya tipuan. Jangan klik pautan yang mencurigakan — tutup dan beritahu orang dewasa yang dipercayai." },
    { s: "Orang yang tidak dikenali meminta gambar anda melalui aplikasi sembang.",
      pilih: [
        { t: "Hantar gambar yang comel sahaja", ok: false },
        { t: "Jangan hantar sebarang gambar — beritahu ibu bapa atau guru", ok: true },
        { t: "Hantar gambar kawan pula", ok: false } ],
      why: "Jangan hantar gambar peribadi kepada orang tidak dikenali. Simpan dan tunjuk mesej itu kepada ibu bapa, penjaga atau guru." },
    { s: "Anda menerima mesej yang membuatkan anda berasa takut atau tidak selesa.",
      pilih: [
        { t: "Padam dan beritahu ibu bapa, penjaga atau guru", ok: true },
        { t: "Balas mesej itu dengan marah", ok: false },
        { t: "Simpan rahsia supaya tidak dimarahi", ok: false } ],
      why: "Perasaan tidak selesa ialah isyarat penting. Beritahu orang dewasa yang dipercayai — anda tidak akan dibuang kerana memberitahu." },
    { s: "Pemain dalam talian berkata: 'Saya berumur 12 tahun seperti kamu. Jom jumpa di taman esok — jangan beritahu sesiapa!'",
      pilih: [
        { t: "Pergi secara senyap-senyap", ok: false },
        { t: "Jangan setuju — beritahu ibu bapa tentang ajakan ini", ok: true },
        { t: "Bawa adik sekali pergi", ok: false } ],
      why: "Jangan sesekali bertemu orang yang hanya dikenali dalam talian tanpa pengetahuan ibu bapa. 'Jangan beritahu sesiapa' ialah tanda bahaya." },
    { s: "Seorang rakan menghantar komen jahat kepada pemain lain dalam permainan.",
      pilih: [
        { t: "Balas dengan komen yang lebih jahat", ok: false },
        { t: "Jangan balas — sokong rakan yang disakiti dan beritahu orang dewasa", ok: true },
        { t: "Cuma tengok sahaja", ok: false } ],
      why: "Komen jahat boleh menyakitkan hati. Jangan balas dengan kejahatan — sokong rakan, blok penghantar, dan beritahu orang dewasa." },
    { s: "Satu laman web bertanya nama penuh, nama sekolah dan nombor telefon 'untuk pengesahan hadiah'.",
      pilih: [
        { t: "Isi semua supaya dapat hadiah", ok: false },
        { t: "Tutup laman — maklumat peribadi tidak perlu diberikan", ok: true },
        { t: "Isi separuh sahaja", ok: false } ],
      why: "Nama penuh, sekolah dan nombor telefon ialah maklumat peribadi. Laman web yang jujur tidak memintanya untuk 'hadiah'." },
    { s: "Mesej dalam aplikasi: 'AMARAN: Akaun anda akan ditutup dalam 1 jam! Klik pautan ini sekarang!'",
      pilih: [
        { t: "Klik pautan dengan cepat", ok: false },
        { t: "Jangan klik — keluar dan tanya ibu bapa atau guru", ok: true },
        { t: "Kongsikan pautan kepada kawan-kawan", ok: false } ],
      why: "Mesej mendesak yang mengggunakan perkataan 'sekarang!' biasanya penipuan. Jangan klik pautan daripada penghantar yang tidak pasti." },
    { s: "Anda menemui aplikasi baharu yang menawarkan 'permata percuma tanpa had' untuk permainan kegemaran anda.",
      pilih: [
        { t: "Muat turun terus — percuma kan!", ok: false },
        { t: "Minta kebenaran ibu bapa sebelum memuat turun", ok: true },
        { t: "Muat turun dan padam selepas guna", ok: false } ],
      why: "Aplikasi 'percuma' yang tidak rasmi boleh membawa virus atau mencuri data. Dapatkan kebenaran ibu bapa sebelum memuat turun apa-apa." },
    { s: "Rakan berkongsi kata laluan akaunnya dengan anda: 'Boleh guna bila-bila masa!'",
      pilih: [
        { t: "Guna akaunnya untuk bantu naik level", ok: false },
        { t: "Jangan guna — dan ingatkan rakan agar tidak berkongsi kata laluan", ok: true },
        { t: "Tukar kata laluan akaunnya", ok: false } ],
      why: "Menggunakan akaun orang lain tidak jujur, dan berkongsi kata laluan berbahaya untuk rakan anda sendiri. Ingatkan dia dengan baik!" },
    { s: "Seseorang mendakwa mengenali anda dan meminta nombor telefon anda dalam sembang permainan.",
      pilih: [
        { t: "Berikan — dia kata dia kenal saya", ok: false },
        { t: "Jangan beri nombor — beritahu ibu bapa atau penjaga", ok: true },
        { t: "Berikan nombor rumah sahaja", ok: false } ],
      why: "Orang yang benar-benar mengenali anda sudah pun ada cara menghubungi anda. Nombor telefon ialah maklumat peribadi — jangan kongsi dalam talian." },
    { s: "Semasa bermain dalam talian, seseorang menghantar pautan video daripada penghantar yang tidak anda kenali.",
      pilih: [
        { t: "Buka untuk lihat apa isinya", ok: false },
        { t: "Jangan buka — padamkan dan abaikan", ok: true },
        { t: "Minta kawan buka dulu", ok: false } ],
      why: "Pautan daripada orang tidak dikenali boleh membawa kandungan tidak sesuai atau virus. Padam dan abaikan sahaja." },
    { s: "Anda bermain dalam talian terlalu lama sehingga lupa waktu makan dan belajar.",
      pilih: [
        { t: "Terus bermain — lagi satu level sahaja", ok: false },
        { t: "Berhenti dan rehat — jadualkan waktu bermain yang seimbang", ok: true },
        { t: "Bermain sambil makan", ok: false } ],
      why: "Keseimbangan itu penting! Rehat, gerak badan, makan dan belajar menjadikan anda lebih cerdas dan sihat." }
  ];

  MK.registerGame({
    id: "detektif-digital",
    name: "Detektif Digital",
    icon: "🔍",
    cat: "sosial",
    engine: "quiz",
    sticker: "🛡️",
    desc: "Kenal pasti maklumat peribadi dan buat pilihan selamat ketika menggunakan internet!",
    tasksPerLevel: function (l, d) { return d === "mudah" ? 3 : d === "cabaran" ? 5 : 4; },
    instruction: function (l, d) {
      return "Baca situasi digital dan pilih tindakan yang PALING SELAMAT. Penerangan keselamatan akan dipaparkan selepas itu!";
    },
    makeTask: function (level, diff, ctx) {
      var item = MK.Gen.pickAvoid(BANK, (ctx.recentDD = ctx.recentDD || []));
      ctx.recentDD.push(item.s);
      if (ctx.recentDD.length > 6) ctx.recentDD.shift();
      var pilihan = item.pilih.slice();
      /* rawak susunan jawapan */
      for (var i = pilihan.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = pilihan[i]; pilihan[i] = pilihan[j]; pilihan[j] = t;
      }
      return {
        key: "dd-" + item.s.slice(0, 24),
        kind: "quiz",
        prompt: "🔍 " + MK.esc(item.s),
        sub: "Sebagai Detektif Digital, apakah tindakan yang paling selamat?",
        choices: pilihan.map(function (p) { return { label: (p.ok ? "🛡️ " : "") + MK.esc(p.t), correct: p.ok }; }),
        explain: "🛡️ " + item.why
      };
    }
  });
})();
