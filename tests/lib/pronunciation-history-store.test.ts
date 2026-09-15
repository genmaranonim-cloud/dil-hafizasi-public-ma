import { beforeEach, describe, expect, test, vi } from "vitest";

const storageMocks = vi.hoisted(() => ({ getItem: vi.fn(), setItem: vi.fn() }));

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: { getItem: storageMocks.getItem, setItem: storageMocks.setItem },
}));

import { loadPronunciationHistory, recordPronunciationAttempt } from "../../lib/pronunciation-history";

describe("pronunciation history store", () => {
  beforeEach(() => {
    storageMocks.getItem.mockReset();
    storageMocks.setItem.mockReset();
  });

  test("loads an empty history when there are no saved attempts", async () => {
    storageMocks.getItem.mockResolvedValue(null);
    await expect(loadPronunciationHistory()).resolves.toEqual([]);
  });

  test("records a new attempt and persists the newest-first history", async () => {
    storageMocks.getItem.mockResolvedValue(JSON.stringify([]));
    const attempt = {
      id: "attempt-1",
      lessonNumber: 7,
      phrase: "Could I have the bill, please?",
      score: 84,
      summary: "Clear rhythm",
      createdAt: "2026-09-15T13:00:00.000Z",
    };

    await expect(recordPronunciationAttempt(attempt)).resolves.toEqual([attempt]);
    expect(storageMocks.setItem).toHaveBeenCalledWith("dil-hafizasi-pronunciation-history", JSON.stringify([attempt]));
  });
});
