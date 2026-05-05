---
name: FilterToggle convention — switch shape + Class A/B labels + form-property variant
description: Canonical shape and labeling for every binary on/off toggle in the app. Three classes: filter Class A (additive "Include X"), filter Class B (narrowing "X only"), form-property (descriptive label, no suffix). Single component, single shape.
type: reference
originSessionId: e3254e1f-2812-4afc-b94a-03bec503312a
---
# Binary toggle canon

**Single component:** [`components/FilterToggle.tsx`](components/FilterToggle.tsx).
Used for every binary on/off toggle in the app. There is no other shape — pills, plain checkboxes for filter bars, and aria-pressed buttons are all retired.

**Shape:** iOS-style switch — 28×16 px rounded track with a 12 px white sliding thumb. Track is gray when off, tone-color when on (blue `#0069AA`, green `#22C55E`, or orange `#F58326`). Label sits to the LEFT of the track. `role="switch"` + `aria-checked` semantics.

**Adopted:** session 46 (2026-05-02). Replaced the original aria-pressed pill pattern + plain HTML checkboxes after Ricky review. The pill variant was dropped from FilterToggle entirely.

## Three classes — labels differ, shape stays the same

### Class A — Additive filter ("Include X")

Switch ON expands the result set to include X. Switch OFF leaves the default (smaller) set.

| Label | Where | State |
|---|---|---|
| `Include archive` | GlobalSearch header bar | `includeArchived` |
| `Include direct reports` | /insights, /todos popover, /issues popover | `showDirectReports` / `includeReports` |

Labels start with `Include` (or another expanding verb). Tooltip optional — label is usually self-explanatory.

### Class B — Narrowing filter ("X only")

Switch ON narrows the result set to ONLY X. Switch OFF shows the default (broader) set.

| Label | Where | State |
|---|---|---|
| `My to-dos only` | /todos inline header | `myOnly` |
| `Due to me only` | /todos inline header + popover | `waitingOnMe` |
| `Stractical only ⚡` | /issues inline header + popover | `straticalOnly` |
| `Private only` | /todos popover, /issues popover | `showPrivate` |

Labels end with `only` so the at-a-glance read matches the behavior. Without `only`, the switch ON state reads ambiguously ("My to-dos" could mean "include mine" — Ricky noted this exact "showing something that isn't there" problem when we tried bare labels).

Tooltip — single state-agnostic sentence describing the narrowing action ("Narrow to stractical + rock/goal-linked issues only"). Don't write separate ON/OFF tooltip copy — the switch state IS the indicator.

### Form-property variant ("X")

The same `FilterToggle` is used for binary boolean form properties on entities (Private visibility on issues, todos, rocks, headlines via [`components/TeamScopePicker.tsx`](components/TeamScopePicker.tsx); the Recurring checkbox on todos when it converts in a future sweep; etc).

| Label | Where | State |
|---|---|---|
| `Private` (with lock icon) | TeamScopePicker → all entity editors | `visibility === "private"` |

**Critical distinction:** form-property labels describe the entity's state, NOT a filter direction. So **no `only` suffix** — `Private`, not `Private only`. The switch ON simply means "this property is true on this entity."

The shape is the same, the semantics differ. Read the surrounding context: if the toggle is in a filter row above a list, it's a filter (Class A or Class B). If it's inside an editor form alongside other entity properties, it's a form-property.

## Layout patterns

- **Stacked rows in popovers** — pass `fullWidth` to FilterToggle. The label sits left, switch right (`justify-between`). Even widths.
- **Inline header bar** — omit `fullWidth`. Label hugs switch tightly. Wrap in a `<Tooltip>` when help text adds context.
- **Form rows in editors** — usually inline next to a related select/input (e.g. Team selector + Private switch in TeamScopePicker). Don't stretch.

## When to use a switch — and when NOT to

**Use:** every binary on/off filter in a filter bar, every binary form property, every settings toggle that doesn't have a third state.

**Do NOT use** for:
- Three-or-more-way pickers (segmented controls — see Archive picker on /todos: `Active / Both / Archived`).
- Bulk-select row checkboxes (those are different semantically — "select this one" not "is this on").
- Anything where ON state needs an immediate destructive consequence (use `confirmDestructive` modal).

## Related canon

- `feedback_canon_strictness.md` — why this consistency rule exists (the cost-of-inconsistency rationale).
- `reference_shared_components.md` — list of canonical primitives (FilterToggle is one of them).

## Sweep status (session 46)

Migrated:
- /todos inline header (My To-Dos, Due to me)
- /todos popover (Private only, Due to me, Include Direct Reports)
- /issues inline header (Stractical only ⚡)
- /issues popover (Private only, Stractical only ⚡, Include Direct Reports)
- GlobalSearch header (Include archive)
- /insights (Include direct reports)
- TeamScopePicker → all entity editors (Private form-property)

Pending sweep: full-app audit for any remaining checkbox or aria-pressed pill that fits one of the three classes. (Session 46 work in progress.)
