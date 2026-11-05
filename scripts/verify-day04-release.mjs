import fs from "node:fs";
import crypto from "node:crypto";
const manifest = JSON.parse(
  fs.readFileSync("day-04-productivity-library/release-manifest.json", "utf8"),
);
const site =
  process.env.STUDIO_ORIGIN || "https://the-unfinished-30.vercel.app";
for (const item of manifest.files) {
  const response = await fetch(
    site + "/day-04-productivity-library/" + item.asset,
  );
  if (!response.ok) throw Error("Unavailable release asset " + item.asset);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (crypto.createHash("sha256").update(bytes).digest("hex") !== item.sha256)
    throw Error("Mismatched release asset " + item.asset);
}
for (const page of [
  "/day-04-productivity-library/fr/outils/eisenhower/",
  "/day-04-productivity-library/en/tools/rice/",
  "/sitemap.xml",
  "/robots.txt",
  "/day-04-productivity-library/downloads/productivity-studio-fr.html",
]) {
  const response = await fetch(site + page);
  if (!response.ok) throw Error("Unavailable page " + page);
}
console.log("Production release " + manifest.version + " verified.");
