/* ============================================================
   MINDAKU V.1 — storage.js
   IndexedDB dengan fallback localStorage + memori.
   Simpanan: progress, profile, stats, gallery.
   ============================================================ */
"use strict";
MK.Store = (function () {
  var DB_NAME = "mindaku-db", DB_VER = 1;
  var STORES = ["progress", "profile", "stats", "gallery"];
  var db = null, mode = "idb";           // idb | local | memory
  var memCache = {};                     // cache dalam memori {store:{key:val}}
  var lsOK = true;

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { lsOK = false; return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { lsOK = false; } }

  function init() {
    memCache = {}; STORES.forEach(function (s) { memCache[s] = {}; });
    return new Promise(function (resolve) {
      var done = function (m) { mode = m; resolve(m); };
      try {
        if (!window.indexedDB) throw new Error("tiada idb");
        var req = indexedDB.open(DB_NAME, DB_VER);
        req.onupgradeneeded = function (ev) {
          var d = ev.target.result;
          STORES.forEach(function (s) {
            if (!d.objectStoreNames.contains(s)) {
              if (s === "gallery") d.createObjectStore("gallery", { keyPath: "id", autoIncrement: true });
              else d.createObjectStore(s);
            }
          });
        };
        req.onsuccess = function (ev) { db = ev.target.result; done("idb"); };
        req.onerror = function () { done(lsOK ? "local" : "memory"); };
        req.onblocked = function () { done(lsOK ? "local" : "memory"); };
        setTimeout(function () { if (!db && mode === "idb") { /* lambat */ } }, 2500);
      } catch (e) { done(lsOK ? "local" : "memory"); }
    });
  }

  function tx(store, mode) { return db.transaction(store, mode).objectStore(store); }

  /* Dapatkan nilai (janji). Kunci 'null' = keseluruhan store (array). */
  function get(store, key) {
    return new Promise(function (resolve) {
      if (store === "gallery" && key != null) {
        // galeri: cari mengikut id
        getAll("gallery").then(function (all) {
          resolve(all.find(function (r) { return r.id === key; }) || null);
        });
        return;
      }
      if (mode === "idb" && db) {
        try {
          if (key == null) {
            var ra = tx(store, "readonly").getAll();
            ra.onsuccess = function () { resolve(ra.result || []); };
            ra.onerror = function () { resolve(localGet(store, null)); };
          } else {
            var r = tx(store, "readonly").get(key);
            r.onsuccess = function () { resolve(r.result != null ? r.result : null); };
            r.onerror = function () { resolve(localGet(store, key)); };
          }
        } catch (e) { resolve(localGet(store, key)); }
      } else resolve(localGet(store, key));
    });
  }

  function localGet(store, key) {
    if (mode === "memory") return key == null ? Object.keys(memCache[store]).map(function (k) { return memCache[store][k]; }) : (memCache[store][key] != null ? memCache[store][key] : null);
    if (key == null) {
      var all = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf("mk:" + store + ":") === 0) {
          try { var v = JSON.parse(lsGet(k)); if (store === "gallery") v.id = parseInt(k.split(":")[2], 10) || v.id; all.push(v); } catch (e) { }
        }
      }
      return all;
    }
    try { var raw = lsGet("mk:" + store + ":" + key); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }

  function put(store, key, val) {
    return new Promise(function (resolve) {
      if (mode === "idb" && db) {
        try {
          var r = (store === "gallery")
            ? tx(store, "readwrite").put(val)
            : tx(store, "readwrite").put(val, key);
          r.onsuccess = function () { resolve(key != null ? key : r.result); };
          r.onerror = function () { localPut(store, key, val); resolve(key); };
        } catch (e) { localPut(store, key, val); resolve(key); }
      } else { localPut(store, key, val); resolve(key); }
    });
  }

  function localPut(store, key, val) {
    if (mode === "memory") {
      if (key == null) { var nid = Object.keys(memCache[store]).length + 1 + Math.floor(Math.random() * 1e6); memCache[store][nid] = val; return nid; }
      memCache[store][key] = val; return key;
    }
    try {
      if (key == null) { key = Date.now() + Math.floor(Math.random() * 1000); }
      lsSet("mk:" + store + ":" + key, JSON.stringify(val));
      return key;
    } catch (e) { return key; }
  }

  function del(store, key) {
    return new Promise(function (resolve) {
      if (mode === "idb" && db) {
        try {
          var r = tx(store, "readwrite")["delete"](key);
          r.onsuccess = function () { resolve(true); };
          r.onerror = function () { resolve(localDel(store, key)); };
        } catch (e) { resolve(localDel(store, key)); }
      } else resolve(localDel(store, key));
    });
  }
  function localDel(store, key) {
    try {
      if (mode === "memory") { delete memCache[store][key]; return true; }
      localStorage.removeItem("mk:" + store + ":" + key); return true;
    } catch (e) { return false; }
  }

  function getAll(store) { return get(store, null); }

  return { init: init, get: get, put: put, del: del, getAll: getAll, mode: function () { return mode; } };
})();
