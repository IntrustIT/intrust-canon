---
name: Active / focused indicator
description: The canonical "you are looking at THIS" affordance — a brand-blue ChevronRight in the outboard-left lane marking the single currently-focused row/item (meeting-runner current section, list row whose detail panel is open, etc.). Component is components/ActiveIndicator.tsx. Sibling to FlaggedTab; both live in the outboard-left lane, absolutely positioned, aria-hidden, no layout shift.
type: reference
tier: 1
status: canon
introduced: 0.6.0
---

# Active / focused indicator

One canonical way to signal **"this is the element you're focused on right now"** — the current meeting-runner section, a list row whose detail panel/editor is open, the selected item in any list/panel pair. Component: **`components/ActiveIndicator.tsx`**. `<ActiveIndicator active={isCurrent} />`.

## The affordance

A **brand-blue `ChevronRight`** (Lucide) rendered in the **outboard-left lane** — the margin to the LEFT of the row/card — pointing at the focused element. Absolutely positioned, `aria-hidden`, `pointer-events-none`. It does not affect row layout and never shifts position.

```
<ChevronRight aria-hidden
  className="absolute top-1/2 -translate-y-1/2 left-0 w-6 h-6 pointer-events-none"
  style={{ color: "var(--color-brand-blue)" }} strokeWidth={2.75} />
```

## Why an outboard-left arrow (not a stripe / tint / ring)

The left-edge stripe is reserved for **entity hue + depth** (`reference_stripe_system.md`) and the outboard-left 6px ribbon is reserved for **flagged** (`<FlaggedTab>`). A focus indicator must not reuse either — Ninety's left-edge purple stripe would clobber both. The arrow is directional ("look here"), honest, collision-free, and works in both a dense list row and a nav-tracker item. (Background tint / inset ring were considered and rejected — tint reads as a state change, ring competes with focus styling.)

## Placement requirements (LOCKED)

- The **parent** element must be `position: relative`.
- The parent must **reserve a left lane (~36px, e.g. `pl-9`)** so the `w-6` arrow renders without clipping and clears the FlaggedTab ribbon zone.
- The arrow sits at a **FIXED offset (`left-0` within the parent's lane)** that clears the flagged-ribbon zone — position is constant whether or not the row is also flagged. **A focused row that gets flagged must not make the arrow jump.**

Canonical co-location with FlaggedTab:
```
<div className="relative pl-9">
  <ActiveIndicator active={isCurrent} />
  {row.flagged && <FlaggedTab />}
  <div className="rounded-lg ..." style={stripeStyle(...)}>…row content…</div>
</div>
```

## Decorative, not the sole signal

"Current" is also carried by the row's own active styling (bold + brand-blue text where applicable), so the arrow is **decorative** — `aria-hidden`, **no tooltip** (same treatment as FlaggedTab). Don't add a tooltip or make it focusable.

## Where it applies (rollout — punchlist #902)

Every place a row opens a detail panel / is the focused item: (a) dashboard My Work + Attention rows when their panel/editor is open; (b) every list page (/todos /issues /rocks /headlines /scorecard) focused/panel-open row; (c) within each meeting-runner content section (Scorecard Review panel-open metric, Rock Review panel-open rock, IDS selected issue, …); (d) any future list/panel pair. **Per-surface as each is touched** — not a big-bang sweep.

## Pilots

- Meeting-runner nav-tracker current section (PR #11, commit `d7b8b3a`).
- Scorecard Review + Rock Review panel-open rows (PR #14/#15/#16).

## See also

- [`reference_stripe_system.md`](reference_stripe_system.md) — the left-edge stripe + FlaggedTab ribbon the arrow must clear.
- [`reference_icon_library.md`](reference_icon_library.md) — Lucide for UI/state glyphs.
