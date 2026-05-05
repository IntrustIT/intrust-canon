---
name: Empty + loading + skeleton state canon
description: Canonical empty-state, loading, and skeleton patterns. Read before adding any "no X yet" message, spinner, or shimmer block. Codified session 49 after audit found 50+ empty-state variants and 35+ spinners across the app.
type: reference
originSessionId: 05d84427-e41f-44b7-ae64-bcd27515f83b
---
# Empty + loading + skeleton state canon

Codified session 49 after a B7 audit catalogued **50+ unique empty-state variants** and **35+ spinner instances** across `/app` and `/components`. Most of the variation was harmless drift (color, padding, copy phrasing) but consumers had no rule to point at, so each new surface invented its own.

## Empty state

**The shape:** italic-or-plain gray text, centered, no border. Single sentence. Optional inline CTA only when there is a clear next step.

```tsx
<div className="text-gray-400 text-center py-16">
  No issues yet.
</div>
```

### Voice

- **"No X yet."** — fresh user, no records ever existed (28+ existing uses, the dominant voice). Always end in a period.
- **"No matching X."** — filters or search are narrowing the result; flip the message away from "yet" so the user knows their filters are the cause.
- **"No X for {scope}."** — scope-specific empty (e.g. `No 1-year goals found for 2026.`).

Don't say "No X here" — it reads as terse and surface-agnostic. Prefer "No X yet." or the scope variant. (Three pages still use "No X here" — sweep when next touched.)

### Color + padding

| Surface | Padding | Color |
|---|---|---|
| **Page-level** (full list page empty) | `py-16` | `text-gray-400` |
| **Section** (a `<section>` or sub-bucket inside a page) | `py-12` | `text-gray-400` |
| **Inline** (drawer body, comment thread, sub-list) | `py-8` | `text-gray-400` |
| **Compact** (popover body, search-result dropdown) | `py-4` | `text-gray-400` |

Color is **always `text-gray-400`** — period. A handful of pages drifted to `text-gray-500`; sweep when next touched. Don't introduce new gray shades for emphasis.

### Optional CTA

Only when the next step is obvious AND clicking it from the empty state is genuinely faster than scrolling up to the page's `+ Add X` button. Examples that earn a CTA:

- `No headlines yet. Click "+ Add Headline" to start.` — directs new users to the canonical create button.
- `No detail items yet. Use the financial document drop zone to populate, or add items during HIP planning.` — surfaces a non-obvious flow.

When a CTA goes inline, render as plain prose (not a button) — it's a hint, not the canonical action surface. Real "+ Add X" buttons live in Band 1, never inside the empty state.

### Dashed-border placeholder cards

A separate pattern for "this card *exists* but its content isn't filled in yet." Distinct from "no records exist."

```tsx
<div className="border border-dashed border-gray-200 rounded-lg py-6 text-center text-xs text-gray-400">
  No assumptions set yet.
</div>
```

Use cases: per-line GGOB detail rows, settings sections that are wired but unconfigured, HIP plan slots awaiting input. The dashed border communicates "this slot is real and waiting on you" — distinct from a flat "no records" message that says "this list is empty."

`border-gray-200` for informational empty cards; `border-gray-300` only for **interactive drop zones** (DocumentImport drag-target, directory CSV upload). The thicker border + hover state distinguishes it as clickable.

## Loading state

Three flavors — pick by latency expectation, not by personal preference.

### Inline `Loading...` text

For waits expected to complete in <500ms. Cheap, no chrome.

```tsx
<div className="text-gray-500 py-16 text-center">Loading...</div>
```

Padding follows the same scale as empty states (`py-16` page, `py-12` section, `py-8` inline). Color is `text-gray-500` (slightly darker than empty's `text-gray-400` — communicates "actively working" vs "nothing here").

**Don't** combine inline `Loading...` text with a spinner — pick one or the other. If the wait is long enough to warrant a spinner, use the spinner; if it's short, the text alone suffices.

### Spinner — for actions you triggered

A spinner is the right primitive when a user **just clicked something** and is waiting on an async result that takes >500ms. It anchors visually to the trigger (button label, search input edge).

**Color rules — the brand split:**

| Flow | Spinner color | Rationale |
|---|---|---|
| **Primary / data load** | `text-[#0069AA]` (brand blue) | The default for any non-AI async work. ~14 instances today. |
| **AI / semantic** | `text-[#F58326]` (brand orange) | Every AI flow today uses orange — patterns detection, "Find by meaning" search, ask-Rickety, AI summary, AI extraction. **6 existing AI-search inputs** are 100% consistent. The orange is a "thinking" signal that's distinct from generic loading. **Never use blue for an AI flow.** |
| **Section async (legacy)** | `border-blue-500` generic | 8 meeting detail sections still use generic Tailwind blue. Sweep to `text-[#0069AA]` when next touched — visual difference is small but the brand-token discipline matters. |

The canonical spinner SVG (use this exact shape — don't roll a different one):

```tsx
<svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
</svg>
```

`currentColor` means the parent's `text-*` class drives the color. Same SVG everywhere — only the wrapper's text class changes between blue and orange.

**Inline-in-input variant** (search inputs while AI processes): position absolute right-edge of the input.

```tsx
<svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#F58326] animate-spin" ... />
```

This is the established AI-search pattern across /headlines / /meetings / /scorecard / /rocks / /issues / /todos.

### Skeleton — for first-paint latency

Use **only when** the wait is genuinely long (>1s typical) AND the data shape is predictable enough to scaffold. Today this means **meeting detail sections** (FinancialReview, ThreeYearPicture, YoYPerformance, RockRecordReview) — high-latency aggregate views that benefit from showing the layout before the data lands.

```tsx
<div className="space-y-4 animate-pulse">
  <div className="h-12 bg-gray-100 rounded-xl" />
  <div className="h-12 bg-gray-100 rounded-xl" />
  <div className="h-12 bg-gray-100 rounded-xl" />
</div>
```

`bg-gray-100` (not `gray-200`) — the audit found `gray-100` more common and less aggressive. `rounded-xl` to match the meeting-detail-card chrome. Always `animate-pulse`.

**Hard rule — refresh stays silent.** When a list page or surface refreshes its data after the initial paint, **do NOT** flash a skeleton or `Loading...` over the existing content. The user already saw a populated list; replacing it with a skeleton during refresh communicates "your data is gone" when it's just being updated. Per the existing #738 canon: refresh paths swap data optimistically, no visible loading chrome. Skeletons are for *initial paint only* (component first mounts with no data).

The corollary: `<RefreshButton>` shows its own spinner inside the icon button — that's where refresh feedback lives. The list itself stays still.

## Primitive — `<EmptyState>` (proposed, not yet built)

50+ hand-rolled empty states is the strongest signal that a primitive is overdue. Proposed shape:

```tsx
<EmptyState
  message="No issues yet."
  surface="page"           // page | section | inline | compact
  cta="Click + Add Issue to start."   // optional
/>
```

Internally:
- Picks padding from `surface`.
- Always `text-gray-400`.
- Renders the optional CTA as inline prose under the message.

Build when the next person needs an empty state and reaches for a copy-paste. **Don't build it speculatively** — the audit shows the existing variants are 90% canonical already; a primitive risks over-engineering until consumers actually start fighting the pattern.

`<LoadingState>` and `<SkeletonRows>` are **not proposed** — the loading variants are diverse enough by intent (inline text vs spinner vs skeleton) that wrapping them in a primitive obscures the choice.

## Audit summary (session 49)

- **50+ empty-state variants.** Dominated by "No X yet." (~56%). Three pages still use "No X here" (sweep targets).
- **35+ spinners.** Brand-blue (40%) for primary, brand-orange (17%) for AI, generic blue (23%) in meeting sections, skeleton-pulse (20%).
- **Padding spread:** `py-16` (33%), `py-12` (21%), `py-8` (30%) — already roughly aligned to the page/section/inline scale, just not codified.
- **Color drift:** ~5 places use `text-gray-500` instead of `text-gray-400` for empty states (accountability, hip, vto). Minor sweep target.
- **AI orange consistency:** 100% — every AI flow today uses brand orange. Don't break this.

## Sweep targets (when next touching these surfaces)

| Page | Drift | Fix |
|---|---|---|
| `app/todos/page.tsx` | "No to-dos here." | → "No to-dos yet." |
| `app/rocks/page.tsx` (ListView empty) | "No rocks found." | → "No rocks yet." |
| `app/directory/page.tsx` (Users tab) | "No users found" | → "No users yet." or "No matching users." (when filter is active) |
| `accountability` / `hip` / `vto` | `text-gray-500` empty | → `text-gray-400` |
| 8 meeting detail sections | `border-blue-500` spinner | → `text-[#0069AA]` with the canonical SVG |

These are not blocking issues — sweep when the surrounding code is touched for any other reason. Don't open a sweep PR just for the drift.

## What NOT to do

- Don't write a brand-new empty-state copy variant when "No X yet." would fit.
- Don't use blue for an AI spinner — always orange (`#F58326`) for AI flows.
- Don't show a skeleton during refresh. Refresh stays silent (#738 canon). Skeletons are first-paint only.
- Don't combine `Loading...` text with a spinner — pick one.
- Don't introduce new gray shades for empty-state emphasis. `text-gray-400` is the canon. If you need to communicate "active working" vs "no records," use `text-gray-500` (loading text only) — not a third gray.
- Don't put a real `+ Add X` button inside the empty state — those live in Band 1 of the page header. The empty state can mention the button by name, but rendering a duplicate is off-canon.
