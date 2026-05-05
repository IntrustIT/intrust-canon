---
name: Priority palette + labels canon
description: Single source of truth for priority colors + labels. Two flavors (badge / chip) cover every priority surface. Live at lib/priority-colors.ts. Render via <PriorityPicker variant="badge" | "chip">. Read this before adding any priority indicator.
type: reference
originSessionId: c9b17cee-f5ec-4aac-9894-14aeaf8a54b7
---
# Priority palette canon

Every priority indicator in the UI uses **`lib/priority-colors.ts`** for color + label and **`<PriorityPicker variant="badge" | "chip">`** for rendering.

Established session 47 B5 + C-CC-3 — extracted from 3 duplicate maps.

## The palette

5 priorities, 5 colors, 5 labels — never extend the scale.

| Priority | Color | Badge class | Chip class | Label |
|---|---|---|---|---|
| **1** | red | `bg-red-500 text-white` | `bg-red-100 text-red-700` | Critical |
| **2** | orange | `bg-orange-400 text-white` | `bg-orange-100 text-orange-700` | High |
| **3** | yellow | `bg-yellow-400 text-gray-800` | `bg-yellow-100 text-yellow-700` | Medium |
| **4** | blue | `bg-blue-400 text-white` | `bg-blue-100 text-blue-700` | Low |
| **5** | gray | `bg-gray-300 text-gray-700` | `bg-gray-100 text-gray-600` | Backlog |

Hue stays constant per priority across both flavors. Same color = same priority everywhere.

## Two visual flavors

### Badge (default) — bold round circle
- Click-to-edit popover (unless `readOnly`)
- Used in detail editors, list rows where priority is the primary indicator, meeting IDS rows
- Saturated bg (`bg-red-500`) + white or near-white text — pops at small sizes
- Renders just the number (`1`); the round shape says "priority"

### Chip — flat soft pill
- Read-only display (no popover, no edit)
- Used in dense list contexts where priority is secondary metadata (e.g. meeting prep panel)
- Soft tinted bg (`bg-red-100`) + saturated text (`text-red-700`) — sits quietly inside text content
- Renders `P{priority}` with the prefix because the flat pill needs self-description (no shape cue)

Both share: same hue per priority, tooltip with `P{n} — {Label}`, optional `showLabel` to render `P1 Critical` for label-rich surfaces.

## API

```tsx
import PriorityPicker from "@/components/PriorityPicker";

// Badge — primary priority indicator, click to edit
<PriorityPicker priority={p} onChange={setP} />

// Badge — read-only display
<PriorityPicker priority={p} readOnly />

// Chip — dense list metadata, always read-only
<PriorityPicker priority={p} variant="chip" />

// Chip with full label suffix
<PriorityPicker priority={p} variant="chip" showLabel />
```

For the rare case where you need just the className (no full component) — e.g. styling a custom span:

```tsx
import { priorityBadgeClass, priorityChipClass, priorityLabel } from "@/lib/priority-colors";

const cls = priorityBadgeClass(priority);     // "bg-red-500 text-white"
const lbl = priorityLabel(priority);          // "Critical"
```

But default to `<PriorityPicker>` — the helper is for special cases.

## Known consumers

- `components/PriorityPicker.tsx` — both variants
- `components/IssueDetailEditor.tsx` — badge, click-to-edit
- `app/meetings/[id]/page.tsx` — meeting IDS row badge, click-to-edit
- `app/issues/page.tsx` — list-row + kanban-card badge (uses `PRIORITY_COLORS_BADGE` directly via lib import for the inline-className case)
- `components/MeetingPrepPanel.tsx` — chip variant (B5/C-CC-3 refactor)

## What NOT to do

- Don't declare a new `PRIORITY_COLORS` map in any file. Three duplicates were the trigger for this canon.
- Don't introduce a 3rd flavor (e.g. "outline" or "underline"). Two flavors cover the surfaces; new contexts pick the one that fits.
- Don't change the hues. Red=critical, orange=high, yellow=medium, blue=low, gray=backlog. Each color has earned semantic meaning over the codebase — no per-feature recolor.
- Don't extend the priority scale beyond 1-5. EOS uses 5-tier; we'd lose the recognizable mental model.
- Don't render `P{priority}` on the badge variant — the round shape is the priority cue. Prefix is chip-only.
- Don't use these colors for non-priority semantics. Red elsewhere = critical-status / past-due / destructive; orange elsewhere = AI / Stractical (see `reference_issue_type_spectrum.md`); yellow elsewhere = warning / confused. The priority scale shares the broader app palette, but the meaning is contextual — a red badge in a priority context is "P1," not "danger."
- Don't co-opt the labels. "Critical / High / Medium / Low / Backlog" is the priority vocabulary. Don't reuse "Critical" for non-priority severity (use "Severe" or context-specific verb).

## Related canon

- `reference_shared_components.md` — full primitives roster
- `reference_issue_type_spectrum.md` — purple is owned by Issue Type semantics, not priority (so priority's blue isn't confused with type's purple)
