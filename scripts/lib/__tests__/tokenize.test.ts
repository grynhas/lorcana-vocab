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
