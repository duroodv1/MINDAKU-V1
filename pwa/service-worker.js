"use strict";
/* ============================================================
   MINDAKU V.1 — service-worker.js (Offline-First)
   Cache-first untuk shell aplikasi + data + assets.
   ============================================================ */
var CACHE = "mindaku-v1.0.2";
var PRECACHE = [
  "css/accessibility.css",
  "css/animations.css",
  "css/responsive.css",
  "css/style.css",
  "data/games.json",
  "data/habitats.json",
  "data/mathematics.json",
  "data/patterns.json",
  "data/questions.json",
  "data/routines.json",
  "data/safety.json",
  "data/shapes.json",
  "data/sounds.json",
  "data/vocabulary.json",
  "games/angle-explorer.js",
  "games/animal-habitat.js",
  "games/ask-first.js",
  "games/build-create.js",
  "games/category-words.js",
  "games/color-by-number.js",
  "games/color-lab.js",
  "games/daily-routine.js",
  "games/fair-share.js",
  "games/garden-counting.js",
  "games/geometry-builder.js",
  "games/kaleidoscope-paint.js",
  "games/listen-spell.js",
  "games/logic-puzzle.js",
  "games/math-garden.js",
  "games/memory-match.js",
  "games/multiplication-garden.js",
  "games/number-crane.js",
  "games/object-hunt.js",
  "games/odd-one-out.js",
  "games/organize-room.js",
  "games/pack-school-bag.js",
  "games/pattern-city.js",
  "games/pattern-master.js",
  "games/personal-space.js",
  "games/picnic-memory.js",
  "games/pitch-detective.js",
  "games/plant-detective.js",
  "games/recipe-memory.js",
  "games/road-safety.js",
  "games/safe-unsafe.js",
  "games/same-different.js",
  "games/sentence-train.js",
  "games/shape-construction.js",
  "games/shopping-memory.js",
  "games/smart-diner.js",
  "games/smart-shopping.js",
  "games/solar-mission.js",
  "games/sound-sorter.js",
  "games/star-maze.js",
  "games/syllable-frog.js",
  "games/symmetry-mirror.js",
  "games/tangram-challenge.js",
  "games/typing-garden.js",
  "games/weather-explorer.js",
  "games/what-changed.js",
  "games/what-should-i-do.js",
  "games/word-analogy.js",
  "games/word-builder.js",
  "games/word-picture-match.js",
  "icons/favicon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-96.png",
  "icons/maskable-512.png",
  "index.html",
  "js/accessibility.js",
  "js/app.js",
  "js/audio.js",
  "js/content-generator.js",
  "js/gallery.js",
  "js/game-engine.js",
  "js/navigation.js",
  "js/profile.js",
  "js/rewards.js",
  "js/settings.js",
  "js/storage.js",
  "js/tts.js",
  "pwa/manifest.json"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      var base = new URL(self.registration.scope);
      return Promise.allSettled(PRECACHE.map(function (f) {
        var url = new URL(f, base).toString();
        return cache.add(new Request(url, { cache: "reload" }));
      }));
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(function (cached) {
      if (cached) {
        // muat semula di latar untuk kemas kini
        fetch(e.request).then(function (resp) {
          if (resp && resp.ok) {
            caches.open(CACHE).then(function (c) { c.put(e.request, resp); });
          }
        }).catch(function () { });
        return cached;
      }
      return fetch(e.request).then(function (resp) {
        if (resp && resp.ok && (resp.type === "basic")) {
          var clone = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
        }
        return resp;
      }).catch(function () {
        if (e.request.mode === "navigate") {
          return caches.match("index.html");
        }
        return new Response("Luar talian", { status: 503, statusText: "Offline" });
      });
    })
  );
});
