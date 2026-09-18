/* ============================================================
   MINDAKU V.1 — app.js
   Ruang nama utama, utiliti DOM, toast, modal, maskot, boot.
   ============================================================ */
"use strict";
window.MK = window.MK || {};
MK.VERSION = "1.2.1";
MK.APP_NAME = "MINDAKU V.1";

/* ---------- Utiliti DOM ---------- */
MK.el = function (tag, cls, html) {
  var d = document.createElement(tag);
  if (cls) d.className = cls;
  if (html != null) d.innerHTML = html;
  return d;
};
MK.esc = function (s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
};
/* Buat elemen daripada template HTML (anak pertama) */
MK.h = function (html) {
  var t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

/* ---------- Toast (maklum balas ringan) ---------- */
MK.toast = function (msg, ms) {
  try {
    var root = document.getElementById("toast-root");
    if (!root) return;
    var t = MK.el("div", "toast", MK.esc(msg));
    root.appendChild(t);
    setTimeout(function () { t.style.opacity = "0"; t.style.transition = "opacity .4s"; }, ms || 2200);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, (ms || 2200) + 450);
  } catch (e) { /* abaikan */ }
};

/* ---------- Modal pengesahan (tanpa confirm() asli) ---------- */
MK.confirmBox = function (title, text, okLabel, cancelLabel) {
  return new Promise(function (resolve) {
    var ov = MK.el("div", "overlay");
    ov.appendChild(MK.h(
      '<div class="modal-card" role="dialog" aria-modal="true">' +
      '<h3>' + MK.esc(title) + "</h3><p>" + MK.esc(text) + "</p>" +
      '<div class="row center wrap">' +
      '<button class="btn ghost" data-r="0">' + MK.esc(cancelLabel || "Batal") + "</button>" +
      '<button class="btn primary" data-r="1">' + MK.esc(okLabel || "OK") + "</button>" +
      "</div></div>"
    ));
    ov.addEventListener("click", function (ev) {
      var b = ev.target.closest("button[data-r]");
      if (b) { cleanup(); resolve(b.dataset.r === "1"); }
      else if (ev.target === ov) { cleanup(); resolve(false); }
    });
    function cleanup() { if (ov.parentNode) ov.parentNode.removeChild(ov); }
    document.body.appendChild(ov);
    var okBtn = ov.querySelector('button[data-r="1"]');
    if (okBtn) okBtn.focus();
  });
};

/* ---------- Aria live (pembaca skrin) ---------- */
MK.announce = function (text) {
  try {
    var live = document.getElementById("aria-live");
    if (live) { live.textContent = ""; setTimeout(function () { live.textContent = text; }, 30); }
  } catch (e) { /* abaikan */ }
};

/* ---------- Maskot: Burung hantu comel bercermin matapegang buku ---------- */
MK.MASCOT_MOODS = ["wave", "happy", "nod", "point", "clap", "think"];
MK.mascotSVG = function (mood, size) {
  var s = size || 150;
  return (
    '<svg class="mascot mascot-' + (mood || "wave") + '" viewBox="0 0 200 200" width="' + s + '" height="' + s +
    '" role="img" aria-label="Maskot burung hantu MINDAKU">' +
    // badan
    '<g class="owl-body">' +
    '<ellipse cx="100" cy="112" rx="66" ry="72" fill="#6FAE9B"/>' +
    '<ellipse cx="100" cy="126" rx="46" ry="50" fill="#F4EDD8"/>' +
    // telinga
    '<path d="M44 58 L54 22 L76 44 Z" fill="#6FAE9B"/><path d="M156 58 L146 22 L124 44 Z" fill="#6FAE9B"/>' +
    // bulu kepala
    '<circle cx="68" cy="70" r="12" fill="#7FBBA8"/><circle cx="132" cy="70" r="12" fill="#7FBBA8"/>' +
    // mata + cermin mata
    '<circle cx="74" cy="78" r="20" fill="#fff"/><circle cx="126" cy="78" r="20" fill="#fff"/>' +
    '<circle cx="76" cy="80" r="9" fill="#33413F"/><circle cx="124" cy="80" r="9" fill="#33413F"/>' +
    '<circle cx="79" cy="77" r="3" fill="#fff"/><circle cx="127" cy="77" r="3" fill="#fff"/>' +
    '<g fill="none" stroke="#2C5D63" stroke-width="5">' +
    '<circle cx="74" cy="78" r="24"/><circle cx="126" cy="78" r="24"/>' +
    '<path d="M98 78 L102 78"/>' +
    "</g>" +
    // paruh
    '<path d="M100 92 L108 104 L100 110 L92 104 Z" fill="#F2A65A"/>' +
    // pipi
    '<circle cx="60" cy="102" r="7" fill="#F2B8A0" opacity=".7"/><circle cx="140" cy="102" r="7" fill="#F2B8A0" opacity=".7"/>' +
    // sayap
    '<g class="owl-wing-l"><ellipse cx="42" cy="120" rx="16" ry="34" fill="#5E9C8A" transform="rotate(14 42 120)"/></g>' +
    '<g class="owl-wing-r"><ellipse cx="158" cy="120" rx="16" ry="34" fill="#5E9C8A" transform="rotate(-14 158 120)"/></g>' +
    // buku terbuka
    '<g transform="translate(100 152)">' +
    '<path d="M-40 -6 Q-20 -14 0 -6 Q20 -14 40 -6 L40 14 Q20 6 0 14 Q-20 6 -40 14 Z" fill="#D96C4F"/>' +
    '<path d="M-36 -3 Q-18 -10 0 -3 L0 10 Q-18 3 -36 10 Z" fill="#FFF9EC"/>' +
    '<path d="M36 -3 Q18 -10 0 -3 L0 10 Q18 3 36 10 Z" fill="#FFF9EC"/>' +
    '<path d="M0 -3 L0 10" stroke="#D96C4F" stroke-width="2.5"/>' +
    "</g>" +
    // kaki
    '<path d="M80 182 l-6 8 M80 182 l0 10 M80 182 l6 8 M120 182 l-6 8 M120 182 l0 10 M120 182 l6 8" stroke="#F2A65A" stroke-width="4" stroke-linecap="round"/>' +
    "</g></svg>"
  );
};
MK.mascot = function (mood, size) {
  return MK.h('<div class="mascot-wrap' + (size && size <= 90 ? " small" : "") + '" aria-hidden="true">' + MK.mascotSVG(mood, size) + "</div>");
};
MK.mascotLine = function (mood, text, size) {
  return MK.h(
    '<div class="mascot-line"><div class="mascot-wrap tiny">' + MK.mascotSVG(mood, 56) + "</div>" +
    '<div class="bubble">' + text + "</div></div>"
  );
};

/* ---------- Tetapan lalai & boot ---------- */
MK.ready = false;

MK.init = async function () {
  try {
    await MK.Store.init();
  } catch (e) { console.warn("Store init gagal, guna fallback:", e); }
  try { await MK.Data.init(); } catch (e) { console.warn("Data init gagal:", e); }
  MK.Settings.init();
  MK.A11y.apply();
  await MK.Profile.load().catch(function () {});
  await MK.Engine.init().catch(function () {});
  MK.Nav.init();
  MK.Nav.go("home");
  MK.ready = true;
  MK.registerSW();
  console.log("MINDAKU V." + MK.VERSION + " sedia.");
};

/* ---------- Pendaftaran Service Worker ---------- */
MK.registerSW = function () {
  try {
    if (!("serviceWorker" in navigator)) return;
    if (location.protocol === "file:") return; // SW tidak disokong pada file://
    var base = (location.pathname.replace(/\/[^/]*$/, "/")) || "/";
    navigator.serviceWorker.register(base + "pwa/service-worker.js", { scope: base })
      .catch(function () {
        // Sesetengah pelayan tidak benarkan scope; cuba salinan akar
        return navigator.serviceWorker.register(base + "service-worker.js", { scope: base });
      })
      .catch(function (e) { console.warn("SW tidak didaftarkan:", e); });
  } catch (e) { /* abaikan */ }
};

/* Pasang PWA (jika disokong) */
MK.canInstall = function () { return !!MK._deferredInstallPrompt; };
MK.installPWA = function () {
  var p = MK._deferredInstallPrompt;
  if (!p) { MK.toast("Buka menu pelayar dan pilih \u201C Pasang Aplikasi\u201D untuk memasang MINDAKU."); return false; }
  p.prompt();
  return true;
};

document.addEventListener("DOMContentLoaded", function () {
  MK.init();
});
window.addEventListener("beforeinstallprompt", function (e) {
  e.preventDefault();
  MK._deferredInstallPrompt = e;
});
/* Buka kunci audio pada sentuhan pertama */
document.addEventListener("pointerdown", function unlockAudio() {
  if (MK.Audio && MK.Audio.unlock) MK.Audio.unlock();
  document.removeEventListener("pointerdown", unlockAudio);
}, { once: true, passive: true });
