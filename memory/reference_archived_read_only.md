---
name: Archived items are read-only across the app
description: Trust contract — once an entity is archived it cannot be mutated except to un-archive. Server-side guard via lib/archived-guard.ts returns 409 on any PUT to an archived entity unless the body is `{archived: false}`. Client surfaces a canonical AlertBanner with inline Unarchive button at the top of the editor body. Established v0.5.0.
type: reference
---

# Archived items are read-only

## The trust contract

An archived entity is a frozen historical record. Any field-level
mutation on an archived entity is a process error — the system MUST
refuse the write, the user MUST be told why, and the only mutation
allowed is `archived: false` (un-archive, which restores write
access).

This contract has both a **server-side enforcement** and a **client-
side affordance**. Both are required; one without the other leaves
the contract leaky.

## Server-side enforcement

`lib/archived-guard.ts` exports a check called from every PUT handler
on archive-capable entities. Pattern:

```ts
import { archivedGuard } from "@/lib/archived-guard";

// inside the PUT handler, after loading the existing entity:
const guard = archivedGuard(existing, body);
if (!guard.ok) {
  return NextResponse.json({ error: guard.error }, { status: 409 });
}
```

**Rule:** if `existing.archived === true` AND the body contains any
key besides `archived: false`, return **409 Conflict** with the error
`"Archived items are read-only. Un-archive to edit."`

The only allowed mutation on an archived entity is the un-archive
itself. A body of `{ archived: false }` (optionally combined with
other fields that were always going to change as a result of
un-archiving — `archivedAt: null`, etc.) passes the guard.

**Endpoints wired (v0.5.0):**
- `/api/rocks/[id]`
- `/api/todos/[id]`
- `/api/issues/[id]`
- `/api/headlines/[id]`
- `/api/meetings/[id]`
- `/api/metrics/[id]`

Any new archive-capable entity MUST route through the guard.

## Client-side affordance — the AlertBanner

When an editor (slide-over panel, modal, detail page) renders for an
archived entity, the top of the body MUST display a canonical
`<AlertBanner tone="info">` with an inline Unarchive button.

**Locked shape:**

```tsx
{entity?.archived && (
  <AlertBanner
    tone="info"
    title="Archived"
    description="Read-only — un-archive to edit any field."
    action={
      <button
        type="button"
        onClick={handleUnarchive}
        className="text-sm font-medium text-[#0069AA] hover:underline"
      >
        Unarchive
      </button>
    }
  />
)}
```

**Placement:** top of the editor body, BEFORE any other body content
(field groups, tabs, etc.).

**Onclick behavior:** `handleUnarchive` PUTs `{ archived: false }` to
the entity's update endpoint, then fires `onSaved` (or whatever the
editor's save callback is) and closes / refreshes the host page.

**All editable fields below the banner SHOULD be visually disabled**
(inputs `disabled`, buttons `cursor-not-allowed`, etc.) so the
read-only state is visible on every field, not only when the user
attempts to save. The banner is the *explanation* of the disabled
state.

## Why this is canon (not optional)

Without the contract, an archived entity is just "an entity with a
flag." Editing surfaces stay live; users can write fields that the
server might or might not refuse; intent gets lost. The pair of
enforcement (server 409) + affordance (banner + disabled fields) +
explanation ("un-archive to edit") makes archival a real lifecycle
state with a deterministic UX.

## Off-canon

- Letting a PUT silently succeed on an archived entity. Anti-canon —
  the server MUST 409.
- Hiding the banner and just disabling fields. The user doesn't know
  WHY — they think the form is broken.
- Adding an "Unarchive and Edit" mega-button. The flow is two
  intentional steps: un-archive first, then edit. Don't merge them.
- Allowing partial mutations on archived entities ("only this field
  is editable while archived"). The contract is binary — archived =
  fully read-only except `archived: false`.

## See also

- `reference_shared_components.md` — `<AlertBanner>` primitive spec
- `lib/archived-guard.ts` — server-side enforcement helper
- `reference_archive_view.md` (v0.5.0) — the archive-view list page rules (separate from the editor read-only rules here)
