import { beforeEach, describe, expect, test, vi } from "vitest";

const storageMocks = vi.hoisted(() => ({ getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() }));

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: { getItem: storageMocks.getItem, setItem: storageMocks.setItem, removeItem: storageMocks.removeItem },
}));

import { clearDailyReminderTime, loadDailyReminderTime, saveDailyReminderTime } from "../../lib/daily-reminder-store";

describe("daily reminder store", () => {
  beforeEach(() => {
    storageMocks.getItem.mockReset();
    storageMocks.setItem.mockReset();
    storageMocks.removeItem.mockReset();
  });

  test("restores a valid persisted reminder time", async () => {
    storageMocks.getItem.mockResolvedValue("07:45");
    await expect(loadDailyReminderTime()).resolves.toEqual({ hour: 7, minute: 45 });
  });

  test("saves and clears the reminder preference", async () => {
    await saveDailyReminderTime({ hour: 20, minute: 0 });
    expect(storageMocks.setItem).toHaveBeenCalledWith("dil-hafizasi-daily-reminder-time", "20:00");
    await clearDailyReminderTime();
    expect(storageMocks.removeItem).toHaveBeenCalledWith("dil-hafizasi-daily-reminder-time");
  });
});
