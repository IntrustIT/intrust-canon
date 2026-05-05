"use client";

import { useEffect, useCallback, useRef, type ReactNode } from "react";
import { Tooltip } from "@/components/Tooltip";

interface SlideOverPanelProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  onTitleChange?: (title: string) => void;
  /** Placeholder for the title input */
  titlePlaceholder?: string;
  /** Small label above the title (e.g., "Issue", "Rock", "To-Do"). Accepts ReactNode for inline accessories like a flag toggle. */
  titlePrefix?: ReactNode;
  /** Content for the scrollable body */
  children: ReactNode;
  /** Optional footer with action buttons */
  footer?: ReactNode;
  /** Width class — defaults to w-[480px] */
  width?: string;
  /** Extra content in the header (e.g. discussion button), rendered before the close X */
  headerExtra?: ReactNode;
  /** Optional leading element rendered to the LEFT of the title (e.g. a large check circle for mark-done). */
  leading?: ReactNode;
  /** Optional subtitle row rendered under the title (e.g. team · owner · due date chips) */
  subtitle?: ReactNode;
}

export default function SlideOverPanel({
  open,
  onClose,
  title,
  onTitleChange,
  titlePlaceholder = "Untitled",
  children,
  footer,
  titlePrefix,
  width = "w-[480px]",
  headerExtra,
  leading,
  subtitle,
}: SlideOverPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Escape key closes
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent body scroll when panel is open
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`relative ${width} max-w-full h-full bg-white shadow-2xl flex flex-col animate-slide-in-right`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-gray-100 flex-shrink-0">
          {leading && <div className="flex-shrink-0">{leading}</div>}
          <div className="flex-1 min-w-0">
            {titlePrefix && (
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5 flex items-center gap-1.5">{titlePrefix}</div>
            )}
            {onTitleChange ? (
              <input
                ref={titleRef}
                type="text"
                value={title || ""}
                onChange={(e) => onTitleChange(e.target.value)}
                className="w-full text-lg font-semibold text-gray-900 bg-transparent border-0 rounded-md hover:bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0069AA]/20 outline-none -mx-1.5 px-1.5 py-0.5 transition-colors"
                placeholder={titlePlaceholder}
              />
            ) : (
              <h2 className="text-lg font-semibold text-gray-900 truncate">
                {title || "Details"}
              </h2>
            )}
            {subtitle && (
              <div className="mt-1 text-xs text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                {subtitle}
              </div>
            )}
          </div>
          {headerExtra}
          <Tooltip text="Close (Esc)"><button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0 self-start"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button></Tooltip>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 border-t border-gray-100 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
