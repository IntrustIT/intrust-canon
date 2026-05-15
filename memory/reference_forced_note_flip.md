---
name: Forced-explanation status flip
description: PILOT canon (v0.5.0). Status-changing actions that need a structured explanation (check-in note, resolution rationale, blocker context) route the user through the entity editor with the relevant section pre-armed. The status DB write is deferred until the note is posted. Pilot: /rocks off-track flip → Health-tab pre-armed check-in form. Strip PILOT marker when a second entity adopts (likely issues "Resolve with rationale").
type: reference
---

# Forced-explanation status flip

> **PILOT — v0.5.0.** Pattern locked from /rocks off-track flip. Visual confirmation in place. When a second entity adopts (e.g. /issues Resolve flow with required rationale, /todos defer with blocker note), strip the PILOT marker and harden.

## When this pattern applies

Some status changes are *too consequential to be silent*. Flipping a rock to "off-track" or resolving a strategically-loaded issue without context loses information that future readers (the team, the leadership review, the AI summaries) need. The pattern forces a structured explanation as part of the flip — the user CAN'T commit the status change without leaving the note.

This is NOT a generic confirm dialog ("Are you sure?"). The point is to capture *content*, not consent.

## Canonical example — /rocks off-track flip

The user picks "Off-track" from the row-level status menu on /rocks. Instead of writing `status = "off_track"` immediately:

1. The list-page action **opens the rock editor**, jumping to the **Health tab**.
2. The Health tab renders a **pre-armed check-in form** — the textarea is focused, the section is highlighted, the form already knows the user intends to flip to off-track.
3. The DB write is **deferred** — `status` stays at its previous value until the user posts the check-in note.
4. The check-in posts AS the status flip: one atomic write that includes both the new status AND the explanatory note.
5. If the user closes the editor without posting, the flip is cancelled — status stays unchanged. No half-state.

## Visual contract

- **List-page action** routes through the editor, not through a direct API call.
- **Editor lands on the relevant tab** with the form pre-focused.
- **The form clearly indicates the pending state change** — "Posting this check-in will mark this rock OFF-TRACK" or similar. The user knows they're not just writing a note; they're committing a status flip.
- **Cancel = revert** — closing the editor without posting cancels the pending flip entirely.

```tsx
// list-page row action
const handleStatusFlip = (rockId: string, newStatus: RockStatus) => {
  openEditor(rockId, {
    tab: "health",
    armedFor: { statusChange: newStatus },
  });
};

// inside RockHealthTab
{armedFor?.statusChange && (
  <AlertBanner tone="warning">
    Posting this check-in will mark the rock {STATUS_LABELS[armedFor.statusChange]}.
  </AlertBanner>
)}
<textarea
  autoFocus
  value={checkInText}
  onChange={(e) => setCheckInText(e.target.value)}
  placeholder="What's the situation?"
/>
<button
  disabled={!checkInText.trim()}
  onClick={() => postCheckIn({ status: armedFor?.statusChange, note: checkInText })}
>
  Post check-in
</button>
```

## Rules

- **Atomic write.** The status flip + note post must be ONE PUT, not two. Server-side, write both fields in a single transaction.
- **Required field gating.** The submit button stays disabled until the note has content. Don't allow empty-note flips (defeats the purpose).
- **No bypass paths.** If the user can change the status anywhere else (kebab menu, bulk action, API direct call), audit that path. The forced-note rule only matters if every flip path enforces it.
- **The note is the audit trail.** Don't auto-generate it. The user typed it; that's the value.

## When NOT to use

- **Cheap status flips.** Marking a todo done doesn't need a note. RowStateCircle is fine.
- **Reversible / low-stakes states.** "Mark in-progress" vs "Mark not-started" — no need.
- **Status flips that the system originates** (auto-archive on completion, AI-suggested transitions). Those are system-driven; user-explanation isn't the right shape.

The pattern is reserved for state changes where *the explanation IS part of the value* — off-track signals what's wrong, resolution rationale signals how, blocker note signals what we're waiting on.

## Off-canon

- Letting the list-page row write the status directly with a generic confirm. Anti-canon — confirmation isn't capture.
- Posting the note as a side effect AFTER the status flip. If the user closes the editor mid-write, status is changed but no note is saved. Atomic-or-nothing.
- A modal asking "Why?" with a single text input as a quickie. The pattern uses the full editor for two reasons: (1) the user often needs to update related fields while in the flip mindset, and (2) the editor's existing UX (autosave, validation, etc.) carries over.

## See also

- `reference_status_pill_semantics.md` — base canon for entity status pills (atomic-field-flip rule is paired)
- `reference_state_aware_section.md` — the Health tab section that morphs on rock state
- `reference_panel_body_tabs.md` — editor body tabs (Health is one)
