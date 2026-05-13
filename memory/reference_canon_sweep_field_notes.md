---
name: Canon-sweep field notes
description: Catalog of commonly-found drift patterns + implementation bugs to look for when sweeping a page against canon. Each entry is concrete with a grep recipe + the canonical replacement. Updated as new drift is discovered.
type: reference
originSessionId: s60-2026-05-10
---

# Canon-sweep field notes

When asked to "sweep page X against canon," start here. This doc catalogs the patterns we've found to be common sources of drift OR cursory-check bug surfaces. Each entry is **categorized**, **described in plain English**, given a **grep recipe**, and points to the **canonical replacement**.

Two categories:
- **`drift`** — visual or pattern divergence from canon. Mechanical fix.
- **`bug`** — implementation problem to spot-check. "Wires connected correctly?" — does state populate the UI, does the API return what the UI expects, does the right scope of options show up.

Run the greps as a starting checklist, then read the actual code at each hit to decide if the pattern actually applies (false positives are common with grep).

---

## Sweep methodology — scaffold-from-pilot (v0.4.2)

**Canonical strategy when retrofitting a list-page against canon: copy from the pilot, then modify what genuinely differs.**

The previous "surgical edits against existing code + apply each canon rule" approach is unreliable. Canon rules require interpretation; existing code has its own drift. Composing 20+ rules against drifted code means agents pick the wrong rule, miss a rule, or land different visuals on different pages. We saw this fail on /issues during the v0.4.1 sweep — multiple iterations + screenshot rounds before convergence.

**The scaffold-from-pilot approach:**

1. **Identify the pilot.** For OS list pages, the pilot is `app/todos/page.tsx`. For OS entity editors, the pilot is `components/TodoDetailEditor.tsx`. For Playbook (when its canon arrives), pick a Pb-specific pilot — usually `/content` list.
2. **Copy the pilot file verbatim** as the new page's starting structure.
3. **Replace entity-specific strings** — `todo` → `issue`, "To-Dos" → "Issues", etc. Use grep + replace; don't hand-rewrite.
4. **Apply per-entity exceptions explicitly** documented in canon (e.g. /issues has no due-date column per `reference_list_row_column_order.md` /issues exception clause).
5. **Add page-distinctive features** (primary-mode tabs, persistent sections, AI page actions, filter axes) by porting from existing source code INTO the scaffold — not the other way around.
6. **Diff-check against pilot** before committing. Any unintended divergence in chrome (Band 2 spacing, kebab shape, search input padding) is drift. Fix to match pilot.

**Why this works.** Pixel-level fidelity comes from byte-level copy. The pilot already encodes every canon rule in working code. The agent doesn't have to interpret "kebab placement" or "filter view sizes" — they're literally /todos until proven otherwise.

**Failure mode to avoid: pilot drift.** The pilot ITSELF can drift from canon over time. Before sweeping other pages from the pilot, verify the pilot is conformant. A pilot audit pass — sweep the pilot against its own canon — is recommended whenever (a) the pilot hasn't been audited recently, OR (b) the canon has shifted since the last pilot audit. Don't propagate pilot drift to N pages.

---

---

## category: drift

### D1. Inline `<svg><path d="..."/></svg>` instead of Lucide
- **What it is:** Hand-painted SVG path data in JSX for icons that have a Lucide equivalent.
- **Why it's drift:** `reference_icon_library.md` — UI/action icons should be Lucide. Inline SVG is pre-canon copy-paste; consistent stroke/weight is lost; future icon swaps require hand-editing path data.
- **Replacement:** `<IconName className="..."/>` from `lucide-react`. Common mappings:
  - chevron-down `M19 9l-7 7-7-7` → `<ChevronDown>`
  - chevron-right `M9 5l7 7-7 7` → `<ChevronRight>`
  - check `M5 13l4 4L19 7` → `<Check>`
  - search-glass `M21 21l-6-6...` → `<Search>`
  - alert-triangle `M12 9v2m0 4h.01M4.93 19...` → `<AlertTriangle>`
  - clock `M12 8v4l3 3m6-3a9 9 0...` → `<Clock>`
  - rotate-cw `M4 4v5h.582m15.356 2A8.001...` → `<RotateCw>` (or `RotateCcw` for the reset variant `M3 12a9 9 0 1 0 9-9...`)
  - lock `M12 15v2m-6 4h12a2 2...` → `<Lock>`
  - message-circle `M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418...` → `<MessageCircle>`
  - info-circle `M13 16h-1v-4h-1m1-4h.01M12 22c5.523...` → `<Info>`
  - archive `M5 8h14M5 8a2 2 0 110-4...` → `<Archive>`
  - spinner `<circle ... animate-spin>` → `<Loader2 className="animate-spin">`
  - arrow-right `M13 7l5 5m0 0l-5 5m5-5H6` → `<ArrowRight>`
- **Grep:** `grep -nE '<svg' app/**/page.tsx components/**.tsx`

### D2. Hand-rolled row state-flip circle instead of `<RowStateCircle>`
- **What it is:** A `<button>` with `w-5 h-5 rounded-full border-2` toggling done/resolved state inline on a list row.
- **Why it's drift:** Identical 12-line block was duplicated across /todos AND /issues (and copy-pasteable elsewhere). `<RowStateCircle>` (s60) is the canon shared primitive — Tooltip-wrapped, stops propagation, green-fill+Check-icon when done.
- **Replacement:** `<RowStateCircle done={x.completed} onToggle={() => toggle(x)} tooltip={x.completed ? "Mark not done" : "Mark done"} />`
- **NOT to be confused with `<StatusPicker>`** — that's the slide-over editor's top-left status icon (rounded-square dropdown). RowStateCircle is the row-level click-to-flip circle.
- **Grep:** `grep -nE 'w-5 h-5 rounded-full border-2' app/**/*.tsx`

### D3. Hand-rolled team initial-circle instead of `<TeamChip>`
- **What it is:** A `<div>` with `rounded-full bg-amber-100 ... charAt(0)` style code rendering a team's first letter. OR a `<TeamChip>` callsite still passing `shape="circle" | "square"` (the prop was retired in v0.4.0).
- **Why it's drift:** `<TeamChip>` is canonical; it picks up team color, glyph badge, and tooltip. `charAt(0)` rendering loses all of that. The `shape` prop was removed in v0.4.0 — TeamChip is ALWAYS rounded-square (per `reference_status_pill_semantics.md` v0.3.15).
- **Replacement:** `<TeamChip team={team} size="sm" />` (no `shape` prop). Person avatar stays `<UserAvatar>` (circle). Shape encodes type — circle = person, rounded-square = team — disambiguates everywhere.
- **Grep:** `grep -nE 'charAt\(0\)|\.charAt\(0\)' components/**/*.tsx app/**/*.tsx` for hand-rolled circles; `grep -nE 'TeamChip[^>]*shape=' app/**/*.tsx components/**.tsx` for stale `shape` prop callsites.
- **First sweep target (v0.4.0):** /todos has 4 `shape="square"` callsites at `app/todos/page.tsx:727/749/1539/1578`. Drop the prop.

### D4. Hand-rolled user-avatar circle instead of `<UserAvatar>`
- **What it is:** Hand-built `<div>` with `rounded-full bg-[#0069AA] text-white` rendering initials directly.
- **Why it's drift:** `<UserAvatar>` is canon. Hand-rolled circles miss the role tooltip, miss `getInitials` edge cases, and don't scale to size variants.
- **Replacement:** `<UserAvatar name={name} role="..." size="sm" />`.
- **Grep:** `grep -nE 'rounded-full.*backgroundColor.*0069AA|getInitials\('`

### D5. Native `<select>` over a long user list (>10 users)
- **What it is:** `<select>{users.map(...)}</select>` listing 70+ users.
- **Why it's drift:** Per `reference_user_picker.md` we should use `<UserPicker>` (search-friendly). Native select for 70 users is genuinely painful UX.
- **Replacement:** `<UserPicker role="..." teamId={...}>`. Note: `<UserPicker>` is per-canon spec but may not yet be implemented in OS — if it doesn't exist, file or expand punchlist #565 (f).
- **Grep:** `grep -B2 -A3 'users.map.*<option' components/**/*.tsx`

### D6. Headers / labels using legacy "Owner" or "Assigned to"
- **What it is:** UI strings reading "Owner: <name>", "Assigned to:", or columns titled "Assigned" / "Owner". Or `<UserAvatar role="Owner">` / `<UserAvatar role="Assigned to">`.
- **Why it's drift:** v0.4.0 canon — "Responsible" replaces both for top-level work; "Delegated to" for sub-work (milestones). Per `feedback_canonical_role_labels.md`. Active-voice over passive: Owner/Assignee read as category-slots; Responsible reads as engagement.
- **Replacement:** Update render strings + UserAvatar `role` props per the canon table. Internal code identifiers (schema fields `ownerId`/`assignedToId`, sortKeys, groupBy keys) stay — rule is render-layer only. `<UserAvatar role>` union retains legacy values for one sweep cycle then drops them (forward-only).
- **Exclusions — do NOT replace:** `"Raised by"` (issues) and `"Shared by"` (headlines) ARE the canonical responsibility label for those entities (named for the originating action). Don't touch them. `"Due to"` (todo recipient slot) stays — it's a passive-exemption for entity-edge recipients.
- **Grep:** `grep -nE '(Owner|Assigned to)["'\''>: ]|role="(Owner|Assigned to)"' app/**/*.tsx components/**/*.tsx`
- **Sweep priority (#773):** /rocks → Milestones (introduces "Delegated to") → /scorecard → /mini-games → HIP. /issues + /headlines already conformant. /todos shipped in s60+s61.

### D7. Bare `confirm()` calls instead of `confirmDestructive` / `confirmAction`
- **What it is:** Native browser `confirm("Are you sure?")` for destructive flows.
- **Why it's drift:** Canon uses `lib/confirmDestructive` (red, Cancel-focused) for destructive confirms and `lib/confirmAction` (blue) for non-destructive. Per `reference_confirm_dialog.md`.
- **Replacement:** Wrap in `confirmDestructive({ title, body, confirmLabel, onConfirm })`.
- **Grep:** `grep -nE 'confirm\("' app/**/*.tsx components/**/*.tsx`

### D8. Native `title=` attribute instead of `<Tooltip>`
- **What it is:** `title="..."` HTML attribute used as a tooltip on a button or icon.
- **Why it's drift:** `<Tooltip>` is canon. Native `title` styling can't be controlled and hover delay is wrong.
- **Replacement:** `<Tooltip text="...">child</Tooltip>`.
- **Grep:** `grep -nE 'title="' app/**/*.tsx components/**/*.tsx | grep -v aria-label`

### D9. DUE-DATE display via raw `toLocaleDateString` instead of `formatDueDate`
- **What it is:** Inline `new Date(x).toLocaleDateString(...)` for **due-date** rendering (todos, rocks, milestones — anything with future-tense urgency).
- **Why it's drift:** `lib/format-due-date.ts:formatDueDate` is canonical; produces `Apr 18 (-13d)` / `May 1 (today)` format with signed delta + status bucket. Per `reference_date_format.md`.
- **Scope (v0.4.1):** Due-dates ONLY. For event timestamps (createdAt, routedAt, publishedAt), use D9b.
- **Replacement:** `const due = formatDueDate(dueDate);` then `due.label` + `due.status` for color rules.
- **Grep:** `grep -nE 'toLocaleDateString|toLocaleString' app/**/*.tsx components/**/*.tsx` then check whether the date is a due-date (use D9) or an event timestamp (use D9b).

### D9b. EVENT-TIMESTAMP display via raw `toLocaleDateString` instead of `formatEventDate`
- **What it is:** Inline date formatting for event timestamps like `createdAt`, `routedAt`, `publishedAt`, `archivedAt` — dates that name a past event, not a future obligation.
- **Why it's drift:** Event timestamps have NO urgency framing. The signed-delta format from `formatDueDate` (e.g. `Apr 18 (-4d)`) reads wrong on a created-4-days-ago row — the user reads `(-4d)` as "4 days overdue" when it should mean "4 days ago." `lib/format-due-date.ts:formatEventDate` produces `Apr 18 (12d ago)` / `May 12 (today)` — always positive delta + "ago" suffix.
- **Scope (v0.4.1):** Event timestamps ONLY. For due-dates, use D9.
- **Replacement:** `const ts = formatEventDate(createdAt);` then `ts.label`. No status bucket (event timestamps don't carry urgency).
- **Grep:** same as D9 — distinguish by whether the field is a past event or a future obligation.
- **Helper impl:** `lib/format-due-date.ts:formatEventDate` shipped in `intrust-os` commit 91a2cb3.

### D10. Hand-rolled colored-pill statuses ignoring `status-colors.ts`
- **What it is:** Inline `bg-yellow-100 text-yellow-700` etc. for status indicators.
- **Why it's drift:** `lib/status-colors.ts` centralizes mappings (`ISSUE_STATUS_COLORS`, `ROCK_PHASE_COLORS`, etc.). Inline strings drift away from the source of truth and are hard to update.
- **Replacement:** `resolveStatusColor(entityType, status)` → returns the canonical class string.
- **Grep:** `grep -nE 'bg-(yellow|amber|green|red|blue)-100 text-(yellow|amber|green|red|blue)-700' app/**/*.tsx`

### D11. Custom popover/dropdown instead of `<Popover>` primitive
- **What it is:** Hand-rolled "absolute positioned div + click-outside listener + open-state toggle" implementing a popover from scratch.
- **Why it's drift:** `components/Popover.tsx` is canon — handles align, width, click-outside, keyboard escape, z-index stack. Hand-rolled versions miss one or more of these consistently.
- **Replacement:** `<Popover trigger={...} align="right" width={200}>...</Popover>`.
- **Grep:** `grep -nE 'absolute.*top-full.*z-' app/**/*.tsx components/**/*.tsx`

### D12. Hardcoded brand color `#0069AA` instead of utility / CSS var
- **What it is:** Inline `style={{ backgroundColor: "#0069AA" }}` or `bg-[#0069AA]` scattered across components.
- **Why it's drift:** Brand color should flow from the canon Tailwind v4 `@theme` block / CSS var per `reference_color_palette.md`. Hardcoded hex values defeat dark-mode prep + central recoloring.
- **Replacement:** Tailwind utility class via the theme (`bg-brand`, `text-brand`) or CSS var (`var(--color-brand)`). Today the `bg-[#0069AA]` form is widespread and accepted as transitional, but new code should use the variable.
- **Grep:** `grep -nE '#0069AA|0069aa' app/**/*.tsx components/**/*.tsx`

### D13. Hand-rolled banner div instead of `<AlertBanner>`
- **What it is:** Inline `<div className="bg-amber-50 border border-amber-200 rounded-lg p-3...">...</div>` for an alert/info banner.
- **Why it's drift:** `<AlertBanner tone="warning|danger|info|success" title=... description=...>` is canon. Hand-rolled banners drift in tone palette + spacing + icon + dismiss behavior.
- **Replacement:** `<AlertBanner tone="warning" title="..." description="..." />`.
- **Grep:** `grep -nE 'bg-(amber|red|blue|green)-50 border.*rounded-(md|lg)' app/**/*.tsx`

### D14. Save-button verb drift
- **What it is:** Editor footer buttons saying "Save" / "Update" / "OK" / "Confirm" / "Done" instead of the canon set.
- **Why it's drift:** Per `reference_editor_footer_verbs.md` v0.3.19. Edit = `Save & Close`. Create = `Create {Type}` OR a domain verb when more natural (Add to scorecard, Schedule Meeting, Create Plan). Loading = `Saving…` / `Creating…` / `Adding…` etc. with ellipsis char `…`.
- **Replacement:** Audit footer text against the canon. NEVER ship "Save" alone or "Done" — those are too ambiguous. Three-dot `...` for loading is also drift — use ellipsis char `…`.
- **Grep:** `grep -nE '>Save<|>Done<|>OK<|>Update<|>Confirm<|\.\.\.<' components/**/*.tsx`
- **Status (s61):** TodoDetailEditor, IssueDetailEditor, RockDetailEditor, MeasurablePanel, Headlines slide-over, Directory user/team modals, Meetings template modal all CONFORM. Outstanding sweep: smaller modals/dialogs across /vto, /mini-games, /hip, /scorecard wizards.

### D15. Stripe inline `border-l-4 border-l-[#HEX]` instead of `stripeStyle()`
- **What it is:** Hand-rolled left-border stripes on entity rows using inline hex values.
- **Why it's drift:** `lib/stripes.ts:stripeStyle({color, depth, state})` is the canonical helper per `reference_stripe_system.md`. Stripe canon includes flagged-state outboard ribbon (`<FlaggedTab/>`) and depth ladder (Rock 8px / Milestone 6px / etc.). Inline stripes miss the depth + state semantics.
- **Replacement:** `style={stripeStyle({ color: "rock", depth: 8, state: flagged ? "flagged" : "default" })}` plus a `<FlaggedTab/>` if flagged.
- **Grep:** `grep -nE 'border-l-(2|4|6|8) border-l-\[#' app/**/*.tsx components/**/*.tsx`
- **Tracked:** punchlist #565 (a).

### D16. `console.log` left in production code
- **What it is:** Diagnostic `console.log(...)` statements forgotten after debugging.
- **Why it's drift:** Production code shouldn't ship debug logs. They leak internal state to anyone with devtools and add noise.
- **Replacement:** Remove. If genuinely needed, use a structured logger.
- **Exception:** This branch DOES leave diagnostic logs in `handleReorderDrop` until Ricky confirms drag is rock-solid. They're slated for a final cleanup commit before merge — DO NOT strip prematurely without checking the pickup-prompt for active diagnostics.
- **Grep:** `grep -nE 'console\.(log|debug|warn)' app/**/*.tsx components/**/*.tsx`

### D17a. Redundant indicators with overlapping semantics
- **What it is:** Two row indicators counting subsets of the same logical thing. /todos s60 had AlertTriangle (issues spawned via parentType+parentId) + Link2 (EntityLink rows) — but an issue IS an item, and linking an issue manually went into Link2 but not AlertTriangle. User confusion: "why does one count change and not the other?"
- **Why it's drift:** Visual real estate is precious. Two indicators counting overlapping concepts split the count, create false negatives, and confuse the user. One indicator with a breakdown-by-type tooltip is cleaner and complete.
- **Replacement:** Merge into a single indicator. API returns `linkedItemsByType: { issue: N, rock: N, ... }`. Row shows total + Link2 icon. Tooltip enumerates: "3 linked items — 1 issue, 1 rock, 1 headline". Different DATA paths (parentType vs EntityLink) merge into the same UI signal.
- **Real example:** /todos s60 — merged AlertTriangle + Link2 into single Link2 indicator with per-type tooltip.
- **Smell test:** "If I do action X (link, spawn, reference), do BOTH indicators that could plausibly change actually change?" If only one does, the indicators are split-counting the same thing.

### D21. List-page Anywhere search doesn't include comment bodies
- **What it is:** A list-page deep/Anywhere search route (`/api/{entity}/route.ts` with `search` param) ORs over title + description/notes only — comments not searched. Discussion-only matches are invisible to users.
- **Why it's drift:** Per `feedback_search_comment_inclusion.md` v0.3.18. Anywhere mode promises "anywhere" — comments are part of an entity's user-facing surface.
- **Replacement:** Add comment pre-scan (`prisma.comment.findMany({ entityType: ..., text contains ... })`), union matched IDs into the WHERE OR, return `commentMatch: { snippet, author }` per row when title + notes both missed. Row renders the `<MessageCircle>` indicator under the title block.
- **Also update `lib/search.ts` (`searchOS`)** — done in s61 for rock/issue/todo. ⌘K rows auto-render `hitField="comment"` via existing GlobalSearch primitive.
- **Grep:** `grep -nE "where.*search|title.*contains" app/api/*/route.ts` → check each entity-list route. Look for entries that handle `search` but don't pre-scan Comment.
- **First fix:** `/api/todos` + `lib/search.ts` rock/issue/todo branches (s61). Outstanding: `/issues`, `/rocks`, possibly `/headlines`.

### D20. Unsaved-guard fires on a clean form (init effect missing dirty-reset)
- **What it is:** Editor's form-init `useEffect` hydrates state from `todo`/`prefill` but never resets `dirtyRef.current = false`. Persisted-mount editors carry stale dirty across opens — symptom: open fresh entity + immediately X → "Discard unsaved changes?" prompt fires with zero changes made.
- **Why it's drift:** Per `feedback_unsaved_guard_semantics.md` (v0.3.17). Init = clean slate by definition.
- **Replacement:** Last line of the init effect: `dirtyRef.current = false;`.
- **Grep:** `grep -nE 'dirtyRef|markDirty' components/*DetailEditor.tsx` → check each editor's init useEffect ends with the reset. Also grep `confirmAction.*Discard` → every editor with this prompt needs the init-reset.
- **Bonus drift in same area:** Cancel button calling `handleClose` (which prompts) instead of bypassing the guard. Cancel = explicit abandon, should be `onClick={() => { dirtyRef.current = false; onClose(); }}`. Per v0.3.17 split: Cancel bypasses, X/Esc/backdrop prompt.

### D19. SearchablePicker without `align="right"` in a right-column cell
- **What it is:** A `<SearchablePicker>` (or `<UserPicker>`) placed in the right column of a 2+ column grid, OR anywhere near the right edge of a slide-over / drawer, without `align="right"`.
- **Why it's drift:** Slide-over body uses `overflow-y: auto` → CSS auto-promotes `overflow-x` to `auto` too. A 320px popover anchored `left-0` from a narrow right-column trigger overflows the container's right edge → triggers horizontal scroll → editor visibly shifts when picker opens.
- **Replacement:** Pass `align="right"` on the picker. Panel anchors to the trigger's right edge and extends left into the form. Per `reference_searchable_picker.md` v0.3.16.
- **Grep:** `grep -nE 'SearchablePicker|UserPicker' app/**/*.tsx components/**.tsx` then check each hit — is it in a `grid-cols-2`/`grid-cols-3` right cell, or near the right edge of a SlideOver/Drawer? Missing `align="right"` is the drift.
- **First fix:** TodoDetailEditor Due-To Team picker (s61).

### D18. Native `<select>` on an entity list or ≥10-option list
- **What it is:** Native `<select>` listing users, teams, rocks, milestones, metrics, courses, or any DB-backed entity collection — or any fixed list with ≥10 options.
- **Why it's drift:** Per `reference_searchable_picker.md` v0.3.14 threshold rule. Native `<select>` only does first-char-jump, no visible search, no avatars/metadata, and silently degrades as the underlying list grows. Inconsistent with `<SearchablePicker>` everywhere else.
- **Replacement:** `<UserPicker>` for users, `<SearchablePicker>` (or a typed wrapper) for other entity lists. Anywhere-substring search across label+sublabel+group. Native `<select>` only stays for ≤9 fixed closed sets of non-entity values (weekday, recurrence frequency, layout mode).
- **Grep:** `grep -nE '<select\b' app/**/*.tsx components/**.tsx` then read each hit and check (a) is it backed by an entity list, (b) does it commonly grow past 9 options.
- **First pilot:** TodoDetailEditor Responsible + Due-To-Person + Due-To-Team selects → swapped to UserPicker / SearchablePicker in s61 (this commit).

### D17. Skeleton loaders varying between pages
- **What it is:** Each page's loading state is hand-rolled — different gray-200 placeholder shapes, different durations.
- **Why it's drift:** Per `reference_empty_loading_states.md`: spinner uses brand-blue `#0069AA` (or brand-orange for AI); skeleton-on-initial-paint only — refresh stays silent. Inline skeleton variants drift on color, animation timing, and refresh-trigger logic.
- **Replacement:** Match the canon spec; use the same spinner component everywhere.
- **Grep:** `grep -nE 'animate-pulse|bg-gray-200.*rounded' app/**/*.tsx`

### D22. "Complete" / "Completed" / "Incomplete" / "Mark Complete" copy drift
- **What it is:** UI strings using "Complete" / "Completed" / "Incomplete" / "Mark Complete" / "Not Completed" / "Open" (as a not-done state label) for binary completion state.
- **Why it's drift:** Per `feedback_done_not_done.md` v0.3.20. Universal user-facing pair = **"Done"** / **"Not done."** The drift creates the same concept under five different names across the app.
- **Replacement:** Render strings → "Done" / "Not done." Schema enums + JS identifiers (`completed: boolean`, `status: "done"`) stay as-is — rule is render-layer only.
- **Exemption:** Rock StatusPicker "Complete" PHASE label is exempt — it names a phase in a workflow (Draft / In Execution / Complete), not a binary toggle. Don't sweep it.
- **Grep:** `grep -nE '\b(Mark )?(Complete|Completed|Incomplete|Not Completed)\b' app/**/*.tsx components/**/*.tsx | grep -v "PhasePicker\|RockStatus"`
- **Sweep status (s61):** /meetings MeetingItemDetail, GoalSettingSection, mini-games, /vto (3 spots), HIP wizard, /dashboard ✅. /rocks Rock-phase "Complete" ❌ (exempt). Cross-app scan needed for stragglers.

### D23. List-row column order doesn't match canonical slot grid
- **What it is:** A list page renders its row columns in an order that doesn't match `[bulk][drag][state][TITLE][indicators][resp-A][resp-B][date][team]`. Common drift: team chip on the LEFT of the title; date and owner swapped; state circle after the title.
- **Why it's drift:** Per `reference_list_row_column_order.md` v0.4.0. Cross-page muscle memory breaks when columns reshuffle per page.
- **Replacement:** Reorder cells in the row template to match the canonical grid. Each list can omit slots it doesn't need; relative position never changes.
- **Special rule:** Resp-A renders `opacity-100`; Resp-B renders `opacity-70`. Don't reshape Resp-B — opacity + position encode "secondary," not a different chip shape.
- **Grep:** Open each `app/{entity}/page.tsx`, find the row template (usually wraps `<TeamChip>` + `<UserAvatar>` + due date + title), check column order against the slot grid. Manual visual sweep — no regex catches this cleanly.
- **Pilot conformant (v0.4.0):** /todos `app/todos/page.tsx:1380+`. Sweep targets: /issues, /rocks, /headlines.

### D24. H1 scope picker hand-rolled instead of `<SearchablePicker triggerShape="inline">`
- **What it is:** A list page's H1 hard-codes a team dropdown — either a styled `<button>` with a manual menu, or a native `<select>` styled to look inline. Often missing the "Private" option entirely, or showing "Personal" instead of "Private," or omitting the Primary team badge.
- **Why it's drift:** Per `reference_team_picker.md` v0.4.0. The canon: `<SearchablePicker triggerShape="inline">` with locked option order `Private → Primary Team (badge) → All teams → divider → Other teams alphabetical`. Single canonical word **"Private"** everywhere (Personal retired). Primary based on `User.primaryTeamId` NOT `globalTeamId`.
- **Replacement:** Wire `<SearchablePicker triggerShape="inline">` per the team-picker doc. Use `primaryTeamId` to mark the Primary row + badge.
- **Grep:** `grep -nE 'scopeMode|Personal|Private|primaryTeamId' app/**/*page.tsx` then audit each H1 for the option-set + order.
- **Pilot (v0.4.0):** /todos `app/todos/page.tsx:700+`. Sweep targets: /issues, /rocks, /headlines, /meetings list-page.

### D25. View preferences scattered outside the ⋮ kebab
- **What it is:** Layout toggles (list/compact), Group by selectors, Expand-all / Collapse-all buttons, or Reset-to-defaults all rendered as separate Band-2 controls instead of inside the canonical ⋮ kebab popover.
- **Why it's drift:** Per `reference_list_view_kebab.md` v0.3.13. View-shaping controls are predictable per-list expectations; scattering them costs muscle memory per page.
- **Replacement:** Single ⋮ kebab at right end of Band 2. Internal sections: LAYOUT / GROUP BY / ACTIONS (separated by `pt-2 border-t border-gray-100` before ACTIONS). Section-label style `text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1`.
- **Grep:** On each list page, grep for `groupBy|layout|Expand all|Collapse all|Reset` in the JSX. Outside-kebab placements are the drift.
- **Pilot (v0.3.13):** /todos `app/todos/page.tsx:1062–1103`. Sweep target: any list page that adds layout/group-by/reset and forgets to put them in the kebab.

### D26. Page-level AI action placed in Band 2 instead of Band 1 right-side action cluster
- **What it is:** An AI-triggering page-level action (e.g. "Detect Patterns" on /issues, "Cluster by theme," "Summarize this quarter") rendered inside Band 2 (filter row) — typically between Search and a switch.
- **Why it's drift:** Per `reference_list_standards.md` v0.4.1 update. AI page-level actions are sibling to `+ Add {Entity}` — they belong in Band 1's right-side action cluster, NOT in the filter row. The filter row is for items that narrow the list; AI actions operate on the whole set.
- **Replacement:** Move the AI action to Band 1 right-side, styled as `✨ {Action}` (orange sparkle pill per `reference_ai_button.md`). Wrap in `<AIContextInspector>` Full or Minimal variant per `reference_ai_context_inspector.md`.
- **Grep:** `grep -nE 'AIButton|Sparkles' app/**/*page.tsx` then verify the parent container is Band 1 right-cluster, not Band 2.
- **Pilot (v0.4.1):** /issues `app/issues/page.tsx` (post-retrofit). Sweep target: any list page with a page-level AI action — verify Band 1 placement.

### D27. Primary-mode tabs rolled as filter chips OR missing entirely
- **What it is:** A list page has sub-types that should be primary-mode tabs (per `reference_primary_mode_tabs.md` v0.4.1) but is implementing them as Band-2 filter chips, hub-page tabs, or no separation at all.
- **Why it's drift:** Primary-mode tabs encode a mental-mode shift the user commits to for a session. Demoting them to filter chips loses the visibility argument; promoting to hub-page tabs over-engineers when content shapes are the same.
- **Replacement:** Tab bar between H1 row and Band 1, locked tab style (`border-b-2 border-[#0069AA]` active). Tabs persist in URL. Filter state and sort preference scoped per-tab. Per `reference_primary_mode_tabs.md`.
- **Test:** Does the page have sub-types where users (a) have the same row template + filters, (b) shift mental mode between sub-types, (c) commit to one for a session? → Primary-mode tabs.
- **Pilot (v0.4.1):** /issues Short-Term | Long-Term. Sweep target: /headlines (Wins / FYIs?), /scorecard if metric flavors warrant.

### D28. (Retired v0.4.7) Persistent attribute section pattern
Retired 2026-05-13. The persistent-section-with-identity-chrome pattern was retired (the only pilot was /issues Stractical, replaced with default Group-by + parent-link glyph inheritance per `feedback_types_live_on_containers.md` + `reference_list_row_column_order.md`). If a future feature (Pinned items, etc.) revives the need, codify fresh canon then.

### D29. Signature filter duplicated inline AND inside Filters popover
- **What it is:** A page's signature filter renders BOTH as an inline Band-2 control AND as an entry inside the Filters popover. User sees the same toggle twice; can't tell which is canonical.
- **Why it's drift:** Per `reference_list_standards.md` v0.4.1 Band-2 update. Each page picks ONE signature inline filter beyond the always-inline elements; that filter NEVER duplicates in the popover.
- **Replacement:** Pick one home. If the filter earns "signature" status (highly-flipped, mode-defining binary), inline only — remove from popover. If it doesn't earn signature status, popover only — remove from inline.
- **Grep:** Visually check Band 2 inline switches and the Filters popover content per page. Duplicates jump out.
- **Pilot (v0.4.1):** /issues had "Stractical only" duplicated pre-retrofit; resolved by moving Stractical to persistent-section grouping (no switch).

### D30. Filters popover used with <3 narrow filter axes (over-engineering)
- **What it is:** A page renders a Filters popover for 1–2 narrow filter axes that would comfortably fit inline.
- **Why it's drift:** Per `reference_list_standards.md` v0.4.1 popover-threshold rule. Filters popovers are earned, not assumed. With ≤2 narrow axes beyond the always-inline elements, fold inline instead.
- **Replacement:** Remove the Filters popover; inline the narrow filters in Band 2 between Search and the kebab.
- **Test (intent-based, not numeric):** Is Band 2 starting to feel crowded? If no, no popover.
- **Pilot (v0.4.1):** /todos has zero narrow filter axes — no popover, all inline. /issues has Raised by + Need + Direct Reports = popover earned.

### D31. State tabs surviving alongside primary-mode tabs
- **What it is:** A list page has primary-mode tabs (Short-Term / Long-Term, etc.) AND ALSO renders a state-tab row (Unresolved / Resolved / All, or Done / Not Done / All, etc.) between Band 2 and the column headers.
- **Why it's drift:** v0.4.0 killed state tabs entirely; v0.4.1 reinforced binary status with RowStateCircle as the only state toggle. When primary-mode tabs are added per v0.4.1, the old state tabs MUST come out — they're stale chrome from the pre-canon shape.
- **Replacement:** Delete the state-tab row JSX. Column headers strip directly follows Band 2.
- **Spotting it (visual):** Looks like a horizontal row of small tab links between the Band 2 filter row and the table column headers (PRI / TITLE / etc.). If you can see something like `Unresolved 18 | Resolved 0 | All 18` on a v0.4.1-conformant page, it's drift.
- **Found in:** /issues during v0.4.1 retrofit (first pass) — the agent added primary-mode tabs but didn't remove the existing state-tab row.

### D32. Kebab rendered as a split button `[⋮▾]` instead of plain `[⋮]`
- **What it is:** The Band 2 ⋮ kebab button has a separate dropdown chevron next to it, making it look like a split-button `[⋮▾]` rather than a single button.
- **Why it's drift:** Per `reference_list_view_kebab.md`. The kebab is a single trigger button — `<MoreVertical className="w-4 h-4" />` only. No chevron, no split-button shape.
- **Replacement:** Remove the chevron / split-button container. The MoreVertical icon IS the trigger.
- **Grep:** `grep -nE 'MoreVertical|ChevronDown' app/**/*page.tsx` then visually verify the kebab renders as a single button.
- **Found in:** /issues during v0.4.1 retrofit — agent rendered the kebab inside a wrapper that added a chevron.

### D33. Chrome size/padding drift from pilot
- **What it is:** Band 2 controls (filter pills, search input, kebab, etc.) render at different sizes or padding than the equivalent /todos pilot elements. Common drifts: bigger search input width, more vertical padding on pills, different border-radius on the kebab.
- **Why it's drift:** Per the scaffold-from-pilot methodology at the top of this doc. Pixel-level fidelity comes from byte-level copy. If a page's Band 2 doesn't visually match /todos at a glance, the chrome has drifted.
- **Replacement:** Open `app/todos/page.tsx` and `app/{entity}/page.tsx` side-by-side. Diff the JSX of Band 1, Band 2, kebab, row template. Mirror /todos verbatim except for entity-specific strings and per-entity exceptions documented in canon.
- **Spotting it (visual):** The page's Band 2 feels "off" compared to /todos — a control is slightly wider, slightly taller, has different border weight. Side-by-side screenshots make it obvious.
- **Test:** Compare to `/todos` in two browser windows. Anything that doesn't match without a canon-documented reason is drift.
- **Found in:** /issues during v0.4.1 retrofit — Raised-by picker width, Archive switch shape, kebab placement.

### D35. Parent-link rendered as column pill instead of blue text above title
- **What it is:** A row's parent or linked-context (rock parent of a todo; strategic targets on /issues; sibling links) renders as a colored pill in its own column instead of as blue breadcrumb text inside the title slot.
- **Why it's drift:** Per `reference_list_row_column_order.md` v0.4.4. Parent-link is *context* for the title and belongs visually adjacent to it. Pills in a dedicated column separate context from content AND compete with other row indicators. The blue-breadcrumb idiom is well-established and saves a column slot.
- **Replacement:** Move the parent-link rendering INTO the title slot, above the title text. Locked shape: `<div className="mb-0.5"><Tooltip ...><span className="inline-flex items-center gap-1 text-xs text-[#0069AA]">...</span></Tooltip></div>`. Hierarchical chains use `<ChevronRight className="w-3 h-3 text-gray-400" />` between segments; peer-links use `·` middle-dot. Remove the column from the row + the column header from the header strip.
- **Pilot (v0.4.4):** /todos rock+milestone breadcrumb at `app/todos/page.tsx:1474-1489`. Sweep target: /issues strategic targets (currently rendered as `bg-blue-100`/`bg-indigo-100` pills inside a STRACTICAL column — refactor to blue text above title; ⚡ glyph slot stays as the derived-flag indicator).
- **Doesn't apply to:** Derived flags that are conceptually distinct from the link (e.g. /issues ⚡ stays in its own slot as a boolean indicator). Only the link representation itself moves; flags driven BY the link stay where they are.

### D34. Cross-tab search scope wrong (or missing) on pages with primary-mode tabs
- **What it is:** A list page with primary-mode tabs (Short-Term / Long-Term, etc.) has search modes that:
  - Stay scoped to the active tab in All / By-meaning modes (should broaden across tabs per v0.4.2)
  - OR broaden in Current Filters mode (should stay scoped per v0.4.2)
  - OR don't render tab badges on cross-tab results (the user can't tell which tab a match lives in)
- **Why it's drift:** Per `reference_search_chrome.md` §6b (v0.4.2). Primary-mode tabs split entities by an axis users may be unsure about at the edges; the broadest search modes (All + By meaning) must escape that ambiguity and return results from all same-class tabs. Current Filters mode honors the user's explicit context and stays scoped.
- **Replacement:** Backend deep-search route accepts active-tab param but ignores it for `deep` + `fuzzy` modes. Each returned row carries its tab affinity. Frontend renders inline tab badge when `row.tab !== activeTab AND searchMode !== "filter"`.
- **Doesn't apply to:** Hub-page tabs (different content shapes per tab — /vto Vision/Traction/SWOT). Search there stays scoped per-tab.
- **Pilot (v0.4.2):** /issues post-retrofit. Sweep target: any future list page that adopts primary-mode tabs.

---

## category: bug

### B1. Picker filtered by team but doesn't include the externally-selected user
- **What it is:** A `<select>` for `deliverToUserId` (or any cross-scope user field) populated from `teamScopedUsers` (filtered to the parent entity's team). If the selected user is on a different team, they're not in the options list — select renders blank, even though state has the right ID.
- **Smell test:** "Does this picker show every user that could legitimately be selected here? Or is its option list narrower than the field's domain?"
- **How to spot:** Open an entity whose user-field (deliverToUserId, audience, recipient, etc.) holds someone from a different team. The avatar in the row shows but the editor shows blank.
- **Fix:** Use the broader `users` list, OR add a special-case to always include the currently-selected ID (the same trick `teamScopedUsers` does for `userId`).
- **Real example:** /todos `deliverToUserId` — fixed s60. The teamScopedUsers logic only special-cased `userId` (assignee), not `deliverToUserId`.
- **Grep:** `grep -nE 'teamScopedUsers\.map|users\.filter.*teamId' components/**/*.tsx`

### B2. API foreign-key fields missing from `select` / `include`
- **What it is:** Prisma `findMany` with `include: { foo: { select: { id, name } } }` returns the relation object but the consumer also needs the FK scalar (e.g., `fooId`). Prisma DOES include the FK by default — but if the API uses `select: { ...explicit list }`, the FK might be missing from the explicit list.
- **Smell test:** "Does the consumer's TypeScript type for this entity include `fooId`? Is it actually populated by the API response?"
- **How to spot:** Filter logic uses `t.fooId === currentUserId` but always returns no matches. State uses `todo.deliverToUserId` and it's always undefined.
- **Fix:** Add the FK scalar to the API's `select` (or switch to `include` which includes FKs by default).
- **Grep:** Trace API route `select` clauses against the page type — manual.

### B3. State stale closure on first `dragOver` event
- **What it is:** React state `dragId` read from inside a `dragOver` handler is stale on the first fire because the handler closes over the previous render's state. Drop never fires.
- **Smell test:** "First drag of any session does nothing; subsequent drags work."
- **Fix:** `dragIdRef = useRef<string | null>(null)` + `setDragId(...)` AND `dragIdRef.current = ...` together. Read from ref inside handlers.
- **Real example:** /todos drag-reorder — fixed earlier in s60.
- **Grep:** `grep -nE 'onDragOver.*dragId' app/**/*.tsx`

### B4. Optimistic update missing — UI requires manual refresh
- **What it is:** A user action (drag, status flip, edit) hits the API but doesn't update local state until the next fetch.
- **Smell test:** "Action visibly does nothing until I refresh / switch tabs and back."
- **Fix:** Optimistic local state update before the API call, rollback on error. See punchlist #771.
- **Grep:** Look for `onClick` handlers that `await fetch(...)` but don't `setState(...)` before the fetch.

### B5. Same field name client-side vs server-side mismatch
- **What it is:** UI sends `deliverToUserId` but API expects `delivery_to_user_id` (or vice versa); silent ignore.
- **Smell test:** "PUT/POST returns 200 but the change doesn't persist."
- **Fix:** Open Network tab on a save and check the request body fields against the API route's body parser.
- **Grep:** Trace `body: JSON.stringify({...})` in the page → match against API route's `body.fooBar` reads.

### B6. Sort key collision — `setSortKey` instead of `toggleSort`
- **What it is:** After a drag-reorder or programmatic sort change, calling `setSortKey("order")` doesn't reset the sort direction. If previous sort was descending, the new sort renders descending — manual order shows reversed.
- **Smell test:** Drag-reorder works mechanically but the visual order doesn't match what the user dragged.
- **Fix:** `toggleSort("order")` instead of `setSortKey("order")`. Per punchlist #770.
- **Grep:** `grep -nE 'setSortKey\(' app/**/*.tsx`

### B7a. Tooltip wrapper collapses block layout
- **What it is:** `<Tooltip>` renders as `<span className="relative inline-flex items-center">`. If you wrap a `<div>` block element with Tooltip, the outer span forces inline layout, collapsing block-stacking with siblings (e.g. a "breadcrumb above title" layout becomes "breadcrumb beside title").
- **Smell test:** "After adding a tooltip, the wrapped element ended up on the same line as its sibling instead of above it."
- **Fix:** Wrap the Tooltip in an outer `<div>` to provide block-level layout, AND change the Tooltip's child from `<div>` to `<span>` (since `<span><div></span>` is invalid HTML and browsers handle it inconsistently).
- **Real example:** /todos rock/milestone breadcrumb above title — discovered s60.

### B9. Timezone drift in date math
- **What it is:** Storing `weekOf` / `dueDate` as UTC-midnight `Date` and then bucketing by month/quarter using local-time methods (`getMonth()`, `toLocaleDateString()`). UTC-midnight in a non-UTC timezone falls in the *previous* day local-time, so a "Feb 1" UTC entry buckets into January display.
- **Smell test:** "Numbers shift by a small amount when the user's timezone changes / month boundaries on data look off-by-one."
- **Fix:** Normalize on read using a consistent timezone helper. For monthly buckets, compute on UTC-anchored values, not local-time methods.
- **Real example:** s58 #560 — Trevor MRR doubling investigation. UTC midnight `weekOf` bucketed wrong-month in EST display.

### B10. JS month-overflow in `setMonth(+1).setDate(-1)`
- **What it is:** Pattern `new Date(y, m, 1); setMonth(m+1); setDate(-1);` to compute "last day of month." On Jan 31 → setMonth(2) overflows to Mar 2 (day 31 doesn't exist in Feb), and setDate(-1) lands on a date in March, not February.
- **Smell test:** "Period range queries return data from TWO months when the source month is 31 days."
- **Fix:** Use `new Date(y, m+1, 0)` — the day-0 trick gives the last day of month-`m` directly without overflow.
- **Real example:** s58 #560 — periodRange overflow caused 2× MRR for January.
- **Grep:** `grep -nE 'setMonth.*setDate' app/**/*.ts components/**/*.ts lib/**/*.ts`

### B11. React keys missing or non-stable in `.map()`
- **What it is:** `items.map((item, i) => <Row key={i} ... />)` (using index) or `<Row />` with no key at all. React reuses DOM nodes by key; index-keys cause weird state retention when items reorder.
- **Smell test:** "After drag-reorder, expanded sub-rows or input focus jumps to the wrong row."
- **Fix:** Use a stable id from the data (`key={item.id}`).
- **Grep:** `grep -nE 'map\(\(.*, ?(i|idx|index)\) =>.*key=\{(i|idx|index)' app/**/*.tsx components/**/*.tsx`

### B12. `useEffect` deps with unstable references
- **What it is:** `useEffect(..., [obj])` where `obj` is `{...}` literal recreated each render — effect re-fires every render. Same for `[arr]` with literal array, or function references not wrapped in `useCallback`.
- **Smell test:** "Network tab shows the same fetch firing repeatedly. Or a console.log in the effect prints on every keystroke."
- **Fix:** Memoize with `useMemo`/`useCallback`, OR depend on the stable primitives extracted from the object/array.
- **Grep:** Manual review of `useEffect` dep arrays — no good grep for this.

### B13. Soft-delete vs hard-delete inconsistency
- **What it is:** Some queries filter `archived: false` and some don't. Archived items appear in the wrong places.
- **Smell test:** "I archived an item and it still shows up in [list/dashboard widget/AI context]."
- **Fix:** Audit every Prisma query that returns the entity type — confirm `where: { archived: false }` (or the opposite for an "archived" view). Permanent delete is `delete()`; archive is `update({ archived: true })`.
- **Grep:** `grep -nE 'prisma\.(toDo|issue|rock|headline)\.findMany' app/**/*.ts | xargs -I{} ...` — manual review.

### B14. Authentication-required call silently swallowing 401
- **What it is:** `fetch("/api/...").then(r => r.json())` without checking `r.ok`. If the session expired, the API returns 401 + JSON `{error: "Unauthorized"}`, which `.json()` parses fine — and the consumer treats the error object as a valid response.
- **Smell test:** "After leaving a tab open overnight, actions silently fail — no error message, just nothing happens."
- **Fix:** Always check `if (!r.ok) throw ...` or branch on the error field. Show a toast on error.
- **Grep:** `grep -nE '\.then\(r => r\.json\(\)\)|await fetch\(' app/**/*.tsx | grep -v "r\.ok"`

### B15. Cache invalidation after mutation — UI shows stale data
- **What it is:** PUT/POST/DELETE succeeds but the consumer's local state isn't reloaded. UI shows old values until refresh.
- **Smell test:** "I edited a field, saved, closed the editor — list shows the old value until I refresh."
- **Fix:** Call the page's reload function in the success handler, OR optimistically update local state. Per #771 the canonical pattern is optimistic-then-rollback-on-error.
- **Real example:** Audited as #771 punchlist sweep.

### B16. Permission gate on server but UI shows the action button
- **What it is:** Server enforces `if (!user.isAdmin) return 403`, but the client UI renders the button anyway. User clicks → 403 → silent fail or confusing toast.
- **Smell test:** "Action button is visible to people who can't actually do the action."
- **Fix:** Mirror the server gate in the client UI. Hide or disable the button for users who lack permission.
- **Grep:** Trace API route guards (`if (!user.isAdmin)`, `if (user.role !== "admin")`) and check the corresponding UI component for matching visibility logic.

### B17. Search query not trimmed/normalized
- **What it is:** Server query `where: { title: { contains: search } }` against user-input `search` without trimming whitespace, normalizing case, or stripping zero-width chars. Leading/trailing space breaks exact-match.
- **Smell test:** "Search returns nothing when I have a trailing space; works fine when I delete it."
- **Fix:** `search = search.trim()` on the server (and probably client). Use `mode: "insensitive"` for case.
- **Grep:** `grep -nE 'searchParams\.get\("(search|q)"\)' app/api/**/*.ts | grep -v trim`

### B18. Sticky header z-index colliding with popovers
- **What it is:** The page's sticky header has a `z-30` and a popover/modal child uses `z-20` (or no z) — popover renders BEHIND the sticky header.
- **Smell test:** "When I open a dropdown near the top of the page, half of it is covered by the toolbar."
- **Fix:** Audit z-index ladder. Popovers should be `z-50`, modals `z-50`-`z-60`. Sticky header `z-30` is fine, kebab/dropdown content needs to clear it.
- **Grep:** `grep -nE 'z-(10|20|30|40|50)' app/**/*.tsx components/**/*.tsx | sort | uniq -c | head`

### B19. localStorage SSR hydration mismatch
- **What it is:** `useState(localStorage.getItem("foo") ?? "default")` reads from localStorage on first render — but localStorage doesn't exist during server-side render, so server renders "default" and client renders the real value. React warns: "Text content does not match server-rendered HTML."
- **Smell test:** "Console error about hydration mismatch on page load. UI flashes from default to actual state on first render."
- **Fix:** Read localStorage in a `useEffect` after mount, not in initial state. Use a `mounted` flag if needed.
- **Grep:** `grep -nE 'useState.*localStorage\.getItem' app/**/*.tsx components/**/*.tsx`

### B20. Optimistic update without rollback-on-error
- **What it is:** Local state updates immediately, API call fails silently, UI now shows phantom state that doesn't match the database.
- **Smell test:** "Edit appeared to save (UI updated) but didn't actually persist — refresh reveals."
- **Fix:** Capture the previous state before the optimistic update; on `catch`, revert + show a toast.

### B8a. AIContextInspector wrap on a feature that doesn't consume context — theater
- **What it is:** A button wrapped in `<AIContextInspector feature="X">` advertising 9 org-wide data sources + custom instructions — but the API that the button triggers doesn't actually read ANY of those sources or instructions. Right-click reveals toggles that affect nothing.
- **Why it's drift:** Per `reference_ai_context_inspector.md` — "disabledSources MUST be filtered server-side or toggles become theater." Theater erodes user trust ("nothing I toggle does anything").
- **Smell test:** Open the wrapped feature's API route. Does the request body include `disabledSources` and/or `customInstructions`? Does the prompt assembly read them? If the API takes `{query, candidateIds}` and ignores the rest, the inspector is theater.
- **Fix:** Either (a) wire the API to actually consume disabledSources + customInstructions and define a proper feature set in `AI_FEATURE_SETS`; (b) switch the wrap to a "minimal" variant that's honest about not consuming org context (pending #778 — variant doesn't exist yet); (c) remove the wrap entirely and use plain `<AIButton>`.
- **Real example:** /todos s60 — Meaning search Inspector wrap removed because `ai-fuzzy-search` only uses query + candidate to-dos. Punchlist #777 re-wires it properly.
- **Grep:** `grep -rn 'AIContextInspector' app/**/*.tsx components/**/*.tsx | xargs -I {} ...` (manually trace each wrap's feature → API → prompt assembly).

### B8. Dual linkage systems — FK vs EntityLink — surface BOTH in the UI
- **What it is:** Most entities have TWO ways to express "linked to another entity": (1) direct foreign keys like `Todo.rockId` / `Todo.milestoneId` / `parentType+parentId` — set when spawned-from or directly assigned; (2) `EntityLink` table — freeform many-to-many "related to" graph that any user creates from the LinkedItems section in editors. They coexist by design (FK = "IS PART OF", EntityLink = "related to") but it's easy for the UI to render only ONE — leaving the other invisible.
- **Smell test:** "If I open an entity and click 'Link to' from the editor, does ANYTHING change visually on the row in the list view? Or does the link only show in the editor's LinkedItems section?"
- **Fix pattern:** API enrichment counts EntityLink rows where `(fromType='X' AND fromId=id) OR (toType='X' AND toId=id)`. Row gets a chain-link indicator (Lucide Link2 + count) alongside other meta-icons (linkedIssueCount, comment count). See /todos s60 implementation. Path-C decision: keep breadcrumb FK-only; let EntityLink surface only via the chain icon.
- **Real example:** /todos s60 — Ricky linked a rock from the editor and the breadcrumb didn't update because EntityLink doesn't write to Todo.rockId. Fix landed for /todos; cross-page sweep is punchlist #774.
- **Grep:** `grep -nE 'linkedIssueCount|parentType.*parentId' app/**/*.tsx components/**/*.tsx` (then check if the API also enriches `linkedEntityCount` and if the row renders it).

### B7. New-row creation without `order = MAX(order) + 1`
- **What it is:** Creating a new entity uses `order: 0` (default) — collides with existing rows and breaks drag-reorder.
- **Smell test:** New todos appear at the top of the manual-order list, ahead of pinned items.
- **Fix:** Server-side: SELECT MAX(order) before INSERT, then `order = max + 1`.
- **Real example:** /todos — fixed earlier in s60.

---

## How to use this doc

1. When given a "sweep page X" task, **start with the greps in the drift section**. Each grep is a starting line — read code at hits to decide if the fix applies.
2. **For the bug section**, use the "smell test" line as a quick check — open the page, try the flow, watch for the symptom. Don't write tests; just look.
3. **As you find new drift or bugs**, add an entry here with: category, plain-English description, smell test / grep, replacement, real example. Future sweep sessions inherit your finding.
4. **Reference this doc from punchlist sweep items** (#565 / #770 / #773 etc.) so the executor knows where to start.

---

## Source / origin

Created s60 (2026-05-10) during the /todos polish session, after Ricky observed that the same drift patterns kept resurfacing across pages. The first entries are everything found during /todos' sweep itself.
