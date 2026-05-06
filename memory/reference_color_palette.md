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

## App brand accents (v0.3.0)

Each Intrust app gets ONE per-app accent hue used for **identity surfaces** — the chrome that says "you are in app X." This sits alongside the universal brand-blue `#0069AA` (action color, all apps) and brand-orange `#F58326` (AI + flagged ribbon, all apps).

| App | Accent | Hex | Status |
|---|---|---|---|
| OS (intrust-os) | indigo-500 | `#6366F1` | Active |
| Playbook (intrust-lms) | sky-500 | `#0EA5E9` | Active |
| Compass (planned) | emerald-500 | `#10B981` | Reserved |
| App 4 (planned) | amber-500 | `#F59E0B` | Reserved |
| App 5 (planned) | rose-500 | `#F43F5E` | Reserved |

**≥60° hue separation between every neighbor** — pre-attentive distinction at a glance. New apps must pick from the reserved slots or propose a hue with the same separation rule.

### Action zone vs identity zone

The hard rule keeping app-accent and brand-blue from colliding:

| Zone | Color | Where it shows up |
|---|---|---|
| **Action zone** | Brand-blue `#0069AA` (universal across all apps) | Primary CTAs (`+ Add X`), focus rings, sortable column hover, link colors, bulk-selected row outer border + ring, page-load spinners (functional progress signals). |
| **Identity zone** | Per-app accent | Sidebar logo treatment, page H1 stripe-mark **on non-entity pages** (entity pages use the entity hue), splash screens, empty-state illustrations, top-bar tint. |

**The two zones never overlap.** App-accent does NOT appear on buttons, focus rings, or selection rings. Brand-blue does NOT appear on identity surfaces. A user moving between OS and Playbook sees *the same button color* (familiarity) but *different surrounding chrome tint* (orientation: "I'm in Playbook now").

**Spinners.** Page-load + save spinners stay brand-blue universally — they live in the action zone (response to a click). Brand-orange remains for AI flows only. App-accent does NOT replace functional spinner color.

**H1 stripe-mark precedence.** On entity list pages, the H1 mark uses the entity hue (Issue page = red, Rock page = indigo, Course page = violet). On non-entity pages (`/dashboard`, `/admin/settings`, `/reports`, etc.), the H1 mark uses the app accent.

---

## CSS variables — Tailwind v4 @theme convention (v0.3.0)

All stripe + brand colors are referenced via CSS custom property, never literal hex. Required for forward-compatible dark-mode work.

```css
@theme {
  --color-brand-blue: #0069AA;
  --color-brand-orange: #F58326;

  --color-app-accent-os:       #6366F1;
  --color-app-accent-playbook: #0EA5E9;

  --color-stripe-issue:    #EF4444;
  --color-stripe-todo:     #22C55E;
  --color-stripe-rock:     #6366F1;
  --color-stripe-headline: #F59E0B;
  /* Milestone shares --color-stripe-rock — depth-2 inherits parent */

  --color-stripe-course:               #8B5CF6;
  --color-stripe-content-process:      #0EA5E9;
  --color-stripe-content-guide:        #EAB308;
  --color-stripe-content-policy:       #F43F5E;
  --color-stripe-content-standard:     #D946EF;
  --color-stripe-content-reference:    #64748B;
  --color-stripe-enrollment:           #84CC16;
}

/* TODO: define .dark { --color-stripe-* } overrides when dark-mode lands.
 * Each entity's dark-mode hex needs to be designed (not just shifted by
 * one Tailwind tone) for AA contrast on dark surfaces. */
```

**Naming convention:** `--color-stripe-{entity-key}` for entity stripes, `--color-app-accent-{app}` for app accents, `--color-brand-{role}` for the universal brand tokens. Tailwind v4's `@theme` directive auto-generates utilities (`bg-stripe-issue`, `border-stripe-issue`) AND the raw CSS var, so both consumption paths work from one source of truth.

**Migration policy.** v0.3.0 mandates the convention going forward. Existing OS code with hex literals (`bg-[#EF4444]`, `border-l-[#22C55E]`) renders identically in light mode, so the retrofit is safe to do incrementally. Light-mode rendering is unchanged.

**Dark-mode scope.** v0.3.0 wraps stripe + brand colors only. Full dark-mode rollout (status colors / priority colors / team chips / gray-* utilities) is v0.4.0+.

---

## Retired colors

| Color | Was used for | Retired in | Replaced by |
|---|---|---|---|
| teal-500 `#14B8A6` | Milestone entity stripe | v0.3.0 | Indigo at depth-2 (Milestone inherits Rock's hue, distinguished by thickness). Teal is now an unused hue available for future entities. |

---

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
