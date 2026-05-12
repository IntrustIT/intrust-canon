---
name: Unsaved-changes guard
description: Slide-over editors must warn before discarding unsaved drafts. SUPERSEDED in v0.4.0 by feedback_unsaved_guard_semantics.md — Cancel now bypasses the prompt (explicit-abandon path) while X / Esc / backdrop still prompt (accidental-dismiss paths). This doc retained for historical reference.
type: reference
---

# Unsaved-changes guard

> ⚠ **SUPERSEDED by `feedback_unsaved_guard_semantics.md` (v0.3.17, locked v0.4.0).** This doc preserves the original v0.3.8 contract for reference, but the **active canon** is the feedback doc. Key change: **Cancel bypasses the prompt** (it's an explicit abandon intent) while X / Esc / backdrop still check `isDirty` and prompt. Init effects MUST reset `dirtyRef = false` to avoid stale-dirty bugs on fresh-mount editors. See the feedback doc for the canonical implementation pattern.

When a slide-over editor is **dirty** (any field changed from initial state, or any AI-generated draft sits in the body), closing the panel must NOT silently discard the draft. The user gets one confirmation before losing work — but only on accidental-dismissal paths, not on the explicit Cancel button.

> **Status (v0.3.8 → v0.4.0):** Original doc said all four close paths prompt. v0.3.17 split that rule: Cancel bypasses, others prompt. /todos TodoDetailEditor is the v0.4.0 conformant pilot; other editors (Issue / Rock / Headline / Measurable) retrofit via #565.

---

## 1. The contract

Every slide-over editor:

1. Tracks a `isDirty` flag — true when any field has changed from the value it had when the editor opened (or from the prefill, if create mode).
2. Wraps every close path in a dirty-check:
   - **Esc key** → check dirty, prompt if dirty.
   - **Backdrop click** → check dirty, prompt if dirty.
   - **Cancel button** → check dirty, prompt if dirty.
   - **X button in header** → check dirty, prompt if dirty.
   - **Save button** → no prompt (save IS the resolution).
3. Uses [`confirmAction`](reference_confirm_dialog.md) (not `confirmDestructive` — discarding isn't a permanent destructive op, it's a state-change):

```tsx
async function handleClose() {
  if (!isDirty) {
    onClose();
    return;
  }
  const ok = await confirmAction({
    title: "Discard unsaved changes?",
    message: "Your edits will be lost.",
    confirmLabel: "Discard",
    cancelLabel: "Keep editing",
  });
  if (ok) onClose();
}
```

- **Cancel button is focused by default** in the dialog (anti-fat-finger — same as `confirmDestructive` per `reference_confirm_dialog.md`).
- **Confirm label is "Discard"** — verb-y, matches what's about to happen. Not "OK" / "Yes."
- **Cancel label is "Keep editing"** — describes what staying does, not just "Cancel."

---

## 2. Dirty detection

Two valid approaches. Pick by editor complexity:

**(a) Per-field comparison** — store the initial state on open, compare on every render. Cheap for small forms.

```tsx
const [initial] = useState(() => ({ ...entity }));
const isDirty = useMemo(
  () => deepEqual(currentState, initial) === false,
  [currentState, initial]
);
```

**(b) Touch flag** — a boolean that flips to true on the first user-initiated change and stays true. Simpler but doesn't recover from "edit then revert to original."

```tsx
const [touched, setTouched] = useState(false);
// in every onChange: setTouched(true);
const isDirty = touched;
```

(a) is preferred — handles the revert-to-original case correctly. (b) is acceptable for AI-flow editors where the AI write itself is significant intent and reverting is rare.

---

## 3. Special case: AI drafts

If the editor body contains AI-generated content (via `<AISuggestField>` or similar), treat the editor as dirty as soon as the AI write completes — even if the user hasn't typed anything afterward. AI output is meaningful work-in-progress; silently losing it on backdrop-click is worse than losing manual edits because the user can't easily reproduce it.

Implementation: AISuggestField's "Add" / "Replace" callbacks should set `setTouched(true)` (or equivalent dirty signal) before returning.

---

## 4. SlideOverPanel `closeOnBackdrop` prop (recommended addition)

Today the SlideOverPanel primitive closes on backdrop click unconditionally. Recommend adding a `closeOnBackdrop` prop (analogous to `<Modal closeOnBackdrop={false}>` which already exists per `reference_panel_vs_modal.md`):

```tsx
<SlideOverPanel
  open={open}
  onClose={handleClose}    // wraps dirty-check
  closeOnBackdrop={!isDirty} // only auto-close on backdrop when not dirty
  // …
>
```

When dirty, backdrop click does nothing (silently). User must click X / Cancel / Esc → all of which are wrapped in `handleClose`. This prevents the worst case (accidentally clicking outside the panel and losing AI-drafted content with no chance to confirm).

If you want backdrop click to PROMPT instead of silently doing nothing, route it through `handleClose` like the other close paths. Both are acceptable; pick per editor.

---

## 5. Off-canon behaviors

- Silent discard on Esc / backdrop / Cancel → off-canon, retrofit needed.
- Browser-level `beforeunload` warning ("Are you sure you want to leave?") → DO NOT use. It's the wrong scope (full page vs editor) and disrupts navigation. The dirty-check is per-editor, not per-page.
- Auto-save drafts to localStorage to recover after silent discard → not canon. The expected behavior is "discard requires confirmation"; auto-save adds complexity without a clear win, and creates "ghost drafts" that the user forgot they typed.

---

## See also

- [`reference_confirm_dialog.md`](reference_confirm_dialog.md) — `confirmAction` is the dialog primitive used here.
- [`reference_panel_vs_modal.md`](reference_panel_vs_modal.md) — SlideOverPanel close paths.
- [`reference_ai_use.md`](reference_ai_use.md) — AI-draft surfaces are the highest-value case for this guard.
