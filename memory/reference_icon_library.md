---
name: Icon library canon
description: Three icon families with strict scope. Lucide for UI/action icons (chevrons, gears, plus, edit, save). Unicode for low-noise affordances (⠿ drag handle). Emoji for entity icons + context-menu items. Never roll your own SVG except as a last resort.
type: reference
---

# Icon library canon

Three icon families, each with a defined scope. Mixing them is fine; misusing one is jarring.

## The three families

### 1. Lucide — for UI / action icons

Use Lucide React for any icon that's part of a CONTROL: button glyphs, form-field icons, chart-icon affordances, status indicators, calculated-leaf glyph, gear icons, save/cancel icons, plus/edit/trash glyphs, etc.

```tsx
import { Sigma, Calculator, Sparkles, Trash2, Edit3, Plus } from "lucide-react";
```

- Stroke width: default (1.5 unless explicitly heavier)
- Size: `w-3.5 h-3.5` for inline buttons, `w-4 h-4` for footer/action buttons, `w-5 h-5` for primary nav
- Color: inherits from parent. `text-gray-400` resting, `text-[#0069AA]` on hover for actions.

### 2. Unicode — for low-noise affordances

Some affordances should be quiet — drag handles, separators, ellipsis menus. Use Unicode characters when they read more elegantly than a Lucide icon at small size.

| Glyph | Unicode | Use for |
|---|---|---|
| `⠿` | U+2823 BRAILLE PATTERN | Drag-reorder handle (per `reference_drag_reorder.md`) |
| `Σ` | U+03A3 GREEK SIGMA | Subtotal / sum-style total indicator (per `reference_subtotal_metric.md`) |
| `⌘` | U+2318 PLACE OF INTEREST | Cmd key in keyboard shortcut hints |
| `▾ / ▸` | U+25BE / U+25B8 | Compact chevrons in dense menu / context-menu items (NOT for general navigation — Lucide chevrons are canon for that) |

### 3. Emoji — for entity icons + context-menu items

Per `reference_icon_vocabulary.md`. Emoji entity icons travel through the app as conceptual markers: ⏱ Short-term issue, ⚡ Stractical, 🔭 Long-term, ✅ todo, 🪨 rock, 🏆/📢 headline, ✨ AI / Rickety, 📋 details, 🚩 flag, 🔀 route, 🗑 delete, 🧮 calculated leaf.

Context-menu items use these as the small icon column on the left.

## Rules

- **Don't roll your own SVG.** Reach for Lucide first. Only hand-roll an SVG when no Lucide icon fits AND it can't be done with Unicode or emoji.
- **Don't replace established glyphs.** `⠿` for drag, `Σ` for subtotal, ✨ for AI — these are canon, not preferences.
- **Don't introduce new emoji into entity vocabulary** without an update to `reference_icon_vocabulary.md`.
- **Mutually exclusive 3-icon model on data rows** (per `reference_subtotal_metric.md`): ⚡ for synced (connector-driven), Σ for sum-style aggregation, 🧮 for non-sum calculation. One row, one icon.
- **Tooltips on every icon**. Per the vocabulary doc, every icon needs a tooltip — icons alone aren't accessible enough.

## Why three families instead of one

- **Lucide** is the workhorse — consistent stroke, scales, professional feel.
- **Unicode** wins where Lucide is overkill (a 4-pixel drag dot character beats a Lucide GripVertical at this size).
- **Emoji** carries semantics — colored, instantly recognizable, perfect for entity types where users learn the visual shorthand.

Forcing everything through Lucide loses the quietness of Unicode and the semantic richness of emoji. Forcing everything through emoji turns the app into chat. The split is intentional.

## Adding a new icon

| Type | Workflow |
|---|---|
| Lucide UI icon | No canon change needed. Just import and use with the size + tooltip rules. |
| New Unicode affordance | Update this doc + `reference_drag_reorder.md` (or wherever the affordance is defined). PR to canon. |
| New entity emoji | Update `reference_icon_vocabulary.md`. PR to canon. |
