---
name: Entity action set
description: Single source of truth for entity actions (Edit / Ask Rickety / Spawn linked / Flag / Delete / etc.) that appear in BOTH right-click ContextMenu (on rows) AND Kebab menus (in slide-over headers). lib/entity-actions.ts owns the canonical ContextMenuItem[] per entity type. Inside-editor kebab filters out "Ask Rickety" + "Open Details" (already accessible from the body).
type: reference
---

# Entity action set

Every entity (Issue / Todo / Rock / Headline / Metric / Course / Content / etc.) has one canonical action list — used in two surfaces:

| Surface | When | Primitive |
|---|---|---|
| **Right-click on a row** in a list page | Always | `<ContextMenu items={ctxItems} />` |
| **Kebab menu in a slide-over header** | Edit mode | `<KebabMenu items={ctxItems.filter(insideEditorFilter)} />` |

The same `ContextMenuItem[]` drives both. Single source of truth: `lib/entity-actions.ts`.

---

## 1. Canonical builder pattern

```ts
// lib/entity-actions.ts
import type { ContextMenuItem } from "@/components/ContextMenu";
import { LINKED_SPAWN_ICON } from "@/lib/icons";

export function buildIssueActions(args: {
  issue: Issue;
  onAskRickety: () => void;
  onOpenDetails: () => void;
  onSpawn: (type: "todo" | "rock" | "headline") => void;
  onFlag: () => void;
  onArchive: () => void;
  onDelete: () => void;
}): ContextMenuItem[] {
  return [
    { label: "Open Details", icon: "📋", onClick: args.onOpenDetails },
    { label: "Ask Rickety", icon: "✨", onClick: args.onAskRickety },
    { divider: true },
    { label: "Spawn To-Do",   icon: LINKED_SPAWN_ICON, onClick: () => args.onSpawn("todo") },
    { label: "Spawn Rock",    icon: LINKED_SPAWN_ICON, onClick: () => args.onSpawn("rock") },
    { label: "Promote to Headline", icon: LINKED_SPAWN_ICON, onClick: () => args.onSpawn("headline") },
    { divider: true },
    { label: args.issue.flagged ? "Unflag" : "Flag", icon: "🚩", onClick: args.onFlag },
    { divider: true },
    { label: args.issue.archived ? "Unarchive" : "Archive", onClick: args.onArchive },
    { label: "Delete permanently", icon: "🗑", onClick: args.onDelete, destructive: true },
  ];
}
```

- **One builder per entity type:** `buildIssueActions`, `buildTodoActions`, `buildRockActions`, `buildHeadlineActions`. New entities (Metric, Course, Content) follow the same shape.
- **Builder takes the entity + every action callback** as a single args object. The caller (page or editor) wires the callbacks; the builder doesn't know about state.
- **Icons** come from [`reference_icon_vocabulary.md`](reference_icon_vocabulary.md). Use the canonical glyph (📋 details, ✨ AI, 🚩 flag, 🗑 delete, `LINKED_SPAWN_ICON` for spawn).
- **Dividers** group related actions (open/AI, spawn, state, destructive). 4 groups max — more is noise.
- **Destructive items** flag with `destructive: true` — `<ContextMenu>` and `<KebabMenu>` both render the item in red.

---

## 2. Inside-editor kebab filter

When the action set renders in the slide-over header (kebab menu), filter out actions that the panel body already provides:

```ts
const insideEditorFilter = (i: ContextMenuItem) =>
  i.label !== "Ask Rickety" &&        // body has <RicketyChat>
  i.label !== "Open Details";          // already in details

<KebabMenu items={ctxItems.filter(insideEditorFilter)} />
```

Why filter:
- **"Open Details"** in the kebab is a no-op — you ARE in details.
- **"Ask Rickety"** in the kebab leads to the same Rickety the panel body has built-in. Two entry points to the same surface = ambiguity.

Keep all other items (spawn, flag, archive, delete) — they're meaningful inside the editor.

**Recommended extraction:** `lib/entity-actions.ts` exports a `filterKebabItems(items)` helper so every editor uses the same filter without copy-pasting the predicate.

---

## 3. Pages and editors NEVER hand-roll action items

If a page or editor needs an entity action, it goes through the builder. Don't copy-paste a single `<ContextMenuItem>` inline.

Off-canon (DON'T do this):
```tsx
// Headlines page today — bespoke "+ To-Do" / "+ Issue" buttons in the slide-over
<button onClick={() => createTodoFromHeadline()}>+ To-Do</button>
<button onClick={() => createIssueFromHeadline()}>+ Issue</button>
```

Canon — same outcome via the action builder + stacked editor:
```tsx
const ctxItems = buildHeadlineActions({
  headline,
  onSpawn: (type) => setStackedEditor({ type, mode: "create", prefill: ... }),
  // …
});
<KebabMenu items={ctxItems.filter(insideEditorFilter)} />
```

The user discovers spawn-Todo via the same kebab path as on the row's right-click. One mental model, one entry point per surface.

---

## 4. Adding a new action

To add (e.g.) "Convert to Idea" to Issues:

1. Add the action to `buildIssueActions` with the right icon, label, and callback shape.
2. The `ContextMenu` (row right-click) picks it up automatically.
3. The kebab in the slide-over picks it up automatically (unless you also need to add it to the inside-editor filter).
4. Update [`reference_icon_vocabulary.md`](reference_icon_vocabulary.md) if you need a new icon.

Don't add it inline in one page and forget the others.

---

## 4b. Entity-specific verb rename → sibling helper, NOT generic-param expansion

When one entity needs a destructive verb that differs from the universal `Delete permanently` shape — different label, different confirm body, different permission gate, possibly different effect — **fork a sibling helper next to `deleteItem`. Do NOT add label/body/permission overrides to the generic `deleteItem`.**

Concrete example: Headlines v3 introduces **Recall** as the originator-side destructive verb (Published surfaces). Recall has:
- Different label ("Recall" not "Delete") — the entity is broadcast, not private; "Delete" misframes the act
- Different confirm body (blast-radius SEEN/UNSEEN counts, not the generic "remove + comments + activity history")
- Different permission gate (originator or admin, not team-membership)
- Same underlying transport (DELETE method on the server) — Recall is a UX wrapper, not a new server verb

The canon approach is a sibling helper:

```ts
// lib/entity-actions.ts

// Generic across Issue / Todo / Rock / Metric / etc.
export function deleteItem(entity, type, ctx): ContextMenuItem { ... }

// Headline-specific
export function recallHeadlineItem(headline, ctx): ContextMenuItem { ... }
```

`buildHeadlineActions` invokes `recallHeadlineItem` instead of `deleteItem("headline", ...)`.

### Why sibling, not generic-param expansion

The temptation: add a `{ label?, bodyOverride?, permissionGate? }` options bag to `deleteItem` so it can shape-shift. Don't.

- `deleteItem` exists to **protect** the canonical Delete shape across many entities. Adding overrides erodes that protection — once it accepts a label override, it'll accrete body overrides, then permission overrides, then per-entity confirm-copy overrides. Eventually it's not canon, just a configurable function.
- Recall is **behavior-different**, not just label-different. Its blast-radius compute, its permission gate, and its confirm shape are entity-specific. A sibling helper signals "this is the canonical Recall shape" and protects it from future drift the same way `deleteItem` protects Delete.
- Adding the override path encourages other entities to "just pass a label override" instead of asking whether their case is genuinely a new verb deserving its own helper. The branch point is the design opportunity.

### When this rule applies

Trigger: an entity needs an action whose **mental model** differs from the existing canonical action, not just its surface label. Tests:

- If renaming alone is sufficient → it might not need a sibling; rename in the builder and document why.
- If the confirm copy, permission, or effect diverges → sibling helper.
- If multiple entities would want the same NEW verb → consider promoting to a generic with a clear scope (e.g. `recallItem(entity, type, ctx)`) only after a second entity actually adopts it. Don't generalize speculatively.

### Inverse: when to extend `deleteItem` (NOT fork)

If a per-entity tweak is genuinely just a confirm-copy nuance with the same semantics (same permission, same effect, same blast radius), a small label/body override is fine. The line is **semantic difference**, not surface difference.

---

## 5. Required actions per entity (universal)

Every entity action set MUST include:

- **Open Details** (filtered out inside the editor)
- **Ask Rickety** (filtered out inside the editor)
- **Flag / Unflag** (toggles `flagged` state)
- **Archive / Unarchive** (toggles `archived` state, when entity supports archiving)
- **Delete permanently** (destructive, last)

Optional based on entity:
- **Spawn linked** (To-Do / Rock / Headline / etc. depending on what links the entity supports)
- **Convert to** (Issue → Rock promotion, Idea → Issue/Todo/Rock conversion, etc.)
- **Entity-specific** (Issues: "Detect Patterns"; Rocks: "View milestones"; etc.)

Order in the list:
1. Open / Ask (top — most common entry)
2. Spawn / Convert (sub-entity creation)
3. Flag / Unflag (state attribute)
4. Archive / Delete (state lifecycle, destructive last)

Dividers between groups.

---

## 6. Metric action parity (v0.6.0)

Every entity-type action builder MUST expose the **Flag-on-Attention + the `+ Linked To-Do/Issue/Headline` spawn cluster** unless the entity has a *documented* reason to lack them. `buildMetricActions` was historically lean (Open / Ask Rickety / Archive / Delete) while the sibling builders all carried flag + spawn — that asymmetry is drift, not design. Metrics get parity. Documented carve-outs only (e.g. captures retire their parent on flip — a different lifecycle). (Punchlist #891.)

## 7. Per-surface action filtering (v0.6.0)

The canonical builder output is FILTERED per surface — one source of truth, each surface subtracts what doesn't belong:

- **Inside-editor kebab** drops `Open Details` + `Ask Rickety` (§2, established).
- **Watch surfaces** (dashboard rows — My Radar Attention / Breaking News / Numbers to Watch / Mini-Games, and My Work cards) drop **`Archive` + `Delete`**. The dashboard is a *view of* entities, not the entity-owning surface; structural/destructive mutation belongs on the owning page (/todos, /issues, /rocks, /scorecard, /headlines). **Kept on watch surfaces:** Open Details · Ask Rickety · Flag/Unflag · spawn cluster · in-place status toggles (Mark Resolved, Mark Complete) — navigate + triage actions. **Exception — captures:** My Radar IS the capture's owning surface, so `Archive` (= dismiss the triage item) stays on `buildCaptureActions`. (Punchlist #898.)

Both are instances of one pattern: **canonical builder → per-surface filter** (e.g. `withoutWatchSurfaceActions(items)`), never a per-surface hand-rolled action list.

---

## See also

- [`reference_icon_vocabulary.md`](reference_icon_vocabulary.md) — canonical glyphs for action icons.
- [`reference_stacked_editor_pattern.md`](reference_stacked_editor_pattern.md) — what spawn callbacks do (open inner editor, defer DB write).
- [`reference_shared_components.md`](reference_shared_components.md) — ContextMenu + KebabMenu primitives.
- [`reference_confirm_dialog.md`](reference_confirm_dialog.md) — Delete permanently goes through `confirmDestructive`.
