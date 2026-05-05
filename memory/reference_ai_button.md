---
name: AI button + AIContextInspector canon
description: Every AI-triggering button uses <AIButton> (orange sparkle, light-orange bg) and is wrapped in <AIContextInspector>. Differentiate AI actions by tooltip + position, never by icon. Read this before adding a new AI-powered control.
type: reference
originSessionId: c9b17cee-f5ec-4aac-9894-14aeaf8a54b7
---
# AI button + AIContextInspector canon

Every button that triggers an AI/Claude call in the UI uses **`<AIButton>`** (`components/AIButton.tsx`) and is wrapped in **`<AIContextInspector>`** (`components/AIContextInspector.tsx`).

Established alongside the broader Rickety AI surface; canonized here (session 47, B8) by extracting the rolling-banner rule into a permanent doc.

## The two-component pair

### 1. `<AIButton>` — the visible affordance

The orange-sparkle button itself. One shape, one icon, app-wide.

```tsx
import AIButton from "@/components/AIButton";

<AIButton
  tooltip="Generate description from title"   // required — the user-visible label
  onClick={handleGenerate}                    // required — the AI call
  loading={generating}                        // shows the orange spinner
  size="sm"                                   // "sm" w-6 h-6 (default), "md" w-7 h-7
  // icon={<CustomIcon />}                    // RARELY OK — see "no custom icons" below
/>
```

**Visual shape (locked):**
- Square button, rounded-md, fixed `w-6 h-6` (sm) or `w-7 h-7` (md)
- Orange sparkle (`#F58326`) on light-orange bg (`#F58326`/10) with `#F58326`/40 border
- Hover: bg darkens to `#F58326`/20, border to full `#F58326`
- Loading: spinner replaces sparkle, button stays clickable-disabled
- Tooltip: `#E8F4FC` (light blue) bg, `#F58326` (orange) text — distinct from default `<Tooltip>` so AI affordances are pre-attentively recognizable

**Differentiate by tooltip + position, NOT by icon.** Every AI button uses the same sparkle. The user learns "sparkle = AI" once; tooltip + surrounding context tell them which AI action.

### 2. `<AIContextInspector>` — the right-click context affordance

Wraps the AI button. Right-click → modal shows what context sources Claude has (org chart access, recent comments, linked entities, etc.) with toggles to disable specific sources + a custom-instructions textarea.

```tsx
import AIContextInspector from "@/components/AIContextInspector";

<AIContextInspector
  feature="description_gen"           // required — context-source lookup key
  description="Generates a description from the title using last 30 days of comments"  // shown to user
  storageKey="issue-desc-instructions" // optional — localStorage key for custom instructions
  onCustomInstructions={setInstructions}
  onDisabledSourcesChange={setDisabledSources}
  // openOnClick={false}                // see below
>
  <AIButton tooltip="..." onClick={...} />
</AIContextInspector>
```

**`openOnClick` semantics:**
- **Default (`false`)** — left-click fires the AI action via the wrapped button's `onClick`. Right-click only opens the inspector. Use when the AI action is the primary affordance.
- **`true`** — left-click ALSO opens the inspector. Use ONLY when the wrapped child is purely a "show context" affordance with no real onClick (e.g. an inline AI badge that doesn't trigger a generation).

The dashboard "Needs Your Attention" refresh chip uses default behavior: click = refresh, right-click = inspector. That's the canonical pattern (see commit `6a8afa2`).

## Canon rules

### Always pair them

`<AIButton>` without `<AIContextInspector>` is off-canon. Even when the AI action seems trivial (e.g. "Generate from template" with no user data context) — the inspector tells the user *something* runs Claude, which is itself meaningful.

### One sparkle, many actions

Don't introduce per-action icons (no clipboard sparkle for "summarize," no chart sparkle for "analyze"). The sparkle IS the AI affordance — variety undermines the visual recognition.

The `icon` prop on `<AIButton>` exists as an escape hatch (Detect Patterns on `/issues` uses an orange "Detect" pill text instead of the sparkle because it's a longer-running batch action, not an inline assist). New uses of `icon=` need a strong justification — the rolling banner rule was "Differentiate by tooltip + position, NOT by icon."

### Spinner state in flight

`loading={true}` swaps the sparkle for an orange spinner. Don't add a separate visible loading text (e.g. "Generating…") next to the button — the spinner is the canonical signal.

### Tooltip rules

- Always pass a `tooltip` — it's required.
- Tooltip text = imperative verb + object. e.g. "Generate description", "Suggest milestones", "Detect patterns".
- Don't say "Use AI to..." — the sparkle says AI; verb + object is enough.
- Tooltip auto-aligns (left/center/right) based on viewport edge — no `align` prop needed.

### Right-click is reserved

The `<AIContextInspector>` claims the right-click event on the wrapped button. Don't add a competing onContextMenu handler.

## Disabled state

`disabled={true}` greys the button to 40% opacity + sets cursor-not-allowed. The tooltip stops appearing. Use disabled when:
- Required input is missing (e.g. "Generate description" disabled until title is non-empty)
- AI feature is gated by user role / leadership permission (rare — most AI is universally available)

Don't use `disabled` for "AI is currently running" — that's `loading`.

## What NOT to do

- Don't render an orange sparkle by hand — `<AIButton>` is the source.
- Don't skip `<AIContextInspector>` — even small AI calls should expose context sources.
- Don't differentiate AI actions by icon shape. One sparkle.
- Don't use `<AIButton>` for non-AI actions (e.g. a "refresh data" button). Sparkle is reserved for AI.
- Don't use the orange/light-orange palette for non-AI affordances (per the `#F58326` color = AI semantics).
- Don't change the spinner color — orange spinner is canon.
- Don't add `icon={...}` overrides without a documented reason. Detect Patterns is the exception, not a precedent.

## Known consumers (sweep target if API changes)

- `IssueDetailEditor` — Generate Description, Suggest Need, Generate Resolution
- `TodoDetailEditor` — Generate Description, Suggest Action Plan
- `RockDetailEditor` — Suggest Milestones (each milestone gets its own AI sparkle)
- `MeetingPrepPanel` — Pre-meeting brief generators
- Dashboard — Needs Your Attention refresh chip (click = refresh, right-click = inspector — canonical pattern)
- `/issues` — Detect Patterns (uses `icon=` override — long-running batch action)
- SOI summary regenerate
- Inline Rickety chat send buttons (technically uses `<AIButton>` style, may diverge — audit)

## Related canon

- `reference_shared_components.md` — full primitives roster
- `reference_panel_vs_modal.md` — Modal canon (AIContextInspector renders inside its own modal-like portal — predates the new `<Modal>` primitive; eventual sweep target)
- `feedback_canon_strictness.md` — the rule that makes single-sparkle policy stick
