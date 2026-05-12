---
name: Unsaved-changes guard — Cancel vs Esc/X semantics
description: v0.3.17 canon update — Cancel button bypasses the discard prompt; only X/Esc/backdrop check isDirty. Reverses prior "all four paths prompt" rule. Plus init-effect must reset dirty on todo-prop change.
type: feedback
originSessionId: c0f59ffd-a7d2-4733-abb6-c624814b0956
---
# Unsaved-changes guard — close-path semantics (v0.3.17)

**Status:** Tier-2 canon update locked 2026-05-11 (canon-master session). Needs to be upstreamed into `docs/canon/reference_unsaved_changes_guard.md` on the next canon-repo sync.

## The new rule

| Close path | Behavior |
|---|---|
| **Cancel button** | Skip prompt. Reset `dirtyRef.current = false`. Call `onClose()` directly. |
| **X button** | Check `isDirty`. If dirty, `confirmAction({ title: "Discard unsaved changes?" })`. |
| **Esc key** | Same as X. |
| **Backdrop click** | Same as X. |

## Why the split

- **Cancel** is an explicit intent. Clicking a button labeled "Cancel" means "I'm abandoning this." Asking "are you sure you want to abandon?" is redundant friction — the user just told you.
- **X / Esc / backdrop** are accidental-dismissal pathways. Esc fires on stray keystrokes; backdrop click happens when reaching for something behind the panel; X is a tiny target near the corner. Protect with a prompt.

Reverses the previous rule (still currently in `docs/canon/reference_unsaved_changes_guard.md`) that said "Esc / backdrop / Cancel / X all check isDirty and prompt."

## Implementation pattern

```tsx
const dirtyRef = useRef(false);
const markDirty = () => { dirtyRef.current = true; };

async function handleClose() {
  if (dirtyRef.current) {
    const ok = await confirmAction({
      title: "Discard unsaved changes?",
      message: "Your unsaved changes will be lost.",
      confirmLabel: "Discard",
    });
    if (!ok) return;
    dirtyRef.current = false; // ← reset after Discard so re-opens are clean
  }
  onClose();
}

// SlideOverPanel wiring — X/Esc/backdrop all flow through onClose prop:
<SlideOverPanel onClose={handleClose} ...>

// Cancel button bypasses the guard:
<button onClick={() => { dirtyRef.current = false; onClose(); }}>
  Cancel
</button>
```

## The init-effect bug to watch for

Editors that persist across opens (panel renders but `if (!open) return null` inside, while the parent editor component stays mounted) will carry `dirtyRef.current = true` from a previous edit if it isn't reset somewhere. Symptom: open a fresh todo and immediately click X → prompt fires even though no changes were made.

**Fix:** the form-init useEffect that hydrates state from the new entity prop MUST also reset `dirtyRef.current = false`:

```tsx
useEffect(() => {
  if (todo) {
    setTitle(todo.title);
    // … all other field hydrations
  } else {
    setTitle(prefill?.title ?? "");
    // …
  }
  dirtyRef.current = false; // ← form is freshly populated, clean slate
}, [todo?.id, isCreating, /* deps */]);
```

Apply this same pattern to every editor (Issue, Rock, Headline, Meeting, etc.) — they all share the persisted-mount pattern.

## Canonical example

`components/TodoDetailEditor.tsx` (post-s61) implements all three pieces:
- `handleClose` resets dirty after Discard
- Init effect resets dirty after hydration
- Cancel button onClick is `() => { dirtyRef.current = false; onClose(); }` (not `handleClose`)

## Related canon

- `docs/canon/reference_unsaved_changes_guard.md` — to be updated upstream
- `lib/confirmAction.ts` — the prompt primitive
- `feedback_canon_strictness.md` — general consistency rule
