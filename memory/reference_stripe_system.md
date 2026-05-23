---
name: Stripe system canon
description: THE unified stripe spec for every list-row left edge across every Intrust app. Three-axis encoding — thickness=depth, hue=entity family, state-color=row state. Single helper (lib/stripes.ts), one primitive for the flagged-row outboard tab (components/FlaggedTab.tsx). Every consumer (OS + Playbook + future apps) reads this doc and copies the helper.
type: reference
---

# Stripe system canon (v0.3.0)

The colored bar on the left edge of every list row encodes three things at once:

| Axis | Encodes | Example |
|---|---|---|
| **Thickness (px)** | Depth in the entity family tree | Rock = 8px (top), Milestone = 6px (one level down) |
| **Hue** | Entity family / type | Issue = red, Rock = indigo, Course = violet, Process = sky |
| **State-color override** | Row state (default / flagged / done) | Default = entity hue, Flagged = brand-orange via outboard tab + entity hue stripe, Done = gray-300 |

This doc is the single source of truth. The OS list canon (`reference_list_standards.md`) and the Playbook list canon (`reference_list_standards_playbook.md`) both defer here for everything stripe-related.

---

## 1. Thickness ladder (depth encoding)

| Depth | Thickness | Notes |
|---|---|---|
| 1 | **8px** | Top-level entities in their family. Most lists use this. |
| 2 | **6px** | One level down (Milestone under Rock, Course under Series). |
| 3 | **4px** | Reserved for deeper nesting; no entity uses it today. |
| 4 | **2px** | Reserved for deepest nesting. |
| 5+ | 2px @ 50% alpha | Signals "beyond canonical depth"; reserved, no entity uses it. |

**Thickness is a fixed property of the entity type, not of where it's rendered.** A Process is always 8px sky on `/content` AND when listed as a course item AND in any future surface. A Milestone is always 6px indigo, on `/rocks` Milestone List, in a meeting runner, in search results, anywhere.

> **Why fixed-per-type, not context-dependent.** OS canon's universal-row-consistency rule says an entity's row must look the same in every list it appears in. Depth is assigned ONCE at design time based on the entity's level in its family tree. The thickness ladder exists to assign these canonical thicknesses, not to shift them dynamically.

All thicknesses fit inside the row's `px-4` (16px) left padding so content position is identical at every depth.

---

## 2. Hue (entity family)

Each entity has a single canonical hue. The full per-app entity-color tables live in:
- **OS entities** — `reference_list_standards.md` "Per-type colors"
- **Playbook entities** — `reference_list_standards_playbook.md` §2

Cross-app rule: **entity hues must stay visually distinct from brand-blue (`#0069AA`) and brand-orange (`#F58326`)**. A row whose entity hue is too close to brand-orange would read as "always flagged" at scale; too close to brand-blue would read as "always selected." Stay >60° hue-separated from both.

**Family hue inheritance.** When a family has a parent + child entity, the child inherits the parent's hue and uses a thinner stripe. Examples:
- Rock (8px indigo) + Milestone (6px indigo)
- Series (8px violet) + Course (6px violet) — Playbook

Children do **not** get their own hue — depth-thickness is the differentiator. This frees hues for genuinely distinct families.

**Retired:** Milestone teal `#14B8A6`. Replaced by indigo-at-depth-2 in v0.3.0. Teal is now an unused hue available for future entities.

---

## 3. State (color override)

| State | Stripe color | Stripe thickness | Outboard ribbon | Row text |
|---|---|---|---|---|
| **Default** | entity hue | per depth (8/6/4/2) | none | normal |
| **Flagged** | entity hue (unchanged) | per depth (unchanged) | **6px brand-orange ribbon outside the rounded card** | normal |
| **Done** | gray-300 `#D1D5DB` | per depth (unchanged) | none | strikethrough + muted |

**Thickness is locked across all states.** State only changes color (and adds an outboard ribbon for flagged). Reasoning:
- **Stripe = entity identity.** Even when flagged or done, the row is still that kind of thing. Replacing the hue when flagged (the pre-v0.3.0 OS pattern) loses identity at the worst moment — when you most want to scan "what kinds of things am I flagging?"
- **Outboard ribbon = "really stands out" signal.** A flagged row breaks the row silhouette by extending a small orange tab to the LEFT of the rounded card. Spottable from across the screen. See [`components/FlaggedTab.tsx`](../components/FlaggedTab.tsx) for the canon primitive.
- **Done = depth-preserved gray.** The row recedes (gray-300 stripe + line-through title + gray-400 text), but its shape on the page stays consistent so the eye doesn't have to recalibrate.

**Bulk-selected** is a separate concern — it lives in the row's outer border + ring zone (brand-blue `#0069AA` border + `ring-1 ring-[#0069AA]/30`), NOT the stripe zone. Stripe stays its entity hue when a row is bulk-selected. The two zones never compete.

**Future state additions** (e.g. archived-but-active, due-soon, snoozed) require a canon revision — add the enum value here and document its visual treatment. Don't bypass the helper with custom inline `boxShadow`.

---

## 4. Implementation — single helper, single primitive

Two pieces of code, both in canon as guidance-only reference impls. Each consumer app copies them.

### `lib/stripes.ts` — the helper

```ts
export type StripeDepth = 1 | 2 | 3 | 4 | 5;
export type StripeState = "default" | "flagged" | "done";

export const LADDER: Record<StripeDepth, number> = { 1: 8, 2: 6, 3: 4, 4: 2, 5: 2 };

const ORANGE = "var(--color-brand-orange)";   // #F58326
const GRAY_300 = "var(--color-gray-300)";     // #D1D5DB

/** Compute the stripe React.CSSProperties for a row.
 *
 *  color  — CSS custom property reference for the entity hue (e.g. "var(--color-stripe-rock)")
 *  depth  — 1..5; clamped at 4 visually with depth-5 fading
 *  state  — "default" | "flagged" | "done"
 *
 *  Note: when state is "flagged", the stripe stays entity-hue. The orange
 *  signal is rendered as a separate <FlaggedTab/> sibling element. See
 *  components/FlaggedTab.tsx.
 */
export function stripeStyle(opts: {
  color: string;
  depth: StripeDepth;
  state?: StripeState;
}): React.CSSProperties {
  const { color, depth, state = "default" } = opts;
  const px = LADDER[depth];
  const stripeColor = state === "done" ? GRAY_300 : color;
  const opacity = depth >= 5 ? 0.5 : 1;
  return {
    boxShadow: `inset ${px}px 0 0 0 ${stripeColor}`,
    opacity: opacity < 1 ? opacity : undefined,
  };
}
```

### `components/FlaggedTab.tsx` — the outboard ribbon

```tsx
"use client";

/** Renders a small brand-orange tab/ribbon to the LEFT of a flagged row,
 *  outside the rounded card edge. Breaks the row silhouette so flagged rows
 *  are spottable at scan distance.
 *
 *  Usage:
 *    <div className="relative">
 *      {row.flagged && <FlaggedTab />}
 *      <div className="rounded-lg ..." style={stripeStyle(...)}>
 *        ...row content...
 *      </div>
 *    </div>
 *
 *  The PARENT must be position:relative. The tab itself is absolutely-
 *  positioned and does not affect row layout.
 */
export function FlaggedTab() {
  return (
    <div
      aria-hidden
      className="absolute top-1/2 -translate-y-1/2 left-[-8px] h-[70%] w-[6px]"
      style={{
        backgroundColor: "var(--color-brand-orange)",
        borderTopLeftRadius: 2,
        borderBottomLeftRadius: 2,
      }}
    />
  );
}
```

The 8px negative offset + the row's `relative` parent are load-bearing. If a row needs to live in a tighter container that can't absorb 8px of left bleed, use a different flag affordance — don't crop the tab.

---

## 5. Color tokens — CSS variables (Tailwind v4 @theme)

All stripe colors are referenced via CSS variable, never literal hex. This unblocks dark-mode work later (a `.dark` selector can override the var, no code sweep needed).

The convention — both apps' globals.css get a block like:

```css
@theme {
  /* Brand */
  --color-brand-blue: #0069AA;
  --color-brand-orange: #F58326;

  /* OS entity stripes */
  --color-stripe-issue:    #EF4444;
  --color-stripe-todo:     #22C55E;
  --color-stripe-rock:     #6366F1;
  --color-stripe-headline: #F59E0B;
  --color-stripe-capture:  #94A3B8;  /* slate-400 — matches "awaiting decision" urgency tone */
  /* Milestone shares --color-stripe-rock — depth-2 inherits parent */

  /* Playbook entity stripes */
  --color-stripe-course:               #8B5CF6;
  --color-stripe-content-process:      #0EA5E9;
  --color-stripe-content-guide:        #EAB308;
  --color-stripe-content-policy:       #F43F5E;
  --color-stripe-content-standard:     #D946EF;
  --color-stripe-content-reference:    #64748B;
  --color-stripe-enrollment:           #84CC16;

  /* Greys used by stripe states */
  --color-gray-300: #D1D5DB;
}

/* TODO: define .dark { --color-stripe-* } overrides when dark-mode lands.
 * Each entity's dark-mode hex needs to be designed (not just shifted by
 * one Tailwind tone) for AA contrast on dark surfaces. See
 * reference_color_palette.md "Dark mode" when that work begins. */
```

**Naming convention:** `--color-stripe-{entity-key}`. Tailwind v4's `@theme` directive auto-generates utilities (`bg-stripe-issue`, `border-stripe-issue`) AND the raw CSS var. Both consumption paths work from one source of truth.

**Migration policy.** v0.3.0 mandates the convention going forward. OS code today still has hex literals (`bg-[#EF4444]`, `border-l-[#22C55E]`, etc.); both forms render identically in light mode, so the retrofit is safe to do incrementally rather than as a single sweep. Light-mode rendering is unchanged.

**Dark-mode scope.** v0.3.0 wraps stripe colors only. Full dark-mode rollout requires similar wrapping across status / priority / team / brand palettes — separate v0.4.0+ effort. Don't read v0.3.0 as "dark-mode is one PR away."

---

## 6. Wiring checklist for a new entity

1. Pick a hue from outside the existing OS + Playbook palettes (or inherit from a parent in your family). Confirm >60° hue-separation from `--color-brand-blue` and `--color-brand-orange`.
2. Add the hex to canon `@theme` block as `--color-stripe-{entity-key}`.
3. Decide the depth: 1 if top-level in its family, 2 if direct child of a top-level entity. (Deeper nesting requires a canon discussion — depths 3+ are reserved.)
4. Add the entity row to whichever list-standards doc applies (`reference_list_standards.md` for OS, `reference_list_standards_playbook.md` for Playbook).
5. In code: render rows by composing `stripeStyle({ color, depth, state })` with `<FlaggedTab/>` when state === "flagged".
6. Verify the row renders the same in every surface where the entity appears (the universal-row-consistency rule).

---

## Why this is canon

Three axes (thickness / hue / state) carry independent information, and once they're encoded together the row's left edge tells you at a glance: *what kind of thing this is, where it sits in its family, and whether it needs your attention.* Three apps using the same encoding means cross-app surfaces stay readable without re-deriving rules.

The single helper + single primitive ensures consistency. If we ever want to change a rule (e.g. flagged uses a different orange, or depth-3 entities exist), one canon edit + an `npm install` propagates everywhere.

Pair with:
- [`reference_color_palette.md`](reference_color_palette.md) — brand colors, app accent doctrine, action-zone vs identity-zone split.
- [`reference_list_standards.md`](reference_list_standards.md) — OS row chrome, Bands 1-4, sticky behavior.
- [`reference_list_standards_playbook.md`](reference_list_standards_playbook.md) — non-OS list canon.
