---
name: Status pill semantics + when NOT to use a pill
description: Canon for pills as labels. Defines what pills are for (status, type, scope, category) and what they're NOT for (health, severity flags, relationships, counts). Plus the team-chip primitive + 3-tier org taxonomy. Read before adding ANY pill, badge, or status indicator.
type: reference
originSessionId: 05d84427-e41f-44b7-ae64-bcd27515f83b
---
# Status pill semantics + when NOT to use a pill

Codified session 49 (B10) after a pill audit found pills doing five different jobs across the app: status, priority, type/category, tag/flag, and scope. Some of those jobs are pill-shaped and some aren't — this canon narrows pill to its sweet spot and points the others at the right primitive.

## What a pill IS for

A pill is a **labelled chip** — small rounded element with `bg-{tone}-100 text-{tone}-700` (the soft chip flavor) carrying a short noun. Use a pill when the user reads the element as **"this thing IS a [category]"** — a static label.

| Pill use | Why it works | Source of truth |
|---|---|---|
| **Lifecycle status** (Issue: Open / Resolved; Rock phase: Draft / In Execution; Todo: Done) | The user reads "this is in state X" — a discrete label. Multiple states form a discoverable spectrum. | `lib/status-colors.ts` |
| **Type / category** (Issue Type: Short-Term / Stractical / Long-Term; Rock Tier: Company / Department / Sprint; Idea Category) | "What kind of thing is this" — a noun. Static. | `lib/status-colors.ts` (`ROCK_TIER_*`) + `reference_issue_type_spectrum.md` for the Type spectrum |
| **Scope** (Quarter, Year, "All teams") | "What scope is this scoped to" — a noun. | inline; small enough |
| **Priority** (P1-P5) | The dominant decision-driver, gets its own canon. | `lib/priority-colors.ts` (`reference_priority_palette.md`) |

The unifying property: the user is reading a **noun**, not interpreting a **signal**. "Open" is a noun-like state name. "At-risk" is a *signal* about how something is going — different.

## What a pill is NOT for

These four jobs are off-canon for pills. The current code base still has some pill-shaped instances of each — those are sweep targets to migrate to the right primitive over time. **Don't add new pills for any of these.**

### Health / sensor reading → `<StatusTrajectory>`

"How is this rock doing — on track, at risk, off track?" That's not a label, it's a **sensor reading** with an inherent good-to-bad axis (and often a trend). A pill flattens that into a static category.

The right primitive is `<StatusTrajectory>` — colored dot + trend arrow. Already used on /rocks rows and rock detail editor. Extend it (don't add another pill) when health needs to surface in a new context.

Existing drift: a few `bg-amber-100 text-amber-700`-style "At Risk" pills in dashboard widgets and meeting detail sections. Sweep targets.

**Hard rule:** new code introducing rock health, scorecard health, metric trend, or any "going well / going poorly" indicator MUST use `<StatusTrajectory>` (or a refactored variant) — never a pill.

### Severity flag (STALE / Aging / Flagged) → row left stripe

"This row is dying on the vine" is severity, not a label. The flagged-promotion canon already turns the row's left stripe orange when `isFlagged === true`. Extending the same stripe primitive — red for STALE (>90d), amber for Aging (>30d) — keeps severity in the row's visual chrome instead of polluting the row body with a colored chip.

Existing drift: STALE / Aging are still rendered as pills in 6+ callsites (meetings detail, MeetingItemDetail). Sweep when those files are next touched.

**Why row stripe, not pill:** severity wants ambient visibility — your eye should catch it scanning a list — and pills compete with the row's actual content (title, owner, status). The stripe lives on the entity-color stripe lane that the eye already consults for "what kind of row is this," so red/amber severity reads naturally there.

### Relationship marker (Routed-from / Cascaded-to) → arrow + name

"This issue came from another team" is a **relationship**, not a category. The right read is directional — `← Service Delivery` or `→ Client Success` — not a colored chip.

Existing drift: a few `bg-amber-50 text-amber-800`-style "Routed from X" pills in IssueDetailEditor and headlines. Sweep when next touched. Replace with arrow + name: `← Service Delivery` (text-only, gray, optionally with an icon).

### Visibility / boolean flag (Private) → icon

"This is private" is a single-bit flag. A lock icon (lucide `Lock`) reads instantly. A pill saying "Private" is more chrome than the signal warrants.

Existing drift: 1 callsite in /issues row chrome. Sweep target.

### Count → number badge with icon (already canonical)

"How many comments / linked items" is a count. Already done correctly across the app: `💬 N` and `🔗 N` (lucide `MessageCircle` + count, `Link` + count). No pill chrome — just icon + number. **This is the model.** When you need any count surface elsewhere, copy this pattern.

## Pill anatomy

```tsx
<span className="text-[10px] px-1.5 py-0.5 rounded bg-{tone}-100 text-{tone}-700 font-medium">
  Open
</span>
```

| Token | Canonical | Notes |
|---|---|---|
| `text-[10px]` | YES (compact) or `text-xs` (standard) | Use `text-[10px]` in row chrome (column cells); `text-xs` in detail editors and pickers. |
| `px-1.5 py-0.5` | YES (compact) | `px-2 py-0.5` for the standard size. |
| `rounded` | YES | Default border-radius. **Don't** use `rounded-full` (priority badges' shape — collision). **Don't** use `rounded-lg` (button shape — collision). |
| `bg-{tone}-100` | YES | The soft chip flavor. The 50-level (`bg-blue-50`) is reserved for **interactive state** in StatusPicker (active option), NOT for static pills. |
| `text-{tone}-700` | YES | Pairs with `bg-{tone}-100`. Don't drop to 600 unless the contrast actually requires it. |
| `font-medium` | optional but preferred | Helps the chip read as "label" not "noise." |

**Don't** mix sizes within the same row — pick one (compact or standard) per surface and stick with it.

## Color → meaning convention

Across the entity status maps (`ISSUE_STATUS_COLORS`, `ROCK_PHASE_COLORS`, `TODO_STATUS_COLORS`, `HEADLINE_TONE_COLORS`, `MEETING_STATUS_COLORS` in `lib/status-colors.ts`):

| Color | Semantic meaning |
|---|---|
| **green-100** / **emerald-100** | Positive / done / on-track / win. Green = "this is good." |
| **yellow-100** | Open / submitted / "needs attention soon." A warmer "in-progress." |
| **amber-100** | Active state (discussing, in-progress, at-risk). |
| **blue-100** | Identified / approved / "queued, decision made." |
| **red-100** | Cancelled / urgent / stale / failure. |
| **gray-100** | Neutral / draft / not-yet-started / archived. |
| **slate-100** | Routed away (passed to another team). |

The convention is loose enough that callers don't need to memorize it, but tight enough that consumers reading green = "good" / amber = "warning" / red = "bad" never get surprised. **Don't introduce orange-100 or pink-100 for a status** — those are reserved for tier/category pills (Rock Tier: orange = department, pink = sprint).

## Team chip — the special case

Team labels were the most-rolled-by-hand pill across the app (every list page hard-coded `bg-gray-100 text-gray-600 rounded` for team name). Promoted to its own primitive: **`<TeamChip>`** at `components/TeamChip.tsx`.

### The 3-tier org taxonomy

Codified session 49 alongside this canon. `Team.kind` is the canonical taxonomy field (replaces the legacy `Team.type` over a deploy cycle).

| Kind | Tier | Examples | Visual |
|---|---|---|---|
| `leadership` | Tier 1 (top) | Leadership Team | Crown + brand-blue |
| `group` | Tier 2 | Service Delivery, Business Operations, GNR | Users + group-glyph + group-color |
| `department` | Tier 3 (under group) | Security Practice, AI Practice, Growth, Client Success | Users + dept-glyph + dept-color |
| `cross_function` | Orthogonal | HIP | Users + GitMerge glyph + teal |
| `initiative` / tiger | Orthogonal, transient | Nashville Expansion (legacy), Q4 cyber push | Users + dashed-ring + auto-hashed color |
| `one_on_one` | Orthogonal | Each manager-report pair | Single User icon, gray |

Departments live under groups via `Team.parentTeamId`. The accountability chart drives the structure but isn't strict source of truth — Team is the canonical record, populated from the chart at seed time.

**Group → Department roster (locked 2026-05-03):**
- **Service Delivery** → Security Practice, AI Practice. Core + Professional Services are *squads* (deferred until the squad concept lands; would sit one tier under departments or directly under the group).
- **Business Operations** → Finance + HR (deferred; staffed later). For now, Business Operations as a group has no seeded sub-departments.
- **GNR — Growth, Navigation, & Relationships** → Growth, Client Success. (The "Navigation" and "Relationships" in the group name describe the *philosophy* of the group's work, not separate departments.)

### Color + glyph per team

`lib/team-visual.ts` exports `resolveTeamVisual(team)` which returns `{ color, glyph, iconName }` per team. Resolution order:
1. Explicit `Team.color` + `Team.glyph` (admin-set or seed-set)
2. `TEAM_VISUAL_DEFAULTS[team.name]` for canonical org teams (the 13 seeded teams)
3. For `initiative`: auto-hashed color from a 12-color muted palette, no glyph
4. For `one_on_one`: gray, single User icon
5. Fallback: gray, Users icon

Canonical color/glyph table (the 13 seeded teams):

| Team | Color | Glyph |
|---|---|---|
| Leadership Team | `#0069AA` brand-blue | Crown |
| Service Delivery (group) | `#16A34A` green | Wrench |
| Business Operations (group) | `#64748B` slate | Building2 |
| GNR (group) | `#0EA5E9` sky | TrendingUp |
| Security Practice (dept, under SD) | `#DC2626` red | Shield |
| AI Practice (dept, under SD) | `#7C3AED` violet | Sparkles |
| Growth (dept, under GNR) | `#D97706` amber | DollarSign |
| Client Success (dept, under GNR) | `#F58326` brand-orange | Heart |
| HIP (cross-function) | `#14B8A6` teal | GitMerge |

### `<TeamChip>` API

```tsx
<TeamChip team={team} />              // default md size — the avatar
<TeamChip team={team} size="sm" />    // for tight popover items
<TeamChip team={team} size="md" />    // explicit md (= default)
<TeamChip team={team} onClick={fn} /> // interactive (becomes a button)
```

**Visual: avatar shape, mirrors `<UserAvatar>`.**
- Solid team-color circle (Leadership = brand-blue, Growth = brand-amber, etc.)
- White Users icon centered (the "this is a team" anchor — `User` instead of `Users` for one-on-one teams)
- Small white circle in the bottom-right corner with the team's glyph in the team color (Crown for Leadership, DollarSign for Growth, Heart for Client Success, Shield for Security Practice, Sparkles for AI Practice, etc.) — the **glyph supplements the Users icon, never replaces it**
- Initiative teams: dashed ring around the circle (signals transient)
- Tooltip on hover shows the team name — **no inline text** alongside the avatar; the avatar IS the chip

**Size canon (locked 2026-05-03):**

| Size | Circle | Default usage |
|---|---|---|
| `xs` | 20px | Truly cramped contexts only — try not to use |
| `sm` | 24px | Compact popover items / tight inline contexts |
| **`md`** (default) | **32px** | **Column cells, list rows, detail editors, drawer headers — everywhere by default** |

The team avatar is intentionally **larger than `<UserAvatar size="sm">` (24px)** in column cells. The size delta is part of the visual language: team-vs-user is distinguishable at a glance because the team chip is noticeably bigger and the glyph badge gives it weight. Don't size them equal.

### Glyph supplements, never replaces

The Users icon is **always** present on the chip. The glyph is a SUPPLEMENT — a small badge in the bottom-right corner of the avatar circle. Showing only a Crown / Heart / Shield without the Users base reads as "the concept of a crown" rather than "a team that owns leadership work" — the avatar's job is to communicate "team" first, "which team" second.

The glyph badge itself is a small white circle (matching the avatar's white Users icon's contrast) with the glyph stroke colored by the team's main color. This creates a recognizable, branded badge that scales from xs to md without losing legibility.

### Team management — Leadership locked, others editable in code (P4 punchlist)

Org changes happen — Security Practice could be promoted to a group with sub-departments under it; AI Practice could be reparented to a different group; teams can be renamed. The system needs to handle this without losing data.

**The rules (locked 2026-05-03):**

1. **Leadership Team is the exception — it is permanently locked.** Its `kind` cannot change (always `leadership`), its `parentTeamId` is always null, it cannot be archived, it cannot be deleted. Leadership is the org's root; there is exactly one and it stays put.

2. **All other canonical teams (groups, departments, cross-functions) are editable** — name, description, color, glyph, kind, parentTeamId can all change. Specifically:
   - **Promote** a department to a group (Security Practice → Security Group, then add child departments under it).
   - **Demote** a group to a department (rare, but supported).
   - **Reparent** a department to a different group (move AI Practice from Service Delivery to GNR).
   - **Rename / re-color / re-glyph** at any time. Existing rocks/issues/todos/headlines stay attached because they reference team_id, not the changed metadata.

3. **Initiatives can be archived OR deleted.** They're transient by definition. When an initiative wraps up, archive it; when an experiment is abandoned without ever shipping, delete it.

4. **Canonical teams (kind = leadership/group/department/cross_function) cannot be deleted, only archived.** Archiving sets `status = "archived"` — data preserved, hidden from active views. This protects the org chart from accidental destruction.

**P4 punchlist — TeamModal extension for team management UI:**

For now, **org changes are made via code edits** (update `prisma/seed.ts` and run a one-off migration script, or hand-craft a SQL update). This is fine because org changes are infrequent (months apart, not days). The full management UI is a P4 punchlist item — to be built when the friction of code-edit changes outweighs the cost of building it.

When the punchlist item lands, the TeamModal in /directory grows:
- **kind picker** (leadership / group / department / cross_function / initiative — disabled when `team.kind === "leadership"`)
- **parent picker** (filtered by valid parents per kind: group → leadership only; department → groups only; cross_function/initiative → none)
- **color picker** + **glyph picker** (lucide icon name)
- Confirmation dialog when kind changes ("Change Security Practice from Department to Group? This will let you add child departments under it.")
- API hardening: `DELETE /api/teams/[id]` rejects when `kind === "leadership"` or `protected === true`; canonical teams must use Archive instead.

The schema field to add when this lands: `Team.protected: Boolean @default(false)` — set to true on the canonical seeded teams. Until then, the kind-leadership check alone gates the Leadership-lock rule.

### What replaces the old team pill

```tsx
// BEFORE — hand-rolled team pill (8+ files)
<span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 ...">
  {team.name}
</span>

// AFTER — canonical
<TeamChip team={team} />
```

Sweep target callsites: /issues, /todos, /rocks, /headlines (column cells + detail editors), /accountability, /directory, dashboard widgets. **Don't roll a new gray-pill for a team name.**

## What NOT to do

- Don't add a new pill for health / severity / a relationship / a count. Use the right primitive (StatusTrajectory / row stripe / arrow+name / icon+number).
- Don't introduce new color shades for status. Pull from `lib/status-colors.ts`.
- Don't roll a team pill — use `<TeamChip>`.
- Don't use `rounded-full` for a status pill (collides with priority badges).
- Don't use `rounded-lg` for a status pill (collides with buttons).
- Don't mix `text-[9px]` and `text-[10px]` and `text-xs` in the same row — pick one size and stick with it.
- Don't use `bg-{tone}-50` for a static pill. The 50-level is the **interactive active state** in StatusPicker — using it on a static pill makes them look clickable when they're not.
- **Don't auto-hash colors for permanent teams.** Hash is for tigers only — permanent teams need stable colors that don't shift if the team gets renamed.

## Audit summary (session 49)

- 50+ unique pill variants across `/app` and `/components`. ~80% concentrated in 4-5 patterns; the rest are one-offs.
- Pill colors hard-coded inline in 30+ files. Centralizing in `lib/status-colors.ts` removes the drift surface.
- Health-as-pill drift: ~6 callsites. Sweep targets — migrate to `<StatusTrajectory>`.
- STALE/Aging-as-pill drift: ~6 callsites. Sweep targets — migrate to row left stripe.
- "Routed from X"-as-pill drift: 3 callsites. Sweep targets — migrate to arrow+name.
- Team pill drift: 8+ callsites. Sweep targets — migrate to `<TeamChip>`.

## Sweep priorities

1. **/todos team column** → `<TeamChip>` (smallest blast radius, easiest to verify visually)
2. **/issues team column + IssueDetailEditor team picker** → `<TeamChip>`
3. **/rocks team column + RockDetailEditor** → `<TeamChip>`
4. **/headlines team column** → `<TeamChip>`
5. **/meetings team column** → `<TeamChip>`
6. **Dashboard widgets** → `<TeamChip>`
7. **Health-as-pill** → `<StatusTrajectory>` (separate sweep)
8. **STALE/Aging** → row stripe (extends existing flagged canon)
9. **Routed-from** → arrow+name (separate sweep)

Each sweep is its own commit so the diff stays scoped.

## Related canon

- [reference_priority_palette.md](reference_priority_palette.md) — priority pills (P1-P5), already canonical
- [reference_issue_type_spectrum.md](reference_issue_type_spectrum.md) — the Stractical visual blend (Issue Type spectrum)
- [reference_list_standards.md](reference_list_standards.md) — row left stripe + flagged-promotion canon (severity flags ride this)
- [reference_user_avatar.md](reference_user_avatar.md) — user representation primitive (TeamChip is the team-side analog)
- [reference_icon_vocabulary.md](reference_icon_vocabulary.md) — Lucide icon vocabulary
