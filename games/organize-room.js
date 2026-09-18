/* ============================================================
   GAME 39 — ORGANIZE MY ROOM (Kehidupan Harian)
   Letakkan objek pada tempat yang betul:
   buku → rak buku, pakaian → almari, kasut → rak kasut.
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "organize-room",
    name: "Organize My Room",
    icon: "🧹",
    cat: "kehidupan",
    engine: "sort",
    sticker: "🪣",
    desc: "Kemas bilik! Letakkan setiap objek di tempat yang betul.",
    tasksPerLevel: 2,
    instruction: function (l, d) {
      return "Ketuk objek, kemudian ketuk tempat yang betul untuknya. Buku ke rak buku, pakaian ke almari!";
    },
    makeTask: function (level, diff, ctx) {
      var room = MK.Data.bank("routines").room || {};
      var zones = room.zones || [];
      var allItems = room.items || [];
      var nZones = diff === "mudah" ? 2 : diff === "cabaran" ? 5 : Math.min(4, zones.length);
      var perZone = diff === "mudah" ? 2 : diff === "cabaran" ? 3 : 2;
      if (ctx.ease) perZone = 1;

      var chosen = MK.Gen.sample(zones, Math.min(nZones, zones.length));
      var items = [];
      chosen.forEach(function (z) {
        var zoneItems = allItems.filter(function (i) { return i.zone === z.id; });
        MK.Gen.sample(zoneItems, Math.min(perZone, zoneItems.length)).forEach(function (it, i) {
          items.push({ id: z.id + "-" + i + "-" + it.n, label: it.n, emoji: it.e, bin: z.id });
        });
      });
      return {
        key: "or-" + items.map(function (i) { return i.label; }).sort().join("-"),
        kind: "sort",
        prompt: "Kemas bilik! Letak objek di tempat betul",
        bins: chosen.map(function (z) { return { id: z.id, label: z.label, emoji: z.emoji }; }),
        items: MK.Gen.shuffle(items),
        explain: "Setiap objek ada tempatnya — bilik yang kemas lebih selesa!"
      };
    }
  });
})();
