---
name: Primary-mode tabs
description: PILOT canon (v0.4.1). When a list-page entity has fundamentally distinct conceptual sub-types that users visit with different intent, split them into primary-mode tabs rendered between H1 and Band 1. Distinct from hub-page tabs (different content shapes) and from filter chips (single mental mode). Pilot: /issues Short-Term | Long-Term.
type: reference
---

# Primary-mode tabs

> **PILOT — v0.4.1.** This pattern is locked in canon based on /issues
> Short-Term / Long-Term split. Visual confirmation pending — when /issues
> ships the new layout and Ricky validates, strip the PILOT marker.

## When this pattern applies

Some list-page entities have two or more sub-types that share the same
**row template** and the same **filter set**, but users visit each
sub-type with **fundamentally different intent**. A user doesn't flip
casually between them; they pick one and work in it for a session.

Three diagnostic questions:

1. Same row template + same filters across sub-types? → not a hub page.
2. Different mental mode per sub-type (different intent, different time
   horizon, different stakeholder conversation)? → not just a filter.
3. Users commit to one sub-type for a session, rather than toggling
   often? → primary-mode tabs, not filter chips.

Yes/yes/yes → primary-mode tabs.

## Pilot — /issues

Issues split into:

- **Short-Term** — operational, reviewed weekly in L10. Bridges include
  stractical (high-impact short-term) which renders as a persistent
  section at the top of the Short-Term tab — see
  `reference_persistent_section_grouping.md`.
- **Long-Term** — strategic, reviewed quarterly / annually.

Same row template (`reference_list_row_column_order.md`), same filter
set, same Band 2 chrome. The tabs split the user's mental mode, not the
data shape.

## Visual + layout spec

Tabs render between the H1 row and Band 1 (action cluster):

```
[stripe] Issues — Leadership Team ▾                  [+ Add] [✨ Detect Patterns]
─────────────────────────────────────────────────────────────────────
  Short-Term     Long-Term
─────────────────────────────────────────────────────────────────────
[Band 2 filters]
[Band 4 column headers]
[list]
```

Tab bar style — locked, matches `reference_hub_page.md` tab style but
in a different layout position:

```tsx
<div className="flex gap-1 mb-6 border-b border-gray-200">
  {tabs.map((t) => (
    <button
      className={cn(
        "px-3 py-2 text-sm font-medium border-b-2 -mb-[1px]",
        active === t.id
          ? "border-[#0069AA] text-[#0069AA]"
          : "border-transparent text-gray-500 hover:text-gray-700"
      )}
    >
      {t.label}
    </button>
  ))}
</div>
```

The tab bar:
- Sticky to viewport top alongside Band 2 (the user doesn't lose tab
  context when scrolled deep into a long list)
- Persisted in the URL (`?tab=short-term` or path segment per page)
- Bookmark-stable — opening a tab URL lands the user in that mode

## Distinct from hub-page tabs

| Property | Hub-page tabs | Primary-mode tabs |
|---|---|---|
| Content shape per tab | Different (each tab is its own page body) | Same (row template + filters identical) |
| Where in layout | Above H1 + subtitle (Band 0) | Between H1 row and Band 1 |
| Typical example | /vto Vision / Traction / SWOT | /issues Short-Term / Long-Term |
| User intent | Navigate to a different kind of page | Switch primary mental mode within a page |

Don't confuse the two. If each tab needs different columns / different
filters / different chrome → hub page. If only the data subset changes
→ primary-mode tabs.

## Distinct from filter chips

A "Type" filter chip toggles which items show. Cheap to flip on/off.
The user's mental mode doesn't shift.

Primary-mode tabs encode a real context shift — "I'm doing operational
review now" vs "I'm doing strategic planning now." Users settle into one
mode for a session. Tabs deserve sticky, prominent placement; filter
chips don't.

Test: if removing the tab and converting it to a Band-2 filter would
feel like demoting the concept, you have a primary mode, not a filter.

## Filter behavior across tabs

Each tab is its own context. **Filters apply within the active tab.**
Switching tabs doesn't carry filter state across.

URL example:
```
/issues?tab=short-term&q=client&raisedBy=bob
```

Switching to Long-Term clears the query/filters by design. Each tab is
a clean entry into its mental mode.

(If a page's primary modes genuinely share filter state — i.e. the user
expects to switch tabs and keep their narrowed view — that's an
indicator the modes are actually just filters. Re-evaluate the tab
framing.)

## Search-mode scope across tabs (v0.4.2)

The search modes (per `reference_search_chrome.md`) follow a scope
ladder that extends across tabs:

| Mode | Scope across tabs |
|---|---|
| Current Filters (`filter`) | Active tab only |
| All (`deep`) | All same-class primary-mode tabs |
| By meaning (`fuzzy`) | All same-class primary-mode tabs |

Why: the active tab is the user's stated context, but classification
between primary modes can be fuzzy (Short-Term vs Long-Term issues
have a judgement-call gray zone). When the user escalates to broader
search modes, they expect to find matches regardless of tab. The
narrowest mode (Current Filters) still honors the active tab; the
broader modes (All + By meaning) escape it.

Cross-tab results render an inline tab badge (`Long-Term`, etc.) on
the row so the user knows which tab the match lives in. Active-tab
results render no badge.

See `reference_search_chrome.md` §6b for the rendering spec.

## Sort + group-by across tabs

Each tab keeps its own sort + group-by preference, persisted to
sessionStorage keyed by `{page}.{tab}.view`. Switching tabs restores
that tab's last view.

## Tab order

Tabs render in the order they appear in the meeting runner or canonical
workflow. For /issues: `Short-Term | Long-Term` because L10 reviews
operational before strategic. For /headlines (when split — future
canon): `Wins | FYIs` per the runner's order.

The tab order encodes the canonical workflow — don't sort alphabetically.

## Off-canon

- Hiding a primary mode behind a kebab item ("View > Long-Term issues").
  If the mode earns a tab, give it a tab. Burying it loses the
  visibility argument that makes tabs canonical in the first place.
- Mixing primary-mode tabs with hub-page tabs on the same page. If you
  need both, the hub page subdivides into tabs that each contain
  primary-mode tabs internally (rare; surface as canon-extension
  question first).
- Treating primary-mode tabs as filters that can stack. They're
  mutually exclusive — exactly one is active at a time.

## See also

- `reference_hub_page.md` — different content shapes per tab (don't confuse)
- `reference_list_standards.md` — Band 1 / Band 2 anatomy
- `reference_persistent_section_grouping.md` — Stractical at top of Short-Term tab
- `feedback_meeting_runner_consistency.md` — outside-meeting must mirror inside-meeting
