# Advanced Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **Exception:** Task 5 is explicitly executed differently — see its own instructions — because it requires 5 parallel translation subagents instead of one implementer.

**Goal:** Add a second study mode ("Avançado") to Lorcana Vocab that trains reading full card rules-text (English + Portuguese), scoped to the most recently released Lorcana set, with its own session flow and its own progress tracking, separate from the existing Vocabulary mode.

**Architecture:** A new data pipeline (`scripts/generate-advanced-source.ts` + a parallel translation step + `scripts/merge-advanced-data.ts`) produces `data/advanced.json`. `lib/session.ts` and `lib/progress.ts` are generalized (key extractor, storage key parameter) so the existing Vocabulary mode code and the new Advanced mode code share the same session-building and progress logic without duplication. A new page (`app/advanced-session/page.tsx`) and component (`components/AdvancedFlashcard.tsx`) mirror the existing session page/component, and the Home and Progress pages gain a second entry point/section.

**Tech Stack:** Same as the existing project — Next.js App Router, TypeScript, Tailwind, Vitest, `tsx` for data scripts, real network access to `lorcanajson.org`.

Reference spec: `docs/superpowers/specs/2026-09-02-advanced-mode-design.md`

Branch: this plan is implemented on the `advanced-mode` git branch (already checked out, with the design spec committed as its first commit). Do not merge to `main` as part of this plan — that happens later, when the user asks.

---

## Task 1: Generalize `buildSession` with a key extractor

**Files:**
- Modify: `lib/session.ts`
- Modify: `lib/__tests__/session.test.ts`
- Modify: `app/session/page.tsx`

This changes `buildSession`'s signature (`getKey` is inserted before `sessionSize`), so it's not purely additive — the existing test file and the existing call site both need updating in this task.

- [ ] **Step 1: Rewrite the test file to use the new signature**

Replace the full contents of `lib/__tests__/session.test.ts` with:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run lib/__tests__/session.test.ts
```

Expected: FAIL — `buildSession` doesn't accept a `getKey` argument yet (type error / wrong runtime behavior since the 3rd positional argument is currently `sessionSize`).

- [ ] **Step 3: Implement the generalized `buildSession`**

Replace the full contents of `lib/session.ts` with:

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run lib/__tests__/session.test.ts
```

Expected: PASS (4 tests)

- [ ] **Step 5: Update the existing call site**

In `app/session/page.tsx`, find:

```tsx
  const [session] = useState(() => buildSession(vocabulary, loadProgress()));
```

Replace with:

```tsx
  const [session] = useState(() =>
    buildSession(vocabulary, loadProgress(), (entry) => entry.term)
  );
```

- [ ] **Step 6: Verify the full app still builds and all tests pass**

```bash
npx tsc --noEmit
npm run test
npm run build
```

Expected: all three succeed. `lib/__tests__/session.test.ts` now has 4 tests instead of 3, so the repo-wide total goes from 20 to 21.

- [ ] **Step 7: Commit**

```bash
git add lib/session.ts lib/__tests__/session.test.ts app/session/page.tsx
git commit -m "Generalize buildSession with a key extractor so it works for non-vocabulary items"
```

---

## Task 2: Generalize progress storage key

**Files:**
- Modify: `lib/progress.ts`
- Modify: `lib/__tests__/progress.test.ts`

`loadProgress`/`saveProgress` gain an optional `storageKey` parameter defaulting to the existing vocabulary key, so **no existing call site needs to change** (`app/session/page.tsx` and `app/progress/page.tsx` keep calling `loadProgress()`/`saveProgress(updated)` with no arguments, unchanged).

- [ ] **Step 1: Write the failing test**

Append this test to the end of the `describe("progress", ...)` block in `lib/__tests__/progress.test.ts` (keep all existing tests as-is):

```ts
  it("keeps separate storage keys isolated", () => {
    const vocabProgress = markKnown({}, "banish");
    saveProgress(vocabProgress);

    const advancedProgress = markKnown({}, "42");
    saveProgress(advancedProgress, ADVANCED_STORAGE_KEY);

    expect(loadProgress()).toEqual(vocabProgress);
    expect(loadProgress(ADVANCED_STORAGE_KEY)).toEqual(advancedProgress);
    expect(loadProgress()).not.toEqual(loadProgress(ADVANCED_STORAGE_KEY));
  });
```

And add `ADVANCED_STORAGE_KEY` to the existing import line at the top of the file:

```ts
import {
  ADVANCED_STORAGE_KEY,
  getLevel,
  isDominated,
  loadProgress,
  markKnown,
  markUnknown,
  saveProgress,
} from "../progress";
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run lib/__tests__/progress.test.ts
```

Expected: FAIL — `ADVANCED_STORAGE_KEY` is not exported yet, and `saveProgress`/`loadProgress` don't accept a second argument.

- [ ] **Step 3: Implement the parameterized storage key**

Replace the full contents of `lib/progress.ts` with:

```ts
import type { ProgressMap } from "./types";

export const VOCAB_STORAGE_KEY = "lorcana-vocab-progress";
export const ADVANCED_STORAGE_KEY = "lorcana-vocab-progress-advanced";
const MAX_LEVEL = 3;

export function loadProgress(storageKey: string = VOCAB_STORAGE_KEY): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    return JSON.parse(raw) as ProgressMap;
  } catch {
    return {};
  }
}

export function saveProgress(progress: ProgressMap, storageKey: string = VOCAB_STORAGE_KEY): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(progress));
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
```

(Only change from before: the internal `STORAGE_KEY` constant is renamed to the exported `VOCAB_STORAGE_KEY`, a new exported `ADVANCED_STORAGE_KEY` constant is added, and `loadProgress`/`saveProgress` take an optional `storageKey` parameter defaulting to `VOCAB_STORAGE_KEY`. `getLevel`/`markKnown`/`markUnknown`/`isDominated` are unchanged.)

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run lib/__tests__/progress.test.ts
```

Expected: PASS (6 tests)

- [ ] **Step 5: Verify nothing else broke**

```bash
npx tsc --noEmit
npm run test
npm run build
```

Expected: all succeed. `lib/__tests__/progress.test.ts` now has 6 tests instead of 5, so the repo-wide total goes from 21 (after Task 1) to 22.

- [ ] **Step 6: Commit**

```bash
git add lib/progress.ts lib/__tests__/progress.test.ts
git commit -m "Add a parameterized storage key to progress tracking for the advanced mode"
```

---

## Task 3: `AdvancedCardEntry` type and placeholder data

**Files:**
- Modify: `lib/types.ts`
- Create: `data/advanced.json`

- [ ] **Step 1: Add the new type**

Append to `lib/types.ts`:

```ts
export type AdvancedCardEntry = {
  cardId: number;
  name: string;
  imageUrl: string;
  textEn: string;
  textPt: string;
};
```

- [ ] **Step 2: Create the placeholder data file**

Create `data/advanced.json`:

```json
[]
```

- [ ] **Step 3: Verify**

```bash
npx tsc --noEmit
npm run build
```

Expected: both succeed.

- [ ] **Step 4: Commit**

```bash
git add lib/types.ts data/advanced.json
git commit -m "Add AdvancedCardEntry type and placeholder advanced.json"
```

---

## Task 4: Generate the source data for the latest set

**Files:**
- Modify: `scripts/lib/fetchCards.ts`
- Create: `scripts/generate-advanced-source.ts`
- Modify: `package.json` (add npm script)
- Create/Modify: `data/advanced-source.json` (written by running the script)

- [ ] **Step 1: Add `setCode`/`fullText` to `LorcanaCard` and a new fetch function**

In `scripts/lib/fetchCards.ts`, change the `LorcanaCard` type from:

```ts
export type LorcanaCard = {
  id: number;
  name: string;
  fullName: string;
  type: string;
  cost?: number;
  images: { full: string; thumbnail?: string };
  abilities?: LorcanaAbility[];
};
```

to:

```ts
export type LorcanaCard = {
  id: number;
  name: string;
  fullName: string;
  type: string;
  cost?: number;
  images: { full: string; thumbnail?: string };
  abilities?: LorcanaAbility[];
  setCode?: string;
  fullText?: string;
};
```

(Both new fields are optional so the existing `processCards.test.ts` fixtures, which don't set them, keep compiling unchanged.)

Then add a new type and function at the end of the file (keep the existing `fetchAllCards` function exactly as-is — `scripts/generate-data.ts` still uses it):

```ts
export type LorcanaSet = {
  name: string;
  releaseDate?: string;
};

export async function fetchAllCardsWithSets(): Promise<{
  cards: LorcanaCard[];
  sets: Record<string, LorcanaSet>;
}> {
  const response = await fetch(ALL_CARDS_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to download LorcanaJSON data set: ${response.status} ${response.statusText}`
    );
  }
  const data = (await response.json()) as {
    cards: LorcanaCard[];
    sets: Record<string, LorcanaSet>;
  };
  return { cards: data.cards, sets: data.sets };
}
```

- [ ] **Step 2: Create the source-generation script**

Create `scripts/generate-advanced-source.ts`:

```ts
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
```

- [ ] **Step 3: Add the npm script**

Add to `package.json`'s `"scripts"` object:

```json
"generate-advanced-source": "tsx scripts/generate-advanced-source.ts"
```

- [ ] **Step 4: Run it against the real LorcanaJSON dataset**

```bash
npm run generate-advanced-source
```

Expected: prints the detected latest set's name/code/release date and the number of cards with ability text (as of this writing, the most recently released set is "Attack of the Vine!" with 261 total cards, 244 with non-empty ability text — the exact numbers may differ slightly if new data has been published since, since this is computed live).

- [ ] **Step 5: Verify nothing else broke**

```bash
npx tsc --noEmit
npm run test
npm run build
```

Expected: all succeed (test count unchanged from Task 2 — this task adds no new tests, since `generate-advanced-source.ts` is a thin I/O + filtering script without a pure unit worth isolating, same rationale as the original `fetchCards.ts`/`generate-data.ts` in the MVP plan).

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/fetchCards.ts scripts/generate-advanced-source.ts package.json data/advanced-source.json
git commit -m "Add script to extract the latest set's card text for the advanced mode"
```

---

## Task 5: Translate the latest set's card text to Portuguese (parallel batches)

**Files:**
- Create: `data/advanced-batch-1.json` through `data/advanced-batch-5.json`

**This task is executed differently from every other task in this plan.** Whoever is running this plan (the coordinator) does the following directly, instead of dispatching a single implementer subagent:

- [ ] **Step 1: Load and split the source data**

Read `data/advanced-source.json` (written by Task 4) and split its entries into 5 contiguous batches, ordered by `cardId` (the file is already sorted that way):

```ts
const entries = JSON.parse(fs.readFileSync("data/advanced-source.json", "utf-8"));
const batchSize = Math.ceil(entries.length / 5);
const batches = Array.from({ length: 5 }, (_, i) =>
  entries.slice(i * batchSize, (i + 1) * batchSize)
);
```

With ~244 entries this produces 5 batches of ~49 each; the exact split depends on the real count from Task 4's run.

- [ ] **Step 2: Dispatch 5 parallel translation subagents, one per batch**

For batch `N` (1 through 5), dispatch a subagent (general-purpose, no code tools needed beyond Write) with a prompt that includes:

- The batch's exact entries pasted inline as JSON (`cardId`, `name`, `textEn` for each) — don't make the subagent read `data/advanced-source.json` itself, since it should only see and translate its own slice.
- This instruction:

  > Translate the `textEn` field of each entry below into natural, complete Portuguese. Preserve line breaks and bullet points (•) as line breaks/bullets in your translation — don't collapse the text into one paragraph. Keep character and place names untranslated (e.g. "Woody", "Hyperia"). For Lorcana keyword ability names that appear in the text (Bodyguard, Challenger, Evasive, Reckless, Resist, Rush, Shift, Singer, Support, Ward, Vanish, Sing Together, Boost, Alert, and any others), first read `scripts/lib/translations.ts` in the repo and reuse the exact same Portuguese term already used there for that keyword, so terminology stays consistent with the Vocabulary mode. Every entry must get a real, non-empty translation — do not skip any, and do not leave placeholder text.
  >
  > Write your output as a JSON array to `data/advanced-batch-N.json` (replace N with your batch number), where each element is exactly `{ "cardId": <number>, "textPt": "<your translation>" }`, one per input entry, in the same order you received them.
  >
  > Report back: how many entries you translated, and any specific terms or phrases you weren't fully confident about.

- [ ] **Step 3: Wait for all 5 subagents, then verify**

For each `data/advanced-batch-N.json` (N=1..5): confirm the file exists, is valid JSON, and its array length matches that batch's slice length from Step 1. If any subagent reported low confidence on specific terms, spot-check those entries yourself against `scripts/lib/translations.ts` and the surrounding sentence for plausibility.

- [ ] **Step 4: Commit the batch files**

```bash
git add data/advanced-batch-1.json data/advanced-batch-2.json data/advanced-batch-3.json data/advanced-batch-4.json data/advanced-batch-5.json
git commit -m "Translate latest-set card text to Portuguese (batches 1-5)"
```

**Review note for this task:** because this task produces translated content rather than deterministic code, its "spec compliance" review should check completeness (every source entry has a corresponding batch entry with a non-empty `textPt`, no entry duplicated or missing) and spot-check translation quality (natural Portuguese, structure preserved, keyword terms consistent with `scripts/lib/translations.ts`) on a sample from each batch — not a byte-for-byte match to plan text, since none exists for the translated content itself.

---

## Task 6: Merge translations into the final advanced.json

**Files:**
- Create: `scripts/merge-advanced-data.ts`
- Modify: `package.json` (add npm script)
- Modify: `data/advanced.json` (overwritten with real content)

- [ ] **Step 1: Create the merge script**

Create `scripts/merge-advanced-data.ts`:

```ts
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
```

- [ ] **Step 2: Add the npm script**

Add to `package.json`'s `"scripts"` object:

```json
"merge-advanced-data": "tsx scripts/merge-advanced-data.ts"
```

- [ ] **Step 3: Run it**

```bash
npm run merge-advanced-data
```

Expected: either succeeds with `Wrote data/advanced.json with N entries.` (N matching Task 4's count), or reports missing card ids — if the latter, go back to Task 5 and add the missing translations to the relevant batch file, then rerun this step.

- [ ] **Step 4: Sanity-check the output**

```bash
node -e "const a = require('./data/advanced.json'); console.log(a.length, a[0])"
```

Expected: prints the entry count and a populated `AdvancedCardEntry` with non-empty `textEn` and `textPt`.

- [ ] **Step 5: Verify nothing else broke**

```bash
npx tsc --noEmit
npm run test
npm run build
```

Expected: all succeed.

- [ ] **Step 6: Commit**

```bash
git add scripts/merge-advanced-data.ts package.json data/advanced.json
git commit -m "Add merge script and generate the real data/advanced.json"
```

---

## Task 7: AdvancedFlashcard component

**Files:**
- Create: `components/AdvancedFlashcard.tsx`

No automated test: visual UI component, verified manually in Task 11 (same rationale as `Flashcard.tsx` in the MVP plan).

- [ ] **Step 1: Create the component**

Create `components/AdvancedFlashcard.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { AdvancedCardEntry } from "@/lib/types";

type AdvancedFlashcardProps = {
  entry: AdvancedCardEntry;
  onAnswer: (known: boolean) => void;
};

export function AdvancedFlashcard({ entry, onAnswer }: AdvancedFlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 p-6 shadow-sm">
      {!flipped ? (
        <div className="text-center">
          {!imageFailed ? (
            <img
              src={entry.imageUrl}
              alt={entry.name}
              className="mx-auto h-64 w-auto rounded-lg object-contain"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="mx-auto flex h-64 w-44 items-center justify-center rounded-lg bg-slate-100 p-2 text-center text-sm text-slate-500">
              {entry.name}
            </div>
          )}
          <p className="mt-2 text-sm text-slate-500">{entry.name}</p>
          <button
            type="button"
            className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-white"
            onClick={() => setFlipped(true)}
          >
            Virar card
          </button>
        </div>
      ) : (
        <div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Inglês</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{entry.textEn}</p>
          </div>
          <div className="mt-4 border-t border-slate-200 pt-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Português</p>
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{entry.textPt}</p>
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              className="rounded-md bg-red-100 px-4 py-2 text-red-700"
              onClick={() => {
                onAnswer(false);
                setFlipped(false);
              }}
            >
              Não sabia
            </button>
            <button
              type="button"
              className="rounded-md bg-green-100 px-4 py-2 text-green-700"
              onClick={() => {
                onAnswer(true);
                setFlipped(false);
              }}
            >
              Eu sabia
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add components/AdvancedFlashcard.tsx
git commit -m "Add AdvancedFlashcard component with full English/Portuguese text reveal"
```

---

## Task 8: Advanced session page

**Files:**
- Create: `app/advanced-session/page.tsx`

- [ ] **Step 1: Create the page**

Create `app/advanced-session/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import advancedData from "@/data/advanced.json";
import type { AdvancedCardEntry } from "@/lib/types";
import {
  ADVANCED_STORAGE_KEY,
  loadProgress,
  markKnown,
  markUnknown,
  saveProgress,
} from "@/lib/progress";
import { buildSession } from "@/lib/session";
import { AdvancedFlashcard } from "@/components/AdvancedFlashcard";

const advancedCards = advancedData as AdvancedCardEntry[];
const getKey = (entry: AdvancedCardEntry) => String(entry.cardId);

export default function AdvancedSessionPage() {
  const [session] = useState(() =>
    buildSession(advancedCards, loadProgress(ADVANCED_STORAGE_KEY), getKey)
  );
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState({ known: 0, unknown: 0 });

  if (session.length === 0) {
    return (
      <div className="p-8 text-center">
        <p>
          Nenhuma carta disponível ainda. Rode `npm run generate-advanced-source`,
          traduza e rode `npm run merge-advanced-data` primeiro.
        </p>
        <Link href="/" className="mt-4 inline-block text-sm underline">
          Voltar ao início
        </Link>
      </div>
    );
  }

  if (index >= session.length) {
    return (
      <div className="mx-auto max-w-md p-8 text-center">
        <h2 className="text-2xl font-semibold">Sessão concluída!</h2>
        <p className="mt-4">
          Acertos: {results.known} · Erros: {results.unknown}
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-slate-900 px-4 py-2 text-white"
        >
          Voltar ao início
        </Link>
      </div>
    );
  }

  const current = session[index];

  function handleAnswer(known: boolean) {
    const progress = loadProgress(ADVANCED_STORAGE_KEY);
    const key = getKey(current);
    const updated = known ? markKnown(progress, key) : markUnknown(progress, key);
    saveProgress(updated, ADVANCED_STORAGE_KEY);
    setResults((prev) => ({
      known: prev.known + (known ? 1 : 0),
      unknown: prev.unknown + (known ? 0 : 1),
    }));
    setIndex((prev) => prev + 1);
  }

  return (
    <div className="p-8">
      <p className="mb-4 text-center text-sm text-slate-500">
        {index + 1} / {session.length}
      </p>
      <AdvancedFlashcard key={current.cardId} entry={current} onAnswer={handleAnswer} />
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npm run build
```

Expected: both succeed; `/advanced-session` appears as a new route in the build output.

- [ ] **Step 3: Commit**

```bash
git add app/advanced-session/page.tsx
git commit -m "Add advanced session page"
```

---

## Task 9: Home page gets an "Avançado" entry point

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace the full contents of `app/page.tsx`**

```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-3xl font-bold">Lorcana Vocab</h1>
      <p className="mt-2 text-slate-500">
        Aprenda o vocabulário de inglês usado nas cartas de Disney Lorcana.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href="/session"
          className="inline-block rounded-md bg-slate-900 px-6 py-3 text-white"
        >
          Começar sessão
        </Link>
        <Link
          href="/advanced-session"
          className="inline-block rounded-md border border-slate-900 px-6 py-3 text-slate-900"
        >
          Avançado
        </Link>
      </div>
      <Link href="/progress" className="mt-4 block text-sm text-slate-500 underline">
        Ver progresso
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "Add Avançado entry point to the Home page"
```

---

## Task 10: Progress page gets an Advanced section

**Files:**
- Modify: `app/progress/page.tsx`

- [ ] **Step 1: Replace the full contents of `app/progress/page.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import vocabularyData from "@/data/vocabulary.json";
import advancedData from "@/data/advanced.json";
import type { AdvancedCardEntry, ProgressMap, VocabularyEntry } from "@/lib/types";
import { ADVANCED_STORAGE_KEY, getLevel, loadProgress } from "@/lib/progress";

const vocabulary = vocabularyData as VocabularyEntry[];
const advancedCards = advancedData as AdvancedCardEntry[];

function bucketFor(level: number): "novo" | "aprendendo" | "dominado" {
  if (level === 0) return "novo";
  if (level < 3) return "aprendendo";
  return "dominado";
}

function countBuckets<T>(items: T[], progress: ProgressMap, getKey: (item: T) => string) {
  const buckets = { novo: 0, aprendendo: 0, dominado: 0 };
  for (const item of items) {
    buckets[bucketFor(getLevel(progress, getKey(item)))] += 1;
  }
  return buckets;
}

export default function ProgressPage() {
  const [vocabProgress, setVocabProgress] = useState<ProgressMap>({});
  const [advancedProgress, setAdvancedProgress] = useState<ProgressMap>({});

  useEffect(() => {
    setVocabProgress(loadProgress());
    setAdvancedProgress(loadProgress(ADVANCED_STORAGE_KEY));
  }, []);

  const vocabBuckets = countBuckets(vocabulary, vocabProgress, (entry) => entry.term);
  const advancedBuckets = countBuckets(
    advancedCards,
    advancedProgress,
    (entry) => String(entry.cardId)
  );

  function bar(label: string, count: number, total: number, colorClass: string) {
    const pct = total === 0 ? 0 : Math.round((count / total) * 100);
    return (
      <div className="mb-4">
        <div className="mb-1 flex justify-between text-sm">
          <span>{label}</span>
          <span>{count}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full ${colorClass}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-8">
      <h2 className="mb-6 text-2xl font-semibold">Progresso</h2>

      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Vocabulário
      </h3>
      {bar("Novo", vocabBuckets.novo, vocabulary.length, "bg-red-400")}
      {bar("Aprendendo", vocabBuckets.aprendendo, vocabulary.length, "bg-amber-400")}
      {bar("Dominado", vocabBuckets.dominado, vocabulary.length, "bg-green-500")}
      <p className="mb-6 text-sm text-slate-500">{vocabulary.length} termos no total.</p>

      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Avançado
      </h3>
      {bar("Novo", advancedBuckets.novo, advancedCards.length, "bg-red-400")}
      {bar("Aprendendo", advancedBuckets.aprendendo, advancedCards.length, "bg-amber-400")}
      {bar("Dominado", advancedBuckets.dominado, advancedCards.length, "bg-green-500")}
      <p className="text-sm text-slate-500">{advancedCards.length} cartas no total.</p>

      <Link href="/" className="mt-6 inline-block text-sm underline">
        Voltar ao início
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

```bash
npx tsc --noEmit
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add app/progress/page.tsx
git commit -m "Add advanced-mode section to the progress page"
```

---

## Task 11: Manual verification

**Files:** none (manual testing only)

- [ ] **Step 1: Run the full automated test suite**

```bash
npm run test
```

Expected: all tests PASS (22 tests: 20 from the MVP + the 2 net-new ones added in Tasks 1 and 2).

- [ ] **Step 2: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 3: Verify the golden path for the new mode**

Open `http://localhost:3000` and check:
- Home page shows both "Começar sessão" and "Avançado" buttons, plus "Ver progresso".
- Clicking "Avançado" starts a session showing card art + name on the front.
- Flipping a card shows the full English text and the full Portuguese translation, with line breaks/bullets preserved.
- "Eu sabia"/"Não sabia" advance through the session; a summary screen appears at the end.
- The Progress page now shows two sections (Vocabulário and Avançado) with independent bars, and a working "Voltar ao início" link.
- Confirm the two modes' progress don't affect each other: answer some Advanced cards, then check the Vocabulário section on the Progress page is unaffected (still reflects only Vocabulary-mode answers).

- [ ] **Step 4: Verify the broken-image fallback**

Temporarily edit one entry in `data/advanced.json` to have `"imageUrl": "https://example.com/broken.png"`, start an Advanced session until that card appears, confirm the fallback box with the card name shows instead of a broken image icon. Revert afterward:

```bash
git checkout -- data/advanced.json
```

- [ ] **Step 5: Stop the dev server**

Stop the process (Ctrl+C).

---

## Notes for the implementer

- This entire plan is implemented on the `advanced-mode` branch, not `main`. Do not merge or push to `main`/`origin` as part of executing this plan — the user will ask for that separately when ready.
- If a future Lorcana set releases after this is built, rerunning `npm run generate-advanced-source` (Task 4) will pick up the new latest set automatically. The translation step (Task 5) would need to be redone for the new set's cards, and `npm run merge-advanced-data` (Task 6) rerun.
- `data/advanced-source.json` and `data/advanced-batch-*.json` are committed alongside `data/advanced.json` (not gitignored) — they're the reproducible inputs to the merge step, not disposable scratch files, and keeping them avoids re-translating from scratch if the merge logic ever changes.
