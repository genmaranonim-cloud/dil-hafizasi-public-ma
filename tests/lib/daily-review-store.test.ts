import { beforeEach, describe, expect, test, vi } from "vitest";

const storageMocks = vi.hoisted(() => ({ getItem: vi.fn(), setItem: vi.fn() }));

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: { getItem: storageMocks.getItem, setItem: storageMocks.setItem },
}));

import { loadDailyReview, saveDailyReview } from "../../lib/daily-review-store";

describe("daily review store", () => {
  beforeEach(() => {
    storageMocks.getItem.mockReset();
    storageMocks.setItem.mockReset();
  });

  test("returns null when there is no prior lesson to review", async () => {
    storageMocks.getItem.mockResolvedValue(null);
    await expect(loadDailyReview()).resolves.toBeNull();
  });

  test("saves and restores a dated review target", async () => {
    const state = { lessonNumber: 4, title: "Grocery Shopping", studiedOn: "2026-09-14", visible: true };
    storageMocks.getItem.mockResolvedValue(JSON.stringify(state));

    await saveDailyReview(state);
    expect(storageMocks.setItem).toHaveBeenCalledWith("dil-hafizasi-daily-review", JSON.stringify(state));
    await expect(loadDailyReview()).resolves.toEqual(state);
  });
});
