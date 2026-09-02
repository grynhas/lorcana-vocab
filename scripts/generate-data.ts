import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchAllCards, type LorcanaCard } from "./lib/fetchCards";
import { countTerms, rankTerms, type RankedTerm } from "./lib/processCards";
import { TRANSLATIONS } from "./lib/translations";
import type { VocabularyEntry, CardSummary, TermCategory } from "../lib/types";

const TOP_GENERAL_COUNT = 250;
const TOP_KEYWORD_COUNT = 50;

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toVocabularyEntry(
  ranked: RankedTerm,
  category: TermCategory,
  missingTranslations: string[],
  referencedCardIds: Set<number>
): VocabularyEntry {
  const translation = TRANSLATIONS[ranked.term];
  if (!translation) missingTranslations.push(ranked.term);
  for (const example of ranked.examples) referencedCardIds.add(example.cardId);
  return {
    term: category === "keyword" ? titleCase(ranked.term) : ranked.term,
    category,
    translation: translation ?? "",
    frequency: ranked.frequency,
    examples: ranked.examples.map((example) => ({
      cardId: example.cardId,
      textSnippet: example.textSnippet,
    })),
  };
}

async function main() {
  console.log("Downloading LorcanaJSON data set...");
  const cards = await fetchAllCards();
  console.log(`Loaded ${cards.length} cards.`);

  const { general, keywords } = countTerms(cards);
  const rankedGeneral = rankTerms(general, TOP_GENERAL_COUNT);
  const rankedKeywords = rankTerms(keywords, TOP_KEYWORD_COUNT);

  const missingTranslations: string[] = [];
  const referencedCardIds = new Set<number>();

  const vocabulary: VocabularyEntry[] = [
    ...rankedKeywords.map((entry) =>
      toVocabularyEntry(entry, "keyword", missingTranslations, referencedCardIds)
    ),
    ...rankedGeneral.map((entry) =>
      toVocabularyEntry(entry, "geral", missingTranslations, referencedCardIds)
    ),
  ];

  if (missingTranslations.length > 0) {
    console.error("Missing translations for the following terms:");
    for (const term of [...new Set(missingTranslations)].sort()) {
      console.error(`  - ${term}`);
    }
    console.error(
      "\nAdd each one to scripts/lib/translations.ts (same lowercase-key style as the " +
        "existing entries), then run `npm run generate-data` again. No files were written."
    );
    process.exit(1);
  }

  const cardById = new Map(cards.map((card) => [card.id, card]));
  const cardSummaries: CardSummary[] = Array.from(referencedCardIds)
    .map((id) => cardById.get(id))
    .filter((card): card is LorcanaCard => card !== undefined)
    .map((card) => ({
      id: card.id,
      name: card.fullName,
      type: card.type,
      cost: card.cost ?? 0,
      imageUrl: card.images.full,
    }));

  const dataDir = path.join(__dirname, "..", "data");
  await writeFile(path.join(dataDir, "vocabulary.json"), JSON.stringify(vocabulary, null, 2));
  await writeFile(path.join(dataDir, "cards.json"), JSON.stringify(cardSummaries, null, 2));

  console.log(
    `Wrote ${vocabulary.length} vocabulary entries and ${cardSummaries.length} card summaries.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
