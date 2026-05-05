---
name: Canonical role-descriptive labels per entity
description: Each entity uses a label that describes the user's actual role relative to it — not generic "Owner" everywhere. Decided 2026-04-30 with Ricky.
type: feedback
originSessionId: 3ba6fa9e-6cc4-4527-b7ff-c56d3fbe783c
---
**The canon (UI labels — schema fields stay as they are):**

| Entity | Field meaning | Label | Avatar tooltip |
|---|---|---|---|
| Todo | the doer / assignee | **Assigned to** | "Assigned to: <name>" |
| Todo | recipient of output | **Due To** | "Due to: <name>" |
| Issue | reporter | **Raised by** | "Raised by: <name>" |
| Headline | sharer | **Shared by** | "Shared by: <name>" |
| Rock | accountable person | **Owner** | "Owner: <name>" |
| Scorecard metric / Measurable | accountable for hitting goal | **Owner** | "Owner: <name>" |
| Mini-game | accountable | **Owner** | "Owner: <name>" |
| HIP plan | document author | **Created by** | n/a |
| HIP assumption | accountable | **Owner** | n/a |

**Why each verb:**
- *Assigned to* = delegation. A to-do is work handed to a person to do (RACI's R).
- *Raised by* = reporting. An issue is something a person flagged for the team to address.
- *Shared by* = announcing. A headline is news a person broadcast to the team.
- *Owner* = strategic accountability. A rock / metric / assumption / mini-game is a commitment whose outcome a person owns (RACI's A).
- *Created by* = document authorship. A HIP plan is a document; the creator authored it but doesn't necessarily own its outcomes.

**How to apply:**
- The `<UserAvatar>` primitive (`components/UserAvatar.tsx`) takes a `role` prop. Pass `role="Assigned to" | "Raised by" | "Shared by" | "Owner" | "Due to"` so the tooltip prefixes the user's name. Always prefer the role-prefixed form over a bare `tooltip` override.
- Filter labels, group-by options, filter chips, column headers, sort headers, AI context strings — all use the canonical label for that entity. Don't drift back to "Owner" for to-dos / issues / headlines just because the schema field is `userId`.
- For multi-entity surfaces (e.g. dashboard's combined create modal, IssueDetailEditor's spawn flow), pick the label dynamically from the active type (`type === "todo" ? "Assigned to" : type === "issue" ? "Raised by" : "Owner"`).
- "Resolve" not "Solve" for issues. The schema enum value stays `status: "solved"` (don't migrate), but every UI string says "Resolved" / "Mark resolved" / "Re-open" / "Unresolved".
- Internal code identifiers (sortKey, groupBy keys, schema field names) keep their existing keys — the rule is purely about the user-facing strings.

**Things deliberately NOT changed (Ricky 2026-04-30 confirmed):**
- Scorecard / metrics / measurables stay "Owner" (accountability for hitting a goal, semantically closer to a Rock).
- Mini-games stay "Owner".
- HIP plan "Created by" + assumption "Owner" both stay — they're different roles.
- Reports "Rock Completion by Owner" stays "Owner" (rock context).
