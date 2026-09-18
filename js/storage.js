/* ============================================================
   MINDAKU V.1 — storage.js
   Storan berlapis (paling dipercayai dahulu):
     1. Native AndroidStore (APK sahaja) — fail dalaman apl,
        dijamin kekal di semua peranti Android
     2. IndexedDB (pelayar/PWA) — diuji dengan probe baca-tulis
        semasa boot; jika gagal/tergantung → turun tier
     3. localStorage
     4. memori (sesi sahaja)
   Simpanan: progress, profile, stats, gallery.
   ============================================================ */
"use strict";
MK.Store = (function () {
  var DB_NAME = "mindaku-db", DB_VER = 1;
  var STORES = ["progress", "profile", "stats", "gallery"];
  var db = null, mode = "idb";           // idb | native | local | memory
  var memCache = {};                     // cache dalam memori {store:{key:val}}
  var lsOK = true;
  var TMO = 2500;                        // had masa ujian storan (ms)

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { lsOK = false; return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { lsOK = false; return false; } }

  /* Ujian bundar localStorage — pastikan ia BENAR-BENAR boleh
     tulis/baca/padam sebelum dipilih sebagai tier fallback. */
  function lsProbe() {
    try {
      var k = "__mk_probe__";
      localStorage.setItem(k, "1");
      var v = localStorage.getItem(k);
      localStorage.removeItem(k);
      return v === "1";
    } catch (e) { lsOK = false; return false; }
  }

  /* ================= TIER 1: Native AndroidStore (APK) =================
     Disediakan oleh MainActivity.java melalui addJavascriptInterface.
     Sepenuhnya luar talian — fail dalam storan dalaman apl. */
  function nativeOK() {
    try {
      return !!(window.AndroidStore &&
        typeof window.AndroidStore.put === "function" &&
        typeof window.AndroidStore.get === "function" &&
        typeof window.AndroidStore.del === "function" &&
        typeof window.AndroidStore.keys === "function");
    } catch (e) { return false; }
  }
  function nKey(store, key) { return "mk:" + store + ":" + key; }
  function nPutRaw(k, v) { try { return window.AndroidStore.put(k, v) === true; } catch (e) { return false; } }
  function nGetRaw(k) { try { var v = window.AndroidStore.get(k); return v || null; } catch (e) { return null; } }
  function nDelRaw(k) { try { return window.AndroidStore.del(k) === true; } catch (e) { return false; } }
  function nKeys(prefix) { try { var s = window.AndroidStore.keys(prefix); return s ? JSON.parse(s) : []; } catch (e) { return []; } }

  /* ================= IndexedDB (pelayar/PWA) ================= */
  function openIDB() {
    return new Promise(function (resolve, reject) {
      var to = setTimeout(function () { reject(new Error("idb: lambat")); }, TMO);
      try {
        if (!window.indexedDB) { clearTimeout(to); reject(new Error("tiada idb")); return; }
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
        req.onsuccess = function (ev) { clearTimeout(to); resolve(ev.target.result); };
        req.onerror = function () { clearTimeout(to); reject(new Error("idb: gagal dibuka")); };
        req.onblocked = function () { clearTimeout(to); reject(new Error("idb: blocked")); };
      } catch (e) { clearTimeout(to); reject(e); }
    });
  }

  /* Ujian bundar (round-trip) — pastikan IndexedDB BENAR-BENAR boleh
     tulis/baca/padam, bukan sekadar terbuka. Cegah sambungan "zombie". */
  function idbProbe(d) {
    return new Promise(function (resolve, reject) {
      var to = setTimeout(function () { reject(new Error("probe: lambat")); }, TMO);
      var fail = function (m) { clearTimeout(to); reject(new Error(m)); };
      try {
        var p = d.transaction("profile", "readwrite").objectStore("profile").put("ok", "_probe");
        p.onerror = function () { fail("probe: tulis gagal"); };
        p.onsuccess = function () {
          try {
            var g = d.transaction("profile", "readonly").objectStore("profile").get("_probe");
            g.onerror = function () { fail("probe: baca gagal"); };
            g.onsuccess = function () {
              if (g.result !== "ok") { fail("probe: data salah"); return; }
              try {
                var x = d.transaction("profile", "readwrite").objectStore("profile")["delete"]("_probe");
                x.onerror = function () { fail("probe: padam gagal"); };
                x.onsuccess = function () { clearTimeout(to); resolve(true); };
              } catch (e2) { fail("probe: padam exception"); }
            };
          } catch (e1) { fail("probe: baca exception"); }
        };
      } catch (e) { fail("probe: exception"); }
    });
  }

  /* Kumpul semua rekod IndexedDB {store, key, val} melalui kursor */
  function idbDump(d) {
    return new Promise(function (resolve) {
      var out = [];
      var chain = Promise.resolve();
      STORES.forEach(function (st) {
        chain = chain.then(function () {
          return new Promise(function (res) {
            try {
              var cur = d.transaction(st, "readonly").objectStore(st).openCursor();
              cur.onerror = function () { res(true); };
              cur.onsuccess = function (ev) {
                var c = ev.target.result;
                if (c) { out.push({ store: st, key: c.key, val: c.value }); c["continue"](); }
                else res(true);
              };
            } catch (e) { res(true); }
          });
        });
      });
      chain.then(function () { resolve(out); }, function () { resolve(out); });
    });
  }

  /* Migrasi SEKALI: data lama (IndexedDB/localStorage versi terdahulu)
     disalin ke storan native supaya tiada apa-apa hilang selepas
     kemas kini APK. */
  function migrateToNative() {
    return new Promise(function (resolve) {
      try {
        if (nGetRaw("mk:migrated") === "1") { resolve(true); return; }
        var done = function () { nPutRaw("mk:migrated", "1"); resolve(true); };
        /* 1) salin kunci mk:* dari localStorage (fallback lama) */
        try {
          for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && k.indexOf("mk:") === 0) { var v = lsGet(k); if (v != null) nPutRaw(k, v); }
          }
        } catch (e0) { }
        /* 2) salin rekod IndexedDB jika boleh dibuka */
        openIDB().then(function (d) {
          return idbDump(d).then(function (recs) {
            try { d.close(); } catch (e1) { }
            recs.forEach(function (r) {
              try {
                if (r.store === "gallery") { if (r.val && r.val.id != null) nPutRaw(nKey("gallery", r.val.id), JSON.stringify(r.val)); }
                else if (r.key != null) nPutRaw(nKey(r.store, r.key), JSON.stringify(r.val));
              } catch (e2) { }
            });
            done();
          }, function () { done(); });
        }, function () { done(); });
      } catch (e) { resolve(false); }
    });
  }

  /* ================= init ================= */
  function init() {
    memCache = {}; STORES.forEach(function (s) { memCache[s] = {}; });
    if (nativeOK()) {
      return migrateToNative().then(function () { mode = "native"; return "native"; },
                                    function () { mode = "native"; return "native"; });
    }
    return openIDB().then(function (d) {
      return idbProbe(d).then(
        function () { db = d; mode = "idb"; return "idb"; },
        function () { try { d.close(); } catch (e) { } mode = (lsOK && lsProbe()) ? "local" : "memory"; return mode; }
      );
    }, function () {
      mode = (lsOK && lsProbe()) ? "local" : "memory"; return mode;
    });
  }

  function tx(store, m) { return db.transaction(store, m).objectStore(store); }

  /* ================= baca =================
     Kunci 'null' = keseluruhan store (array). */
  function get(store, key) {
    return new Promise(function (resolve) {
      if (store === "gallery" && key != null) {
        getAll("gallery").then(function (all) {
          resolve(all.find(function (r) { return r.id === key; }) || null);
        });
        return;
      }
      if (mode === "native") { resolve(nativeGet(store, key)); return; }
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

  function nativeGet(store, key) {
    if (key == null) {
      var ks = nKeys("mk:" + store + ":");
      var seen = {}, all = [];
      for (var i = 0; i < ks.length; i++) {
        var raw = nGetRaw(ks[i]);
        seen[ks[i]] = 1;
        if (!raw) continue;
        try {
          var v = JSON.parse(raw);
          if (store === "gallery" && v && v.id == null) v.id = parseInt(ks[i].split(":")[2], 10) || v.id;
          all.push(v);
        } catch (e) { }
      }
      /* sandaran: kunci yang sama dalam localStorage (jika tulis native pernah gagal) */
      try {
        for (var j = 0; j < localStorage.length; j++) {
          var lk = localStorage.key(j);
          if (lk && lk.indexOf("mk:" + store + ":") === 0 && !seen[lk]) {
            seen[lk] = 1;
            try {
              var lv = JSON.parse(lsGet(lk));
              if (store === "gallery" && lv && lv.id == null) lv.id = parseInt(lk.split(":")[2], 10) || lv.id;
              all.push(lv);
            } catch (e3) { }
          }
        }
      } catch (e2) { }
      return all;
    }
    try { var raw2 = nGetRaw(nKey(store, key)); if (raw2) return JSON.parse(raw2); } catch (e) { }
    try { var raw3 = lsGet(nKey(store, key)); return raw3 ? JSON.parse(raw3) : null; } catch (e2) { return null; }
  }

  function localGet(store, key) {
    if (mode === "memory") return key == null ? Object.keys(memCache[store]).map(function (k) { return memCache[store][k]; }) : (memCache[store][key] != null ? memCache[store][key] : null);
    if (key == null) {
      var all = [];
      try {
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && k.indexOf("mk:" + store + ":") === 0) {
            try { var v = JSON.parse(lsGet(k)); if (store === "gallery") v.id = parseInt(k.split(":")[2], 10) || v.id; all.push(v); } catch (e) { }
          }
        }
      } catch (e0) { }
      return all;
    }
    try { var raw = lsGet("mk:" + store + ":" + key); return raw ? JSON.parse(raw) : null; }
    catch (e) { return null; }
  }

  /* ================= tulis =================
     Berjaya → janji selesai dengan kunci. Gagal semua tier → null
     (supaya galeri boleh beritahu pengguna dengan jujur). */
  function put(store, key, val) {
    return new Promise(function (resolve) {
      if (mode === "native") {
        if (key == null && store === "gallery") key = Date.now() + Math.floor(Math.random() * 1000);
        var k = nKey(store, key);
        var json = JSON.stringify(val);
        if (nPutRaw(k, json)) { resolve(key); return; }
        if (lsSet(k, json)) { resolve(key); return; }   /* sandaran terakhir */
        resolve(null);
        return;
      }
      if (mode === "idb" && db) {
        try {
          var r = (store === "gallery")
            ? tx(store, "readwrite").put(val)
            : tx(store, "readwrite").put(val, key);
          r.onsuccess = function () { resolve(key != null ? key : r.result); };
          r.onerror = function () { resolve(localPut(store, key, val)); };
        } catch (e) { resolve(localPut(store, key, val)); }
      } else resolve(localPut(store, key, val));
    });
  }

  function localPut(store, key, val) {
    if (mode === "memory") {
      if (key == null) { var nid = Date.now() + Math.floor(Math.random() * 1e6); memCache[store][nid] = val; return nid; }
      memCache[store][key] = val; return key;
    }
    if (key == null) key = Date.now() + Math.floor(Math.random() * 1000);
    return lsSet("mk:" + store + ":" + key, JSON.stringify(val)) ? key : null;
  }

  /* ================= padam ================= */
  function del(store, key) {
    return new Promise(function (resolve) {
      if (mode === "native") {
        var k = nKey(store, key);
        nDelRaw(k);
        try { localStorage.removeItem(k); } catch (e) { }
        resolve(true);
        return;
      }
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
