"use client";

import { useEffect } from "react";

/**
 * Refetch a page's data when the browser tab regains focus.
 *
 * Mirrors the pattern in app/dashboard/page.tsx (session 8). Lightweight —
 * no polling, only refetches on visibility change, which covers the common
 * "I opened a tab, worked elsewhere, came back" case.
 *
 * Pass a stable callback (wrap in useCallback or bind identity carefully) —
 * the hook only re-binds if `fetchFn` identity changes.
 */
export function useAutoRefresh(fetchFn: () => void | Promise<void>) {
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        fetchFn();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [fetchFn]);
}
