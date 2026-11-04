// Builds favicon.svg, favicon.ico (32px PNG inside) and apple-touch-icon.png (180px) for the site and each app.
// Run: node scripts/make-icons.js   (needs playwright + chromium)
const { chromium } = require("playwright"); const fs = require("fs"); const path = require("path");
const INK = "#17141F", root = path.join(__dirname, "..");
const wrap = (bg, inner, rx = 14) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="${rx}" fill="${bg}"/>${inner}</svg>`;
const st = `stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
const ICONS = {
  ".": wrap("#0E1638", `<path d="M32 12 A20 20 0 1 1 12 32" fill="none" stroke="#FFD84D" stroke-width="8" stroke-linecap="round"/><circle cx="32" cy="32" r="4.5" fill="#FFD84D"/>`),
  "day-01-whichoneareyou": wrap("#FFE36E", `<circle cx="32" cy="33" r="21" fill="#FFB8DE" ${st}/><circle cx="25" cy="29" r="3.2" fill="${INK}"/><circle cx="39" cy="29" r="3.2" fill="${INK}"/><path d="M23 39 Q32 48 41 39" fill="none" ${st}/>`),
  "day-02-howmanyweeks": wrap("#A9D6FF", [0,1,2].flatMap(r => [0,1,2].map(c => { const x = 12 + c * 14, y = 12 + r * 14, past = r * 3 + c < 5; return `<rect x="${x}" y="${y}" width="11" height="11" rx="3" fill="${past ? INK : (r * 3 + c === 7 ? "#FF6B4A" : "#FFFFFF")}" stroke="${INK}" stroke-width="2.5"/>`; })).join("")),
  "day-03-officefilter": wrap("#23211F", `<rect x="11" y="27" width="42" height="10" rx="5" fill="#FF5A1F" transform="rotate(-8 32 32)"/>`),
  "day-04-productivity-library": wrap("#D8C6FA", [[10,10,"#FF6B4A"],[34,10,"#FFFFFF"],[10,34,"#FFFFFF"],[34,34,"#FFFFFF"]].map(([x, y, f]) => `<rect x="${x}" y="${y}" width="20" height="20" rx="6" fill="${f}" ${st}/>`).join(""))
};
function ico(png32) { const h = Buffer.alloc(22); h.writeUInt16LE(1, 2); h.writeUInt16LE(1, 4); h[6] = 32; h[7] = 32; h.writeUInt16LE(1, 10); h.writeUInt16LE(32, 12); h.writeUInt32LE(png32.length, 14); h.writeUInt32LE(22, 18); return Buffer.concat([h, png32]); }
(async () => {
  const b = await chromium.launch();
  for (const [dir, svg] of Object.entries(ICONS)) {
    const out = path.join(root, dir); fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, "favicon.svg"), svg);
    const shot = async (size, html, transparent) => { const p = await b.newPage({ viewport: { width: size, height: size } }); await p.setContent(`<body style="margin:0;background:transparent"><style>svg{width:${size}px;height:${size}px;display:block}</style>${html}</body>`); const buf = await p.screenshot({ omitBackground: transparent }); await p.close(); return buf; };
    fs.writeFileSync(path.join(out, "favicon.ico"), ico(await shot(32, svg, true)));
    fs.writeFileSync(path.join(out, "apple-touch-icon.png"), await shot(180, svg.replace(/rx="14"/, 'rx="0"'), false));
    const f32 = path.join(out, "favicon-32.png"); if (fs.existsSync(f32)) fs.unlinkSync(f32);
  }
  await b.close(); console.log("icons ok");
})();
