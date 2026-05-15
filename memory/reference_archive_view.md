---
name: Archive view — list page rendering when Archive switch is ON
description: When the Band 2 Archive switch flips ON, the list page enters archive mode. Flat list by default (no grouping), opacity-45 row fade, Year+Quarter combined column ("2026-Q2"), Year + Quarter Group-by options surface. Established v0.5.0 (consolidates v0.4.5 archive-fade clarification + /rocks sweep findings).
type: reference
---

# Archive view

## When it activates

The Band 2 **Archive switch ON** flips the list into archive view.
This is a distinct visual + behavioral mode, not just a filter
inversion. The user has *committed* to looking at the archive
(intentional flip), and the page reshapes accordingly.

Archive view is bounded to the list page that toggled it. Other
pages (dashboard, search results, etc.) follow their own archive
rules — this canon is list-page-specific.

## Visual contract

### 1. Whole-view opacity fade — `opacity-45`

Every row in archive view renders at `opacity-45`. The fade is
applied to the row container (stripe + title + indicators +
avatars — everything). This signals "you are in the archive — these
items are not live."

The fade is **NOT** per-row. It applies uniformly when Archive is ON.
Per `reference_search_chrome.md` §7 (v0.4.5): archived rows inside
All / By-meaning search modes do NOT fade — only Archive-switch-ON
mode triggers the fade.

### 2. Default layout — flat list, no grouping

When the user flips INTO archive view, the page resets group-by to
`none` regardless of the user's prior selection. Archives are
retrospective; grouping by current Owner / Status / Priority etc.
is rarely useful.

The user can opt-in to Year / Quarter grouping (see #3 below). All
other Group-by options remain available in the kebab but suppress
themselves when they'd yield meaningless buckets per
`reference_list_view_kebab.md` v0.4.12 + Headlines #8.

### 3. Year + Quarter combined column

Archive view adds (or surfaces) a **Year + Quarter** column rendered
as `2026-Q2` (year-dash-Q-quarter). Position: per the page's slot
order, typically right of the date column or replacing the date
column if dates are noise in archived state.

The column displays the entity's `archivedAt` quarter (or
`completedAt` for completion-archived entities — page-specific
mapping).

### 4. Year + Quarter Group-by options

Archive view's kebab Group-by gains **two new options**:
- **Year** — buckets by archive year (`2024`, `2025`, `2026`)
- **Year + Quarter** — buckets by year-quarter (`2026-Q1`,
  `2026-Q2`, ...)

These are the most natural lenses for archive review. Sorted reverse-
chronological by default (newest archive period first).

When the Archive switch is OFF, these two Group-by options
suppress themselves from the chip row (no archive context, no
year-quarter dimension).

### 5. Suppress "cancelled-status inner-wrapper dim"

Some pages render cancelled-status entities with a dimmed inner
wrapper to distinguish them in-line. In archive view, that dimming
is **suppressed** — the whole row is already at `opacity-45` from
the view-level fade, and adding inner-dim on top double-fades and
makes the row nearly invisible.

Rule: when `archived === true` AND the row would otherwise apply a
cancelled-status inner dim, skip the inner-dim. The outer fade
carries the signal.

## Behavior contract

- **Search modes** behave normally inside archive view (all three:
  Current Filters / All / By meaning). All / By-meaning still
  broaden across archive + non-archive corpora globally; the Archive
  switch only narrows the *base view*, not the search ceiling.
- **Bulk actions** in archive view: limited to Unarchive and Delete
  (per the trust contract in `reference_archived_read_only.md` —
  archived items cannot be field-edited). Don't surface Edit /
  Reassign / Resolve bulk affordances in archive view.
- **Row click** opens the entity in its read-only state (Archive
  banner per `reference_archived_read_only.md`).

## Off-canon

- Letting the Archive switch flip without resetting Group-by. The
  user's prior live-view grouping rarely makes sense in archive
  view.
- Adding archive-specific colors (red, gray heavy fill, etc.) on
  top of the `opacity-45` fade. The fade IS the signal; adding more
  chrome is double-encoding.
- Hiding the Archive switch entirely on pages that have archivable
  entities. The switch is always inline in Band 2 per
  `reference_list_standards.md` v0.4.1 — non-empty archive or empty,
  the switch is always available.
- Sorting archive view by anything other than `archivedAt` desc by
  default. Users come to the archive to review recent history; old
  records sort to the bottom.

## Pilot

`/rocks` v0.5.0 (s64 sweep) — first surface implementing the full
archive view contract. Year + Quarter column, Year / Year+Quarter
Group-by options, flat-list reset on switch-flip, cancelled-dim
suppression.

## Sweep targets

Any list page with archive-capable entities:
- `/issues` — already has Archive switch (per v0.4.0 canon); needs
  audit for whole-view fade behavior + Year/Quarter Group-by
- `/todos` — same audit
- `/headlines` — same audit
- `/meetings`, `/scorecard` — verify archive switch presence + view
  behavior
- `/ggob` — N/A (financial plans aren't archived the same way)

## See also

- `reference_archived_read_only.md` — editor-level read-only contract
  (paired canon)
- `reference_search_chrome.md` §7 — opacity-fade is Archive-switch-
  triggered, NOT per-result inside All/Meaning search modes
- `reference_filter_toggle_convention.md` — Archive switch shape +
  Class A label "Archive"
- `reference_list_view_kebab.md` — Group-by chip suppression for
  Year/Quarter when off-archive
