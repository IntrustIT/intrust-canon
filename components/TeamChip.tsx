"use client";

import { Tooltip } from "@/components/Tooltip";
import { resolveTeamVisual, teamRingIsDashed } from "@/lib/team-visual";
import {
  Users,
  User,
  Crown,
  Wrench,
  Building2,
  TrendingUp,
  Shield,
  Sparkles,
  Heart,
  DollarSign,
  GitMerge,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Map glyph string (stored on Team.glyph) → lucide icon component. Add
 * new entries here when seeding new teams. Falls back to no glyph badge
 * for unknown names — the team color + Users icon still render.
 *
 * Squads (Core, Professional Services) and the deferred Business-Ops
 * sub-departments (Finance, HR) intentionally aren't registered yet —
 * they land here when their concepts are formalized.
 */
const GLYPH_REGISTRY: Record<string, LucideIcon> = {
  Crown,
  Wrench,
  Building2,
  TrendingUp,
  Shield,
  Sparkles,
  Heart,
  DollarSign,
  GitMerge,
};

export type TeamChipSize = "xs" | "sm" | "md";

export interface TeamChipProps {
  team: {
    id?: string;
    name: string;
    kind?: string | null;
    color?: string | null;
    glyph?: string | null;
  };
  /** Avatar size. Default `md` (32px) — intentionally larger than the
   *  default `<UserAvatar size="sm">` (24px) so team-vs-user is
   *  distinguishable at a glance. Use `sm` for tight contexts (compact
   *  popover items) and `xs` only when truly cramped. */
  size?: TeamChipSize;
  /** Optional click handler — when set, the chip becomes a button. */
  onClick?: () => void;
  /** Extra className appended to the outer wrapper. */
  className?: string;
}

/**
 * Canonical team avatar. Mirrors `<UserAvatar>`: a solid colored circle
 * with the Users icon centered, dept glyph as a small badge overlay in
 * the bottom-right corner, team name in the tooltip.
 *
 * Visual:
 *   - Solid team-color circle (matches UserAvatar's brand-blue background)
 *   - Centered white Users icon (the "this is a team" anchor)
 *   - Optional glyph badge in bottom-right (Heart for Client Success,
 *     Shield for Security Practice, etc.)
 *   - Initiative teams get a dashed ring around the circle (transient)
 *   - One-on-one teams render a single User icon instead of Users
 *
 * No inline text. Name is tooltip-only — the chip IS the avatar.
 * If consumers want a name beside the chip, they render the text as a
 * sibling element.
 *
 * Per `reference_status_pill_semantics.md`.
 */
export default function TeamChip({ team, size = "md", onClick, className = "" }: TeamChipProps) {
  const { color, glyph, iconName } = resolveTeamVisual(team);
  const dashed = teamRingIsDashed(team.kind);

  const PrimaryIcon = iconName === "User" ? User : Users;
  const GlyphIcon = glyph && GLYPH_REGISTRY[glyph] ? GLYPH_REGISTRY[glyph] : null;

  const sizeMap = {
    xs: { circle: "w-5 h-5", icon: "w-3 h-3", badge: "w-3 h-3", glyph: "w-2 h-2" },
    sm: { circle: "w-6 h-6", icon: "w-3.5 h-3.5", badge: "w-3.5 h-3.5", glyph: "w-2.5 h-2.5" },
    md: { circle: "w-8 h-8", icon: "w-4 h-4", badge: "w-4 h-4", glyph: "w-3 h-3" },
  } as const;
  const sz = sizeMap[size];

  const Wrapper: "button" | "span" = onClick ? "button" : "span";

  return (
    <Tooltip text={team.name}>
      <Wrapper
        type={onClick ? "button" : undefined}
        onClick={onClick}
        className={`relative inline-flex items-center justify-center ${sz.circle} rounded-full text-white flex-shrink-0 ${dashed ? "ring-2 ring-offset-1" : ""} ${onClick ? "hover:opacity-90" : ""} ${className}`}
        style={{
          backgroundColor: color,
          // Tailwind ring-color via CSS var so it picks up the team color
          ...(dashed ? { boxShadow: `0 0 0 1px ${color}, 0 0 0 3px white, 0 0 0 4px ${color}` } : {}),
        }}
        aria-label={team.name}
      >
        <PrimaryIcon className={sz.icon} />
        {GlyphIcon && (
          <span
            className={`absolute -bottom-0.5 -right-0.5 inline-flex items-center justify-center ${sz.badge} rounded-full bg-white shadow-sm`}
            style={{ color }}
            aria-hidden="true"
          >
            <GlyphIcon className={sz.glyph} />
          </span>
        )}
      </Wrapper>
    </Tooltip>
  );
}
