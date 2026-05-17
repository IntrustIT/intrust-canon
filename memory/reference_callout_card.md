---
name: CalloutCard primitive
description: Branded soft-tinted card with colored border for important callouts that aren't modals — Attention surfaces, AI insights, recommendations, warnings.
type: reference
---

**`<CalloutCard tone="info|warn|ai" title? children />`** is the canonical shape for a branded callout that announces "this is important, look here" without being a modal or full-page interrupt.

## Tones (fixed)
- `info` (default) — brand-blue. Background `bg-[#0069AA]/10`, border `border-2 border-[#0069AA]/30`. Used for: Attention surface, neutral system-surfaced callouts, informational alerts.
- `warn` — amber. Background `bg-amber-50`, border `border-2 border-amber-300`. Used for: at-risk surfaces, soft warnings (NOT destructive — those use modal/confirm primitives).
- `ai` — brand-orange. Background `bg-[#F58326]/10`, border `border-2 border-[#F58326]/30`. Used for: AI-generated insights, AI recommendations, AI-classification surfaces. Pairs naturally with `<AIContextInspector>` wrap.

## Shape (locked)
- `rounded-xl p-4`
- Optional `title` prop renders as `<h3 className="text-sm font-semibold text-[<tone-accent>] mb-2 flex items-center gap-2">` with optional Lucide icon slot.
- Children render below the title in their natural flow — list, grid, prose, all valid.
- No internal scroll. If content overflows, the card grows. Use sparingly — a callout is "the top N items," not "every item."

## When to use
- Top of a page when surfacing items that needed system surveillance to find.
- Above a list when calling attention to a subset of rows (e.g. "3 enrollments overdue this week" above the full enrollment list).
- Below the H1 to render AI-generated context that complements the page's main task.

## When NOT to use
- For a single inline notice — use `<AlertBanner>` (existing primitive).
- For a destructive confirm — use `confirmDestructive` modal.
- For a row-level state badge — use the urgency-color or status-color pill primitives.
- For prose-heavy documentation — use a regular card with no tone treatment.

## Pairs with
- `reference_urgency_colors.md` — content rendered inside a CalloutCard often uses the urgency palette for ranking/tone.
- `reference_dashboard_principles.md` — Attention surface uses `<CalloutCard tone="info">` as its container.
- `reference_ai_button.md` + `reference_ai_context_inspector.md` — AI-tone CalloutCards wrap AI surfaces; inspector goes inside.

## Reference implementation
Lives in canon `components/CalloutCard.tsx`. Consumers copy into their own `components/` directory and match the shape; runtime imports from `@intrust/canon` are forbidden per the guidance-only model.

Canonized 2026-05-17 from the OS dashboard Attention surface (`app/dashboard/page.tsx` ~L1702-1708).
