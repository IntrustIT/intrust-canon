"use client";

/**
 * Outboard orange ribbon/tab rendered to the LEFT of a flagged row,
 * outside the rounded card silhouette. Breaks the row's left edge so
 * flagged rows are spottable from across the screen.
 *
 * REQUIREMENTS:
 *   - The PARENT element must be `position: relative`.
 *   - The parent must have at least 8px of free space to its left
 *     (the tab is offset -8px and is 6px wide).
 *
 * USAGE:
 *   <div className="relative">
 *     {row.flagged && <FlaggedTab />}
 *     <div
 *       className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white border border-gray-100 hover:bg-gray-50"
 *       style={stripeStyle({ color: "var(--color-stripe-rock)", depth: 1, state: "flagged" })}
 *     >
 *       ...row content...
 *     </div>
 *   </div>
 *
 * Note: `stripeStyle` with state="flagged" leaves the entity-hue stripe
 * intact. The orange signal lives entirely in this tab — the two zones
 * (stripe = identity, tab = state) never compete for the same pixels.
 *
 * Guidance-only — copy into your app's components/. Do not import from
 * @intrust/canon at runtime. See reference_stripe_system.md for the full spec.
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
