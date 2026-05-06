---
name: List standards — Playbook (and other non-OS apps)
description: Tier-1 canon for list pages in non-OS Intrust apps (Playbook today; future merged surfaces). Extends reference_list_standards.md (the OS-locked spec) with Bands 1-4 applicability, stripe shape + colors, table-vs-div rule, action-cluster subset, bulk-select scope, and "primary status, not priority" semantics for non-OS entities.
type: reference
---

# List-page standards — non-OS entities (Playbook)

This doc is the **Tier-1 sibling** to [`reference_list_standards.md`](reference_list_standards.md). The OS doc is the authority on Bands, row chrome, sticky behavior, sort-on-headers, column justification, team scope, bulk-action bar, session-persisted view, find-mode picker, and right-click universal coverage. **Read it first.** Everything below is *additive* — stripe shape/colors, primary-status mappings, table→div rule, action-cluster subset, and per-page band applicability for non-OS entities.

When this doc and the OS doc disagree on the *shape* of a primitive (row chrome, sticky wrapper, sort, column justification, find-mode picker), **the OS doc wins**. The whole point of canon is that a Rock and a Course render with the same rhythm in a hypothetical merged surface.

---

## 1. Stripe — see `reference_stripe_system.md` (v0.3.0)

**v0.3.0 update:** the v0.2.0 "Playbook = 4px double" rule has been retired. All Intrust apps now use the same single-solid-stripe shape via `box-shadow: inset` — depth (thickness) and hue (entity) and state (color override) are the encoding axes, app distinction lives in **brand-accent chrome** (sidebar logo, H1 mark on non-entity pages), NOT stripe shape.

Read [`reference_stripe_system.md`](reference_stripe_system.md) for the full spec — it's the single source of truth for stripe rendering across OS, Playbook, and future Intrust apps. Quick summary for Playbook:

| Entity | Depth | Thickness | Hue (CSS var) |
|---|---|---|---|
| Series (top of Course family) | 1 | 8px | `--color-stripe-course` (violet `#8B5CF6`) |
| Course | 2 | 6px | `--color-stripe-course` (inherits Series) |
| Content — Process / Core Process / Procedure | 1 | 8px | `--color-stripe-content-process` (sky `#0EA5E9`) |
| Content — Guide | 1 | 8px | `--color-stripe-content-guide` (yellow `#EAB308`) |
| Content — Policy | 1 | 8px | `--color-stripe-content-policy` (rose `#F43F5E`) |
| Content — Standard | 1 | 8px | `--color-stripe-content-standard` (fuchsia `#D946EF`) |
| Content — Reference | 1 | 8px | `--color-stripe-content-reference` (slate `#64748B`) |
| Enrollment | 1 | 8px | `--color-stripe-enrollment` (lime `#84CC16`) |
| User · Team · Tag (admin tables) | — | no stripe | — |

**Universal-row-consistency rule applies.** A Process renders at 8px sky everywhere it appears — on `/content`, listed as a course item, in search results, anywhere. Thickness is a fixed property of the entity type, not of where it's rendered. See `reference_stripe_system.md` §1 for the full doctrine.

**Step is not a list-row.** Steps are inline children of Procedures (rendered by the structured-body editor as numbered substeps). They don't get a list-page treatment and don't get a stripe.

**Composition pattern** — use the canon helper + flagged tab:

```tsx
<div className="relative">
  {row.flagged && <FlaggedTab />}
  <div
    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group"
    style={stripeStyle({
      color: "var(--color-stripe-content-process)",
      depth: 1,
      state: row.done ? "done" : row.flagged ? "flagged" : "default",
    })}
  >
    {/* row content */}
  </div>
</div>
```

Helper at [`lib/stripes.ts`](../lib/stripes.ts), tab primitive at [`components/FlaggedTab.tsx`](../components/FlaggedTab.tsx). Copy both into your app per the @intrust/canon guidance-only model.

---

## 2. Per-entity rules

The full hue table lives in §1. This section codifies the rules that aren't just "what color."

**Hues drawn from outside the OS palette.** Issues = red, Todos = green, Rocks = indigo, Headlines = amber — those are off-limits for Playbook entities so a hypothetical mixed-OS+Playbook surface is unambiguous. The Playbook hues (violet / sky / yellow / rose / fuchsia / slate / lime) all stay >60° hue-separated from OS hues + brand-blue + brand-orange.

**Collision audit (close-but-not-identical hues).** Yellow (Guide) ≈ Amber (Headline). Rose (Policy) ≈ Red (Issue). Lime (Enrollment) ≈ Green (Todo). **Accepted for now (Option B):** in any single Playbook surface today, you only see Playbook entities — internal distinction is what matters. **Reserved escalation (Option C):** if a mixed-OS+Playbook surface ever ships, switch Playbook entities to lightness-shifted variants in that surface. Codify the rule when needed; don't pre-engineer.

**Enrollment stripe is fixed** (always lime), regardless of whether the enrollment is active / overdue / completed. Status is conveyed by the slot #4 due-date pill, not the stripe — preserving the canon rule "stripe encodes entity *type*, not *state*." (Stripe state shifts to gray only when row is `done`, and row gets a `<FlaggedTab/>` only when row is `flagged` — see `reference_stripe_system.md` §3.)

**Admin tables get no stripe.** Users / Teams / Tags aren't entity-typed in the OS sense — they're administrative records. A stripe would imply they belong in the same visual category as Courses or Content; they don't. The list still uses the canonical row outer chrome, just with no `box-shadow: inset` stripe.

**H1 stripe-mark.** On entity list pages (`/content`, `/courses`, `/enrollments`), the H1 mark uses the entity hue (matching the row stripe). On non-entity pages (`/admin/settings`, `/learn`, `/reports`), the H1 mark uses the **Playbook app accent** — sky `#0EA5E9` per `reference_color_palette.md` "App brand accents."

---

## 3. Bands 1–4 applicability per Playbook page

OS canon: every list page has a 4-band sticky stack (Title / Filters / State tabs / Column headers). Not every Playbook page needs all four — some surfaces don't have meaningful state-flip semantics or filter-worthy field sets. Codified per page:

| Page | Bands | Rationale |
|---|---|---|
| `/content` | **1 + 2 + 3 + 4** | DRAFT / IN_REVIEW / PUBLISHED / NEEDS_REVIEW state tabs are useful. Filter by category + tag. Sortable column headers. |
| `/content/review` | 1 + 2 + 3 + 4 | Subset of `/content` filtered to review-needed; same chrome. |
| `/courses` | **1 + 2 + 3** | Published / Draft state tabs. No column-header strip — courses render as cards (richer than tabular rows). |
| `/courses/[id]` Items tab | 1 + 4 | Single-state list; no filters. Sortable item order via drag. |
| `/courses/[id]` Quizzes tab | 1 + 4 | Same. |
| `/courses/[id]` Enrollments tab | 1 + 2 + 3 + 4 | Mirrors `/enrollments` chrome, scoped to one course. |
| `/enrollments` | **1 + 2 + 3 + 4** | Active / Overdue / Completed state tabs. Filter by user / course / team. Column headers. |
| `/learn` | 1 only | Learner's own card view; no filter/state surface needed. |
| `/admin/users` | **1 + 2 + 3 + 4** | Active / Inactive state tabs. Filter by role / team. Column headers. |
| `/admin/teams` | **1 + 2** | No state-flip semantics. Filter by category if many teams. Expandable cards (no column-header strip). |
| `/admin/settings` | **1 only** | Categories + Tags are tiny inline rows; just an entity-name h1 + Add button. |
| `/reports` | 1 + 2 | Filter-driven (date range / scope) but no rows-with-state semantics. |

Pages running Bands 1+2 only still use the OS sticky-wrapper pattern (`sticky top-12 z-30 bg-[#f7f8fa] -mx-8 px-8 …`) so the band rhythm is preserved.

---

## 4. Table vs div rows

**Canon: div-rows everywhere.** Playbook surfaces using real `<table>` today (`/enrollments`, `/courses/[id]` Enrollments tab, `/admin/users`) migrate to div-rows + `<SortHeader>` from OS canon (already in `components/SortHeader.tsx`).

Tables are only allowed when there's a genuine data-grid need:
- Frozen columns (horizontal scroll with sticky leftmost cells)
- Numeric pivot (cross-tabulation with row + column aggregates)
- Multi-cell range selection (Excel-like)

Playbook has **none of these today**, so all current tables migrate. If a future surface genuinely needs one, document the deviation in the page itself (`{/* TABLE — needed for [reason] */}`) and keep it visually consistent with div-rows in row chrome (padding, hover, cursor, stripe).

Sortable headers in div-rows: use the existing `<SortHeader>` primitive with `align="left" | "center" | "right"` matching the column-justification rule from OS canon (text-LEFT, numeric/date-RIGHT, pills/avatars/icons-CENTER).

Native column-resize is the only meaningful loss from migrating tables. OS doesn't have it on most lists either; it's only on `/scorecard` (a true data grid) via `lib/use-column-resize.ts`. If a Playbook list ever needs resize, lift the same hook.

---

## 5. Action-cluster order in Band 1

OS canon (R→L): `+ Add → AI → archive → refresh → kebab`.

Playbook subset (R→L): **`+ Add → AI → kebab`**.

| Removed | Why |
|---|---|
| Archive icon | Playbook has no archive concept on Content / Course / Enrollment / User. Adding one is a separate punchlist. |
| Refresh icon | No live-refresh dashboards in Playbook today; data is request-bound. |

Order rule unchanged: rightmost = primary CTA (`+ Add <Entity>`, brand-blue `#0069AA`, `px-4 py-2 rounded-lg text-white text-sm font-medium`). AI buttons (when added) wrap in `<AIContextInspector>` per `reference_ai_button.md` + `reference_ai_context_inspector.md`.

If a future Playbook surface adds archive or refresh, slot them into the OS-canonical position (between AI and kebab for archive; between archive and kebab for refresh) — don't invent a new ordering.

---

## 6. Bulk-select scope

| Page | Bulk-select | Bulk actions |
|---|---|---|
| `/enrollments` | **Yes** | Unenroll · Mark complete · Send reminder · Clear |
| `/admin/users` | **Yes** | Activate · Deactivate · Change role ▾ · Clear |
| `/content` | No (today) | — |
| `/content/review` | No | — |
| `/courses` | No | — |
| `/courses/[id]` Items | No (drag-reorder is the primary multi-row affordance) | — |
| `/courses/[id]` Enrollments | Yes (mirrors `/enrollments`) | Same as `/enrollments` |
| `/admin/teams` | No | — |
| `/admin/settings` | No | — |

Wherever bulk-select is enabled, use the OS canonical floating action bar (`fixed bottom-6 left-1/2 -translate-x-1/2 z-40`) per `reference_list_standards.md` "Bulk action bar." Same `<N selected>` label, same Cancel/Clear button, same `bulkBusy` disable-during-flight pattern. Selected rows promote outer border to brand-blue `#0069AA` + `ring-1 ring-[#0069AA]/30` per OS row-chrome canon — replacing the entity stripe is **not** part of the bulk-selected state (stripe stays; ring overlays).

---

## 7. Slot #4 — primary status, not priority

Playbook entities don't have priority. **Slot #4 of the row (the position OS uses for priority badge / StatusTrajectory) is the "primary status" slot.** It stays present so column rhythm matches OS lists in mixed surfaces, but the content is per-entity:

| Entity | Slot #4 content | Width |
|---|---|---|
| Course | Progress mini-bar (`{completed}/{total}` items, thin filled bar, brand-blue) | `w-20` |
| Content (any type) | Status pill — DRAFT / IN_REVIEW / PUBLISHED / NEEDS_REVIEW | `w-24` centered |
| Enrollment | Due-date pill via `formatDueDate` (`Apr 18 (-13d)` / `today` / `2d`) | `w-28` right-aligned |
| User | Active / Inactive pill | `w-20` centered |

**No priority column for Playbook entities.** Don't add one. If a future Playbook entity genuinely needs priority semantics, lift the OS `<PriorityPicker variant="badge">` from canon — don't invent.

The Content status pill colors live in `lib/status-colors.ts` (extending the OS file):
- DRAFT → gray-100 bg, gray-600 text
- IN_REVIEW → amber-100 bg, amber-700 text
- PUBLISHED → green-100 bg, green-700 text
- NEEDS_REVIEW → rose-100 bg, rose-700 text

User Active/Inactive pill:
- Active → green-100 / green-700
- Inactive → gray-100 / gray-500

Course progress mini-bar:
```tsx
<div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
  <div className="h-full bg-[#0069AA]" style={{ width: `${(done / total) * 100}%` }} />
</div>
```

---

## 8. Wiring checklist for a new Playbook list page

1. Confirm the page entity is in the stripe-color table (§2). If not, propose a hue from outside the OS palette and add it here before shipping.
2. Pick the band set from §3. Render bands inside the OS sticky wrapper.
3. Use the canonical row outer chrome from `reference_list_standards.md` + the §1 stripe. Do NOT change padding, rounded, background, or hover.
4. Action-cluster order per §5. AI buttons wrap in `<AIContextInspector>`.
5. If the surface is currently a `<table>`, migrate to div-rows + `<SortHeader>` per §4. Don't ship tables for new surfaces.
6. Slot #4 content per §7. No priority column.
7. Bulk-select per §6. If enabled, use the OS floating action bar + `bulkBusy` pattern.
8. Right-click context menu via `lib/entity-actions.ts` — add a `buildCourseActions` / `buildContentActions` / `buildEnrollmentActions` if one doesn't exist. Same vocabulary as OS (Open / Ask Rickety / Spawn linked / Flag / Delete) extended with entity-specific verbs (e.g. enrollment: Mark complete, Send reminder).
9. Session-persisted view via the OS `<list>.view` sessionStorage pattern. Keys: viewMode, sort, group, state-tab, filters, collapsedGroups. Don't persist the search query string.
10. Verify visually: open the page next to `/issues` (the OS model) — same band rhythm, same row gap (`space-y-1`), same hover, same sticky behavior. Different stripe shape + color is the only intentional deviation.

---

## Why this is canon

The risk without this doc: every Playbook list page is bespoke (already true today — different paddings, different chromes, no entity stripes), every future Intrust app re-derives row standards from scratch, and a hypothetical merged surface (Rock + Course + Content in one planning view) becomes visually unreadable.

With this doc: a non-OS app inherits the same rhythm, same sticky shell, same row contract — and entities are color+pattern-distinguished without anyone re-litigating "what color is a Course."

Pair with [`reference_list_standards.md`](reference_list_standards.md) (OS authority on shape), [`reference_color_palette.md`](reference_color_palette.md) (brand colors + helper signatures), [`reference_drag_reorder.md`](reference_drag_reorder.md) (drag handle canon, already used by Playbook's items list), and [`reference_user_avatar.md`](reference_user_avatar.md) (assignee chips with `role` prop).
