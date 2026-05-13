---
name: Persistent section grouping by attribute
description: Pattern for sections that always render at a fixed position in a list (top or bottom), grouped by a stable attribute. Distinct from dynamic group-by selectors. Each section declares its own sort/group contract. Pilot: Stractical issues (top of Short-Term tab on /issues).
type: reference
---

# Persistent section grouping by attribute

## When this pattern applies

Some list-pages have items that genuinely deserve fixed visual real
estate — a section that's always there at top or bottom of the list,
grouped by an attribute the user doesn't need to choose to surface.

Examples:
- Stractical issues at the top of the Short-Term tab on /issues
- Pinned items at the top of a list (future canon when needed)

Counter-example (worth calling out — common mistaken assumption):
**Done todos are NOT a persistent section.** Completed todos render
inline with the rest of the list, governed by normal filters/sort. The
RowStateCircle is the only state affordance; there is no bottom-of-list
"Done" bucket. Don't propagate a Done-section pattern from /todos — it
isn't there.

These are NOT the same as the user-driven Group by selector in the
⋮ view kebab. Persistent sections are always-on per the page; the
user can collapse them but not remove them.

## Visual + behavior contract

A persistent section renders as:

```
▾ {Section Name} ({N})
   {row}
   {row}
   {row}
```

- **Header** — `bg-gray-50 px-3 py-2 rounded-md text-xs text-gray-500
  font-medium flex items-center gap-2 cursor-pointer hover:bg-gray-100`
- **Chevron** — `▸` collapsed, `▾` expanded. Click toggles. State
  persists in sessionStorage keyed by `{page}.{section}.collapsed`.
- **Item count** in parens after the name
- **Row template inside** — identical to the page's main row template;
  reads as "more of the same kind of item, just grouped"
- **Empty state** — when the section has zero items, the section
  header is NOT rendered. No "No stractical items" placeholder.
- **Position** — fixed per section (top or bottom of the list, declared
  by the section); not movable by the user.

## Section identity chrome (v0.4.6)

A persistent section makes two claims at once: "this bucket has its
own identity" AND "you can collapse me without losing me." Two visual
elements are required to carry those claims together. Either alone is
incomplete — stripe alone doesn't terminate the bucket; rule alone
disappears when the section is collapsed.

### 1. Type-tinted left-edge stripe (identity marker)

A 4px stripe runs the full left edge of the section container. Color
matches the section's entity-type hue from the stripe system (not
gray) — Stractical = `border-purple-300`, future Pinned = headline hue,
etc. Pulled into the page gutter so inner rows align with non-section
rows below.

Locked classes on the section wrapper:
```
-ml-4 pl-3 border-l-4 border-{type-color} rounded-l-sm
```

Stripe persists in both collapsed AND expanded state — it carries
identity across the toggle.

### 2. Shortened bottom rule (terminator)

A light gray bottom rule closes the bucket. Shortened on the right via
`mr-12` so it reads as "end of section" rather than "page-wide
separator."

Locked classes added to the same section wrapper:
```
pb-2 mb-2 mr-12 border-b border-gray-300
```
(use `pb-3 mb-3` in list view density; `pb-2 mb-2` in compact view.)

### 3. Header pill stays neutral

The header pill keeps the canonical gray spec (`bg-gray-50
hover:bg-gray-100 text-gray-500`). The type color belongs to the
stripe, not the header. Tinting the header is double-encoding and
visually broken (tested s62, didn't land).

### Off-canon for section identity

- Full-background diagonal stripe patterns — too noisy.
- Type-tinted header bands — visually broken.
- Heavy black or full-width bottom rules — read as page separators,
  not section terminators.
- Stripe in expanded state only (vanishing when collapsed) — defeats
  the "identity across the toggle" purpose.

### When this chrome applies

Persistent sections only. NOT to:
- Dynamic Group-by buckets (the user-picked groupings from the ⋮ view
  kebab) — those use plain gray headers, no stripe, no terminator
  rule.
- Filter chips, tabs, or other strong visual containers.
- Inline rows that have no section identity.

The test: is this section always-on per the page's contract
(collapse-only, can't hide)? If yes, apply the chrome. If it's a
user-chosen group, leave it plain.

### Reference impl (s62)

`app/issues/page.tsx` Stractical section — compact view ~1779, list
view ~1903. Same wrapper class string in both views, just density
differs (`pb-2 mb-2` vs `pb-3 mb-3` + `space-y-1` vs `space-y-2`).

## Sort + group-by contract per section

Each persistent section declares its own sort/group contract.

| Section | Position | Default state | Respects page sort? | Respects page group-by? |
|---|---|---|---|---|
| Stractical (/issues Short-Term tab) | Top | Expanded | Yes | No |
| Pinned (future) | Top | Expanded | Yes | No |

The shared rule: **persistent sections opt out of the page's dynamic
group-by selector.** Nesting groups inside small sections is over-chrome;
the section itself IS the grouping affordance.

The variable rule: sort behavior. Active sections respect the page's
active sort because users want meaningful ordering inside the bucket.

## Filter behavior

**Filters apply to ALL sections.** Narrowing "Raised by: Bob" narrows
both the persistent section and the main pile. The user's filter
intent applies everywhere; only visual grouping is what sections opt
out of.

## When NOT to use this pattern

- Dynamic groupings the user picks (Raised by / Team / Due-bucket).
  Those are the page's group-by selector, not persistent sections.
- Items that should only be visible in certain contexts. If you'd
  hide the section sometimes, it doesn't qualify as "persistent."
- One-off visual emphasis on a single row. Use a row badge or stripe,
  not a section.

## Anatomy example (/issues Short-Term tab)

```tsx
{/* Persistent Stractical section, expanded by default */}
{stractical.length > 0 && (
  <>
    <button
      onClick={() => toggleSection("stractical")}
      className="w-full bg-gray-50 px-3 py-2 rounded-md text-xs text-gray-500 font-medium flex items-center gap-2 cursor-pointer hover:bg-gray-100"
    >
      {collapsed.stractical ? <ChevronRight /> : <ChevronDown />}
      Stractical
      <span className="text-gray-400">({stractical.length})</span>
    </button>
    {!collapsed.stractical && stractical.map((issue) => <IssueRow ... />)}
  </>
)}

{/* Main pile — respects user's group-by selector */}
{groupBy === "none" ? (
  mainIssues.map((issue) => <IssueRow ... />)
) : (
  groupedMain.map((group) => <GroupHeader + rows ... />)
)}
```

## Meeting-runner consistency

Per `feedback_meeting_runner_consistency.md`, the meeting runner and
the list-page must look and behave the same way. If the runner has a
dedicated section/page for a sub-type (e.g. L10 walks through
Stractical issues on their own page before Short-Term), the list-page
must surface those items as a persistent section.

In other words: a sub-type that earns its own meeting-runner page
earns a persistent section on the corresponding list-page. They're
the same content, rendered for different surfaces.

## Off-canon

- Adding a section header at the top that's actually just a styled
  "primary group" of a dynamic group-by. Use the page's real group-by
  selector instead.
- Hiding the section entirely when collapsed (with no "expand" affordance
  remaining). The collapsed header MUST stay visible — that's the only
  way the user knows the section exists.
- Letting the user drag the section to a different position. Position is
  fixed per section.
- Nesting the page's dynamic group-by INSIDE a persistent section
  (e.g. "Stractical (3 items, grouped by raised-by, 1 each)" — three
  sub-headers with 1 row each). Persistent sections stay flat per the
  group-by opt-out rule.

## See also

- `reference_list_standards.md` — overall list anatomy
- `reference_list_row_column_order.md` — row template that renders inside sections
- `reference_list_view_kebab.md` — dynamic group-by selector
- `reference_primary_mode_tabs.md` — primary-mode tabs (Stractical lives inside the Short-Term tab as a section, not as its own tab)
- `feedback_meeting_runner_consistency.md` — runner mirrors list-page sections
