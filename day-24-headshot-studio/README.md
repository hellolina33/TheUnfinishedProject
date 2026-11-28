# Day 24 · Headshot Studio

A Soft UI browser photo studio that turns any selfie into a crisp, LinkedIn-ready 1024×1024 headshot — 100% client-side with zero uploads.

## Features
- **Instant Demo Portrait**: Loads a studio-lit sample portrait on startup so every control and export can be tested immediately.
- **Interactive Framing**: Drag directly on the canvas to pan, zoom with scroll wheel or slider, toggle Circle (LinkedIn) vs Square crop, and enable Rule-of-Thirds guides.
- **6 Curated Studio Presets**: Executive Warm, Clean Studio, Editorial B&W, Bangkok Golden, Crisp Daylight, and Soft Contrast.
- **Fine Tone Controls**: Exposure, Contrast, Warmth color grading, and Clarity / Vignette sliders.
- **LinkedIn Brand Ring**: Optional subtle ring border with 5 brand colors and adjustable thickness.
- **High-Res 1024×1024 PNG Export**: Renders a crisp full-resolution PNG directly via HTML5 Canvas.
- **Pro AI Prompt & Optional BYOK Gemini**: One-click copyable studio photography prompt plus an optional Bring-Your-Own-Key Gemini panel (key stored only in `localStorage`).
- **Bilingual (EN / FR)** & standalone HTML download.

## Still Unfinished
- Automatic background removal requires bundling a ~40 MB ONNX segmentation model; this prototype focuses on fast studio grading, framing, rings, and a ready-to-use generative backdrop prompt.
- No automatic face-center detection yet — drag the portrait manually to align eyes on the upper-third line.
- BYOK Gemini refines art-direction prompts and LinkedIn headlines via text generation rather than direct pixel editing.
