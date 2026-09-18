/* ============================================================
   GAME 01 — GEOMETRY BUILDER (Bentuk & Geometri)
   Kenali bentuk 2D/3D, kira sisi & bucu.
   ============================================================ */
"use strict";

/* Seni bentuk SVG dikongsi oleh permainan geometri lain */
MK.ShapeArt = (function () {
  var COLORS = ["#7EA6E0", "#F2A65A", "#8FBF9F", "#B49AE0", "#E8875F", "#68C3B0"];
  function poly(pts, color, stroke) {
    return '<polygon points="' + pts.map(function (p) { return p[0] + "," + p[1]; }).join(" ") +
      '" fill="' + (color || COLORS[0]) + '" stroke="' + (stroke || "#fff") + '" stroke-width="3" stroke-linejoin="round"/>';
  }
  function ngon(n, r) {
    var pts = [];
    for (var i = 0; i < n; i++) {
      var a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      pts.push([+(r * Math.cos(a)).toFixed(1), +(r * Math.sin(a)).toFixed(1)]);
    }
    return pts;
  }
  function svg(inner, size, vb) {
    var s = size || 64, v = vb || 160;
    return '<svg viewBox="' + (-v / 2) + " " + (-v / 2) + " " + v + " " + v + '" width="' + s + '" height="' + s + '" aria-hidden="true">' + inner + "</svg>";
  }
  var API = {
    COLORS: COLORS,
    flat: function (id, size, color) {
      color = color || COLORS[Math.abs(hash(id)) % COLORS.length];
      switch (id) {
        case "bulatan": return svg('<circle r="58" fill="' + color + '" stroke="#fff" stroke-width="3"/>', size);
        case "segitiga": return svg(poly(ngon(3, 60), color), size);
        case "segiempat": return svg(poly([[-52, -52], [52, -52], [52, 52], [-52, 52]], color), size);
        case "segitempat": return svg(poly([[-70, -42], [70, -42], [70, 42], [-70, 42]], color), size);
        case "pentagon": return svg(poly(ngon(5, 58), color), size);
        case "heksagon": return svg(poly(ngon(6, 56), color), size);
        case "segiempatwujud": return svg(poly([[-62, -34], [0, -52], [62, 34], [0, 52]], color), size);
        default: return svg(poly(ngon(4, 55), color), size);
      }
    },
    solid: function (id, size, color) {
      color = color || "#9DB8D9";
      var f = '#E8EEF7', e = color, l = '#C7D6EC';
      switch (id) {
        case "kubus": return svg(
          poly([[-55, -20], [5, -50], [55, -20], [55, 30], [-5, 60], [-55, 30]], f, e) +
          poly([[-55, -20], [5, -50], [5, 0], [-55, 30]], l, e) +
          poly([[-55, 30], [5, 0], [55, 30], [5, 60]], '#F6F9FD', e), size, 150);
        case "sfera": return svg(
          '<circle r="55" fill="' + f + '" stroke="' + e + '" stroke-width="3"/><ellipse cx="-14" cy="-16" rx="22" ry="14" fill="' + l + '" stroke="none"/>', size);
        case "silinder": return svg(
          poly([[-40, -40], [40, -40], [40, 40], [-40, 40]], f, e) +
          '<ellipse cx="0" cy="-40" rx="40" ry="14" fill="' + l + '" stroke="' + e + '" stroke-width="3"/>' +
          '<path d="M-40 40 A40 14 0 0 0 40 40" fill="none" stroke="' + e + '" stroke-width="3"/>', size);
        case "kon": return svg(
          poly([[-42, 45], [0, -55], [42, 45]], f, e) +
          '<ellipse cx="0" cy="45" rx="42" ry="13" fill="' + l + '" stroke="' + e + '" stroke-width="3"/>', size);
        case "piramid": return svg(
          poly([[-55, 45], [0, -55], [55, 45]], f, e) +
          '<path d="M0 -55 L0 45 M0 -55 L-55 45 M0 -55 L55 45" stroke="' + e + '" stroke-width="2.5" fill="none"/>', size);
        default: return svg(poly(ngon(4, 55), color), size);
      }
    }
  };
  function hash(s) { var h = 0; for (var i = 0; i < String(s).length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
  return API;
})();

MK.registerGame({
  id: "geometry-builder",
  name: "Geometry Builder",
  icon: "🔷",
  cat: "bentuk",
  engine: "quiz",
  sticker: "📐",
  desc: "Kenal pasti bentuk 2D & 3D, kira sisi dan bucu.",
  tasksPerLevel: 5,
  instruction: function (l, d) { return "Lihat bentuk dan jawab soalan tentangnya. Ketuk jawapan yang betul!"; },
  makeTask: function (level, diff, ctx) {
    var shapes = MK.Data.list("shapes", "shapes");
    var solids = MK.Data.list("shapes", "solids");
    var nChoices = diff === "mudah" ? (ctx.ease ? 2 : 3) : diff === "cabaran" ? 4 : 3;
    var mode;
    if (level <= 3) mode = "identify";
    else if (level <= 4) mode = "sides";
    else if (level <= 5) mode = "vertices";
    else if (level <= 6) mode = "2d3d";
    else if (level <= 7) mode = "solidname";
    else if (level <= 8) mode = "sides";
    else mode = "mixed";

    if (mode === "mixed") mode = MK.Gen.pick(["identify", "sides", "vertices", "2d3d", "solidname"]);

    if (mode === "identify") {
      var target = MK.Gen.pickAvoid(shapes, ctx.recentShapes || []);
      var others = MK.Gen.sample(shapes.filter(function (s) { return s.id !== target.id; }), nChoices - 1);
      var ch = [{ label: MK.ShapeArt.flat(target.id, 72) + "<span>" + target.name + "</span>", correct: true }]
        .concat(others.map(function (o) { return { label: MK.ShapeArt.flat(o.id, 72) + "<span>" + o.name + "</span>", correct: false }; }));
      return { key: "gb-i-" + target.id, kind: "quiz", prompt: "Yang mana ialah <b>" + target.name.toUpperCase() + "</b>?", choices: MK.Gen.shuffle(ch), explain: target.note };
    }
    if (mode === "sides" || mode === "vertices") {
      var t2 = MK.Gen.pickAvoid(shapes.filter(function (s) { return s.sides > 0 }), ctx.recentShapes || []);
      var ans = mode === "sides" ? t2.sides : t2.vertices;
      var nums = MK.Gen.numChoices(ans, 3, nChoices - 1);
      var ch2 = nums.map(function (n) { return { label: "<span style='font-size:1.6rem'>" + n + "</span>", correct: String(n) === String(ans) }; });
      var what = mode === "sides" ? "sisi" : "bucu";
      return {
        key: "gb-" + mode + "-" + t2.id, kind: "quiz",
        prompt: "<span class='pem'>" + MK.ShapeArt.flat(t2.id, 84) + "</span><br>Berapa <b>" + what + "</b> pada " + t2.name + "?",
        choices: MK.Gen.shuffle(ch2), explain: t2.name + " mempunyai " + ans + " " + what + "."
      };
    }
    if (mode === "2d3d") {
      var isSolid = MK.Gen.chance(0.5);
      if (isSolid) {
        var s2 = MK.Gen.pick(solids);
        return {
          key: "gb-3d-" + s2.id, kind: "quiz",
          prompt: "<span class='pem'>" + MK.ShapeArt.solid(s2.id, 84) + "</span><br>Bentuk ini ialah bentuk <b>2D</b> atau <b>3D</b>?",
          choices: [{ label: "Bidang 2D (rata)", correct: false }, { label: "Bentuk 3D (pepejal)", correct: true }],
          explain: s2.name + " ialah bentuk 3D. " + s2.note
        };
      } else {
        var f2 = MK.Gen.pick(shapes);
        return {
          key: "gb-2d-" + f2.id, kind: "quiz",
          prompt: "<span class='pem'>" + MK.ShapeArt.flat(f2.id, 84) + "</span><br>Bentuk ini ialah bentuk <b>2D</b> atau <b>3D</b>?",
          choices: [{ label: "Bidang 2D (rata)", correct: true }, { label: "Bentuk 3D (pepejal)", correct: false }],
          explain: f2.name + " ialah bentuk 2D — rata seperti gambar di kertas."
        };
      }
    }
    // solidname
    var t3 = MK.Gen.pickAvoid(solids, ctx.recentShapes || []);
    var o3 = MK.Gen.sample(solids.filter(function (s) { return s.id !== t3.id; }), nChoices - 1);
    var ch3 = [{ label: MK.ShapeArt.solid(t3.id, 72) + "<span>" + t3.name + "</span>", correct: true }]
      .concat(o3.map(function (o) { return { label: MK.ShapeArt.solid(o.id, 72) + "<span>" + o.name + "</span>", correct: false }; }));
    return { key: "gb-sn-" + t3.id, kind: "quiz", prompt: "Pepejal ini dipanggil…", choices: MK.Gen.shuffle(ch3), explain: t3.note };
  }
});
