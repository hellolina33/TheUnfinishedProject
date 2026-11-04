// Office Filter free trial. The Gemini key lives only in the GEMINI_API_KEY environment variable.
// Limits: FREE_TRIES per visitor (signed cookie + per-IP counter), a global daily cap, short input,
// short output, same-origin only. The prompts are fixed on the server, so this cannot be used as a general chatbot.
const crypto = require("crypto");
const PROMPTS = require("./_prompts.json");

const MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const FREE_TRIES = parseInt(process.env.FREE_TRIES || "5", 10);
const DAILY_CAP = parseInt(process.env.DAILY_CAP || "300", 10);
const MAX_INPUT = 3500;
const MAX_OUTPUT = 900;
const COOKIE = "of_trial";
const ORIGINS = (process.env.ALLOWED_ORIGINS || "https://the-unfinished-30.vercel.app").split(",");

// Best-effort memory, per warm instance. The cookie is the main counter; this adds IP and daily limits.
const ipUse = new Map();
let day = "", dayCount = 0;

const secret = () => process.env.TRIAL_SECRET || "";
const sign = (v) => crypto.createHmac("sha256", secret()).update(v).digest("hex").slice(0, 24);

function readCookie(req) {
  const m = (req.headers.cookie || "").match(new RegExp("(?:^|; )" + COOKIE + "=([^;]+)"));
  if (!m) return 0;
  const [n, sig] = m[1].split(".");
  const c = parseInt(n, 10);
  if (!(c >= 0) || sig !== sign("n" + c)) return 0;
  return c;
}
function setCookie(res, c) {
  res.setHeader("Set-Cookie", `${COOKIE}=${c}.${sign("n" + c)}; Path=/; Max-Age=2592000; HttpOnly; Secure; SameSite=Strict`);
}
function ipOf(req) { return String((req.headers["x-forwarded-for"] || "").split(",")[0] || req.socket.remoteAddress || "?").trim(); }
function allowedOrigin(req) {
  const o = req.headers.origin || "";
  return !o || ORIGINS.includes(o) || /^https:\/\/the-unfinished-30[a-z0-9-]*\.vercel\.app$/.test(o);
}
function used(req) { return Math.max(readCookie(req), ipUse.get(ipOf(req)) || 0); }
function body(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch (e) { return {}; }
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!secret() || !process.env.GEMINI_API_KEY) return res.status(503).json({ error: "off" });
  if (!allowedOrigin(req)) return res.status(403).json({ error: "origin" });

  if (req.method === "GET") return res.status(200).json({ left: Math.max(0, FREE_TRIES - used(req)), total: FREE_TRIES });
  if (req.method !== "POST") return res.status(405).json({ error: "method" });

  const today = new Date().toISOString().slice(0, 10);
  if (today !== day) { day = today; dayCount = 0; ipUse.clear(); }
  const u = used(req);
  if (u >= FREE_TRIES) return res.status(429).json({ error: "trial_over", left: 0 });
  if (dayCount >= DAILY_CAP) return res.status(429).json({ error: "busy", left: Math.max(0, FREE_TRIES - u) });

  const b = body(req);
  const system = b.mode === "revise" ? PROMPTS.revise : b.mode === "main" ? PROMPTS.main : null;
  const user = typeof b.user === "string" ? b.user : "";
  if (!system || !user || user.length > MAX_INPUT) return res.status(400).json({ error: "input" });

  // Count before calling, so a failed or cancelled request cannot be used to dodge the limit.
  dayCount++; ipUse.set(ipOf(req), u + 1); setCookie(res, u + 1);
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: MAX_OUTPUT, temperature: 0.7 }
      })
    });
    const j = await r.json().catch(() => null);
    if (!r.ok || !j) return res.status(502).json({ error: "upstream", left: Math.max(0, FREE_TRIES - u - 1) });
    const text = (((j.candidates || [])[0] || {}).content || { parts: [] }).parts.map((x) => x.text || "").join("");
    return res.status(200).json({ text, left: Math.max(0, FREE_TRIES - u - 1) });
  } catch (e) {
    return res.status(502).json({ error: "upstream", left: Math.max(0, FREE_TRIES - u - 1) });
  }
};
