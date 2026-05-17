---
name: UserAvatar canon
description: Every user representation in the UI uses <UserAvatar> with a `role` prop. Initials fallback when no avatar image. Three sizes (xs/sm/md), brand-blue circle. Read this before rendering an avatar by hand.
type: reference
originSessionId: c9b17cee-f5ec-4aac-9894-14aeaf8a54b7
---
# UserAvatar canon

Every place a user appears in the UI — list rows, editor headers, comment threads, dashboards — uses **`<UserAvatar>`** from `components/UserAvatar.tsx`. Don't render initials-in-a-div by hand.

Established alongside `feedback_canonical_role_labels.md` (the rule that every avatar carries a role-descriptive tooltip). This doc registers the visual + API canon.

## API

```tsx
import UserAvatar from "@/components/UserAvatar";

<UserAvatar
  name={user.name}             // required
  avatarUrl={user.avatar}      // optional — renders <img> when truthy, falls back to initials on null/undefined/load-error
  size="sm"                    // optional, default "sm"
  role="Assigned to"           // optional but recommended — see below
  tooltip="Custom tooltip"     // optional override (rare)
  className="ring-2 ring-..."  // optional extra classes
/>
```

**Required:** `name`. Falls back to `"Unknown"` when null/undefined; renders `?` initials.

## Photo mode (v0.5.3, 2026-05-17)

When `avatarUrl` is provided and truthy:
- Renders `<img src={avatarUrl} className="object-cover w-full h-full" alt={name}>` inside the same rounded-full circle wrapper
- All size variants (xs/sm/md) preserved — image fills the circle, doesn't deform the layout
- Tooltip + `role` prop behavior unchanged from initials mode

When `avatarUrl` is `null`, `undefined`, or empty string → renders the canonical initials fallback (brand-blue circle, white text, `getInitials(name)`).

**onError fallback:** if the image fails to load (404, network blip, expired proxy session), the `<img>` `onError` swaps to initials silently AND emits a `console.warn` for debuggability:

```ts
onError={(e) => {
  console.warn(`[UserAvatar] image failed to load for ${name}: ${avatarUrl}`);
  setImageError(true);
}}
```

The warn ensures real failures (broken Blob proxy, missing files) leave a debug trail. Silent fallback masks bugs.

**URL shape:** `avatarUrl` should be a stable internal URL (e.g. proxy endpoint `/api/files/avatars/...` per the Blob-storage adapter at `lib/blob-storage.ts`). Don't pass raw Blob SAS URLs — they expire. Don't pass public Blob URLs — the Bicep policy forbids public access. The proxy hides storage details from the client.

**Image source canon:** `User.avatar` is the schema field carrying the user's photo path. Pass `avatarUrl={user.avatar}` at consumption time. When a user object isn't in scope (label-only avatars, placeholder rows), omit `avatarUrl` — initials render is correct.

## Sizes

| Size | Classes | Use for |
|---|---|---|
| `xs` | `w-5 h-5 text-[9px]` | Inline density (chips, dense rows, dashboard mini-cards) |
| `sm` | `w-6 h-6 text-[10px]` | **Default.** List rows, table cells, side-by-side avatar groups |
| `md` | `w-8 h-8 text-xs` | Editor headers, primary identification surfaces |

**No `lg` size.** Anything bigger than `md` is a profile photo, not an avatar — out of scope for this primitive.

## Role prop — required for every contextual surface

Per `feedback_canonical_role_labels.md`, every avatar in a contextual surface (anywhere the user has a relationship to the entity being shown) MUST include a `role` prop. The role becomes a tooltip prefix that makes the avatar self-describing.

Canonical role labels per entity (v0.4.0, per `feedback_canonical_role_labels.md`):

| Entity | Role label | Example tooltip |
|---|---|---|
| Rock / Todo / Metric / Mini-game / HIP-assumption | `"Responsible"` | `Responsible: Carol` |
| Milestone (sub-work of rock) | `"Delegated to"` | `Delegated to: Bob` |
| Todo (recipient slot — waiting-on context) | `"Due to"` | `Due to: Bob` |
| Issue | `"Raised by"` | `Raised by: Alice` |
| Headline | `"Shared by"` | `Shared by: Dave` |
| HIP plan | `"Created by"` | (use `tooltip` override — not in role union yet) |

**Legacy values** `"Owner"` and `"Assigned to"` remain in the type union for one sweep cycle. New code MUST use the v0.4.0 labels above. The cross-app sweep (#773) retires the legacy values, after which they'll be removed from the union (forward-only convention). See `feedback_canonical_role_labels.md` for the full transition table + grep recipe.

When the role doesn't fit the union, use the `tooltip` prop directly. Don't extend the role union unless the role recurs across ≥3 surfaces (and pair the addition with a row in `feedback_canonical_role_labels.md`).

When NOT to pass `role`: pure-decorative avatar surfaces (a profile-page header where the user is the page's subject — name is already in the h1; role is implicit and the tooltip would be redundant). These are rare.

## Visual shape (locked)

- Circle, brand-blue background (`#0069AA`)
- White text, `font-medium`, initials only
- `flex-shrink-0` so it doesn't deform in tight rows
- Tooltip wraps the avatar (always), positioned per Tooltip's default

**Image avatars shipped v0.5.3 (2026-05-17)** — see Photo mode section above for the `avatarUrl` prop + onError fallback spec. Single primitive, no ad-hoc img rendering in callers.

## Initials helper

`getInitials(name)` is exported alongside the component. Use when you need just the initials (no avatar wrapper) — e.g. in dense pickers, chips, or autocomplete results.

```tsx
import { getInitials } from "@/components/UserAvatar";
const initials = getInitials("Alice Park"); // "AP"
```

Rules: trim + split on whitespace, take first letter of first 2 words, uppercase. `null/undefined` → `"?"`. Single-word → first letter only.

## What NOT to do

- Don't render `<div className="w-6 h-6 rounded-full bg-...">{initials}</div>` by hand. Use the primitive.
- Don't pass `tooltip` when `role` would do the job — `role` is the structured affordance, `tooltip` is the escape hatch.
- Don't change the brand-blue bg color per-user. Single brand color = recognizable affordance shape, not "user identity color." (User-color schemes are an explicit anti-pattern; they don't survive accessibility scrutiny + create chart-color noise.)
- Don't stack avatars (overlapping rings) without a wrapper component. If we need a stacked-avatar group, build `<UserAvatarGroup>` rather than reaching into `<UserAvatar>`'s margins.
- Don't omit the `role` prop in contextual surfaces — the canon-strictness hook will flag this on next edit. Tooltip-less avatars erode the "what does this person do here?" affordance.

## Known consumers (sweep target if API changes)

Used widely. Major surfaces include:
- All entity list pages (`/issues`, `/todos`, `/rocks`, `/headlines`) — Owner/Assigned-to/Raised-by/Shared-by columns
- All entity detail editors (Issue/Todo/Rock/Headline/Measurable) — header avatar
- Meeting runner — IDS row owner, Rock+Todo Review, Headlines section
- Dashboard — Needs Your Attention items, My Rocks, Mini-games
- Accountability Chart — seat occupants
- CommentThread — comment authors
- Directory — user list

When changing the props or sizes, grep `<UserAvatar` and verify each callsite still semantically fits.

## Related canon

- `feedback_canonical_role_labels.md` — the underlying "every entity has a role-descriptive label" rule
- `reference_shared_components.md` — full primitives roster
