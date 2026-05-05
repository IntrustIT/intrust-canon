"use client";

import { ReactNode } from "react";

type ColorTone = "blue" | "green" | "orange";

const TRACK_ON: Record<ColorTone, string> = {
  blue: "bg-[#0069AA]",
  green: "bg-[#22C55E]",
  orange: "bg-orange-500",
};

interface FilterToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  tone?: ColorTone;
  disabled?: boolean;
  /** Stretch to fill its container — pushes the switch to the right edge of the row.
   *  Use inside Filters popover stacks. Default false (auto width, label hugs the switch). */
  fullWidth?: boolean;
}

/**
 * iOS-style switch toggle for binary filter-bar controls (K-CS-019).
 * 28×16px track, 12px sliding thumb. Label on the left.
 * `role="switch"` + `aria-checked` semantics.
 */
export default function FilterToggle({ checked, onChange, label, tone = "blue", disabled, fullWidth }: FilterToggleProps) {
  const trackOn = TRACK_ON[tone];
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`${fullWidth ? "w-full justify-between" : ""} inline-flex items-center gap-2 text-[11px] font-medium text-gray-600 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      <span>{label}</span>
      <span
        className={`relative inline-block h-4 w-7 rounded-full border transition-colors flex-shrink-0 ${
          checked ? `${trackOn} border-transparent` : "bg-gray-200 border-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-3" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
