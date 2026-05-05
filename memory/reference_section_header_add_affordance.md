---
name: Section-header inline add-affordance
description: Canonical shape for the "+" button that lets a user add an item to a section inside an editor or panel. Always a gray pill button right-aligned next to the section label. Read this before adding a new section that has a corresponding "add" action.
type: reference
originSessionId: c9b17cee-f5ec-4aac-9894-14aeaf8a54b7
---
# Section-header inline add-affordance

When a section inside a slide-over editor or panel has an "add another thing here" action (e.g. "add an attachment", "link to another item", "create a new sub-row"), the affordance is **always**:

- A **gray pill button**, right-aligned in the section header
- Same exact className across every instance:
  ```
  text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium flex-shrink-0
  ```
- Header layout: `<div className="flex items-center justify-between mb-1.5">` with `<label>` on left, button on right
- Label format: **`+ <Verb>`** — short, imperative. Examples: `+ Add`, `+ Link`, `+ Goal`, `+ Milestone`

Established 2026-05-07 (session 47, #746) at Ricky's call after he flagged that LinkedItemsSection's button looked like a hyperlink instead of a clickable affordance.

## Canonical examples

- `components/FileAttachments.tsx` — `+ Add` (URL attachment to this entity)
- `components/LinkedItemsSection.tsx` — `+ Link` (cross-entity link to another OS row)

When the button toggles a picker open/closed, the SAME button switches its label to **`Cancel`** (or another short close verb) while in the open state. Keep all other classNames identical — only the text changes.

## Why this shape, not the alternatives

- **Not a text-link** (e.g. `text-[#0069AA] hover:text-[#004C7A]`). Reads as static label text or footnote, not as a clickable thing. Users miss it.
- **Not a colored CTA** (e.g. `bg-[#0069AA] text-white`). Too heavy for a section-header micro-affordance — competes with the primary "Save & Close" CTA in the editor footer.
- **Not an icon-only** (e.g. just a `+`). Forces a tooltip dependency for discoverability and reads as decorative on small screens.
- **Not a chip with full bg color** (e.g. emerald/orange). Burns a semantic color slot that should be reserved for entity types or status.

The neutral gray pill is the visual midpoint: clearly clickable, low-weight, no semantic competition.

## What NOT to do

- Don't reach for `<Popover>` for a simple toggle-form (use it for menus with multiple options instead).
- Don't introduce per-section color variants of this button.
- Don't use this pattern outside section headers (e.g. for primary CTAs in toolbars — those have their own canon: bordered white pill via `Popover` or accent-blue button).
- Don't add an icon next to the `+` glyph; the `+` IS the icon.
- Don't change the className without updating this doc and sweeping every consumer in the same commit.

## Surfaces that follow this canon

(Update this list as new instances ship.)

1. `components/FileAttachments.tsx:98-103` — `+ Add` URL attachment
2. `components/LinkedItemsSection.tsx:193-199` — `+ Link` / `Cancel` cross-entity link

## Distinguish from list-page Row-1 `+ Add <Entity>` CTA (C-CC-7)

There are TWO `+ Add` flavors in the app — they live in non-overlapping surfaces and **must not be confused**:

| Surface | Visual | Purpose | Example |
|---|---|---|---|
| **List-page Row-1 CTA** | Brand-blue heavy button (`bg-[#0069AA] text-white px-4 py-2 rounded-lg text-sm font-medium`) | Create a NEW top-level entity for this list | `+ Add Issue` on `/issues`, `+ Add To-Do` on `/todos`, `+ Add Measurable` on `/scorecard` |
| **Section-header inline pill** (this doc) | Gray pill (`text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium flex-shrink-0`) | Add a sub-row inside an open editor section | `+ Add` URL in FileAttachments, `+ Link` in LinkedItemsSection |

Quick test for which to use:
- Are you opening a slide-over to create a fresh entity? → Row-1 brand-blue CTA, lives in `reference_list_standards.md`.
- Are you appending a row inside an already-open editor section? → Gray pill, lives here.

Don't render the brand-blue CTA inside an editor section header — it overpowers the form's own Save & Close primary action. Don't render the gray pill on a list-page Row 1 — it doesn't read as "create a new entity," users will miss it.

## Related canon

- `reference_filter_toggle_convention.md` — switch shape (different role, same "single-component canon" philosophy)
- `reference_shared_components.md` — full primitives roster
