import { describe, expect, test } from "vitest";

import {
  buildDailyReminderContent,
  buildDailyReminderPayload,
  formatReminderTime,
  parseReminderTime,
  validateReminderTime,
} from "../../lib/daily-reminder";

describe("daily reminder", () => {
  test("parses and formats a valid 24-hour time", () => {
    expect(parseReminderTime("08:30")).toEqual({ hour: 8, minute: 30 });
    expect(formatReminderTime({ hour: 8, minute: 30 })).toBe("08:30");
    expect(validateReminderTime({ hour: 8, minute: 30 })).toBe(true);
  });

  test("rejects invalid hour and minute values", () => {
    expect(parseReminderTime("25:70")).toBeNull();
    expect(validateReminderTime({ hour: -1, minute: 0 })).toBe(false);
    expect(validateReminderTime({ hour: 23, minute: 60 })).toBe(false);
  });

  test("builds a clear Turkish reminder notification", () => {
    expect(buildDailyReminderContent()).toEqual({
      title: "Dil Hafızası zamanı",
      body: "Dünkü dersi 30 dakika ile tekrar et.",
    });
  });

  test("builds a deep link to the previous lesson when a target is known", () => {
    expect(buildDailyReminderPayload({ lessonNumber: 8, title: "Booking a Hotel" })).toEqual({
      route: "/stories?lesson=8",
      type: "daily-review",
      lessonNumber: 8,
    });
    expect(buildDailyReminderPayload(null)).toEqual({ route: "/", type: "daily-review" });
  });
});
