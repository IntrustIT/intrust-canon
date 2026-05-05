---
name: Destructive confirm canon
description: lib/confirmDestructive is the canonical async confirmation for destructive actions (delete / archive / reset / cancel-with-data-loss). Always prompts — no "remember my preference". Read this before reaching for window.confirm().
type: reference
originSessionId: c9b17cee-f5ec-4aac-9894-14aeaf8a54b7
---
# Destructive confirm canon

Use **`confirmDestructive(opts)`** from `lib/confirmDestructive.ts` for every action that:
- Permanently deletes data (entity rows, comments, attachments, sections, plans)
- Archives or hides data in a way the user might forget about
- Resets state (clear filters, reset preferences, abandon draft)
- Cancels work with unsaved data
- Performs an irreversible side effect (close month, lock period)

Established session 32-ish; canonized here (session 47, B4) to register the rule + flag remaining native `confirm()` callsites for the #732 sweep.

## API

```tsx
import { confirmDestructive } from "@/lib/confirmDestructive";

const ok = await confirmDestructive({
  title: "Permanently delete this issue?",
  message: "This cannot be undone — the row is removed from the database along with its comments and activity history.",
  confirmLabel: "Delete permanently", // optional, default "Delete permanently"
});
if (!ok) return;
// proceed with the destructive action
```

**Returns:** `Promise<boolean>` — `true` if confirmed, `false` if cancelled or Esc pressed.

**Behavior:**
- Modal centered overlay, Rickety chrome (orange Rickety chip header + red warning icon)
- **Cancel button focused by default** — Enter on first paint commits to the safe choice (anti fat-finger).
- Overlay click + Cancel button + Esc all dismiss → returns `false`.
- Confirm button (red bg, white text) → returns `true`.
- No "don't show again" affordance by design — every destructive action prompts every time.

## Visual shape — registered as canon

The HTML rendered by `confirmDestructive` is its own modal-like primitive (predates `<Modal>`). Don't try to refactor it through the `<Modal>` primitive yet — its imperative HTML-injection model + Rickety chrome + auto-focus-Cancel are intentional. If a refactor lands later, treat `confirmDestructive` as a CONSUMER of `<Modal>` only after `<Modal>` grows a `dangerCta` slot.

## Copy guidance

- **Title** = the question form. End with `?`. e.g. "Permanently delete this issue?", "Archive this metric?".
- **Message** = the consequence. Lead with what it removes, then what survives. e.g. "It will be hidden from the list. You can restore it from the Archived filter."
- **confirmLabel** = imperative verb + object. e.g. "Archive", "Delete permanently", "Reset filters". Don't use "OK" or "Yes" — Cancel/Confirm pairs work better when both sides have specific verbs.

## Known consumers (already on canon)

- `components/IssueDetailEditor.tsx` — Archive, Delete permanently
- `components/RockDetailEditor.tsx` — Delete rock, Delete milestone
- `components/TodoDetailEditor.tsx` — Archive, Delete
- `components/MeasurablePanel.tsx` — Archive metric
- `components/SoiPlanEditor.tsx` — (some — others still use native confirm, see below)
- `app/headlines/page.tsx` — Bulk delete
- `app/scorecard/page.tsx` — Delete metric (K-BUG-011 fix in session 45)
- `app/issues/page.tsx`, `app/todos/page.tsx`, `app/rocks/page.tsx` — list-page bulk destructive actions
- `app/meetings/page.tsx`, `app/meetings/[id]/page.tsx` — meeting Delete + section deletes
- `app/profile/page.tsx`, `app/settings/page.tsx`, `app/ggob/page.tsx` — partial coverage; remaining `confirm()` calls listed below

## Native `confirm()` sweep — DONE (#732, session 48)

Inventory at session-47 wrap listed 10 native `window.confirm()` callsites. Audit during the session-48 sweep found 25 — the original list missed 15 (every list page bulk action, plus 4 in profile, 2 in meetings/[id], plus the entity-actions reopen-issue helper).

All 25 converted. **Zero native `confirm()` callsites remain** in the repo as of `55e2c8b`. Final classification:

**confirmDestructive consumers (15 callsites):** SoiPlanEditor (delete section), settings (delete AI context), ggob (revert audit), headlines (archive-all-dismissed + bulk delete), meetings (delete meeting ×2 + delete plan), meetings/[id] (reopen issue — clears note), todos (bulk archive done), issues (permanent delete + reopen + bulk archive solved), rocks (bulk archive complete + archive single), scorecard (archive metric), profile (delete AI rule), lib/entity-actions (reopen issue from menu).

**confirmAction consumers (10 callsites):** SoiPlanEditor (merge sections), MeasurablePanel (remove from scorecard), IssueDetailEditor (send another update), profile (leave team, disable 2FA, revoke device, revoke all devices), ggob (close month, reopen month ×2), meetings/[id] (end meeting).

## `confirmAction` — sibling primitive (shipped session 48 `f9e8e53`)

Mirror of `confirmDestructive` for non-destructive actions: brand-blue confirm button (`#0069AA`), Confirm focused by default (action presumed safe), blue circle-with-arrow icon instead of red warning triangle. Same async API, same modal chrome. Use for state changes, sends, locks, leaves — anything that pauses the user but doesn't destroy data.

```tsx
import { confirmAction } from "@/lib/confirmAction";

const ok = await confirmAction({
  title: "End this meeting now?",
  message: "Ratings and notes will be saved.",
  confirmLabel: "End meeting",
});
if (ok) handleEndMeeting();
```

## What NOT to do

- Don't use `window.confirm()` for destructive actions. Convert.
- Don't use `confirmDestructive` for "Are you sure?" on safe ops (e.g. "Send this email" with retry available) — that's a job for `confirmAction` once it exists; meanwhile use the existing pattern at the consumer's discretion.
- Don't pre-add a "don't show again" toggle. Anti-pattern by Ricky's call — irreversibility deserves a re-prompt every time.
- Don't auto-focus the Confirm button. Cancel-focus is the safety property; users hitting Enter accidentally land on the safe choice.
- Don't change the modal's `border-orange-200` Rickety chrome to make it "more serious" — Rickety chrome is canon across the app's modals; matching it keeps the experience coherent.

## Related canon

- `reference_panel_vs_modal.md` — Modal primitive + when to use modal vs slide-over
- `reference_shared_components.md` — full primitives roster
