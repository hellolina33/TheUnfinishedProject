# Day 26 · LogoMotion Studio

Instant geometric brand monogram maker and 3-second kinetic intro animator in a single HTML file.

## Features

- **Brand & Monogram editor** — live brand name, 1–2 char monogram, and optional tagline with Horizontal & Stacked lockups.
- **6 Geometric Mark Styles** — Rounded Badge, Split Circle, Orbit, Spark, Monogram Grid, and Isometric Cube.
- **Color & Typography** — 6 curated high-contrast palettes + custom BG/Mark/Text pickers, 3 font families (Sans / Serif / Mono), and 3 weights.
- **4 Kinetic 3s Motion Presets** — Pop & Reveal, Slide Split, Kinetic Pulse, and Typewriter Glow with live 60fps Canvas playback, timeline scrubber, loop toggle, and grid guide.
- **Zero-backend Exports** — Crisp vector **SVG**, **1200×630 OG PNG**, **512×512 App Icon PNG**, and **3s 60fps WebM video** via Canvas `MediaRecorder`.
- **EN / FR toggle**, `localStorage` autosave, and standalone HTML download.

## Still unfinished

- Video export relies on browser-native Canvas `MediaRecorder` (WebM); Safari and some mobile browsers have limited WebM support, and MP4/H.264 transcoding is not bundled.
- Exported SVGs reference web font names rather than converting text glyphs into outlined Bézier paths.
- Custom SVG mark upload and custom keyframe easing curves are not yet implemented.
