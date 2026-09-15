import { describe, expect, test } from "vitest";

import {
  buildPronunciationSystemPrompt,
  buildPronunciationUserPrompt,
  decodeAudioPayload,
} from "../../server/pronunciation";

describe("pronunciation server helpers", () => {
  test("decodes a data URI audio payload", () => {
    const bytes = decodeAudioPayload({ phrase: "Hello", audioBase64: "data:audio/mp4;base64,aGVsbG8=", mimeType: "audio/mp4" });
    expect(bytes.toString("utf8")).toBe("hello");
  });

  test("accepts browser webm recordings", () => {
    const bytes = decodeAudioPayload({ phrase: "Hello", audioBase64: "GkXfo0A=", mimeType: "audio/webm" });
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  test("rejects malformed and oversized payloads", () => {
    expect(() => decodeAudioPayload({ phrase: "Hello", audioBase64: "not base64!", mimeType: "audio/mp4" })).toThrow();
    expect(() => decodeAudioPayload({ phrase: "Hello", audioBase64: "a".repeat(2_800_001), mimeType: "audio/mp4" })).toThrow();
  });

  test("keeps the AI prompt learner-safe and target-specific", () => {
    expect(buildPronunciationSystemPrompt()).toContain("approximate");
    expect(buildPronunciationUserPrompt("Could you help me?")).toContain("Could you help me?");
  });
});
