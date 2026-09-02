import type { ProgressMap } from "./types";

const STORAGE_KEY = "lorcana-vocab-progress";
const MAX_LEVEL = 3;

export function loadProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressMap;
  } catch {
    return {};
  }
}

export function saveProgress(progress: ProgressMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Best-effort: private browsing / quota errors just mean progress
    // won't persist this session.
  }
}

export function getLevel(progress: ProgressMap, term: string): number {
  return progress[term]?.level ?? 0;
}

export function markKnown(progress: ProgressMap, term: string): ProgressMap {
  const nextLevel = Math.min(getLevel(progress, term) + 1, MAX_LEVEL);
  return {
    ...progress,
    [term]: { level: nextLevel, lastSeenAt: new Date().toISOString() },
  };
}

export function markUnknown(progress: ProgressMap, term: string): ProgressMap {
  return {
    ...progress,
    [term]: { level: 0, lastSeenAt: new Date().toISOString() },
  };
}

export function isDominated(progress: ProgressMap, term: string): boolean {
  return getLevel(progress, term) >= MAX_LEVEL;
}
