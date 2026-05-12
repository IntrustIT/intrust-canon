---
name: H1 team-scope picker
description: Canon for the H1-inline team-scope picker (Private / Primary Team / All Teams / Other teams). Locks the picker as the single scope surface — "Private" is a special team-equivalent, not a separate concept. Locked v0.4.0 (2026-05-12) — /todos s60 pilot.
type: reference
---

# H1 team-scope picker — canon

Every list page that scopes by team renders the active scope in the page H1 as a clickable picker. There is **one** scope concept — team — and "Private" lives inside that picker as a first-class option, NOT as a separate filter.

**Canonical impl:** `app/todos/page.tsx:700+` (scope options + handler).

---

## 1. The H1 shape

```
[stripe] {Entity} — {Active Scope ▾}              [action cluster]
```

- The entity name (e.g. "To-Dos") is plain text — NOT clickable.
- The em-dash separator + active scope name + chevron is the clickable trigger.
- Click → opens a `<SearchablePicker triggerShape="inline">` popover.

```tsx
<h1 className="text-2xl font-bold flex items-baseline gap-2">
  <span className="inline-block w-1 h-6 rounded-full bg-[#22C55E] self-center" />
  <span className="text-gray-900">To-Dos</span>
  <span className="text-gray-300 font-normal">—</span>
  <SearchablePicker
    triggerShape="inline"
    options={scopeOptions}
    value={scopeValue}
    onChange={handleScopeChange}
  />
</h1>
```

The `triggerShape="inline"` variant of `<SearchablePicker>` renders the trigger as inline text + chevron (no border, no chip background) so it lives inside the H1 typography. See `reference_searchable_picker.md` for the prop spec.

---

## 2. Option order — locked

The picker contents render in this exact order:

```
[search input — only when >10 total options]

Private                          ← Lock glyph on gray bg
Primary Team (Leadership)        ← TeamChip + "Primary" badge
All teams                        ← Globe glyph
──────────────────────────────   ← divider
Other Team A                     ← TeamChip
Other Team B
Other Team C
…
```

Locked rationale per option:

| Option | Position | Why this position |
|---|---|---|
| **Private** | First | The user's own slice. Always available, single click away. Treated as a special team-equivalent (the team-of-one). |
| **Primary Team** | Second (when set) | The user's stable preferred team from their profile (`User.primaryTeamId`). Carries a "Primary" badge so the user can pick it out at a glance even when its name doesn't visually rank. **Distinct from `globalTeamId`** (the sidebar's current pick, which can change). |
| **All teams** | Third | The "everything I can see" view. Globe glyph. |
| *divider* | After All teams | Visual separator between the three privileged options and the rest. |
| **Other teams** | Below divider, alphabetical | Every other team the user has access to, alphabetical by name. Each row uses `<TeamChip>` + name. |

The three privileged options (Private / Primary / All) live above the divider; everything below the divider is "go elsewhere on the org." Predictable scan path.

---

## 3. Option visual shapes

Each option renders an icon + label. The icon shape encodes type:

| Option | Icon | Shape |
|---|---|---|
| Private | `<Lock>` on `bg-gray-200 text-gray-500 rounded-md w-5 h-5` | rounded-square (Private is a "team-equivalent," not a person) |
| Primary Team | `<TeamChip size="xs">` | rounded-square (per `reference_status_pill_semantics.md`) |
| All teams | `<Globe>` on `bg-gray-500 text-white rounded-md w-5 h-5` | rounded-square (also a team-equivalent — the union of teams) |
| Other team | `<TeamChip size="xs">` | rounded-square |

**Shape rule (v0.3.15):** Person avatar is circle; everything else is rounded-square. Private, Globe-for-all-teams, and each TeamChip all use the rounded-square shape — they're all team-shaped concepts.

---

## 4. The "Primary" badge

The Primary Team row carries a small uppercase badge in the picker's right-side `badge` slot (see `reference_searchable_picker.md` badge prop):

```tsx
badge: (
  <span className="text-[9px] uppercase tracking-wider font-semibold
                   text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
    Primary
  </span>
)
```

The badge appears ONLY on the Primary row, never on the trigger. (When the user has Primary selected, the trigger reads e.g. `Leadership Team ▾` — no badge — because at that point the "Primary-ness" is implicit.)

---

## 5. "Primary Team" vs `globalTeamId` — the distinction that matters

Two team concepts coexist in OS:

- **`User.primaryTeamId`** — a stable preference on the user's profile. Set in /directory; rarely changes. Surfaces in the picker as the Primary Team row.
- **`globalTeamId`** — the sidebar's current pick. Can change to any team or "All teams." Used to default the current page's scope.

The picker shows **Primary** based on `primaryTeamId`, NOT `globalTeamId`. If the user globally picks "All teams" in the sidebar, the Primary entry doesn't move or change. Primary is the user's anchor team for navigation.

When `primaryTeamId` is null (user hasn't set one yet), the Primary row is omitted from the picker. The picker order becomes: Private / All teams / divider / Other teams.

---

## 6. State values — internal vs. picker IDs

The picker uses synthetic IDs for the meta-options:

| Picker option | `id` value | Maps to state |
|---|---|---|
| Private | `"_private"` | `scopeMode = "private"`; `teamOverride = ""` |
| All teams | `"_all"` | `scopeMode = "team"`; `teamOverride = ""` |
| Primary or Other team | the team's actual `id` | `scopeMode = "team"`; `teamOverride = id` |

Underscore-prefix on the synthetic IDs prevents collision with real team IDs. The `handleScopeChange(id)` handler switches on the prefix.

---

## 7. "Private" terminology — locked single word

The user-facing word is **"Private"** everywhere — picker option, visibility badge on private items, `<PrivateToggle>` component. The earlier "Personal" naming has been retired.

Rationale (v0.4.0): single word avoids the Personal-vs-Private mental split. The picker treats Private as "your team-of-one" rather than as a separate visibility concept. Items can have a visibility property `private: boolean` (which controls who else can see them); the picker filters to "show me items in my Private scope" using the same word. Two surfaces, one word — easier to learn.

---

## 8. Trigger label format

The trigger renders the **active scope name** + chevron. No prefix verb:

| Scope state | Trigger text |
|---|---|
| Private | `Private ▾` |
| All teams | `All teams ▾` |
| Specific team (Primary or other) | `{Team Name} ▾` |

No `"Team:"` prefix. The H1 entity word and the dash already establish context: `To-Dos — Leadership Team ▾` reads as "To-Dos scoped to Leadership Team."

---

## 9. Off-canon

- A separate "Visibility" filter or "Scope" picker living alongside the team picker. Off — Private is **in** the team picker, not next to it.
- Putting the team picker in Band 2 instead of the H1. Off — the H1 is the scope surface; Band 2 is for filters. (Mixing them caused the early /todos retrofit failures.)
- Sorting "Other teams" by something other than alphabetical. Off — alphabetical scans easiest below the divider.
- Hiding the Primary badge when the Primary row is selected in the trigger. Already canonical — badge is picker-only.
- Adding a "Recently picked" cluster above Other Teams. Possible future canon if usage data justifies; not in v0.4.0.

---

## 10. Field-note pairing

Sweep target: list pages that roll their own team picker instead of using this pattern. See `reference_canon_sweep_field_notes.md` for the D-entry (added in v0.4.0).

## See also

- `reference_list_standards.md` — Band 1 contains the H1; this picker lives inside the H1
- `reference_searchable_picker.md` — `triggerShape="inline"` + `badge` prop
- `reference_status_pill_semantics.md` — `<TeamChip>` shape rule (rounded-square always)
- `reference_user_avatar.md` — person shape (circle) — visual contrast with team shape
- `reference_account_actions_menu.md` — sidebar global team picker (`globalTeamId`) — distinct surface
