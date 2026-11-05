import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Resvg } from "@resvg/resvg-js";
import JSZip from "jszip";
const lock = JSON.parse(fs.readFileSync("package-lock.json", "utf8"));
fs.mkdirSync("docs/day04", { recursive: true });
fs.writeFileSync(
  "docs/day04/software-inventory.json",
  JSON.stringify(
    {
      lockfileVersion: lock.lockfileVersion,
      packages: Object.entries(lock.packages)
        .filter(([name]) => name)
        .map(([name, value]) => ({
          path: name,
          name: name.split("node_modules/").at(-1),
          version: value.version,
          license: value.license || "see package notice",
          integrity: value.integrity,
          development: value.dev === true,
        })),
    },
    null,
    2,
  ) + "\n",
);
const root = path.resolve("day-04-productivity-library"),
  site = "https://the-unfinished-30.vercel.app",
  prefix = "/day-04-productivity-library/";
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const write = (file, text) => {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), text);
};
const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ],
  );
const data = JSON.parse(read("data/methods.json"));
const ids = new Set();
for (const method of data) {
  if (ids.has(method.id) || !/^[a-z0-9-]+$/.test(method.id))
    throw Error("Invalid or duplicate method id");
  ids.add(method.id);
  for (const version of [method, method.fr])
    for (const field of [
      "n",
      "why",
      "solo",
      "team",
      "d",
      "src",
      "case",
      "outcome",
      "pitfall",
    ])
      if (!version?.[field]) throw Error(method.id + " missing " + field);
  if (!method.fr.case.reasoning || !method.case.reasoning)
    throw Error("Missing case reasoning " + method.id);
}
if (data.length !== 50) throw Error("Expected 50 methods");
write(
  "methods.js",
  "window.__PRODUCTIVITY_INTERNALS = { TOOLS: " +
    JSON.stringify(data) +
    " };\n",
);
const kits = JSON.parse(read("data/journeys.json"));
if (new Set(kits.map((kit) => kit.id)).size !== kits.length)
  throw Error("Duplicate journey id");
for (const kit of kits) {
  if (
    !/^[a-z-]+$/.test(kit.id) ||
    kit.ids.length !== 3 ||
    kit.ids.some((id) => !ids.has(id))
  )
    throw Error("Invalid journey " + kit.id);
  for (const lang of ["en", "fr"])
    if (
      !kit[lang] ||
      !kit.intro[lang] ||
      !kit.result[lang] ||
      kit.steps[lang].length !== kit.ids.length
    )
      throw Error("Incomplete journey " + kit.id);
}
for (const role of ["student", "manager", "professional"])
  if (
    kits.filter((kit) => kit.featured && kit.roles.includes(role)).length !== 5
  )
    throw Error("Expected five needs for " + role);
write(
  "journeys.js",
  "window.ProductivityJourneys=" + JSON.stringify(kits) + ";\n",
);
const dependencies = [
  ["pptxgenjs", "pptxgen.bundle.js"],
  ["jspdf", "jspdf.umd.min.js"],
];
for (const [pkg, file] of dependencies) {
  const text =
    fs
      .readFileSync("node_modules/" + pkg + "/dist/" + file, "utf8")
      .replace(/^\/\/# sourceMappingURL=.*$/gm, "")
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n")
      .trimEnd() + "\n";
  write("vendor/" + file, text);
}
const packages = [
  "pptxgenjs",
  "jszip",
  "pako",
  "setimmediate",
  "jspdf",
  "fflate",
];
let notices =
  "Third-party notices. JSZip is used under its MIT license option.\n";
for (const pkg of packages) {
  const folder = "node_modules/" + pkg;
  if (!fs.existsSync(folder)) continue;
  const info = JSON.parse(fs.readFileSync(folder + "/package.json", "utf8"));
  const filename = [
    "LICENSE",
    "LICENSE.txt",
    "LICENSE.markdown",
    "LICENSE.md",
  ].find((file) => fs.existsSync(folder + "/" + file));
  if (filename) {
    let license = fs.readFileSync(folder + "/" + filename, "utf8");
    if (pkg === "jszip") license = license.split("GPL version 3\n")[0];
    notices += "\n" + pkg + " " + info.version + "\n" + license + "\n";
  }
}
notices +=
  "\nAtkinson Hyperlegible (social image font)\n" +
  read("vendor/fonts/OFL.txt");
notices =
  notices
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trimEnd() + "\n";
write("vendor/NOTICES.txt", notices);
const modules = [
  "methods.js",
  "engine.js",
  "search.js",
  "router.js",
  "journeys.js",
  "workspace.js",
  "reuse.js",
  "learning.js",
  "distribution.js",
  "deck.js",
  "studio.js",
];
const sourceFiles = [
  ...modules,
  "studio.css",
  "vendor/pptxgen.bundle.js",
  "vendor/jspdf.umd.min.js",
  "vendor/NOTICES.txt",
];
const hash = (text) => crypto.createHash("sha256").update(text).digest("hex");
const version = hash(sourceFiles.map((file) => read(file)).join("\n")).slice(
  0,
  12,
);
if (fs.existsSync(path.join(root, "assets")))
  fs.rmSync(path.join(root, "assets"), { recursive: true });
const assets = {};
for (const file of sourceFiles) {
  if (!file.startsWith("vendor/") && Buffer.byteLength(read(file)) > 260000)
    throw Error("Asset exceeds budget " + file);
  const parsed = path.parse(file),
    name =
      "assets/" +
      parsed.name +
      "-" +
      hash(read(file)).slice(0, 12) +
      parsed.ext;
  assets[file] = name;
  write(name, read(file));
}
const release = { version, assets };
write(
  "release.js",
  "window.ProductivityRelease=" + JSON.stringify(release) + ";\n",
);
assets["release.js"] =
  "assets/release-" + hash(read("release.js")).slice(0, 12) + ".js";
write(assets["release.js"], read("release.js"));
const manifest = {
  version,
  files: sourceFiles.map((file) => ({
    path: file,
    asset: assets[file],
    sha256: hash(read(file)),
    bytes: Buffer.byteLength(read(file)),
  })),
  dependencies: dependencies.map(([name]) => {
    const p = JSON.parse(
      fs.readFileSync("node_modules/" + name + "/package.json", "utf8"),
    );
    return { name, version: p.version, license: p.license };
  }),
};
write("release-manifest.json", JSON.stringify(manifest, null, 2));
const url = (lang, id = "") =>
  prefix +
  lang +
  "/" +
  (id ? (lang === "fr" ? "outils/" : "tools/") + id + "/" : "");
function staticGuide(method, lang) {
  const m = lang === "fr" ? { ...method, ...method.fr } : method;
  return `<main class="share-fallback"><nav><a href="${prefix + lang + "/"}">Productivity Studio</a> · <a href="${prefix + lang + "/" + (lang === "fr" ? "bibliotheque/" : "library/")}">${lang === "fr" ? "Les 50 méthodes" : "All 50 methods"}</a></nav><h1>${esc(m.n)}</h1><p>${esc(m.why)}</p><h2>${lang === "fr" ? "Résultat attendu" : "Expected result"}</h2><p>${esc(m.outcome)}</p><h2>${lang === "fr" ? "Cas pratique fictif" : "Fictional worked case"}</h2><p>${esc(m.case.scene)}</p><p>${esc(m.case.reasoning)}</p><p>${esc(m.ex)}</p><h2>${lang === "fr" ? "Étapes" : "Steps"}</h2><ol>${m.solo.map((step) => "<li>" + esc(step) + "</li>").join("")}</ol><h2>${lang === "fr" ? "Vérification" : "Review"}</h2><p>${esc(m.case.check)}</p><h2>${lang === "fr" ? "Limites" : "Limitations"}</h2><p>${esc(m.pitfall)}</p><p>${esc(m.src)}</p><a href="${url(lang, method.id)}?view=practice">${lang === "fr" ? "Ouvrir le canevas interactif" : "Open the interactive worksheet"}</a></main>`;
}
const socialChecks = fs.existsSync(path.join(root, "social/checks.json"))
  ? JSON.parse(read("social/checks.json"))
  : {};
function social(method, lang) {
  const m = lang === "fr" ? { ...method, ...method.fr } : method,
    title = m.n.split(/\s+/),
    lines = [];
  let line = "";
  for (const word of title) {
    if ((line + " " + word).length > 27) {
      lines.push(line);
      line = word;
    } else line += (line ? " " : "") + word;
  }
  if (line) lines.push(line);
  const check = hash(m.n + lang);
  if (
    socialChecks[lang + "-" + method.id] === check &&
    fs.existsSync(path.join(root, "social/" + lang + "-" + method.id + ".png"))
  )
    return;
  socialChecks[lang + "-" + method.id] = check;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f5f2e9"/><rect x="55" y="60" width="80" height="10" fill="#ff5a32"/><text x="55" y="115" font-family="Atkinson Hyperlegible" font-size="23" fill="#51534d">THE UNFINISHED 30 · PRODUCTIVITY STUDIO</text>${lines.map((line, i) => `<text x="55" y="${220 + i * 76}" font-family="Atkinson Hyperlegible" font-size="65" font-weight="bold" fill="#161713">${esc(line)}</text>`).join("")}<text x="55" y="540" font-family="Atkinson Hyperlegible" font-size="27" fill="#161713">${lang === "fr" ? "Canevas gratuit · Cas pratique · PowerPoint et PDF" : "Free worksheet · Worked case · PowerPoint and PDF"}</text><text x="55" y="585" font-family="Atkinson Hyperlegible" font-size="21" fill="#51534d">${lang === "fr" ? "Français et anglais · Version hors ligne" : "French and English · Offline edition"}</text></svg>`;
  write(
    "social/" + lang + "-" + method.id + ".png",
    new Resvg(svg, {
      font: {
        fontFiles: [
          path.join(root, "vendor/fonts/AtkinsonHyperlegible-Regular.ttf"),
          path.join(root, "vendor/fonts/AtkinsonHyperlegible-Bold.ttf"),
        ],
        loadSystemFonts: false,
        defaultFontFamily: "Atkinson Hyperlegible",
      },
    })
      .render()
      .asPng(),
  );
}
const scriptTag = (file) =>
  '<script src="' + prefix + assets[file] + '" defer></script>';
function page(lang, route, method) {
  const m = method
    ? lang === "fr"
      ? { ...method, ...method.fr }
      : method
    : null;
  const canonical =
    site +
    (m
      ? url(lang, method.id)
      : route === "all"
        ? prefix + lang + "/" + (lang === "fr" ? "bibliotheque/" : "library/")
        : url(lang));
  const title = m
    ? m.n +
      " · " +
      (lang === "fr"
        ? method.id === "rice" ||
          method.id === "pareto" ||
          method.id === "weighted"
          ? "Calculateur et exemple gratuit"
          : "Canevas et exemple gratuit"
        : method.id === "rice" ||
            method.id === "pareto" ||
            method.id === "weighted"
          ? "Free calculator and example"
          : "Free worksheet and example")
    : lang === "fr"
      ? "50 méthodes de productivité à utiliser · Productivity Studio"
      : "50 productivity tools to use · Productivity Studio";
  const description = m
    ? m.why
    : lang === "fr"
      ? "Choisis une méthode, complète ton canevas et télécharge le résultat. 50 outils gratuits en français et en anglais, aussi hors ligne."
      : "Choose a method, fill a worksheet and download the result. 50 free tools in English and French, also available offline.";
  const fallback = m
    ? staticGuide(method, lang)
    : `<main class="share-fallback"><h1>${esc(title)}</h1><p>${esc(description)}</p><ul>${data.map((method) => `<li><a href="${url(lang, method.id)}">${esc(lang === "fr" ? method.fr.n : method.n)}</a></li>`).join("")}</ul></main>`;
  const image =
    site +
    prefix +
    "social/" +
    lang +
    "-" +
    (method?.id || "eisenhower") +
    ".png";
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="en" href="${site + (route === "all" ? prefix + "en/library/" : url("en", method?.id))}"><link rel="alternate" hreflang="fr" href="${site + (route === "all" ? prefix + "fr/bibliotheque/" : url("fr", method?.id))}"><link rel="alternate" hreflang="x-default" href="${site + (route === "all" ? prefix + "en/library/" : url("en", method?.id))}"><meta property="og:type" content="website"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${image}"><meta name="twitter:card" content="summary_large_image"><link rel="icon" href="${prefix}favicon.svg"><link rel="stylesheet" href="${prefix + assets["studio.css"]}"><script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "WebApplication", name: m?.n || "Productivity Studio", url: canonical, inLanguage: lang, applicationCategory: "ProductivityApplication", operatingSystem: "Web browser", isAccessibleForFree: true }).replace(/</g, "\\u003c")}</script></head><body data-version="${version}" data-base="${prefix}" data-route="${method ? "#/tool/" + method.id : route === "all" ? "#/all" : "#/"}"><div id="app">${fallback}</div>${["release.js", ...modules].map(scriptTag).join("")}</body></html>`;
}
for (const lang of ["en", "fr"]) {
  write(lang + "/index.html", page(lang, "home"));
  write(
    lang + "/" + (lang === "fr" ? "bibliotheque" : "library") + "/index.html",
    page(lang, "all"),
  );
  write(
    lang + "/" + (lang === "fr" ? "resultats" : "results") + "/index.html",
    page(lang, "results"),
  );
  for (const method of data) {
    social(method, lang);
    write(
      lang +
        "/" +
        (lang === "fr" ? "outils" : "tools") +
        "/" +
        method.id +
        "/index.html",
      page(lang, "tool", method),
    );
    write(
      "embed/" + lang + "/" + method.id + "/index.html",
      page(lang, "tool", method).replace("<body ", '<body data-embed="true" '),
    );
  }
  const inline = (code) =>
    "<script>" + code.replace(/<\/script/gi, "<\\/script") + "</script>";
  const offline = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' blob:; style-src 'unsafe-inline'; img-src data: blob:; font-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'"><title>Productivity Studio · Offline ${lang}</title><style>${read("studio.css")}</style></head><body data-version="${version}"><div id="app"></div><script type="text/plain" id="offline-notices">${notices.replace(/<\/script/gi, "<\\/script")}</script>${inline(read("vendor/pptxgen.bundle.js")) + inline(read("vendor/jspdf.umd.min.js")) + modules.map((file) => inline(read(file))).join("")}</body></html>`;
  write("downloads/productivity-studio-" + lang + ".html", offline);
  for (const kit of kits) {
    const href = prefix + lang + "/kits/" + kit.id + "/";
    const kitTitle = esc(kit[lang] + " · Productivity Studio");
    const methodNames = kit.ids
      .map((id) => {
        const method = data.find((item) => item.id === id);
        return lang === "fr" ? method.fr.n : method.n;
      })
      .join(", ");
    const kitDescription = esc(kit.result[lang] + " · " + methodNames);
    let html = page(lang, "home");
    for (const language of ["en", "fr"])
      html = html
        .split(site + url(language))
        .join(site + prefix + language + "/kits/" + kit.id + "/");
    const fallback =
      '<main class="share-fallback"><h1>' +
      esc(kit[lang]) +
      "</h1><ol>" +
      kit.ids
        .map((id) => {
          const m = data.find((m) => m.id === id),
            v = lang === "fr" ? m.fr : m;
          return (
            '<li><h2><a href="' +
            url(lang, id) +
            '">' +
            esc(v.n) +
            "</a></h2><p>" +
            esc(v.outcome) +
            "</p></li>"
          );
        })
        .join("") +
      "</ol></main>";
    html = html
      .replace(/<title>.*?<\/title>/, "<title>" + kitTitle + "</title>")
      .replace(
        /<meta property="og:title" content="[^"]*">/,
        '<meta property="og:title" content="' + kitTitle + '">',
      )
      .replace(
        /<meta name="description" content="[^"]*">/,
        '<meta name="description" content="' + kitDescription + '">',
      )
      .replace(
        /<meta property="og:description" content="[^"]*">/,
        '<meta property="og:description" content="' + kitDescription + '">',
      )
      .replace(
        /<meta property="og:image" content="[^"]*">/,
        '<meta property="og:image" content="' +
          site +
          prefix +
          "social/" +
          lang +
          "-" +
          kit.ids[0] +
          '.png">',
      )
      .replace(
        /<div id="app">[\s\S]*?<\/div>/,
        '<div id="app">' + fallback + "</div>",
      );
    write(lang + "/kits/" + kit.id + "/index.html", html);
    const zip = new JSZip();
    zip.file("productivity-studio-" + lang + ".html", offline);
    zip.file("NOTICES.txt", notices);
    for (const id of kit.ids) {
      const m = data.find((m) => m.id === id),
        v = lang === "fr" ? m.fr : m;
      zip.file(
        id + ".md",
        "# " +
          v.n +
          "\n\n" +
          v.why +
          "\n\n" +
          v.solo.map((step, i) => i + 1 + ". " + step).join("\n") +
          "\n\n" +
          v.case.scene +
          "\n\n" +
          v.case.reasoning +
          "\n\n" +
          v.case.check +
          "\n\n" +
          v.src +
          "\n",
      );
      zip.file(
        id + ".png",
        fs.readFileSync(path.join(root, "social/" + lang + "-" + id + ".png")),
      );
    }
    // Stable ZIP timestamps keep repeated builds and repository outputs identical.
    zip.forEach((_, file) => {
      file.date = new Date("2026-01-01T00:00:00.000Z");
    });
    write(
      "downloads/kit-" + kit.id + "-" + lang + ".zip",
      await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }),
    );
  }
}
write("social/checks.json", JSON.stringify(socialChecks));
write("index.html", page("en", "home"));
for (const method of data)
  write("tools/" + method.id + "/index.html", page("en", "tool", method));
const locations = [
  site + "/",
  ...fs
    .readdirSync(".")
    .filter(
      (name) =>
        /^day-\d+/.test(name) && fs.existsSync(path.join(name, "index.html")),
    )
    .map((name) => site + "/" + name + "/"),
];
for (const lang of ["en", "fr"]) {
  for (const kit of kits)
    locations.push(site + prefix + lang + "/kits/" + kit.id + "/");
  locations.push(
    site + url(lang),
    site + prefix + lang + "/" + (lang === "fr" ? "bibliotheque/" : "library/"),
  );
  for (const method of data) locations.push(site + url(lang, method.id));
}
fs.writeFileSync(
  "sitemap.xml",
  '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    locations.map((loc) => "<url><loc>" + esc(loc) + "</loc></url>").join("") +
    "</urlset>",
);
fs.writeFileSync(
  "robots.txt",
  "User-agent: *\nAllow: /\nSitemap: " + site + "/sitemap.xml\n",
);
// Publish only site files. Development tools and API source stay outside public/.
const publicRoot = path.resolve("public");
fs.rmSync(publicRoot, { recursive: true, force: true });
fs.mkdirSync(publicRoot, { recursive: true });
for (const entry of fs.readdirSync(".")) {
  if (
    /^day-\d+-/.test(entry) ||
    entry === "images" ||
    [
      "index.html",
      "favicon.ico",
      "favicon.svg",
      "apple-touch-icon.png",
      "og.jpg",
      "robots.txt",
      "sitemap.xml",
    ].includes(entry)
  ) {
    fs.cpSync(entry, path.join(publicRoot, entry), { recursive: true });
  }
}
console.log(
  "Built Day 04 " +
    version +
    ": 100 localized guides, hashed assets, social images and two offline apps.",
);
