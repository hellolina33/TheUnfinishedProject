# Design: Productivity Library (Day 4)

Scope: this folder only. The root DESIGN.md belongs to Day 2 and keeps its own world.

## Direction

Graphic studio catalogue, not an app dashboard and not an AI tool. Brand-agnostic: the page is a reference book, and the grid, type and rules do the work. Nothing decorative that is not carrying information.

## Palette (named, four values plus one accent)

- Paper #F3F3EF: page background
- Ink #0D0D0D: text, rules, diagrams
- Grey #5C5C58: secondary text (6.3:1 on paper)
- Rule #CFCFC9: hairlines between rows
- Signal #FF4D1A: the only accent. Primary action, selected state, slide accent bar. Ink text on signal is 6.8:1.

## Type

System grotesk stack (Helvetica Neue, Helvetica, Arial). No webfont, no CDN for the page. Display weight 800, tracking -0.035em. Body 17px / 1.55.

## Shape and motion

Square corners, 1px rules, no shadows, no gradients, no animations. Nothing moves.

## Diagrams

Black on white, one stroke weight, no colour, drawn so a reader can copy them. Same renderer for the page and for the slide images.

## Rules

- No emoji, no icons inside rounded squares, no numbered sequence on families (they are a set, not a sequence).
- No copy such as "unlock", "supercharge", "game-changer". Plain statements with sources.
- Every card states its origin. Where no author is verified, it says so.
- Priority when in doubt: the brief's words, then this file, then frontend-design, then Hallmark defaults.
