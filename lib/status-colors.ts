/**
 * Status pill color canon. Centralizes the per-entity status → color
 * mappings so consumers stop hard-coding `bg-yellow-100 text-yellow-700`
 * inline.
 *
 * Per `reference_status_pill_semantics.md`:
 *   - Pills are LABELS — for static state, type, scope. Use only when the
 *     thing being communicated is a discrete category the user reads as
 *     a noun.
 *   - For health (sensor reading), use `<StatusTrajectory>` — not a pill.
 *   - For severity flags (STALE/Aging), use the row left stripe.
 *   - For relationships (Routed/Cascaded), use an arrow + name.
 *   - For visibility flags (Private), use an icon.
 *
 * All color values use the `bg-{tone}-100 text-{tone}-700` pattern (the
 * "soft chip" flavor — the dominant variant across the app). This module
 * does NOT cover priority pills (already canonical at lib/priority-colors.ts).
 */

/** Issue lifecycle status — workflow state from open to resolved. */
export const ISSUE_STATUS_COLORS: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-700",
  identified: "bg-blue-100 text-blue-700",
  discussing: "bg-amber-100 text-amber-700",
  solved: "bg-green-100 text-green-700",       // schema value stays "solved"; UI label "Resolved"
  routed: "bg-slate-100 text-slate-700",       // K-FR-017: routed away to another team
  archived: "bg-gray-100 text-gray-500",
};

export const ISSUE_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  identified: "Identified",
  discussing: "Discussing",
  solved: "Resolved",
  routed: "Routed",
  archived: "Archived",
};

/** Rock workflow phase — multi-stage lifecycle (Draft → Submitted → … → Complete). */
export const ROCK_PHASE_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  submitted: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  in_execution: "bg-green-100 text-green-700",
  complete: "bg-emerald-100 text-emerald-700",   // distinct emerald from in-execution green
  cancelled: "bg-red-100 text-red-700",
};

export const ROCK_PHASE_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  in_execution: "In Execution",
  complete: "Complete",
  cancelled: "Cancelled",
};

/**
 * Rock health/trajectory — DO NOT render as a pill. Use `<StatusTrajectory>`
 * (dot + trend arrow) for any rock-health surface. These constants are kept
 * here only for legacy callsites that still render health-as-pill — those
 * are sweep targets per the canon. Use `<StatusTrajectory>` for new code.
 */
export const ROCK_HEALTH_COLORS_LEGACY: Record<string, string> = {
  on_track: "bg-green-100 text-green-700",
  at_risk: "bg-amber-100 text-amber-700",
  off_track: "bg-red-100 text-red-700",
  confused: "bg-gray-100 text-gray-600",
  complete: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

/** Todo completion — binary. */
export const TODO_STATUS_COLORS: Record<string, string> = {
  open: "bg-gray-100 text-gray-600",       // "Not Done" — neutral, not negative
  done: "bg-green-100 text-green-700",
};

export const TODO_STATUS_LABELS: Record<string, string> = {
  open: "Not Done",
  done: "Done",
};

/** Headline tone — Win vs FYI. */
export const HEADLINE_TONE_COLORS: Record<string, string> = {
  good: "bg-green-100 text-green-700",          // "Win" 🏆
  "not-good": "bg-gray-100 text-gray-600",      // "FYI" 📢 — neutral, not negative
};

export const HEADLINE_TONE_LABELS: Record<string, string> = {
  good: "Win",
  "not-good": "FYI",
};

/** Meeting status — workflow state. */
export const MEETING_STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-500",
};

/**
 * Issue Type spectrum — Short-Term / Stractical / Long-Term.
 * Already documented at `reference_issue_type_spectrum.md`. Provided here
 * for completeness; sourced from the canon doc colors.
 */
export const ISSUE_TYPE_COLORS: Record<string, string> = {
  short_term: "bg-slate-100 text-slate-700",
  // stractical = visual blend (slate + purple stripes) — handled with custom
  // gradient via reference_issue_type_spectrum.md, not a single bg/text.
  long_term: "bg-purple-200 text-purple-800",
};

/**
 * Rock Tier — Company / Department / Sprint (individual).
 */
export const ROCK_TIER_COLORS: Record<string, string> = {
  company: "bg-blue-100 text-blue-700",
  department: "bg-orange-100 text-orange-700",
  sprint: "bg-pink-100 text-pink-700",
};

export const ROCK_TIER_LABELS: Record<string, string> = {
  company: "Company",
  department: "Team",
  sprint: "Individual",
};

/**
 * Severity flags (STALE / Aging) — these should NOT be pills per the canon.
 * They communicate severity and belong on the row's left stripe (extending
 * the flagged-promotion canon). Constants here are LEGACY for the existing
 * pill renders; sweep to row-stripe over time.
 */
export const STALE_FLAG_COLORS_LEGACY: Record<"stale" | "aging", string> = {
  stale: "bg-red-100 text-red-700",
  aging: "bg-amber-100 text-amber-700",
};

/** Default fallback chip — gray, neutral, used for unknown/uncategorized states. */
export const DEFAULT_CHIP = "bg-gray-100 text-gray-500";

/** Resolve a status string against an entity's color map with a safe fallback. */
export function resolveStatusColor(
  map: Record<string, string>,
  status: string | null | undefined,
): string {
  if (!status) return DEFAULT_CHIP;
  return map[status] || DEFAULT_CHIP;
}

/** Resolve a status string against an entity's label map (echoes status if unknown). */
export function resolveStatusLabel(
  map: Record<string, string>,
  status: string | null | undefined,
): string {
  if (!status) return "—";
  return map[status] || status;
}
