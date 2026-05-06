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
