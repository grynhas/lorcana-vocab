import { describe, expect, it } from "vitest";
import { buildSession } from "../session";
import type { VocabularyEntry } from "../types";

function makeEntry(term: string): VocabularyEntry {
  return { term, category: "geral", translation: "x", frequency: 1, examples: [] };
}

const byTerm = (entry: VocabularyEntry) => entry.term;

describe("buildSession", () => {
  it("prioritizes lower-level terms first", () => {
    const vocabulary = [makeEntry("a"), makeEntry("b"), makeEntry("c")];
    const progress = {
      a: { level: 2, lastSeenAt: "" },
      b: { level: 0, lastSeenAt: "" },
    };
    const session = buildSession(vocabulary, progress, byTerm, 3);
    expect(session.map((entry) => entry.term)).toEqual(["b", "c", "a"]);
  });

  it("returns fewer than sessionSize when vocabulary is smaller", () => {
    const vocabulary = [makeEntry("a"), makeEntry("b")];
    const session = buildSession(vocabulary, {}, byTerm, 20);
    expect(session).toHaveLength(2);
  });

  it("treats terms with no progress entry as level 0", () => {
    const vocabulary = [makeEntry("a"), makeEntry("b")];
    const progress = { a: { level: 3, lastSeenAt: "" } };
    const session = buildSession(vocabulary, progress, byTerm, 2);
    expect(session[0].term).toBe("b");
  });

  it("works with a non-VocabularyEntry item shape via a custom key extractor", () => {
    type Card = { cardId: number; label: string };
    const cards: Card[] = [
      { cardId: 1, label: "one" },
      { cardId: 2, label: "two" },
    ];
    const progress = { "1": { level: 2, lastSeenAt: "" } };
    const session = buildSession(cards, progress, (c) => String(c.cardId), 2);
    expect(session.map((c) => c.label)).toEqual(["two", "one"]);
  });
});
