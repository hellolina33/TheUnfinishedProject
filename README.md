# The Unfinished 30

30 days. One working prototype a day. Free. By [Salah Khenissi](https://www.linkedin.com/in/salahkhenissi/).

Live: https://the-unfinished-30.vercel.app

## Structure
- `index.html` — the landing page (the 30 cards).
- `images/` — landing page artwork (hero, Day 1 card, About portrait).
- `day-XX-name/` — one folder per day, each a self-contained prototype with its own README.

| Day | Prototype | Folder |
|---|---|---|
| 1 | WhichOneAreYou — who plays which role in your WhatsApp group | [day-01-whichoneareyou](day-01-whichoneareyou/) |
| 7 | Energizer Studio — build 2-minute energizers and icebreakers as one HTML file | [day-07-energizer-studio](day-07-energizer-studio/) |

## Adding a day
1. Create `day-XX-name/index.html` (+ README).
2. In the root `index.html`, add an entry to `const DAYS = [...]` with name, one-line pitch, `app: '/day-XX-name/'` and the LinkedIn post URL.
3. Push to `main`: Vercel redeploys.
