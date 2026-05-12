---
name: SearchablePicker canon
description: components/SearchablePicker.tsx is canon for "pick from many" form-input pickers. Popover + autofocus search + multi-line options + group headers + keyboard nav. Use when option count or disambiguation outgrows native select+optgroup.
type: reference
originSessionId: f3055e97-3818-4a61-bef4-8209cd87b3a7
---
# SearchablePicker canon

`components/SearchablePicker.tsx` is the canonical "pick from many" form-input picker. Established #551 (formula slot picker — 45 metrics across 5 groups, owner-disambiguated names). Reuse via the `<SearchablePicker>` component; do not roll new dropdown logic.

## When to use — the threshold rule (v0.3.14, canon-locked)

**Use `<SearchablePicker>` (or its `<UserPicker>` / other typed wrapper) whenever ANY of these are true:**

1. **Option count ≥ 10.** Hard threshold. At 10+ items, a visible search box + anywhere-substring match is faster than scanning. No native `<select>` for lists this size.
2. **Options reference a real-world entity** (user, team, rock, milestone, metric, course, etc.) — regardless of count. Entity lists grow over time; what's 6 today is 30 in a year. Pick once, scale forever.
3. **Options need multi-line display** (primary label + secondary metadata, e.g. owner, role, team).
4. **Options need group headers** to cluster by scope/category.
5. **Options benefit from icon decoration** (avatar, glyph) inline.

When any rule fires, the picker:
- Renders a visible autofocused search input at the top
- Matches anywhere-substring across `label + sublabel + group + searchTokens` (case-insensitive)
- Supports ↑↓ Enter Esc keyboard nav

## When NOT to use — native `<select>` is fine

Native `<select>` (or a sibling small-fixed-option picker like `<StatusPicker>` / `<PriorityPicker>`) is correct ONLY when ALL of these are true:

- ≤ 9 options
- Options are a **fixed, closed set** that won't grow (weekday, layout mode, recurrence frequency, yes/no/maybe)
- Options are NOT entity references
- Label alone disambiguates (no metadata needed)

Examples that stay native: recurrence frequency (5 options), weekday (7), layout mode (2), Modal layout (3).

Examples that MUST be SearchablePicker even though they're small today: user pickers, team pickers, rock/milestone/metric pickers — anything pointing at a row in a DB table that grows.

## Alignment rule (v0.3.16, canon-locked 2026-05-11)

`<SearchablePicker>` has an `align="left" | "right"` prop (default `"left"`), mirroring `<Popover>`. The panel anchors to that edge of the trigger.

**Rule:** pickers sitting in the right column of a multi-column form (or anywhere near a container's right edge) MUST pass `align="right"`. The panel then extends left into the form area instead of overflowing the container.

**Why:** slide-over panels use `overflow-y: auto`, which silently promotes `overflow-x` from `visible` to `auto` (CSS spec gotcha). A wide popover overflowing the right edge of a slide-over triggers horizontal scroll on the slide-over body — the whole editor visibly shifts when the picker opens. `align="right"` fixes it by keeping the panel inside the container.

`<UserPicker>` forwards the same prop. Future typed picker wrappers should too.

## Threshold rationale

10 is the convention used across Material Design (autocomplete-over-select guidance), Polaris, and most modern enterprise UIs. Below 10, scanning beats searching. At 10+, search box pays for itself on the first miss. Bundling the "always-search for entity lists" rule ensures consistency as data grows — a 6-user picker that grows to 70 doesn't silently degrade UX.

## API

```tsx
<SearchablePicker
  value={id | ""}
  onChange={(id) => …}
  options={[
    {
      id: string,
      label: string,         // primary line
      sublabel?: string,     // secondary line, smaller + gray
      group?: string,        // section header in dropdown
      icon?: ReactNode,      // left-side decoration (avatar, glyph)
      badge?: ReactNode,     // right-side decoration (small chip — see Badge slot below)
      searchTokens?: string, // extra strings to match (label/sublabel/group already match)
      disabled?: boolean,    // renders but unselectable
    },
    …
  ]}
  placeholder="— select —"
  searchPlaceholder="Search…"
  panelWidth={320}     // default 320, override for narrower fields
  triggerShape="form"  // "form" (default) | "inline" — see Trigger shape below
  align="left"         // "left" (default) | "right" — see Alignment rule above
/>
```

## Trigger shape — `triggerShape="form"` (default) | `"inline"` (v0.4.0, s60)

`<SearchablePicker>` renders two distinct trigger shapes depending on where it lives in the layout:

| Shape | Use for | Renders as |
|---|---|---|
| `"form"` (default) | Pickers inside form fields, slide-over body, table cells — anywhere a labeled `<select>`-like surface is expected. | `border border-gray-200 rounded-md px-2 py-1.5 text-sm bg-white` (form-input shape). |
| `"inline"` | Pickers embedded in typography — page H1 scope picker, inline-clickable labels, etc. | Plain text with chevron and hover state. No border, no chip background, inherits surrounding font size + weight. |

The `"inline"` shape is the canonical H1 team-picker pattern — see `reference_team_picker.md`. Hover behavior on inline triggers: text color lifts to brand-blue (`hover:text-[#0069AA]`) so the surface reads as clickable.

```tsx
// H1 inline use
<h1 className="text-2xl font-bold flex items-baseline gap-2">
  <span>To-Dos</span>
  <span className="text-gray-300 font-normal">—</span>
  <SearchablePicker
    triggerShape="inline"
    options={scopeOptions}
    value={scopeValue}
    onChange={setScope}
  />
</h1>
```

When `triggerShape="inline"`, the picker inherits the parent's font size + weight — no need to override. The panel that opens is the same shape regardless of trigger.

## Badge slot — `option.badge` (v0.4.0, s60)

Each option can carry a `badge` ReactNode rendered at the right end of the row, opposite the optional left-side `icon`. Used for short status markers that disambiguate options without consuming the primary label real estate.

Canonical example — "Primary" badge on the user's primary team in the team-scope picker:

```tsx
{
  id: primary.id,
  label: primary.name,
  icon: <TeamChip team={primary} size="xs" />,
  badge: (
    <span className="text-[9px] uppercase tracking-wider font-semibold
                     text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
      Primary
    </span>
  ),
}
```

Badge anatomy (loose, but follow when in doubt):
- Small uppercase pill — `text-[9px] uppercase tracking-wider font-semibold`
- Subtle background — `bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded` for neutral status; entity-tone bg for status badges
- Don't put long copy in the badge — single short word ("Primary", "New", "Locked")
- Don't use the badge for the option's primary identity — that's the `label`'s job

The badge does NOT appear on the **trigger** — only inside the dropdown. When the user selects a row with a badge, the trigger shows just the option's `label` (e.g. `Leadership Team ▾`, not `Leadership Team Primary ▾`). The badge's purpose is dropdown-side disambiguation, not status persistence.

## Visual canon

- Trigger = full-width form-input button: `border border-gray-200 rounded-md px-2 py-1.5 text-sm bg-white`. Selected option's icon + label + (em-dash + sublabel) inside; placeholder gray when nothing selected.
- Panel = absolute below trigger, `bg-white border-gray-200 rounded-lg shadow-lg z-50`, default `min-w-[320px]`.
- Search input = top of panel, autofocused on open, focus-ring `#0069AA/30`.
- Group header = `text-[10px] font-semibold text-gray-400 uppercase tracking-wide`.
- Option row = 2-line layout: primary label `text-sm text-gray-700` (or `font-semibold text-gray-800` when selected), sublabel `text-[11px] text-gray-400`, left icon `mt-0.5`.
- Selected option = subtle gray-50 bg + brand-blue checkmark on the right.
- Highlighted option (keyboard) = `bg-[#0069AA]/10`; mouse-hover sets highlight to that index.
- Empty state (no matches) = `"No matches"` centered in `text-xs text-gray-400`.

## Behavior canon

- Click trigger → open. Search input focused next tick.
- Search filters by case-insensitive substring against `label + sublabel + group + searchTokens`.
- Keyboard: `↓` from search → first option; `↑↓` cycle; `Enter` selects highlighted; `Esc` closes (no change).
- Click option → onChange + close. Clicking the trigger when open closes it.
- Click outside the picker → close.
- Reopen resets `query` to empty so a fresh search starts each time.
- Disabled options render but don't participate in keyboard nav and aren't clickable.

## Related canon

- `reference_panel_vs_modal.md` — Popover for menus + dropdowns; this picker IS a Popover-shape but a form-input variant of one.
- `reference_user_avatar.md` — when an option's icon represents a user, pass either `<UserAvatar size="xs" />` or an inline initials circle (formula slot picker uses inline because it sits inside an option button — `<UserAvatar>` would nest tooltips).
- `reference_shared_components.md` — picker family entry point.
