import { beforeEach, describe, expect, test, vi } from "vitest";

import { loadThemePreference, parseThemePreference, saveThemePreference } from "../../lib/theme-preference";

const storage = {
  getItem: vi.fn<(key: string) => string | null>(),
  setItem: vi.fn<(key: string, value: string) => void>(),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("window", { localStorage: storage });
});

describe("theme preference", () => {
  test("accepts light, dark, and system choices", () => {
    expect(parseThemePreference("light")).toBe("light");
    expect(parseThemePreference("dark")).toBe("dark");
    expect(parseThemePreference("system")).toBe("system");
    expect(parseThemePreference("sepia")).toBeNull();
  });

  test("persists and restores the chosen dark mode", async () => {
    await saveThemePreference("dark");
    expect(storage.setItem).toHaveBeenCalledWith("dil-hafizasi-theme-preference", "dark");
    storage.getItem.mockReturnValue("dark");
    await expect(loadThemePreference()).resolves.toBe("dark");
  });
});
