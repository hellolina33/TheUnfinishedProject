# The Unfinished 30

30 days. One working prototype a day. Free to use. A challenge by [Salah Khenissi](https://www.linkedin.com/in/salahkhenissi/).

[![The Unfinished 30 cover artwork](images/hero.webp)](https://the-unfinished-30.vercel.app/)

**[Explore the live catalogue](https://the-unfinished-30.vercel.app/)**

## Prototype index

| Day | Prototype | What it does | Links |
| --- | --- | --- | --- |
| 01 | WhichOneAreYou | Discover the roles people play in a WhatsApp group. | [Open](https://the-unfinished-30.vercel.app/day-01-whichoneareyou/) · [Source](day-01-whichoneareyou/) |
| 02 | How Many Weeks | See your life in weeks and plan what to do with them. | [Open](https://the-unfinished-30.vercel.app/day-02-howmanyweeks/) · [Source](day-02-howmanyweeks/) |
| 03 | Office Filter | Rewrite a work message in a diplomatic, direct or firm tone. | [Open](https://the-unfinished-30.vercel.app/day-03-officefilter/) · [Source](day-03-officefilter/) |
| 04 | Productivity Library | Explore 50 frameworks, fill out worksheets and export slide decks. | [Open](https://the-unfinished-30.vercel.app/day-04-productivity-library/) · [Source](day-04-productivity-library/) |
| 05 | Rain Room | Mix ambient recordings and live music for a focus session. | [Open](https://the-unfinished-30.vercel.app/day-05-rainroom/) · [Source](day-05-rainroom/) |

This index follows the source tree. The live catalogue displays entries according to the release calendar.

## Repository layout

| Location | Purpose |
| --- | --- |
| [`index.html`](index.html) | Homepage structure and introduction. |
| [`showcase/`](showcase/) | Catalogue data, release calendar logic and homepage styles. |
| [`images/`](images/) | Homepage artwork, prototype covers and portrait. |
| `day-XX-name/` | Each prototype’s own page, assets and documentation. |
| [`api/`](api/) | Vercel server endpoint used by Office Filter. |
| [`scripts/`](scripts/) | Maintenance scripts and Productivity Library checks. |

## Run locally

From the repository root, start a static server with Python 3 and open [localhost:8000](http://localhost:8000/).

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

The catalogue and static prototype pages run without a build step. Office Filter’s hosted AI endpoint requires the Vercel runtime and its configured credentials. Rain Room loads audio from its own `snd/` folder.

Run the Productivity Library smoke checks with Node.js.

```sh
node scripts/check-day04.mjs
```

## Add a prototype

1. Create `day-XX-name/` with an `index.html`, its assets and a short README.
2. Add a 16:9 cover named `day-XX-card.svg` or `day-XX-card.webp` in [`images/`](images/).
3. Add the day number, route, summary, tags, cover, alt text and limitations to [`showcase/prototypes.js`](showcase/prototypes.js). Add an individual LinkedIn post URL once available. Include a download only when the linked file is the intended standalone HTML.
4. Update the prototype index above and check the homepage at desktop and mobile widths. The catalogue releases one day at 08:00 in Bangkok, starting 2 November 2026.
