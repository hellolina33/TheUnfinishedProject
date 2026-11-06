"""Builds day-05-rainroom/rain-room.html: the app with every sound embedded, so it works as one file.
Run after any change to day-05-rainroom/index.html:  python3 scripts/build-rainroom-standalone.py"""
import base64, os, re
D = os.path.join(os.path.dirname(__file__), "..", "day-05-rainroom")
src = open(os.path.join(D, "index.html"), encoding="utf8").read()
snd = {}
for f in sorted(os.listdir(os.path.join(D, "snd"))):
    if f.endswith(".mp3"):
        snd[f[:-4]] = "data:audio/mpeg;base64," + base64.b64encode(open(os.path.join(D, "snd", f), "rb").read()).decode()
js = "window.RR_SND={" + ",".join('"%s":"%s"' % (k, v) for k, v in snd.items()) + "};"
out = src.replace('<script defer src="/_vercel/insights/script.js"></script>', "")
out = re.sub(r'<link rel="(icon|apple-touch-icon)"[^>]*>\n?', "", out)
out = out.replace("<script>\n(function(){", "<script>" + js + "</script>\n<script>\n(function(){", 1)
assert "window.RR_SND" in out
open(os.path.join(D, "rain-room.html"), "w", encoding="utf8").write(out)
print("rain-room.html", round(len(out) / 1e6, 1), "MB,", len(snd), "sounds")
