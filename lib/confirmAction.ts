/**
 * Async confirm dialog for non-destructive actions that still deserve a
 * pause-and-confirm — sending a message, locking a period, leaving a team,
 * triggering a side effect that the user might not expect.
 *
 * Sibling primitive to `confirmDestructive`. Same modal shape and Rickety
 * chrome, but:
 *   - Brand-blue confirm button (#0069AA) instead of red — communicates
 *     "this is a deliberate action," not "this destroys data."
 *   - Confirm button focused by default (action is presumed safe; no
 *     fat-finger guard needed). Cancel is one Tab away or Esc.
 *   - Blue circle + arrow icon instead of the red warning triangle.
 *
 * Use for the non-destructive callsites listed in
 * `reference_confirm_dialog.md` (#732 sweep): merge sections, lock month,
 * leave team, send another update request, etc. Use `confirmDestructive`
 * when the action permanently removes or replaces data.
 *
 * Returns Promise<boolean>: true if confirmed, false if cancelled / Esc.
 */

interface ConfirmActionOptions {
  title: string;
  message: string;
  /** Button label for the action (defaults to "Continue"). */
  confirmLabel?: string;
}

export async function confirmAction(opts: ConfirmActionOptions): Promise<boolean> {
  if (typeof window === "undefined") return false;

  return new Promise<boolean>((resolve) => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    function cleanup() {
      try { document.body.removeChild(root); } catch { /* ignore */ }
      window.removeEventListener("keydown", onKey);
    }
    function settle(result: boolean) {
      cleanup();
      resolve(result);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") settle(false);
      // Enter is handled by whichever button has focus (Confirm by default).
    }
    window.addEventListener("keydown", onKey);

    root.innerHTML = `
      <div class="fixed inset-0 z-[100] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" data-role="overlay"></div>
        <div class="relative bg-white rounded-xl shadow-xl border border-gray-200 w-[420px] max-w-[90vw] overflow-hidden">
          <div class="px-5 pt-3 pb-2 border-b border-gray-100 flex items-center gap-1.5 text-[11px] font-semibold text-orange-600 uppercase tracking-wider">
            <span class="text-orange-500">✨</span>
            <span>Rickety</span>
          </div>
          <div class="p-5">
            <div class="flex items-start gap-3 mb-4">
              <div class="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-[#0069AA]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-gray-900 mb-1">${escapeHtml(opts.title)}</h3>
                <p class="text-sm text-gray-600 leading-relaxed">${escapeHtml(opts.message)}</p>
              </div>
            </div>
            <div class="flex gap-2 justify-end">
              <button data-role="cancel" class="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button data-role="confirm" class="px-4 py-2 rounded-lg text-white text-sm font-medium bg-[#0069AA] hover:bg-[#004C7A]">${escapeHtml(opts.confirmLabel || "Continue")}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    root.querySelector('[data-role="overlay"]')?.addEventListener("click", () => settle(false));
    root.querySelector('[data-role="cancel"]')?.addEventListener("click", () => settle(false));
    root.querySelector('[data-role="confirm"]')?.addEventListener("click", () => settle(true));
    // Focus Confirm by default — action is presumed safe.
    (root.querySelector('[data-role="confirm"]') as HTMLButtonElement | null)?.focus();
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
