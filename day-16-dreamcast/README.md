# Day 16 · DreamCast

A cozy, twilight-themed bedtime story & kids podcast creator designed to work 100% locally in the browser with zero backend required.

## What it does
- **Instant Bedtime Story Builder**: Enter a child's name (or tap demo presets like *Lina* or *Milo*), pick an age group (`3–5`, `6–8`, `9–11`), companion, magical setting, and gentle theme.
- **Offline Multi-Chapter Story Engine (EN & FR)**: Generates a heartwarming 4-chapter bedtime story tailored to the child's age and chosen elements.
- **Soothing Podcast Player**: Built-in Web SpeechSynthesis narration with adjustable slow voice pace and live chapter highlighting.
- **Web Audio Lullaby Chimes**: Browser-synthesized pentatonic music-box chimes and soft twilight drone pad—zero external audio files.
- **Sleep Fade-Out Timer**: 5, 10, or 15-minute sleep countdown that smoothly fades out ambient chimes and stops narration.
- **Optional BYOK AI**: Plug in an OpenAI, Gemini, or Anthropic key (saved only in `localStorage`) to generate bespoke original stories.
- **Saved Favorites**: Bookmark favorite episodes locally and export as `.txt`.

## Still unfinished
- Browser `SpeechSynthesis` voices vary widely across operating systems; studio-grade neural voices would require a paid TTS backend.
- The offline story engine uses modular narrative scenes, so after many nights you will notice familiar patterns unless using BYOK AI.
- No native MP3 export or mobile lock-screen background audio session yet.
