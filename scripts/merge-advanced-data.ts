import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

type SourceEntry = { cardId: number; name: string; imageUrl: string; textEn: string };
type BatchEntry = { cardId: number; textPt: string };
type AdvancedCardEntry = SourceEntry & { textPt: string };

async function main() {
  const dataDir = path.join(__dirname, "..", "data");

  const sourceRaw = await readFile(path.join(dataDir, "advanced-source.json"), "utf-8");
  const source: SourceEntry[] = JSON.parse(sourceRaw);

  const translationByCardId = new Map<number, string>();
  const files = await readdir(dataDir);
  const batchFiles = files.filter(
    (file) => file.startsWith("advanced-batch-") && file.endsWith(".json")
  );

  for (const file of batchFiles) {
    const batchRaw = await readFile(path.join(dataDir, file), "utf-8");
    const batch: BatchEntry[] = JSON.parse(batchRaw);
    for (const entry of batch) {
      translationByCardId.set(entry.cardId, entry.textPt);
    }
  }

  const missing: number[] = [];
  const merged: AdvancedCardEntry[] = source.map((entry) => {
    const textPt = translationByCardId.get(entry.cardId);
    if (!textPt || textPt.trim().length === 0) missing.push(entry.cardId);
    return { ...entry, textPt: textPt ?? "" };
  });

  if (missing.length > 0) {
    console.error(`Missing translations for ${missing.length} card id(s): ${missing.join(", ")}`);
    console.error(
      "No file was written. Add the missing entries to one of the data/advanced-batch-*.json files and rerun."
    );
    process.exit(1);
  }

  await writeFile(path.join(dataDir, "advanced.json"), JSON.stringify(merged, null, 2));
  console.log(`Wrote data/advanced.json with ${merged.length} entries.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
