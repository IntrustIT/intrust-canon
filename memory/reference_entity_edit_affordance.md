---
name: Entity edit affordance
description: Click an entity's NAME to open its editor — never a pencil/edit icon. Right-click also opens an Edit option. Container entities (groups) split chevron (collapse) from name (edit).
type: reference
originSessionId: b095f94d-f4ef-46ab-bc70-04307a493041
---
# Entity edit affordance — canon

**Click an entity's NAME to open its editor.** Pencil / edit icons are not used anywhere in the app. Right-click on the row also surfaces "Edit" (and other relevant actions) via the canonical context menu.

## What this means in practice

| Surface | Click target → opens |
|---|---|
| Metric row name | `MeasurablePanel` |
| Issue / Todo / Rock / Headline row name | corresponding DetailEditor |
| Group header name (scorecard) | `GroupEditorPanel` |

For container entities (today: only scorecard groups) the row has multiple controls. The canon split:

| Control | Behavior |
|---|---|
| ⠿ drag handle | drag-reorder per `reference_drag_reorder.md` |
| ▾/▸ chevron | toggle collapse only — NO other behavior |
| **Group name text** | **click → opens editor** |
| Right-click anywhere on row | context menu (Edit, Toggle collapse, Delete) |

## Why no pencil

1. **Consistency.** Every other entity opens its editor by clicking the name. Adding a pencil for one entity type breaks the mental model.
2. **Doesn't scale.** If pencils were canon, every list row across the app would need one. They aren't there today and the app is fine — adding ~150 pencils across rocks/issues/todos/headlines/metrics is a much larger consistency cost than killing one.
3. **Discoverability stays good.** Group names are bold + uppercase + tracking-wide today — visually obviously clickable. Tooltip on hover ("Open group editor") confirms. Right-click also discoverable for power users.

## Canon scope

This rule covers any UI that lets a user open an editor for an existing entity. It does NOT cover:
- Inline editors (cell-edit on scorecard, status-pill flip) — those are direct manipulation, not "open the editor."
- Slide-over → slide-over stacking (LinkedItems → child editor) — child opens via row click, same canon.
- Quick-add affordances (`+ Add` buttons in section headers per `reference_section_header_add_affordance.md`) — those are CREATE, not edit.

## Established

Session 57 (2026-05-05) — group editor on /scorecard. Pencil killed in favor of click-name-to-edit + right-click context menu (Edit / Toggle collapse). Canon written same session.
