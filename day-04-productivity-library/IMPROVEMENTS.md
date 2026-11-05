# Day 04 — 50 improvement tracker

This tracks changes to the public **The Unfinished 30 / Productivity Studio**. Status reflects source implementation and targeted checks, not a certification of rendering quality. None of the internal EY Fabernovel source designs, client content, branding, illustrations, or templates are copied.

Status: **DONE** = implemented in source and relevant smoke checks; **PARTIAL** = implemented with limitations or pending audit; **PENDING** = not implemented.

## Exports and quality

| # | Status | Improvement | Evidence / remaining work |
|---:|---|---|---|
| 1 | **PARTIAL** | Simulate 150 PPTX combinations and validate generated files | 150 flows tested with stubs; real Office opening not yet done |
| 2 | **PARTIAL** | Validate PDF pagination | 8-page direct PDF generator added, but real render inspection remains |
| 3 | **DONE** | Offer direct PDF download | jsPDF generates PDF without system print dialog |
| 4 | **PARTIAL** | Prevent 9:10 overlaps | Responsive compositions and shrink-to-fit added; complete visual QA pending |
| 5 | **PARTIAL** | Auto-adjust typography across formats | PPTX fits text; human typography QA remains |
| 6 | **DONE** | Make PowerPoint diagrams native and editable | Text, blocks, and Pareto cumulative curve authored as shapes |
| 7 | **DONE** | Make blank worksheet editable | Editable site fields and native PowerPoint shapes |
| 8 | **PARTIAL** | Align three presentation ratios | Unified content and design tokens; visual spot checks remain |
| 9 | **PARTIAL** | Inspect all slides visually | Mock smoke tests completed; real rendering still pending |
| 10 | **PARTIAL** | Full offline HTML functionality | Self-contained HTML UI export; PDF/PPTX still fetch libraries online |

## Discovery and recommendation

| # | Status | Improvement | Evidence / remaining work |
|---:|---|---|---|
| 11 | **DONE** | Product-focused home page | Original editorial hero, value proposition and examples |
| 12 | **DONE** | One-click Try Pareto | Direct deep link to Pareto tool |
| 13 | **DONE** | Three-question quiz | Three primary questions plus optional advanced options |
| 14 | **DONE** | Instant tool search | Search by method, outcome and problem |
| 15 | **DONE** | Five family filters | Prioritise, Organise, Focus, Decide, Review |
| 16 | **DONE** | Audience, time and style filters | Interactive browse filters |
| 17 | **DONE** | Respect solo/team restrictions | Explicit exclusion in recommendations |
| 18 | **DONE** | Show best three matches first | Ranked top-three section |
| 19 | **PARTIAL** | Explain recommendation logic | Time and audience reasons displayed; detailed rationale pending |
| 20 | **DONE** | Persist quiz choices | Local-only persistence |

## Practical tools and content

| # | Status | Improvement | Evidence / remaining work |
|---:|---|---|---|
| 21 | **DONE** | Edit worksheets in browser | Inputs update on-screen diagrams |
| 22 | **DONE** | Save locally | LocalStorage by tool without external account |
| 23 | **DONE** | Export personalized answers | JSON; diagram labels populate editable PowerPoint and PDF |
| 24 | **DONE** | Blank/example toggle | Switch without losing locally saved answers |
| 25 | **PARTIAL** | Unique canvas for each method | Specific labels/data per method, shared renderer archetypes remain |
| 26 | **DONE** | Accurate Pareto visual | Sorted bars and cumulative line in preview/PPT/PDF |
| 27 | **PARTIAL** | Apply original approved visual language | Fresh editorial design, final visual QA pending |
| 28 | **PARTIAL** | Three tailored cases per method | General student/professional/manager scenarios; individual cases pending |
| 29 | **PARTIAL** | Step-by-step facilitation timing | Estimated group-step timing, not researched for every method |
| 30 | **PARTIAL** | Verify all historical attributions | 7 reference links added; full 50-source audit pending |

## Design, mobile and accessibility

| # | Status | Improvement | Evidence / remaining work |
|---:|---|---|---|
| 31 | **DONE** | Preview eight slides on site | Eight indexed slide previews in tool pages |
| 32 | **DONE** | Mobile swipes, navigation, fullscreen | Touch and keyboard arrows; slideshow controls |
| 33 | **DONE** | Live worksheet preview | Re-renders SVG after answer changes |
| 34 | **PARTIAL** | One idea per slide | Eight-role editorial structure; some long text needs shortening |
| 35 | **DONE** | Align with challenge design family | Original Day 4 system and challenge card identity |
| 36 | **DONE** | Mobile sticky exports | Controls remain prominent near mobile viewer bottom |
| 37 | **DONE** | Fix malformed heading tags | Legacy h2/h3 mismatch corrected |
| 38 | **PARTIAL** | Robust keyboard/focus management | Skip link and slide keyboard controls; screen-reader focus test pending |
| 39 | **PARTIAL** | Accessible diagrams and status updates | SVG labels, ARIA live counters/status, full screen-reader QA pending |
| 40 | **PARTIAL** | Full EN/FR translation | Controls bilingual; all method narrative text remains English |

## Growth and maintenance

| # | Status | Improvement | Evidence / remaining work |
|---:|---|---|---|
| 41 | **DONE** | Challenge cross-navigation | Header links to challenge and other project days |
| 42 | **PARTIAL** | Day 4 OG image | Day 4 metadata added, currently reuses challenge global JPG |
| 43 | **DONE** | 50 indexable, shareable method pages | Static URL and distinct title/description/canonical per method |
| 44 | **PENDING** | Link exact Day 4 LinkedIn post | Not available or provided; must not invent social post URL |
| 45 | **DONE** | Native share/copy link | Web Share and clipboard |
| 46 | **PARTIAL** | Anonymous usage analytics | Vercel Analytics snippet/events added, live console metrics unverified |
| 47 | **DONE** | Lightweight feedback | Local yes/not-yet feedback, no externally collected response |
| 48 | **PARTIAL** | Reduce initial payload | CSS/JS split and on-demand export libraries; legacy code still in HTML |
| 49 | **DONE** | GitHub automated tests | Node smoke workflow tests 50 methods, URLs, 300 mocked exports; CI passed |
| 50 | **DONE** | One canonical 50-method data source | Old duplicate dataset removed from app script |

## Summary

29 done, 20 partial, 1 pending (50 total).

## Verification

- Source: `day-04-productivity-library/index.html`, `studio.css`, `studio.js`.
- Static SEO pages: `day-04-productivity-library/tools/<id>/index.html` for 50 methods.
- Test command: `node scripts/check-day04.mjs` (simulated export flow checks; not a rendered PPTX/PDF test).
- GitHub workflow: `.github/workflows/day04-checks.yml`.
- Source references: four Drive decks were inspected for abstract editorial and pedagogical structures; source materials were not published.

