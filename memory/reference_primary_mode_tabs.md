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
  stractical (high-impact short-term) which surfaces via default
  Group-by = Type on the Short-Term tab (Stractical bucket first).
  See `reference_issue_type_spectrum.md` + `reference_list_view_kebab.md`.
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

## Per-tab Archive switch semantics (v0.5.0 PILOT)

> **PILOT — v0.5.0.** Pattern from /headlines News vs Published tabs. When a second entity adopts (e.g. /issues Short-Term vs Long-Term archive paths), strip the marker.

The Band 2 Archive switch is a **single UI surface** with consistent label and shape, but its **underlying filter axis can vary per tab** when an entity has multiple "archive" axes:

| Tab | What "archive" means |
|---|---|
| /headlines News | `archive` = per-team acknowledged (this team marked it processed) |
| /headlines Published | `archive` = per-headline `originatorArchived` (author archived their own) |

The switch label stays **"Archive"** (single source of truth — the user shouldn't have to memorize different labels per tab). The semantics derive from the active tab.

Generalizes to any list with primary-mode tabs covering distinct lifecycle states where each state has its own natural archive axis. For example, /issues Short-Term and Long-Term might want different archive axes if their resolution paths diverge.

**Rule:** the switch UI stays unified; the filter mapping is tab-aware in the page's state-to-query layer. The user thinks "Archive on/off"; the page knows which axis to bind it to in the current tab.

### When NOT to vary per tab

If both tabs have the same archive axis (just a regular `archived: true/false` flag on the entity), don't introduce per-tab variance — it's overhead with no payoff. The pattern earns its complexity only when the tabs genuinely have different archive semantics.

## All-teams mode → forced group-by-team layout (v0.5.0 PILOT)

> **PILOT — v0.5.0.** Pattern from /headlines all-teams view. Likely applies to /rocks and other team-scoped list pages. Strip when a second entity adopts.

When the H1 team picker is set to **"All teams"** on a list page with primary-mode tabs that have **per-team mental models** (News/Published, etc.), the page enters a cross-team perspective. Single-team-perspective UI doesn't fit; the page forces a grouped layout instead.

### Rules

- **Forced group-by-target-team in News-equivalent tabs.** Each team becomes its own collapsible bucket. The Group-by selector in the ⋮ kebab is **hidden** for the duration of all-teams mode — the user can't pick a different grouping because the page's only sensible cross-team view IS grouped-by-team.
- **Direction picker hidden** (if the page had one for single-team mode — e.g. an in/out scope). Doesn't apply across all teams.
- **Single-team-perspective filters relax to per-bucket equivalents.** A filter that was "acknowledged by my team" in single-team mode becomes "acknowledged by EACH bucket's team" within each section. Filter intent preserved per bucket.
- **Switching back to a single team** restores the user's prior Group-by, filter values, and direction picker for that tab.

### Why this works

News/Published on /headlines are per-team mental models — "did MY team process this?" doesn't have a coherent meaning across the org. Grouping by team turns the org-wide view into N parallel per-team views, preserving the mental model inside each bucket.

### When to use

Any list page where:
1. There are primary-mode tabs whose semantics are team-scoped
2. The H1 team picker offers an "All teams" option (most do)
3. Cross-team viewing without grouping would mix data the user can't usefully read together

### When NOT to use

- Pages whose tab semantics are NOT team-scoped (/issues primary-mode tabs are about time horizon, not team — all-teams view doesn't need forced grouping).
- Pages without "All teams" option (rare; most list pages have it via leadership-team override).
- Pages with no primary-mode tabs — the all-teams forced layout only fires when there's also tab-mode complexity to flatten.

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
- `feedback_meeting_runner_consistency.md` — outside-meeting must mirror inside-meeting
