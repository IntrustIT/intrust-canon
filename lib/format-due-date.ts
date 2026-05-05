/**
 * Canonical due-date formatter for any UI surface that displays a todo's
 * dueDate or a milestone's dueDate as static text. Returns both a render
 * label (anchor date + relative suffix) and a status bucket so callers
 * can keep their own color rules.
 *
 * Format rules (default):
 *   past_due   → "Apr 18 (-13d)"   (singular "(-1d)")
 *   due_today  → "May 1 (today)"
 *   due_soon   → "May 3 (2d)"      (≤ dueSoonThreshold days out)
 *   future     → "May 14 (13d)"
 *
 * The parenthetical suffix is dropped when:
 *   - completed:true (line-through path; relative is misleading post-completion)
 *   - plainDate:true (callers showing tentative dates, e.g. AI suggestions)
 *
 * Closes K-CS-016. See `feedback_canonical_role_labels.md` neighborhood
 * for the family of small "no mental math" affordances.
 */

export type DueStatus =
  | "past_due"
  | "due_today"
  | "due_soon"
  | "future"
  | "completed"
  | "none";

export interface FormattedDueDate {
  /** Rendered label, e.g. "Apr 18 (-13d)" / "May 1 (today)" / "Apr 18". */
  label: string;
  /** Bucket for color coding (caller picks Tailwind classes per surface). */
  status: DueStatus;
  /** Negative = past, 0 = today, positive = future. NaN if no date. */
  daysFromToday: number;
}

export interface FormatDueDateOpts {
  /** When true, drop the suffix and return the plain date with status="completed". */
  completed?: boolean;
  /** Include year in the date — e.g. "Apr 18, 2026". */
  showYear?: boolean;
  /** Drop the relative suffix entirely (e.g. for AI-suggested dates). */
  plainDate?: boolean;
  /** Days within which a future date is "due_soon" (default 3). */
  dueSoonThreshold?: number;
}

const NO_DATE: FormattedDueDate = {
  label: "",
  status: "none",
  daysFromToday: NaN,
};

export function formatDueDate(
  dueDate: string | Date | null | undefined,
  opts: FormatDueDateOpts = {}
): FormattedDueDate {
  if (!dueDate) return NO_DATE;

  const due = dueDate instanceof Date ? new Date(dueDate.getTime()) : new Date(dueDate);
  if (Number.isNaN(due.getTime())) return NO_DATE;
  due.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysFromToday = Math.round(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const datePart = due.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(opts.showYear ? { year: "numeric" as const } : {}),
  });

  if (opts.completed) {
    return { label: datePart, status: "completed", daysFromToday };
  }

  // Status bucket independent of label so callers can color even when
  // the suffix is suppressed via plainDate.
  let status: DueStatus;
  const threshold = opts.dueSoonThreshold ?? 3;
  if (daysFromToday < 0) status = "past_due";
  else if (daysFromToday === 0) status = "due_today";
  else if (daysFromToday <= threshold) status = "due_soon";
  else status = "future";

  if (opts.plainDate) {
    return { label: datePart, status, daysFromToday };
  }

  let suffix: string;
  if (daysFromToday === 0) suffix = "today";
  else if (daysFromToday < 0) suffix = `${daysFromToday}d`; // "-13d"
  else suffix = `${daysFromToday}d`;                         // "2d"

  return {
    label: `${datePart} (${suffix})`,
    status,
    daysFromToday,
  };
}
