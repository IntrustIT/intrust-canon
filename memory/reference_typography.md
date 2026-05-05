---
name: Typography canon
description: Font sizes follow Tailwind's scale; size is by ROLE not by guess. text-[10px] uppercase tracking-wide for section labels, text-xs for body table cells, text-sm for primary content + buttons, text-base for body prose, text-lg/xl/2xl/3xl for headings. Weights via font-medium / font-semibold / font-bold by emphasis level.
type: reference
---

# Typography canon

Font sizes assigned by **role**, not by guess. Default to the smallest size that reads clearly at the role.

## The size scale (Tailwind classes)

| Class | px | Use for |
|---|---|---|
| `text-[10px]` | 10 | Section labels (uppercase + `tracking-wide`), badge counts, helper text under inputs, dense table sub-labels |
| `text-[9px]` | 9 | Smallest meta — "avg" / "total" sub-labels under summary cell values |
| `text-[11px]` | 11 | Tertiary helper text |
| `text-xs` | 12 | Body in dense table cells, pills/chips, button labels in dense action rows, period column headers |
| `text-sm` | 14 | **Primary body content** — most paragraph text, form labels, button text in standard buttons, list-row titles |
| `text-base` | 16 | Long-form prose blocks (descriptions, AI summaries) |
| `text-lg` | 18 | Section headings inside detail panels (rare — most headings are smaller) |
| `text-xl` | 20 | Sub-page headings ("VTO 2026 Goals") |
| `text-2xl` | 24 | Page heading on most pages ("Scorecard", "Issues", "Rocks") |
| `text-3xl` | 30 | Dashboard hero numbers (rare — used for big single-stat cards) |

## Weights

- `font-normal` (default) — body prose, table cell values
- `font-medium` — emphasis, button labels, hover-active text, list-row titles, owner avatars sublabels
- `font-semibold` — section headers, important table column headers, met-goal cell values, page subheadings
- `font-bold` — page H1, group header labels (uppercase), subtotal row values, "always-visible big number" surfaces

## Tracking + transforms

- **Section labels** — `text-[10px] font-bold text-gray-500 uppercase tracking-wide`. Used on group headers, subform section dividers, and the `+ Add` affordance label rows.
- **Group / category labels in dense surfaces** — same scale but `text-[10px] text-gray-400 normal-case tracking-normal font-medium` (lighter weight, no caps) for the count badges next to a section name.
- **Body prose** — no `tracking-*` adjustments; default is fine.

## Font family

Inherited from the consumer's globals.css. Both intrust-os and Playbook use the system stack today (Arial/Helvetica fallback, with the consumer's chosen primary). The canon doesn't enforce a specific font face — it enforces SCALE and ROLE.

If the consumer uses Geist or Inter or anything else, the role mapping above still applies — the relative sizes carry the meaning.

## Rules

- **Pick by role, not by guess.** Don't reach for `text-base` for a button just because it "looks clean" — buttons are `text-sm` (or `text-xs` in dense rows). Roles preserve hierarchy.
- **Don't introduce new sizes.** If you need something between `text-xs` and `text-sm`, you don't — you need a different ROLE for the content (probably a different visual treatment entirely).
- **`uppercase tracking-wide` is reserved for SECTION LABELS** — group headers, form section dividers, table column headers in some surfaces. Don't sprinkle it for emphasis on body text.
- **Color and weight should agree.** A bold-but-gray-400 pairing reads as muted-emphasis (e.g., a count badge). A medium-but-gray-800 pairing reads as primary body. Avoid bold + gray-700 + small-size unless you mean "this is a roll-up / important meta" (see subtotal canon).

## Why no font-config in canon

We rely on the consumer to bring its own font (Geist for intrust-os; whatever Playbook chooses). The canon mandates ROLE scale, not the typeface. This keeps each consumer free to brand differently within the same hierarchy.
