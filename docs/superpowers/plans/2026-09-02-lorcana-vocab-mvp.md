# Lorcana Vocab MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal Next.js flashcard site that teaches the English vocabulary used on Disney Lorcana cards, ranked by real frequency, with translations, spaced-repetition-style progress tracking in `localStorage`, and real card art on reveal.

**Architecture:** Single Next.js (App Router + TypeScript + Tailwind) repo. A one-off Node/TypeScript script (`scripts/generate-data.ts`) downloads the LorcanaJSON card dataset, computes word/keyword frequency, and writes two static JSON files (`data/vocabulary.json`, `data/cards.json`) that the app imports at build time. No backend, no database — user progress lives entirely in the browser's `localStorage`.

**Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Vitest + jsdom for unit tests, `tsx` to run the data script, LorcanaJSON (`lorcanajson.org`) as the data source, deployed to Vercel.

Reference spec: `docs/superpowers/specs/2026-09-02-lorcana-vocab-design.md`

---

## Task 1: Scaffold the Next.js project and tooling

**Files:**
- Create: whole Next.js scaffold (`package.json`, `app/`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts` or Tailwind v4 CSS config, `.gitignore`, `eslint.config.mjs`)
- Modify: `.gitignore`, `package.json`, `tsconfig.json`
- Create: `vitest.config.ts`

- [ ] **Step 1: Remove the placeholder `.gitignore` so `create-next-app` can generate its own**

```bash
rm .gitignore
```

- [ ] **Step 2: Scaffold the Next.js app in the current directory**

Run:

```bash
npx --yes create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-npm --no-git
```

Expected: creates `package.json`, `app/`, `tailwind`/`postcss` config, `tsconfig.json`, a fresh `.gitignore`, `eslint.config.mjs`, and installs dependencies (`next`, `react`, `react-dom`, `tailwindcss`, etc.).

- [ ] **Step 3: Re-add the visual-companion ignore entry**

Append this line to the generated `.gitignore`:

```
.superpowers/
```

- [ ] **Step 4: Install testing and data-script tooling**

```bash
npm install -D vitest jsdom tsx
```

- [ ] **Step 5: Add npm scripts**

Edit `package.json`, add these entries to the `"scripts"` object (keep the existing `dev`/`build`/`start`/`lint` scripts `create-next-app` generated):

```json
"test": "vitest run",
"test:watch": "vitest",
"generate-data": "tsx scripts/generate-data.ts"
```

- [ ] **Step 6: Create the Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["**/__tests__/**/*.test.ts"],
    exclude: ["node_modules", ".next", ".superpowers"],
  },
});
```

- [ ] **Step 7: Ensure `resolveJsonModule` is enabled**

Open `tsconfig.json`. If `"compilerOptions"` does not already contain `"resolveJsonModule": true`, add it (needed so `app/` code can `import` the generated `data/*.json` files with types).

- [ ] **Step 8: Verify the scaffold builds**

```bash
npm run build
```

Expected: build completes with exit code 0 (default `create-next-app` starter page).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Scaffold Next.js app with Tailwind, Vitest, and data-script tooling"
```

---

## Task 2: Shared domain types and placeholder data files

**Files:**
- Create: `lib/types.ts`
- Create: `data/vocabulary.json`
- Create: `data/cards.json`

- [ ] **Step 1: Create the shared types**

Create `lib/types.ts`:

```ts
export type TermCategory = "keyword" | "geral";

export type VocabularyExample = {
  cardId: number;
  textSnippet: string;
};

export type VocabularyEntry = {
  term: string;
  category: TermCategory;
  translation: string;
  frequency: number;
  examples: VocabularyExample[];
};

export type CardSummary = {
  id: number;
  name: string;
  type: string;
  cost: number;
  imageUrl: string;
};

export type ProgressEntry = {
  level: number; // 0 to 3 (correct answers in a row since the last miss)
  lastSeenAt: string; // ISO timestamp
};

export type ProgressMap = Record<string, ProgressEntry>;
```

- [ ] **Step 2: Create placeholder static data files**

These let the app compile before the real data pipeline runs (Task 7 overwrites them with real content).

Create `data/vocabulary.json`:

```json
[]
```

Create `data/cards.json`:

```json
[]
```

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts data/vocabulary.json data/cards.json
git commit -m "Add shared domain types and placeholder data files"
```

---

## Task 3: Stopwords and translations dictionaries

**Files:**
- Create: `scripts/lib/stopwords.ts`
- Create: `scripts/lib/translations.ts`
- Test: `scripts/lib/__tests__/translations.test.ts`

- [ ] **Step 1: Create the stopword list**

Create `scripts/lib/stopwords.ts`:

```ts
// English function words that carry no game-specific meaning on their own.
// Deliberately keeps modal verbs (may, can, must) and trigger words
// (when, whenever, if) out of this list — those are worth learning.
export const STOPWORDS: Set<string> = new Set([
  "a", "an", "the",
  "and", "or", "but", "nor",
  "of", "to", "in", "on", "at", "for", "from", "by", "as", "with", "into", "onto",
  "is", "are", "was", "were", "be", "been", "being",
  "it", "its", "you", "your", "yours",
  "this", "that", "these", "those",
  "they", "them", "their", "theirs",
  "he", "him", "his", "she", "her", "hers",
  "we", "us", "our", "ours", "i", "me", "my", "mine",
  "who", "whom", "whose", "which", "what", "where",
  "then", "else", "so", "than", "too", "very", "just",
  "own", "same", "other", "another", "such",
  "some", "any", "all", "each", "every", "both", "few", "more", "most",
  "no", "not", "nor", "s",
]);
```

- [ ] **Step 2: Write the failing translations sanity test**

Create `scripts/lib/__tests__/translations.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { TRANSLATIONS } from "../translations";

describe("TRANSLATIONS", () => {
  it("has no empty translation values", () => {
    for (const [term, translation] of Object.entries(TRANSLATIONS)) {
      expect(translation.trim().length, `translation for "${term}" is empty`).toBeGreaterThan(0);
    }
  });

  it("uses lowercase keys", () => {
    for (const term of Object.keys(TRANSLATIONS)) {
      expect(term).toBe(term.toLowerCase());
    }
  });

  it("includes the core Lorcana ability keywords", () => {
    const coreKeywords = [
      "bodyguard", "challenger", "evasive", "reckless", "resist",
      "rush", "shift", "singer", "support", "ward", "vanish",
    ];
    for (const keyword of coreKeywords) {
      expect(TRANSLATIONS[keyword], `missing translation for "${keyword}"`).toBeDefined();
    }
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

```bash
npx vitest run scripts/lib/__tests__/translations.test.ts
```

Expected: FAIL — `../translations` does not exist yet.

- [ ] **Step 4: Create the translations dictionary**

Create `scripts/lib/translations.ts`:

```ts
// Curated English -> Portuguese glosses for Lorcana rules-text vocabulary.
// Keys are lowercase and match either an ability keyword name (e.g. "bodyguard")
// or a tokenized general-vocabulary word (e.g. "banish").
//
// This dictionary will not cover every word that ends up in the top-ranked
// list from a real data run. scripts/generate-data.ts aborts and prints any
// missing terms instead of writing incomplete data — when that happens, add
// the missing term here (same lowercase-key style) and rerun
// `npm run generate-data`.
export const TRANSLATIONS: Record<string, string> = {
  // Official ability keywords
  bodyguard: "Guarda-costas",
  challenger: "Desafiante",
  evasive: "Evasivo",
  reckless: "Imprudente",
  resist: "Resistência",
  rush: "Investida",
  shift: "Metamorfose",
  singer: "Cantor(a)",
  support: "Apoio",
  ward: "Proteção",
  vanish: "Desvanecer",
  "sing together": "Cantar Junto",

  // Core actions / verbs
  banish: "banir",
  banished: "banido",
  banishes: "bane",
  quest: "explorar (ação de ganhar lore)",
  questing: "explorando",
  exert: "exaurir",
  exerted: "exaurido",
  ready: "pronto / desvirar",
  readied: "desvirado",
  draw: "comprar",
  drawn: "comprado",
  discard: "descartar",
  discarded: "descartado",
  discards: "descarta",
  challenge: "desafiar",
  challenged: "desafiado",
  challenges: "desafia",
  challenging: "desafiando",
  deal: "causar (dano)",
  deals: "causa",
  dealt: "causado",
  damage: "dano",
  play: "jogar",
  played: "jogado",
  plays: "joga",
  playing: "jogando",
  reveal: "revelar",
  revealed: "revelado",
  reveals: "revela",
  shuffle: "embaralhar",
  shuffled: "embaralhado",
  return: "retornar",
  returned: "retornado",
  returns: "retorna",
  remove: "remover",
  removed: "removido",
  removes: "remove",
  gain: "ganhar",
  gains: "ganha",
  gained: "ganho",
  lose: "perder",
  loses: "perde",
  lost: "perdido",
  look: "olhar",
  looks: "olha",
  looking: "olhando",
  put: "colocar",
  puts: "coloca",
  choose: "escolher",
  chooses: "escolhe",
  chosen: "escolhido",
  move: "mover",
  moves: "move",
  moved: "movido",
  enters: "entra",
  enter: "entrar",
  leaves: "sai",
  activate: "ativar",
  activated: "ativado",
  activates: "ativa",
  trigger: "acionar",
  triggers: "aciona",
  resolve: "resolver",
  resolves: "resolve",
  add: "adicionar",
  adds: "adiciona",
  added: "adicionado",
  give: "dar",
  gives: "dá",
  given: "dado",
  take: "pegar",
  takes: "pega",
  taken: "pego",
  keep: "manter",
  keeps: "mantém",
  use: "usar",
  uses: "usa",
  used: "usado",
  prevent: "prevenir",
  prevents: "previne",
  prevented: "prevenido",
  ignore: "ignorar",
  ignores: "ignora",
  reduce: "reduzir",
  reduces: "reduz",
  increase: "aumentar",
  increases: "aumenta",
  counts: "conta",
  count: "contar",
  gets: "recebe",
  get: "receber",
  becomes: "torna-se",
  become: "tornar-se",

  // Nouns - game pieces / roles
  character: "personagem",
  characters: "personagens",
  opponent: "oponente",
  opponents: "oponentes",
  item: "item",
  items: "itens",
  location: "localização",
  locations: "localizações",
  action: "ação",
  actions: "ações",
  song: "canção",
  songs: "canções",
  sing: "cantar",
  sings: "canta",
  card: "carta",
  cards: "cartas",
  deck: "baralho",
  hand: "mão",
  player: "jogador",
  players: "jogadores",
  controller: "controlador",
  control: "controlar",
  target: "alvo",
  targets: "alvos",
  effect: "efeito",
  effects: "efeitos",
  turn: "turno",
  turns: "turnos",
  ink: "tinta",
  inkwell: "poço de tinta",
  lore: "lore (pontos de vitória)",
  strength: "força",
  willpower: "força de vontade (resistência)",
  cost: "custo",
  name: "nome",
  named: "chamado",
  top: "topo",
  bottom: "fundo",

  // Connectors / modifiers worth learning
  when: "quando",
  whenever: "sempre que",
  unless: "a menos que",
  instead: "em vez disso",
  until: "até",
  while: "enquanto",
  before: "antes",
  after: "depois",
  during: "durante",
  only: "apenas",
  also: "também",
  again: "novamente",
  still: "ainda",
  already: "já",
  once: "uma vez",
  twice: "duas vezes",
  first: "primeiro",
  second: "segundo",
  next: "próximo",
  last: "último",
  equal: "igual",
  greater: "maior",
  times: "vezes",
  extra: "extra",
  additional: "adicional",
  less: "menos",
  may: "pode",
  can: "pode / consegue",
  cannot: "não pode",
  "can't": "não pode",
  must: "deve",
};
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npx vitest run scripts/lib/__tests__/translations.test.ts
```

Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/stopwords.ts scripts/lib/translations.ts scripts/lib/__tests__/translations.test.ts
git commit -m "Add stopword filter and English-Portuguese translation dictionary"
```

---

## Task 4: Tokenizer

**Files:**
- Create: `scripts/lib/tokenize.ts`
- Test: `scripts/lib/__tests__/tokenize.test.ts`

- [ ] **Step 1: Write the failing test**

Create `scripts/lib/__tests__/tokenize.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { tokenize } from "../tokenize";

describe("tokenize", () => {
  it("lowercases and splits on non-letter characters", () => {
    expect(tokenize("Banish this character.")).toEqual(["banish", "this", "character"]);
  });

  it("keeps contractions with apostrophes", () => {
    expect(tokenize("This character can't ready.")).toEqual([
      "this",
      "character",
      "can't",
      "ready",
    ]);
  });

  it("strips a trailing possessive 's", () => {
    expect(tokenize("Deal damage to opponent's character.")).toEqual([
      "deal",
      "damage",
      "to",
      "opponent",
      "character",
    ]);
  });

  it("drops single-letter tokens and numbers", () => {
    expect(tokenize("Draw 2 cards. A character.")).toEqual(["draw", "cards", "character"]);
  });

  it("returns an empty array for empty text", () => {
    expect(tokenize("")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run scripts/lib/__tests__/tokenize.test.ts
```

Expected: FAIL — `../tokenize` does not exist yet.

- [ ] **Step 3: Implement the tokenizer**

Create `scripts/lib/tokenize.ts`:

```ts
export function tokenize(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z']+/g) ?? [];
  return matches
    .map((word) => word.replace(/^'+/, "").replace(/'+$/, ""))
    .map((word) => word.replace(/'s$/, ""))
    .filter((word) => word.length > 1);
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run scripts/lib/__tests__/tokenize.test.ts
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/tokenize.ts scripts/lib/__tests__/tokenize.test.ts
git commit -m "Add tokenizer for card ability text"
```

---

## Task 5: LorcanaJSON fetch module

**Files:**
- Create: `scripts/lib/fetchCards.ts`

No test in this task: this module is a thin network I/O wrapper (fetch + JSON parse) with no branching logic to unit test. Its output type is exercised by Task 6's tests via fixtures.

- [ ] **Step 1: Create the fetch module**

Create `scripts/lib/fetchCards.ts`:

```ts
export type LorcanaKeywordAbility = {
  type: "keyword";
  keyword: string;
  keywordValueNumber?: number;
  fullText: string;
  reminderText?: string;
};

export type LorcanaEffectAbility = {
  type: "triggered" | "static" | "activated";
  name?: string;
  effect: string;
  fullText: string;
};

export type LorcanaAbility = LorcanaKeywordAbility | LorcanaEffectAbility;

export type LorcanaCard = {
  id: number;
  name: string;
  fullName: string;
  type: string;
  cost?: number;
  images: { full: string; thumbnail?: string };
  abilities?: LorcanaAbility[];
};

const ALL_CARDS_URL = "https://lorcanajson.org/files/current/en/allCards.json";

export async function fetchAllCards(): Promise<LorcanaCard[]> {
  const response = await fetch(ALL_CARDS_URL);
  if (!response.ok) {
    throw new Error(
      `Failed to download LorcanaJSON data set: ${response.status} ${response.statusText}`
    );
  }
  const data = (await response.json()) as { cards: LorcanaCard[] };
  return data.cards;
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/lib/fetchCards.ts
git commit -m "Add LorcanaJSON dataset fetch module"
```

---

## Task 6: Frequency counting and ranking

**Files:**
- Create: `scripts/lib/processCards.ts`
- Test: `scripts/lib/__tests__/processCards.test.ts`

- [ ] **Step 1: Write the failing test**

Create `scripts/lib/__tests__/processCards.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { countTerms, rankTerms } from "../processCards";
import type { LorcanaCard } from "../fetchCards";

const cards: LorcanaCard[] = [
  {
    id: 1,
    name: "Test Bodyguard Card",
    fullName: "Test - Bodyguard Card",
    type: "Character",
    images: { full: "https://example.com/1.png" },
    abilities: [
      {
        type: "keyword",
        keyword: "Bodyguard",
        fullText: "Bodyguard (This character may enter play exerted.)",
      },
    ],
  },
  {
    id: 2,
    name: "Test Banish Card",
    fullName: "Test - Banish Card",
    type: "Action",
    images: { full: "https://example.com/2.png" },
    abilities: [
      {
        type: "static",
        name: "EFFECT",
        effect: "Banish this character. Banish another character.",
        fullText: "EFFECT Banish this character. Banish another character.",
      },
    ],
  },
  {
    id: 3,
    name: "Test Bodyguard Card 2",
    fullName: "Test - Bodyguard Card 2",
    type: "Character",
    images: { full: "https://example.com/3.png" },
    abilities: [
      {
        type: "keyword",
        keyword: "Bodyguard",
        fullText: "Bodyguard (This character may enter play exerted.)",
      },
    ],
  },
];

describe("countTerms", () => {
  it("counts keyword ability occurrences separately from general text", () => {
    const { general, keywords } = countTerms(cards);
    expect(keywords.get("bodyguard")?.count).toBe(2);
    expect(general.has("bodyguard")).toBe(false);
  });

  it("counts general word occurrences from effect text, filtering stopwords", () => {
    const { general } = countTerms(cards);
    expect(general.get("banish")?.count).toBe(2);
    expect(general.has("this")).toBe(false);
    expect(general.has("another")).toBe(false);
  });

  it("caps examples per term at 3 and dedupes by card id", () => {
    const { keywords } = countTerms(cards);
    const entry = keywords.get("bodyguard");
    expect(entry?.examples).toHaveLength(2);
    expect(entry?.examples.map((example) => example.cardId).sort()).toEqual([1, 3]);
  });
});

describe("rankTerms", () => {
  it("sorts by frequency descending and applies the limit", () => {
    const { general } = countTerms(cards);
    const ranked = rankTerms(general, 1);
    expect(ranked).toHaveLength(1);
    expect(ranked[0].term).toBe("banish");
    expect(ranked[0].frequency).toBe(2);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run scripts/lib/__tests__/processCards.test.ts
```

Expected: FAIL — `../processCards` does not exist yet.

- [ ] **Step 3: Implement the frequency-counting module**

Create `scripts/lib/processCards.ts`:

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run scripts/lib/__tests__/processCards.test.ts
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/processCards.ts scripts/lib/__tests__/processCards.test.ts
git commit -m "Add frequency counting and ranking for card vocabulary"
```

---

## Task 7: Data generation script (real pipeline run)

**Files:**
- Create: `scripts/generate-data.ts`
- Modify: `data/vocabulary.json`, `data/cards.json` (overwritten by running the script)

- [ ] **Step 1: Create the orchestrator script**

Create `scripts/generate-data.ts`:

```ts
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
```

- [ ] **Step 2: Run the script against the real LorcanaJSON dataset**

```bash
npm run generate-data
```

Expected: either

- **Success** — prints `Wrote N vocabulary entries and M card summaries.` and `data/vocabulary.json` / `data/cards.json` now contain real data (no longer `[]`), or
- **Missing translations** — prints the list of untranslated terms and exits without touching the data files.

- [ ] **Step 3: If translations are missing, fill them in and rerun**

For each term printed in Step 2's output, add an entry to `scripts/lib/translations.ts` (lowercase key, short Portuguese gloss, matching the existing style — e.g. `"reappear": "reaparecer",`). Then rerun:

```bash
npm run generate-data
```

Repeat until the script reports success.

- [ ] **Step 4: Sanity-check the generated files**

```bash
node -e "const v = require('./data/vocabulary.json'); console.log(v.length, v[0], v.find(e => e.category === 'keyword'))"
```

Expected: prints a count close to 300 (250 general + up to 50 keywords, fewer if the real game has fewer distinct keywords) and shows a populated `VocabularyEntry` for both categories.

- [ ] **Step 5: Run the full test suite to confirm nothing broke**

```bash
npm run test
```

Expected: all tests still PASS.

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-data.ts scripts/lib/translations.ts data/vocabulary.json data/cards.json
git commit -m "Add data generation script and generate real vocabulary/card data"
```

---

## Task 8: Progress tracking (`localStorage`)

**Files:**
- Create: `lib/progress.ts`
- Test: `lib/__tests__/progress.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/__tests__/progress.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { getLevel, isDominated, loadProgress, markKnown, markUnknown, saveProgress } from "../progress";

beforeEach(() => {
  window.localStorage.clear();
});

describe("progress", () => {
  it("returns an empty map when nothing is stored", () => {
    expect(loadProgress()).toEqual({});
  });

  it("increments level on markKnown, capped at 3", () => {
    let progress = {};
    progress = markKnown(progress, "banish");
    expect(getLevel(progress, "banish")).toBe(1);
    progress = markKnown(progress, "banish");
    progress = markKnown(progress, "banish");
    progress = markKnown(progress, "banish");
    expect(getLevel(progress, "banish")).toBe(3);
  });

  it("resets level to 0 on markUnknown", () => {
    let progress = markKnown({}, "banish");
    progress = markUnknown(progress, "banish");
    expect(getLevel(progress, "banish")).toBe(0);
  });

  it("treats level 3 as dominated and lower levels as not dominated", () => {
    let progress = markKnown({}, "banish");
    expect(isDominated(progress, "banish")).toBe(false);
    progress = markKnown(progress, "banish");
    progress = markKnown(progress, "banish");
    expect(isDominated(progress, "banish")).toBe(true);
  });

  it("round-trips through localStorage via saveProgress/loadProgress", () => {
    const progress = markKnown({}, "quest");
    saveProgress(progress);
    expect(loadProgress()).toEqual(progress);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run lib/__tests__/progress.test.ts
```

Expected: FAIL — `../progress` does not exist yet.

- [ ] **Step 3: Implement progress tracking**

Create `lib/progress.ts`:

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run lib/__tests__/progress.test.ts
```

Expected: PASS (5 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/progress.ts lib/__tests__/progress.test.ts
git commit -m "Add localStorage-backed progress tracking"
```

---

## Task 9: Session builder

**Files:**
- Create: `lib/session.ts`
- Test: `lib/__tests__/session.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/__tests__/session.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildSession } from "../session";
import type { VocabularyEntry } from "../types";

function makeEntry(term: string): VocabularyEntry {
  return { term, category: "geral", translation: "x", frequency: 1, examples: [] };
}

describe("buildSession", () => {
  it("prioritizes lower-level terms first", () => {
    const vocabulary = [makeEntry("a"), makeEntry("b"), makeEntry("c")];
    const progress = {
      a: { level: 2, lastSeenAt: "" },
      b: { level: 0, lastSeenAt: "" },
    };
    const session = buildSession(vocabulary, progress, 3);
    expect(session.map((entry) => entry.term)).toEqual(["b", "c", "a"]);
  });

  it("returns fewer than sessionSize when vocabulary is smaller", () => {
    const vocabulary = [makeEntry("a"), makeEntry("b")];
    const session = buildSession(vocabulary, {}, 20);
    expect(session).toHaveLength(2);
  });

  it("treats terms with no progress entry as level 0", () => {
    const vocabulary = [makeEntry("a"), makeEntry("b")];
    const progress = { a: { level: 3, lastSeenAt: "" } };
    const session = buildSession(vocabulary, progress, 2);
    expect(session[0].term).toBe("b");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
npx vitest run lib/__tests__/session.test.ts
```

Expected: FAIL — `../session` does not exist yet.

- [ ] **Step 3: Implement the session builder**

Create `lib/session.ts`:

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run lib/__tests__/session.test.ts
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/session.ts lib/__tests__/session.test.ts
git commit -m "Add session builder that prioritizes low-level vocabulary terms"
```

---

## Task 10: Flashcard component

**Files:**
- Create: `components/Flashcard.tsx`

No automated test: this is a visual UI component, verified manually in Task 14.

- [ ] **Step 1: Create the component**

Create `components/Flashcard.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { CardSummary, VocabularyEntry } from "@/lib/types";

type FlashcardProps = {
  entry: VocabularyEntry;
  card?: CardSummary;
  onAnswer: (known: boolean) => void;
};

function highlightTerm(text: string, term: string) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, index) =>
    part.toLowerCase() === term.toLowerCase() ? (
      <mark key={index} className="rounded bg-yellow-200 px-1">
        {part}
      </mark>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

export function Flashcard({ entry, card, onAnswer }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const example = entry.examples[0];
  const categoryLabel = entry.category === "keyword" ? "Palavra-chave" : "Vocabulário";

  return (
    <div className="mx-auto max-w-md rounded-xl border border-slate-200 p-6 shadow-sm">
      {!flipped ? (
        <div className="text-center">
          <p className="text-xs uppercase tracking-wide text-slate-400">{categoryLabel}</p>
          {entry.category === "keyword" || !example ? (
            <h2 className="mt-4 text-3xl font-semibold">{entry.term}</h2>
          ) : (
            <p className="mt-4 text-lg leading-relaxed">
              {highlightTerm(example.textSnippet, entry.term)}
            </p>
          )}
          <button
            type="button"
            className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-white"
            onClick={() => setFlipped(true)}
          >
            Virar card
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-2xl font-semibold">{entry.translation}</p>
          <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">{categoryLabel}</p>
          {card && !imageFailed ? (
            <img
              src={card.imageUrl}
              alt={card.name}
              className="mx-auto mt-4 h-64 w-auto rounded-lg object-contain"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="mx-auto mt-4 flex h-64 w-44 items-center justify-center rounded-lg bg-slate-100 p-2 text-center text-sm text-slate-500">
              {card ? card.name : "Sem carta de exemplo"}
            </div>
          )}
          {card && (
            <p className="mt-2 text-sm text-slate-500">{card.name}</p>
          )}
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

- [ ] **Step 2: Commit**

```bash
git add components/Flashcard.tsx
git commit -m "Add Flashcard component with keyword/context front and card-art reveal"
```

---

## Task 11: Session page

**Files:**
- Create: `app/session/page.tsx`

- [ ] **Step 1: Create the session page**

Create `app/session/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import vocabularyData from "@/data/vocabulary.json";
import cardsData from "@/data/cards.json";
import type { CardSummary, VocabularyEntry } from "@/lib/types";
import { loadProgress, markKnown, markUnknown, saveProgress } from "@/lib/progress";
import { buildSession } from "@/lib/session";
import { Flashcard } from "@/components/Flashcard";

const vocabulary = vocabularyData as VocabularyEntry[];
const cardById = new Map<number, CardSummary>(
  (cardsData as CardSummary[]).map((card) => [card.id, card])
);

export default function SessionPage() {
  const [session] = useState(() => buildSession(vocabulary, loadProgress()));
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState({ known: 0, unknown: 0 });

  if (session.length === 0) {
    return (
      <div className="p-8 text-center">
        <p>Nenhum termo disponível ainda. Rode `npm run generate-data` primeiro.</p>
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
    const progress = loadProgress();
    const updated = known ? markKnown(progress, current.term) : markUnknown(progress, current.term);
    saveProgress(updated);
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
      <Flashcard
        key={current.term}
        entry={current}
        card={current.examples[0] ? cardById.get(current.examples[0].cardId) : undefined}
        onAnswer={handleAnswer}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/session/page.tsx
git commit -m "Add flashcard session page"
```

---

## Task 12: Progress page

**Files:**
- Create: `app/progress/page.tsx`

- [ ] **Step 1: Create the progress page**

Create `app/progress/page.tsx`:

```tsx
"use client";

import { useEffect, useState } from "react";
import vocabularyData from "@/data/vocabulary.json";
import type { ProgressMap, VocabularyEntry } from "@/lib/types";
import { getLevel, loadProgress } from "@/lib/progress";

const vocabulary = vocabularyData as VocabularyEntry[];

function bucketFor(level: number): "novo" | "aprendendo" | "dominado" {
  if (level === 0) return "novo";
  if (level < 3) return "aprendendo";
  return "dominado";
}

export default function ProgressPage() {
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  const buckets = { novo: 0, aprendendo: 0, dominado: 0 };
  for (const entry of vocabulary) {
    buckets[bucketFor(getLevel(progress, entry.term))] += 1;
  }
  const total = vocabulary.length;

  function bar(label: string, count: number, colorClass: string) {
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
      {bar("Novo", buckets.novo, "bg-red-400")}
      {bar("Aprendendo", buckets.aprendendo, "bg-amber-400")}
      {bar("Dominado", buckets.dominado, "bg-green-500")}
      <p className="mt-4 text-sm text-slate-500">{total} termos no total.</p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/progress/page.tsx
git commit -m "Add progress page with per-level bars"
```

---

## Task 13: Home page and layout

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace the Home page**

Replace the full contents of `app/page.tsx` with:

```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-md p-8 text-center">
      <h1 className="text-3xl font-bold">Lorcana Vocab</h1>
      <p className="mt-2 text-slate-500">
        Aprenda o vocabulário de inglês usado nas cartas de Disney Lorcana.
      </p>
      <Link
        href="/session"
        className="mt-8 inline-block rounded-md bg-slate-900 px-6 py-3 text-white"
      >
        Começar sessão
      </Link>
      <Link href="/progress" className="mt-4 block text-sm text-slate-500 underline">
        Ver progresso
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Update the page metadata and language in the layout**

In `app/layout.tsx`, change the `metadata` export to:

```tsx
export const metadata: Metadata = {
  title: "Lorcana Vocab",
  description: "Flashcards para aprender o vocabulário de inglês das cartas de Disney Lorcana.",
};
```

And change `<html lang="en">` to `<html lang="pt-BR">`. Leave the rest of the file (font setup, `RootLayout` structure) untouched.

- [ ] **Step 3: Verify the app builds**

```bash
npm run build
```

Expected: build completes with exit code 0.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/layout.tsx
git commit -m "Add Home page and update layout metadata/language"
```

---

## Task 14: Manual verification

**Files:** none (manual testing only, per the spec's decision to skip automated E2E tests)

- [ ] **Step 1: Run the full automated test suite one more time**

```bash
npm run test
```

Expected: all tests PASS.

- [ ] **Step 2: Start the dev server**

```bash
npm run dev
```

- [ ] **Step 3: Manually verify the golden path in a desktop browser**

Open `http://localhost:3000` and check:
- Home page loads with "Começar sessão" and "Ver progresso" links.
- Starting a session shows up to 20 flashcards; keyword terms show isolated, general terms show highlighted inside a real card snippet.
- Flipping a card shows the translation and the real card artwork.
- "Eu sabia" / "Não sabia" advance to the next card and the session summary appears at the end.
- The Progress page reflects the session's answers (bars for Novo/Aprendendo/Dominado update after a page reload).

- [ ] **Step 4: Manually verify on a mobile viewport**

Using the browser's device toolbar (or an actual phone on the same network via `http://<your-lan-ip>:3000`), repeat Step 3's checks and confirm the flashcard and buttons are usable on a small screen.

- [ ] **Step 5: Verify the "no card image" fallback**

Temporarily edit one entry in `data/cards.json` to have `"imageUrl": "https://example.com/broken.png"`, refresh a session card that references that card, flip it, and confirm the fallback box with the card name shows instead of a broken image icon. Revert the edit afterward (`git checkout -- data/cards.json`).

- [ ] **Step 6: Stop the dev server**

Stop the process (Ctrl+C).

---

## Task 15: Deploy to Vercel

**Files:** none (deployment step)

- [ ] **Step 1: Confirm Vercel CLI access**

```bash
npx vercel --version
```

If not authenticated, run `npx vercel login` and follow the prompts (requires the user to authorize in a browser).

- [ ] **Step 2: Link and deploy the project**

```bash
npx vercel --yes
```

Expected: creates a new Vercel project linked to this directory and deploys a preview URL.

- [ ] **Step 3: Promote to production**

```bash
npx vercel --prod --yes
```

Expected: prints a production URL.

- [ ] **Step 4: Verify the production deployment**

Open the production URL and repeat the golden-path check from Task 14, Step 3.

---

## Notes for the implementer

- `data/vocabulary.json` and `data/cards.json` are committed static snapshots. When a new Lorcana set is released, rerun `npm run generate-data` (Task 7) and commit the updated files — no code changes needed.
- If `npm run generate-data` reports missing translations after a future set adds new vocabulary, follow Task 7 Step 3 again.
- `scripts/` and `lib/` use different import styles on purpose: `scripts/` uses relative imports (`../lib/types`) because it runs via `tsx` outside of Next.js's path-alias resolution, while `app/`/`components/` use the `@/` alias Next.js configures.
