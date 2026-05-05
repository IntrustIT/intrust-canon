"use client";

import { useEffect, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Title rendered as <h3>. Required unless `headerSlot` is provided —
   *  use `title=""` + `headerSlot` for fully custom header chrome. */
  title: string;
  /** Optional subtitle below the title — typically the entity name being acted on.
   *  Accepts ReactNode so consumers can render inline badges / metadata rows. */
  subtitle?: ReactNode;
  /** Tailwind max-width class. Default "max-w-md". Override for forms with wider content. */
  width?: string;
  /** Render extra chrome alongside the title (close-X button, badges, status pill).
   *  When provided, sits at the right edge of the header row. */
  headerSlot?: ReactNode;
  /** Cap the modal's height and scroll its body when content overflows.
   *  Default: no cap (modal grows to fit content). Pass e.g. "80vh" or "32rem". */
  maxBodyHeight?: string;
  /** Action row at the bottom of the modal. Render Cancel left + primary action right.
   *  When omitted, the modal has no built-in footer (consumer composes its own action layout). */
  footer?: ReactNode;
  children: ReactNode;
  /** Whether clicking the backdrop closes the modal. Default true.
   *  Set false when the modal requires explicit user input before closing
   *  (e.g. confirmDestructive disables it to force an explicit Cancel). */
  closeOnBackdrop?: boolean;
  /** Layout mode.
   *  - `"compact"` (default): single `p-5` container, used for short focused
   *    decisions (confirmations, simple forms).
   *  - `"sectioned"`: header / body / footer each get their own `px-6 py-*`
   *    padding with `border-b` / `border-t` separators between them. Header
   *    row picks up a close X automatically (set `headerSlot` to override).
   *    Use for richer multi-section modals (directory editors, ideas review,
   *    document import wizards). */
  layout?: "compact" | "sectioned";
}

/**
 * Centered overlay modal — canonical wrapper for short focused decisions:
 * confirmations, single-screen forms (e.g. RouteIssueModal), measurable schema.
 *
 * For row-data editing (rocks/issues/todos/headlines/SOI items/metrics),
 * use <SlideOverPanel> instead. See reference_panel_vs_modal.md.
 *
 * Behavior:
 * - Esc closes
 * - Backdrop click closes (unless `closeOnBackdrop={false}`)
 * - No focus trap (lightweight — consumers can `autoFocus` their primary input)
 *
 * Don't roll your own `<div className="fixed inset-0 z-50 ...">` wrapper —
 * this primitive is the source of truth.
 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  width = "max-w-md",
  headerSlot,
  maxBodyHeight,
  footer,
  children,
  closeOnBackdrop = true,
  layout = "compact",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const sectioned = layout === "sectioned";
  const bodyStyle = maxBodyHeight ? { maxHeight: maxBodyHeight, overflowY: "auto" as const } : undefined;

  // Sectioned mode auto-renders a close X in the header when the consumer
  // hasn't supplied a custom headerSlot — sectioned modals are visually
  // larger / wider and expect the X for symmetry with the slide-over chrome.
  const effectiveHeaderSlot = sectioned && !headerSlot ? (
    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Close">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  ) : headerSlot;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`bg-white rounded-2xl shadow-xl w-full ${width} ${sectioned ? "" : "p-5"} flex flex-col max-h-[calc(100vh-2rem)]`}>
        {(title || effectiveHeaderSlot) && (
          <div className={`flex items-start justify-between gap-3 ${sectioned ? "px-6 py-4 border-b border-gray-100" : "mb-1"}`}>
            <div className="flex-1 min-w-0">
              {title && <h3 className={sectioned ? "text-lg font-semibold text-gray-900" : "text-base font-bold text-gray-900"}>{title}</h3>}
              {subtitle && <p className={`text-xs text-gray-500 ${sectioned ? "mt-0.5" : "mt-0.5"}`}>{subtitle}</p>}
            </div>
            {effectiveHeaderSlot && <div className="flex-shrink-0">{effectiveHeaderSlot}</div>}
          </div>
        )}
        <div className={sectioned ? "flex-1 overflow-y-auto px-6 py-4" : (title || effectiveHeaderSlot) ? "mt-2" : ""} style={sectioned ? undefined : bodyStyle}>
          {children}
        </div>
        {footer && (
          <div className={sectioned
            ? "flex gap-2 justify-end flex-shrink-0 px-6 py-3 border-t border-gray-100"
            : "mt-4 flex gap-2 justify-end flex-shrink-0"
          }>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
