"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Tooltip } from "@/components/Tooltip";

export interface StatusPickerOption {
  key: string;
  label: string;
  icon: ReactNode;
  /** Tailwind color classes applied when this option is the CURRENT state. */
  activeBg: string;
  activeBorder: string;
  activeIconColor: string;
}

export interface StatusPickerAction {
  key: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  /** `danger` renders red text. `default` renders gray text. */
  variant?: "default" | "danger";
  /** Small italic hint shown under the label (e.g. "Admin only"). */
  hint?: string;
}

interface StatusPickerProps {
  /** Currently-selected option key. */
  value: string;
  options: StatusPickerOption[];
  onChange: (key: string) => void;
  /** Fallback tooltip when no option is matched. */
  title?: string;
  /** Non-status actions (archive, delete, etc.) rendered below the options with a divider. */
  actions?: StatusPickerAction[];
}

/**
 * Ninety-style icon + dropdown picker that sits at the top-left of a detail pane header.
 * The button shows the icon of the current state; click opens a small panel listing all options.
 */
export default function StatusPicker({ value, options, onChange, title = "Change status", actions }: StatusPickerProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const current = options.find((o) => o.key === value) || options[0];

  return (
    <div className="relative" ref={wrapperRef}>
      <Tooltip text={current ? current.label : title}><button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors flex-shrink-0 ${current.activeBg} ${current.activeBorder} ${current.activeIconColor} hover:opacity-80`}
      >
        {current.icon}
      </button></Tooltip>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-30 min-w-[180px] overflow-hidden">
          {options.map((opt) => {
            const isActive = opt.key === value;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => { onChange(opt.key); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 text-left text-sm transition-colors ${
                  isActive ? `${opt.activeBg} ${opt.activeIconColor} font-semibold` : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className={`w-5 h-5 flex items-center justify-center ${isActive ? opt.activeIconColor : "text-gray-500"}`}>
                  {opt.icon}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
          {actions && actions.length > 0 && (
            <div className="border-t border-gray-100">
              {actions.map((act) => (
                <button
                  key={act.key}
                  type="button"
                  onClick={() => { act.onSelect(); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 text-left text-sm transition-colors ${
                    act.variant === "danger" ? "text-red-600 hover:bg-red-50" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="w-5 h-5 flex items-center justify-center">{act.icon}</span>
                  <span className="flex-1">
                    <span className="block leading-tight">{act.label}</span>
                    {act.hint && <span className="block text-[10px] text-gray-400 italic mt-0.5">{act.hint}</span>}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Shared icon components ──────────────────────────────────────────────
// Thin wrappers around lucide-react so existing callsites keep their
// `<ThumbsUpIcon />` / `<TrashIcon />` ergonomic without coupling every
// consumer to the lucide import name. Migrated from inline SVG to Lucide
// session 48 (B6 finish).

import {
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  HelpCircle,
  Check,
  Ban,
  Archive,
  Trash2,
} from "lucide-react";

export function ThumbsUpIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <ThumbsUp className={className} />;
}

export function ThumbsDownIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <ThumbsDown className={className} />;
}

export function WarningIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <AlertTriangle className={className} />;
}

export function QuestionIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <HelpCircle className={className} />;
}

export function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <Check className={className} />;
}

export function BanIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <Ban className={className} />;
}

export function ArchiveIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <Archive className={className} />;
}

export function TrashIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <Trash2 className={className} />;
}
