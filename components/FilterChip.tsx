"use client";


import { Tooltip } from "@/components/Tooltip";
interface FilterChipProps {
  label: string;
  /** Optional. Omit to render a passive chip with no × (e.g. always-on scope indicator). */
  onClear?: () => void;
}

/**
 * Small chip used to show a filter on list pages. Appears alongside the
 * filter popover trigger so users can see + remove a filter without
 * re-opening the popover. When onClear is omitted the chip is passive
 * (informational only — used for "current scope" indicators that the
 * user changes elsewhere, like the global team picker).
 */
export default function FilterChip({ label, onClear }: FilterChipProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${onClear ? "bg-[#E8F4FC] border-[#0069AA]/20 text-[#0069AA]" : "bg-gray-100 border-gray-200 text-gray-600"}`}>
      {label}
      {onClear && (
        <Tooltip text="Remove"><button onClick={onClear} className="text-[#0069AA]/60 hover:text-red-500">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button></Tooltip>
      )}
    </span>
  );
}
