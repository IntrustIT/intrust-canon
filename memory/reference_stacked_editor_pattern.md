---
name: Stacked editor pattern
description: How an entity slide-over editor opens ANOTHER entity's editor on top of itself for spawn-follow-up flows. Stacking is canon — never window.open or router.push for spawn. Includes the canonical spawn-prefill body format (separator + "Original X" header + metadata).
type: reference
---

# Stacked editor pattern

When the user is editing entity X and clicks an action that creates a related entity Y (e.g. "Spawn To-Do from this Issue", "Add a Milestone to this Rock", "Promote this Issue to a Headline"), the new editor opens **stacked on top** of the current editor. NOT a navigate, NOT a new tab.

This pattern is universal across every entity detail editor in OS. Reference impls: `IssueDetailEditor.tsx:303-310`, `TodoDetailEditor.tsx:199-206`, `RockDetailEditor.tsx`. Headlines currently uses `window.open` instead — **off-canon.**

---

## 1. Mechanics

```tsx
// In the parent editor (e.g. IssueDetailEditor.tsx):
const [stackedEditor, setStackedEditor] = useState<{
  type: "issue" | "todo" | "rock" | "headline";
  mode: "create" | "edit";
  prefill?: { title?: string; description?: string; parentType?: string; parentId?: string };
} | null>(null);

// Dynamic-imported lazy editor for each spawnable type — breaks the circular dep
const TodoEditor = dynamic(() => import("./TodoDetailEditor"), { ssr: false });
const RockEditor = dynamic(() => import("./RockDetailEditor"), { ssr: false });

// On spawn action:
function spawnTodo() {
  setStackedEditor({
    type: "todo",
    mode: "create",
    prefill: {
      title: `Follow up on: ${issue.title}`,
      description: buildSpawnContext("issue", issue),
      parentType: "issue",
      parentId: issue.id,
    },
  });
}

// In render:
{stackedEditor?.type === "todo" && (
  <TodoEditor
    open={true}
    mode={stackedEditor.mode}
    initialPrefill={stackedEditor.prefill}
    onClose={() => {
      setStackedEditor(null);
      window.dispatchEvent(new Event("entity-links-changed"));
    }}
  />
)}
```

Locked rules:
- **Use `dynamic(() => import(...), { ssr: false })`** to import the inner editor. Without it, IssueEditor → TodoEditor → IssueEditor circular imports break the build.
- **DB write is deferred to the inner editor's Save.** Cancel leaves no orphan. The parent editor doesn't pre-create the linked entity.
- **On both close paths (Save AND Cancel)**, fire `window.dispatchEvent(new Event("entity-links-changed"))`. Every open `<LinkedItemsSection>` reloads its data on this event so links appear immediately without a manual refresh.
- **The parent editor stays mounted underneath.** Its state is preserved. Closing the inner editor returns the user to exactly where they were.

---

## 2. Spawn-prefill body format — locked

Every spawn-follow-up uses this **identical** body-prefill format. Three newlines, separator line, "Original X" header (em-dashes both sides), metadata lines, blank line. The user types ABOVE the line; context lives BELOW.

```ts
// lib/spawn-prefill.ts (recommended extraction — currently inlined)
export function buildSpawnContext(parentType: string, parent: Entity): string {
  const sep = "─".repeat(15);
  const lines = [
    "",
    "",
    "",
    sep,
    `— Original ${capitalize(parentType)} —`,
    `Title: ${parent.title}`,
    parent.owner ? `Owner: ${parent.owner.name}` : "",
    parent.priority ? `Priority: ${PRIORITY_LABELS[parent.priority]}` : "",
    parent.dueDate ? `Due: ${formatDueDate(parent.dueDate)}` : "",
    "",
    parent.description || "",
  ].filter(Boolean);
  return lines.join("\n");
}
```

- **Separator:** exactly 15 box-drawing characters `───────────────`. Not hyphens, not em-dashes.
- **Header:** `— Original {Type} —` with em-dashes (`—`, U+2014) both sides. Type is capitalized.
- **Metadata lines:** `Field: value` pairs, only present when set. Skip blanks.
- **User-typed content goes ABOVE the separator.** The cursor lands at the top of the textarea so the user types into a blank space.

This is the same visual marker as `<AISuggestField>`'s "Original below" separator (per [`reference_ai_use.md`](reference_ai_use.md) Pattern B) — same line, different label. Both establish "below this line is reference material, above is current work."

---

## 3. When to use stacking vs navigate

**Stack** (this canon) — when the spawned entity is logically a *follow-up to the current work* and the user wants to keep one foot in the parent context:
- Spawn To-Do from Issue ("I need to remember to do X about this issue")
- Promote Issue to Rock ("this is a quarterly thing, not a weekly thing")
- Add Milestone to Rock (it's a sub-entity)
- Convert Idea to Issue/Todo/Rock from Idea Pipeline

**Navigate** — when the user is genuinely done with the current view:
- Click a row in a list page
- Click a search result
- Follow a link in a chat message

If you're not sure, default to stacking — closing a stacked editor is one Esc; navigating away and finding your spot again is many clicks.

---

## 4. Stacking depth limit

**Stack at most 2 deep** in practice. Issue → Todo (one stack) is fine. Issue → Todo → Rock (two stacks) is the absolute ceiling. Any deeper and the user loses the visual stack metaphor; better to navigate at that point.

UI cue: each stacked panel sits slightly inset from the one underneath (canonical SlideOverPanel handles this automatically via z-index). The user sees the parent panel's right edge.

---

## 5. Off-canon behaviors to fix

- **Headlines** spawn-follow-up uses `window.open` (opens a new browser tab). Off-canon. Should use stacking like every other entity. Currently in `app/headlines/page.tsx:879-921`.
- **Idea Pipeline** writes the spawned entity immediately and emits a toast with a link instead of stacking. Documented exception — Idea is a lightweight surface and the spawn is the conversion.

---

## See also

- [`reference_panel_vs_modal.md`](reference_panel_vs_modal.md) — entity create + edit = SlideOverPanel.
- [`reference_shared_components.md`](reference_shared_components.md) — LinkedItemsSection (renders linked entities in the parent editor).
- [`reference_ai_use.md`](reference_ai_use.md) — Pattern B "Original below" separator (same visual convention).
