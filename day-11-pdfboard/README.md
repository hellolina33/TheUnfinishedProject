# Day 11 · PDFBoard

A visual, node-based PDF workflow studio (mini n8n / ComfyUI style) that runs 100% locally in your browser using `pdf-lib`.

## Features
- **Zero-upload privacy**: Drop one or multiple local PDFs, or click **Generate Demo PDF** to synthesize a multi-page sample PDF right in the browser.
- **Interactive node pipeline**: Add, toggle (`ON`/`OFF`), reorder (`↑`/`↓`), and configure transformation nodes:
  - **Merge PDFs**
  - **Split / Extract Page Range** (e.g. `1-2`, `1,3`, `2-end`)
  - **Rotate Pages** (90° / 180° / 270°, All / Odd / Even)
  - **Add Diagonal Watermark** (custom text, opacity, color)
  - **Add Page Numbers** (position & format)
- **One-click presets**: *Merge & Number*, *Confidential Watermark*, and *Extract & Rotate*.
- **Live execution & download**: Step-by-step node status badges, console log, and instant PDF download.
- **Bilingual EN / FR** toggle and standalone **Download HTML** button.

## Still unfinished
- Linear pipeline only — branching/parallel wires (exporting multiple PDFs simultaneously) are not supported yet.
- No visual page thumbnail preview inside the canvas; output is inspected by page count and downloaded directly.
- Relies on `pdf-lib` loaded from jsDelivr CDN; password-protected/encrypted PDFs are not supported.
