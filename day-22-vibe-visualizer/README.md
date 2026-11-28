# Day 22 · Vibe Visualizer

Turn any audio recording into an animated social media audiogram video directly in your browser — zero uploads, zero backend.

## Features
- **Instant Demo Beat**: Built-in Web Audio lo-fi Rhodes + bass + drums loop synthesized on the fly so you can preview and export immediately without uploading a file.
- **Drag & Drop Audio**: Load any local MP3, WAV, M4A, or OGG file with real `AnalyserNode` FFT reactivity and scrubbable playback.
- **Aspect Ratios**: `1:1` Square (1080×1080), `9:16` Reels/TikTok (720×1280), and `16:9` Landscape (1280×720).
- **4 Visual Themes**: Midnight Gold, Warm Cream, Neo Mint, and Sunset Coral.
- **3 Waveform Styles**: Equalizer Bars, Mirror Wave Ribbon, and Circular Pulse Halo.
- **Record & Export WebM**: Captures the live HTML5 Canvas + Web Audio stream via `canvas.captureStream()` and `MediaRecorder` to download a `.webm` video.
- **Bilingual (EN / FR)** & standalone HTML download.

## Still Unfinished
- Exports as WebM (VP9/VP8 + Opus) rather than MP4/H.264 to avoid bundling a ~25 MB FFmpeg.wasm binary.
- Video recording runs in real time during playback.
- Captions are static text overlays rather than auto-transcribed karaoke subtitles.
