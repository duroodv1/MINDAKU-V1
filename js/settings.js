/* ============================================================
   MINDAKU V.1 — settings.js
   Tetapan dalam LocalStorage (ringan) + isyarat perubahan.
   ============================================================ */
"use strict";
MK.Settings = (function () {
  var KEY = "mindaku.settings";
  var DEFAULTS = {
    music: false,        // muzik latar — OFF sedia kala (tenang)
    sfx: true,           // kesan bunyi lembut
    voice: true,         // suara TTS
    animation: true,     // animasi
    reducedMotion: false,// kurangkan pergerakan
    timer: "off",        // off | 30 | 60  — OFF sedia kala
    visualMode: "normal",// normal | reduced | readability
    difficulty: "sederhana",
    adaptive: true       // penyesuaian kesukaran automatik
  };
  var S = Object.assign({}, DEFAULTS);
  var listeners = [];

  function init() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var o = JSON.parse(raw); Object.keys(DEFAULTS).forEach(function (k) { if (o[k] !== undefined) S[k] = o[k]; }); }
    } catch (e) { /* abaikan */ }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storan penuh / dilumpuhkan */ }
  }
  function get(k) { return S[k]; }
  function getAll() { return Object.assign({}, S); }
  function set(k, v) {
    if (!(k in DEFAULTS)) return;
    S[k] = v; save();
    listeners.forEach(function (fn) { try { fn(k, v); } catch (e) { } });
  }
  /* Toggle boolean */
  function toggle(k) { if (typeof S[k] === "boolean") set(k, !S[k]); return S[k]; }
  function onChange(fn) { listeners.push(fn); }
  function reset() {
    Object.assign(S, DEFAULTS); save();
    listeners.forEach(function (fn) { try { fn("reset", null); } catch (e) { } });
  }

  return { init: init, get: get, getAll: getAll, set: set, toggle: toggle, onChange: onChange, reset: reset, DEFAULTS: DEFAULTS };
})();
