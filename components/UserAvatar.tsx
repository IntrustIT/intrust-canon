"use client";

import { Tooltip } from "./Tooltip";

export function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((p) => p[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type UserAvatarProps = {
  name: string | null | undefined;
  size?: "xs" | "sm" | "md";
  /**
   * The role the user plays relative to this entity. Prefixes the
   * tooltip so the avatar is self-describing in context — e.g.
   * "Raised by: Alice", "Assigned to: Bob", "Owner: Carol",
   * "Shared by: Dave". Pass undefined for a name-only tooltip.
   */
  role?: "Owner" | "Assigned to" | "Raised by" | "Shared by" | "Due to";
  /** Override the entire tooltip text (rare — prefer `role`). */
  tooltip?: string;
  className?: string;
};

const SIZE_CLASSES: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  xs: "w-5 h-5 text-[9px]",
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
};

export default function UserAvatar({ name, size = "sm", role, tooltip, className = "" }: UserAvatarProps) {
  const safeName = name || "Unknown";
  const tipText = tooltip ?? (role ? `${role}: ${safeName}` : safeName);
  const inner = (
    <div
      className={`${SIZE_CLASSES[size]} rounded-full flex items-center justify-center font-medium text-white flex-shrink-0 ${className}`}
      style={{ backgroundColor: "#0069AA" }}
      aria-label={tipText}
    >
      {getInitials(safeName)}
    </div>
  );
  return <Tooltip text={tipText}>{inner}</Tooltip>;
}
