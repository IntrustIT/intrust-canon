---
name: Due-date display canon
description: Every UI surface that displays a todo / milestone / rock due date goes through lib/format-due-date.ts. Format is anchor date + relative suffix (e.g. "Apr 18 (-13d)" / "May 1 (today)" / "May 3 (2d)"). Read this before adding any new date display.
type: reference
originSessionId: c9b17cee-f5ec-4aac-9894-14aeaf8a54b7
---
# Due-date display canon

Every UI surface that shows a date deadline (todo dueDate, milestone dueDate, rock dueDate) goes through **`lib/format-due-date.ts:formatDueDate(date, opts)`**. Don't roll your own `toLocaleDateString` — the helper is the source of truth.

Established session 45 (2026-05-05, K-CS-016). This doc registers the rule explicitly.

## Format

| Date relative to today | Label | Status bucket |
|---|---|---|
| Past due | `Apr 18 (-13d)` (singular `(-1d)`) | `past_due` |
| Today | `May 1 (today)` | `due_today` |
| ≤ 3 days future (default) | `May 3 (2d)` | `due_soon` |
| > 3 days future | `May 14 (13d)` | `future` |
| Completed | `Apr 18` (no suffix, line-through in caller) | `completed` |
| No date | `""` empty string | `none` |

The parenthetical suffix is dropped when:
- `opts.completed === true` — relative-to-today is misleading post-completion.
- `opts.plainDate === true` — for tentative dates (AI-suggested due dates, draft milestones), the suffix implies a real commitment.

## API

```tsx
import { formatDueDate } from "@/lib/format-due-date";

const { label, status, daysFromToday } = formatDueDate(date, opts);
```

**Returns** `{ label, status, daysFromToday }` — always.
- `label`: ready-to-render string. Empty when no date.
- `status`: bucket for color-coding (caller picks Tailwind).
- `daysFromToday`: negative=past, 0=today, positive=future, NaN if no date.

**Opts** (all optional):
- `completed?: boolean` — drops suffix, sets `status: "completed"`. Use for done items.
- `plainDate?: boolean` — drops suffix, KEEPS the underlying status. Use for tentative dates (AI suggestions, draft milestones).
- `showYear?: boolean` — `Apr 18, 2026` instead of `Apr 18`. Use only on surfaces that may span >12 months (one rock list-page site uses this).
- `dueSoonThreshold?: number` — days within which future = `due_soon`. Default 3.

## Color rules — caller chooses, status drives

The helper deliberately doesn't return Tailwind classes — colors stay in the caller so each surface can match its surrounding palette. Recommended mapping:

```tsx
const cls =
  status === "past_due"   ? "text-red-600" :
  status === "due_today"  ? "text-amber-600" :
  status === "due_soon"   ? "text-amber-600" :
  status === "completed"  ? "text-gray-400 line-through" :
  /* future / none */       "text-gray-500";
```

`due_today` and `due_soon` typically share amber. `past_due` is always red. `completed` always strikes through. `future` and `none` are neutral gray.

## Known consumers (sweep target if API changes)

When changing the helper signature or status enum, update all 6 consumer files:

1. `app/dashboard/page.tsx` — Needs Your Attention items + waiting-on-me + My Rocks
2. `app/meetings/[id]/page.tsx` — Rock+Todo Review row, MeetingItemDetail × 2 references via the helper
3. `app/todos/page.tsx` — list row Due cell + group bucket logic
4. `app/rocks/page.tsx` — milestone List + Gantt + Planner views, rock list Due column
5. `components/RockDetailEditor.tsx` — milestone list, AI suggested milestones (plainDate), AI suggestion banner (plainDate + showYear)
6. `components/MeetingItemDetail.tsx` — linked-todo + linked-milestone date displays

## What NOT to do

- Don't roll a one-off `toLocaleDateString` formatter. Even when the surface "only needs the date" — use `plainDate: true` so future relative-suffix policy changes flow through one helper.
- Don't add Tailwind classes inside `format-due-date.ts`. Keep the lib pure — colors are caller-side.
- Don't introduce a new status bucket without sweeping every consumer. The 5 buckets (`past_due` / `due_today` / `due_soon` / `future` / `completed` + `none` for null) are exhaustive for the kinds of dates the app shows.
- Don't bypass the helper to render a "next deadline" or "soonest due date" field — wrap it in `formatDueDate` even if the input is computed.
- Don't use this helper for non-deadline dates (e.g. `createdAt`, `lastEditedAt`). Those are timestamps, not deadlines — use `toLocaleDateString` or a dedicated timestamp helper.

## Period-keyed storage — normalize to UTC midnight at the API boundary (v0.5.3, 2026-05-17)

Separate concern from rendering. When an entity has a "one row per period" key (weekly scorecard entries, monthly GGOB actuals, quarterly rock targets, etc.), the timestamp anchoring the period MUST be normalized to UTC midnight at the API write boundary AND at read time:

```ts
const weekOf = new Date(Date.UTC(year, month, day));
```

### Why

Uniqueness constraints like `@@unique([metricId, weekOf])` treat midnight UTC and "same day at 6am UTC" as different keys. Without normalization, two writes for the same calendar period create duplicate rows. Symptoms:
- Scorecard double-counts
- Recompute fires twice
- "Did I enter this?" confusion
- Audit trail shows two simultaneous writes

### Where

Apply at BOTH:
- **Write time**: API route normalizes the incoming period anchor before upsert.
- **Read time**: API route normalizes the period anchor in WHERE clauses (otherwise client-side time-of-day drift can miss the constraint match on update).

### Backfill rule (locked 2026-05-17)

When migrating existing period-keyed tables to enforce normalization, **dump conflicts to CSV for manual resolution** rather than auto-merging. Flag-and-skip is the canonical conflict strategy. "Latest createdAt wins" / "sum the values" / "latest updatedAt wins" are all wrong defaults — duplicate-period rows usually have a real business reason for diverging (someone entered data twice with different intent), and silent merge loses information.

Backfill script shape:

```ts
// Pseudocode
for (const conflicts of findDuplicatePeriodRows()) {
  if (conflicts.length === 1) {
    // Normalize timestamp in-place, no merge needed
    await db.entry.update({ where: { id: conflicts[0].id }, data: { weekOf: normalize(conflicts[0].weekOf) } });
  } else {
    // Dump to conflicts.csv with all field values + IDs; do NOT modify
    writeConflictRow(conflicts);
  }
}
```

After the script runs, the dev team reviews `conflicts.csv` and resolves each manually — typically choosing the correct value per entry or merging values intentionally.

### Apply to which entities

Any entity with a unique constraint anchored on a period timestamp. Today (post v3): `MetricEntry(metricId, weekOf)`. Future candidates: GGOB monthly actuals, quarterly Rock targets, any per-month-per-team forecasting tables.

If you're adding a new period-keyed entity, normalize from day one. The backfill rule only applies when retrofitting existing pre-canon data.

## Related canon

- `reference_shared_components.md` — full primitives roster
- `feedback_canonical_role_labels.md` — neighborhood family of small "no mental math" affordances
