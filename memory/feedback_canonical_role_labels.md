---
name: Canonical role-descriptive labels per entity
description: Every avatar / picker / column label naming a person's relationship to an entity uses a role-descriptive label. Active-voice over passive. "Responsible" replaces "Owner"/"Assigned to"; "Delegated to" for sub-work; "Raised by" / "Shared by" / "Due to" unchanged. v0.4.0 (2026-05-12) — locked across the canon repo.
type: feedback
originSessionId: 3ba6fa9e-6cc4-4527-b7ff-c56d3fbe783c
---

## Naming heuristic: active-voice labels over passive ones

Labels that name what a person actively **does** with a thing (Responsible, Raised by, Shared by, Delegated to) are more readable and motivating than labels that name a state imposed on them (Owner, Assigned to, Assignee).

- **Owner** — passive. Names a state of ownership, not an action.
- **Assigned to** — passive. Names what was done TO the person.
- **Responsible** — active. Names what the person actually does. Same shape for **Raised by** (they raised it), **Shared by** (they shared it), **Delegated to** (it was delegated to them — the verb is action-oriented in context).

**The test:** read the label out loud. Does it colloquially describe what the person is *engaged with* (an action they take part in) or what *category* they belong to (a slot they were placed into)?

- "Responsible" → reads as engagement: this person is responsible-for, on the hook.
- "Raised by" → reads as engagement: this person raised it.
- "Shared by" → reads as engagement: this person shared it.
- "Delegated to" → reads as engagement: this person is carrying delegated work.
- "Owner" → reads as category: this person occupies the "owner" slot.
- "Assignee" → reads as category: this person was placed into the "assignee" slot.
- "Holder" / "Designee" → reads as category: nouny role-labels imposed externally.

Anything can technically be turned into a verb. The signal is which reading lands more naturally in common speech — engagement or categorization. Pick the engagement word.

**Exception:** source/recipient labels at the entity edges may legitimately be passive when the verb is the *entity's* own action, not the person's — e.g. "Due to" (the todo is due to a person; the person isn't acting). Document exemptions explicitly in this doc.

## The canon table

| Entity | Field meaning | Label | Avatar tooltip |
|---|---|---|---|
| Rock | top-level accountable | **Responsible** | "Responsible: <name>" |
| Todo | top-level accountable | **Responsible** | "Responsible: <name>" |
| Scorecard metric / Measurable | top-level accountable | **Responsible** | "Responsible: <name>" |
| Mini-game | top-level accountable | **Responsible** | "Responsible: <name>" |
| HIP assumption | top-level accountable | **Responsible** | n/a |
| Milestone (sub-work of rock) | sub-work obligation | **Delegated to** | "Delegated to: <name>" |
| Todo (recipient slot) | recipient of output | **Due to** | "Due to: <name>" |
| Issue | responsible (named for the originating action) | **Raised by** | "Raised by: <name>" |
| Headline | responsible (named for the originating action) | **Shared by** | "Shared by: <name>" |
| HIP plan | document authorship | **Created by** | n/a |

## Why each verb

- **Responsible** — obligation. Captures accountability: the person on the hook to deliver. Replaces "Owner" (passive — "this thing has an owner") and "Assigned to" (placement — "this was handed to them"). Both prior terms collapsed onto the same RACI-R concept ("who's accountable"); one term is enough. *Rationale (Ricky s60): "responsible (obligation) is superior to owner (passive)."*
- **Delegated to** — sub-work obligation chain. A milestone is part of a rock — its work is delegated downward from the rock's Responsible. The relational verb encodes the parent/child structure. Always show the label on milestones, even when delegate == rock-responsible (consistency wins; visual repetition is fine). *Rationale (Ricky s60): "delegated indicates the proper relationship and highlights the obligation relationship."*
- **Due to** — recipient. The person who receives the output of the work, not who does it. Passive form is canonical here per the exemption above.
- **Raised by** — **the responsibility label for issues**, named for the originating action. The person who raised the issue is the person on the hook to drive it to resolution. Treat structurally as Responsible (filter umbrella covers it; cross-app sweep targets it); render label as "Raised by." *Rationale (Ricky s60–s61): an issue's responsibility is implied by the act of raising it — the verb earns its place.*
- **Shared by** — **the responsibility label for headlines**, same structure. Headlines are short broadcasts; the sharer carries whatever responsibility there is. Filter umbrella covers Shared-by alongside Responsible.

### Past-tense vs forward-engagement labels

Two flavors of responsibility coexist by design:

- **Retrospective labels** name the originating action and lean past-tense: **Raised by** (issues), **Shared by** (headlines). The verb describes when/how the role was established. The role itself extends forward (the raiser is still the person on the hook), but the label points at the moment that created it.
- **Forward-engagement labels** name the ongoing obligation directly: **Responsible** (top-level work), **Delegated to** (sub-work). The verb describes the current relationship.

Both classes ARE the responsibility role for their entity. The tense difference is editorial — it picks the verb that reads most naturally for the entity's lifecycle. Issues are *opened* by an act of raising; headlines are *broadcast* by an act of sharing — so the past-tense form earns the label. Todos and rocks are *carried* over time — so the forward-tense form earns it.
- **Created by** — document authorship. A HIP plan is a document; the creator authored it but doesn't necessarily own its outcomes.

## "Responsibility" — umbrella filter term

The /todos filter uses "Responsibility" as the parent label for the responsible-vs-due-to choice (e.g., "All / Mine / Due to me"). It deliberately covers both axes — the people on the hook AND the recipients — because the user thinks of both as "things on my plate."

## How to apply

- The `<UserAvatar>` primitive (`components/UserAvatar.tsx`) takes a `role` prop. Pass the canon label so the tooltip prefixes the name. Always prefer the role-prefixed form over a bare `tooltip` override.
- Filter labels, group-by options, filter chips, column headers, sort headers, AI context strings — all use the canonical label.
- For multi-entity surfaces, pick the label dynamically from the active type. Default: most entities → "Responsible". Exceptions: Issue → "Raised by"; Headline → "Shared by"; Milestone → "Delegated to".
- "Resolve" not "Solve" for issues. Schema enum value stays `status: "solved"` (don't migrate), but every UI string says "Resolved".
- Internal code identifiers (sortKey, groupBy keys, schema field names like `userId`, `ownerId`) keep their keys — the rule is purely about user-facing strings.

## Legacy values still in the UserAvatar role union

The TypeScript union on `<UserAvatar role>` retains `"Owner"` and `"Assigned to"` as legacy values until the cross-app sweep lands. The s60/s61 branch already extended the union to include `"Responsible"` and `"Delegated to"` — new + legacy coexist for one sweep cycle. After the sweep retires every `"Owner"` / `"Assigned to"` callsite, drop the legacy values in a follow-up release (forward-only convention).

## Cross-app sweep target — punchlist #773

The sweep replaces these strings across the OS codebase:

| Old | New | Where (typically) |
|---|---|---|
| `Owner` (rock/metric/mini-game/HIP context) | `Responsible` | column headers, picker labels, AI context strings, avatar `role` props |
| `Owned by:` (tooltip prefix) | `Responsible:` | tooltip text |
| `Assigned to` (todo context) | `Responsible` | column headers, picker labels |
| `Assignee` | `Responsible` | any TS identifier in *user-facing* strings only |
| Milestone `Owner` | `Delegated to` | milestone rows in rock editor |

**Don't change** internal code identifiers — schema fields (`ownerId`, `assignedToId`), Prisma enum values, sortKeys, groupBy keys. The rule is render-layer only.

## Sweep status

- ✅ /todos — `role="Responsible"` (Resp-A) + `role="Due to"` (Resp-B). Editor field label "Responsible". Shipped s60+s61.
- ❌ /rocks — still "Owner" everywhere. Needs sweep.
- ❌ Milestones — still "Owner" via MilestoneOwner relation. Needs sweep + introduce "Delegated to" label.
- ❌ /scorecard metrics — still "Owner". Needs sweep.
- ❌ Mini-games — still "Owner". Needs sweep.
- ❌ HIP assumptions — still "Owner". Needs sweep.
- ✅ /issues — "Raised by" (unchanged, still correct).
- ✅ /headlines — "Shared by" (unchanged, still correct).

## Filter umbrella — "Responsibility"

When a single filter picker spans both the Responsible role AND a delegation/recipient relationship (e.g. /todos: items I'm Responsible for + items Due to me), the picker's umbrella label is **"Responsibility"** (noun form). Picker option values stay in the active-verb form ("Me" / "Due to me" / specific people). Canonical example: /todos Responsibility picker at `app/todos/page.tsx` (see `reference_team_picker.md` for picker shape).

## Field-note pairing

See `reference_canon_sweep_field_notes.md` D6 ("Owner/Assigned-to drift") for the grep recipe + smell test used during the sweep.

## Prior canon (superseded 2026-05-10)

The prior version of this doc distinguished "Owner" (rocks/metrics/mini-games) from "Assigned to" (todos), arguing RACI-A vs RACI-R. Ricky's s60 review concluded the distinction wasn't earning its keep — both meant "who is on the hook" and one term sufficed. "Responsible" + "Delegated to" replaces both; "Delegated to" reserved for sub-work obligation chains (milestones in a rock).
