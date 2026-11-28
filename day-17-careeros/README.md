# Day 17 · CareerOS

A local-first job search & freelance pipeline operating system built as a single standalone HTML file—zero accounts, zero tracking, instant browser persistence.

## What it does
- **Interactive 5-Stage Kanban Board**: Organize opportunities across *Wishlist*, *Applied*, *Interview*, *Offer*, and *Closed* with quick `←` / `→` stage buttons (mobile-friendly) and drag-and-drop support on desktop.
- **Quick Stats Bar**: Live metrics for Active Pipeline, Response Rate (%), Interviews/Offers, and Next Follow-Up due date.
- **Follow-Up Due Badges & Salary/Rate Ranges**: Highlights overdue and upcoming follow-ups so good leads don't go cold.
- **Per-Role Interview Prep Checklist**: Click any card to edit details and track customizable prep items with a live progress bar.
- **Outreach & Follow-Up Template Generator**: Generate *Cold DM*, *Post-Interview Thank You*, and *Gentle Nudge* drafts in EN or FR with 1-click copy, plus optional BYOK AI tailored pitch generation (OpenAI, Gemini, Anthropic).
- **Local-First Export & Import**: Auto-saves to `localStorage` with JSON export/import and CSV export.

## Still unfinished
- No calendar/email sync or push notifications for follow-up dates; reminders are visible when you open the board.
- Data lives strictly in browser `localStorage`—use **⬇ JSON** periodically to back up your pipeline.
- No automatic job-board URL scraper yet; opportunities are entered manually.
