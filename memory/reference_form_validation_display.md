---
name: Form validation display
description: How required-field gates and server-side errors surface in slide-over editors. Save button disabled with Tooltip explaining the gate; required fields marked with inline red asterisk; server errors → toast; contextual late-stage validation (Resolve flows) may also toast. Silent-return is anti-canon.
type: reference
---

# Form validation display

Three feedback surfaces, used in this priority order:

| Trigger | Surface | When |
|---|---|---|
| Required field empty (front-end gate) | **Save button disabled + Tooltip** + inline `*` mark next to the field label | Always |
| Server returns 4xx/5xx | **Toast** with the parsed error message | Always |
| Field requirement is contextual to a late-stage action (e.g. "must fill resolution to mark Resolved") | **Toast** explaining the gate | Only for late-stage actions inside the editor |

**Silent-return on missing fields is anti-canon.** Don't `return` from `handleSave` without telling the user why nothing happened.

---

## 1. Front-end gate — disabled Save + Tooltip + asterisk

```tsx
const canSave = title.trim().length > 0 && ownerId !== "" && /* …other required fields */;

<Tooltip text={!canSave ? "Title and owner are required" : ""}>
  <button
    disabled={!canSave}
    onClick={handleSave}
    className="px-4 py-2 rounded-lg bg-[#0069AA] text-white text-sm font-medium disabled:opacity-40"
  >
    Create Issue
  </button>
</Tooltip>

{/* Each required-field label gets the inline mark: */}
<label className="block text-xs font-medium text-gray-700 mb-1">
  Title <span className="text-red-500">*</span>
</label>
```

Locked details:
- **Tooltip** is the canonical primitive (per `reference_shared_components.md`). NEVER native `title=` attribute.
- **Tooltip text** describes WHICH fields are missing, not "fill required fields." Specific > generic.
- **Asterisk:** `<span className="text-red-500">*</span>` immediately after the label text, single space gap.
- **Disabled style:** `disabled:opacity-40` on the button; the brand-blue stays so the button still reads as the primary action.
- **No inline error messages below fields** for required-empty. The label asterisk + button-disabled-tooltip carry the signal. Inline error text under fields is reserved for *format errors* (invalid email, number out of range, etc.) — and those are rare in OS today.

---

## 2. Server error — toast

When `fetch` returns non-2xx OR throws:

```tsx
async function handleSave() {
  try {
    const res = await fetch("/api/issues", { method: "POST", body: JSON.stringify(payload) });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error || `Save failed (${res.status})`);
      return;
    }
    onSaved();
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "Save failed");
  }
}
```

- Always parse the server's `error` field if present — server messages are user-facing.
- Fall back to `Save failed ({status})` for unparseable responses.
- Catch network errors with a generic "Save failed" — never bare-throw to the console.

Server validation failures (400 with a specific reason) flow through the same toast path. The server's error message is canonical.

---

## 3. Contextual late-stage validation — toast

When a user performs an action *inside* an open editor (not the primary Save) and that action has its own field requirements that aren't enforced by Save's gate:

```tsx
// Example: marking an Issue as Resolved requires a resolution note
function applyStatusPick(newStatus: string) {
  if (newStatus === "solved" && !resolution.trim()) {
    toast.error("Add a resolution note before marking Resolved");
    return;
  }
  // …apply…
}
```

Toast (not disabled-with-tooltip) because:
- The action lives inside a popover/dropdown — there's no persistent button to disable.
- The requirement is contextual ("only when going to Resolved") — not a global gate on the editor.
- Toast is a fast, dismissable signal that doesn't block other interactions.

**Don't** stack contextual toasts. If multiple fields are missing for an action, write one toast listing them: `"Add a resolution note and pick a Need before marking Resolved"`.

---

## 4. Anti-patterns

- **Silent return** from `handleSave` when required fields are missing. The button isn't disabled? Then a click should DO something — even if it's just a toast.
- **`alert()` calls** for validation. Modal-blocking alerts are off-canon (per `reference_panel_vs_modal.md`). Always use Toast or Tooltip.
- **Inline red error text under every required field** for "field is required." Adds noise; the asterisk + disabled-tooltip pattern is enough. Reserve inline error text for *format* errors, and keep it terse (`text-[10px] text-red-500 mt-0.5`).
- **Different validation patterns per editor.** Issue uses tooltip-on-disabled, Todo uses silent-disabled, Rock uses POST-failure-toast — same field-required pattern, three different feedback approaches. Pick one per the priority table above.

---

## 5. When the form has many required fields

Avoid 8+ required fields on one editor. If you have 8+, the editor is too big — break it up via [`reference_panel_body_tabs.md`](reference_panel_body_tabs.md) workflow phases or split entities. The disabled-save + tooltip pattern degrades when "what's missing" is a long list.

If you genuinely need a long required-field list, the tooltip text becomes a bullet list:
```tsx
<Tooltip text={!canSave ? `Required: ${missingFields.join(", ")}` : ""}>
```

---

## See also

- [`reference_shared_components.md`](reference_shared_components.md) — Tooltip primitive.
- [`reference_confirm_dialog.md`](reference_confirm_dialog.md) — confirmAction / confirmDestructive (different surface — destructive actions, not validation).
- [`reference_panel_body_tabs.md`](reference_panel_body_tabs.md) — when a form gets too big for one screen.
