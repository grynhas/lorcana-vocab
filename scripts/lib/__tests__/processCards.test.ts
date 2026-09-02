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
