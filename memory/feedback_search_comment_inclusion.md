---
name: Search includes comment bodies (Anywhere mode)
description: v0.3.18 canon — list-page Anywhere-mode search + ⌘K global search include comment bodies. Comment-only matches render a "matched in comment" indicator on result rows.
type: feedback
originSessionId: c0f59ffd-a7d2-4733-abb6-c624814b0956
---
# Search includes comment bodies (v0.3.18)

**Status:** Tier-2 canon, locked 2026-05-11. Needs upstream to `docs/canon/reference_global_search.md` + `docs/canon/reference_list_standards.md` on next sync.

## Rule

For rock / issue / todo entities, **server-side "Anywhere" / "deep" search modes match comment bodies in addition to title + description/notes.** Comments hold the *discussion* that title/description don't — searching them surfaces hits the user can't otherwise find.

Per the 3-mode search canon:

| Mode | Searches |
|---|---|
| **Visible** (filter) | Client-side, visible fields only. Comments NOT in scope. Keep fast + predictable. |
| **Anywhere** (deep) | Server-side. Title + description/notes + **comment body**. |
| **By meaning** (fuzzy / AI) | AI ranks candidates that already passed the Anywhere filter. Comments implicitly included via candidate scope. |

Same rule applies to ⌘K global search (Exact mode = Anywhere-equivalent server-side; Meaning mode = candidate-AI).

## The "matched in comment" indicator

When a result matched ONLY via a comment (title + description didn't contain the search term), surface that to the user:

- **⌘K global search:** result row sets `hitField = "comment"`. `<GlobalSearch>` already renders `"match in {hitField}"` automatically — no extra UI work.
- **/todos list rows:** server returns `commentMatch: { snippet, author } | null` on the enriched todo. Row renders a third line under the title (sibling of the `notes` line) with `<MessageCircle className="w-3 h-3 text-gray-400">` + truncated snippet with the search term `<Highlight>`-wrapped. Tooltip shows `Matched in comment by {author}`.

**Why this indicator matters:** without it, a row appears in the result set with no visible reason — looks like a bug. With it, the user knows why the row matched and can click in to find the comment.

## Implementation

**Backend — `lib/search.ts` (`searchOS`):**
- Pre-query: `prisma.comment.findMany({ where: { entityType: { in: ["rock","issue","todo"] }, OR: containsAny.map(c => ({ text: c })) } })` with reasonable limit.
- Group hits by `entityType:entityId` → first matching comment + snippet.
- Each entity's main WHERE OR clause gains `{ id: { in: commentMatchedIds } }`.
- Result-row decoration: when title + description/notes both missed but the entity was in the comment-matched set, set `hitField = "comment"` and `snippet = commentSnippet`.

**Backend — `/api/todos/route.ts` (list-page deep search):**
- Same pattern, scoped to `entityType: "todo"`.
- Returns enriched todo with `commentMatch: { snippet, author } | null` ONLY when title + notes both missed.

**Frontend — `/todos/page.tsx`:**
- `Todo` interface includes `commentMatch?: { snippet, author } | null`.
- Row renders the indicator under the title block when `commentMatch` is truthy.

## Off-canon

- Searching comments in Visible (filter) mode — client doesn't have comment bodies loaded for every row; would require an extra API hop per keystroke. Not worth it.
- Always showing the indicator (even when title also matched) — visual clutter. Indicator only fires when it's the *only* reason the row showed up.
- Including drafts / private comments without scope checks — none implemented today; comment access matches its entity's visibility.

## Sweep targets

Other list pages that need parity:
- `/issues` — `/api/issues/route.ts` deep search, /issues row render
- `/rocks` — `/api/rocks/route.ts` deep search, /rocks row render
- `/headlines` — has comments? if yes, same treatment

Tracked as canon-sweep work; not done in s61.

## Related canon

- `docs/canon/reference_global_search.md` — ⌘K behavior; needs threshold-mode + hitField update
- `docs/canon/reference_list_standards.md` — list-page Find input modes
- `reference_canon_sweep_field_notes.md` — D21 (the sweep entry)
