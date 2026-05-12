---
name: Editor footer verbs (Save & Close / Create {Type})
description: v0.3.19 canon — every entity slide-over/modal editor uses [Cancel] [Save & Close] in edit mode and [Cancel] [Create {Type}] in create mode. Domain verbs (Add to scorecard, Schedule Meeting) allowed only when they read more naturally than Create {Type}.
type: reference
originSessionId: c0f59ffd-a7d2-4733-abb6-c624814b0956
---
# Editor footer verbs (v0.3.19)

**Status:** Tier-2 canon, locked 2026-05-11. Already implemented in all OS detail editors — this doc captures the de-facto rule so future editors stay consistent.

## The pattern

```
[ Cancel ]   [ Save & Close ]      ← edit mode
[ Cancel ]   [ Create {Type} ]     ← create mode
```

- Cancel = left, neutral border + gray text. Bypasses the unsaved-changes prompt (per `feedback_unsaved_guard_semantics.md`).
- Save & Close / Create {Type} = right, brand-blue solid (`bg-[#0069AA] text-white rounded-lg px-4 py-2 text-sm font-medium`). Disabled when required fields are missing per `feedback_form_validation_display.md`.

## Why "Save & Close" instead of "Save"

The button does two things: persists + dismisses. "Save" alone is ambiguous — could mean save-and-stay (auto-save pattern). With per-field auto-save (#687 SavedIndicator), most state already persists on change; the footer button's real job is the *dismissal* with a final save guarantee. "Save & Close" names that honestly.

## Create mode — domain verbs allowed when more natural

`Create {Type}` is the default, but domain-specific verbs are CANON when they read more naturally:

| Editor | Canonical create verb | Why |
|---|---|---|
| TodoDetailEditor | Create To-Do | Default. |
| IssueDetailEditor | Create Issue | Default. |
| RockDetailEditor | Create Rock | Default. |
| HeadlineAddPanel | Create Headline | Default. |
| MeasurablePanel | Add to scorecard / Add {Subject}'s {Metric} | Metrics are *added to* a scorecard. "Create Metric" reads abstract. |
| Meetings creator | Schedule Meeting / Create N Meetings / Create Series | Meetings are *scheduled* (calendar-shaped action). |
| HIPPlanSetupWizard | Create Plan | Wizard end-state — consistent with `Create {Type}`. |
| Directory User/Team modals | Create User / Create Team | Default. |
| Meetings template modal | Create Template | Default. |

**Test:** does the user *talk* about this action with a different verb? If they "schedule meetings" not "create meetings," use the natural verb. If neither side wins, default to `Create {Type}`.

## Loading states

While the save is in flight, the verb morphs to its `-ing` form:
- `Save & Close` → `Saving…`
- `Create To-Do` → `Creating…`
- `Add to scorecard` → `Adding…`
- `Schedule Meeting` → `Scheduling…`

Trailing ellipsis (`…`, not three dots `...`). Per existing usage across the codebase.

## Off-canon

- Just `Save` in a slide-over/modal where the action dismisses → drift. Use `Save & Close`.
- `Save Changes` — slightly verbose, no behavior delta vs `Save & Close`. Prefer `Save & Close`.
- `Update` / `Edit` as the action verb — confusing (Update against what? Edit was already happening).
- Mixed footer with a third button (e.g. `Save and Stay Open`) — the footer is binary. If a flow needs a multi-step inner save, that's a different primitive (wizard pills).

## Canonical examples

- `components/TodoDetailEditor.tsx` — footer pattern
- `components/IssueDetailEditor.tsx` — same shape
- `components/RockDetailEditor.tsx` — same shape
- `components/MeasurablePanel.tsx` — domain verb for create

## Related canon

- `feedback_unsaved_guard_semantics.md` — Cancel button bypass rule
- `feedback_form_validation_display.md` — disabled state + required-field tooltip
- `reference_panel_vs_modal.md` — slide-over vs modal choice
