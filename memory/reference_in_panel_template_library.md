---
name: In-panel template library
description: Surfacing a template / stub catalog inside an entity-creation SlideOverPanel. Inline-expand button at the top of the panel body, NOT a pre-flight Modal. Mirrors the existing "Pick from CEO KPI Templates" pattern in MeasurablePanel.tsx.
type: reference
---

# In-panel template library

When an entity-creation surface has a library of templates / stubs / prefabs to pick from, the picker lives **inside** the SlideOverPanel as an inline-expandable section at the top of the panel body. It does NOT live in a Modal in front of the panel.

> **Rationale:** per [`reference_panel_vs_modal.md`](reference_panel_vs_modal.md), entity creation = SlideOverPanel; Modals are for short focused decisions. A template-picker Modal in front of an entity-create panel adds a click for the most-common path (blank-from-scratch) and turns single creation into a two-step gate.

**Canonical implementation:** `components/MeasurablePanel.tsx` lines 319–388 — the existing **"Pick from CEO KPI Templates"** flow. New template families (Halo Portfolio stubs, future GGOB-linked templates) match this exact shape.

---

## 1. Trigger — brand-blue rounded button at the top of the panel body

```tsx
{!metric.id && !isLibrary && (
  <div>
    <button
      onClick={() => setShowTemplates(!showTemplates)}
      className="text-xs font-medium text-[#0069AA] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
    >
      {showTemplates ? "Hide Templates" : "Pick from CEO KPI Templates"}
    </button>
    {showTemplates && (
      <div className="mt-2 border border-blue-200 rounded-lg bg-blue-50/50 p-3">
        {/* …expanded section… */}
      </div>
    )}
  </div>
)}
```

- **Visible only on create** (`!entity.id`). Never on edit — the entity already exists; the template choice was made at creation time.
- **Gated by context disqualifiers.** Existing example: `!isLibrary` on MeasurablePanel (library-source metrics don't pick from templates). Each library family adds its own gate as appropriate.
- **Label toggles between expand/collapse states:** `Pick from {Library Name}` / `Hide Templates`. NOT a chevron suffix — the verb in the label changes.
- **Class string is locked:** `text-xs font-medium text-[#0069AA] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors`.

---

## 2. Expanded section — inline below the trigger

```tsx
<div className="mt-2 border border-blue-200 rounded-lg bg-blue-50/50 p-3">
  {/* Search + category chips on ONE row */}
  <div className="flex items-center gap-2 mb-2">
    <input
      className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
      placeholder="Search templates..."
      value={templateFilter}
      onChange={(e) => setTemplateFilter(e.target.value)}
    />
    <div className="flex gap-1 flex-wrap">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => setTemplateFilter(templateFilter === cat ? "" : cat)}
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
            templateFilter === cat ? "bg-blue-200 text-blue-800" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  </div>

  {/* Scrollable list */}
  <div className="space-y-1 max-h-48 overflow-y-auto">
    {filtered.map((t) => (
      <button
        key={t.key}
        onClick={() => applyTemplate(t)}
        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white border border-transparent hover:border-blue-200 transition-all group"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-800 group-hover:text-[#0069AA]">{t.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">{t.category}</span>
        </div>
        <p className="text-[10px] text-gray-500 mt-0.5">{t.description}</p>
      </button>
    ))}
  </div>
</div>
```

Locked details:
- **Container:** `mt-2 border border-blue-200 rounded-lg bg-blue-50/50 p-3`. The `mt-2` is the gap below the trigger.
- **Search + chips on ONE flex row** (`flex items-center gap-2 mb-2`), search `flex-1`, chips `flex gap-1 flex-wrap` to its right. NOT stacked vertically.
- **Search input:** `flex-1 border border-gray-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-300`.
- **Category chips:** `text-[10px] px-2 py-0.5 rounded-full font-medium`. Active = `bg-blue-200 text-blue-800`. Inactive = `bg-gray-100 text-gray-500 hover:bg-gray-200`. Click toggles (active chip becomes filter; clicking again clears).
- **List container:** `space-y-1 max-h-48 overflow-y-auto`.
- **Each row:** `w-full text-left px-3 py-2 rounded-lg hover:bg-white border border-transparent hover:border-blue-200 transition-all group`. Hover lifts: bg → white, border → blue-200. The whole row is a button.
- **Row layout:** title + tag in one `flex items-center justify-between`; description on its own line below (`text-[10px] text-gray-500 mt-0.5`). NOT a single 3-column flex.
- **Tag pill:** `text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500`. The category, unit, or whatever the right-aligned label is — always a small gray pill.
- **Title:** `text-xs font-medium text-gray-800 group-hover:text-[#0069AA]` — title color shifts to brand-blue on row hover via the group class.

**Click action:** fills the form fields below AND collapses the section AND clears the filter (`setShowTemplates(false); setTemplateFilter("");`). User sees the form populated; can adjust if applicable.

---

## Two valid library types — DIFFERENT post-pick surfaces (v0.3.7)

The trigger button + inline-expand row list is identical between library types. **What happens after a row click is NOT.** Two distinct mental models, two distinct rendered surfaces:

### Type A — Suggestion library (e.g. CEO KPI Templates)

The library is a **shortcut to a manual entry.** The user is creating a free-form metric; the template just saves typing.

- Row click **fills the full entity form** with template values.
- All fields stay **editable** — the user can rename, change unit, change period.
- The slide-over panel continues to show the full create form.
- A free-form metric can be created any number of times from the same template (no "All added" semantics).
- **Examples:** "MRR Growth %", "CSAT Score", "Sales Pipeline Velocity" — generic CEO/exec suggestions.

### Type B — Programmed picker (e.g. Halo Portfolio Library)

The library is a **catalog of system-managed slots.** The user is *instantiating a programmed slot*, not filling out a form. The metric IS the catalog entry; the user just picks which subject/owner to attach.

- Row click **transforms the panel content** to a minimal slot-instantiation form. **The full create form is replaced**, not gray-locked.
- The minimal form shows ONLY user-chosen fields:
  - Slot summary at the top (slot name + description + agreement-type tag, presented as informational text — not as input fields).
  - Owner select (required).
  - Subject select (required — typically a `<SearchablePicker>` for CSM/AE unum).
  - Group select (optional, where on the scorecard).
  - Goal input (optional, target value).
- Submit button is labeled with what's about to happen — e.g. `Add Trevor Phipps' MRR to scorecard`.
- **Each programmed slot can be instantiated AT MOST ONCE per (subject, owner) pair.** Already-instantiated rows in the picker show an `All added` tag (or similar) and can't be re-picked. This is a key differentiator from Type A.
- **No lock chip, no gray-50 fields, no full form with most things uneditable.** The visual model is "you picked a programmed slot; tell us who/where; done." Lock-chip pattern in [`reference_locked_system_metric.md`](reference_locked_system_metric.md) applies ONLY to **editing an existing programmed metric** (post-create, e.g. via the row's right-click → Edit), not the create flow.
- **Examples:** Halo Portfolio CC-MRR per CSM, EC-Block-Drain per AE.

### Why the split

Putting both library types into one form-with-grayed-locks pattern creates friction for the programmed case:
- The locked fields look broken (why are these grayed out?).
- The lock chip explains why, but the user wasn't trying to fill those fields — the field rendering is wasted ink.
- Mental model collision: "am I creating a metric, or selecting a programmed slot?"

Splitting them respects the different intents:
- Type A: "I want to create a metric. Suggest me one." → form-fill.
- Type B: "I want to attach a programmed metric. Pick which one." → slot-instantiation.

### Catalog content separation

Type A and Type B have **different catalog sources**, never mixed:
- Type A library content = generic suggestions (e.g. exec-curated KPI templates). User-editable in catalog files.
- Type B library content = programmed slots tied to real data sources (Halo, GGOB, etc.) with `autoSource` defined.

If a row in a Type A library shows an agreement-type tag like "CompleteCare" or has an "All added" indicator, the catalog content is in the wrong library — that's a data bug, not a canon question.

---

## Multiple libraries in one panel

When an entity has multiple template families (e.g. KPI Templates + Halo Portfolio Stubs + future GGOB-Linked Templates), they appear as **sibling buttons** at the top of the panel body, each with its own expand section.

```tsx
{/* Stack siblings — one per library family */}
<div className="space-y-2">
  {!isLibrary && <PickFromKpiTemplatesButton />}
  {showHaloStubs && <PickFromHaloPortfolioButton />}
  {/* future: <PickFromGgobLinkedButton /> */}
</div>
```

Each button:
- Same brand-blue pill style (locked above).
- Different `Library Name` in the label.
- Independent expand state. Most flows want "one open at a time" — collapse others when one opens — but it's not strictly required.

**Don't** put a free-form-vs-template **gate on the create button** itself (e.g. a dropdown on `+ Add Metric` asking "blank or template?"). It adds a click for the most common path (blank). The library picker discovers itself when the panel is open.

---

## What NOT to do

- **Don't** add a pre-flight Modal in front of the SlideOverPanel asking "what kind?" before opening the panel. The panel handles all entity creation; the picker is one section inside it.
- **Don't** repurpose `<SearchablePicker>` as the trigger. SearchablePicker is for "pick one from many to fill a single form slot" (e.g. metric formula refs). The in-panel template library is a richer surface (search + category chips + name + description + tag) that lives at panel-top, not field-level.
- **Don't** put the picker after the form fields. It belongs at the top so the user can prefill before deciding what to type.
- **Don't** make the trigger a default-expanded section. Most creation is blank — the expanded picker is friction for that path.
- **Don't** stack search + chips vertically. They share a row.
- **Don't** style the chevron-suffix toggle. The label changes ("Pick from…" / "Hide Templates").

---

## See also

- [`reference_panel_vs_modal.md`](reference_panel_vs_modal.md) — the foundational decision (entity create = SlideOverPanel).
- [`reference_searchable_picker.md`](reference_searchable_picker.md) — single-slot "pick from many" primitive (different surface).
- `reference_locked_system_metric.md` — the lock behavior used by sub-shape B (tier-2 OS canon today; promote when a second app needs it).
