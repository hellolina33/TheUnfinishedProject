# Day 19 · Audio Speed Editor

A tactile, 100% in-browser audio speed, trim, and WAV export deck built with Web Audio API — zero uploads, zero backend.

## Features
- **Instant Demo Audio Synthesizer**: Auto-generates a crisp stereo musical phrase via `OfflineAudioContext` on load (plus 3 cycling synth grooves) so visitors can test trimming and speed right away.
- **Drag & Drop Audio Decoding**: Load any local MP3, WAV, M4A, OGG, FLAC, or WEBM file directly in the browser.
- **Interactive Canvas Waveform**: High-DPI waveform display with draggable amber Start & End trim handles (mouse & touch), numeric precision inputs, and click-to-seek playhead.
- **Speed & Pitch Controls**: Smooth `0.50x` to `2.50x` speed slider with quick presets, live duration before/after comparison, loop toggle, and a **Preserve Pitch** toggle.
- **Offline WAV Export**: Renders trimmed & speed-adjusted audio offline using `OfflineAudioContext` (with Hann-windowed overlap-add time-stretching when Preserve Pitch is enabled) and downloads a clean 16-bit PCM `.wav` file.
- **Bilingual & Portable**: Full EN/FR toggle and one-click standalone HTML download.

## Still unfinished
- Pitch-preserved WAV export uses a lightweight Hann-windowed overlap-add (OLA) algorithm in pure JavaScript; extreme speed factors (`0.5x` / `2.5x`) on sharp transients can sound slightly metallic compared to a full phase vocoder or RubberBand WASM.
- Exports uncompressed 16-bit WAV only (no MP3/AAC compression bundled).
- Waveform zoom, fade-in/fade-out envelopes, and multi-clip splicing are not implemented yet.
