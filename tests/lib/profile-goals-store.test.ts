import { beforeEach, describe, expect, test, vi } from "vitest";

const storageMocks = vi.hoisted(() => ({ getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() }));

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: { getItem: storageMocks.getItem, setItem: storageMocks.setItem, removeItem: storageMocks.removeItem },
}));

import { clearTargetScore, loadTargetScore, saveTargetScore } from "../../lib/profile-goals";

describe("profile target score store", () => {
  beforeEach(() => {
    storageMocks.getItem.mockReset();
    storageMocks.setItem.mockReset();
    storageMocks.removeItem.mockReset();
  });

  test("loads a saved target score", async () => {
    storageMocks.getItem.mockResolvedValue("85");
    await expect(loadTargetScore()).resolves.toBe(85);
  });

  test("saves and clears a target score", async () => {
    await saveTargetScore(90);
    expect(storageMocks.setItem).toHaveBeenCalledWith("dil-hafizasi-target-score", "90");
    await clearTargetScore();
    expect(storageMocks.removeItem).toHaveBeenCalledWith("dil-hafizasi-target-score");
  });
});
