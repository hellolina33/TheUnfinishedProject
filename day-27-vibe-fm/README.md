# Day 27 · VIBE-FM

A 100% procedural Web Audio focus radio station with a real-time FFT/oscilloscope visualizer, ambient texture mixer, and integrated Pomodoro timer — zero external audio files.

## Features

- **4 Generative Radio Channels** synthesized live in the browser:
  1. **92.4 Deep Code** — warm detuned ambient pad + subtle rhythmic sub-pulse.
  2. **98.1 Night Drive** — soft synthwave chords + mellow octave bassline & shimmer arp.
  3. **101.7 Warm Lo-Fi** — gentle Rhodes-style electric piano progression + soft brushed groove.
  4. **106.3 Zen Drift** — organic pentatonic wind chimes + LFO-modulated pink-noise ocean wash.
- **Tactile FM Dial Tuner** — frequency slider (`88–108 MHz`) with analog static burst between stations + 4 preset buttons.
- **Live Canvas Visualizer** — switchable real-time FFT spectrum bars and oscilloscope waveform.
- **Ambient Texture Mixer** — real-time DSP sliders for Vinyl Crackle, Soft Rain, and Sub Bass warmth.
- **Integrated Focus Timer** — 25m Focus / 50m Deep / 5m Break presets with synthesized completion chime and local session counter.
- **EN / FR toggle**, `localStorage` preferences, and standalone HTML download.

## Still unfinished

- All 4 stations are lightweight procedural Web Audio loops rather than full human-produced studio tracks.
- Mobile browsers may pause Web Audio when the screen locks or the tab moves to the background.
- No audio export/recording of your custom mix yet, and the Pomodoro session counter resets if browser `localStorage` is cleared.
