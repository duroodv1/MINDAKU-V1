/* Jana projek TWA (Trusted Web Activity) daripada twa-manifest.json — tanpa prompt interaktif.
   Guna: node gen-twa.js <twa-manifest.json> <direktori-sasaran>
   Memerlukan: npm install @bubblewrap/core  */
"use strict";
const { TwaManifest, TwaGenerator, ConsoleLog } = require("@bubblewrap/core");
(async () => {
  const src = process.argv[2] || "twa-manifest.json";
  const targetDir = process.argv[3] || ".";
  const twaManifest = await TwaManifest.fromFile(src);
  await new TwaGenerator().createTwaProject(targetDir, twaManifest, new ConsoleLog());
  console.log("OK: projek TWA dijana di", targetDir);
})().catch(function (e) { console.error("RALAT:", (e && e.message) || e); process.exit(1); });
