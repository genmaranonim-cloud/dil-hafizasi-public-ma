import { describe, expect, test } from "vitest";

import {
  buildScoreTimeline,
  calculateCurrentStreak,
  getWeeklyBadges,
  type LearningAttempt,
} from "../../lib/learning-motivation";

const attempt = (id: string, score: number, createdAt: string): LearningAttempt => ({
  id,
  lessonNumber: 1,
  phrase: `Practice ${id}`,
  score,
  summary: "Practice",
  createdAt,
});

describe("learning motivation", () => {
  test("counts consecutive practice days ending today", () => {
    const history = [
      attempt("today", 84, "2026-09-15T09:00:00.000Z"),
      attempt("yesterday", 76, "2026-09-14T18:00:00.000Z"),
      attempt("two-days", 72, "2026-09-13T08:00:00.000Z"),
      attempt("gap", 90, "2026-09-11T08:00:00.000Z"),
    ];

    expect(calculateCurrentStreak(history, new Date("2026-09-15T12:00:00.000Z"))).toBe(3);
  });

  test("returns zero when today has not been practiced", () => {
    const history = [attempt("yesterday", 76, "2026-09-14T18:00:00.000Z")];
    expect(calculateCurrentStreak(history, new Date("2026-09-15T12:00:00.000Z"))).toBe(0);
  });

  test("awards weekly badges from distinct practice days and attempts", () => {
    const history = [
      attempt("a", 84, "2026-09-15T09:00:00.000Z"),
      attempt("b", 80, "2026-09-14T09:00:00.000Z"),
      attempt("c", 78, "2026-09-13T09:00:00.000Z"),
      attempt("d", 75, "2026-09-13T10:00:00.000Z"),
      attempt("e", 73, "2026-09-12T10:00:00.000Z"),
    ];

    expect(getWeeklyBadges(history, new Date("2026-09-15T12:00:00.000Z"))).toEqual([
      expect.objectContaining({ id: "first-step", earned: true, progress: 1, target: 1 }),
      expect.objectContaining({ id: "steady-habit", earned: true, progress: 3, target: 3 }),
      expect.objectContaining({ id: "voice-practice", earned: true, progress: 5, target: 5 }),
      expect.objectContaining({ id: "perfect-week", earned: false, progress: 4, target: 7 }),
    ]);
  });

  test("builds a seven-day score timeline with empty days", () => {
    const timeline = buildScoreTimeline([
      attempt("monday", 60, "2026-09-14T08:00:00.000Z"),
      attempt("today", 90, "2026-09-15T09:00:00.000Z"),
    ], new Date("2026-09-15T12:00:00.000Z"), 7);

    expect(timeline).toHaveLength(7);
    expect(timeline[5]).toMatchObject({ dateKey: "2026-09-14", averageScore: 60, attempts: 1 });
    expect(timeline[6]).toMatchObject({ dateKey: "2026-09-15", averageScore: 90, attempts: 1 });
    expect(timeline[0].averageScore).toBeNull();
  });
});
