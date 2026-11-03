---
name: How Many Weeks
description: Your life as a page of a French squared exercise book, one box per week. Day 2 of The Unfinished 30.
colors:
  fountain-blue: "#2350b8"
  fountain-blue-dark: "#1b3f94"
  fountain-blue-soft: "#e8edfa"
  fountain-blue-off: "#8a9ccc"
  teacher-red: "#d0273c"
  margin-red: "#e5536b"
  paper: "#fcfcfe"
  sheet: "#ffffff"
  ink: "#1c2240"
  pencil: "#4a5070"
  seyes-violet: "#cfc4e6"
  seyes-faint: "#ece7f6"
  rule: "#d9d2ec"
  field-stroke: "#7a74a0"
  weeks-left: "#e4def2"
  weeks-blank: "#c9cddc"
  hl-family: "#ff8cc6"
  hl-friends: "#ffe45c"
  hl-work: "#6ccff6"
  hl-project: "#b98cff"
  hl-health: "#7fe07a"
  hl-rest: "#ffae4d"
  hl-drift: "#c3c7d4"
typography:
  display:
    fontFamily: "Playwrite FR Trad, Segoe Script, cursive"
    fontSize: "clamp(2.1rem, 3.4vw + 1rem, 3.6rem)"
    fontWeight: 400
    lineHeight: 1.7
  headline:
    fontFamily: "Playwrite FR Trad, Segoe Script, cursive"
    fontSize: "clamp(1.75rem, 2.2vw + 1rem, 3.1rem)"
    fontWeight: 400
    lineHeight: 1.6
  result:
    fontFamily: "Playwrite FR Trad, Segoe Script, cursive"
    fontSize: "clamp(44px, 10vw, 72px)"
    fontWeight: 400
    lineHeight: 1.45
    fontFeature: "tnum"
  title:
    fontFamily: "Playwrite FR Trad, Segoe Script, cursive"
    fontSize: "clamp(25px, 5.2vw, 38px)"
    fontWeight: 400
    lineHeight: 1.6
  body-lg:
    fontFamily: "Andika, Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Andika, Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Andika, Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "Andika, Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  swatch: "2px"
  sm: "4px"
spacing:
  2xs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
  3xl: "96px"
  seyes-square: "32px"
  seyes-square-phone: "28px"
components:
  button-primary:
    backgroundColor: "{colors.fountain-blue}"
    textColor: "{colors.sheet}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.fountain-blue-dark}"
  button-primary-disabled:
    backgroundColor: "{colors.fountain-blue-off}"
  button-ghost:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.fountain-blue}"
    rounded: "{rounded.sm}"
    padding: "0 18px"
    height: "46px"
  button-ghost-hover:
    backgroundColor: "{colors.fountain-blue-soft}"
  input:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "48px"
  chip:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "42px"
  chip-selected:
    backgroundColor: "{colors.fountain-blue}"
    textColor: "{colors.sheet}"
  mini-on:
    backgroundColor: "{colors.teacher-red}"
    textColor: "{colors.sheet}"
    rounded: "{rounded.sm}"
    height: "36px"
  panel:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.sm}"
    padding: "16px"
---

# Design System: How Many Weeks

<!-- Scope: Day 2 of The Unfinished 30 only, the landing at day-02-howmanyweeks/index.html and the tool at day-02-howmanyweeks/app/index.html. Every other day of the challenge has its own look and is out of scope. The shared challenge strip (navy with yellow links) is a cross-day banner, not part of this world. -->

## Overview

**Creative North Star: "The Cahier Seyès"**

Your life is a page of a French squared exercise book, and you fill it in one box per week. The page is cool white paper ruled in violet Seyès squares, with three faint lines inside each square and a red margin line down the left. Headings are written in fountain-pen blue cursive and underlined in teacher red. Lived weeks fill in with the same blue ink. This week, and every number that answers a question, is marked in red, the way a teacher marks the answer.

The page is calm and school-like, not solemn. It refuses the black memento-mori grid poster and the cream-and-serif nostalgia page. Colour beyond blue and red comes only from highlighters, and only when a week is given to something: family, friends, work, a project, health, rest, drift. Density is low on the landing (one exercise per section, single column against the margin) and higher in the tool, where a sticky life grid sits beside the scrolling scenes.

Cursive is reserved. It carries titles, section heads, the worked problem and results. Everything you read at length or operate is in Andika, a schoolbook sans built for legibility.

**Key Characteristics:**
- Seyès ruling and a red margin line are the page itself, drawn in CSS behind every surface.
- Fountain-pen blue for headings and lived weeks; teacher red for this week, results and title underlines.
- Highlighter hues only for check-in categories, always named in text.
- Playwrite FR Trad for titles and results only; Andika for UI and body.
- 4px corners, 1px rules, no shadows.

## Colors

Two inks on squared paper, plus a pencil case of highlighters.

### Primary
- **Fountain-Pen Blue** (`fountain-blue`): headings, the h1, lived weeks on every grid, primary buttons, selected chips, focus rings, the caret and the active language underline. It is the ink you write with.
- **Blotted Blue** (`fountain-blue-dark`): primary button hover.
- **Washed Blue** (`fountain-blue-soft`): hover wash for ghost buttons and the tool's section links.
- **Faded Blue** (`fountain-blue-off`): disabled primary button.

### Secondary
- **Teacher Red** (`teacher-red`): the 2px underline under titles and section heads, the circle around this week, the result line and the big number, worked answers (double underline), ages on the milestone timeline, the progress bar, the "example" pill and the active state of small toggles. It marks; it never fills large areas.
- **Margin Red** (`margin-red`): the 2px vertical margin line only. Softer than Teacher Red so the margin reads as ruling, not as a mark.

### Tertiary: highlighters
- **Family** (`hl-family`), **Friends** (`hl-friends`), **Work** (`hl-work`), **Project** (`hl-project`), **Health** (`hl-health`), **Rest** (`hl-rest`), **Drift** (`hl-drift`): the Sunday check-in categories, in this order. The tool's circles scenes (friends, family, couple, work) reuse four of the same hues. Friends yellow doubles as the text-selection colour.

### Neutral
- **Cool Paper** (`paper`): the page background under the ruling.
- **Clean Sheet** (`sheet`): raised surfaces that cover the ruling: the grid frame, panels, inputs, the tool's top bar and sticky grid column.
- **Exercise Ink** (`ink`): body text, the wordmark, tooltips (as background).
- **Pencil Grey** (`pencil`): labels, help text, captions, legends, secondary list text.
- **Seyès Violet** (`seyes-violet`): the main squares of the ruling, empty week boxes, chip and small-button strokes, the scrollbar.
- **Seyès Faint** (`seyes-faint`): the three thin lines inside each square.
- **Ruled Line** (`rule`): 1px dividers between list rows, section tops, frames around panels and the grid.
- **Field Stroke** (`field-stroke`): the 1px border of text inputs and selects, dark enough to read as a field against the ruling.
- **Weeks Left** (`weeks-left`) and **Weeks Unset** (`weeks-blank`): future weeks and not-yet-computed weeks on the tool's grid and family timeline.

### Named Rules
**The Two Inks Rule.** Blue writes, red marks. Blue is for what you wrote or lived; red is for what the teacher circled: this week, the answer, the underline. Never swap them.

**The Highlighter Rule.** Highlighter hues appear only to say what a week was given to, and every swatch carries its category name in text beside it.

## Typography

**Display Font:** Playwrite FR Trad (with Segoe Script, cursive)
**Body Font:** Andika (with Atkinson Hyperlegible, system-ui, sans-serif)

**Character:** French school cursive in fountain-pen blue against a plain, very legible schoolbook sans. The cursive is the handwriting on the page; Andika is the printed exercise. Both are embedded as WOFF2 subsets so the downloaded HTML keeps them offline.

### Hierarchy
- **Display** (400, clamp(2.1rem, 3.4vw + 1rem, 3.6rem), 1.7): the landing h1, blue, max 14ch, Teacher Red underline. The tool's h1 runs clamp(28px, 5.4vw, 42px) at 1.75.
- **Headline** (400, clamp(1.75rem, 2.2vw + 1rem, 3.1rem), 1.6): section heads, blue, Teacher Red underline. The tool's reference sections run clamp(26px, 4vw, 36px).
- **Result** (400, clamp(44px, 10vw, 72px), 1.45, tabular figures): the big weeks-left number in the tool, Teacher Red. On the landing the result line is 1.5rem cursive red under the grid.
- **Title** (400, clamp(25px, 5.2vw, 38px), 1.6): scene sentences in the tool's scroll story, blue, with numbers in red.
- **Body large** (400, 1.25rem, 1.6): ledes, section text, the problem statement. Max 34–60ch.
- **Body** (400, 1.0625rem, 1.5; tool 16–18px): running text, buttons (700), form values.
- **Label** (400, 0.875rem): field labels, help lines, captions, footer.
- **Caption** (400, 0.8125rem): the challenge strip, week-box labels, legends (12–13px in the tool).

### Named Rules
**The Cursive Is Handwriting Rule.** Playwrite FR Trad is used for titles, section heads, the worked problem, quotes, results and the date written at the top of the page, never for labels, buttons, inputs or paragraphs. Apart from that dated line (0.875rem, Fountain-Pen Blue, like the date on a school page), cursive stays at 19px or larger. Cursive needs line-height 1.45 or more so the ascenders and the red underline clear the next line.

**The Red Underline Rule.** Every h1 and h2 is underlined in Teacher Red: 2px, offset 0.22em, skip-ink off, like a ruler line under a heading. The worked answer gets a red double underline instead.

## Layout

The page is a sheet of squared paper. The ruling is three background gradients on `body`: violet verticals and horizontals every 32px (28px under 40rem) and faint horizontals every 8px. The red margin is a fixed 2px line at `--margin-x` (72px, 40px under 60rem, 18px under 40rem on the landing; `max(10px, 50% - 640px)` in the tool). Content starts a gutter to the right of the margin.

The landing is one column of exercises against the margin, max 1200px, with sections spaced at 96px. The hero splits 1.1fr / 0.9fr above 900px: title, lede and form on the left, the live grid (aspect 58/82, up to 78svh) on the right with the red result under it. On a phone the grid follows the form.

The tool is a scroll story. Above 900px a sticky grid column (1.05fr) sits left of the scenes (0.95fr), 56px apart; below, the grid sticks to the top at 48svh and scenes scroll under it. Reference sections follow, label column 1fr and content 2fr above 900px, content max 64ch.

Spacing steps are 4, 8, 12, 16, 24, 40, 64, 96px. Touch targets are 44–48px tall for primary controls, 36px for small toggles.

## Elevation & Depth

Flat. Nothing on the page casts a shadow. Depth is paper on paper: Clean Sheet surfaces (panels, the grid frame, the tool's bar and grid column) cover the ruling, framed by a 1px Ruled Line. The only `box-shadow` uses are inset 2px underlines on the active language button and a 2-ring outline on the "this week" legend swatch; both are drawn lines, not elevation.

### Named Rules
**The Paper Has No Height Rule.** Separate things with a 1px rule or a white sheet over the ruling, never with a drop shadow, blur or gradient fill.

## Shapes

Corners are 4px everywhere a control or surface has a corner: buttons, inputs, selects, chips, panels, the grid frame, tooltips, the card image. Swatches and week boxes are 2px. Week boxes on the canvas are square cells with a 1–1.4px gap. Lines are 1px rules and 2px marks (margin, underlines, the this-week circle). This week is circled by hand: a slightly tilted red ellipse (rotation -0.3rad, 2px stroke) around the box, not a filled square. Lived boxes vary in ink opacity between 0.82 and 1 so the fill reads as pen, not print.

## Components

### Buttons
Plain, inked and square-cornered, like a stamp from the teacher's desk.
- **Shape:** gently squared (4px).
- **Primary:** Fountain-Pen Blue fill, white Andika 700, 48px tall on the landing (46px in the tool), 24px side padding.
- **Hover / Active / Focus:** Blotted Blue on hover; pressed moves down 1px; focus is a 2px blue outline offset 3px. Transitions 220ms on cubic-bezier(0.16, 1, 0.3, 1).
- **Disabled:** Faded Blue fill (landing) with a not-allowed cursor.
- **Ghost:** white sheet, blue text, 1px blue border; Washed Blue on hover.
- **Small toggle (mini):** 36px, Seyès Violet stroke; when on, Teacher Red fill with white bold text.

### Chips
- **Style:** white sheet, 1px Seyès Violet stroke, ink text, 42px tall, 4px corners. Hover turns the stroke blue.
- **Selected:** Fountain-Pen Blue fill and border, white text.
- **Category chips** carry a 10px highlighter square before the label.

### Cards / Containers
- **Corner Style:** 4px.
- **Background:** Clean Sheet over the ruling.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1px Ruled Line.
- **Internal Padding:** 16px; notes 10px 12px.

### Inputs / Fields
- **Style:** white sheet, 1px Field Stroke border, 4px corners, 48px tall, 12px side padding, 16px text so phones do not zoom. Birth date is three fields: day select, month select, four-digit year.
- **Hover / Focus:** border turns Fountain-Pen Blue; focus adds the 2px blue outline. Range sliders and checkboxes use blue as accent colour.
- **Error:** bold Teacher Red text under the field, written as an instruction.

### Navigation
- **Landing:** no nav. A bold Andika wordmark, the date in blue cursive at the right (hidden on phones), and an EN/FR toggle.
- **Tool:** a sticky white bar with a 1px rule under it, the wordmark with a 3x3 blue/red week mark, section links in Pencil Grey that wash blue on hover, the EN/FR toggle, and a 3px Teacher Red reading-progress line along its bottom edge.
- **Language toggle:** 1px rule frame, 4px corners; the active language is blue, bold, with a 2px blue inset underline.

### Life Grid (signature)
The product's image. 52 boxes per row, one row per year, drawn on canvas inside a white sheet with a 1px rule frame. Empty weeks are Seyès Violet outlines, lived weeks are filled in Fountain-Pen Blue with slight ink variance, and this week is circled in Teacher Red. Decade numbers sit in the left gutter in Pencil Grey Andika 11px. In the tool, scene roles recolour the same grid with Weeks Left, highlighters and red goal outlines, with a legend whose swatches are always named.

### Worked Problem (signature)
A school maths problem: the question in Andika body-large, then the working line in blue cursive with the answer in Teacher Red, double-underlined.

### Week Swatch Row
Example check-in weeks as square boxes with a Seyès Violet 1px border and a highlighter fill, the category name under each; "now" is an empty box with a 2px red border. 8 across, 4 across on phones.

### Shareable Card (canvas)
The exported card redraws the page: Cool Paper, Seyès ruling at 32/8px, a 3px margin line, the title in blue cursive underlined in red, the big number in red cursive, the grid with lived weeks in blue and this week in red, labels in Andika.

## Do's and Don'ts

### Do:
- **Do** draw the Seyès ruling and the red margin line behind every surface of this product, including canvas exports.
- **Do** write headings in Playwrite FR Trad, Fountain-Pen Blue, with the 2px Teacher Red underline at 0.22em offset.
- **Do** fill lived weeks in Fountain-Pen Blue and circle this week in Teacher Red.
- **Do** show every answer number in Teacher Red with tabular figures.
- **Do** name every highlighter colour in text next to its swatch.
- **Do** keep corners at 4px (2px for swatches and week boxes) and separate surfaces with 1px Ruled Line borders.
- **Do** keep form fields at 16px text and 46–48px height.

### Don't:
- **Don't** set labels, buttons, inputs or paragraphs in cursive, or cursive below 19px other than the dated line.
- **Don't** use drop shadows, blurs or gradient fills for depth; the page is flat paper.
- **Don't** fill large areas with Teacher Red; it marks, it does not paint.
- **Don't** use highlighter hues for anything but what a week was given to.
- **Don't** use a black grid, a dark page or cream paper with a serif; this world is cool white squared paper.
- **Don't** take the challenge strip's navy and yellow into this world; that banner belongs to The Unfinished 30 across all days.
