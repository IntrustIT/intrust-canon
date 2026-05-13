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
| 4 | **TITLE (flex-1)** | grow | The row's primary content. Grows to fill available width. Block structure inside the title slot (v0.4.4): **(1) Parent-link breadcrumb** above the title — `text-xs text-[#0069AA]` blue text, hierarchical with chevron-separator for parent→child (rock › milestone) or dot-separator for peer-links (rock 1 · rock 2 · goal). **(2) Title** itself — `text-sm font-medium`, click → open editor. **(3) Description/notes** preview wrapped below, one line truncated. See "Parent-link rendering" section below for full spec. |
| 5 | **Indicators** | auto | Sit *after* the title because they're meta about the title, not separate columns. Two flavors with different chrome rules (v0.4.4):<br>**Icon-counted** (count is the data, icon is the label): `🔗 3`, `💬 5`, `↗ 2`. NO pill chrome — bare icon + number.<br>**Textual** (text is the label): Need pill, source tag, Lead/Lag, tab badge. Standard `text-[10px] px-1.5 py-0.5 rounded[-full] bg-{neutral\|hued}` pill chrome. Per `reference_status_pill_semantics.md`. |
| 6 | **Resp-A** (primary responsibility) | `w-14` | Who's on the hook — typically `<UserAvatar role="Responsible" \| "Raised by" \| ...>` for a person, OR `<TeamChip>` when a whole team carries primary responsibility. Full opacity. Per `feedback_canonical_role_labels.md` for the role label. |
| 7 | **Resp-B** (secondary recipient / delegate) | `w-14` | Optional second slot — typically `role="Due to"` for /todos (the recipient of the output), a delegate, or a secondary team. Renders at `opacity-70` to encode secondary-ness visually. Person OR team — both shapes valid. |
| 8 | **Date** | `w-24` | Due date (or status date). Right-justified text. Goes through `formatDueDate` (per `reference_date_format.md`); color rules in caller. |
| 9 | **Team** | `w-20` | `<TeamChip>` (or Private lock icon if visibility=private). Last because team is the **least-additive column when the user has already scoped to one team** — for the most common view, every row repeats the same team, so putting it last preserves prime title-side real estate. |

The visual stripe (left side of the row, depth-keyed per entity) sits OUTSIDE this slot grid — it's row chrome, not a column. See `reference_stripe_system.md`.

## Parent-link rendering (v0.4.4) — blue text above title, never a column pill

When a row has a parent or linked-context relationship that's worth surfacing on the row (rock parent of a todo; rock+milestone hierarchy; rock or vto-goal that makes an issue stractical; etc.), render the link as **blue breadcrumb text above the title** — NOT as a pill in a separate column.

**Locked shape:**

```tsx
<div className="mb-0.5">
  <Tooltip text="...">
    <span className="inline-flex items-center gap-1 text-xs text-[#0069AA]">
      {/* segments — see below */}
    </span>
  </Tooltip>
</div>
<span className="text-sm font-medium text-gray-800">
  {title}
</span>
```

**Segment rules:**

- **Hierarchical parents** (the link IS a parent-of relationship): segments separated by chevron `<ChevronRight className="w-3 h-3 text-gray-400" />`. Example: `Rock Title › Milestone Title` for a todo linked to a rock + milestone.
- **Peer links** (multiple non-hierarchical links to siblings — e.g. an issue linked to 2 rocks): segments separated by `·` middle-dot in `text-gray-400`. Example: `Rock 1 · Rock 2 · Goal X`.
- **Mixed** (parent-child plus a peer): chevron for the parent chain, dot for additional peers. Surface as `Rock › Milestone · Other Rock` if it happens (rare).
- **Truncate long titles** at ~28 chars per segment (or apply CSS truncation on the segment span).

**Color: brand-blue `text-[#0069AA]` always.** The blue tells the user "these are links" without further chrome. No background, no border, no pill.

**Tooltip wrapper** on the whole breadcrumb block: shows the full unabbreviated relationship text (e.g. `Rock: Long Rock Name · Milestone: Long Milestone Name`).

**Click target:** the whole breadcrumb is clickable as a single link to the parent entity. For multi-segment hierarchies, the deepest segment is the primary target (clicking opens the milestone editor, not the rock). For peer links with multiple items, decide per-page whether the breadcrumb opens the first peer or surfaces a popover with all peers.

### Why not a pill in its own column

Earlier /issues drift rendered strategic targets as colored pills (`bg-blue-100 text-blue-700` / `bg-indigo-100 text-indigo-700`) inside a dedicated STRACTICAL column. Off-canon as of v0.4.4 — replaced with the title-area blue breadcrumb. Reasons:

- The link IS context for the title. Putting it 100px to the right separates context from content.
- Pills compete visually with other indicators (status pills, type pills) and create chrome noise.
- The breadcrumb idiom is well-established (file paths, browser nav) — users recognize blue text as "links to elsewhere."
- Removes a column from the row, which is always a win.

### Parent-type inheritance signal (v0.4.7) — glyph inline in the breadcrumb

When a child row's parent-link points to a parent that carries a
canonical **type-glyph** (per `reference_icon_vocabulary.md` +
`reference_issue_type_spectrum.md`), the breadcrumb renders that
glyph inline ahead of the parent title:

```
⚡ Contract renewal negotiation ›
```

The glyph signals "the parent is type X" at a glance without
re-classifying the child. Per `feedback_types_live_on_containers.md`,
types live on containers; children inherit strategic weight through
the breadcrumb relationship, not via their own type field.

**Glyph set (v0.4.8 — strategic-parent-only rule):**

The glyph appears ONLY when the parent is an entity that the
organization has *committed to caring about strategically*. Strategic
commitment is the line: rocks (committed strategic execution) and
stractical issues (operations-to-strategy bridge) earn the glyph.
Discussion items, retrospective items, and routine operations do not.

| Parent entity type | Glyph | Why included / excluded |
|---|---|---|
| Rock | 🪨 | Committed strategic execution. |
| Issue: Stractical | ⚡ | Explicit bridge from operations to strategy. |
| Milestone | (none — inherits rock by chain position) | Breadcrumb renders as `🪨 Rock Name › Milestone Name ›` — glyph attaches to the rock segment, not the milestone. |
| Issue: Long-Term | none | Discussion items about the bigger picture, not committed strategy. May *become* a rock; until then, no glyph. |
| Issue: Short-Term | none | Routine operations. |
| Headline (Win / FYI) | none | Retrospective / informational. |
| Todo (as parent, rare) | none | Atomic action; no weight to propagate. |

When a child's parent doesn't appear in the glyph-included rows, the
breadcrumb still renders (blue link text + chevron), just without a
leading glyph.

**Locked rendering inside the breadcrumb span:**

```tsx
<span className="inline-flex items-center gap-1 text-xs text-[#0069AA]">
  <span aria-hidden>{parentTypeGlyph}</span>
  <span className="truncate">{parentTitle}</span>
  <ChevronRight className="w-3 h-3 text-gray-400" />
</span>
```

The glyph stays in blue text color (no color override) — it's read
as part of the link, not a separate badge. Glyphs are emoji per
`reference_icon_vocabulary.md`; tooltips on the breadcrumb already
explain the relationship ("Stractical Issue: …").

**Why no column for parent type:**

Parent-type isn't sort/compare data — it's *relationship context*.
Putting it in a column would double-encode the breadcrumb. If users
want to cluster atomic actions by parent type ("all my Stractical-
anchored todos together"), that's a **Group-by option in the ⋮ view
kebab**, not a column.

### When the link is the basis for a derived flag (e.g. /issues "stractical")

For /issues specifically, the row's own type-stripe (striped pattern
for Stractical per `reference_issue_type_spectrum.md`) already encodes
the issue's type — the breadcrumb on an issue row points to *the
issue's parent rock/goal*, not back to itself. The ⚡ glyph in the
breadcrumb only appears on child rows where the parent IS a Stractical
issue (per the inheritance rule above). Don't render the parent-link
twice — once is enough.

Example /issues row block structure (v0.4.4):

```
[bulk] [drag] [state ○]   ┌─ ⚡   ─┐  [Need] [Resp-A] [age] [team]
                          │      │
                          │  Rock Title · Goal Title             ← blue breadcrumb above title
                          │  Issue title goes here               ← title
                          │  notes preview...                    ← optional
                          └──────┘
```

⚡ glyph indicator slot stays. STRACTICAL column-with-pills retires. Linked rocks/goals move into the title slot as blue text.

### When the row has no parent-link

The breadcrumb block doesn't render. The title sits at the top of its slot. No empty placeholder, no `mb-0.5` left dangling.

## Resp-A vs Resp-B — opacity rule

When both responsibility slots are present:
- **Resp-A** renders at `opacity-100` (full) — the primary on the hook.
- **Resp-B** renders at `opacity-70` — secondary recipient or delegate. The fade encodes "less weight" without reshaping the chip.

Both slots accept **person OR team**: `<UserAvatar size="sm">` (circle, 24px) for people, `<TeamChip size="sm">` (rounded-square, 24px) for teams. **Shape encodes type** — circle = person, rounded-square = team. The viewer disambiguates Resp-A from Resp-B by *position* + *opacity*; person-vs-team is read from *shape*. Neither axis gets confused for the other.

Note on relative sizing: `<TeamChip>` in row cells is intentionally a touch larger than `<UserAvatar>` despite the same `size="sm"` declaration — the team chip carries a glyph badge and the size delta is part of the visual language (per `reference_status_pill_semantics.md` Size canon section). Don't override either to force equality.

Common pairings:
- /todos default: Resp-A = Responsible **person** (circle, full), Resp-B = Due-to **person** (circle, opacity-70).
- /todos team-delivers: Resp-A = Responsible person (circle, full), Resp-B = Due-to **team** (rounded-square, opacity-70).
- Team-as-primary (e.g. an entity where a whole team carries the work, not an individual): Resp-A = **team** (rounded-square, full), Resp-B = person carrying the recipient role (circle, opacity-70) — or omitted.
- Single-person, no recipient: Resp-A = person (circle, full), Resp-B = empty.

Shape never flips per position. A team in Resp-A still renders rounded-square; a person in Resp-B still renders circle. The four combinations cover every responsibility pairing without inventing a third shape.

## Why team is last (the rationale that surprises people)

Intuition says "team is the primary scope, put it on the left." But:

1. The user has typically already scoped to one team via the H1 team picker. The visible list is already filtered. Repeating the team on every row is least-additive — the column basically says the same thing N times.
2. The columns that *vary per row* (title, owner, date) deserve the prime real estate. Team is a constant for most users most of the time.
3. When the user IS viewing "All teams," the team chip earns its spot — but even then, scanning the team column once per row is faster on the right than on the left, because the eye already established the row's identity via title + owner + date.

Codified 2026-05-12 after the /todos s60 polish settled on team-last and it tested well with Ricky + Kyle.

## Per-entity exceptions (slot-set varies, slot order doesn't)

Some entities legitimately omit slots that don't apply. The relative
order of slots that DO render must always match the canonical grid.

### /issues exception (v0.4.1)

Issues have no due-date and no Resp-B slot. Status is intentionally
removed from the row entirely (per `reference_status_pill_semantics.md`
Issue binary-status section — the RowStateCircle is the only
user-facing toggle).

Tail order for issue rows:
```
[bulk][drag][state ○ via RowStateCircle][TITLE][indicators][stractical glyph][need][resp-A=Raised by][created/age][team]
```

- The state circle is the open/resolved toggle (no status pill).
- The stractical glyph (⚡) marks issues that bridge operational +
  strategic. Surfaced as a row indicator. On /issues, Stractical is
  also default-grouped via the ⋮ view kebab Group-by = Type — see
  `reference_issue_type_spectrum.md`.
- "Need" is the issue's intent-bucket (raised vs identified vs
  routed) — small pill in the indicators slot.
- Created/age uses `formatEventDate` (per field-notes D9b), NOT
  `formatDueDate` — issues are tracked by creation age, not due date.

Reference impl: `app/issues/page.tsx` (post-v0.4.1 retrofit).

## Compact-density variant (v0.4.1)

When a list page offers a Compact view (Layout: List / Compact in the
view kebab), the Compact variant renders the SAME canonical slot order
as the List view — just single-line with tighter chrome:

- `py-1.5` instead of `py-3` (tighter vertical padding)
- No description-preview line below the title
- Indicators slot still renders, but non-essential sub-pills MAY
  collapse to a single summary glyph (e.g. multiple linked-target
  chips → one `🔗 3` count + glyph)
- All sort and filter logic unchanged — Compact is a pure visual mode

The slot grid is preserved; the CONTENT inside slots may degrade
gracefully. Don't reshuffle slot order in Compact — it must remain
muscle-memory consistent with List.

Reference impl: `app/issues/page.tsx` (Compact rewrite, post-v0.4.1).

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
