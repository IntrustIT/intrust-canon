---
name: Done / Not done — universal binary completion terminology
description: v0.3.20 canon — "Done" / "Not done" is the universal user-facing pair for binary completion state. Replaces Complete / Completed / Incomplete / Mark Complete inconsistencies across app. State-value identifiers (DB enums, JS string literals) stay unchanged.
type: feedback
originSessionId: c0f59ffd-a7d2-4733-abb6-c624814b0956
---
# Done / Not done — universal completion terminology (v0.3.20)

**Status:** Tier-2 canon, locked 2026-05-11 (s61). Sweep landed alongside lock.

## The rule

Every user-facing string that names the binary "I finished this thing" state uses the pair:

- **Done** (completed state)
- **Not done** (open / unfinished state)

This replaces the prior mix of `Complete` / `Completed` / `Incomplete` / `Mark Complete` / `Open` / `Not completed` / `Mark complete`.

## State values stay as they are

The rule is **purely user-facing strings**. Internal identifiers (DB enums, React state values, API payloads) stay as `completed: boolean` or `"completed"` string values. The map is at the render layer:

```tsx
{todo.completed ? "Done" : "Not done"}
{game.status === "completed" ? "Done" : ...}
```

## Exemption — Rock phase label

Rock's StatusPicker has a phase named "Complete" — this is NOT a binary toggle, it's a *phase* label (the rock is IN the Complete phase of its workflow, alongside Active / Behind / On Track / etc.). Stays "Complete" — different concept.

Same rule applies to ANY future status-phase that happens to be named Complete/Completed — if it's a discrete phase in a workflow (not a binary toggle), it keeps its original name.

## Sweep landed s61

| File | Before | After |
|---|---|---|
| `app/todos/page.tsx` | `Mark done` / `Not done` | Already conformant |
| `components/MeetingItemDetail.tsx:369` | `Completed` / `Open` | `Done` / `Not done` |
| `components/MeetingItemDetail.tsx:396` | `Field label="Completed"` | `label="Done"` |
| `app/meetings/[id]/sections/GoalSettingSection.tsx:384` | `Completed` / `Not completed` | `Done` / `Not done` |
| `app/mini-games/page.tsx:105` | status map `label: "Completed"` | `label: "Done"` |
| `app/mini-games/page.tsx:612` | `<option>Completed</option>` | `<option>Done</option>` |
| `app/vto/page.tsx:609` | `Completed` (rock summary tile) | `Done` |
| `app/vto/page.tsx:1252` | `Completed` / `Incomplete` | `Done` / `Not done` |
| `app/vto/page.tsx:1397` | `Completed` / `Mark complete` | `Done` / `Mark done` |
| `components/HIPPlanEntryWizard.tsx:360` | `Complete` (12/12 done) | `Done` |
| `app/dashboard/page.tsx:2302` | `Completed` (show-toggle label) | `Done` |

## Grep recipe (canon-master sweep)

```
grep -rnE '>Completed<|>Incomplete<|>Complete<|"Completed"|"Incomplete"|Mark Complete|Mark Incomplete|Not completed' app/ components/
```

False positives expected:
- Rock phase string "Complete" — exempt (see above)
- State values `"completed"` lowercase as DB enum / JS identifier — exempt (state values stay)
- Field labels `Date Completed` / `Completed At` as a column header that means "the date this was completed on" — these can stay as nouns, but prefer "Done" for consistency if the surrounding context already says "Done" elsewhere

## Related canon

- `reference_editor_footer_verbs.md` v0.3.19 — Save & Close pattern (the verb side of completion)
- `reference_status_pill_semantics.md` — pill usage for state labels
- Punchlist #497 — original ask, now closed
