# List-page standards (the /issues model — as of 2026-04-25)

`/issues` is the canonical list page. All other flat lists (`/todos`, `/rocks`, `/headlines`, `/meetings`) are aligned to this shape with per-list tweaks documented at the bottom. Read this before changing any list page — every deviation should be intentional.

> **🔒 UNIVERSAL ROW CONSISTENCY RULE (Ricky 2026-04-29).** If an entity (rock / issue / todo / headline / etc.) shows up in **any** list — standalone list page, meeting-runner section, dashboard widget, search results, slide-over picker, anywhere — its row must **look + behave the same** as it does in every other list it appears in.
>
> - **Placement does not change as a rule.** State-flip control (resolve circle, complete circle, mark-discussed) on the LEFT. Indicator cluster (StatusTrajectory, ⚡, rock-link star) in its established position. Right-side reserved for read-only metadata + secondary actions.
> - **Limited subtractions** are allowed when columns genuinely don't fit a context (e.g. dashboard widget at narrower width may drop the Goal pill). Subtractions never reorder remaining columns.
> - **Additions** are allowed when a context has a meeting-specific or surface-specific affordance (e.g. meeting runner adds Defer button on IDS issue rows). Additions go alongside existing chrome, never replace it.
> - **Pre-flight before any row change ANYWHERE:** open this file + the canonical list page (`/issues`, `/rocks`, etc.) and write down the column order before touching code. After shipping, screenshot the new context next to the canonical list page. Same eye motion to find the same control = pass. Hunt = revert.
> - Ricky shouldn't have to "do minor placement tweaks" because a row drifted in a new context. The rule is universal, not just for the meeting runner.

**Row 2 order (locked 2026-04-25):** `View ▾  Filters ▾  Find input (with mode pill)  Clear  active chips`. Chips always sit rightmost, after Clear — this lets chips wrap into a second row when the window is narrow without disturbing the core controls.

## Top-section vertical structure (codified session 48 after audit)

> **Every list page has the same 4-band stack** from page top to row list. Vertical rhythm is consistent across all 5 pages — same `mb-*` between bands, same band heights for analogous content. Don't introduce a new vertical section without registering it here.

| # | Band | Contains | Margin to next |
|---|---|---|---|
| 1 | **Title row** | H1 (with entity-color stripe) + optional inline subtitle/team-scope suffix + RIGHT-aligned action cluster (toolbar icons + AI buttons + `+ Add <Entity>` brand-blue CTA). | `mb-3` |
| 2 | **Filters row** | View ▾ / Filters ▾ / Find input (with mode pill) / Clear + active chips. Plus form-property toggles (e.g. `My To-Dos`, `Due to me`, `Stractical only`) inline at the right end. | `mb-3` |
| 3 | **State tabs row** | `All / <Open> / <Done>` buckets with counts. `border-b border-gray-200` rail underneath. | `mb-3` |
| 4 | **Column-header strip** | `bg-gray-50 rounded-lg px-4 py-1.5 mb-1` strip with sortable headers (`<SortHeader>`) and static column labels. Width tokens line up with row cells per the column-justification rule below. | `mb-1` |
| 5 | **Row list** | `space-y-1` gap between rows (`reference_list_standards.md` "Row outer chrome" canon). | — |

**Band-1 layout rule:** H1 + category-scope tabs (Short/Long-Term, Year picker, etc.) are baseline-aligned via `flex items-baseline gap-4` on the LEFT of band 1. The action cluster (toolbar icons + Add button) is RIGHT-aligned via `ml-auto` or a sibling div. **Don't break the title and the action cluster across two rows.** All 5 list pages comply (session 49 commit `e3f27f2`). H1 is rendered INSIDE the sticky wrapper as the first child of the LEFT flex container; page-specific scope content (Short/Long-Term tabs, Year+Quarter pickers) sits alongside it; H1 has no `mb-*` since it's inline in a flex row. One title row, period.

**Action-cluster order in Band 1 (right-to-left as they appear on screen):** primary CTA (`+ Add <Entity>`) is rightmost → AI button(s) → archive-done icon → RefreshButton → optional kebab. This puts the most-clicked button at the easiest-to-reach edge.

**Sort placement — dual-path canon (v0.3.6, reconciled).**

OS reality (verified `app/issues/page.tsx`): both paths exist and stay in sync.

1. **Primary picker — inside View ▾ popover.** "Sort by" is a sibling section to Layout and Group by, rendered as a segmented-pill group with directional indicator (↑/↓ on the active option). Discoverable for fields that aren't visible columns.
2. **Direct manipulation — column header click.** `<SortHeader>` cells in Band 4 toggle sort on click. Same underlying state as the View popover.

Both paths update one shared sort state — flipping in either surface reflects immediately in the other. The View popover sort is canon for ANY sortable field; column headers are canon for sortable VISIBLE columns. Don't omit either path: discoverable picker + direct manipulation both serve users.

`/meetings` table layout has no Band 4 strip; the Sort by section in View ▾ is the only path there. That's by design, not a partial implementation.

**Sticky top section.** Bands 1-4 are **sticky to the viewport top** so filters / search / Add / state tabs / column headers stay reachable regardless of scroll position. Status (session 49 commits `d80728c` + `f68929a`): Bands 1-3 sticky on all 5 list pages; Band 4 sticky on /issues + /todos + /headlines + /rocks (list view). /rocks list view used to host its column header inside the `ListView` sub-component with a local `useTableSort`; both the hook and the `STATUS_ORDER` constant were hoisted to `RocksPage` / module scope respectively, with `tableSort` threaded back into `ListView` as a prop. /rocks milestone-class views (milestones, gantt, planner) still use per-group card-wrapped headers — separate refactor when those need sticky. /meetings has no Band 4 strip (table layout).

```tsx
{/* Top of every list page — wraps Bands 1-4 */}
<div className="sticky top-12 z-30 bg-[#f7f8fa] -mx-8 px-8 pt-2 pb-1 shadow-[0_4px_8px_-4px_rgba(0,0,0,0.04)]">
  {/* Band 1: Title row */}
  {/* Band 2: Filters row */}
  {/* Band 3: State tabs */}
  {/* Band 4: Column header strip */}
</div>
{/* Band 5: Row list — scrolls under the sticky wrapper */}
```

Notes on the implementation:
- `top-12` (= 48px) clears the AppShell's fixed topbar (which is `h-12` and overlays the top of the scroll viewport).
- `-mx-8 px-8` cancels the surrounding `<main><div className="p-8">` horizontal padding so the sticky region's background reaches the scroll container's edges — without this, scrolled rows show through the 32px side gaps.
- `bg-[#f7f8fa]` matches the existing page background that `/issues`, `/todos`, `/rocks`, `/headlines`, `/meetings` already use on their partial Band-1 sticky wrappers (the global body bg is `#ffffff` per `globals.css`, but every list page paints `#f7f8fa` over it via the sticky wrapper — that gray-tinged white is the actual page color users see).
- `shadow-[0_4px_8px_-4px_rgba(0,0,0,0.04)]` provides the thin separator between the sticky region and scrolled rows so the row list visually scrolls beneath, not into, the sticky region.
- `z-30` matches the existing sticky on Band 1 today. Above row content (no z), below `<Modal>` (`z-50`) and `<Tooltip>` (`z-[1000]`).
- Band rhythm (`mb-3 / mb-3 / mb-3 / mb-1`) stays — no compression on scroll.
- **Don't sticky individual bands** (e.g. only the column header) — the whole top section moves together so the user's mental model of "header + filters + tabs + columns" stays grouped.

## Column justification rule (codified session 48)

Both column-header cells (in Band 4) AND row cells (Band 5) use the same alignment per data type. Header and row alignments must match exactly — drift causes visual misalignment that's hard to spot but reads as "off" at a glance.

| Data type | Justification | Examples |
|---|---|---|
| Text (titles, descriptions, labels) | **LEFT** (`text-left`, `align="left"` on SortHeader) | Title, Description, "Submitted by Trevor M." |
| Numeric / date / time / age | **RIGHT** (`text-right`, `align="right"`) | "59d" age, "$1,063.94", "Jun 30 (-13d)", "1h 58m" duration |
| Pills / avatars / icons / badges | **CENTER** (`text-center`, `align="center"`) | Owner avatar, Team pill, Status pill, Priority badge, Cascade pill |

**Why per data type, not per column-author preference:**
- Text columns left-justify because eye-tracking starts at the left edge — centered or right text on a list breaks the scan rhythm.
- Numeric columns right-justify so digits line up across rows — `59` and `123` align at their ones-place, making magnitudes comparable at a glance.
- Pills + avatars + badges center because they're symmetric chrome with no inherent reading direction.

**Examples that earned the rule (and the misalignment they caused):**
- `/headlines` had "SUBMITTED BY" in a `w-10` column header — the label wrapped to two lines because the column was sized for the avatar (centered) but the header label was longer than the column width. Fix: widen the column to `w-24` matching the row cell, OR shorten the label to "BY".
- `/rocks` had "MILESTONES" centered above a column with a left-justified progress bar. Visually wrong — the header floats over empty space on the right.
- `/issues` had "AGE" centered above the "59d" cell. Numbers belong right-aligned so they line up between rows.

**Header label format:** All column headers use `text-[10px] uppercase tracking-wider` styling (matches `<SortHeader>` default + the static-label styling alongside). Static labels in Band 4 use `text-gray-400 font-semibold uppercase tracking-wider` so they read as labels, not buttons.

## Row 1 — identity + category scope + primary actions

- H1 `text-2xl font-bold text-gray-900` with a **per-type color mark**: `<span class="inline-block w-1 h-6 rounded-full bg-[#HEX]">` immediately before the title text (gap-2 from title). Mark color is the entity color.
- **Category scope** (not state filter) lives inline with the h1 — e.g. Short-Term/Long-Term on /issues, Year + Quarter on /rocks, past/upcoming/agendas on /meetings. `flex items-baseline gap-4` so tab text baselines with the h1 (NOT `items-center` — that misaligns the box centers).
- Right side: **Archive-done icon button** (w-8 h-8 archive-box icon, gray outline, spinner when batch PUT in flight, confirmation dialog with count) + `<RefreshButton onRefresh={loadFn} />` + optional AI icon buttons + `<button>+ Add <Entity></button>` (brand blue `#0069AA`, `px-4 py-2 rounded-lg text-white text-sm font-medium`). AI actions wrap in `<AIContextInspector>`.
  - Archive-done verb per list: /issues "Archive all solved" / /todos "Archive all done" / /rocks "Archive all completed phase" / /headlines "Archive all dismissed".

## Row 2 — view + filters + search + clear

In order, left to right:
1. **View ▾ popover** (`components/Popover.tsx`) — contains: Layout picker (list / compact), Sort by (entity-specific keys), Group by (None / Team / Owner / ...per list).
2. **Filters ▾ popover** with a filter-count badge. Width `280`. Fields appropriate to the entity + **tri-state Archive picker** (Active / Both / Archived — default Active, three-pill segmented control in its own section) + entity-specific "Show <done-state>" toggle (e.g. "Show solved" on /issues, default off) + "Clear all filters" button when any are active.

   **Field shapes — pick by selection cardinality:**

   | Filter type | Shape | Example |
   |---|---|---|
   | **Single-select** (one value, e.g. one team, one status, one owner) | `<select>` dropdown | Raised by ▾ / Status ▾ / Team ▾ |
   | **Multi-select** (multiple values, e.g. multiple categories, multiple types) | **Checkbox list with optional section heading** (v0.3.4) | Categories ☐ / Types ☐ |
   | **Boolean toggle** | `<FilterToggle>` stacked, full-width | Private only / Stractical only / Include Direct Reports |
   | **Tri-state scope** (3 mutually exclusive options) | Segmented pill group (`flex gap-1 bg-gray-100 rounded-md p-0.5`) | Archive Active/Both/Archived |

   **Single-select shape:**
   ```tsx
   <div>
     <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Status</label>
     <select className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-xs bg-white"
             value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
       <option value="">Any</option>
       {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
     </select>
   </div>
   ```

   **Multi-select shape (v0.3.4 canon):**
   ```tsx
   <div>
     <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Type</label>
     <div className="space-y-0.5">
       {TYPE_OPTIONS.map((t) => (
         <label key={t.value} className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 hover:bg-gray-50">
           <input type="checkbox"
                  checked={selectedTypes.has(t.value)}
                  onChange={(e) => toggleType(t.value, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0069AA] focus:ring-[#0069AA]/20" />
           <span className="text-xs text-gray-700">{t.label}</span>
         </label>
       ))}
     </div>
   </div>
   ```

   - **Section headings** (`text-[10px] font-semibold text-gray-500 uppercase mb-1`) above each group separate logical filter dimensions (e.g. CATEGORY then TYPE in Playbook `/content`).
   - Multiple multi-select sections in one popover are stacked with `space-y-3` between sections (matching the global popover stack rhythm).
   - Each option row: `flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 hover:bg-gray-50`. Don't use bare checkboxes — the row hover affordance helps tappability.
   - Checkbox color uses brand-blue (`text-[#0069AA]`) for the checked state. Focus ring brand-blue at 20%.
   - **For long lists** (>10 options), add a small inline search above the checkbox list — same `<input>` shape as the OS Find input, scoped to filter the visible options.
   - Don't mix shapes inside one section — a section is either single-select OR multi-select OR toggles, not a mix.

   **Required sections in every Filters popover, regardless of entity:**
   - Tri-state Archive picker (segmented pills, in its own section under `border-t border-gray-100 pt-2`).
   - "Clear all filters" button below archive when `activeFilters > 0`.
   - Filter-count badge on the trigger when any filter is non-default: `<span className="ml-1 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-[#0069AA] text-white text-[10px] font-bold">{count}</span>`.

   **Reference impl:** [`app/issues/page.tsx`](app/issues/page.tsx) — search for `>Filters<`.
3. **Find input** with inline mode picker:
   - Three modes: **Visible** (client-side narrow over loaded rows, case-insensitive, all visible fields), **Anywhere** (server-side `?search=` with `mode: "insensitive"` across title + description), **By meaning** (POST to `/api/<entity>/ai-fuzzy-search`, Claude returns matching ids, client filters). `/meetings` only offers Visible + By meaning — no server `?search=` on that route.
   - **"By meaning" is the unified label across every search surface in every Intrust app** — list-page Find inputs AND ⌘K global search both use this same name (per [`reference_global_search.md`](reference_global_search.md)). Don't relabel as "Fuzzy", "Smart", or "AI Search" anywhere. Visual treatment (sparkle ✨ + brand-orange + `<AIContextInspector>` wrap) IS the AI signal; label stays user-intent.
   - Placeholder: `Find visible…` / `Find anywhere…` / `Find by meaning…`.
   - **Mode-picker shape (v0.3.3 — replaces the old "pill labels" wording).** Trigger is a small borderless pill positioned absolutely INSIDE the right edge of the input (`right-1`). Click opens a Popover with the full mode list. Reference impl: `app/issues/page.tsx` (search the file for `"Find in"`).

```tsx
{/* Trigger pill — INSIDE the input, right edge */}
<div className="absolute inset-y-0 right-1 flex items-center">
  <Popover
    align="right"
    width={260}
    className="!border-0 !bg-transparent !text-xs !px-2 !py-0.5 !text-gray-500 hover:!bg-gray-100 !rounded-md"
    trigger={
      <span className="font-medium">
        {searchMode === "filter" ? "Visible" : searchMode === "deep" ? "Anywhere" : "Meaning"}
      </span>
    }
  >
    <div className="space-y-2">
      <div className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Find in</div>
      {([
        { v: "filter", label: "Visible",    help: "Instant narrow across visible fields" },
        { v: "deep",   label: "Anywhere",   help: "Server search across title + description, all tabs" },
        { v: "fuzzy",  label: "By meaning", help: "AI matches intent, not exact text" },
      ] as const).map((m) => (
        <label key={m.v} className="flex items-start gap-2 cursor-pointer rounded-md px-2 py-1.5 hover:bg-gray-50">
          <input type="radio" name="searchMode" className="mt-1"
            checked={searchMode === m.v}
            onChange={() => setSearchMode(m.v)} />
          <span className="flex-1">
            <span className="block text-xs font-medium text-gray-800">
              {m.label}
              {m.v === "fuzzy" && <span className="ml-1 text-[10px] text-[#F58326]">AI</span>}
            </span>
            <span className="block text-[10px] text-gray-500">{m.help}</span>
          </span>
        </label>
      ))}
      {searchMode === "fuzzy" && (
        <AIContextInspector feature="<your-feature>" description="…">
          <p className="text-[10px] text-gray-500 px-2 py-1">
            Type your query in the search box + <span className="font-medium text-gray-700">press Enter</span> to match.
          </p>
        </AIContextInspector>
      )}
    </div>
  </Popover>
</div>
```

   - **Radios with subtitle help text — NOT segmented pills.** Each option has a bold label + `text-[10px] text-gray-500` help line. By-meaning gets a small `text-[10px] text-[#F58326]` "AI" tag inline next to its label — that's the AI signal in addition to the inspector wrap.
   - **Popover heading:** `text-[10px] font-semibold text-gray-500 uppercase` reading **"Find in"** (not "Search mode", not "Mode").
   - **Trigger pill text:** the short form of the active mode (`Visible` / `Anywhere` / `Meaning`). The full label "By meaning" appears in the popover; the trigger uses the one-word form to fit inside the input.
   - **Placeholder:** `Find visible…` / `Find anywhere…` / `Find by meaning…` (changes with mode).
   - **By-meaning fires on Enter** in the input itself. The hint inside the popover ("Type your query in the search box + press Enter to match.") wraps in `<AIContextInspector>` so right-click reveals what context the AI uses. **Don't** render a separate "Run fuzzy match" button — it duplicates Enter.
   - **Any analysis button** that lives inside this popover (e.g. "Detect Patterns" on `/issues`) sits in its OWN section below the mode list, separated by `pt-2 mt-2 border-t border-gray-100` and a `text-[10px] font-semibold text-gray-500 uppercase` "Analysis" heading. Each analysis button wraps in its own `<AIContextInspector>`.
4. **Clear** button to the RIGHT of the Find input. Only renders when anything is non-default. `resetView()` clears: filters, search query + mode, grouping + collapsed-groups, bulk selection, Row-3 state tab, per-page team override. Preserves view mode + sort preference + Row-1 category tab. **The Clear condition must include the state-tab check** — if the user only deviated by switching the Row-3 tab, Clear still needs to show.
5. **Active filter chips** (`components/FilterChip.tsx`) — rendered rightmost, after Clear. Click × to clear.

   **Wrap geometry (v0.3.6):** the entire Band 2 row uses `flex flex-wrap items-center gap-2` so chips break to the next line **at whatever indent the flex layout produces** — not flush-left full-width, not right-aligned hanging. Whatever doesn't fit wraps naturally. No special second-row container, no manual indent. This matches OS production today.

   ```tsx
   {/* Band 2 — locked container shape */}
   <div className="flex flex-wrap items-center gap-2 mb-3">
     <ViewPopover />
     <FiltersPopover />
     <FindInput />
     {anyChange && <ClearButton />}
     {chips.map((c) => <FilterChip key={c.key} {...c} />)}
   </div>
   ```

## Row 3 — state tabs (All / "Open-state" / "Done-state") with per-tab counts

Directly above the list body, below the filters row, separated by a `border-b border-gray-200` rail. Always three buckets for state: **All / <Open> / <Done>**. The *Done* tab uses the entity's "finished" word (Unresolved/Resolved on /issues, Not Done/Done on /todos, Active/Completed on /rocks when we add it, etc.).

- Each tab shows a count: `Label <span>N</span>` per the **Count chip canon** below. Counts are computed over the sorted+filtered set BEFORE the state-tab narrows, so each tab advertises how many items it would display.

### Count chip — inline numeric badges

Small numeric badge sitting next to a label (state tabs, hub tabs, row titles with substep counts, sidebar nav items with notification counts).

**Style — locked:**
```tsx
<span>{label} <span className="text-gray-400 font-normal">{count}</span></span>
```

- The label keeps its parent's font weight (`font-medium` on tabs, `font-bold` on H1s, etc.).
- The count is **always** `text-gray-400 font-normal` — visually subordinate to the label so the eye reads the label first, the count second.
- Single space between label and count. No parens, no brackets, no slash.
- **NOT a separate primitive component.** Just an inline `<span>` — using a heavier wrapper (badge component, pill) over-emphasizes the count.

**When to use a stronger pill instead** (gray-100 bg, gray-700 text, rounded):
- Counts inside ROW content where the row already has its own visual weight (e.g. an item count next to a row title that needs to be tappable or visually distinct from surrounding text). Use sparingly — most counts are fine inline.

**Off-canon:** floating bubble badges (red dots with numbers), pill-shaped colored badges (`bg-blue-100 text-blue-700`), or any treatment that makes the count compete for visual weight with the label. The label is what the user reads; the count is supplementary.
- Default tab is the "Open" bucket (Unresolved on /issues, Not Done on /todos) — the list is focused on open work by default.
- Active tab uses `border-b-2 border-[#0069AA] text-gray-900`; inactive uses `border-transparent text-gray-500`.
- Reset: Clear button snaps back to the default "Open" tab.

## Row structure (list view)

> **Strict left-to-right placement rule.** When adding any new row chrome — list page OR meeting-runner section — match the column order below exactly. Don't put state-flip controls on the right edge "to be near other actions"; the convention is left-side. Verify against `/rocks`, `/issues`, `/todos`, `/headlines` before shipping. If the meeting runner needs a row that mirrors a list page, **read the list page row first**, copy its left-to-right column order, only deviate when adding a meeting-specific affordance (and document the deviation).

Left-to-right columns in every row:

1. **Bulk-select checkbox** (`w-5`, square, outlined). Header row has a select-all with `indeterminate` state when partial. Leftmost by convention (Gmail / Linear / Airtable). In the meeting runner, this slot becomes the row-number prefix `1.` `2.` …
2. **Round "state-flip" circle** (`w-5 h-5 rounded-full border-2`). Matches /todos visual. Clicking opens the resolution / completion / mark-done flow for the entity. **Position: ALWAYS left, after bulk/number, before drag handle.** Per-list verb:
   - /todos → "Mark complete"
   - /issues, IDS row → "Mark resolved" (opens required-resolution modal + 4-option follow-up)
   - /headlines → "Mark discussed" (meeting runner only)
   - /rocks → no state-flip circle (StatusTrajectory in slot #4 instead)

   **Lifecycle state-flip vs row-dismiss — when to use circle vs ✕** (clarified session 48 C-CC-5):

   | Concept | Visual | Position | Examples |
   |---|---|---|---|
   | **Lifecycle state-flip** — entity advances to its next defined stage in a multi-stage lifecycle (open→resolved, not_done→done, scheduled→discussed). Usually opens a confirmation/resolution flow. | Round circle ○ | Row LEFT (slot #2) | Mark complete (todo), Mark resolved (issue), Mark discussed (headline in meeting) |
   | **Row-dismiss / clear** — "I'm done seeing this in my list." Doesn't advance the entity through its lifecycle; just removes it from the active view. Reversible by un-dismiss/restore. | ✕ icon button | Row RIGHT (before menu) | Dismiss headline (`/headlines` list, [`app/headlines/page.tsx:1234`](app/headlines/page.tsx:1234)) |

   The headline dismiss case is the canonical "row-dismiss" example — semantically "remove from view," not "advance state." Keeping it on the right + as ✕ communicates that it's a viewing-list affordance, not a lifecycle event. The headline's *Mark discussed* in the meeting runner IS a lifecycle state-flip → that uses the circle on the left, per the table above.

   When designing a new row affordance: ask whether you're advancing the entity's lifecycle (circle, left) or just clearing it from a view (✕, right). The two are not interchangeable.
3. **Drag handle** `⠿` (`w-4`, gray-300, cursor-grab). For priority reorder where applicable.
4. **Priority badge** OR **StatusTrajectory** OR equivalent primary status (centered, `w-7 rounded-full` for priority; `w-10` for StatusTrajectory). Rocks use StatusTrajectory here; issues/todos use priority.
5. **Title + description** (`flex-1 min-w-0`). Title row uses a horizontal flex with inline badges:
   - Rock-link icon (if entity has `rockId` set) — small orange sparkle
   - Stratical chip / quarter chip / equivalent entity-specific indicator
   - Title text (truncate, flex-1)
   - **Linked-items badge** (🔗 N) — from `/api/links/counts`. Tooltip distinguishes spawn origin count.
   - **Comment badge** (💬 N) — from `/api/comments/counts`. Unread variant uses brand-blue background.
   - Description row below (truncated, text-gray-400, smaller).
6. **Right metadata block** (`flex items-center gap-3 flex-shrink-0`):
   - Goal pill — `w-28` left-aligned pill, xl-block-only
   - Raised-by / Owner avatar — `w-14` centered
   - Team pill — `w-24` centered, truncate
   - Age — `w-16` right-aligned (numeric convention), xl-block-only. STALE / Aging badges inline-block.
   - Status pill — `w-24` centered
7. **Menu button** — `w-6`, three-dot, opens context/ellipsis menu

**Row height**: `px-4 py-3` (matches /todos — shorter than the old /issues `p-4`). Solved rows get `text-gray-400 line-through` on the title + `text-gray-300` on the description.

### Row outer chrome — canonical (codified session 48 after audit found drift)

**Every list row uses this exact outer chrome.** Codified after a session-48 audit found 4 different paddings/rounded/border combos across `/issues`, `/todos`, `/rocks`, `/headlines` (see drift log below). Don't deviate without a registered exception.

```tsx
<div
  className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-white border hover:bg-gray-50 cursor-pointer transition-colors group ${
    isBulkSelected ? "border-[#0069AA] ring-1 ring-[#0069AA]/30" : "border-gray-100"
  } ${stripeClass}`}
  onClick={() => onEdit(entity)}
>
  {/* … row content … */}
</div>
```

**Required tokens:**
- **Padding:** `px-4 py-3` — period.
- **Rounded:** `rounded-lg` (not `rounded-xl`, not unrounded).
- **Background:** `bg-white`.
- **Outer border:** `border border-gray-100` by default. **Bulk-selected promotes to** `border-[#0069AA] ring-1 ring-[#0069AA]/30` (replace gray-100 entirely).
- **Hover:** `hover:bg-gray-50` + `transition-colors` (smooth fade).
- **Cursor:** `cursor-pointer` (whole row click-to-edit).
- **Group class:** `group` (so child hover-revealed buttons can use `group-hover:`).

### Left stripe — see `reference_stripe_system.md` (v0.3.0)

The colored left stripe is part of the canonical row chrome — every entity has one. **As of v0.3.0, all stripe encoding lives in [`reference_stripe_system.md`](reference_stripe_system.md)** — that doc is the single source of truth for thickness (depth), hue (entity), and state (default / flagged / done) across every Intrust app. Read it before changing any stripe.

Summary for OS quick-reference:

| Entity | Depth | Thickness | Hue | CSS var |
|---|---|---|---|---|
| /issues | 1 | 8px | red `#EF4444` | `--color-stripe-issue` |
| /todos | 1 | 8px | green `#22C55E` | `--color-stripe-todo` |
| /rocks | 1 | 8px | indigo `#6366F1` | `--color-stripe-rock` |
| Milestones (under Rocks) | 2 | 6px | indigo `#6366F1` (inherits parent) | `--color-stripe-rock` |
| /headlines | 1 | 8px | amber `#F59E0B` | `--color-stripe-headline` |

**Retired in v0.3.0:** Milestone teal `#14B8A6`. Milestones now inherit Rock's indigo and are distinguished by thickness (6px vs Rock's 8px). The parent/child relationship reads visually without a separate hue.

**Stripe rendering** uses `box-shadow: inset` via the canon helper [`lib/stripes.ts`](../lib/stripes.ts) — single source of truth for the depth ladder, state-color overrides, and thickness rules. Old `border-l-2 border-l-[#HEX]` patterns retrofit to `style={stripeStyle({color, depth, state})}` incrementally; both render identically in light mode.

**Flagged state** does NOT change the stripe color or thickness in v0.3.0 — entity hue and depth-thickness stay locked. The orange "flagged" signal is rendered as a separate outboard ribbon via [`<FlaggedTab/>`](../components/FlaggedTab.tsx) — a small 6px brand-orange tab sticking out to the LEFT of the rounded card. Stripe = identity (always); tab = state (only when flagged).

**Done state** keeps the depth thickness but swaps stripe color to `gray-300` (`#D1D5DB` via `--color-gray-300`). Title gets `text-gray-400 line-through`, description gets `text-gray-300`. (Helper handles this when state="done".)

**Composition pattern** — every list page builds rows like:

```tsx
<div className="relative">
  {row.flagged && <FlaggedTab />}
  <div
    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group"
    style={stripeStyle({
      color: "var(--color-stripe-issue)",
      depth: 1,
      state: row.solved ? "done" : row.flagged ? "flagged" : "default",
    })}
  >
    {/* row content */}
  </div>
</div>
```

The PARENT `<div className="relative">` is required for `<FlaggedTab/>` to position itself outside the rounded card. Reference impl will land in `app/issues/page.tsx` during the v0.3.0 retrofit sweep.

### Row gap — vertical rhythm between rows

The `space-y-N` wrapper around the row list controls how much air sits between rows. **Canon: `space-y-1` (4px gap).** Denser `space-y-0.5` (2px) reads as cramped — rows visually merge into a stack, especially with the strong colored left stripes.

```tsx
<div className="space-y-1">
  {rows.map((r) => <Row key={r.id} {...r} />)}
</div>
```

Inside grouped views (`groupBy !== "none"`), each group's rows also use `space-y-1`.

### Row chrome drift log — fixed session 48

For posterity, the drift the canon now fixes:

| Page | Padding | Rounded | Border | Gap | Sweep needed |
|---|---|---|---|---|---|
| /issues | `px-3 py-2` | `rounded-lg` | `border-gray-100` | `space-y-1` | Padding |
| /todos | `px-4 py-3` | `rounded-xl` | `border-gray-200` | `space-y-0.5` | Rounded + border + gap |
| /rocks | `px-4 py-3` | (none) | (none — just stripe) | `space-y-0.5` | Add card edge + gap |
| /headlines | `px-4 py-3` | `rounded-lg` | `border-gray-100` | `space-y-1` | (already canon) |

How it happened: 4 separate commits over a week (`9a426d82` /todos, `d593492f` /rocks, `7a8c6831` /headlines, `254198f9` /issues) — each had its own scope (apply-list-standard, bulk-select, headlines-sweep, K-FR-017). None ever swept the others to align. Classic incremental drift; preventable now that the chrome spec exists here.

**Row left stripe**:
- Default: 2px colored left border per entity type (see color table below)
- Flagged (pinned): promotes to `border-l-4 border-l-[#F58326]` orange
- Bulk-selected: full border becomes `border-[#0069AA] ring-1 ring-[#0069AA]/30`

**Column header ↔ row alignment rule**: every column's header cell must share width + alignment with its row cell. Text columns left, numeric/time right, pills/avatars/icons centered. If header text won't fit the row width (e.g. "Raised" in `w-8`), widen the column — encroach on the title flex if needed.

## Bulk action bar

Floating bar, `fixed bottom-6 left-1/2 -translate-x-1/2 z-40`. Appears when `bulkSelected.size > 0`. Content:
- `N selected` label
- Primary bulk actions per entity (see per-list below)
- Cancel / Clear button
- Disables all actions while the batch PUT is in flight (`bulkBusy` state)

## Session-persisted view

Every list writes a `<list>.view` key to `sessionStorage` on any change, hydrates once on mount via `useEffect`. Keys included: categoryTab (or equivalent primary scope), viewMode, searchMode, groupBy, includeArchived, visibility toggles, collapsedGroups. Survives navigation away + return in the same tab; resets when the tab closes. **Do NOT** persist searchQuery itself — stale queries confuse on return.

## Grouping + collapsible headers

When `groupBy !== "none"`, split the sorted+filtered list into buckets. Each bucket has a collapsible header button at full row width with a rotating chevron + label + `· N` count. Collapsed state tracked per-key in a `Set<string>` that's part of the sessionStorage view blob. Works in both list + compact views.

### Canonical expand/collapse-all control (single toggle chevron)

Where there's a per-section collapse, use one button that flips its icon based on state. Same `M9 5l7 7-7 7` chevron path + rotation as the per-section chevrons — one icon vocabulary across the page (shipped 2026-04-28 #684):

```tsx
const allExpanded = collapsedSections.size === 0;
return (
  <Tooltip text={allExpanded ? "Collapse all sections" : "Expand all sections"}>
    <button
      type="button"
      onClick={() => setCollapsedSections(allExpanded ? new Set(allKeys) : new Set())}
      className="w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-[#0069AA] hover:bg-[#0069AA]/10"
      aria-label={allExpanded ? "Collapse all sections" : "Expand all sections"}
    >
      <svg className={`w-3.5 h-3.5 transition-transform ${allExpanded ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </Tooltip>
);
```

▶ when anything is collapsed → click expands all. ▼ when all are expanded → click collapses all. Tooltip + aria-label reflect the action that fires on click.

Reference impls: `components/SoiPlanEditor.tsx`, `app/ggob/page.tsx` ("Forecast and Plan Details" header). NB: `app/scorecard/page.tsx:1620-1636` still uses the older `+ / −` pair; sweep to single chevron when next touched.

## Comment + link counts endpoints

- `GET /api/comments/counts?entities=issue:id1,todo:id2,…` → `{ "<type>:<id>": { total, unread } }` for rows with at least one comment. See `app/api/comments/counts/route.ts`.
- `GET /api/links/counts?entities=…` → `{ "<type>:<id>": { total, spawned } }` aggregating EntityLink edges + legacy FK relations (rockId/goalId/metricId/parentId). See `app/api/links/counts/route.ts`.

Load once per issue-set change via a second `useEffect` keyed on `[issues]`; graceful empty-fallback.

## Team scope — global + per-page override (locked 2026-04-25, scorecard added 2026-04-26)

**In scope:** /issues · /todos · /rocks · /headlines · /meetings · /scorecard.

**Setup:**
- The sidebar picker (`components/GlobalTeamChip.tsx` + the "Team: X ▾" dropdown in the sidebar) sets a **global team scope**. Persisted to localStorage keyed by userId. Survives sessions and applies across every team-scoped surface in the app.
- **Top-bar `GlobalTeamChip` is hidden on every list page** — the scope is shown instead as an inline `FilterChip` in the Row 2 chip strip. On non-list pages the top-bar chip still renders.

**The picker (inside Filters ▾ popover):**
- Lives at the **top** of the Filters popover, labeled `Team (override global)`, with options `<Any>` + the team list.
- Wired to `pickTeam` from `useTeamOverride()` — collapses "matches global" to `null` (no override) so the override doesn't silently stick around when it equals the baseline.

**The chip (Row 2 chip strip — canonical pattern, do not deviate):**
```tsx
{teamFilter && <FilterChip
  label={`Team: ${teams.find((t) => t.id === teamFilter)?.name || "—"}`}
  onClear={() => setTeamOverride("")}
/>}
```
- Renders whenever the effective team filter is non-empty (global OR override). Default global = Leadership Team → chip is always visible on those lists.
- × always present (no passive variant). × calls `setTeamOverride("")` → list shows "all teams you have access to" for THIS list only.
- Global is NOT touched. Other lists keep using global. To clear the global everywhere, use the sidebar picker.
- All five canonical lists wire it identically. /scorecard joined the standard 2026-04-26 (commit `bea7335` introduced the scope chip; corrected to canonical pattern in the follow-up).

**Hook + storage:**
- `lib/use-team-override.ts` — `useTeamOverride()` returns `{ teamFilter, teamOverride, setTeamOverride, pickTeam, globalTeamId }`.
- When the user changes the global team via the sidebar, per-page overrides reset automatically so the new global is the baseline. The reset gates on the `hydrated` flag from `team-context.tsx` — NOT on `loading`, which starts false before the fetch begins.
- The override is persisted in each page's `<list>.view` sessionStorage blob so it survives navigation within the tab session.

**Filters badge counting:**
- The active-filters count includes the team only when `teamOverride !== null` (an explicit deviation from global). Sticking with the global doesn't bump the badge.

**Other notes:**
- **Global ⌘K search ignores team scope entirely** (Ricky, 2026-04-25): always searches across everything the user has access to. Global team is a "what list do I default to" setting, not a global restriction.

## Per-type colors (v0.3.0)

Stripe + h1-mark hues per OS entity. **All consumed via CSS var** (per `reference_color_palette.md` "CSS variables"). The thickness column comes from the depth-encoding system in [`reference_stripe_system.md`](reference_stripe_system.md).

| Entity | Depth | Thickness | Hue | CSS var |
|---|---|---|---|---|
| Issue | 1 | 8px | red-500 `#EF4444` | `--color-stripe-issue` |
| To-Do | 1 | 8px | green-500 `#22C55E` | `--color-stripe-todo` |
| Rock | 1 | 8px | indigo-500 `#6366F1` | `--color-stripe-rock` |
| Milestone | 2 | 6px | indigo-500 `#6366F1` (inherits Rock) | `--color-stripe-rock` |
| Headline | 1 | 8px | amber-500 `#F59E0B` | `--color-stripe-headline` |

**Retired in v0.3.0:** Milestone teal-500 `#14B8A6`. Milestones now inherit Rock's indigo and are distinguished from Rocks by thickness (6px vs 8px). Teal is now an unused hue — available for a future entity if needed.

Used in two places: the h1 mark + the row left stripe (rendered via `box-shadow: inset` per `reference_stripe_system.md`).

## Per-list tweaks / decisions

### /issues (the model)
- Category scope (Row 1): Short-Term / Long-Term underline tabs
- State scope (Row 3): All / Unresolved / Resolved tabs with per-tab counts. Default Unresolved.
- Inline done-circle sets `status: "solved"` (green fill + checkmark). Solved rows get strike-through.
- Tri-state Archive picker in Filters popover (Active / Both / Archived).
- Group by: None / Team / Owner
- Bulk actions: Mark solved / Archive / Unarchive (when archive scope ≠ Active) / Clear
- Archive-all-solved button in Row 1 ("Archive all solved").
- **Pattern Detection** — only on /issues. Scope: last 6 months × every team the user has access to × including archived + solved. Scope is deliberately broader than the active view (surfaces things you wouldn't see filtered). Returns clusters with `sourceIssues: [{id, title, status}]`. Pattern cards have: collapsible "View N source issues" list + action palette (Create Rock / To-Do / Headline / Issue — primary follows recommendation, secondaries offered) + per-session Dismiss.

### /todos
- Category scope (Row 1): none — /todos has no category split (all to-dos are the same kind)
- State scope (Row 3): All / Not Done / Done tabs with per-tab counts. Default Not Done.
- Inline done-circle already exists — keep.
- Tri-state Archive picker (Active / Both / Archived).
- Group by: None / Owner / Team / Due-date bucket (overdue → this week → this month → later → no due date)
- Bulk actions: Mark done / Mark not done / Archive / Unarchive / Clear
- Archive-all-done button in Row 1.
- Keep quick-add dashed "+ Add To-Do" row at bottom — /todos-specific, not universal.

### /rocks (shipped 2026-04-25; expanded 2026-05-01 session 44 K-FR-031)
- Primary scope: Year + Quarter selector (Row 1 underline tabs).
- State scope (Row 3): All / Active / Completed — applies to **List view only**. Active = phase ∉ ('complete','cancelled'). Completed = phase === 'complete'. Cancelled surfaces only in All. Default Active.
- **No inline done-circle on rock rows** (phases are multi-step — don't flatten to a toggle). Milestones DO have a state-flip circle (see Milestone-views family below).
- **Multi-view popover (9 layouts)**: List · Planning Board · Goal Coverage · Roadmap · Value/Effort Matrix · Client/Internal Matrix · **Milestone List** · **Milestone Gantt** · **Milestone Planner**. View ▾ popover has two subsections: **Layout** (the nine) and **Group by**. The Group by axis is context-sensitive:
  - **List view**: None / Owner / Team / Quarter / Phase (Quarter hidden when a specific quarter is selected).
  - **Milestone-class views (List/Gantt/Planner)**: None / Owner / Rock / Status (kanban). Default `rock` — Kyle's primary lens.
  - **Other views**: Group by hidden.
- View ▾ button label is the static string `View` — matches /issues + /todos canon (was previously rendering the active layout name; fixed in commit `c83a251`).
- Bulk actions: Archive / Change phase ▾ / Change quarter ▾ / Route to team ▾ / Clear. The ▾ pickers use `Popover` with `placement="top"` so they open upward above the fixed action bar.
- Archive-all-completed-phase icon button in Row 1.
- Roadmap view: rocks are HTML5-draggable across quarter cells per goal row; drop fires `PUT { quarter, year }` with an optimistic local update.
- Two 2×2 matrix views: Value/Effort (Quick Wins / Big Bets / Fill-ins / Money Pits) and Client/Internal Impact (Client Wins / Flagship / Side Bets / Internal Lift). Both include in-place scoring UI for unscored rocks.
- Comment + link badges on row titles (same endpoints as other lists).
- **Right-click on any rock element in any of the 9 layouts** opens the canonical `buildRockActions` menu (Open Details / Ask Rickety / + Linked To-Do/Issue/Headline / Flag / Archive / Delete). See "Right-click universal coverage" below.

### Milestone-views family (List / Gantt / Planner) — 2026-05-01 session 44

The three milestone-class layouts on `/rocks` share a chrome contract that's distinct from the rock-class layouts.

**Row 3-equivalent: quick-filter pills.** Above the chart/grid, a horizontal pill row with four presets: `Active · This week · Past due · All`. Default `active`. Each pill shows a count. State held in page-level `milestoneQuickFilter` and persisted in `rocks.view` sessionStorage. Pill row only renders when `view ∈ {milestones, gantt, planner}`. State-tab Row 3 (All/Active/Completed) is suppressed for these views.

**Subtitle + legend in one row.** Both live at the TOP of the view, NOT below it (Ricky 2026-05-01: legends below charts get missed). Layout: `flex flex-wrap items-center gap-x-4 gap-y-1 mb-3`. Subtitle is `Showing N milestones across M rocks · Q{q} {y}`; legend is a horizontal row of color-dot + label spans. Color tokens — bar/dot/pill colors come from a single `STATUS_FILL` map per view (complete=green-500, past_due=red-500, on_track=blue-500, no_due=gray-400) plus optional rock-status colors (off-track=red-500, at-risk=amber-500, on-track=green-500).

**Rock-status accent dot — `<RockStatusDot status={...} />`.** Small `w-2 h-2 rounded-full` colored dot prefixes any reference to a milestone's parent rock. Tooltip-wrapped (`Rock: {state}`). Surfaces "this milestone is on a struggling rock" without leaving the milestone view. Used in:
- Milestone List rows: prepended to the parent-rock cell, before the rock title.
- Milestone Planner cards: top-left of every card.
- Milestone Gantt: not yet wired (punchlist for left-edge accent on bars).

**Owner filter semantic shift.** The page-level Owner filter narrows by **milestone owner** (not rock owner) inside the milestone-class views — the same chip in the Filters popover, semantic switches per view. Documented deviation; no separate filter control. List + Planner have a separate "Rock owner" column/dot for visual clarity.

**Optimistic complete-toggle.** Every milestone state-flip circle (List rows + card edges) follows session-43 canon (`b776ad9`): mutate local `setRocks` synchronously, fire PUT without await, skip post-PUT reload. Next-paint transition; no refresh blink. Applies in all three milestone views.

**Status pill semantics.** Derived per-milestone:
- `complete` (green): `m.completed === true`
- `no_due` (gray): no `dueDate`
- `past_due` (red): `>10 days` overdue per Kyle's spec (NOT `>0d`)
- `on_track` (blue): everything else (including 0–10d overdue)

**Container-width measurement (Gantt + chart-style views).** Use the canonical callback-ref + window-resize pattern from session 43 (`HistoricalChart`, `MetricChart`). `viewBox = container width 1:1` so labels and bar widths stay true at any drawer/page width.

**Floating right-click menu inside SVG views.** `<ContextMenu>` from `components/ContextMenu.tsx` renders a `<div>` wrapper — invalid markup inside `<svg>`. For SVG views (Gantt), use a state-driven floating menu rendered as a `position: fixed` sibling to the SVG. See `MilestoneGanttView` and `MilestonePlannerView` for the canonical implementation. Same item vocabulary (`buildRockActions` + Mark complete/Reopen prepended); different host element.

## Right-click universal coverage — 2026-05-01

**Every entity element in every list / matrix / board / chart / card surface gets a right-click context menu, no exceptions.** The menu items come from `lib/entity-actions.ts` (`buildRockActions`, `buildIssueActions`, `buildTodoActions`, `buildHeadlineActions`). No bespoke per-view menus.

**Implementation pattern (HTML host):**
```tsx
const ctxItems = buildRockActions(rockLite, rockActionCtx);
return (
  <ContextMenu items={ctxItems}>
    <div onClick={...}>...</div>
  </ContextMenu>
);
```

**Implementation pattern (SVG host — gantt, charts):**
```tsx
const [ctxState, setCtxState] = useState<{x,y,items} | null>(null);
const openCtx = (e, items) => { e.preventDefault(); setCtxState({x: e.clientX, y: e.clientY, items}); };
// On each <g>: onContextMenu={(e) => openCtx(e, buildRockActions(...))}
// Render a fixed-positioned <div> menu sibling outside the <svg>.
```

**Coverage audit (as of session 44):** All 9 `/rocks` layouts wired. The 5 alternate views (Board, Goal Coverage, Roadmap, Value/Effort, Client/Internal) gained right-click in commit `a4d3a67`; List had it from inception. Milestone-class views (List, Gantt, Planner) all have it via the appropriate host pattern. When adding a new view or surface that displays an entity, **wire `buildXActions` immediately** — entity rows without right-click are off-canon.

### /headlines (shipped 2026-04-25)
- No Row-1 category scope.
- State scope (Row 3): All / Active / Dismissed tabs with per-tab counts. Default Active.
- Filters ▾ popover: team override + tri-state archive picker.
- Group headers stay semantic (Cascading Messages / Team Headlines) with counts; no runtime Group by picker.
- Bulk actions: Dismiss / Undismiss / Archive / Unarchive / Delete / Clear.
- Archive-all-dismissed icon button in Row 1.
- Quick-add dashed row below the list (headline-specific — like /todos).

### /meetings (option A shipped 2026-04-25)
- Primary scope (Row 1): Upcoming / Past / Agendas tabs (existing).
- Filters ▾ popover: team override only (archive scope doesn't apply the same way).
- Find modes: Visible + By meaning only (no `?search=` on /api/meetings).
- **No bulk select, no row stripes** — the `<table>` layout doesn't absorb those cleanly. Punchlist if we ever migrate table→cards.
- Per-row actions (Start / Resume / Reschedule / Delete) already live on each row.
- Group by: None / Team / Template
- Row tweaks: meeting has start time + duration; map those to "Age"-like slot
- Find modes still apply; Clear still applies.

## Things NOT in the standard

- Quick-add inline row (the "+ Add X" dashed row at bottom of /todos + /headlines): deliberately NOT universal. Issues / rocks are heavier creation; the `+ Add <Entity>` button in Row 1 opens the full slide-over editor.
- Inline title edit: NOT standard. Always open the slide-over. Rationale: conflict with the entity's full-editor flow, and list pages are for scanning, not editing.
- Bulk select + actions are universal EXCEPT /meetings.
- Pattern Detection is /issues-only (recurrence analysis fits that lens; other entities don't have the same recurring-theme signal).

## Standard primitives (already shipped — use these, don't reinvent)

- `components/Popover.tsx` — click-outside/Esc popover, used for View ▾ / Filters ▾ / Find mode picker. Accepts `align: "left" | "right"`, `width`, `badge`, `className` (for trigger override with `!important` utilities), `placement: "bottom" | "top"` (for popovers that need to open upward, e.g. bulk-action-bar pickers).
- `components/FilterChip.tsx` — dismissable blue pill with × for active filters.
- `components/SortHeader.tsx` — click-sortable header with `align` prop (left / center / right) that stays in sync with the `justify-*` of its content.
- `components/AIContextInspector.tsx` — right-click reveals AI context, data sources (toggleable), custom instructions. Two-phase positioning, 4-edge clamp, flex layout so body scrolls. Wrap any AI-semantic control.
- `components/CreateMenuButton.tsx` — split "+ Add X" button. Main click = page's native create flow. Chevron opens a "Create any" menu with the other three types (Issue / To-Do / Rock / Headline) — picking one navigates to `/<entity>?new=1` which auto-opens that page's create flow.
- `components/CreateTypeSwitcher.tsx` — pill row at the top of each create slide-over (rendered when `isCreating`). Switching types closes the current editor + navigates to target with `?new=1&title=&description=`, carrying the draft forward. Declare as `<CreateTypeSwitcher currentType="issue" getDraft={() => ({ title, description })} onClose={onClose} />`.
- `RefreshButton` — icon-only refresh, `onRefresh={fn}`.
- `lib/use-team-override.ts` — `useTeamOverride()` hook. Returns `{ teamFilter, teamOverride, setTeamOverride, pickTeam, globalTeamId }`. Handles the per-page override semantics (× clears local only, global picker from sidebar resets per-page overrides, hydration-aware reset to avoid wiping on async context load).
- `useTableSort` — `lib/use-table-sort.ts`. Handles sort state + persistence.
- `useSessionStorage` pattern: manual hydrate-once + save-on-change `useEffect` pair per list. Each page reads/writes `<list>.view` including `teamOverride` alongside searchMode, archiveScope, stateTab, groupBy, collapsedGroups. See `/issues/page.tsx` for the reference implementation.
- `<RockStatusDot status={...} />` — file-scope component in `app/rocks/page.tsx` (session 44). Small `w-2 h-2 rounded-full` colored dot tinted by parent rock's status (off_track=red-500, at_risk=amber-500, on_track=green-500, complete=gray-400). Tooltip-wrapped. Use everywhere a milestone references its parent rock. Lift to `components/` if a non-rocks page ever needs it.
- `applyMilestoneQuickFilter()` — file-scope helper in `app/rocks/page.tsx` (session 44). Generic over `T extends { completed, dueDate, derivedStatus }`. Handles Active / This week / Past due / All filtering identically across the three milestone-class views.
- `lib/entity-actions.ts` (`buildRockActions` / `buildIssueActions` / `buildTodoActions` / `buildHeadlineActions`) — canonical right-click action sets. Same vocabulary, same vertical order, same spawn wiring everywhere an entity row appears. See "Right-click universal coverage" above.
