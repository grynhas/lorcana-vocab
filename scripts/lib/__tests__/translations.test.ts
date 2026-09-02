// @vitest-environment node
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
