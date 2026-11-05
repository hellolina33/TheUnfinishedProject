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
for (const [legacy, destination] of [
  [
    "/day-04-productivity-library/tools/pareto/?lang=fr",
    "/day-04-productivity-library/fr/outils/pareto/",
  ],
  [
    "/day-04-productivity-library/tools/pareto/",
    "/day-04-productivity-library/en/tools/pareto/",
  ],
]) {
  const response = await fetch(site + legacy, { redirect: "manual" });
  const location = new URL(response.headers.get("location") || "/", site);
  if (
    ![301, 308].includes(response.status) ||
    location.pathname !== destination
  )
    throw Error("Legacy URL did not redirect to its canonical page: " + legacy);
}
console.log("Permanent legacy redirects verified.");
