import { beforeEach, describe, expect, it } from "vitest";
import {
  ADVANCED_STORAGE_KEY,
  getLevel,
  isDominated,
  loadProgress,
  markKnown,
  markUnknown,
  saveProgress,
} from "../progress";

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

  it("keeps separate storage keys isolated", () => {
    const vocabProgress = markKnown({}, "banish");
    saveProgress(vocabProgress);

    const advancedProgress = markKnown({}, "42");
    saveProgress(advancedProgress, ADVANCED_STORAGE_KEY);

    expect(loadProgress()).toEqual(vocabProgress);
    expect(loadProgress(ADVANCED_STORAGE_KEY)).toEqual(advancedProgress);
    expect(loadProgress()).not.toEqual(loadProgress(ADVANCED_STORAGE_KEY));
  });
});
