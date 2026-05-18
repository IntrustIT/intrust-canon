---
name: Follow canon strictly; research-sweep before new UI
description: Every UI element must follow the established canon unless explicitly approved otherwise. Before any new interface work, do a research sweep for similar existing patterns and reuse them. If something earns a place in the canon, add it.
type: feedback
originSessionId: e3254e1f-2812-4afc-b94a-03bec503312a
---
Every interface element in Intrust OS must follow the established
canon unless Ricky explicitly approves a deviation. Before building
anything that *looks* new, run a research sweep for existing patterns
that are close — and reuse them. If a new pattern proves itself, add
it to the canon so the next agent finds it.

**Why:** This is not aesthetic preference. Every small inconsistency
becomes an expensive defect later: each one takes *minutes at minimum*
to discover and reconcile, and the discovery cost compounds across
sessions because the surface area to scan keeps growing. Worse,
inconsistency makes the app feel confusing to use — and the audience
is Intrust IT staff who are required to use the application Ricky
built. Confusion hardens into resentment fast: "the application the
CEO made then made them use." Every divergence we let in is a small
deposit toward that outcome. Canon-strictness is the antidote.

**How to apply:**

1. **Before introducing a new visual or behavioral pattern**, search
   first. Use Grep / Explore to find existing components and surfaces
   doing something similar. Examples to start: `components/`,
   `reference_shared_components.md`, `reference_list_standards.md`,
   the canon entries under `feedback_*.md` and `project_*.md`.

2. **Reuse beats remake.** If an existing primitive is 80% right,
   extend it (with a prop, a variant, a new tone) rather than
   building a parallel one. Two parallel toggle implementations with
   subtly different behavior is exactly the kind of cost we're
   avoiding.

3. **When deviating, ask first.** If you have a strong reason a
   pattern shouldn't apply somewhere, surface that to Ricky with
   the reasoning — don't quietly diverge. Permission is cheap; an
   inconsistent surface that someone has to clean up later is not.

4. **Promote new patterns intentionally.** When a fresh primitive
   proves itself in the live UI, add it to the canon (a feedback or
   reference memory file, plus an entry under "Reusable primitives
   now live + canonical" in `MEMORY.md`'s active-work block).
   Cite it from the relevant entity files. The goal is that the next
   agent finds the pattern and reuses it without ever needing to
   invent it.

5. **Apply to copy + microinteractions, not just visual shells.**
   Tooltip phrasing, label conventions ("Include X" vs "X only"),
   confirm-modal copy, error toasts, button verbs — these are part
   of the canon too. A single one drifting reads as "the system
   doesn't know what it's saying."

**Scope:** This rule applies to all interface work — pages,
components, modals, popovers, toasts, tooltips, buttons, switches,
chips, badges, copy, and any new primitive. It does not require a
sweep when fixing a one-line bug inside an existing pattern (the
pattern is already settled).

## Required preflight — Plan-vs-Canon Conflict Check (added 2026-05-18)

After listing the canon docs read and before code, the preflight MUST include an explicit **Plan-vs-Canon Conflict Check** step:

> Walk each bullet in the plan against the cited canon docs. For each bullet, name the docs that apply and assert whether the planned shape matches. If any tension exists, flag it and resolve in the plan (or ASK if it's a deviation that needs approval). End with "no conflicts found" only when every plan bullet has been audited.

**Why this is required:** listing docs and APPLYING their constraints are two different acts. A session can read `reference_editor_footer_verbs.md` (which says single-row footer with `[Cancel] [Primary]`) and then write a plan describing a two-tier footer with an override row below — the conflict is right there in the plan but neither the session nor the reviewer catches it unless they do the audit explicitly.

**Concrete failure (2026-05-18):** capture-flow retrofit preflight cited `reference_editor_footer_verbs.md` AND described an "override row" beneath the canonical footer. Both session and canon-master missed the conflict during preflight review; the off-canon two-tier footer shipped and had to be reworked in a follow-up commit.

**How to apply:**
- Add a "Plan-vs-Canon Conflict Check" section to the preflight, AFTER the plan section, BEFORE the hard-stop.
- Format: for each plan bullet, one line stating which canon doc(s) it touches and the result (`OK` / `tension: <description> — resolution: <action>` / `deviation requires Ricky-approval`).
- Empty plan bullets (housekeeping, build verification, etc.) don't need an entry.
- If the check surfaces a tension you can resolve without changing the user-visible shape, resolve it in the plan and proceed. If the resolution requires a user-visible deviation from canon, ASK before the hard-stop.

**Reviewer responsibility (canon-master):** when approving a preflight, scan the Plan-vs-Canon Conflict Check section explicitly. Don't rubber-stamp. If it's missing or shallow, ask the session to add it.
