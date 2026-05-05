"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";

interface PopoverProps {
  /** The trigger button content (label, icon, etc.). */
  trigger: ReactNode;
  /** The popover body rendered below the trigger when open. */
  children: ReactNode;
  /** Optional badge rendered on the trigger — e.g. count of active filters. */
  badge?: ReactNode;
  /** Align popover to the right or left edge of the trigger. Default: "left". */
  align?: "left" | "right";
  /** Min-width of the popover panel. Default: 260 */
  width?: number;
  /** Extra classes on the trigger button. */
  className?: string;
  /** Open above the trigger instead of below. Default: "bottom". */
  placement?: "bottom" | "top";
}

/**
 * Lightweight click-outside-to-close popover used for list-page View / Filters
 * menus. No animations, no portal, just an absolute-positioned panel that
 * closes when you click anywhere outside it.
 */
export default function Popover({
  trigger,
  children,
  badge,
  align = "left",
  width = 260,
  className = "",
  placement = "bottom",
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
          open
            ? "bg-[#E8F4FC] border-[#0069AA]/30 text-[#0069AA]"
            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
        } ${className}`}
      >
        {trigger}
        {badge}
        <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          style={{ minWidth: width, [align]: 0 } as React.CSSProperties}
          className={`absolute ${placement === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5"} bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-3`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
