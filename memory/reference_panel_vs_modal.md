---
name: Panel vs Modal vs Inline — surface decision rule + canon
description: Decision rule for picking between SlideOverPanel, Modal, inline form, and Popover. Plus the canonical Modal primitive (components/Modal.tsx) shape. Read this before adding any new overlay surface.
type: reference
originSessionId: c9b17cee-f5ec-4aac-9894-14aeaf8a54b7
---
# Panel vs Modal vs Inline — surface canon

## Decision rule

| Surface | When to use | Component |
|---|---|---|
| **Slide-over** | Editing a row of data with multiple fields. Anything resembling a "detail editor" — rocks, issues, todos, headlines, SOI items, metrics. Also: cascade-form-style creates that mirror an editor (e.g. New Headline). | `<SlideOverPanel>` |
| **Modal** | Short focused decisions: confirmations, single-screen forms (route + note), measurable schema, resolve-with-followup. Always centered, always overlay-dismissable. | `<Modal>` |
| **Inline form on the page** | True micro-interactions: drag-drop, inline rename, SOI section reorder, kanban card move. No overlay chrome. | (no primitive — direct in the page) |
| **Popover** | Menus only — View, Filters, mode pickers, kebab-trigger action menus. Click-outside-to-close. Never use for editing flows. | `<Popover>` |

The rule: **Slide-over is the default for editing.** Reach for Modal only when the action is a one-off decision — not a multi-field edit.

Established 2026-05-07 (session 47, B2 of `project_design_punchlist.md`) at Ricky's call after audit found scattered ad-hoc modals + two slide-overs misnamed `*Modal`.

## Modal canon (`components/Modal.tsx`)

Every centered overlay uses the `<Modal>` primitive. Don't roll your own `<div className="fixed inset-0 z-50 ...">` wrapper.

**Visual shape:**
- Backdrop: `fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4`
- Container: `bg-white rounded-2xl shadow-xl w-full max-w-md p-5` (default; `width` prop accepts any Tailwind max-width)
- Title: `<h3 className="text-base font-bold text-gray-900 mb-1">`
- Subtitle (optional): `<p className="text-xs text-gray-500 mb-3">`
- Footer (optional): `mt-4 flex gap-2 justify-end` action row, Cancel left, primary right (brand-blue `#0069AA`)

**Behavior:**
- Esc closes
- Backdrop click closes (unless `closeOnBackdrop={false}`)
- No focus trap (consumers `autoFocus` their primary input)
- No close X by default — Esc + backdrop click are sufficient

**Props:**
```tsx
<Modal
  open={boolean}
  onClose={() => void}
  title="Resolve this issue"
  subtitle={pending.issueTitle}                        // optional
  width="max-w-md"                                     // optional, default
  headerSlot={<CloseBtn />}                            // optional — extra chrome at right of header (rare)
  maxBodyHeight="80vh"                                 // optional — cap + scroll long bodies
  footer={<><CancelBtn /><PrimaryBtn /></>}           // optional
  closeOnBackdrop={true}                               // optional, default true
>
  {body}
</Modal>
```

**Optional props grew session 48** (#749 sweep made them necessary):
- `headerSlot` — render extra chrome (status badge, close-X for very long modals) at the right edge of the header row. Rare — most consumers don't need it.
- `maxBodyHeight` — pass a CSS height (`"80vh"`, `"32rem"`) to cap the body and enable `overflow-y: auto` when content overflows. Footer stays pinned. Without this prop, the modal grows to fit content (then capped at viewport height).

**Layout extension (session 49 commit `ad54c03`):**
- `layout: "compact" | "sectioned"` — defaults to `"compact"` (the `p-5` single-pane shape). Pass `"sectioned"` for richer multi-section modals: header / body / footer each get their own `px-6 py-*` padding with `border-b` between header & body and `border-t` between body & footer. Header auto-renders a close X when no `headerSlot` is supplied. Used by `DocumentImport`, directory `TeamModal` + `CsvImportModal`. Use sectioned only when the body has clear visual sections that need the bordered separation — for short single-section forms, stick with compact.
- `subtitle` widened from `string` to `ReactNode` so consumers can drop a badge / metadata row inline (see `IdeaDetailModal` — category pill + stage label + timeAgo).

## What goes WHERE today (canonical surfaces)

**Slide-overs (use `<SlideOverPanel>`):**
- All entity detail editors: `IssueDetailEditor`, `TodoDetailEditor`, `RockDetailEditor`, `HeadlineAddPanel` (renamed from `HeadlineAddModal`), `MeasurablePanel` (renamed from `MeasurableModal`)
- SOI plan editors: `SoiPlanEditor`, `NewSoiPanel`, `PastPlansBrowser` (chrome="headless" inside SlideOverPanel)
- Drawer-shaped views: `MetricChartDrawer` (will migrate from ad-hoc to slide-over via punchlist)

**Modals (use `<Modal>`):**
- `IssueResolveModal` — required-text resolution + 4-option follow-up
- `RouteIssueModal` — team picker + note + Route button
- `confirmDestructive` (lib helper) — destructive-action confirmations
- Future: `confirmAction` — non-destructive action confirmation (#732)

**Inline (no primitive):**
- Drag-drop reordering (SOI sections, rock roadmap quarters)
- Inline metric value editing in scorecard grid
- Bulk action bar (`fixed bottom-6` floating bar — special: not a modal/popover)

**Popovers (use `<Popover>`):**
- View / Filters / Find-mode picker on every list page
- Kebab `⋮` menus
- Inline category/owner pickers in compact contexts

## Icons — menu surfaces only

The canonical `+ Linked X` vocabulary (`lib/entity-actions.ts` exports `LINKED_SPAWN_ICON` + `LINKED_SPAWN_LABEL`) appears in two distinct surface types:

- **Dropdown menus** (right-click ContextMenu, KebabMenu items): **icon + label**. Icons aid vertical scanning when items are stacked. Use `LINKED_SPAWN_ICON[t]` + `LINKED_SPAWN_LABEL[t]`.
- **Inline buttons + chips** (modal action chips, LinkedItemsSection `+ Link`, FileAttachments `+ Add`, list-page `+ Add Issue` CTA): **label only**. Icons make inline chips long and noisy; the label alone communicates the action. Use `LINKED_SPAWN_LABEL[t]` only — drop the icon.

This rule means: import only the labels for chip surfaces, the full pair for menus.

## What NOT to do

- Don't name a slide-over component `*Modal`. Two of these existed (HeadlineAddModal, MeasurableModal) — both renamed to `*Panel` in this same session.
- Don't roll `<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 ...">` by hand — use `<Modal>`.
- Don't use `<Popover>` for forms — popovers are menus.
- Don't add a close X to the Modal primitive default — Esc + backdrop click are sufficient. If a specific consumer needs an X (e.g. an unusually long modal), add it inside the modal body.
- Don't use `bg-black/50` or `bg-black/30` — backdrop is `bg-black/40`. Period.
- Don't use `rounded-xl` — the canon is `rounded-2xl`.
- Don't promote a Popover to a Modal "because it has more options now" — once the action becomes editable rather than a menu pick, switch to `<Modal>` (single decision) or `<SlideOverPanel>` (multi-field).

## Migration sweep — #749 progress

Initial inventory at canon-doc creation (session 47): "~12 files." Audit during the session-48 sweep found 21 ad-hoc `fixed inset-0` containers across the app. Status after session-49 round 5 (commit `ad54c03`): **22 of 23 callsites migrated**. Remaining 1 (ggob chart drawer at line 3299) is a true bottom-drawer pattern that needs its own canon before migrating. Three callsites are deferred at Ricky's direction (HIPPlanSetupWizard + HIPPlanEntryWizard get a meeting-runner-like format; MiniGameWizard gets its own canon later).

**Migrated to `<Modal>` (14 callsites):**
- `app/accountability/page.tsx:253` — Delete Seat confirm
- `app/accountability/page.tsx:500` — Edit Seat form (uses `maxBodyHeight`)
- `app/dashboard/page.tsx:336` — Quick-create modal (title + body + footer)
- `app/hip/page.tsx:886` — Start New Planning Cycle
- `app/hip/page.tsx:1766` — Close Cycle confirm
- `app/issues/page.tsx:181` — Spawn-followup picker (uses `maxBodyHeight`)
- `app/meetings/page.tsx:1270` — Schedule Meeting form (uses `maxBodyHeight`)
- `app/meetings/page.tsx:1528` — Template Editor (uses `maxBodyHeight`)
- `app/meetings/[id]/page.tsx:4766` — Day 2 scheduling prompt
- `app/meetings/[id]/page.tsx:5033` — Rock status/trajectory change note
- `app/meetings/[id]/page.tsx:5091` — Defer issue from IDS
- `components/IssueDetailEditor.tsx:1129` — IDS Solve picker
- `components/SoiSummaryEditDialog.tsx` — AI summary editor (uses `footer` with custom layout)
- `app/meetings/page.tsx:565` — Quarter / Year picker (round 4, commit `10917be`)
- `app/ggob/page.tsx:3164` — Variance Auto-Issue Settings (round 4; uses `maxBodyHeight="70vh"`)

**Migrated to `<SlideOverPanel>` (1 callsite — round 4):**
- `app/ggob/page.tsx:3399` — Change History audit log

**Should migrate to `<SlideOverPanel>` instead (misclassified as modals):**
- `components/HIPPlanSetupWizard.tsx:272` — uses `flex justify-end` (slide-over shape)
- `components/HIPPlanEntryWizard.tsx:268` — same

**Drawers (no canon for the bottom-drawer pattern yet):**
- `app/ggob/page.tsx:3299` — chart drawer (`flex flex-col justify-end`)
- `app/ggob/page.tsx:3460` — Line Detail slide-over (large multi-section body; could migrate to SlideOverPanel but body refactor is non-trivial)

**Wizards with custom multi-step chrome (case-by-case judgment):**
- `components/MiniGameWizard.tsx:292` — multi-step wizard, custom close button + step indicators
- `components/DocumentImport.tsx:249` — likely similar shape

**Need a Modal API extension before they can migrate:**
- `app/directory/page.tsx:1517/1691` — sectioned-padding pattern (`px-6 py-4` per section, `border-b` between header/body/footer). Modal's strict `p-5` doesn't fit. Would need a `noPadding` or `sectioned` mode.
- `app/ideas/page.tsx:554/712/775` — custom title row with badges + close-X + multi-section body. Could use `headerSlot` for the close-X but the body sections are coupled to the title's badges. Refactor each individually.

**Still TBD (modal-shaped but deferred for clarity):**
- `app/meetings/page.tsx:562` — Quarter/Year picker (multi-section body with year selector + quarter selector + footer with Start Day 1 button alongside Cancel). Migrating cleanly needs careful body decomposition.

Continuing the sweep is mechanical — each migration follows the same "lift `title` + `subtitle` + body + `footer` props out of the inline JSX" recipe.

## Related canon

- `reference_shared_components.md` — full primitives roster (now includes `<Modal>`)
- `reference_filter_toggle_convention.md` — switch shape (different role, same canon-strictness mindset)
- `feedback_canon_strictness.md` — the rule that makes this all matter
