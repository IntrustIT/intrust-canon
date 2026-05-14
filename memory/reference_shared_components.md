---
name: Intrust OS shared UI primitives
description: Reusable components and lib helpers — reach for these before rolling your own alert box, confirm dialog, textarea, or team scope picker
type: reference
originSessionId: 2167565d-b3cc-4e27-98a0-be318216e64a
---
These primitives exist. Before inventing a new alert/confirm/textarea/picker, check whether one of these fits.

## Components

- **[`AlertBanner`](components/AlertBanner.tsx)** — the app's standard alert. Pattern: left-border accent + soft gradient bg + icon-in-chip + title/subtext stack + optional right-side action. Tones: `info` (blue), `warning` (amber), `danger` (red), `success` (green). Props: `title`, `description?`, `action?`, `icon?`, `className?`. Use this anywhere you'd otherwise write `<div className="bg-*-50 border border-*-200 rounded-lg ...">`.

- **[`StatusPicker`](components/StatusPicker.tsx)** — Ninety-style icon-button + dropdown at the top-left of a detail pane header (via SlideOverPanel's `leading` slot). Renders current state icon; click opens a panel listing all options with active-state highlighting. Supports `actions` array below options (divider-separated, with `variant: "danger"` and optional `hint` text) for non-status operations like Archive / Delete permanently. Icon exports: `ThumbsUpIcon`, `ThumbsDownIcon`, `WarningIcon`, `QuestionIcon`, `CheckIcon`, `BanIcon`, `ArchiveIcon`, `TrashIcon`.

- **[`TeamScopePicker`](components/TeamScopePicker.tsx)** — team select + "Private" checkbox that greys the dropdown. Fetches `/api/teams?assignable=true` on its own (leadership sees all teams, others see only their memberships). Props: `teamId`, `onTeamChange`, `allowPrivate?`, `visibility?`, `onVisibilityChange?`, `label?`.

- **[`GrowTextarea`](components/GrowTextarea.tsx)** — textarea that auto-grows to content, expands further on focus, respects a native vertical resize handle. Props: `value`, `onChange` (takes string directly, not event), `minRows`, `focusRows`, `maxRows`, plus standard textarea HTML attrs.

- **[`AutoLinkedText`](components/AutoLinkedText.tsx)** — renders text with URLs converted to blue clickable links. Export `AutoLinkedText` (block, `as="p"|"span"|"div"`) and `AutoLinkedInline` (inline spans, no block wrapper, use inside existing `<p>`). Also exports `linkifySegments(text)` for nested renderers. Already wired into comment bodies, meeting items, dashboard triage cards, issues-page triage/pattern descriptions.

- **[`SlideOverPanel`](components/SlideOverPanel.tsx)** — right-side slide-over. Props of note: `leading` (left of title — usually a StatusPicker or check circle), `subtitle` (row of chips under title — team/owner/due-date convention), `headerExtra` (between title and X), `footer`, `width` (defaults to `w-[480px]`; Rock uses `w-[540px]`).

- **[`InlineRicketyChat`](components/InlineRicketyChat.tsx)** — collapsed-by-default Rickety companion. Preloads analysis on mount regardless of open state, so clicking to expand shows the result instantly. Header: orange `#F58326` text, "ready" badge appears once the first assistant message lands. Pass `contextPrompt` (auto-sent on mount), `itemLabel`, `itemContext`, `subjectOwnerId`, `chips`.

- **[`CommentThread`](components/CommentThread.tsx)** — discussion panel. Fetches mentionable audience via `/api/comments/mentionable` (team + leadership), disables @ picker for private entities. Bubble color system: blue=expanded, orange=unread, white+gray=read. Uses `?peek=true` on mount so the count check doesn't clear unreads. Shows per-mention "seen" indicators. Props: `entityType`, `entityId`, `currentUserId`, `onMarkedRead?`, `panelWidthPx?`.

- **[`SavedIndicator`](components/SavedIndicator.tsx)** (added 2026-04-28) — fixed bottom-center "Saved ✓" toast for inline editors that auto-save on blur. Pass `savedAt={Date.now()}` after each successful PUT; toast fades in for ~1.5s and fades out. Drop in any inline editor — currently used by `SoiPlanEditor`, sweep into `TodoDetailEditor` / `IssueDetailEditor` / `RockDetailEditor` / `MeasurableModal` is tracked under #687.

- **[`RowStateCircle`](components/RowStateCircle.tsx)** (added v0.4.0, s60) — canonical row-level state-flip circle for list rows. Marks todos done, issues resolved, milestones complete. Visual: `w-5 h-5 rounded-full border-2`. Empty = `border-gray-300`, hover previews `border-gray-700`. Done = `bg-gray-900` with white `<Check>` inside. **Color choice (locked):** gray-900/black, NOT green — orthogonal to the entity palette + team colors so the "done" signal never collides with team hue (Service Delivery green, Growth amber, etc.). The stripe carries entity identity; this circle carries state. Distinct from `<StatusPicker>` (the slide-over editor's top-left status icon — a rounded-square dropdown). RowStateCircle is the row-level toggle that lives in the state slot of `reference_list_row_column_order.md`. Props: `done`, `onToggle`, `tooltip` (should phrase the *next* action — "Mark done" when not done, "Mark not done" when done), optional `ariaLabel`. Stops propagation on click so the row's open-editor handler doesn't also fire.

- **[`SoiPlanEditor`](components/SoiPlanEditor.tsx)** — full SOI plan editor (title / dates / sections / items / notes / assignees, drag/drop, promote/demote, expand/collapse, section-level Assign-all). Used standalone on `/meetings/soi/[id]` and inside the meeting runner's `soi_plan` section. Leadership-only; relies on `lib/soi-helpers.ts:authorizeLeadership` server-side auth.

- **[`NewSoiPanel`](components/NewSoiPanel.tsx)** + **[`PastPlansBrowser`](components/PastPlansBrowser.tsx)** — used inside `SlideOverPanel` for the "Custom date / outline…" and "Browse past plans…" flows respectively. Both accept `chrome="inline" | "headless"`: inline keeps the legacy blue-card chrome; headless drops it so SlideOverPanel provides the wrapper. Use headless inside SlideOverPanel; inline standalone.

- **[`Tooltip`](components/Tooltip.tsx)** (rewritten 2026-05-08 session 48 — portal + viewport-clamp; never clipped) — drop-in replacement for native HTML `title="..."`. **Never use the native attribute.**

  **Always fully visible.** Renders via `createPortal` to `document.body` so it can never be clipped by an ancestor with `overflow: hidden | auto | scroll` (slide-over panels, modals, scroll containers). Auto-flips placement (top↔bottom, left↔right) when the preferred side would clip the viewport, and auto-shifts horizontal position to keep the tooltip inside the viewport with an 8px margin. The arrow tracks the trigger's center even after clamping. **You no longer need to pass `align="end"` on right-edge icons** — clamping is automatic — but the prop remains as a hint for the preferred initial placement.

  Props:
  - `text` (required) — single string. Empty/null → renders children unchanged.
  - `placement?: "top" | "bottom" | "left" | "right"` (default `top`). Auto-flipped if clipped.
  - `align?: "start" | "center" | "end"` (default `center`) — for top/bottom placement only. Hints the preferred initial alignment; auto-shift overrides as needed. Ignored for left/right placement.
  - `delay?: "instant" | "fast" | "medium" | "slow"` — `instant` 0ms (urgent UX hints), `fast` 150ms (default — action button labels), `medium` 400ms (less-obvious hints, secondary controls), `slow` 800ms (detail/explanation popovers; only fires with intent).
  - `multiline?: boolean` (default false) — set true for tooltips with explicit `\n` newlines or longer copy. Adds `max-w-xs whitespace-pre-line text-left leading-snug` so the panel grows to content width up to `max-w-xs`. Without it the panel stays single-line (`whitespace-nowrap`).
  - `disabled?: boolean` — render children only, no tooltip. Use for conditional tooltips (e.g. a tooltip that should only appear when a button is disabled).

  **Anti-patterns:** native `title="..."`, custom CSS hover popovers, `react-tooltip` libs, manually positioned tooltips with `position: absolute` (will clip inside any overflow ancestor). The single canon = one tooltip vocabulary across the app, and the canon guarantees full visibility.

## Lib helpers

- **[`lib/confirmDestructive.ts`](lib/confirmDestructive.ts)** — async custom confirm dialog for destructive actions. Returns `Promise<boolean>`. Cancel is default focus. No "don't ask again" option by design (fat-finger guard). Use this instead of browser `confirm()` for delete/archive/reset flows.

- **[`lib/team-scope.ts`](lib/team-scope.ts)** — `getAssignableTeams(userId)` returns user's teams, expanded to all active teams if they're on Leadership. `isUserOnLeadership(userId)` for lightweight checks.

- **[`lib/getTeamId.ts`](lib/getTeamId.ts)** — `getTeamIdForUser(userId)`: returns `primaryTeamId` if set, else first membership. Use for create-mode default team resolution.

- **[`lib/linked-tooltip.ts`](lib/linked-tooltip.ts) — `formatLinkedTooltip(payload)` (v0.4.10).** Canonical formatter for the 🔗 link-count tooltip on list rows. Renders a count header + a name list:

  ```
  3 linked · 1 spawned from this
  Rock: Renew Contract
  Rock: Q4 Migration
  Issue: Pricing
  ```

  **Locked rules:**
  - **Header line:** `N linked` always; ` · M spawned from this` appended only when M > 0. Counts split the "summary" facts from the "name list" — don't mix them on one sentence line.
  - **Item lines:** type-prefixed always (`Rock: `, `Issue: `, `Milestone: `, `Headline: `, `Todo: `, etc.). Simple + obvious; don't optimize prefix-out for single-type lists.
  - **Cap at 5 items.** When > 5 linked, render the first 5 followed by `(+N more)` on its own line. To see the full list, the user opens the entity — the tooltip is a preview, not a navigator. No popover affordance.
  - **Empty:** if there are zero linked items the 🔗 indicator doesn't render at all (no zero-count tooltip).
  - **Spawned-count source:** read from `payload.spawned` (server-side count of edges where this entity is the origin of a follow-up spawn). Don't reconstruct client-side.

  **Input shape** (matches `/api/links/counts` response):
  ```ts
  formatLinkedTooltip({
    total: number,
    spawned: number,
    items: { type: string, id: string, title?: string }[]
  }): string
  ```

  Used by /issues + /todos row 🔗 tooltips. Any new list-page rendering a 🔗 link-count indicator MUST use this helper — don't roll a bespoke string.

## Editor pattern conventions

Detail panel editors (Rock/Issue/Todo/Headline/Metric) share a common skeleton.

### Slide-over header — 4-slot contract (v0.3.8)

| Slot | Required content | Notes |
|---|---|---|
| `leading` | `<StatusPicker>` with status options + `actions=[Archive, Delete permanently]` | The StatusPicker dropdown is the canonical home for destructive actions. NEVER render destructive icons in the footer. Headlines (which have no editable status) may omit the StatusPicker entirely — but then Archive/Delete live ONLY in the kebab. |
| `titlePrefix` | `<>{TypeName} {<PinToggle/>} {optional read-only badge}</>` | TypeName is the entity (e.g. "Rock", "Issue"). PinToggle is the click-to-pin star. Read-only badge appears when entity is system-locked. |
| (title) | autosaving inline-edit input | Already canonical; see SlideOverPanel `title` prop. |
| `subtitle` | `team · owner · due/quarter/priority` chip row | Use `<TeamChip>` + `<UserAvatar size="xs" role="...">` + `formatDueDate` (per `reference_date_format.md`) + `<PriorityPicker variant="chip">`. Don't hand-roll the row — extract `<EditorSubtitle>` if you find yourself copy-pasting. |
| `headerExtra` | `<KebabMenu items={ctxItems.filter(insideEditorFilter)} />` | Same `lib/entity-actions.ts` builder used by row right-click. Filter out "Ask Rickety" + "Open Details" (per `reference_entity_action_set.md`). |

### Body order (top to bottom)

1. Rickety chat (when entity has it)
2. Urgency banner (Todo only — when due-soon or overdue)
3. Description (`<GrowTextarea>`)
4. Entity-specific fields
5. Linked items (`<LinkedItemsSection>`)
6. Attachments (`<FileAttachments>`)
7. ActivityTrail (when entity has one)

If body grows beyond ~one screen, see [`reference_panel_body_tabs.md`](reference_panel_body_tabs.md) — workflow-phase tabs are canon, form-chunking tabs aren't.

### Footer — Cancel + Save only (v0.3.8)

| Mode | Cancel button (left) | Primary button (right) |
|---|---|---|
| Create | `Cancel` | `Create {EntityName}` (e.g. "Create Issue", "Create To-Do") |
| Edit | `Cancel` | `Save & Close` with `<Check className="w-3 h-3" />` icon |

- **Brand-blue primary button:** `px-4 py-2 rounded-lg bg-[#0069AA] text-white text-sm font-medium`.
- **Cancel button:** `px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 text-sm font-medium`. NEVER red — Cancel isn't destructive, it's a state-change.
- **No "Done" buttons.** "Done" is ambiguous (saved? discarded? both?). Always Cancel + Save & Close.
- **No bare "Create" without entity name.** "Create Issue" reads as a verb; "Create" alone reads as an icon.
- **Save & Close** uses the check icon (✓) Lucide `Check`. NEVER native checkmark Unicode.
- **No destructive icons in the footer.** Archive + Delete permanently live in the StatusPicker dropdown (per slot-1 contract above).

### Close-path dirty guard (v0.3.8)

Esc, backdrop click, X button, and Cancel all check the `isDirty` flag and prompt via `confirmAction({title:"Discard unsaved changes?"})` when dirty. See [`reference_unsaved_changes_guard.md`](reference_unsaved_changes_guard.md). Currently NOT implemented in any OS editor — tracked on the punchlist.

### Save callbacks

`onSaved` (closes panel + refreshes) is distinct from `onListRefresh` (just refreshes, keeps panel open). CommentThread's `onMarkedRead` wires to `onListRefresh` so the bubble count clears without collapsing the editor.

When adding a new detail panel, match this skeleton — don't roll your own header, footer, urgency banner, or destructive-action placement.

### Recommended primitives to extract (not yet shipped)

- **`<EditorSubtitle>`** — the team/owner/due-date chip row that lives in the SlideOverPanel `subtitle` slot. Currently hand-rolled in 3+ editors; extracting eliminates drift.
- **`<PendingLinkPreview parentType={...} parentId={...} />`** — the dashed-border row showing "this create flow will link to {parent} once saved." Currently duplicated as `IssuePendingLinkPreview` / `PendingLinkPreview` inner components; promote to shared.
