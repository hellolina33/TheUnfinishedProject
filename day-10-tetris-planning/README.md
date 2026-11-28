# Day 10 · TetrisPlanning

A visual team timezone overlap & meeting slot finder that stacks each teammate's working hours, comfort/stretch hours, and sleep hours like Tetris blocks.

## Features
- **Preloaded 4-person global team** (Bangkok ICT, Paris CET, London GMT, New York EST) for instant exploration.
- **Interactive 24-hour Tetris grid**: Click any hour column to inspect exact local times, day offsets (`+1d`/`-1d`), and work/stretch/sleep status for every teammate.
- **Automatic Golden Overlap Ranking**: Scores all 24 hours and highlights the top 3 meeting windows with zero people asleep.
- **Custom team & work windows**: Add or remove teammates across 20+ IANA timezones (DST-aware via `Intl.DateTimeFormat`) and adjust each person's start/end hours.
- **Instant export**: Copy a formatted multi-timezone meeting summary or download a real `.ics` calendar file.
- **Bilingual EN / FR** toggle, `localStorage` persistence, and standalone **Download HTML** export.

## Still unfinished
- Half-hour timezone offsets (such as India UTC+5:30) snap to the nearest hour column on the 24h grid, though exact local times appear in the slot inspector.
- No live Google Calendar or Outlook free/busy integration — scheduling is based solely on configured working windows.
- No shareable URL-encoded team links yet; configuration is stored locally in the browser.
