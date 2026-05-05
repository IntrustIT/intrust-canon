---
name: Issue Type spectrum (Short-Term / Stractical / Long-Term)
description: Canonical color + icon spectrum for the 3 issue Types. Stractical is literally the visual blend of Short-Term and Long-Term — slate+purple stripes between gray and solid purple. Read this before touching any surface that distinguishes Short / Stractical / Long.
type: reference
originSessionId: c9b17cee-f5ec-4aac-9894-14aeaf8a54b7
---
# Issue Type spectrum

The three issue Types form a **literal visual spectrum**: Short-Term and Long-Term are the endpoints (gray / purple solid), Stractical is the in-between (slate + purple stripes that physically combine the two endpoints' colors).

Established 2026-05-07 (session 47, K-CS-022) at Ricky's recommendation: Stractical is "tactical with strategic implications," so its visual treatment should be the literal blend of its two neighbors.

## Color values (exact)

| Type | Background | Stripe pattern | Icon | Glyph color (standalone) |
|---|---|---|---|---|
| **Short-Term** | `#f1f5f9` (slate-100) | n/a | ⏱ | n/a (uses default text color) |
| **Stractical** | n/a — uses `backgroundImage` | `repeating-linear-gradient(45deg, #f1f5f9 0 6px, #E9D5FF 6px 12px)` for header badge (6px stripes); `... 0 8px, ... 8px 16px` for body picker (8px stripes) | ⚡ | `text-purple-600` |
| **Long-Term** | `#E9D5FF` (purple-200) | n/a | 🔭 | n/a (uses default text color) |

**Badge text color** is always `#1f2937` (gray-900) — readable against any of the three light backgrounds.

## Why these specific shades

- **slate-100 (`#f1f5f9`)** for Short-Term — neutral, no implied weight, "just another tactical issue."
- **purple-200 (`#E9D5FF`)** for Long-Term — light enough not to scream, dark enough to read at the 10px in-app badge size. Considered purple-100 in v1; rejected as too washed.
- **slate + purple-200 stripes** for Stractical — the literal blend of its neighbors. The diagonal stripe pattern visually communicates "this is between the two."

Tailwind purple scale (`purple-50` through `purple-800`) is **owned by the Issue Type spectrum** — don't co-opt purple for unrelated semantics elsewhere in the app, or the spectrum stops being uniquely meaningful.

## Surface inventory (where the spectrum is applied)

When adding a new surface that distinguishes issue Types, match the spectrum exactly. Current surfaces (8):

1. `app/issues/page.tsx:1010-1032` — list-page tab strip. Short-Term active: `border-gray-500 text-gray-700`. Long-Term active: `border-purple-600 text-purple-700`. (Tabs are text-only — no icon.)
2. `components/IssueDetailEditor.tsx:651-666` — read-only Type badge in slide-over header (EDIT mode). Uses the full bg + icon + label per the table above.
3. `components/IssueDetailEditor.tsx:759-790` — body Type picker (CREATE mode only). Active states: Short-Term = `bg-white` (the iOS-pill "selected" convention on its gray-100 group bg); Stractical = striped bg per the table; Long-Term = `bg-purple-200`.
4. `app/issues/page.tsx:1590` — Stractical glyph in list row Stractical column. `text-purple-600`.
5-7. `app/meetings/[id]/page.tsx:3030, 3507, 3658` — Stractical glyph in meeting IDS row, linked items section, cross-category matches. `text-purple-600`.
8. `app/meetings/[id]/page.tsx:336` — meeting-runner "Stractical Items" section header pill. `bg-purple-100 text-purple-700` (lighter than the badge purple-200 because section headers are larger surfaces; pill convention follows existing meeting section header style.)

## Icon spectrum semantics

- **⏱ (stopwatch)** — Short-Term = time-bound, tactical, immediate. Replaces the previous 🟦 blue-square emoji (which clashed with the new gray bg + felt arbitrary).
- **⚡ (lightning)** — Stractical = quick action with strategic weight. Unchanged.
- **🔭 (telescope)** — Long-Term = far-sighted, strategic horizon. Unchanged.

⏱ ↔ 🔭 mirror each other semantically (near-sighted vs far-sighted).

## What NOT to do

- Don't introduce a new color for any of the 3 Types. The spectrum is closed.
- Don't use orange or indigo for Stractical anywhere — that was the v1 (pre-CS-022) treatment and is fully replaced.
- Don't use purple for any non-Type semantic (priority, status, team, etc.). Purple now means "Type contains Long-Term character."
- Don't change icons. The ⏱/⚡/🔭 trio is the canonical glyph set.
- Don't add a 4th Type without re-thinking the spectrum (this would break the binary endpoints + midpoint logic).
