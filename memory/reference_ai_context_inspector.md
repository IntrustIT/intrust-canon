---
name: AI Context Inspector
description: Canon for the right-click context-inspector primitive that wraps every AI-triggering button. Defines the data/API/prompt contracts every Intrust app must honor so user toggles + custom instructions actually flow into AI calls.
type: reference
---

# AI Context Inspector — canon

Every AI-triggering button is wrapped in `<AIContextInspector>`. Right-click reveals what context the AI uses, lets the user toggle individual sources off, and write per-feature custom instructions. This is the **transparency promise** of every Intrust AI feature.

The visual + interaction shape is documented in [`reference_ai_button.md`](reference_ai_button.md). **This doc covers the contracts** — how data flows in, how the API responds, and how toggles + custom instructions affect the actual AI call. A consumer app that only copies the component without honoring these contracts breaks the promise.

Reference implementation: [`components/AIContextInspector.tsx`](../components/AIContextInspector.tsx) (copy-paste into your app — guidance-only, never imported at runtime per the `@intrust/canon` model).

---

## 0. Variants — Full / Minimal / None (v0.4.0, s60)

**Principle:** *Don't kill a fly with a cannonball. The inspector should reflect what the feature actually consumes.*

Not every AI feature pulls from the org-wide context graph. Wrapping a feature that doesn't consume those sources in the **Full** inspector is theater — right-clicking reveals nine toggles that don't actually filter anything. The s60 fix on /todos fuzzy-search (Meaning mode) removed the Full wrap because the AI call uses only the candidate items + query, not rocks/scorecards/issues.

The canon recognizes three variants:

| Variant | When to use | What it shows |
|---|---|---|
| **Full** | Feature consumes org-wide context (rocks / scorecards / issues / todos / vto / team data via `AI_FEATURE_SETS`). | Current 9-source UI: manual context, auto data sources, AI rules, scope annotations, source toggles, custom instructions textarea. |
| **Minimal** | Feature uses a narrow, scoped context (e.g. only the candidate items + the query; only this entity's history). | Single-line "This feature uses only **{scope}**; no org-wide context" + custom-instructions textbox. No source toggles (there's nothing to toggle). |
| **None** | Feature has no AI context at all (pure templating, deterministic transform). Or the surrounding chrome already communicates context (e.g. the AI button is inside a form whose values are the entire input). | No wrap. Plain `<AIButton>` only. |

### Pick the variant — the test

Before wrapping an AI button, answer:

1. Does this feature pull from `AI_FEATURE_SETS` (auto data) or company-context sections or AI rules? **Yes → Full.**
2. Does the AI call use *some* implicit context that the user might want to see/disable, but it's not the org-wide graph? **Yes → Minimal** with a one-line description of what context is in play.
3. Does the AI call use *only* the explicit inputs the user can see in the form? **Yes → None.** Just an `<AIButton>`.

### The truth test — does the inspector match reality? (v0.4.1)

**Test before shipping any wrap:** "Does the API actually consume any source the inspector advertises?"

- ✅ Yes → wrap is honest. Full or Minimal depending on whether the source set is org-wide or scoped.
- ❌ No → wrap is theater. Remove it (use None) or narrow it (switch to Minimal with the actual scope).

Concretely: if an AI button on a list page hits an endpoint that filters by the current query against the already-loaded candidate items, and the endpoint ignores `disabledSources`, the Full inspector is lying. Right-clicking the Detect-Patterns button might advertise nine sources; if the endpoint doesn't read any of them, every toggle is a noop.

Two AI buttons on the same page can be different variants — they're separate features even when they share a feature-set name. Don't conflate them. Detect Patterns (reads org-wide issue history) vs Meaning search (reads only the current candidate items + query) are DIFFERENT features; one earns Full, the other earns Minimal or None.

This is the principle Ricky locked in s60: *don't kill a fly with a cannonball; the inspector should reflect what the feature actually consumes.*

### Full variant — the existing 9-source UI

Default. Documented in sections 1–6 below. Use when the feature feature-key appears in `AI_FEATURE_SETS` (e.g. `"general"`, `"description_gen"`, `"rock_suggestions"`).

```tsx
<AIContextInspector feature="description_gen">
  <AIButton onClick={generate} />
</AIContextInspector>
```

### Minimal variant — single-line scope + optional instructions

For features with narrow context. The popover reads:

```
This feature uses only: {short scope description}
[empty line]
Custom instructions (optional)
[textarea]
[Save]
```

No source toggles section. No scope-annotation chips. The data contract is simpler — no `InspectorData` fetch needed; the scope description is hard-coded by the consumer.

```tsx
<AIContextInspectorMinimal
  scope="the candidate to-dos + your query"
  storageKey="ai-context-instructions-todo-fuzzy"
  onCustomInstructions={(v) => { customInstructionsRef.current = v; }}
>
  <AIButton onClick={runFuzzy} />
</AIContextInspectorMinimal>
```

Custom instructions still persist to `localStorage` under the same key shape as Full (`ai-context-instructions-{feature}`). The `disabledSources` machinery is absent (nothing to disable).

### None variant — plain AIButton

No wrap at all. Use when the AI call truly takes only the explicit form values + query as input.

```tsx
<AIButton onClick={runSimpleTransform} />
```

The visual is identical to the wrapped versions — just no right-click affordance. **Don't** add a wrap-just-for-consistency; an inspector with nothing to inspect is worse than no inspector.

### Off-canon

- Wrapping a Minimal-shaped feature in Full because "it's the default." That's theater — see s60 fuzzy-search lesson.
- Building a 4th variant. The three above cover the spectrum.
- Wrapping a None-variant button in Full so right-click shows "this feature uses no AI context." A noop inspector pretends to be transparent while being silent. None is correct.

### Field-note pairing

See `reference_canon_sweep_field_notes.md` B8a — "AIContextInspector wrap on a feature that doesn't consume the sources it claims." Grep recipe in the field note.

---

## 1. Data contract

The component fetches `InspectorData` from the consumer app's API and renders three categorized lists of sources + a custom-instructions textarea.

```ts
// What the inspector renders
interface ContextSource {
  /** Stable identifier. Prefix conventions: "manual_<id>" = company-context section,
   *  "rule_<id>" = AI rule, no prefix = auto data feature. */
  key: string;
  /** Human-readable label shown in the panel. */
  label: string;
  /** Whether this source is globally enabled by admin config. */
  enabled: boolean;
  /** "everyone" | "my_team" | "just_me" — shown as a small annotation when not "everyone". */
  scope: string;
  /** Whether this source would be included for THIS user given current scope/membership. */
  included: boolean;
  /** Present only on rule sources. */
  ruleId?: string;
}

interface InspectorData {
  /** The feature key passed by the consumer (e.g. "description_gen", "general"). */
  feature: string;
  /** The auto-data feature names this feature pulls from. */
  featureSet: string[];
  /** All sources to render, in display order: manual_* first, then auto, then rule_*. */
  sources: ContextSource[];
  /** The viewing user's team memberships (used for scope annotations). */
  userTeams: { id: string; name: string }[];
  /** All feature keys registered in the app. Useful for picker UIs. */
  availableFeatures: string[];
}
```

The categorization (`manual_*` → "Company Context", `rule_*` → "AI Rules", everything else → "Data Sources") is done client-side by `AIContextInspector.tsx`. **Do not pre-bucket on the server** — the component owns the visual grouping.

---

## 2. API contract

```
GET /api/ai/context-inspector?feature=<feature_name>
```

Auth: required. 401 if not signed in.
Query params:
- `feature` (string, optional, default `"general"`) — the feature key. Unknown keys fall back to `"general"`.

Response: `InspectorData` (see above) as JSON.

**There is no POST.** Source toggles + custom instructions persist in `localStorage` on the client (per-user, per-browser by design — a deliberate choice so users can experiment without polluting team-wide config). If your app needs server-side persistence, add it as a separate endpoint and wire through `onCustomInstructions` / `onDisabledSourcesChange` callbacks.

Reference endpoint shape:

```ts
// app/api/ai/context-inspector/route.ts
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const featureName = req.nextUrl.searchParams.get("feature") || "general";

  const features = AI_FEATURE_SETS[featureName] || AI_FEATURE_SETS.general;
  const config = await getAutoContextConfig(); // your app's auto-context settings
  const memberships = await getUserTeams(userId);
  const manualSections = await getCompanyContextSections();
  const userRules = await getActiveRulesForUser(userId, memberships);

  const autoSources = features.map((f) => ({
    key: f,
    label: SOURCE_LABELS[f] ?? f,
    enabled: config[f]?.enabled ?? false,
    scope: config[f]?.scope ?? "everyone",
    included: config[f]?.enabled ?? false,
  }));

  const manualContextSources = manualSections.map((s) => ({
    key: `manual_${s.id}`,
    label: `Company Context: ${s.name} (${s.type})`,
    enabled: true,
    scope: "everyone",
    included: true,
  }));

  const ruleSources = userRules.map((r) => ({
    key: `rule_${r.id}`,
    label: r.scope === "team"
      ? `Team Rule (${r.team?.name}): ${(r.optimizedText || r.ruleText).slice(0, 80)}`
      : `Personal Rule: ${(r.optimizedText || r.ruleText).slice(0, 80)}`,
    enabled: r.enabled,
    scope: r.scope,
    included: r.enabled,
    ruleId: r.id,
  }));

  return NextResponse.json({
    feature: featureName,
    featureSet: features,
    availableFeatures: Object.keys(AI_FEATURE_SETS),
    sources: [...manualContextSources, ...autoSources, ...ruleSources],
    userTeams: memberships.map((m) => ({ id: m.teamId, name: m.team.name })),
  });
}
```

---

## 3. Feature registry

`AI_FEATURE_SETS` is a static, code-defined map of feature-name → list-of-auto-data-features. Lives in your app's `lib/ai-context.ts`. Static-config (not DB-backed) is the canon: it makes the set greppable, code-reviewable, and impossible to drift between dev/prod.

```ts
export const AI_FEATURE_SETS: Record<string, AutoContextFeature[]> = {
  general:           ["vto_core_values", "rocks", "scorecard", "issues", "todos", "team"],
  description_gen:   ["vto_core_values", "vto_purpose_niche", "rocks", "issues"],
  rock_suggestions:  ["vto_the_plan", "rocks", "scorecard", "issues"],
  // …add per-app feature keys as needed
};
```

Each app picks its own auto-data features (`AutoContextFeature` is a union of the keys in your app's domain — Playbook will have different ones than OS). **The feature-name keys themselves should stay portable**: if both apps have a "general fallback" or a "description generator", reuse the names `general` and `description_gen` so the inspector tooltip reads the same across apps.

---

## 4. Prompt contract — **the load-bearing bit**

When a user disables a source in the inspector, the disabled keys live in `localStorage` and are surfaced via the `onDisabledSourcesChange` callback as a `string[]`. **The consumer is responsible for honoring them** — the inspector cannot enforce it. This is the contract every AI call must follow:

```ts
// 1. The AI button's parent holds refs that the inspector populates:
const customInstructionsRef = useRef("");
const disabledSourcesRef = useRef<string[]>([]);

// 2. The inspector pushes changes via callbacks:
<AIContextInspector
  feature="description_gen"
  onCustomInstructions={(v) => { customInstructionsRef.current = v; }}
  onDisabledSourcesChange={(keys) => { disabledSourcesRef.current = keys; }}
>
  <button onClick={generate}>AI Assist</button>
</AIContextInspector>

// 3. When the AI call fires, the parent forwards both into the request body:
const res = await fetch("/api/ai/suggest", {
  method: "POST",
  body: JSON.stringify({
    feature: "description_gen",
    input: textValue,
    customInstructions: customInstructionsRef.current || undefined,
    disabledSources: disabledSourcesRef.current.length > 0
      ? disabledSourcesRef.current
      : undefined,
  }),
});

// 4. The server-side prompt builder MUST filter the disabled set:
async function getContextForFeature(
  featureName: string,
  teamId: string | undefined,
  userId: string | undefined,
  disabledSources: string[] = [],
): Promise<string> {
  const features = AI_FEATURE_SETS[featureName] ?? AI_FEATURE_SETS.general;
  const disabled = new Set(disabledSources);
  const parts: string[] = [];

  // Manual company-context sections — keys are "manual_<id>"
  const manual = await getCompanyContextSections();
  for (const s of manual) {
    if (disabled.has(`manual_${s.id}`)) continue;
    parts.push(`[${s.type.toUpperCase()}] ${s.name}:\n${s.content}`);
  }

  // Auto data features — keys match the feature name
  for (const f of features) {
    if (disabled.has(f)) continue;
    const data = await pullSource(f, teamId, userId);
    if (data) parts.push(data);
  }

  // AI rules — keys are "rule_<id>". Filter inside your rule loader.
  // …

  return parts.join("\n\n");
}

// 5. customInstructions is appended to the system prompt verbatim, after auto-context:
const systemPrompt = [
  baseSystemPrompt,
  contextString,
  customInstructions ? `\n\nUser-specific instructions for this feature:\n${customInstructions}` : "",
].join("");
```

**Failure mode to avoid:** building the prompt without checking `disabledSources` makes the inspector toggles a lie. Lint/test for it: any AI endpoint that accepts a `feature` param should also accept and forward `disabledSources`.

---

## 5. localStorage keys

Two keys per feature, both client-only:

| Key                                 | Value                                | Set by                          |
|-------------------------------------|--------------------------------------|---------------------------------|
| `ai-context-instructions-{feature}` | string (raw textarea contents)       | Save button in inspector        |
| `ai-disabled-sources-{feature}`     | JSON `Record<sourceKey, true>`       | Toggle switch in inspector      |

The instructions key is overridable via the `storageKey` prop on `<AIContextInspector>`, but the disabled-sources key is hard-coded to the feature name. **Do not invent new key shapes** — a future shared-component extraction across Intrust apps assumes these exact strings.

---

## 6. Wiring checklist for a new app

1. Copy `components/AIContextInspector.tsx` from canon into your app's `components/`.
2. Copy `components/AIButton.tsx` from canon (the inspector's typical child).
3. Define your app's `AutoContextFeature` union and `AI_FEATURE_SETS` in `lib/ai-context.ts`.
4. Implement `getAutoContextConfig()` (returns admin-saved per-source settings, defaults if unset).
5. Implement `getContextForFeature(featureName, teamId, userId, disabledSources)` — **must filter `disabledSources`**.
6. Add the `GET /api/ai/context-inspector` endpoint matching the API contract above.
7. For each AI call site:
   a. Wrap the trigger button in `<AIContextInspector feature="…">`.
   b. Hold `customInstructionsRef` + `disabledSourcesRef` in the parent.
   c. Wire both callbacks; forward both into the AI fetch body.
   d. On the server, pass them into `getContextForFeature`.
8. Verify: open the inspector, toggle off "Issues", run the AI call, confirm the response no longer references issue data.

---

## Why this is canon

If toggles don't actually filter context, the inspector is theater. The visual primitive is the easy part; the data flow is what makes the transparency promise real. Two apps that diverge here (e.g. Playbook honoring toggles, OS silently ignoring them) immediately break user trust the moment someone moves between apps and the AI behaves differently.

Pair with [`reference_ai_button.md`](reference_ai_button.md) (visual canon) and [`reference_ai_use.md`](reference_ai_use.md) (when to use AI at all + the four canonical patterns).
