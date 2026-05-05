"use client";

import type { ReactNode } from "react";

export type AlertTone = "info" | "warning" | "danger" | "success";

interface AlertBannerProps {
  tone: AlertTone;
  /** Bold first line. */
  title: ReactNode;
  /** Subtitle / description — optional. */
  description?: ReactNode;
  /** Optional right-side action. */
  action?: ReactNode;
  /** Optional icon override — defaults to tone-appropriate icon. */
  icon?: ReactNode;
  className?: string;
}

const TONE_CLASSES: Record<AlertTone, {
  borderL: string;
  gradient: string;
  borderRY: string;
  iconBg: string;
  iconColor: string;
  titleText: string;
  descText: string;
}> = {
  info: {
    borderL: "border-l-[#0069AA]",
    gradient: "from-[#0069AA]/10 to-[#0069AA]/[0.04]",
    borderRY: "border-[#0069AA]/20",
    iconBg: "bg-[#0069AA]/15",
    iconColor: "text-[#0069AA]",
    titleText: "text-[#0069AA]",
    descText: "text-[#0069AA]/80",
  },
  warning: {
    borderL: "border-l-amber-500",
    gradient: "from-amber-50 to-amber-50/40",
    borderRY: "border-amber-100",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    titleText: "text-amber-900",
    descText: "text-amber-700/90",
  },
  danger: {
    borderL: "border-l-red-500",
    gradient: "from-red-50 to-red-50/40",
    borderRY: "border-red-100",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    titleText: "text-red-900",
    descText: "text-red-700/90",
  },
  success: {
    borderL: "border-l-green-500",
    gradient: "from-green-50 to-green-50/40",
    borderRY: "border-green-100",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    titleText: "text-green-900",
    descText: "text-green-700/90",
  },
};

function DefaultIcon({ tone }: { tone: AlertTone }) {
  // Info: info-circle. Warning: clock. Danger: exclamation-circle. Success: check-circle.
  if (tone === "info") {
    return (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (tone === "warning") {
    return (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  if (tone === "danger") {
    return (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }
  // success
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/**
 * Consistent alert banner for the app.
 * Pattern: left-border accent + soft gradient bg + icon-in-chip + title/description stack + optional right-side action.
 * Use instead of ad-hoc `bg-*-50 border-*-200 rounded-lg` boxes.
 */
export default function AlertBanner({ tone, title, description, action, icon, className = "" }: AlertBannerProps) {
  const c = TONE_CLASSES[tone];
  return (
    <div
      className={`flex items-center gap-3 pl-3 pr-2.5 py-2.5 rounded-lg border-l-4 bg-gradient-to-r border-y border-r ${c.borderL} ${c.gradient} ${c.borderRY} ${className}`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${c.iconBg} ${c.iconColor}`}>
        {icon ?? <DefaultIcon tone={tone} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold leading-tight ${c.titleText}`}>{title}</div>
        {description && (
          <div className={`text-xs mt-0.5 leading-snug ${c.descText}`}>{description}</div>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
