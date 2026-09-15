import { describe, expect, test } from "vitest";

import { getAnalysisMimeType } from "../../lib/audio-practice";

describe("audio practice", () => {
  test("only enables AI audio analysis for native recording formats", () => {
    expect(getAnalysisMimeType("ios")).toBe("audio/mp4");
    expect(getAnalysisMimeType("android")).toBe("audio/mp4");
    expect(getAnalysisMimeType("web")).toBeNull();
  });
});
