import { describe, expect, test } from "vitest";

import { getCelebrationEvent } from "../../lib/celebration";
import { buildScoreTimeline, getBadgeCollection } from "../../lib/learning-motivation";
import { buildStreakNotificationContent, shouldShowStreakNotification } from "../../lib/streak-notification";
import type { LearningAttempt } from "../../lib/learning-motivation";

const attempt = (id: string, score: number, createdAt: string): LearningAttempt => ({
  id,
  lessonNumber: 1,
  phrase: id,
  score,
  summary: "Practice",
  createdAt,
});

describe("motivation feature helpers", () => {
  test("creates a badge celebration only for a newly earned badge", () => {
    expect(getCelebrationEvent(2, 2, ["first-step"], ["first-step", "steady-habit"])).toEqual({
      kind: "badge",
      title: "Yeni rozet kazandın!",
      message: "Düzenli ritim rozeti profilinde parlıyor.",
    });
    expect(getCelebrationEvent(2, 2, ["first-step", "steady-habit"], ["first-step", "steady-habit"])).toBeNull();
  });

  test("celebrates a streak increase", () => {
    expect(getCelebrationEvent(2, 3, ["first-step"], ["first-step"])).toEqual({
      kind: "streak",
      title: "Serin büyüyor!",
      message: "3 günlük çalışma serisini korudun.",
    });
  });

  test("supports 30-day and all-time score timelines", () => {
    const history = [
      attempt("old", 60, "2026-08-20T09:00:00.000Z"),
      attempt("recent", 90, "2026-09-15T09:00:00.000Z"),
    ];
    expect(buildScoreTimeline(history, new Date("2026-09-15T12:00:00.000Z"), 30)).toHaveLength(30);
    expect(buildScoreTimeline(history, new Date("2026-09-15T12:00:00.000Z"), "all")[0].dateKey).toBe("2026-08-20");
  });

  test("only prompts once per day while a nonzero streak is at risk", () => {
    const history = [attempt("yesterday", 80, "2026-09-14T09:00:00.000Z")];
    const now = new Date("2026-09-15T12:00:00.000Z");
    expect(shouldShowStreakNotification(history, now, null)).toBe(true);
    expect(shouldShowStreakNotification(history, now, "2026-09-15")).toBe(false);
    expect(buildStreakNotificationContent(1)).toEqual({
      title: "Serini koruyabilirsin",
      body: "Dünkü 1 günlük serinin bozulmaması için bugün kısa bir cümle söyle.",
    });
  });

  test("records the first date each badge was earned", () => {
    const history = [
      attempt("one", 70, "2026-09-10T09:00:00.000Z"),
      attempt("two", 72, "2026-09-11T09:00:00.000Z"),
      attempt("three", 74, "2026-09-12T09:00:00.000Z"),
      attempt("four", 76, "2026-09-13T09:00:00.000Z"),
      attempt("five", 78, "2026-09-14T09:00:00.000Z"),
      attempt("six", 80, "2026-09-15T09:00:00.000Z"),
      attempt("seven", 82, "2026-09-16T09:00:00.000Z"),
    ];
    expect(getBadgeCollection(history)).toEqual([
      expect.objectContaining({ id: "first-step", earnedAt: "2026-09-10" }),
      expect.objectContaining({ id: "steady-habit", earnedAt: "2026-09-12" }),
      expect.objectContaining({ id: "voice-practice", earnedAt: "2026-09-14" }),
      expect.objectContaining({ id: "perfect-week", earnedAt: "2026-09-16" }),
    ]);
  });
});
