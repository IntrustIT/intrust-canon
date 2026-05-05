/**
 * Canonical priority palette + labels — single source of truth.
 *
 * Two flavors:
 * - BADGE (bold, white text on saturated bg) — for round circle badges
 *   that need to pop visually. PriorityPicker default.
 * - CHIP (soft, dark text on tinted bg) — for flat pill chips inside
 *   denser list contexts (e.g. meeting prep panel).
 *
 * Same numeric scale: 1=red (highest priority) → 5=gray (lowest priority).
 *
 * Established session 47 B5 — extracted from 3 duplicate maps in
 * components/PriorityPicker.tsx, app/issues/page.tsx, components/MeetingPrepPanel.tsx.
 *
 * Labels updated session 48 (C-CC-2): replaced single-word labels
 * (Critical/High/Medium/Low/Backlog) with directional phrases so the
 * scale's direction is unambiguous. Ninety reverses our convention, so
 * "highest priority" / "lowest priority" reads cleanly without the user
 * having to memorize whether P1 or P5 is urgent.
 */

export const PRIORITY_COLORS_BADGE: Record<number, string> = {
  1: "bg-red-500 text-white",
  2: "bg-orange-400 text-white",
  3: "bg-yellow-400 text-gray-800",
  4: "bg-blue-400 text-white",
  5: "bg-gray-300 text-gray-700",
};

export const PRIORITY_COLORS_CHIP: Record<number, string> = {
  1: "bg-red-100 text-red-700",
  2: "bg-orange-100 text-orange-700",
  3: "bg-yellow-100 text-yellow-700",
  4: "bg-blue-100 text-blue-700",
  5: "bg-gray-100 text-gray-600",
};

/**
 * Visible labels — shown in tooltips and (when `showLabel` is set on the
 * chip variant) inline. Asymmetric on purpose: P1 + P5 carry the action
 * cue, middle three are bare descriptors.
 */
export const PRIORITY_LABELS: Record<number, string> = {
  1: "highest priority — resolve ASAP",
  2: "high priority",
  3: "medium priority",
  4: "low priority",
  5: "lowest priority",
};

/**
 * Search-only synonym list — concatenated into row search-text for the
 * Find visible filter. Never displayed. Lets users find P1 issues by
 * typing "urgent" or "most important", and P5 by "backlog" / "defer" /
 * "low impact" — the legacy mental models stay searchable even after the
 * label change.
 */
export const PRIORITY_SEARCH_ALIASES: Record<number, string> = {
  1: "P1 priority 1 highest most important urgent critical resolve asap",
  2: "P2 priority 2 high important",
  3: "P3 priority 3 medium normal",
  4: "P4 priority 4 low minor",
  5: "P5 priority 5 lowest backlog defer watch low impact informational",
};

/** Helper: get the badge class for a given priority, falling back to P5 (gray). */
export function priorityBadgeClass(priority: number): string {
  return PRIORITY_COLORS_BADGE[priority] || PRIORITY_COLORS_BADGE[5];
}

/** Helper: get the chip class for a given priority, falling back to P5 (gray). */
export function priorityChipClass(priority: number): string {
  return PRIORITY_COLORS_CHIP[priority] || PRIORITY_COLORS_CHIP[5];
}

/** Helper: get the visible label for a given priority. */
export function priorityLabel(priority: number): string {
  return PRIORITY_LABELS[priority] || `P${priority}`;
}

/** Helper: get the search-alias string for a given priority. */
export function prioritySearchTokens(priority: number): string {
  return PRIORITY_SEARCH_ALIASES[priority] || `P${priority}`;
}
