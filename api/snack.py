"""Snack Machine (Day 8) - TikTok profiles, stats and bulk downloads (+ single X posts).

GET /api/snack?u=<link>             -> JSON: author profile + their latest videos with stats
                                       (TikTok video or profile link), or one post (X link)
GET /api/snack?u=<post>&f=<preset>  -> streams one file. preset: best | light | audio

Files are re-extracted at download time so the media URL is always fresh.
"""
import hashlib
import json
import os
import re
import time
import unicodedata
import urllib.request
from urllib.parse import urlparse

from flask import Flask, Response, jsonify, request, stream_with_context
import yt_dlp

app = Flask(__name__)

ALLOWED = ("tiktok.com", "x.com", "twitter.com")
MAX_SECONDS = 20 * 60
MAX_BYTES = 300 * 1024 * 1024
MAX_VIDEOS = 90
MENU_PER_IP_DAY = 80
FILES_PER_IP_DAY = 120
FILES_GLOBAL_DAY = 4000
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36"

_day = ""
_menus, _files, _cache = {}, {}, {}
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
    if re.fullmatch(r"@[\w.-]{2,40}", u):
        u = "https://www.tiktok.com/" + u
    if not re.match(r"^https?://", u):
        u = "https://" + u
    try:
        host = (urlparse(u).hostname or "").lower()
    except ValueError:
        return None, None
    for base in ALLOWED:
        if host == base or host.endswith("." + base):
            return u, ("x" if base in ("x.com", "twitter.com") else "tiktok")
    return None, None


def _ydl(**extra):
    opts = {"quiet": True, "no_warnings": True, "noplaylist": True, "skip_download": True,
            "socket_timeout": 15, "cachedir": False}
    opts.update(extra)
    return yt_dlp.YoutubeDL(opts)


def _cors(r):
    if request.headers.get("origin") == "null":
        r.headers["Access-Control-Allow-Origin"] = "null"
    return r


def _err(key, status):
    r = jsonify({"error": key})
    r.status_code = status
    r.headers["Cache-Control"] = "no-store"
    return _cors(r)


def _ok(payload):
    r = Response(json.dumps(payload, default=str), mimetype="application/json")
    r.headers["Cache-Control"] = "no-store"
    return _cors(r)


def _friendly(e):
    msg = str(e).lower()
    if "private" in msg:
        return "private"
    if "sign in" in msg or "bot" in msg or "login" in msg or "cookies" in msg:
        return "blocked"
    if "unavailable" in msg or "removed" in msg or "not found" in msg or "404" in msg or "does not have any videos" in msg:
        return "gone"
    if "unsupported url" in msg or "no video" in msg:
        return "unsupported"
    return "jammed"


def _filename(title, ext):
    t = unicodedata.normalize("NFKD", title or "snack").encode("ascii", "ignore").decode()
    t = re.sub(r"[^A-Za-z0-9 _-]+", "", t)
    t = re.sub(r"\s+", " ", t).strip()[:70].strip() or "snack"
    return f"{t}.{ext}"


# ---------- profile ----------

def _thumb(e):
    if e.get("thumbnail"):
        return e["thumbnail"]
    th = e.get("thumbnails") or []
    for t in th:
        if t.get("id") in ("cover", "originCover", "thumbnail") and t.get("url"):
            return t["url"]
    return th[0]["url"] if th and th[0].get("url") else None


def _video_row(e, handle):
    vid = str(e.get("id") or "")
    return {
        "id": vid,
        "url": e.get("webpage_url") or e.get("url") or f"https://www.tiktok.com/@{handle}/video/{vid}",
        "title": (e.get("title") or e.get("description") or "")[:300],
        "views": e.get("view_count"), "likes": e.get("like_count"),
        "comments": e.get("comment_count"), "shares": e.get("repost_count"),
        "duration": e.get("duration"), "ts": e.get("timestamp"),
        "thumb": _thumb(e), "music": (e.get("track") or "")[:80],
    }


def _tiktok_user_page(handle):
    req = urllib.request.Request(f"https://www.tiktok.com/@{handle}", headers={"User-Agent": UA, "Accept-Language": "en"})
    body = urllib.request.urlopen(req, timeout=12).read().decode("utf8", "ignore")
    m = re.search(r'<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>(.*?)</script>', body, re.S)
    if not m:
        return {}
    detail = json.loads(m.group(1)).get("__DEFAULT_SCOPE__", {}).get("webapp.user-detail", {})
    ui = detail.get("userInfo") or {}
    u, st = ui.get("user") or {}, ui.get("stats") or ui.get("statsV2") or {}
    if not u:
        return {}
    return {
        "handle": u.get("uniqueId") or handle, "name": u.get("nickname"), "bio": (u.get("signature") or "")[:300],
        "avatar": u.get("avatarMedium") or u.get("avatarThumb"), "verified": bool(u.get("verified")),
        "followers": st.get("followerCount"), "likes": st.get("heartCount") or st.get("heart"),
        "videos": st.get("videoCount"), "private": bool(u.get("privateAccount")),
        "url": f"https://www.tiktok.com/@{u.get('uniqueId') or handle}",
    }


def _handle_from(link):
    m = re.search(r"tiktok\.com/@([\w.-]+)", link)
    if m:
        return m.group(1), None
    # short links (vm./vt.tiktok.com, /t/...): resolve through the video page
    info = _ydl().extract_info(link, download=False)
    return info.get("uploader") or info.get("channel"), str(info.get("id") or "")


def _tiktok_profile(link, n):
    handle, focus = _handle_from(link)
    if not handle:
        raise RuntimeError("unsupported url")
    m = re.search(r"/video/(\d+)", link)
    if m:
        focus = m.group(1)
    key = (handle.lower(), n)
    hit = _cache.get(key)
    if hit and time.time() - hit[0] < 600:
        data = dict(hit[1])
    else:
        try:
            prof = _tiktok_user_page(handle)
        except Exception as e:  # noqa: BLE001
            print("[snack] profile page failed", str(e)[:200])
            prof = {}
        prof = prof or {"handle": handle, "url": f"https://www.tiktok.com/@{handle}"}
        y = _ydl(noplaylist=False, extract_flat="in_playlist", playlistend=n, ignoreerrors=True)
        info = y.extract_info(f"https://www.tiktok.com/@{handle}", download=False) or {}
        videos = [_video_row(e, handle) for e in (info.get("entries") or []) if e and e.get("id")]
        if not videos and prof.get("private"):
            raise RuntimeError("private account")
        data = {"kind": "profile", "site": "tiktok", "profile": prof, "videos": videos}
        _cache[key] = (time.time(), data)
        if len(_cache) > 200:
            _cache.pop(next(iter(_cache)))
    data["focus"] = focus
    # a pasted video older than the loaded window goes on top
    if focus and not any(v["id"] == focus for v in data["videos"]):
        try:
            one = _ydl().extract_info(f"https://www.tiktok.com/@{handle}/video/{focus}", download=False)
            data = dict(data, videos=[_video_row(one, handle)] + data["videos"])
        except Exception:  # noqa: BLE001
            pass
    if not data["videos"]:
        raise RuntimeError("does not have any videos")
    return data


def _single(link, site):
    info = _ydl().extract_info(link, download=False)
    if info.get("entries"):
        info = next((e for e in info["entries"] if e), None) or {}
    handle = info.get("uploader_id") or ""
    row = _video_row(info, handle)
    row["url"] = info.get("webpage_url") or link
    row["title"] = (info.get("description") or info.get("title") or "")[:300]
    options = _options(info)
    if not any(o["kind"] == "video" for o in options):
        raise RuntimeError("no video")
    return {"kind": "single", "site": site,
            "profile": {"handle": handle, "name": info.get("uploader") or handle,
                        "url": f"https://x.com/{handle}" if handle else None},
            "videos": [row], "focus": row["id"]}


# ---------- formats ----------

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
        if not _plain(f) or f.get("ext") not in ("mp4", "m4a", "mp3", "mov", "webm"):
            continue
        v, a = f.get("vcodec"), f.get("acodec")
        if v != "none" and f.get("height"):
            if a == "none":
                continue  # picture without sound
            key = min(f["height"], f.get("width") or f["height"])
            h264 = str(v or "").startswith(("h264", "avc")) or (v is None and f.get("ext") == "mp4")
            score = (h264, f.get("tbr") or 0)
            best = videos.get(key)
            if best is None or score > best[0]:
                videos[key] = (score, f, h264)
        elif (v == "none" and a not in (None, "none")) or f.get("format_id") == "audio":
            audios.append(f)
    out = []
    for key in sorted(videos, reverse=True)[:4]:
        _, f, h264 = videos[key]
        out.append({"id": f["format_id"], "kind": "video", "p": key, "ext": "mp4",
                    "h264": h264, "size": _size(f, duration)})
    if audios:
        audios.sort(key=lambda f: (f.get("ext") in ("m4a", "mp3"), f.get("abr") or f.get("tbr") or 0), reverse=True)
        f = audios[0]
        out.append({"id": f["format_id"], "kind": "audio", "p": 0, "ext": f.get("ext") or "m4a",
                    "size": _size(f, duration)})
    return out


def _pick(options, preset):
    vids = [o for o in options if o["kind"] == "video"]
    if preset == "audio":
        # no separate sound track (common on X): the lightest video carries the sound
        return next((o for o in options if o["kind"] == "audio"), vids[-1] if vids else None)
    if preset == "light" and vids:
        return vids[-1]
    if preset == "best" and vids:
        # H.264 first: it plays in PowerPoint, Keynote and Google Slides
        return next((o for o in vids if o.get("h264")), vids[0])
    return next((o for o in options if o["id"] == preset), None)


# ---------- route ----------

@app.route("/api/snack", methods=["GET"])
@app.route("/api/snack/", methods=["GET"])
def snack():
    global _global_files
    _today()
    origin = request.headers.get("origin")
    if origin and origin not in ("https://" + request.host, "http://localhost:3000", "null"):
        return _err("origin", 403)
    link, site = _clean_link(request.args.get("u"))
    if not link:
        return _err("unsupported", 400)
    preset = (request.args.get("f") or "")[:40]
    ip = _ip()

    if not preset:
        if _menus.get(ip, 0) >= MENU_PER_IP_DAY:
            return _err("tired", 429)
        _menus[ip] = _menus.get(ip, 0) + 1
        try:
            n = max(12, min(MAX_VIDEOS, int(request.args.get("n") or 60)))
        except ValueError:
            n = 60
        try:
            if site == "tiktok":
                return _ok(_tiktok_profile(link, n))
            return _ok(_single(link, site))
        except Exception as e:  # noqa: BLE001
            print("[snack] menu failed", site, str(e)[:300])
            return _err(_friendly(e), 502)

    if not re.match(r"^[A-Za-z0-9_.+-]+$", preset):
        return _err("bad_format", 400)
    if _files.get(ip, 0) >= FILES_PER_IP_DAY or _global_files >= FILES_GLOBAL_DAY:
        return _err("tired", 429)
    ydl = _ydl()
    try:
        info = ydl.extract_info(link, download=False)
    except Exception as e:  # noqa: BLE001
        print("[snack] extract failed", site, str(e)[:300])
        return _err(_friendly(e), 502)
    if info.get("entries"):
        info = next((e for e in info["entries"] if e), None) or {}
    if (info.get("duration") or 0) > MAX_SECONDS:
        return _err("too_long", 400)
    chosen = _pick(_options(info), preset)
    fmt = chosen and next((f for f in (info.get("formats") or [info]) if f.get("format_id") == chosen["id"]), None)
    if not chosen or not fmt:
        return _err("sold_out", 404)
    if chosen.get("size") and chosen["size"] > MAX_BYTES:
        return _err("too_big", 400)
    try:
        upstream = ydl.urlopen(yt_dlp.networking.Request(fmt["url"], headers=fmt.get("http_headers") or {}))
    except Exception as e:  # noqa: BLE001
        print("[snack] fetch failed", site, str(e)[:300])
        return _err("jammed", 502)

    _files[ip] = _files.get(ip, 0) + 1
    _global_files += 1
    ext = chosen["ext"]
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

    headers = {"Content-Disposition": f'attachment; filename="{_filename(info.get("title"), ext)}"',
               "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "X-Snack-Ext": ext,
               "Access-Control-Expose-Headers": "X-Snack-Ext"}
    if length:
        headers["Content-Length"] = length
    if origin == "null":
        headers["Access-Control-Allow-Origin"] = "null"
    mime = {"m4a": "audio/mp4", "mp3": "audio/mpeg"}.get(ext, "video/mp4")
    return Response(stream_with_context(body()), headers=headers, mimetype=mime)
