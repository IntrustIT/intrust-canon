---
name: Account actions menu
description: Tier-1 canon for the sidebar-bottom user account area present in every Intrust app. UserAvatar + name + truncated email row at the bottom of the sidebar; click chevron opens an upward pop-up with identity strip (name + roles + full email) + menu items (My Profile / My Activity / Sign Out + conditional items). One mental model across every Intrust app.
type: reference
---

# Account actions menu

Every Intrust app has a user-account area pinned to the bottom of its left sidebar. Click expands an upward pop-up with identity info + action items. Same shape, same items, same behaviors across OS / Playbook / future apps.

Reference impl: OS sidebar bottom (see `components/AppShell.tsx` or wherever the sidebar lives). Playbook to retrofit to match.

---

## 1. Sidebar-bottom row (always visible)

The compact row that sits pinned to the bottom of the sidebar, above the bottom edge.

```tsx
<button
  onClick={() => setOpen((v) => !v)}
  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
>
  <UserAvatar user={currentUser} size="sm" />
  <div className="flex-1 min-w-0 text-left">
    <div className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</div>
    <div className="text-xs text-gray-500 truncate">{currentUser.email}</div>
  </div>
  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
</button>
```

Locked details:
- **Avatar:** `<UserAvatar size="sm">` (per [`reference_user_avatar.md`](reference_user_avatar.md)). NEVER hand-rolled brand-blue circle with a `charAt(0)` initial.
- **Name:** `text-sm font-medium text-gray-900 truncate`.
- **Email:** `text-xs text-gray-500 truncate`. Below the name, truncated when the sidebar is narrow. Email is the secondary identifier; it's not the role.
- **Chevron:** Lucide `ChevronDown`, `w-4 h-4 text-gray-400`. Rotates `180deg` when open via `rotate-180` class.
- **Hit target:** entire row is the trigger — `w-full`. Hover lifts to `hover:bg-gray-50 rounded-lg`.

**Don't show the role label here.** Role is informational, not always-visible chrome. Surfaces in the pop-up only.

---

## 2. Pop-up — opens upward

Click the row → pop-up opens **above** the trigger. NOT below (the row is at the bottom of the sidebar; downward would be off-screen).

```tsx
{open && (
  <div className="absolute bottom-full left-2 right-2 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-40 overflow-hidden">
    {/* Identity strip */}
    <div className="px-3 py-2 border-b border-gray-100">
      <div className="text-sm font-semibold text-gray-900">{currentUser.name}</div>
      {currentUser.roles && currentUser.roles.length > 0 && (
        <div className="text-xs text-gray-500">{currentUser.roles.join(" · ")}</div>
      )}
      <div className="text-xs text-gray-400">{currentUser.email}</div>
    </div>
    {/* Menu items */}
    <div className="py-1">
      {items.map((item) => (
        <button
          key={item.key}
          onClick={item.onClick}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          <item.Icon className="w-4 h-4 text-gray-400" />
          {item.label}
        </button>
      ))}
    </div>
  </div>
)}
```

Locked details:
- **Container:** `absolute bottom-full left-2 right-2 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg z-40 overflow-hidden`. The `bottom-full` + `mb-2` lifts it above the trigger. Width matches the sidebar's content width via `left-2 right-2`.
- **z-40** — above sidebar nav items and main content scrim, but below modal scrims (which use higher z).
- **Identity strip** at the top, inside the pop-up:
  - **Name:** `text-sm font-semibold text-gray-900`.
  - **Roles:** `text-xs text-gray-500`. **Comma-separated for multi-role** users (`Admin · Coach · Manager`). Use `·` (middle dot, U+00B7) as the separator. Omit the line entirely if `roles` is empty.
  - **Email:** `text-xs text-gray-400` (de-emphasized — it's confirmation, not action). Full email, no truncation in the pop-up (more horizontal room than the sidebar).
  - **Padding:** `px-3 py-2`.
- **Divider:** `border-b border-gray-100` between identity strip and menu items.
- **Menu items:**
  - Each item: `w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50`.
  - Icon: Lucide, `w-4 h-4 text-gray-400`. Per [`reference_icon_library.md`](reference_icon_library.md).
  - Label: plain text after icon.

**Close behaviors:**
- Click outside.
- Escape key.
- Picking an item.

---

## 3. Canonical item list

| Item | Icon | When to render | Action |
|---|---|---|---|
| **My Profile** | Lucide `User` | Always | Navigate to `/profile` (or `/account/profile`) |
| **My Activity** | Lucide `Clock` | Only when the app has an activity feed surface (OS has it, Pb may not) | Navigate to `/activity` |
| **Settings** | Lucide `Settings` | Only when current user has admin role | Navigate to `/admin` or `/settings` |
| **App Switcher** | Lucide `Grid3x3` | Only when the user has access to >1 Intrust app | Opens app-switcher surface (see TBD canon) |
| **Sign Out** | Lucide `LogOut` | Always — **last item** | Calls signOut() |

- **Order:** My Profile → My Activity (if shown) → Settings (if shown) → App Switcher (if shown) → Sign Out.
- **Sign Out is always last.** Visually separated from the rest by NOTHING — no extra divider. The icon + position are the signal.
- **Don't add app-specific items.** "Bookmarks", "Notifications", etc. live elsewhere (top bar, dedicated sidebar items). The account menu is for identity + sign-out only.

---

## 4. Roles list — what counts

Roles shown in the identity strip come from `currentUser.roles` (or whatever the app's user-shape calls it). Examples:

- OS: `["Admin"]`, `["Member"]`, `["Admin", "Coach"]` — derived from team memberships + leadership-team status.
- Playbook: `["Admin"]`, `["Editor"]`, `["Learner"]` — explicit role enum on the User model.

**Rules:**
- **Display the user-facing role label** (e.g. "Admin"), not internal codes (e.g. `ROLE_ADMIN`).
- **Multi-role:** comma-separated with `·` separator. Cap at 4; if 5+, show first 3 + `+N more`.
- **No role:** omit the line. Don't render an empty space or "(no role)" — just skip the line.
- **Single-role:** show it.

---

## 5. Off-canon

- **Hand-rolled brand-blue avatar circle** with `charAt(0)` initial instead of `<UserAvatar>`. Off-canon — UserAvatar is the primitive.
- **Inline-text-only sidebar bottom** with no menu (Pb today). Off-canon — there's a single Sign Out link with no profile or activity affordances.
- **Pop-up opening downward** below the trigger. Off-canon — at the sidebar bottom, downward is off-screen.
- **Role shown in the always-visible sidebar row.** Off-canon — role goes in the pop-up identity strip, not the compact row.
- **No identity strip in the pop-up** (just menu items). Off-canon — the strip is what makes "is this me?" visible at a glance.

---

## 6. Wiring checklist

1. Replace any hand-rolled avatar circle with `<UserAvatar user={currentUser} size="sm">`.
2. Wire the sidebar-bottom row per § 1 — name + email + chevron.
3. Implement the upward pop-up per § 2 — identity strip + items.
4. Populate `currentUser.roles` from your user model. Single-role apps keep it as a one-element array; multi-role apps populate the full list.
5. Wire the canonical items per § 3 — only render conditional items when applicable.
6. Verify open/close behaviors: click outside, Escape, picking an item.
7. Verify keyboard nav: arrow keys move between items, Enter triggers, Esc closes.

---

## See also

- [`reference_user_avatar.md`](reference_user_avatar.md) — the avatar primitive used in the sidebar row.
- [`reference_icon_library.md`](reference_icon_library.md) — Lucide for menu item icons.
- [`reference_color_palette.md`](reference_color_palette.md) — the sidebar-bottom row uses no brand color (gray scale only). The chevron + icon all gray.
