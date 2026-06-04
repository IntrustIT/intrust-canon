---
name: reference-editable-table-cell
description: Tier-1 canon for tabular numeric cells with three states — Editable, Calculated, Sourced. Applies to scorecard, GGOB, and any future table where some cells are user-entered and others are derived or auto-fed. Reconciles drift between scorecard runner and GGOB forecast.
metadata:
  type: reference
  tier: 1
  status: canon
  introduced: 2026-05-27
  revised: 2026-05-28
---

# Editable table cell — three-state canon

For tables where some numeric cells are user-entered, some are derived rollups, and some come from external feeds. Three states, three encodings — chosen so they read instantly at scorecard density (10+ columns × many rows) without busying the grid.

## Iteration note (2026-05-28)

This spec went through three look-tests on a throwaway demo + the scorecard runner pilot before locking. Earlier drafts tried (a) an `<input>`-style bottom underline at rest, then (b) a tiny corner-glyph vocabulary (`✎` for editable, `=` for calculated). Both *looked* fine at sparse demo density and *failed* at production scorecard density — the underline read as row-dividers (every cell's bottom border stacked just above the next row's cell), and the corner glyphs read as visual noise across hundreds of cells. The locked spec is the third pass: **no rest-state glyphs at all; color tinting for read-only states; ghost-fallback values for empty editable cells.** Reuse over remake — this mirrors GGOB's `fallbackValue` / `isUserEntered` mechanic from `app/ggob/page.tsx:1043-1182`, which already worked.

## The three states

1. **Editable** — the user enters / edits the value here. This is where data lives.
2. **Calculated** — a *derived rollup* of other cells in the same table (e.g. a weekly metric's monthly column, a QTD total). Read-only because editing it would contradict the cells it's summing/averaging.
3. **Sourced** — value comes from an *external feed* (autoSource integration like HaloPSA / Ninja / GGOB) or is *lifecycle-frozen* (e.g. completed meeting). Read-only because the source of truth is elsewhere; edit at the source.

Calculated vs Sourced is a real distinction, not pedantry: a calculated cell invites "show me the formula," a sourced cell invites "go to the source." Different mental models, different background tints.

## Decision rule — which state is a cell in?

Walk top to bottom; first match wins.

1. The metric is system-owned (`autoSource != null`) **OR** the parent surface is lifecycle-frozen (completed meeting, locked period) → **Sourced**.
2. The cell's cadence equals the metric's *finest declared entry period* (the lowest cadence in its `periods` field) **AND** the parent isn't frozen → **Editable**.
3. The cell's cadence is *coarser* than the metric's finest declared period (so it's a rollup) → **Calculated**.
4. The cell's cadence is *finer* than the metric's finest declared period → the metric simply doesn't appear at this cadence (no row rendered).

**Editability is per-row, not per-table or per-section.** A Monthly sub-section can contain both weekly-native metrics (whose Monthly cell is Calculated/read-only) AND monthly-native metrics (whose Monthly cell is Editable). The state is decided per-cell from the per-metric rule.

Anti-pattern (the old scorecard model): a global "only Weekly cells are editable" rule. That mis-locks monthly-native metrics — they can't be edited *anywhere* — and forces sub-section header labels like "read-only rollup" that are wrong as soon as the section contains a mixed-cadence metric.

## Visual treatments

### Editable

- **Value:** `text-gray-700` for older periods, `text-gray-900` for the latest (current) period column. `tabular-nums` for alignment.
- **Background at rest:** none. Inherit table background. **No corner glyph, no underline, no border.** Color encoding alone (lack of tint vs gray for calc vs blue for sourced) distinguishes editable from read-only states at density.
- **Empty cell — ghost-fallback (reuse GGOB pattern):** show a fallback value in `text-gray-300`. Fallback chain: **(1) prior period's value** if it exists, else **(2) the metric's `goal` value** (parsed), else **(3) bare blank** if neither. The ghost number IS the affordance — there's no separate "you can type here" indicator. Reuses `fallbackValue` / `isUserEntered` / `hasFallback` shape from `app/ggob/page.tsx:1043-1182`.
- **Hover:** `hover:bg-blue-50`. Transient — vanishes on un-hover.
- **Click → inline `<input>`:** `border border-[#0069AA] focus:ring-2 focus:ring-[#0069AA]/30 rounded px-1.5 py-0.5`, `inputMode="decimal"`, **prefilled with the fallback value** so the user can accept-or-adjust rather than retype. Constrain to the cell: `w-full box-border` on the input + `overflow-hidden` on the `<td>` so it can't escape into adjacent sticky columns.
- **Once user types a real value:** `isUserEntered = true`. Cell renders with regular `text-gray-700/900`, no longer ghost.
- **Keyboard nav (canonical — adopt across ALL editable-cell surfaces):**
  - `Enter` — save and move focus down to the next editable cell in the same column.
  - `Tab` / `Shift+Tab` — save and move to the next/previous editable cell in row order.
  - `Esc` — cancel and revert.
- **Tooltip:** `"Click to edit"`.

### Calculated (rollup)

- **Background:** `bg-gray-50/60` (faint gray tint — the color carries the "this isn't an input" signal at density without needing a glyph).
- **Value:** `text-gray-500`, `tabular-nums`.
- **No glyph.** Earlier drafts placed a small `=` in the corner; killed in the 2026-05-28 density-iteration. Per-cell glyphs read as noise across hundreds of cells. The tint is the signal.
- **Cursor:** `cursor-default`. No hover affordance — it's not clickable.
- **Empty cell:** `—` (em-dash) `text-gray-400`.
- **Tooltip:** `"Calculated rollup"`.

### Sourced (external feed / lifecycle-frozen)

- **Background:** `bg-blue-50/60` (faint blue tint — deliberately distinct from the *transient* `hover:bg-blue-50` on editable cells; the persistent tint says "this comes from elsewhere").
- **Value:** `text-gray-500`, `tabular-nums`.
- **No glyph.** The blue tint + `cursor-not-allowed` carries the signal. We deliberately do *not* use the **Lucide-Lock** here — that glyph is reserved for the *metric-level* locked-field treatment in `reference_locked_system_metric.md` (the chip on a whole metric/field that's catalog-owned). Sourced-cell ≠ locked-field; conflating them muddies both vocabularies.
- **Cursor:** `cursor-not-allowed`.
- **Empty cell:** `—` (em-dash) `text-gray-400`.
- **Tooltip:** `"Auto-sourced — edit at the source"` (or for lifecycle-frozen: `"Frozen — meeting is completed"`).

## Three-state empty vocabulary

| State | Empty look | Why |
|---|---|---|
| **Editable, no entry** | Prior-period value (or goal fallback) in `text-gray-300` ghost — value IS the affordance | User can accept / override on click |
| **Calculated, no data** | `—` em-dash, `text-gray-400` on `bg-gray-50/60` | Nothing to roll up yet; tint tells you it's computed |
| **Sourced, no data** | `—` em-dash, `text-gray-400` on `bg-blue-50/60` | Feed has nothing yet; tint tells you it's auto-sourced |

The three-state empty glance reads as: **ghost-number / dash-on-gray / dash-on-blue** — no per-cell glyphs required.

## Why these choices (post-iteration)

- **Density wins.** A scorecard is the densest editable table we ship. Treatments that look fine at 3 rows × 3 columns become busy at 4 rows × 12 columns. The corner-glyph and underline variants were both rejected at full-width production density.
- **Color carries; ghost fills.** The bg tint already encodes "this is calc/sourced" — no second character needed in the cell to repeat that. The empty-editable's ghost number does the affordance work that a glyph would otherwise have to do, and is more informative (it shows the *expected* number, not just "you can type here").
- **GGOB precedent.** The fallback mechanic (`fallbackValue` + `isUserEntered` + `hasFallback`) already shipped in `app/ggob/page.tsx` and is documented in `lib/rickety-app-guide.ts:102` ("Grey ghost text = plan fallback (no actual yet)."). The scorecard runner is the second pilot; future editable-table surfaces reuse the same primitive.

## What this doc supersedes / reconciles

- **Scorecard runner** (`app/meetings/[id]/page.tsx`) previously had a global "only Weekly cells are editable" rule and no visual distinction between editable and calculated cells. Fix: adopt the three-state spec; editability becomes per-row from finest-cadence rule.
- **GGOB forecast** (`app/ggob/page.tsx`) is the canonical fallback pattern. Its current hover is `hover:bg-blue-100` (heavier than the new spec's `hover:bg-blue-50`); align at the next GGOB pass. The `fallbackValue` mechanic itself is the spec — GGOB does NOT need to adopt anything different there; the scorecard runner adopts GGOB's shape.
- **Locked-system-metric** (`reference_locked_system_metric.md`) Lock chip stays at the **metric/field** level (e.g. catalog-locked metric name). Cell-level "this value is sourced" uses the blue tint instead. The two layers are complementary, not duplicative.
- **Subtotal Σ** (`reference_subtotal_metric.md`) stays as the **subtotal-row** marker (whole row is a sum). Per-cell rollups use no glyph (tint only). Different scales, different vocabularies.

## Pilot impls

- **Scorecard Review runner section** — `app/meetings/[id]/page.tsx` (Commits 1b + 1b corrections of the 2026-05-27/28 Scorecard Review segment) is the pilot adoption: 4 commits on `claude/scorecard-review` ending at `07826f1`.
- **GGOB forecast** (`app/ggob/page.tsx:1043-1182`) is the *fallback-mechanic* pilot — first surface to ship the `fallbackValue` / `isUserEntered` pattern.
- Standalone `/scorecard` sweeps to the full three-state spec at its next pass.

## Out of scope

- Non-numeric editable table cells (text columns, picker columns). This spec is for **numeric value cells**. Text/picker cells follow the form-field canon.
- Whole-row reordering, drag handles, etc. — see `reference_drag_reorder.md`.
- Value coloring by goal (green/red vs target) — that's a separate concern handled in `lib/status-colors.ts` and applies on top of any of the three cell states. See `project_scorecard_review_segment.md` Commit 2.
- Decision of *which metric goes in which cadence sub-section* — that's a scorecard structural concern, not a cell concern. See `project_scorecard_review_segment.md`.
