---
name: TabCountBadge primitive
description: Tiny count pill that sits next to a tab label, with active/inactive color treatment that follows the tab's active state.
type: reference
---

**`<TabCountBadge count={N} active={boolean} tone? />`** is the canonical shape for the small count pill that lives next to a hub/page tab label.

## Shape (locked)
```
className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
```

## Color treatment
- `active && tone="default"` → `bg-blue-100 text-blue-700`
- `active && tone="ai"` → `bg-orange-100 text-orange-700` (AI-themed tabs only)
- `!active` → `bg-gray-100 text-gray-500`

Tone defaults to `"default"`. The `"ai"` tone is reserved for tabs that surface AI-classified content (e.g. an AI-triage queue). Per `reference_color_palette.md`, brand-orange is AI-only — do not use the AI tone for non-AI tabs even if you want visual differentiation.

## When to use
- Next to any tab label that has a meaningful count of items behind it (Attention badge, Triage queue, Inbox count, etc.).
- Inside hub-page tab bars (per `reference_hub_page.md`).

## When NOT to use
- For non-tab count badges — use a regular pill primitive instead. TabCountBadge's tone treatment is tied to tab active-state, not generic count surfacing.
- When the count is zero — hide the badge entirely (don't render "0"). Consumers gate on `count > 0` before rendering.
- For status indicators that happen to be numeric (priority, score, etc.) — those use their respective status/priority canon.

## Tab bar context
Pairs with `reference_hub_page.md` tab spec:
```
<div className="flex gap-1 mb-6 border-b border-gray-200">
  <button className="px-4 py-2 text-sm font-medium border-b-2 transition-colors {active ? 'border-[#0069AA] text-[#0069AA] -mb-[1px]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}">
    Label
    {count > 0 && <TabCountBadge count={count} active={active} />}
  </button>
</div>
```

## Reference implementation
Lives in canon `components/TabCountBadge.tsx`. Three lines of JSX inside a span; consumers copy into their own `components/` directory.

Canonized 2026-05-17 from OS dashboard tab bar (`app/dashboard/page.tsx` ~L1556 / L1573 / L1590).
