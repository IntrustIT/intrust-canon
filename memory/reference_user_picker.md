---
name: User picker
description: <UserPicker> is the canonical primitive for "pick a user from many." Wraps SearchablePicker with avatar + name rendering, role-aware label, optional team scoping. Replaces 70+-row native <select> dropdowns currently in OS owner/assignee/raised-by fields. Pairs with <UserAvatar> on the display side.
type: reference
---

# User picker

When a form field needs the user to pick a person — owner, assignee, raised-by, requester, attendee, etc. — use `<UserPicker>`. NEVER a native `<select>` listing all users.

**Reasoning:** Intrust has 70+ users today and growing. A native select scrolls without search; users can't find anyone. Search-by-typing is required.

This pairs with [`<UserAvatar role="...">`](reference_user_avatar.md) on the display side: UserAvatar shows a picked user; UserPicker is how you pick one.

---

## 1. The primitive

```tsx
<UserPicker
  role="Responsible"             // canonical role label per feedback_canonical_role_labels.md (v0.4.0)
  value={ownerId}
  onChange={setOwnerId}
  users={users}                  // pre-loaded user list, optional team-scoped
  teamId={currentTeamId}         // optional — pre-filter to team members + leadership
  allowUnassigned={true}         // shows "Unassigned" as the first option
  allowMe={true}                 // surfaces current user at top under "You" header
  align="left"                   // optional, default "left" — forwards to SearchablePicker (see v0.3.16)
  disabled={false}
  required={true}                // adds visual asterisk + integrates with form validation
/>
```

Locked behavior:
- **Trigger** is a SearchablePicker-style field showing the current selection (avatar + name) or "Unassigned" placeholder.
- **Popover** opens on click, with autofocused search input at top.
- **Options** render as: `<UserAvatar size="xs" /> + name + secondary line (role/team)`. Multi-line per option.
- **Filtering** is case-insensitive substring match across name + role + email.
- **Keyboard navigation:** arrow keys move between options, Enter picks, Esc closes.
- **Group headers** (text-[10px] uppercase tracking-wide gray-500): "You" (when `allowMe`), "Unassigned" section (when `allowUnassigned`), then either "All users" or team groupings.
- **Selected option** shows a check or distinct background (`bg-[#0069AA]/10 text-[#0069AA]`).
- **Empty/no-match state:** `<div className="px-3 py-2 text-xs text-gray-400">No users matching "{query}"</div>`.

---

## 2. Role prop — required in contextual surfaces

`role` is required in any user-pick surface where the meaning of the picked user matters — same list as [`<UserAvatar>`](reference_user_avatar.md). v0.4.0 canon:

| Entity | role |
|---|---|
| Rock / Todo / Metric / Mini-game | `"Responsible"` |
| Milestone | `"Delegated to"` |
| Todo (recipient slot) | `"Due to"` |
| Issue | `"Raised by"` |
| Headline | `"Shared by"` |
| Meeting attendee | `"Attendee"` |
| Generic person reference | `"User"` (fallback only) |

Per [`feedback_canonical_role_labels.md`](feedback_canonical_role_labels.md). The role appears in the popover's heading and as the field's label.

**Legacy values** `"Owner"` and `"Assigned to"` remain in the union for one sweep cycle (per UserAvatar canon). New code MUST use the v0.4.0 labels above.

---

## 3. Team scoping (optional)

Pass `teamId` when the picker should bias toward members of a specific team:

```tsx
<UserPicker
  role="Assigned to"
  teamId={todo.teamId}
  // …
/>
```

Renders the user list grouped:
1. Team members (top, under "Team Members" heading)
2. Other users (collapsed by default; "Show all (47)" expand link)

When `teamId` is omitted, all users render flat under one "All users" heading.

**Leadership team override:** users on a leadership team always appear in BOTH groups (team-scoped AND fallback). Leadership members can be assigned anything regardless of team scope. (Same rule as `lib/ai-context.ts:isOnLeadershipTeam`.)

---

## 4. Building on SearchablePicker

UserPicker is implemented as a thin wrapper around [`<SearchablePicker>`](reference_searchable_picker.md):

```tsx
function UserPicker({ role, value, onChange, users, teamId, ... }) {
  const grouped = groupUsers(users, teamId);
  const options = buildOptions(grouped);
  return (
    <SearchablePicker
      label={role}
      value={value}
      onChange={onChange}
      options={options}
      placeholder={`Search users…`}
      renderOption={(u) => (
        <div className="flex items-center gap-2">
          <UserAvatar user={u} size="xs" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate">{u.name}</div>
            <div className="text-[10px] text-gray-400 truncate">{u.role || u.email}</div>
          </div>
        </div>
      )}
    />
  );
}
```

The grouping + role-prop logic is what UserPicker adds; everything else (popover, keyboard nav, empty state) is SearchablePicker's job.

---

## 5. When to use a native `<select>` instead

**Almost never.** The decision rule:

- **>10 users** → UserPicker. Always.
- **≤10 users AND no team scope AND single role** → native `<select>` IS acceptable for tiny apps. But intrust-os has 70+ users, so this case doesn't apply here.

If you're tempted to use a native `<select>` for "convenience," the answer is no.

---

## 6. Off-canon

- Native `<select>` listing all 70+ users (current OS Issue/Todo/Rock owner pickers — fix in retrofit).
- Bespoke avatar-grid pickers ("click an avatar to pick"). Avatar grids work for ≤8 fixed people; not for 70+. Use UserPicker.
- Inline name-typed-in-text-field with autocomplete ghost suggestions. Off-canon — UserPicker is a controlled select-from-list, not a freeform input.
- Multiple users in one field via comma-separated names. Multi-select user pickers are a different primitive (TBD canon — open question for when the first multi-assignee feature lands).

---

## 7. `align` prop — forward to SearchablePicker

`<UserPicker>` forwards `align="left" | "right"` (default `"left"`) to the underlying `<SearchablePicker>`. Pass `align="right"` for any picker in the right column of a multi-column form or near a slide-over body's right edge.

**Reason (v0.3.16 canon — see `reference_searchable_picker.md`).** Slide-over bodies use `overflow-y: auto`, which silently promotes `overflow-x` to `auto` (CSS spec gotcha). A wide popover overflowing the right edge of the trigger triggers horizontal scroll on the slide-over body, visibly shifting the editor. `align="right"` anchors the popover to the trigger's right edge and extends left — no overflow.

```tsx
// Right-column responsible field → anchor popover right edge
<UserPicker
  role="Responsible"
  value={ownerId}
  onChange={setOwnerId}
  users={users}
  align="right"
/>
```

## 8. Reference impl status

`<UserPicker>` ships in `components/UserPicker.tsx` (s61, branch `claude/jolly-galileo-bf31d7`). Pilot consumers: `TodoDetailEditor` Responsible field (team-scoped) + Due-to-person field (`allowUnassigned`, full user list).

Cross-app sweep target — punchlist #565(f) — wraps Issue / Rock / Metric editor Responsible fields with `<UserPicker>`, replacing native `<select>` callsites.

---

## See also

- [`reference_user_avatar.md`](reference_user_avatar.md) — display-side primitive for showing a picked user.
- [`reference_searchable_picker.md`](reference_searchable_picker.md) — engine UserPicker wraps.
- [`feedback_canonical_role_labels.md`](feedback_canonical_role_labels.md) — `role` prop values per entity.
