# safa. end-to-end checks

Playwright (Python) scripts that walk the main journeys and fail loudly on any page error.

```
pip install playwright && playwright install chromium
cd TheUnfinishedProject && python3 -m http.server 8765 &
cd day-08-safa/tests
python3 e2e_journey.py fr-FR   # onboarding → Today → Track, lessons, Quran list and reader, hifz, khatm, ask, duas, settings
python3 e2e_screens.py         # learn, salat, qibla, calendar, qada, flight, my duas, back button
python3 e2e_wave4.py           # reader timer and reciter, tafsir compare, duas image, pause durations, settings sections, landing video
python3 e2e_wave5.py           # guided prayer and memorisation, first week, welcome back, mosque times, saved audio, Arabic landing
```

Each script prints `{"errors": []}` when nothing broke. Screenshots go to `tests/shots/` (ignored by git).
