# Day 14 · VibeRead

Turn any PDF, Markdown file, or pasted article into a chapterized audiobook right in your browser — with zero backend.

- **Instant playback**: preloaded with a 3-chapter sample essay (*The 3-Hour Deep Work Shift* in EN and FR) so you can press Play immediately.
- **Multiple inputs**: drag-and-drop `.pdf` (via `pdf.js` CDN with offline fallback), `.md`, `.txt`, or paste any article directly.
- **Audiobook controls**: automatic chapter detection with live listening-time estimates, sentence-by-sentence SpeechSynthesis with active highlight & click-to-jump, voice selector, speed (`0.75x–2.0x`), pitch, sleep timer (5/15/30 min), and automatic `localStorage` bookmarking.
- **Local & BYOK AI summaries**: instant offline extractive summary plus an optional Bring-Your-Own-Key Gemini panel for chapter summaries and spoken podcast-style intros.
- English by default, French available, plus standalone HTML download.

## Still unfinished

- Audio quality relies on your device's built-in SpeechSynthesis voices (no neural TTS MP3 export yet).
- Scanned image-only PDFs cannot be parsed without an OCR step.
- Some mobile browsers pause Web SpeechSynthesis when the screen locks.

Part of [The Unfinished 30](https://the-unfinished-30.vercel.app/) by [Salah Khenissi](https://www.linkedin.com/in/salahkhenissi/).
