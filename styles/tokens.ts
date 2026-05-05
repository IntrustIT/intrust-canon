/**
 * Canonical brand tokens. Reach for these any time you'd otherwise hardcode
 * a brand color. Components inside @intrust/canon use these strings inline
 * (Tailwind v4 syntax: `bg-[#0069AA]` etc.) — exporting as constants gives
 * consumers a single source for non-Tailwind contexts (SVG fills, charts,
 * email templates, etc.).
 */
export const tokens = {
  /** Primary brand blue. Used for: primary buttons, links, focused inputs,
   *  active state, drag-drop indicators, sparkline strokes. */
  brandBlue: "#0069AA",
  /** Brand orange. AI flows ONLY (sparkle button bg, AI banner accents,
   *  AI flow spinners). Don't use for non-AI surfaces. */
  brandOrange: "#F58326",
  /** Destructive / no-drop / error red. */
  destructiveRed: "#dc2626",
  /** Goal-met cell bg (scorecard cells, status indicators). */
  okGreenBg: "#DCFCE7",
  /** Goal-missed cell bg. */
  failRedBg: "#FEE2E2",
} as const;

export type BrandToken = keyof typeof tokens;
