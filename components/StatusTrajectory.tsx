"use client";

import { useState, useRef, useEffect } from "react";
import { Tooltip } from "@/components/Tooltip";

type Status = "on_track" | "at_risk" | "off_track" | "confused";
type Trajectory = "improving" | "stable" | "declining";

const statusColors: Record<Status, string> = {
  on_track: "#22C55E",
  at_risk: "#EAB308",
  off_track: "#EF4444",
  confused: "#9CA3AF",
};

const statusLabels: Record<Status, string> = {
  on_track: "On Track",
  at_risk: "At Risk",
  off_track: "Off Track",
  confused: "Confused",
};

const trajectoryArrows: Record<Trajectory, { symbol: string; color: string }> = {
  improving: { symbol: "\u2191", color: "#22C55E" },
  stable: { symbol: "\u2192", color: "#9CA3AF" },
  declining: { symbol: "\u2193", color: "#EF4444" },
};

const trajectoryLabels: Record<Trajectory, string> = {
  improving: "Improving",
  stable: "Stable",
  declining: "Declining",
};

interface StatusTrajectoryProps {
  status: Status;
  trajectory: Trajectory;
  onChange?: (updates: { status?: Status; trajectory?: Trajectory }) => void;
  size?: "sm" | "md";
  showLabels?: boolean;
}

const allStatuses: Status[] = ["on_track", "at_risk", "off_track", "confused"];
const allTrajectories: Trajectory[] = ["improving", "stable", "declining"];

export default function StatusTrajectory({
  status,
  trajectory,
  onChange,
  size = "md",
  showLabels = false,
}: StatusTrajectoryProps) {
  const dotSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const arrowSize = size === "sm" ? "text-sm" : "text-lg";

  const [statusOpen, setStatusOpen] = useState(false);
  const [trajectoryOpen, setTrajectoryOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const trajectoryRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusOpen(false);
      }
      if (trajectoryRef.current && !trajectoryRef.current.contains(e.target as Node)) {
        setTrajectoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (onChange) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative" ref={statusRef}>
          <Tooltip text={statusLabels[status]}><button
            onClick={() => { setStatusOpen(!statusOpen); setTrajectoryOpen(false); }}
            className={`${dotSize} rounded-full border-2 border-white shadow-sm cursor-pointer`}
            style={{ backgroundColor: statusColors[status] }}
          /></Tooltip>
          {statusOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
              {allStatuses.map((s) => (
                <button
                  key={s}
                  onClick={() => { onChange({ status: s }); setStatusOpen(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 ${
                    s === status ? "font-semibold" : ""
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: statusColors[s] }}
                  />
                  {statusLabels[s]}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="relative" ref={trajectoryRef}>
          <Tooltip text={trajectoryLabels[trajectory]}><button
            onClick={() => { setTrajectoryOpen(!trajectoryOpen); setStatusOpen(false); }}
            className={`${arrowSize} font-bold leading-none cursor-pointer`}
            style={{ color: trajectoryArrows[trajectory].color }}
          >
            {trajectoryArrows[trajectory].symbol}
          </button></Tooltip>
          {trajectoryOpen && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
              {allTrajectories.map((t) => (
                <button
                  key={t}
                  onClick={() => { onChange({ trajectory: t }); setTrajectoryOpen(false); }}
                  className={`flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 ${
                    t === trajectory ? "font-semibold" : ""
                  }`}
                >
                  <span
                    className="font-bold"
                    style={{ color: trajectoryArrows[t].color }}
                  >
                    {trajectoryArrows[t].symbol}
                  </span>
                  {trajectoryLabels[t]}
                </button>
              ))}
            </div>
          )}
        </div>
        {showLabels && (
          <span className="text-xs text-gray-500">
            {statusLabels[status]} &middot; {trajectoryLabels[trajectory]}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Tooltip text={statusLabels[status]}><span
        className={`${dotSize} rounded-full inline-block`}
        style={{ backgroundColor: statusColors[status] }}
      /></Tooltip>
      <Tooltip text={trajectoryLabels[trajectory]}><span
        className={`${arrowSize} font-bold leading-none`}
        style={{ color: trajectoryArrows[trajectory].color }}
      >
        {trajectoryArrows[trajectory].symbol}
      </span></Tooltip>
      {showLabels && (
        <span className="text-xs text-gray-500">
          {statusLabels[status]} &middot; {trajectoryLabels[trajectory]}
        </span>
      )}
    </div>
  );
}

export type { Status, Trajectory };
export { statusColors, statusLabels, trajectoryArrows, trajectoryLabels, allStatuses, allTrajectories };
