import { describe, expect, test } from "vitest";

import { buildBadgeCardSvg, buildBadgeShareText } from "../../lib/badge-share";
import { buildLessonComparisonTimeline } from "../../lib/lesson-comparison";
import { getScheduledStreakTime, type StreakNotificationSchedule } from "../../lib/streak-notification-time";
import type { LearningAttempt } from "../../lib/learning-motivation";

const attempt = (id: string, lessonNumber: number, score: number, createdAt: string): LearningAttempt => ({
  id,
  lessonNumber,
  score,
  phrase: id,
  summary: "Practice",
  createdAt,
});

describe("badge sharing, lesson comparison, and weekly streak schedule", () => {
  test("builds a visual badge card payload and share text", () => {
    const input = { title: "Düzenli ritim", description: "Üç farklı günde pratik yap.", earnedAt: "2026-09-15" };
    expect(buildBadgeShareText(input)).toContain("Düzenli ritim");
    expect(buildBadgeCardSvg(input)).toContain("Düzenli ritim");
    expect(buildBadgeCardSvg(input)).toContain("2026-09-15");
  });

  test("aligns two lesson score series on the same dates", () => {
    const history = [
      attempt("a", 1, 70, "2026-09-14T09:00:00.000Z"),
      attempt("b", 2, 82, "2026-09-14T10:00:00.000Z"),
      attempt("c", 1, 90, "2026-09-15T09:00:00.000Z"),
    ];
    const timeline = buildLessonComparisonTimeline(history, 1, 2, new Date("2026-09-15T12:00:00.000Z"), 2);
    expect(timeline).toHaveLength(2);
    expect(timeline[0]).toMatchObject({ firstScore: 70, secondScore: 82 });
    expect(timeline[1]).toMatchObject({ firstScore: 90, secondScore: null });
  });

  test("selects weekday versus weekend streak notification times", () => {
    const schedule: StreakNotificationSchedule = { weekday: { hour: 19, minute: 30 }, weekend: { hour: 10, minute: 15 } };
    expect(getScheduledStreakTime(schedule, new Date("2026-09-15T12:00:00.000Z"))).toEqual({ hour: 19, minute: 30 });
    expect(getScheduledStreakTime(schedule, new Date("2026-09-19T12:00:00.000Z"))).toEqual({ hour: 10, minute: 15 });
  });
});
