import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchAllCardsWithSets } from "./lib/fetchCards";

type SourceEntry = {
  cardId: number;
  name: string;
  imageUrl: string;
  textEn: string;
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

async function main() {
  console.log("Downloading LorcanaJSON data set...");
  const { cards, sets } = await fetchAllCardsWithSets();

  const today = todayIso();
  const releasedSets = Object.entries(sets)
    .filter(([, set]) => Boolean(set.releaseDate) && set.releaseDate! <= today)
    .sort((a, b) => b[1].releaseDate!.localeCompare(a[1].releaseDate!));

  if (releasedSets.length === 0) {
    throw new Error("No released sets found in the LorcanaJSON data set.");
  }

  const [latestSetCode, latestSet] = releasedSets[0];
  console.log(
    `Latest released set: ${latestSet.name} (${latestSetCode}, ${latestSet.releaseDate})`
  );

  const entries: SourceEntry[] = cards
    .filter(
      (card) =>
        card.setCode === latestSetCode &&
        card.fullText &&
        card.fullText.trim().length > 0
    )
    .map((card) => ({
      cardId: card.id,
      name: card.fullName,
      imageUrl: card.images.full,
      textEn: card.fullText as string,
    }))
    .sort((a, b) => a.cardId - b.cardId);

  console.log(`Found ${entries.length} cards with ability text in this set.`);

  const dataDir = path.join(__dirname, "..", "data");
  await writeFile(
    path.join(dataDir, "advanced-source.json"),
    JSON.stringify(entries, null, 2)
  );

  console.log(`Wrote ${entries.length} entries to data/advanced-source.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
