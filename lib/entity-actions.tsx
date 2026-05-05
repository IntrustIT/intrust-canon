/**
 * Canonical right-click action builder for entity rows. Replaces ~8 inline
 * ContextMenu definitions across /issues /todos /rocks /headlines and the
 * 4 meeting-runner ctx builders. Goal: same vocabulary, same vertical order,
 * same spawn wiring everywhere an entity row appears.
 *
 * The four public builders (`buildIssueActions`, `buildTodoActions`,
 * `buildRockActions`, `buildHeadlineActions`) compose internal helpers.
 * Standard cases (Flag, Archive, Delete, Spawn, Ask Rickety) are handled
 * inside the module — pages don't pass handlers for those. Page-specific
 * actions (Route to Team, Re-classify, Dismiss, Add to next SOI) are
 * passed in via optional context fields.
 */
import type { ReactNode } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Mountain,
  Megaphone,
  Sparkles,
  Flag,
  Calendar,
  FileText,
  Clock,
  Zap,
  Telescope,
  Shuffle,
  Trash2,
  Undo2,
  BarChart3,
  RefreshCw,
  Download,
} from "lucide-react";
import type { ContextMenuItem } from "@/components/ContextMenu";
import { buildSpawnPrefill, type SpawnPrefillResult, type SpawnType, type SpawnParent } from "@/lib/spawn-prefill";
import { confirmDestructive } from "@/lib/confirmDestructive";

// Shared icon className — w-4 h-4 sits cleanly in the menu-item's w-4 wrapper.
const I = "w-4 h-4";

export type EntityType = "issue" | "todo" | "rock" | "headline" | "metric";

interface SoiPlanLite {
  id: string;
  status: string;
  soiDate?: string | null;
  title?: string;
}

export interface EntityActionContext {
  // Open-detail callback. Pages may either set a slide-over state or
  // navigate; the helper just calls this on "Open Details".
  setDetailItem: (item: { id: string; type: EntityType }) => void;

  // Canonical spawn — replaces window.open everywhere. The helper builds
  // the prefill via buildSpawnPrefill and hands the result to this setter,
  // which the page wires to <EntitySpawnStack pending={...} />.
  setSpawnPending: (result: SpawnPrefillResult | null) => void;

  // Toast/feedback for user-visible operations (archive done, delete
  // failed, etc). Match the existing Toast hook shape — `type` is required
  // by useToast (no implicit default).
  showToast: (msg: { message: string; type: "success" | "error" | "info" }) => void;

  // Refresh after archive/delete/flag/reclassify. Most pages have a
  // loadX() helper.
  reload: () => void | Promise<void>;

  // Page-specific hooks (optional). When omitted, the corresponding action
  // is dropped from the menu — except that flag/archive/delete are baked
  // in (no hook needed).

  /** Issues only — opens the route-to-team picker. */
  onRoute?: (entity: { id: string; title: string }) => void;
  /** Issues only — re-classify between Short-Term / Stractical / Long-Term. */
  onReclassify?: (id: string, kind: "short_term" | "stratical" | "long_term") => void | Promise<void>;
  /** Issues only — opens the resolve modal (required resolution note + 5-way
   *  follow-up). When status==="solved" the action becomes "Reopen" and
   *  fires a confirm dialog instead. Page wires this to its existing resolve
   *  flow (setPendingResolve / setResolvedParent on /issues + /meetings). */
  onResolve?: (entity: { id: string; title: string; need?: string | null; description?: string | null; status?: string }) => void;
  /** Issues only — reopen a solved issue (clears resolution + writes
   *  REOPENED: comment). When omitted, falls back to a confirm + direct PUT. */
  onReopen?: (id: string) => void | Promise<void>;
  /** Headlines only — flips the per-team `dismissed` state. */
  onDismiss?: (id: string, next: boolean) => void | Promise<void>;

  /** Metrics only — open the chart drawer for this metric. */
  onOpenChart?: (metricId: string) => void;
  /** Metrics only — halo connector pull (only for halo:* autoSource). */
  onPullMetric?: (metricId: string, depth: "catch_up" | "current" | "tight" | "recent" | "deep") => void;
  /** Metrics only — custom spawn flow (POSTs an Issue/Todo with metricId FK
   *  + navigates away). Distinct from the linkedSpawnItems flow used by
   *  the other 4 entity types. */
  onSpawnFromMetric?: (kind: "issue" | "todo", metric: { id: string; name: string }) => void;

  // Page state for state-dependent labels (Flag/Unflag, Archive/Unarchive).
  flaggedIds?: Set<string>;

  // Meeting-runner context. When `inMeeting && isLeadership && allSoiPlans`
  // is set, the builder appends "Add to next SOI" at the bottom.
  inMeeting?: boolean;
  isLeadership?: boolean;
  allSoiPlans?: SoiPlanLite[];
}

// Internal: dispatch the open-rickety event on every entity. Always
// emitted — Rickety is universally available.
function rocketyItem(parent: SpawnParent): ContextMenuItem {
  const noun = parent.type === "todo" ? "to-do" : parent.type;
  return {
    label: "Ask Rickety",
    icon: <Sparkles className={I} />,
    onClick: () => {
      window.dispatchEvent(
        new CustomEvent("open-rickety", {
          detail: {
            prompt: `How can I help with this ${noun}: "${parent.title}"?`,
            context: { type: parent.type, id: parent.id, title: parent.title },
          },
        })
      );
    },
  };
}

// Canonical icon + label for a "+ Linked X" spawn affordance — used by
// right-click context menus, KebabMenu items, AND modal-body chips
// (e.g. IssueResolveModal's "on resolve, also create:" row). Single
// source of truth so vocabulary stays consistent across surfaces.
//
// Icons are Lucide React components (per session 47 icon-library migration).
// Inline buttons + chips render label-only per the icons-in-menus-only canon
// (reference_panel_vs_modal.md) — they import LINKED_SPAWN_LABEL alone.
export const LINKED_SPAWN_ICON: Record<SpawnType, ReactNode> = {
  todo: <CheckCircle2 className={I} />,
  issue: <AlertTriangle className={I} />,
  rock: <Mountain className={I} />,
  headline: <Megaphone className={I} />,
};
export const LINKED_SPAWN_LABEL: Record<SpawnType, string> = {
  todo: "+ Linked To-Do",
  issue: "+ Linked Issue",
  rock: "+ Linked Rock",
  headline: "+ Linked Headline",
};

// Internal: build the linked-spawn slate for a parent. Each entry calls
// setSpawnPending with the right prefill — fully replaces window.open.
function linkedSpawnItems(parent: SpawnParent, types: SpawnType[], ctx: EntityActionContext): ContextMenuItem[] {
  return types.map((t, idx) => ({
    label: LINKED_SPAWN_LABEL[t],
    icon: LINKED_SPAWN_ICON[t],
    divider: idx === 0,
    onClick: () => {
      const prefill = buildSpawnPrefill(parent, t);
      ctx.setSpawnPending(prefill);
    },
  }));
}

// Internal: flag/unflag via /api/pins. Dispatches `pins-changed` so any
// listening attention list refreshes. Headlines don't support flag — caller
// drops this item from their action set.
function flagItem(entityId: string, type: EntityType, ctx: EntityActionContext): ContextMenuItem {
  const isFlagged = ctx.flaggedIds?.has(entityId) ?? false;
  return {
    label: isFlagged ? "Unflag" : "Flag on Attention",
    icon: <Flag className={I} />,
    onClick: async () => {
      await fetch("/api/pins", {
        method: isFlagged ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType: type, itemId: entityId }),
      }).catch(() => {});
      window.dispatchEvent(new CustomEvent("pins-changed"));
      ctx.reload();
    },
  };
}

// Internal: archive toggle (soft, reversible). All four entities accept
// PUT { archived: boolean } at /api/{type}s/{id}.
function archiveItem(entity: { id: string; archived?: boolean }, type: EntityType, ctx: EntityActionContext): ContextMenuItem {
  const isArchived = !!entity.archived;
  return {
    label: isArchived ? "Unarchive" : "Archive",
    icon: <FileText className={I} />,
    onClick: async () => {
      const route = type === "headline" ? "headlines" : `${type}s`;
      const res = await fetch(`/api/${route}/${entity.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archived: !isArchived }),
      });
      if (!res.ok) {
        ctx.showToast({ message: `Could not ${isArchived ? "unarchive" : "archive"} ${type}.`, type: "error" });
        return;
      }
      ctx.reload();
    },
  };
}

// Internal: hard delete with confirm dialog. Always Rickety-branded via
// confirmDestructive. Note: archive is reversible, delete is not.
function deleteItem(entity: { id: string; title: string }, type: EntityType, ctx: EntityActionContext): ContextMenuItem {
  const TYPE_LABEL: Record<EntityType, string> = {
    issue: "issue",
    todo: "to-do",
    rock: "rock",
    headline: "headline",
    metric: "metric",
  };
  return {
    label: "Delete",
    icon: <Trash2 className={I} />,
    danger: true,
    onClick: async () => {
      const ok = await confirmDestructive({
        title: `Delete this ${TYPE_LABEL[type]}?`,
        message: `"${entity.title}" will be permanently removed along with its comments and links. This cannot be undone.`,
        confirmLabel: "Delete permanently",
      });
      if (!ok) return;
      const route = type === "headline" ? "headlines" : `${type}s`;
      const res = await fetch(`/api/${route}/${entity.id}`, { method: "DELETE" });
      if (!res.ok) {
        ctx.showToast({ message: `Could not delete ${TYPE_LABEL[type]}.`, type: "error" });
        return;
      }
      ctx.showToast({ message: `${TYPE_LABEL[type][0]?.toUpperCase()}${TYPE_LABEL[type].slice(1)} deleted.`, type: "success" });
      ctx.reload();
    },
  };
}

// Internal: "Add to next SOI" — meeting-runner + Leadership-only. Returns
// null when context doesn't qualify so callers can filter out.
function addToSoiItem(entity: { title: string }, ctx: EntityActionContext): ContextMenuItem | null {
  if (!ctx.inMeeting || !ctx.isLeadership || !ctx.allSoiPlans) return null;
  const upcoming = ctx.allSoiPlans
    .filter((p) => p.status === "draft")
    .sort((a, b) => (a.soiDate || "").localeCompare(b.soiDate || ""))[0];
  if (!upcoming) return null;
  return {
    label: "Add to next SOI",
    icon: <Calendar className={I} />,
    divider: true,
    onClick: async () => {
      const r = await fetch(`/api/soi/plans/${upcoming.id}`);
      if (!r.ok) return;
      const plan = await r.json();
      const sec = plan.sections?.[0];
      if (!sec) return;
      await fetch("/api/soi/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionId: sec.id, title: entity.title }),
      });
      ctx.showToast({ message: `Added to "${plan.title}".`, type: "info" });
    },
  };
}

// Internal: append a single nullable item only when present.
function pushIf<T>(arr: T[], item: T | null | undefined): void {
  if (item) arr.push(item);
}

// ── Public per-entity builders ────────────────────────────────────────

/**
 * Issues. Action set (state-flip first, matching /todos and /headlines):
 *   Mark Resolved (or Reopen)
 *   — · Open · Rickety
 *   — · + Linked To-Do · + Linked Issue · + Linked Rock · + Linked Headline
 *   — · Make Short-Term · Make Stractical · Make Long-Term  (omit current)
 *   — · Route to Team · Flag · Archive · Delete
 *   [meeting + Leadership only: + Add to next SOI]
 */
export function buildIssueActions(
  issue: { id: string; title: string; description?: string | null; priority?: number; archived?: boolean; category?: string; isStratical?: boolean; user?: { name?: string } | null; status?: string; need?: string | null },
  ctx: EntityActionContext
): ContextMenuItem[] {
  const parent: SpawnParent = {
    type: "issue",
    id: issue.id,
    title: issue.title,
    description: issue.description ?? undefined,
    priority: issue.priority,
    user: issue.user ?? undefined,
  };
  const items: ContextMenuItem[] = [];

  // State-flip first — parallels Mark Complete (todos) and Dismiss (headlines).
  // Resolving an issue requires a resolution note, so this opens the modal
  // rather than firing a direct PUT. Reopening fires a confirm + clear notes.
  const isResolved = issue.status === "solved";
  if (isResolved) {
    items.push({
      label: "Reopen",
      icon: <Undo2 className={I} />,
      onClick: async () => {
        if (ctx.onReopen) {
          await ctx.onReopen(issue.id);
        } else {
          const ok = await confirmDestructive({
            title: "Reopen this issue?",
            message: "The resolution note will be cleared. The action cannot be undone — you'd have to retype the note if you change your mind.",
            confirmLabel: "Reopen issue",
          });
          if (!ok) return;
          await fetch(`/api/issues/${issue.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "open", resolutionNotes: null }),
          });
          await fetch(`/api/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entityType: "issue", entityId: issue.id, text: "REOPENED:" }),
          }).catch(() => {});
          ctx.reload();
        }
      },
    });
  } else if (ctx.onResolve) {
    items.push({
      label: "Mark Resolved",
      icon: <CheckCircle2 className={I} />,
      onClick: () => ctx.onResolve!({ id: issue.id, title: issue.title, need: issue.need, description: issue.description, status: issue.status }),
    });
  }

  items.push(
    { label: "Open Details", icon: <FileText className={I} />, divider: items.length > 0, onClick: () => ctx.setDetailItem({ id: issue.id, type: "issue" }) },
    rocketyItem(parent),
    ...linkedSpawnItems(parent, ["todo", "issue", "rock", "headline"], ctx),
  );

  // Re-classify subsection (issues only) — omit current type. Both
  // meeting runner and /issues wire onReclassify (s51).
  if (ctx.onReclassify) {
    const currentType: "short_term" | "stratical" | "long_term" =
      (issue.isStratical && issue.category !== "long_term") ? "stratical" :
      issue.category === "long_term" ? "long_term" : "short_term";
    const reItems: { kind: "short_term" | "stratical" | "long_term"; label: string; icon: ReactNode }[] = [
      { kind: "short_term" as const, label: "Make Short-Term", icon: <Clock className={I} /> },
      { kind: "stratical"  as const, label: "Make Stractical", icon: <Zap className={I} /> },
      { kind: "long_term"  as const, label: "Make Long-Term",  icon: <Telescope className={I} /> },
    ];
    let firstReclass = true;
    for (const r of reItems) {
      if (r.kind === currentType) continue;
      items.push({ label: r.label, icon: r.icon, divider: firstReclass, onClick: () => ctx.onReclassify!(issue.id, r.kind) });
      firstReclass = false;
    }
  }

  // Route + Flag + Archive + Delete subsection (always present for issues).
  // Flag-on-Attention skipped inside meetings — see two-flags rule in
  // feedback_meeting_runner_consistency.md (Flag-for-Discussion is the
  // only flag concept inside a meeting).
  let firstAction = true;
  if (ctx.onRoute) {
    items.push({ label: "Route to Team…", icon: <Shuffle className={I} />, divider: firstAction, onClick: () => ctx.onRoute!({ id: issue.id, title: issue.title }) });
    firstAction = false;
  }
  if (!ctx.inMeeting) {
    items.push({ ...flagItem(issue.id, "issue", ctx), divider: firstAction });
    firstAction = false;
  }
  items.push({ ...archiveItem(issue, "issue", ctx), divider: firstAction });
  firstAction = false;
  items.push(deleteItem(issue, "issue", ctx));

  pushIf(items, addToSoiItem(issue, ctx));
  return items;
}

/**
 * Todos. State-flip first to match /issues (Mark Resolved) and /headlines
 * (Dismiss).
 *   Mark Complete (or Mark Incomplete)
 *   — · Open · Rickety
 *   — · + Linked To-Do · + Linked Issue · + Linked Rock · + Linked Headline
 *   — · Flag · Archive · Delete
 *   [meeting + Leadership only: + Add to next SOI]
 */
export function buildTodoActions(
  todo: { id: string; title: string; notes?: string | null; completed?: boolean; archived?: boolean; user?: { name?: string } | null },
  ctx: EntityActionContext & { onToggleComplete: (id: string, next: boolean) => void | Promise<void> }
): ContextMenuItem[] {
  const parent: SpawnParent = {
    type: "todo",
    id: todo.id,
    title: todo.title,
    description: todo.notes ?? undefined,
    user: todo.user ?? undefined,
  };
  // Flag-on-Attention skipped inside meetings — two-flags rule.
  const items: ContextMenuItem[] = [
    { label: todo.completed ? "Mark Incomplete" : "Mark Complete", icon: todo.completed ? "↩️" : "✅", onClick: () => ctx.onToggleComplete(todo.id, !todo.completed) },
    { label: "Open Details", icon: <FileText className={I} />, divider: true, onClick: () => ctx.setDetailItem({ id: todo.id, type: "todo" }) },
    rocketyItem(parent),
    ...linkedSpawnItems(parent, ["todo", "issue", "rock", "headline"], ctx),
  ];
  if (!ctx.inMeeting) {
    items.push({ ...flagItem(todo.id, "todo", ctx), divider: true });
    items.push(archiveItem(todo, "todo", ctx));
  } else {
    items.push({ ...archiveItem(todo, "todo", ctx), divider: true });
  }
  items.push(deleteItem(todo, "todo", ctx));
  pushIf(items, addToSoiItem(todo, ctx));
  return items;
}

/**
 * Rocks. No "+ Linked Rock" — too heavy a unit to spawn from a row click.
 *   Open
 *   — · + Linked To-Do · + Linked Issue · + Linked Headline
 *   — · Flag · Archive · Delete
 *   [meeting + Leadership only: + Add to next SOI]
 */
export function buildRockActions(
  rock: { id: string; title: string; description?: string | null; archived?: boolean; user?: { name?: string } | null },
  ctx: EntityActionContext
): ContextMenuItem[] {
  const parent: SpawnParent = {
    type: "rock",
    id: rock.id,
    title: rock.title,
    description: rock.description ?? undefined,
    user: rock.user ?? undefined,
  };
  // Flag-on-Attention skipped inside meetings — two-flags rule.
  const items: ContextMenuItem[] = [
    { label: "Open Details", icon: <FileText className={I} />, onClick: () => ctx.setDetailItem({ id: rock.id, type: "rock" }) },
    rocketyItem(parent),
    ...linkedSpawnItems(parent, ["todo", "issue", "headline"], ctx),
  ];
  if (!ctx.inMeeting) {
    items.push({ ...flagItem(rock.id, "rock", ctx), divider: true });
    items.push(archiveItem(rock, "rock", ctx));
  } else {
    items.push({ ...archiveItem(rock, "rock", ctx), divider: true });
  }
  items.push(deleteItem(rock, "rock", ctx));
  pushIf(items, addToSoiItem(rock, ctx));
  return items;
}

/**
 * Headlines. State-flip (Dismiss) first to match /todos (Mark Complete)
 * and /issues (Mark Resolved). No "+ Linked Headline" + no Flag (Dismiss
 * covers the "hide this" use case).
 *   Dismiss (or Undismiss)
 *   — · Open · Rickety
 *   — · + Linked To-Do · + Linked Issue · + Linked Rock
 *   — · Archive · Delete
 *   [meeting + Leadership only: + Add to next SOI]
 */
export function buildHeadlineActions(
  headline: { id: string; title: string; archived?: boolean; dismissed?: boolean; user?: { name?: string } | null },
  ctx: EntityActionContext
): ContextMenuItem[] {
  const parent: SpawnParent = {
    type: "headline",
    id: headline.id,
    title: headline.title,
    user: headline.user ?? undefined,
  };
  const items: ContextMenuItem[] = [];

  // State-flip first — parallels Mark Complete (todos) + Mark Resolved (issues).
  if (ctx.onDismiss) {
    items.push({
      label: headline.dismissed ? "Undismiss" : "Dismiss",
      icon: headline.dismissed ? "↩️" : "👀",
      onClick: () => ctx.onDismiss!(headline.id, !headline.dismissed),
    });
  }

  items.push(
    { label: "Open Details", icon: <FileText className={I} />, divider: items.length > 0, onClick: () => ctx.setDetailItem({ id: headline.id, type: "headline" }) },
    rocketyItem(parent),
    ...linkedSpawnItems(parent, ["todo", "issue", "rock"], ctx),
    { ...archiveItem(headline, "headline", ctx), divider: true },
    deleteItem(headline, "headline", ctx),
  );
  pushIf(items, addToSoiItem(headline, ctx));
  return items;
}

/**
 * Scorecard metrics. Mirrors the inline menu /scorecard had before the
 * builder existed. The metric spawn flow is custom (onSpawnFromMetric)
 * because issues spawned from metrics carry a `metricId` FK back to
 * the source — different from the linkedSpawnItems prefill flow.
 *   Open Details
 *   — · Spawn Issue · Spawn To-Do · Rickety
 *   — · View chart
 *   [halo only] · Catch up · Re-pull last · Re-pull tight · Re-pull recent · Deep backfill
 *   — · Archive (or Restore)  [omitted for live connector-backed metrics]
 *   — · Delete  [omitted for connector-backed metrics]
 *   [meeting + Leadership only: + Add to next SOI]
 *
 * Note: no Flag-on-Attention — metrics use the in-meeting Flag-for-Discussion
 * (separate UI affordance) per the two-flags rule
 * (feedback_meeting_runner_consistency.md). Same rule that gates Flag on
 * the other 4 builders by `ctx.inMeeting` applies here by default
 * (metrics never get Flag-on-Attention regardless of context).
 */
export function buildMetricActions(
  metric: { id: string; name: string; archived?: boolean; autoSource?: string | null },
  ctx: EntityActionContext
): ContextMenuItem[] {
  const items: ContextMenuItem[] = [
    { label: "Open Details", icon: <FileText className={I} />, onClick: () => ctx.setDetailItem({ id: metric.id, type: "metric" }) },
  ];
  if (ctx.onSpawnFromMetric) {
    items.push({ label: "Spawn Issue", icon: <AlertTriangle className={I} />, divider: true, onClick: () => ctx.onSpawnFromMetric!("issue", { id: metric.id, name: metric.name }) });
    items.push({ label: "Spawn To-Do", icon: <CheckCircle2 className={I} />, onClick: () => ctx.onSpawnFromMetric!("todo", { id: metric.id, name: metric.name }) });
  }
  // Rickety always available.
  items.push({
    label: "Ask Rickety",
    icon: <Sparkles className={I} />,
    onClick: () => {
      window.dispatchEvent(
        new CustomEvent("open-rickety", {
          detail: {
            prompt: `How can I help with this metric: "${metric.name}"?`,
            context: { type: "metric", id: metric.id, title: metric.name },
          },
        })
      );
    },
  });
  if (ctx.onOpenChart) {
    items.push({ label: "View chart", icon: <BarChart3 className={I} />, divider: true, onClick: () => ctx.onOpenChart!(metric.id) });
  }
  // Halo connector pulls — only for halo:* metrics with onPullMetric wired.
  if (metric.autoSource?.startsWith?.("halo:") && ctx.onPullMetric) {
    items.push({ label: "Catch up (fill missing periods)", icon: <RefreshCw className={I} />, divider: true, onClick: () => ctx.onPullMetric!(metric.id, "catch_up") });
    items.push({ label: "Re-pull last completed period", icon: <Download className={I} />, onClick: () => ctx.onPullMetric!(metric.id, "current") });
    items.push({ label: "Re-pull tight window", icon: <Download className={I} />, onClick: () => ctx.onPullMetric!(metric.id, "tight") });
    items.push({ label: "Re-pull recent window", icon: <Download className={I} />, onClick: () => ctx.onPullMetric!(metric.id, "recent") });
    items.push({ label: "Deep backfill (year+)", icon: <Download className={I} />, onClick: () => ctx.onPullMetric!(metric.id, "deep") });
  }
  // Archive: live connector-backed metrics can't be archived (would break
  // the integration). Already-archived ones can be Restored. Pure manual
  // metrics use the standard archive helper.
  if (!metric.autoSource || metric.archived) {
    items.push({ ...archiveItem(metric, "metric", ctx), divider: true });
  }
  // Delete: connector-backed metrics never delete from the UI (loss of
  // history + dependent formulas).
  if (!metric.autoSource) {
    items.push(deleteItem({ id: metric.id, title: metric.name }, "metric", ctx));
  }
  pushIf(items, addToSoiItem({ title: metric.name }, ctx));
  return items;
}
