"""Snack Machine (Day 8) - grab a video or its audio from a public link.

GET /api/snack?u=<link>           -> JSON menu of downloadable options
GET /api/snack?u=<link>&f=<id>    -> streams that file to the visitor

The file is re-extracted on download so the media URL is always fresh and
fetched from the same machine that resolved it (YouTube binds URLs to an IP).
"""
import hashlib
import os
import re
import time
import unicodedata
from urllib.parse import urlparse

from flask import Flask, Response, jsonify, request, stream_with_context
import yt_dlp

app = Flask(__name__)

ALLOWED = (
    "youtube.com", "youtu.be", "tiktok.com", "instagram.com",
)
MAX_SECONDS = 45 * 60          # longer videos are refused
MAX_BYTES = 450 * 1024 * 1024  # refuse files bigger than this
MENU_PER_IP_DAY = 60
FILES_PER_IP_DAY = 25
FILES_GLOBAL_DAY = 1500

_day = ""
_menus, _files = {}, {}
_global_files = 0


def _today():
    global _day, _menus, _files, _global_files
    d = time.strftime("%Y-%m-%d", time.gmtime())
    if d != _day:
        _day, _menus, _files, _global_files = d, {}, {}, 0


def _ip():
    raw = request.headers.get("x-forwarded-for", request.remote_addr or "?")
    ip = raw.split(",")[0].strip()
    salt = os.environ.get("TRIAL_SECRET", "snack")
    return hashlib.sha256((salt + ip).encode()).hexdigest()[:24]


def _clean_link(u):
    u = (u or "").strip()[:600]
    if not re.match(r"^https?://", u):
        u = "https://" + u
    try:
        host = (urlparse(u).hostname or "").lower()
    except ValueError:
        return None, None
    for base in ALLOWED:
        if host == base or host.endswith("." + base):
            return u, base
    return None, None


def _ydl(site=""):
    opts = {
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "skip_download": True,
        "socket_timeout": 15,
        "cachedir": False,
        "extractor_args": {"youtube": {"player_client": ["default", "tv_simply", "web_safari"]}},
    }
    # Optional residential proxy for the platforms that block cloud IPs.
    proxy = os.environ.get("SNACK_PROXY")
    if proxy and site in ("youtube.com", "youtu.be", "instagram.com"):
        opts["proxy"] = proxy
    return yt_dlp.YoutubeDL(opts)


def _plain(fmt):
    return fmt.get("protocol") in ("https", "http") and fmt.get("url")


def _size(fmt, duration):
    s = fmt.get("filesize") or fmt.get("filesize_approx")
    if not s and fmt.get("tbr") and duration:
        s = int(fmt["tbr"] * 1000 / 8 * duration)
    return int(s) if s else None


def _options(info):
    duration = info.get("duration") or 0
    fmts = info.get("formats") or [info]
    videos, audios = {}, []
    for f in fmts:
        if not _plain(f):
            continue
        v, a = f.get("vcodec"), f.get("acodec")
        has_v = v not in (None, "none") or (v is None and f.get("height"))
        has_a = a not in (None, "none") or (a is None and has_v and info.get("extractor_key", "").lower().startswith("tiktok"))
        if f.get("ext") not in ("mp4", "m4a", "webm", "mp3", "mov"):
            continue
        if has_v and (has_a or a is None):
            h = f.get("height") or 0
            if not h:
                continue
            key = min(h, f.get("width") or h)  # portrait videos: use the short side
            best = videos.get(key)
            if best is None or (f.get("tbr") or 0) > (best.get("tbr") or 0):
                videos[key] = f
        elif a not in (None, "none") and v == "none":
            audios.append(f)

    out = []
    for key in sorted(videos, reverse=True)[:4]:
        f = videos[key]
        out.append({
            "id": f["format_id"], "kind": "video", "p": key,
            "ext": "mp4" if f.get("ext") in ("mp4", "mov") else f.get("ext"),
            "size": _size(f, duration),
        })
    if audios:
        audios.sort(key=lambda f: ((f.get("ext") == "m4a"), f.get("abr") or f.get("tbr") or 0), reverse=True)
        f = audios[0]
        out.append({"id": f["format_id"], "kind": "audio", "p": 0,
                    "ext": f.get("ext"), "size": _size(f, duration)})
    elif videos:
        # TikTok / Instagram often have no audio-only track: serve the
        # smallest video and let the page label it honestly.
        small = videos[min(videos)]
        out.append({"id": small["format_id"], "kind": "audio-in-video", "p": min(videos),
                    "ext": "mp4", "size": _size(small, duration)})
    return out


def _err(code, key, status):
    r = jsonify({"error": key})
    r.status_code = status
    r.headers["Cache-Control"] = "no-store"
    if request.headers.get("origin") == "null":
        r.headers["Access-Control-Allow-Origin"] = "null"
    return r


def _friendly(e):
    msg = str(e).lower()
    if "sign in" in msg or "bot" in msg or "login" in msg or "cookies" in msg:
        return "blocked"
    if "private" in msg or "unavailable" in msg or "removed" in msg or "not found" in msg or "404" in msg:
        return "gone"
    if "unsupported url" in msg:
        return "unsupported"
    return "jammed"


def _filename(title, ext):
    t = unicodedata.normalize("NFKD", title or "snack").encode("ascii", "ignore").decode()
    t = re.sub(r"[^A-Za-z0-9 _-]+", "", t)
    t = re.sub(r"\s+", " ", t).strip()[:70].strip() or "snack"
    return f"{t}.{ext}"



def _diag():
    out = {}
    yt = "https://www.youtube.com/watch?v=jNQXAC9IVRw"
    for clients in (["tv"], ["tv_simply"], ["web_embedded"], ["mweb"], ["android_vr"], ["ios"], ["web_safari"], ["web_creator"], ["android"]):
        try:
            y = yt_dlp.YoutubeDL({"quiet": True, "no_warnings": True, "skip_download": True, "cachedir": False,
                                  "extractor_args": {"youtube": {"player_client": clients}}})
            i = y.extract_info(yt, download=False)
            fm = [f for f in i.get("formats", []) if f.get("protocol") in ("https", "http")]
            out["yt:" + clients[0]] = "ok %d plain formats, heights %s" % (len(fm), sorted({f.get("height") for f in fm if f.get("height")}))
        except Exception as e:  # noqa: BLE001
            out["yt:" + clients[0]] = "fail " + str(e)[:140]
    for name, url in (("ig_reel", "https://www.instagram.com/reel/C3RlmdFLxFb/"), ("ig_p", "https://www.instagram.com/p/C3RlmdFLxFb/")):
        try:
            i = yt_dlp.YoutubeDL({"quiet": True, "skip_download": True, "cachedir": False}).extract_info(url, download=False)
            out[name] = "ok %d formats" % len(i.get("formats") or [])
        except Exception as e:  # noqa: BLE001
            out[name] = "fail " + str(e)[:140]
    import urllib.request, json as _j
    for name, url in (("piped", "https://pipedapi.kavin.rocks/streams/jNQXAC9IVRw"), ("invidious", "https://inv.nadeko.net/api/v1/videos/jNQXAC9IVRw?local=true"),
                      ("ig_embed", "https://www.instagram.com/p/C3RlmdFLxFb/embed/captioned/")):
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=10)
            body = r.read(400000)
            out[name] = "http %s len %d video_url:%s" % (r.status, len(body), b"video_url" in body or b"videoStreams" in body or b"formatStreams" in body)
        except Exception as e:  # noqa: BLE001
            out[name] = "fail " + str(e)[:120]
    return out

@app.route("/api/snack", methods=["GET"])
@app.route("/api/snack/", methods=["GET"])
def snack():
    global _global_files
    _today()
    if os.environ.get("VERCEL_ENV") == "preview" and request.args.get("diag"):
        return jsonify(_diag())
    if os.environ.get("VERCEL_ENV") == "preview" and request.args.get("selftest"):
        mb = min(int(request.args.get("selftest") or 1), 40)
        def zeros():
            for _ in range(mb * 4):
                yield b"\0" * 262144
        return Response(stream_with_context(zeros()), mimetype="application/octet-stream")
    origin = request.headers.get("origin")
    if origin and origin not in ("https://" + request.host, "http://localhost:3000", "null"):
        return _err(403, "origin", 403)
    link, site = _clean_link(request.args.get("u"))
    if not link:
        return _err(400, "unsupported", 400)
    fid = (request.args.get("f") or "")[:40]
    ip = _ip()

    if not fid:
        if _menus.get(ip, 0) >= MENU_PER_IP_DAY:
            return _err(429, "tired", 429)
        _menus[ip] = _menus.get(ip, 0) + 1
    else:
        if not re.match(r"^[A-Za-z0-9_.+-]+$", fid):
            return _err(400, "bad_format", 400)
        if _files.get(ip, 0) >= FILES_PER_IP_DAY or _global_files >= FILES_GLOBAL_DAY:
            return _err(429, "tired", 429)

    ydl = _ydl(site)
    try:
        info = ydl.extract_info(link, download=False)
    except Exception as e:  # noqa: BLE001
        print("[snack] extract failed", site, str(e)[:300])
        return _err(502, _friendly(e), 502)
    if info.get("_type") == "playlist" or info.get("entries"):
        return _err(400, "playlist", 400)
    if info.get("is_live"):
        return _err(400, "live", 400)
    duration = info.get("duration") or 0
    if duration > MAX_SECONDS:
        return _err(400, "too_long", 400)

    options = _options(info)
    if not fid:
        r = jsonify({
            "title": (info.get("title") or "")[:140],
            "by": (info.get("uploader") or info.get("channel") or "")[:80],
            "thumb": info.get("thumbnail"),
            "duration": duration,
            "site": site,
            "options": options,
        })
        r.headers["Cache-Control"] = "no-store"
        if origin == "null":
            r.headers["Access-Control-Allow-Origin"] = "null"
        return r

    chosen = next((o for o in options if o["id"] == fid), None)
    fmt = next((f for f in (info.get("formats") or [info]) if f.get("format_id") == fid), None)
    if not chosen or not fmt:
        return _err(404, "sold_out", 404)
    if chosen.get("size") and chosen["size"] > MAX_BYTES:
        return _err(400, "too_big", 400)

    try:
        req = yt_dlp.networking.Request(fmt["url"], headers=fmt.get("http_headers") or {})
        upstream = ydl.urlopen(req)
    except Exception as e:  # noqa: BLE001
        print("[snack] fetch failed", site, str(e)[:300])
        return _err(502, "jammed", 502)

    _files[ip] = _files.get(ip, 0) + 1
    _global_files += 1
    ext = "m4a" if chosen["kind"] == "audio" and chosen["ext"] == "m4a" else chosen["ext"]
    name = _filename(info.get("title"), ext)
    length = upstream.headers.get("Content-Length")

    def body():
        sent = 0
        try:
            while True:
                chunk = upstream.read(256 * 1024)
                if not chunk:
                    break
                sent += len(chunk)
                if sent > MAX_BYTES:
                    break
                yield chunk
        finally:
            upstream.close()

    headers = {
        "Content-Disposition": f'attachment; filename="{name}"',
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
    }
    if length:
        headers["Content-Length"] = length
    mime = "audio/mp4" if ext == "m4a" else ("audio/webm" if chosen["kind"] == "audio" else "video/mp4")
    return Response(stream_with_context(body()), headers=headers, mimetype=mime)
