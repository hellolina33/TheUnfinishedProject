# Day 29 · Infinite Webtoon

A 4-panel comic & webtoon strip builder right in the browser — preloaded with **"The 15-Minute Quick Sync"** so you can remix or export in seconds.

## Features
- **3 Comic Layouts**: Switch seamlessly between **2×2 Grid**, **4-Panel Vertical Webtoon**, and **4-Panel Horizontal Strip**.
- **Expressive Cast**: Place illustrated **Builder**, **Manager**, **Office Cat**, **Coffee Cup**, and **Laptop** characters with 4 expressions (`Happy`, `Stressed`, `Deadpan`, `Hyped`).
- **Rich Panel Styling**: 6 comic scene patterns (`Sky Grid`, `Warm Halftone`, `Mint Dots`, `Speedlines`, `Night Stars`, `Paper Cream`), speech/thought/caption bubbles, tilted SFX stickers, or custom uploaded panel images.
- **Script Generator (Offline + BYOK AI)**: Instant offline script remixer plus optional BYOK AI generation (OpenAI / Gemini / Anthropic stored only in browser `localStorage`).
- **High-Res PNG Export**: Renders the full comic strip cleanly via HTML5 Canvas and downloads as a crisp `.png`.

## Still unfinished
- Characters sit in two clean fixed slots rather than freeform drag-and-drop canvas layers.
- Uploaded custom images are saved as Data URLs, so very large files may exceed browser `localStorage` limits on refresh.
- Direct browser BYOK calls depend on the selected AI provider's CORS support.
