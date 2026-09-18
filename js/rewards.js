/* ============================================================
   MINDAKU V.1 — rewards.js
   Bintang, syiling, trofi, pelekat, pencapaian, rentetan (streak)
   dan animasi tahniah yang lembut.
   ============================================================ */
"use strict";
MK.Rewards = (function () {

  /* ---------- Definisi pencapaian ---------- */
  var ACHIEVEMENTS = [
    { id: "first_game", icon: "🎮", name: "Langkah Pertama", desc: "Main permainan pertama anda" },
    { id: "games_5", icon: "🌟", name: "Penjelajah Muda", desc: "Cuba 5 permainan berbeza" },
    { id: "games_10", icon: "🚀", name: "Penjelajah Penuh Semangat", desc: "Cuba 10 permainan berbeza" },
    { id: "games_25", icon: "🗺️", name: "Pengembara Dunia", desc: "Cuba 25 permainan berbeza" },
    { id: "games_50", icon: "👑", name: "Juara MINDAKU", desc: "Cuba semua 50 permainan" },
    { id: "stars_25", icon: "⭐", name: "Penukil Bintang", desc: "Kumpul 25 bintang" },
    { id: "stars_100", icon: "✨", name: "Ribuan Bersinar", desc: "Kumpul 100 bintang" },
    { id: "stars_300", icon: "🌠", name: "Langit Berkilau", desc: "Kumpul 300 bintang" },
    { id: "coins_100", icon: "🪙", name: "Penjimat Bijak", desc: "Kumpul 100 syiling" },
    { id: "streak_3", icon: "🔥", name: "Tiga Hari Berturut", desc: "Main 3 hari berturut-turut" },
    { id: "streak_7", icon: "🔥", name: "Satu Minggu Setia", desc: "Main 7 hari berturut-turut" },
    { id: "level_first", icon: "🎓", name: "Level Pertama Selesai", desc: "Selesaikan satu level" },
    { id: "levels_25", icon: "📚", name: "Pelajar Rajin", desc: "Selesaikan 25 level" },
    { id: "levels_100", icon: "🏅", name: "Master Level", desc: "Selesaikan 100 level" },
    { id: "perfect_5", icon: "💎", name: "Sempurna!", desc: "5 level tanpa kesilapan (3 bintang)" },
    { id: "nohint_5", icon: "💡", name: "Bijak Sendiri", desc: "5 level selesai tanpa bantuan" },
    { id: "game_done_1", icon: "🏆", name: "Trofi Pertama", desc: "Selesaikan semua level satu permainan" },
    { id: "cat_done_1", icon: "🎖️", name: "Pakar Kategori", desc: "Selesaikan semua 5 permainan dalam satu kategori" },
    { id: "cats_done_all", icon: "🌹", name: "Pakar Semua Dunia", desc: "Selesaikan semua 10 kategori" },
    { id: "gallery_1", icon: "🎨", name: "Artis Muda", desc: "Simpan karya pertama ke Galeri" },
    { id: "gallery_5", icon: "🖼️", name: "Galeri Berkembang", desc: "Simpan 5 karya ke Galeri" },
    { id: "hint_used", icon: "🤝", name: "Berani Bertanya", desc: "Gunakan butang bantuan — itu tanda bijak!" }
  ];

  /* Kiraan global (dikira semula dari progress) */
  var counters = { levels: 0, perfect: 0, noHint: 0, gamesDone: 0, catsDone: 0 };

  function recount() {
    counters.levels = 0; counters.perfect = 0; counters.noHint = 0; counters.gamesDone = 0;
    var cats = {};
    Object.keys(MK.Engine ? MK.Engine.progressCache : {}).forEach(function (gid) {
      var pr = MK.Engine.progressCache[gid];
      if (!pr || !pr.levels) return;
      var done = 0;
      Object.keys(pr.levels).forEach(function (ln) {
        var L = pr.levels[ln];
        if (L && L.done) {
          done++;
          counters.levels++;
          if (L.stars >= 3) counters.perfect++;
          if (!L.hints || L.hints === 0) counters.noHint++;
        }
      });
      if (done >= 10) { counters.gamesDone++; cats[MK.gameDef(gid).cat] = (cats[MK.gameDef(gid).cat] || 0) + 1; }
    });
    counters.catsDone = Object.keys(cats).filter(function (c) { return cats[c] >= 5; }).length;
    return counters;
  }

  /* Semak & buka pencapaian baharu. Pulangkan senarai yang baru dibuka. */
  function checkAchievements(extra) {
    var P = MK.Profile.get();
    var s = P.stats ? P.stats() : {};
    var got = [];
    function chk(id, cond) {
      if (cond && MK.Profile.addAchievement(id)) got.push(id);
    }
    var c = counters || recount();
    chk("first_game", P.gamesPlayedSet.length >= 1);
    chk("games_5", P.gamesPlayedSet.length >= 5);
    chk("games_10", P.gamesPlayedSet.length >= 10);
    chk("games_25", P.gamesPlayedSet.length >= 25);
    chk("games_50", P.gamesPlayedSet.length >= 50);
    chk("stars_25", P.totalStars >= 25);
    chk("stars_100", P.totalStars >= 100);
    chk("stars_300", P.totalStars >= 300);
    chk("coins_100", P.coins >= 100);
    chk("streak_3", P.streak.count >= 3);
    chk("streak_7", P.streak.count >= 7);
    chk("level_first", c.levels >= 1);
    chk("levels_25", c.levels >= 25);
    chk("levels_100", c.levels >= 100);
    chk("perfect_5", c.perfect >= 5);
    chk("nohint_5", c.noHint >= 5);
    chk("game_done_1", c.gamesDone >= 1);
    chk("cat_done_1", c.catsDone >= 1);
    chk("cats_done_all", c.catsDone >= 10);
    if (extra === "gallery_1") chk("gallery_1", true);
    if (extra === "gallery_5") chk("gallery_5", true);
    if (extra === "hint_used") chk("hint_used", true);
    if (got.length) MK.Profile.save();
    return got.map(function (id) { return ACHIEVEMENTS.find(function (a) { return a.id === id; }); });
  }

  /* ---------- Kiraan ganjaran level ---------- */
  function starsFor(mistakes) {
    if (mistakes <= 0) return 3;
    if (mistakes <= 2) return 2;
    return 1;
  }
  function coinsFor(level, stars) {
    return 3 + stars * 2 + Math.floor((level - 1) / 3); // 5..12 — lembut
  }

  /* ---------- Selesai level ---------- */
  function levelComplete(info) {
    /* info: {gameId, level, diff, mistakes, hints, creative} */
    var P = MK.Profile.get();
    var def = MK.gameDef(info.gameId);
    var out = { stars: 0, coins: 0, sticker: null, trophy: null, achievements: [], stickersTotal: P.stickers.length, firstTime: false };

    if (info.creative) {
      out.stars = 0; out.coins = 2; // ganjaran kecil, tanpa skor
    } else {
      out.stars = starsFor(info.mistakes || 0);
      out.coins = coinsFor(info.level, out.stars);
    }
    MK.Profile.addStars(out.stars);
    MK.Profile.addCoins(out.coins);
    MK.Profile.markGamePlayed(info.gameId);
    MK.Profile.addHistory(info.gameId, info.level);

    // Pelekat koleksi: satu per permainan (kali pertama selesai level)
    var stickerEmoji = def ? def.sticker : "🎁";
    if (MK.Profile.addSticker(info.gameId)) out.sticker = { emoji: stickerEmoji, name: def ? def.name : info.gameId };

    recount();
    // Trofi permainan: semua 10 level selesai
    if (def) {
      var pr = MK.Engine.getProgress(info.gameId);
      var doneCount = Object.keys(pr.levels || {}).filter(function (l) { return pr.levels[l] && pr.levels[l].done; }).length;
      if (doneCount >= 10 && MK.Profile.addTrophy("game:" + info.gameId)) {
        out.trophy = { icon: "🏆", name: def.name, desc: "Semua 10 level selesai!" };
      }
      // Trofi kategori
      var catGames = MK.gamesInCategory(def.cat);
      var catDone = catGames.every(function (g) {
        var p = MK.Engine.getProgress(g);
        return Object.keys(p.levels || {}).filter(function (l) { return p.levels[l] && p.levels[l].done; }).length >= 10;
      });
      if (catDone && MK.Profile.addTrophy("cat:" + def.cat)) {
        out.trophy = { icon: "🎖️", name: MK.categoryById(def.cat).name, desc: "Semua 5 permainan selesai!" };
      }
    }
    recount();
    out.achievements = checkAchievements();
    MK.Profile.save();
    return out;
  }

  /* ---------- Animasi tahniah (lembut, boleh dimatikan) ---------- */
  function celebrate(opts, actions) {
    /* opts: {title, stars, coins, sticker, trophy, achievements, creative, statusText}
       actions: [{label, primary, onClick}] */
    var anim = MK.Settings.get("animation");
    var ov = MK.el("div", "overlay");
    var starsHtml = "";
    if (opts.stars) {
      for (var i = 0; i < 3; i++) starsHtml += "<span>" + (i < opts.stars ? "⭐" : "☆") + "</span>";
    }
    var pills = "";
    if (opts.coins) pills += '<div class="reward-pill">🪙 +' + opts.coins + " syiling</div>";
    if (opts.sticker) pills += '<div class="reward-pill">' + opts.sticker.emoji + " Pelekat baharu!</div>";
    if (opts.trophy) pills += '<div class="reward-pill">' + opts.trophy.icon + " " + MK.esc(opts.trophy.name) + "</div>";
    (opts.achievements || []).forEach(function (a) {
      pills += '<div class="reward-pill">' + a.icon + " " + MK.esc(a.name) + "</div>";
    });
    var acts = (actions && actions.length ? actions : [{ label: "Teruskan", primary: true, onClick: null }]);
    var actHtml = acts.map(function (a, i) {
      return '<button class="btn ' + (a.primary ? "primary" : "ghost") + '" data-i="' + i + '">' + MK.esc(a.label) + "</button>";
    }).join("");

    var card = MK.h(
      '<div class="overlay-card" role="dialog" aria-modal="true">' +
      '<div class="mascot-wrap small mascot-clap">' + MK.mascotSVG("clap", 92) + "</div>" +
      '<h2>' + MK.esc(opts.title || "TAHNIAH! 🎉") + "</h2>" +
      (opts.subtitle ? '<div class="ov-sub">' + MK.esc(opts.subtitle) + "</div>" : "") +
      (starsHtml ? '<div class="reward-stars">' + starsHtml + "</div>" : "") +
      (opts.statusText ? '<div class="ov-sub">' + MK.esc(opts.statusText) + "</div>" : "") +
      (pills ? '<div class="reward-row">' + pills + "</div>" : "") +
      '<div class="overlay-actions">' + actHtml + "</div></div>"
    );
    if (!anim) card.querySelectorAll(".reward-pill,.reward-stars span").forEach(function (e) { e.style.animation = "none"; });
    ov.appendChild(card);
    ov.addEventListener("click", function (ev) {
      var b = ev.target.closest("button[data-i]");
      if (!b) return;
      var i = parseInt(b.dataset.i, 10);
      var a = acts[i];
      if (ov.parentNode) ov.parentNode.removeChild(ov);
      MK.Audio.sfx("tap");
      if (a && a.onClick) a.onClick();
    });
    document.body.appendChild(ov);
    MK.announce((opts.title || "Tahniah") + (opts.stars ? ", " + opts.stars + " bintang" : ""));
    if (MK.Settings.get("sfx")) MK.Audio.sfx(opts.stars === 3 ? "win" : "good");
    return ov;
  }

  return {
    ACHIEVEMENTS: ACHIEVEMENTS, levelComplete: levelComplete, celebrate: celebrate,
    checkAchievements: checkAchievements, recount: recount, starsFor: starsFor
  };
})();
