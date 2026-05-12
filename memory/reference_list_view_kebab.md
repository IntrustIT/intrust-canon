---
name: List-page view kebab
description: Tier-1 canon. ⋮ kebab in list-page action cluster is the single home for view preferences (Layout, Group by) and view-scoped actions (Expand/Collapse all, Reset to defaults). Sections labeled, divider between prefs and actions.
type: reference
originSessionId: c0f59ffd-a7d2-4733-abb6-c624814b0956
---
# List-Page View Kebab — Canon

**Status:** Tier-1. Established 2026-05-11 (canon-master session, post-/todos polish).

## The rule

Every list page with view-shaping controls puts them in a single ⋮ kebab popover at the right end of the top action cluster. The kebab is the predictable home for:

- **View preferences** (sticky settings): Layout / density toggle, Group by control, any other "how this list is shaped" toggle.
- **View-scoped actions** (one-shot commands): Expand all, Collapse all, Reset to defaults.

Even if a list has only ONE of these (e.g. only "Reset to defaults"), the kebab is still its home. Predictability over minimalism.

**NOT in the kebab:** entity actions (Create, Bulk select, AI), filter chips (Band 2), search controls (search input + mode picker). Those have their own homes per `reference_list_standards.md`.

## Visual spec

Trigger: `<MoreVertical className="w-4 h-4" />` inside `<Popover align="right" width={200}>`.

Inside the popover, sections are vertically stacked with `space-y-3`:

```tsx
<div className="space-y-3">
  {/* PREFERENCES — labeled section per pref */}
  <div>
    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
      Layout
    </div>
    <div className="inline-flex rounded-lg bg-gray-100 p-0.5 w-full">
      {/* pill segmented control */}
    </div>
  </div>

  <div>
    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
      Group by
    </div>
    {/* pill segmented control */}
  </div>

  {/* ACTIONS — divider + labeled cluster */}
  <div className="pt-2 border-t border-gray-100">
    <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
      Actions
    </div>
    {groupBy !== "none" && (
      <div className="flex gap-2 mb-2">
        <button className="flex-1 …">Expand all</button>
        <button className="flex-1 …">Collapse all</button>
      </div>
    )}
    <button onClick={resetView} className="w-full text-left …">
      Reset to defaults
    </button>
  </div>
</div>
```

Section label style (locked, matches /issues Find-in popover):
`text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1`

Preference-to-actions divider (locked):
`pt-2 border-t border-gray-100`

Multi-pref popovers: each pref gets its own labeled section (no inter-pref divider — just the `space-y-3` gap). Actions section ALWAYS gets the `border-t` separator above it because it's a different *kind* of thing (commands vs settings).

## Two reset paths — by design

A list page can have BOTH:
- A **Band 2 "Reset" pill** (`<RotateCcw /> Reset`) — only visible when filter chips are off-default. Scope: filter chips only.
- A kebab **"Reset to defaults"** — always visible. Scope: filters + layout + group-by + any other view state.

Different scopes, not duplicates. Pill = "reset my filters." Kebab = "reset this entire view." If a list only has one scope of state, ship only the corresponding control.

## Canonical example

`app/todos/page.tsx` lines ~1062–1103 is the reference implementation.

Sibling list pages (/issues, /rocks, /headlines) don't yet have view kebabs because they don't have layout/group-by controls. When they get them (planned), they MUST use this pattern. If a list page adds a view preference, the kebab is required.

## Why this is canon

Without a fixed home, view-shaping controls scatter — some pages put group-by next to filters, some put layout in a footer toolbar, some inline it on the row. Users have to relearn each page. The ⋮ kebab is the universal "view options" affordance across consumer + enterprise products; codifying it removes one decision per list page and removes one discovery cost per user.

## See also

- `reference_list_standards.md` — overall list-page anatomy
- `reference_filter_toggle_convention.md` — Band 2 filter chip canon (the OTHER reset path)
- /issues Find-in popover (`app/issues/page.tsx:1265–1324`) — same section-label + `border-t` pattern in a different context
