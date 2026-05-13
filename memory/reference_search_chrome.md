---
name: List-page Find input chrome
description: Canon for the Find input + three-mode panel on list pages (/todos, /issues, /rocks, /headlines, etc.). Distinct from ⌘K global search shape; behaves in familiar ways but lives inline on the page. Locked v0.4.0 (2026-05-12) — /todos s60 is the pilot.
type: reference
---

# List-page Find input — canon

Every list page's inline Find input renders the same chrome: a clean input at rest + a mode panel that pops below when the query has content. **Three modes** of escalating scope. **Brand-blue** for default modes, **brand-orange + sparkle ✨** for the AI mode.

This is the **list-page** Find canon. **`reference_global_search.md`** covers ⌘K — different surface, different chrome, but the two behave in familiar ways (mode toggle semantics, AI-orange treatment, debounce values stay consistent). Don't merge the docs; cross-link.

**Canonical impl:** `app/todos/page.tsx:975+` (input + mode panel).

---

## 1. The input at rest

Clean, unadorned. Soft gray background that lifts on focus. Search icon on the left.

```tsx
<input
  className="border rounded-lg py-1.5 text-sm bg-gray-50 focus:bg-white w-72
             transition-colors focus:border-[#0069AA] outline-none pl-8 pr-8
             border-gray-200"
  placeholder="Search {entity}…"
  // …
/>
```

Tokens locked:
- Width: `w-72` (288px) — matches the mode panel width below
- Background: `bg-gray-50 focus:bg-white` (no white-at-rest — too loud)
- Border: `border-gray-200`, lifts to `border-[#0069AA]` on focus
- Padding: `pl-8 pr-8` (left for the search icon, right for clear button)
- Icon: `<Search>` lucide, `w-4 h-4 text-gray-400`, absolutely positioned at `left-2.5 top-1/2 -translate-y-1/2`

**Placeholder string:** `Search {entity-plural}…` — locked entity name on left, mode pill in popover communicates *how*. When `includeArchived === true`, the placeholder swaps to `Search archive…` (per v0.4.0 /todos canon). No `Find` verb — `Search` everywhere.

## 2. The clear (×) affordance

When the input has content, a small × button renders inside the right padding at `right-2`. Click → clears the query but **keeps the active mode**.

```tsx
{search && (
  <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 …">
    <X className="w-4 h-4" strokeWidth={2} />
  </button>
)}
```

**Esc key:** clears the query AND blurs the input. The mode preference stays (so the next time the user types, they're back in their preferred mode).

## 3. The mode panel — pops below on query

The mode panel **only renders when `search` has content**. Empty input → no panel, only the input shows. This keeps the at-rest visual quiet.

When visible, it's an absolutely-positioned row directly below the input, same width (`w-72`), white background, soft border, three segmented pills:

```tsx
{search && (
  <div className="absolute top-full left-0 mt-1.5 z-40 flex items-center justify-center
                  bg-white border border-gray-200 rounded-lg shadow-md p-1 gap-1 w-72">
    {/* three pill buttons */}
  </div>
)}
```

### The three modes (escalating scope, left to right)

| Mode | Internal key | Scope | When |
|---|---|---|---|
| **Current Filters** | `"filter"` | Match title + description in items passing current filters. Client-side narrow. | Default. Fast feedback. |
| **All** | `"deep"` | Match title + description + **comments** across every entity (incl. archived), ignoring filters. Server-side. | When the user knows the item exists but it's not in the current view. |
| **✨ By meaning** | `"fuzzy"` | AI ranks intent-match across every entity (incl. archived), ignoring filters. Press Enter to run. | When the user's query is conceptual, not literal. |

Mode order is **left → right = narrowest → broadest**. The user escalates rightward when the current scope misses.

### Pill anatomy

Each pill is `w-[88px]` (uniform), `inline-flex items-center justify-center gap-1 text-xs font-medium py-1 rounded-md`. Active vs inactive:

| State | Default mode pill | Meaning mode pill |
|---|---|---|
| Active | `bg-[#0069AA] text-white` (brand-blue) | `bg-[#F58326] text-white` (brand-orange) |
| Inactive | `text-gray-600 hover:bg-gray-100` | `text-[#F58326] hover:bg-[#F58326]/10` |

The **Meaning pill always renders the ✨ sparkle icon** alongside its label, in both active and inactive states. The brand-orange treatment IS the AI signal; the sparkle reinforces it.

Each pill carries a tooltip explaining the scope ("Current Filters — match title + description in items passing your filters" etc.). Tooltips fire fast (default delay).

### Press-Enter hint (Meaning mode only)

When `searchMode === "fuzzy"` AND the input is focused AND there's a query AND the AI call isn't already running, render a small `↵ Enter` hint inside the right edge of the input (`right-8`, just left of the × clear button):

```tsx
{searchMode === "fuzzy" && search && searchFocused && !runningFuzzy && (
  <span className="absolute right-8 … text-[10px] font-medium text-[#F58326]">
    <CornerDownLeft className="w-3 h-3" strokeWidth={2.5} /> Enter
  </span>
)}
```

This signals "this mode doesn't fire on keystroke — press Enter to run." (Default modes fire on keystroke; Meaning mode requires explicit Enter because the AI call is non-trivial.)

### Mode-pill click MUST auto-focus the input (v0.4.1)

When the user clicks a mode pill, focus stays on (or returns to) the
search input. Without this, clicking a mode pill blurs the input,
which is jarring — especially for Meaning mode where the next user
action is "press Enter to run."

Pattern:

```tsx
<button
  onMouseDown={(e) => e.preventDefault()}  // keep focus through press
  onClick={() => {
    setSearchMode(m.v);
    if (m.v !== "fuzzy") setFuzzyMatchIds(null);
    searchInputRef.current?.focus();  // explicit re-focus
  }}
>
  {m.short}
</button>
```

`onMouseDown.preventDefault()` keeps focus on the input through the
pill press; `onClick` then explicitly re-focuses. Both are needed —
the first prevents the blur, the second pre-arms Enter for Meaning
mode.

Pilot: /todos (`app/todos/page.tsx` ~975+) and /issues (post-v0.4.1
retrofit). Same fix in any list page with the mode panel.

### Client hay-match applies in BOTH `filter` AND `deep` modes (v0.4.1)

In the `filtered` / `sortedIssues` useMemo, apply hay-match to both
`filter` and `deep` modes. Fuzzy stays its own branch.

```tsx
const filtered = useMemo(() => {
  let pool = items;
  if (search && (searchMode === "filter" || searchMode === "deep")) {
    const q = search.toLowerCase().trim();
    pool = pool.filter((t) => {
      const hay = [t.title, t.notes || "", /* ... */, t.commentMatch?.snippet || ""].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }
  if (search && searchMode === "fuzzy" && fuzzyMatchIds) {
    pool = pool.filter((t) => fuzzyMatchIds.has(t.id));
  }
  return pool;
}, [items, search, searchMode, fuzzyMatchIds]);
```

**Why both modes:** in All (`deep`) mode the client filter is
defense-in-depth. Switching modes triggers a refetch (`loadX → URL
effect → API call`), and between the click and the response the row
list briefly shows the PREVIOUS mode's data unfiltered — visible
flash. Hay-match smooths the gap.

**Hay MUST include `commentMatch.snippet`** so server-only comment
hits remain visible after the fetch returns. Without the snippet in
hay, a comment-only match disappears the moment the client filter
runs (because title + notes don't contain the query, only the
snippet does).

Pilot: /todos and /issues. Sweep target: same fix needed in /rocks,
/headlines, /meetings list pages, /scorecard list-pages.

## 4. Fuzzy loading affordance (v0.3.12 + s60 codified)

While the AI call is in flight:
- Input border → `border-[#F58326]` (brand-orange)
- A `<Loader2>` spinner renders at `right-2` (replacing the × clear, which hides during the call) — `w-4 h-4 text-[#F58326] animate-spin`
- The × clear button is hidden (the spinner takes its slot)
- The Press-Enter hint is hidden (Enter already triggered the call)

On response:
- Border returns to default
- Spinner disappears
- Row list narrows to the matched ID set
- × clear button returns

**No Band-2 chip** for fuzzy state. The narrowed row list + the orange border + the active Meaning pill ARE the signal. Adding a "AI: query · N matches" chip is off-canon (this was tried in Pb and rolled back — see v0.3.12 commit log).

## 5. AIContextInspector wrap — Minimal variant, not Full

The Meaning pill is **NOT wrapped in the Full AIContextInspector**. Earlier s60 attempt wrapped it — Ricky removed it because it was theater (the `ai-fuzzy-search` API uses only the candidate items + the query, not org-wide context). Right-clicking a 9-source inspector that doesn't actually consume those sources is worse than no inspector at all.

When a list-page Meaning mode acquires real org-context consumption (e.g., AI ranks based on rocks/scorecards/todos data, not just the candidate set), wrap with the **Minimal variant** — single-line "this feature uses only {candidate todos + query}; no org-wide context" — per `reference_ai_context_inspector.md` Variants section. The Full inspector is for features that genuinely consume the org graph.

## 6. Comment-body inclusion in All / By-meaning modes (v0.3.18)

For entities that support comments (rock / issue / todo today; headlines when comments ship there):

- **Current Filters mode (`filter`):** Visible fields only. Comments NOT searched (client doesn't hold them).
- **All mode (`deep`):** Server-side. Matches title + description + **comment body**.
- **By meaning mode (`fuzzy`):** AI ranks candidates that already passed the All-mode filter. Comments implicitly included via candidate scope.

When a result matched ONLY via a comment (title + description didn't hit), the row renders a **"matched in comment" indicator** as a third line under the title:

```tsx
<div className="flex items-center gap-1 text-[10px] text-gray-400">
  <MessageCircle className="w-3 h-3" />
  <Highlight text={commentMatch.snippet} highlight={search} />
</div>
```

Tooltip on hover: `Matched in comment by {author}`.

**Indicator only fires when comment was the ONLY reason the row matched.** When title or description also matched, the indicator is suppressed (visual clutter rule).

## 6b. Cross-tab scope in All + By-meaning modes (v0.4.2)

When a list page has **primary-mode tabs** (per `reference_primary_mode_tabs.md`) AND the tabs are same-class (same row template, same filter set — i.e. NOT hub-page tabs with different content shapes), the search modes follow this scope ladder:

| Mode | Scope |
|---|---|
| Current Filters (`filter`) | Active tab only. Filters + tab define a single narrow slice. |
| All (`deep`) | **All same-class tabs.** Ignores both filters AND the active primary-mode tab. |
| By meaning (`fuzzy`) | **All same-class tabs.** Same scope expansion as All; AI ranks across the union. |

**Why this is the rule.** Primary-mode tabs split the entity by an axis the user might be unsure about at the edges (e.g. Short-Term vs Long-Term issues — "stractical-leaning short-term" can read as either depending on context). The user should not be punished for picking the "wrong" tab when searching. The narrowest mode (Current Filters) honors their explicit context; the broader modes (All + By meaning) escape it.

### Cross-tab result rendering

Results from the active tab render as normal rows (no extra chrome).
Results from a SIBLING primary-mode tab render with an inline **tab badge** on the right side of the row, before the team chip:

```tsx
<span className="text-[10px] uppercase tracking-wider font-semibold
                 text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
  Long-Term
</span>
```

The badge tells the user which tab the result lives in. Clicking the row opens the editor as normal — the user can switch tabs after if they want to see the row in its native tab.

**Tab badge anatomy:**
- `text-[10px] uppercase tracking-wider font-semibold` — matches the "Primary" badge style from `reference_searchable_picker.md`
- `text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded` — neutral background, not entity-tone (tab axis is structural, not status)
- Label = the sibling tab's full name (`Long-Term`, `Short-Term`, etc.)
- Rendered ONLY on cross-tab results — active-tab results show no badge

### When NOT to cross tabs

If the page's tabs are hub-page tabs (different content shapes — like /vto Vision/Traction/SWOT) rather than primary-mode tabs, search stays scoped to the active tab. You can't meaningfully search "client" across vision-text and rock-data uniformly.

The cross-tab rule applies ONLY when tabs are same-class (per `reference_primary_mode_tabs.md`).

### Implementation contract

- Backend (`/api/{entity}/route.ts` deep search) — accept the active-tab param but ignore it in `deep` and `fuzzy` modes. Return entities from all primary-mode tabs.
- Each returned row carries its tab affinity (`tab: "short-term" | "long-term"` or similar) so the client can render the badge.
- Frontend — render the badge in row JSX when `row.tab !== activeTab` AND `searchMode !== "filter"`.

## 7. Archive-view opacity fade — triggered by Archive switch, not per-result

The `opacity-45` row fade applies **only when the Archive switch is ON** — i.e., the user is intentionally viewing the archive. In that view every row is archived, and the uniform fade signals "you're in the archive."

The fade is **NOT** a per-result indicator inside All / By-meaning search modes. When those modes surface an archived hit alongside non-archived hits, the archived row renders at full opacity like any other. The mode pill (All / By meaning) already tells the user "scope broadened past current filters" — fading individual rows would double-encode and visually punish a valid hit.

Don't use a separate "Archived" badge either — when the user is in archive view, the switch state IS the indicator; when they're in All / By-meaning, scope is implied by the mode.

## 8. URL + state contract

The Find input's state is **local to the page session** by default — `search`, `searchMode`, `runningFuzzy`, `fuzzyMatchIds` live in React state. Optional: persist `searchMode` in `sessionStorage` keyed `{entity}.searchMode` so the user's preference survives navigation.

Do **NOT** put `q=`/`mode=`/`ids=` in the URL. The Find input is exploratory; URL state is reserved for **filters** (tab, type, archive, team) which earn deep-link semantics. Search-by-meaning especially is not deep-linkable — the AI result depends on the corpus at query time.

(`reference_global_search.md` ⌘K behaves differently — it has its own URL/state model — but the inline Find input on list pages stays local-only.)

## 9. Debounce values

- **Current Filters mode (filter):** instant (no debounce — client-side narrow is cheap).
- **All mode (deep):** 250ms debounce — server query.
- **By meaning mode (fuzzy):** no auto-fire. Enter triggers; debounce N/A.

These mirror ⌘K's debounce values (per `reference_global_search.md` §6) so the cross-surface feel stays consistent.

## 10. Off-canon

- Always-visible mode panel (panel renders even when input is empty). Off — the panel is conditional.
- Mode pills with different widths per label. Off — uniform `w-[88px]` for reading rhythm.
- Killing the Meaning pill entirely when the page has no AI fuzzy backend. Acceptable — render only the two default pills (`filter` + `deep`).
- A separate "Run" button for Meaning mode. Off — Enter is the action; duplicating it adds chrome without value.
- A Band-2 chip for active fuzzy state. Off (v0.3.12 lock).
- Wrapping every Meaning pill in the Full inspector regardless of whether the API consumes org context. Off (s60 lesson — wrap with Minimal variant or no wrap when the API doesn't pull org sources).

## 11. Why this is canon

Without a fixed shape, every list page would re-derive the search chrome. The /todos s60 polish converged on this exact pattern after multiple iterations; codifying lets /issues, /rocks, /headlines adopt it without re-discovery. The familiar-but-distinct relationship to ⌘K is intentional — users learn the modes once.

## Field-note pairing

See `reference_canon_sweep_field_notes.md` — D21 (search-comment inclusion) and B8a (inspector theater on Meaning button) cover the sweep smell tests.

## See also

- `reference_global_search.md` — ⌘K shape (familiar mechanics, different chrome)
- `reference_list_standards.md` — Find input lives in Band 2; this doc owns the panel that hangs below
- `reference_ai_context_inspector.md` — Full / Minimal / None variants section
- `reference_color_palette.md` — brand-blue + brand-orange semantics
