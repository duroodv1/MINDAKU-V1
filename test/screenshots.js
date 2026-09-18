/* MINDAKU — tangkapan skrin automatik (Puppeteer)
   Guna: node test/screenshots.js [url]
   Hasil: screenshots/*.png + screenshots/collage.png */
"use strict";
var fs = require("fs");
var path = require("path");
var puppeteer = require("puppeteer");

var BASE = process.argv[2] || "http://127.0.0.1:8080";
var OUT = path.join(__dirname, "..", "screenshots");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

(async function () {
  var browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  var page = await browser.newPage();
  await page.setViewport({ width: 390, height: 780, deviceScaleFactor: 2 });
  var errors = [];
  page.on("pageerror", function (e) { errors.push(e.message); });

  await page.goto(BASE + "/index.html", { waitUntil: "networkidle0" });
  await page.waitForFunction("window.MK && MK.ready===true");
  await page.evaluate("MK.Settings.set('animation', false)");
  await sleep(500);

  async function shot(name, navExpr, waitMs) {
    if (navExpr) await page.evaluate(navExpr);
    await sleep(waitMs || 700);
    await page.screenshot({ path: path.join(OUT, name + ".png") });
    console.log("📸", name);
  }

  /* 1. menu utama */
  await shot("01-menu", "MK.Nav.home()", 900);
  /* 2. dunia kategori */
  await shot("02-dunia", "MK.Nav.go('worlds')", 800);
  /* 3. skrin kategori */
  await shot("03-kategori", "MK.Nav.go('category', {id:'matematik'})", 800);
  /* 4. pilihan level */
  await shot("04-level", "MK.Nav.go('levels', {id:'math-garden'})", 800);
  /* 5. permainan kuiz */
  await shot("05-kuiz", "MK.Engine.startLevel('math-garden', 3, 'sederhana')", 900);
  /* 6. permainan kreatif */
  await shot("06-kreatif", "MK.Engine.startLevel('build-create', 1, 'mudah')", 1000);
  /* 7. lengkapkan level → overlay tahniah */
  await page.evaluate("MK.Engine.startLevel('safe-unsafe', 1, 'mudah')");
  await sleep(300);
  for (var i = 0; i < 250; i++) {
    var done = await page.evaluate("!!document.querySelector('.overlay .overlay-card')");
    if (done) break;
    await page.evaluate(function () {
      var ch = document.querySelectorAll(".task-mount .choice:not(.dimmed)");
      if (ch.length) { ch[0].click(); return; }
      var b = document.querySelector(".task-mount .btn.primary");
      if (b && !b.disabled) b.click();
    });
    await sleep(90);
  }
  await sleep(600);
  await page.screenshot({ path: path.join(OUT, "07-tahniah.png") });
  console.log("📸 07-tahniah");
  /* 8. galeri dengan karya */
  await page.evaluate(async function () {
    function mk(hueA, hueB, label) {
      var c = document.createElement("canvas");
      c.width = 300; c.height = 220;
      var x = c.getContext("2d");
      var g = x.createLinearGradient(0, 0, 300, 220);
      g.addColorStop(0, "hsl(" + hueA + ",70%,75%)");
      g.addColorStop(1, "hsl(" + hueB + ",70%,85%)");
      x.fillStyle = g; x.fillRect(0, 0, 300, 220);
      x.fillStyle = "#3E7C82"; x.font = "bold 28px sans-serif"; x.textAlign = "center";
      x.fillText(label, 150, 120);
      return c.toDataURL("image/png");
    }
    await MK.Gallery.save({ gameId: "build-create", name: "Istana Pelangi", type: "canvas", data: mk(200, 330, "🏰") });
    await MK.Gallery.save({ gameId: "build-create", name: "Rumah Pokok", type: "canvas", data: mk(20, 90, "🌳") });
  });
  await shot("08-galeri", "MK.Nav.go('gallery')", 900);
  var galN = await page.evaluate("document.querySelectorAll('.gal-item').length");
  console.log("   galeri memaparkan", galN, "karya");
  /* 9. profil & ganjaran */
  await shot("09-profil", "MK.Nav.go('profile')", 900);
  /* 10. koleksi pelekat */
  await shot("10-koleksi", "MK.Nav.go('collection')", 900);
  /* 11. pencapaian */
  await shot("11-pencapaian", "MK.Nav.go('achievements')", 900);
  /* 12. tetapan */
  await shot("12-tetapan", "MK.Nav.go('settings')", 900);

  await browser.close();

  if (errors.length) { console.log("⚠️ Ralat halaman:", errors.slice(0, 5)); process.exitCode = 1; }
  else console.log("✅ Semua tangkapan skrin siap tanpa ralat → screenshots/");
})().catch(function (e) { console.error(e); process.exit(1); });
