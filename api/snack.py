"""Snack Machine (Day 8) - TikTok profiles, stats and bulk downloads (+ single X posts).

GET /api/snack?u=<link>             -> JSON: author profile + their latest videos with stats
                                       (TikTok video or profile link), or one post (X link)
GET /api/snack?u=<post>&f=<preset>  -> streams one file. preset: best | light | audio

Files are re-extracted at download time so the media URL is always fresh.
"""
import calendar
import hashlib
import json
import os
import re
import time
import unicodedata
import urllib.request
from urllib.parse import urlparse

from flask import Flask, Response, jsonify, request
import yt_dlp

app = Flask(__name__)

ALLOWED = ("tiktok.com", "x.com", "twitter.com")
MAX_SECONDS = 3 * 60 * 60
MAX_BYTES = 500 * 1024 * 1024
MAX_VIDEOS = 90
MENU_PER_IP_DAY = 80
FILES_PER_IP_DAY = 120
FILES_GLOBAL_DAY = 4000
PLAYS_PER_IP_DAY = 600
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36"

_day = ""
_menus, _files, _cache, _plays, _resolved = {}, {}, {}, {}, {}
_global_files = 0


def _today():
    global _day, _menus, _files, _plays, _global_files
    d = time.strftime("%Y-%m-%d", time.gmtime())
    if d != _day:
        _day, _menus, _files, _plays, _global_files = d, {}, {}, {}, 0


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
    sm = re.search(r"/status/(\d+)", link)
    if sm:
        row["id"] = sm.group(1)
    row["title"] = (info.get("description") or info.get("title") or "")[:300]
    options = _options(info)
    if not any(o["kind"] == "video" for o in options):
        raise RuntimeError("no video")
    return {"kind": "single", "site": site,
            "profile": {"handle": handle, "name": info.get("uploader") or handle,
                        "url": f"https://x.com/{handle}" if handle else None},
            "videos": [row], "focus": row["id"]}



# ---------- X profile (public embed timeline: ~100 latest posts, no login) ----------

X_RESERVED = {"i", "home", "search", "explore", "settings", "messages", "notifications", "hashtag", "intent", "share"}


def _x_handle(link):
    m = re.search(r"(?:x|twitter)\.com/([A-Za-z0-9_]{1,15})(?:/status/(\d+))?", link)
    if not m or m.group(1).lower() in X_RESERVED:
        return None, None
    return m.group(1), m.group(2)


def _x_time(s):
    try:
        return calendar.timegm(time.strptime(s, "%a %b %d %H:%M:%S +0000 %Y"))
    except Exception:  # noqa: BLE001
        return None


def _x_text(tw):
    txt = tw.get("full_text") or tw.get("text") or ""
    return re.sub(r"\s*https://t\.co/\w+$", "", txt).strip()


def _x_timeline(handle):
    url = f"https://syndication.twitter.com/srv/timeline-profile/screen-name/{handle}?showReplies=false"
    body = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "en"}), timeout=15).read().decode("utf8", "ignore")
    m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', body, re.S)
    if not m:
        raise RuntimeError("not found")
    tl = (((json.loads(m.group(1)).get("props") or {}).get("pageProps") or {}).get("timeline") or {})
    return [((e.get("content") or {}).get("tweet")) or {} for e in (tl.get("entries") or [])]


def _x_profile(link):
    handle, focus = _x_handle(link)
    if not handle:
        raise RuntimeError("unsupported url")
    key = ("x:" + handle.lower(), 0)
    hit = _cache.get(key)
    if hit and time.time() - hit[0] < 600:
        data = dict(hit[1])
    else:
        tweets = _x_timeline(handle)
        prof, videos, seen, total = {}, [], set(), 0
        for tw in tweets:
            if not tw.get("id_str"):
                continue
            user = tw.get("user") or {}
            own = (user.get("screen_name") or "").lower() == handle.lower()
            if own:
                total += 1
                if not prof:
                    prof = {"handle": user.get("screen_name"), "name": user.get("name"),
                            "bio": (user.get("description") or "")[:300],
                            "avatar": (user.get("profile_image_url_https") or "").replace("_normal.", "_200x200."),
                            "verified": bool(user.get("verified") or user.get("is_blue_verified")),
                            "followers": user.get("followers_count"), "posts": user.get("statuses_count"),
                            "url": f"https://x.com/{user.get('screen_name')}"}
            if not own or tw["id_str"] in seen:
                continue  # reposts of other accounts are skipped
            media = (tw.get("extended_entities") or tw.get("entities") or {}).get("media") or []
            vid = next((x for x in media if x.get("type") in ("video", "animated_gif")), None)
            if not vid:
                continue
            seen.add(tw["id_str"])
            ms = (vid.get("video_info") or {}).get("duration_millis")
            videos.append({
                "id": tw["id_str"], "url": f"https://x.com/{handle}/status/{tw['id_str']}",
                "title": _x_text(tw)[:300], "views": None, "likes": tw.get("favorite_count"),
                "comments": tw.get("reply_count"), "shares": (tw.get("retweet_count") or 0) + (tw.get("quote_count") or 0),
                "duration": round(ms / 1000, 1) if ms else None, "ts": _x_time(tw.get("created_at") or ""),
                "thumb": vid.get("media_url_https"), "gif": vid.get("type") == "animated_gif",
            })
        prof = prof or {"handle": handle, "url": f"https://x.com/{handle}"}
        prof["scanned"] = total
        data = {"kind": "profile", "site": "x", "profile": prof, "videos": videos}
        _cache[key] = (time.time(), data)
    data["focus"] = focus
    if focus and not any(v["id"] == focus for v in data["videos"]):
        try:
            one = _single(f"https://x.com/{handle}/status/{focus}", "x")
            data = dict(data, videos=one["videos"] + data["videos"])
        except Exception:  # noqa: BLE001
            pass
    if not data["videos"]:
        raise RuntimeError("does not have any videos")
    return data


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
        # H.264 first (plays in PowerPoint, Keynote, Google Slides), and small enough for the tray
        fits = [o for o in vids if not o.get("size") or o["size"] <= MAX_BYTES] or vids[-1:]
        return next((o for o in fits if o.get("h264")), fits[0])
    return next((o for o in options if o["id"] == preset), None)



class _Refused(Exception):
    def __init__(self, key, status):
        super().__init__(key)
        self.key, self.status = key, status


def _resolve(link, preset):
    """Find the media URL for a post + preset, with the headers and cookies the CDN wants."""
    ydl = _ydl()
    info = ydl.extract_info(link, download=False)
    if info.get("entries"):
        info = next((e for e in info["entries"] if e), None) or {}
    if (info.get("duration") or 0) > MAX_SECONDS:
        raise _Refused("too_long", 400)
    chosen = _pick(_options(info), preset)
    fmt = chosen and next((f for f in (info.get("formats") or [info]) if f.get("format_id") == chosen["id"]), None)
    if not chosen or not fmt:
        raise _Refused("sold_out", 404)
    if chosen.get("size") and chosen["size"] > MAX_BYTES:
        raise _Refused("too_big", 400)
    headers = dict(fmt.get("http_headers") or {})
    try:
        cookie = ydl.cookiejar.get_cookie_header(fmt["url"])
    except Exception:  # noqa: BLE001
        cookie = ""
    if cookie:
        headers["Cookie"] = cookie
    return {"t": time.time(), "url": fmt["url"], "headers": headers, "ext": chosen["ext"], "title": info.get("title")}


def _fetch(res, rng=None):
    headers = dict(res["headers"])
    if rng:
        headers["Range"] = rng
    return urllib.request.urlopen(urllib.request.Request(res["url"], headers=headers), timeout=20)


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
            try:
                return _ok(_x_profile(link))
            except Exception as e:  # noqa: BLE001
                print("[snack] x profile failed, single post instead", str(e)[:200])
                if "/status/" not in link:
                    raise
                return _ok(_single(link, site))
        except Exception as e:  # noqa: BLE001
            print("[snack] menu failed", site, str(e)[:300])
            return _err(_friendly(e), 502)

    if not re.match(r"^[A-Za-z0-9_.+-]+$", preset):
        return _err("bad_format", 400)
    play = request.args.get("play") == "1"
    rng = request.headers.get("Range") if play else None
    if rng and not re.fullmatch(r"bytes=\d*-\d*", rng):
        rng = None
    if play:
        if _plays.get(ip, 0) >= PLAYS_PER_IP_DAY:
            return _err("tired", 429)
    elif _files.get(ip, 0) >= FILES_PER_IP_DAY or _global_files >= FILES_GLOBAL_DAY:
        return _err("tired", 429)

    upstream, res = None, None
    key = (link, preset)
    hit = _resolved.get(key)
    if hit and time.time() - hit["t"] < 240:
        res = hit
        try:
            upstream = _fetch(res, rng)
        except Exception as e:  # noqa: BLE001
            print("[snack] cached fetch failed, resolving again", str(e)[:150])
            upstream, res = None, None
    if upstream is None:
        try:
            res = _resolve(link, preset)
        except _Refused as r:
            return _err(r.key, r.status)
        except Exception as e:  # noqa: BLE001
            print("[snack] extract failed", site, str(e)[:300])
            return _err(_friendly(e), 502)
        try:
            upstream = _fetch(res, rng)
        except Exception as e:  # noqa: BLE001
            print("[snack] fetch failed", site, str(e)[:300])
            return _err("jammed", 502)
        _resolved[key] = res
        if len(_resolved) > 300:
            _resolved.pop(next(iter(_resolved)))

    if play:
        if not rng or rng.startswith("bytes=0-"):
            _plays[ip] = _plays.get(ip, 0) + 1
    else:
        _files[ip] = _files.get(ip, 0) + 1
        _global_files += 1
    ext = res["ext"]
    status = getattr(upstream, "status", 200) or 200

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

    disp = "inline" if play else "attachment"
    headers = {"Content-Disposition": f'{disp}; filename="{_filename(res["title"], ext)}"',
               "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "X-Snack-Ext": ext,
               "Access-Control-Expose-Headers": "X-Snack-Ext", "Accept-Ranges": "bytes"}
    for h in ("Content-Length", "Content-Range"):
        if upstream.headers.get(h):
            headers[h] = upstream.headers.get(h)
    if origin == "null":
        headers["Access-Control-Allow-Origin"] = "null"
    mime = {"m4a": "audio/mp4", "mp3": "audio/mpeg"}.get(ext, "video/mp4")
    return Response(body(), status=206 if status == 206 else 200, headers=headers, mimetype=mime)
