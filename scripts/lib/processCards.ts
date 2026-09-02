import { tokenize } from "./tokenize";
import { STOPWORDS } from "./stopwords";
import type { LorcanaCard } from "./fetchCards";

export type TermExample = {
  cardId: number;
  textSnippet: string;
};

type TermData = {
  count: number;
  examples: TermExample[];
  exampleCardIds: Set<number>;
};

export type CountsMap = Map<string, TermData>;

const MAX_EXAMPLES = 3;

function addOccurrence(counts: CountsMap, term: string, cardId: number, snippet: string): void {
  const existing = counts.get(term) ?? {
    count: 0,
    examples: [],
    exampleCardIds: new Set<number>(),
  };
  existing.count += 1;
  if (existing.examples.length < MAX_EXAMPLES && !existing.exampleCardIds.has(cardId)) {
    existing.examples.push({ cardId, textSnippet: snippet });
    existing.exampleCardIds.add(cardId);
  }
  counts.set(term, existing);
}

export function countTerms(cards: LorcanaCard[]): {
  general: CountsMap;
  keywords: CountsMap;
} {
  const general: CountsMap = new Map();
  const keywords: CountsMap = new Map();

  for (const card of cards) {
    if (!card.abilities) continue;
    for (const ability of card.abilities) {
      if (ability.type === "keyword") {
        addOccurrence(keywords, ability.keyword.toLowerCase(), card.id, ability.fullText);
        continue;
      }
      const words = tokenize(ability.effect).filter((word) => !STOPWORDS.has(word));
      for (const word of words) {
        addOccurrence(general, word, card.id, ability.effect);
      }
    }
  }

  return { general, keywords };
}

export type RankedTerm = {
  term: string;
  frequency: number;
  examples: TermExample[];
};

export function rankTerms(counts: CountsMap, limit: number): RankedTerm[] {
  return Array.from(counts.entries())
    .map(([term, data]) => ({ term, frequency: data.count, examples: data.examples }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit);
}
