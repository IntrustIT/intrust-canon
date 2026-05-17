---
name: Urgency color taxonomy (lib/urgency-colors.ts)
description: Color axis for WHY an item is surfaced for attention — distinct from entity-status color. Red=past-due, amber=aging, orange=miss, blue=upcoming, brand-orange=user-flagged, slate=awaiting-decision.
type: reference
---

**Urgency is a distinct color axis from status.** Status answers "what state is this entity in?" Urgency answers "why is this surfaced for my attention right now?" Both can apply to the same item (an "Open" issue can be "Aging"). They use different color maps.

## The taxonomy (fixed)

| Urgency tone | Color | Tailwind |  Meaning | Examples |
|--|--|--|--|--|
| **Past-due** | red | `bg-red-100 text-red-700` | The expected outcome window has elapsed | Overdue todo, off-track rock, stale issue (>90d), missed scorecard goal that's now closed |
| **Aging** | amber | `bg-amber-100 text-amber-700` | The expected window hasn't elapsed but signal is weakening | Aging issue (>30d), at-risk rock, near-due todo |
| **Miss** | orange | `bg-orange-100 text-orange-700` | A target was missed but the period is still open (recoverable) | Scorecard metric miss (current-period), forecast-below-plan signal |
| **Upcoming** | blue | `bg-blue-100 text-blue-700` | Soon-but-not-yet — informational | Meeting starting within N hours, todo due tomorrow, content launching next week |
| **User-flagged** | brand-orange | `bg-[#F58326]/15 text-[#F58326]` | Explicitly pinned by the user (not auto-surfaced) | Pinned todo / rock / issue / milestone (per K-FR-005 PinnedItem model) |
| **Awaiting decision** | slate | `bg-slate-100 text-slate-700` | Captured but not yet triaged | Unclassified capture, AI-suggested item awaiting accept/dismiss, untriaged inbox entry |

## When to use
- Inside `<CalloutCard>` attention surfaces — rank+color items by urgency, not status.
- On dashboard / inbox rows where the "why this is here" is more meaningful than the entity's underlying state.
- In AI summaries + Rickety output that classifies items by attention priority.

## When NOT to use
- For entity lifecycle state (Open / Solved / Done / Cancelled / etc.) — use `lib/status-colors.ts`.
- For role labels — use canonical role labels per `feedback_canonical_role_labels.md`.
- For type/category labels — use `reference_status_pill_semantics.md` mapping.

## Auto-escalation rule (Awaiting decision)
An "Awaiting decision" item that sits untriaged for **7 days** auto-escalates to the next urgency tone matching its underlying nature:
- Captured content/idea → upgrades to **Aging** (amber).
- Captured with an explicit-promise date that's elapsed → upgrades to **Past-due** (red).
- Captured-and-pinned (rare) → stays brand-orange (user signal wins).

The 7-day window may be tuned per consumer but is the canonical default.

## API
Provide `lib/urgency-colors.ts` exporting:
```ts
export type UrgencyTone = "past_due" | "aging" | "miss" | "upcoming" | "flagged" | "awaiting";
export const URGENCY_COLORS: Record<UrgencyTone, { bg: string; text: string; label: string }>;
export function resolveUrgencyTone(item: { ... }): UrgencyTone;
```

## Pairs with
- `reference_callout_card.md` — primary container for urgency-ranked lists.
- `reference_dashboard_principles.md` — Attention axis uses urgency tones for ranking.
- `reference_status_pill_semantics.md` — sibling axis (status, not urgency).

Canonized 2026-05-17 from OS dashboard `TYPE_COLORS` dict (`app/dashboard/page.tsx` ~L1608-1618) extended with `awaiting` tone for the two-axis dashboard model (`reference_dashboard_principles.md`).
