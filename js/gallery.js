/* ============================================================
   MINDAKU V.1 — gallery.js (GALERI SAYA)
   Simpan / lihat / padam karya kreatif (IndexedDB).
   Menyokon: lukisan kanvas, color-by-number (SVG), binaan.
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
    return MK.Store.put("gallery", null, rec).then(function () {
      return MK.Gallery.count().then(function (n) {
        MK.Rewards.checkAchievements(n >= 5 ? "gallery_5" : "gallery_1");
        return rec;
      });
    });
  }

  function list() { return MK.Store.getAll("gallery").then(function (all) { return all.sort(function (a, b) { return b.date - a.date; }); }); }
  function count() { return list().then(function (l) { return l.length; }); }
  function remove(id) { return MK.Store.del("gallery", id); }

  /* Simpan kanvas sebagai dataURL (turunkan saiz untuk jimat ruang) */
  function saveCanvas(canvas, gameId, name) {
    try {
      var data = canvas.toDataURL("image/png");
      return save({ gameId: gameId, name: name || "Lukisan", type: "canvas", data: data });
    } catch (e) {
      return Promise.reject(e);
    }
  }
  function saveSVG(svgString, gameId, name) {
    return save({ gameId: gameId, name: name || "Karya", type: "svg", data: svgString });
  }

  return { save: save, saveCanvas: saveCanvas, saveSVG: saveSVG, list: list, count: count, remove: remove };
})();
