import type { ProgressMap, VocabularyEntry } from "./types";

export const DEFAULT_SESSION_SIZE = 20;

export function buildSession(
  vocabulary: VocabularyEntry[],
  progress: ProgressMap,
  sessionSize: number = DEFAULT_SESSION_SIZE
): VocabularyEntry[] {
  const withLevel = vocabulary.map((entry) => ({
    entry,
    level: progress[entry.term]?.level ?? 0,
    lastSeenAt: progress[entry.term]?.lastSeenAt ?? "",
  }));

  withLevel.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.lastSeenAt.localeCompare(b.lastSeenAt);
  });

  return withLevel.slice(0, sessionSize).map((item) => item.entry);
}
