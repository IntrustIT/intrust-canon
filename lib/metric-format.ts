export const goalTypeSymbols: Record<string, string> = { gte: "≥", lte: "≤", eq: "=" };

export function meetsGoal(value: number, goal: number, goalType: string): boolean {
  switch (goalType) {
    case "lte": return value <= goal;
    case "eq": return value === goal;
    default: return value >= goal;
  }
}

export function formatValue(value: number | null | undefined, unit: string): string {
  if (value === null || value === undefined) return "—";
  if (unit === "$") {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  }
  if (unit === "%") return `${value}%`;
  if (unit === "min") return `${value}m`;
  return String(value);
}
