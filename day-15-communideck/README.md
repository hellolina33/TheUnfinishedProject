# Day 15 · CommuniDeck

A visual travel phrasebook and tap-to-show fullscreen flashcard deck for overcoming language barriers anywhere — zero backend, works offline.

- **6 destination languages**: Thai (ไทย + phonetic), Japanese (日本語 + romaji), Spanish, French, English, and Arabic (العربية + RTL + phonetic).
- **6 curated categories**: Restaurant & Allergies, Taxi & Directions, Hotel, Pharmacy & Health, Shopping, and Emergency (21 essential travel phrases).
- **Instant action**: **Speak aloud** via Web SpeechSynthesis (with slow `0.75x` pronunciation toggle) + **Fullscreen Show Card** mode with huge high-contrast text to hold up to a driver, waiter, or pharmacist.
- **Personalize & print**: star favorites, add custom cards stored in `localStorage`, search across phrases, and print a 2-column pocket cheat-sheet (`window.print()`).
- English by default, French available, plus standalone HTML download.

## Still unfinished

- Voice playback depends on the SpeechSynthesis voices installed on your device (some systems require downloading Thai or Arabic offline voices).
- Custom cards are stored for the active language only and are not auto-translated across all 6 languages.
- No two-way speech-to-text reply capture yet.

Part of [The Unfinished 30](https://the-unfinished-30.vercel.app/) by [Salah Khenissi](https://www.linkedin.com/in/salahkhenissi/).
