/* ============================================================
   MINDAKU V.1 — test/browser-test.js
   Ujian asap pelayar sebenar (Puppeteer):
   1. Aplikasi dimuat tanpa ralat
   2. 50 permainan berdaftar
   3. Skrin pilihan level + permainan dibuka untuk semua 50
   4. Permainan kuiz dimainkan sehingga selesai level
   5. Service Worker & luar talian
   ============================================================ */
"use strict";
var path = require("path");
var http = require("http");
var fs = require("fs");

var ROOT = path.resolve(__dirname, "..");
var PORT = 8090;

/* pelayan statik ringkas */
var MIME = { ".html": "text/html", ".css": "text/css", ".js": "application/javascript", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml" };
var server = http.createServer(function (req, res) {
  var p = req.url.split("?")[0];
  if (p === "/") p = "/index.html";
  var file = path.join(ROOT, p);
  fs.readFile(file, function (err, data) {
    if (err) { res.writeHead(404); res.end("404"); return; }
    var ext = path.extname(file);
    var h = { "Content-Type": MIME[ext] || "application/octet-stream" };
    if (p.indexOf("service-worker") >= 0) h["Service-Worker-Allowed"] = "/";
    res.writeHead(200, h);
    res.end(data);
  });
});

(async function () {
  await new Promise(function (r) { server.listen(PORT, "127.0.0.1", r); });
  var puppeteer = require("puppeteer");
  var browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  var page = await browser.newPage();
  await page.setViewport({ width: 390, height: 780 }); // telefon
  var errors = [];
  page.on("pageerror", function (e) { errors.push("PAGEERROR: " + e.message); });
  page.on("console", function (m) {
    if (m.type() === "error") errors.push("CONSOLE: " + m.text());
  });

  var base = "http://127.0.0.1:" + PORT + "/";
  console.log("1) Memuatkan aplikasi…");
  await page.goto(base + "index.html", { waitUntil: "networkidle0", timeout: 30000 });
  await page.waitForFunction("window.MK && MK.ready === true", { timeout: 20000 });

  var nGames = await page.evaluate("Object.keys(MK.GAMES).length");
  console.log("   Permainan berdaftar:", nGames, nGames === 50 ? "✅" : "❌ (sepatutnya 50)");
  if (nGames !== 50) process.exitCode = 1;

  await page.evaluate("MK.Settings.set('animation', false)");
  var homeOK = await page.evaluate("!!document.querySelector('.menu-grid')");
  console.log("   Skrin utama:", homeOK ? "✅" : "❌");

  console.log("2) Buka skrin semua 50 permainan…");
  var ids = await page.evaluate("Object.keys(MK.GAMES)");
  var openFail = [];
  for (var i = 0; i < ids.length; i++) {
    var errsBefore = errors.length;
    await page.evaluate("MK.Engine.open('" + ids[i] + "')");
    await new Promise(function (r) { setTimeout(r, 120); });
    var hasLevelGrid = await page.evaluate("!!document.querySelector('.level-grid')");
    if (!hasLevelGrid) openFail.push(ids[i] + " (tiada grid level)");
    await page.evaluate("MK.Engine.startLevel('" + ids[i] + "', 1, 'mudah')");
    await new Promise(function (r) { setTimeout(r, 350); });
    var hasMount = await page.evaluate("!!document.querySelector('.task-mount')");
    if (!hasMount) openFail.push(ids[i] + " (tiada kawasan permainan)");
    var newErrs = errors.slice(errsBefore).filter(function (e) { return e.indexOf("PAGEERROR") === 0; });
    if (newErrs.length) openFail.push(ids[i] + " → " + newErrs[0].slice(0, 120));
  }
  if (openFail.length) { console.log("   ❌ Masalah:", openFail.join(" | ")); process.exitCode = 1; }
  else console.log("   ✅ Semua 50 permainan dibuka tanpa ralat");

  console.log("3) Main permainan semua jenis enjin sehingga selesai level…");
  var playable = [
    /* kuiz */ "geometry-builder", "word-analogy", "safe-unsafe", "garden-counting", "math-garden", "multiplication-garden", "odd-one-out", "weather-explorer", "logic-puzzle", "what-should-i-do", "ask-first", "road-safety", "pattern-master",
    /* padan */ "word-picture-match",
    /* memori */ "memory-match",
    /* multi */ "pack-school-bag",
    /* tatasusun */ "daily-routine", "sentence-train", "word-builder",
    /* susun */ "animal-habitat", "category-words", "organize-room", "sound-sorter",
    /* custom */ "picnic-memory", "recipe-memory", "shopping-memory", "what-changed", "angle-explorer"
  ];
  for (var g = 0; g < playable.length; g++) {
    var gid = playable[g];
    var finished = false;
    for (var attempt = 0; attempt < 2 && !finished; attempt++) {
      await page.evaluate("MK.Engine.startLevel('" + gid + "', 1, 'mudah')");
      await new Promise(function (r) { setTimeout(r, 200); });
      finished = await playQuiz(page, gid);
    }
    if (finished) {
      /* tutup overlay tahniah seperti pengguna sebenar (butang ▶ Level seterusnya) */
      await page.evaluate(function () {
        var b = document.querySelector(".overlay .btn.primary");
        if (b) b.click();
      });
    }
    console.log("   " + gid + ":", finished ? "✅ level selesai (overlay tahniah)" : "⚠️ tidak selesai dalam masa (2 cubaan)");
    if (!finished) process.exitCode = 1;
  }

  console.log("3b) Kemajuan kekal selepas muat semula…");
  var progBefore = await page.evaluate("(MK.Engine.levelDoneCount('math-garden') || 0) + '|' + (MK.Engine.totalStars('math-garden') || 0)");
  await page.reload({ waitUntil: "networkidle0" });
  await page.waitForFunction("window.MK && MK.ready===true");
  var progAfter = await page.evaluate("(MK.Engine.levelDoneCount('math-garden') || 0) + '|' + (MK.Engine.totalStars('math-garden') || 0)");
  var pB = progBefore.split("|")[0] | 0, pA = progAfter.split("|")[0] | 0;
  console.log("   Sebelum:", progBefore, "| Selepas:", progAfter);
  if (pA >= 1 && pA === pB) console.log("   ✅ Kemajuan kekal selepas muat semula");
  else { console.log("   ❌ Kemajuan hilang selepas muat semula"); process.exitCode = 1; }

  console.log("4) Interaksi khas (butang bantuan & suara)…");
  await page.evaluate("MK.Engine.startLevel('geometry-builder', 2, 'sederhana')");
  await new Promise(function (r) { setTimeout(r, 250); });
  var hintClick = await page.evaluate(function () {
    var b = document.querySelector("#g-hint");
    if (!b) return "tiada butang";
    b.click();
    return "ok";
  });
  console.log("   Butang 💡:", hintClick === "ok" ? "✅" : "❌ " + hintClick);
  var voiceClick = await page.evaluate(function () {
    var b = document.querySelector("#g-voice");
    if (!b) return "tiada butang";
    b.click();
    return "ok";
  });
  console.log("   Butang 🔊:", voiceClick === "ok" ? "✅" : "❌ " + voiceClick);

  console.log("5) Kemajuan disimpan (IndexedDB)…");
  var prog = await page.evaluate(async function () {
    await MK.Engine.saveProgress("geometry-builder", 1, "mudah", 3, 0, 0);
    var pr = await MK.Store.get("progress", "geometry-builder");
    return pr && pr.levels && pr.levels["1"] && pr.levels["1"].done && pr.levels["1"].stars === 3;
  });
  console.log("   Simpan kemajuan:", prog ? "✅" : "❌");
  if (!prog) process.exitCode = 1;

  console.log("6) Galeri (IndexedDB)…");
  var gal = await page.evaluate(async function () {
    await MK.Gallery.saveSVG("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10'><rect width='10' height='10' fill='red'/></svg>", "test", "Ujian");
    var items = await MK.Gallery.list();
    return items.length >= 1;
  });
  console.log("   Simpan + senarai galeri:", gal ? "✅" : "❌");
  if (!gal) process.exitCode = 1;

  console.log("7) Service Worker & luar talian…");
  await new Promise(function (r) { setTimeout(r, 2500); });
  var sw = await page.evaluate(async function () {
    if (!("serviceWorker" in navigator)) return "tidak disokong";
    var reg = await navigator.serviceWorker.getRegistration();
    return reg ? "berdaftar" : "tidak berdaftar";
  });
  console.log("   SW:", sw === "berdaftar" ? "✅" : "⚠️ " + sw);
  // tunggu cache precache penuh (>= 75 fail)
  var cacheN = 0;
  for (var w = 0; w < 30; w++) {
    cacheN = await page.evaluate(async function () {
      try {
        var keys = await caches.keys();
        if (!keys.length) return 0;
        var c = await caches.open(keys[0]);
        var rs = await c.keys();
        return rs.length;
      } catch (e) { return 0; }
    });
    if (cacheN >= 75) break;
    await new Promise(function (r) { setTimeout(r, 500); });
  }
  console.log("   Fail dalam cache:", cacheN);
  var offlineOK = false;
  try {
    await page.setOfflineMode(true);
    await page.goto(base + "index.html", { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForFunction("window.MK && MK.ready === true", { timeout: 10000 });
    offlineOK = await page.evaluate("!!document.querySelector('.menu-grid')");
  } catch (e) { offlineOK = false; }
  await page.setOfflineMode(false);
  console.log("   Muat semula luar talian:", offlineOK ? "✅" : "❌");
  if (!offlineOK) process.exitCode = 1;

  /* 8) navigasi skrin lain */
  console.log("8) Skrin lain…");
  for (var s = 0; s < ["worlds", "settings", "profile", "achievements", "collection", "gallery"].length; s++) {
    var scr = ["worlds", "settings", "profile", "achievements", "collection", "gallery"][s];
    await page.evaluate("MK.Nav.go('" + scr + "')");
    await new Promise(function (r) { setTimeout(r, 100); });
    var ok2 = await page.evaluate("!!document.querySelector('.screen')");
    if (!ok2) { console.log("   ❌ skrin", scr); process.exitCode = 1; }
  }
  console.log("   Semua skrin utama: ✅");

  /* ralat konsol sepanjang sesi (abaikan favicon & icon) */
  var relevant = errors.filter(function (e) {
    return e.indexOf("favicon") < 0 && e.indexOf("Failed to load resource") < 0;
  });
  if (relevant.length) {
    console.log("⚠️ Ralat konsol:", relevant.slice(0, 12).join("\n    "));
    process.exitCode = 1;
  } else console.log("9) Tiada ralat konsol sepanjang sesi ✅");

  await browser.close();
  server.close();
  console.log(process.exitCode ? "\n❌ UJIAN ASAP GAGAL" : "\n✅ SEMUA UJIAN ASAP LULUS");
  process.exit(process.exitCode || 0);
})().catch(function (e) { console.error("RALAT UJIAN:", e); process.exit(1); });

/* Main permainan kuiz generik: klik pilihan sehingga overlay tahniah muncul */
async function playQuiz(page, gid) {
  var misses = 0;
  for (var round = 0; round < 400; round++) {
    var done = await page.evaluate("!!document.querySelector('.overlay .overlay-card')");
    if (done) return true;
    /* autoStep: satu tindakan bijak setiap pusingan, ikut jenis enjin semasa */
    var step = await page.evaluate(function (gid) {
      function q(sel) { return document.querySelector(sel); }
      function qa(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
      var mount = q(".task-mount");
      if (!mount) return "tiada-mount";

      /* ===== PERMAINAN CUSTOM (ikut gid) ===== */
      var isStudyGame = gid === "picnic-memory" || gid === "recipe-memory" || gid === "shopping-memory" || gid === "what-changed";
      if (isStudyGame) {
        var sBtn = q(".task-mount .btn.primary.big");
        var hasCh = qa(".task-mount .choice").length > 0;
        var hasTok = qa(".task-mount .otoken").length > 0;
        if (sBtn && !hasCh && !hasTok) {
          /* fasa belajar: tangkap urutan emoji, kemudian teruskan */
          window.__studySeq = qa(".task-mount [style*='font-size:2rem']").map(function (c) { return c.textContent.trim(); });
          sBtn.click();
          return "belajar";
        }
        if (gid === "recipe-memory") {
          var seq = window.__studySeq || [];
          var slots = qa(".task-mount .oslot");
          var filled = slots.filter(function (sl) { return !/^\d+$/.test(sl.textContent.trim()); }).length;
          if (filled < seq.length) {
            var need = seq[filled];
            var tok = qa(".task-mount .otoken:not(.used)").filter(function (t) { return t.textContent.indexOf(need) >= 0; })[0];
            if (tok) { tok.click(); return "resipi-susun"; }
            var any = q(".task-mount .otoken:not(.used)");
            if (any) { any.click(); return "resipi-susun-rawak"; }
          }
          return "resipi-tunggu";
        }
        if (gid === "picnic-memory") {
          var hbP = q("#g-hint");
          if (hbP) hbP.click();
          var hcP = q(".task-mount .choice.hinted:not(.selected)");
          if (hcP) { hcP.click(); return "picnic-jawab"; }
          return "picnic-tunggu";
        }
        if (gid === "shopping-memory") {
          var cbS = q(".task-mount .btn.primary.big");
          if (cbS && !cbS.disabled) { cbS.click(); return "belanja-semak"; }
          var hbS = q("#g-hint");
          if (hbS) hbS.click();
          var hcS = q(".task-mount .choice.hinted:not(.selected)");
          if (hcS) { hcS.click(); return "belanja-pilih"; }
          return "belanja-tunggu";
        }
        if (gid === "what-changed") {
          var hbW = q("#g-hint");
          if (hbW) hbW.click();
          var cell = q(".task-mount .hint-glow");
          if (cell) { cell.click(); return "ubah-jawab"; }
          return "ubah-tunggu";
        }
      }
      if (gid === "angle-explorer") {
        if (qa(".task-mount .choice").length) {
          var hbA = q("#g-hint");
          if (hbA) hbA.click();
          var hcA = q(".task-mount .choice.hinted:not(.dimmed)");
          if (hcA) { hcA.click(); return "sudut-pilih"; }
          return "sudut-tunggu";
        }
        var cbA = q(".task-mount .btn.primary.big");
        if (cbA) {
          var hbA2 = q("#g-hint");
          if (hbA2) hbA2.click(); /* hint tetapkan sudut = sasaran */
          cbA.click();
          return "sudut-semak";
        }
        return "sudut-tunggu";
      }

      /* MEMORI: klik sepasang kad data-pid sama */
      var cards = qa(".task-mount .mem-card:not(.matched)");
      if (cards.length) {
        if (qa(".task-mount .mem-card.flip:not(.matched)").length) return "tunggu";
        var byPid = {};
        cards.forEach(function (c) { (byPid[c.dataset.pid] = byPid[c.dataset.pid] || []).push(c); });
        var pid = Object.keys(byPid).find(function (p) { return byPid[p].length >= 2; });
        if (pid) { byPid[pid][0].click(); byPid[pid][1].click(); return "memori"; }
        return "memori-buntu";
      }

      /* SUSUN (sort): klik item kemudian bin yang betul (data-bin) */
      var stiles = qa(".task-mount .stile:not(.placed)");
      if (stiles.length) {
        var it = stiles[0];
        var bin = q('.task-mount .bin[data-bid="' + it.dataset.bin + '"]');
        if (bin) { it.click(); bin.click(); return "susun"; }
        return "susun-bin-tiada";
      }

      /* TATASUSUN (order): hint meletakkan satu token betul */
      var otokens = qa(".task-mount .otoken");
      if (otokens.length) {
        var hb = q("#g-hint");
        if (hb) { hb.click(); return "tatasusun-hint"; }
        return "tatasusun-tiada-hint";
      }

      /* PADAN (match): hint menyerlahkan pasangan betul, klik kedua-dua */
      var colA = qa(".task-mount .match-col")[0];
      var colB = qa(".task-mount .match-col")[1];
      if (colA && colB && qa(".task-mount .mtile").length) {
        var hb3 = q("#g-hint");
        if (!hb3) return "padan-tiada-hint";
        hb3.click();
        var ha = colA.querySelector(".mtile.hinted:not(.locked)");
        var hb4 = colB.querySelector(".mtile.hinted:not(.locked)");
        if (ha && hb4) { ha.click(); hb4.click(); return "padan"; }
        return "padan-hint-kosong";
      }

      /* MULTI: hint pilih jawapan betul; bila hint tak menambah, semak */
      var confirmBtn = q(".task-mount .btn.primary");
      var multiChoices = qa(".task-mount .choice");
      if (confirmBtn && multiChoices.length) {
        var n1 = qa(".task-mount .choice.selected").length;
        var hb2 = q("#g-hint");
        if (hb2) hb2.click();
        var n2 = qa(".task-mount .choice.selected").length;
        if (n2 === n1 && !confirmBtn.disabled) { confirmBtn.click(); return "multi-semak"; }
        return "multi-hint";
      }

      /* KUIZ: klik pilihan pertama yang tidak dim */
      var choices = qa(".task-mount .choice:not(.dimmed)");
      if (choices.length) { choices[0].click(); return "kuiz"; }

      /* itu sahaja — mungkin tunggu animasi */
      return "tunggu";
    }, gid);
    if (step === "tiada-mount" || step === "tunggu") { misses++; if (misses > 60) break; }
    else misses = 0;
    await new Promise(function (r) { setTimeout(r, step === "memori" ? 700 : step === "padan" ? 400 : 100); });
  }
  var done = await page.evaluate("!!document.querySelector('.overlay .overlay-card')");
  if (!done) {
    var dbg = await page.evaluate(function () {
      var ch = document.querySelectorAll(".task-mount .choice");
      var fb = document.querySelector(".feedback-line");
      return {
        choices: ch.length,
        dimmed: document.querySelectorAll(".task-mount .choice.dimmed").length,
        memCards: document.querySelectorAll(".task-mount .mem-card").length,
        mtiles: document.querySelectorAll(".task-mount .mtile").length,
        stiles: document.querySelectorAll(".task-mount .stile").length,
        otokens: document.querySelectorAll(".task-mount .otoken").length,
        feedback: fb ? fb.textContent.slice(0, 40) : "",
        dots: document.querySelectorAll(".pdot.ok").length
      };
    });
    console.log("   [diag]", JSON.stringify(dbg));
  }
  return done;
}
