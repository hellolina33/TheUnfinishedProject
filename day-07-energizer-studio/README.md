# Day 7 · Energizer Studio

Build a 2-minute energizer or icebreaker for your team, then run it in any room from one HTML file.

Born from a post-lunch stretching animation made for 12 leaders at a company summit. It landed so well that it became a tool any facilitator can reuse.

- Eight scene types: opener, meet the crew, rules, 3-2-1 countdown, move (with an optional "FREEZE!" banner), question with a talk timer, break timer, outro.
- Add, reorder, duplicate and delete scenes, and set each one's duration. A timeline shows the whole show.
- Drop your own MP4s: trim the start and end, zoom and shift to frame the person. Videos loop inside each scene and appear as playing cards.
- Optional music (your own file), sound effects, five brand colours, live tokens such as `{i}`, `{total}` and `{mins}`.
- Templates: movement energizer, icebreaker questions, blank.
- **Export show** writes a new self-contained HTML file with every video and the music inside. The exported file can be presented or edited again.
- Edits autosave in the browser (IndexedDB). Nothing is uploaded.
- Presenter keys: Space, F, arrows, N, M, R, E.

`index.html` is the landing page (why, what, how, Q&A). The tool lives in `app/index.html`. Its demo is a short table icebreaker with no videos. Fonts: Bricolage Grotesque (SIL Open Font License), embedded.

## Still unfinished

Tested in Chrome only. Videos are embedded as they are (no compression), so large clips make large files. No poll or "would you rather" scenes. The editor is built for a laptop.

Part of [The Unfinished 30](https://the-unfinished-30.vercel.app/) by [Salah Khenissi](https://www.linkedin.com/in/salahkhenissi/).
