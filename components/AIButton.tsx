"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { Sparkles, Loader2 } from "lucide-react";

interface AIButtonProps {
  tooltip: string;
  onClick: () => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
  /** Override the default sparkle with a custom icon (rarely needed — prefer sparkle consistency). */
  icon?: ReactNode;
  className?: string;
}

/**
 * Standard AI-action button: orange sparkle + fast tooltip.
 * Every AI-triggering button in the app should use this — consistency is the feature.
 * Differentiate meaning by position + tooltip, not by icon.
 */
export default function AIButton({
  tooltip,
  onClick,
  loading = false,
  disabled = false,
  size = "sm",
  icon,
  className = "",
}: AIButtonProps) {
  const [showTip, setShowTip] = useState(false);
  const [align, setAlign] = useState<"center" | "left" | "right">("center");
  const tipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const box = size === "md" ? "w-7 h-7" : "w-6 h-6";
  const iconClass = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";

  function enter() {
    if (tipTimer.current) clearTimeout(tipTimer.current);
    tipTimer.current = setTimeout(() => setShowTip(true), 100);
  }
  function leave() {
    if (tipTimer.current) clearTimeout(tipTimer.current);
    setShowTip(false);
  }

  // When tooltip appears, measure whether it fits centered under the button.
  // If not, flip to right-aligned (grow leftward) or left-aligned (grow rightward).
  useEffect(() => {
    if (!showTip || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    // Rough tooltip half-width estimate (label ≤30 chars): 90px; pad 12.
    const halfEstimate = 90;
    const pad = 12;
    const centerX = rect.left + rect.width / 2;
    if (centerX + halfEstimate > vw - pad) setAlign("right");
    else if (centerX - halfEstimate < pad) setAlign("left");
    else setAlign("center");
  }, [showTip, tooltip]);

  const alignClass =
    align === "right" ? "right-0"
    : align === "left" ? "left-0"
    : "left-1/2 -translate-x-1/2";
  const arrowClass =
    align === "right" ? "right-2"
    : align === "left" ? "left-2"
    : "left-1/2 -translate-x-1/2";

  return (
    <span className={`relative inline-flex ${className}`} onMouseEnter={enter} onMouseLeave={leave} onFocus={enter} onBlur={leave}>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        disabled={disabled || loading}
        className={`${box} inline-flex items-center justify-center rounded-md border border-[#F58326]/40 bg-[#F58326]/10 text-[#F58326] hover:bg-[#F58326]/20 hover:border-[#F58326] disabled:opacity-40 disabled:cursor-not-allowed transition-colors`}
      >
        {loading ? <Loader2 className={`${iconClass} animate-spin`} /> : (icon ?? <Sparkles className={iconClass} />)}
      </button>
      {showTip && !disabled && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute ${alignClass} top-full mt-1.5 z-50 whitespace-nowrap rounded-md bg-[#E8F4FC] border border-[#0069AA]/20 text-[#F58326] text-[11px] font-medium px-2 py-1 shadow-sm`}
        >
          {tooltip}
          <span className={`absolute -top-1 ${arrowClass} w-2 h-2 rotate-45 bg-[#E8F4FC] border-l border-t border-[#0069AA]/20`} />
        </span>
      )}
    </span>
  );
}
