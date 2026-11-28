# Day 23 · Guitar Tuner

A tactile, in-browser guitar tuner combining real-time Web Audio microphone pitch detection with realistic synthesized Karplus-Strong reference strings.

## Features
- **Live Autocorrelation Pitch Detection**: Uses Web Audio `AnalyserNode` (`fftSize = 4096`) with normalized autocorrelation and parabolic interpolation for sub-Hz accuracy.
- **Analog Tuning Needle Gauge**: Smoothly damped semicircular needle (-50¢ to +50¢) with emerald green lock-in glow within ±4 cents, flat/sharp indicators, and live Hz readout.
- **6 Selectable Tunings**: Standard (EADGBE), Drop D, Half-Step Down, Open G, DADGAD, and Ukulele (GCEA).
- **Interactive Headstock (Reference Tone Mode)**: Works without a microphone — click any brass peg to hear a Karplus-Strong physical-modeling plucked string, strum all strings, or loop a reference note.
- **A4 Calibration**: Adjustable concert pitch (`432 Hz` – `446 Hz`).
- **100% Private**: Audio stays in local browser RAM and is never recorded or transmitted.
- **Bilingual (EN / FR)** & standalone HTML download.

## Still Unfinished
- Noisy rooms or strong overtones can occasionally jump an octave; plucking cleanly near the 12th fret yields the steadiest tracking.
- Sweetened/compensated tuning offsets and strobe-ring mode are not yet implemented.
- Microphone access requires HTTPS or `localhost`.
