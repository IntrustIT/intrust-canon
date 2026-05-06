/**
 * Canonical stripe helper for list-row left edges.
 *
 * Three-axis encoding:
 *   - Thickness (px) → entity depth in its family tree
 *   - Hue → entity family / type (passed in via `color`)
 *   - State color → row state (default / flagged / done)
 *
 * Rendered via `box-shadow: inset` so it composes cleanly with `rounded-lg`.
 * The flagged state's "outboard ribbon" is rendered separately by
 * `<FlaggedTab/>` in components/FlaggedTab.tsx — this helper does NOT
 * change the stripe color when state === "flagged" (entity hue is preserved
 * so identity-of-thing remains visible even when flagged).
 *
 * Guidance-only — copy into your app's lib/stripes.ts. Do not import from
 * @intrust/canon at runtime. See reference_stripe_system.md for the full spec.
 */

import type { CSSProperties } from "react";

export type StripeDepth = 1 | 2 | 3 | 4 | 5;
export type StripeState = "default" | "flagged" | "done";

/** px thickness per depth level. Locked at design time; do not hot-rewire. */
export const LADDER: Record<StripeDepth, number> = {
  1: 8,
  2: 6,
  3: 4,
  4: 2,
  5: 2,
};

const GRAY_300 = "var(--color-gray-300)";

/**
 * Compute stripe styles for a list row.
 *
 * @param color  CSS custom property reference for the entity hue
 *               (e.g. "var(--color-stripe-rock)"). Always pass via var,
 *               never literal hex — required for dark-mode compatibility.
 * @param depth  1..5. Thickness comes from LADDER. depth-5 fades to 50%.
 * @param state  "default" (entity hue) | "flagged" (entity hue, paired with
 *               <FlaggedTab/>) | "done" (gray-300). Optional, defaults to
 *               "default".
 *
 * @returns React.CSSProperties to spread onto the row's outer container.
 *          Compose with the row's existing className for padding, rounded,
 *          background, hover, etc.
 *
 * @example
 *   <div
 *     className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-gray-100 hover:bg-gray-50"
 *     style={stripeStyle({ color: "var(--color-stripe-rock)", depth: 1, state: "default" })}
 *   >
 *     {/* row content *\/}
 *   </div>
 */
export function stripeStyle(opts: {
  color: string;
  depth: StripeDepth;
  state?: StripeState;
}): CSSProperties {
  const { color, depth, state = "default" } = opts;
  const px = LADDER[depth];
  const stripeColor = state === "done" ? GRAY_300 : color;
  const fade = depth >= 5 ? 0.5 : undefined;
  return {
    boxShadow: `inset ${px}px 0 0 0 ${stripeColor}`,
    opacity: fade,
  };
}
