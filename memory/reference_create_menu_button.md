---
name: Create menu button (split button + sibling dropdown)
description: Tier-1 canon for the brand-blue split-button used wherever the primary CTA can create more than one entity (multi-entity hubs) OR more than one sub-type of an entity. Left half is the primary "+ Add {Type}" action, right half is a chevron that opens a dropdown with sibling types. Reference impl is OS components/CreateMenuButton.tsx — extended in v0.3.6 to cover single-entity-with-real-sub-types (e.g. Playbook /content with 6 content types).
type: reference
---

# Create menu button — split button + sibling dropdown

When a list page can create **more than one type** of thing — either multiple sibling entities (OS hub case) or multiple sub-types of one entity (Playbook /content case) — the Band 1 primary CTA is a **split button**: brand-blue with a primary "+ Add {Type}" action on the left + a chevron on the right that opens a dropdown of the other types.

Reference implementation: [`components/CreateMenuButton.tsx`](../components/CreateMenuButton.tsx) in OS. Copy-paste-and-adapt per the @intrust/canon guidance-only model.

> **When to use** (the "fundamentally differ" test):
> - **Multi-entity hub** — page creates more than one entity (e.g. a dashboard that creates Issues / Todos / Rocks). Always use the split button.
> - **Single entity with sub-types that fundamentally differ at create-time** — sub-type changes the form fields meaningfully (different required fields, different layout, different downstream behavior). Examples: Playbook Content (Core Process / Process / Procedure / Guide / Policy / Standard / Reference). Use the split button.
> - **Single entity with shared fields, sub-type as a property** — sub-type is just a select field with default. DO NOT use the split button; use a single brand-blue `+ Add <Entity>` opening a slide-over with the sub-type select inside. Example: Issues (which have a Type field but all share the same form).
>
> Test: "if the user changed sub-type mid-create, would they re-fill most fields?" If yes → split button. If no → single slide-over.

---

## 1. Visual shape — locked

```tsx
<div className="inline-flex items-stretch rounded-lg overflow-hidden" style={{ backgroundColor: "#0069AA" }}>
  {/* Primary action (left half) */}
  <button
    onClick={onPrimary}
    className="px-4 py-2 text-white text-sm font-medium hover:bg-black/10"
  >
    + Add {LABELS[primaryType]}
  </button>

  {/* Vertical divider */}
  <div className="w-px bg-white/30" />

  {/* Chevron (right half) */}
  <Tooltip text="Create another type">
    <button
      onClick={() => setOpen(v => !v)}
      className="px-2 text-white hover:bg-black/10 flex items-center justify-center"
      aria-label="Create another type"
    >
      <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
  </Tooltip>
</div>
```

Locked details:
- **Container:** `inline-flex items-stretch rounded-lg overflow-hidden` + inline `backgroundColor: #0069AA` (brand-blue). The `overflow-hidden` keeps the divider clean against rounded corners.
- **Primary button:** `px-4 py-2 text-white text-sm font-medium hover:bg-black/10`. Same dimensions as a standalone `+ Add` button — splitting doesn't shrink it.
- **Divider:** `w-px bg-white/30` between the two halves. Visually splits the button without drawing a hard line.
- **Chevron button:** `px-2 text-white hover:bg-black/10 flex items-center justify-center`. Narrow target; the icon does the work.
- **Chevron icon:** Lucide `ChevronDown` (or equivalent) at `w-3 h-3`, rotates `180deg` when open via `rotate-180` class.
- **Hover treatment:** both halves use `hover:bg-black/10` — a subtle darken without changing the brand-blue base.

---

## 2. Dropdown shape — locked

```tsx
{open && (
  <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg z-40 p-1.5 min-w-[160px]">
    <div className="text-[10px] font-semibold text-gray-500 uppercase px-2 py-1">
      Create any
    </div>
    {others.map((t) => (
      <button
        key={t}
        onClick={() => pick(t)}
        className="w-full text-left px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-50"
      >
        + {LABELS[t]}
      </button>
    ))}
  </div>
)}
```

Locked details:
- **Container:** `absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg z-40 p-1.5 min-w-[160px]`. Aligned to the right edge of the split button. `z-40` lifts above filter chip wraps and column headers but stays below the slide-over scrim.
- **Heading:** `text-[10px] font-semibold text-gray-500 uppercase px-2 py-1`, label "Create any" (multi-entity) or "Create another type" (single-entity-with-sub-types). Pick the right verb for the surface.
- **Each row:** `w-full text-left px-2 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-50`. Plain text rows with `+` prefix matching the primary button.
- **Items rendered:** all OTHER types (the primary type doesn't appear in the dropdown — it's already the left-half button). For a 6-sub-type Playbook Content menu with primary = Process: the dropdown shows the 5 others.

**Close behavior:**
- Click outside.
- Escape key.
- Picking a row.
- Chevron click toggle.

---

## 3. Picking a type

Each dropdown row click does ONE of:

**(a) Open the picked type's slide-over editor IN PLACE** (preferred). The page passes `onCreateOther(type, prefill?)`. The page is responsible for managing its own `<EntitySpawnStack>` or equivalent slide-over mount, so picking a different type doesn't navigate away — the user stays on the page they were on.

```tsx
function pick(target: CreateEntityType) {
  setOpen(false);
  onCreateOther(target, {
    title: prefillTitle,
    description: prefillDescription,
  });
}
```

**(b) Navigate to the picked type's page with `?new=1`** (legacy fallback). When the page hasn't wired `onCreateOther`, the picker calls `router.push(`${PATHS[target]}?new=1&title=...`)`. The destination page reads the params and opens its create slide-over.

OS uses (a) where possible — keeps the user on /issues even if they spawn a To-Do. Use (b) only for callsites that don't yet mount the spawn stack.

For Playbook single-entity-with-sub-types (Content), there's only one page — `/content` — so (a) is the only path. The sub-type picker just sets the type field on the create slide-over.

---

## 4. Prefill behavior

Both halves accept optional prefill that flows into the slide-over editor:

```tsx
<CreateMenuButton
  primaryType="content"
  primarySubType="process"
  onPrimary={() => openCreate({ type: "process" })}
  prefillTitle={selectedText}              // e.g. text user highlighted before clicking
  prefillDescription={selectedDescription}
  onCreateOther={(subType, prefill) => openCreate({ type: subType, ...prefill })}
/>
```

Prefill is passed through verbatim. The receiving slide-over decides how to use it.

---

## 5. Mid-create type switch

When the user opens a slide-over for type X and decides mid-form they want type Y, the slide-over should expose a small type-switcher (component: `CreateTypeSwitcher.tsx` in OS) that calls `onCreateOther(newType, currentDraftPrefill)`. The current draft (title + description) carries forward; type-specific fields reset.

This is the same `onCreateOther` callback the dropdown uses — one entry point for "switch what's being created."

---

## 6. When NOT to use a split button

- **Single entity, single create flow.** Don't add a chevron just to make the button look fancy. Plain `+ Add <Entity>` is the canon for that case.
- **Sub-types that share most fields.** Use a single slide-over with a sub-type `<select>` field. The chevron + dropdown is overhead for cases where the user could change sub-type mid-form without restarting.
- **More than ~6 dropdown options.** At that size the dropdown becomes noisy. Consider a different surface (e.g. a SearchablePicker) or splitting the entity into separate pages with their own buttons.

---

## 7. Wiring checklist

1. Identify the primary type — usually the most common create case for the page.
2. Wrap the brand-blue button as a split button per §1.
3. Implement the dropdown per §2 (heading + rows for OTHER types).
4. Implement `onPrimary` (clicks the left half) and `onCreateOther` (clicks a dropdown row) — both should land in your slide-over mount.
5. Pass prefill through both paths if any text is selected / any draft exists.
6. If the slide-over needs a mid-create type switch, mount `CreateTypeSwitcher` (or equivalent) inside it.
7. Verify the dropdown closes on click-outside, Escape, and after picking.

---

## Why this is canon

Without a single primitive for "create one of N things," every consumer rebuilds the split-button geometry differently — different brand-blue shades, different chevron sizes, different dropdown alignments, different close-behaviors. With one primitive: every Add-button-with-options reads the same across every Intrust app. Users learn the affordance once.

Pair with:
- [`reference_panel_vs_modal.md`](reference_panel_vs_modal.md) — entity create lands in a slide-over after the type is picked (NEVER a modal-as-gate).
- [`reference_list_standards.md`](reference_list_standards.md) — Band 1 action cluster places this button rightmost.
- [`reference_color_palette.md`](reference_color_palette.md) — brand-blue `#0069AA` is the action zone color (universal across Intrust apps).
