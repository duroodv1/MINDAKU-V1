/* ============================================================
   MINDAKU V.1 — game-engine.js
   Enjin permainan boleh guna semula:
   loadGame, startGame, loadLevel, loadDifficulty,
   generateQuestion, handleInput, checkAnswer, showFeedback,
   showHint, calculateReward, saveProgress, completeLevel, nextLevel.
   Jenis tugas: quiz, multi, match, sort, order, memory, custom.
   ============================================================ */
"use strict";

/* ================= Kategori & Registry ================= */
MK.CATEGORIES = [
  { id: "bentuk", name: "Bentuk & Geometri", icon: "🔷", color: "#7EA6E0" },
  { id: "auditori", name: "Auditori & Fonologi", icon: "👂", color: "#B49AE0" },
  { id: "memori", name: "Memori & Perhatian", icon: "🧠", color: "#E8A2B0" },
  { id: "bahasa", name: "Bahasa & Literasi", icon: "📚", color: "#7CC29A" },
  { id: "matematik", name: "Matematik", icon: "🔢", color: "#EFB45C" },
  { id: "logik", name: "Logik & Penyelesaian Masalah", icon: "🧩", color: "#6FAECB" },
  { id: "sains", name: "Sains & Dunia", icon: "🔬", color: "#68C3B0" },
  { id: "kehidupan", name: "Kehidupan Harian", icon: "🏠", color: "#D9A066" },
  { id: "sosial", name: "Sosial & Keselamatan", icon: "🤝", color: "#E88F6A" },
  { id: "kreativiti", name: "Kreativiti & Digital", icon: "🎨", color: "#C9A0DC" }
];

MK.GAMES = {};
MK.registerGame = function (def) {
  if (!def || !def.id || !def.name) { console.warn("Def permainan tidak sah:", def); return; }
  def.engine = def.engine || "quiz";
  def.allowTimer = def.allowTimer !== false && !def.creative;
  def.allowHint = def.allowHint !== false;
  MK.GAMES[def.id] = def;
};
MK.gameDef = function (id) { return MK.GAMES[id] || null; };
MK.gamesInCategory = function (catId) {
  return Object.keys(MK.GAMES).filter(function (g) { return MK.GAMES[g].cat === catId; });
};
MK.allGameIds = function () { return Object.keys(MK.GAMES); };
MK.categoryById = function (id) { return MK.CATEGORIES.find(function (c) { return c.id === id; }) || null; };
MK.suggestGame = function () {
  var ids = MK.allGameIds();
  var notPlayed = ids.filter(function (g) { return MK.Engine.levelDoneCount(g) === 0; });
  if (notPlayed.length) return notPlayed[Math.floor(Math.random() * notPlayed.length)];
  var least = ids.slice().sort(function (a, b) { return MK.Engine.levelDoneCount(a) - MK.Engine.levelDoneCount(b); });
  return least[0];
};

/* ================= Enjin ================= */
MK.Engine = (function () {
  var progressCache = {};
  var loaded = false;
  var lastDiff = {}; // ingatan pilihan kesukaran per permainan (sesi ini)
  var active = null; // keadaan permainan aktif
  var cleanups = [];

  var GOOD = ["Hebat!", "Bagus!", "Syabas!", "Anda berjaya!", "Teruskan!"];
  var RETRY = ["Cuba lagi.", "Belum tepat.", "Mari cuba sekali lagi."];

  function init() {
    return MK.Store.getAll("progress").then(function (all) {
      (all || []).forEach(function (rec) { if (rec && rec.gameId) progressCache[rec.gameId] = rec; });
      loaded = true;
    });
  }
  function getProgress(gid) {
    if (!progressCache[gid]) progressCache[gid] = { gameId: gid, levels: {}, updated: 0 };
    return progressCache[gid];
  }
  function saveProgress(gid, level, diff, stars, mistakes, hints) {
    var pr = getProgress(gid);
    var L = pr.levels[level] || (pr.levels[level] = { done: false, stars: 0, best: 999, diffs: {} });
    L.done = true;
    L.stars = Math.max(L.stars || 0, stars || 0);
    L.best = Math.min(L.best == null ? 999 : L.best, mistakes == null ? 999 : mistakes);
    L.diffs[diff] = true;
    L.hintsUsed = (L.hintsUsed || 0) + (hints || 0);
    L.hints = L.hintsUsed > 0;
    pr.updated = Date.now();
    progressCache[gid] = pr;
    return MK.Store.put("progress", gid, pr);
  }
  function levelDoneCount(gid) {
    var pr = getProgress(gid);
    return Object.keys(pr.levels).filter(function (l) { return pr.levels[l] && pr.levels[l].done; }).length;
  }
  function totalStars(gid) {
    var pr = getProgress(gid);
    return Object.keys(pr.levels).reduce(function (a, l) { return a + ((pr.levels[l] && pr.levels[l].stars) || 0); }, 0);
  }
  function clearAllProgress() {
    progressCache = {};
    var jobs = Object.keys(MK.GAMES).map(function (gid) { return MK.Store.del("progress", gid); });
    return Promise.all(jobs);
  }

  function onCleanup(fn) { cleanups.push(fn); }
  function runCleanups() {
    cleanups.forEach(function (fn) { try { fn(); } catch (e) { } });
    cleanups = [];
  }

  /* ============ SKRIN PILIH LEVEL ============ */
  function open(gid) {
    var def = MK.gameDef(gid);
    if (!def) { MK.toast("Permainan tidak dijumpai."); return; }
    MK.Nav.go("levels", { id: gid });
  }

  function renderLevels(sc, p) {
    var def = MK.gameDef(p.id);
    if (!def) { MK.Nav.go("worlds", null, true); return; }
    var cat = MK.categoryById(def.cat);
    var diff = lastDiff[def.id] || MK.Settings.get("difficulty") || "sederhana";
    var done = levelDoneCount(def.id);
    var stars = totalStars(def.id);
    var nextLevel = 1;
    for (var i = 1; i <= 10; i++) { if (!(getProgress(def.id).levels[i] && getProgress(def.id).levels[i].done)) { nextLevel = i; break; } if (i === 10) nextLevel = 10; }

    MK.topbar(sc, '<span class="gi">' + def.icon + "</span> " + MK.esc(def.name), true,
      '<div class="chip"><span class="em">⭐</span>' + stars + "/30</div>");

    sc.appendChild(MK.h('<div class="cat-head"><div class="cicon" style="color:' + (cat ? cat.color : "#999") + '">' + def.icon + "</div>" +
      "<div><h2>" + MK.esc(def.name) + "</h2><p>" + MK.esc(cat ? cat.name : "") + " • Selesai " + done + "/10 level</p></div></div>"));

    if (def.desc) sc.appendChild(MK.h('<div class="game-desc">' + MK.esc(def.desc) + "</div>"));

    var pills = MK.h('<div class="diff-pills" role="group" aria-label="Tahap kesukaran">' +
      ["mudah", "sederhana", "cabaran"].map(function (d) {
        return '<button class="pill' + (d === diff ? " on" : "") + '" data-d="' + d + '">' + { mudah: "🙂 MUDAH", sederhana: "😐 SEDERHANA", cabaran: "😎 CABARAN" }[d] + "</button>";
      }).join("") + "</div>");
    pills.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-d]");
      if (!b) return;
      MK.Audio.sfx("tap");
      pills.querySelectorAll(".pill").forEach(function (x) { x.classList.toggle("on", x === b); });
    });
    sc.appendChild(pills);
    sc.appendChild(MK.el("div", "soft-note", "Tahap kesukaran mengubah bilangan objek, pilihan dan langkah — bukan sekadar nombor."));

    var grid = MK.el("div", "level-grid");
    for (var lv = 1; lv <= 10; lv++) {
      var pr = getProgress(def.id).levels[lv];
      var cls = "level-btn";
      var inner = lv + "";
      if (pr && pr.done) {
        cls += " done";
        var st = pr.stars || 0;
        inner = lv + '<div class="stars">' + (st >= 1 ? "⭐" : "☆") + (st >= 2 ? "⭐" : "☆") + (st >= 3 ? "⭐" : "☆") + "</div>";
      } else if (lv === nextLevel) cls += " next";
      var b = MK.el("button", cls, inner);
      b.setAttribute("aria-label", "Level " + lv + (pr && pr.done ? ", selesai dengan " + (pr.stars || 0) + " bintang" : ""));
      (function (lvv) {
        b.addEventListener("click", function () { startLevel(def.id, lvv, pills.querySelector(".on").dataset.d); });
      })(lv);
      grid.appendChild(b);
    }
    sc.appendChild(grid);

    var go2 = MK.el("button", "btn primary big", "▶ MULA LEVEL " + nextLevel);
    go2.addEventListener("click", function () { startLevel(def.id, nextLevel, pills.querySelector(".on").dataset.d); });
    sc.appendChild(go2);
    if (def.creative) sc.appendChild(MK.el("div", "soft-note", "Permainan kreatif — tiada skor, hanya seronok berkarya! Hasil boleh disimpan ke Galeri."));
  }

  /* ============ MULA LEVEL ============ */
  function startLevel(gid, level, diff) {
    var def = MK.gameDef(gid);
    if (!def) return;
    lastDiff[gid] = diff;
    runCleanups();
    MK.Nav.replace("game", { id: gid, level: level, diff: diff });
  }

  /* ============ SKRIN PERMAINAN ============ */
  function renderGame(sc, p) {
    var def = MK.gameDef(p.id);
    if (!def) { MK.Nav.go("worlds", null, true); return; }
    /* tutup sebarang overlay tahniah yang tertinggal daripada sesi sebelum ini */
    document.querySelectorAll(".overlay").forEach(function (ov) { if (ov.parentNode) ov.parentNode.removeChild(ov); });
    var level = Math.max(1, Math.min(10, p.level | 0));
    var diff = ["mudah", "sederhana", "cabaran"].indexOf(p.diff) >= 0 ? p.diff : "sederhana";

    var S = {
      def: def, level: level, diff: diff,
      taskIdx: 0, tasksTotal: 5, mistakes: 0, hintsUsed: 0,
      ctx: { ease: false, boost: false, recent: [], wrongRow: 0, okRow: 0 },
      task: null, done: false, locked: false, timerLeft: 0, timerId: null, keyHandler: null
    };
    active = S;

    /* --- kepala --- */
    var head = MK.h('<div class="game-top">' +
      '<button class="btn-round btn-back" aria-label="Kembali ke pilihan level">←</button>' +
      '<div class="game-title"><span class="gi">' + def.icon + "</span><span>" + MK.esc(def.name) + " • L" + level + "</span></div>" +
      '<div class="spacer"></div>' +
      (def.allowHint ? '<button class="btn-round" id="g-hint" aria-label="Bantuan">💡</button>' : "") +
      '<button class="btn-round" id="g-voice" aria-label="Dengar arahan">🔊</button>' +
      '<div class="chip timer-chip hidden" id="g-timer">⏱ <span>30</span></div>' +
      "</div>");
    head.querySelector(".btn-back").addEventListener("click", function () { exitToLevels(def.id); });
    sc.appendChild(head);

    /* --- baris arahan --- */
    var instruction = def.instruction ? def.instruction(level, diff) : "";
    var instBar = MK.h('<div class="instruction-bar"><div class="itext">' + instruction + '</div>' +
      '<button class="btn-round small" id="g-voice2" aria-label="Dengar arahan" style="width:44px;height:44px;min-height:44px;font-size:1.1rem">🔊</button></div>');
    sc.appendChild(instBar);

    var dots = MK.el("div", "progress-dots");
    sc.appendChild(dots);

    var mount = MK.el("div", "task-mount");
    sc.appendChild(mount);

    var feedback = MK.el("div", "feedback-line");
    sc.appendChild(feedback);

    /* --- timer --- */
    var tset = MK.Settings.get("timer");
    var timerChip = head.querySelector("#g-timer");
    function startTimer() {
      if (!def.allowTimer || tset === "off") return;
      S.timerLeft = tset === "30" ? 30 : 60;
      timerChip.classList.remove("hidden");
      timerChip.querySelector("span").textContent = S.timerLeft;
      S.timerId = setInterval(function () {
        S.timerLeft--;
        timerChip.querySelector("span").textContent = Math.max(0, S.timerLeft);
        timerChip.classList.toggle("warn", S.timerLeft <= 10);
        if (S.timerLeft <= 0) {
          stopTimer();
          timeUp();
        }
      }, 1000);
      onCleanup(stopTimer);
    }
    function stopTimer() { if (S.timerId) { clearInterval(S.timerId); S.timerId = null; } }
    function timeUp() {
      if (S.done) return;
      S.locked = true;
      stopTimer();
      var ov = MK.el("div", "overlay");
      ov.appendChild(MK.h('<div class="modal-card"><div class="mascot-wrap small mascot-happy">' + MK.mascotSVG("happy", 90) + "</div>" +
        "<h3>Masa sudah tamat</h3><p>Tak apa — tanpa tekanan! Kita boleh cuba lagi.</p>" +
        '<div class="row center wrap"><button class="btn ghost" data-a="back">Pilih Level</button><button class="btn primary" data-a="retry">Cuba Lagi</button></div></div>'));
      ov.addEventListener("click", function (ev) {
        var b = ev.target.closest("[data-a]");
        if (!b) return;
        ov.remove();
        if (b.dataset.a === "retry") startLevel(def.id, level, diff);
        else exitToLevels(def.id);
      });
      document.body.appendChild(ov);
    }

    /* --- suara arahan --- */
    function speakInstruction() {
      var t = instruction.replace(/<[^>]*>/g, " ");
      if (S.task && S.task.say && def.speakTask !== false) MK.TTS.speak(S.task.say);
      else MK.TTS.speak(t);
    }
    head.querySelector("#g-voice").addEventListener("click", function () { MK.Audio.sfx("tap"); speakInstruction(); });
    instBar.querySelector("#g-voice2").addEventListener("click", function () { MK.Audio.sfx("tap"); speakInstruction(); });

    /* --- maklum balas --- */
    function showFeedback(good, textOverride) {
      feedback.innerHTML = "";
      feedback.className = "feedback-line " + (good ? "good" : "retry");
      var mood = good ? "happy" : "think";
      var txt = textOverride || (good ? MK.Gen.pick(GOOD) : MK.Gen.pick(RETRY));
      feedback.appendChild(MK.mascotLine(mood, MK.esc(txt)));
      if (good) { MK.Audio.sfx("good"); }
      else { MK.Audio.sfx("retry"); }
      MK.announce(txt);
    }
    function showExplain(text) {
      if (!text) return;
      var ex = MK.el("div", "sub-prompt", "💡 " + MK.esc(text));
      feedback.parentNode && feedback.appendChild(ex);
    }

    /* --- kemajuan --- */
    function renderDots() {
      dots.innerHTML = "";
      var total = S.def.creative ? 1 : S.tasksTotal;
      for (var i = 0; i < total; i++) {
        var d = MK.el("div", "pdot" + (i < S.taskIdx ? " ok" : i === S.taskIdx ? " cur" : ""));
        dots.appendChild(d);
      }
    }

    /* --- tugas standard --- */
    function tasksPerLevel() {
      if (typeof def.tasksPerLevel === "function") return def.tasksPerLevel(level, diff);
      if (typeof def.tasksPerLevel === "number") return def.tasksPerLevel;
      return 5;
    }

    function generateQuestion() {
      var t = null, tries = 0;
      do {
        t = def.makeTask(level, diff, S.ctx);
        tries++;
      } while (t && t.key && S.ctx.recent.indexOf(t.key) >= 0 && tries < 6);
      if (t && t.key) {
        S.ctx.recent.push(t.key);
        if (S.ctx.recent.length > 8) S.ctx.recent.shift();
      }
      return t;
    }

    function nextTask() {
      if (S.done) return;
      if (S.taskIdx >= S.tasksTotal) { completeLevel({}); return; }
      S.task = generateQuestion();
      S.locked = false;
      mount.innerHTML = "";
      renderDots();
      if (!S.task) { completeLevel({}); return; }
      var kind = S.task.kind || def.engine;
      if (kind === "custom" || def.engine === "custom" || def.engine === "creative") {
        // ditangani oleh startLevelCustom
        startLevelCustom();
        return;
      }
      if (S.task.prompt) {
        var pr = MK.el("div", "prompt" + (S.task.small ? " small" : ""), S.task.prompt);
        mount.appendChild(pr);
      }
      if (S.task.sub) mount.appendChild(MK.el("div", "sub-prompt", S.task.sub));
      if (S.task.say && MK.Settings.get("voice")) MK.TTS.speak(S.task.say);
      if (kind === "quiz") renderQuiz(S.task);
      else if (kind === "multi") renderMulti(S.task);
      else if (kind === "match") renderMatch(S.task);
      else if (kind === "sort") renderSort(S.task);
      else if (kind === "order") renderOrder(S.task);
      else if (kind === "memory") renderMemory(S.task);
      else mount.appendChild(MK.el("div", "empty-note", "Format tugas tidak dikenali."));
    }

    function taskDone(explain) {
      S.locked = true;
      S.taskIdx++;
      renderDots();
      showFeedback(true);
      if (explain) showExplain(explain);
      setTimeout(function () {
        if (S.done) return;
        feedback.innerHTML = ""; 
        nextTask();
      }, MK.Settings.get("animation") ? 1150 : 650);
    }

    function answerWrong() {
      S.mistakes++;
      S.ctx.wrongRow++; S.ctx.okRow = 0;
      if (MK.Settings.get("adaptive")) {
        if (S.ctx.wrongRow >= 2) { S.ctx.ease = true; doHint(true); }
      }
      showFeedback(false);
    }
    function answerRight() {
      S.ctx.okRow++; S.ctx.wrongRow = 0;
      if (S.ctx.okRow >= 3 && MK.Settings.get("adaptive")) S.ctx.boost = true;
    }

    /* ---- QUIZ ---- */
    function renderQuiz(task) {
      var grid = MK.el("div", "choices" + (task.list ? " list" : "") + (task.choices.length <= 2 ? " c2" : ""));
      task.choices.forEach(function (c, i) {
        var b = MK.el("button", "choice" + (c.emoji ? "" : ""),
          (c.emoji ? '<span class="cem">' + c.emoji + "</span>" : "") + "<span>" + c.label + "</span>");
        if (task.choices.length >= 3 && !task.list) { /* ok */ }
        b.setAttribute("aria-label", "Pilihan " + (i + 1) + ": " + c.label.replace(/<[^>]*>/g, ""));
        b.addEventListener("click", function () {
          if (S.locked || b.classList.contains("dimmed")) return;
          if (c.correct) {
            S.locked = true;
            b.classList.add("correct");
            answerRight();
            taskDone(task.explain);
          } else {
            b.classList.add("dimmed", "shake-soft");
            setTimeout(function () { b.classList.remove("shake-soft"); }, 500);
            answerWrong();
          }
        });
        grid.appendChild(b);
      });
      mount.appendChild(grid);
    }

    /* ---- MULTI (pilih beberapa, kemudian semak) ---- */
    function renderMulti(task) {
      var grid = MK.el("div", "choices");
      var selected = {};
      task.choices.forEach(function (c) {
        var b = MK.el("button", "choice", (c.emoji ? '<span class="cem">' + c.emoji + "</span>" : "") + "<span>" + c.label + "</span>");
        b.addEventListener("click", function () {
          if (S.locked) return;
          MK.Audio.sfx("tap");
          if (selected[c.id]) { delete selected[c.id]; b.classList.remove("selected"); }
          else { selected[c.id] = true; b.classList.add("selected"); }
          confirmBtn.disabled = Object.keys(selected).length === 0;
        });
        c._btn = b;
        grid.appendChild(b);
      });
      mount.appendChild(grid);
      var confirmBtn = MK.el("button", "btn primary big", task.confirm || "✅ Semak Jawapan");
      confirmBtn.disabled = true;
      confirmBtn.addEventListener("click", function () {
        if (S.locked) return;
        var need = task.choices.filter(function (c) { return c.needed; });
        var sel = task.choices.filter(function (c) { return selected[c.id]; });
        var ok = need.length === sel.length && need.every(function (c) { return selected[c.id]; });
        if (ok) { S.locked = true; answerRight(); taskDone(task.explain); }
        else {
          answerWrong();
          Object.keys(selected).forEach(function (k) { delete selected[k]; });
          task.choices.forEach(function (c) { c._btn.classList.remove("selected"); });
          confirmBtn.disabled = true;
        }
      });
      mount.appendChild(confirmBtn);
      S._multiHint = function () {
        for (var i = 0; i < task.choices.length; i++) {
          var c = task.choices[i];
          if (c.needed && !selected[c.id]) {
            selected[c.id] = true; c._btn.classList.add("selected", "hinted");
            confirmBtn.disabled = false;
            MK.toast("Saya tunjukkan satu jawapan yang betul 💡");
            return;
          }
        }
      };
    }

    /* ---- MATCH ---- */
    function renderMatch(task) {
      var wrap = MK.el("div", "match-wrap");
      var selA = null, selB = null, matched = 0;
      var colA = MK.el("div", "match-col"), colB = MK.el("div", "match-col");
      var cols = MK.el("div", "match-cols");
      cols.appendChild(colA); cols.appendChild(colB);
      wrap.appendChild(cols);
      mount.appendChild(wrap);

      function isPartner(aId, bId) {
        return task.pairs.some(function (p) { return p.a.id === aId && p.b.id === bId; });
      }
      function checkPair() {
        if (!selA || !selB) return;
        if (isPartner(selA.dataset.pid, selB.dataset.pid)) {
          selA.classList.remove("sel"); selB.classList.remove("sel");
          selA.classList.add("locked"); selB.classList.add("locked");
          MK.Audio.sfx("match");
          matched++;
          selA = null; selB = null;
          if (matched >= task.pairs.length) { answerRight(); taskDone(task.explain); }
        } else {
          var a = selA, b = selB;
          a.classList.add("shake-soft"); b.classList.add("shake-soft");
          setTimeout(function () { a.classList.remove("sel", "shake-soft"); b.classList.remove("sel", "shake-soft"); }, 550);
          selA = null; selB = null;
          answerWrong();
        }
      }
      MK.Gen.shuffle(task.pairs).forEach(function (p, i) {
        var ta = MK.el("button", "mtile", (p.a.emoji ? '<span class="mem">' + p.a.emoji + "</span>" : "") + "<span>" + p.a.label + "</span>");
        ta.dataset.pid = p.a.id;
        ta.addEventListener("click", function () {
          if (ta.classList.contains("locked") || S.locked) return;
          MK.Audio.sfx("tap");
          if (selA === ta) { ta.classList.remove("sel"); selA = null; return; }
          if (selA) selA.classList.remove("sel");
          selA = ta; ta.classList.add("sel");
          checkPair();
        });
        // susun lajur kiri ikut tertib asal (diadun oleh penjana)
        var idxA = task.pairs.indexOf(p);
        colA.insertBefore(ta, colA.children[idxA] || null);
      });
      MK.Gen.shuffle(task.pairs).forEach(function (p) {
        var tb = MK.el("button", "mtile", (p.b.emoji ? '<span class="mem">' + p.b.emoji + "</span>" : "") + "<span>" + p.b.label + "</span>");
        tb.dataset.pid = p.b.id;
        tb.addEventListener("click", function () {
          if (tb.classList.contains("locked") || S.locked) return;
          MK.Audio.sfx("tap");
          if (selB === tb) { tb.classList.remove("sel"); selB = null; return; }
          if (selB) selB.classList.remove("sel");
          selB = tb; tb.classList.add("sel");
          checkPair();
        });
        colB.appendChild(tb);
      });
      S._matchHint = function () {
        var p = task.pairs.find(function (pp) {
          return !colA.querySelector('[data-pid="' + pp.a.id + '"]').classList.contains("locked");
        });
        if (!p) return;
        var ta = colA.querySelector('[data-pid="' + p.a.id + '"]');
        var tb = colB.querySelector('[data-pid="' + p.b.id + '"]');
        if (ta) ta.classList.add("hinted");
        if (tb) tb.classList.add("hinted");
        setTimeout(function () { if (ta) ta.classList.remove("hinted"); if (tb) tb.classList.remove("hinted"); }, 2600);
      };
    }

    /* ---- SORT ---- */
    function renderSort(task) {
      var binsRow = MK.el("div", "bins-row");
      var binEls = {};
      task.bins.forEach(function (bn) {
        var b = MK.el("button", "bin", '<span class="bem">' + bn.emoji + "</span><span>" + bn.label + '</span><div class="bin-items"></div>');
        b.dataset.bid = bn.id;
        binEls[bn.id] = b;
        b.addEventListener("click", function () {
          if (S.locked || !selItem) { if (!selItem) MK.toast("Pilih satu item dahulu 🙂"); return; }
          if (selItem.dataset.bin === bn.id) {
            var it = task.items.find(function (x) { return x.id === selItem.dataset.iid; });
            selItem.classList.add("placed");
            var em = MK.el("span", null, it.emoji || "✔");
            b.querySelector(".bin-items").appendChild(em);
            MK.Audio.sfx("place");
            placed++;
            selItem = null;
            if (placed >= task.items.length) { answerRight(); taskDone(task.explain); }
          } else {
            b.classList.add("shake-soft");
            setTimeout(function () { b.classList.remove("shake-soft"); }, 500);
            answerWrong();
          }
        });
        binsRow.appendChild(b);
      });
      var pool = MK.el("div", "sort-pool");
      var selItem = null, placed = 0;
      MK.Gen.shuffle(task.items).forEach(function (it) {
        var s = MK.el("button", "stile", '<span class="sem">' + (it.face || it.emoji) + "</span><span>" + it.label + "</span>");
        s.dataset.iid = it.id; s.dataset.bin = it.bin;
        s.addEventListener("click", function () {
          if (S.locked || s.classList.contains("placed")) return;
          MK.Audio.sfx("tap");
          if (task.onPick) { try { task.onPick(it); } catch (e) { } }
          if (selItem === s) { s.classList.remove("sel"); selItem = null; return; }
          if (selItem) selItem.classList.remove("sel");
          selItem = s; s.classList.add("sel");
        });
        pool.appendChild(s);
      });
      mount.appendChild(pool);
      mount.appendChild(binsRow);
      S._sortHint = function () {
        var it = task.items.find(function (x) {
          var el = pool.querySelector('[data-iid="' + x.id + '"]');
          return el && !el.classList.contains("placed");
        });
        if (!it) return;
        var el = pool.querySelector('[data-iid="' + it.id + '"]');
        var bn = binEls[it.bin];
        if (el) el.classList.add("hinted");
        if (bn) bn.classList.add("hot");
        setTimeout(function () { if (el) el.classList.remove("hinted"); if (bn) bn.classList.remove("hot"); }, 2600);
      };
    }

    /* ---- ORDER ---- */
    function renderOrder(task) {
      var slots = MK.el("div", "order-slots");
      var pool = MK.el("div", "order-pool");
      var placedIds = [];
      function renderSlots() {
        slots.innerHTML = "";
        placedIds.forEach(function (id) {
          var t = task.tokens.find(function (x) { return x.id === id; });
          var s = MK.el("button", "oslot", t.label);
          s.addEventListener("click", function () {
            if (S.locked) return;
            MK.Audio.sfx("tap");
            placedIds = placedIds.filter(function (x) { return x !== id; });
            pool.querySelector('[data-oid="' + id + '"]').classList.remove("used");
            renderSlots();
          });
          slots.appendChild(s);
        });
      }
      MK.Gen.shuffle(task.tokens).forEach(function (t) {
        var b = MK.el("button", "otoken", t.label);
        b.dataset.oid = t.id;
        b.addEventListener("click", function () {
          if (S.locked || b.classList.contains("used")) return;
          MK.Audio.sfx("tap");
          b.classList.add("used");
          placedIds.push(t.id);
          renderSlots();
          if (placedIds.length === task.answer.length) check();
        });
        pool.appendChild(b);
      });
      function check() {
        var ok = placedIds.every(function (id, i) { return task.answer[i] === id; });
        if (ok) {
          answerRight();
          if (task.success === "train") slots.classList.add("train-anim");
          MK.Audio.sfx("win");
          taskDone(task.explain);
        } else {
          answerWrong();
          slots.classList.add("shake-soft");
          setTimeout(function () { slots.classList.remove("shake-soft"); }, 550);
        }
      }
      mount.appendChild(slots);
      mount.appendChild(pool);
      S._orderHint = function () {
        // letak token yang betul seterusnya secara automatik
        for (var i = 0; i < task.answer.length; i++) {
          if (placedIds[i] !== task.answer[i]) {
            var needId = task.answer[i];
            // buang token salah yang berada di posisi ini
            var wrongAt = placedIds.indexOf(needId);
            if (wrongAt >= 0 && wrongAt !== i) {
              placedIds.splice(wrongAt, 1);
              var usedEl = pool.querySelector('[data-oid="' + needId + '"]');
              if (usedEl) usedEl.classList.remove("used");
            }
            var el = pool.querySelector('[data-oid="' + needId + '"]');
            if (el && !el.classList.contains("used")) {
              el.classList.add("used");
              placedIds.splice(i, 0, needId);
              renderSlots();
              /* jika urutan lengkap selepas bantuan, teruskan semakan (elak tersekat) */
              if (placedIds.length >= task.answer.length) check();
              MK.toast("Saya bantu letak satu perkataan 💡");
              return;
            }
          }
        }
      };
    }

    /* ---- MEMORY ---- */
    function renderMemory(task) {
      var n = task.pairs.length;
      var cols = task.cols || (n <= 3 ? 3 : n <= 4 ? 4 : 4);
      var grid = MK.el("div", "memory-grid");
      grid.style.gridTemplateColumns = "repeat(" + cols + ", minmax(64px, 88px))";
      var cards = [];
      var open = [], lock = false, matchedCount = 0, mismatches = 0;
      task.pairs.forEach(function (p, i) {
        [0, 1].forEach(function (side) {
          var c = MK.el("button", "mem-card");
          c.innerHTML = '<div class="mem-inner"><div class="mem-face mem-back">🦉</div>' +
            '<div class="mem-face mem-front"><span>' + (p.emoji || "❓") + '</span>' + (p.word ? '<span class="mword">' + MK.esc(p.word) + "</span>" : "") + "</div></div>";
          c.dataset.pid = p.id;
          c.addEventListener("click", function () {
            if (lock || S.locked || c.classList.contains("flip")) return;
            MK.Audio.sfx("flip");
            c.classList.add("flip");
            open.push(c);
            if (open.length === 2) {
              lock = true;
              var a = open[0], b = open[1];
              if (a.dataset.pid === b.dataset.pid) {
                setTimeout(function () {
                  a.classList.add("matched"); b.classList.add("matched");
                  MK.Audio.sfx("match");
                  matchedCount++; open = []; lock = false;
                  if (matchedCount >= n) {
                    S.mistakes += Math.floor(mismatches / 2);
                    answerRight(); taskDone(task.explain);
                  }
                }, 450);
              } else {
                mismatches++;
                setTimeout(function () {
                  a.classList.remove("flip"); b.classList.remove("flip");
                  open = []; lock = false;
                }, 900);
                showFeedback(false, "Cuba lagi. Ingat kad yang sama 🦉");
              }
            }
          });
          cards.push(c);
          grid.appendChild(c);
        });
      });
      // adun kad
      var shuffled = MK.Gen.shuffle(cards);
      shuffled.forEach(function (c) { grid.appendChild(c); });
      mount.appendChild(grid);
      S._memoryHint = function () {
        var hidden = shuffled.filter(function (c) { return !c.classList.contains("matched") && !c.classList.contains("flip"); });
        var byPid = {};
        hidden.forEach(function (c) { (byPid[c.dataset.pid] = byPid[c.dataset.pid] || []).push(c); });
        var pid = Object.keys(byPid).find(function (p) { return byPid[p].length >= 2; });
        if (!pid) return;
        byPid[pid].forEach(function (c) { c.classList.add("hinted"); setTimeout(function () { c.classList.remove("hinted"); }, 1800); });
      };
    }

    /* ---- CUSTOM / CREATIVE ---- */
    function startLevelCustom() {
      mount.innerHTML = "";
      dots.innerHTML = "";
      var api = {
        level: level, diff: diff, ctx: S.ctx, def: def, mount: mount,
        setPrompt: function (html) { instBar.querySelector(".itext").innerHTML = html; instruction = html.replace(/<[^>]*>/g, " "); },
        progress: function (done, total) {
          dots.innerHTML = "";
          for (var i = 0; i < total; i++) dots.appendChild(MK.el("div", "pdot" + (i < done ? " ok" : i === done ? " cur" : "")));
        },
        feedback: function (good, text) { showFeedback(good, text); },
        sfx: function (n) { MK.Audio.sfx(n); },
        speak: function (t) { MK.TTS.speak(t); },
        hint: function (fn) { S._customHint = fn; },
        onCleanup: onCleanup,
        complete: function (res) {
          if (S.done) return;
          res = res || {};
          S.mistakes = res.mistakes != null ? res.mistakes : S.mistakes;
          completeLevel(res);
        },
        finishCreative: function (statusText) {
          if (S.done) return;
          completeLevel({ creative: true, statusText: statusText });
        },
        saveCreative: function () {
          /* status 'Saved' — permainan kreatif memanggil ini selepas simpan galeri */
          S._savedCreative = true;
        }
      };
      S.locked = false;
      try {
        def.startLevel(mount, api);
      } catch (e) {
        console.error("Ralat permainan custom:", def.id, e);
        mount.appendChild(MK.el("div", "empty-note", "Ada masalah kecil, tetapi jangan risau — cuba permainan lain!"));
      }
    }

    /* ---- HINT ---- */
    function doHint(auto) {
      if (S.done) return;
      if (!def.allowHint) return;
      if (!auto) { S.hintsUsed++; MK.Rewards.checkAchievements("hint_used"); }
      MK.Audio.sfx("hint");
      var t = S.task || {};
      if (def.hintTask) { def.hintTask(t, mount); return; }
      var kind = t.kind || def.engine;
      if (kind === "quiz") {
        var choices = mount.querySelectorAll(".choice");
        var correctLabel = t.choices ? (t.choices.filter(function (c) { return c.correct; })[0] || {}) : {};
        var correctTxt = String(correctLabel.label || "").replace(/<[^>]*>/g, "");
        /* HANYA malapkan pilihan yang PASTI salah — jangan sesekali butang jawapan betul */
        var safe = [];
        choices.forEach(function (c) {
          if (c.classList.contains("correct") || c.classList.contains("dimmed")) return;
          if (correctTxt && c.textContent.indexOf(correctTxt) >= 0) return; /* teks sama dgn jawapan — jangan sentuh */
          safe.push(c);
        });
        var target = safe[Math.floor(Math.random() * safe.length)];
        if (target) {
          target.classList.add("dimmed");
          var remaining = mount.querySelectorAll(".choice:not(.dimmed)");
          if (remaining.length <= 2) remaining.forEach(function (r) { r.classList.add("hinted"); });
        } else {
          MK.TTS.speak("Cuba lagi, anda boleh buat!");
        }
      } else if (kind === "multi" && S._multiHint) S._multiHint();
      else if (kind === "match" && S._matchHint) S._matchHint();
      else if (kind === "sort" && S._sortHint) S._sortHint();
      else if (kind === "order" && S._orderHint) S._orderHint();
      else if (kind === "memory" && S._memoryHint) S._memoryHint();
      else if (S._customHint) S._customHint();
      else { MK.TTS.speak(instruction); }
      if (!auto) MK.toast("Jangan risau — meminta bantuan itu bijak! 💡");
    }
    var hintBtn = head.querySelector("#g-hint");
    if (hintBtn) hintBtn.addEventListener("click", function () { doHint(false); });

    /* ---- lengkap level ---- */
    function completeLevel(res) {
      if (S.done) return;
      S.done = true;
      stopTimer();
      runCleanups();
      var creative = def.creative || res.creative;
      var mistakes = res.mistakes != null ? res.mistakes : S.mistakes;
      var stars = creative ? 0 : MK.Rewards.starsFor(mistakes);
      if (res.stars != null && !creative) stars = Math.max(0, Math.min(3, res.stars));

      saveProgress(def.id, level, diff, stars, mistakes, S.hintsUsed + (res.hints || 0));
      var rw = MK.Rewards.levelComplete({ gameId: def.id, level: level, diff: diff, mistakes: mistakes, hints: S.hintsUsed, creative: creative });

      var actions = [];
      if (level < 10) actions.push({ label: "▶ Level " + (level + 1), primary: true, onClick: function () { startLevel(def.id, level + 1, diff); } });
      else actions.push({ label: "🎉 Semua level selesai!", primary: true, onClick: function () { exitToLevels(def.id); } });
      actions.push({ label: "Ulang level ini", primary: false, onClick: function () { startLevel(def.id, level, diff); } });
      actions.push({ label: "Pilih level lain", primary: false, onClick: function () { exitToLevels(def.id); } });

      MK.Rewards.celebrate({
        title: creative ? "Karya Hebat! 🎨" : (level >= 10 ? "SEMUA LEVEL SELESAI! 🎉" : "TAHNIAH! 🎉"),
        subtitle: def.name + " • Level " + level + " • " + { mudah: "Mudah", sederhana: "Sederhana", cabaran: "Cabaran" }[diff],
        stars: creative ? 0 : stars,
        coins: rw.coins,
        sticker: rw.sticker,
        trophy: rw.trophy,
        achievements: rw.achievements,
        statusText: creative ? (res.statusText || "Status: Dicipta") : null
      }, actions);
    }

    function exitToLevels(gid) {
      runCleanups();
      active = null;
      MK.Nav.replace("levels", { id: gid });
    }

    /* papan kekunci: Escape keluar, 1-9 pilih */
    S.keyHandler = function (ev) {
      if (ev.key === "Escape") { exitToLevels(def.id); return; }
      if (/^[1-9]$/.test(ev.key)) {
        var cs = mount.querySelectorAll(".choice:not(.dimmed)");
        var i = parseInt(ev.key, 10) - 1;
        if (cs[i]) cs[i].click();
      }
    };
    document.addEventListener("keydown", S.keyHandler);
    onCleanup(function () { document.removeEventListener("keydown", S.keyHandler); stopTimer(); });

    /* mula */
    if (def.engine === "custom" || def.engine === "creative") {
      S.tasksTotal = 1;
      startLevelCustom();
    } else {
      S.tasksTotal = tasksPerLevel();
      renderDots();
      nextTask();
    }
    startTimer();
    if (MK.Settings.get("voice") && instruction) setTimeout(function () { MK.TTS.speak(instruction.replace(/<[^>]*>/g, " ")); }, 350);
  }

  /* daftar skrin enjin pada navigasi */
  function wireNavigation() {
    MK.Nav.register("levels", renderLevels);
    MK.Nav.register("game", renderGame);
  }

  return {
    init: init, open: open, startLevel: startLevel,
    getProgress: getProgress, saveProgress: saveProgress,
    levelDoneCount: levelDoneCount, totalStars: totalStars,
    clearAllProgress: clearAllProgress,
    progressCache: progressCache,
    wireNavigation: wireNavigation,
    runCleanups: runCleanups,
    activeGame: function () { return active; }
  };
})();
MK.Engine.wireNavigation();
