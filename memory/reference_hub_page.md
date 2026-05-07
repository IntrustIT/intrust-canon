---
name: Hub page pattern
description: Tier-1 spec for pages that contain MULTIPLE list views or content tabs (e.g. /vto with Vision/Traction/SWOT/Year-End/Alignment, Playbook /content with Library/Review Queue/Import). Page-level H1 + subtitle sit ABOVE a tab bar; each tab's content begins with Band 1 elements (filters/state-tabs/column-headers) directly under the tab bar — NO nested H1 inside tab content. Tab style is canon and matches OS /vto.
type: reference
---

# Hub page canon (v0.3.3)

A "hub page" hosts multiple list views or content tabs under a single URL. Examples: OS `/vto` (Vision / Traction / SWOT / Year-End / Alignment), Playbook `/content` (Library / Review Queue / Import). The structure is fixed so users cross-navigate without learning a new shape per app.

```
┌──────────────────────────────────────────────────────────┐
│  Page H1 + subtitle  (the hub label, e.g. "Content")     │  ← Band 0 (page-level header)
├──────────────────────────────────────────────────────────┤
│  Tab bar  (Library | Review Queue | Import)              │  ← Hub tabs
├──────────────────────────────────────────────────────────┤
│  Active tab's Band 1 (filters / state-tabs / columns)    │  ← starts directly here
│  Active tab's row list                                   │
│  …                                                        │
└──────────────────────────────────────────────────────────┘
```

Reference impl: [`app/vto/page.tsx`](app/vto/page.tsx) — that's the canonical OS hub page.

---

## 1. Page header (Band 0)

A hub page's top-level header is **separate from any list-page Band 1 H1.** It identifies the hub itself, not the active tab's contents.

- **H1:** the hub name. Plain `text-2xl font-bold text-gray-900` (no entity stripe-mark — the hub isn't a single entity). Examples: "Content", "VTO", "Reports".
- **Subtitle (optional):** one sentence describing the hub. `text-sm text-gray-500 mt-1`. Examples: "Manage your documentation library." / "Vision, Traction, and Strategy."
- **No action cluster at this level.** Add buttons / AI buttons / kebabs all live inside the active tab's Band 1.

Don't repeat the hub H1 inside any tab's content. If the active tab needs its own title, that title goes in Band 1 of the tab — and it's the **entity-level** H1, not the hub H1. (Often there isn't one — the column-header strip + filter row makes the entity obvious.)

---

## 2. Tab bar

Sits between the page header and the active tab content. Style locked to the OS pattern (`/vto`):

```tsx
<div className="flex gap-1 mb-6 border-b border-gray-200">
  {tabs.map((tab) => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-[1px] ${
        activeTab === tab.key
          ? "border-[#0069AA] text-[#0069AA]"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
```

Locked details:
- **Container:** `flex gap-1 mb-6 border-b border-gray-200`. The `mb-6` separates tabs from tab content.
- **Tab button:** `px-5 py-2.5 text-sm font-medium`.
- **Active state:** `border-b-2 border-[#0069AA] text-[#0069AA]`. The `-mb-[1px]` overlaps the rail for a flush join.
- **Inactive state:** `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`. Hover preview shows the underline at gray-300.
- **Counts** (optional): tab labels can include an inline count using the canonical inline-span pattern (see `reference_list_standards.md` "Count chip"). Example: `<span>Review Queue <span className="text-gray-400 font-normal">12</span></span>`.

Brand-blue is the universal action color (per `reference_color_palette.md` action zone). Don't substitute the per-app accent here — tabs are an action surface, not identity.

---

## 3. Tab content begins with Band 1

Each tab's content area starts with **Band 1 (filters row)** directly under the tab bar. No additional title between the tab bar and Band 1.

The Band stack from `reference_list_standards.md` applies inside each tab unchanged:
1. Band 1 — title row (when present) + filters / find input + action cluster
2. Band 2 — state tabs with counts (when applicable)
3. Band 3 — column-header strip
4. Band 4 — row list

Most hub-tabs **omit the Band 1 H1** because the hub H1 already identifies the page. The action cluster (`+ Add → AI → kebab`) still appears in Band 1, just without an H1 next to it. If a tab has fundamentally different action affordances (e.g. an "Import" tab with no `+ Add` button), it still uses the Band 1 layout — just renders fewer buttons.

If a tab content is fundamentally NOT a list (e.g. a settings form, a dashboard widget), it doesn't need Bands 2–4 — just renders its own content under the tab bar.

---

## 4. Sticky behavior

The page header + tab bar are **NOT sticky** by default — they scroll out. The active tab's Band 1+2+3 IS sticky per `reference_list_standards.md` "sticky band wrapper" (`sticky top-12 z-30 bg-[#f7f8fa] -mx-8 px-8`).

Rationale: when the user scrolls the row list, they need filters and column headers reachable, but the hub-level label + tab nav can scroll out — the user already chose their tab.

If a hub uses non-list tabs (e.g. a dashboard tab), sticky behavior is per-tab discretion.

---

## 5. URL convention (recommended)

Hub tabs persist via URL hash or pathname segment, so deep links land on the right tab:

```
/content              → defaults to first tab (Library)
/content/review       → Review Queue tab
/content/import       → Import tab
```

OR via search param when each tab uses the same data fetch:

```
/content?tab=library
/content?tab=review
```

Pathname segments are preferred when each tab has meaningfully different data needs (separate page files); search params are fine when one page renders all tabs and just toggles content.

---

## 6. When NOT to use a hub page

If a page has only ONE list view, it's not a hub. Don't add a single tab "Library" above the list — that's noise. The hub pattern earns its keep at 2+ tabs.

If two related list views are conceptually distinct entities (e.g. /rocks and /milestones), they're separate pages with separate URLs — not tabs of one hub. Reserve hub tabs for views of the SAME entity (or related entities under one logical hub).

---

## 7. Wiring checklist

1. Page renders header (H1 + optional subtitle) at the top, no `mb-*` between H1 and subtitle beyond the natural `mt-1`.
2. Tab bar uses the locked `flex gap-1 mb-6 border-b border-gray-200` shell + the locked button styles.
3. Active tab's content starts with Band 1 directly — no nested H1 repeating the hub label.
4. Sticky wrapper applied to tab content's Band 1+2+3 per list-standards canon.
5. Tab persistence: URL pathname segment OR search param. Don't use only React state — refresh should land on the same tab.

---

## Why this is canon

Hub pages are the place users get most disoriented when patterns drift. A `Content` page with a duplicate inner H1 reading "Content" makes the user re-parse "where am I?" every tab switch. A consistent shape — page header → tabs → tab content — makes hub navigation muscle memory across every Intrust app.

Pair with:
- [`reference_list_standards.md`](reference_list_standards.md) — Band 1-4 spec applies inside each tab unchanged.
- [`reference_color_palette.md`](reference_color_palette.md) — tab active color is brand-blue (action zone), never the per-app accent.
