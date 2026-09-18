/* ============================================================
   MINDAKU V.1 — profile.js
   Profil tempatan (tanpa akaun Internet): nama, avatar,
   statistik, sejarah, kemajuan permainan.
   ============================================================ */
"use strict";
MK.Profile = (function () {
  var AVATARS = ["🦉", "🐯", "🐼", "🦊", "🐨", "🦁", "🐸", "🐬", "🦄", "🐢", "🦋", "🐝"];

  var DEFAULT = {
    nickname: "Rakan MINDAKU",
    avatar: "🦉",
    createdAt: null,
    gamesPlayedSet: [],          // senarai id permainan yang pernah dimainkan
    totalStars: 0, coins: 0,
    stickers: [],                // id permainan → pelekat koleksi
    trophies: [],                // "game:<id>" | "cat:<id>"
    achievements: [],            // id pencapaian
    perfectLevels: 0,            // level 3 bintang
    noHintLevels: 0,
    streak: { count: 0, lastDate: null },
    lastGame: null,
    history: []                  // {game, level, when}
  };
  var P = JSON.parse(JSON.stringify(DEFAULT));

  function todayStr() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function daysBetween(a, b) {
    if (!a || !b) return 99;
    return Math.round((new Date(b) - new Date(a)) / 86400000);
  }

  function load() {
    return MK.Store.get("profile", "main").then(function (saved) {
      if (saved) { P = Object.assign(JSON.parse(JSON.stringify(DEFAULT)), saved); }
      if (!P.createdAt) P.createdAt = todayStr();
      return P;
    });
  }
  function save() { return MK.Store.put("profile", "main", P); }

  function get() { return P; }

  function setProfile(nickname, avatar) {
    if (nickname != null && String(nickname).trim()) P.nickname = String(nickname).trim().slice(0, 20);
    if (avatar) P.avatar = avatar;
    return save();
  }

  function markGamePlayed(gameId) {
    if (P.gamesPlayedSet.indexOf(gameId) < 0) P.gamesPlayedSet.push(gameId);
    P.lastGame = gameId;
    touchStreak();
    save();
  }
  function addHistory(gameId, level) {
    P.history.unshift({ game: gameId, level: level, when: Date.now() });
    if (P.history.length > 12) P.history.length = 12;
  }

  function touchStreak() {
    var today = todayStr();
    if (P.streak.lastDate === today) return;
    var gap = daysBetween(P.streak.lastDate, today);
    P.streak.count = (gap === 1) ? P.streak.count + 1 : 1;
    P.streak.lastDate = today;
  }

  function has(id) { return P.achievements.indexOf(id) >= 0; }
  function addAchievement(id) {
    if (P.achievements.indexOf(id) >= 0) return false;
    P.achievements.push(id);
    return true;
  }
  function addSticker(gameId) {
    if (P.stickers.indexOf(gameId) >= 0) return false;
    P.stickers.push(gameId);
    return true;
  }
  function addTrophy(t) {
    if (P.trophies.indexOf(t) >= 0) return false;
    P.trophies.push(t);
    return true;
  }
  function addStars(n) { P.totalStars += Math.max(0, n | 0); }
  function addCoins(n) { P.coins += Math.max(0, n | 0); if (P.coins < 0) P.coins = 0; }

  function stats() {
    return {
      games: P.gamesPlayedSet.length,
      stars: P.totalStars,
      coins: P.coins,
      trophies: P.trophies.length,
      stickers: P.stickers.length,
      streak: P.streak.count,
      achievements: P.achievements.length
    };
  }

  function resetAll() {
    P = JSON.parse(JSON.stringify(DEFAULT));
    P.createdAt = todayStr();
    return save();
  }

  return {
    AVATARS: AVATARS, load: load, save: save, get: get, stats: stats,
    setProfile: setProfile, markGamePlayed: markGamePlayed, addHistory: addHistory,
    addStars: addStars, addCoins: addCoins, addSticker: addSticker, addTrophy: addTrophy,
    has: has, addAchievement: addAchievement, todayStr: todayStr, resetAll: resetAll
  };
})();
