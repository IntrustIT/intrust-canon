---
name: SearchablePicker canon
description: components/SearchablePicker.tsx is canon for "pick from many" form-input pickers. Popover + autofocus search + multi-line options + group headers + keyboard nav. Use when option count or disambiguation outgrows native select+optgroup.
type: reference
originSessionId: f3055e97-3818-4a61-bef4-8209cd87b3a7
---
# SearchablePicker canon

`components/SearchablePicker.tsx` is the canonical "pick from many" form-input picker. Established #551 (formula slot picker — 45 metrics across 5 groups, owner-disambiguated names). Reuse via the `<SearchablePicker>` component; do not roll new dropdown logic.

## When to use

- Option count is large (≥ ~10) AND text-based search would help
- Options need **multi-line** display (primary label + secondary metadata, e.g. owner)
- Options need **group headers** to cluster by scope/category
- Options benefit from **icon decoration** (avatar, glyph) inline

## When NOT to use

- Small fixed-option pickers (status, priority, indicator type) — use the existing dedicated pickers (`<StatusPicker>`, `<PriorityPicker>`).
- Native `<select>` + `<optgroup>` is fine for ~5–10 options where label alone disambiguates.
- Cases that genuinely need a multi-select are out of scope for v1 (this picker is single-value).

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
      searchTokens?: string, // extra strings to match (label/sublabel/group already match)
      disabled?: boolean,    // renders but unselectable
    },
    …
  ]}
  placeholder="— select —"
  searchPlaceholder="Search…"
  panelWidth={320}     // default 320, override for narrower fields
/>
```

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
