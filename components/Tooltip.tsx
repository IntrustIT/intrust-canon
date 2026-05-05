"use client";
import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Tooltip — drop-in replacement for native HTML `title="..."`.
 *
 * Canon (session 48): always fully visible. Renders via portal to
 * `document.body` so it can never be clipped by an ancestor with
 * `overflow: hidden | auto | scroll` (panels, modals, scroll containers).
 * Auto-flips placement (top↔bottom, left↔right) and auto-shifts horizontal
 * alignment to stay inside the viewport. Callsites no longer need to pass
 * `align="end"` for edge-of-viewport icons — clamping is automatic — but
 * the prop remains as a hint for the preferred initial placement.
 *
 * Speed presets (delay before tooltip appears on hover):
 *   - "instant" → 0ms     (urgent UX hints, critical errors)
 *   - "fast"    → 150ms   (action button labels — DEFAULT)
 *   - "medium"  → 400ms   (less-obvious hints, secondary controls)
 *   - "slow"    → 800ms   (detail/explanation popovers; fires only with intent)
 *
 * Tooltip text is single-line by default (`whitespace-nowrap`); pass
 * `multiline` for longer copy with explicit `\n` line breaks.
 */

export type TooltipDelay = "instant" | "fast" | "medium" | "slow";
export type TooltipPlacement = "top" | "bottom" | "left" | "right";
export type TooltipAlign = "center" | "start" | "end";

const DELAY_MS: Record<TooltipDelay, number> = {
  instant: 0,
  fast: 150,
  medium: 400,
  slow: 800,
};

type Coords = {
  top: number;
  left: number;
  placement: TooltipPlacement;
  arrowOffset: number; // px from the tooltip's start edge along the arrow's axis
};

export function Tooltip({
  text,
  children,
  delay = "fast",
  placement = "top",
  align = "center",
  multiline = false,
  disabled = false,
}: {
  text: string | null | undefined;
  children: ReactNode;
  delay?: TooltipDelay;
  placement?: TooltipPlacement;
  align?: TooltipAlign;
  multiline?: boolean;
  disabled?: boolean;
}) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);

  const cancelTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  const show = () => {
    cancelTimer();
    timerRef.current = window.setTimeout(() => setOpen(true), DELAY_MS[delay]);
  };
  const hide = () => {
    cancelTimer();
    setOpen(false);
    setCoords(null);
  };

  useEffect(() => () => cancelTimer(), []);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !tipRef.current) return;
    const trig = triggerRef.current.getBoundingClientRect();
    const tip = tipRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const m = 8; // viewport margin
    const gap = 6; // distance between trigger and tooltip

    // Auto-flip placement if the preferred side would clip the viewport.
    let p = placement;
    if (p === "top" && trig.top - tip.height - gap < m) p = "bottom";
    else if (p === "bottom" && trig.bottom + tip.height + gap > vh - m) p = "top";
    else if (p === "left" && trig.left - tip.width - gap < m) p = "right";
    else if (p === "right" && trig.right + tip.width + gap > vw - m) p = "left";

    let top = 0;
    let left = 0;

    if (p === "top") top = trig.top - tip.height - gap;
    else if (p === "bottom") top = trig.bottom + gap;
    else top = trig.top + (trig.height - tip.height) / 2;

    if (p === "top" || p === "bottom") {
      if (align === "start") left = trig.left;
      else if (align === "end") left = trig.right - tip.width;
      else left = trig.left + (trig.width - tip.width) / 2;
      // Horizontal viewport clamp.
      left = Math.max(m, Math.min(vw - tip.width - m, left));
    } else {
      left = p === "left" ? trig.left - tip.width - gap : trig.right + gap;
      // Vertical viewport clamp.
      top = Math.max(m, Math.min(vh - tip.height - m, top));
    }

    // Arrow tracks the trigger center even after clamping, so it always
    // points at what triggered the tooltip.
    const triggerCx = trig.left + trig.width / 2;
    const triggerCy = trig.top + trig.height / 2;
    const arrowOffset =
      p === "top" || p === "bottom"
        ? Math.max(8, Math.min(tip.width - 8, triggerCx - left))
        : Math.max(8, Math.min(tip.height - 8, triggerCy - top));

    setCoords({ top, left, placement: p, arrowOffset });
  }, [open, placement, align, text]);

  if (disabled || !text) return <>{children}</>;

  const arrowClass = coords
    ? coords.placement === "top"
      ? "top-full border-t-gray-900 border-x-transparent border-b-transparent"
      : coords.placement === "bottom"
        ? "bottom-full border-b-gray-900 border-x-transparent border-t-transparent"
        : coords.placement === "left"
          ? "left-full border-l-gray-900 border-y-transparent border-r-transparent"
          : "right-full border-r-gray-900 border-y-transparent border-l-transparent"
    : "";

  const arrowStyle: React.CSSProperties | undefined = coords
    ? coords.placement === "top" || coords.placement === "bottom"
      ? { left: coords.arrowOffset - 5 }
      : { top: coords.arrowOffset - 5 }
    : undefined;

  const portal =
    open && typeof document !== "undefined"
      ? createPortal(
          <span
            ref={tipRef}
            role="tooltip"
            style={{
              position: "fixed",
              top: coords?.top ?? -9999,
              left: coords?.left ?? -9999,
              opacity: coords ? 1 : 0,
            }}
            className={[
              "z-[1000] pointer-events-none",
              "px-2 py-1 rounded-md bg-gray-900 text-white text-[11px] font-medium",
              multiline
                ? "max-w-xs whitespace-pre-line text-left leading-snug"
                : "whitespace-nowrap",
              "transition-opacity duration-100",
            ].join(" ")}
          >
            {text}
            {coords && (
              <span
                aria-hidden="true"
                className={`absolute w-0 h-0 border-[5px] ${arrowClass}`}
                style={arrowStyle}
              />
            )}
          </span>,
          document.body,
        )
      : null;

  return (
    <span
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {portal}
    </span>
  );
}
