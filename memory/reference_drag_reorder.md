---
name: Drag-reorder canon
description: Native HTML5 DnD pattern for reordering rows. ⠿ handle (Unicode), always-visible at text-gray-300 hover:text-gray-500 (per feedback_always_visible_affordances.md), dragId+dragOverId state, brand-blue 2px drop indicator at row top, opacity-40 dragging row. Reference impls: app/meetings/[id]/page.tsx (IDS), app/scorecard/page.tsx (#551 C3b).
type: reference
originSessionId: f3055e97-3818-4a61-bef4-8209cd87b3a7
---
# Drag-reorder canon (#551 C3b)

The canonical drag-reorder pattern. Native HTML5 DnD — **no library**. First implemented for IDS issues in the meeting runner; promoted to canon when scorecard adopted it for `ScorecardMetric.order`.

## Reference implementations

- **IDS issues** in meeting runner — `app/meetings/[id]/page.tsx:3736-3758`
- **Scorecard rows** — `app/scorecard/page.tsx` (`MetricRow`, `handleReorderDrop`)

## State shape

Two pieces of state, owned by the page that renders the rows:

```ts
const [dragId, setDragId] = useState<string | null>(null);     // currently dragging
const [dragOverId, setDragOverId] = useState<string | null>(null); // current drop target
```

Pass both down to whatever renders the row, plus the setters and a single `onReorderDrop(targetId)` handler.

## Visual canon

- **Handle**: literal `⠿` Unicode character (U+2823 BRAILLE PATTERN). NOT a Lucide GripVertical — the character looks lighter and renders consistently.
- **Handle wrapper (metric / leaf rows)**: `<span draggable className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0 select-none w-4 text-center transition-colors">⠿</span>` — always-visible at low weight per `feedback_always_visible_affordances.md`.
- **Handle wrapper (group / section headers)**: `<span draggable className="text-gray-400 hover:text-[#0069AA] cursor-grab active:cursor-grabbing select-none w-4 text-center transition-colors">⠿</span>` — also always-visible, slightly heavier rest tone (`gray-400`) to acknowledge container-row weight in the hierarchy.
- **Handle position**: leftmost slot in the row's primary cell. After the bulk-checkbox / row-number prefix if those are present; before any state-flip circle. Per `reference_list_standards.md`.
- **Tooltip + aria-label**: "Drag to reorder" (or "Drag to reorder group" on headers)
- **Rest tone (per `feedback_always_visible_affordances.md`)**: always visibly present at low weight. Leaf rows = `text-gray-300`; container/group headers = `text-gray-400`. Previous opacity-0 → group-hover:opacity-100 pattern was retired 2026-05-17 (md #851 sweep) — invisible affordances teach users the feature doesn't exist.
- **Dragging row**: `opacity-40` so the user sees what's flying.
- **Drop indicator**: a 2px brand-blue (`#0069AA`) line at the TOP of the drop-target row.
  - In a `<table>` with `border-collapse`: apply box-shadow to EVERY child `<td>` via an arbitrary Tailwind selector — `[&>td]:shadow-[inset_0_2px_0_0_#0069AA]` on the `<tr>`. Border-collapse tables don't render `<tr>`-level box-shadow reliably across cells; targeting the children is the only consistent approach.
  - In a `<div>` row layout: an absolute `<div className="absolute -top-1 left-0 right-0 h-0.5 bg-[#0069AA] z-10 rounded" />` inside a `relative` row container.

## DnD wiring

On the draggable handle:
```tsx
<span
  draggable
  onDragStart={(e) => { setDragId(item.id); e.dataTransfer.effectAllowed = "move"; }}
  onDragEnd={() => { setDragId(null); setDragOverId(null); }}
>⠿</span>
```

On the row container (NOT the handle — drop target is the whole row):
```tsx
<tr
  onDragOver={(e) => {
    if (!dragId || dragId === item.id) return;
    if (sameScope) {
      e.preventDefault();            // required for drop to fire
      e.dataTransfer.dropEffect = "move";  // ALSO required in some browsers
      if (dragOverId !== item.id) setDragOverId(item.id);
    } else {
      // Browser shows native no-drop cursor (circle + slash on macOS).
      e.dataTransfer.dropEffect = "none";
    }
  }}
  // Don't clear dragOver on row-leave — internal td/button boundaries fire
  // dragLeave repeatedly and would cause flicker. Let dragOver on the next
  // row reassign it; dragEnd cleans up at the end.
  onDrop={(e) => {
    if (dragId && dragId !== item.id && sameScope) {
      e.preventDefault();
      onReorderDrop(item.id);
    }
  }}
>
```

**Cross-scope (invalid) drop indicator** — when the cursor is over an out-of-scope target during drag, paint a 2px solid red line (`#dc2626`) at the row's top edge AND set `cursor-not-allowed` on the row (`[&>td]:shadow-[inset_0_2px_0_0_#dc2626] cursor-not-allowed`). The native browser no-drop cursor (small circle+slash) is too subtle on its own. Keep tracking `dragOverId` even for invalid targets so the indicator paints; the drop handler still bails on invalid targets.

**Two required dataTransfer settings for the drop event to actually fire:**
- `effectAllowed = "move"` on dragStart
- `dropEffect = "move"` on every dragOver (yes, every — gets reset between events in some browsers)

Setting just one doesn't work consistently. Drops will silently fail.

## Reorder handler shape

```ts
async function handleReorderDrop(targetId: string) {
  // 1. Capture source/target, clear drag state
  // 2. Compute new order array (stable: filter out source, splice into target's slot)
  // 3. Optimistic local update — rewrite item.order in client state
  // 4. PATCH server with the new id sequence
  // 5. On error: rollback to previous state
}
```

## Persistence

Server endpoint accepts `{ ids: string[] }` and rewrites the `order` field for each id in a single transaction. Example: `app/api/scorecard-metrics/reorder/route.ts`.

## Scope rules

- **Within-scope only by default.** Same group / same section / same priority bucket. Cross-scope drops should either be no-ops OR explicitly handled (rare).
- The "same scope" check is enforced both in `onDragOver` (so the indicator only paints when valid) AND in `onDrop` (defensive).
- Dragging onto self is a no-op (`dragId !== item.id`).

## What NOT to do

- Don't pull in `react-dnd`, `@dnd-kit`, or any other DnD library. The native API is enough for our needs.
- Don't show the handle when not hovering — keep resting rows clean.
- Don't put the handle anywhere except the leftmost reorder slot.
- Don't use a different glyph (no `⋮⋮`, no `≡`, no `GripVertical` icon — `⠿` is canon).
- Don't try to absolutely-position drop indicators inside `<tr>` — use `inset box-shadow` for table rows, real absolute child for `<div>` rows.

## Related canon

- `reference_list_standards.md` — row-position rule (handle in leftmost slot after bulk/number, before state-flip circle).
- `reference_subtotal_metric.md` — subtotals are draggable like leaves; no auto-pin.
- `feedback_meeting_runner_consistency.md` — meeting runner can ADD drag-reorder to a list page row (not all standalone list pages have it).
