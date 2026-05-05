"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type SearchablePickerOption = {
  /** Stable identifier; the value passed to onChange. */
  id: string;
  /** Primary line. */
  label: string;
  /** Secondary line, rendered smaller in gray. Optional. */
  sublabel?: string;
  /** Group header — options sharing a `group` value cluster under one header. */
  group?: string;
  /** Optional left-side decoration (avatar, glyph). */
  icon?: ReactNode;
  /** Extra strings to match against during search; label/sublabel/group already match. */
  searchTokens?: string;
  /** When true, the option renders but can't be selected. */
  disabled?: boolean;
};

export interface SearchablePickerProps {
  value: string;
  onChange: (id: string) => void;
  options: SearchablePickerOption[];
  /** Trigger placeholder when no value selected. */
  placeholder?: string;
  /** Search input placeholder. */
  searchPlaceholder?: string;
  /** Disable the trigger entirely. */
  disabled?: boolean;
  /** Tight class hook for the trigger button. */
  className?: string;
  /** Min width of the open panel. Default 320px. */
  panelWidth?: number;
}

/**
 * Canonical "pick from many" form-input picker. Use when the option count or
 * disambiguation needs (group / owner / extra metadata) outgrow a native
 * <select> with `<optgroup>`. Pairs with reference_searchable_picker.md.
 */
export default function SearchablePicker({
  value,
  onChange,
  options,
  placeholder = "— select —",
  searchPlaceholder = "Search…",
  disabled = false,
  className = "",
  panelWidth = 320,
}: SearchablePickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIndex, setHighlightIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(() => options.find((o) => o.id === value), [options, value]);

  // Filter options by query — match against label, sublabel, group, searchTokens.
  // Result preserves the input order; group headers are computed at render time.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const hay = `${o.label} ${o.sublabel ?? ""} ${o.group ?? ""} ${o.searchTokens ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [options, query]);

  // Selectable subset (used for keyboard navigation).
  const selectable = useMemo(() => filtered.filter((o) => !o.disabled), [filtered]);

  // Reset highlight when query changes or the popup opens.
  useEffect(() => { setHighlightIndex(0); }, [query, open]);

  // Click-outside + Escape close. Autofocus search input on open.
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
    // Focus + cursor placement next tick so the popup is mounted.
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open]);

  // When closed, reset query so a re-open starts fresh.
  useEffect(() => { if (!open) setQuery(""); }, [open]);

  // Scroll the highlighted option into view as the user navigates.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-option-index="${highlightIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightIndex, open]);

  function handleSelect(id: string) {
    onChange(id);
    setOpen(false);
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, Math.max(0, selectable.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = selectable[highlightIndex];
      if (opt) handleSelect(opt.id);
    }
  }

  // Build render plan: walk filtered, emit group header when group changes.
  type Row = { kind: "group"; group: string } | { kind: "option"; opt: SearchablePickerOption; selectableIndex: number };
  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    let lastGroup: string | undefined;
    let selIdx = 0;
    for (const opt of filtered) {
      const g = opt.group;
      if (g && g !== lastGroup) {
        out.push({ kind: "group", group: g });
        lastGroup = g;
      } else if (!g && lastGroup) {
        // moved out of grouped range — leave a header gap (no header)
        lastGroup = undefined;
      }
      out.push({ kind: "option", opt, selectableIndex: opt.disabled ? -1 : selIdx });
      if (!opt.disabled) selIdx++;
    }
    return out;
  }, [filtered]);

  const triggerLabel = selected ? selected.label : placeholder;
  const triggerSub = selected?.sublabel;

  return (
    <div ref={rootRef} className="relative inline-block w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 border border-gray-200 rounded-md px-2 py-1.5 text-sm bg-white hover:border-gray-300 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed text-left ${className}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex-1 min-w-0 flex items-center gap-2 truncate">
          {selected?.icon && <span className="flex-shrink-0">{selected.icon}</span>}
          <span className={`truncate ${selected ? "text-gray-800" : "text-gray-400"}`}>{triggerLabel}</span>
          {triggerSub && <span className="truncate text-xs text-gray-400">— {triggerSub}</span>}
        </span>
        <svg className={`w-3 h-3 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div
          style={{ minWidth: panelWidth }}
          className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
        >
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder={searchPlaceholder}
              className="w-full border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#0069AA]/30 focus:border-[#0069AA]/40"
              role="combobox"
              aria-expanded
              aria-autocomplete="list"
            />
          </div>
          <div ref={listRef} className="max-h-72 overflow-y-auto py-1" role="listbox">
            {rows.length === 0 && (
              <div className="px-3 py-6 text-center text-xs text-gray-400">No matches</div>
            )}
            {rows.map((r, i) => {
              if (r.kind === "group") {
                return (
                  <div key={`g-${i}`} className="px-3 pt-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                    {r.group}
                  </div>
                );
              }
              const o = r.opt;
              const isSelected = o.id === value;
              const isHighlighted = !o.disabled && r.selectableIndex === highlightIndex;
              return (
                <button
                  key={o.id}
                  type="button"
                  data-option-index={r.selectableIndex}
                  disabled={o.disabled}
                  onMouseEnter={() => !o.disabled && setHighlightIndex(r.selectableIndex)}
                  onClick={() => !o.disabled && handleSelect(o.id)}
                  className={`w-full flex items-start gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
                    o.disabled ? "text-gray-300 cursor-not-allowed" :
                    isHighlighted ? "bg-[#0069AA]/10" :
                    isSelected ? "bg-gray-50" : "hover:bg-gray-50"
                  }`}
                  role="option"
                  aria-selected={isSelected}
                >
                  {o.icon && <span className="flex-shrink-0 mt-0.5">{o.icon}</span>}
                  <span className="flex-1 min-w-0">
                    <span className={`block truncate ${isSelected ? "font-semibold text-gray-800" : "text-gray-700"}`}>
                      {o.label}
                    </span>
                    {o.sublabel && (
                      <span className="block truncate text-[11px] text-gray-400">{o.sublabel}</span>
                    )}
                  </span>
                  {isSelected && (
                    <svg className="w-4 h-4 text-[#0069AA] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
