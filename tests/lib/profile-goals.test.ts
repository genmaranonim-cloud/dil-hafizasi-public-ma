import { describe, expect, test } from "vitest";

import { parseTargetScore, validateTargetScore } from "../../lib/profile-goals";

describe("profile target score", () => {
  test("accepts whole-number targets from 1 to 100", () => {
    expect(parseTargetScore("85")).toBe(85);
    expect(validateTargetScore(1)).toBe(true);
    expect(validateTargetScore(100)).toBe(true);
  });

  test("rejects empty, decimal, and out-of-range targets", () => {
    expect(parseTargetScore("")).toBeNull();
    expect(parseTargetScore("85.5")).toBeNull();
    expect(validateTargetScore(0)).toBe(false);
    expect(validateTargetScore(101)).toBe(false);
  });
});
