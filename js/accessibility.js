/* ============================================================
   MINDAKU V.1 — accessibility.js
   Terapkan mod visual & pergerakan pada <body>, deteksi
   keutamaan sistem, bantuan fokus.
   ============================================================ */
"use strict";
MK.A11y = (function () {
  function systemReducedMotion() {
    try { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
    catch (e) { return false; }
  }

  function apply() {
    try {
      var b = document.body;
      var anim = MK.Settings.get("animation");
      var rm = MK.Settings.get("reducedMotion") || systemReducedMotion();
      var vm = MK.Settings.get("visualMode");
      b.classList.toggle("anim-off", !anim);
      b.classList.toggle("rmotion", !!rm);
      b.classList.toggle("vm-reduced", vm === "reduced");
      b.classList.toggle("vm-readability", vm === "readability");
    } catch (e) { /* abaikan */ }
  }

  /* Saiz fon asas boleh disetel (untuk masa hadapan) */
  function fontScale(f) {
    try {
      document.documentElement.style.fontSize = (16 * (f || 1)).toFixed(1) + "px";
    } catch (e) { }
  }

  return { apply: apply, systemReducedMotion: systemReducedMotion, fontScale: fontScale };
})();
