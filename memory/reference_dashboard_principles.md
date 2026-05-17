---
name: Dashboard principles (two-axis structure)
description: Every Intrust-app dashboard organizes around two axes — Attention (anything warranting eyes, source-agnostic) + My Work (active queue owned by the user). Captures absorb into Attention; Triage is a filter, not a separate tab.
type: reference
---

# Dashboard principles

Every Intrust-app dashboard — OS, Playbook, future apps — organizes around **two axes**, not three. This doc codifies the principle so each new dashboard ships with the same mental model.

## The two axes

### 1. Attention (surveillance + decision)
Anything warranting the user's eyes, regardless of source. **Source-agnostic** — system-flagged items, AI-classified items, user-captured-but-untriaged items, and items the user already owns that have changed state all live here together.

**Includes:**
- System-surfaced alerts (overdue, off-track, stale, scorecard miss, upcoming meeting)
- User-flagged pins (per `K-FR-005` PinnedItem model — explicit user signal)
- Captured-but-untriaged items (inbox-style — auto-surfaced with `awaiting` urgency tone)
- Items the user already owns on My Work that have transitioned to a problematic state (off-track rock, overdue todo) — they appear in BOTH places, not just one

**Ranked by:** urgency, per `reference_urgency_colors.md`.

**Container:** `<CalloutCard tone="info">` (per `reference_callout_card.md`).

**Affordances per row:** snooze (24h / 7d / until-it-changes), dismiss, route, convert, open. Every row is actionable from Attention; the user never has to context-switch to act on an item that's there.

### 2. My Work (ownership)
The active queue of items the user owns. Steady-state.

**Includes:**
- Open todos assigned to user
- Active rocks owned by user
- Scorecard metrics owned by user
- (Playbook analog: in-progress enrollments, owned content drafts)

**Sorted by:** the entity's natural sort (due-date, priority, manual order).

## Why two axes, not three

The earlier three-axis model (Attention / My Work / Triage) bifurcated user-captured items into their own tab. From the user's perspective that bifurcation is bookkeeping they don't care about — a capture that hasn't been triaged is just another thing awaiting their attention. The two-axis model collapses Triage into Attention with an "Awaiting decision" urgency tone (slate). The user gets one surveillance surface and one ownership surface.

**Triage view still exists as a drill-in** — a filter chip or a focused view that says "show me only the captured-undecided rows." But it is NOT a peer tab to Attention.

## Overlap is intentional

An item can appear on both axes simultaneously. Off-track rocks render on Attention (with red `past_due` urgency) AND remain on My Work (with the rock's natural state). The Attention surfacing is the **surveillance overlay** — dismissing it removes the alert but does not remove the item from My Work. This is the correct mental model: Attention is "needs eyes," My Work is "you own this," and the same item can need eyes while you own it.

## Layout

```
H1 + subtitle
Tab bar: [Attention (N) | My Work (M)]   (optional: [Triage filter chip inside Attention])
↓
[Attention tab]
  <CalloutCard tone="info" title="Needs Your Attention">
    {urgency-ranked rows}
  </CalloutCard>
  <CalloutCard tone="ai"> {optional AI insights} </CalloutCard>
  <CalloutCard> {optional Breaking News / FYI / Recently Triaged} </CalloutCard>

[My Work tab]
  Card grid: My Todos · My Rocks · My Issues · My Metrics
  Each card is a compact list with click-to-open editors.
```

Tab counts use `<TabCountBadge>` per `reference_tab_count_badge.md`.

## Affordances on Attention rows

Per `feedback_always_visible_affordances.md`: snooze menu, dismiss-X, and open-handler are always-visible at low weight. Right-click context menu offers the full entity action set (per `reference_entity_action_set.md`). Clicking the row opens the entity's stacked editor per `reference_stacked_editor_pattern.md` (no page navigation).

## What NOT to do

- Don't add a "What's New" or "Recent Activity" tab as a peer to Attention — recent activity belongs INSIDE Attention (as an FYI sub-card) or on a per-entity activity-log page.
- Don't build a "Triage" tab as a peer to Attention — captures absorb into Attention.
- Don't surface a third bin for "low-urgency" or "deferred" — use the urgency-color axis to rank within Attention.
- Don't use brand-orange for tab active states unless the tab IS AI-themed (per `reference_color_palette.md`).

## Playbook applicability

Same two-axis structure applies to a Playbook learner dashboard:
- **Attention** — courses overdue, certifications expiring, AI-suggested content awaiting accept/dismiss, manager-assigned-but-not-started enrollments.
- **My Work** — in-progress enrollments, owned content drafts.

Same primitives (CalloutCard, urgency-colors, TabCountBadge) apply unchanged.

## Open canon questions (settle on next sweep)

- **Capture auto-escalation window** — currently 7 days from capture before "Awaiting decision" upgrades to its underlying urgency. Tunable per consumer; 7 is the canonical default. Confirm against learner-content rhythm if Playbook adopts.

Canonized 2026-05-17 (canon v0.5.4) from the OS dashboard review + two-axis restructure decision. Supersedes the implicit three-tab structure of the current OS dashboard pending the dashboard canon sweep (md punchlist forthcoming).
