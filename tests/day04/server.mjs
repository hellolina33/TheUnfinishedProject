import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const root = process.cwd(),
  config = JSON.parse(fs.readFileSync("vercel.json", "utf8"));
http
  .createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, "http://local").pathname);
    } catch (e) {
      res.writeHead(400).end();
      return;
    }
    let filename = path.resolve(root, "." + pathname);
    if (!filename.startsWith(root + path.sep) && filename !== root) {
      res.writeHead(403).end();
      return;
    }
    if (fs.existsSync(filename) && fs.statSync(filename).isDirectory())
      filename = path.join(filename, "index.html");
    if (!fs.existsSync(filename)) {
      res.writeHead(404).end();
      return;
    }
    if (pathname.startsWith("/day-04-productivity-library/"))
      for (const header of config.headers[0].headers)
        res.setHeader(header.key, header.value);
    if (pathname.startsWith("/day-04-productivity-library/embed/"))
      for (const header of config.headers.at(-1).headers)
        res.setHeader(header.key, header.value);
    res.setHeader(
      "Content-Type",
      {
        ".html": "text/html",
        ".js": "text/javascript",
        ".css": "text/css",
        ".png": "image/png",
        ".svg": "image/svg+xml",
        ".json": "application/json",
        ".txt": "text/plain",
        ".xml": "application/xml",
      }[path.extname(filename)] || "application/octet-stream",
    );
    fs.createReadStream(filename).pipe(res);
  })
  .listen(8764, "127.0.0.1");
