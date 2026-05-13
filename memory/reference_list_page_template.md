---
name: List-page template
description: The canonical assembled structure of an Intrust list page. Single source for "what does a list page look like end-to-end" — synthesizes Band 1 + tabs + Band 2 + persistent sections + row template + column headers into one ordered skeleton. Use this as the scaffold when retrofitting OR creating a new list page. v0.4.3.
type: reference
---

# List-page template

This doc is the **canonical assembled structure** of an Intrust list page. Use it as the scaffold when creating a new list page or retrofitting an existing one against canon. It synthesizes the rules from 10+ scattered canon docs into one ordered shape with TSX snippets, placeholder names, and cross-references for each rule's rationale.

This doc is the **rulebook**; `app/todos/page.tsx` is the **live implementation** of the rulebook. Use whichever fits your workflow:

- **Reading first, then copy:** scaffold from this template, cross-link out for detail when you need it.
- **Copy-paste first:** start from `app/todos/page.tsx`, then cross-check against this template + the linked detail docs.

When the live pilot disagrees with this template, **this template wins** — the pilot has drift to fix. See "Pilot conventions and limits" below.

---

## Placeholder names — search/replace these

When scaffolding a new entity (`Issue`, `Rock`, `Headline`, etc.):

| Placeholder | Replace with example | Notes |
|---|---|---|
| `{Entity}` | `Issue` | Singular, title-case |
| `{entity}` | `issue` | Singular, lowercase |
| `{Entities}` | `Issues` | Plural, title-case |
| `{entities}` | `issues` | Plural, lowercase |
| `{RoleLabel}` | `Raised by` / `Responsible` / `Shared by` | Per `feedback_canonical_role_labels.md` |
| `{role}` | `raisedBy` / `responsible` / etc. | Internal identifier — KEEP entity-specific |
| `{StripeColor}` | `#22C55E` (green for todos) | Per `reference_stripe_system.md` |

Do this search/replace BEFORE anything else when scaffolding. Skipping it makes downstream edits painful.

---

## The complete page skeleton — top to bottom

### 0. Imports + types

```tsx
"use client";
import { useState, useMemo, useRef } from "react";
import { /* ... */ } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import UserPicker from "@/components/UserPicker";
import TeamChip from "@/components/TeamChip";
import RowStateCircle from "@/components/RowStateCircle";
import SearchablePicker from "@/components/SearchablePicker";
import FilterToggle from "@/components/FilterToggle";
import Popover from "@/components/Popover";
import Tooltip from "@/components/Tooltip";
import { formatDueDate, formatEventDate } from "@/lib/format-due-date";
import { useTeamOverride } from "@/lib/use-team-override";
// + page-specific imports
```

### 1. Band 1 — H1 row with team scope picker + right-side action cluster

Per `reference_team_picker.md` (H1 inline scope picker) + `reference_ai_button.md` (AI page actions in Band 1 right cluster).

```tsx
<div className="flex items-baseline justify-between">
  <h1 className="text-2xl font-bold flex items-baseline gap-2">
    <span className="inline-block w-1 h-6 rounded-full bg-[{StripeColor}] self-center" />
    <span className="text-gray-900">{Entities}</span>
    <span className="text-gray-300 font-normal">—</span>
    <SearchablePicker
      triggerShape="inline"
      options={scopeOptions}
      value={scopeValue}
      onChange={handleScopeChange}
    />
  </h1>

  <div className="flex items-center gap-2">
    {/* Refresh icon, Archive folder icon, etc. — optional */}
    {hasPageAIActions && (
      <AIContextInspector feature="{entity}-ai-feature">
        <AIButton onClick={runPageAIAction}>✨ {Action Name}</AIButton>
      </AIContextInspector>
    )}
    <button className="bg-[#0069AA] text-white …">+ Add {Entity}</button>
  </div>
</div>
```

Scope options for the H1 picker (locked order per `reference_team_picker.md`):

```tsx
const scopeOptions: SearchablePickerOption[] = [
  { id: "_private", label: "Private", icon: <Lock /> },
  primaryTeamId && {
    id: primaryTeamId,
    label: primaryTeam.name,
    icon: <TeamChip team={primaryTeam} size="xs" />,
    badge: <span className="text-[9px] uppercase …">Primary</span>,
  },
  { id: "_all", label: "All teams", icon: <Globe /> },
  ...otherTeams.map((t) => ({
    id: t.id,
    label: t.name,
    group: "Other teams",
    icon: <TeamChip team={t} size="xs" />,
  })),
];
```

### 2. Primary-mode tabs (OPTIONAL)

Render only when the entity has fundamentally different sub-types per `reference_primary_mode_tabs.md` (e.g. Short-Term vs Long-Term issues).

```tsx
{hasPrimaryModeTabs && (
  <div className="flex gap-1 mb-6 border-b border-gray-200">
    {tabs.map((t) => (
      <button
        key={t.id}
        onClick={() => setActiveTab(t.id)}
        className={cn(
          "px-3 py-2 text-sm font-medium border-b-2 -mb-[1px]",
          activeTab === t.id
            ? "border-[#0069AA] text-[#0069AA]"
            : "border-transparent text-gray-500 hover:text-gray-700"
        )}
      >
        {t.label}
      </button>
    ))}
  </div>
)}
```

If the page has no primary-mode tabs, skip this section entirely.

### 3. Band 2 — filters row

Per `reference_list_standards.md` v0.4.1 + v0.4.2 updates.

```tsx
<div className="flex flex-wrap items-center gap-2 mb-3">
  {/* Primary picker (Responsibility / Raised-by / per-entity equivalent) */}
  <UserPicker
    role="{RoleLabel}"
    value={responsibilityFilter}
    onChange={setResponsibilityFilter}
    users={allowedUsers}
    teamId={teamFilter}
    allowMe={true}
    unassignedLabel="Anyone"
    align="left"
  />

  {/* Archive switch — ALWAYS inline, ALWAYS binary */}
  <FilterToggle
    label="Archive"
    checked={includeArchived}
    onChange={setIncludeArchived}
    classA="Include archive"
  />

  {/* Signature switch — OPTIONAL, ≤1 per page. SKIP if no obvious candidate. */}
  {hasSignatureSwitch && (
    <FilterToggle
      label={signatureSwitchLabel}
      checked={signatureSwitchValue}
      onChange={setSignatureSwitchValue}
    />
  )}

  {/* Search input — per reference_search_chrome.md */}
  <SearchInput
    value={search}
    onChange={setSearch}
    placeholder={includeArchived ? "Search archive…" : `Search {entities}…`}
    searchMode={searchMode}
    onSearchModeChange={setSearchMode}
  />

  {/* Filters popover — EARNED ONLY (3+ narrow axes beyond inline) */}
  {hasNarrowFiltersPopover && (
    <FiltersPopover>
      {/* Narrow filters: Need, Direct Reports, Type, etc. */}
    </FiltersPopover>
  )}

  {/* Clear pill — only when state is off-default */}
  {isOffDefault && (
    <button onClick={resetFilters} className="…">
      <RotateCcw className="w-3 h-3" /> Reset
    </button>
  )}

  <div className="flex-1" />

  {/* ⋮ kebab — pinned far right, view preferences live here */}
  <Popover
    align="right"
    width={200}
    trigger={<MoreVertical className="w-4 h-4" />}
  >
    <div className="space-y-3">
      <div>
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Layout</div>
        {/* List / Compact pill picker */}
      </div>
      <div>
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Group by</div>
        {/* None / Owner / Team / Due pill picker */}
      </div>
      <div className="pt-2 border-t border-gray-100">
        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Actions</div>
        {groupBy !== "none" && (
          <div className="flex gap-2 mb-2">
            <button>Expand all</button>
            <button>Collapse all</button>
          </div>
        )}
        <button onClick={resetView}>Reset to defaults</button>
      </div>
    </div>
  </Popover>
</div>
```

**Active filter chips** wrap to a SEPARATE row BELOW Band 2 — never crowd the kebab. Chip wrap geometry: `flex flex-wrap gap-2 mb-3`.

### 4. (Retired v0.4.7) Persistent section

The always-on attribute section pattern (Stractical-at-top, Done-at-bottom, etc.) was retired in v0.4.7. The use case it solved on /issues is now handled by default Group-by = Type in the ⋮ view kebab + the parent-type inheritance signal on the breadcrumb (per `reference_list_row_column_order.md`). Skip this slot when scaffolding a new list page.

### 5. Column header strip (Band 4)

Per `reference_list_row_column_order.md` — order MUST match `[bulk][drag][state][TITLE][indicators][resp-A][resp-B][date][team]`.

```tsx
<div className="sticky top-{N} bg-white border-b border-gray-200 flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
  <div className="w-4" /> {/* bulk */}
  <div className="w-4" /> {/* drag */}
  <div className="w-5" /> {/* state */}
  <SortHeader sortKey="title" className="flex-1 text-left">Title</SortHeader>
  <div className="w-auto" /> {/* indicators — no header label, inline meta */}
  <SortHeader sortKey="{responsibilityFieldName}" className="w-14 text-center">{RoleLabel}</SortHeader>
  {hasRespB && <SortHeader sortKey="{respBField}" className="w-14 text-center">{RespBLabel}</SortHeader>}
  <SortHeader sortKey="{dateFieldName}" className="w-24 text-right">{Date Column Name}</SortHeader>
  <div className="w-20 text-center">Team</div>
</div>
```

### Header ↔ row alignment — STRICT MATCH

Header strip and row template MUST use the SAME alignment, gap, padding, and column widths. Any drift here causes visible vertical misalignment between column labels and the data below them.

**Locked across header AND row:**
- Outer container: `flex items-center gap-2 px-3` — `items-center` is mandatory (vertical center), `gap-2` matches, `px-3` matches.
- Vertical padding: header uses `py-2`; row uses `py-3` (List) or `py-1.5` (Compact). The vertical CENTER of each is what aligns with `items-center` — different paddings still center-align cleanly.
- Per-column widths: every `w-{N}` declaration on a header column MUST match the same `w-{N}` on the corresponding row cell. Example: header has `w-14 text-center` for Resp-A → row has `w-14 flex-shrink-0 flex items-center justify-center` for Resp-A.
- Per-column text alignment: `text-left` for title; `text-center` for avatars / pills / boolean indicators; `text-right` for numeric + date columns. The header `text-{align}` MUST match the row's content alignment.

**Anti-pattern checklist:**
- `items-start` on either header or row → vertical drift
- Mismatched gap or padding → horizontal drift
- Header `w-12` + row `w-14` → column misalignment
- `text-left` on header + centered avatar in row → label sits left of the avatars below it

When the column strip and the rows don't line up, this is the first place to look.

### 6. List rows

Per `reference_list_row_column_order.md` row template. Each row matches the column header order. Row template:

```tsx
<div className="flex items-center gap-2 px-3 py-3 hover:bg-gray-50 cursor-pointer">
  <Checkbox className="w-4" />
  <DragHandle className="w-4" /> {/* optional */}
  <RowStateCircle done={item.done} onToggle={...} tooltip={...} className="w-5" />

  {/* Title block — flex-1, contains breadcrumb + title + notes + commentMatch */}
  <div className="flex-1 min-w-0">
    {/* Parent-link breadcrumb (v0.4.4) — blue text ABOVE title, NEVER a pill */}
    {item.parentLinks && item.parentLinks.length > 0 && (
      <div className="mb-0.5">
        <Tooltip text={item.parentLinks.map(p => `${p.type}: ${p.title}`).join(" · ")}>
          <span className="inline-flex items-center gap-1 text-xs text-[#0069AA]">
            {item.parentLinks.map((p, i) => (
              <Fragment key={p.id}>
                {i > 0 && (
                  p.relation === "child" /* hierarchical */
                    ? <ChevronRight className="w-3 h-3 text-gray-400" />
                    : <span className="text-gray-400">·</span> /* peer */
                )}
                <span>{p.title}</span>
              </Fragment>
            ))}
          </span>
        </Tooltip>
      </div>
    )}

    {/* Title */}
    <span className={cn("text-sm font-medium", item.done ? "line-through text-gray-400" : "text-gray-800")}>
      <Highlight text={item.title} queries={searchHighlight} />
    </span>

    {/* Notes preview */}
    {item.notes && !compact && (
      <p className="text-xs text-gray-500 truncate mt-0.5 max-w-[280px]">
        <Highlight text={item.notes} queries={searchHighlight} />
      </p>
    )}

    {/* Comment-search hit indicator */}
    {item.commentMatch && (
      <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
        <MessageCircle className="w-3 h-3" />
        <Highlight text={item.commentMatch.snippet} queries={[search]} />
      </div>
    )}
  </div>

  {/* Indicators slot — two types per v0.4.4 */}
  <div className="flex items-center gap-1.5">
    {/* Icon-counted indicators — bare icon + number, NO pill chrome */}
    {item.linkedCount > 0 && (
      <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
        <Link className="w-3 h-3" /> {item.linkedCount}
      </span>
    )}
    {item.commentCount > 0 && (
      <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
        <MessageCircle className="w-3 h-3" /> {item.commentCount}
      </span>
    )}
    {/* Textual indicators — pill chrome */}
    {item.need && (
      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#0069AA]/8 text-[#0069AA] capitalize">
        {item.need.label}
      </span>
    )}
  </div>

  {/* Resp-A — primary responsibility, full opacity, shape encodes type */}
  <div className="w-14 flex-shrink-0 flex items-center justify-center">
    {item.{responsibility}Type === "team"
      ? <TeamChip team={item.{responsibility}} size="sm" />
      : <UserAvatar name={item.{responsibility}?.name} role="{RoleLabel}" size="sm" />
    }
  </div>

  {/* Resp-B — optional, opacity-70 */}
  {hasRespB && (
    <div className="w-14 flex-shrink-0 flex items-center justify-center">
      {item.{respB}Type === "team"
        ? <TeamChip team={item.{respB}} size="sm" className="opacity-70" />
        : <UserAvatar name={item.{respB}?.name} role="{RespBLabel}" size="sm" className="opacity-70" />
      }
    </div>
  )}

  {/* Date — right-aligned numeric */}
  <span className="w-24 text-right text-xs">{formatDate(item.{dateField}).label}</span>

  {/* Team / Private — center-aligned */}
  <div className="w-20 flex items-center justify-center">
    {item.visibility === "private"
      ? <Tooltip text="Private"><Lock className="w-3.5 h-3.5" /></Tooltip>
      : item.team && <TeamChip team={item.team} size="sm" />}
  </div>

  {/* Cross-tab badge (v0.4.2) — only when row is from a sibling primary-mode tab */}
  {row.tab !== activeTab && searchMode !== "filter" && (
    <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
      {siblingTabLabel}
    </span>
  )}
</div>
```

---

## Per-entity exceptions

Common exceptions documented in canon. Apply explicitly when scaffolding:

- **/issues:** no due-date, no Resp-B. Tail order: `[stractical glyph][need][Resp-A=Raised by][created/age via formatEventDate][team]`. Per `reference_list_row_column_order.md`.
- **/headlines:** TBD on swept structure.
- **/rocks:** has milestones as sub-entities — they render with `<UserAvatar role="Delegated to">` (not Responsible).

Document a new exception in `reference_list_row_column_order.md` when discovered.

---

## Pilot conventions and limits

This template is the canonical scaffold; `app/todos/page.tsx` is the live implementation. Both are reference surfaces, but they play different roles:

- **Template = source of truth for shape.** When canon adds a pattern, the template is updated FIRST. The live pilot follows.
- **Pilot = catches bugs in practice.** Real code, exercised daily, validates that the template assembles into a working page.
- **When pilot disagrees with template, template wins.** Pilot has drift. Audit + fix.

### Risks of pilot-as-only-reference (this template mitigates them)

1. **Pilot drift contaminates downstream.** If /todos has a bug (e.g. the X-clear vertical-center bug we shipped), every page copying from /todos inherits it. Mitigation: scaffold from THIS template; use /todos only as a working example to cross-check.
2. **Pilot lacks patterns it never needed.** /todos has no primary-mode tabs, no AI page action originally, no Stractical persistent section. This template covers every pattern; agents don't have to hunt for the right page to copy.
3. **Pilot lag.** Canon adds a new pattern → template updated immediately → pilot adopts when convenient. During the gap, the template has the pattern, the pilot doesn't. Agents reading "scaffold from /todos" would miss it. Mitigation: scaffold from THIS template; the template is always current.
4. **/todos-specific changes diverge silently.** Perf tweaks, hook refactors, page-only logic on /todos doesn't propagate. Mitigation: code that's been forked stays forked; canon-conformance is the contract, not bytewise equivalence with /todos.
5. **Multiple "right" examples accumulate.** 5+ pages copying from /todos = 5+ implementations to drift. Mitigation: this template is the canonical reference; the pages are downstream artifacts.

### Cross-app pilots

For Playbook and future apps, **a separate pilot lives in that app's repo.** Don't try to scaffold Pb pages from this OS-flavored template — the entities and chrome differ.

The pattern: per-app pilot + this canon template = the shape source. When Pb canonization begins (Stage 5), pick a Pb pilot (likely `/content`), apply this template's structure to it (with Pb-specific entity hues + tweaks per `reference_list_standards_playbook.md`), then sweep other Pb pages from THAT pilot.

### Audit cadence

Before propagating from the pilot to a new page (i.e. scaffold-from-pilot strategy):
1. Audit the pilot against canon. Find any drift.
2. Fix the pilot.
3. THEN propagate.

A "pilot audit pass" should happen whenever (a) canon shifts (e.g. v0.4.1 / v0.4.2 batches), (b) the pilot hasn't been swept in a few canon versions, or (c) before any multi-page sweep wave.

---

## Embedded list contexts (meeting runner, dashboard widgets, etc.)

The list-page chrome (filters, search, row template, column headers) is the **unit of reuse**, regardless of where it's mounted.

- **Standalone:** `/issues` mounts at a route, has the full Band 1 + Band 2 + tabs + persistent section + rows.
- **Embedded in meeting runner:** The Issues section inside the runner uses the SAME inner-list template, wrapped by meeting-specific chrome (section header, prev/next nav, timer, "mark complete," "add to discussion").
- **Embedded as dashboard widget:** Similar — same inner list, wrapped by widget chrome (smaller header, "see all" link, narrower column set).

**Rules for embedded contexts:**
- Inner list reuses this template as-is.
- Outer wrapper has its own canon doc (e.g. `reference_meeting_runner.md` — TBD).
- Inner-list features MAY be disabled or hidden in the embed — document the exceptions inline (e.g. "scope picker is hidden inside meeting runner because the meeting fixes the team scope"). Don't reshape the list to fit; suppress what doesn't apply.
- Cross-tab search behavior, primary-mode tabs, persistent sections all still apply inside the embed. If the standalone /issues has Stractical at the top, the meeting-runner Issues section has Stractical at the top too. Per `feedback_meeting_runner_consistency.md`.

---

## How to use this template (scaffolding methodology)

When creating or retrofitting a list page:

1. **Read this template end-to-end.** Form a mental map of every section.
2. **Identify what your entity needs.** Primary-mode tabs? Persistent sections? Filters popover? AI page actions? Resp-B slot?
3. **Copy the template structure** into your new page. Search-replace the placeholders.
4. **Drop sections that don't apply.** (E.g. /todos has no primary-mode tabs — delete that section. /issues has no due-date column — delete that slot from row + header.)
5. **Apply per-entity exceptions** documented in canon (column order, label changes, etc.).
6. **Wire the data + handlers.** This is the only page-specific code that doesn't come from the template.
7. **Diff your final result against `app/todos/page.tsx`** to catch unintended chrome drift. Visual = chrome should match unless an exception is documented.
8. **Ship + screenshot back** for canon-master review.

---

## See also

- `reference_list_standards.md` — overall anatomy + Band 2 order + popover threshold
- `reference_list_row_column_order.md` — column slot grid + per-entity exceptions
- `reference_search_chrome.md` — Find input + three modes + cross-tab scope
- `reference_team_picker.md` — H1 scope picker option order + "Private" lock
- `reference_primary_mode_tabs.md` — when to add tabs + filter scope behavior
- `reference_list_view_kebab.md` — ⋮ kebab content + layout
- `feedback_canonical_role_labels.md` — Responsible / Raised by / Shared by / Delegated to / Due to
- `feedback_unsaved_guard_semantics.md` — editor close-path semantics
- `feedback_search_comment_inclusion.md` — Anywhere mode includes comment bodies
- `feedback_done_not_done.md` — "Done" / "Not done" copy lock
- `reference_canon_sweep_field_notes.md` — sweep methodology + D-entries to check
