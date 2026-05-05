"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ReactDOM from "react-dom";

export interface ContextMenuItem {
  label: string;
  /** Icon — either a Lucide component (preferred) or a string (legacy emoji,
   *  rendered raw). The shared `<span className="w-4 text-center text-xs">`
   *  wrapper accommodates both via React's children rendering. */
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  divider?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  children: React.ReactNode;
}

// Hook variant for cases where wrapping the trigger in a <div> isn't allowed
// (e.g. attaching to a <tr> — wrapping a row in <div> would make invalid
// HTML inside <tbody>). Returns { onContextMenu, menu }; spread the handler
// onto whichever element should trigger, render `menu` anywhere in the tree.
export function useContextMenu(items: ContextMenuItem[]) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const onContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const SAFE = 8;
    const x = Math.max(SAFE, Math.min(e.clientX, window.innerWidth - 220 - SAFE));
    const y = Math.max(SAFE, Math.min(e.clientY, window.innerHeight - items.length * 36 - 20 - SAFE));
    setPos({ x, y });
    setOpen(true);
  }, [items.length]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const closeOnEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
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

  const menu = open && typeof document !== "undefined"
    ? ReactDOM.createPortal(
        <div
          ref={menuRef}
          className="fixed z-[100] bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[200px]"
          style={{ left: pos.x, top: pos.y }}
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
        document.body,
      )
    : null;

  return { onContextMenu, menu };
}

export default function ContextMenu({ items, children }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const SAFE = 8;
    const x = Math.max(SAFE, Math.min(e.clientX, window.innerWidth - 220 - SAFE));
    const y = Math.max(SAFE, Math.min(e.clientY, window.innerHeight - items.length * 36 - 20 - SAFE));
    setPos({ x, y });
    setOpen(true);
  }, [items.length]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const closeOnEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // Use setTimeout so the opening click doesn't immediately close
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

  const menu = open && typeof document !== "undefined"
    ? ReactDOM.createPortal(
        <div
          ref={menuRef}
          className="fixed z-[100] bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[200px]"
          style={{ left: pos.x, top: pos.y }}
        >
          {items.map((item, i) => (
            <div key={i}>
              {item.divider && <div className="border-t border-gray-100 my-1" />}
              <button
                onClick={(e) => { e.stopPropagation(); item.onClick(); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors ${
                  item.danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-700 hover:bg-gray-50"
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
      <div onContextMenu={handleContextMenu}>
        {children}
      </div>
      {menu}
    </>
  );
}
