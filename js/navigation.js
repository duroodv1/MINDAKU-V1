/* ============================================================
   MINDAKU V.1 — navigation.js
   Navigasi SPA: Utama, Dunia Permainan, Kategori, Tetapan,
   Profil, Pencapaian, Koleksi, Galeri. Navigasi mudah & ramal.
   ============================================================ */
"use strict";
MK.Nav = (function () {
  var stack = [];
  var screens = {};
  var root = null;

  function init() { root = document.getElementById("screen"); }

  function register(name, renderFn) { screens[name] = renderFn; }

  function go(name, params, noHistory) {
    if (!screens[name]) { console.warn("Skrin tiada:", name); return; }
    if (!noHistory && stack.length && stack[stack.length - 1].name === name &&
        JSON.stringify(stack[stack.length - 1].params || {}) === JSON.stringify(params || {})) return;
    if (!noHistory) stack.push({ name: name, params: params });
    render(name, params);
  }
  function replace(name, params) {
    if (stack.length) stack[stack.length - 1] = { name: name, params: params };
    render(name, params);
  }
  function back() {
    if (stack.length > 1) { stack.pop(); var cur = stack[stack.length - 1]; render(cur.name, cur.params); }
    else go("home", null, true);
  }
  function home() { stack = [{ name: "home", params: null }]; render("home", null); }

  function render(name, params) {
    try {
      if (root) {
        root.innerHTML = "";
        var sc = MK.el("div", "screen");
        root.appendChild(sc);
        screens[name](sc, params || {});
        root.scrollIntoView && window.scrollTo(0, 0);
      }
    } catch (e) {
      console.error("Ralat skrin:", name, e);
      if (root) {
        root.innerHTML = "";
        root.appendChild(MK.el("div", "screen", '<div class="empty-note"><span class="ee">ops</span>Maaf, ada masalah kecil. Sila kembali ke halaman utama.</div>'));
      }
    }
    MK.A11y.apply();
  }

  /* ---------- Komponen topbar ---------- */
  function topbar(sc, title, showBack, extraHtml) {
    var tb = MK.h('<div class="topbar">' +
      (showBack ? '<button class="btn-round btn-back" aria-label="Kembali">←</button>' : "") +
      '<div class="game-title" style="font-size:1.15rem">' + (title || "") + "</div>" +
      '<div class="spacer"></div>' + (extraHtml || "") + "</div>");
    if (showBack) tb.querySelector(".btn-back").addEventListener("click", function () { MK.Audio.sfx("tap"); back(); });
    sc.appendChild(tb);
    return tb;
  }
  MK.topbar = topbar;

  /* ================= SKRIN: UTAMA ================= */
  register("home", function (sc) {
    var P = MK.Profile.get();
    var s = P.stats ? P.stats() : {};
    var lastDef = P.lastGame ? MK.gameDef(P.lastGame) : null;

    var hero = MK.h(
      '<div class="home-hero">' +
      '<div class="mascot-wrap">' + MK.mascotSVG("wave") + "</div>" +
      '<div class="app-logo">MINDA<span class="accentdot">KU</span></div>' +
      '<div class="tagline">Belajar • Bermain • Berkembang</div>' +
      '<div class="subtag">50 Permainan Interaktif untuk Kanak-kanak 8–12 Tahun</div>' +
      "</div>"
    );
    sc.appendChild(hero);

    var prof = MK.h(
      '<div class="home-profile" role="button" tabindex="0" aria-label="Buka profil">' +
      '<div class="avatar">' + P.avatar + "</div>" +
      '<div style="flex:1;min-width:0"><div class="pname">' + MK.esc(P.nickname) + "</div>" +
      '<div class="pstats">' +
      '<span class="stat-pill">⭐ ' + s.stars + "</span>" +
      '<span class="stat-pill">🪙 ' + s.coins + "</span>" +
      '<span class="stat-pill">🏆 ' + s.trophies + "</span>" +
      '<span class="stat-pill">🔥 ' + s.streak + "</span>" +
      "</div></div><div style='font-size:1.3rem;color:var(--ink-faint)'>›</div></div>"
    );
    prof.addEventListener("click", function () { MK.Audio.sfx("tap"); go("profile"); });
    sc.appendChild(prof);

    var menu = MK.h(
      '<div class="menu-grid">' +
      '<button class="menu-tile wide play" data-nav="play"><span class="mi">▶</span> MULA BERMAIN</button>' +
      '<button class="menu-tile" data-nav="worlds"><span class="mi">🎮</span><span>DUNIA PERMAINAN</span></button>' +
      '<button class="menu-tile" data-nav="collection"><span class="mi">⭐</span><span>KOLEKSI</span></button>' +
      '<button class="menu-tile" data-nav="achievements"><span class="mi">🏆</span><span>PENCAPAIAN</span></button>' +
      '<button class="menu-tile" data-nav="gallery"><span class="mi">🎨</span><span>GALERI</span></button>' +
      '<button class="menu-tile" data-nav="settings"><span class="mi">⚙</span><span>TETAPAN</span></button>' +
      "</div>"
    );
    menu.addEventListener("click", function (ev) {
      var b = ev.target.closest("[data-nav]");
      if (!b) return;
      MK.Audio.sfx("tap");
      var n = b.dataset.nav;
      if (n === "play") {
        // MULA BERMAIN: teruskan permainan terakhir, atau cadangan bijak
        var target = lastDef ? lastDef.id : MK.suggestGame();
        MK.Engine.open(target);
      } else go(n);
    });
    sc.appendChild(menu);
    sc.appendChild(MK.el("div", "soft-note", "Semua permainan terbuka — pilih apa sahaja yang anda suka!"));
  });

  /* ================= SKRIN: DUNIA PERMAINAN ================= */
  register("worlds", function (sc) {
    topbar(sc, "🎮 Dunia Permainan", true);
    sc.appendChild(MK.el("div", "soft-note", "10 dunia • 50 permainan — semuanya boleh dimainkan"));
    var grid = MK.el("div", "cards-grid mt8");
    MK.CATEGORIES.forEach(function (cat) {
      var games = MK.gamesInCategory(cat.id);
      var done = games.filter(function (g) { return MK.Engine.levelDoneCount(g) >= 10; }).length;
      var stars = games.reduce(function (a, g) { return a + MK.Engine.totalStars(g); }, 0);
      var card = MK.h(
        '<button class="card" data-cat="' + cat.id + '">' +
        '<div class="cat-strip" style="background:' + cat.color + '"></div>' +
        '<div class="cicon">' + cat.icon + "</div>" +
        '<div class="cname">' + MK.esc(cat.name) + "</div>" +
        '<div class="cdesc">5 permainan</div>' +
        '<div class="cprog"><div class="progressbar"><span style="width:' + (done / 5 * 100) + '%"></span></div>' +
        "<span>⭐ " + stars + "</span></div></button>"
      );
      card.addEventListener("click", function () { MK.Audio.sfx("tap"); go("category", { id: cat.id }); });
      grid.appendChild(card);
    });
    sc.appendChild(grid);
  });

  /* ================= SKRIN: KATEGORI ================= */
  register("category", function (sc, p) {
    var cat = MK.categoryById(p.id);
    if (!cat) { go("worlds", null, true); return; }
    topbar(sc, cat.icon + " " + MK.esc(cat.name), true);
    sc.appendChild(MK.h('<div class="cat-head"><div class="cicon" style="color:' + cat.color + '">' + cat.icon + "</div>" +
      "<div><h2>" + MK.esc(cat.name) + "</h2><p>Pilih permainan yang anda suka</p></div></div>"));
    var row = MK.el("div", "game-row");
    MK.gamesInCategory(cat.id).forEach(function (gid) {
      var def = MK.gameDef(gid);
      if (!def) return;
      var doneCount = MK.Engine.levelDoneCount(gid);
      var stars = MK.Engine.totalStars(gid);
      var card = MK.h(
        '<button class="card">' +
        '<div class="cat-strip" style="background:' + cat.color + '"></div>' +
        '<div class="cicon">' + def.icon + "</div>" +
        '<div class="cname">' + MK.esc(def.name) + "</div>" +
        '<div class="cdesc">' + MK.esc(def.desc || "") + "</div>" +
        '<div class="cprog"><div class="progressbar"><span style="width:' + (doneCount / 10 * 100) + '%"></span></div>' +
        "<span>" + doneCount + "/10 • ⭐" + stars + "</span></div></button>"
      );
      card.addEventListener("click", function () { MK.Audio.sfx("tap"); MK.Engine.open(gid); });
      row.appendChild(card);
    });
    sc.appendChild(row);
  });

  /* ================= SKRIN: TETAPAN ================= */
  register("settings", function (sc) {
    topbar(sc, "⚙ Tetapan", true);

    function group(title) {
      var g = MK.el("div", "settings-group");
      g.appendChild(MK.el("h3", null, title));
      sc.appendChild(g);
      return g;
    }
    function toggleRow(g, label, desc, key) {
      var r = MK.h('<div class="set-row"><div><div class="slabel">' + label + "</div>" +
        (desc ? '<div class="sdesc">' + desc + "</div>" : "") + "</div>" +
        '<button class="switch' + (MK.Settings.get(key) ? " on" : "") + '" role="switch" aria-checked="' + !!MK.Settings.get(key) + '" aria-label="' + label + '"></button></div>');
      var sw = r.querySelector(".switch");
      sw.addEventListener("click", function () {
        MK.Settings.toggle(key);
        sw.classList.toggle("on", MK.Settings.get(key));
        sw.setAttribute("aria-checked", String(!!MK.Settings.get(key)));
        MK.Audio.sfx("tap");
        applySetting(key);
      });
      g.appendChild(r);
    }
    function segRow(g, label, desc, key, options) {
      var segHtml = options.map(function (o) {
        return '<button data-v="' + o.v + '" class="' + (String(MK.Settings.get(key)) === String(o.v) ? "on" : "") + '">' + o.l + "</button>";
      }).join("");
      var r = MK.h('<div class="set-row" style="flex-wrap:wrap"><div style="flex:1 1 100%"><div class="slabel">' + label + "</div>" +
        (desc ? '<div class="sdesc">' + desc + "</div>" : "") + "</div>" +
        '<div class="seg" style="flex:1 1 100%">' + segHtml + "</div></div>");
      r.querySelectorAll(".seg button").forEach(function (b) {
        b.addEventListener("click", function () {
          var v = b.dataset.v;
          MK.Settings.set(key, v);
          r.querySelectorAll(".seg button").forEach(function (x) { x.classList.toggle("on", x === b); });
          MK.Audio.sfx("tap");
          applySetting(key);
        });
      });
      g.appendChild(r);
    }

    function applySetting(key) {
      MK.A11y.apply();
      if (key === "music") { MK.Settings.get("music") ? MK.Audio.startMusic() : MK.Audio.stopMusic(); }
    }

    var gAudio = group("Audio");
    toggleRow(gAudio, "🎵 Muzik", "Muzik latar lembut (sedia kala: MATI)", "music");
    toggleRow(gAudio, "🔔 Kesan Bunyi", "Bunyi lembut ketika bermain", "sfx");
    toggleRow(gAudio, "🗣️ Suara", "Suara membaca arahan (jika disokong)", "voice");

    var gVisual = group("Paparan");
    toggleRow(gVisual, "🎬 Animasi", "Animasi lembut", "animation");
    toggleRow(gVisual, "🦋 Kurangkan Pergerakan", "Kurangkan semua pergerakan skrin", "reducedMotion");
    segRow(gVisual, "👁️ Mod Visual", "Paparan sesuai gaya anda", "visualMode", [
      { v: "normal", l: "Normal" }, { v: "reduced", l: "Kurang Visual" }, { v: "readability", l: "Bacaan Mudah" }
    ]);

    var gPlay = group("Cara Bermain");
    segRow(gPlay, "⏱️ Timer", "Sedia kala: MATI (tiada tekanan masa)", "timer", [
      { v: "off", l: "Tiada Had" }, { v: "30", l: "30 saat" }, { v: "60", l: "60 saat" }
    ]);
    segRow(gPlay, "📶 Tahap Kesukaran Asal", "Boleh ditukar dalam setiap permainan", "difficulty", [
      { v: "mudah", l: "MUDAH" }, { v: "sederhana", l: "SEDERHANA" }, { v: "cabaran", l: "CABARAN" }
    ]);
    toggleRow(gPlay, "🧠 Penyesuaian Automatik", "Kesukaran menyesuaik secara lembut dengan prestasi", "adaptive");

    var gApp = group("Aplikasi");
    var rInstall = MK.h('<div class="set-row"><div><div class="slabel">📲 Pasang Aplikasi</div><div class="sdesc">Pasang MINDAKU untuk guna luar talian</div></div><button class="btn small primary">Pasang</button></div>');
    rInstall.querySelector("button").addEventListener("click", function () { MK.installPWA(); });
    gApp.appendChild(rInstall);

    var rDiag = MK.h('<div class="set-row"><div><div class="slabel">🧪 Ujian Sistem</div><div class="sdesc">Semak semua 50 permainan berfungsi</div></div><button class="btn small">Uji</button></div>');
    rDiag.querySelector("button").addEventListener("click", function () { MK.SelfTest && MK.SelfTest.run(true); });
    gApp.appendChild(rDiag);

    var rReset = MK.h('<div class="set-row"><div><div class="slabel" style="color:#B3563C">🗑️ Padam Semua Kemajuan</div><div class="sdesc">Bintang, syiling, trofi & galeri akan dipadam</div></div><button class="btn small" style="border-color:#E09552;color:#9A6A2F">Padam</button></div>');
    rReset.querySelector("button").addEventListener("click", async function () {
      var okd = await MK.confirmBox("Padam semua kemajuan?", "Tindakan ini tidak boleh dibatalkan. Adakah anda pasti?", "Ya, padam", "Jangan");
      if (!okd) return;
      await MK.Engine.clearAllProgress();
      await MK.Gallery.list().then(function (items) { return Promise.all(items.map(function (it) { return MK.Gallery.remove(it.id); })); });
      await MK.Profile.resetAll();
      MK.toast("Kemajuan telah dipadam.");
      go("home", null, true);
    });
    gApp.appendChild(rReset);

    sc.appendChild(MK.el("div", "soft-note",
      "MINDAKU ialah aplikasi pendidikan & permainan pembelajaran. Ia tidak menggantikan guru, pakar, atau terapi. Semua data disimpan pada peranti anda sahaja."));
  });

  /* ================= SKRIN: PROFIL ================= */
  register("profile", function (sc) {
    var P = MK.Profile.get();
    topbar(sc, "👤 Profil Saya", true);
    var s = P.stats ? P.stats() : {};

    var head = MK.h('<div class="row center mt8"><div class="mascot-wrap small">' + MK.mascotSVG("happy") + "</div></div>");
    sc.appendChild(head);

    var nameBox = MK.h('<div class="mt12"><label class="slabel" style="font-weight:800;display:block;margin-bottom:6px">Nama panggilan saya</label>' +
      '<input class="text-input" id="nick-input" maxlength="20" value="' + MK.esc(P.nickname) + '" aria-label="Nama panggilan"></div>');
    sc.appendChild(nameBox);

    var avGrid = MK.h('<div class="avatar-grid mt12" role="group" aria-label="Pilih avatar"></div>');
    MK.Profile.AVATARS.forEach(function (a) {
      var b = MK.el("button", "avatar-btn" + (P.avatar === a ? " sel" : ""), a);
      b.setAttribute("aria-label", "Avatar " + a);
      b.addEventListener("click", function () {
        avGrid.querySelectorAll(".avatar-btn").forEach(function (x) { x.classList.remove("sel"); });
        b.classList.add("sel");
        MK.Profile.setProfile(null, a);
        MK.Audio.sfx("pop");
      });
      avGrid.appendChild(b);
    });
    sc.appendChild(MK.h('<div class="slabel mt12" style="font-weight:800">Avatar saya</div>'));
    sc.appendChild(avGrid);

    var stats = MK.h('<div class="stats-grid mt12">' +
      '<div class="stat-card"><div class="sv">' + s.games + "/50</div><div class='sl'>Permainan dicuba</div></div>" +
      '<div class="stat-card"><div class="sv">⭐ ' + s.stars + "</div><div class='sl'>Bintang</div></div>" +
      '<div class="stat-card"><div class="sv">🪙 ' + s.coins + "</div><div class='sl'>Syiling</div></div>" +
      '<div class="stat-card"><div class="sv">🏆 ' + s.trophies + "</div><div class='sl'>Trofi</div></div>" +
      '<div class="stat-card"><div class="sv">🔥 ' + s.streak + "</div><div class='sl'>Hari berturut</div></div>" +
      '<div class="stat-card"><div class="sv">🎨 <span id="gal-count">…</span></div><div class="sl">Karya galeri</div></div>' +
      "</div>");
    sc.appendChild(stats);
    MK.Gallery.count().then(function (n) { var e = document.getElementById("gal-count"); if (e) e.textContent = n; });

    var saveBtn = MK.el("button", "btn primary big mt12", "Simpan Nama");
    saveBtn.addEventListener("click", function () {
      var v = document.getElementById("nick-input").value;
      MK.Profile.setProfile(v, null);
      MK.toast("Disimpan! Hebat, " + MK.esc(v.trim() || "Rakan MINDAKU") + "!");
      MK.Audio.sfx("good");
    });
    sc.appendChild(saveBtn);

    if (P.history && P.history.length) {
      sc.appendChild(MK.el("div", "section-title", "🕐 Baru Dimainkan"));
      var hist = MK.el("div", "settings-group");
      P.history.slice(0, 6).forEach(function (h) {
        var def = MK.gameDef(h.game);
        if (!def) return;
        var r = MK.h('<div class="ach-row"><div class="ach-ico">' + def.icon + '</div><div style="flex:1"><div class="an">' + MK.esc(def.name) + '</div><div class="ad">Level ' + h.level + " baru dimainkan</div></div></div>");
        r.addEventListener("click", function () { MK.Engine.open(h.game); });
        r.style.cursor = "pointer";
        hist.appendChild(r);
      });
      sc.appendChild(hist);
    }
  });

  /* ================= SKRIN: PENCAPAIAN ================= */
  register("achievements", function (sc) {
    var P = MK.Profile.get();
    topbar(sc, "🏆 Pencapaian", true);
    sc.appendChild(MK.h('<div class="soft-note">' + P.achievements.length + " / " + MK.Rewards.ACHIEVEMENTS.length + " pencapaian dibuka</div>"));
    var g = MK.el("div", "settings-group");
    MK.Rewards.ACHIEVEMENTS.forEach(function (a) {
      var got = P.achievements.indexOf(a.id) >= 0;
      g.appendChild(MK.h('<div class="ach-row' + (got ? " got" : " locked") + '">' +
        '<div class="ach-ico">' + (got ? a.icon : "🔒") + "</div>" +
        '<div style="flex:1"><div class="an">' + MK.esc(a.name) + '</div><div class="ad">' + MK.esc(a.desc) + "</div></div>" +
        (got ? '<div class="badge gold">DIBUKA</div>' : "") + "</div>"));
    });
    sc.appendChild(g);
  });

  /* ================= SKRIN: KOLEKSI ================= */
  register("collection", function (sc) {
    var P = MK.Profile.get();
    var s = P.stats ? P.stats() : {};
    topbar(sc, "⭐ Koleksi", true);
    sc.appendChild(MK.h('<div class="stats-grid">' +
      '<div class="stat-card"><div class="sv">⭐ ' + s.stars + "</div><div class='sl'>Jumlah Bintang</div></div>" +
      '<div class="stat-card"><div class="sv">🪙 ' + s.coins + "</div><div class='sl'>Syiling</div></div>" +
      '<div class="stat-card"><div class="sv">🔥 ' + s.streak + "</div><div class='sl'>Rentetan Hari</div></div>" +
      '<div class="stat-card"><div class="sv">🏆 ' + s.trophies + "</div><div class='sl'>Trofi</div></div></div>"));

    sc.appendChild(MK.el("div", "section-title", "🎁 Album Pelekat (" + P.stickers.length + "/50)"));
    sc.appendChild(MK.el("div", "soft-note", "Selesaikan satu level dalam setiap permainan untuk membuka pelekatnya"));
    var grid = MK.el("div", "sticker-grid");
    MK.CATEGORIES.forEach(function (cat) {
      MK.gamesInCategory(cat.id).forEach(function (gid) {
        var def = MK.gameDef(gid);
        var got = P.stickers.indexOf(gid) >= 0;
        grid.appendChild(MK.h('<div class="sticker' + (got ? " got" : "") + '"><div class="sem">' + (got ? def.sticker : "❔") + '</div><div class="snm">' + (got ? MK.esc(def.name) : "?") + "</div></div>"));
      });
    });
    sc.appendChild(grid);

    sc.appendChild(MK.el("div", "section-title", "🏆 Trofi Permainan"));
    var tg = MK.el("div", "sticker-grid");
    var allGames = MK.allGameIds();
    allGames.forEach(function (gid) {
      var def = MK.gameDef(gid);
      var got = P.trophies.indexOf("game:" + gid) >= 0;
      tg.appendChild(MK.h('<div class="sticker' + (got ? " got" : "") + '"><div class="sem">' + (got ? "🏆" : "🔒") + '</div><div class="snm">' + MK.esc(def.name) + "</div></div>"));
    });
    sc.appendChild(tg);

    sc.appendChild(MK.el("div", "section-title", "🎖️ Trofi Dunia"));
    var cg = MK.el("div", "sticker-grid");
    MK.CATEGORIES.forEach(function (cat) {
      var got = P.trophies.indexOf("cat:" + cat.id) >= 0;
      cg.appendChild(MK.h('<div class="sticker' + (got ? " got" : "") + '"><div class="sem">' + (got ? cat.icon : "🔒") + '</div><div class="snm">' + MK.esc(cat.name) + "</div></div>"));
    });
    sc.appendChild(cg);
  });

  /* ================= SKRIN: GALERI ================= */
  register("gallery", function (sc) {
    topbar(sc, "🎨 Galeri Saya", true);
    var box = MK.el("div", "");
    sc.appendChild(box);
    MK.Gallery.list().then(function (items) {
      box.innerHTML = "";
      if (!items.length) {
        box.appendChild(MK.el("div", "empty-note", '<span class="ee">🎨</span>Belum ada karya.<br>Lukis di <b>Kaleidoscope Paint</b>, warnakan di <b>Color by Number</b>, atau bina di <b>Build & Create</b>!'));
        return;
      }
      var grid = MK.el("div", "gal-grid");
      items.forEach(function (it) {
        var visual = it.type === "svg" ? it.data : '<img src="' + it.data + '" alt="' + MK.esc(it.name) + '">';
        var item = MK.h('<div class="gal-item"><div class="gal-visual">' + visual + "</div>" +
          '<div class="gmeta"><span>' + MK.esc(it.name) + '</span><button class="gdel" aria-label="Padam karya">🗑️</button></div></div>');
        item.querySelector(".gdel").addEventListener("click", async function (ev) {
          ev.stopPropagation();
          var okd = await MK.confirmBox("Padam karya ini?", "Karya akan dipadam daripada galeri.", "Padam", "Batal");
          if (!okd) return;
          await MK.Gallery.remove(it.id);
          MK.toast("Karya dipadam.");
          go("gallery", {}, true);
        });
        grid.appendChild(item);
      });
      box.appendChild(grid);
      box.appendChild(MK.el("div", "soft-note", items.length + " karya disimpan pada peranti anda"));
    }).catch(function () {
      box.innerHTML = "";
      box.appendChild(MK.el("div", "empty-note", '<span class="ee">🎨</span>Galeri tidak dapat dibuka sekarang, tetapi anda masih boleh bermain!'));
    });
  });

  return { init: init, go: go, back: back, home: home, replace: replace, register: register };
})();
