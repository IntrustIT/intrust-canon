"use client";

import { useState, useRef, useEffect } from "react";
import { Tooltip } from "./Tooltip";
import {
  PRIORITY_COLORS_BADGE,
  PRIORITY_COLORS_CHIP,
  PRIORITY_LABELS,
  priorityBadgeClass,
  priorityChipClass,
  priorityLabel,
} from "@/lib/priority-colors";

type Props = {
  priority: number;
  /** Optional in chip variant (chips are read-only display). */
  onChange?: (next: number) => void | Promise<void>;
  /** Disable the click-to-edit affordance — renders as display-only.
   *  Always implied true when `variant="chip"`. */
  readOnly?: boolean;
  size?: "sm" | "md";
  /** Visual treatment:
   *  - "badge" (default) — round circle, bold colors, click-to-edit popover.
   *  - "chip" — flat soft pill (`bg-*-100 text-*-700`), read-only display
   *    with optional label suffix. Use in dense list contexts. */
  variant?: "badge" | "chip";
  /** Chip variant only — render the label after the number ("1 Critical"). */
  showLabel?: boolean;
};

/**
 * Canonical priority indicator. Two visual variants share the same color
 * scale (1=red → 5=gray) and label set (Critical/High/Medium/Low/Backlog),
 * sourced from `lib/priority-colors.ts`.
 *
 * - `variant="badge"` (default) — round badge with click-to-edit popover.
 *   Used in detail editors, meeting IDS rows, list rows.
 * - `variant="chip"` — flat soft pill, read-only display. Used in dense
 *   contexts like meeting prep panel.
 */
export default function PriorityPicker({
  priority,
  onChange,
  readOnly,
  size = "md",
  variant = "badge",
  showLabel = false,
}: Props) {
  const isChip = variant === "chip";
  // Chip variant is always read-only display.
  const ro = isChip || readOnly;

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (isChip) {
    // Flat read-only pill. No popover, no tooltip-wrapper edit affordance.
    // Renders "P{priority}" — the "P" prefix gives the chip self-description
    // when it's not surrounded by other priority context (the round badge
    // doesn't need it because the circle shape says "priority").
    const chipColor = priorityChipClass(priority);
    const label = priorityLabel(priority);
    return (
      <Tooltip text={label}>
        <span
          className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded ${chipColor}`}
        >
          P{priority}
          {showLabel && <span className="ml-1">{label}</span>}
        </span>
      </Tooltip>
    );
  }

  // Badge variant — original click-to-edit round badge.
  const sz = size === "sm" ? "w-6 h-6 text-[10px]" : "w-7 h-7 text-xs";
  const color = priorityBadgeClass(priority);
  const label = priorityLabel(priority);
  const trigger = (
    <button
      type="button"
      disabled={ro}
      onClick={(e) => { e.stopPropagation(); if (!ro) setOpen((v) => !v); }}
      className={`${sz} rounded-full flex items-center justify-center font-bold flex-shrink-0 ${color} ${ro ? "cursor-default" : "hover:opacity-80 cursor-pointer"}`}
      aria-label={ro ? `Priority P${priority}` : `Priority P${priority} — click to change`}
    >
      {priority}
    </button>
  );

  return (
    <div ref={rootRef} className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <Tooltip text={`${label}${ro ? "" : " (click to change)"}`}>
        {trigger}
      </Tooltip>
      {open && !ro && (
        <div className="absolute top-full mt-1.5 left-0 z-40 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5 px-1">Priority</div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((p) => (
              <Tooltip key={p} text={PRIORITY_LABELS[p]}>
                <button
                  type="button"
                  onClick={() => { onChange?.(p); setOpen(false); }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${PRIORITY_COLORS_BADGE[p]} ${p === priority ? "ring-2 ring-offset-1 ring-[#0069AA]" : "hover:opacity-80"}`}
                  aria-label={`Set priority to P${p}`}
                >
                  {p}
                </button>
              </Tooltip>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
