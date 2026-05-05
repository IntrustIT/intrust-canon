---
name: Color palette canon
description: THE colors. Brand blue #0069AA, brand orange #F58326 (AI only), destructive red, ok/fail bgs. Plus status colors (lib/status-colors.ts), priority colors (lib/priority-colors.ts), team chips (lib/team-visual.ts). No new color introductions without canon update.
type: reference
---

# Color palette canon

The full color vocabulary. **Don't introduce new colors** without a canon update — every additional shade is one more thing for users to interpret.

## Brand tokens

Centralized in `styles/tokens.ts` (canon repo) and used inline in components as `bg-[#XXXXXX]`, `text-[#XXXXXX]`, etc.

| Token | Hex | When to use |
|---|---|---|
| `brandBlue` | `#0069AA` | Primary buttons, links, focused inputs, active state, drag-drop indicators, sparkline strokes, primary affordance hover. **The default "this is the action" color.** |
| `brandOrange` | `#F58326` | **AI flows ONLY.** AI button bg, AI banner accents, AI flow spinners. Never for non-AI surfaces — that's the whole signal. |
| `destructiveRed` | `#dc2626` | Destructive ops, no-drop indicator, error states. Pairs with the canon `confirmDestructive` red action button. |
| `okGreenBg` | `#DCFCE7` | Cell bg when value meets goal (scorecard cells). Paired with `text-green-700` for the value. |
| `failRedBg` | `#FEE2E2` | Cell bg when value misses goal. Paired with `text-red-600`. |

## Semantic palettes (Tailwind classes — already canon)

These live as helper functions, not raw constants. Pull from the helper, don't hand-roll:

| Concern | Source | Doc |
|---|---|---|
| Entity status (rocks, todos, issues, headlines, metrics) | `lib/status-colors.ts` | `reference_status_pill_semantics.md` |
| Priority (1-5 scale) | `lib/priority-colors.ts` | `reference_priority_palette.md` |
| Team chips | `lib/team-visual.ts` | `reference_status_pill_semantics.md` |
| Issue type (Short-term / Stractical / Long-term) | inline in `reference_issue_type_spectrum.md` | `reference_issue_type_spectrum.md` |
| Empty/loading text | `text-gray-400` (empty) / `text-gray-500` (loading) | `reference_empty_loading_states.md` |

## Common Tailwind class scales we lean on

Backgrounds: `bg-gray-50`, `bg-gray-100`, `bg-gray-200`. Borders: `border-gray-200`, `border-gray-300`. Text: `text-gray-400` (placeholder/empty), `text-gray-500` (secondary), `text-gray-600` (body), `text-gray-700` (emphasis), `text-gray-800` (primary).

Subtotal canon (per `reference_subtotal_metric.md`): `bg-gray-100` + dashed top border + `text-gray-700` + bold.

## What NOT to do

- Don't introduce a new brand color. Only blue + orange. Period.
- Don't use brand orange outside AI flows. Sparkle is the signal.
- Don't introduce a new "warning amber" without checking — the existing one is `text-amber-500` / `text-amber-600` for ⚠️ glyphs (e.g., missing-data warnings on group totals). Match.
- Don't pick a Tailwind color you haven't seen elsewhere in the app. If it doesn't look familiar, you're inventing — stop and ask.
- Don't roll inline hex values for status, priority, or team — go through the helper. Hardcoded inline hex is fine for brand tokens (we re-export them anyway), but semantic colors flow through helpers.

## Adding a new color

If you genuinely need a new color (rare), the workflow is:

1. PR to `intrust-canon` with the addition to `styles/tokens.ts` (if brand-level) OR to the appropriate helper (if semantic).
2. Update this doc explaining when to use it.
3. Both consumers `npm install` to refresh `docs/canon/`.
