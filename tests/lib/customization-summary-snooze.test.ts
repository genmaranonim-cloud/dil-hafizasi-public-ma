import { beforeEach, describe, expect, test, vi } from "vitest";

import { buildBadgeCardSvg, buildBadgeShareText, type BadgeShareInput } from "../../lib/badge-share";
import { summarizeLessonComparison } from "../../lib/lesson-comparison";
import { isStreakNotificationSnoozed, snoozeStreakNotificationForToday } from "../../lib/streak-notification";

describe("badge customization, comparison summary, and snooze", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal("window", { localStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } });
  });

  const badge: BadgeShareInput = {
    title: "Düzenli ritim",
    description: "Üç farklı günde pratik yap.",
    earnedAt: "2026-09-15",
    displayName: "Ada",
    theme: "sunset",
  };

  test("includes the chosen name and theme in badge card output", () => {
    expect(buildBadgeShareText(badge)).toContain("Ada");
    expect(buildBadgeCardSvg(badge)).toContain("#9B4D55");
    expect(buildBadgeCardSvg(badge)).toContain("Ada");
  });

  test("summarizes average gap and growth for two lessons", () => {
    const summary = summarizeLessonComparison([
      { dateKey: "2026-09-14", label: "14 Eyl", firstScore: 60, secondScore: 80 },
      { dateKey: "2026-09-15", label: "15 Eyl", firstScore: 90, secondScore: 88 },
    ]);
    expect(summary.averageGap).toBe(9);
    expect(summary.firstGrowthPercent).toBe(50);
    expect(summary.secondGrowthPercent).toBe(10);
  });

  test("snoozes only the current day's streak notification", async () => {
    const now = new Date("2026-09-15T19:00:00");
    await snoozeStreakNotificationForToday(now);
    expect(await isStreakNotificationSnoozed(now)).toBe(true);
    expect(await isStreakNotificationSnoozed(new Date("2026-09-16T09:00:00"))).toBe(false);
  });
});
