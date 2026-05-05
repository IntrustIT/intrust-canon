"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ReactDOM from "react-dom";
import type { ContextMenuItem } from "./ContextMenu";

/**
 * Click-trigger 3-dot menu (⋮). Same dropdown chrome as the right-click
 * `<ContextMenu>` — anchors the menu to the button's bounding rect instead
 * of the cursor position. Mounted top-right of slide-over headers so users
 * can access the canonical entity action set without closing the editor.
 *
 * Driven by the same `ContextMenuItem[]` shape as right-click. Pages typically
 * pass items pre-built from `lib/entity-actions.ts` (see Commit B).
 *
 * Esc / outside-click closes. Item click fires its onClick + closes the menu.
 */

interface Props {
  items: ContextMenuItem[];
  /** Tooltip / aria-label for the trigger button. */
  ariaLabel?: string;
}

export default function KebabMenu({ items, ariaLabel = "More actions" }: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const onTrigger = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const SAFE = 8;
    const MENU_W = 220;
    const MENU_H = items.length * 36 + 20;
    // Anchor to the button's right edge, dropdown grows down-and-left.
    let left = rect.right - MENU_W;
    let top = rect.bottom + 4;
    if (left < SAFE) left = SAFE;
    if (top + MENU_H > window.innerHeight - SAFE) {
      // Flip above the button if there's no room below.
      top = Math.max(SAFE, rect.top - MENU_H - 4);
    }
    setPos({ left, top });
    setOpen(true);
  }, [items.length]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", close);
      document.addEventListener("keydown", closeOnEsc);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", closeOnEsc);
    };
  }, [open]);

  const menu = open && pos && typeof document !== "undefined"
    ? ReactDOM.createPortal(
        <div
          ref={menuRef}
          className="fixed z-[100] bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[200px]"
          style={{ left: pos.left, top: pos.top }}
        >
          {items.map((item, i) => (
            <div key={i}>
              {item.divider && <div className="border-t border-gray-100 my-1" />}
              <button
                onClick={(e) => { e.stopPropagation(); item.onClick(); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors ${
                  item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item.icon && <span className="w-4 text-center text-xs">{item.icon}</span>}
                {item.label}
              </button>
            </div>
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={buttonRef}
        onClick={onTrigger}
        aria-label={ariaLabel}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      {menu}
    </>
  );
}
