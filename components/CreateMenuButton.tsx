"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Tooltip } from "@/components/Tooltip";

export type CreateEntityType = "issue" | "todo" | "rock" | "headline";

const LABELS: Record<CreateEntityType, string> = {
  issue: "Issue",
  todo: "To-Do",
  rock: "Rock",
  headline: "Headline",
};

const PATHS: Record<CreateEntityType, string> = {
  issue: "/issues",
  todo: "/todos",
  rock: "/rocks",
  headline: "/headlines",
};

const ORDER: CreateEntityType[] = ["issue", "todo", "rock", "headline"];

/**
 * Split button: left half creates whatever the current page handles natively
 * (via onPrimary — opens the page's create slide-over). Right half is a
 * chevron that opens a popover with the other three types.
 *
 * Default: picking another type opens its slide-over IN PLACE on the current
 * page (via the page's `<EntitySpawnStack>` mount). The page passes
 * `onCreateOther(type, prefill?)` and is responsible for setting its
 * `spawnPending` state. This keeps the user on the page they were on —
 * creating a To-Do while triaging issues no longer punts them to /todos.
 *
 * Legacy: when `onCreateOther` is omitted, the chevron falls back to
 * router.push(`${PATHS[target]}?new=1&title=...`). Used by callsites
 * that don't yet mount EntitySpawnStack.
 */
export default function CreateMenuButton({
  primaryType,
  onPrimary,
  prefillTitle,
  prefillDescription,
  onBeforeNavigate,
  onCreateOther,
}: {
  primaryType: CreateEntityType;
  onPrimary: () => void;
  prefillTitle?: string;
  prefillDescription?: string;
  onBeforeNavigate?: () => void;
  /** Preferred — opens the picked type's slide-over in place via the page's
   *  EntitySpawnStack. Receives the type + any draft prefill (used by the
   *  in-flight type-switcher when the user changes their mind mid-create). */
  onCreateOther?: (type: CreateEntityType, prefill?: { title?: string; description?: string }) => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(target: CreateEntityType) {
    setOpen(false);
    if (onCreateOther) {
      onCreateOther(target, {
        title: prefillTitle,
        description: prefillDescription,
      });
      return;
    }
    // Legacy fallback — page didn't wire onCreateOther.
    const params = new URLSearchParams({ new: "1" });
    if (prefillTitle) params.set("title", prefillTitle);
    if (prefillDescription) params.set("description", prefillDescription);
    onBeforeNavigate?.();
    router.push(`${PATHS[target]}?${params.toString()}`);
  }

  const others = ORDER.filter((t) => t !== primaryType);

  return (
    <div ref={rootRef} className="relative inline-block">
      <div className="inline-flex items-stretch rounded-lg overflow-hidden" style={{ backgroundColor: "#0069AA" }}>
        <button
          onClick={onPrimary}
          className="px-4 py-2 text-white text-sm font-medium hover:bg-black/10"
        >
          + Add {LABELS[primaryType]}
        </button>
        <div className="w-px bg-white/30" />
        <Tooltip text="Create another type"><button
          onClick={() => setOpen((v) => !v)}
          className="px-2 text-white hover:bg-black/10 flex items-center justify-center"
          aria-label="Create another type"
        >
          <svg className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button></Tooltip>
      </div>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg z-40 p-1.5 min-w-[160px]">
          <div className="text-[10px] font-semibold text-gray-500 uppercase px-2 py-1">Create any</div>
          {others.map((t) => (
            <button
              key={t}
              onClick={() => pick(t)}
              className="w-full text-left px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              + {LABELS[t]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
