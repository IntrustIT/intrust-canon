---
name: Panel body tabs
description: When tabs in a slide-over body are canon (workflow phases or sub-entity surfaces) vs anti-pattern (form-chunking that hides fields). The test — name what each tab is FOR, not what fields it contains. Locked tab style (pill-on-gray container, brand-blue active).
type: reference
---

# Panel body tabs

A slide-over editor body MAY contain tabs that switch the panel content — but only when each tab maps to a **distinct workflow phase** OR a **distinct sub-entity list**. Tabs that just chunk one form to hide complexity are anti-canon.

Reference impl: `RockDetailEditor.tsx` (Details / Planning / Health / Milestones).

---

## 1. The test

Name what each tab is FOR — not what fields it contains. If the answers describe **distinct user concerns at distinct times**, tabs are canon. If the answers describe **the same form, organized**, tabs are anti-pattern.

**Rock passes** (workflow phases):
- *Details* = "I'm setting this up."
- *Planning* = "I'm thinking through how to execute."
- *Health* = "I'm tracking progress."
- *Milestones* = "I'm managing the milestone list."

Four real concerns, four real tabs.

**Issue's IDS workflow passes** (workflow phases):
- *Identify* = "What's the issue?"
- *Discuss* = "Open the conversation."
- *Solve* = "Pick a resolution."

**Todo's Action Plan passes** (workflow phases):
- *Setup* = "Configure the to-do."
- *Plan* = "AI-generated execution plan."
- *Execute* = "Mark steps done."

**Failing case (anti-canon):**
- *Basic* / *Advanced* / *Notes* = "more fields, organized differently." Same form chopped into pieces. The user has to learn what's in each tab; nothing is genuinely separable.

---

## 2. The two valid tab types

### Type 1 — Workflow phases
Tabs map to **stages in the entity's lifecycle.** The user's concern shifts over time (planning → executing → reviewing). Each tab is the right surface for the current stage.

Acceptable when:
- Phases are temporally sequenced (you usually plan before tracking health).
- Each phase has a distinct set of inputs/views the others don't need.
- A user typically engages one phase at a time.

### Type 2 — Sub-entity lists
Tabs map to **lists of related entities under the parent.** Each tab is a separate collection.

Acceptable when:
- The sub-entity has its own row chrome (stripes per `reference_stripe_system.md`).
- The list could justify its own page or expandable section if not in a tab.
- Examples: a Rock's Milestones tab, a Course's Items tab, an Enrollment's Activity log tab.

---

## 3. Tab style — locked

```tsx
<div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 mb-4">
  {tabs.map((tab) => (
    <button
      key={tab.key}
      onClick={() => setActiveTab(tab.key)}
      className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
        activeTab === tab.key
          ? "bg-white shadow-sm text-gray-900"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>
```

- **Container:** `flex items-center gap-1 bg-gray-100 rounded-lg p-0.5 mb-4`. Lives at the top of the panel body, below the header but above the form/list content.
- **Tab button:** `flex-1 px-3 py-1.5 rounded-md text-xs font-medium`. Equal-width tabs that fill the container.
- **Active state:** `bg-white shadow-sm text-gray-900`. The white pill with subtle shadow lifts the active tab off the gray background.
- **Inactive state:** `text-gray-500 hover:text-gray-700`. Hover darkens the text only.
- **Width:** tabs are equal-width (`flex-1`) inside a full-width container. NEVER content-width — uneven tab widths look broken.

This is the **same pill-tab shape** used inside the View ▾ popover for Layout / Sort by / Group by (per `reference_list_standards.md` Filters row §1). One shape, two surfaces.

**Note:** This is a different tab style from the **hub-page tab bar** (per `reference_hub_page.md`), which uses underline-active on `border-b border-gray-200`. Hub-page tabs identify "what page section am I in"; panel body tabs identify "what concern am I focused on" — different surfaces, different visual weight.

---

## 3b. Lifecycle-ordered tabs — chevron separators (v0.5.0 PILOT)

> **PILOT — v0.5.0.** Pattern from /rocks editor (Details → Planning → Milestones → Execution). When a second entity adopts lifecycle-ordered tabs, strip the marker.

When editor tabs map to **sequential lifecycle stages** of an entity (planning → execution → retro, or similar), insert a small **`›` ChevronRight** glyph between adjacent tabs to signal reading order. The chevron makes the sequence visually explicit; users read left-to-right as "Stage 1, then Stage 2, then Stage 3."

```tsx
<div className="flex items-center gap-1">
  {tabs.map((tab, i) => (
    <Fragment key={tab.id}>
      {i > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
      <button className={tabClassName(tab, activeTab)}>{tab.label}</button>
    </Fragment>
  ))}
</div>
```

- Chevron color: `text-gray-300` — subtle, doesn't compete with the tabs
- Chevron size: `w-3 h-3` — matches breadcrumb chevron sizing
- Spacing: `gap-1` outer, no extra padding around the chevron

**Use ONLY for sequential lifecycle.** If tabs are parallel (Details / Comments / History — orthogonal sections of the same entity), use the standard pill-style tab bar from §3 above. Lifecycle chevrons imply order; using them on parallel sections is misleading.

---

## 4. Counts on tabs (when applicable)

For sub-entity tabs, surface a count of items in the list:

```tsx
<button>
  Milestones <span className="text-gray-400 font-normal">7</span>
</button>
```

Same inline-span pattern as `reference_list_standards.md` Count chip canon. Workflow-phase tabs typically don't have counts (phases don't have items).

---

## 5. URL persistence

Panel body tabs persist in component state, not URL. Closing and reopening the panel returns to the **first tab (Details for Rocks, Identify for Issues)**, NOT the last-active tab. Reasoning: the panel is short-lived; users open it for a specific concern and the natural starting point is the entity overview, not their last working state.

Exception: when a panel opens from a deep link or a context-specific action ("View Health" from a dashboard), the opening callsite passes `initialTab` to land on the right surface.

---

## 6. When to break OUT of tabs into separate surfaces

If a tab grows complex enough to need its own filtering / sorting / bulk actions, it's outgrown the tab pattern. Move it to:

- **A wider panel** — increase `width` on the SlideOverPanel from `w-[480px]` default to `w-[640px]` or wider, and present what was a tab inline alongside the rest.
- **A separate page** — if the sub-entity has a real life of its own (e.g. milestones become their own list page).
- **A nested slide-over** — a stacked editor (per `reference_stacked_editor_pattern.md`) for "edit this milestone" rather than embedding edit in the parent's tab.

Tabs are good for the 80% read-mostly case. The 20% deep-edit case escapes via these other surfaces.

---

## 7. Off-canon

- **"Notes" / "Activity" / "More" tabs** that just chunk a form. Use expandable sections (per `reference_in_panel_template_library.md` shape) or widen the panel.
- **A "General" tab** that's just the basic form, with everything else in tabs. The basic form should NOT be on a tab; it's the panel body's default content.
- **Tabs at the top of the panel HEADER** instead of body. Header is identity (StatusPicker, title, kebab); body is content. Tabs go in body.
- **Tabs that change the panel HEIGHT** dramatically. A 10-line tab next to a 200-line tab is jarring. Prefer roughly-equivalent tab content sizes; if very different, split into surfaces.

---

## See also

- [`reference_panel_vs_modal.md`](reference_panel_vs_modal.md) — when SlideOverPanel applies at all.
- [`reference_hub_page.md`](reference_hub_page.md) — different tab pattern for page-level navigation (border-b underline style).
- [`reference_list_standards.md`](reference_list_standards.md) — same pill-tab shape inside View ▾ popover.
- [`reference_in_panel_template_library.md`](reference_in_panel_template_library.md) — expandable sections (alternative to tabs for less-used content).
