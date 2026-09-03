import type { ProgressMap } from "./types";

export const DEFAULT_SESSION_SIZE = 20;

export function buildSession<T>(
  items: T[],
  progress: ProgressMap,
  getKey: (item: T) => string,
  sessionSize: number = DEFAULT_SESSION_SIZE
): T[] {
  const withLevel = items.map((item) => {
    const key = getKey(item);
    return {
      item,
      level: progress[key]?.level ?? 0,
      lastSeenAt: progress[key]?.lastSeenAt ?? "",
    };
  });

  withLevel.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.lastSeenAt.localeCompare(b.lastSeenAt);
  });

  return withLevel.slice(0, sessionSize).map((entry) => entry.item);
}
