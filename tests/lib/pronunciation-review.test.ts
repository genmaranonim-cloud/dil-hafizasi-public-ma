import { describe, expect, test } from "vitest";

import {
  buildPronunciationRequest,
  isAudioPayloadWithinLimit,
  normalizePronunciationReview,
} from "../../lib/pronunciation-review";

describe("pronunciation review", () => {
  test("normalizes a structured AI review into a safe learner-facing result", () => {
    expect(
      normalizePronunciationReview({
        score: 84,
        summary: "Very clear overall.",
        whatWentWell: ["The rhythm was natural."],
        focusAreas: [{ phrase: "could you", issue: "The /d/ sound was soft.", tip: "Touch the tongue behind the teeth." }],
        nextTry: "Try the full sentence once more.",
      }),
    ).toEqual({
      score: 84,
      summary: "Very clear overall.",
      whatWentWell: ["The rhythm was natural."],
      focusAreas: [{ phrase: "could you", issue: "The /d/ sound was soft.", tip: "Touch the tongue behind the teeth." }],
      nextTry: "Try the full sentence once more.",
      confidence: "approximate",
    });
  });

  test("clamps unsafe scores and supplies safe Turkish defaults", () => {
    const review = normalizePronunciationReview({ score: 135, summary: "", whatWentWell: [], focusAreas: [], nextTry: "" });
    expect(review.score).toBe(100);
    expect(review.summary).toContain("yaklaşık");
    expect(review.confidence).toBe("approximate");
  });

  test("builds a bounded audio analysis request", () => {
    expect(isAudioPayloadWithinLimit("aGVsbG8=")).toBe(true);
    expect(buildPronunciationRequest({ phrase: "Could you help me?", audioBase64: "aGVsbG8=", mimeType: "audio/mp4" })).toEqual({
      phrase: "Could you help me?",
      audioBase64: "aGVsbG8=",
      mimeType: "audio/mp4",
    });
  });
});
