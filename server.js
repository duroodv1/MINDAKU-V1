/* ============================================================
   MINDAKU V.1 — server.js
   Pelayan statik pembangunan (tanpa dependency):
   - header Service-Worker-Allowed untuk scope '/'
   - MIME betul
   ============================================================ */
"use strict";
var http = require("http");
var fs = require("fs");
var path = require("path");

var ROOT = __dirname;
var PORT = process.env.PORT || 8080;
var MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".md": "text/markdown; charset=utf-8",
  ".webmanifest": "application/manifest+json"
};

http.createServer(function (req, res) {
  var urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  var file = path.normalize(path.join(ROOT, urlPath));
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end("Dilarang"); return; }
  fs.readFile(file, function (err, data) {
    if (err) {
      // fallback SPA
      fs.readFile(path.join(ROOT, "index.html"), function (e2, d2) {
        if (e2) { res.writeHead(404); res.end("Tidak dijumpai"); return; }
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(d2);
      });
      return;
    }
    var ext = path.extname(file).toLowerCase();
    var headers = { "Content-Type": MIME[ext] || "application/octet-stream" };
    if (urlPath.endsWith(".html") || urlPath.includes("service-worker") || ext === ".json") {
      headers["Cache-Control"] = "no-cache";
    }
    if (urlPath.includes("service-worker")) headers["Service-Worker-Allowed"] = "/";
    res.writeHead(200, headers);
    res.end(data);
  });
}).listen(PORT, "0.0.0.0", function () {
  console.log("MINDAKU V.1 berjalan di http://0.0.0.0:" + PORT);
});
