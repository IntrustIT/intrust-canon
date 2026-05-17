---
name: Always-visible affordances (no opacity-0 group-hover veil)
description: Affordances stay visibly present at low weight; never use opacity-0 group-hover:opacity-100 to hide an interactive control until hover.
type: feedback
---

**Rule.** Any interactive control the user might need — drag handle, delete/remove X, inline action button, sort indicator, link affordance — must be visibly present at rest. Reduce visual weight via low-tone color (e.g. `text-gray-300`), not via `opacity-0 group-hover:opacity-100`.

**Canonical replacement pattern:**
- Destructive affordances: `text-gray-300 hover:text-red-500 transition-colors`
- Non-destructive affordances: `text-gray-300 hover:text-gray-500 transition-colors` (or `hover:text-[#0069AA]` for action buttons)

**Why:** Things going invisible is an example of "can but shouldn't." Hover-to-reveal teaches the user the affordance doesn't exist; testers report features as broken when the trigger isn't visible at rest. Discoverability + lowered visual weight is the right balance — not visibility-or-nothing. Locked 2026-05-17 (md #850).

**How to apply:**
- Drag handles (`⠿`), remove/X buttons, inline edit buttons, sort-direction arrows on column headers: ALWAYS-VISIBLE at the canonical low tone above.
- Pencil/edit, link-action, and similar entity affordances: ALWAYS-VISIBLE at low tone.
- Sort headers: inactive direction arrow renders at `opacity-40` at rest (per /todos pilot, post-sweep). Active state stays `opacity-100`.

**Class B exceptions (LEAVE the opacity transition in place):**
- **Hover-reveal text tooltips/popovers.** `bg-gray-900 text-white text-xs rounded-lg … pointer-events-none` style tooltips where the opacity transition IS the popover-reveal mechanism (not an icon hiding behind a hover veil). The whole element materializes on hover — that's a tooltip, not an affordance veil.
- **Between-element insert affordances.** "+ Section here" / "+ Insert row" controls that live in a 1-2px spacer between sibling rows or sections, where (a) a primary always-visible insert path already exists ("+ Add section" button below the list), and (b) always-visibility would put a permanent UI element between every row at real visual cost. The hover band IS the surface; the label materializes once the user hovers the band. Treat as Class B-adjacent.
- **Validation error messages** (transient — render-on-error).
- **Loading overlays + modal backdrops** (animation lifecycle, not affordance veiling).

**Anti-canon pattern to remove on sight:**
```
opacity-0 group-hover:opacity-100 transition-opacity
opacity-0 group-hover/<name>:opacity-100 transition-opacity
```
Replace with low-tone-at-rest + hover-color-shift + `transition-colors`.

**Sweep history:** EntityLink X + synthetic-FK X swept 2026-05-17 (md #841 + #850, commit `d68b224`). Codebase-wide sweep landed 2026-05-17 (md #851 + closes K-BUG-049 IDS drag-handle visibility regression).
