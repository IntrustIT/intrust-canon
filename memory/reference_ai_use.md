---
name: AI use canon — when AI is and isn't appropriate
description: Editorial rules for using AI in Intrust OS. Defines when AI is a good fit (high-context, structured outputs, opt-in) and when it isn't (random text blurbs, replacing user input, auto-fire on mount). Read before adding any AI surface or AI-triggered behavior.
type: reference
originSessionId: 40d62b45-e4ef-492c-8804-333c10d87df3
---
# AI use canon — when AI is and isn't appropriate

Codified session 50 after Ricky's "I'm not in love with some of the AI companions that try to do things like this for the user" remark. The platform has real AI surfaces that earn their keep (Rickety, AI Action Plan, generate-description), but the surface area is growing fast and the cost of misjudging when to use AI compounds: wasted tokens, replaced user content, AI noise that lowers trust in the legitimate AI features.

This canon governs **when** to use AI. Visual rules for AI buttons live separately at `reference_ai_button.md`.

## The two questions to ask before adding an AI surface

1. **Is the output structured enough that the user will use it as-is, or is it noise?** AI is good at producing things with a clear shape — action plans (verbed steps + done-state), summaries from a known data source, tagged classifications. AI is bad at producing free-form prose blurbs that compete with what the user would have written themselves. **A practically-random text blurb isn't a good use of AI.** If you can't describe the structure of the output in one sentence ("3-5 verbed steps + a Done line"), don't ship it.

2. **Will the user have invoked it deliberately, or will it fire because they happened to load a page?** Auto-fire on mount is almost always wrong. The user hasn't asked. The output sits unread. Tokens burn. Users lose trust in the AI's signal because most of what it produces never gets seen. **Only fire AI on explicit gesture.**

If both answers are clean — structured output + user gesture — the AI surface is probably worth shipping. If either is muddy, redesign or kill it.

## Rule 1 — never replace user-written content silently

User-written text is sacred. Notes, descriptions, anything the user has typed should never be overwritten by AI without explicit confirmation, period.

The K-CS-015 bug pattern was the canonical violation: a sparkle button next to a Notes field that, when clicked, replaced the entire Notes contents with AI output. The user lost everything they'd written. The tooltip even said "the result replaces the field" — the bug was documented behavior.

There are two compliant shapes for AI-produced text — pick the one that fits the field's intent:

### Shape 1 — Separate AI field (Pattern A)

Use when the AI output is **conceptually distinct** from the user-authored field — the two should coexist as separate columns in the data model, separate sections in the UI.

K-CS-015's fix is the canonical example: `Todo.aiPlan` was added as its own column, separate from `Todo.notes`. The two fields render in two separate sections of the editor, with their own labels. The user can ignore, generate, edit, or clear the AI field — but the user's notes are never touched by AI.

When to use: the AI is producing a *different kind of thing* than the user field (e.g. user writes free-form Notes; AI writes a structured Action Plan).

### Shape 2 — Suggestion banner with Add / Replace / Dismiss (Pattern B)

Use when the AI output is **the same kind of thing** as the user field — a draft of what would go into that exact field — but the user must remain in control of whether to accept it. Implemented at `components/AISuggestField.tsx`. Live on Rock description, Rock SMART goal, Issue description, Issue spawn-notes (rolled out session 50, replacing the old replace-on-click `AITextHelper`).

The component renders the user's existing field (textarea) on top, and an AI suggestion banner BELOW the field when the user has clicked the sparkle. Three actions:

| Button | Behavior |
|---|---|
| **Add** | AI suggestion goes ABOVE the user's original, separated by the canonical follow-up divider (`───────────────` + `— Original below —`). User keeps both, can edit/merge as they like. **Repeat-safe** — clicking Add a second time only swaps the top portion; original below stays put, divider never doubles up. |
| **Replace** | AI suggestion takes over the field entirely. User's original is dropped. Explicit destructive action. |
| **Dismiss** | Banner clears, field untouched. |

When to use: the AI is producing a *first draft* or *alternative version* of what the user is also free to write themselves. Description, SMART goal, notes-style fields.

### Visual rules for both shapes

When the AI output is populated, render it visibly different from user input — orange-tinted border (`bg-orange-50/40 border-orange-200`), small `AI SUGGESTION` or `AI-generated · editable` label, brand-orange action button. The user must always be able to delete or dismiss AI output without remorse.

## Rule 2 — never auto-fire on mount

AI surfaces fire only on explicit user gesture. Click, expand, type, hover — something the user did intentionally. Never just because they navigated to a page or opened an editor.

The Rickety chat (`components/InlineRicketyChat.tsx`) violated this for sessions 1-49: it called `/api/ai/companion` on mount with the context prompt, "so the analysis is ready when the user expands." The cost: every editor open + every meeting-prep view burned an Anthropic call. Most went unread. Session 50 gated it on `open === true` — first expand-click fires the analysis; the cached `initialized` flag prevents re-firing.

**The pattern:**

```tsx
// ❌ wrong — fires on mount
useEffect(() => {
  if (!initialized && hasContext) {
    sendMessage(contextPrompt, true);
  }
}, [initialized, contextPrompt]);

// ✅ correct — gated on user gesture (panel open)
useEffect(() => {
  if (!open) return;
  if (!initialized && hasContext) {
    sendMessage(contextPrompt, true);
  }
}, [open, initialized, contextPrompt]);
```

Once the user has expressed intent (opened the panel, clicked the button, expanded the chat), it's fine for the AI to fire **once** with the context. The "initialized" guard prevents re-fires on every state change. But the first call always waits for the gesture.

**Surfaces to keep this rule honest in:** every place that wraps `<AIButton>` or calls an `/api/ai/*` endpoint. If you find yourself reaching for `useEffect(() => { generate() }, [])`, stop.

## Rule 3 — opt-in, not opt-out

The default state of any AI surface is empty + dormant. The user opts in by clicking. Never the inverse — never have AI content present by default that the user must dismiss.

Empty state copy: "No plan yet. Click the sparkle to generate." (per `reference_empty_loading_states.md`). Clear, instructive, no chrome. The empty state IS the call-to-action.

This is consistent with Rule 2 — auto-firing on mount would put AI content in front of the user without their having asked.

## Rule 4 — name the structure of the output in the prompt

If the output structure can't be described in a single sentence in the prompt, the surface is the wrong shape. Reshape the surface, not the prompt.

Good prompts (already shipped):
- AI Action Plan (`/api/ai/generate-description` aiPlan branch): "3-5 verbed numbered steps + a 'Done looks like:' line."
- Rock SMART Goal: "Specific, Measurable, Achievable, Relevant, Time-bound — 2-3 sentences."

Bad prompt template (what to avoid):
- "Write some notes for this to-do." → output is a coin flip. Will it be 1 sentence or 5 paragraphs? Bullets or prose? The user has no way to predict what they'll get, so they can't decide whether to invoke it.

Shape first, then prompt.

## Rule 5 — when AI auto-fire IS appropriate (the legitimate exceptions)

Some flows do warrant AI running without an explicit click — but the trigger has to be **a separate user action that's already been taken**, not page-load.

Examples already on the punchlist as legitimate auto-AI:
- **Surfacing action items / attention items** — when the user opens the dashboard, the system has already done the AI classification offline (or in the background) on a schedule. The user opening the dashboard is the trigger to *display* the result, but the AI ran when the underlying data changed, not on view-mount.
- **Variance auto-issue detection** — fires when GGOB actuals are entered, not when the page is viewed.
- **Triage classification** for issues — runs when an issue is created or updated, against the title/description the user just wrote. The user typed; that's the gesture.

The pattern: the AI fires on a *data event* (write, update, scheduled poll), not a *view event* (mount, render, navigation). The data-event path means the result is computed once and cached; many viewers see the same answer without each view triggering a call.

Any new "should this auto-fire?" question comes back to: what was the user gesture, and is it persistent (data) or ephemeral (view)?

## Rule 6 — make AI provenance visible

When AI produced something, label it. "AI-generated · editable" / "AI Action Plan" / orange tint on the textarea. The user should never wonder "did I write that or did the AI?"

This isn't paranoia — it's about the user being able to delete AI output without remorse, and trust their own writing.

Visual conventions live in `reference_ai_button.md` and `reference_status_pill_semantics.md`. Bottom line: AI surfaces use orange (brand-orange `#F58326` or `bg-orange-50/40` tint), never blue. Blue is the brand-primary color and represents the user/the app — keeping AI in orange keeps the visual provenance clean.

## Rule 7 — RIGHT-CLICK reveals what context AI uses

Every AI surface wraps its trigger in `<AIContextInspector>`. Right-click on the sparkle reveals which data sources contributed to the prompt + lets the user add custom instructions. This is canon (`reference_ai_button.md`) but worth restating here: AI inspectability is part of trust. If the user can't see what's in the prompt, they can't trust the output.

## Patterns observed in the codebase (the four good shapes)

The session-50 audit categorized every AI-triggering surface in the app. Most are already canon-compliant; the violations were all the same `<AITextHelper>` anti-pattern (replace-on-click), which was retired in this session. Going forward, every AI feature should fit into one of these four shapes:

### Pattern: Filter / Rank (read-only)
**Examples:** fuzzy search across all 7 list pages, dashboard attention-AI scoring, duplicate detection on title-typing, issue patterns.
**Shape:** AI takes data + query, returns ranked or filtered IDs / warnings. Never creates or modifies. Safe to fire on gesture or debounced typing — worst case is a stale suggestion.
**Why it's good:** read-only by definition; nothing the user can lose.

### Pattern: Suggest with Add / Replace / Dismiss
**Examples:** Rock description / SMART goal, Issue description / spawn-notes, anything where AI produces a *first draft* of what would go into a user field. Implemented at `components/AISuggestField.tsx`.
**Shape:** AI generates into a banner positioned **below** the textarea. User chooses Add (preserves original below the divider), Replace (drops original), or Dismiss (banner clears). Repeat-safe.
**Why it's good:** user always sees both the AI version and their own before deciding; no silent loss.

### Pattern: Compute-once / Cache / Refresh-on-gesture
**Examples:** dashboard attention-AI (computes once on dashboard load, caches in `AttentionCache`, only re-fires on explicit Refresh button click).
**Shape:** AI runs on first view, result is cached, gesture (refresh button, data event) re-runs. Subsequent views read from cache without burning tokens.
**Why it's good:** expensive AI scoring stays fast for repeat viewers; user controls when to refresh.

### Pattern: Append-with-label
**Examples:** AtRiskTriage Press / Pivot prepend `**AI Analysis:**` to a note when user invokes the action.
**Shape:** user explicitly invokes an action that creates a sub-entity (todo/issue/etc); AI writes context into the new entity's notes prefixed by a clear label. User keeps their own input; AI adds.
**Why it's good:** acceptable when the gesture was deliberate AND the AI output adds, doesn't replace.

### Anti-pattern: Replace-on-click (retired)
The old `<AITextHelper>` component fit none of these patterns — clicking the sparkle silently overwrote a user-authored field. Retired session 50 (deleted the component). All four callsites migrated to `<AISuggestField>`. **Don't bring it back.** If you need a one-click AI for a text field, use Pattern B (Suggest with Add/Replace/Dismiss).

## Implementation rules from the AISuggestField pilot

When building an `<AISuggestField>` (Pattern B) — these specific shape rules came out of the session-50 design discussion. Follow them so the experience stays consistent across all four current callsites and any future ones:

1. **Banner sits BELOW the textarea**, not above. The user reads their original first, then the suggestion as a comparison.
2. **Three buttons, all same shape.** Same `text-[11px] font-medium px-2 py-0.5 rounded border` skeleton. Differ only in fill / border color.
   - Add: filled brand-orange `bg-[#F58326] text-white border-[#F58326]`
   - Replace: gray outline `border-gray-300 text-gray-700 hover:bg-gray-100`
   - Dismiss: transparent border `border-transparent text-gray-500 hover:bg-gray-100`
3. **Add separator is the canonical follow-up divider** — `\n\n───────────────\n— Original below —\n\n`. Same `─` chars used at `RockDetailEditor.tsx:599` for follow-up spawns. Don't roll a new separator (asterisks, em-dashes, anything else).
4. **Repeat-safe Add.** Splitting on the separator and replacing only the top portion means clicking Add multiple times never stacks dividers or accumulates "originals." Implementation reference: `components/AISuggestField.tsx:add()`.
5. **Existing field text is sent as `existingDescription`** to the API so the AI can see what the user has already written. Prompt frames it as "improve it" — see `app/api/ai/generate-description/route.ts`.

## Sweep status (post session 50)

**Closed (anti-pattern retired):**
- ✅ All 4 `<AITextHelper>` callsites migrated to `<AISuggestField>` — RockDetailEditor description + smartGoal, IssueDetailEditor description + spawn-notes. Component file deleted.
- ✅ Rickety auto-fire gated on user expand (`InlineRicketyChat.tsx`).

**Probable violations to audit periodically:**
- Any new `useEffect(() => { fetch("/api/ai/...") }, [])` patterns added in future. Grep for them every few sessions.
- New AI-triggering UI must fit one of the four patterns above. If the answer is "none of these," reshape the surface — don't ship a fifth.

## Related canon

- `reference_ai_button.md` — visual canon for AI buttons (orange sparkle, AIContextInspector wrapping, click vs right-click semantics)
- `reference_empty_loading_states.md` — "No X yet" voice for empty AI sections; brand-orange spinners for AI-flow loading
- `reference_status_pill_semantics.md` — pill is for labels, not health; doesn't apply directly here but the broader "use the right primitive for the job" principle does
