/**
 * Date helpers — pure, timezone-aware via the user's local time.
 *
 * For dev mode we use the server's clock; in production with auth, we'd
 * derive the user's local date from their stored timezone.
 */

export function todayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function dayDifference(startDate: string, today: string): number {
  const start = new Date(`${startDate}T00:00:00Z`);
  const cur = new Date(`${today}T00:00:00Z`);
  const diffMs = cur.getTime() - start.getTime();
  return Math.floor(diffMs / 86400000);
}

export function dayNumber(startDate: string, today: string): number {
  // Day 1 = the start date itself
  return Math.max(1, dayDifference(startDate, today) + 1);
}

/**
 * Format a YYYY-MM-DD into a friendly "Mon Apr 7" style.
 */
export function formatShortDate(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * All YYYY-MM-DD dates from start (inclusive) for `count` days.
 */
export function dateRange(startDate: string, count: number): string[] {
  const start = new Date(`${startDate}T00:00:00Z`);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    out.push(d.toISOString().split("T")[0]);
  }
  return out;
}
