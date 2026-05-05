---
name: Wizard / runner navigation pills (TENTATIVE)
description: Tentative canon for wizard-step pill states and Next/Prev path-cursor behavior. Written from the L10 scorecard wizard implementation; not yet swept across runners. Treat as draft — Ricky expects more work here before locking.
type: reference
originSessionId: d55a9834-086f-4556-a597-2e418317ea3a
---
# Wizard / runner navigation pills — TENTATIVE

> **Status: tentative.** Implemented in the L10 scorecard wizard ([app/meetings/[id]/page.tsx](../../../Projects/intrust-os/app/meetings/[id]/page.tsx) — `goToGroupPill` / `stepToActive` / pill rendering ~line 1860) on 2026-05-04 (session 53). Ricky expects more work here before locking. Do NOT sweep other runners until this is promoted to locked canon. Sweep candidate punchlist: P3 follow-up.

A "wizard pill row" is a horizontal strip of pills representing the steps of a guided flow (e.g. scorecard groups in the meeting runner). It has Next/Prev affordances. Distinct from list-page filter chips and from status-label pills (`reference_status_pill_semantics.md`).

## State vocabulary (3 states)

| State | Visual | Meaning |
|---|---|---|
| **Current** | `bg-[#0069AA]` solid + white text + `border-2 border-[#0069AA]` | Pill the user is currently viewing |
| **On-path** | `border-2 border-[#0069AA]/40` + `text-[#0069AA]` + white bg, hover deepens border + tints bg | Step is on the wizard's default path; click jumps + advances cursor |
| **Off-path** | `border-2 border-dashed border-gray-300` + `text-gray-400` | Step exists but is NOT on the default path for the current context (e.g. a Monthly-only group during a Weekly L10); click is a side-trip |

All states use `border-2` so dimensions match across transitions (no 1-2px reflow). The **Current** state's border matches its background for visual continuity but keeps the box dimensions identical to the others.

Visited / "checked off" state was tried and removed (Ricky 2026-05-04 — "checking them off as you progress isnt helping"). The wizard's progress is communicated by Current + Next/Prev counter, not by a per-pill memory.

## Path cursor + Next/Prev behavior

The wizard tracks one piece of state separate from the current view: `pathCursor` — the most recent on-path step the user landed on, **stored by stable identifier (name, id) — not by index**, so it survives any context change that rebuilds the step list (e.g. period switching in the scorecard).

| Action | View | Cursor |
|---|---|---|
| Click on-path pill | Jumps to clicked | Updates to clicked |
| Click off-path pill | Jumps to clicked | Stays where it was |
| Next | Advances to next on-path step after cursor | Cursor follows view |
| Prev | Retreats to previous on-path step before cursor | Cursor follows view |

**Why a separate cursor:** off-path clicks are pure side-trips. The user wants to peek at a different step but has not advanced the wizard. When they hit Next, they should resume the path from where they were last on it — not be forced into a re-traversal from somewhere else, and not silently skip ahead.

**Edge case — cursor's identifier no longer in step list:** Next falls back to the first on-path step; Prev falls back to the last. Implemented as `cursorIdx === -1 ? activeIndices[0|last] : activeIndices[cursorIdx + delta]`.

## What this canon does NOT cover

- **Period / context switching** alongside the pills (the "Week / Month / Quarter / Year" tabs in the scorecard). Those are a separate filter primitive and stay as-is.
- **Sub-step nav inside a single section** (the "Prev | N of M | Next" row inside Financial Performance). Likely needs its own canon under #761 (`<RunnerSubStepNav>` primitive).
- **The runner's section-level header** (Section title + cluster of metadata + Prev/Next). Also #761 territory (`<RunnerHeader>`).

## Pending decisions before locking

1. Should off-path click auto-switch period (current scorecard pre-#766 behavior) or stay as a pure jump (current post-#766 behavior — the in-section "Switch to {period}" affordance is the explicit way)? Tentative answer: pure jump. Watch for friction in real use.
2. Should this become the universal wizard pattern across HIP runner, meeting sub-step nav, and any future runners? Sweep candidate — see punchlist follow-up.
3. Visited state stays dropped or comes back as a subtle indicator (e.g., a thin completion bar under each visited pill)? Currently dropped per Ricky.

## Related canon

- `reference_status_pill_semantics.md` — pill-as-label canon. Wizard pills are navigation chrome, NOT labels — different concept, different file.
- `feedback_meeting_runner_consistency.md` — inside-meeting === outside rule, captive banner, two-flags rule.
- Future `reference_runners.md` (#761) — should reference back to this when written.
