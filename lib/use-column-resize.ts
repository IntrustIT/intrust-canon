"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Canonical column-resize hook. Persists width per `storageKey` to
// localStorage; drag from a 4px-wide handle on the column's right edge;
// double-click the handle to reset to default. Apply the returned `width`
// to the header <th> AND every body <td> for the column (same value, same
// min/max bounds, same `style.width`). Render the handle inside the header
// cell using the returned `handleProps`.
//
// Usage:
//   const { width, handleProps, headerStyle, cellStyle } =
//     useColumnResize("scorecard-measurable-col-width", 260, { min: 160, max: 480 });
//   <th style={headerStyle}>...{label}<div {...handleProps} /></th>
//   <td style={cellStyle}>...</td>

export type UseColumnResizeOptions = {
  min?: number;
  max?: number;
};

export type UseColumnResize = {
  width: number;
  isDragging: boolean;
  handleProps: {
    onMouseDown: (e: React.MouseEvent) => void;
    onDoubleClick: (e: React.MouseEvent) => void;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    className: string;
    style: React.CSSProperties;
    role: "separator";
    "aria-orientation": "vertical";
    title: string;
  };
  headerStyle: React.CSSProperties;
  cellStyle: React.CSSProperties;
};

export function useColumnResize(
  storageKey: string,
  defaultWidth: number,
  opts: UseColumnResizeOptions = {},
): UseColumnResize {
  const min = opts.min ?? 80;
  const max = opts.max ?? 800;

  const [width, setWidth] = useState<number>(defaultWidth);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Restore from localStorage on mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const parsed = parseInt(raw, 10);
        if (Number.isFinite(parsed) && parsed >= min && parsed <= max) {
          setWidth(parsed);
        }
      }
    } catch {
      // localStorage unavailable — fall through with default.
    }
    // Run once per key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragState.current = { startX: e.clientX, startWidth: width };
    setIsDragging(true);
  }, [width]);

  // Window-level move/up listeners while dragging.
  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => {
      const s = dragState.current;
      if (!s) return;
      const next = Math.max(min, Math.min(max, s.startWidth + (e.clientX - s.startX)));
      setWidth(next);
    };
    const onUp = () => {
      setIsDragging(false);
      dragState.current = null;
      try {
        window.localStorage.setItem(storageKey, String(width));
      } catch {
        // ignore
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    // Disable text selection while dragging — feels broken otherwise.
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = prevUserSelect;
      document.body.style.cursor = "";
    };
  }, [isDragging, min, max, storageKey, width]);

  // Persist on every settled width change (covers the dblclick-reset case).
  useEffect(() => {
    if (isDragging) return;
    try {
      window.localStorage.setItem(storageKey, String(width));
    } catch {
      // ignore
    }
  }, [width, isDragging, storageKey]);

  const onDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWidth(defaultWidth);
  }, [defaultWidth]);

  // Handle: 6px-wide invisible hit area with a thin visible line on its
  // right edge via border-right. Standard resize-handle pattern — the
  // bar reads as a column rule, not a chunky stripe. Inline style so the
  // box compiles regardless of Tailwind's content scanner state on this
  // brand-new file.
  const active = isDragging || isHovering;
  const handleStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 6,
    borderRight: active ? "2px solid #0069AA" : "1px solid #d1d5db",
    zIndex: 40,
  };

  return {
    width,
    isDragging,
    handleProps: {
      onMouseDown,
      onDoubleClick,
      onMouseEnter: () => setIsHovering(true),
      onMouseLeave: () => setIsHovering(false),
      className: "cursor-col-resize select-none",
      style: handleStyle,
      role: "separator",
      "aria-orientation": "vertical",
      title: "Drag to resize. Double-click to reset.",
    },
    headerStyle: { width, minWidth: width, maxWidth: width },
    cellStyle: { width, minWidth: width, maxWidth: width },
  };
}
