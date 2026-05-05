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
