/* ============================================================
   MINDAKU V.1 — test/logic-test.js
   Ujian logik tanpa pelayar: muatkan semua modul dengan stub
   DOM minimum, suntik data JSON sebenar, kemudian sahkan
   setiap permainan (10 level × 3 kesukaran × 2 percubaan).
   ============================================================ */
"use strict";
var fs = require("fs");
var path = require("path");
var vm = require("vm");

var ROOT = path.resolve(__dirname, "..");

/* ---------- Stub persekitaran pelayar ---------- */
var sandbox = {
  console: console,
  setTimeout: setTimeout, setInterval: setInterval, clearInterval: clearInterval, clearTimeout: clearTimeout,
  Promise: Promise, JSON: JSON, Math: Math, Date: Date, Object: Object, Array: Array, String: String, Number: Number, Set: Set, RegExp: RegExp, Error: Error,
  indexedDB: null
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.navigator = { serviceWorker: undefined };
sandbox.location = { href: "http://localhost:8080/index.html", protocol: "http:", pathname: "/index.html" };
sandbox.localStorage = {
  _d: {},
  getItem: function (k) { return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; },
  setItem: function (k, v) { this._d[k] = String(v); },
  removeItem: function (k) { delete this._d[k]; },
  get length() { return Object.keys(this._d).length; },
  key: function (i) { return Object.keys(this._d)[i] || null; }
};
function fakeElement() {
  return {
    style: {}, dataset: {}, classList: { add: function () { }, remove: function () { }, toggle: function () { }, contains: function () { return false; } },
    appendChild: function (c) { return c; }, removeChild: function () { }, remove: function () { },
    addEventListener: function () { }, removeEventListener: function () { }, setAttribute: function () { }, getAttribute: function () { return null; },
    querySelector: function () { return null; }, querySelectorAll: function () { return []; },
    innerHTML: "", textContent: "", firstElementChild: null, parentNode: null, children: []
  };
}
sandbox.document = {
  createElement: function () { return fakeElement(); },
  createElementNS: function () { return fakeElement(); },
  getElementById: function () { return null; },
  addEventListener: function () { },
  body: fakeElement()
};
sandbox.addEventListener = function () { };
sandbox.removeEventListener = function () { };
sandbox.AudioContext = undefined;
sandbox.SpeechSynthesisUtterance = undefined;
/* fetch → baca fail JSON sebenar dari cakera */
sandbox.fetch = function (url) {
  var m = String(url).match(/data\/([a-z]+)\.json$/);
  if (!m) return Promise.reject(new Error("404 " + url));
  var p = path.join(ROOT, "data", m[1] + ".json");
  return new Promise(function (resolve, reject) {
    fs.readFile(p, "utf8", function (err, data) {
      if (err) return reject(err);
      resolve({ ok: true, json: function () { return Promise.resolve(JSON.parse(data)); } });
    });
  });
};
vm.createContext(sandbox);

/* ---------- Muatkan skrip ikut tertib index.html ---------- */
var scripts = [
  "js/app.js", "js/storage.js", "js/settings.js", "js/accessibility.js",
  "js/audio.js", "js/tts.js", "js/profile.js", "js/rewards.js", "js/gallery.js",
  "js/navigation.js", "js/content-generator.js", "js/game-engine.js"
];
var gdir = fs.readdirSync(path.join(ROOT, "games")).filter(function (f) { return f.endsWith(".js"); }).sort();
scripts = scripts.concat(gdir.map(function (f) { return "games/" + f; }));
scripts.push("js/selftest.js");

scripts.forEach(function (s) {
  var code = fs.readFileSync(path.join(ROOT, s), "utf8");
  try {
    vm.runInContext(code, sandbox, { filename: s });
  } catch (e) {
    console.error("GAGAAL MEMUAT", s, "→", e.message);
    process.exitCode = 1;
  }
});
var MK = sandbox.MK;

/* ---------- Jalankan ---------- */
(async function () {
  if (!MK) { console.error("MK tiada!"); process.exit(1); }
  console.log("Permainan berdaftar:", Object.keys(MK.GAMES).length);

  await MK.Data.init();
  console.log("Bank data dimuat:", Object.keys(MK.Data.bank("vocabulary")).length ? "vocabulary OK" : "vensus GAGAL");
  console.log("   suku kata:", MK.Data.list("vocabulary", "syllable").length,
    "| analogi:", MK.Data.list("questions", "analogies").length,
    "| habitat:", MK.Data.list("habitats", "habitats").length);

  var issues = MK.SelfTest.collectIssues();
  if (issues.length) {
    console.error("⚠️  ISU DIJUMPAI (" + issues.length + "):");
    issues.slice(0, 60).forEach(function (i) { console.error("  -", i); });
    if (issues.length > 60) console.error("  ... dan", issues.length - 60, "lagi");
    process.exitCode = 1;
  } else {
    console.log("✅ SEMUA UJIAN LOGIK LULUS — 50 permainan × 10 level × 3 kesukaran");
  }

  /* Ujian tambahan: generator matematik */
  var def = MK.gameDef("math-garden");
  var sample = def.makeTask(5, "sederhana", { recent: [] });
  console.log("Contoh tugas Math Garden L5:", JSON.stringify({ prompt: sample.prompt, benar: sample.choices.filter(function (c) { return c.correct; }).map(function (c) { return c.label; })[0] }));

  var def2 = MK.gameDef("word-builder");
  var sample2 = def2.makeTask(3, "mudah", { recentWords: [] });
  console.log("Contoh Word Builder:", sample2.prompt, "| token:", sample2.tokens.map(function (t) { return t.label; }).join(""), "| jawapan sah:", sample2.answer.length);

  var def3 = MK.gameDef("memory-match");
  var sample3 = def3.makeTask(9, "sederhana", { recent: [] });
  console.log("Memory Match L9 pasangan:", sample3.pairs.length, "kad:", sample3.pairs.length * 2);

  /* Ujian mod sandaran: fetch gagal sepenuhnya */
  sandbox.fetch = function () { return Promise.reject(new Error("offline")); };
  var MK2 = sandbox.MK;
  MK2.Data.banks = {}; // kosongkan bank
  await MK2.Data.init().catch(function () {});
  var issues2 = MK2.SelfTest.collectIssues();
  if (issues2.length) {
    console.error("⚠️  ISU MOD SANDARAN (" + issues2.length + "):");
    issues2.slice(0, 25).forEach(function (i) { console.error("  -", i); });
    process.exitCode = 1;
  } else {
    console.log("✅ MOD SANDARAN (tanpa JSON) — semua 50 permainan masih boleh menjana tugas");
  }

  /* Ujian simetri suku kata */
  var bad = [];
  MK.Data.list("vocabulary", "syllable").forEach(function (w) {
    if (MK.Gen.syllables(w.w) !== w.s) bad.push(w.w + " (jangka " + w.s + ", kiraan " + MK.Gen.syllables(w.w) + ")");
  });
  if (bad.length) console.log("⚠️  Suku kata berbeza daripada bank (gunakan nilai bank):", bad.join(", "));
  else console.log("✅ Semua suku kata konsisten dengan kiraan vokal BM");
})();
