/* ============================================================
   MINDAKU V.1 — gallery.js (GALERI SAYA)
   Simpan / lihat / padam karya kreatif.
   Menyokong: lukisan kanvas, color-by-number (SVG), binaan.
   Lukisan besar dimampatkan supaya jimat ruang storan peranti.
   ============================================================ */
"use strict";
MK.Gallery = (function () {

  function save(item) {
    /* item: {gameId, name, type:'canvas'|'svg', data(dataURL/svg-string), thumb?} */
    var rec = Object.assign({
      gameId: null, name: "Karya Saya", type: "canvas",
      data: null, date: Date.now()
    }, item);
    if (!rec.data) return Promise.reject(new Error("tiada data"));
    return MK.Store.put("gallery", null, rec).then(function (r) {
      if (r == null) throw new Error("storan gagal");
      return MK.Gallery.count().then(function (n) {
        MK.Rewards.checkAchievements(n >= 5 ? "gallery_5" : "gallery_1");
        return rec;
      });
    });
  }

  function list() { return MK.Store.getAll("gallery").then(function (all) { return all.sort(function (a, b) { return b.date - a.date; }); }); }
  function count() { return list().then(function (l) { return l.length; }); }
  function remove(id) { return MK.Store.del("gallery", id); }

  /* Kanvas → dataURL (PNG). Jika terlalu besar, kecilkan & mampat
     (JPEG 85%, maks 720px sisi panjang) — masih jelas untuk galeri
     kanak-kanak tetapi selamat untuk kuota storan peranti. */
  function canvasData(canvas) {
    var MAX = 720, LIMIT = 420000;   /* ~300KB binari */
    var data = null;
    try { data = canvas.toDataURL("image/png"); } catch (e) { data = null; }
    if (!data || data.length < 32) return null;
    if (data.length <= LIMIT) return data;
    try {
      var w = canvas.width, h = canvas.height;
      var sc = Math.min(1, MAX / Math.max(w, h));
      var c2 = document.createElement("canvas");
      c2.width = Math.max(1, Math.round(w * sc));
      c2.height = Math.max(1, Math.round(h * sc));
      var ctx = c2.getContext("2d");
      ctx.fillStyle = "#FBF8F1";                       /* latar krem apl */
      ctx.fillRect(0, 0, c2.width, c2.height);
      ctx.drawImage(canvas, 0, 0, c2.width, c2.height);
      var dj = c2.toDataURL("image/jpeg", 0.85);
      if (dj && dj.length > 32 && dj.length < data.length) return dj;
    } catch (e2) { /* guna PNG asal */ }
    return data;
  }

  /* Simpan kanvas sebagai dataURL */
  function saveCanvas(canvas, gameId, name) {
    var data = canvasData(canvas);
    if (!data) return Promise.reject(new Error("kanvas kosong"));
    return save({ gameId: gameId, name: name || "Lukisan", type: "canvas", data: data });
  }
  function saveSVG(svgString, gameId, name) {
    return save({ gameId: gameId, name: name || "Karya", type: "svg", data: svgString });
  }

  return { save: save, saveCanvas: saveCanvas, saveSVG: saveSVG, canvasData: canvasData, list: list, count: count, remove: remove };
})();
