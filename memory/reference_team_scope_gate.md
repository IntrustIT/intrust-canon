---
name: Server-side team-scope gate
description: Trust contract — team-scoped API endpoints MUST validate that the caller is a member of the requested team (or on a leadership-type team) before returning that team's data. `lib/team-scope.ts` exports `resolveTeamScope` / `canAccessTeam` as the canonical enforcement. Client-side `?allTeams=true` is a convenience, never a privilege escalator. Established v0.5.0 (merged from sweep session findings on /rocks + /headlines).
type: reference
---

# Server-side team-scope gate

## The trust contract

Any API endpoint that accepts a `teamId` (or returns team-scoped
data) MUST validate the caller's membership before scoping the query
to that team. The validation is **server-side, non-bypassable**, and
returns **403 Forbidden** when the caller is not a member of the
requested team and not on a leadership-type team.

This closes a class of IDOR (Insecure Direct Object Reference) bugs
where client code only filtered by `teamId` in the query string —
trusting the client to choose its own scope. Don't trust the client.

## Canonical enforcement — `lib/team-scope.ts`

Three exported helpers:

```ts
// 1. Membership lookup, cached per-request.
async function getUserTeamMemberships(userId: string): Promise<
  { teamId: string; team: { type: string } }[]
>;

// 2. Boolean check for a specific team.
async function canAccessTeam(userId: string, teamId: string): Promise<boolean>;
//    Returns true if the user is a member of teamId OR is on any
//    team where team.type === "leadership".

// 3. Full scope resolver — preferred entry point.
async function resolveTeamScope(
  userId: string,
  opts: {
    requestedTeamId?: string | null;  // from ?teamId= query param
    allTeams?: boolean;               // from ?allTeams=true (convenience flag)
  }
): Promise<
  | { ok: true; teamIds: string[]; isLeadership: boolean }
  | { ok: false; status: 403 | 400; error: string }
>;
```

### `resolveTeamScope` rules:

1. **Leadership users** can request any single team OR all teams.
2. **Non-leadership users** with `requestedTeamId` set must be a
   member of that team — otherwise `403`.
3. **Non-leadership users** with `allTeams: true` get scoped to
   their own memberships only — `allTeams` does NOT escalate to org-
   wide.
4. **No `requestedTeamId` AND no `allTeams`** → return the user's
   own teams (default scope).

### Required pattern in every team-scoped endpoint:

```ts
const scope = await resolveTeamScope(session.user.id, {
  requestedTeamId: searchParams.get("teamId"),
  allTeams: searchParams.get("allTeams") === "true",
});
if (!scope.ok) {
  return NextResponse.json({ error: scope.error }, { status: scope.status });
}
// Now use scope.teamIds in your where clause:
const rows = await prisma.rock.findMany({
  where: { teamId: { in: scope.teamIds } },
});
```

## `?allTeams=true` is a client convenience, NOT a privilege escalator

The convenience: a leadership user toggling "All teams" on the team
picker sends `?allTeams=true` and gets org-wide data. The trap:
*non-leadership* users sending the same flag must NOT get org-wide
data — `resolveTeamScope` collapses them back to their own teams.

The flag is a *request*, not a *grant*. Server decides.

## `/api/teams` exception

`/api/teams` returns the team picker's option set. Defaults to
**assignable-only** for the caller (their own memberships, expanded
via leadership-team override per existing `lib/team-scope.ts`
`getAssignableTeams`). Admins can request the full org list with
`?all=true` — also server-gated by role check.

This is consistent with the rule: the team picker only offers what
the user can actually scope into.

## Why this is canon

Pre-v0.5.0 audit found team-scoped endpoints relying on the client
to choose its `teamId` correctly. With a crafted URL, a user could
query another team's data — classic IDOR. The gate forecloses the
attack class.

This is also a *consistency* canon: every team-scoped endpoint
behaves the same way. Pages don't have to second-guess "does this
endpoint do its own check?" — they all do, via the same helper.

## Sweep target

Punchlist #751 tracks the audit across remaining endpoints:
- `/api/todos` ✓
- `/api/issues` ✓
- `/api/rocks` ✓
- `/api/headlines` ✓ (and `/api/headlines/[id]/acknowledge`)
- `/api/meetings` ✓
- `/api/scorecard` (verify)
- `/api/metrics` (verify)
- `/api/ggob/*` (verify)
- `/api/vto/*` (verify)
- `/api/dashboard/*` (verify)
- Any future team-scoped surface (e.g. `/api/my-direct-reports` —
  scope by report relationship, not team membership; verify the
  equivalent gate)

Each endpoint either calls `resolveTeamScope` or has a documented
reason it's exempt (e.g. user-scoped, not team-scoped).

## Off-canon

- Endpoints that filter by `?teamId=` without checking membership.
  Anti-canon. Wrap in `resolveTeamScope` or document the exemption.
- Treating `?allTeams=true` as authoritative for non-leadership
  users. Anti-canon — that's the IDOR vector.
- Hand-rolled membership checks per endpoint. Use the helper; if
  it's missing a case, extend the helper.
- Relying on client-side picker filtering ("the user can't pick
  another team so they can't request it"). Always wrong — `curl`
  exists.

## See also

- `lib/team-scope.ts` — the canonical implementation
- `reference_team_picker.md` — the H1 team picker that produces
  `?teamId=` / `?allTeams=` in URLs
- `reference_shared_components.md` — helper catalog entry for the
  team-scope module
- Punchlist #751 — sweep status
