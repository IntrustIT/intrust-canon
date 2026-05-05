"use client";

import { useEffect, useRef, useState, TextareaHTMLAttributes, forwardRef } from "react";

interface GrowTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "rows" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  /** Min rows when idle (empty + unfocused) */
  minRows?: number;
  /** Min rows when focused — the textarea grows to at least this height */
  focusRows?: number;
  /** Max rows before internal scroll kicks in */
  maxRows?: number;
}

/**
 * Textarea that:
 *  - Auto-grows to fit content (up to maxRows)
 *  - Expands when focused (to focusRows minimum)
 *  - Shrinks back when blurred if the value doesn't need the space
 *  - Still offers a native vertical resize handle for manual override
 */
const GrowTextarea = forwardRef<HTMLTextAreaElement, GrowTextareaProps>(function GrowTextarea(
  { value, onChange, minRows = 3, focusRows = 8, maxRows = 20, className = "", onFocus, onBlur, ...rest },
  forwardedRef,
) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const [focused, setFocused] = useState(false);

  function setRef(el: HTMLTextAreaElement | null) {
    innerRef.current = el;
    if (typeof forwardedRef === "function") forwardedRef(el);
    else if (forwardedRef) forwardedRef.current = el;
  }

  // Resize to content, clamped to [effectiveMin, max]
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const cs = getComputedStyle(el);
    const lineHeight = parseFloat(cs.lineHeight || "20") || 20;
    const paddingY =
      (parseFloat(cs.paddingTop || "0") || 0) + (parseFloat(cs.paddingBottom || "0") || 0);
    const borderY =
      (parseFloat(cs.borderTopWidth || "0") || 0) + (parseFloat(cs.borderBottomWidth || "0") || 0);
    const extra = paddingY + borderY;
    const effectiveMin = focused ? focusRows : minRows;
    const minHeight = lineHeight * effectiveMin + extra;
    const maxHeight = lineHeight * maxRows + extra;

    el.style.height = "auto";
    const needed = el.scrollHeight;
    const next = Math.min(Math.max(needed, minHeight), maxHeight);
    el.style.height = `${next}px`;
    el.style.overflowY = needed > maxHeight ? "auto" : "hidden";
  }, [value, focused, minRows, focusRows, maxRows]);

  return (
    <textarea
      ref={setRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={(e) => { setFocused(true); onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); onBlur?.(e); }}
      className={`${className} transition-[height] duration-150 ease-out`}
      style={{ resize: "vertical" }}
      {...rest}
    />
  );
});

export default GrowTextarea;
