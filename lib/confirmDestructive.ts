/**
 * Async confirm dialog for destructive actions (permanent deletes, irreversible ops).
 * Always prompts — no skip / remember-my-preference affordance, by design,
 * so a fat-fingered click can't permanently bypass the guard.
 * Returns a Promise<boolean>: true if confirmed, false if cancelled.
 */

interface ConfirmDestructiveOptions {
  title: string;
  message: string;
  /** Button label for the destructive action (defaults to "Delete permanently"). */
  confirmLabel?: string;
}

export async function confirmDestructive(opts: ConfirmDestructiveOptions): Promise<boolean> {
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
      // Enter is handled by whichever button has focus (Cancel by default).
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
              <div class="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4.99c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-gray-900 mb-1">${escapeHtml(opts.title)}</h3>
                <p class="text-sm text-gray-600 leading-relaxed">${escapeHtml(opts.message)}</p>
              </div>
            </div>
            <div class="flex gap-2 justify-end">
              <button data-role="cancel" class="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              <button data-role="confirm" class="px-4 py-2 rounded-lg text-white text-sm font-medium bg-red-600 hover:bg-red-700">${escapeHtml(opts.confirmLabel || "Delete permanently")}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    root.querySelector('[data-role="overlay"]')?.addEventListener("click", () => settle(false));
    root.querySelector('[data-role="cancel"]')?.addEventListener("click", () => settle(false));
    root.querySelector('[data-role="confirm"]')?.addEventListener("click", () => settle(true));
    // Focus Cancel by default — Enter then commits to the safe choice.
    (root.querySelector('[data-role="cancel"]') as HTMLButtonElement | null)?.focus();
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
