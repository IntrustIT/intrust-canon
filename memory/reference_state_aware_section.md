---
name: State-aware editor section morphing
description: PILOT canon (v0.5.0). When an editor section's label + tone should change based on entity status rather than being two separate conditional sections, morph in place. Pilot: /rocks Next-7-Day-Move (blue, on-track) → Recovery Plan (red, off-track) — same fields, different framing. Strip PILOT marker when a second entity adopts.
type: reference
---

# State-aware section morphing

> **PILOT — v0.5.0.** Pattern locked from /rocks editor work. Visual confirmation in place. When a second entity adopts the pattern (likely issues for resolve-with-context, or todos for blocker capture), strip the PILOT marker and harden.

## When this pattern applies

An editor section serves the same *purpose* in both states, but its **label, tone, and emphasis** should shift with the entity's status. Two separate conditional sections (`{onTrack && <NextMove/>} {offTrack && <RecoveryPlan/>}`) feels redundant when they share the same fields and same DB column.

The state-aware morph collapses them into ONE section that knows its current framing.

## Canonical example — /rocks Next-7-Day-Move

The "what's the plan?" section on a rock:

| Status | Section title | Tone | Subtitle |
|---|---|---|---|
| on_track | "Next 7-Day Move" | Brand-blue accent | "What's the most important next step?" |
| off_track | "Recovery Plan" | Red accent | "What gets this back on track?" |

Same `nextMoveText` field underneath. The user writes one thing; the framing changes based on rock status. This is more honest than two separate sections, and it preserves whatever the user typed across state flips (no field shuffling).

## Visual contract

```tsx
<section className={cn(
  "rounded-md border p-4",
  isOffTrack
    ? "border-red-200 bg-red-50/30"
    : "border-blue-200 bg-blue-50/30"
)}>
  <header className="flex items-center gap-2 mb-2">
    {isOffTrack
      ? <AlertTriangle className="w-4 h-4 text-red-600" />
      : <ArrowRight className="w-4 h-4 text-[#0069AA]" />}
    <h3 className={cn(
      "text-sm font-semibold",
      isOffTrack ? "text-red-700" : "text-[#0069AA]"
    )}>
      {isOffTrack ? "Recovery Plan" : "Next 7-Day Move"}
    </h3>
  </header>
  <p className="text-xs text-gray-500 mb-2">
    {isOffTrack
      ? "What gets this back on track?"
      : "What's the most important next step?"}
  </p>
  <textarea value={nextMoveText} onChange={...} />
</section>
```

The section border + icon + title + subtitle all morph together. The field stays the same.

## Rules

- **Same field underneath.** State morphs framing, not data. Don't render two sections that write to different fields and pretend they're one.
- **Field value persists across state flips.** If the user wrote a Recovery Plan and the rock flips back to on-track, the text stays — it just rebadges as Next 7-Day Move. No data clearing.
- **Don't morph more than 2 states.** State-aware section is a binary morph (state-A vs state-B). If you need 3+ visual variants of "the same section," that's a sign the section should split into truly different sections, OR the entity has too many states.

## Off-canon

- Two conditional sections written separately (`{onTrack && ...} {offTrack && ...}`) when they share a field. Collapse to a morph.
- Morphing across states that mean fundamentally different things (e.g. "Planning" vs "Retrospective" — those are different concepts that deserve different sections, not a morph).
- State-dependent placeholder text without state-dependent framing. If the section title stays the same, that's not a morph — it's just a contextual placeholder.

## See also

- `reference_panel_body_tabs.md` — when state needs MORE than a section morph (different workflow phases)
- `reference_status_pill_semantics.md` — entity status that drives the morph
