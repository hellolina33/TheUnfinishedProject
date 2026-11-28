# Day 9 · ZenFlow

A serene, tactile guided breathing & micro-meditation studio designed for busy workdays — inspired by Salah's AI Studio app **ZenFlow AI**. Pick a 2, 5, 10, or 15-minute reset, breathe with the organic pacer, mix a procedural Web Audio soundscape, and capture a 1-line reflection.

## Features

- **Visual Breathing Pacer**: Smooth expanding/contracting organic orb with concentric ripples, progress ring, and cycle counter synced to 4 curated techniques:
  - **Box Breathing (4–4–4–4)** — steady focus & pre-meeting nerves
  - **4–7–8 Relaxing Breath** — nervous system down-regulation & sleep prep
  - **Physiological Sigh (2.5 + 1.5 – 6)** — rapid stress reset
  - **Coherent Breathing (5.5 – 5.5)** — flow state & heart-rate variability balance
- **100% Offline Procedural Web Audio Soundscape Mixer** (zero external MP3s):
  - **Singing Bowl Chime** (harmonic overtone synthesis on phase transitions + manual test strike)
  - **Warm Drone Pad** (soft detuned fifth chord with slow LFO filter drift)
  - **Gentle Rain / Pink Noise** (real-time Paul Kellet pink noise through warm filtering)
  - **Wind Chimes** (organic pentatonic chimes spaced gently in time)
- **Guided Session & Intention Builder**:
  - 4 workday presets (*Pre-Meeting Calm*, *Post-Lunch Reset*, *End-of-Day Unwind*, *Sleep Prep*) with curated EN/FR guided scripts.
  - Optional gentle **Web SpeechSynthesis** voice cues for phase shifts and guided script lines.
  - **1-Line Post-Session Reflection** saved locally in `localStorage` with session stats, history log, and JSON export/import backup.
- **Optional BYOK AI Script Crafter**:
  - Works completely offline out of the box (including a local smart script builder).
  - Optionally connect your own **Gemini**, **OpenAI**, or **Anthropic** API key (stored only in browser `localStorage`, called directly from the browser) to generate a custom 4-stage meditation script tailored to your current stressor.
- **Challenge Essentials**: Bilingual **EN / FR** toggle, **Download HTML** button (exports a standalone copy of the app), and keyboard shortcuts (`Space` play/pause, `R` reset, `M` mute).

## Still unfinished

- **Voice quality depends on the browser/OS**: Web SpeechSynthesis voices vary wildly between macOS, Windows, iOS, and Linux, so spoken cues can sound robotic on some devices.
- **Synthesized vs. acoustic recordings**: The Web Audio soundscape is lightweight and 100% offline, but lacks the micro-detail of studio-recorded singing bowls or rain.
- **Direct browser BYOK calls**: Anthropic's API may block direct browser requests depending on CORS headers; Gemini and OpenAI work directly in most browsers, or you can use the built-in offline script crafter anytime.
- **Local-only history**: Reflections and session stats live in `localStorage` (with JSON export/import), with no cloud sync or calendar integration yet.

Part of [The Unfinished 30](https://the-unfinished-30.vercel.app/) by [Salah Khenissi](https://www.linkedin.com/in/salahkhenissi/).
