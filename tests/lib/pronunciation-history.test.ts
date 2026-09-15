import { describe, expect, test } from "vitest";

import {
  appendPronunciationAttempt,
  getRecentAttempts,
  summarizeWeeklyPronunciation,
  summarizePronunciationHistory,
  type PronunciationAttempt,
} from "../../lib/pronunciation-history";

const attempt = (id: string, lessonNumber: number, score: number, createdAt: string): PronunciationAttempt => ({
  id,
  lessonNumber,
  phrase: `Practice ${id}`,
  score,
  summary: "Good practice",
  createdAt,
});

describe("pronunciation history", () => {
  test("adds newest attempts first and keeps only the latest 100 records", () => {
    const old = Array.from({ length: 100 }, (_, index) => attempt(`old-${index}`, 1, 40, `2026-09-01T00:${String(index).padStart(2, "0")}:00.000Z`));
    const next = appendPronunciationAttempt(old, attempt("new", 7, 88, "2026-09-15T10:00:00.000Z"));

    expect(next).toHaveLength(100);
    expect(next[0].id).toBe("new");
    expect(next.some((item) => item.id === "old-0")).toBe(true);
    expect(next.some((item) => item.id === "old-99")).toBe(false);
  });

  test("calculates lesson averages and attempt counts for the graph", () => {
    const summary = summarizePronunciationHistory([
      attempt("a", 1, 60, "2026-09-15T10:00:00.000Z"),
      attempt("b", 1, 80, "2026-09-15T11:00:00.000Z"),
      attempt("c", 7, 90, "2026-09-15T12:00:00.000Z"),
    ]);

    expect(summary).toEqual([
      { lessonNumber: 1, averageScore: 70, attempts: 2 },
      { lessonNumber: 7, averageScore: 90, attempts: 1 },
    ]);
  });

  test("orders recent attempts newest first", () => {
    const attempts = [
      attempt("old", 1, 45, "2026-09-10T10:00:00.000Z"),
      attempt("new", 1, 75, "2026-09-15T10:00:00.000Z"),
    ];
    expect(getRecentAttempts(attempts).map((item) => item.id)).toEqual(["new", "old"]);
  });

  test("returns seven local calendar days and leaves days without attempts empty", () => {
    const trend = summarizeWeeklyPronunciation([
      attempt("monday-a", 1, 60, "2026-09-14T08:00:00.000Z"),
      attempt("monday-b", 1, 80, "2026-09-14T12:00:00.000Z"),
      attempt("today", 1, 90, "2026-09-15T09:00:00.000Z"),
    ], new Date("2026-09-15T12:00:00.000Z"));

    expect(trend).toHaveLength(7);
    expect(trend[5]).toMatchObject({ dateKey: "2026-09-14", averageScore: 70, attempts: 2 });
    expect(trend[6]).toMatchObject({ dateKey: "2026-09-15", averageScore: 90, attempts: 1 });
    expect(trend[0].averageScore).toBeNull();
  });
});
