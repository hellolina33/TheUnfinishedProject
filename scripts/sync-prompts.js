// Copies the SYSTEM and REVISE prompts from the Office Filter page into api/_prompts.json,
// so the free-trial server uses exactly the same rules as the page. Run: node scripts/sync-prompts.js
const fs = require("fs"), vm = require("vm");
const html = fs.readFileSync(__dirname + "/../day-03-officefilter/index.html", "utf8");
function grab(name) {
  const m = html.match(new RegExp("var " + name + " = (\\[[\\s\\S]*?\\])\\.join\\(\"\\\\n\"\\);"));
  if (!m) throw new Error("prompt not found: " + name);
  return vm.runInNewContext(m[1]).join("\n");
}
fs.writeFileSync(__dirname + "/../api/_prompts.json", JSON.stringify({ main: grab("SYSTEM"), revise: grab("REVISE") }, null, 1));
console.log("ok");
