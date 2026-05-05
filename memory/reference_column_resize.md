---
name: Column resize canon
description: useColumnResize is the canonical hook for any drag-resizable table column. Single primitive, single shape — 4px right-edge handle, dbl-click reset, localStorage persistence per storageKey.
type: reference
originSessionId: f3055e97-3818-4a61-bef4-8209cd87b3a7
---
# Column resize canon

`lib/use-column-resize.ts` is the canonical primitive for any drag-resizable table column. Established session 56 with the scorecard Measurable column (#552). Reuse the hook with a unique `storageKey` rather than rolling new resize logic.

## API

```ts
const { width, isDragging, handleProps, headerStyle, cellStyle } =
  useColumnResize(storageKey, defaultWidth, { min, max });
```

- `storageKey` — unique localStorage key, namespace it (e.g. `"scorecard-measurable-col-width"`).
- `defaultWidth` — initial width AND the width restored on dbl-click reset.
- `min` / `max` — drag bounds (defaults 80 / 800; tighten per use).

## Wiring rules

- The column header `<th>` sets `style={headerStyle}` and wraps its content in a `<div className="relative">` — the handle goes inside that wrapper as its last child. Move padding (`px-4 py-3` etc.) from the `<th>` onto the inner content div, leaving the `<th>` with `p-0` so the wrapper fills cell-edge-to-edge.
- **Why the wrapper is required:** `<table className="border-collapse">` cells do NOT reliably establish a containing block for absolutely-positioned descendants in Chrome/Safari. Without the wrapper, the handle anchors to the wrong ancestor and renders off-screen.
- The host `<th>` MUST have `position: sticky` (or `relative`) on it via className when sticky-left freezing is desired — the hook does NOT inject `position` to avoid clobbering existing sticky-left freezing.
- Every body `<td>` for the same column sets `style={cellStyle}` (no wrapper needed — body cells don't host the handle).
- If the body cell lives in a child component, hoist the hook to the common parent and pass `cellStyle` down as a prop (e.g. `nameCellStyle`).

## Visual canon (don't deviate)

- Handle is a 6px-wide hit area anchored top-0/right-0/full-height of the cell, with the visible mark drawn as a `border-right` on that box. Wide hit, thin line — standard resize-handle UX.
- Default: `border-right: 1px solid #d1d5db` (gray-300). Reads as a thin column rule, not a chunky stripe.
- Hover + dragging: `border-right: 2px solid #0069AA` (brand blue).
- Inline style — keeps render bulletproof across Tailwind/JIT/dev-server edge cases on a brand-new file.
- `cursor: col-resize` on the handle. While dragging, body cursor + userSelect are forced to col-resize / none so text selection doesn't fight the drag.
- Tooltip on the handle: "Drag to resize. Double-click to reset."

## Behavior canon

- localStorage write happens on mouseup (drag end) AND on every settled width change (covers dbl-click reset).
- Width restored on mount only if the stored value is finite AND within `[min, max]` — out-of-bounds values are ignored, falling back to default.
- ARIA: handle has `role="separator"` + `aria-orientation="vertical"`.

## When NOT to use

- Don't make every column resizable — only the column users actually want to widen (long names, long text). Tiny status / pill columns stay fixed.
- Don't use for row resizing — different problem, hasn't been needed yet.
- Don't persist across users via DB — UI preference, per-device is correct.
