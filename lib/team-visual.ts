/**
 * Team visual canon — color + glyph resolution per team.
 *
 * Source of truth for what each team looks like as a `<TeamChip>`. The
 * Team table stores `color` + `glyph` directly so admin-edited tigers can
 * override; this module supplies the canonical defaults for the seeded
 * org-hierarchy teams plus the auto-hashing fallback for tigers without
 * an explicit color.
 *
 * Per `reference_status_pill_semantics.md`:
 *   - Each canonical team has a hand-picked color + glyph.
 *   - Tigers (`kind: "initiative"`) get an auto-hashed color from a
 *     muted palette + Users icon (no glyph) — visually distinct via
 *     the dashed ring on the chip.
 *   - One-on-ones use a single User icon, gray, no glyph.
 *
 * Glyph names map to lucide-react icon imports — consumers do
 * `import { iconNameToComponent } from "lucide-react"` style lookup.
 */

export type TeamKind =
  | "leadership"
  | "group"
  | "department"
  | "cross_function"
  | "initiative"
  | "one_on_one";

/** Hand-picked color + glyph for canonical seeded teams (keyed by team name). */
export const TEAM_VISUAL_DEFAULTS: Record<string, { color: string; glyph: string }> = {
  // Leadership
  "Leadership Team": { color: "#0069AA", glyph: "Crown" },

  // Groups (mid-tier)
  "Service Delivery": { color: "#16A34A", glyph: "Wrench" },
  "Business Operations": { color: "#64748B", glyph: "Building2" },
  "GNR": { color: "#0EA5E9", glyph: "TrendingUp" },

  // Service Delivery → Departments (Core + Professional Services are squads, deferred)
  "Security Practice": { color: "#DC2626", glyph: "Shield" },
  "AI Practice": { color: "#7C3AED", glyph: "Sparkles" },

  // GNR → Departments (GNR = Growth, Navigation, & Relationships — the philosophy of
  // the group; its two departments are Growth and Client Success)
  "Growth": { color: "#D97706", glyph: "DollarSign" },
  "Client Success": { color: "#F58326", glyph: "Heart" },

  // Cross-function
  "HIP": { color: "#14B8A6", glyph: "GitMerge" },
};

/**
 * Muted palette for auto-hashed tiger team colors. Picked to be visually
 * distinct from the canonical department colors above so tigers don't
 * get confused for permanent teams at a glance.
 */
const TIGER_PALETTE = [
  "#A78BFA", // muted purple
  "#FB923C", // muted orange
  "#34D399", // muted green
  "#60A5FA", // muted sky-blue
  "#FBBF24", // muted yellow
  "#F472B6", // muted pink
  "#A3A3A3", // muted gray
  "#94A3B8", // muted slate
  "#67E8F9", // muted cyan
  "#C084FC", // muted violet
  "#FDA4AF", // muted rose
  "#86EFAC", // muted emerald
];

/** Deterministic string hash → palette index. */
function hashTeamName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h << 5) - h + name.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Resolve a team's visual identity. Order of precedence:
 *   1. Explicit `color` + `glyph` on the Team row (admin-set or seed-set).
 *   2. `TEAM_VISUAL_DEFAULTS[name]` for canonical org teams.
 *   3. For `initiative`: auto-hash from name into TIGER_PALETTE, no glyph.
 *   4. For `one_on_one`: gray, single-User icon.
 *   5. Fallback: gray, Users icon.
 */
export function resolveTeamVisual(team: {
  name: string;
  kind?: string | null;
  color?: string | null;
  glyph?: string | null;
}): { color: string; glyph: string; iconName: "Users" | "User" } {
  // 1. Explicit override
  if (team.color && team.glyph) {
    return { color: team.color, glyph: team.glyph, iconName: "Users" };
  }

  // 2. Canonical default by name
  const canonical = TEAM_VISUAL_DEFAULTS[team.name];
  if (canonical) {
    return {
      color: team.color || canonical.color,
      glyph: team.glyph || canonical.glyph,
      iconName: "Users",
    };
  }

  // 3. Initiative — auto-hash, no glyph
  if (team.kind === "initiative") {
    const idx = hashTeamName(team.name) % TIGER_PALETTE.length;
    return {
      color: team.color || TIGER_PALETTE[idx],
      glyph: team.glyph || "",
      iconName: "Users",
    };
  }

  // 4. One-on-one — single user, gray
  if (team.kind === "one_on_one") {
    return { color: team.color || "#9CA3AF", glyph: team.glyph || "", iconName: "User" };
  }

  // 5. Fallback
  return { color: team.color || "#9CA3AF", glyph: team.glyph || "", iconName: "Users" };
}

/** True when the chip should render with a dashed ring (transient teams). */
export function teamRingIsDashed(kind: string | null | undefined): boolean {
  return kind === "initiative";
}
