/* ============================================================
   GAME 05 — ANGLE EXPLORER (Bentuk & Geometri)
   Kenal sudut kecil, sudut tepat, sudut besar; anggar darjah;
   bandingkan sudut; buat sudut sasaran (seret lengan sudut).
   ============================================================ */
"use strict";
(function () {
  function angleSVG() {
    return '<svg id="angle-svg" viewBox="0 0 300 250" style="width:100%;max-width:340px;margin:0 auto;display:block;touch-action:none">' +
      '<line x1="150" y1="170" x2="262" y2="170" stroke="#6B7A78" stroke-width="7" stroke-linecap="round"/>' +
      '<line id="angle-arm2" x1="150" y1="170" x2="150" y2="60" stroke="#3E7C82" stroke-width="7" stroke-linecap="round" class="angle-arm"/>' +
      '<path id="angle-arc" fill="none" stroke="#F2A65A" stroke-width="5" stroke-dasharray="1 0"/>' +
      '<circle cx="150" cy="170" r="10" fill="#33413F"/>' +
      '<circle id="angle-handle" r="16" fill="#F2A65A" stroke="#fff" stroke-width="4" style="cursor:grab"/>' +
      '<text id="angle-deg" x="150" y="222" text-anchor="middle" font-size="26" font-weight="800" fill="#33413F">?</text>' +
      "</svg>";
  }
  function ptFromAngle(deg, len) {
    var a = (-deg) * Math.PI / 180; // skrin y terbalik
    return [150 + len * Math.cos(a), 170 + len * Math.sin(a)];
  }
  function arcPath(deg) {
    var r = 42, s = ptFromAngle(0, r), e = ptFromAngle(deg, r);
    var large = deg > 180 ? 1 : 0;
    return "M" + s[0] + " " + s[1] + " A" + r + " " + r + " 0 " + large + " 0 " + e[0] + " " + e[1];
  }
  function setArm(svg, deg, showDeg) {
    var arm = svg.querySelector("#angle-arm2");
    var handle = svg.querySelector("#angle-handle");
    var arc = svg.querySelector("#angle-arc");
    var txt = svg.querySelector("#angle-deg");
    var end = ptFromAngle(deg, 112), h = ptFromAngle(deg, 112);
    arm.setAttribute("x2", end[0]); arm.setAttribute("y2", end[1]);
    handle.setAttribute("cx", h[0]); handle.setAttribute("cy", h[1]);
    arc.setAttribute("d", arcPath(deg));
    txt.textContent = showDeg ? Math.round(deg) + "°" : "?";
  }

  MK.registerGame({
    id: "angle-explorer",
    name: "Angle Explorer",
    icon: "📐",
    cat: "bentuk",
    engine: "custom",
    sticker: "📏",
    desc: "Kenali sudut kecil, tepat dan besar. Anggar darjah dan buat sudut sendiri!",
    instruction: function (l, d) {
      return l >= 7
        ? "Seret titik oren (atau gunakan butang putar) untuk membentuk sudut sasaran, kemudian tekan Semak."
        : "Lihat sudut pada gambar dan pilih jawapan yang betul.";
    },
    startLevel: function (mount, api) {
      var level = api.level, diff = api.diff;
      var perLevel = diff === "mudah" ? 3 : 4;
      var tIdx = 0, mistakes = 0;
      var ease = function () { return api.ctx.ease; };

      function taskType() {
        if (level <= 3) return "type";
        if (level <= 6) return "estimate";
        if (level <= 8) return "make";
        return MK.Gen.pick(["type", "estimate", "make", "compare"]);
      }

      function build() {
        var type = taskType();
        mount.innerHTML = "";
        var choices = MK.el("div", "choices");
        mount.appendChild(MK.el("div", "prompt small", "Sudut " + (tIdx + 1) + "/" + perLevel));

        if (type === "type") {
          var kinds = [
            { id: "kecil", label: "Sudut Kecil", gen: MK.Gen.ri(15, 65) },
            { id: "tepat", label: "Sudut Tepat", gen: 90 },
            { id: "besar", label: "Sudut Besar", gen: MK.Gen.ri(115, 165) }
          ];
          var k = MK.Gen.pick(kinds);
          var deg = k.gen;
          var holder = MK.el("div", null, angleSVG());
          mount.appendChild(holder);
          setArm(holder.querySelector("svg"), deg, false);
          mount.appendChild(MK.el("div", "sub-prompt", "Apakah jenis sudut ini?"));
          kinds.forEach(function (kk) {
            var b = MK.el("button", "choice", "<span>" + kk.label + "</span>");
            b.addEventListener("click", function () {
              if (kk.id === k.id) right(kk.id === "tepat" ? "Sudut tepat ialah tepat 90°, seperti penjuru buku." : kk.id === "kecil" ? "Sudut kecil kurang daripada 90°." : "Sudut besar melebihi 90°.");
              else wrong(b);
            });
            choices.appendChild(b);
          });
        } else if (type === "estimate") {
          var deg2 = MK.Gen.pick([20, 30, 45, 60, 90, 120, 135, 150, 160]);
          var holder2 = MK.el("div", null, angleSVG());
          mount.appendChild(holder2);
          setArm(holder2.querySelector("svg"), deg2, false);
          mount.appendChild(MK.el("div", "sub-prompt", "Anggar berapa darjah sudut ini?"));
          var pool = [20, 45, 60, 90, 120, 150].filter(function (x) { return x !== deg2; });
          var nCh = diff === "mudah" ? 2 : diff === "cabaran" ? 3 : 2;
          var opts = MK.Gen.sample(pool, nCh).concat([deg2]).sort(function (a, b) { return a - b; });
          opts.forEach(function (o) {
            var b = MK.el("button", "choice", "<span style='font-size:1.5rem'>" + o + "°</span>");
            b.addEventListener("click", function () {
              if (o === deg2) right("Sudut ini lebih kurang " + deg2 + "°.");
              else wrong(b);
            });
            choices.appendChild(b);
          });
        } else if (type === "make") {
          var target = MK.Gen.pick([30, 45, 60, 90, 120, 135, 150]);
          var tol = diff === "mudah" ? 18 : diff === "cabaran" ? 10 : 14;
          if (ease()) tol += 6;
          var holder3 = MK.el("div", null, angleSVG());
          mount.appendChild(holder3);
          var svg3 = holder3.querySelector("svg");
          var cur = 60;
          setArm(svg3, cur, true);
          mount.appendChild(MK.el("div", "sub-prompt", "Buat sudut kira-kira <b>" + target + "°</b> (dalam ±" + tol + "°)"));
          /* seret pemegang */
          var dragging = false;
          var handle = svg3.querySelector("#angle-handle");
          function upd(ev) {
            var rect = svg3.getBoundingClientRect();
            var scale = 300 / rect.width;
            var x = (ev.clientX - rect.left) * scale - 150;
            var y = (ev.clientY - rect.top) * (250 / rect.height) * scale - 170;
            var ang = Math.atan2(-y, x) * 180 / Math.PI;
            if (ang < 0) ang += 360;
            if (ang > 180) ang = 180;
            cur = Math.max(5, Math.min(175, ang));
            setArm(svg3, cur, true);
          }
          handle.addEventListener("pointerdown", function (e) { dragging = true; handle.setPointerCapture(e.pointerId); });
          handle.addEventListener("pointermove", function (e) { if (dragging) upd(e); });
          handle.addEventListener("pointerup", function () { dragging = false; });
          handle.addEventListener("pointercancel", function () { dragging = false; });
          var rotRow = MK.el("div", "tool-row");
          var bl = MK.el("button", "tool-btn", "◀ 15°");
          var br = MK.el("button", "tool-btn", "15° ▶");
          bl.addEventListener("click", function () { cur = Math.max(5, cur - 15); setArm(svg3, cur, true); api.sfx("tap"); });
          br.addEventListener("click", function () { cur = Math.min(175, cur + 15); setArm(svg3, cur, true); api.sfx("tap"); });
          rotRow.appendChild(bl); rotRow.appendChild(br);
          mount.appendChild(rotRow);
          var check = MK.el("button", "btn primary big", "✅ Semak Sudut");
          check.addEventListener("click", function () {
            if (Math.abs(cur - target) <= tol) {
              setArm(svg3, cur, true);
              right("Anda buat " + Math.round(cur) + "° — sasaran " + target + "°. Hebat!");
            } else {
              mistakes++;
              api.sfx("retry");
              api.feedback(false, "Sudut anda " + Math.round(cur) + "°. Sedikit lagi — putar " + (cur < target ? "lebih besar" : "lebih kecil") + "!");
            }
          });
          mount.appendChild(check);
          api._angleHint = function () {
            cur = target; setArm(svg3, cur, true);
            MK.toast("Saya tunjukkan sudut " + target + "° — tekan Semak! 💡");
          };
        } else { /* compare */
          var a1 = MK.Gen.ri(15, 165), a2;
          do { a2 = MK.Gen.ri(15, 165); } while (Math.abs(a1 - a2) < 30);
          var row = MK.el("div", "row center wrap");
          var h1 = MK.el("div", null, angleSVG()), h2 = MK.el("div", null, angleSVG());
          h1.style.flex = "1 1 140px"; h2.style.flex = "1 1 140px";
          setArm(h1.querySelector("svg"), a1, false);
          setArm(h2.querySelector("svg"), a2, false);
          row.appendChild(h1); row.appendChild(h2);
          mount.appendChild(row);
          var askBigger = MK.Gen.chance(0.5);
          mount.appendChild(MK.el("div", "sub-prompt", askBigger ? "Sudut manakah yang <b>lebih besar</b>?" : "Sudut manakah yang <b>lebih kecil</b>?"));
          var ans = askBigger ? (a1 > a2 ? "A" : "B") : (a1 < a2 ? "A" : "B");
          [["A", "Sudut A"], ["B", "Sudut B"]].forEach(function (p) {
            var b = MK.el("button", "choice", "<span>" + p[1] + "</span>");
            b.addEventListener("click", function () {
              if (p[0] === ans) right("Sudut A ialah " + a1 + "° dan Sudut B ialah " + a2 + "°.");
              else wrong(b);
            });
            choices.appendChild(b);
          });
        }

        mount.appendChild(choices);

        function right(explain) {
          api.sfx("good");
          api.feedback(true);
          tIdx++;
          api.progress(tIdx, perLevel);
          setTimeout(function () {
            if (tIdx >= perLevel) api.complete({ mistakes: mistakes });
            else build();
          }, 900);
        }
        function wrong(btn) {
          mistakes++;
          api.sfx("retry");
          api.feedback(false);
          if (btn) { btn.classList.add("dimmed"); }
        }
      }
      api.hint(function () {
        if (api._angleHint) { api._angleHint(); return; }
        var b = mount.querySelector(".choices .choice:not(.dimmed)");
        if (b) b.classList.add("hinted");
      });
      build();
    }
  });
})();
