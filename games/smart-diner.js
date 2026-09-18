/* ============================================================
   GAME 37 — SMART DINER (Kehidupan Harian)
   Urus restoran: pilih menu, kira jumlah, bayar, kira baki.
   ============================================================ */
"use strict";
(function () {
  MK.registerGame({
    id: "smart-diner",
    name: "Smart Diner",
    icon: "🍽️",
    cat: "kehidupan",
    engine: "custom",
    sticker: "👨‍🍳",
    desc: "Urus restoran anda! Ambil pesanan, kira jumlah, terima bayaran dan beri baki.",
    instruction: function (l, d) {
      return "Pelanggan datang! Tambah item pesanan ke dalam bakul, kira jumlahnya, kemudian kira baki wang.";
    },
    startLevel: function (mount, api) {
      var perLevel = api.diff === "mudah" ? 2 : 3, round = 0, mistakes = 0;
      var items = (MK.Data.bank("mathematics").money || {}).items || [];
      var notes = [1, 2, 5, 10, 20, 50];

      function play() {
        var nOrder = api.level <= 3 ? 2 : api.level <= 6 ? 3 : 4;
        if (api.diff === "cabaran") nOrder = Math.min(5, nOrder + 1);
        if (api.diff === "mudah") nOrder = 2;
        var menuSize = api.diff === "cabaran" ? 8 : 6;
        var menu = MK.Gen.sample(items, menuSize);
        var order = MK.Gen.sample(menu, nOrder);
        var phase = 0; // 0=pilih, 1=jumlah, 2=baki
        var tray = [];

        function renderHeader(txt) {
          mount.innerHTML = "";
          mount.appendChild(MK.el("div", "prompt small", txt + " — Pelanggan " + (round + 1) + "/" + perLevel));
          var cust = MK.el("div", "row center");
          cust.style.cssText = "font-size:2.2rem;gap:6px";
          cust.innerHTML = "🧑 " + order.map(function (o) { return o.e; }).join("");
          mount.appendChild(cust);
          var orderCard = MK.el("div", "sub-prompt", "Pesanan: " + order.map(function (o) { return o.n; }).join(", "));
          mount.appendChild(orderCard);
        }

        function phasePick() {
          phase = 0;
          renderHeader("Tap item yang dipesan ke dalam bakul");
          var grid = MK.el("div", "choices");
          menu.forEach(function (m) {
            var b = MK.el("button", "choice" + (tray.indexOf(m) >= 0 ? " selected" : ""),
              '<span class="cem">' + m.e + "</span><span>" + m.n + "<br>RM" + m.p + "</span>");
            b.addEventListener("click", function () {
              var i = tray.indexOf(m);
              if (i >= 0) { tray.splice(i, 1); b.classList.remove("selected"); }
              else { tray.push(m); b.classList.add("selected"); }
              MK.Audio.sfx("tap");
              doneBtn.disabled = tray.length !== order.length;
            });
            grid.appendChild(b);
          });
          mount.appendChild(grid);
          var doneBtn = MK.el("button", "btn primary big", "✅ Pesanan Lengkap");
          doneBtn.disabled = true;
          doneBtn.addEventListener("click", function () {
            var okSet = order.every(function (o) { return tray.indexOf(o) >= 0; }) && tray.length === order.length;
            if (okSet) { api.sfx("good"); phaseTotal(); }
            else {
              mistakes++;
              api.sfx("retry"); api.feedback(false, "Pesanan belum sama. Semak semula bakul!");
            }
          });
          mount.appendChild(doneBtn);
        }

        function phaseTotal() {
          phase = 1;
          var total = order.reduce(function (a, o) { return a + o.p; }, 0);
          renderHeader("Berapa jumlahnya?");
          var trayLine = MK.el("div", "order-slots");
          trayLine.innerHTML = order.map(function (o) { return "<div class='oslot'>" + o.e + " RM" + o.p + "</div>"; }).join("");
          mount.appendChild(trayLine);
          var nCh = api.diff === "mudah" ? 2 : 3;
          var nums = MK.Gen.numChoices(total, 3, nCh);
          var ch = nums.map(function (x) { return { label: "RM" + x, correct: String(x) === String(total) }; });
          var grid = MK.el("div", "choices");
          MK.Gen.shuffle(ch).forEach(function (c) {
            var b = MK.el("button", "choice", "<span style='font-size:1.3rem'>" + c.label + "</span>");
            b.addEventListener("click", function () {
              if (c.correct) { api.sfx("good"); api.feedback(true, "Jumlah RM" + total + " — tepat!"); phaseChange(total); }
              else { mistakes++; api.sfx("retry"); api.feedback(false); b.classList.add("dimmed"); }
            });
            grid.appendChild(b);
          });
          mount.appendChild(grid);
        }

        function phaseChange(total) {
          phase = 2;
          // pelanggan bayar dengan not yang >= jumlah
          var pay = notes.filter(function (n2) { return n2 >= total && n2 <= total + 25; });
          if (!pay.length) pay = [Math.ceil(total / 5) * 5 + 5];
          var paid = MK.Gen.pick(pay);
          var change = paid - total;
          renderHeader("Pelanggan bayar RM" + paid + " — berapa baki?");
          var payLine = MK.el("div", "sub-prompt", "💵 Diterima: <b>RM" + paid + "</b> • Jumlah: <b>RM" + total + "</b>");
          mount.appendChild(payLine);
          var nCh = api.diff === "mudah" ? 2 : 3;
          var nums = MK.Gen.numChoices(change, 3, nCh, { min: 0 });
          var ch = nums.map(function (x) { return { label: "RM" + x, correct: String(x) === String(change) }; });
          var grid = MK.el("div", "choices");
          MK.Gen.shuffle(ch).forEach(function (c) {
            var b = MK.el("button", "choice", "<span style='font-size:1.3rem'>" + c.label + "</span>");
            b.addEventListener("click", function () {
              if (c.correct) {
                api.sfx("win");
                api.feedback(true, "Baki RM" + change + ". Pelanggan gembira! 🎉");
                round++; api.progress(round, perLevel);
                setTimeout(function () {
                  if (round >= perLevel) api.complete({ mistakes: mistakes }); else play();
                }, 1100);
              } else { mistakes++; api.sfx("retry"); api.feedback(false); b.classList.add("dimmed"); }
            });
            grid.appendChild(b);
          });
          mount.appendChild(grid);
        }
        api._dinerHint = function () {
          if (phase === 0) MK.toast("💡 Pelanggan memesan: " + order.map(function (o) { return o.e + " " + o.n; }).join(", "));
          else if (phase === 1) MK.toast("💡 Jumlahkan semua harga: " + order.map(function (o) { return o.p; }).join(" + "));
          else MK.toast("💡 Baki = wang dibayar − jumlah. Gunakan pengiraan dalam kepala anda!");
        };
        phasePick();
      }
      api.hint(function () { if (api._dinerHint) api._dinerHint(); });
      play();
    }
  });
})();
