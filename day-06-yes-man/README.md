# Yes Man · Day 6
Paste a request, enter a real boundary, compare four editable responses and rehearse one pushback. Full EN/FR UI.
Run `node scripts/build.mjs` to create the self-contained `dist/index.html`. The downloadable copy uses the same file and works offline with template responses.
Online trial requests go to the fixed-task `api/yes-man.js` Vercel endpoint. Keys remain in existing Vercel environment variables. Signed cookies survive instance restarts, but IP and daily counters are best effort per warm instance. Set a provider spending cap for billing protection.
The optional Gemini key is kept in tab memory, sent directly to Google and cleared when the mode changes. No request history is saved.
Verified with browser interactions at laptop and mobile viewport sizes. Physical devices remain untested.
