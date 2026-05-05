---
name: Icon vocabulary (Lucide React)
description: Canonical Lucide icon set for entities, actions, and special-purpose surfaces. Don't introduce new icons without checking this catalog. All icons need tooltip/aria — no decorative icons.
type: reference
originSessionId: c9b17cee-f5ec-4aac-9894-14aeaf8a54b7
---
# Icon vocabulary canon (Lucide React)

App-wide icon library: **`lucide-react`** (installed session 47). All icons render via `<IconName className="w-4 h-4" />` from `lucide-react`. **Do not use emoji** for entity / action / status icons — they were retired session 47.

Two icon families:

1. **Per-entity icons** — what kind of thing this row is. Fixed per entity across all surfaces.
2. **Per-action icons** — what verb a menu item performs. Stable across menus.

Plus **special-purpose icons** for unique affordances (AI sparkle, attention flag).

## Per-entity icons

Each entity has ONE canonical Lucide icon. Used in: list-row Type badge, KebabMenu items, ContextMenu items, spawn buttons, EntitySpawnStack lookups.

| Entity | Lucide name | Notes |
|---|---|---|
| **Issue (Short-Term)** | `Clock` | Tactical, immediate. Per `reference_issue_type_spectrum.md`. |
| **Issue (Stractical)** | `Zap` | Quick action with strategic weight. |
| **Issue (Long-Term)** | `Telescope` | Far-sighted, strategic horizon. |
| **Issue (generic)** | `AlertTriangle` | Used in AI / cross-context where Type isn't known. |
| **To-Do** | `CheckCircle2` | Completion semantics. Also reused for the "Mark Complete" + "Mark Resolved" actions. |
| **Rock** | `Mountain` | Quarterly-priority weight. |
| **Headline (Win)** | `Trophy` | Per headline tone canon. |
| **Headline (FYI)** | `Megaphone` | Same canon. |
| **Milestone** | (parent rock's `Mountain` + teal stripe) | If a row-level glyph is needed, prefer the rock as parent indicator. |

**Rule:** when an entity icon is shown anywhere, the same Lucide name applies. Don't reach for a synonym.

## Per-action icons (menu items)

Used in `lib/entity-actions.tsx` `buildXActions` + KebabMenu lists. Apply per menu item:

| Action | Lucide name |
|---|---|
| Open Details | `FileText` |
| Ask Rickety | `Sparkles` (same glyph as `<AIButton>`) |
| Flag on Attention / Pin | `Flag` |
| Add to next SOI | `Calendar` |
| Mark Complete (todo) | `CheckCircle2` |
| Mark Incomplete (todo) | `Undo2` |
| Mark Resolved (issue) | `CheckCircle2` |
| Reopen | `Undo2` |
| Make Short-Term | `Clock` |
| Make Stractical | `Zap` |
| Make Long-Term | `Telescope` |
| Route to Team… | `Shuffle` |
| Archive | `Archive` (or existing `<ArchiveIcon />` SVG component from `StatusPicker.tsx`) |
| Delete permanently | `Trash2` |

**Spawn slate** (the "+ Linked X" row at the bottom of every entity menu) uses entity icons via `LINKED_SPAWN_ICON` exported from `lib/entity-actions.tsx`:

| Spawn label | Lucide name |
|---|---|
| `+ Linked To-Do` | `CheckCircle2` |
| `+ Linked Issue` | `AlertTriangle` |
| `+ Linked Rock` | `Mountain` |
| `+ Linked Headline` | `Megaphone` |

Import as: `import { LINKED_SPAWN_ICON, LINKED_SPAWN_LABEL } from "@/lib/entity-actions"` — single source of truth.

## Special-purpose icons

| Affordance | Source | Notes |
|---|---|---|
| AI action button | `<AIButton>` component | Uses an inline SVG sparkle (predates Lucide migration). When the AIButton refactor lands, switch to Lucide `Sparkles`. |
| Save indicator | `CheckIcon` from `StatusPicker.tsx` | (predates Lucide; consider migrating to `Check` from Lucide) |
| Spawn-origin marker | `*` orange asterisk | `LinkedItemsSection` — denotes "this item was spawned from the parent" |
| Lock (private) | inline SVG padlock | Anywhere visibility=private |

## Sizing

- Default: `className="w-4 h-4"` for menu/chip icons (16px)
- Type badges: `className="w-3 h-3"` for the small inline badges (12px)
- Editor headers: `className="w-5 h-5"` for primary identification slots (20px)

Always pair with `currentColor` (Lucide default) so the icon inherits text color from the parent (e.g. red trash icon inside a red-text danger menu item).

## Rules

### One Lucide icon per concept

- `Clock` / `Zap` / `Telescope` are reserved for issue Type — don't use `Clock` as "stopwatch" for unrelated semantics.
- `CheckCircle2` overloads "complete" + "todo" (the entity IS the action). Don't reuse it for "approved" or "yes."
- `Sparkles` is reserved for AI affordances.
- `Mountain` is reserved for Rock semantics.

### Icons need tooltips

Every icon-only button needs a tooltip (per `reference_shared_components.md` Tooltip subsection). Decorative icons are off-canon. Even when context "obviously" explains the icon — tooltip it.

### Import from lucide-react, not emoji

Before adding any icon:
1. Search lucide.dev for the concept
2. Check this doc for an existing canonical name
3. Use `import { IconName } from "lucide-react"` and render `<IconName className="w-4 h-4" />`
4. If the icon doesn't exist in Lucide, ASK before introducing a custom SVG (per `feedback_canon_strictness.md`)

### Don't mix emoji + Lucide in the same surface

If a surface has any Lucide icons, all icons in that surface should be Lucide. No "this row uses ✨ but this one uses Sparkles" — the asymmetry reads as broken.

## Migration status

Migrated session 47 (Lucide install + sweep):
- ✅ `lib/entity-actions.tsx` (renamed from `.ts` to allow JSX) — full menu vocabulary on Lucide
- ✅ `components/IssueDetailEditor.tsx` — Type badge (Clock/Zap/Telescope)
- ✅ `components/RockDetailEditor.tsx` — milestone context menu
- ✅ `components/HeadlineAddPanel.tsx` — Win/FYI buttons (Trophy/Megaphone)
- ✅ `app/headlines/page.tsx` — Win/FYI buttons + row tone glyph
- ✅ `components/AICompanion.tsx` — full ACTION_TYPE_META map
- ✅ `components/ContextMenu.tsx` + `KebabMenu.tsx` — icon prop typed as `ReactNode`

Remaining (low-priority sweep — punchlist target):
- `<AIButton>` inline sparkle SVG → Lucide `Sparkles`
- `StatusPicker.tsx` ArchiveIcon/TrashIcon/CheckIcon SVGs → Lucide equivalents
- Any straggler emoji in seldom-touched surfaces (audit on next entity sweep)

## What NOT to do

- Don't import a different icon library. Lucide is the single source.
- Don't render emoji for entity / action / status icons. Migration is in progress; don't add new emoji while we sweep the strays.
- Don't use Lucide for status PILLS (those use text + colored bg per `reference_status_pills.md` once that lands; status pills get NO icon by default).
- Don't decorate buttons with icons that don't carry meaning. Empty states + helper text get NO icon unless the icon communicates an entity.
- Don't change icon sizes ad hoc. Stick to w-4 h-4 (default), w-3 h-3 (small badges), w-5 h-5 (editor headers).

## Related canon

- `reference_issue_type_spectrum.md` — Issue Type icons (Clock/Zap/Telescope) + their semantic spectrum
- `reference_ai_button.md` — AI sparkle (will move to Lucide `Sparkles` on next AIButton refactor)
- `reference_shared_components.md` — Tooltip canon (every icon needs one)
- `feedback_canonical_role_labels.md` — role labels (often paired with entity icons)
