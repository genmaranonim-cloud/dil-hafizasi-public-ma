import { beforeEach, describe, expect, test, vi } from "vitest";

const storageMocks = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
}));

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: storageMocks.getItem,
    setItem: storageMocks.setItem,
  },
}));

import { loadStoryProgress, saveStoryProgress } from "../../lib/progress-store";

describe("story progress store", () => {
  beforeEach(() => {
    storageMocks.getItem.mockReset();
    storageMocks.setItem.mockReset();
  });

  test("returns new progress when no saved story progress exists", async () => {
    storageMocks.getItem.mockResolvedValue(null);

    await expect(loadStoryProgress()).resolves.toEqual({ completedStageIds: [] });
  });

  test("saves and restores completed stages", async () => {
    storageMocks.setItem.mockResolvedValue(undefined);
    storageMocks.getItem.mockResolvedValue(JSON.stringify({ completedStageIds: ["meet", "chunk"] }));

    await saveStoryProgress({ completedStageIds: ["meet", "chunk"] });

    expect(storageMocks.setItem).toHaveBeenCalledWith(
      "dil-hafizasi-story-1-progress",
      JSON.stringify({ completedStageIds: ["meet", "chunk"] }),
    );
    await expect(loadStoryProgress()).resolves.toEqual({ completedStageIds: ["meet", "chunk"] });
  });

  test("uses new progress for malformed saved data", async () => {
    storageMocks.getItem.mockResolvedValue("not-json");

    await expect(loadStoryProgress()).resolves.toEqual({ completedStageIds: [] });
  });
});
