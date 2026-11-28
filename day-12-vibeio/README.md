# Day 12 · VibeIO

A minimalist, 100% local Frame.io alternative for timestamped video review right inside your browser.

## Features
- **Local video playback + built-in demo reel**: Drop any local MP4 / WebM / MOV file onto the player, or test immediately with the animated 24-second canvas demo reel and sample review notes.
- **Interactive timeline with markers**: Play/pause (`Space`), step `-1s`/`+1s` (`←`/`→`), adjust playback speed (`0.5x`–`2x`), scrub freely, and click color-coded comment pins on the timeline.
- **Timestamped feedback & filtering**: Pin comments at the current timecode with category tags (`Edit`, `Audio`, `Text`, `Bug`, `Approved`), mark items open/resolved, and filter by status or tag.
- **Session export & import**: Export review notes as **Markdown**, **CSV**, or **JSON**, and import a JSON file to resume a review session. Persists automatically in `localStorage`.
- **Bilingual EN / FR** toggle and standalone **Download HTML** button.

## Still unfinished
- No cloud storage or multiplayer live sync — videos stay 100% local and sessions are shared via JSON or Markdown export/import.
- On-frame drawing annotations (arrows/circles over video pixels) are not built yet; notes are anchored to timestamps and tags.
- Browser codec support varies for `.mov` files (HEVC/ProRes); standard H.264 `.mp4` and `.webm` work reliably everywhere.
