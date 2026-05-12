---
name: List-row column order
description: Canon for the left-to-right column slot order on every list-row in every list page. Locks `[bulk][drag][state][TITLE][indicators][resp-A][resp-B][date][team]` with rationale per slot. Established 2026-05-12 (v0.4.0) as the s60 /todos polish canonical surface.
type: reference
---
# List-row column order — canon

Every list-page row reads left to right in the same slot order. Slots are optional (a list page can omit any of them) but their relative positions never change. A reader scanning /todos and /issues should not have to relearn where the title sits or where the assignee chips live.

**Canonical impl:** `app/todos/page.tsx:1380+ + 1565+` (the row template). /issues, /rocks, /headlines retrofit to this order in cross-app sweep #774.

## The slot order

```
[bulk][drag ⠿][state ○][TITLE flex-1][indicators][resp-A][resp-B][date][team]
                                       ↑ comments / links / spawn / etc.
```

| # | Slot | Width | Why this position |
|---|---|---|---|
| 1 | **Bulk select** | `w-4` | Selection is the leftmost ambient action — read-then-act, like "check the items you want." Far-left is the universal selection home (Gmail, Linear, Notion). |
| 2 | **Drag handle ⠿** | `w-4` | Reorder grip sits adjacent to selection — both are row-level affordances acting on the row itself. Visible only when sortable; opacity-30 → 100 on hover (per `reference_drag_reorder.md`). |
| 3 | **State circle** | `w-5` | The done/not-done toggle (`<RowStateCircle>` for /todos, status icon for /issues, etc.). Immediately precedes the title so the eye reads "state + title" as a unit. |
| 4 | **TITLE (flex-1)** | grow | The row's primary content. Grows to fill available width; description/notes wrap below on one line truncated. Click → open editor (per `reference_entity_edit_affordance.md`). |
| 5 | **Indicators** | auto | Comment count, linked-item count, spawn markers, comment-search hit indicator. Sit *after* the title because they're meta-about-the-title, not separate columns. Each is icon+number, no pill chrome (per `reference_status_pill_semantics.md`). |
| 6 | **Resp-A** (primary responsibility) | `w-14` | The person on the hook — `<UserAvatar role="Responsible">` / `role="Raised by"` etc per `feedback_canonical_role_labels.md`. Full opacity. |
| 7 | **Resp-B** (secondary recipient) | `w-14` | Optional second person slot — `role="Due to"` for /todos (the recipient of the output), or a delegate. Renders at `opacity-70` to encode secondary-ness visually. |
| 8 | **Date** | `w-24` | Due date (or status date). Right-justified text. Goes through `formatDueDate` (per `reference_date_format.md`); color rules in caller. |
| 9 | **Team** | `w-20` | `<TeamChip>` (or Private lock icon if visibility=private). Last because team is the **least-additive column when the user has already scoped to one team** — for the most common view, every row repeats the same team, so putting it last preserves prime title-side real estate. |

The visual stripe (left side of the row, depth-keyed per entity) sits OUTSIDE this slot grid — it's row chrome, not a column. See `reference_stripe_system.md`.

## Resp-A vs Resp-B — opacity rule

When both responsibility slots are present:
- **Resp-A** renders at `opacity-100` (full) — this is the primary person on the hook.
- **Resp-B** renders at `opacity-70` — secondary recipient. The fade encodes "less weight" without using a different shape.

Both slots use `<UserAvatar size="sm">` (circle) for people, OR `<TeamChip size="sm">` (rounded-square) for teams. **Shape encodes type** — circle = person, rounded-square = team. The viewer disambiguates Resp-A from Resp-B by *position* and *opacity*, not by reshaping either chip (per `reference_status_pill_semantics.md` shape rule).

Example: /todos Resp-A = the Responsible person (full opacity, circle), Resp-B = the Due-to person or team (opacity-70, circle if person / rounded-square if team).

## Why team is last (the rationale that surprises people)

Intuition says "team is the primary scope, put it on the left." But:

1. The user has typically already scoped to one team via the H1 team picker. The visible list is already filtered. Repeating the team on every row is least-additive — the column basically says the same thing N times.
2. The columns that *vary per row* (title, owner, date) deserve the prime real estate. Team is a constant for most users most of the time.
3. When the user IS viewing "All teams," the team chip earns its spot — but even then, scanning the team column once per row is faster on the right than on the left, because the eye already established the row's identity via title + owner + date.

Codified 2026-05-12 after the /todos s60 polish settled on team-last and it tested well with Ricky + Kyle.

## Width tokens

The widths above are the canonical defaults for /todos. Other list pages can override per their content (e.g. /rocks uses a `w-24` priority slot inserted after state), but the slot ORDER must match.

Avatar column headers that label-text wider than 3 chars (e.g. "Assigned" — 8 chars) need `w-14` not `w-8`. Tracked in field-note D-entry "avatar column too narrow." See `reference_list_standards.md` Field shapes table.

## What this doc replaces

Pre-v0.4.0, list pages drifted across:
- /todos with `[bulk][title][owner][team][date]`
- /issues with `[bulk][state][title][team][date][owner]`
- /rocks with `[title][priority][owner][team][date]`

Each was independently sensible, none agreed. Cross-app navigation cost was real. v0.4.0 locks the order; cross-app sweep #774 retrofits.

## Reference impl pointers

- /todos row: `app/todos/page.tsx:1380+ (row container)` and `~1565+ (team slot)`.
- /todos column header: same file, `~1300+` for the matching header strip.
- `<RowStateCircle>` primitive: `components/RowStateCircle.tsx` — see `reference_shared_components.md`.
- `<UserAvatar>` + role: `reference_user_avatar.md`.
- `<TeamChip>` + shape lock: `reference_status_pill_semantics.md`.
- Date format: `reference_date_format.md`.

## Field-note pairing

Sweep target for cross-app sweep #774. Field-note D-entry "wrong row column order" added to `reference_canon_sweep_field_notes.md` in v0.4.0 — see that file for the grep recipe + smell test.

## See also

- `reference_list_standards.md` — overall list-page anatomy (Bands 1–4)
- `reference_drag_reorder.md` — drag handle ⠿ behavior
- `reference_shared_components.md` — `<RowStateCircle>` entry
- `reference_stripe_system.md` — left-side row stripe (not a column slot)
