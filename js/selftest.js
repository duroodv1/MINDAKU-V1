/* ============================================================
   MINDAKU V.1 — selftest.js
   Ujian sistem: sahkan setiap permainan menghasilkan tugas
   yang sah untuk semua level (1–10) dan kesukaran.
   Boleh dijalankan dari Tetapan → Ujian Sistem.
   ============================================================ */
"use strict";
MK.SelfTest = (function () {

  function validateTask(t, def, level, diff, issues, label) {
    function err(msg) { issues.push(label + ": " + msg); }
    if (!t) { if (def.engine === "custom" || def.engine === "creative") return; err("tiada tugas"); return; }
    var kind = t.kind || def.engine;
    if (kind === "quiz") {
      if (!Array.isArray(t.choices) || t.choices.length < 2) return err("pilihan < 2");
      var nCorrect = t.choices.filter(function (c) { return c.correct; }).length;
      if (nCorrect !== 1) return err("jawapan betul != 1 (dapat " + nCorrect + ")");
      t.choices.forEach(function (c) { if (c.label == null) err("label tiada"); });
    } else if (kind === "multi") {
      if (!Array.isArray(t.choices) || t.choices.length < 2) return err("pilihan < 2");
      var needed = t.choices.filter(function (c) { return c.needed; }).length;
      if (needed < 1 || needed >= t.choices.length) return err("bilangan 'needed' tidak sah: " + needed);
      var ids = t.choices.map(function (c) { return c.id; });
      if (new Set(ids).size !== ids.length) return err("id pilihan berulang");
    } else if (kind === "match") {
      if (!Array.isArray(t.pairs) || t.pairs.length < 2) return err("pasangan < 2");
      t.pairs.forEach(function (p) {
        if (!p.a || !p.b || p.a.id == null || p.b.id == null) err("pasangan tidak lengkap");
      });
      var aids = t.pairs.map(function (p) { return p.a.id; });
      var bids = t.pairs.map(function (p) { return p.b.id; });
      if (new Set(aids).size !== aids.length) err("id lajur kiri berulang");
      if (new Set(bids).size !== bids.length) err("id lajur kanan berulang");
    } else if (kind === "sort") {
      if (!Array.isArray(t.bins) || t.bins.length < 2) return err("bin < 2");
      if (!Array.isArray(t.items) || t.items.length < 1) return err("item < 1");
      var binIds = t.bins.map(function (b) { return b.id; });
      t.items.forEach(function (it) {
        if (binIds.indexOf(it.bin) < 0) err("item '" + it.label + "' merujuk bin tidak wujud: " + it.bin);
      });
      var iids = t.items.map(function (i2) { return i2.id; });
      if (new Set(iids).size !== iids.length) err("id item berulang");
    } else if (kind === "order") {
      if (!Array.isArray(t.tokens) || t.tokens.length < 2) return err("token < 2");
      if (!Array.isArray(t.answer) || t.answer.length < 2) return err("jawapan < 2");
      var tids = t.tokens.map(function (x) { return x.id; });
      t.answer.forEach(function (a) { if (tids.indexOf(a) < 0) err("jawapan merujuk token tidak wujud"); });
      if (new Set(t.answer).size !== t.answer.length) err("jawapan berulang");
      var joinA = t.answer.join(","), joinT = tids.join(",");
    } else if (kind === "memory") {
      if (!Array.isArray(t.pairs) || t.pairs.length < 2) return err("pasangan < 2");
      if (t.pairs.length > 8) return err("pasangan > 8");
      var pids = t.pairs.map(function (p) { return p.id; });
      if (new Set(pids).size !== pids.length) err("id pasangan berulang");
    } else if (kind === "custom" || kind === "creative") {
      // ok — dilaksanakan oleh startLevel
    } else {
      err("jenis tidak dikenali: " + kind);
    }
  }

  /* Kumpulkan semua isu (tanpa DOM) */
  function collectIssues() {
    var issues = [];
    var gameIds = Object.keys(MK.GAMES || {});
    if (gameIds.length !== 50) issues.push("Jumlah permainan = " + gameIds.length + " (sepatutnya 50)");
    // kategori: 10 × 5
    MK.CATEGORIES.forEach(function (cat) {
      var games = MK.gamesInCategory(cat.id);
      if (games.length !== 5) issues.push("Kategori " + cat.name + " ada " + games.length + " permainan (sepatutnya 5)");
    });
    gameIds.forEach(function (gid) {
      var def = MK.GAMES[gid];
      if (!def.name || !def.icon || !def.cat) { issues.push(gid + ": metadata tidak lengkap"); return; }
      if (typeof def.instruction !== "function") issues.push(gid + ": tiada instruction()");
      if (def.engine === "custom" || def.engine === "creative") {
        if (typeof def.startLevel !== "function") issues.push(gid + ": tiada startLevel()");
        return;
      }
      if (typeof def.makeTask !== "function") { issues.push(gid + ": tiada makeTask()"); return; }
      ["mudah", "sederhana", "cabaran"].forEach(function (diff) {
        for (var level = 1; level <= 10; level++) {
          for (var k = 0; k < 2; k++) {
            try {
              var ctx = { ease: false, boost: false, recent: [] };
              var t = def.makeTask(level, diff, ctx);
              validateTask(t, def, level, diff, issues, gid + " [L" + level + "/" + diff + "]");
            } catch (e) {
              issues.push(gid + " [L" + level + "/" + diff + "] LONTAR: " + e.message);
            }
          }
        }
      });
    });
    return issues;
  }

  /* Paparkan keputusan */
  function run(showUI) {
    var t0 = Date.now();
    var issues = [];
    try { issues = collectIssues(); } catch (e) { issues.push("Ujian gagal berjalan: " + e.message); }
    var ms = Date.now() - t0;
    var total = Object.keys(MK.GAMES || {}).length;
    if (!showUI) return issues;
    var ov = MK.el("div", "overlay");
    var ok = issues.length === 0;
    var listHtml = issues.slice(0, 30).map(function (i) { return "<li style='text-align:left'>" + MK.esc(i) + "</li>"; }).join("");
    ov.appendChild(MK.h(
      '<div class="overlay-card"><h2>' + (ok ? "✅ Semua Sistem Baik!" : "⚠️ " + issues.length + " isu dijumpai") + "</h2>" +
      '<div class="ov-sub">' + total + ' permainan disemak × 10 level × 3 kesukaran (' + ms + "ms)</div>" +
      (listHtml ? '<ul style="text-align:left;font-size:.8rem;color:var(--ink-soft);max-height:200px;overflow:auto">' + listHtml + "</ul>" : "") +
      '<div class="overlay-actions"><button class="btn primary">Tutup</button></div></div>'
    ));
    ov.addEventListener("click", function (ev) {
      if (ev.target.closest("button")) ov.remove();
    });
    document.body.appendChild(ov);
    MK.announce(ok ? "Ujian sistem lengkap. Semua baik." : "Ujian sistem menemui isu.");
    return issues;
  }

  return { run: run, collectIssues: collectIssues };
})();
