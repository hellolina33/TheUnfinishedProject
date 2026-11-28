# Day 21 · HabitQuest

A minimalist, guilt-free RPG habit tracker that turns 3–5 daily habits into rewarding quests — without punishing streak resets.

## Features
- **Character Card & Class Progression**: Editable hero name, selectable crest, Level & animated XP bar, and automatic class titles (`Apprentice → Builder → Strategist → Sage`).
- **Rest Day Shield**: Start with 2 shields and earn +1 every 5 active days. Activate a shield on busy or recovery days so your 14-day momentum stays protected without guilt.
- **Daily Quest Board**: Preloaded with 4 thoughtful quests (*20 min deep work*, *15 min walk outside*, *Read 10 pages*, *No phone 30 min before bed*). Check off quests with floating `+XP` micro-celebrations and an optional gentle Web Audio chime, plus add/edit/delete quests with Small (+15), Medium (+25), or Boss (+40) XP weights.
- **28-Day Momentum Heatmap**: Visual 4-week grid highlighting partial, full, and shielded days with hover tooltips showing XP and daily log notes.
- **1-Line Daily Log**: Capture a quick daily win or mood saved locally by date.
- **Guild Coach Reflection (Offline + BYOK)**: Warm local reflection out of the box, plus an optional BYOK modal (Gemini / OpenAI / Anthropic key stored strictly in `localStorage`) for personalized coaching.
- **JSON Backup/Restore & Portable**: Export/import your entire journal as `.json`, full EN/FR toggle, and one-click standalone HTML download.

## Still unfinished
- Data is stored strictly in browser `localStorage` with no cloud sync or push reminders — use Backup JSON when switching devices.
- No multi-week boss campaigns, custom weekday schedules (e.g., Mon/Wed/Fri), or multiplayer party quests yet.
- Offline Guild Coach uses deterministic heuristics; connecting a BYOK key unlocks truly personalized reflections.
